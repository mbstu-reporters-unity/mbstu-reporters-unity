'use client'

import { useEffect, useMemo, useState } from 'react'
import { Briefcase, GraduationCap, Newspaper, Sparkles, User, Users } from 'lucide-react'
import { SB_URL, SB_KEY, attachProfileAvatars, type Post, type UserType } from '@/lib/sb'
import { SectionHeading } from './section-heading'
import { NewsGrid } from './news-card'
import { useSiteSettings } from './site-settings-context'

type FeedFilter = 'all' | UserType

const FILTERS: Array<{
  key: FeedFilter
  label: string
  icon: typeof Users
}> = [
  { key: 'all', label: 'সবার পোস্ট', icon: Users },
  { key: 'teacher', label: 'শিক্ষক', icon: GraduationCap },
  { key: 'student', label: 'শিক্ষার্থী', icon: User },
  { key: 'staff', label: 'কর্মকর্তা', icon: Briefcase },
  { key: 'reporter', label: 'সাংবাদিক', icon: Newspaper },
]

const PAGE_SIZE = 9

async function getCommunityPageFeedPosts(limit = 100): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&page_id=not.is.null&or=(hidden.is.null,hidden.eq.false)&order=created_at.desc&limit=${limit}`,
      {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    const enriched = await attachProfileAvatars(rows)
    return enriched.filter((p) => Boolean(p.page_id && p.page))
  } catch {
    return []
  }
}

export function CommunityFeed() {
  const settings = useSiteSettings()
  const [posts, setPosts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)

  useEffect(() => {
    getCommunityPageFeedPosts(100)
      .then((pagePosts) => {
        setPosts(pagePosts)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const counts = useMemo(() => {
    const map: Record<FeedFilter, number> = {
      all: posts.length,
      teacher: 0,
      student: 0,
      staff: 0,
      reporter: 0,
    }
    posts.forEach((p) => {
      const t = p.author_user_type || 'student'
      if (t in map) map[t] += 1
    })
    return map
  }, [posts])

  const filtered = useMemo(() => {
    if (filter === 'all') return posts
    return posts.filter((p) => (p.author_user_type || 'student') === filter)
  }, [posts, filter])

  if (!loaded || posts.length === 0) return null

  const sec = settings.homeSections.sections.find((s) => s.key === 'community_feed')
  const visiblePosts = filtered.slice(0, shownCount)
  const remaining = Math.max(0, filtered.length - visiblePosts.length)

  return (
    <section id="community-feed" className="py-14 sm:py-20 border-b border-white/10 relative">
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="px-4 md:px-0">
          <SectionHeading
            inverted
            eyebrow={sec?.eyebrow ?? 'Campus Community Feed'}
            title={sec?.titleBn || 'সবার পোস্ট ও পেজ টাইমলাইন'}
            titleEn={sec?.titleEn || 'Campus Community Feed'}
            subtitle={
              sec?.subtitleBn ||
              'শিক্ষক, শিক্ষার্থী, কর্মকর্তা ও সাংবাদিকদের নিজস্ব পেজে প্রকাশিত সর্বশেষ লেখা, ছবি ও পোস্টসমূহ।'
            }
            subtitleEn={sec?.subtitleEn || 'Latest posts from teachers, students, staff and campus pages.'}
          />

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTERS.map((f) => {
              const Icon = f.icon
              const active = filter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setFilter(f.key)
                    setShownCount(PAGE_SIZE)
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'border-cyan-300/60 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{f.label}</span>
                  <span className="text-[10px] opacity-80">({counts[f.key]})</span>
                </button>
              )
            })}
          </div>
        </div>

        {visiblePosts.length > 0 ? (
          <NewsGrid posts={visiblePosts} />
        ) : (
          <div className="px-4 md:px-0">
            <div className="glass-card p-8 text-center text-xs text-slate-300">
              এই বিভাগে এখনো কোনো পোস্ট পাওয়া যায়নি।
            </div>
          </div>
        )}

        {remaining > 0 && (
          <div className="mt-8 text-center px-4">
            <button
              type="button"
              onClick={() => setShownCount((c) => c + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 px-6 py-2.5 text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-4 text-cyan-300" />
              <span>আরও পোস্ট দেখুন ({remaining.toLocaleString('bn-BD')}টি বাকি)</span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
