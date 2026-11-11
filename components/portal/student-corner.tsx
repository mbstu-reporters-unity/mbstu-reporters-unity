'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Award, BookOpen, Feather, GraduationCap, MessageSquareQuote, Sparkles } from 'lucide-react'
import { getStudentItems, type StudentItem } from '@/lib/sb'
import { SectionHeading } from './section-heading'
import { StudentDialog } from './student-dialog'

const typeIcon: Record<string, any> = {
  Opinion: MessageSquareQuote,
  'Creative Writing': Feather,
  Achievement: Award,
  'Research Highlight': BookOpen,
}

export function StudentCorner() {
  const [items, setItems] = useState<StudentItem[]>([])
  const [selected, setSelected] = useState<StudentItem | null>(null)

  useEffect(() => {
    getStudentItems(false).then(setItems)
  }, [])

  if (!items.length) return null

  const featured = items.find((i) => i.featured) || items[0]
  const rest = items.filter((i) => i.id !== featured.id).slice(0, 4)
  const FeaturedIcon = typeIcon[featured.kind] || MessageSquareQuote

  return (
    <section id="student-corner" className="py-16 sm:py-20 relative">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          inverted
          eyebrow="Student Corner"
          title="স্টুডেন্ট কর্নার"
          subtitle="মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সাহিত্য, গবেষণা ও অর্জনের উন্মুক্ত মঞ্চ।"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* বড় ফিচার্ড কার্ড */}
          <article
            onClick={() => setSelected(featured)}
            className="glass-card group relative overflow-hidden text-white shadow-xl cursor-pointer"
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/11]">
              {featured.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.image_url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-slate-950 flex items-center justify-center">
                  <FeaturedIcon className="size-20 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 border border-white/30 px-3 py-1 text-xs font-bold text-white shadow-md">
                <FeaturedIcon className="size-3.5" />
                {featured.kind}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug group-hover:text-cyan-300 transition-colors drop-shadow-md">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="line-clamp-2 text-sm text-slate-200">{featured.excerpt}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-white/20 text-xs">
                {featured.author && <span className="font-bold text-white">{featured.author}</span>}
                {featured.dept && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-200">
                    <GraduationCap className="size-3" /> {featured.dept}
                  </span>
                )}
                <span className="ml-auto text-xs font-bold text-cyan-300 flex items-center gap-1">
                  পড়ুন →
                </span>
              </div>
            </div>
          </article>

          {/* বাকি কার্ডগুলো */}
          <ul className="grid gap-4 sm:grid-cols-2">
            {rest.map((item) => {
              const Icon = typeIcon[item.kind] || MessageSquareQuote
              return (
                <li key={item.id}>
                  <div
                    onClick={() => setSelected(item)}
                    className="glass-card group flex h-full flex-col overflow-hidden p-4 sm:p-5 shadow-md cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                        <Icon className="size-3.5" />
                        {item.kind}
                      </span>
                      <ArrowUpRight className="size-4 text-cyan-200 transition-colors group-hover:text-white" />
                    </div>

                    <h3 className="flex-1 font-serif text-base font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="line-clamp-2 text-xs text-slate-300">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-2.5 text-xs">
                      <div>
                        {item.author && <p className="font-bold text-white">{item.author}</p>}
                        {item.dept && <p className="text-[11px] text-cyan-200/90">{item.dept}</p>}
                      </div>
                      <span className="text-[11px] font-bold text-cyan-300 group-hover:underline">
                        বিস্তারিত →
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/student-corner"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border border-white/30 px-6 py-3 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <span>স্টুডেন্ট কর্নারের সব লেখা দেখুন</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <StudentDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
