import { getVisiblePosts, getLimits, CAT_CLUB } from '@/lib/sb'
import { NewsGrid } from './news-card'

export async function ClubPosts() {
  const [all, limits] = await Promise.all([getVisiblePosts(1000), getLimits()])

  const isClubPost = (p: any) =>
    p.category === CAT_CLUB ||
    (p.category && (p.category.includes('ক্লাব') || p.category.toLowerCase().includes('club'))) ||
    Boolean(p.club_id)

  const maxLimit = limits[`limit:${CAT_CLUB}`] || limits['limit:ক্লাব'] || 12
  const posts = all.filter(isClubPost).slice(0, maxLimit)

  if (!posts.length) return null

  return (
    <section id="club-latest" className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl drop-shadow-md">
            সর্বশেষ ক্লাব সংবাদ
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-cyan-100/80">
            Latest news posted by our campus club reporters.
          </p>
        </div>
        <NewsGrid posts={posts} />
      </div>
    </section>
  )
}
