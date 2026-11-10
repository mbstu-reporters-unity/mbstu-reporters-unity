import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { NewsTicker } from '@/components/portal/news-ticker'
import { HeroCarousel } from '@/components/hero/HeroCarousel'
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

// ⭐ সুপারফাস্ট স্পিডের জন্য স্মার্ট ক্যাশিং (১ সেকেন্ডে পেজ লোড হবে, ৬০ সেকেন্ড পর পর ব্যাকগ্রাউন্ডে অটো আপডেট হবে) ⭐
export const revalidate = 60

export default function Page() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <NewsTicker />
      <main>
        <HeroCarousel />
        <LeadershipSection />
        <GeneralNews />
        <CategorySections />
        <StudentCorner />
        <ClubNews />
        <ClubPosts />
        {/* ⭐ ফেসবুক স্টাইল কমিউনিটি পেজ স্লাইডার সেকশন ⭐ */}
        <CommunityPagesSection />
        <NoticeBoard />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
