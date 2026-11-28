"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import {
  getFactCheckItems,
  getPublicationItems,
  getTimelineItems,
  type FactCheckItem,
  type PublicationItem,
  type TimelineItem,
} from "@/lib/content-hub"
import { getFacultiesWithDepartments, type FacultyWithDepartments } from "@/lib/faculties"
import { getSocialSites, type SocialSite } from "@/lib/social-sites"
import type { HomeSectionConfig, HomeSectionKey } from "@/lib/site-settings"
import { SectionHeading } from "./section-heading"
import { useHomepageAutoplay } from "./use-homepage-autoplay"

type TransitionKind = Extract<
  HomeSectionKey,
  "departments" | "social_sites" | "timeline" | "fact_check" | "publications"
>

type TransitionData =
  | { kind: "departments"; items: FacultyWithDepartments[] }
  | { kind: "social_sites"; items: SocialSite[] }
  | { kind: "timeline"; items: TimelineItem[] }
  | { kind: "fact_check"; items: FactCheckItem[] }
  | { kind: "publications"; items: PublicationItem[] }

const headings: Record<TransitionKind, { eyebrow: string; title: string; titleEn: string }> = {
  departments: { eyebrow: "Faculties & Departments", title: "বিভাগ ও অনুষদ", titleEn: "Faculties & Departments" },
  social_sites: { eyebrow: "Social Sites & Groups", title: "সোশ্যাল সাইট ও গ্রুপ", titleEn: "Social Sites & Groups" },
  timeline: { eyebrow: "Campus Timeline", title: "ক্যাম্পাস টাইমলাইন", titleEn: "Campus Timeline" },
  fact_check: { eyebrow: "Fact Check", title: "ফ্যাক্ট চেক", titleEn: "Fact Check" },
  publications: { eyebrow: "Publications", title: "প্রকাশনা ও আর্কাইভ", titleEn: "Publications" },
}

function isSafeUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value)
}

