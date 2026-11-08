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
  type LucideIcon,
} from 'lucide-react'
import { clubs as fallbackClubs, type Club, type ClubIcon } from '@/lib/data'
import { getCampusClubs, parseActivityMedia, safeExternalUrl, type ClubItem } from '@/lib/clubs'
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

  // ডায়ালগ বন্ধ করার স্থিতিশীল মেথড
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

  // ডায়ালগ খোলার সময় হিস্ট্রিতে পুশ করা
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

    // হেডার ড্রপডাউন থেকে ক্লাব খোলার কাস্টম ইভেন্ট
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const targetId = customEvent.detail
      const targetClub = clubsRef.current.find((c) => c.id === targetId)
      if (targetClub) {
        handleOpenClub(targetClub)
        const el = document.getElementById(`club-${targetId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // ✅ ব্রাউজারের ব্যাক বাটন চাপলে ডায়ালগ বন্ধ হওয়ার নিরাপদ লিসেনার (popstate)
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

  return (
    <section id="club-news" className="bg-navy py-16 sm:py-20 overflow-hidden">
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
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer',
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
                {/* ক্লাবের লোগো — স্পষ্ট ও অবিকৃত (object-contain) */}
                <div className="flex items-start justify-between gap-3">
                  {raw?.logo_url ? (
                    <div className="size-20 sm:size-24 shrink-0 rounded-full bg-white p-1 border border-white/20 flex items-center justify-center shadow-md overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={raw.logo_url}
                        alt={club.name}
                        className="size-full rounded-full object-contain select-none"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <span className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md">
                      <Icon className="size-8" aria-hidden="true" />
                    </span>
                  )}
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold border border-gold/30">
                    {club.tag}
                  </span>
                </div>
                
                {/* ক্লাবের নাম */}
                <h3 className="mt-4 text-pretty font-serif text-lg font-bold leading-snug text-white">{club.name}</h3>
                <p className="text-sm text-white/70">{club.nameBn}</p>

                {/* ক্লাবের সাম্প্রতিক কার্যক্রম ও বিবরণ */}
                <div className="mt-4 flex-1 rounded-2xl border border-white/10 bg-navy/60 p-4 w-full min-w-0 overflow-hidden">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-soft/90">Latest Activity</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">{club.activity}</p>
                  {club.activityBn && (
                    <p className="mt-1 text-xs leading-relaxed text-white/60">{club.activityBn}</p>
                  )}
                  {club.date && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {club.date}
                    </p>
                  )}

                  {/* পরিচিতি ও সাম্প্রতিক কার্যক্রমের একাধিক মিডিয়া */}
                  {activityMediaList.length > 0 && (
                    <div className="mt-3 space-y-4">
                      {activityMediaList.map((m, idx) => (
                        <div key={idx} className="space-y-1.5 pt-2 border-t border-white/10">
                          {m.title && <h4 className="font-bold text-sm text-white leading-snug">{m.title}</h4>}
                          {m.subtitle && <p className="text-xs font-medium text-gold/90">{m.subtitle}</p>}
                          {m.description && <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed">{m.description}</p>}
                          <UniversalMediaEmbed url={m.url} title={m.title || club.name} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* সোশ্যাল লিঙ্কসমূহ (safeExternalUrl দিয়ে সুরক্ষিত) */}
                {raw && (raw.fb_url || raw.yt_url || raw.web_url) && (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <span className="text-[11px] text-white/50">সোশ্যাল:</span>
                    {raw.fb_url && (
                      <a
                        href={safeExternalUrl(raw.fb_url)}
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
                        href={safeExternalUrl(raw.yt_url)}
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
                        href={safeExternalUrl(raw.web_url)}
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
                  onClick={() => handleOpenClub(club)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer shadow-md"
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
