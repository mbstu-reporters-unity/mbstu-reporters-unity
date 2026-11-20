import { getVisiblePosts, getLimits, type Post } from '@/lib/sb'
import { getVisibleCategoryNames } from '@/lib/categories'
import type { HomeSectionConfig } from '@/lib/site-settings'
import { HomepageTopArea } from './homepage-top-area'

export async function GeneralNews({
  sectionConfig,
  prefetchedPosts,
  prefetchedLimits,
  prefetchedCategories,
  initialNow,
}: {
  sectionConfig?: HomeSectionConfig
  prefetchedPosts?: Post[]
  prefetchedLimits?: Record<string, number>
  prefetchedCategories?: string[]
  initialNow: number
}) {
  const [all, limits, categories] = await Promise.all([
    prefetchedPosts ? Promise.resolve(prefetchedPosts) : getVisiblePosts(200),
    prefetchedLimits ? Promise.resolve(prefetchedLimits) : getLimits(),
    prefetchedCategories ? Promise.resolve(prefetchedCategories) : getVisibleCategoryNames(),
  ])
  const limit = limits['home_news_limit'] || 12

  return (
    <HomepageTopArea
      posts={all}
      visibleCategories={categories}
      limit={limit}
      sectionConfig={sectionConfig}
      initialNow={initialNow}
    />
  )
}
