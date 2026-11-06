'use client'

import React, { useEffect, useState } from 'react'
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
  ExternalLink,
} from 'lucide-react'

// বাংলা সংখ্যা রূপান্তর
const bn = (n: number) => n.toLocaleString('bn-BD')

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  // ডেটা লোড করা
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
  const currentSlide = slides[currentIdx] || null

  // স্লাইডার সময়কাল নিয়ন্ত্রণ (০ থেকে ১০০ সেকেন্ড)
  const duration = currentSlide?.slide_duration || settings?.default_duration || 5000

  // পরবর্তী ও আগের স্লাইড
  const nextSlide = React.useCallback(() => {
    if (total <= 1) return
    setCurrentIdx((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = React.useCallback(() => {
    if (total <= 1) return
    setCurrentIdx((prev) => (prev - 1 + total) % total)
  }, [total])

  // স্বয়ংক্রিয় টাইমার লজিক
  useEffect(() => {
    if (isPaused || total <= 1 || duration <= 0) return
    const timer = setTimeout(() => {
      nextSlide()
    }, duration)
    return () => clearTimeout(timer)
  }, [nextSlide, duration, isPaused, total, currentIdx])

  // টাচ সোয়াইপ হ্যান্ডলার (মোবাইলে সহজে স্লাইড করতে)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || total <= 1) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextSlide()
      else prevSlide()
    }
    setTouchStart(null)
  }

  if (!loaded) return null
  if (total === 0 && !settings?.breaking_on) return null

  // স্প্লিট ভিউ কাউন্ট (১, ২ বা ৩ স্প্লিট)
  const splitCount = settings?.desktop_splits || 1
  const showSplit = splitCount > 1 && total >= splitCount

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* ৩৫টি অ্যানিমেশন ও ট্রানজিশনের সম্পূর্ণ CSS কিফ্রেম */}
      <style>{`
        @keyframes heroTimer { from { width: 0%; } to { width: 100%; } }
        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes anim_zoom-pop { 0% { transform: scale(0.65); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes anim_neon-pulse { 0%, 100% { text-shadow: 0 0 4px #fff, 0 0 15px #38bdf8; } 50% { text-shadow: 0 0 2px #fff; } }
        @keyframes anim_bounce-in { 0% { transform: translateY(-30px); opacity: 0; } 60% { transform: translateY(6px); } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes anim_flip-x { 0% { transform: perspective(400px) rotateX(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateX(0deg); opacity: 1; } }
        @keyframes anim_flip-y { 0% { transform: perspective(400px) rotateY(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateY(0deg); opacity: 1; } }
        @keyframes anim_cyber-glitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-3px, 2px); } 40% { transform: translate(3px, -2px); } }
        @keyframes anim_smoke-fade { 0% { filter: blur(10px); opacity: 0; } 100% { filter: blur(0); opacity: 1; } }
        @keyframes anim_slide-left { 0% { transform: translateX(50px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes anim_slide-right { 0% { transform: translateX(-50px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes anim_golden-shimmer { 0%, 100% { filter: drop-shadow(0 0 2px #eab308); } 50% { filter: drop-shadow(0 0 14px #facc15) brightness(1.2); } }
        @keyframes anim_rubber-band { 0% { transform: scale(1); } 30% { transform: scaleX(1.2) scaleY(0.8); } 100% { transform: scale(1); } }
        @keyframes anim_pulse-expand { 0% { transform: scale(0.92); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }

        /* অটো-লুপ অ্যানিমেশন */
        @keyframes anim_auto-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes anim_auto-heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes anim_auto-neon { 0%, 100% { text-shadow: 0 0 3px #fff, 0 0 12px #22c55e; } 50% { text-shadow: 0 0 8px #fff, 0 0 22px #4ade80; } }
        @keyframes anim_auto-jello { 0%, 100% { transform: skewX(0); } 50% { transform: skewX(-4deg) skewY(-2deg); } }
        @keyframes anim_auto-breathe { 0%, 100% { opacity: 0.85; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } }

        .anim_fade-up { animation: anim_fade-up 0.8s ease-out forwards; }
        .anim_zoom-pop { animation: anim_zoom-pop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .anim_neon-pulse { animation: anim_neon-pulse 1.2s infinite; }
        .anim_bounce-in { animation: anim_bounce-in 0.8s ease forwards; }
        .anim_flip-x { animation: anim_flip-x 0.8s ease forwards; }
        .anim_flip-y { animation: anim_flip-y 0.8s ease forwards; }
        .anim_cyber-glitch { animation: anim_cyber-glitch 0.5s infinite; }
        .anim_smoke-fade { animation: anim_smoke-fade 1s ease-out forwards; }
        .anim_slide-left { animation: anim_slide-left 0.7s ease-out forwards; }
        .anim_slide-right { animation: anim_slide-right 0.7s ease-out forwards; }
        .anim_golden-shimmer { animation: anim_golden-shimmer 1.5s infinite; }
        .anim_rubber-band { animation: anim_rubber-band 0.8s ease forwards; }
        .anim_pulse-expand { animation: anim_pulse-expand 1.5s infinite; }

        .anim_auto-float { animation: anim_auto-float 3s ease-in-out infinite; }
        .anim_auto-heartbeat { animation: anim_auto-heartbeat 1.8s ease-in-out infinite; }
        .anim_auto-neon { animation: anim_auto-neon 2s ease-in-out infinite; }
        .anim_auto-jello { animation: anim_auto-jello 2.5s ease-in-out infinite; }
        .anim_auto-breathe { animation: anim_auto-breathe 3.5s ease-in-out infinite; }
      `}</style>

      {/* ১. ব্রেকিং নিউজ ব্যানার (সক্রিয় থাকলে হিরোর ঠিক উপরে থাকবে) */}
      <HeroBreakingBanner settings={settings} />

      {/* ২. হিরো স্লাইডার সেকশন */}
      {total > 0 && (
        <section
          aria-label="Hero Slider"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black"
        >
          {showSplit ? (
            /* ================= পিসিতে ২ বা ৩ স্প্লিট ভিউ (মোবাইলে ১ কলাম) ================= */
            <div
              className={`grid grid-cols-1 ${
                splitCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
              } gap-2 p-2 sm:p-4 bg-slate-950`}
            >
              {slides.slice(0, splitCount).map((s, idx) => (
                <div
                  key={s.id}
                  className="relative h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-lg"
                >
                  <HeroMediaRenderer slide={s} isActive={true} />
                </div>
              ))}
            </div>
          ) : (
            /* ================= সাধারণ স্ট্যান্ডার্ড স্লাইডার (১ স্প্লিট ভিউ) ================= */
            <div className="relative h-[480px] sm:h-[540px] lg:h-[600px] w-full">
              {currentSlide && (
                <HeroMediaRenderer
                  key={currentSlide.id}
                  slide={currentSlide}
                  isActive={true}
                />
              )}

              {/* স্লাইড তথ্য ব্যাজ */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow">
                <Layers className="size-3.5 text-yellow-400" />
                <span className="text-xs text-white font-medium">
                  পোস্ট {bn(currentIdx + 1)}/{bn(total)}
                </span>
              </div>

              {/* কন্ট্রোল বাটনসমূহ (পজ, নেক্সট, প্রিভিয়াস) */}
              {total > 1 && (
                <div className="absolute bottom-5 right-6 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    aria-label={isPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে বন্ধ করুন'}
                    className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
                  >
                    {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
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

              {/* পোস্ট বুলেটিং ইন্ডিকেটর */}
              {total > 1 && (
                <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5">
                  {slides.map((_, pI) => (
                    <button
                      key={pI}
                      type="button"
                      onClick={() => setCurrentIdx(pI)}
                      aria-label={`স্লাইড ${pI + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        pI === currentIdx ? 'w-8 bg-yellow-400' : 'w-2 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* প্রোগ্রেস টাইমার বার */}
              {!isPaused && total > 1 && duration > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30 pointer-events-none">
                  <div
                    key={currentIdx}
                    className="h-full bg-yellow-400 origin-left"
                    style={{
                      animation: `heroTimer ${duration}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default HeroCarousel
