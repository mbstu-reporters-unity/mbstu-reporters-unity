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

  // বাটন চেপে ডানে বা বামে ম্যানুয়াল নেভিগেশন (স্কয়ার কার্ডের সাথে মানানসই ৩০০px স্টেপ)
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

  // সাধারণ মোডের টাইমার
  useEffect(() => {
    if (!config.enabled || config.effect === 'continuous' || isPaused || total <= 1) return

    const intervalMs = Math.max(2, config.duration_sec || 4) * 1000
    const timer = setInterval(() => {
      nextSlide()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [config.enabled, config.duration_sec, config.effect, total, isPaused, nextSlide])

  // টাচ সোয়াইপ
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

  // ⭐ কমপ্যাক্ট স্কয়ার শেপ কার্ড রেন্ডারার (আকার আগের অর্ধেক) ⭐
  const renderCard = (club: Club) => {
    const Icon = clubIcons[club.icon] || Star
    const raw = dbMap[club.id]
    const activityMediaList = parseActivityMedia(raw?.embed_media_url)

    return (
      <div
        id={`club-${club.id}`}
        className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/40 w-full min-w-0 overflow-hidden select-none h-[345px] sm:h-[365px]"
      >
        <div>
          {/* ১. লোগো ও ক্যাটাগরি ট্যাগ */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
            <div className="relative">
              {raw?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={raw.logo_url}
                  alt={club.name}
                  className="size-9 sm:size-10 rounded-full object-cover ring-2 ring-emerald-500/40 p-0.5 bg-white shadow-md select-none pointer-events-none"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="size-9 sm:size-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white ring-2 ring-emerald-500/40 shadow-md">
                  <Icon className="size-4 sm:size-5 text-white" aria-hidden="true" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
            </div>

            <span className="rounded-full bg-emerald-950/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-800/60 shadow-xs truncate max-w-[150px]">
              {club.tag}
            </span>
          </div>

          {/* ২. ক্লাবের নাম (বাংলা ও ইংরেজি) */}
          <div className="mt-2">
            <h3 className="font-serif text-sm sm:text-base font-bold leading-tight text-white group-hover:text-emerald-400 transition-colors truncate">
              {club.nameBn || club.name}
            </h3>
            {club.nameBn && (
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate mt-0.5">
                {club.name}
              </p>
            )}
          </div>

          {/* ৩. সাম্প্রতিক কার্যক্রম ও মিডিয়া বক্স (কমপ্যাক্ট স্কয়ার ফিট) */}
          <div className="mt-2 rounded-xl border border-slate-800/90 bg-slate-950/80 p-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] border-b border-slate-800/60 pb-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="size-3 text-gold" />
                <span>সাম্প্রতিক কার্যক্রম</span>
              </span>
              {club.date && (
                <span className="text-slate-400 font-mono text-[9px]">
                  {club.date}
                </span>
              )}
            </div>

            <p className="text-[10px] sm:text-[11px] leading-snug text-slate-300 line-clamp-1">
              {club.activityBn || club.activity}
            </p>

            {/* কমপ্যাক্ট থাম্বনেইল প্রিভিউ */}
            {activityMediaList.length > 0 && (
              <div className="relative h-20 sm:h-22 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mt-1">
                {activityMediaList[0].url.includes('youtube') ||
                activityMediaList[0].url.includes('facebook') ||
                activityMediaList[0].url.includes('.mp4') ? (
                  <div className="size-full flex items-center justify-center bg-slate-950 text-emerald-400 gap-1 text-[11px] font-semibold">
                    <Play className="size-3.5 fill-emerald-400" />
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

        {/* ৪. সোশ্যাল লিংক, সদস্য সংখ্যা ও বাটন */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <div className="flex items-center gap-1">
              {raw?.fb_url && (
                <a
                  href={safeExternalUrl(raw.fb_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-5 sm:size-6 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition text-[9px] font-bold"
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
                  className="size-5 sm:size-6 rounded bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition text-[9px] font-bold"
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
                  className="size-5 sm:size-6 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                  title="Website"
                >
                  <Globe className="size-2.5 sm:size-3" />
                </a>
              )}
            </div>

            {raw?.committee_members && raw.committee_members.length > 0 && (
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Users className="size-3 text-emerald-400" />
                <span>{raw.committee_members.length} জন</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenClub(club)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 py-1.5 sm:py-2 text-xs font-bold text-white shadow-md transition active:scale-[0.98] cursor-pointer"
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
    <section
      id="club-news"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 sm:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

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
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                filter === tag
                  ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white',
              )}
            >
              <span>{tag === 'All' ? 'সব ক্লাব' : tag}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', filter === tag ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400')}>
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
              /* ⭐ কমপ্যাক্ট স্কয়ার কার্ড ট্র‍্যাক ⭐ */
              <div className="py-2 overflow-hidden w-full select-none">
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
            <p className="text-center text-xs text-slate-400 py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* বড় ফ্লোটিং সাইড নেভিগেশন বাটন */}
          {total > 1 && config.enabled && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Club"
                className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-30 size-10 sm:size-11 rounded-full bg-slate-950/90 hover:bg-emerald-600 text-white flex items-center justify-center transition-all border border-slate-700 shadow-2xl cursor-pointer active:scale-95"
              >
                <ChevronLeft className="size-5 sm:size-6 text-white" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Club"
                className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-30 size-10 sm:size-11 rounded-full bg-slate-950/90 hover:bg-emerald-600 text-white flex items-center justify-center transition-all border border-slate-700 shadow-2xl cursor-pointer active:scale-95"
              >
                <ChevronRight className="size-5 sm:size-6 text-white" />
              </button>
            </>
          )}

          {/* নিচে স্থায়ী কন্ট্রোল বার */}
          {total > 1 && config.enabled && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                  <Sparkles className="size-3 text-gold" />
                  <span>ক্যাম্পাস ক্লাব ({total}টি)</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-7 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1 text-[11px] font-bold transition border border-slate-800 cursor-pointer shadow-xs active:scale-95"
                >
                  {isPaused ? <Play className="size-3 text-emerald-400" /> : <Pause className="size-3 text-gold" />}
                  <span>{isPaused ? 'চালান' : 'থামান'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex items-center gap-1 text-[11px] font-bold transition border border-slate-700 cursor-pointer active:scale-95 shadow-md"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>আগেরটি</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex items-center gap-1 text-[11px] font-bold transition border border-slate-700 cursor-pointer active:scale-95 shadow-md"
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
