'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Search,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Scale,
  GraduationCap,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import {
  getResourcesList,
  RESOURCE_CATEGORIES,
  type ResourceItem,
} from '@/lib/resources'
import { useLang } from '@/lib/i18n'

export default function ResourcesCenterPage() {
  const { pick } = useLang()
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('সব')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getResourcesList().then((rows) => {
      setResources(rows)
      setLoading(false)
    })
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>(['সব', ...RESOURCE_CATEGORIES])
    resources.forEach((r) => {
      if (r.category) set.add(r.category)
    })
    return Array.from(set)
  }, [resources])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return resources.filter((r) => {
      if (categoryFilter !== 'সব' && r.category !== categoryFilter) return false
      if (!q) return true
      return [r.title, r.description, r.category, r.author_or_source]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [resources, categoryFilter, search])

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: pick('পরিচিতি', 'About'), href: '/about' },
              { label: pick('তথ্য-উপকরণ কেন্দ্র', 'Resource Centre') },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <BookOpen className="size-3.5" />
              <span>{pick('সাংবাদিকতার তথ্য-উপকরণ কেন্দ্র', 'Journalism Resource Centre')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('সাংবাদিকতার তথ্য-উপকরণ ও নির্দেশিকা', 'Journalism Resources and Guidance')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {pick('ক্যাম্পাস সাংবাদিকদের পেশাগত দক্ষতা উন্নয়ন, প্রতিবেদন তৈরির নির্দেশিকা, তথ্য অধিকার আইনসংক্রান্ত নমুনা, রচনাশৈলী নির্দেশিকা এবং প্রয়োজনীয় ডাউনলোডযোগ্য নমুনা নথি।', 'Materials to support campus journalists, including reporting guidance, Right to Information (RTI) templates, a style guide, and downloadable forms.')}
            </p>
          </div>

          {/* সার্চ ও ক্যাটাগরি ফিল্টার */}
          <section className="glass-card p-4 sm:p-5 space-y-4 text-white">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
              <input
                type="text"
                placeholder={pick('উপকরণের শিরোনাম, নির্দেশিকা বা বিবরণ দিয়ে খুঁজুন', 'Search resources by title, guidance, or description')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold cursor-pointer transition ${
                    categoryFilter === cat
                      ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow'
                      : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                  }`}
                >
                  {cat === 'সব' ? pick('সব বিভাগ', 'All categories') : cat}
                </button>
              ))}
            </div>
          </section>

          {/* রিসোর্স কার্ড গ্রিড */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              {pick('তথ্য-উপকরণ লোড হচ্ছে…', 'Loading resources…')}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((item) => {
                const extLink = item.external_url?.trim() || ''
                const fileLink = item.file_url?.trim() || ''
                const targetLink = extLink || fileLink

                return (
                  <article
                    key={item.id}
                    className="glass-card p-5 sm:p-6 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 px-3 py-0.5 text-[11px] font-bold">
                          {item.category}
                        </span>
                      </div>

                      <h2 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                        {targetLink ? (
                          <a
                            href={targetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-cyan-300 transition-colors"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h2>

                      {item.description && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {item.author_or_source || pick('মাভাবিপ্রবি রিপোর্টার্স ইউনিটির তথ্য-উপকরণ বিভাগ', 'MBSTU Reporters’ Unity Resource Desk')}
                      </span>

                      {targetLink && (
                        <a
                          href={targetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-1.5 font-bold shadow transition"
                        >
                          {fileLink ? <Download className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                          <span>{fileLink ? pick('ডাউনলোড করুন', 'Download') : pick('ওয়েবসাইটে যান', 'Visit website')}</span>
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <BookOpen className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">{pick('কোনো তথ্য-উপকরণ বা নির্দেশিকা পাওয়া যায়নি।', 'No resources or guidance were found.')}</p>
            </div>
          )}

          {/* অন্যান্য পাতার দ্রুত লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/constitution"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Scale className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('গঠনতন্ত্র ও আচরণবিধি', 'Constitution and Code of Conduct')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সংগঠনের মৌলিক বিধিমালা', 'The organisation’s governing rules')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/publications"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <FileText className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('প্রকাশনা আর্কাইভ', 'Publication Archive')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সাময়িকী ও বুলেটিন', 'Periodicals and bulletins')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/members"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <GraduationCap className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('সদস্য তালিকা', 'Member Directory')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সাংবাদিক সদস্যদের তালিকা', 'A directory of journalist members')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
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
