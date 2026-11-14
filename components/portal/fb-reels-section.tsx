"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Play, Film } from "lucide-react"
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

// ভিডিও শনাক্ত ও ইউটিউব থাম্বনেইল বের করার ফাংশন
function detectVideo(rawUrl?: string | null): { isVideo: boolean; url: string; ytId?: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") return null
  const str = rawUrl.trim()
  if (!str) return null

  // JSON চেক (যদি একাধিক মিডিয়া থাকে)
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

  // YouTube চেক
  const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i)
  if (ytMatch && ytMatch[1]?.length === 11) {
    return { isVideo: true, url: str, ytId: ytMatch[1] }
  }

  // Facebook ভিডিও চেক
  if (str.includes("facebook.com") || str.includes("fb.watch")) {
    return { isVideo: true, url: str }
  }

  // ডিরেক্ট MP4 ফাইল
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(str)) {
    return { isVideo: true, url: str }
  }

  return null
}

export function FbReelsSection() {
  const [videoList, setVideoList] = useState<ReelVideoItem[]>([])

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
      {/* রিলস সেকশন হেডার */}
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

      {/* রিলস স্লাইডার: ক্লিকে সরাসরি মূল সংবাদ পেজে নিয়ে যাবে */}
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none select-none">
        {videoList.map((reel) => (
          <Link
            key={reel.id}
            href={`/post/${reel.id}`}
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

            {/* ফেসবুক স্টাইল শ্যাডো ওভারলে */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            {/* প্লে বাটন */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="size-11 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <Play className="size-5 fill-current text-cyan-300 ml-0.5" />
              </span>
            </div>

            {/* টাইটেল ও ক্রিয়েটর ইনফো */}
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
          </Link>
        ))}
      </div>
    </div>
  )
}
