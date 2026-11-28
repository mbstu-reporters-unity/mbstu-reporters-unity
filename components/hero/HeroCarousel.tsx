'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { getHeroSlides, getHeroSettings } from '@/lib/hero'
import type { HeroSlide, HeroSettings } from '@/lib/hero'
import { HeroMediaRenderer } from './HeroMediaRenderer'
import { HeroBreakingBanner } from './HeroBreakingBanner'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Layers,
} from 'lucide-react'

// বাংলা সংখ্যা রূপান্তর
const bn = (n: number) => n.toLocaleString('bn-BD')

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isInViewport, setIsInViewport] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const sliderRef = useRef<HTMLElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    Promise.all([getHeroSlides(), getHeroSettings()])
      .then(([slidesData, settingsData]) => {
        const active = (slidesData || []).filter(
          (s) => s.is_active && (!s.expires_at || new Date(s.expires_at) > new Date())
        )
        setSlides(active)
        setSettings(settingsData)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  // মোবাইলে স্লাইডার যেন সবসময় ১টি করে বড় ও পরিষ্কার ভিডিও দেখায়
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // স্ক্রল আউট হলে পজ করা
  useEffect(() => {
    const el = sliderRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.25)
        setIsInViewport(visible)
      },
      { threshold: [0, 0.25, 0.5] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loaded])

  const total = slides.length
  const configuredSplits = settings?.desktop_splits || 1

  const activeSplits = useMemo(() => {
    if (total <= 1) return 1
    if (isMobile) return 1
    return Math.min(configuredSplits, total)
  }, [total, configuredSplits, isMobile])

  const currentSlide = slides[currentIndex] || slides[0] || null
  const duration = currentSlide?.slide_duration || settings?.default_duration || 5000

  const isCurrentVideo =
    currentSlide?.slide_type === 'video' ||
    currentSlide?.media_items?.[0]?.type === 'video'

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total)
  }

  // ভিডিও স্লাইড থাকলে বা ভিডিও চললে অটো-স্লাইড বন্ধ থাকবে
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (
      !isInViewport ||
      isPaused ||
      isHovered ||
      isVideoPlaying ||
      isCurrentVideo ||
      total <= 1 ||
      duration <= 0
    ) {
      return
    }

    timerRef.current = setTimeout(() => {
      nextSlide()
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nextSlide, duration, isPaused, isHovered, isVideoPlaying, isCurrentVideo, isInViewport, total, currentIndex])

  // আঙুলের টাচ সোয়াইপ হ্যান্ডলার
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || total <= 1) return
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY) * 1.1) {
      if (diffX < 0) nextSlide()
      else prevSlide()
    }
  }

  const visibleSlides = useMemo(() => {
    if (total === 0) return []
    const result: HeroSlide[] = []
    for (let i = 0; i < activeSplits; i++) {
      const idx = (currentIndex + i) % total
      result.push(slides[idx])
    }
    return result
  }, [slides, currentIndex, activeSplits, total])

  if (!loaded) return null
  if (total === 0 && !settings?.breaking_on) return null

  const effect0 = visibleSlides[0]?.transition_effect || 'slide-left'
  const effect1 = visibleSlides[1]?.transition_effect || 'slide-left'
  const effect2 = visibleSlides[2]?.transition_effect || 'slide-left'

  return (
    <div id="home" className="hero-daylight-dark-surface w-full flex flex-col bg-slate-950 text-white relative">
      {/* হিরো ব্যানার */}
      <HeroBreakingBanner settings={settings} />

      {/* হিরো স্লাইডার */}
      {total > 0 && (
        <section
          ref={sliderRef}
          aria-label="Hero Slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black border-b border-white/10"
        >
          {/* ================= ১টি SPLIT (মোবাইলে সবসময় ১টি স্লাইড পূর্ণাঙ্গভাবে আসবে) ================= */}
          {activeSplits === 1 && visibleSlides[0] && (
            <div className="relative h-[250px] sm:h-[480px] lg:h-[560px] w-full overflow-hidden bg-slate-900">
              <div key={`${visibleSlides[0].id}_${currentIndex}`} className={`w-full h-full tr_${effect0}`}>
                <HeroMediaRenderer
                  slide={visibleSlides[0]}
                  isActive={isInViewport}
                  isCompact={false}
                  onVideoStateChange={setIsVideoPlaying}
                  onVideoEnd={nextSlide}
                />
              </div>
            </div>
          )}

          {/* ================= ২টি SPLIT (ডেস্কটপে) ================= */}
          {activeSplits === 2 && visibleSlides.length >= 2 && (
            <div className="flex flex-col divide-y divide-white/10 w-full">
              <div className="relative h-[250px] sm:h-[300px] w-full overflow-hidden bg-slate-900">
                <div key={`${visibleSlides[0].id}_0_${currentIndex}`} className={`w-full h-full tr_${effect0}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={isInViewport}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              <div className="relative h-[250px] sm:h-[300px] w-full overflow-hidden bg-slate-900">
                <div key={`${visibleSlides[1].id}_1_${currentIndex}`} className={`w-full h-full tr_${effect1}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[1]}
                    isActive={isInViewport}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= ৩টি SPLIT (ডেস্কটপে) ================= */}
          {activeSplits === 3 && visibleSlides.length >= 3 && (
            <div className="flex flex-col divide-y divide-white/10 w-full">
              <div className="relative h-[260px] sm:h-[320px] w-full overflow-hidden bg-slate-900">
                <div key={`${visibleSlides[0].id}_top_${currentIndex}`} className={`w-full h-full tr_${effect0}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={isInViewport}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-white/10 w-full">
                <div className="relative h-[220px] sm:h-[260px] overflow-hidden bg-slate-900">
                  <div key={`${visibleSlides[1].id}_b1_${currentIndex}`} className={`w-full h-full tr_${effect1}`}>
                    <HeroMediaRenderer
                      slide={visibleSlides[1]}
                      isActive={isInViewport}
                      isCompact={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                </div>

                <div className="relative h-[220px] sm:h-[260px] overflow-hidden bg-slate-900">
                  <div key={`${visibleSlides[2].id}_b2_${currentIndex}`} className={`w-full h-full tr_${effect2}`}>
                    <HeroMediaRenderer
                      slide={visibleSlides[2]}
                      isActive={isInViewport}
                      isCompact={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* স্ক্রিনের দুই পাশে বড় টাচ নেভিগেশন তীর */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="আগের স্লাইড"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex size-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/25 shadow-lg active:scale-95 transition cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="পরের স্লাইড"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex size-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/25 shadow-lg active:scale-95 transition cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          {/* কন্ট্রোল বার (যেখানে পোস্ট কাউন্টার সুন্দরভাবে স্থানান্তরিত হয়েছে) */}
          {total > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/95 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`স্লাইড ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'w-6 bg-cyan-400 shadow-md' : 'w-2 bg-white/30 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1 shadow-xs">
                  <Layers className="size-3 text-yellow-400" />
                  <span>পোস্ট {bn(currentIndex + 1)}/{bn(total)}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? 'চালান' : 'থামান'}
                  className="size-7 sm:size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer border border-white/10 active:scale-95"
                >
                  {isPaused ? <Play className="size-3 text-green-400" /> : <Pause className="size-3 text-yellow-400" />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="আগের স্লাইড"
                  className="size-7 sm:size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer border border-white/10 active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="পরের স্লাইড"
                  className="size-7 sm:size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer border border-white/10 active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* প্রোগ্রেস বার (শুধুমাত্র ছবি বা কালার স্লাইডে চলবে, ভিডিওতে নয়) */}
          {!isPaused && !isHovered && !isVideoPlaying && !isCurrentVideo && isInViewport && total > 1 && duration > 0 && (
            <div className="w-full h-1 bg-white/10 overflow-hidden">
              <div
                key={currentIndex}
                className="h-full bg-cyan-400 origin-left"
                style={{
                  animation: `heroTimer ${duration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default HeroCarousel
