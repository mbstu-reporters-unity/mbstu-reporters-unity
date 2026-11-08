'use client'

import { useEffect, useRef, useState } from 'react'
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
  type LucideIcon,
} from 'lucide-react'
import { clubs as fallbackClubs, type Club, type ClubIcon } from '@/lib/data'
import { getCampusClubs, parseActivityMedia, type ClubItem } from '@/lib/clubs'
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
  
  const clubsRef = useRef<Club[]>(fallbackClubs)

  useEffect(() => {
    getCampusClubs().then((items) => {
      const formatted = items && items.length > 0 ? items.map(formatClub) : fallbackClubs
      setList(formatted)
      clubsRef.current = formatted
      
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
        setSelected(targetClub)
        const el = document.getElementById(`club-${targetId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    window.addEventListener('open-club-modal', handleOpenModal)
    return () => window.removeEventListener('open-club-modal', handleOpenModal)
  }, [])

  function handleCloseDialog() {
    setSelected(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('club')
      window.history.replaceState({}, '', url.pathname + (url.hash || ''))
    }
  }

  const tags = ['All', ...Array.from(new Set(list.map((c) => c.tag)))]
  const visible = filter === 'All' ? list : list.filter((c) => c.tag === filter)

  return (
    <section id="club-news" className="bg-navy py-16 sm:py-20 overflow-hidden font-sans">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted
          eyebrow="Campus Clubs"
          title="ক্যাম্পাস ক্লাবসমূহ"
          subtitle="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের কার্যক্রম এবং পরিচিতি।"
        />

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter clubs by category">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              aria-pressed={filter === tag}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors font-sans',
                filter === tag
                  ? 'border-gold bg-gold text-navy'
                  : 'border-white/20 text-white/80 hover:border-white/50 hover:text-white',
              )}
            >
              {tag}
              {tag !== 'All' && (
                <span className="ml-1.5 text-xs opacity-70">{list.filter((c) => c.tag === tag).length}</span>
              )}
            </button>
          ))}
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((club) => {
            const Icon = clubIcons[club.icon] || Star
            const raw = dbMap[club.id]
            const activityMediaList = parseActivityMedia(raw?.embed_media_url)

            return (
              <li
                key={club.id}
                id={`club-${club.id}`}
                className="scroll-mt-24 animate-in fade-in group flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-brand hover:bg-white/10 w-full min-w-0 overflow-hidden shadow-lg"
              >
                {/* ক্লাবের লোগো - কোনো চারপাশের সাদা ফ্রেম বা কৃত্রিম বর্ডার ছাড়া সম্পূর্ণ লগো */}
                <div className="flex items-start justify-between gap-3">
                  {raw?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={raw.logo_url}
                      alt={club.name}
                      className="size-20 sm:size-24 shrink-0 rounded-2xl object-contain drop-shadow"
                    />
                  ) : (
                    <span className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
                      <Icon className="size-8" aria-hidden="true" />
                    </span>
                  )}
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold border border-gold/30">
                    {club.tag}
                  </span>
                </div>
                
                {/* ক্লাবের নাম */}
                <h3 className="mt-4 text-pretty font-sans text-lg font-bold leading-snug text-white">{club.name}</h3>
                <p className="text-sm text-white/70 font-sans">{club.nameBn}</p>

                {/* ক্লাবের সাম্প্রতিক কার্যক্রম ও বিবরণ */}
                <div className="mt-4 flex-1 rounded-2xl border border-white/10 bg-navy/60 p-4 w-full min-w-0 overflow-hidden">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-soft/90">Latest Activity</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90 font-sans">{club.activity}</p>
                  {club.activityBn && (
                    <p className="mt-1 text-xs leading-relaxed text-white/60 font-sans">{club.activityBn}</p>
                  )}
                  {club.date && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {club.date}
                    </p>
                  )}

                  {/* পরিচিতি ও সাম্প্রতিক কার্যক্রমের একাধিক মিডিয়া (ভিডিও, ছবি, ফেসবুক, ইউটিউব) */}
                  {activityMediaList.length > 0 && (
                    <div className="mt-3 space-y-4">
                      {activityMediaList.map((m, idx) => (
                        <div key={idx} className="space-y-1.5 pt-2 border-t border-white/10">
                          {m.title && <h4 className="font-bold text-sm text-white leading-snug font-sans">{m.title}</h4>}
                          {m.subtitle && <p className="text-xs font-medium text-gold/90 font-sans">{m.subtitle}</p>}
                          {m.description && <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans">{m.description}</p>}
                          <UniversalMediaEmbed
                            url={m.url}
                            title={m.title || club.name}
                            caption={m.caption}
                            date={m.date}
                            enableInteractions={true}
                            itemId={`act_${club.id}_${idx}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {raw && (raw.fb_url || raw.yt_url || raw.web_url) && (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <span className="text-[11px] text-white/50">সোশ্যাল:</span>
                    {raw.fb_url && (
                      <a
                        href={raw.fb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-blue-600"
                        title="Facebook Page"
                      >
                        Facebook
                      </a>
                    )}
                    {raw.yt_url && (
                      <a
                        href={raw.yt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                        title="YouTube Channel"
                      >
                        YouTube
                      </a>
                    )}
                    {raw.web_url && (
                      <a
                        href={raw.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-brand"
                        title="Official Website"
                      >
                        <Globe className="size-3" />
                        Web
                      </a>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(club)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer shadow-md font-sans"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  View Club Reports
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <ClubReportsDialog
        club={selected}
        rawClub={selected ? dbMap[selected.id] : undefined}
        onClose={handleCloseDialog}
      />
    </section>
  )
}
