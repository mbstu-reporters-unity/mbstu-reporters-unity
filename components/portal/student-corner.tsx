'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ArrowRight, Award, BookOpen, Feather, GraduationCap, MessageSquareQuote } from 'lucide-react'
import { getStudentItems, type StudentItem } from '@/lib/sb'
import { SectionHeading } from './section-heading'
import { StudentDialog } from './student-dialog'
import { useSiteSettings } from './site-settings-context'
import { useHomepageAutoplay } from './use-homepage-autoplay'
import { useLang } from '@/lib/i18n'

const typeIcon: Record<string, any> = {
  Opinion: MessageSquareQuote,
  'Creative Writing': Feather,
  Achievement: Award,
  'Research Highlight': BookOpen,
}

export function StudentCorner() {
  const { pick } = useLang()
  const settings = useSiteSettings()
  const [items, setItems] = useState<StudentItem[]>([])
  const [selected, setSelected] = useState<StudentItem | null>(null)
  const autoplay = useHomepageAutoplay(items.length, 8000)

  useEffect(() => {
    getStudentItems(false).then(setItems)
  }, [])

  if (!items.length) return null

  const sec = settings.homeSections.sections.find((s) => s.key === 'student_corner')
  const orderedItems = [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const featured = orderedItems[autoplay.index]
  const rest = orderedItems.filter((i) => i.id !== featured.id).slice(0, 4)
  const FeaturedIcon = typeIcon[featured.kind] || MessageSquareQuote

  return (
    <section
      id="student-corner"
      ref={autoplay.containerRef}
      {...autoplay.interactionProps}
      className="relative border-b border-[var(--theme-card-border)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow={sec?.eyebrow ?? 'Student Contributions'}
          title={sec?.titleBn || 'শিক্ষার্থীদের লেখা ও অর্জন'}
          titleEn={sec?.titleEn || 'Student Contributions and Achievements'}
          subtitle={sec?.subtitleBn || 'মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সৃজনশীল লেখা, গবেষণা ও অর্জন প্রকাশের মঞ্চ।'}
          subtitleEn={sec?.subtitleEn || 'A platform for MBSTU students to share opinions, creative writing, research, and achievements.'}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <article
            key={featured.id}
            onClick={() => setSelected(featured)}
            className={`glass-card hero-daylight-dark-surface group relative cursor-pointer overflow-hidden text-white shadow-xl ${
              autoplay.reducedMotion ? '' : 'animate-in fade-in slide-in-from-right-4 duration-500'
            } motion-reduce:animate-none`}
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-slate-950">
              {featured.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.image_url}
                  alt={featured.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-950 to-slate-950">
                  <FeaturedIcon className="size-20 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                <FeaturedIcon className="size-3.5" />
                {featured.kind}
              </span>
              <h3 className="font-serif text-lg font-bold leading-snug text-white drop-shadow-md transition-colors group-hover:text-cyan-300 sm:text-2xl">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="line-clamp-2 text-xs text-slate-200 sm:text-sm">{featured.excerpt}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/20 pt-2 text-xs">
                {featured.author && <span className="font-bold text-white">{featured.author}</span>}
                {featured.dept && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-200">
                    <GraduationCap className="size-3" /> {featured.dept}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-cyan-300">
                  {pick('লেখাটি পড়ুন →', 'Read article →')}
                </span>
              </div>
            </div>
          </article>

          <ul className="grid gap-4 sm:grid-cols-2">
            {rest.map((item) => {
              const Icon = typeIcon[item.kind] || MessageSquareQuote
              return (
                <li key={item.id}>
                  <div
                    onClick={() => setSelected(item)}
                    className="glass-card group flex h-full cursor-pointer flex-col space-y-3 overflow-hidden p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--theme-brand)]">
                        <Icon className="size-3.5" />
                        {item.kind}
                      </span>
                      <ArrowUpRight className="size-4 text-[var(--theme-brand)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>

                    <h3 className="line-clamp-2 flex-1 font-serif text-base font-bold leading-snug text-[var(--theme-text-title)] transition-colors group-hover:text-[var(--theme-brand)]">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="line-clamp-2 text-xs text-[var(--theme-text-body)]">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[var(--theme-card-border)] pt-2.5 text-xs">
                      <div>
                        {item.author && (
                          <p className="font-bold text-[var(--theme-text-title)]">{item.author}</p>
                        )}
                        {item.dept && (
                          <p className="text-[11px] font-medium text-[var(--theme-brand)]">{item.dept}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[var(--theme-brand)] group-hover:underline">
                        {pick('আরও জানুন →', 'Read more →')}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {orderedItems.length > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={autoplay.previous}
              aria-label={pick('পূর্ববর্তী লেখা', 'Previous contribution')}
              className="cursor-pointer rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-2 text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label={pick('পরবর্তী লেখা', 'Next contribution')}
              className="cursor-pointer rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-2 text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/student-corner"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--theme-brand)] px-6 py-3 text-xs font-bold text-[var(--theme-brand-contrast,var(--theme-bg-solid))] shadow-md transition-all hover:brightness-110 active:scale-95 sm:text-sm"
          >
            <span>{pick('শিক্ষার্থীদের সব লেখা দেখুন', 'View all student contributions')}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <StudentDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
