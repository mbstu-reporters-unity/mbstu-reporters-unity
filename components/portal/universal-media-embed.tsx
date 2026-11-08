'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Maximize2,
  Minimize2,
  Share2,
  MessageSquare,
  Calendar,
  Camera,
  Check,
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

function parseMedia(rawUrl: string) {
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'unknown' as const }
  const url = rawUrl.trim()

  const ytMatch = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  )
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      type: 'youtube' as const,
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&autoplay=0&mute=1&loop=1&playlist=${ytMatch[2]}&controls=1&modestbranding=1&rel=0`,
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
}) {
  const playerBoxRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [isFs, setIsFs] = useState(false)

  const media = parseMedia(item.url)
  const displayTitle = item.title || (total > 1 ? `মিডিয়া #${index + 1}` : defaultTitle)

  useEffect(() => {
    const onFsChange = () => {
      setIsFs(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleNativeFullscreen = () => {
    if (!playerBoxRef.current) return
    if (!document.fullscreenElement) {
      if (playerBoxRef.current.requestFullscreen) {
        playerBoxRef.current.requestFullscreen().catch(() => {})
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

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
    <div className="w-full rounded-2xl border border-border/80 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all space-y-3 overflow-hidden">
      
      {/* শিরোনাম ও উপশিরোনাম */}
      {(item.title || item.subtitle) && (
        <div className="space-y-1 border-b border-gray-100 pb-2">
          {item.title && (
            <h4 className="font-serif text-sm sm:text-base font-bold text-navy leading-snug">
              {item.title}
            </h4>
          )}
          {item.subtitle && (
            <p className="text-xs font-semibold text-brand">
              {item.subtitle}
            </p>
          )}
        </div>
      )}

      {/* ⭐ ছবি ও ভিডিও প্লেয়ার — ছবি যাতে না কাটে সেজন্য object-contain নিশ্চিত করা হয়েছে ⭐ */}
      {item.url && (
        <div
          ref={playerBoxRef}
          className={`relative w-full rounded-xl overflow-hidden bg-black shadow-inner flex items-center justify-center ${
            media.type === 'image' ? 'min-h-[180px] max-h-[500px]' : 'aspect-video'
          }`}
        >
          {/* ফুলস্ক্রিন বাটন */}
          <button
            type="button"
            onClick={toggleNativeFullscreen}
            title={isFs ? "ছোট করুন" : "বড় পর্দা"}
            className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-lg bg-black/70 hover:bg-black/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur border border-white/20 active:scale-95 cursor-pointer"
          >
            {isFs ? <Minimize2 className="size-3.5 text-yellow-400" /> : <Maximize2 className="size-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isFs ? "ছোট করুন" : "বড় পর্দা"}</span>
          </button>

          {/* ১. ইউটিউব প্লেয়ার */}
          {media.type === 'youtube' && (
            <iframe
              src={media.embedSrc}
              className="absolute inset-0 size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={displayTitle}
            />
          )}

          {/* ২. ফেসবুক ভিডিও প্লেয়ার */}
          {media.type === 'facebook' && (
            <iframe
              src={media.embedSrc}
              className="absolute inset-0 size-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              title={displayTitle}
            />
          )}

          {/* ৩. সরাসরি ভিডিও ফাইল */}
          {media.type === 'video' && (
            <video
              src={media.src}
              controls
              playsInline
              className="size-full object-contain"
            />
          )}

          {/* ৪. ছবি — পুরো ছবি সম্পূর্ণ অক্ষতভাবে দেখাবে (কখনোই কাটবে না) */}
          {media.type === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.src}
              alt={displayTitle}
              className="w-full max-h-[500px] object-contain select-none bg-black/90"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
          )}
        </div>
      )}

      {/* ক্যাপশন ও তারিখ */}
      {(item.caption || item.date) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
          {item.caption && (
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <Camera className="size-3.5 text-brand" /> {item.caption}
            </span>
          )}
          {item.date && (
            <span className="flex items-center gap-1 ml-auto text-[11px] text-gray-500">
              <Calendar className="size-3 text-gold" /> {item.date}
            </span>
          )}
        </div>
      )}

      {/* বিস্তারিত বিবরণ */}
      {item.description && (
        <p className="whitespace-pre-line text-xs sm:text-sm text-gray-700 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* শেয়ার ও মন্তব্য বাটন */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Share2 className="size-3" /> শেয়ার:
          </span>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-600 text-white px-2 py-0.5 text-[11px] font-semibold hover:bg-emerald-700 transition"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 text-white px-2 py-0.5 text-[11px] font-semibold hover:bg-blue-700 transition"
          >
            Facebook
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-lg border bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition inline-flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="size-3 text-green-600" /> : null}
            <span>{copied ? 'কপি হয়েছে' : 'লিংক'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleScrollToComments}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline cursor-pointer"
        >
          <MessageSquare className="size-3.5" />
          <span>মন্তব্য করুন</span>
        </button>
      </div>
    </div>
  )
}

export function UniversalMediaEmbed({
  url,
  title = '',
  className = '',
}: {
  url?: string | null
  title?: string
  className?: string
}) {
  if (!url || !url.trim()) return null

  const items = parseMediaList(url)
  if (items.length === 0) return null

  return (
    <div className={`space-y-3.5 my-2.5 w-full ${className}`}>
      {items.map((item, idx) => (
        <SingleMediaCard
          key={item.id || idx}
          item={item}
          index={idx}
          total={items.length}
          defaultTitle={title}
        />
      ))}
    </div>
  )
}

export default UniversalMediaEmbed
