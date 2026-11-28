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

/* ========================================================
   ১. নাম্বারিং হেডলাইন তালিকা (সর্বশেষ ও জনপ্রিয়)
   ======================================================== */
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
    <section
      className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
      aria-labelledby="numbered-headlines-title"
    >
      <div className="glass-card overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm">
        <div
          id="numbered-headlines-title"
          className="flex items-center gap-6 border-b border-[var(--theme-card-border)] px-4 pt-3 sm:px-6"
          role="tablist"
          aria-label="সংবাদ তালিকা"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "latest"}
            onClick={() => setActiveTab("latest")}
            className={`relative cursor-pointer pb-3 font-serif text-base font-bold transition-all sm:text-lg ${
              activeTab === "latest"
                ? "border-b-2 border-[var(--theme-brand)] text-[var(--theme-brand)]"
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
            className={`relative cursor-pointer pb-3 font-serif text-base font-bold transition-all sm:text-lg ${
              activeTab === "popular"
                ? "border-b-2 border-[var(--theme-brand)] text-[var(--theme-brand)]"
                : "text-[var(--theme-text-body)] hover:text-[var(--theme-brand)]"
            }`}
          >
            জনপ্রিয়
          </button>
        </div>

        {posts.length > 0 ? (
          <ol className="divide-y divide-[var(--theme-card-border)] px-3 sm:px-5">
            {posts.map((post, index) => (
              <li
                key={post.id}
                className="flex items-start gap-3 rounded-xl px-1.5 py-3 transition-colors hover:bg-[var(--theme-brand-soft)] sm:gap-4 sm:py-3.5"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-xs font-bold tabular-nums text-[var(--theme-brand)] sm:size-8 sm:text-sm">
                  {bn(index + 1)}
                </span>
                <Link
                  href={`/post/${post.id}`}
                  className="min-w-0 flex-1 font-serif text-sm font-bold leading-snug text-[var(--theme-text-title)] transition-colors hover:text-[var(--theme-brand)] sm:text-base"
                >
                  {post.category && (
                    <span className="mr-1.5 inline-block font-semibold text-[var(--theme-brand)]">
                      {post.category} /
                    </span>
                  )}
                  <span>{post.title}</span>
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
          className="flex w-full items-center justify-center border-t border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-4 py-3 text-xs font-bold text-[var(--theme-brand)] transition hover:opacity-90 sm:text-sm"
        >
          সব সংবাদ দেখুন →
        </Link>
      </div>
    </section>
  )
}

/* ========================================================
   ২. অনুষদ ও বিভাগ সার্চ ফিল্টার বক্স (মোবাইল নেটিভ <select> কনট্রাস্টসহ)
   ======================================================== */
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
    ? posts
        .filter((post) => {
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
        })
        .slice(0, 4)
    : campusPosts.slice(0, 4)

  const selectClass =
    "w-full rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] px-3 py-2 text-xs font-semibold text-[var(--theme-text-title)] outline-none focus:border-[var(--theme-brand)] sm:text-sm"
  const optionClass = "bg-[var(--theme-bg-solid)] text-[var(--theme-text-title)]"

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setHasSearched(true)
        }}
        className="glass-card rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-3.5 shadow-xs sm:p-5"
      >
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          <label className="min-w-0">
            <span className="sr-only">অনুষদ নির্বাচন করুন</span>
            <select
              value={facultyId}
              onChange={(event) => {
                setFacultyId(event.target.value)
                setDepartmentId("")
                setHasSearched(false)
              }}
              className={selectClass}
            >
              <option value="" className={optionClass}>
                অনুষদ / ফ্যাকাল্টি
              </option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id} className={optionClass}>
                  {faculty.name}
                </option>
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
              className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="" className={optionClass}>
                {!selectedFaculty
                  ? "আগে অনুষদ বাছুন"
                  : selectedFaculty.departments.length
                    ? "বিভাগ / দপ্তর"
                    : "বিভাগ পাওয়া যায়নি"}
              </option>
              {selectedFaculty?.departments.map((department) => (
                <option key={department.id} value={department.id} className={optionClass}>
                  {department.name}
                </option>
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
              className={selectClass}
            >
              <option value="" className={optionClass}>
                হল / শাখা
              </option>
              {BRANCHES.map((entry) => (
                <option key={entry.key} value={entry.key} className={optionClass}>
                  {entry.bn}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="col-span-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--theme-brand)] px-4 py-2 text-xs font-bold text-[var(--theme-brand-contrast,#ffffff)] shadow-xs transition hover:bg-[var(--theme-brand-dark)] active:scale-95 sm:text-sm lg:col-span-1"
          >
            <Search className="size-4" aria-hidden="true" />
            সার্চ
          </button>
        </div>
      </form>

      {searchablePosts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {searchablePosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="glass-card group min-w-0 overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-xs transition hover:border-[var(--theme-brand)]"
            >
              <span className="block aspect-[16/10] overflow-hidden bg-slate-900/20">
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-[var(--theme-text-body)] opacity-50">
                    <Images className="size-7" />
                  </span>
                )}
              </span>
              <span className="block p-2.5 sm:p-3">
                <span className="line-clamp-2 block font-serif text-xs font-bold leading-snug text-[var(--theme-text-title)] transition-colors group-hover:text-[var(--theme-brand)] sm:text-sm">
                  {post.title}
                </span>
                <span className="mt-1.5 block text-[10px] font-semibold text-[var(--theme-brand)]">
                  {post.category || "ক্যাম্পাস"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========================================================
   ৩. ভিডিও ও ফটো স্টোরি ট্যাব
   ======================================================== */
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
    <section
      id="video-photo-stories"
      className="border-b border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] py-6 sm:py-8"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--theme-card-border)] pb-2">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[var(--theme-brand)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--theme-text-title)] sm:text-xl">
              ভিডিও ও ফটো স্টোরি
            </h2>
          </div>
          <div className="flex gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "video"}
              disabled={!hasVideos}
              onClick={() => setActiveTab("video")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-40 ${
                activeTab === "video"
                  ? "bg-[var(--theme-brand)] text-[var(--theme-brand-contrast,#ffffff)] shadow-xs"
                  : "border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] hover:bg-[var(--theme-brand-soft)]"
              }`}
            >
              <Camera className="size-3.5" aria-hidden="true" />
              ভিডিও
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "photo"}
              disabled={!hasPhotos}
              onClick={() => setActiveTab("photo")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-40 ${
                activeTab === "photo"
                  ? "bg-[var(--theme-brand)] text-[var(--theme-brand-contrast,#ffffff)] shadow-xs"
                  : "border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] hover:bg-[var(--theme-brand-soft)]"
              }`}
            >
              <Images className="size-3.5" aria-hidden="true" />
              ফটো
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
        ) : null}
      </div>
    </section>
  )
}
