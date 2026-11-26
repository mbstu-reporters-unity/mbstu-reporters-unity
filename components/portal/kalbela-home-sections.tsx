import Link from "next/link"
import {
  ArrowRight,
  Bookmark,
  Building2,
  CalendarDays,
  Clock3,
  Newspaper,
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
import { CAT_CLUB, CAT_STUDENT, type Post } from "@/lib/sb"
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

function formatBanglaDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  })
}

function formatBanglaDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  })
}

function PostImage({
  post,
  className,
  fit,
  zoomOnHover,
}: {
  post: Post
  className: string
  fit?: "contain" | "cover"
  zoomOnHover?: boolean
}) {
  return (
    <KalbelaPostImage
      src={post.image_url}
      alt={post.title}
      className={className}
      fit={fit}
      zoomOnHover={zoomOnHover}
    />
  )
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
      className="group block min-w-0 overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm transition hover:border-[var(--theme-brand)]"
    >
      <PostImage post={post} className={compact ? "aspect-[16/10]" : "aspect-[16/9]"} />
      <span className={`block ${compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}`}>
        <span className={`line-clamp-3 block font-bold leading-snug text-[var(--theme-text-title)] transition-colors group-hover:text-[var(--theme-brand)] ${
          compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
        }`}>
          {post.title}
        </span>
        <span className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[10px] font-semibold">
          <span className="truncate text-[var(--theme-brand)]">{post.category || "সর্বশেষ সংবাদ"}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[var(--theme-text-body)]">
            <CalendarDays className="size-3" aria-hidden="true" />
            {formatBanglaDate(post.created_at)}
          </span>
        </span>
      </span>
    </Link>
  )
}

function HorizontalPostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex min-w-0 items-center gap-3 border-b border-[var(--theme-card-border)] py-3 last:border-b-0"
    >
      <PostImage post={post} className="aspect-[16/10] w-28 shrink-0 rounded-lg sm:w-32" />
      <span className="min-w-0">
        <span className="line-clamp-3 block text-sm font-bold leading-snug text-[var(--theme-text-title)] transition-colors group-hover:text-[var(--theme-brand)]">
          {post.title}
        </span>
        <span className="mt-1 block truncate text-[10px] font-semibold text-[var(--theme-brand)]">
          {post.category || "সর্বশেষ সংবাদ"} · {formatBanglaDate(post.created_at)}
        </span>
      </span>
    </Link>
  )
}

