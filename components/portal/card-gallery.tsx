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
    <span className="absolute left-3 top-3 z-10 rounded-full bg-cyan-600/90 border border-white/20 px-3 py-0.5 text-[11px] font-bold text-white shadow-md backdrop-blur-md">
      {category}
    </span>
  )
  const videoBadge = hasVideo ? (
    <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-xs text-white backdrop-blur border border-white/20">
      <Video className="size-3" aria-hidden="true" /> ভিডিও
    </span>
  ) : null

  // ✅ সাদা bg-gray-100 ও pt-12 সরিয়ে কার্ডের ডার্ক গ্লাস ব্লেন্ডিং করা হয়েছে
  if (items && items.length > 1) {
    return (
      <div className="relative overflow-hidden p-2 bg-black/20">
        {badge}
        <div className="pt-8">
          <RichGallery items={items} layout={layout} />
        </div>
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
        <div className="aspect-[16/10] w-full bg-cyan-950/40 flex items-center justify-center text-cyan-300 font-bold text-xs select-none">
          মাভাবিপ্রবি রিপোর্টার্স ইউনিটি
        </div>
      )}
      {badge}
      {videoBadge}
    </>
  )

  const linkClass = "relative block overflow-hidden bg-black/20 select-none"

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
