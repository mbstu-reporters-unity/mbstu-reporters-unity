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
import { UniversalMediaEmbed } from './universal-media-embed'

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

  const scrollContainerRef = useRef<HTMLDivElement>(null)
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

  // ⭐ বাটন চেপে ডানে বা বামে ম্যানুয়াল নেভিগেশন করার ফাংশন ⭐
  const handleNext = () => {
    if (config.effect === 'continuous' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' })
    } else {
      nextSlide()
    }
  }

  const handlePrev = () => {
    if (config.effect === 'continuous' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' })
    } else {
      prevSlide()
    }
  }

  // ⭐ নিরবচ্ছিন্ন স্ক্রল (Continuous Smooth Auto-Glide) ইঞ্জিন ⭐
  useEffect(() => {
    if (!config.enabled || config.effect !== 'continuous' || isPaused || visible.length <= 1) return

    const container = scrollContainerRef.current
    if (!container) return

    let animId: number
    let lastTime = performance.now()
    const speed = Math.max(30, 140 / (config.duration_sec || 4))

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (container) {
        const maxScroll = container.scrollWidth / 2
        if (config.direction === 'left-to-right') {
          container.scrollLeft -= speed * delta
          if (container.scrollLeft <= 0) {
            container.scrollLeft += maxScroll
          }
        } else {
          container.scrollLeft += speed * delta
          if (container.scrollLeft >= maxScroll) {
            container.scrollLeft -= maxScroll
          }
        }
      }
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [config.enabled, config.effect, config.direction, config.duration_sec, isPaused, visible.length])

  // সাধারণ ট্রানজিশন মোডের টাইমার
  useEffect(() => {
    if (!config.enabled || config.effect === 'continuous' || isPaused || total <= 1) return

    const intervalMs = Math.max(2, config.duration_sec || 4) * 1000
    const timer = setInterval(() => {
      nextSlide()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [config.enabled, config.duration_sec, config.effect, total, isPaused, nextSlide])

  // টাচ ও সোয়াইপ
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

    if (absX >= 60 && absX > absY * 1.4) {
      if (diffX < 0) handleNext()
      else handlePrev()
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  // নিরবচ্ছিন্ন স্ক্রলের জন্য ডুপ্লিকেট তালিকা
  const marqueeClubs = useMemo(() => {
    if (visible.length === 0) return []
    let arr = [...visible]
    while (arr.length < 8) {
      arr = [...arr, ...visible]
    }
    return [...arr, ...arr]
  }, [visible])

  const cardsCount = Math.min(config.cards_desktop || 3, total || 1)
  const displayedClubs: Club[] = []
  if (total > 0) {
    for (let i = 0; i < cardsCount; i++) {
      displayedClubs.push(visible[(currentIndex + i) % total])
    }
  }

  const animDuration = `${config.anim_speed_ms || 600}ms`

  const renderCard = (club: Club) => {
    const Icon = clubIcons[club.icon] || Star
    const raw = dbMap[club.id]
    const activityMediaList = parseActivityMedia(raw?.embed_media_url)

    return (
      <div
        id={`club-${club.id}`}
        className="group relative flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/40 w-full min-w-0 overflow-hidden"
      >
        <div>
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-4">
            <div className="relative">
              {raw?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={raw.logo_url}
                  alt={club.name}
                  className="size-16 rounded-full object-cover ring-2 ring-emerald-500/40 p-0.5 bg-white shadow-md select-none"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="size-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white ring-2 ring-emerald-500/40 shadow-md">
                  <Icon className="size-7 text-white" aria-hidden="true" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="সক্রিয় ক্যাম্পাস ক্লাব" />
            </div>

            <span className="rounded-full bg-emerald-950/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-800/60 shadow-xs">
              {club.tag}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-emerald-400 transition-colors truncate">
              {club.nameBn || club.name}
            </h3>
            {club.nameBn && (
              <p className="text-xs font-medium text-slate-400 truncate mt-0.5">{club.name}</p>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-gold" />
                <span>সাম্প্রতিক কার্যক্রম</span>
              </span>
              {club.date && (
                <span className="text-slate-400 font-mono flex items-center gap-1 text-[10px]">
                  <CalendarDays className="size-3 text-gold" /> {club.date}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 line-clamp-3">
              {club.activityBn || club.activity}
            </p>

            {activityMediaList.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 overflow-hidden rounded-xl">
                <UniversalMediaEmbed url={activityMediaList[0].url} title={club.name} compact />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {raw?.fb_url && (
                <a
                  href={safeExternalUrl(raw.fb_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-7 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs text-[11px] font-bold"
                  title="Facebook Page"
                >
                  FB
                </a>
              )}
              {raw?.yt_url && (
                <a
                  href={safeExternalUrl(raw.yt_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-7 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs text-[11px] font-bold"
                  title="YouTube Channel"
                >
                  YT
                </a>
              )}
              {raw?.web_url && (
                <a
                  href={safeExternalUrl(raw.web_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-7 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs"
                  title="Official Website"
                >
                  <Globe className="size-3.5" />
                </a>
              )}
            </div>

            {raw?.committee_members && raw.committee_members.length > 0 && (
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Users className="size-3.5 text-emerald-400" />
                <span>{raw.committee_members.length} জন</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenClub(club)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileText className="size-4" />
            <span>প্রতিবেদন ও কমিটি দেখুন</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <section
      id="club-news"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

      <style>{`
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

        @keyframes tr_bottom_to_top {
          0% { transform: translateY(35px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .anim_bottom-to-top { animation: tr_bottom_to_top ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes tr_top_to_bottom {
          0% { transform: translateY(-35px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .anim_top-to-bottom { animation: tr_top_to_bottom ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes tr_fade { 0% { opacity: 0; } 100% { opacity: 1; } }
        .anim_effect_fade { animation: tr_fade ${animDuration} ease-in-out both; }

        @keyframes tr_zoom { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .anim_effect_zoom { animation: tr_zoom ${animDuration} cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes tr_flip { 0% { transform: perspective(700px) rotateY(25deg); opacity: 0; } 100% { transform: perspective(700px) rotateY(0deg); opacity: 1; } }
        .anim_effect_flip { animation: tr_flip ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          inverted
          eyebrow="Campus Organizations & Clubs"
          title="ক্যাম্পাস ক্লাব ও সংগঠনসমূহ"
          subtitle="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের সাম্প্রতিক অর্জন, কার্যক্রম এবং পূর্ণাঙ্গ পরিচিতি।"
        />

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="group">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setFilter(tag)
                setCurrentIndex(0)
                setAnimKey((k) => k + 1)
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                filter === tag
                  ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white',
              )}
            >
              <span>{tag === 'All' ? 'সব ক্লাব' : tag}</span>
              <span className={cn('text-[11px] px-1.5 py-0.2 rounded-full', filter === tag ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400')}>
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
              /* ⭐ নিরবচ্ছিন্ন স্ক্রল + বাটন দিয়ে সামনে/পিছে নিয়ন্ত্রণ ⭐ */
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-none py-3 px-1 select-none scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
              >
                {marqueeClubs.map((club, idx) => (
                  <div key={`${club.id}_${idx}`} className="w-[290px] sm:w-[340px] shrink-0">
                    {renderCard(club)}
                  </div>
                ))}
              </div>
            ) : (
              /* সাধারণ গ্রিড মোড */
              <div
                key={animKey}
                className={cn(
                  "grid gap-6 w-full min-w-0",
                  cardsCount === 1 ? "grid-cols-1 max-w-lg mx-auto" :
                  cardsCount === 2 ? "grid-cols-1 md:grid-cols-2" :
                  cardsCount === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                  config.effect === 'fade' ? 'anim_effect_fade' :
                  config.effect === 'zoom' ? 'anim_effect_zoom' :
                  config.effect === 'flip' ? 'anim_effect_flip' :
                  `anim_${config.direction || 'right-to-left'}`
                )}
              >
                {displayedClubs.map((club) => renderCard(club))}
              </div>
            )
          ) : (
            <p className="text-center text-sm text-slate-400 py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* ⭐ দুই পাশের বড় ফ্লোটিং তীর বাটন (Floating Side Arrows) ⭐ */}
          {total > 1 && config.enabled && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Club"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full bg-slate-950/85 hover:bg-emerald-600 text-white flex items-center justify-center transition-all border border-slate-700 shadow-2xl cursor-pointer active:scale-95 group/arrow"
              >
                <ChevronLeft className="size-6 text-white group-hover/arrow:-translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Club"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full bg-slate-950/85 hover:bg-emerald-600 text-white flex items-center justify-center transition-all border border-slate-700 shadow-2xl cursor-pointer active:scale-95 group/arrow"
              >
                <ChevronRight className="size-6 text-white group-hover/arrow:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* ⭐ নিচে স্থায়ী কন্ট্রোল বার (Bottom Navigation Bar) ⭐ */}
          {total > 1 && config.enabled && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="size-3.5 text-gold" />
                  <span>ক্যাম্পাস ক্লাব ({total}টি)</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 text-xs font-bold transition border border-slate-800 cursor-pointer shadow-xs active:scale-95"
                >
                  {isPaused ? <Play className="size-3.5 text-emerald-400" /> : <Pause className="size-3.5 text-gold" />}
                  <span>{isPaused ? 'চালান' : 'থামান'}</span>
                </button>
              </div>

              {/* ম্যানুয়াল সামনে ও পেছনে যাওয়ার বাটনসমূহ */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex items-center gap-1.5 text-xs font-bold transition border border-slate-800 cursor-pointer active:scale-95 shadow-md"
                >
                  <ChevronLeft className="size-4" />
                  <span>আগেরটি</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex items-center gap-1.5 text-xs font-bold transition border border-slate-800 cursor-pointer active:scale-95 shadow-md"
                >
                  <span>পরেরটি</span>
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
