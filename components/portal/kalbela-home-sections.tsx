import Link from "next/link"
import {
  ArrowRight,
  Building2,
  Newspaper,
  Star,
} from "lucide-react"
import { AdSlot } from "@/components/portal/ad-slot"
import { ClubNews } from "@/components/portal/club-news"
import { ClubPosts } from "@/components/portal/club-posts"
import { CommunityFeed } from "@/components/portal/community-feed"
import { CommunityPagesSection } from "@/components/portal/community-pages-section"
import { FbReelsSection } from "@/components/portal/fb-reels-section"
import { LeadershipSection } from "@/components/portal/leadership-section"
import { NoticeBoard } from "@/components/portal/notice-board"
import { PollWidget } from "@/components/portal/poll-widget"
import { StudentCorner } from "@/components/portal/student-corner"
import { HomepageTransitionSection } from "@/components/portal/homepage-transition-sections"
import type { AdBannerItem } from "@/lib/ads"
import type { FacultyWithDepartments } from "@/lib/faculties"
import type { HomeSectionConfig, SiteSettings } from "@/lib/site-settings"
import type { Notice } from "@/lib/notices"
import { CAT_CLUB, CAT_CAMPUS, CAT_STUDENT, type Post } from "@/lib/sb"
import type { ReelItem } from "@/lib/reels"
import type { StoryItem } from "@/lib/stories"
import { DepartmentQuickFilter, NumberedHeadlines, StoryMediaTabs } from "./kalbela-home-controls"
import { KalbelaPhotoGallery } from "./kalbela-photo-gallery"
import { KalbelaPostImage } from "./kalbela-post-image"

function isSectionVisible(sections: HomeSectionConfig[], key: string): boolean {
  return sections.find((section) => section.key === key)?.visible ?? false
}

function postExcerpt(post: Post): string {
  const text = (post.summary || post.heading || post.body || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text
}

function PostImage({
  post,
  className,
}: {
  post: Post
  className: string
}) {
  return <KalbelaPostImage src={post.image_url} alt={post.title} className={className} />
}

function GridPostCard({
  post,
  compact = false,
}: {
  post: Post
  compact?: boolean
}) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group block min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-cyan-400/40 hover:bg-white/[0.07]"
    >
      <PostImage post={post} className={compact ? "aspect-[16/10]" : "aspect-[16/9]"} />
      <span className={`block ${compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}`}>
        <span className={`line-clamp-3 block font-bold leading-snug text-white transition-colors group-hover:text-cyan-300 ${
          compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
        }`}>
          {post.title}
        </span>
        {!compact && post.category && (
          <span className="mt-2 block text-[10px] font-bold text-cyan-300">{post.category}</span>
        )}
      </span>
    </Link>
  )
}

function HorizontalPostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex min-w-0 items-center gap-3 border-b border-white/10 py-3 last:border-b-0"
    >
      <PostImage post={post} className="aspect-[16/10] w-28 shrink-0 rounded-lg sm:w-32" />
      <span className="min-w-0">
        <span className="line-clamp-3 block text-sm font-bold leading-snug text-white transition-colors group-hover:text-cyan-300">
          {post.title}
        </span>
        {post.category && <span className="mt-1 block truncate text-[10px] text-slate-400">{post.category}</span>}
      </span>
    </Link>
  )
}

