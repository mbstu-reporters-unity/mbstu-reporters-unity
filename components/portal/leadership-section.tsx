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
    // শুধুমাত্র অ্যাডমিনের অনুমোদিত ও দৃশ্যমান কার্যনির্বাহী সদস্যদের আনা
    getLeaders().then((rows) => setLeaders((rows as LeaderWithStyle[]).filter((l) => l.is_visible)))
    getGlobalStyle().then(setGlobalStyle)
  }, [])

  return (
    <section id="leadership" className="py-16 sm:py-20 relative">
      <div className="mx-auto max-w-7xl px-4">
        <div id="about" className="-mt-24 pt-24" />
        
        {/* সেকশন হেডার */}
        <SectionHeading
          eyebrow="Executive Council & At a Glance"
          title="কার্যনির্বাহী পরিষদ"
          subtitle="মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ — নির্ভীক, নিরপেক্ষ ও তথ্যনির্ভর ক্যাম্পাস সাংবাদিকতায় অঙ্গীকারবদ্ধ।"
        />

        {/* লিডারশিপ কার্ড গ্রিড (রেফারেন্স ছবির মতো লিকুইড গ্লাস স্ল্যাব) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {leaders.map((leader) => {
            const pos = POSITIONS.find((p) => p.key === leader.position)
            const ps = styleFor(leader, globalStyle)
            return (
              <article
                key={leader.id}
                className="relative rounded-[2.5rem] border-[1.5px] border-white/85 bg-white/45 p-6 sm:p-8 shadow-[0_22px_45px_-12px_rgba(10,45,110,0.22),inset_0_2.5px_4px_rgba(255,255,255,0.95),inset_0_-2.5px_4px_rgba(0,35,90,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_55px_-10px_rgba(10,45,110,0.32)]"
              >
                <Quote className="absolute right-6 top-6 size-16 text-sky-800/15" aria-hidden="true" />
                
                <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                  
                  {/* ছবি ও পদবি গ্লাস পিল */}
                  <div className="relative shrink-0">
                    <PhotoFrame
                      src={leader.photo_url}
                      alt={leader.display_name}
                      style={ps}
                      fallback={
                        <div
                          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-600 to-blue-800 font-serif text-2xl font-bold text-white shadow-inner"
                          role="img"
                          aria-label={`Portrait placeholder for ${leader.display_name}`}
                        >
                          {initials(leader.display_name)}
                        </div>
                      }
                    />
                    <span className="absolute -bottom-2.5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500/95 px-3 py-0.5 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(217,119,6,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.8)] border border-white/60">
                      {pos?.bn}
                    </span>
                  </div>

                  {/* নাম ও পদবির বিবরণ */}
                  <div className="min-w-0 flex-1 basis-40">
                    <span className="inline-block rounded-full bg-white/40 border border-white/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-700 shadow-2xs mb-1">
                      {pos?.en}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#071739] drop-shadow-xs">
                      {leader.display_name}
                    </h3>
                    {leader.department && (
                      <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                        {leader.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* বার্তা / বাণী */}
                {leader.message && (
                  <p className="mt-6 whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#0f274a] font-medium text-justify">
                    {leader.message}
                  </p>
                )}

                {/* ফুটার সাইন-অফ */}
                <div className="mt-6 border-t border-white/40 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-base font-bold italic text-sky-900">— {leader.display_name}</p>
                    <p className="text-xs text-slate-600 font-semibold">
                      {pos?.en}, {"MBSTU Reporters' Unity"}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {leaders.length === 0 && (
          <p className="text-center text-sm text-[#071739] font-bold py-6">
            কার্যনির্বাহী পরিষদের তথ্য শীঘ্রই যুক্ত করা হবে।
          </p>
        )}

        {/* পরিসংখ্যান কার্ডসমূহ (ছবি ১-এর বৃত্তাকার/পিল বাটনের মতো 3D গ্লাস কার্ড) */}
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon]
            return (
              <li
                key={stat.label}
                className="group rounded-[2rem] border-[1.5px] border-white/80 bg-white/40 p-5 sm:p-6 shadow-[0_14px_32px_rgba(10,40,110,0.18),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(0,30,80,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(10,40,110,0.25)]"
              >
                {/* আইকন বাবল */}
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/75 border border-white/95 text-sky-700 shadow-md">
                  <Icon className="size-6" aria-hidden="true" />
                </span>

                <p className="mt-4 font-serif text-3xl sm:text-4xl font-extrabold text-[#071739] drop-shadow-xs">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-bold text-[#071739]">{stat.label}</p>
                <p className="text-xs font-semibold text-slate-700">{stat.bn}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
