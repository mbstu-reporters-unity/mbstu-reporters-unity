"use client"

import { useEffect, useState } from "react"
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
    return {
      kind: "youtube",
      isShort,
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?rel=0&modestbranding=1&playsinline=1`,
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

  const renderVideoBlock = () => {
    if (hasDirectVideo) {
      return (
        <div className="w-full bg-black overflow-hidden">
          <video
            src={videoUrl!}
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
      if (primaryEmbedVideo.kind === "video") {
        return (
          <div className="w-full bg-black overflow-hidden">
            <video
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

      if (primaryEmbedVideo.kind === "youtube") {
        return (
          <div className="w-full bg-black overflow-hidden">
            <div
              className={
                primaryEmbedVideo.isShort
                  ? "relative w-full max-w-sm mx-auto aspect-[9/16] max-h-[560px]"
                  : "relative w-full aspect-video"
              }
            >
              <iframe
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

      if (primaryEmbedVideo.kind === "facebook") {
        return (
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            <iframe
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

  // ১. post_images-এ ছবি থাকলে (১টি বা একাধিক) — ক্লিক করলে এডমিনের পছন্দমতো ২ নং বা ৩ নং ভিউ খুলবে
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
        {renderVideoBlock()}
      </div>
    )
  }

  // ২. সরাসরি ভিডিও বা লিংক ভিডিও (YouTube / Facebook / MP4) থাকলে
  const videoBlock = renderVideoBlock()
  if (videoBlock) {
    return <div className="w-full overflow-hidden">{videoBlock}</div>
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

  // ৪. একক cover ছবি থাকলে — ক্লিক করলে ২ নং বা ৩ নং মোডে খুলবে
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
