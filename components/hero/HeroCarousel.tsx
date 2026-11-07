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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  const total = slides.length
  const configuredSplits = settings?.desktop_splits || 1
  
  const activeSplits = useMemo(() => {
    if (total <= 1) return 1
    return Math.min(configuredSplits, total)
  }, [total, configuredSplits])

  const currentSlide = slides[currentIndex] || slides[0] || null
  const duration = currentSlide?.slide_duration || settings?.default_duration || 5000
  const transitionEffect = currentSlide?.transition_effect || settings?.default_transition || 'slide-left'

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

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isPaused || isHovered || isVideoPlaying || total <= 1 || duration <= 0) {
      return
    }

    timerRef.current = setTimeout(() => {
      nextSlide()
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nextSlide, duration, isPaused, isHovered, isVideoPlaying, total, currentIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || total <= 1) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide()
      else prevSlide()
    }
    setTouchStart(null)
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

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      <style>{`
        @keyframes heroTimer { from { width: 0%; } to { width: 100%; } }
        @keyframes tr_slide_left { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tr_fade { from { opacity: 0; } to { opacity: 1; } }

        .tr_slide-left { animation: tr_slide_left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_fade { animation: tr_fade 0.5s ease-in-out forwards; }
      `}</style>

      <HeroBreakingBanner settings={settings} />

      {total > 0 && (
        <section
          aria-label="Hero Slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black p-2 sm:p-4"
        >
          {/* ================= ১টি SPLIT (১০০% প্রস্থ) ================= */}
          {activeSplits === 1 && visibleSlides[0] && (
            <div className="relative h-[440px] sm:h-[500px] lg:h-[560px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
              <div key={`${visibleSlides[0].id}_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                <HeroMediaRenderer
                  slide={visibleSlides[0]}
                  isActive={true}
                  isCompact={false}
                  onVideoStateChange={setIsVideoPlaying}
                  onVideoEnd={nextSlide}
                />
              </div>
            </div>
          )}

          {/* ================= ২টি SPLIT (১ম ১০০%, ২য় ১০০%) ================= */}
          {activeSplits === 2 && visibleSlides.length >= 2 && (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full">
              <div className="relative h-[220px] sm:h-[280px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                <div key={`${visibleSlides[0].id}_0_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={true}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              <div className="relative h-[220px] sm:h-[280px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                <div key={`${visibleSlides[1].id}_1_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[1]}
                    isActive={true}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= ৩টি SPLIT (উপরে ১ম ১০০%, নিচে ২য় ৫০% ও ৩য় ৫০%) ================= */}
          {activeSplits === 3 && visibleSlides.length >= 3 && (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full">
              {/* ১ম split (উপরে বড় ১০০%) */}
              <div className="relative h-[250px] sm:h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                <div key={`${visibleSlides[0].id}_top_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={true}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              {/* নিচে পাশাপাশি ২টি (৫০% + ৫০%): এখানে isCompact={true} দেওয়া হয়েছে */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                <div className="relative h-[210px] sm:h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                  <div key={`${visibleSlides[1].id}_b1_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                    <HeroMediaRenderer
                      slide={visibleSlides[1]}
                      isActive={true}
                      isCompact={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                </div>

                <div className="relative h-[210px] sm:h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                  <div key={`${visibleSlides[2].id}_b2_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                    <HeroMediaRenderer
                      slide={visibleSlides[2]}
                      isActive={true}
                      isCompact={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* পোস্ট সংখ্যা ব্যাজ (উপরে ডানপাশে নিরাপদে) */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow">
            <Layers className="size-3 text-yellow-400" />
            <span className="text-[11px] text-white font-medium">
              পোস্ট {bn(currentIndex + 1)}/{bn(total)}
            </span>
          </div>

          {/* ⭐ নতুন ডেডিকেটেড কন্ট্রোল বার (কার্ডের লেখার বাইরে নিচে আলাদাভাবে) ⭐ */}
          {total > 1 && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 mt-2.5">
              {/* ডট ইন্ডিকেটর */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`স্লাইড ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'w-6 bg-emerald-500 shadow-md' : 'w-2 bg-white/30 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* কন্ট্রোল বোতাম (প্লে/পজ, আগে, পরে) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? 'চালান' : 'থামান'}
                  className="size-7 sm:size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer border border-white/10"
                >
                  {isPaused ? <Play className="size-3 text-green-400" /> : <Pause className="size-3 text-yellow-400" />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="আগের স্লাইড"
                  className="size-7 sm:size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer border border-white/10"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="পরের স্লাইড"
                  className="size-7 sm:size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer border border-white/10"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* টাইমার প্রোগ্রেস বার */}
          {!isPaused && !isHovered && !isVideoPlaying && total > 1 && duration > 0 && (
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                key={currentIndex}
                className="h-full bg-emerald-500 origin-left"
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