function CategoryHeader({ category }: { category: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--theme-card-border)] pb-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--theme-brand-soft)] text-[var(--theme-brand)]">
          <Newspaper className="size-4" aria-hidden="true" />
        </span>
        <h2 className="truncate font-serif text-lg font-bold text-[var(--theme-text-title)] sm:text-xl">{category}</h2>
      </div>
      <Link
        href={`/category/${encodeURIComponent(category)}`}
        aria-label={`${category} বিভাগের সব সংবাদ`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--theme-card-border)] text-[var(--theme-brand)] transition hover:bg-[var(--theme-brand)] hover:text-[var(--theme-bg-solid)]"
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
    <section className="border-b border-[var(--theme-card-border)] py-8 sm:py-11" aria-label={`${category} বিভাগের সংবাদ`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategoryHeader category={category} />
        {layout === 0 && (
          <>
            <div className="mb-4">
              <Link href={`/post/${posts[0].id}`} className="group block overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm">
                <PostImage post={posts[0]} className="aspect-[16/9]" />
                <span className="block p-3 sm:p-4">
                  <span className="line-clamp-3 block font-serif text-lg font-bold leading-snug text-[var(--theme-text-title)] group-hover:text-[var(--theme-brand)] sm:text-xl">
                    {posts[0].title}
                  </span>
                  {postExcerpt(posts[0]) && <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-[var(--theme-text-body)]">{postExcerpt(posts[0])}</span>}
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
            <div className="divide-y divide-[var(--theme-card-border)]">
              {posts.slice(1, 5).map((post) => <HorizontalPostRow key={post.id} post={post} />)}
            </div>
          </div>
        )}
        {layout === 2 && (
          <div className="divide-y divide-[var(--theme-card-border)]">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="py-4 first:pt-0 last:pb-0">
                <Link href={`/post/${post.id}`} className="mb-2 block font-serif text-base font-bold leading-snug text-[var(--theme-text-title)] hover:text-[var(--theme-brand)] sm:text-lg">
                  {post.title}
                </Link>
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-3">
                  <Link href={`/post/${post.id}`} aria-label={post.title}>
                    <PostImage post={post} className="aspect-[16/10] rounded-lg" />
                  </Link>
                  <p className="line-clamp-4 text-xs leading-relaxed text-[var(--theme-text-body)] sm:text-sm">
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
  const postViews = latestPosts.reduce((views, post) => {
    if (typeof post.view_count === "number") views.set(post.id, post.view_count)
    return views
  }, new Map<string, number>())
  const storiesWithViews = stories.map((story) => ({
    ...story,
    view_count: story.view_count ?? (story.post_id ? postViews.get(story.post_id) : undefined),
  }))
  const reelsWithViews = reels.map((reel) => ({
    ...reel,
    view_count: reel.view_count ?? (reel.post_id ? postViews.get(reel.post_id) : undefined),
  }))
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
  const categoryBlocks = categories
    .filter((category) => category !== CAT_CLUB && category !== CAT_STUDENT)
    .map((category) => ({
      category,
      posts: latestPosts.filter((post) => post.category === category),
    }))
    .filter((entry) => entry.posts.length > 0)
  const photoPosts = latestPosts.filter((post) => Boolean(post.image_url)).slice(0, 10)
  const firstCategoryAdIndex = Math.max(1, Math.ceil(categoryBlocks.length / 3) - 1)
  const secondCategoryAdIndex = Math.min(
    categoryBlocks.length - 1,
    Math.max(firstCategoryAdIndex + 2, Math.ceil((categoryBlocks.length * 2) / 3) - 1)
  )
  const categoryAdPlacements = categoryBlocks.length > 1
    ? [
        { slot: "home_mid_3" as const, afterIndex: firstCategoryAdIndex },
        { slot: "home_mid_4" as const, afterIndex: secondCategoryAdIndex },
      ].filter((placement, index, placements) =>
        placements.findIndex((candidate) => candidate.afterIndex === placement.afterIndex) === index
      )
    : []
  const latestLimit = latestPosts.slice(0, 15)
  const initialNow = Date.now()

  return (
    <>
      {isSectionVisible(sections, "general_news") && (
        <section id="general-news" className="border-b border-[var(--theme-card-border)] py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.08em] text-[var(--theme-brand)]">মাভাবিপ্রবি সংবাদ</p>
                <h1 className="mt-1 font-serif text-2xl font-extrabold leading-tight text-[var(--theme-text-title)] sm:text-3xl">
                  {settings.homeSections.sections.find((section) => section.key === "general_news")?.titleBn || "সর্বশেষ সংবাদ"}
                </h1>
              </div>
              <Link href="/news" className="shrink-0 text-xs font-bold text-[var(--theme-brand)] hover:underline sm:text-sm">
                সব সংবাদ →
              </Link>
            </div>

            {leadPost ? (
              <Link href={`/post/${leadPost.id}`} className="group block overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm">
                <PostImage post={leadPost} className="aspect-[16/9] max-h-[500px] bg-slate-50" fit="cover" zoomOnHover />
                <span className="block p-4 sm:p-6">
                  <span className="inline-flex rounded-full bg-[var(--theme-brand)] px-3 py-1 text-xs font-bold text-[var(--theme-bg-solid)]">
                    {leadPost.category || "সর্বশেষ সংবাদ"}
                  </span>
                  <span className="mt-3 block font-serif text-2xl font-extrabold leading-tight text-[var(--theme-text-title)] transition-colors group-hover:text-[var(--theme-brand)] sm:text-3xl md:text-4xl">
                    {leadPost.title}
                  </span>
                  {postExcerpt(leadPost) && (
                    <span className="mt-2 line-clamp-3 block max-w-4xl text-sm leading-relaxed text-[var(--theme-text-body)] sm:text-base">
                      {postExcerpt(leadPost)}
                    </span>
                  )}
                  <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[var(--theme-text-body)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5 text-[var(--theme-brand)]" aria-hidden="true" />
                      <time dateTime={leadPost.created_at}>{formatBanglaDateTime(leadPost.created_at)}</time>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Newspaper className="size-3.5 text-[var(--theme-brand)]" aria-hidden="true" />
                      {leadPost.author?.trim() || "মাভাবিপ্রবি প্রতিনিধি"}
                    </span>
                  </span>
                </span>
              </Link>
            ) : (
              <p className="rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-6 text-center text-sm text-[var(--theme-text-body)]" role="status">
                এখনো কোনো সংবাদ প্রকাশিত হয়নি।
              </p>
            )}

            {remainingPosts.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {remainingPosts.slice(0, 4).map((post) => <GridPostCard key={post.id} post={post} compact />)}
              </div>
            )}

            <AdSlot slot="home_mid_1" prefetchedAds={adBanners} />

            {remainingPosts.length > 4 && (
              <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-8">
                <GridPostCard post={remainingPosts[4]} />
                <div className="divide-y divide-[var(--theme-card-border)]">
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
        <section className="border-b border-[var(--theme-card-border)] py-8 sm:py-10" aria-labelledby="department-quick-filter-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="size-5 text-[var(--theme-brand)]" aria-hidden="true" />
                <h2 id="department-quick-filter-title" className="font-serif text-xl font-bold text-[var(--theme-text-title)] sm:text-2xl">
                  ক্যাম্পাস ও বিভাগসমূহ
                </h2>
              </div>
              <Link href="/administration" aria-label="প্রশাসন বিভাগ দেখুন" className="flex size-9 items-center justify-center rounded-full border border-[var(--theme-card-border)] text-[var(--theme-brand)] hover:bg-[var(--theme-brand)] hover:text-[var(--theme-bg-solid)]">
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <DepartmentQuickFilter faculties={faculties} posts={latestPosts} />
          </div>
        </section>
      )}

      {(isSectionVisible(sections, "stories") || isSectionVisible(sections, "reels")) && (
        <StoryMediaTabs
          stories={storiesWithViews}
          reels={reelsWithViews}
          showStories={isSectionVisible(sections, "stories")}
          showReels={isSectionVisible(sections, "reels")}
        />
      )}

      {(isSectionVisible(sections, "polls") || isSectionVisible(sections, "reels")) && (
        <section className="border-b border-[var(--theme-card-border)] py-8 sm:py-10">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8">
            {isSectionVisible(sections, "polls") && <PollWidget kalbela />}
            {isSectionVisible(sections, "reels") && (
              <FbReelsSection
                standalone
                showHeading
                sectionId="reels-hub"
                displayMode="landscape"
                newspaper
                prefetchedReels={reelsWithViews}
              />
            )}
          </div>
        </section>
      )}

      {isSectionVisible(sections, "general_news") && featuredPosts.length > 0 && (
        <section className="border-b border-[var(--theme-card-border)] py-8 sm:py-10" aria-labelledby="featured-news-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--theme-brand)] text-[var(--theme-bg-solid)]">
                  <Bookmark className="size-5" aria-hidden="true" />
                </span>
                <h2 id="featured-news-title" className="font-serif text-xl font-bold text-[var(--theme-text-title)] sm:text-2xl">বাছাইকৃত</h2>
              </div>
              <Link
                href="/search?sort=popular"
                aria-label="জনপ্রিয় সংবাদ দেখুন"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--theme-card-border)] text-[var(--theme-brand)] transition hover:bg-[var(--theme-brand)] hover:text-[var(--theme-bg-solid)]"
              >
                <ArrowRight className="size-4" aria-hidden="true" />
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
          {categoryAdPlacements
            .filter((placement) => placement.afterIndex === index)
            .map((placement) => (
              <AdSlot key={placement.slot} slot={placement.slot} prefetchedAds={adBanners} />
            ))}
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
