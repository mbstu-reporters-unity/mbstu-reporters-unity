'use client'

import { useState } from 'react'
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
  Megaphone,
  Mic,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { clubs, type Club, type ClubIcon } from '@/lib/data'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { ClubReportsDialog } from './club-reports-dialog'

export const clubIcons: Record<ClubIcon, LucideIcon> = {
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

const tags = ['All', ...Array.from(new Set(clubs.map((c) => c.tag)))]

export function ClubNews() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Club | null>(null)
  const visible = filter === 'All' ? clubs : clubs.filter((c) => c.tag === filter)

  return (
    <section id="club-news" className="bg-navy py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted
          eyebrow="Club News Corner"
          title="ক্লাব নিউজ কর্নার"
          subtitle="Latest activities from the 10 campus clubs and organisations of MBSTU."
        />

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
                <span className="ml-1.5 text-xs opacity-70">{clubs.filter((c) => c.tag === tag).length}</span>
              )}
            </button>
          ))}
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((club) => {
            const Icon = clubIcons[club.icon]
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

                <div className="mt-4 flex-1 rounded-xl border border-white/10 bg-navy/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-soft/80">Latest Activity</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/85">{club.activity}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{club.activityBn}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {club.date}
                  </p>
                </div>

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
