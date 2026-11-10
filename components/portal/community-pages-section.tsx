'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Newspaper,
  Pause,
  Phone,
  Play,
  Share2,
  Sparkles,
} from 'lucide-react'
import { getCommunityPages, type CommunityPage } from '@/lib/pages'
import { SectionHeading } from './section-heading'

export function CommunityPagesSection() {
  const [pages, setPages] = useState<CommunityPage[]>([])
  const [filter, setFilter] = useState('All')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    getCommunityPages().then((data) => {
      // শুধুমাত্র অ্যাডমিনের অনুমোদিত ও সক্রিয় পেজগুলো লোড হবে
      const activeOnly = (data || []).filter((p) => p.is_active !== false)
      setPages(activeOnly)
    })
  }, [])

  const categories = ['All', ...Array.from(new Set(pages.map((p) => p.category || 'ক্যাম্পাস সংগঠন')))]
  const filteredPages = filter === 'All' ? pages : pages.filter((p) => (p.category || 'ক্যাম্পাস সংগঠন') === filter)
  const total = filteredPages.length

  // পরবর্তী ও পূর্ববর্তী স্লাইড হ্যান্ডলার
  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // স্বয়ংক্রিয় স্লাইড শো (৪ সেকেন্ড বিরতি)
  useEffect(() => {
    if (total <= 1 || isPaused) return

    const timer = setInterval(() => {
      nextSlide()
    }, 4500)

    return () => clearInterval(timer)
  }, [total, isPaused, nextSlide])

  // মোবাইল টাচ সোয়াইপ
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

  if (pages.length === 0) return null

  // ডেস্কটপে পাশাপাশি ৩টি কার্ড এবং মোবাইলে ১টি করে কার্ড রোটেশন
  const cardsCount = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : typeof window !== 'undefined' && window.innerWidth >= 640 ? 2 : 1
  const displayedPages: CommunityPage[] = []
  if (total > 0) {
    for (let i = 0; i < Math.min(cardsCount, total); i++) {
      displayedPages.push(filteredPages[(currentIndex + i) % total])
    }
  }

  return (
    <section id="community-pages" className="py-16 sm:py-20 bg-slate-50 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* সেকশন হেডার */}
        <SectionHeading
          eyebrow="Community & Organizations"
          title="ক্যাম্পাস পেজ ও কমিউনিটি"
          subtitle="মাভাবিপ্রবির বিভিন্ন সমিতি, হল সংসদ ও ক্যাম্পাস সংগঠনসমূহের অফিসিয়াল ফেসবুক-স্টাইল পেজ ও সাম্প্রতিক কার্যক্রম।"
        />

        {/* ফিল্টার বাটন */}
        {categories.length > 2 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                    ? 'border-brand bg-brand text-white shadow-sm'
                    : 'border-border bg-white text-navy hover:bg-brand-soft'
                }`}
              >
                <span>{cat === 'All' ? 'সকল পেজ' : cat}</span>
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({cat === 'All' ? pages.length : pages.filter((p) => (p.category || 'ক্যাম্পাস সংগঠন') === cat).length})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* স্লাইডার কনটেইনার */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPages.map((page) => (
              <article
                key={page.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-white shadow-sm hover:border-brand hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* কভার ফটো */}
                  <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900">
                    {page.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.cover_url}
                        alt=""
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-white/20 font-bold text-xl uppercase tracking-widest select-none">
                        {page.name}
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {page.category || 'কমিউনিটি'}
                    </span>
                  </div>

                  {/* প্রোফাইল লোগো ও টাইটেল */}
                  <div className="px-5 pt-0 pb-4 relative">
                    <div className="flex items-end justify-between -mt-12 mb-3">
                      <div className="relative size-20 rounded-full bg-white ring-4 ring-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                        {page.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={page.avatar_url} alt={page.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-brand text-white flex items-center justify-center text-2xl font-bold">
                            {page.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleShare(e, page)}
                        className="rounded-full p-2 bg-slate-100 hover:bg-brand-soft text-navy hover:text-brand transition cursor-pointer"
                        title="শেয়ার করুন"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/p/${page.slug}`} className="font-serif text-lg font-bold text-navy hover:text-brand transition-colors line-clamp-1">
                          {page.name}
                        </Link>
                        {page.is_verified && (
                          <CheckCircle2 className="size-4 fill-blue-600 text-white shrink-0" title="অফিসিয়াল ভেরিফাইড পেজ" />
                        )}
                      </div>
                      {page.name_en && (
                        <p className="text-xs text-gray-500 truncate">{page.name_en}</p>
                      )}
                    </div>

                    {/* বায়ো / ইন্ট্রো */}
                    {page.bio && (
                      <p className="mt-3 text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {page.bio}
                      </p>
                    )}

                    {/* লোকেশন / যোগাযোগ */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-500">
                      {page.location && (
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="size-3 text-emerald-700 shrink-0" />
                          <span className="truncate">{page.location}</span>
                        </p>
                      )}
                      {page.website_url && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Globe className="size-3 text-emerald-700 shrink-0" />
                          <a href={page.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            অফিসিয়াল ওয়েবসাইট
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* কার্ড ফুটার বাটন (সরাসরি পেজে নিয়ে যাবে) */}
                <div className="p-4 bg-gray-50/80 border-t border-border/60">
                  <Link
                    href={`/p/${page.slug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <Newspaper className="size-3.5" />
                    <span>পেজ ও টাইমলাইন দেখুন</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* স্লাইডার কন্ট্রোল ও ইন্ডিকেটর */}
          {total > 1 && (
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-border/80 pt-4">
              <div className="flex items-center gap-1.5">
                {filteredPages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentIndex ? 'w-6 bg-brand shadow-sm' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="size-8 rounded-xl bg-white border border-border text-navy flex items-center justify-center hover:bg-gray-50 cursor-pointer shadow-xs"
                >
                  {isPaused ? <Play className="size-3 text-emerald-600" /> : <Pause className="size-3 text-amber-600" />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="size-8 rounded-xl bg-white border border-border text-navy flex items-center justify-center hover:bg-gray-50 cursor-pointer active:scale-95 shadow-xs"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="size-8 rounded-xl bg-white border border-border text-navy flex items-center justify-center hover:bg-gray-50 cursor-pointer active:scale-95 shadow-xs"
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
