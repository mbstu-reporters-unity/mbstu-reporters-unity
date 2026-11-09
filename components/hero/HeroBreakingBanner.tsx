'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getHeroBannerSlides } from '@/lib/hero-banner'
import type { HeroSlide, HeroSettings } from '@/lib/hero'
import { parseVideoUrl } from '@/lib/hero'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Siren,
  Flame,
  Zap,
  Radio,
  BellRing,
  Sparkles,
  Megaphone,
  Newspaper,
  TrendingUp,
  AlertTriangle,
  Star,
  Award,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react'

interface HeroBreakingBannerProps {
  settings?: HeroSettings | null
}

function renderBadgeIcon(key?: string, className = "size-3.5 mr-1.5 inline-block") {
  switch (key) {
    case "siren": return <Siren className={className} />
    case "flame": return <Flame className={className} />
    case "zap": return <Zap className={className} />
    case "radio": return <Radio className={className} />
    case "bell-ring": return <BellRing className={className} />
    case "sparkles": return <Sparkles className={className} />
    case "megaphone": return <Megaphone className={className} />
    case "newspaper": return <Newspaper className={className} />
    case "trending-up": return <TrendingUp className={className} />
    case "alert-triangle": return <AlertTriangle className={className} />
    case "star": return <Star className={className} />
    case "award": return <Award className={className} />
    case "clock": return <Clock className={className} />
    case "compass": return <Compass className={className} />
    case "check-circle": return <CheckCircle2 className={className} />
    default: return null
  }
}

function getBannerBg(slide: HeroSlide) {
  if (slide.banner_config) {
    const cfg = slide.banner_config
    if (cfg.mode === 'solid') {
      return cfg.stops?.[0]?.color || '#1e1b4b'
    }
    const angle = cfg.angle ?? 135
    const stops = cfg.stops && cfg.stops.length > 0
      ? cfg.stops
      : [
          { color: '#1e1b4b', stop: 0 },
          { color: '#1e3a8a', stop: 50 },
          { color: '#0f172a', stop: 100 },
        ]
    const stopString = [...stops]
      .sort((a, b) => a.stop - b.stop)
      .map((s) => `${s.color} ${s.stop}%`)
      .join(', ')

    return `linear-gradient(${angle}deg, ${stopString})`
  }
  return 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #0f172a 100%)'
}

