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

  // প্রতিটি কার্ডের অ্যাডমিনে সিলেক্ট করা নিজস্ব ট্রানজিশন ইফেক্ট
  const effect0 = visibleSlides[0]?.transition_effect || 'slide-left'
  const effect1 = visibleSlides[1]?.transition_effect || 'slide-left'
  const effect2 = visibleSlides[2]?.transition_effect || 'slide-left'

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* ================= ১৫টি পূর্ণাঙ্গ ও সিনেমাটিক স্মুথ ট্রানজিশন সিএসএস ================= */}
      <style>{`
        @keyframes heroTimer { from { width: 0%; } to { width: 100%; } }

        /* ১. স্লাইড বামে (Slide Left) */
        @keyframes tr_slide_left {
          0% { transform: translateX(70px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .tr_slide-left { animation: tr_slide_left 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ২. স্লাইড ডানে (Slide Right) */
        @keyframes tr_slide_right {
          0% { transform: translateX(-70px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .tr_slide-right { animation: tr_slide_right 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ৩. স্লাইড উপরে (Slide Up) */
        @keyframes tr_slide_up {
          0% { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .tr_slide-up { animation: tr_slide_up 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ৪. স্লাইড নিচে (Slide Down) */
        @keyframes tr_slide_down {
          0% { transform: translateY(-60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .tr_slide-down { animation: tr_slide_down 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ৫. স্মুথ ফেড ইন-আউট (Fade Dissolve) */
        @keyframes tr_fade {
          0% { opacity: 0; filter: blur(4px); }
          100% { opacity: 1; filter: blur(0); }
        }
        .tr_fade { animation: tr_fade 0.8s ease-in-out both; }

        /* ৬. জুম ইন পপ (Zoom In) */
        @keyframes tr_zoom_in {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .tr_zoom-in { animation: tr_zoom_in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ৭. জুম আউট ফেড (Zoom Out) */
        @keyframes tr_zoom_out {
          0% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .tr_zoom-out { animation: tr_zoom_out 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ৮. ৩ডি ফ্লিপ হরিজোন্টাল (Flip H) */
        @keyframes tr_flip_h {
          0% { transform: perspective(800px) rotateY(65deg); opacity: 0; }
          100% { transform: perspective(800px) rotateY(0deg); opacity: 1; }
        }
        .tr_flip-h { animation: tr_flip_h 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ৯. ৩ডি ফ্লিপ ভার্টিকাল (Flip V) */
        @keyframes tr_flip_v {
          0% { transform: perspective(800px) rotateX(65deg); opacity: 0; }
          100% { transform: perspective(800px) rotateX(0deg); opacity: 1; }
        }
        .tr_flip-v { animation: tr_flip_v 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ১০. সিনেমাটিক ব্লার ফেড (Blur Fade) */
        @keyframes tr_blur_fade {
          0% { filter: blur(16px); opacity: 0; transform: scale(0.96); }
          100% { filter: blur(0); opacity: 1; transform: scale(1); }
        }
        .tr_blur-fade { animation: tr_blur_fade 0.8s ease-out both; }

        /* ১১. পুশ বামে (Push Left) */
        @keyframes tr_push_left {
          0% { transform: translateX(80px) scale(0.92); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        .tr_push-left { animation: tr_push_left 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ১২. পুশ ডানে (Push Right) */
        @keyframes tr_push_right {
          0% { transform: translateX(-80px) scale(0.92); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        .tr_push-right { animation: tr_push_right 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ১৩. সার্কেল রিভিল (Circle Reveal) */
        @keyframes tr_circle_reveal {
          0% { clip-path: circle(0% at 50% 50%); opacity: 0; }
          100% { clip-path: circle(100% at 50% 50%); opacity: 1; }
        }
        .tr_circle-reveal { animation: tr_circle_reveal 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ১৪. টুইস্ট রোটেশন (Twist Spin) */
        @keyframes tr_twist_spin {
          0% { transform: rotate(-8deg) scale(0.88); opacity: 0; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        .tr_twist-spin { animation: tr_twist_spin 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ১৫. ইলাস্টিক বাউন্স (Elastic Bounce) */
        @keyframes tr_elastic {
          0% { transform: scale(0.7); opacity: 0; }
          65% { transform: scale(1.03); opacity: 1; }
          85% { transform: scale(0.98); }
          100% { transform: scale(1); opacity: 1; }
        }
        .tr_elastic { animation: tr_elastic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
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
          {/* ================= ১টি SPLIT ================= */}
          {activeSplits === 1 && visibleSlides[0] && (
            <div className="relative h-[440px] sm:h-[500px] lg:h-[560px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
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

          {/* ================= ২টি SPLIT (প্রতিটির নিজস্ব সিলেক্ট করা ট্রানজিশন সহ) ================= */}
          {activeSplits === 2 && visibleSlides.length >= 2 && (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full">
              <div className="relative h-[220px] sm:h-[280px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
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

              <div className="relative h-[220px] sm:h-[280px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
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

          {/* ================= ৩টি SPLIT (উপরে ১ম ১০০%, নিচে ২য় ৫০% ও ৩য় ৫০% - নিজস্ব ট্রানজিশন সহ) ================= */}
          {activeSplits === 3 && visibleSlides.length >= 3 && (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full">
              {/* ১ম split (উপরে ১০০%) */}
              <div className="relative h-[250px] sm:h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
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

              {/* নিচে পাশাপাশি ২টি (৫০% + ৫০%) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                <div className="relative h-[210px] sm:h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
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

                <div className="relative h-[210px] sm:h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
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
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 mt-2.5">
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
