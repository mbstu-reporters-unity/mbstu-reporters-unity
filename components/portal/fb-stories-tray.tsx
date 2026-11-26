"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { X, Play, Pause, Sparkles, ChevronLeft, ChevronRight, ExternalLink, Plus, Eye } from "lucide-react"
import { getActiveStories, type StoryItem } from "@/lib/stories"
import { getMe, type Profile } from "@/lib/sb"
import { useLang } from "@/lib/i18n"
import { useSiteSettings } from "./site-settings-context"

export function FbStoriesTray({
  standalone = false,
  prefetchedStories,
  showHeading = true,
  hideAddStory = false,
  portrait = false,
  newspaper = false,
}: {
  standalone?: boolean
  prefetchedStories?: StoryItem[]
  showHeading?: boolean
  hideAddStory?: boolean
  portrait?: boolean
  newspaper?: boolean
}) {
  const settings = useSiteSettings()
  const { pick } = useLang()
  const [stories, setStories] = useState<StoryItem[]>(prefetchedStories || [])
  const [loaded, setLoaded] = useState(Boolean(prefetchedStories))
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [me, setMe] = useState<Profile | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const storyTrayRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isHoldingRef = useRef(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (prefetchedStories) {
      setStories(prefetchedStories)
      setLoaded(true)
      return
    }

    getActiveStories().then((items) => {
      setStories(items)
      setLoaded(true)
    })

    const t = typeof window !== "undefined" ? localStorage.getItem("mbstu_admin_token") : null
    if (t) {
      getMe(t).then(setMe).catch(() => {})
    }
  }, [prefetchedStories])

  useEffect(() => {
    const handlePopState = () => {
      setActiveStoryIdx(null)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

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

  const nextStory = useCallback(() => {
    if (activeStoryIdx !== null && activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx((prev) => (prev !== null ? prev + 1 : null))
    } else {
      closeStory()
    }
  }, [activeStoryIdx, stories.length, closeStory])

  const prevStory = useCallback(() => {
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      setActiveStoryIdx((prev) => (prev !== null ? prev - 1 : null))
    } else {
      setProgress(0)
    }
  }, [activeStoryIdx])

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return

    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }

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

    if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
      closeStory()
      return
    }

    if (diffX < -40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      nextStory()
      return
    }

    if (diffX > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      prevStory()
      return
    }

    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15 && elapsed < 250) {
      const screenWidth = window.innerWidth
      if (touch.clientX < screenWidth * 0.35) {
        prevStory()
      } else {
        nextStory()
      }
    }
  }

  if (stories.length === 0 && !me && !standalone) return null

  const sec = settings.homeSections.sections.find((s) => s.key === "stories")
  const addStoryLabel = pick(sec?.subtitleBn || "গল্প যোগ করুন", sec?.subtitleEn || "Add a story")
  const currentActiveStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null
  const scrollStories = (direction: -1 | 1) => {
    storyTrayRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" })
  }

  return (
    <div id="stories" className="w-full my-4">
      {!standalone && showHeading && (
        <div className="mx-auto mb-2 flex max-w-7xl items-center justify-between gap-3 px-4">
          <h2 className="font-serif text-base font-bold text-white">
            {pick(sec?.titleBn || 'গল্পসমূহ', sec?.titleEn || 'Stories')}
          </h2>
          <Link href="/stories" className="text-xs font-bold text-cyan-300 hover:underline">
            {pick('সকল গল্প দেখুন', 'View all stories')}
          </Link>
        </div>
      )}
      <div className="relative">
        <div ref={storyTrayRef} className="w-full overflow-x-auto py-1 px-3 sm:px-4 scrollbar-none select-none">
          <div className="flex min-w-max items-center gap-2 sm:gap-2.5">
          {!hideAddStory && <Link
            href="/admin"
            className={`group relative ${portrait ? 'aspect-[9/16] w-[155px] sm:w-[180px]' : 'h-[175px] w-[105px] sm:h-[205px] sm:w-[125px]'} shrink-0 overflow-hidden rounded-2xl border text-center transition-all active:scale-95 ${
              newspaper
                ? "border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-md"
                : "border-white/20 bg-slate-900/90 shadow-lg"
            }`}
          >
            <div className="h-[65%] w-full bg-slate-800 flex items-center justify-center overflow-hidden">
              {me?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.avatar_url} alt="" className="size-full object-cover group-hover:scale-105 transition" />
              ) : (
                <div className="size-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-2xl text-white">
                  {me ? me.full_name.charAt(0) : "M"}
                </div>
              )}
            </div>

            <div className={`relative flex h-[35%] flex-col items-center justify-end px-1 pb-2 ${newspaper ? "bg-[var(--theme-card-bg)]" : "bg-slate-950"}`}>
              <span className={`absolute -top-4 flex size-8 items-center justify-center rounded-full text-white shadow-lg ring-4 transition group-hover:scale-110 ${newspaper ? "bg-sky-600 ring-[var(--theme-card-bg)]" : "bg-blue-600 ring-slate-950"}`}>
                <Plus className="size-5" />
              </span>
              <span className={`text-[10px] font-bold leading-tight ${newspaper ? "text-[var(--theme-text-title)]" : "text-white"}`}>{addStoryLabel}</span>
            </div>
          </Link>}

          {stories.map((st, idx) => (
            <div
              key={st.id}
              onClick={() => openStory(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  openStory(idx)
                }
              }}
              aria-label={st.highlight_title || st.caption || st.author_name}
              className={`group relative ${portrait ? "aspect-[9/16] w-[155px] sm:w-[180px]" : "h-[175px] w-[105px] sm:h-[205px] sm:w-[125px]"} shrink-0 cursor-pointer overflow-hidden rounded-2xl border transition-all active:scale-95 ${
                newspaper
                  ? "border-[var(--theme-card-border)] shadow-md"
                  : "border-white/20 shadow-lg"
              }`}
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

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

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
                <span className={`absolute right-2 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-black shadow ${typeof st.view_count === "number" ? "top-10" : "top-2"}`}>
                  <Sparkles className="size-2.5" />
                </span>
              )}

              {typeof st.view_count === "number" && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-md">
                  <Eye className="size-3" aria-hidden="true" />
                  {st.view_count.toLocaleString("bn-BD")}
                </span>
              )}

              {st.media_type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  <span className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-lg backdrop-blur-md">
                    <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
                  </span>
                </span>
              )}

              <div className="absolute bottom-2.5 inset-x-2">
                <p className="line-clamp-2 text-xs font-bold leading-snug text-white drop-shadow-md sm:text-sm">
                  {st.highlight_title || st.caption || st.author_name}
                </p>
                {(st.highlight_title || st.caption) && (
                  <p className="mt-1 truncate text-[10px] text-white/80">{st.author_name}</p>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
        {newspaper && stories.length > 2 && (
          <>
            <button type="button" onClick={() => scrollStories(-1)} aria-label="আগের ফটো স্টোরি" className="absolute left-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 sm:flex">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollStories(1)} aria-label="পরের ফটো স্টোরি" className="absolute right-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 sm:flex">
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {standalone && (
        <p className={`mx-4 mt-2 rounded-xl border px-4 py-3 text-center text-xs ${newspaper ? "border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)]" : "border-white/15 bg-white/10 text-slate-300"}`} aria-live="polite">
          {!loaded
            ? 'স্টোরি লোড হচ্ছে...'
            : stories.length === 0
              ? 'এখনো কোনো সক্রিয় স্টোরি নেই।'
              : `${stories.length.toLocaleString('bn-BD')}টি স্টোরি`}
        </p>
      )}

      {currentActiveStory && (
        <div
          className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center p-0 sm:p-4 backdrop-blur-xl animate-in fade-in select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-md bg-slate-950 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
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
