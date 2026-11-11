'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Baby,
  BookOpen,
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  Droplet,
  FileText,
  FlaskConical,
  Footprints,
  Globe,
  Megaphone,
  Mic,
  Pause,
  Play,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { clubs as fallbackClubs, type Club, type ClubIcon } from '@/lib/data'
import {
  getCampusClubs,
  parseActivityMedia,
  safeExternalUrl,
  getClubCarouselConfig,
  DEFAULT_CLUB_CAROUSEL_CONFIG,
  type ClubItem,
  type ClubCarouselConfig,
} from '@/lib/clubs'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { ClubReportsDialog } from './club-reports-dialog'

export const clubIcons: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  book: BookOpen,
  briefcase: Briefcase,
  mic: Mic,
  camera: Camera,
  star: Star,
  baby: Baby,
  footprints: Footprints,
  flask: FlaskConical,
  droplet: Droplet,
}

function formatClub(c: ClubItem): Club {
  const dynamicReports =
    c.reports && c.reports.length > 0
      ? c.reports.map((r) => ({
          title: r.title,
          date: r.date || 'Recent',
          reporter: r.reporter || 'MBSTU Reporters Unity',
        }))
      : [
          {
            title: c.activity_bn || c.activity || c.name,
            date: c.date || 'Recent',
            reporter: 'MBSTU Reporters Unity',
          },
        ]

  return {
    id: c.id,
    name: c.name,
    nameBn: c.name_bn || '',
    tag: c.tag || 'General',
    icon: (c.icon as ClubIcon) || 'star',
    activity: c.activity || 'No recent activity posted.',
    activityBn: c.activity_bn || '',
    date: c.date || 'Recent',
    reports: dynamicReports,
  }
}

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])

