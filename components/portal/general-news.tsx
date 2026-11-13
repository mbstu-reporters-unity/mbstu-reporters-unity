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
    <section id="general-news" className="py-14 sm:py-20 border-b border-white/10 relative">
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="px-4 md:px-0">
          <SectionHeading
            inverted
            eyebrow="Campus News"
            title="ক্যাম্পাস সংবাদ"
            subtitle="মাভাবিপ্রবির সর্বত্র থেকে যাচাইকৃত নির্ভরযোগ্য প্রতিবেদন।"
          />
        </div>
        {posts.length ? (
          <NewsGrid posts={posts} />
        ) : (
          <p className="px-4 md:px-0 text-sm text-slate-300">এখনো কোনো সংবাদ নেই।</p>
        )}
      </div>
    </section>
  )
}
