"use client"

import { useEffect, useState } from "react"
import { Video } from "lucide-react"
import { getImagesMeta, getLayout } from "@/lib/sb"
import RichGallery from "./rich-gallery"
import type { GalleryItem } from "./rich-gallery"

export default function CardGallery({
  postId,
  cover,
  href,
  external,
  category,
  hasVideo,
}: {
  postId: string
  cover: string | null
  href: string
  external: boolean
  category: string
  hasVideo: boolean
}) {
  const [items, setItems] = useState<GalleryItem[] | null>(null)
  const [layout, setLayout] = useState("grid")

  useEffect(() => {
    let live = true
    ;(async () => {
      const rows = await getImagesMeta("post", postId)
      if (!live || rows.length < 2) return
      const lay = await getLayout("post", postId)
      if (!live) return
      setItems(rows.map((r) => ({ url: r.url, caption: r.caption, credit: r.credit })))
      setLayout(lay)
    })()
    return () => { live = false }
  }, [postId])

  const badge = (
    <span className="absolute left-4 top-4 z-10 rounded bg-brand px-2.5 py-1 text-xs font-bold text-white">
      {category}
    </span>
  )
  const videoBadge = hasVideo ? (
    <span className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-xs text-white">
      <Video className="size-3" aria-hidden="true" /> ভিডিও
    </span>
  ) : null

  if (items && items.length > 1) {
    return (
      <div className="relative bg-gray-100 p-2 pt-12">
        {badge}
        <RichGallery items={items} layout={layout} />
        {videoBadge}
      </div>
    )
  }

  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {}
  return (
    <a href={href} {...ext} className="relative block overflow-hidden bg-gray-100">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="block h-auto w-full transition-transform duration-500 group-hover:scale-105" />
      )}
      {badge}
      {videoBadge}
    </a>
  )
}
