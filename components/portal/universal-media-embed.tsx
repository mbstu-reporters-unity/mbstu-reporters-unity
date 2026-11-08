'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Maximize2,
  X,
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

// একক স্ট্রিং বা একাধিক মিডিয়ার JSON পার্স করার নিরাপদ ফাংশন
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
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const media = parseMedia(item.url)
  const displayTitle = item.title || (total > 1 ? `মিডিয়া #${index + 1}` : defaultTitle)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  const toggleScreenSize = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFullscreen((prev) => !prev)
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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : item.url
  const shareText = encodeURIComponent(`${item.title || defaultTitle || 'সংবাদ প্রতিবেদন'} - ${currentUrl}`)

  return (
    <div className="rounded-2xl border border-border/80 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden space-y-3 p-3.5 sm:p-4.5">
      {/* ১. মিডিয়ার শিরোনাম ও উপশিরোনাম */}
      {(item.title || item.subtitle) && (
        <div className="space-y-1 border-b border-gray-100 pb-2.5">
          {item.title && (
            <h4 className="font-serif text-base sm:text-lg font-bold text-navy leading-snug">
              {item.title}
            </h4>
          )}
          {item.subtitle && (
            <p className="text-xs sm:text-sm font-semibold text-brand">
              {item.subtitle}
            </p>
          )}
        </div>
      )}

      {/* ২. মিডিয়া প্লেয়ার (ফেসবুক, ইউটিউব, ভিডিও বা ছবি) */}
      {item.url && (
        <div
          ref={containerRef}
          className={`relative w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-inner ${
            isFullscreen
              ? 'fixed inset-0 z-50 flex h-screen w-screen flex-col justify-center rounded-none border-none bg-black/95 p-2 sm:p-6'
              : ''
          }`}
        >
          {isFullscreen && (
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={toggleScreenSize}
                className="flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg active:scale-95 transition"
              >
                <X className="size-4" />
                <span>ছোট করুন</span>
              </button>
            </div>
          )}

          {!isFullscreen && (
            <div className="absolute top-2 right-2 z-30">
              <button
                type="button"
                onClick={toggleScreenSize}
                title="বড় পর্দা / সম্পূর্ণ স্ক্রিনে দেখুন"
                className="flex items-center gap-1 rounded-lg bg-black/75 hover:bg-black px-2.5 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-md border border-white/20 active:scale-95"
              >
                <Maximize2 className="size-3.5 text-emerald-400" />
                <span className="hidden sm:inline">বড় পর্দা</span>
              </button>
            </div>
          )}

          {media.type === 'youtube' && (
            <div className={`relative w-full overflow-hidden bg-black ${isFullscreen ? 'h-full max-h-[88vh] aspect-video mx-auto' : 'aspect-video'}`}>
              <iframe
                src={media.embedSrc}
                className="absolute inset-0 size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={displayTitle}
              />
            </div>
          )}

          {media.type === 'facebook' && (
            <div className={`relative w-full overflow-hidden bg-black ${isFullscreen ? 'h-full max-h-[88vh] aspect-video mx-auto' : 'aspect-video'}`}>
              <iframe
                src={media.embedSrc}
                className="absolute inset-0 size-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                title={displayTitle}
              />
            </div>
          )}

          {media.type === 'video' && (
            <div className={`relative w-full overflow-hidden bg-black ${isFullscreen ? 'h-full max-h-[88vh] aspect-video mx-auto' : 'aspect-video'}`}>
              <video
                ref={videoRef}
                src={media.src}
                controls
                playsInline
                muted={muted}
                className="size-full object-contain"
              />
            </div>
          )}

          {media.type === 'image' && (
            <div className={`relative w-full overflow-hidden bg-black/90 flex items-center justify-center ${isFullscreen ? 'h-full max-h-[90vh]' : 'max-h-96'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.src}
                alt={displayTitle}
                className={`h-auto w-full object-contain ${isFullscreen ? 'max-h-[90vh]' : 'max-h-96 hover:scale-[1.01]'} transition-all`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ৩. ক্যাপশন ও তারিখ */}
      {(item.caption || item.date) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-xl border border-gray-100">
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

      {/* ৪. বিস্তারিত বিবরণ */}
      {item.description && (
        <p className="whitespace-pre-line text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">
          {item.description}
        </p>
      )}

      {/* ৫. শেয়ার ও মন্তব্য বাটনসমূহ */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Share2 className="size-3" /> শেয়ার:
          </span>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-700 transition"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-blue-700 transition"
          >
            Facebook
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-lg border bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition inline-flex items-center gap-1"
          >
            {copied ? <Check className="size-3 text-green-600" /> : null}
            <span>{copied ? 'কপি হয়েছে!' : 'লিংক'}</span>
          </button>
        </div>

        {/* মন্তব্য বাটন */}
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
    <div className={`space-y-4 my-3 w-full ${className}`}>
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
