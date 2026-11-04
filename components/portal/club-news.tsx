'use client'

import { useEffect, useState } from 'react'
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
import { getCampusClubs, type ClubItem } from '@/lib/clubs'
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

// ডেটাবেসের ক্লাবকে পোর্টালের উপযোগী করা
function formatClub(c: ClubItem): Club {
  return {
    id: c.id,
    name: c.name,
    nameBn: c.name_bn || '',
    tag: c.tag || 'General',
    icon: (c.icon as ClubIcon) || 'star',
    activity: c.activity || 'No recent activity posted.',
    activityBn: c.activity_bn || '',
    date: c.date || 'Recent',
    reports: [
      {
        title: c.activityBn || c.activity || c.name,
        date: c.date || 'Recent',
        reporter: 'MBSTU Reporters Unity',
      },
    ],
  }
}

export function ClubNews() {
  const [list, setList] = useState<Club[]>(fallbackClubs)
  const [dbMap, setDbMap] = useState<Record<string, ClubItem>>({})
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Club | null>(null)

  useEffect(() => {
    getCampusClubs().then((items) => {
      if (items && items.length > 0) {
        setList(items.map(formatClub))
        const map: Record<string, ClubItem> = {}
        items.forEach((it) => { map[it.id] = it })
        setDbMap(map)
      }
    })
  }, [])

  const tags = ['All', ...Array.from(new Set(list.map((c) => c.tag)))]
  const visible = filter === 'All' ? list : list.filter((c) => c.tag === filter)

  return (
    <section id="club-news" className="bg-navy py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted
          eyebrow="Campus Clubs"
          title="ক্যাম্পাস ক্লাবসমূহ"
          subtitle="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের কার্যক্রম এবং পরিচিতি।"
        />

        {/* ফিল্টারিং বাটন */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter clubs by category">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              aria-pressed={filter === tag}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
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

        {/* ক্লাবের কার্ড গ্রিড */}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((club) => {
            const Icon = clubIcons[club.icon] || Star
            const raw = dbMap[club.id]

            return (
              <li
                key={club.id}
                className="animate-in fade-in group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-brand hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
                    {club.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-pretty font-serif text-base font-bold leading-snug text-white">{club.name}</h3>
                <p className="text-sm text-white/60">{club.nameBn}</p>

                {/* পরিচিতি ও কার্যক্রম বক্স */}
                <div className="mt-4 flex-1 rounded-xl border border-white/10 bg-navy/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-soft/80">Latest Activity</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/85">{club.activity}</p>
                  {club.activityBn && (
                    <p className="mt-1 text-xs leading-relaxed text-white/55">{club.activityBn}</p>
                  )}
                  {club.date && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {club.date}
                    </p>
                  )}
                </div>

                {/* ১ম ধরনের লিংক: ক্লাবের সোশ্যাল মিডিয়া (যদি অ্যাডমিন দিয়ে থাকেন) */}
                {raw && (raw.fb_url || raw.yt_url || raw.web_url) && (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <span className="text-[11px] text-white/50">সোশ্যাল:</span>
                    {raw.fb_url && (
                      <a
                        href={raw.fb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-600"
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
                        className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
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
                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:bg-brand"
                        title="Official Website"
                      >
                        <Globe className="size-3" />
                        Web
                      </a>
                    )}
                  </div>
                )}

                {/* ২য় ধরনের লিংক: এই ওয়েবসাইটে ক্লাবের নিউজ ও রিপোর্ট দেখার বোতাম */}
                <button
                  type="button"
                  onClick={() => setSelected(club)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  View Club Reports
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <ClubReportsDialog club={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
