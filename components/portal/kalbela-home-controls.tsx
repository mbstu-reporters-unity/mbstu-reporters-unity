"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FbReelsSection } from "./fb-reels-section"
import { FbStoriesTray } from "./fb-stories-tray"
import type { FacultyWithDepartments } from "@/lib/faculties"
import type { ReelItem } from "@/lib/reels"
import type { StoryItem } from "@/lib/stories"
import type { Post } from "@/lib/sb"

const bn = (value: number) => value.toLocaleString("bn-BD")

export function NumberedHeadlines({
  latestPosts,
  popularPosts,
}: {
  latestPosts: Post[]
  popularPosts: Post[]
}) {
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest")
  const posts = (activeTab === "latest" ? latestPosts : popularPosts).slice(0, 15)

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="numbered-headlines-title">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <h2 id="numbered-headlines-title" className="font-serif text-lg font-bold text-white sm:text-xl">
            {activeTab === "latest" ? "সর্বশেষ সংবাদ" : "জনপ্রিয় সংবাদ"}
          </h2>
          <div className="flex shrink-0 rounded-full border border-white/15 bg-black/10 p-1" role="tablist" aria-label="সংবাদ তালিকা">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "latest"}
              onClick={() => setActiveTab("latest")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "latest" ? "bg-cyan-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              সর্বশেষ
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "popular"}
              onClick={() => setActiveTab("popular")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "popular" ? "bg-cyan-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              জনপ্রিয়
            </button>
          </div>
        </div>

        {posts.length > 0 ? (
          <ol className="divide-y divide-white/10 px-4 sm:px-5">
            {posts.map((post, index) => (
              <li key={post.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-extrabold tabular-nums text-cyan-300">
                  {bn(index + 1)}
                </span>
                <Link
                  href={`/post/${post.id}`}
                  className="min-w-0 flex-1 text-sm font-bold leading-relaxed text-white transition-colors hover:text-cyan-300 sm:text-base"
                >
                  {post.title}
                  {post.category && (
                    <span className="ml-2 inline-block text-[10px] font-semibold text-slate-400">
                      {post.category}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-400" role="status">
            এই তালিকায় এখনো কোনো সংবাদ নেই।
          </p>
        )}

        <Link
          href="/news"
          className="flex w-full items-center justify-center border-t border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-white/10 hover:text-white"
        >
          সর্বশেষ সব খবর
        </Link>
      </div>
    </section>
  )
}

export function DepartmentQuickFilter({
  faculties,
}: {
  faculties: FacultyWithDepartments[]
}) {
  const router = useRouter()
  const departments = faculties.flatMap((faculty) =>
    faculty.departments.map((department) => ({
      id: department.id,
      faculty: faculty.name,
      name: department.name,
    }))
  )

  return (
    <label className="block min-w-0">
      <span className="sr-only">অনুষদ বা বিভাগ নির্বাচন করুন</span>
      <select
        defaultValue=""
        disabled={departments.length === 0}
        onChange={(event) => {
          if (event.target.value) router.push(`/department/${encodeURIComponent(event.target.value)}`)
        }}
        className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>
          {departments.length ? "অনুষদ / বিভাগ বেছে নিন" : "এখনো বিভাগ যুক্ত হয়নি"}
        </option>
        {faculties.map((faculty) => (
          <optgroup key={faculty.id} label={faculty.name}>
            {faculty.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

export function StoryMediaTabs({
  stories,
  reels,
  showStories,
  showReels,
}: {
  stories: StoryItem[]
  reels: ReelItem[]
  showStories: boolean
  showReels: boolean
}) {
  const photoStories = stories.filter((story) => story.media_type === "image")
  const hasVideos = showReels && reels.length > 0
  const hasPhotos = showStories && photoStories.length > 0
  const [activeTab, setActiveTab] = useState<"video" | "photo">(hasVideos ? "video" : "photo")

  if (!hasVideos && !hasPhotos) return null

  return (
    <section id="video-photo-stories" className="border-b border-white/10 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">ভিডিও স্টোরি ও ফটো স্টোরি</h2>
          <div className="flex gap-2" role="tablist" aria-label="ভিডিও ও ফটো স্টোরি">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "video"}
              disabled={!hasVideos}
              onClick={() => setActiveTab("video")}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === "video" ? "border-cyan-500 bg-cyan-600 text-white" : "border-white/20 text-slate-300"
              }`}
            >
              🎬 ভিডিও স্টোরি
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "photo"}
              disabled={!hasPhotos}
              onClick={() => setActiveTab("photo")}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === "photo" ? "border-cyan-500 bg-cyan-600 text-white" : "border-white/20 text-slate-300"
              }`}
            >
              🖼️ ফটো স্টোরি
            </button>
          </div>
        </div>

        {activeTab === "video" && hasVideos ? (
          <FbReelsSection
            standalone
            showHeading={false}
            sectionId="video-stories"
            displayMode="portrait"
            prefetchedReels={reels}
          />
        ) : hasPhotos ? (
          <FbStoriesTray
            standalone
            showHeading={false}
            hideAddStory
            portrait
            prefetchedStories={photoStories}
          />
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400" role="status">
            এই মুহূর্তে কোনো স্টোরি নেই।
          </p>
        )}
      </div>
    </section>
  )
}