export function HeroBreakingBanner({ settings }: HeroBreakingBannerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loaded, setLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const isTouchingRef = useRef(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const mouseStartY = useRef<number | null>(null)

  useEffect(() => {
    getHeroBannerSlides()
      .then((res) => {
        if (res && res.length > 0) {
          setSlides(res.filter((s) => s.is_active !== false))
        } else {
          setSlides([])
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const total = slides.length
  const currentSlide = slides[currentIndex] || slides[0]

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // স্বয়ংক্রিয় স্লাইড শো
  useEffect(() => {
    if (total <= 1) return

    const rawDur = Number(currentSlide?.slide_duration) || 5000
    const safeDuration = rawDur < 100 ? rawDur * 1000 : rawDur

    const interval = setInterval(() => {
      if (!isPaused && !isTouchingRef.current) {
        setCurrentIndex((prev) => (prev + 1) % total)
      }
    }, safeDuration)

    return () => clearInterval(interval)
  }, [total, currentSlide?.id, currentSlide?.slide_duration, isPaused])

  // ৪ দিকেই সোয়াইপ হ্যান্ডলার
  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchingRef.current = true
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    isTouchingRef.current = false
    if (touchStartX.current === null || touchStartY.current === null || total <= 1) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current

    const absX = Math.abs(diffX)
    const absY = Math.abs(diffY)
    const THRESHOLD = 30

    if (absX > THRESHOLD || absY > THRESHOLD) {
      if (absX >= absY) {
        if (diffX < 0) nextSlide()
        else prevSlide()
      } else {
        if (diffY < 0) nextSlide()
        else prevSlide()
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX
    mouseStartY.current = e.clientY
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null || mouseStartY.current === null || total <= 1) {
      mouseStartX.current = null
      mouseStartY.current = null
      return
    }

    const diffX = e.clientX - mouseStartX.current
    const diffY = e.clientY - mouseStartY.current
    const absX = Math.abs(diffX)
    const absY = Math.abs(diffY)
    const THRESHOLD = 35

    if (absX > THRESHOLD || absY > THRESHOLD) {
      if (absX >= absY) {
        if (diffX < 0) nextSlide()
        else prevSlide()
      } else {
        if (diffY < 0) nextSlide()
        else prevSlide()
      }
    }

    mouseStartX.current = null
    mouseStartY.current = null
  }

  if (!loaded || !slides || slides.length === 0) return null

  const bannerHeight = currentSlide.banner_config?.height_px || 200
  const slideType = currentSlide.slide_type || 'color'
  const videoUrl = currentSlide.video_config?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = currentSlide.media_items?.[0]?.url || ''
  const layers = currentSlide.text_layers || []
  const hasButton = Boolean(currentSlide.button_text && currentSlide.button_text.trim())

  return (
    <section
      aria-label="Hero Banner"
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsPaused(true)
        }
      }}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-full overflow-hidden select-none border-b border-indigo-950/60 shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing"
      style={{
        minHeight: `${bannerHeight}px`,
        background: slideType === 'color' ? getBannerBg(currentSlide) : '#000000',
      }}
    >
      {/* ⭐ ৩৫টি টেক্সট ও ব্যাজ অ্যানিমেশনের সম্পূর্ণ সিএসএস ইঞ্জিন ⭐ */}
      <style>{`
        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(22px); } 100% { opacity: 1; transform: translateY(0); } }
        .anim_fade-up { animation: anim_fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_typewriter { 0% { opacity: 0; clip-path: inset(0 100% 0 0); } 100% { opacity: 1; clip-path: inset(0 0 0 0); } }
        .anim_typewriter { animation: anim_typewriter 1s ease-out forwards; display: inline-flex; }

        @keyframes anim_zoom-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        .anim_zoom-pop { animation: anim_zoom-pop 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; display: inline-flex; }

        @keyframes anim_neon-pulse { 0%, 100% { text-shadow: 0 0 4px #fff, 0 0 14px #38bdf8; } 50% { text-shadow: 0 0 2px #fff, 0 0 6px #0284c7; } }
        .anim_neon-pulse { animation: anim_neon-pulse 1.4s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_bounce-in { 0% { opacity: 0; transform: translateY(-40px); } 60% { opacity: 1; transform: translateY(8px); } 80% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        .anim_bounce-in { animation: anim_bounce-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards; display: inline-flex; }

        @keyframes anim_flip-x { 0% { opacity: 0; transform: perspective(400px) rotateX(90deg); } 100% { opacity: 1; transform: perspective(400px) rotateX(0deg); } }
        .anim_flip-x { animation: anim_flip-x 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_flip-y { 0% { opacity: 0; transform: perspective(400px) rotateY(90deg); } 100% { opacity: 1; transform: perspective(400px) rotateY(0deg); } }
        .anim_flip-y { animation: anim_flip-y 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_cyber-glitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-3px, 2px); } 40% { transform: translate(3px, -2px); } 60% { transform: translate(-2px, -1px); } 80% { transform: translate(2px, 1px); } }
        .anim_cyber-glitch { animation: anim_cyber-glitch 2s infinite; display: inline-flex; }

        @keyframes anim_smoke-fade { 0% { opacity: 0; filter: blur(14px); transform: scale(1.08); } 100% { opacity: 1; filter: blur(0); transform: scale(1); } }
        .anim_smoke-fade { animation: anim_smoke-fade 0.9s ease-out forwards; display: inline-flex; }

        @keyframes anim_letter-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .anim_letter-wave { animation: anim_letter-wave 2s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_slide-left { 0% { opacity: 0; transform: translateX(60px); } 100% { opacity: 1; transform: translateX(0); } }
        .anim_slide-left { animation: anim_slide-left 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_slide-right { 0% { opacity: 0; transform: translateX(-60px); } 100% { opacity: 1; transform: translateX(0); } }
        .anim_slide-right { animation: anim_slide-right 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_rotate-drop { 0% { opacity: 0; transform: rotate(-12deg) translateY(-30px); } 100% { opacity: 1; transform: rotate(0) translateY(0); } }
        .anim_rotate-drop { animation: anim_rotate-drop 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_flash-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        .anim_flash-blink { animation: anim_flash-blink 0.8s 2 ease-in-out forwards; display: inline-flex; }

        @keyframes anim_shake-alert { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        .anim_shake-alert { animation: anim_shake-alert 0.6s ease-in-out forwards; display: inline-flex; }

        @keyframes anim_rainbow-shift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
        .anim_rainbow-shift { animation: anim_rainbow-shift 4s linear infinite; display: inline-flex; }

        @keyframes anim_tracking-expand { 0% { opacity: 0; letter-spacing: -4px; } 100% { opacity: 1; letter-spacing: normal; } }
        .anim_tracking-expand { animation: anim_tracking-expand 0.9s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_golden-shimmer { 0%, 100% { filter: drop-shadow(0 0 2px #eab308); } 50% { filter: drop-shadow(0 0 16px #facc15) brightness(1.25); } }
        .anim_golden-shimmer { animation: anim_golden-shimmer 2s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_twist-3d { 0% { opacity: 0; transform: rotate(-10deg) scale(0.85); } 100% { opacity: 1; transform: rotate(0) scale(1); } }
        .anim_twist-3d { animation: anim_twist-3d 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-flex; }

        @keyframes anim_swing-in { 0% { opacity: 0; transform: rotateZ(-15deg); } 60% { transform: rotateZ(5deg); } 100% { opacity: 1; transform: rotateZ(0deg); } }
        .anim_swing-in { animation: anim_swing-in 0.85s ease-out forwards; display: inline-flex; transform-origin: top center; }

        @keyframes anim_rubber-band { 0% { transform: scale(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 40% { transform: scaleX(0.75) scaleY(1.25); } 60% { transform: scaleX(1.15) scaleY(0.85); } 100% { transform: scale(1); } }
        .anim_rubber-band { animation: anim_rubber-band 0.9s ease-out forwards; display: inline-flex; }

        @keyframes anim_pulse-expand { 0% { transform: scale(0.92); opacity: 0; } 50% { transform: scale(1.06); } 100% { transform: scale(1); opacity: 1; } }
        .anim_pulse-expand { animation: anim_pulse-expand 0.8s ease-out forwards; display: inline-flex; }

        /* অটো-লুপ অ্যানিমেশনসমূহ */
        @keyframes anim_auto-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .anim_auto-float { animation: anim_auto-float 3s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_auto-heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
        .anim_auto-heartbeat { animation: anim_auto-heartbeat 1.6s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_auto-neon { 0%, 100% { text-shadow: 0 0 3px #fff, 0 0 10px #22c55e; } 50% { text-shadow: 0 0 7px #fff, 0 0 20px #4ade80; } }
        .anim_auto-neon { animation: anim_auto-neon 2s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_auto-jello { 0%, 100% { transform: scale(1); } 30% { transform: scaleX(1.15) scaleY(0.85); } 40% { transform: scaleX(0.85) scaleY(1.15); } }
        .anim_auto-jello { animation: anim_auto-jello 2.2s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_auto-golden { 0%, 100% { filter: drop-shadow(0 0 2px #eab308); } 50% { filter: drop-shadow(0 0 14px #facc15) brightness(1.2); } }
        .anim_auto-golden { animation: anim_auto-golden 2s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_auto-gradient { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
        .anim_auto-gradient { animation: anim_auto-gradient 5s linear infinite; display: inline-flex; }

        @keyframes anim_auto-breathe { 0%, 100% { opacity: 0.85; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.03); } }
        .anim_auto-breathe { animation: anim_auto-breathe 3s ease-in-out infinite; display: inline-flex; }

        @keyframes anim_auto-glitch { 0%, 100% { transform: translate(0); } 10% { transform: translate(-2px, 1px); } 20% { transform: translate(2px, -1px); } 30% { transform: translate(0); } }
        .anim_auto-glitch { animation: anim_auto-glitch 3s infinite; display: inline-flex; }

        @keyframes anim_auto-swing { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(3deg); } 75% { transform: rotate(-3deg); } }
        .anim_auto-swing { animation: anim_auto-swing 3s ease-in-out infinite; display: inline-flex; transform-origin: top center; }

        @keyframes anim_auto-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .anim_auto-bounce { animation: anim_auto-bounce 1.8s ease-in-out infinite; display: inline-flex; }
      `}</style>

      {/* ছবি ব্যাকগ্রাউন্ড — কোনো ব্লার বা ছায়া নেই */}
      {slideType === 'image' && (
        <div className="absolute inset-0 size-full pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={imageUrl}
            src={imageUrl || '/images/hero-1.png'}
            alt="Banner Image"
            className="size-full object-cover transition-opacity duration-500"
            loading="eager"
          />
        </div>
      )}

      {/* ভিডিও ব্যাকগ্রাউন্ড */}
      {slideType === 'video' && (
        <div className="absolute inset-0 size-full flex items-center justify-center bg-black z-0 pointer-events-auto">
          {parsedVideo.isEmbed ? (
            <iframe
              src={`${parsedVideo.embedSrc}&playsinline=1&controls=1`}
              className="size-full aspect-video border-0 pointer-events-auto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              title="Banner YouTube Video"
            />
          ) : (
            <video
              src={videoUrl}
              controls
              playsInline
              className="size-full object-contain pointer-events-auto"
            />
          )}
        </div>
      )}

      {/* কনটেন্ট ও লেখার বক্স */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-8 py-5 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none"
        style={{ minHeight: `${bannerHeight}px` }}
      >
        <div className="relative w-full flex-1 pointer-events-none" style={{ minHeight: `${Math.max(120, bannerHeight - 40)}px` }}>
          {layers.map((layer: any, idx: number) => {
            if (layer.enabled === false) return null
            const displayText = layer.text || layer.title || ''
            if (!displayText) return null

            const scale = layer.size_scale || 1
            const align = layer.align || 'left'
            const anim = layer.animation || 'fade-up'
            const iconKey = layer.icon
            const isBadge = layer.id === 'txt_badge' || layer.bg_color

            return (
              <div
                /* ⭐ currentIndex যুক্ত করায় প্রতিবার স্লাইড পরিবর্তনে ফ্রেশ অ্যানিমেশন চালু হবে ⭐ */
                key={`${currentSlide.id}_${layer.id || idx}_${currentIndex}`}
                className="absolute transition-all duration-300 pointer-events-none"
                style={{
                  left: `${layer.x ?? 30}%`,
                  top: `${layer.y ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '92%',
                  textAlign: align,
                }}
              >
                <div style={{ transform: `scale(${scale})` }}>
                  <div
                    className={`anim_${anim}`}
                    style={{
                      fontFamily: layer.font || undefined,
                      color: layer.color || '#FFFFFF',
                      backgroundColor: layer.bg_color || undefined,
                      padding: layer.bg_color ? '4px 14px' : undefined,
                      borderRadius: layer.bg_color ? '9999px' : undefined,
                      textAlign: align,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {/* ⭐ ব্রেকিং ব্যাজের স্বয়ংক্রিয় লাইভ পালসিং ডট অ্যানিমেশন ⭐ */}
                    {isBadge && (
                      <span className="relative flex size-2 mr-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                        <span className="relative inline-flex rounded-full size-2 bg-white" />
                      </span>
                    )}

                    <div
                      className={`leading-tight drop-shadow-lg flex items-center ${
                        layer.weight === 'bold'
                          ? 'font-bold'
                          : layer.weight === 'semibold'
                          ? 'font-semibold'
                          : 'font-normal'
                      } ${layer.italic ? 'italic' : ''} text-sm sm:text-lg lg:text-xl`}
                    >
                      {iconKey && renderBadgeIcon(iconKey, "size-4 mr-1.5 shrink-0")}
                      {layer.id === 'txt_date' && !iconKey && <Calendar className="inline-block size-3.5 mr-1.5 opacity-80" />}
                      <span>{displayText}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ঐচ্ছিক বাটন */}
        {hasButton && (
          <div className="z-30 shrink-0 self-end sm:self-center pointer-events-auto">
            <a
              href={currentSlide.link_url || '#'}
              target={currentSlide.link_url?.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-red-700 font-bold text-xs transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <span>{currentSlide.button_text}</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* স্লাইড নেভিগেশন ডটস */}
      {total > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
          <button
            type="button"
            onClick={prevSlide}
            className="text-white/80 hover:text-white p-0.5 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            className="text-white/80 hover:text-white p-0.5 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </section>
  )
}

export default HeroBreakingBanner
