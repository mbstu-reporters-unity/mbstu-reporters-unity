'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Newspaper,
  Pause,
  Play,
  Share2,
} from 'lucide-react'
import { getCommunityPages, type CommunityPage } from '@/lib/pages'
import { SectionHeading } from './section-heading'
import { useSiteSettings } from './site-settings-context'

function safeHttpUrl(u?: string | null): string | null {
  if (!u) return null
  const t = u.trim()
  return /^https?:\/\//i.test(t) ? t : null
}

export function CommunityPagesSection({
  mode = 'carousel',
}: {
  mode?: 'carousel' | 'directory'
}) {
  const settings = useSiteSettings()
  const [pages, setPages] = useState<CommunityPage[]>([])
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState('All')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [cardsCount, setCardsCount] = useState(3)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    getCommunityPages().then((data) => {
      const activeOnly = (data || []).filter((p) => p.is_active !== false)
      setPages(activeOnly)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    const updateCardsCount = () => {
      if (window.innerWidth >= 1024) setCardsCount(3)
      else if (window.innerWidth >= 640) setCardsCount(2)
      else setCardsCount(1)
    }
    updateCardsCount()
    window.addEventListener('resize', updateCardsCount)
    return () => window.removeEventListener('resize', updateCardsCount)
  }, [])

  const categories = ['All', ...Array.from(new Set(pages.map((p) => p.category || 'ক্যাম্পাস সংগঠন')))]
  const filteredPages = filter === 'All' ? pages : pages.filter((p) => (p.category || 'ক্যাম্পাস সংগঠন') === filter)
  const total = filteredPages.length

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (mode === 'directory' || total <= 1 || isPaused) return
    const timer = setInterval(() => { nextSlide() }, 4500)
    return () => clearInterval(timer)
  }, [mode, total, isPaused, nextSlide])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false)
    if (touchStartX.current === null || touchStartY.current === null || total <= 1) return
    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0) nextSlide()
      else prevSlide()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const handleShare = async (e: React.MouseEvent, page: CommunityPage) => {
    e.preventDefault()
    e.stopPropagation()
    const pageUrl = `${window.location.origin}/p/${page.slug}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: page.name,
          text: `${page.name} - মাভাবিপ্রবি`,
          url: pageUrl,
        })
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopiedId(page.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  const sec = settings.homeSections.sections.find((s) => s.key === 'community_pages')
  if (pages.length === 0) {
    if (mode !== 'directory') return null
    return (
      <section id="community-pages" className="relative border-b border-[var(--theme-card-border)] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            inverted
            eyebrow={sec?.eyebrow ?? 'Community & Organizations'}
            title={sec?.titleBn || 'ক্যাম্পাস পেজ ও কমিউনিটি'}
            titleEn={sec?.titleEn || 'Campus Pages & Community'}
            subtitle={sec?.subtitleBn || 'মাভাবিপ্রবির বিভিন্ন ক্যাম্পাস সংগঠনের সক্রিয় পেজ ও কার্যক্রম।'}
            subtitleEn={sec?.subtitleEn || 'Active pages and activities from campus organizations.'}
          />
          <div className="glass-card p-8 text-center text-sm text-[var(--theme-text-body)]" aria-live="polite">
            {loaded ? 'এখনো কোনো সক্রিয় কমিউনিটি পেজ নেই।' : 'কমিউনিটি পেজ লোড হচ্ছে...'}
          </div>
        </div>
      </section>
    )
  }

  const isDirectory = mode === 'directory'
  const displayedPages: CommunityPage[] = []
  if (total > 0) {
    for (let i = 0; i < (isDirectory ? total : Math.min(cardsCount, total)); i++) {
      displayedPages.push(filteredPages[(currentIndex + i) % total])
    }
  }

  return (
    <section id="community-pages" className="relative border-b border-[var(--theme-card-border)] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          inverted
          eyebrow={sec?.eyebrow ?? 'Community & Organizations'}
          title={sec?.titleBn || 'ক্যাম্পাস পেজ ও কমিউনিটি'}
          titleEn={sec?.titleEn || 'Campus Pages & Community'}
          subtitle={
            sec?.subtitleBn ||
            'মাভাবিপ্রবির বিভিন্ন সমিতি, হল সংসদ ও ক্যাম্পাস সংগঠনসমূহের অফিসিয়াল পেজ ও সাম্প্রতিক কার্যক্রম।'
          }
          subtitleEn={sec?.subtitleEn || 'Official campus pages and recent updates.'}
          action={
            !isDirectory ? (
              <Link
                href="/community"
                className="inline-flex shrink-0 items-center rounded-full bg-[var(--theme-brand)] px-4 py-2 text-xs font-bold text-[var(--theme-brand-contrast,var(--theme-bg-solid))] transition hover:bg-[var(--theme-brand-dark)]"
              >
                সব কমিউনিটি পেজ
              </Link>
            ) : undefined
          }
        />

        {categories.length > 2 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFilter(cat)
                  setCurrentIndex(0)
                }}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  filter === cat
                    ? 'border-[var(--theme-brand)] bg-[var(--theme-brand)] text-[var(--theme-brand-contrast,var(--theme-bg-solid))] shadow-md'
                    : 'border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] hover:border-[var(--theme-brand)] hover:text-[var(--theme-text-title)]'
                }`}
              >
                <span>{cat === 'All' ? 'সকল পেজ' : cat}</span>
                <span className="ml-1.5 text-[10px] opacity-80">
                  ({cat === 'All' ? pages.length : pages.filter((p) => (p.category || 'ক্যাম্পাস সংগঠন') === cat).length})
                </span>
              </button>
            ))}
          </div>
        )}

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPages.map((page) => {
              const safeWebsiteUrl = safeHttpUrl(page.website_url)
              return (
                <article
                  key={page.id}
                  className="glass-card group flex flex-col justify-between overflow-hidden text-[var(--theme-text-body)]"
                >
                  <div>
                    <div className="hero-daylight-dark-surface relative h-32 sm:h-36 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border-b border-[var(--theme-card-border)]">
                      {page.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={page.cover_url}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-white/40 font-bold text-lg uppercase tracking-widest select-none px-4 text-center">
                          {page.name}
                        </div>
                      )}
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-black/70 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/25">
                        {page.category || 'কমিউনিটি'}
                      </span>
                    </div>

                    <div className="px-5 pt-0 pb-4 relative">
                      <div className="flex items-end justify-between -mt-10 mb-3">
                        <div className="relative size-20 rounded-full bg-[var(--theme-bg-solid)] ring-4 ring-[var(--theme-brand)] shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {page.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={page.avatar_url} alt={page.name} loading="lazy" className="size-full object-cover" />
                          ) : (
                            <div className="size-full bg-[var(--theme-brand)] text-[var(--theme-brand-contrast,var(--theme-bg-solid))] flex items-center justify-center text-2xl font-bold">
                              {page.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleShare(e, page)}
                          className="rounded-full p-2 bg-[var(--theme-brand-soft)] hover:bg-[var(--theme-brand)] text-[var(--theme-text-title)] hover:text-[var(--theme-brand-contrast,var(--theme-bg-solid))] border border-[var(--theme-card-border)] transition cursor-pointer"
                          title={copiedId === page.id ? 'লিংক কপি হয়েছে' : 'শেয়ার করুন'}
                          aria-label="শেয়ার করুন"
                        >
                          {copiedId === page.id ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Share2 className="size-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/p/${page.slug}`} className="font-serif text-lg font-bold text-[var(--theme-text-title)] hover:text-[var(--theme-brand)] transition-colors line-clamp-1">
                            {page.name}
                          </Link>
                          {page.is_verified && (
                            <span title="ভেরিফাইড পেজ" className="inline-flex shrink-0">
                              <CheckCircle2 className="size-4 fill-blue-500 text-white" />
                            </span>
                          )}
                        </div>
                        {page.name_en && (
                          <p className="text-xs text-[var(--theme-brand)] font-medium truncate">{page.name_en}</p>
                        )}
                      </div>

                      {page.bio && (
                        <p className="mt-3 text-xs text-[var(--theme-text-body)] line-clamp-2 leading-relaxed">
                          {page.bio}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-[var(--theme-card-border)] space-y-1.5 text-[11px] text-[var(--theme-text-body)]">
                        {page.location && (
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="size-3 text-[var(--theme-brand)] shrink-0" />
                            <span className="truncate">{page.location}</span>
                          </p>
                        )}
                        {safeWebsiteUrl && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Globe className="size-3 text-[var(--theme-brand)] shrink-0" />
                            <a href={safeWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--theme-brand)] font-semibold hover:underline truncate">
                              অফিসিয়াল ওয়েবসাইট
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-[var(--theme-card-border)]">
                    <Link
                      href={`/p/${page.slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--theme-brand)] hover:bg-[var(--theme-brand-dark)] text-[var(--theme-brand-contrast,var(--theme-bg-solid))] px-4 py-2.5 text-xs font-bold shadow-sm transition active:scale-98"
                    >
                      <Newspaper className="size-3.5" />
                      <span>পেজ ও টাইমলাইন দেখুন</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {!isDirectory && total > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--theme-card-border)] pt-4">
              <div className="flex items-center gap-1.5">
                {filteredPages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`স্লাইড ${i + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentIndex ? 'w-6 bg-[var(--theme-brand)] shadow-sm' : 'w-2 bg-[var(--theme-card-border)] hover:opacity-80'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? 'চালান' : 'থামান'}
                  className="size-8 rounded-xl bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] text-[var(--theme-text-title)] flex items-center justify-center hover:border-[var(--theme-brand)] cursor-pointer"
                >
                  {isPaused ? <Play className="size-3 text-[var(--theme-brand)]" /> : <Pause className="size-3 text-amber-500" />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="আগের পেজ"
                  className="size-8 rounded-xl bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] text-[var(--theme-text-title)] flex items-center justify-center hover:border-[var(--theme-brand)] cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="পরের পেজ"
                  className="size-8 rounded-xl bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] text-[var(--theme-text-title)] flex items-center justify-center hover:border-[var(--theme-brand)] cursor-pointer active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
