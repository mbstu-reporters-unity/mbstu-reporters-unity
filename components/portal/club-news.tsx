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

  const animDuration = `${config.anim_speed_ms || 600}ms`

  {/* ⭐ ছবির মতো ঘূর্ণায়মান নিয়ন বাতি ও লিকুইড গ্লাস কার্ড ⭐ */}
  const renderCard = (club: Club) => {
    const Icon = clubIcons[club.icon] || Star
    const raw = dbMap[club.id]
    const activityMediaList = parseActivityMedia(raw?.embed_media_url)

    return (
      <div
        id={`club-${club.id}`}
        className="neon-glass-wrapper group relative w-full min-w-0 select-none h-[345px] sm:h-[365px]"
      >
        <div className="neon-glass-inner flex flex-col justify-between p-3.5 sm:p-4 overflow-hidden">
          <div>
            {/* ১. লোগো ও গ্লাস ট্যাগ */}
            <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2">
              <div className="relative">
                {raw?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={raw.logo_url}
                    alt={club.name}
                    className="size-9 sm:size-10 rounded-full object-cover ring-2 ring-cyan-300/80 p-0.5 bg-white shadow-md select-none pointer-events-none"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="size-9 sm:size-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white ring-2 ring-cyan-300/80 shadow-md">
                    <Icon className="size-4 sm:size-5 text-white" aria-hidden="true" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-cyan-400 ring-1 ring-white shadow-[0_0_8px_#00e5ff]" />
              </div>

              <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-white/35 shadow-xs truncate max-w-[150px]">
                {club.tag}
              </span>
            </div>

            {/* ২. ক্লাবের নাম */}
            <div className="mt-2">
              <h3 className="font-serif text-sm sm:text-base font-bold leading-tight text-white group-hover:text-cyan-200 transition-colors truncate drop-shadow-sm">
                {club.nameBn || club.name}
              </h3>
              {club.nameBn && (
                <p className="text-[10px] sm:text-[11px] font-medium text-cyan-100/90 truncate mt-0.5">
                  {club.name}
                </p>
              )}
            </div>

            {/* ৩. সাম্প্রতিক কার্যক্রম ও মিডিয়া বক্স */}
            <div className="mt-2 rounded-2xl border border-white/20 bg-black/25 backdrop-blur-md p-2 space-y-1 shadow-inner">
              <div className="flex items-center justify-between text-[10px] border-b border-white/15 pb-1">
                <span className="font-bold text-cyan-200 flex items-center gap-1">
                  <Sparkles className="size-3 text-yellow-300" />
                  <span>সাম্প্রতিক কার্যক্রম</span>
                </span>
                {club.date && (
                  <span className="text-white/80 font-mono text-[9px] flex items-center gap-0.5">
                    <CalendarDays className="size-2.5 text-cyan-300" /> {club.date}
                  </span>
                )}
              </div>

              <p className="text-[10px] sm:text-[11px] leading-snug text-white/95 line-clamp-1">
                {club.activityBn || club.activity}
              </p>

              {/* থাম্বনেইল */}
              {activityMediaList.length > 0 && (
                <div className="relative h-20 sm:h-22 w-full rounded-xl overflow-hidden bg-black/40 border border-white/20 mt-1">
                  {activityMediaList[0].url.includes('youtube') ||
                  activityMediaList[0].url.includes('facebook') ||
                  activityMediaList[0].url.includes('.mp4') ? (
                    <div className="size-full flex items-center justify-center bg-blue-950/80 text-cyan-300 gap-1 text-[11px] font-semibold">
                      <Play className="size-3.5 fill-cyan-400" />
                      <span>ভিডিও ক্লিপ</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activityMediaList[0].url}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover select-none pointer-events-none"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ৪. সোশ্যাল লিংক ও লিকুইড গ্লাস বাটন */}
          <div className="mt-2 pt-2 border-t border-white/20 space-y-2">
            <div className="flex items-center justify-between gap-1 text-[10px]">
              <div className="flex items-center gap-1">
                {raw?.fb_url && (
                  <a
                    href={safeExternalUrl(raw.fb_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-5 sm:size-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition text-[9px] font-bold border border-white/25 backdrop-blur"
                    title="Facebook"
                  >
                    FB
                  </a>
                )}
                {raw?.yt_url && (
                  <a
                    href={safeExternalUrl(raw.yt_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-5 sm:size-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition text-[9px] font-bold border border-white/25 backdrop-blur"
                    title="YouTube"
                  >
                    YT
                  </a>
                )}
                {raw?.web_url && (
                  <a
                    href={safeExternalUrl(raw.web_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-5 sm:size-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/25 backdrop-blur"
                    title="Website"
                  >
                    <Globe className="size-2.5 sm:size-3" />
                  </a>
                )}
              </div>

              {raw?.committee_members && raw.committee_members.length > 0 && (
                <span className="text-[10px] text-white/90 font-semibold flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                  <Users className="size-3 text-cyan-300" />
                  <span>{raw.committee_members.length} জন</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleOpenClub(club)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500/90 via-blue-600/90 to-indigo-600/90 hover:from-cyan-400 hover:to-blue-500 py-1.5 sm:py-2 text-xs font-bold text-white shadow-lg border border-white/40 transition-all active:scale-[0.98] cursor-pointer"
            >
              <FileText className="size-3.5" />
              <span>প্রতিবেদন ও কমিটি দেখুন</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      id="club-news"
      className="relative overflow-hidden py-14 sm:py-20"
      style={{
        background: `radial-gradient(circle at 85% 15%, rgba(0, 210, 255, 0.45), transparent 50%),
                     radial-gradient(circle at 15% 85%, rgba(30, 27, 75, 0.6), transparent 55%),
                     linear-gradient(135deg, #0b1540 0%, #032d84 35%, #005bb5 70%, #008fa0 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,210,255,0.22),transparent_60%)]" />

      <style>{`
        @keyframes continuous_marquee_glide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .anim_marquee_track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: continuous_marquee_glide 35s linear infinite;
        }

        @keyframes tr_right_to_left {
          0% { transform: translateX(45px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .anim_right-to-left { animation: tr_right_to_left ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes tr_left_to_right {
          0% { transform: translateX(-45px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .anim_left-to-right { animation: tr_left_to_right ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes tr_fade { 0% { opacity: 0; } 100% { opacity: 1; } }
        .anim_effect_fade { animation: tr_fade ${animDuration} ease-in-out both; }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          inverted
          eyebrow="Campus Organizations & Clubs"
          title="ক্যাম্পাস ক্লাব ও সংগঠনসমূহ"
          subtitle="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের সাম্প্রতিক অর্জন, কার্যক্রম এবং পূর্ণাঙ্গ পরিচিতি।"
        />

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
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md',
                filter === tag
                  ? 'border-white bg-white/30 text-white shadow-lg font-bold'
                  : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white',
              )}
            >
              <span>{tag === 'All' ? 'সব ক্লাব' : tag}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', filter === tag ? 'bg-cyan-500 text-white font-bold' : 'bg-white/20 text-white/70')}>
                {tag === 'All' ? list.length : list.filter((c) => c.tag === tag).length}
              </span>
            </button>
          ))}
        </div>

        {/* ==================== স্লাইডার কনটেইনার ==================== */}
        <div
          onMouseEnter={() => config.pause_on_hover && setIsPaused(true)}
          onMouseLeave={() => config.pause_on_hover && setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full group/slider"
        >
          {total > 0 ? (
            config.effect === 'continuous' ? (
              /* ⭐ ঘূর্ণায়মান নিয়ন লাইট ট্র‍্যাক ⭐ */
              <div className="py-3 overflow-hidden w-full select-none">
                <div
                  style={{
                    transform: `translateX(${manualOffset}px)`,
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    className="anim_marquee_track flex gap-4 sm:gap-5"
                    style={{
                      animationDuration: `${Math.max(16, (config.duration_sec || 4) * 8)}s`,
                      animationDirection: config.direction === 'left-to-right' ? 'reverse' : 'normal',
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  >
                    {marqueeClubs.map((club, idx) => (
                      <div key={`${club.id}_${idx}`} className="w-[270px] sm:w-[295px] shrink-0">
                        {renderCard(club)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* সাধারণ গ্রিড মোড */
              <div
                key={animKey}
                className={cn(
                  "grid gap-4 w-full min-w-0",
                  cardsCount === 1 ? "grid-cols-1 max-w-xs mx-auto" :
                  cardsCount === 2 ? "grid-cols-1 sm:grid-cols-2" :
                  cardsCount === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                  config.effect === 'fade' ? 'anim_effect_fade' : `anim_${config.direction || 'right-to-left'}`
                )}
              >
                {displayedClubs.map((club) => renderCard(club))}
              </div>
            )
          ) : (
            <p className="text-center text-xs text-white/80 py-10 bg-white/10 rounded-2xl border border-white/20 backdrop-blur">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* ফ্লোটিং তীর বাটন */}
          {total > 1 && config.enabled && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Club"
                className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-30 size-10 sm:size-11 rounded-full bg-white/20 hover:bg-cyan-500/80 text-white flex items-center justify-center transition-all border border-white/40 backdrop-blur-xl shadow-2xl cursor-pointer active:scale-95"
              >
                <ChevronLeft className="size-5 sm:size-6 text-white" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Club"
                className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-30 size-10 sm:size-11 rounded-full bg-white/20 hover:bg-cyan-500/80 text-white flex items-center justify-center transition-all border border-white/40 backdrop-blur-xl shadow-2xl cursor-pointer active:scale-95"
              >
                <ChevronRight className="size-5 sm:size-6 text-white" />
              </button>
            </>
          )}

          {/* নিচে স্থায়ী কন্ট্রোল বার */}
          {total > 1 && config.enabled && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/20 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white bg-white/20 border border-white/30 px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm backdrop-blur-md">
                  <Sparkles className="size-3 text-yellow-300" />
                  <span>ক্যাম্পাস ক্লাব ({total}টি)</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-7 px-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 text-[11px] font-bold transition border border-white/30 cursor-pointer shadow-xs active:scale-95 backdrop-blur-md"
                >
                  {isPaused ? <Play className="size-3 text-cyan-300" /> : <Pause className="size-3 text-yellow-300" />}
                  <span>{isPaused ? 'চালান' : 'থামান'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-cyan-500/80 text-white flex items-center gap-1 text-[11px] font-bold transition border border-white/30 cursor-pointer active:scale-95 shadow-md backdrop-blur-md"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>আগেরটি</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-cyan-500/80 text-white flex items-center gap-1 text-[11px] font-bold transition border border-white/30 cursor-pointer active:scale-95 shadow-md backdrop-blur-md"
                >
                  <span>পরেরটি</span>
                  <ChevronRight className="size-3.5" />
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
