import Link from "next/link"
import {
  ArrowRight,
  Bookmark,
  Building2,
  CalendarDays,
  Clock3,
  Newspaper,
  ChevronRight,
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
  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text
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

/* ========================================================
   কালবেলা কার্ড ১: গ্রিড পোস্ট কার্ড
   ======================================================== */
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
      className="group block min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:border-[#c8102e]"
    >
      <KalbelaPostImage
        src={post.image_url}
        alt={post.title}
        className={compact ? "aspect-[16/10]" : "aspect-[16/9]"}
        fit="cover"
        zoomOnHover
      />
      <span className={`block ${compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}`}>
        <span
          className={`line-clamp-2 sm:line-clamp-3 block font-serif font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#c8102e] ${
            compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
          }`}
        >
          {post.title}
        </span>
        <span className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[10px] font-semibold text-slate-500">
          <span className="truncate text-[#c8102e]">{post.category || "ক্যাম্পাস"}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <CalendarDays className="size-3" aria-hidden="true" />
            {formatBanglaDate(post.created_at)}
          </span>
        </span>
      </span>
    </Link>
  )
}

/* ========================================================
   কালবেলা কার্ড ২: হরাইজন্টাল রো (বামে ছোট ছবি, ডানে লেখা)
   ======================================================== */
function HorizontalPostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex min-w-0 items-center gap-3 border-b border-slate-100 py-2.5 sm:py-3 last:border-b-0 hover:bg-slate-50/60 rounded-lg px-1 transition-colors"
    >
      <KalbelaPostImage
        src={post.image_url}
        alt={post.title}
        className="aspect-[16/10] w-24 sm:w-28 shrink-0 rounded-lg overflow-hidden bg-slate-100"
        fit="cover"
      />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block font-serif text-xs sm:text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#c8102e]">
          {post.title}
        </span>
        <span className="mt-1 block truncate text-[10px] font-semibold text-[#c8102e]">
          {post.category || "সংবাদ"} · {formatBanglaDate(post.created_at)}
        </span>
      </span>
    </Link>
  )
}

/* ========================================================
   কালবেলা সেকশন হেডার (বামে লাল দাগ বা আইকন + ডানে তীর)
   ======================================================== */
