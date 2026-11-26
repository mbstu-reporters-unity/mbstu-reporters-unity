import { connection } from "next/server"
import { TopBar } from "@/components/portal/top-bar"
import { SiteHeader } from "@/components/portal/site-header"
import { NewsTicker } from "@/components/portal/news-ticker"
import { HeroCarousel } from "@/components/hero/HeroCarousel"
import { SiteFooter } from "@/components/portal/site-footer"
import { BackToTop } from "@/components/portal/back-to-top"
import { KalbelaHomeSections } from "@/components/portal/kalbela-home-sections"
import { getVisibleCategoryNames } from "@/lib/categories"
import { getFacultiesWithDepartments } from "@/lib/faculties"
import { getNotices } from "@/lib/notices"
import { getAdBanners } from "@/lib/ads"
import { getActiveStories } from "@/lib/stories"
import { getLiveReels } from "@/lib/reels"
import { getSiteSettings } from "@/lib/site-settings"
import { getLimits, getTopPopularPosts, getVisiblePosts } from "@/lib/sb"

export const revalidate = 60

export default async function Page() {
  await connection()
  const [
    settings,
    postRows,
    popularPosts,
    categories,
    notices,
    faculties,
    adBanners,
    stories,
    reels,
    limits,
  ] = await Promise.all([
    getSiteSettings(),
    getVisiblePosts(200),
    getTopPopularPosts(20),
    getVisibleCategoryNames(),
    getNotices(),
    getFacultiesWithDepartments(),
    getAdBanners(),
    getActiveStories(),
    getLiveReels(),
    getLimits(),
  ])
  const allPublishedPosts = postRows.filter((post) => !post.hidden)
  const visibleCategoryNames = new Set(categories)
  const homepagePosts = allPublishedPosts.filter(
    (post) => !post.category || visibleCategoryNames.has(post.category)
  )
  const heroSection = settings.homeSections.sections.find((section) => section.key === "hero")

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
        <KalbelaHomeSections
          settings={settings}
          posts={homepagePosts}
          popularPosts={popularPosts.filter(
            (post) => !post.category || visibleCategoryNames.has(post.category)
          )}
          categories={categories}
          notices={notices}
          faculties={faculties}
          stories={stories}
          reels={reels}
          adBanners={adBanners}
          limits={limits}
        />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
