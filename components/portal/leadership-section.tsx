"use client"

import { useEffect, useState } from "react"
import { CalendarCheck, Globe2, Newspaper, Quote, Users } from "lucide-react"
import { stats } from "@/lib/data"
import { getLeaders, POSITIONS } from "@/lib/sb"
import { DEFAULT_STYLE, getGlobalStyle, styleFor } from "@/lib/photo-style"
import type { LeaderWithStyle, PhotoStyle } from "@/lib/photo-style"
import { SectionHeading } from "./section-heading"
import { PhotoFrame } from "./photo-frame"

const statIcons = {
  calendar: CalendarCheck,
  users: Users,
  globe: Globe2,
  newspaper: Newspaper,
}

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()

export function LeadershipSection() {
  const [leaders, setLeaders] = useState<LeaderWithStyle[]>([])
  const [globalStyle, setGlobalStyle] = useState<PhotoStyle>(DEFAULT_STYLE)

  useEffect(() => {
    getLeaders().then((rows) => setLeaders((rows as LeaderWithStyle[]).filter((l) => l.is_visible)))
    getGlobalStyle().then(setGlobalStyle)
  }, [])

  return (
    <section id="leadership" className="py-16 sm:py-20 relative">
      <div className="mx-auto max-w-7xl px-4">
        <div id="about" className="-mt-20 pt-20" />
        
        <SectionHeading
          eyebrow="Executive Council & At a Glance"
          title="কার্যনির্বাহী পরিষদ"
          subtitle="মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ — নির্ভীক, নিরপেক্ষ ও তথ্যনির্ভর ক্যাম্পাস সাংবাদিকতায় অঙ্গীকারবদ্ধ।"
        />

        {/* লিডারশিপ কার্ড গ্রিড */}
        <div className="grid gap-6 lg:grid-cols-2">
          {leaders.map((leader) => {
            const pos = POSITIONS.find((p) => p.key === leader.position)
            const ps = styleFor(leader, globalStyle)
            return (
              <article
                key={leader.id}
                className="theme-card relative p-6 sm:p-8"
              >
                <Quote className="absolute right-6 top-6 size-12 text-slate-200 dark:text-slate-800 pointer-events-none" aria-hidden="true" />
                
                <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                  
                  {/* ছবি ও ফ্রেম */}
                  <div className="relative shrink-0">
                    <PhotoFrame
                      src={leader.photo_url}
                      alt={leader.display_name}
                      style={ps}
                      fallback={
                        <div
                          className="flex h-full w-full items-center justify-center bg-brand text-white font-serif text-2xl font-bold shadow-inner"
                          role="img"
                          aria-label={`Portrait placeholder for ${leader.display_name}`}
                        >
                          {initials(leader.display_name)}
                        </div>
                      }
                    />
                    <span className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      {pos?.bn}
                    </span>
                  </div>

                  {/* নাম ও পদবি */}
                  <div className="min-w-0 flex-1 basis-40">
                    <span className="inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand mb-1">
                      {pos?.en}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--theme-text-title)]">
                      {leader.display_name}
                    </h3>
                    {leader.department && (
                      <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] font-medium mt-0.5">
                        {leader.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* বার্তা */}
                {leader.message && (
                  <p className="mt-6 whitespace-pre-line text-sm sm:text-base leading-relaxed text-[var(--theme-text-body)] text-justify">
                    {leader.message}
                  </p>
                )}

                {/* ফুটার সাইন-অফ */}
                <div className="mt-6 border-t border-[var(--theme-divider)] pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-base font-bold italic text-brand">— {leader.display_name}</p>
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      {pos?.en}, {"MBSTU Reporters' Unity"}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {leaders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            কার্যনির্বাহী পরিষদের তথ্য শীঘ্রই যুক্ত করা হবে।
          </p>
        )}

        {/* পরিসংখ্যান কার্ডসমূহ */}
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon]
            return (
              <li
                key={stat.label}
                className="theme-card p-5 sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand shadow-xs">
                  <Icon className="size-5" aria-hidden="true" />
                </span>

                <p className="mt-4 font-serif text-3xl sm:text-4xl font-extrabold text-[var(--theme-text-title)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--theme-text-title)]">{stat.label}</p>
                <p className="text-xs text-[var(--theme-text-muted)]">{stat.bn}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
