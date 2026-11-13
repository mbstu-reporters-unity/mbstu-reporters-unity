import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Newspaper } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { NewsGrid } from '@/components/portal/news-card'
import { SectionHeading } from '@/components/portal/section-heading'
import { getCategoryPosts } from '@/lib/categories'

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
      <main className="min-h-[75vh] py-8 sm:py-14">
        <div className="mx-auto max-w-7xl md:px-6 lg:px-8 space-y-6">

          <div className="px-4 md:px-0 space-y-6">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
              </Link>
            </div>

            <SectionHeading
              inverted
              eyebrow="News Category"
              title={catName}
              subtitle={`${catName} বিভাগের সকল খবর ও প্রতিবেদন (${posts.length}টি সংবাদ প্রকাশিত)`}
            />
          </div>

          {posts.length > 0 ? (
            <NewsGrid posts={posts} />
          ) : (
            <div className="px-4 md:px-0">
              <div className="glass-card p-12 text-center text-white space-y-2">
                <div className="size-12 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center mx-auto border border-white/20">
                  <Newspaper className="size-6" />
                </div>
                <p className="text-base font-bold text-white">এই ক্যাটাগরিতে এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>
                <p className="text-xs text-slate-300">অ্যাডমিন বা মডারেটররা এই ক্যাটাগরিতে পোস্ট দিলেই তা এখানে সরাসরি লাইভ হয়ে যাবে।</p>
              </div>
            </div>
          )}

          {posts.length > 3 && (
            <div className="px-4 md:px-0 pt-6 text-center border-t border-white/15">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
              </Link>
            </div>
          )}

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
