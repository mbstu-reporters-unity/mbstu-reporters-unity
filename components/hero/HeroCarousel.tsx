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

  const effect0 = visibleSlides[0]?.transition_effect || 'slide-left'
  const effect1 = visibleSlides[1]?.transition_effect || 'slide-left'
  const effect2 = visibleSlides[2]?.transition_effect || 'slide-left'

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* হিরো ব্যানার */}
      <HeroBreakingBanner settings={settings} />

      {/* হিরো স্লাইডার */}
      {total > 0 && (
        <section
          aria-label="Hero Slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black border-b border-white/10"
        >
          {/* ================= ১টি SPLIT ================= */}
          {activeSplits === 1 && visibleSlides[0] && (
            <div className="relative h-[440px] sm:h-[500px] lg:h-[560px] w-full overflow-hidden bg-slate-900">
              <div key={`${visibleSlides[0].id}_${currentIndex}`} className={`w-full h-full tr_${effect0}`}>
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

          {/* ================= ২টি SPLIT ================= */}
          {activeSplits === 2 && visibleSlides.length >= 2 && (
            <div className="flex flex-col divide-y divide-white/10 w-full">
              <div className="relative h-[240px] sm:h-[290px] w-full overflow-hidden bg-slate-900">
                <div key={`${visibleSlides[0].id}_0_${currentIndex}`} className={`w-full h-full tr_${effect0}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={true}
                    isCompact={false}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              <div className="relative h-[240px] sm:h-[290px] w-full overflow-hidden bg-slate-900">
                <div key={`${visibleSlides[1].id}_1_${currentIndex}`} className={`w-full h-full tr_${effect1}`}>
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

          {/* ================= ৩টি SPLIT ================= */}
          {activeSplits === 3 && visibleSlides.length >= 3 && (
            <div className="flex flex-col divide-y divide-white/10 w-full">
              <div className="relative h-[260px] sm:h-[310px] w-full overflow-hidden bg-slate-900">
                <div key={`${visibleSlides[0].id}_top_${currentIndex}`} className={`w-full h-full tr_${effect0}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={true}
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
                      isActive={true}
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

          {/* ব্যাজ */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow">
            <Layers className="size-3 text-yellow-400" />
            <span className="text-[11px] text-white font-medium">
              পোস্ট {bn(currentIndex + 1)}/{bn(total)}
            </span>
          </div>

          {/* কন্ট্রোল বার */}
          {total > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-t border-white/10">
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

          {/* প্রোগ্রেস বার */}
          {!isPaused && !isHovered && !isVideoPlaying && total > 1 && duration > 0 && (
            <div className="w-full h-1 bg-white/10 overflow-hidden">
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
