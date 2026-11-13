"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, ChevronRight, Camera, Calendar, ZoomIn } from "lucide-react"
import { SB_URL, SB_KEY } from "@/lib/sb"

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

export type ViewerMode = "default" | "lightbox" | "album"

export type GalleryItem = {
  url: string
  title?: string | null
  subtitle?: string | null
  description?: string | null
  caption?: string | null
  credit?: string | null
  date?: string | null
}

const DEFAULT_FRAME_COLOR = "#c48b45"

export function parseLayoutValue(raw?: string | null): {
  base: string
  frameColor: string
  viewerMode: ViewerMode
} {
  if (!raw || typeof raw !== "string") {
    return { base: "grid", frameColor: DEFAULT_FRAME_COLOR, viewerMode: "default" }
  }

  let layoutPart = raw.trim()
  let viewerMode: ViewerMode = "default"

  if (layoutPart.includes("|")) {
    const [left, right] = layoutPart.split("|")
    layoutPart = left.trim() || "grid"
    if (right === "album" || right === "lightbox") {
      viewerMode = right
    }
  }

  if (layoutPart.startsWith("fb-frame:")) {
    const color = layoutPart.slice("fb-frame:".length).trim()
    return {
      base: "fb-frame",
      frameColor: /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : DEFAULT_FRAME_COLOR,
      viewerMode,
    }
  }

  return { base: layoutPart || "grid", frameColor: DEFAULT_FRAME_COLOR, viewerMode }
}

export function buildLayoutValue(
  base: string,
  frameColor = DEFAULT_FRAME_COLOR,
  viewerMode: ViewerMode = "default"
): string {
  const core = base === "fb-frame" ? `fb-frame:${frameColor}` : base
  return viewerMode !== "default" ? `${core}|${viewerMode}` : core
}

let cachedGlobalViewerPromise: Promise<"lightbox" | "album"> | null = null

