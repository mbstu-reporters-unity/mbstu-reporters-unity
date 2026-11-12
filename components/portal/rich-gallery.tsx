"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export const LAYOUTS = [
  { key: "grid", bn: "গ্রিড" },
  { key: "hero", bn: "প্রথমটি বড়" },
  { key: "mosaic", bn: "মোজাইক" },
  { key: "columns", bn: "৩ কলাম" },
  { key: "stack", bn: "একটির নিচে একটি" },
  { key: "slider", bn: "স্লাইডার" },
  { key: "strip", bn: "ফিল্মস্ট্রিপ" },
  { key: "side", bn: "বাম বড়, ডানে ছোট" },
] as const

export type GalleryItem = {
  url: string
  caption?: string | null
  credit?: string | null
}

const bnDigits = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])

function Fig({
  item, cls, imgCls, onOpen,
}: {
  item: GalleryItem
  cls: string
  imgCls: string
  onOpen: () => void
}) {
  return (
    <figure className={cls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.caption || ""}
        className={`${imgCls} cursor-zoom-in`}
        onClick={onOpen}
        loading="lazy"
      />
      {(item.caption || item.credit) && (
        <figcaption className="mt-1 text-xs sm:text-sm text-cyan-100">
          {item.caption && <span className="block">{item.caption}</span>}
          {item.credit && <span className="block text-[11px] text-white/60">📷 ছবি: {item.credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

// ✅ ফেসবুক/ইনস্টাগ্রাম স্টাইল পিওর ব্ল্যাক ফুলস্ক্রিন লাইটবক্স
function Lightbox({
  list, index, onClose, onIndex,
}: {
  list: GalleryItem[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const startX = useRef<number | null>(null)
  const item = list[index]
  const many = list.length > 1

  const prev = () => onIndex((index - 1 + list.length) % list.length)
  const next = () => onIndex((index + 1) % list.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    const old = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = old
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col justify-between bg-black text-white select-none animate-in fade-in duration-200"
      onClick={onClose}
      onTouchStart={(e) => { startX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (startX.current === null || !many) return
        const dx = e.changedTouches[0].clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 40) (dx > 0 ? prev : next)()
      }}
    >
      {/* ফেসবুক স্টাইল টপ বার: ছবি সংখ্যা ও ক্লোজ বাটন */}
      <div
        className="flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs sm:text-sm font-bold bg-white/15 px-3 py-1 rounded-full border border-white/20">
          {many ? `${bnDigits(index + 1)} / ${bnDigits(list.length)}` : "ছবি"}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer shadow-lg"
          aria-label="বন্ধ করুন"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* মাঝখানে মূল ছবি (ফুল-উইডথ রেসপনসিভ) */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.url}
          src={item.url}
          alt={item.caption || ""}
          className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-200"
          onClick={(e) => e.stopPropagation()}
        />

        {many && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer active:scale-95"
              aria-label="আগের ছবি"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer active:scale-95"
              aria-label="পরের ছবি"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {/* ক্যাপশন এরিয়া */}
      {(item.caption || item.credit) && (
        <div
          className="p-4 text-center z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          {item.caption && <p className="text-xs sm:text-sm text-slate-100 font-medium">{item.caption}</p>}
          {item.credit && <p className="mt-0.5 text-[11px] text-cyan-300">📷 ছবি: {item.credit}</p>}
        </div>
      )}
    </div>
  )
}

export default function RichGallery({
  items,
  layout = "grid",
}: {
  items: GalleryItem[]
  layout?: string
}) {
  const list = items.filter((i) => i.url)
  const [open, setOpen] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (list.length === 0) return null

  const fig = (i: number, cls: string, imgCls: string) => (
    <Fig key={list[i].url + i} item={list[i]} cls={cls} imgCls={imgCls} onOpen={() => setOpen(i)} />
  )

  let body: React.ReactNode

  if (list.length === 1) {
    body = fig(0, "", "w-full rounded-2xl object-cover")
  } else if (layout === "hero") {
    body = (
      <div className="space-y-2">
        {fig(0, "", "w-full rounded-2xl object-cover")}
        <div className="grid grid-cols-2 gap-2">
          {list.slice(1).map((_, k) => fig(k + 1, "", "aspect-[4/3] w-full rounded-xl object-cover"))}
        </div>
      </div>
    )
  } else if (layout === "mosaic") {
    body = (
      <div className="columns-2 gap-2">
        {list.map((_, i) => fig(i, "mb-2 break-inside-avoid", "w-full rounded-xl object-cover"))}
      </div>
    )
  } else if (layout === "columns") {
    body = (
      <div className="grid grid-cols-3 gap-2">
        {list.map((_, i) => fig(i, "", "aspect-square w-full rounded-xl object-cover"))}
      </div>
    )
  } else if (layout === "stack") {
    body = (
      <div className="space-y-3">
        {list.map((_, i) => fig(i, "", "w-full rounded-2xl object-cover"))}
      </div>
    )
  } else if (layout === "slider") {
    body = (
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 scrollbar-none">
        {list.map((_, i) => fig(i, "w-[88%] shrink-0 snap-center", "w-full rounded-2xl object-cover"))}
      </div>
    )
  } else if (layout === "strip") {
    body = (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {list.map((_, i) => fig(i, "w-48 shrink-0", "h-36 w-full rounded-xl object-cover"))}
      </div>
    )
  } else if (layout === "side") {
    body = (
      <div className="grid grid-cols-3 gap-2">
        {list.map((_, i) =>
          fig(
            i,
            i === 0 ? "col-span-2 row-span-2" : "",
            i === 0 ? "h-full w-full rounded-2xl object-cover" : "aspect-square w-full rounded-xl object-cover"
          )
        )}
      </div>
    )
  } else {
    body = (
      <div className="grid grid-cols-2 gap-2">
        {list.map((_, i) =>
          fig(
            i,
            list.length % 2 === 1 && i === list.length - 1 ? "col-span-2" : "",
            list.length % 2 === 1 && i === list.length - 1
              ? "aspect-[16/9] w-full rounded-xl object-cover"
              : "aspect-[4/3] w-full rounded-xl object-cover"
          )
        )}
      </div>
    )
  }

  return (
    <>
      {body}
      {/* ✅ createPortal ব্যবহারের কারণে লাইটবক্স সরাসরি <body>-তে মাউন্ট হবে এবং কোনো হেডার/ফুটার উঁকি দিতে পারবে না */}
      {open !== null && mounted && createPortal(
        <Lightbox list={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />,
        document.body
      )}
    </>
  )
}
