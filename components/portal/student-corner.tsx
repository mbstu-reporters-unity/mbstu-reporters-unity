'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Award, BookOpen, Feather, GraduationCap, MessageSquareQuote } from 'lucide-react'
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
    <section id="student-corner" className="bg-brand-soft/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Student Corner"
          title="স্টুডেন্ট কর্নার"
          subtitle="Opinions, creative writing, research highlights and achievements — written by MBSTU students."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* বড় ফিচার্ড কার্ড */}
          <article
            onClick={() => setSelected(featured)}
            className="group relative overflow-hidden rounded-2xl bg-navy text-white shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/11]">
              {featured.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.image_url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark to-navy flex items-center justify-center">
                  <FeaturedIcon className="size-20 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded bg-crimson px-2.5 py-1 text-xs font-bold">
                <FeaturedIcon className="size-3.5" />
                {featured.kind}
              </span>
              <h3 className="mt-3 text-balance font-serif text-xl font-bold leading-snug sm:text-2xl group-hover:text-gold transition-colors">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm text-white/80">{featured.excerpt}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {featured.author && <span className="text-sm font-semibold">{featured.author}</span>}
                {featured.dept && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                    <GraduationCap className="size-3" /> {featured.dept}
                  </span>
                )}
                {featured.batch && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-[#8a6a0a]">
                    {featured.batch}
                  </span>
                )}
                <span className="ml-auto text-xs font-bold text-gold flex items-center gap-1">
                  পড়ুন ও রিঅ্যাক্ট দিন →
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
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg cursor-pointer"
                  >
                    {/* প্রতিটি লেখার ছবি */}
                    {item.image_url && (
                      <div className="h-32 w-full overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson">
                          <Icon className="size-3.5" />
                          {item.kind}
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-brand" />
                      </div>

                      <h3 className="mt-2.5 flex-1 font-serif text-base font-bold leading-snug text-navy group-hover:text-brand transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.excerpt}
                        </p>
                      )}

                      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-xs">
                        <div>
                          {item.author && <p className="font-bold text-navy">{item.author}</p>}
                          {item.dept && <p className="text-[11px] text-gray-500">{item.dept}</p>}
                        </div>
                        <span className="text-[11px] font-bold text-brand group-hover:underline">
                          বিস্তারিত →
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* স্টুডেন্ট কর্নারের সব পোস্ট দেখার বাটন (SPA Link যুক্ত) */}
        <div className="mt-8 text-center">
          <Link
            href="/student-corner"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition-all active:scale-95 cursor-pointer"
          >
            <span>স্টুডেন্ট কর্নারের সব লেখা ও ক্যাটাগরি দেখুন</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* বিস্তারিত পড়ার পপ-আপ */}
      <StudentDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