export function ClubNews() {
  const [list, setList] = useState<Club[]>(fallbackClubs)
  const [dbMap, setDbMap] = useState<Record<string, ClubItem>>({})
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Club | null>(null)
  const [config, setConfig] = useState<ClubCarouselConfig>(DEFAULT_CLUB_CAROUSEL_CONFIG)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [itemsPerView, setItemsPerView] = useState(1)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const clubsRef = useRef<Club[]>(fallbackClubs)

  const handleCloseDialog = useCallback(() => {
    setSelected(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('club')) {
        url.searchParams.delete('club')
        window.history.replaceState({}, '', url.pathname + (url.hash || ''))
      }
    }
  }, [])

  const handleOpenClub = useCallback((club: Club) => {
    setSelected(club)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.get('club') !== club.id) {
        url.searchParams.set('club', club.id)
        window.history.pushState({}, '', url.toString())
      }
    }
  }, [])

  useEffect(() => {
    Promise.all([getCampusClubs(), getClubCarouselConfig()]).then(([items, cfg]) => {
      const formatted = items && items.length > 0 ? items.map(formatClub) : fallbackClubs
      setList(formatted)
      clubsRef.current = formatted
      if (cfg) setConfig(cfg)

      const map: Record<string, ClubItem> = {}
      if (items) {
        items.forEach((it) => { map[it.id] = it })
      }
      setDbMap(map)

      if (typeof window !== 'undefined') {
        const clubId = new URLSearchParams(window.location.search).get('club')
        if (clubId) {
          const found = formatted.find((c) => c.id === clubId)
          if (found) setSelected(found)
        }
      }
    })

    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const targetId = customEvent.detail
      const targetClub = clubsRef.current.find((c) => c.id === targetId)
      if (targetClub) handleOpenClub(targetClub)
    }

    const handlePopState = () => {
      const clubId = new URLSearchParams(window.location.search).get('club')
      if (clubId) {
        const found = clubsRef.current.find((c) => c.id === clubId)
        setSelected(found || null)
      } else {
        setSelected(null)
      }
    }

    window.addEventListener('open-club-modal', handleOpenModal)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('open-club-modal', handleOpenModal)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [handleOpenClub])

  const tags = ['All', ...Array.from(new Set(list.map((c) => c.tag)))]
  const visible = filter === 'All' ? list : list.filter((c) => c.tag === filter)
  const total = visible.length

  // রেসপনসিভ স্ক্রিন ক্যালকুলেশন (মোবাইলে ১টি সম্পূর্ণ কার্ড, ট্যাবলেটে ২টি, ডেস্কটপে ৩টি)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      if (window.innerWidth >= 1024) {
        setItemsPerView(Math.min(config.cards_desktop || 3, total || 1))
      } else if (window.innerWidth >= 640) {
        setItemsPerView(Math.min(2, total || 1))
      } else {
        setItemsPerView(1) // মোবাইলে ১টি করে সম্পূর্ণ কার্ড
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [config.cards_desktop, total])

  const maxIndex = Math.max(0, total - itemsPerView)

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [total, maxIndex])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex, total])

  // স্বয়ংক্রিয় স্লাইডার টাইমার (৪ সেকেন্ড)
  useEffect(() => {
    if (isPaused || total <= itemsPerView) return
    const intervalMs = Math.max(3, config.duration_sec || 4) * 1000
    const timer = setInterval(() => { nextSlide() }, intervalMs)
    return () => clearInterval(timer)
  }, [isPaused, total, itemsPerView, config.duration_sec, nextSlide])

  // মোবাইল সোয়াইপ হ্যান্ডলার
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTimeout(() => setIsPaused(false), 2000)
    if (touchStartX.current === null || touchStartY.current === null || total <= 1) return

    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      if (diffX < 0) nextSlide()
      else prevSlide()
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  const renderCard = (club: Club) => {
    const Icon = clubIcons[club.icon] || Star
    const raw = dbMap[club.id]
    const activityMediaList = parseActivityMedia(raw?.embed_media_url)

    return (
      <div
        id={`club-${club.id}`}
        className="glass-card flex flex-col justify-between p-4 sm:p-5 select-none text-white h-full min-h-[300px] transition-all"
      >
        <div className="space-y-3">
          {/* লোগো ও ট্যাগ */}
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {raw?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={raw.logo_url}
                  alt={club.name}
                  className="size-10 rounded-full object-cover border border-white/30 p-0.5 bg-white shadow-sm shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                />
              ) : (
                <div className="size-10 rounded-full bg-white/15 text-cyan-300 border border-white/20 flex items-center justify-center shrink-0">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              )}
              <span className="font-bold text-xs sm:text-sm text-white truncate drop-shadow-sm">
                {club.nameBn || club.name}
              </span>
            </div>

            <span className="rounded-full bg-white/15 border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200 shrink-0">
              {club.tag}
            </span>
          </div>

          {/* সাম্প্রতিক কার্যক্রম */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-cyan-200/80">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="size-3 text-amber-300" /> সাম্প্রতিক কার্যক্রম
              </span>
              {club.date && <span className="font-mono text-[10px] opacity-80">{club.date}</span>}
            </div>

            <p className="text-xs leading-relaxed text-slate-200 line-clamp-2">
              {club.activityBn || club.activity}
            </p>

            {/* থাম্বনেইল ছবি */}
            {activityMediaList.length > 0 && (
              <div className="relative h-24 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/15 mt-2">
                {activityMediaList[0].url.includes('youtube') ||
                activityMediaList[0].url.includes('facebook') ||
                activityMediaList[0].url.includes('.mp4') ? (
                  <div className="size-full flex items-center justify-center bg-black/60 text-white gap-1 text-[11px] font-semibold">
                    <Play className="size-4 fill-current text-cyan-400" />
                    <span>ভিডিও ক্লিপ</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activityMediaList[0].url}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ফুটার বাটন */}
        <div className="mt-4 pt-2.5 border-t border-white/15 space-y-2">
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              {raw?.fb_url && (
                <a
                  href={safeExternalUrl(raw.fb_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-0.5 rounded-full bg-blue-600/80 border border-blue-400/40 text-white font-bold hover:bg-blue-600 transition"
                >
                  FB
                </a>
              )}
              {raw?.web_url && (
                <a
                  href={safeExternalUrl(raw.web_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  title="Website"
                >
                  <Globe className="size-3" />
                </a>
              )}
            </div>

            {raw?.committee_members && raw.committee_members.length > 0 && (
              <span className="text-[11px] text-cyan-200/90 font-medium flex items-center gap-1">
                <Users className="size-3 text-cyan-400" />
                <span>{raw.committee_members.length} জন</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenClub(club)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-md border border-white/20"
          >
            <FileText className="size-3.5" />
            <span>প্রতিবেদন ও কমিটি দেখুন</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <section id="club-news" className="relative py-14 sm:py-20 border-b border-white/10 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          eyebrow="Campus Organizations & Clubs"
          title="ক্যাম্পাস ক্লাব ও সংগঠনসমূহ"
          subtitle="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের সাম্প্রতিক অর্জন, কার্যক্রম এবং পূর্ণাঙ্গ পরিচিতি।"
        />

        {/* ফিল্টার বাটন */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="group">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setFilter(tag)
                setCurrentIndex(0)
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                filter === tag
                  ? 'border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-bold'
                  : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20',
              )}
            >
              <span>{tag === 'All' ? 'সব ক্লাব' : tag}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', filter === tag ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-white/70')}>
                {tag === 'All' ? list.length : list.filter((c) => c.tag === tag).length}
              </span>
            </button>
          ))}
        </div>

        {/* স্মুথ টাচ স্লাইডার কনটেইনার */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full"
        >
          {total > 0 ? (
            <div className="overflow-hidden w-full py-1">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {visible.map((club) => (
                  <div
                    key={club.id}
                    className="shrink-0 px-2 sm:px-2.5"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    {renderCard(club)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-white/60 py-10 glass-card">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* কন্ট্রোল বার (মোবাইলে এবং ডেস্কটপে শতভাগ কার্যকর) */}
          {total > itemsPerView && (
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              
              {/* প্লে/পজ বাটন */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-semibold border border-white/20 transition cursor-pointer active:scale-95"
              >
                {isPaused ? <Play className="size-3 text-cyan-400" /> : <Pause className="size-3 text-amber-400" />}
                <span>{isPaused ? 'চালান' : 'থামান'}</span>
              </button>

              {/* ক্লাব নম্বর কাউন্টার (যেমন: ১/১১) */}
              <span className="text-xs font-bold text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                ক্লাব {bn(currentIndex + 1)} / {bn(total)}
              </span>

              {/* তীর বাটন */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition cursor-pointer active:scale-95"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition cursor-pointer active:scale-95"
                  aria-label="Next"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      <ClubReportsDialog
        club={selected}
        rawClub={selected ? dbMap[selected.id] : undefined}
        onClose={handleCloseDialog}
      />
    </section>
  )
}
