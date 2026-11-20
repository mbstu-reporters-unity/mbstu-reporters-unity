"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowLeft, ArrowRight, ExternalLink, FileText, Pin } from "lucide-react"
import type { Post } from "@/lib/sb"
import { buildHomepageRotation, selectHomepageItems } from "@/lib/homepage-feed"
import { BRANCHES, downloadUrl, type Notice } from "@/lib/notices"
import { NewsGrid } from "./news-card"
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

  return (
    <article className="glass-card overflow-hidden p-5 text-white sm:p-7">
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

      {!!notice.image_urls?.length && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {notice.image_urls.slice(0, 3).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" className="h-28 w-full rounded-xl object-cover sm:h-36" />
          ))}
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

  if (!current) return null

  return (
    <section
      ref={autoplay.containerRef}
      {...autoplay.interactionProps}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      role="region"
      aria-label={title || "সর্বশেষ সংবাদ ও হালনাগাদ নোটিশ"}
    >
      {title && <h2 className="mb-3 font-serif text-lg font-bold text-white">{title}</h2>}
      <div
        key={current.id}
        className={`${
          autoplay.reducedMotion ? "" : "animate-in fade-in slide-in-from-right-4 duration-500"
        } motion-reduce:animate-none`}
      >
        {current.kind === "post" ? (
          <NewsGrid posts={[current.post]} />
        ) : (
          <NoticeFeedCard notice={current.notice} />
        )}
      </div>
      {rotation.length > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-300">
            {current.kind === "post" ? "ক্যাম্পাস সংবাদ" : "হালনাগাদ নোটিশ"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={autoplay.previous}
              aria-label="আগের সংবাদ বা নোটিশ"
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={autoplay.next}
              aria-label="পরের সংবাদ বা নোটিশ"
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
