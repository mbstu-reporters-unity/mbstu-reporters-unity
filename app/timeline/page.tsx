'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  CalendarDays,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Radio,
  Flag,
  RefreshCw,
  ArrowRight,
  Camera,
  ShieldAlert,
  BookOpen,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import {
  getTimelineItems,
  TIMELINE_CATEGORIES,
  type TimelineItem,
} from '@/lib/content-hub'
import { useLang } from '@/lib/i18n'

export default function CampusTimelinePage() {
  const { lang, pick } = useLang()
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('সব')
  const [catFilter, setCatFilter] = useState('সব')
  const [search, setSearch] = useState('')

  async function loadData() {
    setLoading(true)
    const rows = await getTimelineItems()
    setItems(rows)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const years = useMemo(() => {
    const set = new Set<string>(['সব'])
    items.forEach((it) => {
      if (it.year) set.add(it.year)
    })
    return Array.from(set)
  }, [items])

  const categories = useMemo(() => {
    const set = new Set<string>(['সব', ...TIMELINE_CATEGORIES])
    items.forEach((it) => {
      if (it.category) set.add(it.category)
    })
    return Array.from(set)
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      if (yearFilter !== 'সব' && it.year !== yearFilter) return false
      if (catFilter !== 'সব' && it.category !== catFilter) return false
      if (!q) return true
      return [it.title, it.summary, it.date_label, it.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [items, yearFilter, catFilter, search])

  const statusBadge = (status?: string | null) => {
    if (status === 'চলমান') {
      return {
        cls: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        Icon: Radio,
      }
    }
    if (status === 'মাইলফলক') {
      return {
        cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        Icon: Flag,
      }
    }
    return {
      cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      Icon: CheckCircle2,
    }
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: pick('সংবাদ ও গণমাধ্যম', 'News and Media') },
              { label: pick('ক্যাম্পাসের ঘটনাপঞ্জি', 'Campus Timeline') },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Clock className="size-3.5" />
              <span>{pick('ক্যাম্পাসের ঘটনাপঞ্জি', 'Campus Events Timeline')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('ক্যাম্পাসের ঘটনাপঞ্জি', 'Campus Timeline')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {pick('মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের উল্লেখযোগ্য ঘটনা, শিক্ষার্থীদের দাবি, একাডেমিক সিদ্ধান্ত ও ঐতিহাসিক মাইলফলকের সময়ানুক্রমিক বিবরণ।', 'A chronological record of significant events, student concerns, academic decisions, and historic milestones at Mawlana Bhashani Science and Technology University.')}
            </p>
          </div>

          {/* সার্চ ও ফিল্টার বক্স */}
          <section className="glass-card p-4 sm:p-5 space-y-4 text-white">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <input
                  type="text"
                  placeholder={pick('ঘটনার শিরোনাম, তারিখ বা বিবরণ দিয়ে খুঁজুন', 'Search by event title, date, or description')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {years.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYearFilter(yr)}
                      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold cursor-pointer transition ${
                        yearFilter === yr
                          ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow'
                          : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                      }`}
                    >
                      {yr === 'সব' ? pick('সব বছর', 'All years') : yr}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="p-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0"
                  title={pick('তথ্য হালনাগাদ করুন', 'Refresh')}
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatFilter(cat)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold cursor-pointer transition ${
                    catFilter === cat
                      ? 'border-amber-300 bg-amber-400 text-slate-950'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {cat === 'সব' ? pick('সব বিভাগ', 'All categories') : cat}
                </button>
              ))}
            </div>
          </section>

          {/* ভার্টিকাল টাইমলাইন */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              {pick('ঘটনাপঞ্জি লোড হচ্ছে…', 'Loading timeline…')}
            </div>
          ) : filtered.length > 0 ? (
            <section className="relative border-l-2 border-cyan-400/45 ml-3 sm:ml-6 pl-5 sm:pl-8 space-y-6 py-2">
              {filtered.map((item) => {
                const st = statusBadge(item.status)
                const StIcon = st.Icon
                const isExternal = item.post_url && /^https?:\/\//i.test(item.post_url.trim())

                return (
                  <article
                    key={item.id}
                    className={`glass-card relative p-5 sm:p-6 text-white space-y-3 ${
                      item.is_highlight ? 'ring-1 ring-amber-400/50' : ''
                    }`}
                  >
                    {/* টাইমলাইন বিন্দু */}
                    <span
                      className={`absolute -left-[29px] sm:-left-[41px] top-6 size-4 rounded-full ring-4 ring-slate-950 shadow-lg ${
                        item.is_highlight ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                    />

                    {/* টপ মেটা */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/20 px-3 py-0.5 font-bold text-cyan-200">
                          <CalendarDays className="size-3 text-cyan-300" />
                          <span>{item.date_label}</span>
                        </span>
                        <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                          {item.category}
                        </span>
                        {item.is_highlight && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold">
                            <Sparkles className="size-3" /> {pick('উল্লেখযোগ্য ঘটনা', 'Key event')}
                          </span>
                        )}
                      </div>

                      {item.status && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${st.cls}`}
                        >
                          <StIcon className="size-3" />
                          <span>{item.status}</span>
                        </span>
                      )}
                    </div>

                    {/* ছবি (যদি থাকে) */}
                    {item.image_url && (
                      <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full max-h-64 object-cover"
                        />
                      </div>
                    )}

                    {/* শিরোনাম ও বিবরণ */}
                    <div className="space-y-1.5">
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                        {item.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {item.summary}
                      </p>
                    </div>

                    {/* বিস্তারিত লিংক */}
                    {item.post_url && item.post_url.trim() && (
                      <div className="pt-2 border-t border-white/10">
                        {isExternal ? (
                          <a
                            href={item.post_url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition"
                          >
                            <span>{pick('বিস্তারিত প্রতিবেদন পড়ুন', 'Read the full report')}</span>
                            <ExternalLink className="size-3.5" />
                          </a>
                        ) : (
                          <Link
                            href={item.post_url.trim()}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition"
                          >
                            <span>{pick('বিস্তারিত প্রতিবেদন পড়ুন', 'Read the full report')}</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </section>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <Clock className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">{pick('এই ফিল্টারে কোনো ঘটনা পাওয়া যায়নি।', 'No events match these filters.')}</p>
            </div>
          )}

          {/* অন্যান্য পাতার দ্রুত লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/gallery"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Camera className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('ছবি ও ভিডিও গ্যালারি', 'Photo and Video Gallery')}</p>
                  <p className="text-[10px] text-slate-300">{pick('ছবি ও ভিডিওর সংরক্ষণাগার', 'Archive of photographs and videos')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/fact-check"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  <ShieldAlert className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('তথ্য-যাচাই ডেস্ক', 'Fact-check Desk')}</p>
                  <p className="text-[10px] text-slate-300">{pick('গুজব ও তথ্য যাচাই', 'Verification of claims and information')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-rose-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/publications"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('প্রকাশনা সংরক্ষণাগার', 'Publication Archive')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সাময়িকী, বুলেটিন ও পিডিএফ', 'Periodicals, bulletins, and PDFs')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
