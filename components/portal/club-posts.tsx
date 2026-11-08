import { getVisiblePosts, getLimits, CAT_CLUB } from '@/lib/sb'
import { NewsGrid } from './news-card'

export async function ClubPosts() {
  const [all, limits] = await Promise.all([getVisiblePosts(1000), getLimits()])

  // ✅ ক্লাবের সাথে লিঙ্ক করা অথবা ক্লাব সম্পর্কিত সব পোস্ট নিখুঁতভাবে ফিল্টার করা
  const isClubPost = (p: any) =>
    p.category === CAT_CLUB ||
    (p.category && (p.category.includes('ক্লাব') || p.category.toLowerCase().includes('club'))) ||
    Boolean(p.club_id)

  const maxLimit = limits[`limit:${CAT_CLUB}`] || limits['limit:ক্লাব'] || 12
  const posts = all.filter(isClubPost).slice(0, maxLimit)

  if (!posts.length) return null

  return (
    <section id="club-latest" className="bg-navy pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 border-t border-white/10 pt-10">
          <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">সর্বশেষ ক্লাব সংবাদ</h3>
          <p className="mt-1 text-sm text-white/60">Latest news posted by our campus club reporters.</p>
        </div>
        <NewsGrid posts={posts} />
      </div>
    </section>
  )
}
