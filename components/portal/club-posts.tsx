import { getVisiblePosts, getLimits, CAT_CLUB } from '@/lib/sb'
import { NewsGrid } from './news-card'

export async function ClubPosts() {
  const [all, limits] = await Promise.all([getVisiblePosts(1000), getLimits()])
  const posts = all.filter((p) => p.category === CAT_CLUB).slice(0, limits[`limit:${CAT_CLUB}`] || 12)
  if (!posts.length) return null

  return (
    <section id="club-latest" className="bg-navy pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 border-t border-white/10 pt-10">
          <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">সর্বশেষ ক্লাব সংবাদ</h3>
          <p className="mt-1 text-sm text-white/60">Latest news posted by our club reporters.</p>
        </div>
        <NewsGrid posts={posts} />
      </div>
    </section>
  )
}
