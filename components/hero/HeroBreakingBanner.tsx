'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
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

export function renderBadgeIcon(key?: string, className = "size-3.5 mr-1.5 inline-block") {
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

  // স্বয়ংক্রিয় স্লাইড শো টাইমার
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

  // সোয়াইপ হ্যান্ডলার
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
  const isExternalButton = currentSlide.link_url?.startsWith('http')

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
      {/* ছবি ব্যাকগ্রাউন্ড */}
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
                    {/* ব্রেকিং ব্যাজের পালসিং ডট অ্যানিমেশন */}
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

        {/* অ্যাকশন বাটন (SPA Link ও External Link হ্যান্ডলার) */}
        {hasButton && (
          <div className="z-30 shrink-0 self-end sm:self-center pointer-events-auto">
            {isExternalButton ? (
              <a
                href={currentSlide.link_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-red-700 font-bold text-xs transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <span>{currentSlide.button_text}</span>
                <ArrowRight className="size-3.5" />
              </a>
            ) : (
              <Link
                href={currentSlide.link_url || '/'}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-red-700 font-bold text-xs transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <span>{currentSlide.button_text}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* স্লাইড নেভিগেশন ডটস ও তীর */}
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