function CategoryHeader({ category }: { category: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/15 pb-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
          <Newspaper className="size-4" aria-hidden="true" />
        </span>
        <h2 className="truncate font-serif text-lg font-bold text-white sm:text-xl">{category}</h2>
      </div>
      <Link
        href={`/category/${encodeURIComponent(category)}`}
        aria-label={`${category} বিভাগের সব সংবাদ`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-cyan-300 transition hover:bg-cyan-500 hover:text-white"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

function CategoryBlock({
  category,
  posts,
  index,
}: {
  category: string
  posts: Post[]
  index: number
}) {
  const layout = index % 3

  return (
    <section className="border-b border-white/10 py-8 sm:py-11" aria-label={`${category} বিভাগের সংবাদ`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategoryHeader category={category} />
        {layout === 0 && (
          <>
            <div className="mb-4">
              <Link href={`/post/${posts[0].id}`} className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                <PostImage post={posts[0]} className="aspect-[16/9]" />
                <span className="block p-3 sm:p-4">
                  <span className="line-clamp-3 block font-serif text-lg font-bold leading-snug text-white group-hover:text-cyan-300 sm:text-xl">
                    {posts[0].title}
                  </span>
                  {postExcerpt(posts[0]) && <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-slate-300">{postExcerpt(posts[0])}</span>}
                </span>
              </Link>
            </div>
            {posts.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {posts.slice(1, 5).map((post) => <GridPostCard key={post.id} post={post} compact />)}
              </div>
            )}
          </>
        )}
        {layout === 1 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <GridPostCard post={posts[0]} />
            <div className="divide-y divide-white/10">
              {posts.slice(1, 5).map((post) => <HorizontalPostRow key={post.id} post={post} />)}
            </div>
          </div>
        )}
        {layout === 2 && (
          <div className="divide-y divide-white/10">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="py-4 first:pt-0 last:pb-0">
                <Link href={`/post/${post.id}`} className="mb-2 block font-serif text-base font-bold leading-snug text-white hover:text-cyan-300 sm:text-lg">
                  {post.title}
                </Link>
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-3">
                  <Link href={`/post/${post.id}`} aria-label={post.title}>
                    <PostImage post={post} className="aspect-[16/10] rounded-lg" />
                  </Link>
                  <p className="line-clamp-4 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {postExcerpt(post) || post.category || "সর্বশেষ ক্যাম্পাস সংবাদ"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function KalbelaHomeSections({
  settings,
  posts,
  popularPosts,
  categories,
  notices,
  faculties,
  stories,
  reels,
  adBanners,
  limits,
}: {
  settings: SiteSettings
  posts: Post[]
  popularPosts: Post[]
  categories: string[]
  notices: Notice[]
  faculties: FacultyWithDepartments[]
  stories: StoryItem[]
  reels: ReelItem[]
  adBanners: AdBannerItem[]
  limits: Record<string, number>
}) {
  const sections = settings.homeSections.sections
  const visiblePosts = posts.filter((post) => !post.hidden && !post.page_id)
  const latestPosts = [...visiblePosts].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )
  const popular = popularPosts.filter((post) => !post.hidden && !post.page_id)
  const featuredSource = [
    ...latestPosts.filter((post) => post.is_featured),
    ...popular,
    ...latestPosts,
  ]
  const seenFeatured = new Set<string>()
  const featuredPosts = featuredSource.filter((post) => {
    if (seenFeatured.has(post.id)) return false
    seenFeatured.add(post.id)
    return true
  }).slice(0, 4)

  const leadPost = latestPosts.find((post) => post.is_featured) || latestPosts[0]
  const remainingPosts = leadPost ? latestPosts.filter((post) => post.id !== leadPost.id) : []
  const academicPosts = latestPosts.filter((post) =>
    post.category === CAT_CAMPUS || /একাডেমিক|শিক্ষা|বিভাগ|academic|faculty|department/i.test(post.category || "")
  ).slice(0, 6)
  const categoryBlocks = categories
    .filter((category) => category !== CAT_CLUB && category !== CAT_STUDENT)
    .map((category) => ({
      category,
      posts: latestPosts.filter((post) => post.category === category),
    }))
    .filter((entry) => entry.posts.length > 0)
  const photoPosts = latestPosts.filter((post) => Boolean(post.image_url)).slice(0, 10)
  const firstAdIndex = categoryBlocks.length > 1 ? Math.max(0, Math.ceil(categoryBlocks.length / 3) - 1) : -1
  const secondAdIndex = categoryBlocks.length > 1
    ? Math.max(firstAdIndex + 1, Math.ceil((categoryBlocks.length * 2) / 3) - 1)
    : -1
  const latestLimit = latestPosts.slice(0, 15)
  const initialNow = Date.now()

  return (
    <>
      {isSectionVisible(sections, "general_news") && (
        <section id="general-news" className="border-b border-white/10 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-400">Campus News</p>
                <h1 className="mt-1 font-serif text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  {settings.homeSections.sections.find((section) => section.key === "general_news")?.titleBn || "সর্বশেষ সংবাদ"}
                </h1>
              </div>
              <Link href="/news" className="shrink-0 text-xs font-bold text-cyan-300 hover:underline sm:text-sm">
                সব সংবাদ →
              </Link>
            </div>

            {leadPost ? (
              <Link href={`/post/${leadPost.id}`} className="group block overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04]">
                <PostImage post={leadPost} className="aspect-[16/9] max-h-[560px]" />
                <span className="block p-4 sm:p-6">
                  <span className="inline-flex rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-extrabold text-white">
                    {leadPost.category || "সর্বশেষ সংবাদ"}
                  </span>
                  <span className="mt-2 block font-serif text-xl font-bold leading-snug text-white transition-colors group-hover:text-cyan-300 sm:text-3xl">
                    {leadPost.title}
                  </span>
                  {postExcerpt(leadPost) && (
                    <span className="mt-2 line-clamp-2 block max-w-4xl text-sm leading-relaxed text-slate-300 sm:text-base">
                      {postExcerpt(leadPost)}
                    </span>
                  )}
                </span>
              </Link>
            ) : (
              <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400" role="status">
                এখনো কোনো সংবাদ প্রকাশিত হয়নি।
              </p>
            )}

            <AdSlot slot="home_top" prefetchedAds={adBanners} />

            {remainingPosts.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {remainingPosts.slice(0, 4).map((post) => <GridPostCard key={post.id} post={post} compact />)}
              </div>
            )}

            <AdSlot slot="home_mid_1" prefetchedAds={adBanners} />

            {remainingPosts.length > 4 && (
              <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-8">
                <GridPostCard post={remainingPosts[4]} />
                <div className="divide-y divide-white/10">
                  {remainingPosts.slice(5, 10).map((post) => <HorizontalPostRow key={post.id} post={post} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {isSectionVisible(sections, "events_popular") && (
        <NumberedHeadlines latestPosts={latestLimit} popularPosts={popular.slice(0, 15)} />
      )}

      {isSectionVisible(sections, "departments") && (
        <section className="border-b border-white/10 py-8 sm:py-10" aria-labelledby="department-quick-filter-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="size-5 text-cyan-400" aria-hidden="true" />
                <h2 id="department-quick-filter-title" className="font-serif text-xl font-bold text-white sm:text-2xl">
                  বিভাগ ও ক্যাম্পাস
                </h2>
              </div>
              <Link href="/administration" aria-label="প্রশাসন বিভাগ দেখুন" className="flex size-9 items-center justify-center rounded-full border border-white/20 text-cyan-300 hover:bg-cyan-600 hover:text-white">
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mb-4 max-w-md">
              <DepartmentQuickFilter faculties={faculties} />
            </div>
            {academicPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {academicPosts.map((post) => <GridPostCard key={post.id} post={post} compact />)}
              </div>
            ) : (
              <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400" role="status">
                এখনো বিভাগ বা ক্যাম্পাস বিষয়ক কোনো সংবাদ নেই।
              </p>
            )}
          </div>
        </section>
      )}

      {(isSectionVisible(sections, "stories") || isSectionVisible(sections, "reels")) && (
        <StoryMediaTabs
          stories={stories}
          reels={reels}
          showStories={isSectionVisible(sections, "stories")}
          showReels={isSectionVisible(sections, "reels")}
        />
      )}

      {(isSectionVisible(sections, "polls") || isSectionVisible(sections, "reels")) && (
        <section className="border-b border-white/10 py-8 sm:py-10">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8">
            {isSectionVisible(sections, "polls") && <PollWidget kalbela />}
            {isSectionVisible(sections, "reels") && (
              <FbReelsSection
                standalone
                showHeading
                sectionId="reels-hub"
                displayMode="landscape"
                prefetchedReels={reels}
              />
            )}
          </div>
        </section>
      )}

      {isSectionVisible(sections, "general_news") && featuredPosts.length > 0 && (
        <section className="border-b border-white/10 py-8 sm:py-10" aria-labelledby="featured-news-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Star className="size-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <h2 id="featured-news-title" className="font-serif text-xl font-bold text-white sm:text-2xl">বাছাইকৃত</h2>
              </div>
              <Link href="/search?sort=popular" className="text-xs font-bold text-cyan-300 hover:underline">
                জনপ্রিয় সংবাদ →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {featuredPosts.map((post) => <GridPostCard key={post.id} post={post} compact />)}
            </div>
          </div>
          <AdSlot slot="home_mid_2" prefetchedAds={adBanners} />
        </section>
      )}

      {isSectionVisible(sections, "category_sections") && categoryBlocks.map((entry, index) => (
        <div key={entry.category}>
          <CategoryBlock category={entry.category} posts={entry.posts} index={index} />
          {index === firstAdIndex && <AdSlot slot="home_mid_3" prefetchedAds={adBanners} />}
          {index === secondAdIndex && <AdSlot slot="home_mid_4" prefetchedAds={adBanners} />}
        </div>
      ))}

      {isSectionVisible(sections, "general_news") && photoPosts.length > 0 && (
        <KalbelaPhotoGallery posts={photoPosts} />
      )}

      {isSectionVisible(sections, "community_feed") && <CommunityFeed />}
      {isSectionVisible(sections, "notice_board") && (
        <NoticeBoard prefetchedNotices={notices} initialNow={initialNow} />
      )}
      {isSectionVisible(sections, "student_corner") && <StudentCorner />}
      {isSectionVisible(sections, "club_news") && <ClubNews allowFallback={false} />}
      {isSectionVisible(sections, "club_posts") && (
        <ClubPosts
          sectionConfig={sections.find((section) => section.key === "club_posts")}
          prefetchedPosts={visiblePosts}
          prefetchedLimits={limits}
        />
      )}
      {isSectionVisible(sections, "community_pages") && <CommunityPagesSection mode="directory" />}
      {isSectionVisible(sections, "leadership") && <LeadershipSection />}
      {(["social_sites", "timeline", "fact_check", "publications"] as const).map((key) => {
        const sectionConfig = sections.find((section) => section.key === key)
        if (!sectionConfig?.visible) return null
        return <HomepageTransitionSection key={key} kind={key} sectionConfig={sectionConfig} />
      })}
    </>
  )
}
