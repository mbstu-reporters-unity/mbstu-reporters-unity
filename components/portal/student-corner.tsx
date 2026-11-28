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
  const featured = orderedItems[autoplay.index] || orderedItems[0]
  const rest = orderedItems.filter((i) => i.id !== featured.id).slice(0, 4)
  const FeaturedIcon = typeIcon[featured.kind] || MessageSquareQuote

  return (
    <section
      id="student-corner"
      ref={autoplay.containerRef}
      {...autoplay.interactionProps}
      className="py-12 sm:py-16 relative border-b border-[var(--theme-card-border)]"
    >
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted={false}
          eyebrow={sec?.eyebrow ?? 'Student Contributions'}
          title={sec?.titleBn || 'শিক্ষার্থীদের লেখা ও অর্জন'}
          titleEn={sec?.titleEn || 'Student Contributions and Achievements'}
          subtitle={sec?.subtitleBn || 'মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সৃজনশীল লেখা, গবেষণা ও অর্জন প্রকাশের মঞ্চ।'}
          subtitleEn={sec?.subtitleEn || 'A platform for MBSTU students to share opinions, creative writing, research, and achievements.'}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ফিচার্ড বড় কার্ড */}
          <article
            key={featured.id}
            onClick={() => setSelected(featured)}
            className={`glass-card hero-daylight-dark-surface group relative overflow-hidden text-white shadow-lg cursor-pointer ${
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
                  className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-slate-950 flex items-center justify-center">
                  <FeaturedIcon className="size-20 opacity-20 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 border border-white/30 px-3 py-1 text-xs font-bold text-white shadow-md">
                <FeaturedIcon className="size-3.5" />
                {featured.kind}
              </span>
              <h3 className="font-serif text-lg sm:text-2xl font-bold leading-snug text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="line-clamp-2 text-xs sm:text-sm text-slate-200">{featured.excerpt}</p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-white/20 text-xs">
                {featured.author && <span className="font-bold text-white">{featured.author}</span>}
                {featured.dept && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-200">
                    <GraduationCap className="size-3" /> {featured.dept}
                  </span>
                )}
                <span className="ml-auto text-xs font-bold text-cyan-300 flex items-center gap-1">
                  {pick('লেখাটি পড়ুন →', 'Read article →')}
                </span>
              </div>
            </div>
          </article>

          {/* বাকি ৪টি কার্ড গ্রিড */}
          <ul className="grid gap-4 sm:grid-cols-2">
            {rest.map((item) => {
              const Icon = typeIcon[item.kind] || MessageSquareQuote
              return (
                <li key={item.id}>
                  <div
                    onClick={() => setSelected(item)}
                    className="glass-card group flex h-full flex-col overflow-hidden p-4 sm:p-5 shadow-xs cursor-pointer space-y-2.5 text-[var(--theme-text-body)] hover:border-[var(--theme-brand)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--theme-brand)] bg-[var(--theme-brand-soft)] px-2.5 py-0.5 rounded-full border border-[var(--theme-card-border)]">
                        <Icon className="size-3" />
                        {item.kind}
                      </span>
                      <ArrowUpRight className="size-4 text-[var(--theme-text-body)] transition-colors group-hover:text-[var(--theme-brand)]" />
                    </div>

                    <h3 className="flex-1 font-serif text-sm sm:text-base font-bold leading-snug text-[var(--theme-text-title)] group-hover:text-[var(--theme-brand)] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="line-clamp-2 text-xs text-[var(--theme-text-body)]">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[var(--theme-card-border)] pt-2 text-xs">
                      <div>
                        {item.author && <p className="font-bold text-[var(--theme-text-title)] text-xs">{item.author}</p>}
                        {item.dept && <p className="text-[10px] text-[var(--theme-text-body)] opacity-80">{item.dept}</p>}
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
              className="rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-2 text-[var(--theme-text-title)] hover:border-[var(--theme-brand)] transition"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label={pick('পরবর্তী লেখা', 'Next contribution')}
              className="rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-2 text-[var(--theme-text-title)] hover:border-[var(--theme-brand)] transition"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/student-corner"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-brand)] hover:bg-[var(--theme-brand-dark)] text-[var(--theme-brand-contrast,var(--theme-bg-solid))] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
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
