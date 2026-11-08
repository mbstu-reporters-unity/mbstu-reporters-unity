'use client'

import React, { useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause, ExternalLink } from 'lucide-react'

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
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=false&mute=1`,
    }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: 'video' as const, src: url }
  }

  return { type: 'image' as const, src: url }
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!url || !url.trim()) return null

  const media = parseMedia(url)

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setIsPlaying(true)
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }

  const toggleVideoSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (v) {
      v.muted = !v.muted
      setMuted(v.muted)
    }
  }

  return (
    <div className={`mt-3 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-md ${className}`}>
      {/* ১. ইউটিউব প্লেয়ার */}
      {media.type === 'youtube' && (
        <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black">
          <iframe
            src={media.embedSrc}
            className="absolute inset-0 size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Embedded Video'}
          />
        </div>
      )}

      {/* ২. ফেসবুক ভিডিও প্লেয়ার */}
      {media.type === 'facebook' && (
        <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black">
          <iframe
            src={media.embedSrc}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title={title || 'Facebook Video'}
          />
        </div>
      )}

      {/* ৩. সরাসরি ভিডিও ফাইল */}
      {media.type === 'video' && (
        <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black">
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

      {/* ৪. ছবি */}
      {media.type === 'image' && (
        <div className="relative max-h-96 w-full max-w-full overflow-hidden bg-black/90 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt={title || 'Media preview'}
            className="h-auto max-h-96 w-full object-contain transition-all hover:scale-[1.01]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* নিচের লিঙ্ক বার */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-white/10 text-[10px] text-gray-400 gap-2 min-w-0">
        <span className="truncate flex-1 min-w-0 font-mono">🔗 {url}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold shrink-0"
        >
          <span>মূল লিংক</span>
          <ExternalLink className="size-2.5" />
        </a>
      </div>
    </div>
  )
}

export default UniversalMediaEmbed
