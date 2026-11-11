"use client"

import { useEffect, useState } from "react"
import { CalendarCheck, Globe2, Newspaper, Quote, Users, Sparkles } from "lucide-react"
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
          inverted
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
                className="glass-card relative p-6 sm:p-8"
              >
                <Quote className="absolute right-6 top-6 size-12 text-white/10 pointer-events-none" aria-hidden="true" />
                
                <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                  
                  {/* ছবি ও ফ্রেম */}
                  <div className="relative shrink-0">
                    <PhotoFrame
                      src={leader.photo_url}
                      alt={leader.display_name}
                      style={ps}
                      fallback={
                        <div
                          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-serif text-2xl font-bold shadow-inner"
                          role="img"
                        >
                          {initials(leader.display_name)}
                        </div>
                      }
                    />
                    <span className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-md border border-white/30">
                      {pos?.bn}
                    </span>
                  </div>

                  {/* নাম ও পদবি */}
                  <div className="min-w-0 flex-1 basis-40">
                    <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200 border border-white/20 mb-1">
                      {pos?.en}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                      {leader.display_name}
                    </h3>
                    {leader.department && (
                      <p className="text-xs sm:text-sm text-cyan-100/90 font-medium mt-0.5">
                        {leader.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* বার্তা */}
                {leader.message && (
                  <p className="mt-6 whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-100 text-justify">
                    {leader.message}
                  </p>
                )}

                {/* ফুটার সাইন-অফ */}
                <div className="mt-6 border-t border-white/15 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-base font-bold italic text-cyan-300">— {leader.display_name}</p>
                    <p className="text-xs text-slate-300">
                      {pos?.en}, {"MBSTU Reporters' Unity"}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* পরিসংখ্যান কার্ডসমূহ */}
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon]
            return (
              <li
                key={stat.label}
                className="glass-card p-5 sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-cyan-300 shadow-md">
                  <Icon className="size-5" aria-hidden="true" />
                </span>

                <p className="mt-4 font-serif text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-bold text-white">{stat.label}</p>
                <p className="text-xs font-semibold text-cyan-200">{stat.bn}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
