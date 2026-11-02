'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  ExternalLink,
} from 'lucide-react'
import { getHeroSlides, getHeroSettings } from '@/lib/hero'
import type { HeroSlide, HeroSettings } from '@/lib/hero'
import { cn } from '@/lib/utils'

type Slide = {
  key: string
  image: string
  pos: string
  category: string | null
  date: string
  title: string | null
  summary: string | null
  link: string | null
  alt: string
  mediaType: 'image' | 'video'
  videoUrl: string | null
  extraMedia: string | null
  buttonText: string
  titleColor: string | null
  titleBgColor: string | null
  badgeColor: string | null
  fontFamily: string | null
  fontWeight: string | null
  textAlign: 'left' | 'center' | 'right'
  contentPosV: 'top' | 'center' | 'bottom'
  contentPosH: 'left' | 'center' | 'right'
  showCardBg: boolean
  cardWidthPct: number
  cardRadiusPct: number
  cardPaddingVal: number
  cardBlur: number
  cardBgColor: string
  cardOpacity: number
  fitMode: 'contain' | 'cover'
}

function hexToRgba(hex: string | null | undefined, opacity: number | null | undefined) {
  const alpha = (opacity ?? 60) / 100
  if (!hex || !hex.startsWith('#')) return `rgba(0, 0, 0, ${alpha})`
  let c = hex.substring(1)
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function toSlide(s: HeroSlide): Slide {
  const finalLink = s.link_url?.trim() || (s.media_type === 'video' && s.video_url ? s.video_url.trim() : null)

  return {
    key: s.id,
    image: s.image_url || '/images/hero-1.png',
    pos: s.image_pos,
    category: s.category?.trim() || null,
    date: new Date(s.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    }),
    title: s.title?.trim() || null,
    summary: s.summary?.trim() || null,
    link: finalLink,
    alt: s.title || 'Hero Banner',
    mediaType: s.media_type || 'image',
    videoUrl: s.video_url || null,
    extraMedia: s.extra_media || null,
    buttonText: s.button_text?.trim() || 'বিস্তারিত',
    titleColor: s.title_color || null,
    titleBgColor: s.title_bg_color || null,
    badgeColor: s.badge_color || null,
    fontFamily: s.font_family || "'Hind Siliguri', sans-serif",
    fontWeight: s.font_weight || '700',
    textAlign: s.text_align || 'left',
    contentPosV: s.content_pos_v || 'bottom',
    contentPosH: s.content_pos_h || 'left',
    showCardBg: s.show_card_bg ?? true,
    cardWidthPct: s.card_width_pct ?? 90,
    cardRadiusPct: s.card_radius_pct ?? 20,
    cardPaddingVal: s.card_padding_val ?? 20,
    cardBlur: s.card_blur ?? 12,
    cardBgColor: s.card_bg_color || '#000000',
    cardOpacity: s.card_opacity ?? 60,
    fitMode: s.fit_mode || 'contain',
  }
}

const isExternal = (u: string) => /^https?:\/\//i.test(u)
const bn = (n: number) => n.toLocaleString('bn-BD')
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

