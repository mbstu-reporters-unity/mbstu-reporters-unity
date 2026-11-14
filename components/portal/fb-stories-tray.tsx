"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { X, Play, Pause, Sparkles, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { getActiveStories, type StoryItem } from "@/lib/stories"

export function FbStoriesTray() {
  const [stories, setStories] = useState<StoryItem[]>([])
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isHoldingRef = useRef(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getActiveStories().then(setStories)
  }, [])

  // মোবাইলের ব্যাক বাটন চাপলে সোজা স্টোরি বন্ধ হওয়া
  useEffect(() => {
    const handlePopState = () => {
      setActiveStoryIdx(null)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // স্টোরি পরিবর্তন হলে প্রোগ্রেস বার রিসেট
  useEffect(() => {
    setProgress(0)
  }, [activeStoryIdx])

  const closeStory = useCallback(() => {
    setActiveStoryIdx(null)
    setIsPaused(false)
    if (window.history.state?.storyOpen) {
      window.history.back()
    }
  }, [])

  // পরবর্তী স্টোরিতে যাওয়া
  const nextStory = useCallback(() => {
    if (activeStoryIdx !== null && activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx((prev) => (prev !== null ? prev + 1 : null))
    } else {
      closeStory()
    }
  }, [activeStoryIdx, stories.length, closeStory])

  // আগের স্টোরিতে যাওয়া
  const prevStory = useCallback(() => {
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      setActiveStoryIdx((prev) => (prev !== null ? prev - 1 : null))
    } else {
      setProgress(0) // ১ম স্টোরিতে থাকলে রিস্টার্ট হবে
    }
  }, [activeStoryIdx])

  // স্বয়ংক্রিয় ৫ সেকেন্ড টাইমার লজিক
  useEffect(() => {
    if (activeStoryIdx === null || isPaused) return

    const interval = 50
    const step = 100 / (5000 / interval)

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory()
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeStoryIdx, isPaused, nextStory])

  const openStory = (index: number) => {
    setActiveStoryIdx(index)
    setProgress(0)
    setIsPaused(false)
    window.history.pushState({ storyOpen: true }, "")
  }

  // ================= টাচ ও সোয়াইপ হ্যান্ডলার =================
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return

    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }

    // আঙুল দিয়ে চেপে ধরে রাখলে ফেসবুকের মতো স্টোরি ও টাইমার পজ হবে
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true
      setIsPaused(true)
    }, 180)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    if (isHoldingRef.current) {
      isHoldingRef.current = false
      setIsPaused(false)
    }

    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const diffX = touch.clientX - touchStartRef.current.x
    const diffY = touch.clientY - touchStartRef.current.y
    const elapsed = Date.now() - touchStartRef.current.time
    touchStartRef.current = null

    // ১. নিচে সোয়াইপ করলে স্টোরি বন্ধ হবে
    if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
      closeStory()
      return
    }

    // ২. আঙুল দিয়ে বামে টানলে (Swipe Left) -> পরের স্টোরি
    if (diffX < -40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      nextStory()
      return
    }

    // ৩. আঙুল দিয়ে ডানে টানলে (Swipe Right) -> আগের স্টোরি
    if (diffX > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      prevStory()
      return
    }

    // ৪. দ্রুত ট্যাপ (Quick Tap): স্ক্রিনের বাম পাশে ট্যাপ করলে আগেরটা, ডান পাশে ট্যাপ করলে পরেরটা
    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15 && elapsed < 250) {
      const screenWidth = window.innerWidth
      if (touch.clientX < screenWidth * 0.35) {
        prevStory()
      } else {
        nextStory()
      }
    }
  }

  if (stories.length === 0) return null

  const currentActiveStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null

  return (
    <div className="w-full my-3">
      {/* হোমপেজের অনুভূমিক স্টোরি ট্রে */}
      <div className="w-full overflow-x-auto py-1 px-3 sm:px-4 scrollbar-none select-none">
        <div className="flex gap-2 sm:gap-2.5 min-w-max">
          {stories.map((st, idx) => (
            <div
              key={st.id}
              onClick={() => openStory(idx)}
              className="relative w-[110px] sm:w-[130px] h-[180px] sm:h-[210px] rounded-2xl overflow-hidden border border-white/20 shadow-lg cursor-pointer group active:scale-95 transition-all"
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

              <div className="absolute top-2 left-2 size-8 rounded-full p-0.5 bg-blue-600 ring-2 ring-white/60 overflow-hidden shadow">
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
                <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow">
                  <Sparkles className="size-2.5" />
                </span>
              )}

              <div className="absolute bottom-2.5 inset-x-2">
                <p className="text-[11px] font-bold text-white truncate drop-shadow-md">
                  {st.is_highlight ? st.highlight_title || st.author_name : st.author_name}
                </p>
                {st.caption && (
                  <p className="text-[9px] text-slate-300 truncate mt-0.5">{st.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ফুলস্ক্রিন সোয়াইপ-সক্ষম স্টোরি ভিউয়ার */}
      {currentActiveStory && (
        <div
          className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center p-0 sm:p-4 backdrop-blur-xl animate-in fade-in select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-md bg-slate-950 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
            
            {/* ড্যাশবোর্ড প্রোগ্রেস বার */}
            <div className="absolute top-3 inset-x-3 z-30 flex gap-1 pointer-events-none">
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

            {/* হেডার: নাম, প্লে/পজ ও ক্লোজ বাটন */}
            <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full overflow-hidden bg-blue-600 ring-1 ring-white">
                  {currentActiveStory.author_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentActiveStory.author_avatar} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-xs font-bold">
                      {currentActiveStory.author_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold drop-shadow leading-tight">{currentActiveStory.author_name}</p>
                  <p className="text-[10px] text-slate-300">
                    {activeStoryIdx! + 1} of {stories.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPaused(!isPaused)
                  }}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                  title={isPaused ? "চালান" : "থামান"}
                >
                  {isPaused ? <Play className="size-4 text-emerald-400" /> : <Pause className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeStory()
                  }}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* কম্পিউটার/ট্যাবলেটের জন্য দুই পাশের তীর বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prevStory()
              }}
              disabled={activeStoryIdx === 0}
              className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center backdrop-blur disabled:opacity-20 cursor-pointer transition shadow-xl"
              title="আগের স্টোরি"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                nextStory()
              }}
              className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center backdrop-blur cursor-pointer transition shadow-xl"
              title="পরবর্তী স্টোরি"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* মূল মিডিয়া (ছবি বা ভিডিও) */}
            <div className="relative size-full flex items-center justify-center bg-black">
              {currentActiveStory.media_type === "video" ? (
                <video
                  src={currentActiveStory.media_url}
                  autoPlay
                  playsInline
                  controls
                  className="size-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentActiveStory.media_url}
                  alt=""
                  className="size-full object-contain select-none pointer-events-none"
                />
              )}
            </div>

            {/* ক্যাপশন ও ঐচ্ছিক লিংক */}
            {(currentActiveStory.caption || currentActiveStory.link_url) && (
              <div className="absolute bottom-5 inset-x-4 z-30 p-3 rounded-2xl bg-black/75 backdrop-blur-md text-white text-xs text-center border border-white/10 space-y-1.5">
                {currentActiveStory.caption && <p>{currentActiveStory.caption}</p>}
                {currentActiveStory.link_url && (
                  <a
                    href={currentActiveStory.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-[11px] hover:bg-slate-100 transition shadow"
                  >
                    <span>বিস্তারিত দেখুন</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
