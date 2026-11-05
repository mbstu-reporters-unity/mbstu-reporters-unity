'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Award, BookOpen, Feather, GraduationCap, MessageSquareQuote } from 'lucide-react'
import { getStudentItems, getStudentCategories, type StudentItem } from '@/lib/sb'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { SectionHeading } from '@/components/portal/section-heading'
import { StudentDialog } from '@/components/portal/student-dialog'

const kindIcons: Record<string, any> = {
  Opinion: MessageSquareQuote,
  'Creative Writing': Feather,
  Achievement: Award,
  'Research Highlight': BookOpen,
}

export default function StudentCornerPage() {
  const [items, setItems] = useState<StudentItem[]>([])
  const [kinds, setKinds] = useState<string[]>([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<StudentItem | null>(null)

  useEffect(() => {
    // পোস্ট ও ক্যাটাগরি লোড
    Promise.all([getStudentItems(false), getStudentCategories()]).then(([allPosts, allKinds]) => {
      setItems(allPosts)
      setKinds(['All', ...allKinds])

      // লিংকে আইডি থাকলে অটো পপ-আপ খোলা
      if (typeof window !== 'undefined') {
        const id = new URLSearchParams(window.location.search).get('id')
        if (id) {
          const found = allPosts.find((p) => p.id === id)
          if (found) setSelected(found)
        }
      }
    })
  }, [])

  const visible = filter === 'All' ? items : items.filter((it) => it.kind === filter)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-[75vh] py-10 sm:py-16 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 space-y-8">
          
          {/* হোমপেজে ফেরার লিংক */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </a>
          </div>

          <SectionHeading
            eyebrow="Student Corner"
            title="শিক্ষার্থীদের লেখা ও কর্নার"
            subtitle="মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সাহিত্য, গবেষণা ও অর্জনের উন্মুক্ত মঞ্চ।"
          />

          {/* ক্যাটাগরি বাটন ফিল্টার */}
          <div className="flex gap-2 overflow-x-auto pb-2" role="group">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                  filter === k
                    ? 'border-brand bg-brand text-white shadow'
                    : 'border-border bg-white text-navy hover:bg-brand-soft'
                }`}
              >
                {k === 'All' ? 'সব লেখা' : k}
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({k === 'All' ? items.length : items.filter((it) => it.kind === k).length})
                </span>
              </button>
            ))}
          </div>

          {/* পোস্টগুলোর কার্ড গ্রিড */}
          {visible.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => {
                const Icon = kindIcons[item.kind] || MessageSquareQuote
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-xl cursor-pointer"
                  >
                    {/* কার্ডের ছবি */}
                    {item.image_url ? (
                      <div className="h-44 w-full overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-28 w-full bg-brand-soft flex items-center justify-center text-brand">
                        <Icon className="size-10 opacity-30" />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson">
                          <Icon className="size-3.5" />
                          {item.kind}
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-brand" />
                      </div>

                      <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-navy group-hover:text-brand transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {item.excerpt}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                        <div>
                          {item.author && <p className="font-bold text-navy">{item.author}</p>}
                          {item.dept && (
                            <p className="text-[11px] text-gray-500">
                              {item.dept} {item.batch ? `· ${item.batch}` : ''}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-brand group-hover:underline">
                          পড়ুন ও রিঅ্যাক্ট দিন →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-10 text-center bg-white">
              <p className="text-sm font-bold text-gray-500">এই বিভাগে এখনো কোনো লেখা প্রকাশিত হয়নি।</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <BackToTop />

      {/* বিস্তারিত পড়ার পপ-আপ */}
      <StudentDialog item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
