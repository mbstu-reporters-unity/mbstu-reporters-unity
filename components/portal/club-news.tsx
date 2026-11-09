'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Baby,
  BookOpen,
  Briefcase,
  CalendarDays,
  Camera,
  Droplet,
  FileText,
  FlaskConical,
  Footprints,
  Globe,
  Megaphone,
  Mic,
  Star,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
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
  const dynamicReports = c.reports && c.reports.length > 0
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

  // স্লাইডার ইন্ডেক্স ও কন্ট্রোল
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  // টাচ ও সোয়াইপ ট্র্যাক রেফারেন্স
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchResumeTimer = useRef<NodeJS.Timeout | null>(null)
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
          if (found) {
            setSelected(found)
            const el = document.getElementById(`club-${clubId}`)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
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

  // পরবর্তী ও পূর্ববর্তী স্লাইড হ্যান্ডলার
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

  // অটো-ট্রানজিশন টাইমার
  useEffect(() => {
    if (!config.enabled || total <= 1 || isPaused) return

    const intervalMs = Math.max(2, config.duration_sec || 4) * 1000
    const timer = setInterval(() => {
      nextSlide()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [config.enabled, config.duration_sec, total, isPaused, nextSlide])

  // ⭐ শুধুমাত্র লম্বা পুশ (Deliberate Long Push) এ পরিবর্তন হওয়ার হ্যান্ডলার ⭐
  const handleTouchStart = (e: React.TouchEvent) => {
    // পড়ার জন্য টাচ করার সাথে সাথে অটো-স্লাইড থামিয়ে রাখা
    setIsPaused(true)
    if (touchResumeTimer.current) clearTimeout(touchResumeTimer.current)

    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // টাচ ছেড়ে দেওয়ার পর পাঠক যাতে নিশ্চিন্তে পুরো লেখা পড়তে পারেন, সেজন্য অন্তত ৮ সেকেন্ড থেমে থাকবে
    if (config.pause_on_hover) {
      if (touchResumeTimer.current) clearTimeout(touchResumeTimer.current)
      touchResumeTimer.current = setTimeout(() => {
        setIsPaused(false)
      }, 8000)
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

    // ⭐ সমাধান: সাধারণ স্পর্শ বা অল্প নড়াচড়ায় কখনোই স্লাইড চেঞ্জ হবে না ⭐
    // ১. কমপক্ষে ৮৫ পিক্সেল লম্বা পুশ (Long Push) করতে হবে
    // ২. উপর-নিচে স্ক্রল করার সময় (absY > absX) স্লাইড বদলাবে না, যাতে সাধারণ পেজ স্ক্রলিং অক্ষত থাকে
    const LONG_PUSH_THRESHOLD = 85

    if (absX >= LONG_PUSH_THRESHOLD && absX > absY * 1.5) {
      if (diffX < 0) {
        nextSlide() // লম্বা পুশ করে বামে ঠেললে পরের ক্লাব
      } else {
        prevSlide() // লম্বা পুশ করে ডানে ঠেললে আগের ক্লাব
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  // ফিল্টার বদলালে ইনডেক্স ০ করা
  const handleFilterChange = (tag: string) => {
    setFilter(tag)
    setCurrentIndex(0)
    setAnimKey((k) => k + 1)
  }

  // দৃশ্যমান কার্ডসমূহ নির্ধারণ
  const cardsCount = Math.min(config.cards_desktop || 3, total || 1)
  const displayedClubs: Club[] = []
  if (total > 0) {
    for (let i = 0; i < cardsCount; i++) {
      displayedClubs.push(visible[(currentIndex + i) % total])
    }
  }

  const animDuration = `${config.anim_speed_ms || 600}ms`

  return (
    <section id="club-news" className="bg-navy py-14 sm:py-20 overflow-hidden relative">
      {/* ট্রানজিশন সিএসএস কীফ্রেমসমূহ */}
      <style>{`
        /* ডান থেকে বামে */
        @keyframes tr_right_to_left {
          0% { transform: translateX(50px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .anim_right-to-left { animation: tr_right_to_left ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* বাম থেকে ডানে */
        @keyframes tr_left_to_right {
          0% { transform: translateX(-50px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .anim_left-to-right { animation: tr_left_to_right ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* নিচ থেকে উপরে */
        @keyframes tr_bottom_to_top {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .anim_bottom-to-top { animation: tr_bottom_to_top ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* উপর থেকে নিচে */
        @keyframes tr_top_to_bottom {
          0% { transform: translateY(-40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .anim_top-to-bottom { animation: tr_top_to_bottom ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ইফেক্টস */
        @keyframes tr_fade { 0% { opacity: 0; } 100% { opacity: 1; } }
        .anim_effect_fade { animation: tr_fade ${animDuration} ease-in-out both; }

        @keyframes tr_zoom { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .anim_effect_zoom { animation: tr_zoom ${animDuration} cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes tr_flip { 0% { transform: perspective(600px) rotateY(35deg); opacity: 0; } 100% { transform: perspective(600px) rotateY(0deg); opacity: 1; } }
        .anim_effect_flip { animation: tr_flip ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted
          eyebrow="Campus Clubs"
          title="ক্যাম্পাস ক্লাবসমূহ"
          subtitle="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের কার্যক্রম এবং পরিচিতি।"
        />

        {/* ক্যাটাগরি ফিল্টার বার */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="group" aria-label="Filter clubs by category">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleFilterChange(tag)}
              aria-pressed={filter === tag}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                filter === tag
                  ? 'border-gold bg-gold text-navy font-bold shadow-md'
                  : 'border-white/20 text-white/80 hover:border-white/50 hover:text-white',
              )}
            >
              {tag}
              {tag !== 'All' && (
                <span className="ml-1.5 text-xs opacity-75">({list.filter((c) => c.tag === tag).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* ==================== স্লাইডার কনটেইনার ==================== */}
        <div
          onMouseEnter={() => config.pause_on_hover && setIsPaused(true)}
          onMouseLeave={() => config.pause_on_hover && setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full"
        >
          {total > 0 ? (
            <div
              key={animKey}
              className={cn(
                "grid gap-5 w-full min-w-0",
                cardsCount === 1 ? "grid-cols-1 max-w-xl mx-auto" :
                cardsCount === 2 ? "grid-cols-1 md:grid-cols-2" :
                cardsCount === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                config.effect === 'fade' ? 'anim_effect_fade' :
                config.effect === 'zoom' ? 'anim_effect_zoom' :
                config.effect === 'flip' ? 'anim_effect_flip' :
                `anim_${config.direction || 'right-to-left'}`
              )}
            >
              {displayedClubs.map((club, idx) => {
                const Icon = clubIcons[club.icon] || Star
                const raw = dbMap[club.id]
                const activityMediaList = parseActivityMedia(raw?.embed_media_url)

                return (
                  <div
                    key={`${club.id}_${idx}`}
                    id={`club-${club.id}`}
                    className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:border-brand hover:bg-white/10 w-full min-w-0 overflow-hidden shadow-xl backdrop-blur-sm"
                  >
                    <div>
                      {/* লোগো ও ট্যাগ */}
                      <div className="flex items-start justify-between gap-3">
                        {raw?.logo_url ? (
                          <div className="size-20 shrink-0 rounded-full overflow-hidden shadow-lg border-2 border-white/30 flex items-center justify-center bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={raw.logo_url}
                              alt={club.name}
                              className="size-full object-cover select-none"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                            />
                          </div>
                        ) : (
                          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md">
                            <Icon className="size-8" aria-hidden="true" />
                          </span>
                        )}
                        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold border border-gold/30">
                          {club.tag}
                        </span>
                      </div>

                      {/* ক্লাবের নাম */}
                      <h3 className="mt-4 font-serif text-lg font-bold leading-snug text-white group-hover:text-gold transition-colors truncate">
                        {club.name}
                      </h3>
                      {club.nameBn && <p className="text-xs text-white/70 truncate">{club.nameBn}</p>}

                      {/* কার্যক্রম */}
                      <div className="mt-3.5 rounded-2xl border border-white/10 bg-navy/60 p-3.5 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-soft/90">Latest Activity</p>
                        <p className="text-xs leading-relaxed text-white/90 line-clamp-3">{club.activity}</p>
                        {club.activityBn && (
                          <p className="text-[11px] text-white/60 line-clamp-2">{club.activityBn}</p>
                        )}
                        {club.date && (
                          <p className="pt-1 inline-flex items-center gap-1 text-[11px] text-white/50">
                            <CalendarDays className="size-3 text-gold" /> {club.date}
                          </p>
                        )}

                        {/* মিডিয়া থাকলে প্রথমটি প্রদর্শন */}
                        {activityMediaList.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <UniversalMediaEmbed url={activityMediaList[0].url} title={club.name} />
                          </div>
                        )}
                      </div>

                      {/* সোশ্যাল লিংক */}
                      {raw && (raw.fb_url || raw.yt_url || raw.web_url) && (
                        <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-xs">
                          <span className="text-[10px] text-white/40">সোশ্যাল:</span>
                          {raw.fb_url && (
                            <a href={safeExternalUrl(raw.fb_url)} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white hover:bg-blue-600 transition">
                              Facebook
                            </a>
                          )}
                          {raw.yt_url && (
                            <a href={safeExternalUrl(raw.yt_url)} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white hover:bg-red-600 transition">
                              YouTube
                            </a>
                          )}
                          {raw.web_url && (
                            <a href={safeExternalUrl(raw.web_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white hover:bg-brand transition">
                              <Globe className="size-2.5" /> Web
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenClub(club)}
                      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer w-full"
                    >
                      <FileText className="size-4" />
                      <span>View Club Reports</span>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-white/50 py-10 bg-white/5 rounded-2xl border border-white/10">
              কোনো ক্লাব পাওয়া যায়নি।
            </p>
          )}

          {/* ==================== স্লাইডার কন্ট্রোল বার (তীর, পজ ও ডটস) ==================== */}
          {total > 1 && config.enabled && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
              
              {/* ডটস ইন্ডিকেটর */}
              {config.show_dots && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                  {visible.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setCurrentIndex(i); setAnimKey((k) => k + 1) }}
                      aria-label={`Slide ${i + 1}`}
                      className={cn(
                        "h-2 rounded-full transition-all cursor-pointer",
                        i === currentIndex ? "w-6 bg-gold shadow-md" : "w-2 bg-white/30 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* তীর ও পজ/প্লে বাটন */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-white/60 font-semibold mr-1">
                  ক্লাব {currentIndex + 1} / {total}
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? "Play" : "Pause"}
                  className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/15 cursor-pointer"
                  title={isPaused ? "চালান" : "থামান (পড়ার জন্য)"}
                >
                  {isPaused ? <Play className="size-3 text-green-400" /> : <Pause className="size-3 text-yellow-400" />}
                </button>

                {config.show_arrows && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous Club"
                      className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/15 cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next Club"
                      className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/15 cursor-pointer active:scale-95"
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

      {/* ক্লাবের বিস্তারিত পপ-আপ ডায়ালগ */}
      <ClubReportsDialog
        club={selected}
        rawClub={selected ? dbMap[selected.id] : undefined}
        onClose={handleCloseDialog}
      />
    </section>
  )
}