export function getGlobalPhotoClickMode(): Promise<"lightbox" | "album"> {
  if (!cachedGlobalViewerPromise) {
    cachedGlobalViewerPromise = fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.photo_click_mode`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: { value?: string }[]) => (rows?.[0]?.value === "album" ? "album" : "lightbox"))
      .catch(() => "lightbox" as const)
  }
  return cachedGlobalViewerPromise
}

const bnDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])

function fmtPhotoDate(val?: string | null): string {
  if (!val) return ""
  if (/জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/.test(val)) {
    return val
  }
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    })
  }
  return val
}

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
        alt={item.caption || item.title || ""}
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
        alt={item.caption || item.title || ""}
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

/* ==================== ৩ নং ছবির মতো: স্লাইড লাইটবক্স ==================== */
function Lightbox({
  list,
  index,
  fallbackDate,
  onClose,
  onIndex,
}: {
  list: GalleryItem[]
  index: number
  fallbackDate?: string | null
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

  const displayTitle = item.title || item.caption
  const displayDesc = item.description || item.subtitle
  const displayDate = fmtPhotoDate(item.date || fallbackDate)
  const hasFooter = Boolean(displayTitle || displayDesc || item.credit || displayDate)

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
          alt={displayTitle || ""}
          className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-200"
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

      {hasFooter && (
        <div
          className="p-4 text-center z-20 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          {displayTitle && (
            <p className="text-xs sm:text-sm text-slate-100 font-semibold">{displayTitle}</p>
          )}
          {displayDesc && (
            <p className="text-xs text-slate-300 max-w-xl mx-auto">{displayDesc}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5 text-[11px]">
            {item.credit && (
              <span className="text-cyan-300 font-medium">📷 ছবি: {item.credit}</span>
            )}
            {displayDate && (
              <span className="inline-flex items-center gap-1 text-white/70">
                <Calendar className="size-3 text-cyan-400" />
                <span>{displayDate}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ==================== ২ নং ছবির মতো: ভার্টিকাল স্ক্রল অ্যালবাম ==================== */
function VerticalAlbumModal({
  list,
  postTitle,
  fallbackDate,
  onClose,
  onZoom,
}: {
  list: GalleryItem[]
  postTitle?: string | null
  fallbackDate?: string | null
  onClose: () => void
  onZoom: (idx: number) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const old = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = old
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/95 text-white backdrop-blur-2xl flex flex-col animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* স্টিকি হেডার */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/15 bg-slate-900/90 px-4 py-3 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate">
            {postTitle || "ছবির অ্যালবাম"}
          </h3>
          <p className="text-[11px] text-cyan-300 font-semibold">
            মোট {bnDigits(list.length)}টি ছবি
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 cursor-pointer transition"
          aria-label="বন্ধ করুন"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* ভার্টিকাল স্ক্রল কার্ডসমূহ (২ নং ছবির ডিজাইন অনুযায়ী) */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-6 max-w-3xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {list.map((item, idx) => {
          const cardTitle = item.title || item.caption
          const cardSubtitle = item.subtitle || item.description
          const cardDate = fmtPhotoDate(item.date || fallbackDate)
          const hasMeta = Boolean(cardTitle || cardSubtitle || item.credit || cardDate)

          return (
            <div key={item.url + idx} className="space-y-2.5">
              {/* ছবি + জুম করুন বাটন */}
              <div
                onClick={() => onZoom(idx)}
                className="relative w-full rounded-2xl overflow-hidden bg-black/40 border border-white/15 shadow-lg cursor-zoom-in group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={cardTitle || ""}
                  loading="lazy"
                  className="w-full max-h-[70vh] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/25 shadow-lg">
                  <ZoomIn className="size-3.5 text-cyan-400" />
                  <span>জুম করুন</span>
                </span>
              </div>

              {/* ছবির নিচে বামপাশে দাগযুক্ত মেটা বক্স (২ নং ছবির মতো) */}
              {hasMeta && (
                <div className="border-l-2 border-cyan-400/80 bg-white/[0.06] px-3.5 py-2.5 rounded-r-2xl space-y-1">
                  {cardTitle && (
                    <p className="font-bold text-sm text-white leading-snug">{cardTitle}</p>
                  )}
                  {cardSubtitle && (
                    <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                      {cardSubtitle}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px]">
                    {item.credit && (
                      <span className="inline-flex items-center gap-1 text-cyan-300 font-semibold">
                        <Camera className="size-3 shrink-0" />
                        <span>ছবি: {item.credit}</span>
                      </span>
                    )}
                    {cardDate && (
                      <span className="inline-flex items-center gap-1 text-white/65">
                        <Calendar className="size-3 text-cyan-400 shrink-0" />
                        <span>{cardDate}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RichGallery({
  items,
  layout = "grid",
  compact = false,
  postTitle,
  postDate,
}: {
  items: GalleryItem[]
  layout?: string
  compact?: boolean
  postTitle?: string | null
  postDate?: string | null
}) {
  const list = items.filter((i) => i.url)
  const [albumOpen, setAlbumOpen] = useState(false)
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const [globalMode, setGlobalMode] = useState<"lightbox" | "album">("lightbox")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getGlobalPhotoClickMode().then(setGlobalMode)
  }, [])

  if (list.length === 0) return null

  const { base: activeLayout, frameColor, viewerMode } = parseLayoutValue(layout)
  const effectiveViewer: "lightbox" | "album" =
    viewerMode === "default" ? globalMode : viewerMode

  const isFbLayout =
    activeLayout === "fb-classic" || activeLayout === "fb-columns" || activeLayout === "fb-frame"

  function handleOpenPhoto(idx: number) {
    if (effectiveViewer === "album") {
      setAlbumOpen(true)
    } else {
      setZoomIndex(idx)
    }
  }

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
      onOpen={() => handleOpenPhoto(i)}
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
          <FbTile item={list[0]} className="aspect-[4/5] sm:aspect-square" onOpen={() => handleOpenPhoto(0)} />
          <FbTile item={list[1]} className="aspect-[4/5] sm:aspect-square" onOpen={() => handleOpenPhoto(1)} />
        </div>
      )
    } else if (list.length === 3) {
      body = (
        <div className={`grid grid-cols-2 gap-0.5 ${rOuter} overflow-hidden`}>
          <FbTile item={list[0]} className="col-span-2 aspect-[16/10]" onOpen={() => handleOpenPhoto(0)} />
          <FbTile item={list[1]} className="aspect-square" onOpen={() => handleOpenPhoto(1)} />
          <FbTile item={list[2]} className="aspect-square" onOpen={() => handleOpenPhoto(2)} />
        </div>
      )
    } else if (list.length === 4) {
      body = (
        <div className={`grid grid-cols-2 gap-0.5 ${rOuter} overflow-hidden`}>
          {[0, 1, 2, 3].map((i) => (
            <FbTile key={i} item={list[i]} className="aspect-square" onOpen={() => handleOpenPhoto(i)} />
          ))}
        </div>
      )
    } else {
      body = (
        <div className={`space-y-0.5 ${rOuter} overflow-hidden`}>
          <div className="grid grid-cols-2 gap-0.5">
            <FbTile item={list[0]} className="aspect-[4/3]" onOpen={() => handleOpenPhoto(0)} />
            <FbTile item={list[1]} className="aspect-[4/3]" onOpen={() => handleOpenPhoto(1)} />
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            <FbTile item={list[2]} className="aspect-square" onOpen={() => handleOpenPhoto(2)} />
            <FbTile item={list[3]} className="aspect-square" onOpen={() => handleOpenPhoto(3)} />
            <FbTile
              item={list[4]}
              extraCount={list.length - 5}
              className="aspect-square"
              onOpen={() => handleOpenPhoto(4)}
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
              onOpen={() => handleOpenPhoto(i)}
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
          <FbTile item={list[0]} className="rounded-lg max-h-[540px]" onOpen={() => handleOpenPhoto(0)} />
        )}
        {list.length === 2 && (
          <div className="grid grid-cols-2 gap-1.5">
            <FbTile item={list[0]} className="aspect-[3/4] rounded-lg" onOpen={() => handleOpenPhoto(0)} />
            <FbTile item={list[1]} className="aspect-[3/4] rounded-lg" onOpen={() => handleOpenPhoto(1)} />
          </div>
        )}
        {list.length === 3 && (
          <div className="grid grid-cols-2 gap-1.5 h-[280px] sm:h-[340px]">
            <FbTile item={list[0]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(0)} />
            <div className="grid grid-rows-2 gap-1.5 h-full">
              <FbTile item={list[1]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(1)} />
              <FbTile item={list[2]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(2)} />
            </div>
          </div>
        )}
        {list.length === 4 && (
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <FbTile key={i} item={list[i]} className="aspect-square rounded-lg" onOpen={() => handleOpenPhoto(i)} />
            ))}
          </div>
        )}
        {list.length >= 5 && (
          <div className="grid grid-cols-2 gap-1.5 h-[310px] sm:h-[390px]">
            <div className="grid grid-rows-2 gap-1.5 h-full">
              <FbTile item={list[0]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(0)} />
              <FbTile item={list[1]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(1)} />
            </div>
            <div className="grid grid-rows-3 gap-1.5 h-full">
              <FbTile item={list[2]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(2)} />
              <FbTile item={list[3]} className="h-full rounded-lg" onOpen={() => handleOpenPhoto(3)} />
              <FbTile
                item={list[4]}
                extraCount={list.length - 5}
                className="h-full rounded-lg"
                onOpen={() => handleOpenPhoto(4)}
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
                onClick={() => handleOpenPhoto(c.idx)}
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

      {albumOpen &&
        mounted &&
        createPortal(
          <VerticalAlbumModal
            list={list}
            postTitle={postTitle}
            fallbackDate={postDate}
            onClose={() => setAlbumOpen(false)}
            onZoom={(idx) => setZoomIndex(idx)}
          />,
          document.body
        )}

      {zoomIndex !== null &&
        mounted &&
        createPortal(
          <Lightbox
            list={list}
            index={zoomIndex}
            fallbackDate={postDate}
            onClose={() => setZoomIndex(null)}
            onIndex={setZoomIndex}
          />,
          document.body
        )}
    </>
  )
}
