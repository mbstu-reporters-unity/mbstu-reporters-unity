'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { heroSlides } from '@/lib/data'
import { cn } from '@/lib/utils'

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = heroSlides.length

  const go = useCallback((next: number) => setIndex((next + total) % total), [total])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 4000)
    return () => clearInterval(id)
  }, [paused, total, index])

  return (
    <section id="home" aria-roledescription="carousel" aria-label="Featured stories" className="bg-navy">
      <div
        className="relative h-[480px] overflow-hidden sm:h-[540px] lg:h-[600px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {heroSlides.map((slide, i) => (
          <div
            key={slide.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            aria-hidden={i !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                'object-cover transition-transform duration-[6000ms] ease-out',
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
              <p className="mt-3 line-clamp-3 text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                {slide.summary}
              </p>
              <a
                href="#general-news"
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
          {heroSlides.map((slide, i) => (
            <button
              key={slide.image}
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
      </div>
    </section>
  )
}
