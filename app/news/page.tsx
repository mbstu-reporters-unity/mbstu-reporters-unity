'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { BackNavigation } from '@/components/portal/back-navigation'
import { BackToTop } from '@/components/portal/back-to-top'
import { NewsGrid } from '@/components/portal/news-card'
import { SiteFooter } from '@/components/portal/site-footer'
import { SiteHeader } from '@/components/portal/site-header'
import { TopBar } from '@/components/portal/top-bar'
import { CAT_CLUB, CAT_STUDENT, getVisiblePosts, type Post } from '@/lib/sb'

type SortOrder = 'newest' | 'popular' | 'oldest'

export default function NewsArchivePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('সব')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getVisiblePosts(300).then((rows) => {
      if (active) setPosts(rows)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const archivePosts = useMemo(
    () => posts.filter((post) => !post.page_id && post.category !== CAT_CLUB && post.category !== CAT_STUDENT),
    [posts]
  )

  const categories = useMemo(
    () => ['সব', ...Array.from(new Set(archivePosts.map((post) => post.category || 'ক্যাম্পাস সংবাদ')))],
    [archivePosts]
  )

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return archivePosts
      .filter((post) => {
        if (category !== 'সব' && (post.category || 'ক্যাম্পাস সংবাদ') !== category) return false
        if (!needle) return true
        return [post.title, post.heading, post.body, post.author, post.category]
          .filter(Boolean)
          .some((value) => String(value).toLocaleLowerCase().includes(needle))
      })
      .sort((a, b) => {
        if (sortOrder === 'popular') return (b.view_count || 0) - (a.view_count || 0)
        const timeA = new Date(a.created_at).getTime()
        const timeB = new Date(b.created_at).getTime()
        return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA
      })
  }, [archivePosts, category, query, sortOrder])

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <BackNavigation items={[{ label: 'ক্যাম্পাস সংবাদ' }]} />

          <header className="hero-daylight-dark-surface space-y-3 rounded-3xl border border-white/15 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 p-6 text-center text-white shadow-xl sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-white">
              <Search className="size-3.5" />
              ক্যাম্পাস সংবাদ আর্কাইভ
            </span>
            <h1 className="font-serif text-2xl font-bold sm:text-4xl">সকল ক্যাম্পাস সংবাদ</h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-200">
              ক্যাটাগরি, শিরোনাম বা লেখকের নাম দিয়ে প্রতিবেদন খুঁজুন।
            </p>
          </header>

          <section className="glass-card grid gap-3 p-4 sm:grid-cols-2 sm:p-5" aria-label="সংবাদ ফিল্টার">
            <label className="space-y-1 text-xs font-semibold">
              <span>শিরোনাম বা লেখক দিয়ে খুঁজুন</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="সংবাদ খুঁজুন..."
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-xs font-semibold">
              <span>ক্যাটাগরি</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item === 'সব' ? 'সব ক্যাটাগরি' : item}</option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:col-span-2">
              <span className="font-semibold">সাজান:</span>
              {([
                ['newest', 'সর্বশেষ'],
                ['popular', 'সর্বাধিক পঠিত'],
                ['oldest', 'পুরোনো'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={sortOrder === value}
                  onClick={() => setSortOrder(value)}
                  className={`rounded-full border px-3 py-1.5 font-semibold transition-colors ${
                    sortOrder === value
                      ? 'border-cyan-500 bg-cyan-600 text-white'
                      : 'border-white/20 bg-white/10 text-current hover:bg-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto font-semibold" aria-live="polite">
                ফলাফল: {filteredPosts.length.toLocaleString('bn-BD')}
              </span>
            </div>
          </section>

          {loading ? (
            <div className="glass-card p-10 text-center text-sm">সংবাদ লোড হচ্ছে...</div>
          ) : filteredPosts.length > 0 ? (
            <NewsGrid posts={filteredPosts} />
          ) : (
            <div className="glass-card p-10 text-center text-sm">
              কোনো সংবাদ পাওয়া যায়নি। অন্য শব্দ বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
