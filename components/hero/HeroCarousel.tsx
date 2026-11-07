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
  
  // একক শিফটিং ইনডেক্স (ধারাবাহিক সাইক্লিং)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // ডেটাবেজ থেকে স্লাইড ও সেটিংস লোড
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
  
  // স্মার্ট ফলব্যাক: পোস্ট সংখ্যা কম হলে নিজে থেকেই মানিয়ে নেওয়া
  const activeSplits = useMemo(() => {
    if (total <= 1) return 1
    return Math.min(configuredSplits, total)
  }, [total, configuredSplits])

  // বর্তমান স্লাইডের সময়কাল ও ট্রানজিশন
  const currentSlide = slides[currentIndex] || slides[0] || null
  const duration = currentSlide?.slide_duration || settings?.default_duration || 5000
  const transitionEffect = currentSlide?.transition_effect || settings?.default_transition || 'slide-left'

  // পরবর্তী স্লাইডে যাওয়ার মেথড
  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  // আগের স্লাইডে যাওয়ার মেথড
  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // নির্দিষ্ট স্লাইডে যাওয়া
  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total)
  }

  // স্বয়ংক্রিয় টাইমার লজিক (ভিডিও চলাকালে বা কার্সার রাখলে থামবে)
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

  // মোবাইলে টাচ সোয়াইপ
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

  // আপনার আঁকা নকশা অনুযায়ী দৃশ্যমান স্লাইডগুলো সাজানো
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
      {/* স্মুথ অ্যানিমেশনের স্টাইল */}
      <style>{`
        @keyframes heroTimer { from { width: 0%; } to { width: 100%; } }
        @keyframes tr_slide_left { from { transform: translateX(25px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tr_fade { from { opacity: 0; } to { opacity: 1; } }

        .tr_slide-left { animation: tr_slide_left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_fade { animation: tr_fade 0.6s ease-in-out forwards; }
      `}</style>

      {/* ব্রেকিং ব্যানার */}
      <HeroBreakingBanner settings={settings} />

      {/* স্লাইডার কন্টেইনার */}
      {total > 0 && (
        <section
          aria-label="Hero Slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black p-2 sm:p-4"
        >
          {/* ================= ১টি SPLIT হলে (চিত্র অনুযায়ী ১০০% প্রস্থ) ================= */}
          {activeSplits === 1 && visibleSlides[0] && (
            <div className="relative h-[480px] sm:h-[540px] lg:h-[600px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
              <div key={`${visibleSlides[0].id}_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                <HeroMediaRenderer
                  slide={visibleSlides[0]}
                  isActive={true}
                  onVideoStateChange={setIsVideoPlaying}
                  onVideoEnd={nextSlide}
                />
              </div>
            </div>
          )}

          {/* ================= ২টি SPLIT হলে (চিত্র অনুযায়ী ১ম split ১০০%, ২য় split ১০০%) ================= */}
          {activeSplits === 2 && visibleSlides.length >= 2 && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {/* ১ম split (১০০%) */}
              <div className="relative h-[240px] sm:h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                <div key={`${visibleSlides[0].id}_0_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={true}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              {/* ২য় split (১০০%) */}
              <div className="relative h-[240px] sm:h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                <div key={`${visibleSlides[1].id}_1_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[1]}
                    isActive={true}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= ৩টি SPLIT হলে (চিত্র অনুযায়ী ১ম split ১০০%, নিচে ২য় split ৫০% ও ৩য় split ৫০%) ================= */}
          {activeSplits === 3 && visibleSlides.length >= 3 && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {/* ১ম split (উপরে ১০০%) */}
              <div className="relative h-[260px] sm:h-[320px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                <div key={`${visibleSlides[0].id}_top_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                  <HeroMediaRenderer
                    slide={visibleSlides[0]}
                    isActive={true}
                    onVideoStateChange={setIsVideoPlaying}
                    onVideoEnd={nextSlide}
                  />
                </div>
              </div>

              {/* নিচে পাশাপাশি ২টি: ২য় split (৫০%) এবং ৩য় split (৫০%) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                {/* ২য় split (৫০%) */}
                <div className="relative h-[210px] sm:h-[270px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                  <div key={`${visibleSlides[1].id}_b1_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                    <HeroMediaRenderer
                      slide={visibleSlides[1]}
                      isActive={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                </div>

                {/* ৩য় split (৫০%) */}
                <div className="relative h-[210px] sm:h-[270px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                  <div key={`${visibleSlides[2].id}_b2_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                    <HeroMediaRenderer
                      slide={visibleSlides[2]}
                      isActive={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ব্যাজ: বর্তমান পোস্টের ক্রম */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow">
            <Layers className="size-3.5 text-yellow-400" />
            <span className="text-xs text-white font-medium">
              পোস্ট {bn(currentIndex + 1)}/{bn(total)}
            </span>
          </div>

          {/* কন্ট্রোল বোতাম (প্লে/পজ, আগে, পরে) */}
          {total > 1 && (
            <div className="absolute bottom-5 right-6 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'চালান' : 'থামান'}
                className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                {isPaused ? <Play className="size-4 text-green-400" /> : <Pause className="size-4 text-yellow-400" />}
              </button>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="আগের স্লাইড"
                className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="পরের স্লাইড"
                className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}

          {/* ডট ইন্ডিকেটর */}
          {total > 1 && (
            <div className="absolute bottom-5 left-6 z-30 flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`স্লাইড ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-8 bg-emerald-500 shadow' : 'w-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* প্রোগ্রেস বার */}
          {!isPaused && !isHovered && !isVideoPlaying && total > 1 && duration > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30 pointer-events-none">
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
