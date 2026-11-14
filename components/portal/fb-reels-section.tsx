"use client"

import React, { useState, useEffect } from "react"
import { Play, Film, X, Share2 } from "lucide-react"
import { getAllPosts } from "@/lib/sb"

export interface ReelVideoItem {
  id: string
  title: string
  author: string
  authorAvatar?: string | null
  videoUrl: string
  thumbnail?: string
  platform: "youtube" | "facebook" | "direct"
  ytId?: string
}

function detectVideo(rawUrl?: string | null): { isVideo: boolean; url: string; platform: "youtube" | "facebook" | "direct"; ytId?: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") return null
  const str = rawUrl.trim()
  if (!str) return null

  if (str.startsWith("[") || str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of arr) {
        const res = detectVideo(item.url)
        if (res && res.isVideo) return res
      }
    } catch {}
    return null
  }

  const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i)
  if (ytMatch && ytMatch[1]?.length === 11) {
    return { isVideo: true, url: str, platform: "youtube", ytId: ytMatch[1] }
  }

  if (str.includes("facebook.com") || str.includes("fb.watch")) {
    return { isVideo: true, url: str, platform: "facebook" }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(str)) {
    return { isVideo: true, url: str, platform: "direct" }
  }

  return null
}

export function FbReelsSection() {
  const [videoList, setVideoList] = useState<ReelVideoItem[]>([])
  const [activeReel, setActiveReel] = useState<ReelVideoItem | null>(null)

  useEffect(() => {
    getAllPosts(100).then((posts) => {
      const vids: ReelVideoItem[] = []

      posts.forEach((p) => {
        let detected = detectVideo(p.video_url)
        if (!detected && p.embed_media_url) {
          detected = detectVideo(p.embed_media_url)
        }

        if (detected && detected.isVideo) {
          let thumb = p.image_url || undefined
          if (detected.ytId) {
            thumb = `https://img.youtube.com/vi/${detected.ytId}/hqdefault.jpg`
          }

          vids.push({
            id: p.id,
            title: p.title,
            author: p.author || "ক্যাম্পাস সাংবাদিক",
            authorAvatar: p.author_avatar,
            videoUrl: detected.url,
            platform: detected.platform,
            ytId: detected.ytId,
            thumbnail: thumb,
          })
        }
      })
      setVideoList(vids)
    })
  }, [])

  // মোবাইলের ব্যাক বাটন চাপলে সাইট থেকে বের না হয়ে প্লেয়ার বন্ধ হওয়া
  useEffect(() => {
    const handlePopState = () => {
      setActiveReel(null)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const openReelInstant = (reel: ReelVideoItem) => {
    setActiveReel(reel)
    window.history.pushState({ reelOpen: true }, "")
  }

  const closeReel = () => {
    setActiveReel(null)
    if (window.history.state?.reelOpen) {
      window.history.back()
    }
  }

  if (videoList.length === 0) return null

  return (
    <div className="w-full my-6 space-y-3">
      {/* রিলস হেডার */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Film className="size-5 text-rose-500" />
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <span>Reels ও ভিডিও গ্যালারি</span>
            <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">LIVE</span>
          </h3>
        </div>
        <span className="text-xs text-cyan-300 font-semibold">{videoList.length}টি ভিডিও</span>
      </div>

      {/* কার্ড তালিকা (ক্লিক করলেই সাথে সাথে ইনস্ট্যান্ট প্লে হবে) */}
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none select-none">
        {videoList.map((reel) => (
          <div
            key={reel.id}
            onClick={() => openReelInstant(reel)}
            className="relative w-[135px] sm:w-[160px] h-[225px] sm:h-[265px] rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-lg shrink-0 group active:scale-95 transition-all block cursor-pointer"
          >
            {reel.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={reel.thumbnail}
                alt=""
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="size-full bg-slate-950 flex flex-col items-center justify-center p-2 text-center">
                <Film className="size-8 text-white/30 mb-1" />
                <span className="text-[10px] text-white/60 line-clamp-2">{reel.title}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="size-11 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <Play className="size-5 fill-current text-cyan-300 ml-0.5" />
              </span>
            </div>

            <div className="absolute bottom-2.5 inset-x-2.5 space-y-1">
              <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                {reel.title}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                {reel.authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reel.authorAvatar} alt="" className="size-4 rounded-full object-cover border border-white/50" />
                ) : (
                  <div className="size-4 rounded-full bg-cyan-600 text-[9px] text-white flex items-center justify-center font-bold">
                    {reel.author.charAt(0)}
                  </div>
                )}
                <span className="text-[10px] text-slate-300 truncate">{reel.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ফুলস্ক্রিন ইনস্ট্যান্ট ব্ল্যাক প্লেয়ার (ইউটিউবের আসল কন্ট্রোল, সাউন্ড ও সিসি সহ) */}
      {activeReel && (
        <div
          className="fixed inset-0 z-[999999] bg-black flex flex-col justify-between p-0 animate-in fade-in"
          onClick={closeReel}
        >
          {/* হেডার */}
          <div
            className="flex items-center justify-between p-3.5 bg-gradient-to-b from-black/90 to-transparent z-50 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeReel}
              className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/25 cursor-pointer"
            >
              ✕ বন্ধ করুন
            </button>
            <span className="text-xs font-bold bg-red-600 px-3 py-1 rounded-full">Reels</span>
          </div>

          {/* প্লেয়ার (কোনো ওভারল্যাপিং ছাড়াই সরাসরি ইউটিউবের কন্ট্রোল) */}
          <div
            className="relative w-full flex-1 flex items-center justify-center bg-black my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeReel.platform === "youtube" && activeReel.ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeReel.ytId}?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1`}
                className="w-full aspect-video max-h-[85vh] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : activeReel.platform === "facebook" ? (
              <iframe
                src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(activeReel.videoUrl)}&show_text=false&autoplay=true`}
                className="w-full aspect-video max-h-[85vh] border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                src={activeReel.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[85vh] object-contain"
              />
            )}
          </div>

          {/* ফুটার */}
          <div
            className="p-4 bg-gradient-to-t from-black via-slate-950 to-transparent space-y-2 z-50 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-sm sm:text-base font-bold drop-shadow">
              {activeReel.title}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-2">
              <span className="font-semibold">{activeReel.author}</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: activeReel.title, url: activeReel.videoUrl })
                  }
                }}
                className="inline-flex items-center gap-1 text-cyan-300"
              >
                <Share2 className="size-3.5" /> শেয়ার
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
