import type { Metadata } from 'next'
import { ArrowLeft, Newspaper } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { NewsGrid } from '@/components/portal/news-card'
import { SectionHeading } from '@/components/portal/section-heading'
import { getCategoryPosts } from '@/lib/categories'

// ⭐ ক্যাটাগরি পেজেও সুপারফাস্ট লোডিংয়ের জন্য ক্যাশিং সক্রিয় ⭐
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const catName = decodeURIComponent(name)
  return {
    title: `${catName} | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি`,
    description: `${catName} বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন।`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const catName = decodeURIComponent(name)
  const posts = await getCategoryPosts(catName, 50)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-[75vh] py-10 sm:py-16 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 space-y-8">
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </a>
          </div>

          <SectionHeading
            eyebrow="News Category"
            title={catName}
            subtitle={`${catName} বিভাগের সকল খবর ও প্রতিবেদন (${posts.length}টি সংবাদ প্রকাশিত)`}
          />

          {posts.length > 0 ? (
            <NewsGrid posts={posts} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-white shadow-sm space-y-2">
              <div className="size-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                <Newspaper className="size-6" />
              </div>
              <p className="text-base font-bold text-navy">এই ক্যাটাগরিতে এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>
              <p className="text-xs text-muted-foreground">অ্যাডমিন বা মডারেটররা এই ক্যাটাগরিতে পোস্ট দিলেই তা এখানে লাইভ হয়ে যাবে।</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