function getYoutubeInteractiveEmbed(url: string | null) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    const id = match[2]
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1`
  }
  return null
}

export function HeroCarousel() {
  // অদ্ভুত ডেমো স্লাইড মুছে সম্পূর্ণ খালি রাখা হয়েছে
  const [slides, setSlides] = useState<Slide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [modalSlide, setModalSlide] = useState<Slide | null>(null)

  const startRef = useRef<{ x: number; y: number } | null>(null)
  const total = slides.length

  const slideMs = settings?.slide_speed ?? 4500
  const isUnlimited = slideMs <= 0
  const transMode = settings?.transition_type || 'fade'
  const isMotionEnabled = settings?.text_motion ?? true

  const currentSlideIsVideo = slides[index]?.mediaType === 'video'

  useEffect(() => {
    let on = true
    Promise.all([getHeroSlides(), getHeroSettings()]).then(([rows, s]) => {
      if (!on) return
      // আনলিমিটেড লাইভ স্লাইড লোড
      const activeRows = rows.filter((r) => r.is_active && (!r.expires_at || new Date(r.expires_at) > new Date()))
      setSlides(activeRows.map(toSlide))
      setIndex(0)
      setSettings(s)
      setLoaded(true)
    })
    return () => {
      on = false
    }
  }, [])

  const go = useCallback((nextIdx: number) => setIndex((nextIdx + total) % total), [total])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const canAutoplay = total > 1 && !reduceMotion && !modalSlide && !isUnlimited && !currentSlideIsVideo
  const running = canAutoplay && !userPaused && !hoverPaused && !focusPaused && !dragging && !tabHidden

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (modalSlide) {
      if (e.key === 'Escape') setModalSlide(null)
      return
    }
    if (total < 2) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === ' ' && e.target === e.currentTarget) {
      e.preventDefault()
      setUserPaused((p) => !p)
    }
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('iframe, video, button, a, input, textarea')) return
    startRef.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    const st = startRef.current
    startRef.current = null
    setDragging(false)
    if (!st || total < 2) return
    const dx = e.clientX - st.x
    const dy = e.clientY - st.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(index + (dx < 0 ? 1 : -1))
    }
  }

  if (!loaded) {
    return (
      <section id="home" className="bg-navy">
        <div className="h-[480px] sm:h-[540px] lg:h-[620px]" />
      </section>
    )
  }

  // ========================================================
  // ডাইনামিক জরুরি ব্রেকিং মোড স্ক্রিন (২১টি ব্যাজ ও ০-১০০% স্পিড)
  // ========================================================
  if (settings?.breaking_on) {
    const bLink = settings.breaking_link
    const bBtn = settings.breaking_btn_text || 'বিস্তারিত'
    const speedPct = settings.breaking_pulse_speed_pct ?? 50
    // ০% এ ধীরগতি (৩.৫ সেকেন্ড), ১০০% এ অতি দ্রুত (০.৪ সেকেন্ড)
    const pulseSec = Math.max(0.4, 3.5 - (speedPct / 100) * 3.1).toFixed(2)

    const bYt = settings.breaking_media_type === 'video' ? getYoutubeInteractiveEmbed(settings.breaking_media_url || null) : null

    const breakingBgStyle =
      settings.breaking_media_type === 'none' || !settings.breaking_media_type
        ? {
            background: `linear-gradient(135deg, ${settings.breaking_bg_color || '#881337'}, ${settings.breaking_bg_gradient || '#0f172a'})`,
          }
        : undefined

    const badgeStyle = settings.breaking_badge_style || 'pulse-circle'

    return (
      <section id="home" className="bg-navy relative overflow-hidden">
        <style>{`
          @keyframes shapePulseDynamic {
            0%, 100% { transform: scale(0.85); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.95)); }
          }
          @keyframes radarWave {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

        <div
          style={breakingBgStyle}
          className="relative flex h-[480px] sm:h-[540px] lg:h-[620px] items-center overflow-hidden bg-slate-950"
        >
          {settings.breaking_media_type === 'image' && settings.breaking_media_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.breaking_media_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {settings.breaking_media_type === 'video' && bYt && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <iframe
                src={bYt}
                className="w-full h-full aspect-video border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Breaking Video"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35 pointer-events-none" />

          <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-12 pointer-events-auto">
            {/* ২১টি অ্যানিমেটেড ব্রেকিং ব্যাজ */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-bold tracking-wider text-white shadow-2xl">
              {badgeStyle === 'radar-wave' ? (
                <span className="relative flex size-3.5 items-center justify-center">
                  <span
                    style={{ animation: `radarWave ${pulseSec}s cubic-bezier(0, 0, 0.2, 1) infinite` }}
                    className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                  />
                  <span className="relative inline-flex size-2 rounded-full bg-red-600" />
                </span>
              ) : badgeStyle === 'spinning-star' ? (
                <span
                  style={{ animation: `spinSlow ${pulseSec}s linear infinite` }}
                  className="text-amber-400 text-sm inline-block"
                >
                  ⭐
                </span>
              ) : badgeStyle === 'fire-flame' ? (
                <span
                  style={{ animation: `shapePulseDynamic ${pulseSec}s ease-in-out infinite` }}
                  className="text-sm inline-block"
                >
                  🔥
                </span>
              ) : badgeStyle === 'flash-lightning' ? (
                <span
                  style={{ animation: `shapePulseDynamic ${pulseSec}s ease-in-out infinite` }}
                  className="text-amber-300 text-sm inline-block"
                >
                  ⚡
                </span>
              ) : badgeStyle === 'diamond-pulse' ? (
                <span
                  style={{ animation: `shapePulseDynamic ${pulseSec}s ease-in-out infinite` }}
                  className="size-3 bg-amber-400 rotate-45 rounded-sm shrink-0"
                />
              ) : (
                <span
                  style={{ animation: `shapePulseDynamic ${pulseSec}s ease-in-out infinite` }}
                  className="size-3 rounded-full bg-red-600 shrink-0 shadow-[0_0_8px_#ef4444]"
                />
              )}
              <span>ব্রেকিং নিউজ / BREAKING NEWS</span>
            </div>

            {settings.breaking_title && (
              <h2 className="mt-5 text-balance font-serif text-2xl font-bold leading-snug text-white sm:text-4xl lg:text-5xl drop-shadow-md">
                {settings.breaking_title}
              </h2>
            )}

            {settings.breaking_text && (
              <p className="mt-3.5 max-w-3xl text-pretty text-sm sm:text-base leading-relaxed text-white/90 drop-shadow">
                {settings.breaking_text}
              </p>
            )}

            {bLink && (
              <div className="mt-6">
                <a
                  href={bLink}
                  {...(isExternal(bLink) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-red-700 shadow-xl"
                >
                  {bBtn}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // যদি কোনো স্লাইড না থাকে তবে অদ্ভুত ডেমো স্লাইড দেখানো হবে না
  if (slides.length === 0) {
    return null
  }

  // ২০টি জনপ্রিয় ট্রানজিশন স্টাইল নির্ধারণ
  const getTransitionClass = (isActive: boolean) => {
    switch (transMode) {
      case 'slide-left':
        return isActive ? 'translate-x-0 opacity-100 z-10' : 'translate-x-full opacity-0 pointer-events-none z-0'
      case 'slide-right':
        return isActive ? 'translate-x-0 opacity-100 z-10' : '-translate-x-full opacity-0 pointer-events-none z-0'
      case 'slide-up':
        return isActive ? 'translate-y-0 opacity-100 z-10' : 'translate-y-full opacity-0 pointer-events-none z-0'
      case 'slide-down':
        return isActive ? 'translate-y-0 opacity-100 z-10' : '-translate-y-full opacity-0 pointer-events-none z-0'
      case 'zoom-in':
        return isActive ? 'scale-100 opacity-100 z-10' : 'scale-50 opacity-0 pointer-events-none z-0'
      case 'zoom-out':
        return isActive ? 'scale-100 opacity-100 z-10' : 'scale-150 opacity-0 pointer-events-none z-0'
      case 'flip-h':
        return isActive ? '[transform:rotateY(0deg)] opacity-100 z-10' : '[transform:rotateY(90deg)] opacity-0 pointer-events-none z-0'
      case 'flip-v':
        return isActive ? '[transform:rotateX(0deg)] opacity-100 z-10' : '[transform:rotateX(90deg)] opacity-0 pointer-events-none z-0'
      case 'rotate-in':
        return isActive ? 'rotate-0 opacity-100 scale-100 z-10' : '-rotate-45 opacity-0 scale-75 pointer-events-none z-0'
      case 'cube-3d':
        return isActive ? 'translate-x-0 [transform:rotateY(0deg)] opacity-100 z-10' : 'translate-x-full [transform:rotateY(45deg)] opacity-0 pointer-events-none z-0'
      case 'blur-fade':
        return isActive ? 'blur-0 opacity-100 z-10' : 'blur-xl opacity-0 pointer-events-none z-0'
      case 'bounce-in':
        return isActive ? 'scale-100 opacity-100 z-10' : 'scale-90 -translate-y-6 opacity-0 pointer-events-none z-0'
      case 'slide-zoom':
        return isActive ? 'translate-x-0 scale-100 opacity-100 z-10' : 'translate-x-12 scale-90 opacity-0 pointer-events-none z-0'
      case 'scale-fade':
        return isActive ? 'scale-100 opacity-100 z-10' : 'scale-105 opacity-0 pointer-events-none z-0'
      case 'parallax-left':
        return isActive ? 'translate-x-0 opacity-100 z-10' : '-translate-x-1/2 opacity-0 pointer-events-none z-0'
      case 'parallax-right':
        return isActive ? 'translate-x-0 opacity-100 z-10' : 'translate-x-1/2 opacity-0 pointer-events-none z-0'
      case 'swing-in':
        return isActive ? '[transform:rotateZ(0deg)] opacity-100 z-10' : '[transform:rotateZ(-12deg)] opacity-0 pointer-events-none z-0'
      case 'twist-in':
        return isActive ? '[transform:rotate(0deg)_scale(1)] opacity-100 z-10' : '[transform:rotate(15deg)_scale(0.85)] opacity-0 pointer-events-none z-0'
      case 'ken-burns':
        return isActive ? 'scale-100 opacity-100 z-10' : 'scale-110 opacity-0 pointer-events-none z-0'
      case 'fade':
      default:
        return isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
    }
  }

  return (
    <section id="home" aria-roledescription="carousel" aria-label="Featured stories" className="bg-navy relative">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700;800&family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Noto+Sans+Bengali:wght@300;400;600;700&family=Playfair+Display:wght@600;700;800&family=Roboto:wght@400;500;700&family=Tiro+Bangla&display=swap"
      />

      <style>{`
        @keyframes heroProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes textEntrance { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverPaused(true)}
        onPointerLeave={() => {
          setHoverPaused(false)
          startRef.current = null
          setDragging(false)
        }}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          startRef.current = null
          setDragging(false)
        }}
        onFocus={(e) => setFocusPaused(e.target.matches(':focus-visible'))}
        onBlur={() => setFocusPaused(false)}
        style={{ touchAction: 'pan-y' }}
        className={cn('relative h-[480px] select-none overflow-hidden sm:h-[540px] lg:h-[620px]', focusRing)}
      >
        <div className="sr-only" aria-live={running ? 'off' : 'polite'} aria-atomic="true">
          {`${bn(total)} টির মধ্যে ${bn(index + 1)} নম্বর স্লাইড`}
        </div>

        {slides.map((slide, i) => {
          const isActive = i === index
          const ytUrl = slide.mediaType === 'video' ? getYoutubeInteractiveEmbed(slide.videoUrl) : null
          const hasAnyText = Boolean(slide.title || slide.summary || slide.category)

          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!isActive}
              className={cn('absolute inset-0 transition-all duration-700 ease-in-out', getTransitionClass(isActive))}
            >
              {/* ব্যাকগ্রাউন্ড মিডিয়া */}
              {slide.mediaType === 'video' ? (
                isActive ? (
                  ytUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <iframe
                        src={ytUrl}
                        className="w-full h-full aspect-video pointer-events-auto border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title="Video Player"
                      />
                    </div>
                  ) : slide.videoUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <video
                        src={slide.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full max-h-[620px] object-contain pointer-events-auto"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-slate-900" />
                  )
                ) : (
                  <div className="absolute inset-0 bg-black" />
                )
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-black/90 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                    style={{ objectPosition: slide.pos }}
                    className={cn(
                      'w-full h-full transition-transform duration-[6000ms] ease-out',
                      slide.fitMode === 'cover' ? 'object-cover' : 'object-contain',
                      isActive && !reduceMotion ? 'scale-105' : 'scale-100',
                    )}
                  />
                </div>
              )}

              {/* কাস্টমাইজড গ্লাস কার্ড ও নিখুঁত পজিশন কন্ট্রোল */}
              {hasAnyText && (
                <div
                  className={cn(
                    'absolute inset-0 pointer-events-none p-4 pb-20 sm:p-10 sm:pb-24 z-10 flex',
                    slide.contentPosV === 'top'
                      ? 'items-start pt-10 sm:pt-14'
                      : slide.contentPosV === 'center'
                        ? 'items-center'
                        : 'items-end',
                    slide.contentPosH === 'right'
                      ? 'justify-end'
                      : slide.contentPosH === 'center'
                        ? 'justify-center'
                        : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'pointer-events-auto transition-all duration-300',
                      slide.showCardBg ? 'border border-white/20 shadow-2xl' : '',
                      slide.textAlign === 'center'
                        ? 'text-center'
                        : slide.textAlign === 'right'
                          ? 'text-right'
                          : 'text-left',
                    )}
                    style={{
                      width: `${slide.cardWidthPct ?? 90}%`,
                      maxWidth: '100%',
                      padding: slide.showCardBg ? `${slide.cardPaddingVal ?? 20}px` : undefined,
                      borderRadius: slide.showCardBg
                        ? `${Math.round(((slide.cardRadiusPct ?? 20) / 100) * 45)}px`
                        : undefined,
                      backgroundColor: slide.showCardBg
                        ? hexToRgba(slide.cardBgColor, slide.cardOpacity)
                        : 'transparent',
                      backdropFilter: slide.showCardBg
                        ? `blur(${slide.cardBlur ?? 12}px)`
                        : undefined,
                      WebkitBackdropFilter: slide.showCardBg
                        ? `blur(${slide.cardBlur ?? 12}px)`
                        : undefined,
                      animation:
                        isActive && isMotionEnabled && !reduceMotion
                          ? 'textEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                          : undefined,
                    }}
                  >
                    {/* ব্যাজ ও তারিখ */}
                    {(slide.category || slide.date) && (
                      <div
                        className={cn(
                          'flex flex-wrap items-center gap-2 sm:gap-3',
                          slide.textAlign === 'center'
                            ? 'justify-center'
                            : slide.textAlign === 'right'
                              ? 'justify-end'
                              : 'justify-start',
                        )}
                      >
                        {slide.category && (
                          <span
                            className="rounded px-2.5 py-1 text-xs font-bold tracking-wider text-navy"
                            style={{ backgroundColor: slide.badgeColor || '#EAB308' }}
                          >
                            {slide.category}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/90">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          {slide.date}
                        </span>
                      </div>
                    )}

                    {/* শিরোনাম (ঐচ্ছিক ব্যাকগ্রাউন্ড হাইলাইটসহ) */}
                    {slide.title && (
                      <h2
                        className="mt-3 text-balance text-lg sm:text-2xl lg:text-3xl leading-snug"
                        style={{
                          color: slide.titleColor || '#FFFFFF',
                          fontFamily: slide.fontFamily || undefined,
                          fontWeight: slide.fontWeight || '700',
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: slide.titleBgColor || undefined,
                            padding: slide.titleBgColor ? '2px 8px' : undefined,
                            borderRadius: slide.titleBgColor ? '6px' : undefined,
                            boxDecorationBreak: 'clone',
                            WebkitBoxDecorationBreak: 'clone',
                          }}
                        >
                          {slide.title}
                        </span>
                      </h2>
                    )}

                    {/* বিবরণ */}
                    {slide.summary && (
                      <p className="mt-2.5 line-clamp-3 text-pretty text-xs sm:text-sm leading-relaxed text-white/90">
                        {slide.summary}
                      </p>
                    )}

                    {/* বাটন */}
                    {(slide.link || slide.summary) && (
                      <div
                        className={cn(
                          'mt-4',
                          slide.textAlign === 'center'
                            ? 'flex justify-center'
                            : slide.textAlign === 'right'
                              ? 'flex justify-end'
                              : 'flex justify-start',
                        )}
                      >
                        {slide.link && slide.link !== '#' && slide.link !== '#general-news' ? (
                          <a
                            href={slide.link}
                            {...(isExternal(slide.link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            tabIndex={isActive ? 0 : -1}
                            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-brand shadow-lg"
                          >
                            {slide.buttonText}
                            {isExternal(slide.link) ? <ExternalLink className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setModalSlide(slide)}
                            tabIndex={isActive ? 0 : -1}
                            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-brand shadow-lg"
                          >
                            {slide.buttonText}
                            <ArrowRight className="size-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* নেভিগেশন কন্ট্রোল তীর ও বাটন */}
        {total > 1 && (
          <>
            <div className="absolute bottom-6 right-6 flex items-center gap-2 sm:bottom-8 sm:right-10 z-20">
              {!reduceMotion && !isUnlimited && !currentSlideIsVideo && (
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে বন্ধ করুন'}
                  className={cn(
                    'flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand',
                    focusRing,
                  )}
                >
                  {userPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="আগের স্লাইড"
                className={cn(
                  'flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand',
                  focusRing,
                )}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="পরের স্লাইড"
                className={cn(
                  'flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand',
                  focusRing,
                )}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="absolute bottom-7 left-6 flex items-center gap-2 sm:left-12 z-20">
              {slides.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${bn(i + 1)} নম্বর স্লাইডে যান`}
                  aria-current={i === index}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    focusRing,
                    i === index ? 'w-8 bg-gold' : 'w-2 bg-white/60 hover:bg-white',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* প্রোগ্রেস বার */}
        {canAutoplay && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-20" aria-hidden="true">
            <div
              key={index}
              onAnimationEnd={next}
              className="h-full origin-left bg-gold"
              style={{
                animation: `heroProgress ${slideMs}ms linear forwards`,
                animationPlayState: running ? 'running' : 'paused',
              }}
            />
          </div>
        )}
      </div>

      {/* পপ-আপ মোডাল */}
      {modalSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setModalSlide(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
              aria-label="বন্ধ করুন"
            >
              <X className="size-5" />
            </button>

            {modalSlide.mediaType === 'image' && modalSlide.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={modalSlide.image}
                alt=""
                className="h-64 w-full rounded-xl object-contain bg-black"
                style={{ objectPosition: modalSlide.pos }}
              />
            )}

            <div className="flex items-center gap-2">
              {modalSlide.category && (
                <span
                  className="rounded px-2.5 py-1 text-xs font-bold text-navy"
                  style={{ backgroundColor: modalSlide.badgeColor || '#EAB308' }}
                >
                  {modalSlide.category}
                </span>
              )}
              <span className="text-xs text-gray-500">{modalSlide.date}</span>
            </div>

            {modalSlide.title && (
              <h3
                className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug"
                style={{ fontFamily: modalSlide.fontFamily || undefined }}
              >
                {modalSlide.title}
              </h3>
            )}

            <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {modalSlide.summary || 'কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।'}
            </p>

            <button
              onClick={() => setModalSlide(null)}
              className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
