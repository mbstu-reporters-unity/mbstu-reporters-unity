'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  CalendarDays,
  User,
  Tag,
  Newspaper,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getVisiblePosts, type Post } from '@/lib/sb'
import { getVisibleCategoryNames } from '@/lib/categories'

const bn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

export default function GlobalSearchPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('সব')
  const [authorQuery, setAuthorQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'oldest'>('newest')

  async function load() {
    setLoading(true)
    const [pRows, catRows] = await Promise.all([
      getVisiblePosts(300),
      getVisibleCategoryNames(),
    ])
    setPosts(pRows)
    setCategories(['সব', ...catRows])
    setLoading(false)
  }

  useEffect(() => {
    load()
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')
      const sort = params.get('sort')
      if (q) setQuery(q)
      if (sort === 'popular' || sort === 'oldest' || sort === 'newest') {
        setSortBy(sort)
      }
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const authorQ = authorQuery.trim().toLowerCase()

    return posts
      .filter((p) => {
        if (selectedCategory !== 'সব' && p.category !== selectedCategory) {
          return false
        }
        if (authorQ && !(p.author || '').toLowerCase().includes(authorQ)) {
          return false
        }
        if (startDate) {
          const postDate = new Date(p.created_at).toISOString().slice(0, 10)
          if (postDate < startDate) return false
        }
        if (endDate) {
          const postDate = new Date(p.created_at).toISOString().slice(0, 10)
          if (postDate > endDate) return false
        }
        if (!q) return true

        return [p.title, p.heading, p.body, p.category, p.author]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.view_count || 0) - (a.view_count || 0)
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [posts, query, selectedCategory, authorQuery, startDate, endDate, sortBy])

  function resetFilters() {
    setQuery('')
    setSelectedCategory('সব')
    setAuthorQuery('')
    setStartDate('')
    setEndDate('')
    setSortBy('newest')
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation items={[{ label: 'গ্লোবাল সংবাদ সার্চ' }]} />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Search className="size-3.5" />
              <span>Global Search & Advanced Filters</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              সাইট-ব্যাপী সংবাদ ও প্রতিবেদন অনুসন্ধান
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              তারিখ, ক্যাটাগরি, লেখক ও জনপ্রিয়তা অনুযায়ী ক্যাম্পাসের সকল সংবাদ, ফিচার ও অনুসন্ধানী প্রতিবেদন খুঁজুন।
            </p>
          </div>

          {/* সার্চ ও ফিল্টার প্যানেল */}
          <section className="glass-card p-5 sm:p-6 space-y-4 text-white">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-cyan-400" />
              <input
                type="text"
                placeholder="সংবাদের শিরোনাম, মূল বক্তব্য বা বিষয় লিখে খুঁজুন..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 backdrop-blur"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-cyan-200 block mb-1">ক্যাটাগরি:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-cyan-200 block mb-1">প্রতিবেদকের নাম:</label>
                <input
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-bold text-cyan-200 block mb-1">শুরুর তারিখ:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-bold text-cyan-200 block mb-1">শেষের তারিখ:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-slate-300">সাজান:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1 rounded-full border cursor-pointer ${
                    sortBy === 'newest' ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'border-white/20 bg-white/10'
                  }`}
                >
                  সর্বশেষ
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1 rounded-full border cursor-pointer flex items-center gap-1 ${
                    sortBy === 'popular' ? 'bg-amber-400 text-slate-950 font-bold border-amber-300' : 'border-white/20 bg-white/10'
                  }`}
                >
                  <TrendingUp className="size-3" />
                  <span>সর্বাধিক পঠিত</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('oldest')}
                  className={`px-3 py-1 rounded-full border cursor-pointer ${
                    sortBy === 'oldest' ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'border-white/20 bg-white/10'
                  }`}
                >
                  পুরোনো
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold">
                  মোট ফলাফল: {bn(filtered.length)}টি
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  রিসেট
                </button>
              </div>
            </div>
          </section>

          {/* ফলাফল গ্রিড */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              সংবাদ লোড হচ্ছে...
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <article
                  key={post.id}
                  className="glass-card flex flex-col justify-between overflow-hidden text-white p-4 space-y-3 group hover:border-cyan-400 transition"
                >
                  <div className="space-y-2.5">
                    {post.image_url ? (
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 rounded-full bg-black/70 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold text-cyan-200 border border-white/20">
                          {post.category || 'সংবাদ'}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200 border border-white/20">
                        {post.category || 'সংবাদ'}
                      </span>
                    )}

                    <h2 className="font-serif text-base font-bold leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
                      <Link href={`/post/${post.id}`}>{post.title}</Link>
                    </h2>

                    {post.body && (
                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                        {post.body}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="truncate">{post.author || 'প্রতিবেদক'}</span>
                    <span className="flex items-center gap-1 text-cyan-200">
                      <CalendarDays className="size-3" />
                      {new Date(post.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <Search className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">কোনো সংবাদ পাওয়া যায়নি।</p>
              <p className="text-xs">অন্য কোনো শব্দ বা ফিল্টার দিয়ে পুনরায় চেষ্টা করুন।</p>
            </div>
          )}

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
