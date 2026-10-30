"use client"

import { useEffect, useState } from "react"
import { CalendarCheck, Globe2, Newspaper, Quote, Users } from "lucide-react"
import { stats } from "@/lib/data"
import { getLeaders, POSITIONS } from "@/lib/sb"
import type { Leader } from "@/lib/sb"
import { SectionHeading } from "./section-heading"

const statIcons = {
  calendar: CalendarCheck,
  users: Users,
  globe: Globe2,
  newspaper: Newspaper,
}

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()

export function LeadershipSection() {
  const [leaders, setLeaders] = useState<Leader[]>([])

  useEffect(() => {
    getLeaders().then((rows) => setLeaders(rows.filter((l) => l.is_visible)))
  }, [])

  return (
    <section id="leadership" className="bg-muted py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div id="about" className="-mt-24 pt-24" />
        <SectionHeading
          eyebrow="Leadership & At a Glance"
          title="নেতৃত্বের বার্তা"
          subtitle="Messages from the leadership of MBSTU Reporters' Unity — committed to fearless, fair and factual campus journalism."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {leaders.map((leader) => {
            const pos = POSITIONS.find((p) => p.key === leader.position)
            return (
              <article
                key={leader.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg sm:p-8"
              >
                <Quote className="absolute right-6 top-6 size-14 text-brand/10" aria-hidden="true" />
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {leader.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={leader.photo_url}
                        alt={leader.display_name}
                        className="size-20 rounded-full object-cover ring-4 ring-brand-soft"
                      />
                    ) : (
                      <div
                        className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-serif text-2xl font-bold text-white ring-4 ring-brand-soft"
                        role="img"
                        aria-label={`Portrait placeholder for ${leader.display_name}`}
                      >
                        {initials(leader.display_name)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">
                      {pos?.bn}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-crimson">{pos?.en}</p>
                    <h3 className="font-serif text-xl font-bold text-navy">{leader.display_name}</h3>
                    {leader.department && <p className="text-sm text-muted-foreground">{leader.department}</p>}
                  </div>
                </div>
                {leader.message && (
                  <p className="mt-6 whitespace-pre-line text-pretty leading-relaxed text-navy/80">{leader.message}</p>
                )}
                <div className="mt-6 border-t border-dashed border-border pt-4">
                  <p className="font-serif text-lg italic text-brand">— {leader.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pos?.en}, {"MBSTU Reporters' Unity"}
                  </p>
                </div>
              </article>
            )
          })}
        </div>

        {leaders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">নেতৃত্বের তথ্য শীঘ্রই যুক্ত করা হবে।</p>
        )}

        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon]
            return (
              <li
                key={stat.label}
                className="group rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-serif text-3xl font-bold text-navy sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-navy">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.bn}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
