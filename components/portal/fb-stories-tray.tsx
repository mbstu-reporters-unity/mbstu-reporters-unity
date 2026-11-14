"use client"

import React, { useState, useEffect, useRef } from "react"
import { Plus, X, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from "lucide-react"
import { getActiveStories, type StoryItem } from "@/lib/stories"

export function FbStoriesTray() {
  const [stories, setStories] = useState<StoryItem[]>([])
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getActiveStories().then(setStories)
  }, [])

  useEffect(() => {
    if (activeStoryIdx === null || isPaused) return

    const interval = 50
    const step = 100 / (5000 / interval)

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx((i) => (i !== null ? i + 1 : null))
            return 0
          } else {
            setActiveStoryIdx(null)
            return 0
          }
        }
        return prev + step
      })
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeStoryIdx, isPaused, stories.length])

  const openStory = (index: number) => {
    setActiveStoryIdx(index)
    setProgress(0)
    setIsPaused(false)
  }

  const currentActiveStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null

  return (
    <div className="w-full my-3">
      <div className="w-full overflow-x-auto py-1 px-3 sm:px-4 scrollbar-none select-none">
        <div className="flex gap-2 sm:gap-2.5 min-w-max">
          
          {/* Create Story বাটন (অ্যাডমিন প্যানেলে নিয়ে যাবে) */}
          <a
            href="/admin"
            className="relative w-[105px] sm:w-[125px] h-[175px] sm:h-[200px] rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-md cursor-pointer flex flex-col justify-between group active:scale-95 transition-all"
          >
            <div className="h-[68%] w-full overflow-hidden bg-slate-800 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <div className="relative h-[32%] bg-slate-950 flex flex-col items-center justify-center p-1">
              <div className="absolute -top-4 size-8 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-white shadow-md">
                <Plus className="size-5" />
              </div>
              <span className="text-[11px] font-bold text-white text-center mt-2 leading-tight">
                Create story
              </span>
            </div>
          </a>

          {/* স্টোরিজ তালিকা */}
          {stories.map((st, idx) => (
            <div
              key={st.id}
              onClick={() => openStory(idx)}
              className="relative w-[105px] sm:w-[125px] h-[175px] sm:h-[200px] rounded-2xl overflow-hidden border border-white/20 shadow-md cursor-pointer group active:scale-95 transition-all"
            >
              {st.media_type === "video" ? (
                <video src={st.media_url} className="size-full object-cover" muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={st.media_url}
                  alt=""
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-2 left-2 size-8 rounded-full p-0.5 bg-blue-600 ring-2 ring-blue-500 overflow-hidden shadow">
                {st.author_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={st.author_avatar} alt="" className="size-full rounded-full object-cover" />
                ) : (
                  <div className="size-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                    {st.author_name.charAt(0)}
                  </div>
                )}
              </div>

              {st.is_highlight && (
                <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <Sparkles className="size-2.5" />
                </span>
              )}

              <div className="absolute bottom-2 inset-x-2">
                <p className="text-[11px] font-bold text-white truncate drop-shadow-md">
                  {st.is_highlight ? st.highlight_title || st.author_name : st.author_name}
                </p>
                {st.caption && (
                  <p className="text-[9px] text-slate-300 truncate">{st.caption}</p>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ফুলস্ক্রিন প্লেয়ার */}
      {currentActiveStory && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center p-0 sm:p-4 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-md bg-slate-950 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
            
            <div className="absolute top-3 inset-x-3 z-30 flex gap-1">
              {stories.map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75"
                    style={{
                      width: i < (activeStoryIdx ?? 0) ? "100%" : i === activeStoryIdx ? `${progress}%` : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{currentActiveStory.author_name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveStoryIdx(null)}
                className="p-1.5 rounded-full bg-black/40 text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative size-full flex items-center justify-center bg-black">
              {currentActiveStory.media_type === "video" ? (
                <video src={currentActiveStory.media_url} autoPlay playsInline controls className="size-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentActiveStory.media_url} alt="" className="size-full object-contain" />
              )}
            </div>

            {currentActiveStory.caption && (
              <div className="absolute bottom-4 inset-x-4 z-30 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs text-center border border-white/10">
                {currentActiveStory.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
