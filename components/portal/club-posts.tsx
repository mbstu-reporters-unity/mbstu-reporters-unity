import { getVisiblePosts, getLimits, CAT_CLUB, type Post } from '@/lib/sb'
import type { HomeSectionConfig } from '@/lib/site-settings'
import { Tx } from '@/lib/i18n'
import Link from 'next/link'
import { NewsGrid } from './news-card'

export async function ClubPosts({
  sectionConfig,
  prefetchedPosts,
  prefetchedLimits,
  standalone = false,
}: {
  sectionConfig?: HomeSectionConfig
  prefetchedPosts?: Post[]
  prefetchedLimits?: Record<string, number>
  standalone?: boolean
}) {
  const [all, limits] = await Promise.all([
    prefetchedPosts ? Promise.resolve(prefetchedPosts) : getVisiblePosts(200),
    prefetchedLimits ? Promise.resolve(prefetchedLimits) : getLimits(),
  ])

  const isClubPost = (p: Post) =>
    p.category === CAT_CLUB ||
    (p.category && (p.category.includes('ক্লাব') || p.category.toLowerCase().includes('club'))) ||
    Boolean(p.club_id)

  const maxLimit = limits[`limit:${CAT_CLUB}`] || limits['limit:ক্লাব'] || 12
  const clubPosts = all.filter(isClubPost)
  const posts = standalone ? clubPosts : clubPosts.slice(0, maxLimit)

  if (!posts.length && !standalone) return null

  return (
    <section id="club-latest" className="py-12 sm:py-16 border-b border-[var(--theme-card-border)] relative">
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 px-4 md:px-0">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[var(--theme-text-title)] sm:text-3xl">
              <Tx
                bn={sectionConfig?.titleBn || 'সর্বশেষ ক্লাব সংবাদ'}
                en={sectionConfig?.titleEn || 'Latest Club News'}
              />
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--theme-text-body)] opacity-85">
              <Tx
                bn={sectionConfig?.subtitleBn || 'ক্যাম্পাস ক্লাব রিপোর্টারদের প্রকাশিত সর্বশেষ সংবাদ।'}
                en={sectionConfig?.subtitleEn || 'Latest news posted by our campus club reporters.'}
              />
            </p>
          </div>
          {!standalone && (
            <Link href="/clubs" className="shrink-0 text-xs font-bold text-[var(--theme-brand)] hover:underline">
              সব ক্লাব সংবাদ
            </Link>
          )}
        </div>
        {posts.length > 0 ? (
          <NewsGrid posts={posts} />
        ) : (
          <p className="mx-4 rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-6 text-center text-sm text-[var(--theme-text-body)]">
            এখনো কোনো ক্লাব সংবাদ নেই।
          </p>
        )}
      </div>
    </section>
  )
}
