"use client"

import { useEffect, useRef, useState } from "react"

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
        <figcaption className="mt-1 text-sm text-gray-700">
          {item.caption && <span className="block">{item.caption}</span>}
          {item.credit && <span className="block text-xs text-gray-500">📷 ছবি: {item.credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

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
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onClick={onClose}
      onTouchStart={(e) => { startX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (startX.current === null || !many) return
        const dx = e.changedTouches[0].clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)()
      }}
    >
      <div className="flex items-center justify-between p-3 text-white">
        <span className="text-sm">{many ? `${index + 1} / ${list.length}` : ""}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="rounded-full bg-white/20 px-4 py-2 text-lg"
          aria-label="বন্ধ করুন"
        >
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.caption || ""}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {many && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-2 rounded-full bg-white/25 px-3 py-3 text-xl text-white"
              aria-label="আগের ছবি"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-2 rounded-full bg-white/25 px-3 py-3 text-xl text-white"
              aria-label="পরের ছবি"
            >
              ›
            </button>
          </>
        )}
      </div>

      {(item.caption || item.credit) && (
        <div className="p-4 text-center text-white" onClick={(e) => e.stopPropagation()}>
          {item.caption && <p className="text-base">{item.caption}</p>}
          {item.credit && <p className="mt-1 text-xs text-white/70">📷 ছবি: {item.credit}</p>}
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
  if (list.length === 0) return null

  const fig = (i: number, cls: string, imgCls: string) => (
    <Fig key={list[i].url + i} item={list[i]} cls={cls} imgCls={imgCls} onOpen={() => setOpen(i)} />
  )

  let body: React.ReactNode

  if (list.length === 1) {
    body = fig(0, "", "w-full rounded-xl")
  } else if (layout === "hero") {
    body = (
      <div className="space-y-2">
        {fig(0, "", "w-full rounded-xl")}
        <div className="grid grid-cols-2 gap-2">
          {list.slice(1).map((_, k) => fig(k + 1, "", "aspect-[4/3] w-full rounded-xl object-cover"))}
        </div>
      </div>
    )
  } else if (layout === "mosaic") {
    body = (
      <div className="columns-2 gap-2">
        {list.map((_, i) => fig(i, "mb-2 break-inside-avoid", "w-full rounded-xl"))}
      </div>
    )
  } else if (layout === "columns") {
    body = (
      <div className="grid grid-cols-3 gap-2">
        {list.map((_, i) => fig(i, "", "aspect-square w-full rounded-lg object-cover"))}
      </div>
    )
  } else if (layout === "stack") {
    body = (
      <div className="space-y-3">
        {list.map((_, i) => fig(i, "", "w-full rounded-xl"))}
      </div>
    )
  } else if (layout === "slider") {
    body = (
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
        {list.map((_, i) => fig(i, "w-[88%] shrink-0 snap-center", "w-full rounded-xl"))}
      </div>
    )
  } else if (layout === "strip") {
    body = (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {list.map((_, i) => fig(i, "w-48 shrink-0", "h-36 w-full rounded-lg object-cover"))}
      </div>
    )
  } else if (layout === "side") {
    body = (
      <div className="grid grid-cols-3 gap-2">
        {list.map((_, i) =>
          fig(
            i,
            i === 0 ? "col-span-2 row-span-2" : "",
            i === 0 ? "h-full w-full rounded-xl object-cover" : "aspect-square w-full rounded-lg object-cover"
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
      {open !== null && (
        <Lightbox list={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      )}
    </>
  )
}
