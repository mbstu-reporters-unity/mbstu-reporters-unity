'use client'

import { useState } from 'react'
import { Camera, CalendarDays, Cpu, Mic, Music, Tent } from 'lucide-react'
import { clubNews } from '@/lib/data'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const icons = { mic: Mic, cpu: Cpu, music: Music, tent: Tent, camera: Camera }

export function ClubNews() {
  const [filter, setFilter] = useState<string>('All')
  const clubs = ['All', ...clubNews.map((c) => c.club)]
  const visible = filter === 'All' ? clubNews : clubNews.filter((c) => c.club === filter)

  return (
    <section id="club-news" className="bg-navy py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted
          eyebrow="Club News Corner"
          title="ক্লাব নিউজ কর্নার"
          subtitle="Latest updates from campus organisations and societies at MBSTU."
        />

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by club">
          {clubs.map((club) => (
            <button
              key={club}
              type="button"
              onClick={() => setFilter(club)}
              aria-pressed={filter === club}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                filter === club
                  ? 'border-gold bg-gold text-navy'
                  : 'border-white/20 text-white/80 hover:border-white/50 hover:text-white',
              )}
            >
              {club}
            </button>
          ))}
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const Icon = icons[item.icon]
            return (
              <li
                key={item.club}
                className="animate-in fade-in group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-brand hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.club}</p>
                    <p className="text-xs text-white/60">{item.clubBn}</p>
                  </div>
                </div>
                <h3 className="mt-4 text-pretty font-serif text-lg font-bold leading-snug text-white group-hover:text-gold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.summary}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/50">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {item.date}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
