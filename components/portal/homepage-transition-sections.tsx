"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, FileText, CheckCircle2, AlertTriangle } from "lucide-react"
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
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--theme-card-border)] pt-2 text-[var(--theme-text-body)]">
          <span className="text-xs font-semibold">
            {autoplay.index + 1} / {slides.length}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={autoplay.previous}
              aria-label={`${title}: আগেরটি`}
              className="cursor-pointer rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-1.5 text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label={`${title}: পরেরটি`}
              className="cursor-pointer rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-1.5 text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
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
    <article className="glass-card overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] shadow-xs">
      {faculty.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faculty.image_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] max-h-64 w-full object-cover"
        />
      )}
      <div className="space-y-2 p-4 sm:p-5">
        <span className="inline-block rounded-full bg-[var(--theme-brand-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--theme-brand)]">
          {faculty.name_en || "Faculty"}
        </span>
        <h3 className="font-serif text-base font-bold text-[var(--theme-text-title)] sm:text-xl">
          {faculty.name}
        </h3>
        {faculty.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--theme-text-body)] sm:text-sm">
            {faculty.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 border-t border-[var(--theme-card-border)] pt-2">
          {faculty.departments.map((department) => (
            <Link
              key={department.id}
              href={`/department/${department.id}`}
              className="rounded-lg border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] px-2.5 py-1 text-xs font-semibold text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
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
    <article className="glass-card overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] shadow-xs">
      {site.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={site.logo_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] max-h-52 w-full bg-[var(--theme-bg-solid)] object-contain p-2"
        />
      )}
      <div className="space-y-2 p-4 sm:p-5">
        <span className="inline-block rounded-full bg-[var(--theme-brand-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--theme-brand)]">
          {site.category || "Community"}
        </span>
        <h3 className="font-serif text-base font-bold text-[var(--theme-text-title)] sm:text-xl">
          {site.name}
        </h3>
        {site.name_en && (
          <p className="text-xs font-medium text-[var(--theme-text-body)] opacity-85">
            {site.name_en}
          </p>
        )}
        {site.description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-[var(--theme-text-body)] sm:text-sm">
            {site.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 border-t border-[var(--theme-card-border)] pt-2">
          {links.map((link) => (
            <a
              key={`${site.id}:${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-brand)] px-3 py-1 text-xs font-bold text-[var(--theme-brand-contrast,#ffffff)] transition hover:bg-[var(--theme-brand-dark)]"
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
    <article className="glass-card space-y-2.5 overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 text-[var(--theme-text-body)] shadow-xs sm:p-5">
      <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-2">
        <span className="text-xs font-bold text-[var(--theme-brand)]">{item.date_label}</span>
        <span className="rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--theme-text-title)]">
          {item.category}
        </span>
      </div>
      <h3 className="font-serif text-base font-bold leading-snug text-[var(--theme-text-title)] sm:text-xl">
        {item.title}
      </h3>
      <p className="line-clamp-3 text-xs leading-relaxed text-[var(--theme-text-body)] sm:text-sm">
        {item.summary}
      </p>
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] max-h-48 w-full rounded-xl object-cover"
        />
      )}
      {isSafeUrl(item.post_url) && (
        <a
          href={item.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-[var(--theme-brand)] hover:underline"
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
    ? "bg-emerald-600 text-white border-emerald-500"
    : isFalse
      ? "bg-rose-600 text-white border-rose-500"
      : "bg-amber-400 text-slate-950 border-amber-300"

  return (
    <article className="glass-card space-y-2.5 overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 text-[var(--theme-text-body)] shadow-xs sm:p-5">
      <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeCls}`}>
          {isTrue ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
          <span>{label}</span>
        </span>
        <span className="text-[10px] text-[var(--theme-text-body)] opacity-75">{item.checked_date}</span>
      </div>

      <div className="rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] p-2.5">
        <p className="text-[11px] font-bold uppercase text-[var(--theme-brand)]">প্রচারিত দাবি:</p>
        <p className="line-clamp-2 text-xs font-semibold text-[var(--theme-text-title)] sm:text-sm">
          “{item.claim}”
        </p>
      </div>

      <h3 className="font-serif text-base font-bold leading-snug text-[var(--theme-text-title)] sm:text-lg">
        {item.title}
      </h3>
      <p className="line-clamp-3 text-xs leading-relaxed text-[var(--theme-text-body)] sm:text-sm">
        {item.explanation}
      </p>

      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] max-h-48 w-full rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] object-contain"
        />
      )}
    </article>
  )
}

/* ==================== ৫. প্রকাশনা ও আর্কাইভ কার্ড ==================== */
function PublicationSlide({ item }: { item: PublicationItem }) {
  const href = isSafeUrl(item.download_url) ? item.download_url : item.pdf_url
  return (
    <article className="glass-card space-y-3 overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 text-[var(--theme-text-body)] shadow-xs sm:p-5">
      <div className="flex items-start gap-4">
        {item.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover_url}
            alt=""
            loading="lazy"
            className="h-28 w-20 shrink-0 rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] object-cover shadow-xs"
          />
        ) : (
          <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-brand)]">
            <FileText className="size-8" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <span className="inline-block rounded-full bg-[var(--theme-brand-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--theme-brand)]">
            {item.pub_type}
          </span>
          <h3 className="line-clamp-2 font-serif text-base font-bold text-[var(--theme-text-title)]">
            {item.title}
          </h3>
          {item.issue_label && (
            <p className="text-xs font-semibold text-[var(--theme-text-body)]">
              {item.issue_label}
            </p>
          )}
          <p className="text-[11px] text-[var(--theme-text-body)] opacity-75">
            {item.published_date}
          </p>
        </div>
      </div>
      {item.description && (
        <p className="line-clamp-2 border-t border-[var(--theme-card-border)] pt-2 text-xs leading-relaxed text-[var(--theme-text-body)]">
          {item.description}
        </p>
      )}
      {isSafeUrl(href) && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--theme-brand)] px-4 py-2 text-xs font-bold text-[var(--theme-brand-contrast,#ffffff)] shadow-xs transition hover:bg-[var(--theme-brand-dark)]"
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
      } catch {
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
    <section className="border-b border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={sectionConfig.eyebrow || heading.eyebrow}
          title={sectionConfig.titleBn || heading.title}
          titleEn={sectionConfig.titleEn || heading.titleEn}
          subtitle={sectionConfig.subtitleBn}
          subtitleEn={sectionConfig.subtitleEn}
        />
        {slides.length ? (
          <HomepageCompactCarousel slides={slides} title={heading.title} interval={7500} />
        ) : (
          <p className="rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 text-center text-xs text-[var(--theme-text-body)]">
            {failed ? "তথ্য লোড করা যায়নি।" : "তথ্য লোড হচ্ছে..."}
          </p>
        )}
      </div>
    </section>
  )
}
