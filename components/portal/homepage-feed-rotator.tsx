"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowLeft, ArrowRight, ExternalLink, FileText, Pin } from "lucide-react"
import type { Post } from "@/lib/sb"
import { buildHomepageRotation, selectHomepageItems } from "@/lib/homepage-feed"
import { BRANCHES, downloadUrl, isImageType, type Notice } from "@/lib/notices"
import { NewsGrid } from "./news-card"
import NoticeMediaPreview from "./notice-media-preview"
import { useHomepageAutoplay } from "./use-homepage-autoplay"
import { useHomepageAging } from "./use-homepage-aging"

type FeedEntry =
  | { id: string; kind: "post"; activityAt: string; post: Post }
  | { id: string; kind: "notice"; activityAt: string; notice: Notice }

function isSafeUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value)
}

function noticeActivityAt(notice: Notice): string {
  return notice.updated_at || notice.created_at
}

function NoticeFeedCard({ notice }: { notice: Notice }) {
  const updated = !!notice.updated_at && notice.updated_at !== notice.created_at
  const branch = BRANCHES.find((entry) => entry.key === notice.branch)?.bn || notice.branch
  const imageUrls = (notice.image_urls || []).slice(0, 3)

  return (
    <article className="overflow-hidden border-y border-white/15 bg-transparent p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold text-cyan-200">
          {branch}
        </span>
        {notice.is_pinned && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[11px] font-bold text-amber-200">
            <Pin className="size-3" aria-hidden="true" />
            পিন করা
          </span>
        )}
        {notice.ref_number && (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 font-mono text-[11px] text-slate-200">
            <FileText className="size-3" aria-hidden="true" />
            {notice.ref_number}
          </span>
        )}
      </div>

      <Link
        href={`/notices?n=${encodeURIComponent(notice.id)}`}
        className="mt-4 block font-serif text-xl font-bold text-white transition-colors hover:text-cyan-200 sm:text-2xl"
      >
        {notice.title}
      </Link>
      {notice.heading && <p className="mt-1 text-sm font-semibold text-cyan-100">{notice.heading}</p>}
      {notice.body && <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-slate-200">{notice.body}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/15 pt-3 text-xs text-slate-300">
        <time dateTime={notice.created_at}>
          প্রকাশিত: {new Date(notice.created_at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" })}
        </time>
        {updated && notice.updated_at && (
          <time dateTime={notice.updated_at}>
            হালনাগাদ: {new Date(notice.updated_at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" })}
          </time>
        )}
        {notice.show_name && notice.poster_name && <span>{notice.poster_name}</span>}
        {notice.expires_at && (
          <span>মেয়াদ: {new Date(notice.expires_at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" })}</span>
        )}
      </div>

      {(imageUrls.length > 0 || notice.file_url) && (
        <div className="-mx-5 mt-4 sm:-mx-7">
          <NoticeMediaPreview
            title={notice.title}
            imageUrls={imageUrls}
            layout="stack"
            fileUrl={notice.file_url}
            fileName={notice.file_name}
            fileType={notice.file_type}
            postDate={notice.created_at}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {notice.file_url && isSafeUrl(notice.file_url) && (
          <a
            href={downloadUrl(notice.file_url, notice.file_name)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-700 px-4 py-2 text-xs font-bold text-white"
          >
            <ArrowDownToLine className="size-3.5" aria-hidden="true" />
            {notice.file_name || "ফাইল ডাউনলোড"}
          </a>
        )}
        {isSafeUrl(notice.link_url) && (
          <a
            href={notice.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            নোটিশ লিংক
          </a>
        )}
        {isSafeUrl(notice.embed_media_url) && (
          <a
            href={notice.embed_media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            সংযুক্ত মিডিয়া
          </a>
        )}
      </div>
    </article>
  )
}

export function HomepageFeedRotator({
  posts,
  notices = [],
  title,
  initialIndex = 0,
  initialNow,
}: {
  posts: Post[]
  notices?: Notice[]
  title?: string
  initialIndex?: number
  initialNow: number
}) {
  const timestamps = useMemo(
    () => [
      ...posts.map((post) => post.created_at),
      ...notices.map(noticeActivityAt),
    ],
    [posts, notices]
  )
  const now = useHomepageAging(timestamps, initialNow)
  const currentPosts = useMemo(
    () => selectHomepageItems(posts, (post) => post.created_at, now),
    [posts, now]
  )
  const currentNotices = useMemo(
    () => selectHomepageItems(notices, noticeActivityAt, now),
    [notices, now]
  )
  const entries = useMemo<FeedEntry[]>(
    () => [
      ...currentPosts.map((post) => ({
        id: `post:${post.id}`,
        kind: "post" as const,
        activityAt: post.created_at,
        post,
      })),
      ...currentNotices.map((notice) => ({
        id: `notice:${notice.id}`,
        kind: "notice" as const,
        activityAt: noticeActivityAt(notice),
        notice,
      })),
    ],
    [currentPosts, currentNotices]
  )
  const rotation = useMemo(
    () => buildHomepageRotation(entries, (entry) => entry.activityAt, now),
    [entries, now]
  )
  const autoplay = useHomepageAutoplay(rotation.length, 8500, initialIndex)
  const current = rotation[autoplay.index]
  const totalUniq = rotation.length

  if (!current) return null

  // স্বতন্ত্র (unique) entry ইনডেক্স বের করি (ডট নেভিগেটর)
  const uniqIds = Array.from(new Set(rotation.map((e) => e.id)))
  const dotIndex = uniqIds.indexOf(current.id)

  return (
    <section
      ref={autoplay.containerRef}
      {...autoplay.interactionProps}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 touch-pan-y"
      role="region"
      aria-label={title || "সর্বশেষ সংবাদ ও হালনাগাদ নোটিশ"}
      aria-live="polite"
      aria-atomic="false"
    >
      {/* শিরোনাম ও কাউন্টার */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {title && <h2 className="font-serif text-lg font-bold text-white">{title}</h2>}
        {totalUniq > 1 && (
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-200">
            {autoplay.index + 1} / {totalUniq}
          </span>
        )}
      </div>

      {/* মূল কার্ড — ট্রানজিশন অ্যানিমেশন সহ */}
      <div
        key={current.id}
        className={`${
          autoplay.reducedMotion ? "" : "animate-in fade-in slide-in-from-right-4 duration-500"
        } motion-reduce:animate-none`}
      >
        <div className="-mx-8 sm:mx-0">
          {current.kind === "post" ? (
            <NewsGrid posts={[current.post]} />
          ) : (
            <NoticeFeedCard notice={current.notice} />
          )}
        </div>
      </div>

      {/* নেভিগেশন বার — ডট + বাটন */}
      {totalUniq > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          {/* ক্যাটাগরি / ধরন লেবেল */}
          <span className="text-xs font-medium text-slate-300">
            {current.kind === "post" ? "ক্যাম্পাস সংবাদ" : "হালনাগাদ নোটিশ"}
          </span>

          {/* ডট নেভিগেটর + Arrow বাটন */}
          <div className="flex items-center gap-2">
            {/* ডট ইন্ডিকেটর (সর্বোচ্চ ৭টি দেখাবে) */}
            {uniqIds.length <= 7 && (
              <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
                {uniqIds.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => autoplay.setIndex(rotation.findIndex((e) => e.id === id))}
                    aria-label={`${i + 1} নম্বর সংবাদে যান`}
                    className={`rounded-full transition-all duration-300 ${
                      i === dotIndex
                        ? "w-5 h-2 bg-cyan-400"
                        : "w-2 h-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={autoplay.previous}
              aria-label="আগের সংবাদ বা নোটিশ"
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-95"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label="পরের সংবাদ বা নোটিশ"
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-95"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* মোবাইলে সোয়াইপ ইন্ডিকেটর (প্রথম দেখায়) */}
      {totalUniq > 1 && (
        <p className="mt-2 text-center text-[10px] text-white/30 sm:hidden select-none" aria-hidden="true">
          ← আঙুল দিয়ে সোয়াইপ করুন →
        </p>
      )}
    </section>
  )
}
