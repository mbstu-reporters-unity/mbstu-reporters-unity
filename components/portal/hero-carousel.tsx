'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Pause, Play, X, ExternalLink } from 'lucide-react'
import { heroSlides } from '@/lib/data'
import { getHeroSlides, getHeroSettings, MAX_LIVE } from '@/lib/hero'
import type { HeroSlide, HeroSettings } from '@/lib/hero'
import { cn } from '@/lib/utils'

type Slide = {
  key: string
  image: string
  pos: string
  category: string
  date: string
  title: string
  summary: string
  link: string | null
  alt: string
  mediaType: 'image' | 'video'
  videoUrl: string | null
  buttonText: string
  titleColor: string | null
  badgeColor: string | null
  fontFamily: string | null
  fontWeight: string | null
  textAlign: 'left' | 'center' | 'right'
}

// ডেটাবেসে স্লাইড না থাকলে নমুনা স্লাইড
const fallback: Slide[] = heroSlides.map((s) => ({
  key: s.image,
  image: s.image,
  pos: 'center',
  category: s.category,
  date: s.date,
  title: s.title,
  summary: s.summary,
  link: '#general-news',
  alt: s.title,
  mediaType: 'image',
  videoUrl: null,
  buttonText: 'বিস্তারিত',
  titleColor: null,
  badgeColor: null,
  fontFamily: "'Hind Siliguri', sans-serif",
  fontWeight: '700',
  textAlign: 'left',
}))

function toSlide(s: HeroSlide): Slide {
  // যদি ভিডিও স্লাইড হয় এবং আলাদা লিংক না থাকে, তবে ভিডিওর লিংককেই মূল লিংক ধরা হবে
  const finalLink = s.link_url?.trim() || (s.media_type === 'video' && s.video_url ? s.video_url.trim() : null)

  return {
    key: s.id,
    image: s.image_url || '/images/hero-1.png',
    pos: s.image_pos,
    category: s.category || 'সংবাদ',
    date: new Date(s.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    }),
    title: s.title,
    summary: s.summary || '',
    link: finalLink,
    alt: s.title,
    mediaType: s.media_type || 'image',
    videoUrl: s.video_url || null,
    buttonText: s.button_text?.trim() || 'বিস্তারিত',
    titleColor: s.title_color || null,
    badgeColor: s.badge_color || null,
    fontFamily: s.font_family || "'Hind Siliguri', sans-serif",
    fontWeight: s.font_weight || '700',
    textAlign: s.text_align || 'left',
  }
}

const isExternal = (u: string) => /^https?:\/\//i.test(u)
const bn = (n: number) => n.toLocaleString('bn-BD')
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

