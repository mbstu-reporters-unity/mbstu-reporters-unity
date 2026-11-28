"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Award, CalendarCheck, Globe2, Newspaper, Quote, Star, Users } from "lucide-react"
import { getLeaders, POSITIONS } from "@/lib/sb"
import { DEFAULT_STYLE, getGlobalStyle, styleFor } from "@/lib/photo-style"
import type { LeaderWithStyle, PhotoStyle } from "@/lib/photo-style"
import { SectionHeading } from "./section-heading"
import { PhotoFrame } from "./photo-frame"
import { useSiteSettings } from "./site-settings-context"
import { useHomepageAutoplay } from "./use-homepage-autoplay"

const statIcons = {
  calendar: CalendarCheck,
  users: Users,
  globe: Globe2,
  newspaper: Newspaper,
  award: Award,
  star: Star,
}

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()

export function LeadershipSection() {
  const settings = useSiteSettings()
  const [leaders, setLeaders] = useState<LeaderWithStyle[]>([])
  const [globalStyle, setGlobalStyle] = useState<PhotoStyle>(DEFAULT_STYLE)
  const autoplay = useHomepageAutoplay(leaders.length, 8500)

  useEffect(() => {
    getLeaders().then((rows) => setLeaders((rows as LeaderWithStyle[]).filter((l) => l.is_visible)))
    getGlobalStyle().then(setGlobalStyle)
  }, [])

  const sec = settings.homeSections.sections.find((s) => s.key === "leadership")
  const statsConfig = settings.stats

  return (
    <section id="leadership" className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div id="about" className="-mt-20 pt-20" />

        <SectionHeading
          eyebrow={sec?.eyebrow ?? "Executive Council & At a Glance"}
          title={sec?.titleBn || "কার্যনির্বাহী পরিষদ"}
          titleEn={sec?.titleEn || "Executive Council"}
          subtitle={
            sec?.subtitleBn ||
            "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ — নির্ভীক, নিরপেক্ষ ও তথ্যনির্ভর ক্যাম্পাস সাংবাদিকতায় অঙ্গীকারবদ্ধ।"
          }
          subtitleEn={sec?.subtitleEn || "Executive Council of MBSTU Reporters' Unity."}
        />

        {leaders.length > 0 && (
          <div
            ref={autoplay.containerRef}
            {...autoplay.interactionProps}
            className="mx-auto max-w-4xl"
            aria-label="কার্যনির্বাহী পরিষদের সদস্য"
          >
            <div className="grid">
              {leaders.map((leader, index) => {
                const active = autoplay.index === index
                const pos = POSITIONS.find((p) => p.key === leader.position)
                const ps = styleFor(leader, globalStyle)
                return (
                  <article
                    key={leader.id}
                    aria-hidden={!active}
                    inert={!active}
                    className={`[grid-area:1/1] glass-card relative p-6 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:p-8 ${
                      active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
                    }`}
                  >
                    <Quote
                      className="pointer-events-none absolute right-6 top-6 size-12 text-[var(--theme-text-body)] opacity-15"
                      aria-hidden="true"
                    />

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                      <div className="relative min-w-0 max-w-full">
                        <PhotoFrame
                          src={leader.photo_url}
                          alt={leader.display_name}
                          style={ps}
                          fallback={
                            <div
                              className="flex h-full w-full items-center justify-center bg-[var(--theme-brand)] font-serif text-2xl font-bold text-[var(--theme-brand-contrast,var(--theme-bg-solid))] shadow-inner"
                              role="img"
                            >
                              {initials(leader.display_name)}
                            </div>
                          }
                        />
                        <span className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand)] px-3 py-0.5 text-[11px] font-bold text-[var(--theme-brand-contrast,var(--theme-bg-solid))] shadow-md">
                          {pos?.bn}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 basis-40">
                        <span className="mb-1 inline-block rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--theme-brand)]">
                          {pos?.en}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-[var(--theme-text-title)] sm:text-2xl">
                          {leader.display_name}
                        </h3>
                        {leader.department && (
                          <p className="mt-0.5 text-xs font-medium text-[var(--theme-text-body)] sm:text-sm">
                            {leader.department}
                          </p>
                        )}
                      </div>
                    </div>

                    {leader.message && (
                      <p className="mt-6 whitespace-pre-line text-justify text-sm leading-relaxed text-[var(--theme-text-body)] sm:text-base">
                        {leader.message}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t border-[var(--theme-card-border)] pt-4">
                      <div>
                        <p className="font-serif text-base font-bold italic text-[var(--theme-brand)]">
                          — {leader.display_name}
                        </p>
                        <p className="text-xs text-[var(--theme-text-body)] opacity-85">
                          {pos?.en}, {settings.branding.orgNameEn}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
            {leaders.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[var(--theme-text-body)]">
                  {autoplay.index + 1} / {leaders.length}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={autoplay.previous}
                    aria-label="আগের কার্যনির্বাহী সদস্য"
                    className="cursor-pointer rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-2 text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={autoplay.next}
                    aria-label="পরের কার্যনির্বাহী সদস্য"
                    className="cursor-pointer rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-2 text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {statsConfig.showStats && statsConfig.items.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statsConfig.items.map((stat) => {
              const Icon = statIcons[stat.icon] || Star
              return (
                <li
                  key={stat.id}
                  className="glass-card p-5 sm:p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-brand)] shadow-xs">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <p className="mt-4 font-serif text-3xl font-extrabold text-[var(--theme-text-title)] sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--theme-text-title)]">{stat.labelEn}</p>
                  <p className="text-xs font-semibold text-[var(--theme-brand)]">{stat.labelBn}</p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
