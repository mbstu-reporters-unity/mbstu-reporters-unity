'use client'

import React, { useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause, ExternalLink } from 'lucide-react'

// লিংক বিশ্লেষণ করার ফাংশন
function parseMedia(rawUrl: string) {
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'unknown' as const }
  const url = rawUrl.trim()

  // ১. ইউটিউব ভিডিও শনাক্তকরণ
  const ytMatch = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  )
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      type: 'youtube' as const,
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${ytMatch[2]}&controls=1&modestbranding=1&rel=0`,
    }
  }

  // ২. ফেসবুক ভিডিও শনাক্তকরণ
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return {
      type: 'facebook' as const,
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true&mute=1`,
    }
  }

  // ৩. ডিরেক্ট ভিডিও ফাইল শনাক্তকরণ
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: 'video' as const, src: url }
  }

  // ৪. ডিরেক্ট ছবি শনাক্তকরণ
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url) || url.includes('images') || url.includes('photo')) {
    return { type: 'image' as const, src: url }
  }

  // ৫. অন্যান্য ওয়েব লিংক
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
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

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
    <div className={`mt-3 w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-md ${className}`}>
      
      {/* ১. ইউটিউব ভিডিও প্লেয়ার */}
      {media.type === 'youtube' && (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            ref={iframeRef}
            src={media.embedSrc}
            className="size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Embedded Video'}
          />
        </div>
      )}

      {/* ২. ফেসবুক ভিডিও প্লেয়ার */}
      {media.type === 'facebook' && (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={media.embedSrc}
            className="size-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title={title || 'Facebook Video'}
          />
        </div>
      )}

      {/* ৩. সরাসরি ভিডিও ফাইল প্লেয়ার */}
      {media.type === 'video' && (
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            src={media.src}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="size-full object-contain"
            onClick={toggleVideoPlay}
          />
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleVideoPlay}
              className="px-2 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] font-semibold flex items-center gap-1 shadow border border-white/20"
            >
              {isPlaying ? <Pause className="size-3 text-yellow-400" /> : <Play className="size-3 text-green-400" />}
              <span>{isPlaying ? 'পজ' : 'চালান'}</span>
            </button>
            <button
              type="button"
              onClick={toggleVideoSound}
              className="p-1 rounded-full bg-black/75 hover:bg-black text-white shadow border border-white/20"
            >
              {muted ? <VolumeX className="size-3 text-red-400" /> : <Volume2 className="size-3 text-green-400" />}
            </button>
          </div>
        </div>
      )}

      {/* ৪. ছবি প্রিভিউ */}
      {media.type === 'image' && (
        <div className="relative max-h-96 w-full overflow-hidden bg-black/90 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt={title || 'Media preview'}
            className="h-auto max-h-96 w-full object-contain transition-all hover:scale-[1.01]"
            onError={(e) => {
              // যদি ছবির লিংক সরাসরি লোড না হয়, তবে সুন্দর একটি ফলব্যাক দেখাবে
              (e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* নিচে লিংকের ছোট বার */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-white/10 text-[10px] text-gray-400">
        <span className="truncate max-w-[80%] font-mono">🔗 {url}</span>
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
