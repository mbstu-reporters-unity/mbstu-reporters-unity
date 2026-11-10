"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
    return () => {
      live = false
    }
  }, [postId])

  const badge = (
    <span className="absolute left-4 top-4 z-10 rounded bg-brand px-2.5 py-1 text-xs font-bold text-white shadow-xs">
      {category}
    </span>
  )
  const videoBadge = hasVideo ? (
    <span className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-xs text-white backdrop-blur-xs">
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

  const content = (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="block h-auto w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="aspect-[16/10] w-full bg-brand-soft/40 flex items-center justify-center text-brand font-bold text-xs select-none">
          মাভাবিপ্রবি রিপোর্টার্স ইউনিটি
        </div>
      )}
      {badge}
      {videoBadge}
    </>
  )

  const linkClass = "relative block overflow-hidden bg-gray-100 select-none"

  // বহিরাগত লিংক হলে নতুন ট্যাবে, সাইটের লিংক হলে রিলোডহীন নেক্সট লিংকে যাবে
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={linkClass}>
      {content}
    </Link>
  )
}
