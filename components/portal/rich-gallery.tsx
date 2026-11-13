"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"

export const LAYOUTS = [
  { key: "grid", bn: "গ্রিড" },
  { key: "hero", bn: "প্রথমটি বড়" },
  { key: "mosaic", bn: "মোজাইক" },
  { key: "columns", bn: "৩ কলাম" },
  { key: "stack", bn: "একটির নিচে একটি" },
  { key: "slider", bn: "স্লাইডার" },
  { key: "strip", bn: "ফিল্মস্ট্রিপ" },
  { key: "side", bn: "বাম বড়, ডানে ছোট" },
  { key: "fb-classic", bn: "ফেসবুক ক্লাসিক" },
  { key: "fb-columns", bn: "ফেসবুক কলাম" },
  { key: "fb-frame", bn: "ফেসবুক ফ্রেম" },
] as const

export type GalleryItem = {
  url: string
  caption?: string | null
  credit?: string | null
}

const DEFAULT_FRAME_COLOR = "#c48b45"

export function parseLayoutValue(raw?: string | null): {
  base: string
  frameColor: string
} {
  if (!raw || typeof raw !== "string") {
    return { base: "grid", frameColor: DEFAULT_FRAME_COLOR }
  }
  if (raw.startsWith("fb-frame:")) {
    const color = raw.slice("fb-frame:".length).trim()
    return {
      base: "fb-frame",
      frameColor: /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : DEFAULT_FRAME_COLOR,
    }
  }
  return { base: raw, frameColor: DEFAULT_FRAME_COLOR }
}

const bnDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])

