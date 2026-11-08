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

// ১৫টি আইকন হোমপেজে রেন্ডার করার ফাংশন
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
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
  const duration = currentSlide?.slide_duration || 5000

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (isPaused || total <= 1 || duration <= 0) return

    timerRef.current = setTimeout(() => {
      nextSlide()
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nextSlide, duration, isPaused, total, currentIndex])

  // ✅ অ্যাডমিন সব ডিলিট করে দিলে হোমপেজে এই সেকশনটি সম্পূর্ণ অদৃশ্য থাকবে
  if (!loaded || !slides || slides.length === 0) return null

  const bannerHeight = currentSlide.banner_config?.height_px || 200
  const slideType = currentSlide.slide_type || 'color'
  const videoUrl = currentSlide.video_config?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = currentSlide.media_items?.[0]?.url || ''
  const layers = currentSlide.text_layers || []

  return (
    <section
      aria-label="Hero Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden select-none border-b border-indigo-950/60 shadow-xl transition-all duration-300"
      style={{
        minHeight: `${bannerHeight}px`,
        background: slideType === 'color' ? getBannerBg(currentSlide) : '#000000',
      }}
    >
      {/* ছবি ব্যাকগ্রাউন্ড */}
      {slideType === 'image' && (
        <div className="absolute inset-0 size-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl || '/images/hero-1.png'}
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60" />
        </div>
      )}

      {/* ভিডিও ব্যাকগ্রাউন্ড */}
      {slideType === 'video' && (
        <div className="absolute inset-0 size-full flex items-center justify-center bg-black">
          {parsedVideo.isEmbed ? (
            <iframe
              src={`${parsedVideo.embedSrc}&autoplay=1&mute=1`}
              className="size-full aspect-video border-0 pointer-events-auto"
              allow="autoplay; encrypted-media"
              title="Banner Video"
            />
          ) : (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="size-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>
      )}

      {/* কনটেন্ট বক্স */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ minHeight: `${bannerHeight}px` }}>
        
        {/* টেক্সট লেয়ার ও ১৫টি আইকন রেন্ডারিং */}
        <div className="relative w-full flex-1" style={{ minHeight: `${Math.max(120, bannerHeight - 40)}px` }}>
          {layers.map((layer: any, idx: number) => {
            if (layer.enabled === false) return null
            const displayText = layer.text || layer.title || ''
            if (!displayText) return null

            const scale = layer.size_scale || 1
            const align = layer.align || 'left'
            const anim = layer.animation || 'fade-up'
            const iconKey = layer.icon

            return (
              <div
                key={`${currentSlide.id}_${layer.id || idx}`}
                className="absolute transition-all duration-300"
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

        {/* অ্যাকশন বাটন */}
        {currentSlide.button_text && (
          <div className="z-30 shrink-0 self-end sm:self-center">
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

      {/* একাধিক স্লাইড থাকলে কন্ট্রোল বোতাম ও ডটস */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={prevSlide}
            className="text-white/70 hover:text-white p-0.5 cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`size-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-4 bg-white' : 'bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
          <button
            type="button"
            onClick={nextSlide}
            className="text-white/70 hover:text-white p-0.5 cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </section>
  )
}

export default HeroBreakingBanner
