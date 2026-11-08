'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause, ExternalLink, Maximize2, Minimize2, X } from 'lucide-react'

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

export function UniversalMediaEmbed({
  url,
  title = '',
  className = '',
}: {
  url?: string | null
  title?: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // স্ক্রিন ছোট ও বড় করার নতুন স্টেট
  const [isFullscreen, setIsFullscreen] = useState(false)

  // কীবোর্ডের Escape বাটনে ফুলস্ক্রিন বন্ধের হ্যান্ডলার
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // ফুলস্ক্রিন চালু হলে বডির স্ক্রল সাময়িকভাবে অফ রাখা
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

  // স্ক্রিন ছোট-বড় টগল ফাংশন
  const toggleScreenSize = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFullscreen((prev) => !prev)
  }

  return (
    <>
      {/* মূল মিডিয়া কন্টেইনার */}
      <div
        ref={containerRef}
        className={`relative mt-3 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-md transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 flex h-screen w-screen flex-col justify-center rounded-none border-none bg-black/95 p-2 sm:p-6'
            : className
        }`}
      >
        {/* ফুলস্ক্রিন অবস্থায় উপরের নিয়ন্ত্রণ বার */}
        {isFullscreen && (
          <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleScreenSize}
              className="flex items-center gap-1.5 rounded-full bg-red-600/90 hover:bg-red-700 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition active:scale-95"
            >
              <X className="size-4" />
              <span>ছোট করুন</span>
            </button>
          </div>
        )}

        {/* মিডিয়ার ওপর স্ক্রিন ছোট-বড় করার ভাসমান বাটন (সব মিডিয়ার ক্ষেত্রে প্রযোজ্য) */}
        {!isFullscreen && (
          <div className="absolute top-2 right-2 z-30">
            <button
              type="button"
              onClick={toggleScreenSize}
              title="বড় পর্দা / সম্পূর্ণ স্ক্রিনে দেখুন"
              aria-label="বড় পর্দা / সম্পূর্ণ স্ক্রিনে দেখুন"
              className="flex items-center gap-1 rounded-lg bg-black/70 hover:bg-black/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-md transition-all active:scale-95 border border-white/20"
            >
              <Maximize2 className="size-3.5 text-emerald-400" />
              <span className="hidden sm:inline">বড় পর্দা</span>
            </button>
          </div>
        )}

        {/* ১. ইউটিউব প্লেয়ার */}
        {media.type === 'youtube' && (
          <div className={`relative w-full max-w-full overflow-hidden bg-black ${isFullscreen ? 'h-full max-h-[88vh] aspect-video mx-auto' : 'aspect-video'}`}>
            <iframe
              src={media.embedSrc}
              className="absolute inset-0 size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={title || 'Embedded Video'}
            />
          </div>
        )}

        {/* ২. ফেসবুক ভিডিও প্লেয়ার (স্ক্রিন ছোট-বড় সুবিধাসহ) */}
        {media.type === 'facebook' && (
          <div className={`relative w-full max-w-full overflow-hidden bg-black ${isFullscreen ? 'h-full max-h-[88vh] aspect-video mx-auto' : 'aspect-video'}`}>
            <iframe
              src={media.embedSrc}
              className="absolute inset-0 size-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              title={title || 'Facebook Video'}
            />
          </div>
        )}

        {/* ৩. সরাসরি ভিডিও ফাইল */}
        {media.type === 'video' && (
          <div className={`relative w-full max-w-full overflow-hidden bg-black ${isFullscreen ? 'h-full max-h-[88vh] aspect-video mx-auto' : 'aspect-video'}`}>
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
          <div className={`relative w-full max-w-full overflow-hidden bg-black/90 flex items-center justify-center ${isFullscreen ? 'h-full max-h-[90vh]' : 'max-h-96'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.src}
              alt={title || 'Media preview'}
              className={`h-auto w-full object-contain transition-all ${isFullscreen ? 'max-h-[90vh]' : 'max-h-96 hover:scale-[1.01]'}`}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {/* নিচের লিঙ্ক বার (স্বাভাবিক মোডে দৃশ্যমান) */}
        {!isFullscreen && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-white/10 text-[10px] text-gray-400 gap-2 min-w-0">
            <span className="truncate flex-1 min-w-0 font-mono">🔗 {url}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleScreenSize}
                className="text-yellow-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Maximize2 className="size-2.5" />
                <span>বড় পর্দা</span>
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>মূল লিংক</span>
                <ExternalLink className="size-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default UniversalMediaEmbed
