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
  mediaUrls: string | null
  buttonText: string

  titleFont: string | null
  titleSize: string
  titleStyle: string
  titleColor: string | null
  titleBgColor: string | null

  summaryFont: string | null
  summarySize: string
  summaryStyle: string
  summaryColor: string | null

  badgeFont: string | null
  badgeSize: string
  badgeTextColor: string | null
  badgeColor: string | null

  btnFont: string | null
  btnSize: string
  btnColor: string | null
  btnBgColor: string | null

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

// ১০০% সুরক্ষিত আরজিবিএ কনভার্টার (কখনো ক্র্যাশ করবে না)
function hexToRgba(hex: any, opacity: any) {
  const alpha = (Number(opacity) || 60) / 100
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0, 0, 0, ${alpha})`
  try {
    let c = hex.substring(1)
    if (c.length === 3) c = c.split('').map((x) => x + x).join('')
    const num = parseInt(c, 16)
    if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
  } catch {
    return `rgba(0, 0, 0, ${alpha})`
  }
}

// সুরক্ষিত সাইজ ক্লাস
const getSizeClass = (s?: string | null) => {
  switch (s) {
    case 'sm': return 'text-xs sm:text-sm'
    case 'base': return 'text-sm sm:text-base'
    case 'lg': return 'text-base sm:text-lg'
    case 'xl': return 'text-lg sm:text-xl'
    case '2xl': return 'text-xl sm:text-3xl'
    case '3xl': return 'text-2xl sm:text-4xl lg:text-5xl'
    case '4xl': return 'text-3xl sm:text-5xl lg:text-6xl'
    default: return 'text-xl sm:text-3xl'
  }
}

// সুরক্ষিত স্টাইল ক্লাস
const getStyleClass = (st?: string | null) => {
  switch (st) {
    case 'italic': return 'italic font-normal'
    case 'bold-italic': return 'italic font-bold'
    case 'normal': return 'font-normal not-italic'
    case 'bold':
    default: return 'font-bold not-italic'
  }
}

// সুরক্ষিত ডেট ফরম্যাটার
function safeDate(d: any) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    return isNaN(dt.getTime())
      ? ''
      : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })
  } catch {
    return ''
  }
}

function toSlide(s: HeroSlide): Slide {
  const finalLink = s.link_url?.trim() || (s.media_type === 'video' && s.video_url ? s.video_url.trim() : null)

  return {
    key: String(s.id || Math.random()),
    image: s.image_url || '/images/hero-1.png',
    pos: s.image_pos || 'center',
    category: s.category?.trim() || null,
    date: safeDate(s.created_at),
    title: s.title?.trim() || null,
    summary: s.summary?.trim() || null,
    link: finalLink,
    alt: s.title || 'Hero Banner',
    mediaType: s.media_type || 'image',
    videoUrl: s.video_url || null,
    extraMedia: typeof s.extra_media === 'string' ? s.extra_media : null,
    mediaUrls: typeof s.media_urls === 'string' ? s.media_urls : null,
    buttonText: s.button_text?.trim() || 'বিস্তারিত',

    titleFont: s.title_font || "'Hind Siliguri', sans-serif",
    titleSize: s.title_size || '2xl',
    titleStyle: s.title_style || 'bold',
    titleColor: s.title_color || '#FFFFFF',
    titleBgColor: s.title_bg_color || null,

    summaryFont: s.summary_font || "'Hind Siliguri', sans-serif",
    summarySize: s.summary_size || 'base',
    summaryStyle: s.summary_style || 'normal',
    summaryColor: s.summary_color || '#e2e8f0',

    badgeFont: s.badge_font || "'Hind Siliguri', sans-serif",
    badgeSize: s.badge_size || 'xs',
    badgeTextColor: s.badge_text_color || '#0f172a',
    badgeColor: s.badge_color || '#EAB308',

    btnFont: s.btn_font || "'Hind Siliguri', sans-serif",
    btnSize: s.btn_size || 'sm',
    btnColor: s.btn_color || '#ffffff',
    btnBgColor: s.btn_bg_color || '#15803d',

    textAlign: s.text_align || 'left',
    contentPosV: s.content_pos_v || 'bottom',
    contentPosH: s.content_pos_h || 'left',
    showCardBg: s.show_card_bg ?? true,
    cardWidthPct: Number(s.card_width_pct) || 90,
    cardRadiusPct: Number(s.card_radius_pct) || 20,
    cardPaddingVal: Number(s.card_padding_val) || 20,
    cardBlur: Number(s.card_blur) || 12,
    cardBgColor: s.card_bg_color || '#000000',
    cardOpacity: Number(s.card_opacity) || 60,
    fitMode: s.fit_mode || 'contain',
  }
}

const isExternal = (u: string) => /^https?:\/\//i.test(u)
const bn = (n: number) => n.toLocaleString('bn-BD')
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

// সুরক্ষিত ইউটিউব লিঙ্ক এক্সট্র্যাক্টর
function getYoutubeInteractiveEmbed(url: any) {
  if (!url || typeof url !== 'string') return null
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1`
    }
  } catch {}
  return null
}

