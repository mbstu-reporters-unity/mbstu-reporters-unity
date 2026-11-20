import { getVisiblePosts, getLimits, CAT_CLUB, CAT_STUDENT, type Post } from '@/lib/sb'
import type { HomeSectionConfig } from '@/lib/site-settings'
import { SectionHeading } from './section-heading'
import { NewsGrid } from './news-card'

export async function GeneralNews({
  sectionConfig,
  prefetchedPosts,
  prefetchedLimits,
}: {
  sectionConfig?: HomeSectionConfig
  prefetchedPosts?: Post[]
  prefetchedLimits?: Record<string, number>
}) {
  const [all, limits] = await Promise.all([
    prefetchedPosts ? Promise.resolve(prefetchedPosts) : getVisiblePosts(200),
    prefetchedLimits ? Promise.resolve(prefetchedLimits) : getLimits(),
  ])
  const limit = limits['home_news_limit'] || 12
  const posts = all
    .filter((p) => !p.page_id && p.category !== CAT_CLUB && p.category !== CAT_STUDENT)
    .slice(0, limit)

  return (
    <section id="general-news" className="pt-6 pb-14 sm:pt-8 sm:pb-20 border-b border-white/10 relative">
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="px-4 md:px-0">
          <SectionHeading
            inverted
            eyebrow={sectionConfig?.eyebrow ?? 'Campus News'}
            title={sectionConfig?.titleBn || 'ক্যাম্পাস সংবাদ'}
            titleEn={sectionConfig?.titleEn || 'Latest Campus Reports'}
            subtitle={sectionConfig?.subtitleBn || 'মাভাবিপ্রবির সর্বত্র থেকে যাচাইকৃত নির্ভরযোগ্য প্রতিবেদন।'}
            subtitleEn={sectionConfig?.subtitleEn || 'Verified reports from across MBSTU.'}
          />
        </div>
        {posts.length ? (
          <NewsGrid posts={posts} />
        ) : (
          <p className="px-4 md:px-0 text-sm text-slate-300">এখনো কোনো সংবাদ নেই।</p>
        )}
      </div>
    </section>
  )
}
