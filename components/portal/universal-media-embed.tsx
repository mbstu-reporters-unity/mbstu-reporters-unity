'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Maximize2,
  Share2,
  MessageSquare,
  Calendar,
  Camera,
  Check,
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

// ⭐ তারিখকে বাংলায় রূপান্তর (যেমন: ৯ নভেম্বর ২০২৬) ⭐
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

  const normalized = val.replace(/[০-৯]/g, (digit) => '০১২৩৪৫৬৭৮৯'.indexOf(digit).toString())
  const parts = normalized.split(/[/\-.]/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ]
    const toBn = (n: number | string) => String(n).replace(/\d/g, (x) => '০১২৩৪৫৬৭৮৯'[Number(x)])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${toBn(day)} ${monthsBn[month - 1]} ${toBn(year)}`
    }
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
  compact = false,
}: {
  item: SingleMediaItem
  index: number
  total: number
  defaultTitle?: string
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [isTheaterOpen, setIsTheaterOpen] = useState(false)

  const media = parseMedia(item.url)
  const displayTitle = item.title || (total > 1 ? `মিডিয়া #${index + 1}` : defaultTitle)

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

  const handleCopyLink = async () => {
    try {
      const shareUrl = typeof window !== 'undefined' ? window.location.href : item.url
      await navigator.clipboard.writeText(item.url || shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleScrollToComments = () => {
    const el = document.getElementById('comments-section') || document.querySelector('section:has(form)')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : item.url
  const shareText = encodeURIComponent(`${item.title || defaultTitle || 'প্রতিবেদন'} - ${currentUrl}`)

  return (
    <>
      <div className={`w-full rounded-2xl border border-border/80 bg-white shadow-sm transition-all overflow-hidden ${compact ? 'p-2 space-y-2' : 'p-3 sm:p-4 space-y-3'}`}>
        
        {/* শিরোনাম ও উপশিরোনাম */}
        {(item.title || item.subtitle) && (
          <div className="space-y-0.5 border-b border-gray-100 pb-1.5">
            {item.title && (
              <h4 className="font-serif text-xs sm:text-sm font-bold text-navy leading-snug line-clamp-1">
                {item.title}
              </h4>
            )}
            {item.subtitle && (
              <p className="text-[11px] font-semibold text-brand line-clamp-1">
                {item.subtitle}
              </p>
            )}
          </div>
        )}

        {/* ⭐ আন্তর্জাতিক ১৬:৯ স্ট্যান্ডার্ড মিডিয়া ফ্রেম ⭐ */}
        {item.url && (
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center group/player">
            
            {/* বড় পর্দা / ফুলস্ক্রিন বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsTheaterOpen(true)
              }}
              title="বড় পর্দায় দেখুন"
              className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-lg bg-black/80 hover:bg-black px-2 py-1 text-[11px] font-bold text-white backdrop-blur border border-white/20 active:scale-95 cursor-pointer shadow-md"
            >
              <Maximize2 className="size-3 text-gold" />
              <span>বড় পর্দা</span>
            </button>

            {/* ১. ইউটিউব প্লেয়ার */}
            {media.type === 'youtube' && (
              <iframe
                src={media.embedSrc}
                className="absolute inset-0 size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen={true}
                title={displayTitle}
              />
            )}

            {/* ২. ফেসবুক ভিডিও */}
            {media.type === 'facebook' && (
              <iframe
                src={media.embedSrc}
                className="absolute inset-0 size-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                allowFullScreen={true}
                title={displayTitle}
              />
            )}

            {/* ৩. সরাসরি ভিডিও ফাইল */}
            {media.type === 'video' && (
              <video
                src={media.src}
                controls
                playsInline
                className="size-full object-cover"
              />
            )}

            {/* ৪. ছবি — ১৬:৯ ফ্রেমিং ও ট্যাপ-টু-জুম */}
            {media.type === 'image' && (
              <div
                className="size-full cursor-pointer relative"
                onClick={() => setIsTheaterOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.src}
                  alt={displayTitle}
                  className="size-full object-cover select-none transition-transform duration-300 group-hover/player:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur border border-white/20">
                  <ZoomIn className="size-3 text-gold" />
                  <span>জুম করুন</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* ⭐ ক্যাপশন বার: শুধুমাত্র ক্যাপশন থাকলে তবেই দেখাবে, ফাঁকা বক্স তৈরি হবে না ⭐ */}
        {!compact && item.caption && item.caption.trim() !== '' && (
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <span className="flex items-center gap-1 font-semibold text-gray-800 truncate">
              <Camera className="size-3.5 text-emerald-700 shrink-0" /> {item.caption}
            </span>
            {item.date && (
              <span className="flex items-center gap-1 ml-auto text-[10px] text-gray-500 font-medium">
                <Calendar className="size-2.5 text-emerald-700" /> {formatBanglaDate(item.date)}
              </span>
            )}
          </div>
        )}

        {/* বিবরণ */}
        {!compact && item.description && (
          <p className="whitespace-pre-line text-xs text-gray-700 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}

        {/* শেয়ার বার */}
        {!compact && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                <Share2 className="size-2.5" /> শেয়ার:
              </span>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] font-semibold hover:bg-emerald-700 transition"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-blue-600 text-white px-1.5 py-0.5 text-[10px] font-semibold hover:bg-blue-700 transition"
              >
                Facebook
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-100 transition inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="size-2.5 text-green-600" /> : null}
                <span>{copied ? 'কপি হয়েছে' : 'লিংক'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleScrollToComments}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-brand hover:underline cursor-pointer"
            >
              <MessageSquare className="size-3" />
              <span>মন্তব্য</span>
            </button>
          </div>
        )}
      </div>

      {/* বড় পর্দা / ফুলস্ক্রিন থিয়েটার মোডাল */}
      {isTheaterOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6 animate-in fade-in"
          onClick={() => setIsTheaterOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsTheaterOpen(false)}
            className="absolute top-4 right-4 z-[110] flex size-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="বন্ধ করুন"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative w-full max-w-5xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {media.type === 'youtube' && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <iframe
                  src={`${media.embedSrc}&autoplay=1`}
                  className="absolute inset-0 size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen={true}
                  title={displayTitle}
                />
              </div>
            )}

            {media.type === 'facebook' && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <iframe
                  src={`${media.embedSrc}&autoplay=true`}
                  className="absolute inset-0 size-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                  allowFullScreen={true}
                  title={displayTitle}
                />
              </div>
            )}

            {media.type === 'video' && (
              <div className="relative w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center">
                <video
                  src={media.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] w-auto max-w-full"
                />
              </div>
            )}

            {media.type === 'image' && (
              <div className="relative w-full max-h-[85vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.src}
                  alt={displayTitle}
                  className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl bg-black"
                />
              </div>
            )}

            {displayTitle && (
              <p className="mt-3 text-center text-xs sm:text-sm text-white/90 font-medium">
                {displayTitle}
              </p>
            )}
          </div>
        </div>
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
    <div className={`space-y-2.5 my-2 w-full ${className}`}>
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
