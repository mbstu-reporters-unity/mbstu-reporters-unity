'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Award, BookOpen, Feather, MessageSquareQuote, Sparkles } from 'lucide-react'
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
    Promise.all([getStudentItems(false), getStudentCategories()]).then(([allPosts, allKinds]) => {
      setItems(allPosts)
      setKinds(['All', ...allKinds])

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
      <main className="min-h-[75vh] py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 space-y-8">
          
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>
          </div>

          <SectionHeading
            inverted
            eyebrow="Student Corner"
            title="শিক্ষার্থীদের লেখা ও কর্নার"
            subtitle="মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সাহিত্য, গবেষণা ও অর্জনের উন্মুক্ত মঞ্চ।"
          />

          {/* ফিল্টার বাটন */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="group">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  filter === k
                    ? 'border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {k === 'All' ? 'সব লেখা' : k}
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({k === 'All' ? items.length : items.filter((it) => it.kind === k).length})
                </span>
              </button>
            ))}
          </div>

          {/* পোস্টগুলোর কার্ড গ্রিড */}
          {visible.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => {
                const Icon = kindIcons[item.kind] || MessageSquareQuote
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="glass-card group flex flex-col overflow-hidden text-white cursor-pointer hover:border-cyan-400"
                  >
                    {/* কার্ডের ছবি অথবা দৃষ্টিনন্দন আর্ট প্লেসহোল্ডার */}
                    {item.image_url ? (
                      <div className="h-44 w-full overflow-hidden bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-3 text-center border-b border-white/10 relative overflow-hidden">
                        <Icon className="size-10 text-cyan-400/30 mb-1" />
                        <span className="text-[11px] font-serif italic text-cyan-100/70 line-clamp-1">
                          "ক্যাম্পাস শিক্ষার্থীদের সাহিত্য ও চিন্তার প্রকাশ"
                        </span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                          <Icon className="size-3" />
                          {item.kind}
                        </span>
                        <ArrowUpRight className="size-4 text-cyan-200 transition-colors group-hover:text-white" />
                      </div>

                      <h3 className="font-serif text-lg font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors line-clamp-2 drop-shadow-sm">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="line-clamp-3 text-xs leading-relaxed text-slate-300">
                          {item.excerpt}
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 text-xs">
                        <div>
                          {item.author && <p className="font-bold text-white">{item.author}</p>}
                          {item.dept && (
                            <p className="text-[11px] text-cyan-200/80">
                              {item.dept} {item.batch ? `· ${item.batch}` : ''}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-cyan-300 group-hover:underline">
                          পড়ুন ও মন্তব্য করুন →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-10 text-center text-white/70 space-y-1">
              <p className="text-sm font-bold">এই বিভাগে এখনো কোনো লেখা প্রকাশিত হয়নি।</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <BackToTop />

      <StudentDialog item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
