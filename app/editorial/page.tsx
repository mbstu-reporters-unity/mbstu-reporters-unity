import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Feather, GraduationCap, PenTool, Sparkles } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { NewsGrid } from '@/components/portal/news-card'
import { SectionHeading } from '@/components/portal/section-heading'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getVisiblePosts, type Post } from '@/lib/sb'
import { getSiteSettings } from '@/lib/site-settings'
import { Tx } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সম্পাদকীয়, ফিচার ও মতামত | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সম্মানিত শিক্ষক, গবেষক ও শিক্ষার্থীদের সম্পাদকীয়, ফিচার, বিশ্লেষণ ও সমসাময়িক মতামত।',
}

function isEditorialOrFeatureCategory(cat?: string | null): boolean {
  if (!cat) return false
  const c = cat.normalize('NFC')
  return (
    c.includes('সম্পাদক') ||
    c.includes('মতামত') ||
    c.includes('ফিচার') ||
    c.includes('কলাম') ||
    c.includes('বিশ্লেষণ') ||
    c.includes('সদস্যদের লেখা')
  )
}

export default async function EditorialPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === 'teachers' || tab === 'opinion' ? tab : 'all'

  const [allVisible, settings] = await Promise.all([
    getVisiblePosts(150),
    getSiteSettings(),
  ])

  const editorialPosts: Post[] = allVisible.filter(
    (p) => isEditorialOrFeatureCategory(p.category) || p.author_user_type === 'teacher'
  )

  const teacherPosts = editorialPosts.filter((p) => p.author_user_type === 'teacher')
  const opinionPosts = editorialPosts.filter((p) => p.author_user_type !== 'teacher')

  const displayedPosts =
    activeTab === 'teachers'
      ? teacherPosts
      : activeTab === 'opinion'
        ? opinionPosts
        : editorialPosts

  const banner = settings.behaviorAndPages.subPages.editorial

  const tabCls = (on: boolean) =>
    `shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
      on
        ? 'border-cyan-300/60 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
        : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20'
    }`

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-[75vh] py-6 sm:py-10">
        <div className="mx-auto max-w-7xl md:px-6 lg:px-8 space-y-6">
          <div className="px-4 md:px-0 space-y-4">
            <BackNavigation items={[{ label: 'সম্পাদকীয়, ফিচার ও মতামত' }]} />

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20">
              {banner.eyebrow && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider mb-2 shadow">
                  <Feather className="size-3.5" />
                  <span>{banner.eyebrow}</span>
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                {banner.title || 'সম্পাদকীয়, ফিচার ও মুক্তমত'}
              </h1>
              {banner.subtitle && (
                <p className="text-white/80 text-xs sm:text-sm font-medium mt-1.5 max-w-2xl leading-relaxed">
                  {banner.subtitle}
                </p>
              )}
            </div>

            {/* ফিল্টার ট্যাবসমূহ */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Link href="/editorial" className={tabCls(activeTab === 'all')}>
                <Sparkles className="size-3.5" />
                <span>সব লেখা ({editorialPosts.length.toLocaleString('bn-BD')})</span>
              </Link>
              <Link href="/editorial?tab=teachers" className={tabCls(activeTab === 'teachers')}>
                <GraduationCap className="size-3.5" />
                <span>শিক্ষকদের কলাম ({teacherPosts.length.toLocaleString('bn-BD')})</span>
              </Link>
              <Link href="/editorial?tab=opinion" className={tabCls(activeTab === 'opinion')}>
                <PenTool className="size-3.5" />
                <span>ফিচার, মতামত ও বিশ্লেষণ ({opinionPosts.length.toLocaleString('bn-BD')})</span>
              </Link>
            </div>

            <SectionHeading
              inverted
              eyebrow="Columns, Features & Opinions"
              title={
                activeTab === 'teachers'
                  ? 'শিক্ষকদের প্রকাশিত কলামসমূহ'
                  : activeTab === 'opinion'
                    ? 'ফিচার, বিশ্লেষণ ও সদস্যদের মতামত'
                    : 'প্রকাশিত সম্পাদকীয়, ফিচার ও মতামত'
              }
              subtitle={`মোট ${displayedPosts.length.toLocaleString('bn-BD')}টি লেখা প্রকাশিত হয়েছে`}
            />
          </div>

          {displayedPosts.length > 0 ? (
            <NewsGrid posts={displayedPosts} />
          ) : (
            <div className="px-4 md:px-0">
              <div className="glass-card p-12 text-center text-white space-y-2">
                <div className="size-12 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center mx-auto border border-white/20">
                  <Feather className="size-6" />
                </div>
                <p className="text-base font-bold text-white">এই বিভাগে এখনো কোনো কলাম বা ফিচার প্রকাশিত হয়নি।</p>
                <p className="text-xs text-slate-300">
                  শিক্ষকগণ বা রিপোর্টাররা “সম্পাদকীয় ও মতামত”, “ফিচার”, “বিশ্লেষণ” বা “মতামত” ক্যাটাগরিতে প্রকাশ করলেই এখানে দৃশ্যমান হবে।
                </p>
              </div>
            </div>
          )}

          <section className="px-4 md:px-0 pt-5 border-t border-white/15">
            <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white">
              <div>
                <h2 className="font-bold text-sm">
                  <Tx bn="সম্পাদনা, সংশোধনী ও স্পন্সরড কনটেন্ট" en="Editing, Corrections & Sponsored Content" />
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  <Tx
                    bn="ভুল সংশোধন, কপিরাইট ও বিজ্ঞাপন/স্পন্সরশিপ বিষয়ে আমাদের প্রকাশ্য নীতি দেখুন।"
                    en="Read our public policies on corrections, copyright, advertising and sponsorship."
                  />
                </p>
              </div>
              <Link
                href="/policies#corrections"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20"
              >
                <Tx bn="নীতিমালা দেখুন" en="View policies" /> <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </section>

          <div className="px-4 md:px-0 pt-6 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
