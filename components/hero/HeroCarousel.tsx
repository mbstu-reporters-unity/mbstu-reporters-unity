'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
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
  const [currentIdx, setCurrentIdx] = useState(0) // মোবাইলের জন্য একক স্লাইড ইনডেক্স
  const [pageIdx, setPageIdx] = useState(0) // ২ বা ৩ স্প্লিটের জন্য পেজ ইনডেক্স
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
  const desktopSplits = settings?.desktop_splits || 1
  const isMultiSplit = desktopSplits > 1 && total > 1

  // স্প্লিট ভিউতে কয়টি পেজ হবে তা নির্ধারণ
  const totalPages = useMemo(() => {
    if (!isMultiSplit) return total
    return Math.ceil(total / desktopSplits)
  }, [total, desktopSplits, isMultiSplit])

  // বর্তমান স্লাইডের সময়কাল (Duration)
  const currentSlide = slides[currentIdx] || slides[0] || null
  const duration = currentSlide?.slide_duration || settings?.default_duration || 5000

  // বর্তমান ট্রানজিশন অ্যানিমেশন ক্লাস
  const transitionEffect = currentSlide?.transition_effect || settings?.default_transition || 'slide-left'

  // পরবর্তী স্লাইড বা স্প্লিট পেজে যাওয়ার লজিক
  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIdx((prev) => (prev + 1) % total)
    setPageIdx((prev) => (prev + 1) % Math.max(1, totalPages))
  }, [total, totalPages])

  // আগের স্লাইড বা স্প্লিট পেজে যাওয়ার লজিক
  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIdx((prev) => (prev - 1 + total) % total)
    setPageIdx((prev) => (prev - 1 + totalPages) % Math.max(1, totalPages))
  }, [total, totalPages])

  // নির্ধারিত সেকেন্ড পর পর স্বয়ংক্রিয় স্লাইড সাইকেল
  useEffect(() => {
    if (isPaused || total <= 1 || duration <= 0) return
    const timer = setTimeout(() => {
      nextSlide()
    }, duration)
    return () => clearTimeout(timer)
  }, [nextSlide, duration, isPaused, total, currentIdx, pageIdx])

  // মোবাইলে টাচ সোয়াইপ হ্যান্ডলার
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

  // ২ বা ৩ স্প্লিটের জন্য দৃশ্যমান পোস্টগুলো গণনা (চক্রাকারে ১০টি পোস্টই ঘুরবে)
  const visibleSplitSlides = useMemo(() => {
    if (!isMultiSplit) return []
    const start = (pageIdx * desktopSplits) % total
    const result: HeroSlide[] = []
    for (let i = 0; i < desktopSplits; i++) {
      const idx = (start + i) % total
      result.push(slides[idx])
    }
    return result
  }, [slides, isMultiSplit, pageIdx, desktopSplits, total])

  if (!loaded) return null
  if (total === 0 && !settings?.breaking_on) return null

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* ================= ৩০টি স্পষ্ট ট্রানজিশন ও অ্যানিমেশনের CSS ================= */}
      <style>{`
        @keyframes heroTimer { from { width: 0%; } to { width: 100%; } }

        /* ৩০টি বাস্তব স্লাইডার ট্রানজিশন ইফেক্ট */
        @keyframes tr_slide_left { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tr_slide_right { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tr_slide_up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes tr_slide_down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes tr_fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tr_zoom_in { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes tr_zoom_out { from { transform: scale(1.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes tr_flip_h { from { transform: perspective(800px) rotateY(90deg); opacity: 0; } to { transform: perspective(800px) rotateY(0deg); opacity: 1; } }
        @keyframes tr_flip_v { from { transform: perspective(800px) rotateX(90deg); opacity: 0; } to { transform: perspective(800px) rotateX(0deg); opacity: 1; } }
        @keyframes tr_blur_fade { from { filter: blur(20px); opacity: 0; } to { filter: blur(0); opacity: 1; } }
        @keyframes tr_push_left { from { transform: translateX(70px) scale(0.92); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes tr_push_right { from { transform: translateX(-70px) scale(0.92); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes tr_twist_spin { from { transform: rotate(-15deg) scale(0.85); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
        @keyframes tr_elastic { from { transform: scale(0.6); opacity: 0; } 70% { transform: scale(1.04); } to { transform: scale(1); opacity: 1; } }

        .tr_slide-left { animation: tr_slide_left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_slide-right { animation: tr_slide_right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_slide-up { animation: tr_slide_up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_slide-down { animation: tr_slide_down 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_fade { animation: tr_fade 0.8s ease-in-out forwards; }
        .tr_zoom-in { animation: tr_zoom_in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_zoom-out { animation: tr_zoom_out 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tr_flip-h { animation: tr_flip_h 0.8s ease-out forwards; }
        .tr_flip-v { animation: tr_flip_v 0.8s ease-out forwards; }
        .tr_blur-fade { animation: tr_blur_fade 0.9s ease-out forwards; }
        .tr_push-left { animation: tr_push_left 0.7s ease-out forwards; }
        .tr_push-right { animation: tr_push_right 0.7s ease-out forwards; }
        .tr_twist-spin { animation: tr_twist_spin 0.8s ease-out forwards; }
        .tr_elastic { animation: tr_elastic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        /* ৩৫টি টেক্সট অ্যানিমেশনের প্রয়োজনীয় ক্লাস */
        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes anim_zoom-pop { 0% { transform: scale(0.65); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes anim_neon-pulse { 0%, 100% { text-shadow: 0 0 4px #fff, 0 0 15px #38bdf8; } 50% { text-shadow: 0 0 2px #fff; } }
        @keyframes anim_bounce-in { 0% { transform: translateY(-30px); opacity: 0; } 60% { transform: translateY(6px); } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes anim_golden-shimmer { 0%, 100% { filter: drop-shadow(0 0 2px #eab308); } 50% { filter: drop-shadow(0 0 14px #facc15) brightness(1.2); } }
        @keyframes anim_auto-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes anim_auto-heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes anim_auto-neon { 0%, 100% { text-shadow: 0 0 3px #fff, 0 0 12px #22c55e; } 50% { text-shadow: 0 0 8px #fff, 0 0 22px #4ade80; } }

        .anim_fade-up { animation: anim_fade-up 0.8s ease-out forwards; }
        .anim_zoom-pop { animation: anim_zoom-pop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .anim_neon-pulse { animation: anim_neon-pulse 1.2s infinite; }
        .anim_bounce-in { animation: anim_bounce-in 0.8s ease forwards; }
        .anim_golden-shimmer { animation: anim_golden-shimmer 1.5s infinite; }
        .anim_auto-float { animation: anim_auto-float 3s ease-in-out infinite; }
        .anim_auto-heartbeat { animation: anim_auto-heartbeat 1.8s ease-in-out infinite; }
        .anim_auto-neon { animation: anim_auto-neon 2s ease-in-out infinite; }
      `}</style>

      {/* ১. ব্রেকিং নিউজ ব্যানার */}
      <HeroBreakingBanner settings={settings} />

      {/* ২. হিরো স্লাইডার এরিয়া */}
      {total > 0 && (
        <section
          aria-label="Hero Slider"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden select-none bg-black"
        >
          {/* ================= পিসির ২ বা ৩ স্প্লিট ভিউ (সবগুলো পোস্ট চক্রাকারে ঘুরবে) ================= */}
          {isMultiSplit ? (
            <div className="hidden md:block w-full p-2.5 sm:p-4 bg-slate-950">
              <div
                key={`page_${pageIdx}`}
                className={`grid grid-cols-1 ${
                  desktopSplits === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-3 sm:gap-4 tr_${transitionEffect}`}
              >
                {visibleSplitSlides.map((s, idx) => (
                  <div
                    key={`${s.id}_${idx}`}
                    className="relative h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900"
                  >
                    <HeroMediaRenderer slide={s} isActive={true} />
                  </div>
                ))}
              </div>

              {/* পেজ ইন্ডিকেটর */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-3">
                  {Array.from({ length: totalPages }).map((_, pI) => (
                    <button
                      key={pI}
                      type="button"
                      onClick={() => setPageIdx(pI)}
                      aria-label={`পেজ ${pI + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        pI === pageIdx ? 'w-8 bg-emerald-500 shadow' : 'w-2 bg-white/30 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* ================= মোবাইল স্ক্রিন অথবা ১ স্প্লিট ভিউ (ফুল স্লাইডার) ================= */}
          <div className={`${isMultiSplit ? 'md:hidden' : ''} relative h-[480px] sm:h-[540px] lg:h-[600px] w-full`}>
            {currentSlide && (
              <div key={`${currentSlide.id}_${currentIdx}`} className={`w-full h-full tr_${transitionEffect}`}>
                <HeroMediaRenderer
                  slide={currentSlide}
                  isActive={true}
                />
              </div>
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
                      pI === currentIdx ? 'w-8 bg-emerald-500 shadow' : 'w-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* টাইমার প্রোগ্রেস বার */}
            {!isPaused && total > 1 && duration > 0 && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30 pointer-events-none">
                <div
                  key={currentIdx}
                  className="h-full bg-emerald-500 origin-left"
                  style={{
                    animation: `heroTimer ${duration}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default HeroCarousel
