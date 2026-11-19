import {
  getVisiblePosts,
  getLimits,
  getCategoryNames,
  CAT_CAMPUS,
  CAT_CLUB,
  CAT_STUDENT,
  type Post,
} from '@/lib/sb'
import type { HomeSectionConfig } from '@/lib/site-settings'
import { SectionHeading } from './section-heading'
import { NewsGrid } from './news-card'

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
    prefetchedCategories ? Promise.resolve(prefetchedCategories) : getCategoryNames(),
  ])
  const skip = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const newsOnly = all.filter((p) => !p.page_id)
  const used = Array.from(new Set(newsOnly.map((p) => p.category).filter((c): c is string => !!c)))
  const cats = [...names, ...used.filter((c) => !names.includes(c))].filter((c) => !skip.includes(c))

  const eyebrowText = sectionConfig?.eyebrow ?? 'News'
  const subSuffixBn = sectionConfig?.subtitleBn || 'বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন'
  const subPrefixEn = sectionConfig?.subtitleEn || 'Latest news in'

  return (
    <>
      {cats.map((cat, i) => {
        const posts = newsOnly.filter((p) => p.category === cat).slice(0, limits[`limit:${cat}`] || 12)
        if (!posts.length) return null
        return (
          <section key={cat} id={`cat-${i}`} className="py-14 sm:py-20 border-b border-white/10 relative">
            <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
              <div className="px-4 md:px-0">
                <SectionHeading
                  inverted
                  eyebrow={eyebrowText}
                  title={cat}
                  subtitle={`${cat} ${subSuffixBn}`}
                  subtitleEn={`${subPrefixEn} ${cat}`}
                />
              </div>
              <NewsGrid posts={posts} />
            </div>
          </section>
        )
      })}
    </>
  )
}
