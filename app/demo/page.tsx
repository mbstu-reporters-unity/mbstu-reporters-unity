import { Fragment, type ReactNode } from 'react'
import { connection } from 'next/server'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Tv,
  Users,
  GraduationCap,
  ShieldCheck,
  Bell,
  Award,
} from 'lucide-react'

import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { NewsTicker } from '@/components/portal/news-ticker'
import { HeroCarousel } from '@/components/hero/HeroCarousel'
import { FbStoriesTray } from '@/components/portal/fb-stories-tray'
import { FbReelsSection } from '@/components/portal/fb-reels-section'
import { LeadershipSection } from '@/components/portal/leadership-section'
import { GeneralNews } from '@/components/portal/general-news'
import { CommunityFeed } from '@/components/portal/community-feed'
import { CategorySections } from '@/components/portal/category-sections'
import { StudentCorner } from '@/components/portal/student-corner'
import { ClubNews } from '@/components/portal/club-news'
import { ClubPosts } from '@/components/portal/club-posts'
import { CommunityPagesSection } from '@/components/portal/community-pages-section'
import { NoticeBoard } from '@/components/portal/notice-board'
import { PollWidget } from '@/components/portal/poll-widget'
import { HomeEventsAndPopular } from '@/components/portal/home-events-popular'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { HomepageTransitionSection } from '@/components/portal/homepage-transition-sections'
import { HomepageFeedRotator } from '@/components/portal/homepage-feed-rotator'

import { getSiteSettings, type HomeSectionConfig } from '@/lib/site-settings'
import { getHomepagePostHistory, getLimits, CAT_CLUB, CAT_STUDENT } from '@/lib/sb'
import { getVisibleCategoryNames } from '@/lib/categories'
import { getHomepageNotices } from '@/lib/notices'
import { selectHomepageItems } from '@/lib/homepage-feed'

export const revalidate = 60

const TRANSITION_KINDS = [
  'fact_check',
  'departments',
  'publications',
  'timeline',
  'social_sites',
] satisfies readonly Parameters<typeof HomepageTransitionSection>[0]['kind'][]