const AUTO_EFFECT_LIST = [
  'typewriter', 'zoom-pop', 'neon-pulse', 'bounce-in', 'flip-3d',
  'cyber-glitch', 'smoke-fade', 'letter-wave', 'slide-left',
  'slide-right', 'slide-up-drop', 'shake-alert', 'tracking-expand',
  'golden-shimmer', 'twist-3d', 'smooth-float',
]

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [subMediaIdx, setSubMediaIdx] = useState(0)

  const [hoverPaused, setHoverPaused] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [modalSlide, setModalSlide] = useState<Slide | null>(null)

  const [autoEffectIdx, setAutoEffectIdx] = useState(0)
  const [breakingMediaIdx, setBreakingMediaIdx] = useState(0)

  const startRef = useRef<{ x: number; y: number } | null>(null)
  const total = slides.length

  const slideMs = Number(settings?.slide_speed) || 4500
  const isUnlimited = slideMs <= 0
  const transMode = settings?.transition_type || 'fade'
  const isMotionEnabled = settings?.text_motion ?? true

  useEffect(() => {
    let on = true
    Promise.all([getHeroSlides(), getHeroSettings()])
      .then(([rows, s]) => {
        if (!on) return
        const safeRows = Array.isArray(rows) ? rows : []
        const activeRows = safeRows.filter(
          (r) => r.is_active && (!r.expires_at || new Date(r.expires_at) > new Date())
        )
        setSlides(activeRows.map(toSlide))
        setIndex(0)
        setSettings(s)
        setLoaded(true)
      })
      .catch(() => {
        if (on) setLoaded(true)
      })

    return () => {
      on = false
    }
  }, [])

  // মিডিয়া লিস্ট সুরক্ষিতভাবে তৈরি
  const currentSlide = slides[index] || null
  const currentMediaList: Array<{ type: 'image' | 'video'; url: string }> = []
  if (currentSlide) {
    if (currentSlide.mediaType === 'video' && currentSlide.videoUrl) {
      currentMediaList.push({ type: 'video', url: currentSlide.videoUrl })
    } else if (currentSlide.image) {
      currentMediaList.push({ type: 'image', url: currentSlide.image })
    }

    if (currentSlide.mediaUrls && typeof currentSlide.mediaUrls === 'string') {
      try {
        currentSlide.mediaUrls
          .split(/[\n,]+/)
          .map((u) => u.trim())
          .filter(Boolean)
          .forEach((u) => {
            if (!currentMediaList.some((m) => m.url === u)) {
              currentMediaList.push({
                type: /youtube\.com|youtu\.be|\.mp4$/i.test(u) ? 'video' : 'image',
                url: u,
              })
            }
          })
      } catch {}
    }
  }

  const currentMedia = currentMediaList[subMediaIdx] || currentMediaList[0] || null
  const currentIsVideo = currentMedia?.type === 'video'

  const go = useCallback(
    (nextIdx: number) => {
      if (total === 0) return
      setIndex((nextIdx + total) % total)
      setSubMediaIdx(0)
    },
    [total]
  )

  const handleNextStep = useCallback(() => {
    if (currentMediaList.length > 1 && subMediaIdx < currentMediaList.length - 1) {
      setSubMediaIdx((prev) => prev + 1)
    } else {
      setSubMediaIdx(0)
      if (total > 0) setIndex((i) => (i + 1) % total)
    }
  }, [currentMediaList.length, subMediaIdx, total])

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

  useEffect(() => {
    if (settings?.breaking_text_effect === 'auto') {
      const timer = setInterval(() => {
        setAutoEffectIdx((prev) => (prev + 1) % AUTO_EFFECT_LIST.length)
      }, 4500)
      return () => clearInterval(timer)
    }
  }, [settings?.breaking_text_effect])

  const breakingMediaList: Array<{ type: 'image' | 'video'; url: string }> = []
  if (settings?.breaking_media_url) {
    breakingMediaList.push({
      type: settings.breaking_media_type === 'video' ? 'video' : 'image',
      url: settings.breaking_media_url,
    })
  }
  if (settings?.breaking_extra_media && typeof settings.breaking_extra_media === 'string') {
    try {
      const extras = settings.breaking_extra_media.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean)
      extras.forEach((u) => {
        breakingMediaList.push({
          type: /youtube\.com|youtu\.be|\.mp4$/i.test(u) ? 'video' : 'image',
          url: u,
        })
      })
    } catch {}
  }

  useEffect(() => {
    if (breakingMediaList.length > 1) {
      const timer = setInterval(() => {
        setBreakingMediaIdx((prev) => (prev + 1) % breakingMediaList.length)
      }, 5500)
      return () => clearInterval(timer)
    }
  }, [breakingMediaList.length])

  const canAutoplay = total > 1 && !reduceMotion && !modalSlide && !isUnlimited && !currentIsVideo
  const running = canAutoplay && !userPaused && !hoverPaused && !focusPaused && !dragging && !tabHidden

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

  // ২০টি ট্রানজিশন ক্লাস
  const getTransitionClass = (isActive: boolean) => {
    switch (transMode) {
      case 'slide-left': return isActive ? 'translate-x-0 opacity-100 z-10' : 'translate-x-full opacity-0 pointer-events-none z-0'
      case 'slide-right': return isActive ? 'translate-x-0 opacity-100 z-10' : '-translate-x-full opacity-0 pointer-events-none z-0'
      case 'slide-up': return isActive ? 'translate-y-0 opacity-100 z-10' : 'translate-y-full opacity-0 pointer-events-none z-0'
      case 'slide-down': return isActive ? 'translate-y-0 opacity-100 z-10' : '-translate-y-full opacity-0 pointer-events-none z-0'
      case 'zoom-in': return isActive ? 'scale-100 opacity-100 z-10' : 'scale-50 opacity-0 pointer-events-none z-0'
      case 'zoom-out': return isActive ? 'scale-100 opacity-100 z-10' : 'scale-150 opacity-0 pointer-events-none z-0'
      case 'flip-h': return isActive ? '[transform:rotateY(0deg)] opacity-100 z-10' : '[transform:rotateY(90deg)] opacity-0 pointer-events-none z-0'
      case 'flip-v': return isActive ? '[transform:rotateX(0deg)] opacity-100 z-10' : '[transform:rotateX(90deg)] opacity-0 pointer-events-none z-0'
      case 'rotate-in': return isActive ? 'rotate-0 opacity-100 scale-100 z-10' : '-rotate-45 opacity-0 scale-75 pointer-events-none z-0'
      case 'cube-3d': return isActive ? 'translate-x-0 [transform:rotateY(0deg)] opacity-100 z-10' : 'translate-x-full [transform:rotateY(45deg)] opacity-0 pointer-events-none z-0'
      case 'blur-fade': return isActive ? 'blur-0 opacity-100 z-10' : 'blur-xl opacity-0 pointer-events-none z-0'
      case 'bounce-in': return isActive ? 'scale-100 opacity-100 z-10' : 'scale-90 -translate-y-6 opacity-0 pointer-events-none z-0'
      case 'slide-zoom': return isActive ? 'translate-x-0 scale-100 opacity-100 z-10' : 'translate-x-12 scale-90 opacity-0 pointer-events-none z-0'
      case 'scale-fade': return isActive ? 'scale-100 opacity-100 z-10' : 'scale-105 opacity-0 pointer-events-none z-0'
      case 'parallax-left': return isActive ? 'translate-x-0 opacity-100 z-10' : '-translate-x-1/2 opacity-0 pointer-events-none z-0'
      case 'parallax-right': return isActive ? 'translate-x-0 opacity-100 z-10' : 'translate-x-1/2 opacity-0 pointer-events-none z-0'
      case 'swing-in': return isActive ? '[transform:rotateZ(0deg)] opacity-100 z-10' : '[transform:rotateZ(-12deg)] opacity-0 pointer-events-none z-0'
      case 'twist-in': return isActive ? '[transform:rotate(0deg)_scale(1)] opacity-100 z-10' : '[transform:rotate(15deg)_scale(0.85)] opacity-0 pointer-events-none z-0'
      case 'ken-burns': return isActive ? 'scale-100 opacity-100 z-10' : 'scale-110 opacity-0 pointer-events-none z-0'
      case 'fade':
      default: return isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
    }
  }

  return (
    <div id="home" className="flex flex-col bg-navy relative">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700;800&family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Noto+Sans+Bengali:wght@300;400;600;700&family=Playfair+Display:wght@600;700;800&family=Roboto:wght@400;500;700&family=Tiro+Bangla&display=swap"
      />

      {/* ========================================================
          ১. জরুরি ব্রেকিং মোড (সবার ওপরে স্বাধীনভাবে অবস্থান করবে)
      ======================================================== */}
      {settings?.breaking_on && (
        <section className="relative overflow-hidden border-b border-red-900/60 shadow-2xl">
          {(() => {
            const bLink = settings.breaking_link
            const bBtn = settings.breaking_btn_text || 'বিস্তারিত'
            const shapeSpeedPct = Number(settings.breaking_pulse_speed_pct) || 50
            const shapePulseSec = Math.max(0.4, 3.5 - (shapeSpeedPct / 100) * 3.1).toFixed(2)
            const textSpeedPct = Number(settings.breaking_text_speed_pct) || 50
            const textAnimSec = Math.max(0.4, 3.5 - (textSpeedPct / 100) * 3.0).toFixed(2)

            const activeTextEffect =
              settings.breaking_text_effect === 'auto' || !settings.breaking_text_effect
                ? AUTO_EFFECT_LIST[autoEffectIdx]
                : settings.breaking_text_effect

            const breakingBgStyle =
              breakingMediaList.length === 0
                ? {
                    background: `linear-gradient(135deg, ${settings?.breaking_bg_color || '#881337'}, ${settings?.breaking_bg_gradient || '#0f172a'})`,
                  }
                : undefined

            const badgeStyle = settings.breaking_badge_style || 'pulse-circle'
            const curMedia = breakingMediaList[breakingMediaIdx] || null
            const bYt = curMedia?.type === 'video' ? getYoutubeInteractiveEmbed(curMedia.url) : null

            return (
              <div
                style={breakingBgStyle}
                className="relative flex min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] items-center overflow-hidden bg-slate-950 py-10"
              >
                {curMedia && (
                  <div className="absolute inset-0">
                    {curMedia.type === 'video' ? (
                      bYt ? (
                        <iframe
                          src={bYt}
                          className="w-full h-full aspect-video border-0 pointer-events-auto"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Breaking Video"
                        />
                      ) : (
                        <video src={curMedia.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                      )
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={curMedia.url} alt="" className="w-full h-full object-cover transition-opacity duration-1000" />
                    )}
                  </div>
                )}

                {breakingMediaList.length > 1 && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                      onClick={() => setBreakingMediaIdx((p) => (p - 1 + breakingMediaList.length) % breakingMediaList.length)}
                      className="p-2 rounded-full bg-black/60 text-white backdrop-blur hover:bg-white hover:text-black transition-all cursor-pointer"
                      aria-label="আগের মিডিয়া"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => setBreakingMediaIdx((p) => (p + 1) % breakingMediaList.length)}
                      className="p-2 rounded-full bg-black/60 text-white backdrop-blur hover:bg-white hover:text-black transition-all cursor-pointer"
                      aria-label="পরের মিডিয়া"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/35 pointer-events-none" />

                <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-12 pointer-events-auto">
                  <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-bold tracking-wider text-white shadow-2xl">
                    <span
                      style={{ animation: `shapePulseDynamic ${shapePulseSec}s ease-in-out infinite` }}
                      className="size-3 rounded-full bg-red-600 shrink-0 shadow-[0_0_8px_#ef4444]"
                    />
                    <span>ব্রেকিং নিউজ / BREAKING NEWS</span>
                  </div>

                  {settings.breaking_title && (
                    <h2
                      className={cn('mt-4 text-balance font-serif font-bold leading-snug drop-shadow-md', getSizeClass(settings.breaking_title_size))}
                      style={{ color: settings.breaking_title_color || '#ffffff' }}
                    >
                      {settings.breaking_title}
                    </h2>
                  )}

                  {settings.breaking_text && (
                    <p
                      className={cn('mt-3 max-w-3xl text-pretty leading-relaxed drop-shadow', getSizeClass(settings.breaking_text_size))}
                      style={{ color: settings.breaking_text_color || '#f1f5f9' }}
                    >
                      {settings.breaking_text}
                    </p>
                  )}

                  {bLink && (
                    <div className="mt-5">
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
            )
          })()}
        </section>
      )}

      {/* ========================================================
          ২. মূল হিরো স্লাইডার (ব্রেকিং মোডের নিচেই স্বাচ্ছন্দ্যে চলবে)
      ======================================================== */}
      {slides.length > 0 && (
        <section aria-roledescription="carousel" aria-label="Featured stories" className="relative">
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
              const ytUrl = currentMedia?.type === 'video' ? getYoutubeInteractiveEmbed(currentMedia.url) : null
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
                  {/* মিডিয়া প্লেয়ার */}
                  {currentMedia?.type === 'video' ? (
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
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                          <video
                            src={currentMedia.url}
                            controls
                            playsInline
                            className="w-full h-full max-h-[620px] object-contain pointer-events-auto"
                          />
                        </div>
                      )
                    ) : (
                      <div className="absolute inset-0 bg-black" />
                    )
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/90 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={isActive ? currentMedia?.url || slide.image : slide.image}
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

                  {/* নেস্টেড একাধিক ছবি থাকলে সাব-ইন্ডিকেটর */}
                  {isActive && currentMediaList.length > 1 && (
                    <div className="absolute top-4 left-6 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
                      <span className="text-[11px] text-white/90">
                        ছবি {bn(subMediaIdx + 1)} / {bn(currentMediaList.length)}
                      </span>
                    </div>
                  )}

                  {/* স্বাধীন টেক্সট টুলস ও গ্লাস কার্ড */}
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
                          backdropFilter: slide.showCardBg ? `blur(${slide.cardBlur ?? 12}px)` : undefined,
                          WebkitBackdropFilter: slide.showCardBg ? `blur(${slide.cardBlur ?? 12}px)` : undefined,
                          animation:
                            isActive && isMotionEnabled && !reduceMotion
                              ? 'textEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                              : undefined,
                        }}
                      >
                        {/* ব্যাজ */}
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
                                className="rounded px-2.5 py-1 tracking-wider inline-block font-semibold"
                                style={{
                                  backgroundColor: slide.badgeColor || '#EAB308',
                                  color: slide.badgeTextColor || '#0f172a',
                                  fontFamily: slide.badgeFont || undefined,
                                  fontSize: slide.badgeSize === 'xs' ? '12px' : slide.badgeSize === 'sm' ? '14px' : '15px',
                                }}
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

                        {/* শিরোনাম */}
                        {slide.title && (
                          <h2
                            className={cn('mt-3 text-balance leading-snug', getSizeClass(slide.titleSize), getStyleClass(slide.titleStyle))}
                            style={{
                              color: slide.titleColor || '#FFFFFF',
                              fontFamily: slide.titleFont || undefined,
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
                          <p
                            className={cn('mt-2.5 line-clamp-3 text-pretty leading-relaxed', getSizeClass(slide.summarySize), getStyleClass(slide.summaryStyle))}
                            style={{
                              color: slide.summaryColor || '#e2e8f0',
                              fontFamily: slide.summaryFont || undefined,
                            }}
                          >
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
                                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-all hover:gap-3 shadow-lg"
                                style={{
                                  backgroundColor: slide.btnBgColor || '#15803d',
                                  color: slide.btnColor || '#ffffff',
                                  fontFamily: slide.btnFont || undefined,
                                  fontSize: slide.btnSize === 'sm' ? '13px' : slide.btnSize === 'base' ? '15px' : '16px',
                                }}
                              >
                                {slide.buttonText}
                                {isExternal(slide.link) ? <ExternalLink className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setModalSlide(slide)}
                                tabIndex={isActive ? 0 : -1}
                                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-all hover:gap-3 shadow-lg cursor-pointer"
                                style={{
                                  backgroundColor: slide.btnBgColor || '#15803d',
                                  color: slide.btnColor || '#ffffff',
                                  fontFamily: slide.btnFont || undefined,
                                  fontSize: slide.btnSize === 'sm' ? '13px' : slide.btnSize === 'base' ? '15px' : '16px',
                                }}
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

            {/* নেভিগেশন কন্ট্রোল */}
            {total > 1 && (
              <>
                <div className="absolute bottom-6 right-6 flex items-center gap-2 sm:bottom-8 sm:right-10 z-20">
                  {!reduceMotion && !isUnlimited && !currentIsVideo && (
                    <button
                      type="button"
                      onClick={() => setUserPaused((p) => !p)}
                      aria-label={userPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে বন্ধ করুন'}
                      className={cn(
                        'flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand cursor-pointer',
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
                      'flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand cursor-pointer',
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
                      'flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand cursor-pointer',
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
                        'h-2 rounded-full transition-all cursor-pointer',
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
                  key={`${index}-${subMediaIdx}`}
                  onAnimationEnd={handleNextStep}
                  className="h-full origin-left bg-gold"
                  style={{
                    animation: `heroProgress ${slideMs}ms linear forwards`,
                    animationPlayState: running ? 'running' : 'paused',
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* পপ-আপ মোডাল */}
      {modalSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setModalSlide(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-black cursor-pointer"
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
                style={{ fontFamily: modalSlide.titleFont || undefined }}
              >
                {modalSlide.title}
              </h3>
            )}

            <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {modalSlide.summary || 'কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।'}
            </p>

            <button
              onClick={() => setModalSlide(null)}
              className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-800 cursor-pointer"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
