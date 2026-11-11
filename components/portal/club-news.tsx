'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Baby,
  BookOpen,
  Briefcase,
  CalendarDays,
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

export function ClubNews() {
  const [list, setList] = useState<Club[]>(fallbackClubs)
  const [dbMap, setDbMap] = useState<Record<string, ClubItem>>({})
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Club | null>(null)
  const [config, setConfig] = useState<ClubCarouselConfig>(DEFAULT_CLUB_CAROUSEL_CONFIG)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [manualOffset, setManualOffset] = useState(0)

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
        items.forEach((it) => {
          map[it.id] = it
        })
      }
      setDbMap(map)

      if (typeof window !== 'undefined') {
        const clubId = new URLSearchParams(window.location.search).get('club')
        if (clubId) {
          const found = formatted.find((c) => c.id === clubId)
          if (found) {
            setSelected(found)
          }
        }
      }
    })

    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const targetId = customEvent.detail
      const targetClub = clubsRef.current.find((c) => c.id === targetId)
      if (targetClub) {
        handleOpenClub(targetClub)
      }
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

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev + 1) % total)
    setAnimKey((k) => k + 1)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 1) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
    setAnimKey((k) => k + 1)
  }, [total])

  const handleNext = () => {
    if (config.effect === 'continuous') {
      setManualOffset((prev) => prev - 300)
    } else {
      nextSlide()
    }
  }

  const handlePrev = () => {
    if (config.effect === 'continuous') {
      setManualOffset((prev) => prev + 300)
    } else {
      prevSlide()
    }
  }

  useEffect(() => {
    if (!config.enabled || config.effect === 'continuous' || isPaused || total <= 1) return

    const intervalMs = Math.max(2, config.duration_sec || 4) * 1000
    const timer = setInterval(() => {
      nextSlide()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [config.enabled, config.duration_sec, config.effect, total, isPaused, nextSlide])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (config.pause_on_hover) setIsPaused(true)
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (config.pause_on_hover) {
      setTimeout(() => setIsPaused(false), 2500)
    }

    if (touchStartX.current === null || touchStartY.current === null || total <= 1) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current
    const absX = Math.abs(diffX)
    const absY = Math.abs(diffY)

    if (absX >= 45 && absX > absY * 1.3) {
      if (diffX < 0) handleNext()
      else handlePrev()
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  const marqueeClubs = useMemo(() => {
    if (visible.length === 0) return []
    let arr = [...visible]
    while (arr.length < 12) {
      arr = [...arr, ...visible]
    }
    return [...arr, ...arr, ...arr]
  }, [visible])

  const cardsCount = Math.min(config.cards_desktop || 3, total || 1)
  const displayedClubs: Club[] = []
  if (total > 0) {
    for (let i = 0; i < cardsCount; i++) {
      displayedClubs.push(visible[(currentIndex + i) % total])
    }
  }

  const animDuration = `${config.anim_speed_ms || 500}ms`

  const renderCard = (club: Club) => {
    const Icon = clubIcons[club.icon] || Star
    const raw = dbMap[club.id]
    const activityMediaList = parseActivityMedia(raw?.embed_media_url)

    return (
      <div
        id={`club-${club.id}`}
        className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand/50 transition-all select-none h-[340px]"
      >
        <div>
          {/* লোগো ও ট্যাগ */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {raw?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={raw.logo_url}
                  alt={club.name}
                  className="size-9 rounded-full object-cover border p-0.5 bg-white shadow-2xs shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                />
              ) : (
                <div className="size-9 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              )}
              <span className="font-bold text-xs text-navy truncate">
                {club.nameBn || club.name}
              </span>
            </div>

            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-bold text-brand shrink-0">
              {club.tag}
            </span>
          </div>

          {/* সাম্প্রতিক কার্যক্রম */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="size-3 text-gold" /> সাম্প্রতিক কার্যক্রম
              </span>
              {club.date && <span className="font-mono text-[10px]">{club.date}</span>}
            </div>

            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-2">
              {club.activityBn || club.activity}
            </p>

            {/* থাম্বনেইল প্রিভিউ */}
            {activityMediaList.length > 0 && (
              <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border mt-2">
                {activityMediaList[0].url.includes('youtube') ||
                activityMediaList[0].url.includes('facebook') ||
                activityMediaList[0].url.includes('.mp4') ? (
                  <div className="size-full flex items-center justify-center bg-slate-900 text-white gap-1 text-[11px] font-semibold">
                    <Play className="size-3.5 fill-current" />
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

        {/* ফুটার লিংক ও বাটন */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1">
              {raw?.fb_url && (
                <a
                  href={safeExternalUrl(raw.fb_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition"
                >
                  FB
                </a>
              )}
              {raw?.web_url && (
                <a
                  href={safeExternalUrl(raw.web_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  title="Website"
                >
                  <Globe className="size-3" />
                </a>
              )}
            </div>

            {raw?.committee_members && raw.committee_members.length > 0 && (
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Users className="size-3 text-brand" />
                <span>{raw.committee_members.length} জন</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenClub(club)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark py-2 text-xs font-bold text-white transition active:scale-98 cursor-pointer shadow-xs"
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
    <section id="club-news" className="relative py-14 sm:py-20 border-b border-border/60">
      <style>{`
        @keyframes continuous_marquee_glide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .anim_marquee_track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: continuous_marquee_glide 40s linear infinite;
        }
      `}</style>

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
                setManualOffset(0)
                setAnimKey((k) => k + 1)
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                filter === tag
                  ? 'border-brand bg-brand text-white shadow-xs font-bold'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              <span>{tag === 'All' ? 'সব ক্লাব' : tag}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', filter === tag ? 'bg-white/20 text-white font-bold' : 'bg-muted text-muted-foreground')}>
                {tag === 'All' ? list.length : list.filter((c) => c.tag === tag).length}
              </span>
            </button>
          ))}
        </div>

        {/* স্লাইডার কনটেইনার */}
        <div
          onMouseEnter={() => config.pause_on_hover && setIsPaused(true)}
          onMouseLeave={() => config.pause_on_hover && setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full"
        >
          {total > 0 ? (
            config.effect === 'continuous' ? (
              <div className="py-2 overflow-hidden w-full select-none">
                <div
                  style={{
                    transform: `translateX(${manualOffset}px)`,
                    transition: 'transform 0.4s ease',
                  }}
                >
                  <div
                    className="anim_marquee_track flex gap-4"
                    style={{
                      animationDuration: `${Math.max(16, (config.duration_sec || 4) * 8)}s`,
                      animationDirection: config.direction === 'left-to-right' ? 'reverse' : 'normal',
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  >
                    {marqueeClubs.map((club, idx) => (
                      <div key={`${club.id}_${idx}`} className="w-[280px] shrink-0">
                        {renderCard(club)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={animKey}
                className={cn(
                  "grid gap-4 w-full min-w-0",
                  cardsCount === 1 ? "grid-cols-1 max-w-sm mx-auto" :
                  cardsCount === 2 ? "grid-cols-1 sm:grid-cols-2" :
                  cardsCount === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                )}
              >
                {displayedClubs.map((club) => renderCard(club))}
              </div>
            )
          ) : (
            <p className="text-center text-xs text-muted-foreground py-10 bg-card rounded-2xl border">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* কন্ট্রোল বার */}
          {total > 1 && config.enabled && (
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-8 px-3 rounded-xl bg-card hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-semibold border transition cursor-pointer active:scale-95"
                >
                  {isPaused ? <Play className="size-3 text-green-600" /> : <Pause className="size-3 text-amber-600" />}
                  <span>{isPaused ? 'চালান' : 'থামান'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="size-8 rounded-xl bg-card hover:bg-muted text-foreground flex items-center justify-center border transition cursor-pointer active:scale-95"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="size-8 rounded-xl bg-card hover:bg-muted text-foreground flex items-center justify-center border transition cursor-pointer active:scale-95"
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