export function HomepageCompactCarousel({
  slides,
  title,
  interval,
  paused = false,
  className = "mx-auto max-w-7xl px-3 sm:px-6 lg:px-8",
}: {
  slides: ReactNode[]
  title: string
  interval: number
  paused?: boolean
  className?: string
}) {
  const autoplay = useHomepageAutoplay(slides.length, interval, 0, paused)
  if (!slides.length) return null

  return (
    <div
      ref={autoplay.containerRef}
      {...autoplay.interactionProps}
      className={className}
      aria-label={title}
    >
      <div className="grid">
        {slides.map((slide, index) => {
          const active = autoplay.index === index
          return (
            <div
              key={index}
              aria-hidden={!active}
              inert={!active}
              className={`[grid-area:1/1] transition-opacity duration-500 ease-out ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {slide}
            </div>
          )
        })}
      </div>
      {slides.length > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2 text-slate-600">
          <span className="text-xs font-semibold text-slate-500">
            {autoplay.index + 1} / {slides.length}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={autoplay.previous}
              aria-label={`${title}: আগেরটি`}
              className="rounded-full border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-100 hover:text-[#c8102e] transition"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label={`${title}: পরেরটি`}
              className="rounded-full border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-100 hover:text-[#c8102e] transition"
            >
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ==================== ১. অনুষদ কার্ড ==================== */
function DepartmentSlide({ faculty }: { faculty: FacultyWithDepartments }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs text-slate-800">
      {faculty.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faculty.image_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] max-h-64 w-full object-cover"
        />
      )}
      <div className="p-4 sm:p-5 space-y-2">
        <span className="inline-block rounded-full bg-rose-50 text-[#c8102e] font-bold text-[10px] px-2.5 py-0.5">
          {faculty.name_en || "Faculty"}
        </span>
        <h3 className="font-serif text-base sm:text-xl font-bold text-slate-900">{faculty.name}</h3>
        {faculty.description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {faculty.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {faculty.departments.map((department) => (
            <Link
              key={department.id}
              href={`/department/${department.id}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#c8102e] hover:text-[#c8102e] transition"
            >
              {department.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}

/* ==================== ২. সোশ্যাল সাইট কার্ড ==================== */
function SocialSiteSlide({ site }: { site: SocialSite }) {
  const links = [
    { label: "ওয়েবসাইট", href: site.website_url },
    { label: "Facebook", href: site.fb_url },
    { label: "YouTube", href: site.yt_url },
  ].filter((link): link is { label: string; href: string } => isSafeUrl(link.href))

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs text-slate-800">
      {site.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.logo_url} alt="" loading="lazy" className="aspect-[16/9] max-h-52 w-full object-contain bg-slate-50 p-2" />
      )}
      <div className="p-4 sm:p-5 space-y-2">
        <span className="inline-block rounded-full bg-cyan-50 text-cyan-800 font-bold text-[10px] px-2.5 py-0.5">
          {site.category || "Community"}
        </span>
        <h3 className="font-serif text-base sm:text-xl font-bold text-slate-900">{site.name}</h3>
        {site.name_en && <p className="text-xs text-slate-500 font-medium">{site.name_en}</p>}
        {site.description && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">{site.description}</p>}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {links.map((link) => (
            <a
              key={`${site.id}:${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#c8102e] text-white px-3 py-1 text-xs font-bold hover:bg-[#a50d25] transition"
            >
              <span>{link.label}</span>
              <ExternalLink className="size-3" />
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

/* ==================== ৩. টাইমলাইন কার্ড ==================== */
function TimelineSlide({ item }: { item: TimelineItem }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs text-slate-800 p-4 sm:p-5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-xs font-bold text-[#c8102e]">{item.date_label}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {item.category}
        </span>
      </div>
      <h3 className="font-serif text-base sm:text-xl font-bold text-slate-900 leading-snug">
        {item.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">{item.summary}</p>
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" loading="lazy" className="rounded-xl aspect-[16/9] max-h-48 w-full object-cover" />
      )}
      {isSafeUrl(item.post_url) && (
        <a
          href={item.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#c8102e] hover:underline pt-1"
        >
          <span>বিস্তারিত পড়ুন</span>
          <ExternalLink className="size-3" />
        </a>
      )}
    </article>
  )
}

/* ==================== ৪. ফ্যাক্ট-চেক কার্ড ==================== */
function FactCheckSlide({ item }: { item: FactCheckItem }) {
  const isTrue = item.verdict === "true"
  const isFalse = item.verdict === "false"
  const label = isTrue ? "সত্য প্রমাণিত" : isFalse ? "মিথ্যা / গুজব" : "বিভ্রান্তিকর"
  const badgeCls = isTrue
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : isFalse
      ? "bg-rose-100 text-rose-800 border-rose-300"
      : "bg-amber-100 text-amber-800 border-amber-300"

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs text-slate-800 p-4 sm:p-5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeCls}`}>
          {isTrue ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
          <span>{label}</span>
        </span>
        <span className="text-[10px] text-slate-400">{item.checked_date}</span>
      </div>

      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
        <p className="text-[11px] font-bold text-slate-500 uppercase">প্রচারিত দাবি:</p>
        <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">“{item.claim}”</p>
      </div>

      <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-snug">
        {item.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
        {item.explanation}
      </p>

      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" loading="lazy" className="rounded-xl aspect-[16/9] max-h-48 w-full object-contain bg-slate-50 border" />
      )}
    </article>
  )
}

/* ==================== ৫. প্রকাশনা ও আর্কাইভ কার্ড ==================== */
function PublicationSlide({ item }: { item: PublicationItem }) {
  const href = isSafeUrl(item.download_url) ? item.download_url : item.pdf_url
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs text-slate-800 p-4 sm:p-5 space-y-3">
      <div className="flex items-start gap-4">
        {item.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover_url} alt="" loading="lazy" className="w-20 h-28 object-cover rounded-xl border shrink-0 bg-slate-50 shadow-xs" />
        ) : (
          <div className="w-20 h-28 rounded-xl bg-rose-50 border border-rose-200 text-[#c8102e] flex items-center justify-center shrink-0">
            <FileText className="size-8" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <span className="inline-block text-[10px] font-bold text-[#c8102e] bg-rose-50 px-2 py-0.5 rounded-full">
            {item.pub_type}
          </span>
          <h3 className="font-serif text-base font-bold text-slate-900 line-clamp-2">{item.title}</h3>
          {item.issue_label && <p className="text-xs text-slate-500 font-semibold">{item.issue_label}</p>}
          <p className="text-[11px] text-slate-400">{item.published_date}</p>
        </div>
      </div>
      {item.description && (
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed border-t border-slate-100 pt-2">
          {item.description}
        </p>
      )}
      {isSafeUrl(href) && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#c8102e] hover:bg-[#a50d25] px-4 py-2 rounded-xl shadow-xs transition"
        >
          <FileText className="size-3.5" />
          <span>প্রকাশনা দেখুন / ডাউনলোড</span>
        </a>
      )}
    </article>
  )
}

/* ==================== প্রধান এক্সপোর্ট ==================== */
export function HomepageTransitionSection({
  kind,
  sectionConfig,
}: {
  kind: TransitionKind
  sectionConfig: HomeSectionConfig
}) {
  const [data, setData] = useState<TransitionData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        let nextData: TransitionData | null = null
        switch (kind) {
          case "departments":
            nextData = { kind, items: await getFacultiesWithDepartments() }
            break
          case "social_sites":
            nextData = { kind, items: (await getSocialSites()).filter((site) => site.is_active) }
            break
          case "timeline":
            nextData = { kind, items: await getTimelineItems() }
            break
          case "fact_check":
            nextData = { kind, items: await getFactCheckItems() }
            break
          case "publications":
            nextData = { kind, items: await getPublicationItems() }
            break
        }
        if (active && nextData) setData(nextData)
      } catch (error) {
        if (active) setFailed(true)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [kind])

  const heading = headings[kind]
  const slides = useMemo<ReactNode[]>(() => {
    if (!data || data.kind !== kind) return []
    switch (data.kind) {
      case "departments":
        return data.items.map((item) => <DepartmentSlide key={item.id} faculty={item} />)
      case "social_sites":
        return data.items.map((item) => <SocialSiteSlide key={item.id} site={item} />)
      case "timeline":
        return data.items.map((item) => <TimelineSlide key={item.id} item={item} />)
      case "fact_check":
        return data.items.map((item) => <FactCheckSlide key={item.id} item={item} />)
      case "publications":
        return data.items.map((item) => <PublicationSlide key={item.id} item={item} />)
    }
  }, [data, kind])

  return (
    <section className="border-b border-slate-200 py-6 sm:py-8 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <SectionHeading
          inverted={false}
          eyebrow={sectionConfig.eyebrow || heading.eyebrow}
          title={sectionConfig.titleBn || heading.title}
          titleEn={sectionConfig.titleEn || heading.titleEn}
          subtitle={sectionConfig.subtitleBn}
          subtitleEn={sectionConfig.subtitleEn}
        />
        {slides.length ? (
          <HomepageCompactCarousel slides={slides} title={heading.title} interval={7500} />
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 text-center">
            {failed ? "তথ্য লোড করা যায়নি।" : "তথ্য লোড হচ্ছে..."}
          </p>
        )}
      </div>
    </section>
  )
}
