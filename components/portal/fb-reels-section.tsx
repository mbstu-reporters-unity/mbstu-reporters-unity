"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Play, Film, Share2, ExternalLink, ChevronUp, ChevronDown } from "lucide-react"
import { getLiveReels, type ReelItem } from "@/lib/reels"
import { useLang } from "@/lib/i18n"
import { useSiteSettings } from "./site-settings-context"
import { HomepageCompactCarousel } from "./homepage-transition-sections"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i
  )
  return match ? match[1] : null
}

export function FbReelsSection({
  standalone = false,
  compact = false,
}: {
  standalone?: boolean
  compact?: boolean
}) {
  const settings = useSiteSettings()
  const { pick } = useLang()
  const [reels, setReels] = useState<ReelItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    getLiveReels().then((items) => {
      setReels(items)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setCurrentIndex(null)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const openReelAt = (index: number) => {
    setCurrentIndex(index)
    window.history.pushState({ reelOpen: true }, "")
  }

  const closeReel = () => {
    setCurrentIndex(null)
    if (window.history.state?.reelOpen) {
      window.history.back()
    }
  }

  useEffect(() => {
    if (currentIndex !== null && itemRefs.current[currentIndex]) {
      setTimeout(() => {
        itemRefs.current[currentIndex]?.scrollIntoView({ behavior: "instant", block: "start" })
      }, 50)
    }
  }, [currentIndex === null])

  useEffect(() => {
    if (currentIndex === null || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"))
            if (!isNaN(idx)) {
              setCurrentIndex(idx)
            }
          }
        })
      },
      {
        root: containerRef.current,
        threshold: 0.65,
      }
    )

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [currentIndex === null, reels.length])

  const scrollToIndex = (idx: number) => {
    if (idx >= 0 && idx < reels.length) {
      itemRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" })
      setCurrentIndex(idx)
    }
  }

  if (reels.length === 0) {
    if (!standalone) return null
    return (
      <section id="reels-hub" className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="glass-card p-8 text-center text-sm text-slate-300" aria-live="polite">
          {loaded ? pick('এখনো কোনো ভিডিও প্রকাশিত হয়নি।', 'No videos have been published yet.') : pick('ভিডিও লোড হচ্ছে…', 'Loading videos…')}
        </div>
      </section>
    )
  }

  const sec = settings.homeSections.sections.find((s) => s.key === "reels")
  const headingText = pick(sec?.titleBn || "ভিডিও গ্যালারি", sec?.titleEn || "Video Gallery")
  const badgeText = sec?.eyebrow || "LIVE"

  const compactContent = (
      <section className="my-8 border-b border-white/10 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Film className="size-5 shrink-0 text-rose-500" aria-hidden="true" />
              <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                {headingText}
                {badgeText && (
                  <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 align-middle text-[10px] font-bold text-white">
                    {badgeText}
                  </span>
                )}
              </h2>
            </div>
            <Link href="/reels" className="shrink-0 text-xs font-bold text-cyan-300 hover:underline">
              {pick('সকল ভিডিও দেখুন', 'View all videos')}
            </Link>
          </div>
          <HomepageCompactCarousel
            title={headingText}
            interval={7500}
            className="max-w-none"
            slides={reels.map((reel, idx) => {
              const ytId = extractYouTubeId(reel.video_url)
              const thumb =
                reel.thumbnail_url ||
                (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)

              return (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => openReelAt(idx)}
                  aria-label={pick(`ভিডিও চালান: ${reel.title}`, `Play video: ${reel.title}`)}
                  className="glass-card group grid w-full overflow-hidden text-left text-white sm:grid-cols-[minmax(0,0.9fr)_1fr]"
                >
                  <div className="relative aspect-video min-h-40 bg-slate-950 sm:aspect-auto sm:min-h-56">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full min-h-40 items-center justify-center">
                        <Film className="size-10 text-white/40" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white">
                      <Play className="ml-0.5 size-5 fill-current text-cyan-300" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-col justify-center gap-3 p-4 sm:p-6">
                    <span className="text-xs font-bold uppercase tracking-wide text-cyan-300">
                      {badgeText}
                    </span>
                    <h3 className="font-serif text-base font-bold leading-snug sm:text-xl">
                      {reel.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      {reel.author_avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={reel.author_avatar}
                          alt=""
                          className="size-7 rounded-full border border-white/30 object-cover"
                        />
                      ) : (
                        <span className="flex size-7 items-center justify-center rounded-full bg-cyan-700 font-bold text-white">
                          {reel.author_name.charAt(0)}
                        </span>
                      )}
                      <span>{reel.author_name}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          />
        </div>
      </section>
  )

  return (
    <div id="reels-hub" className={`w-full my-6 ${compact ? '' : 'space-y-3'}`}>
      {compact ? compactContent : (
        <>
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Film className="size-5 text-rose-500" />
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <span>{headingText}</span>
            {badgeText && (
              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                {badgeText}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {!standalone && (
            <Link href="/reels" className="text-xs font-bold text-cyan-300 hover:underline">
              {compact ? pick('সকল ভিডিও দেখুন', 'View all videos') : pick('সকল ভিডিও', 'All videos')}
            </Link>
          )}
          <span className="text-xs text-cyan-300 font-semibold">{reels.length} {pick('টি ভিডিও', reels.length === 1 ? 'video' : 'videos')}</span>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none select-none">
        {reels.map((reel, idx) => {
          const ytId = extractYouTubeId(reel.video_url)
          const thumb = reel.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)

          return (
            <div
              key={reel.id}
              onClick={() => openReelAt(idx)}
              className="relative w-[135px] sm:w-[160px] h-[225px] sm:h-[265px] rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-lg shrink-0 group active:scale-95 transition-all block cursor-pointer"
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
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
                  {reel.author_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reel.author_avatar} alt="" className="size-4 rounded-full object-cover border border-white/50" />
                  ) : (
                    <div className="size-4 rounded-full bg-cyan-600 text-[9px] text-white flex items-center justify-center font-bold">
                      {reel.author_name.charAt(0)}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-300 truncate">{reel.author_name}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
        </>
      )}

      {currentIndex !== null && (
        <div className="fixed inset-0 z-[999999] bg-black text-white select-none">
          <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={closeReel}
              className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/25 backdrop-blur-md cursor-pointer pointer-events-auto active:scale-95 transition"
            >
              {pick('✕ বন্ধ করুন', '✕ Close')}
            </button>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="text-xs font-bold bg-red-600 px-3 py-1 rounded-full shadow">Reels</span>
              <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                {currentIndex + 1} / {reels.length}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => scrollToIndex(currentIndex - 1)}
              className="p-3 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 text-white disabled:opacity-20 cursor-pointer shadow-xl transition"
              title={pick('পূর্ববর্তী ভিডিও', 'Previous video')}
            >
              <ChevronUp className="size-5" />
            </button>
            <button
              type="button"
              disabled={currentIndex >= reels.length - 1}
              onClick={() => scrollToIndex(currentIndex + 1)}
              className="p-3 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 text-white disabled:opacity-20 cursor-pointer shadow-xl transition"
              title={pick('পরবর্তী ভিডিও', 'Next video')}
            >
              <ChevronDown className="size-5" />
            </button>
          </div>

          <div
            ref={containerRef}
            className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reels.map((reel, idx) => {
              const isActive = idx === currentIndex
              const isNearby = Math.abs((currentIndex ?? 0) - idx) <= 1
              const ytId = extractYouTubeId(reel.video_url)

              return (
                <div
                  key={reel.id}
                  data-index={idx}
                  ref={(el) => { itemRefs.current[idx] = el }}
                  className="w-full h-[100dvh] snap-start snap-always relative flex flex-col justify-between overflow-hidden bg-black"
                >
                  <div className="relative w-full flex-1 flex items-center justify-center bg-black my-auto">
                    {isActive ? (
                      ytId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1`}
                          className="w-full aspect-video max-h-[85vh] border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      ) : reel.video_url.includes("facebook.com") ? (
                        <iframe
                          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(reel.video_url)}&show_text=false&autoplay=true`}
                          className="w-full aspect-video max-h-[85vh] border-0"
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={reel.video_url}
                          controls
                          autoPlay
                          playsInline
                          loop
                          className="w-full max-h-[85vh] object-contain"
                        />
                      )
                    ) : isNearby && reel.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reel.thumbnail_url}
                        alt=""
                        className="w-full max-h-[85vh] object-contain opacity-50"
                      />
                    ) : (
                      <div className="size-full bg-black" />
                    )}
                  </div>

                  <div className="p-4 pb-6 bg-gradient-to-t from-black via-slate-950/80 to-transparent space-y-2 z-20">
                    <p className="font-serif text-sm sm:text-base font-bold text-white drop-shadow">
                      {reel.title}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-2">
                      <div className="flex items-center gap-2">
                        {reel.author_avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={reel.author_avatar} alt="" className="size-5 rounded-full object-cover border border-cyan-400" />
                        ) : (
                          <div className="size-5 rounded-full bg-cyan-600 text-[10px] text-white flex items-center justify-center font-bold">
                            {reel.author_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-white">{reel.author_name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {reel.link_url && (
                          <a
                            href={reel.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-300 font-bold hover:underline"
                          >
                            <span>{pick('সংবাদ প্রতিবেদন', 'News report')}</span>
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: reel.title,
                                url: reel.link_url || reel.video_url,
                              })
                            }
                          }}
                          className="inline-flex items-center gap-1 text-white hover:text-cyan-300 cursor-pointer"
                        >
                          <Share2 className="size-3.5" />
                          <span>{pick('শেয়ার করুন', 'Share')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
