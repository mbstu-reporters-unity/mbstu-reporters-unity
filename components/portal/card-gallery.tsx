"use client"

import { useEffect, useRef, useState } from "react"
import { getImagesMetaForMany, getLayoutsForMany } from "@/lib/sb"
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

type MediaBatchResult = {
  items: GalleryItem[] | null
  layout: string
}

const mediaPending = new Map<string, Array<(res: MediaBatchResult) => void>>()
let mediaTimer: ReturnType<typeof setTimeout> | null = null

function fetchCardMediaBatched(postId: string): Promise<MediaBatchResult> {
  return new Promise((resolve) => {
    const list = mediaPending.get(postId) || []
    list.push(resolve)
    mediaPending.set(postId, list)

    if (!mediaTimer) {
      mediaTimer = setTimeout(async () => {
        mediaTimer = null
        const entryMap = new Map(mediaPending)
        mediaPending.clear()
        const ids = Array.from(entryMap.keys())

        for (let i = 0; i < ids.length; i += 40) {
          const chunk = ids.slice(i, i + 40)
          try {
            const [imagesMap, layoutsMap] = await Promise.all([
              getImagesMetaForMany("post", chunk),
              getLayoutsForMany("post", chunk),
            ])
            for (const id of chunk) {
              const rows = imagesMap[id] || []
              const items: GalleryItem[] | null =
                rows.length > 0
                  ? rows.map((r) => ({
                      url: r.url,
                      caption: r.caption,
                      credit: r.credit,
                      date: r.created_at || null,
                    }))
                  : null
              const layout = layoutsMap[id] || "grid"
              const resolvers = entryMap.get(id) || []
              resolvers.forEach((fn) => fn({ items, layout }))
            }
          } catch {
            for (const id of chunk) {
              const resolvers = entryMap.get(id) || []
              resolvers.forEach((fn) => fn({ items: null, layout: "grid" }))
            }
          }
        }
      }, 25)
    }
  })
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

  useEffect(() => {
    const target = containerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause()
            }
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
                "*"
              )
            }
          }
        })
      },
      { threshold: [0, 0.2] }
    )

    observer.observe(target)

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
    fetchCardMediaBatched(postId).then((res) => {
      if (!live) return
      setLayout(res.layout || "grid")
      if (res.items && res.items.length > 0) {
        setItems(
          res.items.map((r) => ({
            ...r,
            date: r.date || postDate || null,
          }))
        )
      }
    })
    return () => {
      live = false
    }
  }, [postId, postDate])

  const embed = parseEmbedMedia(embedMediaUrl)
  const hasDirectVideo = Boolean(videoUrl && videoUrl.trim())
  const primaryEmbedVideo = embed.videos[0] || null

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

  if (hasDirectVideo || primaryEmbedVideo) {
    return (
      <SmartFeedVideoPlayer
        directVideoUrl={videoUrl}
        primaryEmbedVideo={primaryEmbedVideo}
        cover={cover}
      />
    )
  }

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
