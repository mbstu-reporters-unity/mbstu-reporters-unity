'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
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
  link: string
  alt: string
}

// ডেটাবেসে স্লাইড না থাকলে এই নমুনা স্লাইড দেখাবে
const fallback: Slide[] = heroSlides.map((s) => ({
  key: s.image,
  image: s.image,
  pos: 'center',
  category: s.category,
  date: s.date,
  title: s.title,
  summary: s.summary,
  link: '#general-news',
  alt: s.alt,
}))

function toSlide(s: HeroSlide): Slide {
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
    link: s.link_url || '#general-news',
    alt: s.title,
  }
}

const isExternal = (u: string) => /^https?:\/\//i.test(u)

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(fallback)
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = slides.length

  useEffect(() => {
    let on = true
    Promise.all([getHeroSlides(), getHeroSettings()]).then(([rows, s]) => {
      if (!on) return
      const live = rows.slice(0, MAX_LIVE)
      setSlides(live.length > 0 ? live.map(toSlide) : fallback)
      setSettings(s)
      setLoaded(true)
    })
    return () => {
      on = false
    }
  }, [])

  const go = useCallback((next: number) => setIndex((next + total) % total), [total])

  useEffect(() => {
    if (paused || total < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 4000)
    return () => clearInterval(id)
  }, [paused, total, index])

  // ডেটা আসার আগে একই উচ্চতার ফাঁকা জায়গা, যাতে নমুনা স্লাইড একবার ঝলকে না যায়
  if (!loaded) {
    return (
      <section id="home" className="bg-navy">
        <div className="h-[480px] sm:h-[540px] lg:h-[600px]" />
      </section>
    )
  }

  // জরুরি ব্রেকিং মোড
  if (settings?.breaking_on) {
    const link = settings.breaking_link
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
            {link && (
              <a
                href={link}
                {...(isExternal(link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-crimson transition-all hover:gap-3 hover:bg-gold hover:text-navy"
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

  return (
    <section id="home" aria-roledescription="carousel" aria-label="Featured stories" className="bg-navy">
      <div
        className="relative h-[480px] overflow-hidden sm:h-[540px] lg:h-[600px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            aria-hidden={i !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{ objectPosition: slide.pos }}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-transform duration-[6000ms] ease-out',
                i === index ? 'scale-105' : 'scale-100',
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-16 sm:px-12 sm:pb-20">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded bg-gold px-2.5 py-1 text-xs font-bold tracking-wider text-navy">
                    {slide.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {slide.date}
                  </span>
                </div>
                <h2 className="mt-4 text-balance font-serif text-2xl font-bold leading-snug text-white sm:text-4xl lg:text-5xl">
                  {slide.title}
                </h2>
                {slide.summary && (
                  <p className="mt-3 line-clamp-3 text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                    {slide.summary}
                  </p>
                )}
                <a
                  href={slide.link}
                  {...(isExternal(slide.link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  tabIndex={i === index ? 0 : -1}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-brand"
                >
                  Read More / বিস্তারিত
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {total > 1 && (
          <>
            <div className="absolute bottom-6 right-6 flex items-center gap-2 sm:bottom-8 sm:right-10">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
                <span className="sr-only">Previous slide</span>
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
                <span className="sr-only">Next slide</span>
              </button>
            </div>

            <div className="absolute bottom-7 left-6 flex items-center gap-2 sm:left-12">
              {slides.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === index ? 'w-8 bg-gold' : 'w-2 bg-white/50 hover:bg-white',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
