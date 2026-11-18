'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  CalendarDays,
  Newspaper,
  Sparkles,
  User,
  ArrowRight,
  Clock,
  ShieldCheck,
  Camera,
  Layers,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import {
  getPublicationItems,
  PUBLICATION_TYPES,
  type PublicationItem,
} from '@/lib/content-hub'
import { getVisiblePosts, type Post } from '@/lib/sb'

function formatBnDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  })
}

function formatBnMonthYear(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('bn-BD', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  })
}

export default function PublicationsAndArchivePage() {
  const [activeTab, setActiveTab] = useState<'publications' | 'news_archive'>('publications')

  // প্রকাশনা স্টেট
  const [pubs, setPubs] = useState<PublicationItem[]>([])
  const [pubTypeFilter, setPubTypeFilter] = useState('সব')
  const [pubSearch, setPubSearch] = useState('')

  // সংবাদ আর্কাইভ স্টেট
  const [posts, setPosts] = useState<Post[]>([])
  const [newsCatFilter, setNewsCatFilter] = useState('সব')
  const [newsMonthFilter, setNewsMonthFilter] = useState('সব')
  const [newsSearch, setNewsSearch] = useState('')

  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const [pubRows, postRows] = await Promise.all([
      getPublicationItems(),
      getVisiblePosts(200),
    ])
    setPubs(pubRows)
    setPosts(postRows)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const pubTypes = useMemo(() => {
    const set = new Set<string>(['সব', ...PUBLICATION_TYPES])
    pubs.forEach((p) => {
      if (p.pub_type) set.add(p.pub_type)
    })
    return Array.from(set)
  }, [pubs])

  const filteredPubs = useMemo(() => {
    const q = pubSearch.trim().toLowerCase()
    return pubs.filter((p) => {
      if (pubTypeFilter !== 'সব' && p.pub_type !== pubTypeFilter) return false
      if (!q) return true
      return [p.title, p.issue_label, p.description, p.editor_name, p.pub_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [pubs, pubTypeFilter, pubSearch])

  const newsCategories = useMemo(() => {
    const set = new Set<string>(['সব'])
    posts.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set)
  }, [posts])

  const newsMonths = useMemo(() => {
    const set = new Set<string>(['সব'])
    posts.forEach((p) => {
      const m = formatBnMonthYear(p.created_at)
      if (m) set.add(m)
    })
    return Array.from(set)
  }, [posts])

  const filteredPosts = useMemo(() => {
    const q = newsSearch.trim().toLowerCase()
    return posts.filter((p) => {
      if (newsCatFilter !== 'সব' && p.category !== newsCatFilter) return false
      if (newsMonthFilter !== 'সব' && formatBnMonthYear(p.created_at) !== newsMonthFilter) {
        return false
      }
      if (!q) return true
      return [p.title, p.heading, p.author, p.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [posts, newsCatFilter, newsMonthFilter, newsSearch])

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: 'সংবাদ ও মিডিয়া' },
              { label: 'প্রকাশনা ও আর্কাইভ' },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <BookOpen className="size-3.5" />
              <span>Publications & Digital Archive • প্রকাশনা ও আর্কাইভ</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              প্রকাশনা ও সংবাদ আর্কাইভ
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              মাভাবিপ্রবি রিপোর্টার্স ইউনিটির ম্যাগাজিন, মাসিক বুলেটিন, জার্নাল, ই-বুক, বার্ষিক প্রতিবেদন (PDF) এবং প্রকাশিত সকল সংবাদের পূর্ণাঙ্গ ডিজিটাল আর্কাইভ।
            </p>

            {/* ২ প্রধান ট্যাব বাটন */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('publications')}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer transition ${
                  activeTab === 'publications'
                    ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow-lg'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <BookOpen className="size-4" />
                <span>প্রকাশনা ও PDF ({pubs.length.toLocaleString('bn-BD')})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('news_archive')}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer transition ${
                  activeTab === 'news_archive'
                    ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow-lg'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Newspaper className="size-4" />
                <span>সংবাদ আর্কাইভ ({posts.length.toLocaleString('bn-BD')})</span>
              </button>
            </div>
          </div>

          {/* ==================== ট্যাব ১: ম্যাগাজিন, বুলেটিন ও PDF প্রকাশনা ==================== */}
          {activeTab === 'publications' && (
            <div className="space-y-6 animate-in fade-in">
              <section className="glass-card p-4 sm:p-5 space-y-4 text-white">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                    <input
                      type="text"
                      placeholder="ম্যাগাজিন, বুলেটিন, সংখ্যা বা সম্পাদকের নাম দিয়ে খুঁজুন..."
                      value={pubSearch}
                      onChange={(e) => setPubSearch(e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={loadAll}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {pubTypes.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPubTypeFilter(pt)}
                      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${
                        pubTypeFilter === pt
                          ? 'border-amber-300 bg-amber-400 text-slate-950 shadow'
                          : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </section>

              {loading ? (
                <div className="glass-card p-12 text-center text-sm text-slate-300">
                  প্রকাশনা লোড হচ্ছে...
                </div>
              ) : filteredPubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPubs.map((pub) => {
                    const safePdf =
                      pub.pdf_url && /^https?:\/\//i.test(pub.pdf_url.trim())
                        ? pub.pdf_url.trim()
                        : null

                    return (
                      <article
                        key={pub.id}
                        className="glass-card overflow-hidden flex flex-col justify-between text-white"
                      >
                        <div>
                          {/* কভার ছবি অথবা প্রিমিয়াম বুক-কভার */}
                          <div className="relative h-52 w-full overflow-hidden border-b border-white/15 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950">
                            {pub.cover_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={pub.cover_url}
                                alt={pub.title}
                                loading="lazy"
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex flex-col items-center justify-center p-5 text-center space-y-2">
                                <div className="size-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
                                  <FileText className="size-7" />
                                </div>
                                <p className="font-serif text-base font-bold text-white line-clamp-2">
                                  {pub.title}
                                </p>
                                {pub.issue_label && (
                                  <span className="text-[11px] text-amber-300 font-semibold">
                                    {pub.issue_label}
                                  </span>
                                )}
                              </div>
                            )}

                            <span className="absolute top-3 left-3 rounded-full bg-black/70 backdrop-blur px-3 py-0.5 text-[11px] font-bold text-cyan-300 border border-white/20">
                              {pub.pub_type}
                            </span>

                            {pub.pages_count && (
                              <span className="absolute top-3 right-3 rounded-full bg-black/70 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/20">
                                {pub.pages_count}
                              </span>
                            )}
                          </div>

                          <div className="p-5 space-y-2.5">
                            {pub.issue_label && (
                              <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                <Sparkles className="size-3.5 shrink-0" />
                                <span>{pub.issue_label}</span>
                              </p>
                            )}

                            <h2 className="font-serif text-lg font-bold text-white leading-snug">
                              {pub.title}
                            </h2>

                            {pub.description && (
                              <p className="text-xs text-slate-200 leading-relaxed line-clamp-3">
                                {pub.description}
                              </p>
                            )}

                            <div className="pt-2 space-y-1 text-[11px] text-slate-300 border-t border-white/10">
                              <p className="flex items-center gap-1.5">
                                <CalendarDays className="size-3 text-cyan-400 shrink-0" />
                                <span>প্রকাশকাল: {pub.published_date}</span>
                              </p>
                              {pub.editor_name && (
                                <p className="flex items-center gap-1.5">
                                  <User className="size-3 text-cyan-400 shrink-0" />
                                  <span>{pub.editor_name}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          {safePdf ? (
                            <a
                              href={safePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-2.5 text-xs font-bold shadow-md transition active:scale-95 border border-white/20"
                            >
                              <Download className="size-4" />
                              <span>পড়ুন ও ডাউনলোড করুন (PDF)</span>
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : (
                            <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-300 py-2.5 text-xs font-semibold">
                              <FileText className="size-3.5 text-cyan-300" />
                              <span>PDF লিংক শীঘ্রই যুক্ত হবে</span>
                            </span>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="glass-card p-12 text-center text-slate-300 space-y-2">
                  <BookOpen className="size-10 text-white/40 mx-auto" />
                  <p className="text-base font-bold text-white">কোনো প্রকাশনা পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== ট্যাব ২: সম্পূর্ণ সংবাদ আর্কাইভ ==================== */}
          {activeTab === 'news_archive' && (
            <div className="space-y-6 animate-in fade-in">
              <section className="glass-card p-4 sm:p-5 space-y-3 text-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="relative sm:col-span-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                    <input
                      type="text"
                      placeholder="সংবাদের শিরোনাম বা লেখক..."
                      value={newsSearch}
                      onChange={(e) => setNewsSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 pl-10 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <select
                    value={newsCatFilter}
                    onChange={(e) => setNewsCatFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {newsCategories.map((c) => (
                      <option key={c} value={c}>
                        {c === 'সব' ? 'সব ক্যাটাগরি' : c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newsMonthFilter}
                    onChange={(e) => setNewsMonthFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {newsMonths.map((m) => (
                      <option key={m} value={m}>
                        {m === 'সব' ? 'সব মাস ও বছর' : m}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-cyan-200 font-semibold flex items-center gap-1.5">
                  <Layers className="size-3.5 text-cyan-400" />
                  <span>মোট {filteredPosts.length.toLocaleString('bn-BD')}টি প্রকাশিত প্রতিবেদন</span>
                </p>
              </section>

              {filteredPosts.length > 0 ? (
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="glass-card p-4 flex items-center gap-4 text-white hover:border-cyan-400 transition group"
                    >
                      {post.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.image_url}
                          alt=""
                          loading="lazy"
                          className="size-16 sm:size-20 rounded-xl object-cover border border-white/20 shrink-0 bg-black/40"
                        />
                      ) : (
                        <div className="size-16 sm:size-20 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-cyan-300">
                          <Newspaper className="size-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="rounded-full bg-white/15 border border-white/20 px-2.5 py-0.5 font-bold text-cyan-200">
                            {post.category || 'ক্যাম্পাস সংবাদ'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <CalendarDays className="size-3 text-cyan-400" />
                            <span>{formatBnDate(post.created_at)}</span>
                          </span>
                        </div>

                        <h3 className="font-serif text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        {post.author && (
                          <p className="text-[11px] text-slate-300 flex items-center gap-1">
                            <User className="size-3 text-cyan-400" />
                            <span>{post.author}</span>
                          </p>
                        )}
                      </div>

                      <ArrowRight className="size-4 text-cyan-300 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center text-slate-300 text-sm">
                  এই ফিল্টারে কোনো সংবাদ পাওয়া যায়নি।
                </div>
              )}
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
                  <p className="font-bold text-xs sm:text-sm">ফটো ও ভিডিও গ্যালারি</p>
                  <p className="text-[10px] text-slate-300">সকল ছবি ও ভিডিও আর্কাইভ</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/timeline"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">ক্যাম্পাস টাইমলাইন</p>
                  <p className="text-[10px] text-slate-300">ঘটনাবলির ধারাবাহিক দলিল</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/fact-check"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">ফ্যাক্ট-চেক ডেস্ক</p>
                  <p className="text-[10px] text-slate-300">গুজব ও তথ্যের সত্যতা যাচাই</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-rose-300 group-hover:translate-x-1 transition-transform" />
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
