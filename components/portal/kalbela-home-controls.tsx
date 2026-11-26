"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, Images, Search } from "lucide-react"
import { FbReelsSection } from "./fb-reels-section"
import { FbStoriesTray } from "./fb-stories-tray"
import type { FacultyWithDepartments } from "@/lib/faculties"
import { BRANCHES } from "@/lib/notices"
import type { ReelItem } from "@/lib/reels"
import type { StoryItem } from "@/lib/stories"
import { CAT_CAMPUS, type Post } from "@/lib/sb"

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
      <div className="overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--theme-card-border)] px-4 py-3 sm:px-5">
          <h2 id="numbered-headlines-title" className="font-serif text-lg font-bold text-[var(--theme-text-title)] sm:text-xl">
            {activeTab === "latest" ? "সর্বশেষ সংবাদ" : "জনপ্রিয় সংবাদ"}
          </h2>
          <div className="flex shrink-0 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] p-1" role="tablist" aria-label="সংবাদ তালিকা">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "latest"}
              onClick={() => setActiveTab("latest")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "latest"
                  ? "bg-[var(--theme-brand)] text-[var(--theme-bg-solid)]"
                  : "text-[var(--theme-text-body)] hover:text-[var(--theme-brand)]"
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
                activeTab === "popular"
                  ? "bg-[var(--theme-brand)] text-[var(--theme-bg-solid)]"
                  : "text-[var(--theme-text-body)] hover:text-[var(--theme-brand)]"
              }`}
            >
              জনপ্রিয়
            </button>
          </div>
        </div>

        {posts.length > 0 ? (
          <ol className="divide-y divide-[var(--theme-card-border)] px-4 sm:px-5">
            {posts.map((post, index) => (
              <li key={post.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-extrabold tabular-nums text-[var(--theme-text-body)]">
                  {bn(index + 1)}
                </span>
                <Link
                  href={`/post/${post.id}`}
                  className="min-w-0 flex-1 text-sm font-bold leading-relaxed text-[var(--theme-text-title)] transition-colors hover:text-[var(--theme-brand)] sm:text-base"
                >
                  {post.title}
                  {post.category && (
                    <span className="ml-2 inline-block text-[10px] font-semibold text-[var(--theme-text-body)]">
                      {post.category}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-[var(--theme-text-body)]" role="status">
            এই তালিকায় এখনো কোনো সংবাদ নেই।
          </p>
        )}

        <Link
          href="/news"
          className="flex w-full items-center justify-center border-t border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-4 py-3 text-sm font-bold text-[var(--theme-brand)] transition hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-brand-dark)]"
        >
          সর্বশেষ সব খবর
        </Link>
      </div>
    </section>
  )
}

export function DepartmentQuickFilter({
  faculties,
  posts,
}: {
  faculties: FacultyWithDepartments[]
  posts: Post[]
}) {
  const [facultyId, setFacultyId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [branch, setBranch] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const selectedFaculty = faculties.find((faculty) => faculty.id === facultyId)
  const selectedDepartment = selectedFaculty?.departments.find(
    (department) => department.id === departmentId
  )
  const branchLabel = BRANCHES.find((entry) => entry.key === branch)?.bn
  const campusPosts = posts.filter(
    (post) =>
      post.category === CAT_CAMPUS ||
      /ক্যাম্পাস|একাডেমিক|শিক্ষা|বিভাগ|academic|campus|faculty|department/i.test(post.category || "")
  )
  const searchablePosts = hasSearched
    ? posts.filter((post) => {
        const searchableText = [
          post.title,
          post.heading,
          post.summary,
          post.body?.replace(/<[^>]*>/g, " "),
          post.category,
          ...(post.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
        const departmentTerms = [selectedDepartment?.name, selectedDepartment?.code].filter(
          (value): value is string => Boolean(value)
        )
        const departmentMatches = selectedDepartment
          ? departmentTerms.some((value) => searchableText.includes(value.toLocaleLowerCase()))
          : !selectedFaculty || searchableText.includes(selectedFaculty.name.toLocaleLowerCase())
        const branchMatches =
          !branchLabel || searchableText.includes(branchLabel.toLocaleLowerCase())
        return departmentMatches && branchMatches
      }).slice(0, 4)
    : campusPosts.slice(0, 4)

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setHasSearched(true)
        }}
        className="rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <label className="min-w-0">
            <span className="sr-only">অনুষদ নির্বাচন করুন</span>
            <select
              value={facultyId}
              onChange={(event) => {
                setFacultyId(event.target.value)
                setDepartmentId("")
                setHasSearched(false)
              }}
              className="w-full rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] px-3 py-2.5 text-sm font-semibold text-[var(--theme-text-title)] outline-none focus:border-sky-600"
            >
              <option value="">অনুষদ / ফ্যাকাল্টি</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="sr-only">বিভাগ নির্বাচন করুন</span>
            <select
              value={departmentId}
              disabled={!selectedFaculty || selectedFaculty.departments.length === 0}
              onChange={(event) => {
                setDepartmentId(event.target.value)
                setHasSearched(false)
              }}
              className="w-full rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] px-3 py-2.5 text-sm font-semibold text-[var(--theme-text-title)] outline-none focus:border-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {!selectedFaculty
                  ? "আগে অনুষদ বাছুন"
                  : selectedFaculty.departments.length
                    ? "বিভাগ / দপ্তর"
                    : "এই অনুষদে বিভাগ পাওয়া যায়নি"}
              </option>
              {selectedFaculty?.departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="sr-only">হল বা শাখা নির্বাচন করুন</span>
            <select
              value={branch}
              onChange={(event) => {
                setBranch(event.target.value)
                setHasSearched(false)
              }}
              className="w-full rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] px-3 py-2.5 text-sm font-semibold text-[var(--theme-text-title)] outline-none focus:border-sky-600"
            >
              <option value="">হল / শাখা</option>
              {BRANCHES.map((entry) => (
                <option key={entry.key} value={entry.key}>{entry.bn}</option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 lg:col-span-1"
          >
            <Search className="size-4" aria-hidden="true" />
            সার্চ
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--theme-text-muted)]">
          প্রকাশিত সংবাদে শিরোনাম, বিভাগ, সারাংশ ও ট্যাগ মিলিয়ে ফলাফল দেখানো হবে।
        </p>
      </form>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[var(--theme-text-title)]">
          {hasSearched ? "ফিল্টারের ফলাফল" : "সাম্প্রতিক ক্যাম্পাস সংবাদ"}
        </h3>
        {searchablePosts.length ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {searchablePosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group min-w-0 overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm transition hover:shadow-md"
              >
                <span className="block">
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt="" className="aspect-[16/10] w-full bg-slate-50 object-contain" loading="lazy" />
                  ) : (
                    <span className="flex aspect-[16/10] items-center justify-center bg-[var(--theme-brand-soft)] text-[var(--theme-brand)]">
                      <Images className="size-7" aria-hidden="true" />
                    </span>
                  )}
                  <span className="block p-3">
                    <span className="line-clamp-2 block text-sm font-bold leading-snug text-[var(--theme-text-title)] transition-colors group-hover:text-[var(--theme-brand)]">
                      {post.title}
                    </span>
                    <span className="mt-2 block truncate text-[11px] font-semibold text-[var(--theme-brand)]">
                      {post.category || "ক্যাম্পাস সংবাদ"}
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 text-sm text-[var(--theme-text-body)]" role="status">
            এই ফিল্টারে কোনো সংবাদ পাওয়া যায়নি। অন্য অনুষদ, বিভাগ বা শাখা বেছে দেখুন।
          </p>
        )}
      </div>
    </div>
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
    <section id="video-photo-stories" className="border-b border-[var(--theme-card-border)] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Camera className="size-5 text-rose-600" aria-hidden="true" />
            <h2 className="font-serif text-xl font-bold text-[var(--theme-text-title)] sm:text-2xl">
              ভিডিও ও ফটো স্টোরি
            </h2>
          </div>
          <div className="flex border-b border-[var(--theme-card-border)]" role="tablist" aria-label="ভিডিও ও ফটো স্টোরি">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "video"}
              disabled={!hasVideos}
              onClick={() => setActiveTab("video")}
              className={`inline-flex items-center gap-1.5 border-b-[2.5px] px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === "video"
                  ? "border-[#c8102e] text-[#c8102e]"
                  : "border-transparent text-[var(--theme-text-body)] hover:text-[#c8102e]"
              }`}
            >
              <Camera className="size-4" aria-hidden="true" />
              ভিডিও স্টোরি
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "photo"}
              disabled={!hasPhotos}
              onClick={() => setActiveTab("photo")}
              className={`inline-flex items-center gap-1.5 border-b-[2.5px] px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === "photo"
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-[var(--theme-text-body)] hover:text-sky-700"
              }`}
            >
              <Images className="size-4" aria-hidden="true" />
              ফটো স্টোরি
            </button>
          </div>
        </div>

        {activeTab === "video" && hasVideos ? (
          <FbReelsSection
            standalone
            showHeading={false}
            sectionId="video-stories"
            displayMode="portrait"
            newspaper
            prefetchedReels={reels}
          />
        ) : hasPhotos ? (
          <FbStoriesTray
            standalone
            showHeading={false}
            hideAddStory
            portrait
            newspaper
            prefetchedStories={photoStories}
          />
        ) : (
          <p className="rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] px-4 py-6 text-center text-sm text-[var(--theme-text-body)]" role="status">
            এই মুহূর্তে কোনো স্টোরি নেই।
          </p>
        )}
      </div>
    </section>
  )
}
