"use client"

import { useEffect, useRef, useState } from "react"
import { getImagesMeta, getLayout } from "@/lib/sb"
import RichGallery from "./rich-gallery"
import type { GalleryItem } from "./rich-gallery"

type EmbedParsed = {
  videos: Array<
    | { kind: "youtube"; embedSrc: string; isShort: boolean }
    | { kind: "facebook"; embedSrc: string }
    | { kind: "video"; src: string }
  >
  images: GalleryItem[]
}

function classifyMediaUrl(raw: string):
  | { kind: "youtube"; embedSrc: string; isShort: boolean }
  | { kind: "facebook"; embedSrc: string }
  | { kind: "video"; src: string }
  | { kind: "image"; src: string }
  | null {
  const url = raw?.trim()
  if (!url) return null

  const ytMatch = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  )
  if (ytMatch && ytMatch[2]?.length === 11) {
    const isShort = /\/shorts\//i.test(url)
    // enablejsapi=1 যুক্ত করা হয়েছে যাতে স্ক্রল করার সাথে সাথে ব্যাকগ্রাউন্ড সাউন্ড বন্ধ করা যায়
    return {
      kind: "youtube",
      isShort,
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`,
    }
  }

  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return {
      kind: "facebook",
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=false&allowfullscreen=true`,
    }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { kind: "video", src: url }
  }

  if (/^https?:\/\//i.test(url)) {
    return { kind: "image", src: url }
  }

  return null
}

function parseEmbedMedia(raw?: string | null): EmbedParsed {
  const out: EmbedParsed = { videos: [], images: [] }
  if (!raw || !raw.trim()) return out

  const str = raw.trim()
  let items: Array<{
    url: string
    title?: string | null
    subtitle?: string | null
    description?: string | null
    date?: string | null
    caption?: string | null
  }> = []

  if (str.startsWith("[") || str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      items = arr
        .filter((item) => item && typeof item.url === "string" && item.url.trim())
        .map((item) => ({
          url: item.url.trim(),
          title: item.title || null,
          subtitle: item.subtitle || null,
          description: item.description || null,
          date: item.date || null,
          caption: item.caption || null,
        }))
    } catch {}
  } else {
    items = [{ url: str }]
  }

  for (const item of items) {
    const c = classifyMediaUrl(item.url)
    if (!c) continue
    if (c.kind === "image") {
      out.images.push({
        url: c.src,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        date: item.date,
        caption: item.caption,
      })
    } else {
      out.videos.push(c)
    }
  }

  return out
}

/* ==================== স্বয়ংক্রিয় স্ক্রল ডিটেকশন ও অটো-পজ প্লেয়ার ==================== */
function SmartFeedVideoPlayer({
  directVideoUrl,
  primaryEmbedVideo,
  cover,
}: {
  directVideoUrl?: string | null
  primaryEmbedVideo?: { kind: "youtube" | "facebook" | "video"; embedSrc?: string; src?: string; isShort?: boolean } | null
  cover: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // স্ক্রল করে ভিডিও স্ক্রিন থেকে আড়াল হওয়ামাত্র সাউন্ড ও প্লেয়িং বন্ধ করা
  useEffect(() => {
    const target = containerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // ভিডিও স্ক্রিনে ২০% এর কম থাকলে বা উপরে/নিচে চলে গেলে তৎক্ষণাৎ পজ হবে
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            // ১. সাধারণ MP4 ভিডিও পজ করা
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause()
            }

            // ২. ইউটিউব ভিডিও পজ করা (ব্যাকগ্রাউন্ড সাউন্ড বন্ধ হবে)
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
                "*"
              )
            }
          }
        })
      },
      {
        threshold: [0, 0.2], // স্ক্রিনে ২০% দৃশ্যমানতা
      }
    )

    observer.observe(target)

    // ব্রাউজার ট্যাব পরিবর্তন করলেও ভিডিও থেমে যাবে
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (videoRef.current && !videoRef.current.paused) videoRef.current.pause()
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            "*"
          )
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (directVideoUrl) {
    return (
      <div ref={containerRef} className="w-full bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={directVideoUrl}
          poster={cover || undefined}
          controls
          playsInline
          preload="metadata"
          className="block w-full h-auto max-h-[600px] md:max-h-[440px] mx-auto bg-black"
        />
      </div>
    )
  }

  if (primaryEmbedVideo) {
    if (primaryEmbedVideo.kind === "video" && primaryEmbedVideo.src) {
      return (
        <div ref={containerRef} className="w-full bg-black overflow-hidden">
          <video
            ref={videoRef}
            src={primaryEmbedVideo.src}
            poster={cover || undefined}
            controls
            playsInline
            preload="metadata"
            className="block w-full h-auto max-h-[600px] md:max-h-[440px] mx-auto bg-black"
          />
        </div>
      )
    }

    if (primaryEmbedVideo.kind === "youtube" && primaryEmbedVideo.embedSrc) {
      return (
        <div ref={containerRef} className="w-full bg-black overflow-hidden">
          <div
            className={
              primaryEmbedVideo.isShort
                ? "relative w-full max-w-sm mx-auto aspect-[9/16] max-h-[560px]"
                : "relative w-full aspect-video"
            }
          >
            <iframe
              ref={iframeRef}
              src={primaryEmbedVideo.embedSrc}
              className="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="lazy"
              title="YouTube Video"
            />
          </div>
        </div>
      )
    }

    if (primaryEmbedVideo.kind === "facebook" && primaryEmbedVideo.embedSrc) {
      return (
        <div ref={containerRef} className="relative w-full aspect-video bg-black overflow-hidden">
          <iframe
            ref={iframeRef}
            src={primaryEmbedVideo.embedSrc}
            className="size-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Facebook Video"
          />
        </div>
      )
    }
  }

  return null
}

