import {
  getVisiblePosts,
  getLimits,
  CAT_CAMPUS,
  CAT_CLUB,
  CAT_STUDENT,
  type Post,
} from '@/lib/sb'
import { getVisibleCategoryNames } from '@/lib/categories'
import type { HomeSectionConfig } from '@/lib/site-settings'
import { selectHomepageItems } from '@/lib/homepage-feed'
import { SectionHeading } from './section-heading'
import { CategoryFeedBlock } from './category-feed-block'

// হোম পেজের জন্য প্রতি ক্যাটাগরিতে সর্বোচ্চ প্রিভিউ পোস্ট সংখ্যা
const HOME_PREVIEW_LIMIT = 3

export async function CategorySections({
  sectionConfig,
  prefetchedPosts,
  prefetchedLimits,
  prefetchedCategories,
}: {
  sectionConfig?: HomeSectionConfig
  prefetchedPosts?: Post[]
  prefetchedLimits?: Record<string, number>
  prefetchedCategories?: string[]
}) {
  const [all, limits, names] = await Promise.all([
    prefetchedPosts ? Promise.resolve(prefetchedPosts) : getVisiblePosts(200),
    prefetchedLimits ? Promise.resolve(prefetchedLimits) : getLimits(),
    prefetchedCategories ? Promise.resolve(prefetchedCategories) : getVisibleCategoryNames(),
  ])
  const skip = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const visible = new Set(names)
  const newsOnly = all.filter((p) => !p.page_id && !!p.category && visible.has(p.category))
  const cats = names.filter((category) => !skip.includes(category))

  const eyebrowText = sectionConfig?.eyebrow ?? 'News'
  const subSuffixBn = sectionConfig?.subtitleBn || 'বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন'
  const subPrefixEn = sectionConfig?.subtitleEn || 'Latest news in'
  const now = Date.now()

  return (
    <>
      {cats.map((cat, i) => {
        const allCatPosts = newsOnly.filter((p) => p.category === cat)
        if (!allCatPosts.length) return null

        // ৩ দিনের মধ্যে হোম পেজে দেখানোর যোগ্য পোস্ট বের করো
        const homePosts = selectHomepageItems(allCatPosts, (p) => p.created_at, now)
          .slice(0, HOME_PREVIEW_LIMIT)

        // হোমে দেখানোর মতো পোস্ট না থাকলে এই ক্যাটাগরির ব্লক হোম পেজে দেখাবে না
        if (!homePosts.length) return null

        const archiveLimit = limits[`limit:${cat}`] || 12

        return (
          <CategoryFeedBlock
            key={cat}
            cat={cat}
            index={i}
            posts={homePosts}
            archiveLimit={archiveLimit}
            eyebrow={eyebrowText}
            subSuffixBn={subSuffixBn}
            subPrefixEn={subPrefixEn}
            initialNow={now}
          />
        )
      })}
    </>
  )
}
