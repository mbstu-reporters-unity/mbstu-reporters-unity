"use client"

import React, { useState, useEffect } from "react"
import { Play, Film, X, Heart, MessageCircle, Share2, Volume2, VolumeX } from "lucide-react"
import { getAllPosts } from "@/lib/sb"

export interface ReelVideoItem {
  id: string
  title: string
  author: string
  authorAvatar?: string | null
  videoUrl: string
  date: string
  thumbnail?: string
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^?&"'>]+)/)
  return match ? match[5] : null
}

export function FbReelsSection() {
  const [videoList, setVideoList] = useState<ReelVideoItem[]>([])
  const [activeReel, setActiveReel] = useState<ReelVideoItem | null>(null)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    getAllPosts(100).then((posts) => {
      const vids: ReelVideoItem[] = []
      posts.forEach((p) => {
        const rawUrl = p.video_url || (p.embed_media_url && p.embed_media_url.includes("http") ? p.embed_media_url : null)
        if (rawUrl) {
          const ytId = extractYouTubeId(rawUrl)
          const thumb = ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : p.image_url || undefined

          vids.push({
            id: p.id,
            title: p.title,
            author: p.author || "ক্যাম্পাস সাংবাদিক",
            authorAvatar: p.author_avatar,
            videoUrl: rawUrl,
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

      {/* অনুভূমিক রিলস কার্ড স্লাইডার */}
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
              <img src={reel.thumbnail} alt="" className="size-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <video src={reel.videoUrl} className="size-full object-cover" muted />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="size-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
                <Play className="size-5 fill-current text-cyan-300 ml-0.5" />
              </span>
            </div>

            <div className="absolute bottom-2.5 inset-x-2.5 space-y-1">
              <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                {reel.title}
              </p>
              <p className="text-[9px] text-slate-300 truncate">{reel.author}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ফুলস্ক্রিন রিলস প্লেয়ার */}
      {activeReel && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-xl animate-in zoom-in-95">
          <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-sm bg-black sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
            
            <div className="absolute top-4 right-4 z-30">
              <button
                type="button"
                onClick={() => setActiveReel(null)}
                className="p-2 rounded-full bg-black/50 text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative size-full flex items-center justify-center bg-black">
              {activeReel.videoUrl.includes("youtube") || activeReel.videoUrl.includes("youtu.be") ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(activeReel.videoUrl)}?autoplay=1&controls=1`}
                  className="size-full aspect-[9/16] border-0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeReel.videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="size-full object-contain"
                />
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-16 z-30 space-y-1 text-white pointer-events-none">
              <p className="font-bold text-sm leading-tight drop-shadow">{activeReel.author}</p>
              <p className="text-xs text-slate-100 line-clamp-2 drop-shadow">{activeReel.title}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