export default async function ModernHomepageDemo() {
  await connection()
  const [settings, postHistory, limits, categoryNames, noticeHistory] = await Promise.all([
    getSiteSettings(),
    getHomepagePostHistory(),
    getLimits(),
    getVisibleCategoryNames(),
    getHomepageNotices(),
  ])

  const sections = settings.homeSections.sections
  const now = Date.now()
  const visibleCategories = new Set(categoryNames)

  // ৩ দিনের রিটেনশন ও রিপ্লেসমেন্ট লজিক
  const homePosts = selectHomepageItems(postHistory, (post) => post.created_at, now).filter(
    (post) => !post.category || visibleCategories.has(post.category)
  )
  const homeNotices = selectHomepageItems(
    noticeHistory.filter((notice) => !notice.expires_at || Date.parse(notice.expires_at) > now),
    (notice) => notice.updated_at || notice.created_at,
    now
  )

  const isSectionVisible = (key: string) => sections.find((s) => s.key === key)?.visible ?? true
  const getSectionConfig = (key: string) => sections.find((s) => s.key === key)

  const noticeSection = sections.find((section) => section.key === 'notice_board')
  const feedNotices = noticeSection?.visible ? homeNotices : []
  const newsPosts = homePosts.filter(
    (post) => !post.page_id && post.category !== CAT_CLUB && post.category !== CAT_STUDENT
  )

  const heroSection = getSectionConfig('hero')
  const topAreaSection = getSectionConfig('general_news')

  return (
    <>
      {/* ========================================================
          ডেমো প্ল্যানার ব্যানার — আন্তর্জাতিক লেআউট নেভিগেশন
          ======================================================== */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border-b border-cyan-500/30 text-white px-4 py-2 text-xs select-none sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/40">
              <Sparkles className="size-3" />
              ইন্টারন্যাশনাল স্ট্যান্ডার্ড ডেমো
            </span>
            <span className="hidden md:inline text-slate-300">
              সব ডাটা ও ফিচার অক্ষুণ্ণ রেখে ৬টি মডার্ন জোনে সুবিন্যস্ত লেআউট
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-slate-400 hover:text-white underline transition"
            >
              মূল হোম পেজে যান
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              href="/preview"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-2.5 py-1 rounded-md transition"
            >
              ডুয়াল ভিউতে দেখুন
            </Link>
          </div>
        </div>
      </div>

      <TopBar />
      <SiteHeader />
      <NewsTicker />

      <main className="space-y-12 sm:space-y-16">
        {/* ========================================================
            জোন ১: লিড স্টোরি ও রিয়েলটাইম পালস (Hero & Breaking Studio)
            ======================================================== */}
        <section aria-label="প্রধান আকর্ষণ ও ব্রেকিং নিউজ" className="relative">
          {heroSection?.visible && <HeroCarousel key={heroSection.key} />}
        </section>

        {/* ========================================================
            জোন ২: মূল নিউজরুম ও এডিটোরিয়াল গ্রিড (Magazine Multi-Column Grid)
            (আন্তর্জাতিক মানের সংবাদপত্রের মতো ২-কলাম আর্কিটেকচার)
            - বাম কলাম (৭০%): ট্যাব-ভিত্তিক সর্বশেষ সংবাদ, ফিচার ও সম্পাদকীয়
            - ডান কলাম (৩০%): জনপ্রিয় সংবাদ, ইভেন্টস ও ক্যাম্পাস জরিপ পোল
            ======================================================== */}
        <section aria-label="সংবাদপত্র গ্রিড" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* বাম মূল কলাম: টপ নিউজ ও সম্পাদকীয় ট্যাব */}
            <div className="lg:col-span-8">
              {topAreaSection?.visible && (
                <GeneralNews
                  sectionConfig={topAreaSection}
                  prefetchedPosts={homePosts}
                  prefetchedLimits={limits}
                  prefetchedCategories={categoryNames}
                  initialNow={now}
                />
              )}
            </div>

            {/* ডান সাইডবার: ট্রেন্ডিং/পপুলার নিউজ, ইভেন্টস ও লাইভ পোল */}
            <aside className="lg:col-span-4 space-y-8 sticky top-20">
              {/* জনপ্রিয় সংবাদ ও ইভেন্ট উইজেট */}
              {isSectionVisible('events_popular') && (
                <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-xl bg-slate-900/60 backdrop-blur-xl">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10 text-cyan-300 font-bold text-sm">
                    <Award className="size-4" />
                    <span>জনপ্রিয় ও আসন্ন আয়োজন</span>
                  </div>
                  <HomeEventsAndPopular compact prefetchedPosts={newsPosts} />
                </div>
              )}

              {/* ক্যাম্পাস মতামত ও জরিপ (Poll) */}
              {isSectionVisible('polls') && (
                <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-xl bg-slate-900/60 backdrop-blur-xl">
                  <PollWidget compact />
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* ========================================================
            জোন ৩: স্বয়ংক্রিয় ৩-দিনের অ্যালগরিদমিক রোটেশন ফিড
            (ফেসবুক/ইউটিউব স্টাইলে একক পরিচ্ছন্ন জায়গায় ঘুরবে)
            ======================================================== */}
        <section aria-label="সর্বশেষ রোটেটিং ফিড" className="bg-slate-950/70 border-y border-white/10 py-6">
          <HomepageFeedRotator
            posts={newsPosts}
            notices={feedNotices}
            title="সর্বশেষ সংবাদ ও হালনাগাদ নোটিশ (লাইভ অ্যালগরিদম ফিড)"
            initialIndex={0}
            initialNow={now}
          />
        </section>

        {/* ========================================================
            জোন ৪: মাল্টিমিডিয়া ও সোশ্যাল হাব (Stories & Video Reels Hub)
            (আধুনিক তরুণ প্রজন্মের জন্য সোশাল ভিডিও ডেক)
            ======================================================== */}
        <section aria-label="মাল্টিমিডিয়া হাব" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <Tv className="size-5 text-rose-400" />
            <h2 className="text-xl font-bold font-serif text-white">ক্যাম্পাস স্টোরিজ ও রিলস হাব</h2>
            <span className="text-xs text-rose-300/80 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              ভিডিও ও ভিজ্যুয়াল
            </span>
          </div>

          {/* স্টোরিজ ট্রে */}
          {isSectionVisible('stories') && <FbStoriesTray />}

          {/* রিলস ভিডিও সেকশন */}
          {isSectionVisible('reels') && <FbReelsSection compact />}
        </section>

        {/* ========================================================
            জোন ৫: ক্যাটাগরি ভিত্তিক সংবাদ ডেক (Category Hub)
            (হোমপেজকে ভারি না করে সর্বোচ্চ ৩টি তাজা সংবাদ + পূর্ণ আর্কাইভ লিংক)
            ======================================================== */}
        {isSectionVisible('category_sections') && (
          <section aria-label="ক্যাটাগরি সেকশন">
            <CategorySections
              sectionConfig={getSectionConfig('category_sections')}
              prefetchedPosts={homePosts}
              prefetchedLimits={limits}
              prefetchedCategories={categoryNames}
            />
          </section>
        )}

        {/* ========================================================
            জোন ৬: ক্যাম্পাস লাইফ, ক্লাব ও স্টুডেন্ট ভয়েস (Campus Life Bento Grid)
            ======================================================== */}
        <section aria-label="ক্যাম্পাস লাইফ ও ক্লাব" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <GraduationCap className="size-5 text-amber-400" />
            <h2 className="text-xl font-bold font-serif text-white">ক্যাম্পাস জীবন, ক্লাব ও কমিউনিটি</h2>
            <span className="text-xs text-amber-300/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              শিক্ষার্থী কণ্ঠস্বর
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* স্টুডেন্ট কর্নার */}
            {isSectionVisible('student_corner') && (
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <StudentCorner />
              </div>
            )}

            {/* ক্লাব ও সংগঠন সংবাদ */}
            {isSectionVisible('club_news') && (
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <ClubNews compact />
              </div>
            )}
          </div>

          {/* কমিউনিটি পেজ ও পাবলিক ক্লাব পোস্ট */}
          {isSectionVisible('community_pages') && <CommunityPagesSection />}
          {isSectionVisible('community_feed') && <CommunityFeed />}
          {isSectionVisible('club_posts') && (
            <ClubPosts
              sectionConfig={getSectionConfig('club_posts')}
              prefetchedPosts={homePosts}
              prefetchedLimits={limits}
            />
          )}
        </section>

        {/* ========================================================
            জোন ৭: ফ্যাক্ট-চেক, ডিপার্টমেন্ট ও ট্রানজিশন মডিউল
            ======================================================== */}
        <section aria-label="ফ্যাক্ট চেক ও বিশ্ববিদ্যালয় উইং" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {TRANSITION_KINDS.map((kind) => {
            if (!isSectionVisible(kind)) return null
            const sec = getSectionConfig(kind)
            if (!sec) {
              throw new Error(`Missing homepage section configuration: ${kind}`)
            }
            return <HomepageTransitionSection key={kind} kind={kind} sectionConfig={sec} />
          })}
        </section>

        {/* ========================================================
            জোন ৮: ডিজিটাল নোটিশ বোর্ড ও নেতৃত্ব (Notice & Leadership Anchor)
            ======================================================== */}
        <section aria-label="ডিজিটাল নোটিশ ও নেতৃত্ব" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* নোটিশ বোর্ড */}
          {isSectionVisible('notice_board') && (
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-cyan-500/20 bg-slate-900/70 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-2 mb-4 text-cyan-300 font-bold text-sm">
                <Bell className="size-4" />
                <span>অফিসিয়াল ডিজিটাল নোটিশ বোর্ড</span>
              </div>
              <NoticeBoard prefetchedNotices={homeNotices} initialNow={now} />
            </div>
          )}

          {/* নেতৃত্ব ও কার্যনির্বাহী পরিষদ */}
          {isSectionVisible('leadership') && <LeadershipSection />}
        </section>
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  )
}
