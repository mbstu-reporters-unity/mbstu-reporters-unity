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
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <NewsTicker />
      <main>
        {/* Google SEO ও স্ক্রিন রিডারের জন্য মূল পরিচিতি */}
        <section className="sr-only" aria-label="পরিচিতি">
          <h1>
            MBSTU Reporters&apos; Unity | মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি
          </h1>
          <p>
            মাভাবিপ্রবি রিপোর্টার্স ইউনিটি (MBSTURU) হলো মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (MBSTU), সন্তোষ, টাঙ্গাইলের ক্যাম্পাস সাংবাদিকদের অফিসিয়াল সংগঠন ও সংবাদ পোর্টাল। এখানে বিশ্ববিদ্যালয়ের সর্বশেষ ক্যাম্পাস সংবাদ, ডিজিটাল নোটিশ বোর্ড, অনুষদ ও বিভাগসমূহ, প্রশাসন, ক্লাব কার্যক্রম ও শিক্ষার্থীদের লেখা প্রকাশিত হয়।
          </p>
        </section>

        {/* ব্যানার ও স্লাইডার */}
        <HeroCarousel />

        {/* ১. ফেসবুক স্টোরিজ ও হাইলাইটস ট্রে */}
        <FbStoriesTray />

        {/* ২. ফেসবুক রিলস ও ভিডিও হাব */}
        <FbReelsSection />

        {/* ৩. মূল ক্যাম্পাস সংবাদ ও সবার পোস্ট (কমিউনিটি ফিড) */}
        <GeneralNews />
        <CommunityFeed />

        <LeadershipSection />
        <CategorySections />
        <StudentCorner />
        <ClubNews />
        <ClubPosts />
        <CommunityPagesSection />
        <NoticeBoard />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
