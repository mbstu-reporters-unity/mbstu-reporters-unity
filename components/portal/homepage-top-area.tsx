"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Bell, Clock3, TrendingUp } from "lucide-react"
import { BRANCHES, type Notice } from "@/lib/notices"
import { CAT_CLUB, CAT_STUDENT, type Post } from "@/lib/sb"
import type { HomeSectionConfig } from "@/lib/site-settings"
import { NewsCard } from "./news-card"
import { SectionHeading } from "./section-heading"

type TopAreaTab = "latest" | "corners" | "features" | "editorial" | "opinion"
type HeadlineTab = "latest" | "popular" | "notices"

const tabs: Array<{ key: TopAreaTab; label: string }> = [
  { key: "latest", label: "সর্বশেষ সংবাদ" },
  { key: "corners", label: "কর্নার" },
  { key: "features", label: "ফিচার" },
  { key: "editorial", label: "সম্পাদকীয়" },
  { key: "opinion", label: "মতামত" },
]

const headlineTabs: Array<{ key: HeadlineTab; label: string; Icon: typeof Clock3 }> = [
  { key: "latest", label: "সর্বশেষ", Icon: Clock3 },
  { key: "popular", label: "সর্বাধিক পঠিত", Icon: TrendingUp },
  { key: "notices", label: "নোটিশ", Icon: Bell },
]

function matchesCategory(post: Post, pattern: RegExp): boolean {
  return pattern.test(post.category || "")
}

function formatHeadlineDate(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Dhaka",
  })
}

function HeadlineItem({
  href,
  title,
  imageUrl,
  date,
  detail,
}: {
  href: string
  title: string
  imageUrl?: string | null
  date: string
  detail: string
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-3 rounded-xl p-2 transition hover:bg-white/10"
    >
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900/40">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-[10px] font-bold text-slate-400">সংবাদ</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-sm font-bold leading-snug text-white">{title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[10px] text-slate-300">
          <span className="truncate">{detail}</span>
          {date && (
            <>
              <span aria-hidden="true">·</span>
              <time className="shrink-0">{date}</time>
            </>
          )}
        </span>
      </span>
    </Link>
  )
}

export function HomepageTopArea({
  posts,
  popularPosts,
  notices,
  visibleCategories,
  sectionConfig,
}: {
  posts: Post[]
  popularPosts: Post[]
  notices: Notice[]
  visibleCategories: string[]
  sectionConfig?: HomeSectionConfig
}) {
  const [activeTab, setActiveTab] = useState<TopAreaTab>("latest")
  const [activeHeadlineTab, setActiveHeadlineTab] = useState<HeadlineTab>("latest")
  const visibleCategorySet = useMemo(
    () => new Set(visibleCategories.map((category) => category.trim().toLocaleLowerCase())),
    [visibleCategories]
  )

  const categorizedPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          !post.page_id &&
          post.category !== CAT_CLUB &&
          (!post.category || visibleCategorySet.has(post.category.trim().toLocaleLowerCase()))
      ),
    [posts, visibleCategorySet]
  )

  const tabPosts = useMemo(() => {
    switch (activeTab) {
      case "corners":
        return categorizedPosts.filter(
          (post) => post.category === CAT_STUDENT || matchesCategory(post, /corner|কর্নার|শিক্ষার্থী|student/i)
        )
      case "features":
        return categorizedPosts.filter((post) => matchesCategory(post, /feature|ফিচার|বিশেষ প্রতিবেদন/i))
      case "editorial":
        return categorizedPosts.filter(
          (post) => post.author_user_type === "teacher" || matchesCategory(post, /editorial|সম্পাদক/i)
        )
      case "opinion":
        return categorizedPosts.filter(
          (post) =>
            post.author_user_type !== "teacher" &&
            matchesCategory(post, /editorial|opinion|সম্পাদক|মতামত|মুক্তমত|ফিচার|feature|কলাম|বিশ্লেষণ|সদস্যদের লেখা/i)
        )
      default:
        return categorizedPosts.filter((post) => post.category !== CAT_STUDENT)
    }
  }, [activeTab, categorizedPosts])

  const displayPosts = tabPosts.slice(0, 5)
  const headlineItems =
    activeHeadlineTab === "popular"
      ? popularPosts.slice(0, 6).map((post) => ({
          id: post.id,
          href: `/post/${post.id}`,
          title: post.title,
          imageUrl: post.image_url,
          date: formatHeadlineDate(post.created_at),
          detail: post.category || "ক্যাম্পাস সংবাদ",
        }))
      : activeHeadlineTab === "notices"
        ? notices.slice(0, 6).map((notice) => ({
            id: notice.id,
            href: `/notices?n=${encodeURIComponent(notice.id)}`,
            title: notice.title,
            imageUrl: notice.image_urls?.[0],
            date: formatHeadlineDate(notice.created_at),
            detail: BRANCHES.find((branch) => branch.key === notice.branch)?.bn || notice.branch,
          }))
        : categorizedPosts.slice(0, 6).map((post) => ({
            id: post.id,
            href: `/post/${post.id}`,
            title: post.title,
            imageUrl: post.image_url,
            date: formatHeadlineDate(post.created_at),
            detail: post.category || "ক্যাম্পাস সংবাদ",
          }))

  return (
    <section id="general-news" className="relative border-b border-white/10 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          inverted
          eyebrow={sectionConfig?.eyebrow || "Campus News"}
          title={sectionConfig?.titleBn || "সর্বশেষ সংবাদ"}
          titleEn={sectionConfig?.titleEn || "Latest Campus Reports"}
          subtitle={sectionConfig?.subtitleBn || "সংবাদ, কর্নার, ফিচার, সম্পাদকীয় ও মতামত এক জায়গায়।"}
          subtitleEn={sectionConfig?.subtitleEn || "Latest news, features, editorials and student voices."}
          action={
            <Link
              href="/news"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
            >
              সব সংবাদ দেখুন
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="সংবাদ বিভাগ">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.key
                  ? "border-cyan-500 bg-cyan-600 text-white"
                  : "border-white/20 bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            {displayPosts.length ? (
              <>
                <NewsCard p={displayPosts[0]} />
                {displayPosts.length > 1 && (
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {displayPosts.slice(1, 5).map((post) => (
                      <NewsCard key={post.id} p={post} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="glass-card p-5 text-sm text-slate-200" role="status">
                এই বিভাগে এখনো কোনো সংবাদ নেই।
              </p>
            )}
          </div>

          <aside className="glass-card min-w-0 border border-white/15 p-4 text-white lg:col-span-4">
            <h3 className="mb-4 font-serif text-lg font-bold">তাজা খবর ও নোটিশ</h3>
            <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-black/15 p-1" role="tablist" aria-label="তাজা খবর, জনপ্রিয় সংবাদ ও নোটিশ">
              {headlineTabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeHeadlineTab === key}
                  aria-controls="homepage-headlines"
                  onClick={() => setActiveHeadlineTab(key)}
                  className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[10px] font-bold transition sm:text-xs ${
                    activeHeadlineTab === key
                      ? "bg-cyan-600 text-white shadow"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
            {headlineItems.length ? (
              <div id="homepage-headlines" role="tabpanel" className="divide-y divide-white/10">
                {headlineItems.map((item) => (
                  <HeadlineItem key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <p id="homepage-headlines" role="tabpanel" className="rounded-xl bg-white/5 p-4 text-sm text-slate-300">
                {activeHeadlineTab === "notices" ? "এখন কোনো নোটিশ নেই।" : "এখনো কোনো সংবাদ নেই।"}
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