export default function CardGallery({
  postId,
  cover,
  videoUrl,
  embedMediaUrl,
  postTitle,
  postDate,
}: {
  postId: string
  cover: string | null
  videoUrl?: string | null
  embedMediaUrl?: string | null
  postTitle?: string | null
  postDate?: string | null
}) {
  const [items, setItems] = useState<GalleryItem[] | null>(null)
  const [layout, setLayout] = useState("grid")

  useEffect(() => {
    let live = true
    ;(async () => {
      const [rows, lay] = await Promise.all([
        getImagesMeta("post", postId),
        getLayout("post", postId),
      ])
      if (!live) return
      setLayout(lay || "grid")
      if (rows.length > 0) {
        setItems(
          rows.map((r) => ({
            url: r.url,
            caption: r.caption,
            credit: r.credit,
            date: r.created_at || postDate || null,
          }))
        )
      }
    })()
    return () => {
      live = false
    }
  }, [postId, postDate])

  const embed = parseEmbedMedia(embedMediaUrl)
  const hasDirectVideo = Boolean(videoUrl && videoUrl.trim())
  const primaryEmbedVideo = embed.videos[0] || null

  // ১. ছবিতে ক্লিক করলে অ্যালবামে বা লাইটবক্সে ওপেন হবে
  if (items && items.length > 0) {
    return (
      <div className="w-full space-y-1 overflow-hidden">
        <RichGallery
          items={items}
          layout={layout}
          compact
          postTitle={postTitle}
          postDate={postDate}
        />
        {(hasDirectVideo || primaryEmbedVideo) && (
          <SmartFeedVideoPlayer
            directVideoUrl={videoUrl}
            primaryEmbedVideo={primaryEmbedVideo}
            cover={cover}
          />
        )}
      </div>
    )
  }

  // ২. সরাসরি ভিডিও বা ইউটিউব ভিডিও (স্ক্রল করলে অটো-পজ হবে)
  if (hasDirectVideo || primaryEmbedVideo) {
    return (
      <SmartFeedVideoPlayer
        directVideoUrl={videoUrl}
        primaryEmbedVideo={primaryEmbedVideo}
        cover={cover}
      />
    )
  }

  // ৩. embed_media_url-এ ছবি থাকলে
  if (embed.images.length > 0) {
    return (
      <div className="w-full overflow-hidden">
        <RichGallery
          items={embed.images}
          layout={embed.images.length > 1 ? layout || "fb-classic" : layout}
          compact
          postTitle={postTitle}
          postDate={postDate}
        />
      </div>
    )
  }

  // ৪. একক cover ছবি থাকলে
  if (!cover) return null

  return (
    <div className="w-full overflow-hidden">
      <RichGallery
        items={[{ url: cover, date: postDate || null }]}
        layout={layout}
        compact
        postTitle={postTitle}
        postDate={postDate}
      />
    </div>
  )
}
