"use client"

import React, { useState, useEffect } from "react"
import { Play, Film, X, ExternalLink, Share2, Calendar, User } from "lucide-react"
import { getAllPosts } from "@/lib/sb"

export interface ReelVideoItem {
  id: string
  title: string
  author: string
  authorAvatar?: string | null
  videoUrl: string
  date: string
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
          if (detected.platform === "youtube" && detected.ytId) {
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
            date: new Date(p.created_at).toLocaleDateString("bn-BD"),
            thumbnail: thumb,
          })
        }
      })
      setVideoList(vids)
    })
  }, [])

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

      {/* রিলস কার্ড স্লাইডার */}
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none select-none">
        {videoList.map((reel) => (
          <div
            key={reel.id}
            onClick={() => setActiveReel(reel)}
            className="relative w-[135px] sm:w-[160px] h-[225px] sm:h-[265px] rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-lg cursor-pointer shrink-0 group active:scale-95 transition-all"
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
              <span className="size-11 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl">
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
                  <img src={reel.authorAvatar} alt="" className="size-4 rounded-full object-cover" />
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

      {/* সম্পূর্ণ পরিচ্ছন্ন ভিডিও প্লেয়ার মোডাল (ইউটিউবের আসল কন্ট্রোল সহ) */}
      {activeReel && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl animate-in fade-in"
          onClick={() => setActiveReel(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* উপরের হেডার */}
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-slate-900/90 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold bg-red-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <Film className="size-3" /> ভিডিও প্লেয়ার
                </span>
                <p className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-md">
                  {activeReel.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveReel(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition shrink-0 cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* আসল প্লেয়ার ফ্রেম (সব কন্ট্রোল, সাউন্ড, সাবটাইটেল পুরোপুরি কার্যকর) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {activeReel.platform === "youtube" && activeReel.ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeReel.ytId}?autoplay=1&controls=1&rel=0&enablejsapi=1&playsinline=1`}
                  className="size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : activeReel.platform === "facebook" ? (
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(activeReel.videoUrl)}&show_text=false&autoplay=true`}
                  className="size-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeReel.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="size-full object-contain"
                />
              )}
            </div>

            {/* ভিডিওর নিচে পরিচ্ছন্ন টাইটেল ও ক্রিয়েটর ইনফো (কোনো ওভারল্যাপ নেই) */}
            <div className="p-4 bg-slate-900/95 space-y-2.5 text-white">
              <h4 className="font-serif text-sm sm:text-base font-bold leading-snug">
                {activeReel.title}
              </h4>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  {activeReel.authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeReel.authorAvatar} alt="" className="size-7 rounded-full object-cover border border-cyan-400" />
                  ) : (
                    <div className="size-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                      {activeReel.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-xs">{activeReel.author}</p>
                    <p className="text-[10px] text-slate-400">{activeReel.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/post/${activeReel.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                  >
                    <span>মূল সংবাদ</span>
                    <ExternalLink className="size-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: activeReel.title, url: `${window.location.origin}/post/${activeReel.id}` })
                      }
                    }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    title="শেয়ার করুন"
                  >
                    <Share2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
