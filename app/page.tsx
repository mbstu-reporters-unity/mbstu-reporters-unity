import { HomeEventsAndPopular } from '@/components/portal/home-events-popular'
import { Fragment, type ReactNode } from 'react'
import { connection } from 'next/server'
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
import { getHomepagePostHistory, getLimits, CAT_CLUB, CAT_STUDENT } from '@/lib/sb'
import { getVisibleCategoryNames } from '@/lib/categories'
import { getHomepageNotices } from '@/lib/notices'
import { selectHomepageItems } from '@/lib/homepage-feed'
import { HomepageFeedRotator } from '@/components/portal/homepage-feed-rotator'
import { HomepageTransitionSection } from '@/components/portal/homepage-transition-sections'

export const revalidate = 60

export default async function Page() {
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
  const homePosts = selectHomepageItems(postHistory, (post) => post.created_at, now).filter(
    (post) => !post.category || visibleCategories.has(post.category)
  )
  const homeNotices = selectHomepageItems(
    noticeHistory.filter((notice) => !notice.expires_at || Date.parse(notice.expires_at) > now),
    (notice) => notice.updated_at || notice.created_at,
    now
  )
  const noticeSection = sections.find((section) => section.key === 'notice_board')
  const feedNotices = noticeSection?.visible ? homeNotices : []
  const newsPosts = homePosts.filter(
    (post) => !post.page_id && post.category !== CAT_CLUB && post.category !== CAT_STUDENT
  )
  const heroSection = sections.find((section) => section.key === 'hero')
  const topAreaSection = sections.find((section) => section.key === 'general_news')
  const leadershipSection = sections.find((section) => section.key === 'leadership')
  const middleSections = sections.filter(
    (section) =>
      section.visible &&
      section.key !== 'hero' &&
      section.key !== 'general_news' &&
      section.key !== 'leadership'
  )

  const renderSection = (sec: HomeSectionConfig): ReactNode => {
    if (!sec.visible) return null
    switch (sec.key) {
      case 'hero':
      case 'general_news':
      case 'leadership':
        return null
      case 'stories':
        return <FbStoriesTray key={sec.key} />
      case 'reels':
        return <FbReelsSection key={sec.key} compact />
      case 'community_feed':
        return <CommunityFeed key={sec.key} />
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
        return <ClubNews key={sec.key} compact />
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
        return <NoticeBoard key={sec.key} prefetchedNotices={homeNotices} initialNow={now} />
      case 'events_popular':
        return <HomeEventsAndPopular key={sec.key} compact prefetchedPosts={newsPosts} />
      case 'polls':
        return <PollWidget key={sec.key} compact />
      case 'departments':
      case 'social_sites':
      case 'timeline':
      case 'fact_check':
      case 'publications':
        return <HomepageTransitionSection key={sec.key} kind={sec.key} sectionConfig={sec} />
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

        {heroSection?.visible && <HeroCarousel key={heroSection.key} />}
        {topAreaSection?.visible && (
          <GeneralNews
            sectionConfig={topAreaSection}
            prefetchedPosts={homePosts}
            prefetchedLimits={limits}
            prefetchedCategories={categoryNames}
            initialNow={now}
          />
        )}
        {middleSections.map((section, index) => (
          <Fragment key={section.key}>
            {renderSection(section)}
            <HomepageFeedRotator
              posts={newsPosts}
              notices={feedNotices}
              title="সর্বশেষ সংবাদ ও হালনাগাদ নোটিশ"
              initialIndex={index}
              initialNow={now}
            />
          </Fragment>
        ))}
        {leadershipSection?.visible && <LeadershipSection key={leadershipSection.key} />}
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
