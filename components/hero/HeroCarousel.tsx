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
  
  // একক শিফটিং সূচক (Rolls 1 by 1 endlessly without freezing)
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
  
  // স্মার্ট ফলব্যাক: যদি পোস্টের সংখ্যা কনফিগার করা স্প্লিটের চেয়ে কম হয়
  const activeSplits = useMemo(() => {
    if (total <= 1) return 1
    return Math.min(configuredSplits, total)
  }, [total, configuredSplits])

  const isMultiSplit = activeSplits > 1

  // বর্তমান স্লাইডের সময়কাল (Duration)
  const currentSlide = slides[currentIndex] || slides[0] || null
  const duration = currentSlide?.slide_duration || settings?.default_duration || 5000
  const transitionEffect = currentSlide?.transition_effect || settings?.default_transition || 'slide-left'

  // পরবর্তী স্লাইডে যাওয়ার লজিক (১ ঘর করে শিফট হবে, কখনো ফ্রিজ হবে না)
  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  // আগের স্লাইডে যাওয়ার লজিক
  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // নির্দিষ্ট স্লাইডে যাওয়া
  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total)
  }

  // স্বয়ংক্রিয় টাইমার লজিক (ভিডিও চলাকালে বা কার্সার রাখলে বন্ধ থাকবে)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    // যদি পজ করা থাকে, মাউস হোভার থাকে, ভিডিও চলে বা ১টি মাত্র পোস্ট থাকে তবে টাইমার ঘুরবে না
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

  // টাচ সোয়াইপ নিয়ন্ত্রণ (মোবাইলের জন্য)
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

  // রোলিং উইন্ডো: কোনো ডুপ্লিকেট ছাড়া ধারাবাহিক স্লাইড তৈরি
  const visibleSplitSlides = useMemo(() => {
    if (!isMultiSplit || total === 0) return []
    const result: Array<{ slide: HeroSlide; originalIndex: number }> = []
    for (let i = 0; i < activeSplits; i++) {
      const idx = (currentIndex + i) % total
      result.push({ slide: slides[idx], originalIndex: idx })
    }
    return result
  }, [slides, isMultiSplit, currentIndex, activeSplits, total])

  if (!loaded) return null
  if (total === 0 && !settings?.breaking_on) return null

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* ট্রানজিশন এবং অ্যানিমেশনের স্টাইল */}
      <style>{`
        @keyframes heroTimer { from { width: 0%; } to { width: 100%; } }

        @keyframes tr_slide_left { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tr_slide_right { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tr_fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tr_zoom_in { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .tr_slide-left { animation: tr_slide_left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_slide-right { animation: tr_slide_right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_fade { animation: tr_fade 0.7s ease-in-out forwards; }
        .tr_zoom-in { animation: tr_zoom_in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        .anim_fade-up { animation: anim_fade-up 0.7s ease-out forwards; }
      `}</style>

      {/* ব্রেকিং নিউজ ব্যানার (অক্ষত রাখা হয়েছে) */}
      <HeroBreakingBanner settings={settings} />

      {/* স্লাইডার এরিয়া */}
      {total > 0 && (
        <section
          aria-label="Hero Slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black"
        >
          {/* ================= ১. ডেস্কটপ স্প্লিট ভিউ (২ বা ৩ স্প্লিট) ================= */}
          {isMultiSplit ? (
            <div className="hidden md:block w-full p-2.5 sm:p-4 bg-slate-950">
              <div
                className={`grid grid-cols-1 ${
                  activeSplits === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-3 sm:gap-4`}
              >
                {visibleSplitSlides.map(({ slide, originalIndex }) => (
                  <div
                    key={`${slide.id}_${originalIndex}`}
                    className={`relative h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900 tr_${transitionEffect}`}
                  >
                    <HeroMediaRenderer
                      slide={slide}
                      isActive={true}
                      onVideoStateChange={setIsVideoPlaying}
                      onVideoEnd={nextSlide}
                    />
                  </div>
                ))}
              </div>

              {/* নিচের ডট ইন্ডিকেটর (সবগুলো পোস্টের অবস্থান দেখতে) */}
              {total > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`স্লাইড ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'w-8 bg-emerald-500 shadow-md'
                          : 'w-2 bg-white/30 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* ================= ২. মোবাইল স্ক্রিন অথবা ১ স্প্লিট ভিউ ================= */}
          <div className={`${isMultiSplit ? 'md:hidden' : ''} relative h-[480px] sm:h-[540px] lg:h-[600px] w-full`}>
            {currentSlide && (
              <div key={`${currentSlide.id}_${currentIndex}`} className={`w-full h-full tr_${transitionEffect}`}>
                <HeroMediaRenderer
                  slide={currentSlide}
                  isActive={true}
                  onVideoStateChange={setIsVideoPlaying}
                  onVideoEnd={nextSlide}
                />
              </div>
            )}

            {/* স্লাইড সংখ্যা ব্যাজ */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow">
              <Layers className="size-3.5 text-yellow-400" />
              <span className="text-xs text-white font-medium">
                পোস্ট {bn(currentIndex + 1)}/{bn(total)}
              </span>
            </div>

            {/* মোবাইল ডট ইন্ডিকেটর */}
            {total > 1 && (
              <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5">
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
          </div>

          {/* ================= ৩. সার্বজনীন প্লে/পজ এবং নেক্সট/প্রিভিয়াস কন্ট্রোল ================= */}
          {total > 1 && (
            <div className="absolute bottom-5 right-6 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে বন্ধ করুন'}
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

          {/* টাইমার প্রোগ্রেস বার (ভিডিও চলাকালে বা হোভারে থেমে থাকবে) */}
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