function CategoryHeader({ category }: { category: string }) {
  return (
    <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="w-1.5 h-5 rounded-full bg-[#c8102e]" />
        <h2 className="truncate font-serif text-lg sm:text-xl font-bold text-slate-900">
          {category}
        </h2>
      </div>
      <Link
        href={`/category/${encodeURIComponent(category)}`}
        aria-label={`${category} বিভাগের সব সংবাদ`}
        className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-[#c8102e] hover:border-[#c8102e] hover:text-white"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

/* ========================================================
   কালবেলা ক্যাটাগরি ব্লক
   ======================================================== */
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
    <section className="border-b border-slate-200 py-6 sm:py-9 bg-white" aria-label={`${category} বিভাগের সংবাদ`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <CategoryHeader category={category} />

        {/* লেআউট ১: ১টি বড় লিড + ২টি গ্রিড */}
        {layout === 0 && (
          <div className="grid gap-4 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              <Link
                href={`/post/${posts[0].id}`}
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs hover:border-[#c8102e] transition"
              >
                <KalbelaPostImage
                  src={posts[0].image_url}
                  alt={posts[0].title}
                  className="aspect-[16/9] w-full"
                  fit="cover"
                  zoomOnHover
                />
                <span className="block p-3.5 sm:p-4">
                  <span className="line-clamp-2 block font-serif text-base sm:text-xl font-bold leading-snug text-slate-900 group-hover:text-[#c8102e]">
                    {posts[0].title}
                  </span>
                  {postExcerpt(posts[0]) && (
                    <span className="mt-1.5 line-clamp-2 block text-xs sm:text-sm leading-relaxed text-slate-600">
                      {postExcerpt(posts[0])}
                    </span>
                  )}
                </span>
              </Link>
            </div>

            {posts.length > 1 && (
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {posts.slice(1, 5).map((post) => (
                  <HorizontalPostRow key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* লেআউট ২: পাশাপাশি ২টি প্রধান কার্ড ও নিচে লিস্ট */}
        {layout === 1 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 4).map((post) => (
              <GridPostCard key={post.id} post={post} compact />
            ))}
          </div>
        )}

        {/* লেআউট ৩: হরাইজন্টাল লিস্ট ভিউ */}
        {layout === 2 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 6).map((post) => (
              <HorizontalPostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ========================================================
   মূল কালবেলা হোম সেকশন অর্কেস্ট্রেশন
   ======================================================== */
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

  // লিড নিউজ ও সাব-নিউজ
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
  const initialNow = Date.now()

  return (
    <div className="bg-[#fcfdfd] text-slate-800">
      
      {/* ==================== ১. কালবেলা লিড নিউজ সেকশন ==================== */}
      {isSectionVisible(sections, "general_news") && (
        <section id="general-news" className="border-b border-slate-200 py-5 sm:py-8 bg-white">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-end justify-between gap-4 border-b border-slate-200 pb-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#c8102e]">
                  মাভাবিপ্রবি সংবাদ
                </p>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  {settings.homeSections.sections.find((section) => section.key === "general_news")?.titleBn || "সর্বশেষ সংবাদ"}
                </h1>
              </div>
              <Link href="/news" className="shrink-0 text-xs font-bold text-[#c8102e] hover:underline">
                সব সংবাদ দেখুন →
              </Link>
            </div>

            {/* লিড নিউজ কার্ড (কালবেলা স্টাইল) */}
            {leadPost ? (
              <div className="grid gap-5 lg:grid-cols-12 items-start">
                <div className="lg:col-span-8">
                  <Link
                    href={`/post/${leadPost.id}`}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-[#c8102e]"
                  >
                    <KalbelaPostImage
                      src={leadPost.image_url}
                      alt={leadPost.title}
                      className="aspect-[16/9] max-h-[460px] w-full"
                      fit="cover"
                      zoomOnHover
                    />
                    <span className="block p-4 sm:p-5">
                      <span className="inline-block rounded-full bg-[#c8102e] px-2.5 py-0.5 text-[10px] font-bold text-white mb-2">
                        {leadPost.category || "প্রধান সংবাদ"}
                      </span>
                      <span className="block font-serif text-xl sm:text-3xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#c8102e]">
                        {leadPost.title}
                      </span>
                      {postExcerpt(leadPost) && (
                        <span className="mt-2 line-clamp-3 block text-xs sm:text-sm leading-relaxed text-slate-600">
                          {postExcerpt(leadPost)}
                        </span>
                      )}
                      <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5 text-[#c8102e]" />
                          <time dateTime={leadPost.created_at}>{formatBanglaDateTime(leadPost.created_at)}</time>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Newspaper className="size-3.5 text-[#c8102e]" />
                          <span>{leadPost.author?.trim() || "মাভাবিপ্রবি প্রতিনিধি"}</span>
                        </span>
                      </span>
                    </span>
                  </Link>
                </div>

                {/* লিড নিউজের ডানের ছোট সংবাদ তালিকা */}
                <div className="lg:col-span-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-xs">
                  <p className="px-2 py-1 font-serif text-sm font-bold text-slate-900 border-b border-slate-100 mb-1">
                    তাজা খবর
                  </p>
                  {remainingPosts.slice(0, 5).map((post) => (
                    <HorizontalPostRow key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* ৪টি গ্রিড কার্ডের দ্বিতীয় সারি */}
            {remainingPosts.length > 5 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {remainingPosts.slice(5, 9).map((post) => (
                  <GridPostCard key={post.id} post={post} compact />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* স্পন্সর ব্যানার ১ */}
      <AdSlot slot="home_mid_1" prefetchedAds={adBanners} />

      {/* ==================== ২. ১, ২, ৩... নাম্বারিং হেডলাইন তালিকা ==================== */}
      {isSectionVisible(sections, "events_popular") && (
        <NumberedHeadlines latestPosts={latestPosts} popularPosts={popular} />
      )}

      {/* ==================== ৩. ভিডিও ও ফটো স্টোরি ট্যাব ==================== */}
      {(isSectionVisible(sections, "stories") || isSectionVisible(sections, "reels")) && (
        <StoryMediaTabs
          stories={storiesWithViews}
          reels={reelsWithViews}
          showStories={isSectionVisible(sections, "stories")}
          showReels={isSectionVisible(sections, "reels")}
        />
      )}

      {/* ==================== ৪. অনলাইন জরিপ ও রিলস হাব ==================== */}
      {(isSectionVisible(sections, "polls") || isSectionVisible(sections, "reels")) && (
        <section className="border-b border-slate-200 py-6 sm:py-8 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-3 sm:px-6 lg:grid-cols-2 lg:px-8">
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

      {/* ==================== ৫. অনুষদ ও বিভাগ সার্চ ফিল্টার ==================== */}
      {isSectionVisible(sections, "departments") && (
        <section className="border-b border-slate-200 py-6 sm:py-8 bg-slate-50/60" aria-labelledby="department-quick-filter-title">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-[#c8102e]" aria-hidden="true" />
                <h2 id="department-quick-filter-title" className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  ক্যাম্পাস অনুষদ ও বিভাগসমূহ
                </h2>
              </div>
              <Link href="/administration" className="text-xs font-bold text-[#c8102e] hover:underline">
                প্রশাসন দেখুন →
              </Link>
            </div>
            <DepartmentQuickFilter faculties={faculties} posts={latestPosts} />
          </div>
        </section>
      )}

      {/* স্পন্সর ব্যানার ২ */}
      <AdSlot slot="home_mid_2" prefetchedAds={adBanners} />

      {/* ==================== ৬. ক্যাটাগরিভিত্তিক সংবাদ ব্লকসমূহ ==================== */}
      {isSectionVisible(sections, "category_sections") &&
        categoryBlocks.map((entry, index) => (
          <CategoryBlock key={entry.category} category={entry.category} posts={entry.posts} index={index} />
        ))}

      {/* ==================== ৭. কালবেলা ফটোগ্যালারি ==================== */}
      {isSectionVisible(sections, "general_news") && photoPosts.length > 0 && (
        <KalbelaPhotoGallery posts={photoPosts} />
      )}

      {/* ==================== ৮. কমিউনিটি ফিড, নোটিশ ও ক্লাব ==================== */}
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

      {/* ==================== ৯. টাইমলাইন, ফ্যাক্ট-চেক ও প্রকাশনা ==================== */}
      {(["social_sites", "timeline", "fact_check", "publications"] as const).map((key) => {
        const sectionConfig = sections.find((section) => section.key === key)
        if (!sectionConfig?.visible) return null
        return <HomepageTransitionSection key={key} kind={key} sectionConfig={sectionConfig} />
      })}
    </div>
  )
}
