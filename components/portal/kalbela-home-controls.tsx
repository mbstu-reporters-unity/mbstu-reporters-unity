"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, Images, Search, TrendingUp, Clock3 } from "lucide-react"
import { FbReelsSection } from "./fb-reels-section"
import { FbStoriesTray } from "./fb-stories-tray"
import type { FacultyWithDepartments } from "@/lib/faculties"
import { BRANCHES } from "@/lib/notices"
import type { ReelItem } from "@/lib/reels"
import type { StoryItem } from "@/lib/stories"
import { CAT_CAMPUS, type Post } from "@/lib/sb"

const bn = (value: number) => value.toLocaleString("bn-BD")

/* ========================================================
   ১. কালবেলা ১, ২, ৩... নাম্বারিং তালিকা (সর্বশেষ ও জনপ্রিয়)
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
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6" aria-labelledby="numbered-headlines-title">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* কালবেলা স্টাইল ট্যাব হেডার */}
        <div className="flex items-center gap-6 border-b border-slate-200 px-4 sm:px-6 pt-3">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "latest"}
            onClick={() => setActiveTab("latest")}
            className={`pb-3 font-serif text-base sm:text-lg font-bold transition-all relative cursor-pointer ${
              activeTab === "latest"
                ? "text-[#c8102e] border-b-2 border-[#c8102e]"
                : "text-slate-700 hover:text-[#c8102e]"
            }`}
          >
            সর্বশেষ
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "popular"}
            onClick={() => setActiveTab("popular")}
            className={`pb-3 font-serif text-base sm:text-lg font-bold transition-all relative cursor-pointer ${
              activeTab === "popular"
                ? "text-[#c8102e] border-b-2 border-[#c8102e]"
                : "text-slate-700 hover:text-[#c8102e]"
            }`}
          >
            জনপ্রিয়
          </button>
        </div>

        {/* কালবেলা স্টাইল বৃত্তাকার নাম্বারিং তালিকা */}
        {posts.length > 0 ? (
          <ol className="divide-y divide-slate-100 px-3 sm:px-5">
            {posts.map((post, index) => (
              <li key={post.id} className="flex items-start gap-3 sm:gap-4 py-3 sm:py-3.5 hover:bg-slate-50/80 transition-colors rounded-xl px-1.5">
                <span className="mt-0.5 flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-bold tabular-nums text-slate-700">
                  {bn(index + 1)}
                </span>
                <Link
                  href={`/post/${post.id}`}
                  className="min-w-0 flex-1 font-serif text-sm sm:text-base font-bold leading-snug text-slate-900 transition-colors hover:text-[#c8102e]"
                >
                  {post.category && (
                    <span className="text-[#c8102e] font-semibold mr-1.5 inline-block">
                      {post.category} /
                    </span>
                  )}
                  <span>{post.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-500" role="status">
            এই তালিকায় এখনো কোনো সংবাদ নেই।
          </p>
        )}

        <Link
          href="/news"
          className="flex w-full items-center justify-center border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-xs sm:text-sm font-bold text-[#c8102e] transition hover:bg-slate-100"
        >
          সব সংবাদ দেখুন →
        </Link>
      </div>
    </section>
  )
}

/* ========================================================
   ২. অনুষদ ও বিভাগ সার্চ ফিল্টার বক্স
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

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setHasSearched(true)
        }}
        className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#c8102e] focus:bg-white"
            >
              <option value="">অনুষদ / ফ্যাকাল্টি</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#c8102e] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {!selectedFaculty
                  ? "আগে অনুষদ বাছুন"
                  : selectedFaculty.departments.length
                    ? "বিভাগ / দপ্তর"
                    : "বিভাগ পাওয়া যায়নি"}
              </option>
              {selectedFaculty?.departments.map((department) => (
                <option key={department.id} value={department.id}>
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#c8102e] focus:bg-white"
            >
              <option value="">হল / শাখা</option>
              {BRANCHES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.bn}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#c8102e] hover:bg-[#a50d25] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition lg:col-span-1 cursor-pointer active:scale-95"
          >
            <Search className="size-4" aria-hidden="true" />
            সার্চ
          </button>
        </div>
      </form>

      {/* সার্চের ফলাফল গ্রিড */}
      {searchablePosts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {searchablePosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:border-[#c8102e]"
            >
              <span className="block aspect-[16/10] overflow-hidden bg-slate-100">
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-slate-400">
                    <Images className="size-7" />
                  </span>
                )}
              </span>
              <span className="block p-2.5 sm:p-3">
                <span className="line-clamp-2 block font-serif text-xs sm:text-sm font-bold leading-snug text-slate-900 group-hover:text-[#c8102e] transition-colors">
                  {post.title}
                </span>
                <span className="mt-1.5 block text-[10px] font-semibold text-[#c8102e]">
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
    <section id="video-photo-stories" className="border-b border-slate-200 py-6 sm:py-8 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#c8102e]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                activeTab === "video"
                  ? "bg-[#c8102e] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                activeTab === "photo"
                  ? "bg-[#c8102e] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
