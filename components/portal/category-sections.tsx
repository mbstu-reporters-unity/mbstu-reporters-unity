import { getVisiblePosts, getLimits, getCategoryNames, CAT_CAMPUS, CAT_CLUB, CAT_STUDENT } from '@/lib/sb'
import { SectionHeading } from './section-heading'
import { NewsGrid } from './news-card'

export async function CategorySections() {
  const [all, limits, names] = await Promise.all([getVisiblePosts(1000), getLimits(), getCategoryNames()])
  const skip = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const used = Array.from(new Set(all.map((p) => p.category).filter((c): c is string => !!c)))
  const cats = [...names, ...used.filter((c) => !names.includes(c))].filter((c) => !skip.includes(c))

  return (
    <>
      {cats.map((cat, i) => {
        const posts = all.filter((p) => p.category === cat).slice(0, limits[`limit:${cat}`] || 12)
        if (!posts.length) return null
        return (
          <section key={cat} id={`cat-${i}`} className={`py-16 sm:py-20 ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
            <div className="mx-auto max-w-7xl px-4">
              <SectionHeading eyebrow="News" title={cat} subtitle={`${cat} বিভাগের সর্বশেষ সংবাদ`} />
              <NewsGrid posts={posts} />
            </div>
          </section>
        )
      })}
    </>
  )
}
