import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { NewsTicker } from '@/components/portal/news-ticker'
import { HeroCarousel } from '@/components/portal/hero-carousel'
import { LeadershipSection } from '@/components/portal/leadership-section'
import { GeneralNews } from '@/components/portal/general-news'
import { StudentCorner } from '@/components/portal/student-corner'
import { ClubNews } from '@/components/portal/club-news'
import { NoticeBoard } from '@/components/portal/notice-board'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

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
        <StudentCorner />
        <ClubNews />
        <NoticeBoard />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
