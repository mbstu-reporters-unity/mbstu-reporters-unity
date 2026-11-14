"use client"

import React, { useState, useEffect } from "react"
import { Play, Film, X, Heart, MessageCircle, Share2, Volume2, VolumeX } from "lucide-react"
import { getAllPosts, type Post } from "@/lib/sb"

export interface ReelVideoItem {
  id: string
  title: string
  author: string
  authorAvatar?: string | null
  videoUrl: string
  date: string
  thumbnail?: string
  platform: "youtube" | "facebook" | "direct"
}

// ভিডিও শনাক্ত করার সঠিক ফাংশন
function detectVideo(rawUrl?: string | null): { isVideo: boolean; url: string; platform: "youtube" | "facebook" | "direct"; ytId?: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") return null
  const str = rawUrl.trim()
  if (!str) return null

  // ১. JSON চেক (যদি মাল্টিপল মিডিয়া থাকে)
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

  // ২. YouTube চেক
  const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/))([^?&"'>]+)/i)
  if (ytMatch && ytMatch[1]?.length === 11) {
    return { isVideo: true, url: str, platform: "youtube", ytId: ytMatch[1] }
  }

  // ৩. Facebook ভিডিও চেক
  if (str.includes("facebook.com") || str.includes("fb.watch")) {
    return { isVideo: true, url: str, platform: "facebook" }
  }

  // ৪. ডিরেক্ট ভিডিও ফাইল (.mp4, .webm, .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(str)) {
    return { isVideo: true, url: str, platform: "direct" }
  }

  return null
}

export function FbReelsSection() {
  const [videoList, setVideoList] = useState<ReelVideoItem[]>([])
  const [activeReel, setActiveReel] = useState<ReelVideoItem | null>(null)
  const [liked, setLiked] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    getAllPosts(100).then((posts) => {
      const vids: ReelVideoItem[] = []

      posts.forEach((p) => {
        // প্রথমে সরাসরি video_url চেক, না থাকলে embed_media_url চেক
        let detected = detectVideo(p.video_url)
        if (!detected && p.embed_media_url) {
          detected = detectVideo(p.embed_media_url)
        }

        // কেবল আসল ভিডিও পেলেই রিলসে যোগ হবে
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
            onClick={() => {
              setActiveReel(reel)
              setLiked(false)
            }}
            className="relative w-[130px] sm:w-[155px] h-[220px] sm:h-[260px] rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-lg cursor-pointer shrink-0 group active:scale-95 transition-all"
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

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="size-10 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
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

      {/* ফুলস্ক্রিন ফেসবুক রিলস প্লেয়ার */}
      {activeReel && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-xl animate-in zoom-in-95">
          <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-sm bg-black sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
            
            {/* উপরের কন্ট্রোল বার */}
            <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between text-white">
              <span className="text-xs font-bold bg-red-600/90 px-3 py-1 rounded-full flex items-center gap-1 shadow">
                <Film className="size-3.5" /> Reels
              </span>
              <button
                type="button"
                onClick={() => setActiveReel(null)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* ভিডিও ফ্রেম */}
            <div className="relative size-full flex items-center justify-center bg-black">
              {activeReel.platform === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${detectVideo(activeReel.videoUrl)?.ytId}?autoplay=1&playsinline=1&controls=1`}
                  className="size-full aspect-[9/16] border-0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeReel.platform === "facebook" ? (
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(activeReel.videoUrl)}&show_text=false&autoplay=true`}
                  className="size-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeReel.videoUrl}
                  autoPlay
                  controls={false}
                  playsInline
                  loop
                  muted={isMuted}
                  className="size-full object-cover"
                />
              )}
            </div>

            {/* ডানপাশের লাইক ও শেয়ার বাটন */}
            <div className="absolute right-3 bottom-24 z-40 flex flex-col items-center gap-3 text-white">
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className="flex flex-col items-center gap-1 cursor-pointer active:scale-125 transition"
              >
                <span className={`p-2.5 rounded-full ${liked ? "bg-red-600 text-white" : "bg-black/60 text-white"}`}>
                  <Heart className="size-5 fill-current" />
                </span>
                <span className="text-[10px] font-bold">{liked ? "১" : "০"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: activeReel.title, url: window.location.href })
                  }
                }}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="p-2.5 rounded-full bg-black/60 text-white">
                  <Share2 className="size-5" />
                </span>
                <span className="text-[10px] font-bold">শেয়ার</span>
              </button>
            </div>

            {/* নিচের ক্যাপশন ও ক্রিয়েটর ইনফো (ওভারল্যাপ মুক্ত) */}
            <div className="absolute bottom-5 inset-x-4 pr-16 z-30 space-y-1.5 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 rounded-2xl pointer-events-none">
              <div className="flex items-center gap-2">
                {activeReel.authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeReel.authorAvatar} alt="" className="size-6 rounded-full object-cover border border-white" />
                ) : (
                  <div className="size-6 rounded-full bg-cyan-600 text-[10px] text-white flex items-center justify-center font-bold">
                    {activeReel.author.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-sm leading-tight drop-shadow">{activeReel.author}</span>
              </div>
              <p className="text-xs text-slate-100 line-clamp-2 leading-relaxed drop-shadow">
                {activeReel.title}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
