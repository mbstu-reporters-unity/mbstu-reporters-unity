import { getVisiblePosts, getLimits, CAT_CLUB, CAT_STUDENT } from '@/lib/sb'
import { SectionHeading } from './section-heading'
import { NewsGrid } from './news-card'

export async function GeneralNews() {
  const [all, limits] = await Promise.all([getVisiblePosts(1000), getLimits()])
  const limit = limits['home_news_limit'] || 12
  const posts = all
    .filter((p) => p.category !== CAT_CLUB && p.category !== CAT_STUDENT)
    .slice(0, limit)

  return (
    <section id="general-news" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Campus News"
          title="ক্যাম্পাস সংবাদ"
          subtitle="Verified reports from across MBSTU."
        />
        {posts.length ? (
          <NewsGrid posts={posts} />
        ) : (
          <p className="text-sm text-muted-foreground">এখনো কোনো সংবাদ নেই।</p>
        )}
      </div>
    </section>
  )
}
