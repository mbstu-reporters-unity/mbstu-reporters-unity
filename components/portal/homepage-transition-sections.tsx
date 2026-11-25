"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, FileText } from "lucide-react"
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
  publications: { eyebrow: "Publications", title: "প্রকাশনা", titleEn: "Publications" },
}

const transitionSlideClass = "-mx-4 border-b border-white/15 text-white sm:-mx-6 lg:-mx-8"

function isSafeUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value)
}

export function HomepageCompactCarousel({
  slides,
  title,
  interval,
  paused = false,
  className = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
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
              className={`[grid-area:1/1] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
              }`}
            >
              {slide}
            </div>
          )
        })}
      </div>
      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-300">
            {autoplay.index + 1} / {slides.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={autoplay.previous}
              aria-label={`${title}: আগেরটি`}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label={`${title}: পরেরটি`}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DepartmentSlide({ faculty }: { faculty: FacultyWithDepartments }) {
  return (
    <article className={`${transitionSlideClass} overflow-hidden`}>
      {faculty.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faculty.image_url}
          alt=""
          loading="lazy"
          className="block h-auto w-full object-contain"
        />
      )}
      <div className="space-y-2 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{faculty.name_en || "Faculty"}</p>
        <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">{faculty.name}</h3>
        {faculty.description && <p className="text-sm leading-relaxed text-slate-200">{faculty.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {faculty.departments.map((department) => (
            <Link
              key={department.id}
              href={`/department/${department.id}`}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              {department.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}

function SocialSiteSlide({ site }: { site: SocialSite }) {
  const links = [
    { label: "ওয়েবসাইট", href: site.website_url },
    { label: "Facebook", href: site.fb_url },
    { label: "YouTube", href: site.yt_url },
  ].filter((link): link is { label: string; href: string } => isSafeUrl(link.href))
  return (
    <article className={`${transitionSlideClass} overflow-hidden`}>
      {site.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.logo_url} alt="" loading="lazy" className="block h-auto w-full object-contain" />
      )}
      <div className="space-y-3 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{site.category || "Community"}</p>
        <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">{site.name}</h3>
        {site.name_en && <p className="text-sm font-semibold text-cyan-100">{site.name_en}</p>}
        {site.description && <p className="text-sm leading-relaxed text-slate-200">{site.description}</p>}
        {site.contact_info && <p className="text-xs text-slate-300">{site.contact_info}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          {links.map((link) => (
            <a
              key={`${site.id}:${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${site.name} ${link.label}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-700 to-blue-800 px-4 py-2 text-xs font-bold text-white transition hover:from-cyan-600 hover:to-blue-700"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

function TimelineSlide({ item }: { item: TimelineItem }) {
  return (
    <article className={`${transitionSlideClass} overflow-hidden`}>
      <div className="space-y-3 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-cyan-200">
          <span>{item.date_label}</span>
          <span aria-hidden="true">·</span>
          <span>{item.category}</span>
          {item.status && <span className="rounded-full bg-white/15 px-2 py-1">{item.status}</span>}
        </div>
        <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">{item.title}</h3>
        <p className="text-sm leading-relaxed text-slate-200">{item.summary}</p>
      </div>
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" loading="lazy" className="block h-auto w-full object-contain" />
      )}
      {isSafeUrl(item.post_url) && (
        <div className="px-6 py-5 sm:px-8">
          <a
            href={item.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:underline"
          >
            বিস্তারিত
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  )
}

function FactCheckSlide({ item }: { item: FactCheckItem }) {
  const verdictClass =
    item.verdict === "true"
      ? "bg-gradient-to-r from-emerald-700 to-green-800"
      : item.verdict === "false"
        ? "bg-gradient-to-r from-rose-700 to-red-800"
        : item.verdict === "misleading"
          ? "bg-gradient-to-r from-amber-700 to-orange-800"
          : "bg-gradient-to-r from-slate-700 to-slate-900"
  const verdictLabel =
    item.verdict === "unverified"
      ? "যাচাই চলছে"
      : item.verdict === "misleading"
        ? "বিভ্রান্তিকর"
        : item.verdict === "true"
          ? "সত্য"
          : "মিথ্যা"
  return (
    <article className={`${transitionSlideClass} overflow-hidden`}>
      <div className="space-y-3 p-6 sm:p-8">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${verdictClass}`}>
          {verdictLabel}
        </span>
        <p className="text-sm font-semibold text-slate-200">দাবি: {item.claim}</p>
        {item.claim_source && <p className="text-xs text-slate-300">উৎস: {item.claim_source}</p>}
        <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">{item.title}</h3>
        <p className="text-sm leading-relaxed text-slate-200">{item.explanation}</p>
      </div>
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" loading="lazy" className="block h-auto w-full object-contain" />
      )}
      <div className="flex flex-wrap items-center gap-3 px-6 py-5 text-xs text-slate-300 sm:px-8">
        {item.checker_name && <span>{item.checker_name}</span>}
        <time dateTime={item.created_at}>{item.checked_date}</time>
        {isSafeUrl(item.evidence_url) && (
          <a href={item.evidence_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-300">
            প্রমাণ
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  )
}

function PublicationSlide({ item }: { item: PublicationItem }) {
  const href = isSafeUrl(item.download_url) ? item.download_url : item.pdf_url
  return (
    <article className={`${transitionSlideClass} overflow-hidden`}>
      {item.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.cover_url} alt="" loading="lazy" className="block h-auto w-full object-contain" />
      ) : (
        <div className="flex min-h-48 items-center justify-center bg-white/10 text-cyan-200">
          <FileText className="size-12" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-3 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{item.pub_type}</p>
        <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">{item.title}</h3>
        {item.issue_label && <p className="text-sm font-semibold text-cyan-100">{item.issue_label}</p>}
        {item.description && <p className="text-sm leading-relaxed text-slate-200">{item.description}</p>}
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <time dateTime={item.published_date}>{item.published_date}</time>
          {item.pages_count && <span>{item.pages_count} পৃষ্ঠা</span>}
          {item.editor_name && <span>সম্পাদক: {item.editor_name}</span>}
        </div>
        {isSafeUrl(href) && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-cyan-700 to-blue-800 px-4 py-2 text-xs font-bold text-white hover:from-cyan-600 hover:to-blue-700"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            প্রকাশনা দেখুন
          </a>
        )}
      </div>
    </article>
  )
}

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
    setData(null)
    setFailed(false)
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
        console.error(`Homepage ${kind} preview failed`, error)
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
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          inverted
          eyebrow={sectionConfig.eyebrow || heading.eyebrow}
          title={sectionConfig.titleBn || heading.title}
          titleEn={sectionConfig.titleEn || heading.titleEn}
          subtitle={sectionConfig.subtitleBn}
          subtitleEn={sectionConfig.subtitleEn}
        />
      </div>
      {slides.length ? (
        <HomepageCompactCarousel slides={slides} title={heading.title} interval={7500} />
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="glass-card p-5 text-sm text-slate-200" role="status">
            {failed
              ? "এই অংশের তথ্য এখন লোড করা যাচ্ছে না।"
              : data?.kind === kind
                ? "এই অংশে এখনো কোনো তথ্য নেই।"
                : "তথ্য লোড হচ্ছে..."}
          </p>
        </div>
      )}
    </section>
  )
}
