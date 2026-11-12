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
          // ✅ সাদা bg-gray-50 দূর করে প্রিমিয়াম গ্লাস বর্ডার দেওয়া হলো
          <section key={cat} id={`cat-${i}`} className="py-14 sm:py-20 border-b border-white/10 relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading
                inverted
                eyebrow="News"
                title={cat}
                subtitle={`${cat} বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন`}
              />
              <NewsGrid posts={posts} />
            </div>
          </section>
        )
      })}
    </>
  )
}
