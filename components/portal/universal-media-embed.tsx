'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Maximize2,
  Calendar,
  Camera,
  X,
  ZoomIn,
} from 'lucide-react'

export type SingleMediaItem = {
  id?: string
  title?: string
  subtitle?: string
  description?: string
  date?: string
  caption?: string
  url: string
}

function formatBanglaDate(val?: string | null): string {
  if (!val) return ''
  if (/জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/.test(val)) {
    return val
  }
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
  }
  return val
}

function parseMedia(rawUrl: string) {
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'unknown' as const }
  const url = rawUrl.trim()

  const ytMatch = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  )
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      type: 'youtube' as const,
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&autoplay=0&mute=1&loop=1&playlist=${ytMatch[2]}&controls=1&modestbranding=1&rel=0&fs=1&playsinline=1`,
    }
  }

  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return {
      type: 'facebook' as const,
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=false&mute=1&allowfullscreen=true`,
    }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: 'video' as const, src: url }
  }

  return { type: 'image' as const, src: url }
}

function parseMediaList(raw?: string | null): SingleMediaItem[] {
  if (!raw || !raw.trim()) return []
  const str = raw.trim()
  if (str.startsWith('[') || str.startsWith('{')) {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) {
        return parsed.filter((i) => i && (i.url || i.title || i.description))
      }
      if (parsed && typeof parsed === 'object') return [parsed]
    } catch {}
  }
  return [{ url: str }]
}

function SingleMediaCard({
  item,
  index,
  total,
  defaultTitle = '',
}: {
  item: SingleMediaItem
  index: number
  total: number
  defaultTitle?: string
  compact?: boolean
}) {
  const [isTheaterOpen, setIsTheaterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const media = parseMedia(item.url)
  const displayTitle = item.title || (total > 1 ? `ছবি #${index + 1}` : defaultTitle)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isTheaterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isTheaterOpen])

  return (
    <>
      {/* ✅ সমাধান: ভারী ফ্রেম, বাক্সের মার্জিন এবং বাড়তি শেয়ার/কমেন্ট বাটন দূর করে ক্লিন এডিটোরিয়াল ডিজাইন */}
      <div className="w-full my-4 space-y-2">
        
        {/* ছবি বা ভিডিও প্রদর্শন */}
        {item.url && (
          <div>
            {media.type === 'image' && (
              <div
                className="relative w-full rounded-2xl overflow-hidden bg-black/20 border border-white/15 shadow-md cursor-zoom-in group/img"
                onClick={() => setIsTheaterOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.src}
                  alt={displayTitle}
                  className="w-full max-h-[500px] object-contain mx-auto select-none transition-transform duration-300 group-hover/img:scale-[1.01]"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
                
                {/* বড় করার সূক্ষ্ম ব্যাজ */}
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 shadow-md">
                  <ZoomIn className="size-3 text-cyan-400" />
                  <span>জুম করুন</span>
                </span>
              </div>
            )}

            {media.type === 'video' && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-white/15">
                <video
                  src={media.src}
                  controls
                  playsInline
                  className="size-full object-cover"
                />
              </div>
            )}

            {media.type === 'youtube' && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/15 bg-black">
                <iframe
                  src={media.embedSrc}
                  className="size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen={true}
                  title={displayTitle}
                />
              </div>
            )}

            {media.type === 'facebook' && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/15 bg-black">
                <iframe
                  src={media.embedSrc}
                  className="size-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                  allowFullScreen={true}
                  title={displayTitle}
                />
              </div>
            )}
          </div>
        )}

        {/* ✅ সংবাদপত্র স্টাইল ক্যাপশন ও বিবরণ (কোনো কৃত্রিম ফ্রেম ছাড়া) */}
        {(item.title || item.subtitle || item.caption || item.description) && (
          <div className="px-2 pt-1 space-y-0.5 border-l-2 border-cyan-400/70 bg-white/[0.03] py-1.5 rounded-r-xl">
            {item.title && (
              <p className="font-bold text-xs sm:text-sm text-white">
                {item.title}
              </p>
            )}
            {item.subtitle && (
              <p className="text-[11px] font-semibold text-cyan-300">
                {item.subtitle}
              </p>
            )}
            {item.caption && (
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Camera className="size-3 text-cyan-400 shrink-0" />
                <span>{item.caption}</span>
              </p>
            )}
            {item.description && (
              <p className="text-xs text-slate-200/90 leading-relaxed whitespace-pre-line pt-0.5">
                {item.description}
              </p>
            )}
            {item.date && (
              <p className="text-[10px] text-white/50 flex items-center gap-1 pt-0.5">
                <Calendar className="size-2.5 text-cyan-400" />
                <span>{formatBanglaDate(item.date)}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ফুলস্ক্রিন লাইটবক্স থিয়েটার */}
      {isTheaterOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-3 sm:p-6 animate-in fade-in"
          onClick={() => setIsTheaterOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsTheaterOpen(false)}
            className="absolute top-4 right-4 z-[100000] flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl active:scale-95"
            aria-label="বন্ধ করুন"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative w-full max-w-5xl flex flex-col items-center justify-center px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {media.type === 'image' && (
              <div className="relative w-full max-h-[85vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.src}
                  alt={displayTitle}
                  className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20 bg-black/50"
                />
              </div>
            )}

            {media.type === 'video' && (
              <div className="relative w-full max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black flex items-center justify-center">
                <video
                  src={media.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] w-auto max-w-full"
                />
              </div>
            )}

            {media.type === 'youtube' && (
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                <iframe
                  src={`${media.embedSrc}&autoplay=1`}
                  className="size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen={true}
                  title={displayTitle}
                />
              </div>
            )}

            {displayTitle && (
              <p className="mt-4 text-center text-sm font-bold text-white/90 drop-shadow-md">
                {displayTitle}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export function UniversalMediaEmbed({
  url,
  title = '',
  className = '',
  compact = false,
}: {
  url?: string | null
  title?: string
  className?: string
  compact?: boolean
}) {
  if (!url || !url.trim()) return null

  const items = parseMediaList(url)
  if (items.length === 0) return null

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {items.map((item, idx) => (
        <SingleMediaCard
          key={item.id || idx}
          item={item}
          index={idx}
          total={items.length}
          defaultTitle={title}
          compact={compact}
        />
      ))}
    </div>
  )
}

export default UniversalMediaEmbed
