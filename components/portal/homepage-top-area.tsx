"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CAT_CLUB, CAT_STUDENT, type Post } from "@/lib/sb"
import type { HomeSectionConfig } from "@/lib/site-settings"
import { HomepageFeedRotator } from "./homepage-feed-rotator"
import { SectionHeading } from "./section-heading"

type TopAreaTab = "latest" | "corners" | "features" | "editorial" | "opinion"

const tabs: Array<{ key: TopAreaTab; label: string }> = [
  { key: "latest", label: "সর্বশেষ সংবাদ" },
  { key: "corners", label: "কর্নার" },
  { key: "features", label: "ফিচার" },
  { key: "editorial", label: "সম্পাদকীয়" },
  { key: "opinion", label: "মতামত" },
]

function matchesCategory(post: Post, pattern: RegExp): boolean {
  return pattern.test(post.category || "")
}

export function HomepageTopArea({
  posts,
  visibleCategories,
  limit,
  sectionConfig,
  initialNow,
}: {
  posts: Post[]
  visibleCategories: string[]
  limit: number
  sectionConfig?: HomeSectionConfig
  initialNow: number
}) {
  const [activeTab, setActiveTab] = useState<TopAreaTab>("latest")
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

  const displayPosts = tabPosts.slice(0, Math.max(1, limit || 12))

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

        {displayPosts.length ? (
          <HomepageFeedRotator
            posts={displayPosts}
            title={tabs.find((tab) => tab.key === activeTab)?.label}
            initialNow={initialNow}
          />
        ) : (
          <p className="glass-card p-5 text-sm text-slate-200" role="status">
            এই বিভাগে এখনো কোনো সংবাদ নেই।
          </p>
        )}
      </div>
    </section>
  )
}
