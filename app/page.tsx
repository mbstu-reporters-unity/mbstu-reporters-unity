import type { ReactNode } from 'react'
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
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { getSiteSettings, type HomeSectionConfig } from '@/lib/site-settings'
import { getVisiblePosts, getLimits, getCategoryNames } from '@/lib/sb'

export const revalidate = 60

export default async function Page() {
  const [settings, homePosts, limits, categoryNames] = await Promise.all([
    getSiteSettings(),
    getVisiblePosts(200),
    getLimits(),
    getCategoryNames(),
  ])
  const sections = settings.homeSections.sections

  const renderSection = (sec: HomeSectionConfig): ReactNode => {
    if (!sec.visible) return null
    switch (sec.key) {
      case 'hero':
        return <HeroCarousel key={sec.key} />
      case 'stories':
        return <FbStoriesTray key={sec.key} />
      case 'reels':
        return <FbReelsSection key={sec.key} />
      case 'general_news':
        return (
          <GeneralNews
            key={sec.key}
            sectionConfig={sec}
            prefetchedPosts={homePosts}
            prefetchedLimits={limits}
          />
        )
      case 'community_feed':
        return <CommunityFeed key={sec.key} />
      case 'leadership':
        return <LeadershipSection key={sec.key} />
      case 'category_sections':
        return (
          <CategorySections
            key={sec.key}
            sectionConfig={sec}
            prefetchedPosts={homePosts}
            prefetchedLimits={limits}
            prefetchedCategories={categoryNames}
          />
        )
      case 'student_corner':
        return <StudentCorner key={sec.key} />
      case 'club_news':
        return <ClubNews key={sec.key} />
      case 'club_posts':
        return (
          <ClubPosts
            key={sec.key}
            sectionConfig={sec}
            prefetchedPosts={homePosts}
            prefetchedLimits={limits}
          />
        )
      case 'community_pages':
        return <CommunityPagesSection key={sec.key} />
      case 'notice_board':
        return <NoticeBoard key={sec.key} />
      default:
        return null
    }
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <NewsTicker />
      <main>
        <section className="sr-only" aria-label="পরিচিতি">
          <h1>
            {settings.branding.orgNameEn} | {settings.branding.orgNameBn}
          </h1>
          <p>{settings.footer.descriptionBn}</p>
        </section>

        {sections.map(renderSection)}
        <PollWidget />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
