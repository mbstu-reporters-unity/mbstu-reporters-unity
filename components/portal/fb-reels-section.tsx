"use client"

import React, { useState, useEffect } from "react"
import { Play, Flame, Film, X, Heart, MessageCircle, Share2, Volume2, VolumeX } from "lucide-react"
import { getAllPosts, type Post } from "@/lib/sb"

export interface ReelVideoItem {
  id: string
  title: string
  author: string
  authorAvatar?: string | null
  videoUrl: string
  date: string
  likes?: number
}

export function FbReelsSection() {
  const [videoList, setVideoList] = useState<ReelVideoItem[]>([])
  const [activeReel, setActiveReel] = useState<ReelVideoItem | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // সব পোস্ট থেকে ভিডিও ফিল্টার করে রিলস হিসেবে নেওয়া
    getAllPosts(100).then((posts) => {
      const vids: ReelVideoItem[] = []
      posts.forEach((p) => {
        if (p.video_url) {
          vids.push({
            id: p.id,
            title: p.title,
            author: p.author || "ক্যাম্পাস সাংবাদিক",
            authorAvatar: p.author_avatar,
            videoUrl: p.video_url,
            date: new Date(p.created_at).toLocaleDateString("bn-BD"),
          })
        }
      })
      setVideoList(vids)
    })
  }, [])

  if (videoList.length === 0) return null

  return (
    <div className="w-full my-6 space-y-3">
      {/* ফেসবুক রিলস হেডার */}
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

      {/* রিলস স্লাইডার (হুবহু স্ক্রিনশট ৩ এবং ৫ এর মতো ৯:১৬ কার্ড) */}
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
            <video
              src={reel.videoUrl}
              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              muted
              playsInline
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="size-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
                <Play className="size-5 fill-current text-cyan-300 ml-0.5" />
              </span>
            </div>

            {/* ক্রিয়েটরের তথ্য */}
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

      {/* পূর্ণাঙ্গ ফেসবুক রিলস ভিডিও প্লেয়ার ডায়ালগ */}
      {activeReel && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-xl animate-in zoom-in-95">
          <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-sm bg-black sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
            
            {/* উপরের কন্ট্রোল */}
            <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-red-600/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Flame className="size-3" /> Reel
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 text-white"
                >
                  {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReel(null)}
                  className="p-2 rounded-full bg-black/50 text-white"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* ভিডিও প্লেয়ার */}
            <div className="relative size-full flex items-center justify-center bg-black">
              <video
                src={activeReel.videoUrl}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                controls={false}
                className="size-full object-cover"
              />
            </div>

            {/* ডানপাশের লাইক, কমেন্ট ও শেয়ার বাটন (হুবহু ফেসবুক রিলস এর মতো) */}
            <div className="absolute right-3 bottom-16 z-30 flex flex-col items-center gap-4 text-white">
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className="flex flex-col items-center gap-1 cursor-pointer active:scale-125 transition"
              >
                <span className={`p-2.5 rounded-full ${liked ? "bg-red-600 text-white" : "bg-black/50 text-white"}`}>
                  <Heart className="size-5 fill-current" />
                </span>
                <span className="text-[10px] font-bold">{liked ? "1" : "0"}</span>
              </button>

              <button type="button" className="flex flex-col items-center gap-1 cursor-pointer">
                <span className="p-2.5 rounded-full bg-black/50 text-white">
                  <MessageCircle className="size-5" />
                </span>
                <span className="text-[10px] font-bold">কমেন্ট</span>
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
                <span className="p-2.5 rounded-full bg-black/50 text-white">
                  <Share2 className="size-5" />
                </span>
                <span className="text-[10px] font-bold">শেয়ার</span>
              </button>
            </div>

            {/* নিচের ক্যাপশন ও অডিও তথ্য */}
            <div className="absolute bottom-4 left-4 right-16 z-30 space-y-1.5 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm leading-tight drop-shadow">{activeReel.author}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">অনুসরণ</span>
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
