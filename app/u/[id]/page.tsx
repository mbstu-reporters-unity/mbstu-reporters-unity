import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  GraduationCap,
  Building2,
  FileText,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import { SB_URL, SB_KEY, attachProfileAvatars, type Profile, type Post } from '@/lib/sb'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { NewsGrid } from '@/components/portal/news-card'
import type { CommunityPage } from '@/lib/pages'

export const dynamic = 'force-dynamic'

type PublicProfile = Pick<
  Profile,
  | 'id'
  | 'full_name'
  | 'department'
  | 'batch'
  | 'role'
  | 'user_type'
  | 'designation'
  | 'office_section'
  | 'bio'
  | 'newspaper_name'
  | 'avatar_url'
  | 'approved'
  | 'created_at'
>

async function getProfileById(id: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/profiles?select=id,full_name,department,batch,role,user_type,designation,office_section,bio,newspaper_name,avatar_url,approved,created_at&id=eq.${encodeURIComponent(id)}&limit=1`,
      {
        headers: { apikey: SB_KEY },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const rows: PublicProfile[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&user_id=eq.${encodeURIComponent(userId)}&or=(hidden.is.null,hidden.eq.false)&order=created_at.desc&limit=30`,
      { headers: { apikey: SB_KEY }, cache: 'no-store' }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
  } catch {
    return []
  }
}

async function getUserPages(userId: string): Promise<CommunityPage[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/community_pages?select=*&creator_id=eq.${encodeURIComponent(userId)}&is_active=eq.true&order=created_at.desc`,
      { headers: { apikey: SB_KEY }, cache: 'no-store' }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const p = await getProfileById(id)
  if (!p) return { title: 'প্রোফাইল পাওয়া যায়নি' }
  return {
    title: `${p.full_name} | MBSTU প্রোফাইল`,
    description: p.bio || `${p.full_name}-এর মাভাবিপ্রবি প্রোফাইল`,
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfileById(id)
  if (!profile) notFound()

  const [posts, pages] = await Promise.all([
    getUserPosts(id),
    getUserPages(id),
  ])

  const userTypeLabels: Record<string, string> = {
    student: '🎓 শিক্ষার্থী',
    teacher: '👨‍🏫 শিক্ষক',
    staff: '💼 কর্মকর্তা/কর্মচারী',
    reporter: '📰 ক্যাম্পাস সাংবাদিক',
  }

  const roleBadge = userTypeLabels[profile.user_type || 'student'] || 'সদস্য'

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 space-y-6">

          <BackNavigation items={[{ label: 'ক্যাম্পাস প্রোফাইল' }, { label: profile.full_name }]} />

          {/* প্রোফাইল হেডার কার্ড */}
          <div className="glass-card relative overflow-hidden p-6 sm:p-8 text-white rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {/* অ্যাভাটার */}
              <div className="relative size-28 sm:size-32 rounded-full ring-4 ring-cyan-400/80 shadow-2xl overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name} className="size-full object-cover object-top" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                    {profile.full_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* পরিচিতি */}
              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                    {profile.full_name}
                  </h1>
                  {profile.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="size-3.5 fill-cyan-400 text-slate-950" />
                      <span>অ্যাডমিন</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="bg-white/15 text-cyan-200 border border-white/20 font-bold px-3 py-1 rounded-full">
                    {roleBadge}
                  </span>
                  {profile.designation && (
                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full font-semibold">
                      {profile.designation}
                    </span>
                  )}
                  {profile.department && (
                    <span className="text-slate-200 flex items-center gap-1">
                      <GraduationCap className="size-3.5 text-cyan-400" />
                      <span>{profile.department}</span>
                    </span>
                  )}
                  {profile.batch && (
                    <span className="text-slate-300">
                      (ব্যাচ: {profile.batch})
                    </span>
                  )}
                  {profile.office_section && (
                    <span className="text-slate-200 flex items-center gap-1">
                      <Building2 className="size-3.5 text-cyan-400" />
                      <span>{profile.office_section}</span>
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-2 max-w-2xl whitespace-pre-line">
                    {profile.bio}
                  </p>
                )}

                {profile.newspaper_name && (
                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs font-bold">
                    <span className="bg-white/10 border border-white/20 px-3 py-2 rounded-xl text-slate-200 flex items-center gap-1.5">
                      <span>📰 {profile.newspaper_name}</span>
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ব্যবহারকারীর নিজস্ব পেজসমূহ */}
          {pages.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/15 pb-2">
                <FileText className="size-5 text-cyan-400" />
                <span>অফিসিয়াল কমিউনিটি পেজসমূহ ({pages.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pages.map((pg) => (
                  <Link
                    key={pg.id}
                    href={`/p/${pg.slug}`}
                    className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-cyan-400 transition text-white"
                  >
                    {pg.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pg.avatar_url} alt="" className="size-12 rounded-full object-cover border border-white/20" />
                    ) : (
                      <div className="size-12 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-lg">
                        {pg.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-sm truncate">{pg.name}</p>
                        {pg.is_verified && <CheckCircle2 className="size-3.5 fill-blue-500 text-white shrink-0" />}
                      </div>
                      <p className="text-xs text-cyan-300 font-mono">/p/{pg.slug}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ব্যবহারকারীর প্রকাশিত পোস্টসমূহ */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/15 pb-2">
              <BookOpen className="size-5 text-cyan-400" />
              <span>প্রকাশিত পোস্ট ও প্রতিবেদন ({posts.length})</span>
            </h2>
            {posts.length > 0 ? (
              <NewsGrid posts={posts} />
            ) : (
              <div className="glass-card p-10 text-center text-white/60 text-sm">
                এখনো কোনো পোস্ট প্রকাশিত হয়নি।
              </div>
            )}
          </div>

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
