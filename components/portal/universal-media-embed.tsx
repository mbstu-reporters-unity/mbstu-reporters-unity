'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Maximize2,
  Minimize2,
  Share2,
  MessageCircle,
  Check,
  Send,
} from 'lucide-react'

// লিংক বিশ্লেষণ করার উন্নত ফাংশন
function parseMedia(rawUrl: string) {
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'unknown' as const, original: '' }
  const url = rawUrl.trim()

  // ১. ইউটিউব ভিডিও শনাক্তকরণ (Shorts ও সাধারণ লিঙ্ক)
  const ytMatch = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  )
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      type: 'youtube' as const,
      original: url,
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&autoplay=0&mute=1&loop=1&playlist=${ytMatch[2]}&controls=1&modestbranding=1&rel=0`,
    }
  }

  // ২. ফেসবুক ভিডিও, রিল ও শেয়ার ভিডিও লিংক শনাক্তকরণ
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return {
      type: 'facebook' as const,
      original: url,
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=false&mute=1`,
    }
  }

  // ৩. সরাসরি ভিডিও ফাইল (mp4, webm, mov ইত্যাদি)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: 'video' as const, original: url, src: url }
  }

  // ৪. সরাসরি ছবি
  return { type: 'image' as const, original: url, src: url }
}

export function UniversalMediaEmbed({
  url,
  title = '',
  className = '',
  caption = '',
  date = '',
  enableInteractions = false,
  itemId = '',
}: {
  url?: string | null
  title?: string
  className?: string
  caption?: string
  date?: string
  enableInteractions?: boolean
  itemId?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // শেয়ার ও কমেন্ট স্টেট
  const [copied, setCopied] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentList, setCommentList] = useState<Array<{ name: string; text: string; time: string }>>([])
  const [cName, setCName] = useState('')
  const [cText, setCText] = useState('')

  useEffect(() => {
    if (itemId) {
      try {
        const saved = localStorage.getItem(`club_media_comment_${itemId}`)
        if (saved) setCommentList(JSON.parse(saved))
      } catch {}
    }
  }, [itemId])

  if (!url || !url.trim()) return null

  const media = parseMedia(url)

  // স্ক্রিন বড়-ছোট ও ফুলস্ক্রিন টগল
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {})
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

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

  // সোশ্যাল শেয়ার
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title || 'ক্যাম্পাস ক্লাব মিডিয়া',
          text: `${title} - ${caption || ''}`,
          url: url,
        })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // মন্তব্য পাঠানো
  const handleAddComment = () => {
    if (!cText.trim() || !itemId) return
    const newComment = {
      name: cName.trim() || 'সাধারণ পাঠক',
      text: cText.trim(),
      time: 'এইমাত্র',
    }
    const updated = [...commentList, newComment]
    setCommentList(updated)
    try {
      localStorage.setItem(`club_media_comment_${itemId}`, JSON.stringify(updated))
    } catch {}
    setCText('')
  }

  return (
    <div
      ref={containerRef}
      className={`mt-3 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-md font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 flex flex-col justify-center bg-black' : ''
      } ${className}`}
    >
      {/* ১. ইউটিউব ভিডিও প্লেয়ার */}
      {media.type === 'youtube' && (
        <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black">
          <iframe
            src={media.embedSrc}
            className="absolute inset-0 size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={title || 'Embedded Video'}
          />
        </div>
      )}

      {/* ২. ফেসবুক ভিডিও ও রিল প্লেয়ার */}
      {media.type === 'facebook' && (
        <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black">
          <iframe
            src={media.embedSrc}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            title={title || 'Facebook Video'}
          />
        </div>
      )}

      {/* ৩. সরাসরি ভিডিও ফাইল প্লেয়ার */}
      {media.type === 'video' && (
        <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={media.src}
            controls
            playsInline
            muted={muted}
            className="size-full object-contain"
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
        <div className="relative max-h-96 w-full max-w-full overflow-hidden bg-black/95 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt={title || caption || 'Media'}
            className="h-auto max-h-96 w-full object-contain transition-all"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* ক্যাপশন ও তারিখ বার */}
      {(caption || date) && (
        <div className="px-3.5 py-2 bg-slate-900/90 border-t border-white/10 text-xs text-white/90 flex flex-wrap items-center justify-between gap-2">
          {caption && <p className="font-sans italic">{caption}</p>}
          {date && <span className="text-[11px] text-gold/90 font-medium font-sans">📅 {date}</span>}
        </div>
      )}

      {/* নিচের কন্ট্রোল, ফুলস্ক্রিন, শেয়ার ও কমেন্ট বার */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900 border-t border-white/10 text-[11px] text-gray-400 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold truncate max-w-[200px]"
            title="মূল লিংকে যান"
          >
            <span>🔗 মূল লিংক খুলুন</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* স্ক্রিন বড়-ছোট / ফুলস্ক্রিন বাটন */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[11px] transition-colors"
            title={isFullscreen ? 'ছোট করুন' : 'বড়/ফুলস্ক্রিন করুন'}
          >
            {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
            <span>{isFullscreen ? 'ছোট' : 'ফুলস্ক্রিন'}</span>
          </button>

          {/* শেয়ার বাটন */}
          <button
            type="button"
            onClick={handleShare}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[11px] transition-colors"
          >
            {copied ? <Check className="size-3 text-green-400" /> : <Share2 className="size-3" />}
            <span>{copied ? 'কপি!' : 'শেয়ার'}</span>
          </button>

          {/* কমেন্ট টগল বাটন */}
          {enableInteractions && (
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[11px] transition-colors"
            >
              <MessageCircle className="size-3" />
              <span>মন্তব্য ({commentList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ইন্টারঅ্যাক্টিভ কমেন্ট বক্স */}
      {enableInteractions && showComments && (
        <div className="p-3 bg-slate-950 border-t border-white/10 space-y-2.5 text-xs text-white">
          <p className="font-bold text-emerald-400 text-xs">💬 এই মিডিয়ার মন্তব্যসমূহ:</p>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {commentList.map((c, i) => (
              <div key={i} className="p-2 rounded-xl bg-slate-900 border border-white/5 space-y-0.5">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="font-bold text-white">{c.name}</span>
                  <span>{c.time}</span>
                </div>
                <p className="text-gray-200">{c.text}</p>
              </div>
            ))}
            {commentList.length === 0 && (
              <p className="text-[11px] text-gray-500 italic">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনি করুন।</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
            <input
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white placeholder-gray-500 sm:w-1/3"
              placeholder="আপনার নাম"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
            />
            <input
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white placeholder-gray-500 flex-1"
              placeholder="মন্তব্য লিখুন..."
              value={cText}
              onChange={(e) => setCText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              type="button"
              onClick={handleAddComment}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-3 py-1 font-bold text-xs flex items-center justify-center gap-1"
            >
              <Send className="size-3" />
              <span>পাঠান</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UniversalMediaEmbed