function Fig({
  item,
  cls,
  imgCls,
  onOpen,
  hideMeta = false,
}: {
  item: GalleryItem
  cls: string
  imgCls: string
  onOpen: () => void
  hideMeta?: boolean
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
      {!hideMeta && (item.caption || item.credit) && (
        <figcaption className="mt-1 text-xs sm:text-sm text-cyan-100">
          {item.caption && <span className="block">{item.caption}</span>}
          {item.credit && (
            <span className="block text-[11px] text-white/60">📷 ছবি: {item.credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

function FbTile({
  item,
  extraCount = 0,
  className = "",
  imgClassName = "",
  onOpen,
}: {
  item: GalleryItem
  extraCount?: number
  className?: string
  imgClassName?: string
  onOpen: () => void
}) {
  return (
    <div
      onClick={onOpen}
      className={`relative overflow-hidden cursor-zoom-in bg-black/30 group ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.caption || ""}
        loading="lazy"
        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${imgClassName}`}
      />
      {extraCount > 0 && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
          <span className="text-white font-bold text-2xl sm:text-3xl tracking-tight drop-shadow-md">
            +{extraCount}
          </span>
        </div>
      )}
    </div>
  )
}

function Lightbox({
  list,
  index,
  onClose,
  onIndex,
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
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (startX.current === null || !many) return
        const dx = e.changedTouches[0].clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 40) (dx > 0 ? prev : next)()
      }}
    >
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
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer active:scale-95"
              aria-label="আগের ছবি"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer active:scale-95"
              aria-label="পরের ছবি"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

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
  compact = false,
}: {
  items: GalleryItem[]
  layout?: string
  compact?: boolean
}) {
  const list = items.filter((i) => i.url)
  const [open, setOpen] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (list.length === 0) return null

  const { base: activeLayout, frameColor } = parseLayoutValue(layout)
  const isFbLayout =
    activeLayout === "fb-classic" || activeLayout === "fb-columns" || activeLayout === "fb-frame"

  const rOuter = compact ? "rounded-none" : "rounded-2xl"
  const rInner = compact ? "rounded-none" : "rounded-xl"
  const gapCls = compact ? "gap-0.5" : "gap-2"
  const freeSingleCls = compact
    ? "w-full h-auto max-h-[680px] md:max-h-[460px] object-contain bg-black/20 mx-auto block"
    : "w-full rounded-2xl object-cover"

  const fig = (i: number, cls: string, imgCls: string) => (
    <Fig
      key={list[i].url + i}
      item={list[i]}
      cls={cls}
      imgCls={imgCls}
      onOpen={() => setOpen(i)}
      hideMeta={compact}
    />
  )

  let body: React.ReactNode

  /* ==================== ফেসবুক স্টাইল ১: Classic ==================== */
  if (activeLayout === "fb-classic") {
    if (list.length === 1) {
      body = fig(0, "", freeSingleCls)
    } else if (list.length === 2) {
      body = (
        <div className={`grid grid-cols-2 gap-0.5 ${rOuter} overflow-hidden`}>
          <FbTile item={list[0]} className="aspect-[4/5] sm:aspect-square" onOpen={() => setOpen(0)} />
          <FbTile item={list[1]} className="aspect-[4/5] sm:aspect-square" onOpen={() => setOpen(1)} />
        </div>
      )
    } else if (list.length === 3) {
      body = (
        <div className={`grid grid-cols-2 gap-0.5 ${rOuter} overflow-hidden`}>
          <FbTile item={list[0]} className="col-span-2 aspect-[16/10]" onOpen={() => setOpen(0)} />
          <FbTile item={list[1]} className="aspect-square" onOpen={() => setOpen(1)} />
          <FbTile item={list[2]} className="aspect-square" onOpen={() => setOpen(2)} />
        </div>
      )
    } else if (list.length === 4) {
      body = (
        <div className={`grid grid-cols-2 gap-0.5 ${rOuter} overflow-hidden`}>
          {[0, 1, 2, 3].map((i) => (
            <FbTile key={i} item={list[i]} className="aspect-square" onOpen={() => setOpen(i)} />
          ))}
        </div>
      )
    } else {
      body = (
        <div className={`space-y-0.5 ${rOuter} overflow-hidden`}>
          <div className="grid grid-cols-2 gap-0.5">
            <FbTile item={list[0]} className="aspect-[4/3]" onOpen={() => setOpen(0)} />
            <FbTile item={list[1]} className="aspect-[4/3]" onOpen={() => setOpen(1)} />
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            <FbTile item={list[2]} className="aspect-square" onOpen={() => setOpen(2)} />
            <FbTile item={list[3]} className="aspect-square" onOpen={() => setOpen(3)} />
            <FbTile
              item={list[4]}
              extraCount={list.length - 5}
              className="aspect-square"
              onOpen={() => setOpen(4)}
            />
          </div>
        </div>
      )
    }
  } else if (activeLayout === "fb-columns") {
    /* ==================== ফেসবুক স্টাইল ২: Columns ==================== */
    if (list.length === 1) {
      body = fig(0, "", freeSingleCls)
    } else {
      const shown = list.slice(0, 4)
      const colsCls =
        shown.length === 2 ? "grid-cols-2" : shown.length === 3 ? "grid-cols-3" : "grid-cols-4"
      const aspectCls =
        shown.length === 2
          ? "aspect-[2/3] sm:aspect-[3/4]"
          : shown.length === 3
            ? "aspect-[9/16] sm:aspect-[3/4]"
            : "aspect-[9/16] sm:aspect-[2/3]"

      body = (
        <div className={`grid ${colsCls} ${compact ? "gap-0.5" : "gap-1.5"} ${rOuter} overflow-hidden`}>
          {shown.map((item, i) => (
            <FbTile
              key={i}
              item={item}
              extraCount={i === 3 ? list.length - 4 : 0}
              className={`${aspectCls} ${rInner}`}
              onOpen={() => setOpen(i)}
            />
          ))}
        </div>
      )
    }
  } else if (activeLayout === "fb-frame") {
    /* ==================== ফেসবুক স্টাইল ৩: Frame ==================== */
    body = (
      <div className={`${rOuter} p-2 sm:p-3 shadow-inner`} style={{ backgroundColor: frameColor }}>
        {list.length === 1 && (
          <FbTile item={list[0]} className="rounded-lg max-h-[540px]" onOpen={() => setOpen(0)} />
        )}
        {list.length === 2 && (
          <div className="grid grid-cols-2 gap-1.5">
            <FbTile item={list[0]} className="aspect-[3/4] rounded-lg" onOpen={() => setOpen(0)} />
            <FbTile item={list[1]} className="aspect-[3/4] rounded-lg" onOpen={() => setOpen(1)} />
          </div>
        )}
        {list.length === 3 && (
          <div className="grid grid-cols-2 gap-1.5 h-[280px] sm:h-[340px]">
            <FbTile item={list[0]} className="h-full rounded-lg" onOpen={() => setOpen(0)} />
            <div className="grid grid-rows-2 gap-1.5 h-full">
              <FbTile item={list[1]} className="h-full rounded-lg" onOpen={() => setOpen(1)} />
              <FbTile item={list[2]} className="h-full rounded-lg" onOpen={() => setOpen(2)} />
            </div>
          </div>
        )}
        {list.length === 4 && (
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <FbTile key={i} item={list[i]} className="aspect-square rounded-lg" onOpen={() => setOpen(i)} />
            ))}
          </div>
        )}
        {list.length >= 5 && (
          <div className="grid grid-cols-2 gap-1.5 h-[310px] sm:h-[390px]">
            <div className="grid grid-rows-2 gap-1.5 h-full">
              <FbTile item={list[0]} className="h-full rounded-lg" onOpen={() => setOpen(0)} />
              <FbTile item={list[1]} className="h-full rounded-lg" onOpen={() => setOpen(1)} />
            </div>
            <div className="grid grid-rows-3 gap-1.5 h-full">
              <FbTile item={list[2]} className="h-full rounded-lg" onOpen={() => setOpen(2)} />
              <FbTile item={list[3]} className="h-full rounded-lg" onOpen={() => setOpen(3)} />
              <FbTile
                item={list[4]}
                extraCount={list.length - 5}
                className="h-full rounded-lg"
                onOpen={() => setOpen(4)}
              />
            </div>
          </div>
        )}
      </div>
    )
  } else if (list.length === 1) {
    body = fig(0, "", freeSingleCls)
  } else if (activeLayout === "hero") {
    body = (
      <div className={compact ? "space-y-0.5" : "space-y-2"}>
        {fig(0, "", `w-full ${rOuter} object-cover`)}
        <div className={`grid grid-cols-2 ${gapCls}`}>
          {list.slice(1).map((_, k) => fig(k + 1, "", `aspect-[4/3] w-full ${rInner} object-cover`))}
        </div>
      </div>
    )
  } else if (activeLayout === "mosaic") {
    body = (
      <div className={`columns-2 ${compact ? "gap-0.5" : "gap-2"}`}>
        {list.map((_, i) => fig(i, compact ? "mb-0.5 break-inside-avoid" : "mb-2 break-inside-avoid", `w-full ${rInner} object-cover`))}
      </div>
    )
  } else if (activeLayout === "columns") {
    body = (
      <div className={`grid grid-cols-3 ${gapCls}`}>
        {list.map((_, i) => fig(i, "", `aspect-square w-full ${rInner} object-cover`))}
      </div>
    )
  } else if (activeLayout === "stack") {
    body = (
      <div className={compact ? "space-y-0.5" : "space-y-3"}>
        {list.map((_, i) => fig(i, "", `w-full ${rOuter} object-cover`))}
      </div>
    )
  } else if (activeLayout === "slider") {
    body = (
      <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 scrollbar-none">
        {list.map((_, i) => fig(i, "w-[88%] shrink-0 snap-center", "w-full rounded-lg object-cover"))}
      </div>
    )
  } else if (activeLayout === "strip") {
    body = (
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {list.map((_, i) => fig(i, "w-48 shrink-0", "h-36 w-full rounded-lg object-cover"))}
      </div>
    )
  } else if (activeLayout === "side") {
    body = (
      <div className={`grid grid-cols-3 ${gapCls}`}>
        {list.map((_, i) =>
          fig(
            i,
            i === 0 ? "col-span-2 row-span-2" : "",
            i === 0
              ? `h-full w-full ${rOuter} object-cover`
              : `aspect-square w-full ${rInner} object-cover`
          )
        )}
      </div>
    )
  } else {
    body = (
      <div className={`grid grid-cols-2 ${gapCls}`}>
        {list.map((_, i) =>
          fig(
            i,
            list.length % 2 === 1 && i === 0 ? "col-span-2" : "",
            list.length % 2 === 1 && i === 0
              ? `aspect-[16/9] w-full ${rInner} object-cover`
              : `aspect-[4/3] w-full ${rInner} object-cover`
          )
        )}
      </div>
    )
  }

  const captionedItems =
    !compact && isFbLayout && list.length > 1
      ? list
          .map((item, idx) => ({ ...item, idx }))
          .filter((item) => item.caption || item.credit)
      : []

  return (
    <>
      <div className={compact ? "" : "space-y-2"}>
        {body}
        {captionedItems.length > 0 && (
          <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 space-y-1 text-xs text-slate-200">
            {captionedItems.map((c) => (
              <button
                key={c.idx}
                type="button"
                onClick={() => setOpen(c.idx)}
                className="flex items-start gap-1.5 text-left w-full hover:text-cyan-300 transition cursor-pointer"
              >
                <Camera className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <b className="text-cyan-300">ছবি {bnDigits(c.idx + 1)}:</b> {c.caption}
                  {c.credit ? ` (📷 ${c.credit})` : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {open !== null &&
        mounted &&
        createPortal(
          <Lightbox list={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />,
          document.body
        )}
    </>
  )
}
