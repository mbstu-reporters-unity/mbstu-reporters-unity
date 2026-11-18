import type { Metadata } from 'next'
import { Feather } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { NewsGrid } from '@/components/portal/news-card'
import { SectionHeading } from '@/components/portal/section-heading'
import { BackNavigation } from '@/components/portal/back-navigation'
import { SB_URL, SB_KEY, attachProfileAvatars, type Post } from '@/lib/sb'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সম্পাদকীয় ও মতামত | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সম্মানিত শিক্ষকদের সম্পাদকীয়, কলাম ও সমসাময়িক মতামত।',
}

async function getEditorialPosts(): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&or=(category.eq.সম্পাদকীয় ও মতামত,author_user_type.eq.teacher)&or=(hidden.is.null,hidden.eq.false)&order=created_at.desc&limit=60`,
      {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
  } catch {
    return []
  }
}

export default async function EditorialPage() {
  const [posts, settings] = await Promise.all([
    getEditorialPosts(),
    getSiteSettings(),
  ])

  const banner = settings.behaviorAndPages.subPages.editorial

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-[75vh] py-6 sm:py-10">
        <div className="mx-auto max-w-7xl md:px-6 lg:px-8 space-y-6">
          <div className="px-4 md:px-0 space-y-4">
            <BackNavigation items={[{ label: 'সম্পাদকীয় ও মতামত' }]} />

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20">
              {banner.eyebrow && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider mb-2 shadow">
                  <Feather className="size-3.5" />
                  <span>{banner.eyebrow}</span>
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                {banner.title || 'সম্পাদকীয় ও মুক্তমত'}
              </h1>
              {banner.subtitle && (
                <p className="text-white/80 text-xs sm:text-sm font-medium mt-1.5 max-w-2xl leading-relaxed">
                  {banner.subtitle}
                </p>
              )}
            </div>

            <SectionHeading
              inverted
              eyebrow="Teachers' Columns"
              title="শিক্ষকদের প্রকাশিত কলামসমূহ"
              subtitle={`মোট ${posts.length.toLocaleString('bn-BD')}টি সম্পাদকীয় ও মতামত প্রকাশিত হয়েছে`}
            />
          </div>

          {posts.length > 0 ? (
            <NewsGrid posts={posts} />
          ) : (
            <div className="px-4 md:px-0">
              <div className="glass-card p-12 text-center text-white space-y-2">
                <div className="size-12 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center mx-auto border border-white/20">
                  <Feather className="size-6" />
                </div>
                <p className="text-base font-bold text-white">এখনো কোনো সম্পাদকীয় বা মতামত কলাম প্রকাশিত হয়নি।</p>
                <p className="text-xs text-slate-300">শিক্ষকগণ তাদের পেজ থেকে কলাম প্রকাশ করলেই তা এখানে স্বয়ংক্রিয়ভাবে দৃশ্যমান হবে।</p>
              </div>
            </div>
          )}

          <div className="px-4 md:px-0 pt-6 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
