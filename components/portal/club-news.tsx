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

  // টাচ ও স্মুথ সোয়াইপ রেফারেন্স
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const reqAnimIdRef = useRef<number | null>(null)
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

  // ⭐ ৩ গুণ তালিকা তৈরি (যাতে টাচ করে ডানে-বামে ঠেললেও লুপ ভাঙে না) ⭐
  const loopClubs = useMemo(() => {
    if (visible.length === 0) return []
    let base = [...visible]
    while (base.length < 6) {
      base = [...base, ...visible]
    }
    return [...base, ...base, ...base]
  }, [visible])

  // ==================== ফিজিক্স-বেজড অটো-স্ক্রল ও টাচ সোয়াইপ ইঞ্জিন ====================
  useEffect(() => {
    if (config.effect !== 'continuous' || !config.enabled || visible.length === 0) return

    const container = scrollContainerRef.current
    if (!container) return

    // ইনিশিয়াল পজিশন মাঝামাঝি সেট করা
    const oneThird = container.scrollWidth / 3
    if (container.scrollLeft === 0) {
      container.scrollLeft = oneThird
    }

    let lastTime = performance.now()
    const speed = Math.max(25, 140 / (config.duration_sec || 4)) // পিক্সেল প্রতি সেকেন্ড
    const dirFactor = config.direction === 'left-to-right' ? -1 : 1

    const animateScroll = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      if (!isDraggingRef.current && (!config.pause_on_hover || !isPaused) && container) {
        container.scrollLeft += speed * dt * dirFactor

        const maxOneThird = container.scrollWidth / 3
        if (container.scrollLeft >= maxOneThird * 2) {
          container.scrollLeft -= maxOneThird
        } else if (container.scrollLeft <= 5) {
          container.scrollLeft += maxOneThird
        }
      }

      reqAnimIdRef.current = requestAnimationFrame(animateScroll)
    }

    reqAnimIdRef.current = requestAnimationFrame(animateScroll)

    return () => {
      if (reqAnimIdRef.current) cancelAnimationFrame(reqAnimIdRef.current)
    }
  }, [config.effect, config.enabled, config.duration_sec, config.direction, config.pause_on_hover, isPaused, visible])

  // টাচ ও মাউস ড্র্যাগ হ্যান্ডলার (আঙুল দিয়ে ডানে-বামে সোয়াইপ)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (config.pause_on_hover) setIsPaused(true)
    isDraggingRef.current = true

    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    startXRef.current = pageX
    if (scrollContainerRef.current) {
      scrollLeftRef.current = scrollContainerRef.current.scrollLeft
    }
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    const walk = (pageX - startXRef.current) * 1.3 // ড্র্যাগের গতি
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
    if (config.pause_on_hover) {
      setTimeout(() => setIsPaused(false), 2000)
    }
  }

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

  const animDuration = `${config.anim_speed_ms || 600}ms`

  // ==================== আধুনিক কার্ড রেন্ডারার ====================
  const renderCard = (club: Club) => {
    const Icon = clubIcons[club.icon] || Star
    const raw = dbMap[club.id]
    const activityMediaList = parseActivityMedia(raw?.embed_media_url)

    return (
      <div
        id={`club-${club.id}`}
        className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/40 w-full min-w-0 overflow-hidden select-none"
      >
        <div>
          {/* কার্ড হেডার */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
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
              <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-slate-900 shadow-sm" />
            </div>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/25 shadow-xs">
              {club.tag}
            </span>
          </div>

          {/* ক্লাবের নাম */}
          <div className="mt-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-emerald-400 transition-colors truncate">
              {club.nameBn || club.name}
            </h3>
            {club.nameBn && (
              <p className="text-xs font-medium text-slate-400 truncate mt-0.5">{club.name}</p>
            )}
          </div>

          {/* সাম্প্রতিক কার্যক্রম */}
          <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>সাম্প্রতিক কার্যক্রম</span>
              </span>
              {club.date && (
                <span className="text-slate-400 font-mono flex items-center gap-1 text-[10px]">
                  <CalendarDays className="size-3 text-amber-400" /> {club.date}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 line-clamp-3">
              {club.activityBn || club.activity}
            </p>

            {activityMediaList.length > 0 && (
              <div className="pt-2 border-t border-white/10 overflow-hidden rounded-xl">
                <UniversalMediaEmbed url={activityMediaList[0].url} title={club.name} compact />
              </div>
            )}
          </div>
        </div>

        {/* কার্ড ফুটার বাটনসমূহ */}
        <div className="mt-5 space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {raw?.fb_url && (
                <a
                  href={safeExternalUrl(raw.fb_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-7 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs text-[11px] font-bold border border-white/5"
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
                  className="size-7 rounded-lg bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs text-[11px] font-bold border border-white/5"
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
                  className="size-7 rounded-lg bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs border border-white/5"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.98] cursor-pointer"
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
      className="relative overflow-hidden bg-[#070d18] py-16 sm:py-24 text-white"
    >
      {/* ==================== আধুনিক আলোকিত অ্যাম্বিয়েন্ট ব্যাকগ্রাউন্ড ==================== */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[500px] h-[400px] bg-gradient-to-t from-blue-600/15 via-emerald-600/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />

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

        {/* ক্যাটাগরি ফিল্টার পিলস (আধুনিক ফ্রস্টেড গ্লাস স্টাইল) */}
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
                  ? 'border-emerald-400/80 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/80 font-bold'
                  : 'border-white/10 bg-slate-900/60 backdrop-blur-md text-slate-300 hover:border-emerald-500/50 hover:text-white',
              )}
            >
              <span>{tag === 'All' ? 'সব ক্লাব' : tag}</span>
              <span className={cn('text-[11px] px-1.5 py-0.2 rounded-full', filter === tag ? 'bg-emerald-900 text-white' : 'bg-white/10 text-slate-400')}>
                {tag === 'All' ? list.length : list.filter((c) => c.tag === tag).length}
              </span>
            </button>
          ))}
        </div>

        {/* ==================== স্লাইডার কনটেইনার ==================== */}
        <div className="relative w-full">
          {total > 0 ? (
            config.effect === 'continuous' ? (
              /* ⭐ নিরবচ্ছিন্ন অটো-স্ক্রল + আঙুল দিয়ে ডানে-বামে সোয়াইপ মোড ⭐ */
              <div
                ref={scrollContainerRef}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="overflow-x-auto scrollbar-none py-4 w-full cursor-grab active:cursor-grabbing select-none"
                style={{ scrollBehavior: isDraggingRef.current ? 'auto' : 'smooth' }}
              >
                <div className="flex gap-6 w-max px-2">
                  {loopClubs.map((club, idx) => (
                    <div key={`${club.id}_${idx}`} className="w-[285px] sm:w-[340px] shrink-0">
                      {renderCard(club)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* সাধারণ গ্রিড মোড */
              <div
                key={animKey}
                className={cn(
                  "grid gap-6 w-full min-w-0",
                  config.cards_desktop === 1 ? "grid-cols-1 max-w-lg mx-auto" :
                  config.cards_desktop === 2 ? "grid-cols-1 md:grid-cols-2" :
                  config.cards_desktop === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                  config.effect === 'fade' ? 'anim_effect_fade' :
                  config.effect === 'zoom' ? 'anim_effect_zoom' :
                  config.effect === 'flip' ? 'anim_effect_flip' :
                  `anim_${config.direction || 'right-to-left'}`
                )}
              >
                {visible.slice(0, config.cards_desktop || 3).map((club) => renderCard(club))}
              </div>
            )
          ) : (
            <p className="text-center text-sm text-slate-400 py-12 bg-slate-900/50 rounded-2xl border border-white/10">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* কন্ট্রোল বার (সাধারণ মোডে কার্যকর) */}
          {total > 1 && config.enabled && config.effect !== 'continuous' && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-5">
              {config.show_dots && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                  {visible.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(i)
                        setAnimKey((k) => k + 1)
                      }}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300 cursor-pointer',
                        i === currentIndex ? 'w-7 bg-emerald-500 shadow-md shadow-emerald-500/50' : 'w-2 bg-slate-700 hover:bg-slate-500',
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2.5 ml-auto">
                <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg">
                  ক্লাব {currentIndex + 1} / {total}
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="size-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition border border-white/10 cursor-pointer shadow-xs"
                >
                  {isPaused ? <Play className="size-3.5 text-emerald-400" /> : <Pause className="size-3.5 text-amber-400" />}
                </button>

                {config.show_arrows && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="size-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition border border-white/10 cursor-pointer active:scale-95 shadow-xs"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="size-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition border border-white/10 cursor-pointer active:scale-95 shadow-xs"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
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