// ইউটিউব লিঙ্ক কনভার্ট করা
function getYoutubeEmbed(url: string | null) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&controls=0&modestbranding=1`
  }
  return null
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(fallback)
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  // লিংক না থাকলে পপ-আপ দেখানোর স্টেট
  const [modalSlide, setModalSlide] = useState<Slide | null>(null)

  const startRef = useRef<{ x: number; y: number } | null>(null)
  const didSwipeRef = useRef(false)
  const total = slides.length

  const slideMs = settings?.slide_speed || 4500
  const transMode = settings?.transition_type || 'fade'
  const isMotionEnabled = settings?.text_motion ?? true

  useEffect(() => {
    let on = true
    Promise.all([getHeroSlides(), getHeroSettings()]).then(([rows, s]) => {
      if (!on) return
      const live = rows.slice(0, MAX_LIVE)
      setSlides(live.length > 0 ? live.map(toSlide) : fallback)
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

  const canAutoplay = total > 1 && !reduceMotion && !modalSlide
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
    if ((e.target as HTMLElement).closest('button, a')) return
    startRef.current = { x: e.clientX, y: e.clientY }
    didSwipeRef.current = false
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
      didSwipeRef.current = true
      go(index + (dx < 0 ? 1 : -1))
    }
  }

  if (!loaded) {
    return (
      <section id="home" className="bg-navy">
        <div className="h-[480px] sm:h-[540px] lg:h-[600px]" />
      </section>
    )
  }

  // জরুরি ব্রেকিং মোড
  if (settings?.breaking_on) {
    const bLink = settings.breaking_link
    return (
      <section id="home" className="bg-navy">
        <div className="relative flex h-[480px] items-center overflow-hidden bg-gradient-to-br from-crimson via-navy to-navy sm:h-[540px] lg:h-[600px]">
          <div className="mx-auto w-full max-w-5xl px-6 sm:px-12">
            <span className="inline-flex items-center gap-2 rounded bg-white px-3 py-1 text-sm font-bold tracking-wider text-crimson">
              <span className="size-2.5 animate-pulse rounded-full bg-crimson" aria-hidden="true" />
              ব্রেকিং নিউজ / BREAKING
            </span>
            <h2 className="mt-5 text-balance font-serif text-3xl font-bold leading-snug text-white sm:text-5xl lg:text-6xl">
              {settings.breaking_title}
            </h2>
            {settings.breaking_text && (
              <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg">
                {settings.breaking_text}
              </p>
            )}
            {bLink && (
              <a
                href={bLink}
                {...(isExternal(bLink) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-crimson transition-all hover:bg-gold hover:text-navy"
              >
                বিস্তারিত / Read More
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>
    )
  }

  const getTransitionClass = (isActive: boolean) => {
    if (transMode === 'slide-left') {
      return isActive ? 'translate-x-0 opacity-100 z-10' : 'translate-x-full opacity-0 pointer-events-none z-0'
    }
    if (transMode === 'slide-right') {
      return isActive ? 'translate-x-0 opacity-100 z-10' : '-translate-x-full opacity-0 pointer-events-none z-0'
    }
    if (transMode === 'slide-up') {
      return isActive ? 'translate-y-0 opacity-100 z-10' : 'translate-y-full opacity-0 pointer-events-none z-0'
    }
    return isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
  }

  return (
    <section id="home" aria-roledescription="carousel" aria-label="Featured stories" className="bg-navy relative">
      {/* গুগল ফন্ট লোড লিংক */}
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
        className={cn('relative h-[480px] select-none overflow-hidden sm:h-[540px] lg:h-[600px]', focusRing)}
      >
        <div className="sr-only" aria-live={running ? 'off' : 'polite'} aria-atomic="true">
          {`${bn(total)} টির মধ্যে ${bn(index + 1)} নম্বর স্লাইড`}
        </div>

        {slides.map((slide, i) => {
          const isActive = i === index
          const ytUrl = slide.mediaType === 'video' ? getYoutubeEmbed(slide.videoUrl) : null

          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!isActive}
              className={cn('absolute inset-0 transition-all duration-700 ease-in-out', getTransitionClass(isActive))}
            >
              {/* ব্যাকগ্রাউন্ড মিডিয়া: কোনো কালার ব্লেন্ড ছাড়া ক্রিস্টাল ক্লিয়ার */}
              {slide.mediaType === 'video' ? (
                ytUrl ? (
                  <iframe
                    src={ytUrl}
                    className="absolute inset-0 h-full w-full pointer-events-none object-cover scale-125"
                    allow="autoplay; encrypted-media"
                    title={slide.title}
                  />
                ) : slide.videoUrl ? (
                  <video
                    src={slide.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-900" />
                )
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                  style={{ objectPosition: slide.pos }}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-transform duration-[6000ms] ease-out',
                    isActive && !reduceMotion ? 'scale-105' : 'scale-100',
                  )}
                />
              )}

              {/* অত্যন্ত হালকা ন্যাচারাল শ্যাডো (ভিডিও বা ছবি নষ্ট করবে না, কিন্তু টেক্সট স্পষ্ট করবে) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* কন্টেন্ট বক্স */}
              <div
                className={cn(
                  'absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-16 sm:px-12 sm:pb-20 z-10 flex flex-col',
                  slide.textAlign === 'center'
                    ? 'items-center text-center'
                    : slide.textAlign === 'right'
                      ? 'items-end text-right'
                      : 'items-start text-left',
                )}
              >
                <div
                  className="max-w-3xl"
                  style={
                    isActive && isMotionEnabled && !reduceMotion
                      ? { animation: 'textEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }
                      : {}
                  }
                >
                  <div
                    className={cn(
                      'flex flex-wrap items-center gap-3',
                      slide.textAlign === 'center'
                        ? 'justify-center'
                        : slide.textAlign === 'right'
                          ? 'justify-end'
                          : 'justify-start',
                    )}
                  >
                    <span
                      className="rounded px-2.5 py-1 text-xs font-bold tracking-wider text-navy"
                      style={{ backgroundColor: slide.badgeColor || '#EAB308' }}
                    >
                      {slide.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-white/90">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      {slide.date}
                    </span>
                  </div>

                  <h2
                    className="mt-4 text-balance text-2xl leading-snug sm:text-4xl lg:text-5xl"
                    style={{
                      color: slide.titleColor || '#FFFFFF',
                      fontFamily: slide.fontFamily || undefined,
                      fontWeight: slide.fontWeight || '700',
                    }}
                  >
                    {slide.title}
                  </h2>

                  {slide.summary && (
                    <p className="mt-3 line-clamp-3 text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
                      {slide.summary}
                    </p>
                  )}

                  {/* বিস্তারিত বাটন: লিংক থাকলে সরাসরি যাবে, না থাকলে পপ-আপ খুলবে */}
                  <div className="mt-6">
                    {slide.link && slide.link !== '#' && slide.link !== '#general-news' ? (
                      <a
                        href={slide.link}
                        {...(isExternal(slide.link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        tabIndex={isActive ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-brand shadow-lg"
                      >
                        {slide.buttonText}
                        {isExternal(slide.link) ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setModalSlide(slide)}
                        tabIndex={isActive ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-brand shadow-lg"
                      >
                        {slide.buttonText}
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* নেভিগেশন কন্ট্রোল তীর ও বাটন */}
        {total > 1 && (
          <>
            <div className="absolute bottom-6 right-6 flex items-center gap-2 sm:bottom-8 sm:right-10 z-20">
              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে বন্ধ করুন'}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand',
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
                  'flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand',
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
                  'flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand',
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

      {/* লিংক না থাকলে পূর্ণ বিবরণ দেখানোর পপ-আপ (Modal) */}
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
                className="h-64 w-full rounded-xl object-cover"
                style={{ objectPosition: modalSlide.pos }}
              />
            )}

            <div className="flex items-center gap-2">
              <span
                className="rounded px-2.5 py-1 text-xs font-bold text-navy"
                style={{ backgroundColor: modalSlide.badgeColor || '#EAB308' }}
              >
                {modalSlide.category}
              </span>
              <span className="text-xs text-gray-500">{modalSlide.date}</span>
            </div>

            <h3
              className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug"
              style={{ fontFamily: modalSlide.fontFamily || undefined }}
            >
              {modalSlide.title}
            </h3>

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
