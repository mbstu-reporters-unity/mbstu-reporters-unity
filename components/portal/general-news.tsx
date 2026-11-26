import { getVisiblePosts, getPopularPosts, type Post } from '@/lib/sb'
import { getVisibleCategoryNames } from '@/lib/categories'
import type { HomeSectionConfig } from '@/lib/site-settings'
import { getHomepageNotices, type Notice } from '@/lib/notices'
import { HomepageTopArea } from './homepage-top-area'

export async function GeneralNews({
  sectionConfig,
  prefetchedPosts,
  prefetchedCategories,
  prefetchedPopularPosts,
  prefetchedNotices,
}: {
  sectionConfig?: HomeSectionConfig
  prefetchedPosts?: Post[]
  prefetchedCategories?: string[]
  prefetchedPopularPosts?: Post[]
  prefetchedNotices?: Notice[]
}) {
  const [all, categories, popularPosts, notices] = await Promise.all([
    prefetchedPosts ? Promise.resolve(prefetchedPosts) : getVisiblePosts(200),
    prefetchedCategories ? Promise.resolve(prefetchedCategories) : getVisibleCategoryNames(),
    prefetchedPopularPosts ? Promise.resolve(prefetchedPopularPosts) : getPopularPosts(6),
    prefetchedNotices ? Promise.resolve(prefetchedNotices) : getHomepageNotices(),
  ])

  return (
    <HomepageTopArea
      posts={all}
      popularPosts={popularPosts}
      notices={notices}
      visibleCategories={categories}
      sectionConfig={sectionConfig}
    />
  )
}
