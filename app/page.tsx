import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { NewsTicker } from '@/components/portal/news-ticker'
import { HeroCarousel } from '@/components/hero/HeroCarousel'
import { FbStoriesTray } from '@/components/portal/fb-stories-tray'
import { FbReelsSection } from '@/components/portal/fb-reels-section'
import { LeadershipSection } from '@/components/portal/leadership-section'
import { GeneralNews } from '@/components/portal/general-news'
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
        {/* ব্যানার ও স্লাইডার */}
        <HeroCarousel />

        {/* ১. ⭐ ফেসবুক স্টোরিজ ও হাইলাইটস ট্রে ⭐ */}
        <FbStoriesTray />

        {/* ২. ⭐ ফেসবুক রিলস ও ভিডিও হাব ⭐ */}
        <FbReelsSection />

        {/* ৩. সাধারণ সংবাদ ও অন্যান্য ফিড */}
        <GeneralNews />
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
