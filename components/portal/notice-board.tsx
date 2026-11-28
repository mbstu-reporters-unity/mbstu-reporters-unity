"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, ExternalLink, Bell, Pin } from "lucide-react"
import { BRANCHES, getNotices, downloadUrl, timeAgo } from "@/lib/notices"
import type { Notice } from "@/lib/notices"
import { SectionHeading } from "./section-heading"
import { useSiteSettings } from "./site-settings-context"
import { selectHomepageItems } from "@/lib/homepage-feed"
import { useHomepageAging } from "./use-homepage-aging"
import { useLang } from "@/lib/i18n"

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", timeZone: "Asia/Dhaka" })
const month = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", timeZone: "Asia/Dhaka" }).toUpperCase()
const safeUrl = (u: string | null) => !!u && /^https?:\/\//i.test(u)
const noticeActivityAt = (notice: Notice) => notice.updated_at || notice.created_at

export function NoticeBoard({
  prefetchedNotices,
  initialNow,
}: {
  prefetchedNotices?: Notice[]
  initialNow: number
}) {
  const { pick } = useLang()
  const settings = useSiteSettings()
  const [allRows, setAllRows] = useState<Notice[]>(prefetchedNotices || [])
  const [loading, setLoading] = useState(!prefetchedNotices)

  useEffect(() => {
    if (prefetchedNotices) {
      setAllRows(prefetchedNotices)
      setLoading(false)
      return
    }

    getNotices().then((rows) => {
      setAllRows(rows)
      setLoading(false)
    })
  }, [prefetchedNotices])

  const sec = settings.homeSections.sections.find((s) => s.key === "notice_board")
  const limit = Math.max(1, settings.homeSections.homeNoticesLimit || 5)
  const timestamps = useMemo(() => allRows.map(noticeActivityAt), [allRows])
  const now = useHomepageAging(timestamps, initialNow)
  const currentRows = useMemo(
    () => selectHomepageItems(allRows, noticeActivityAt, now),
    [allRows, now]
  )
  const list = currentRows.slice(0, limit)

  return (
    <section id="notices" className="border-b border-[var(--theme-card-border)] py-6 sm:py-9">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={sec?.eyebrow ?? "Digital Notice Board"}
          title={sec?.titleBn || "ডিজিটাল নোটিশ বোর্ড"}
          titleEn={sec?.titleEn || "Digital Notice Board"}
          subtitle={
            sec?.subtitleBn ||
            "বিশ্ববিদ্যালয়, হল, বিভাগ ও রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশসমূহ।"
          }
          subtitleEn={sec?.subtitleEn || "Latest notices from MBSTU & MBSTURU."}
        />

        <div className="glass-card overflow-hidden rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-xs">
          <div className="flex items-center gap-2 border-b border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-4 py-2.5 text-xs font-bold text-[var(--theme-text-title)]">
            <Bell className="size-4 text-[var(--theme-brand)]" aria-hidden="true" />
            <span>{pick("সাম্প্রতিক নোটিশ", "Recent Notices")}</span>
          </div>

          {loading && <p className="p-4 text-xs text-[var(--theme-text-body)]">{pick("লোড হচ্ছে…", "Loading…")}</p>}
          {!loading && list.length === 0 && (
            <p className="p-4 text-xs text-[var(--theme-text-body)]">{pick("এখনো কোনো নোটিশ প্রকাশিত হয়নি।", "No notices have been published yet.")}</p>
          )}

          <ul className="divide-y divide-[var(--theme-card-border)]">
            {list.map((n) => {
              const branch = BRANCHES.find((b) => b.key === n.branch)?.bn || n.branch
              return (
                <li
                  key={n.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--theme-brand-soft)] transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-text-title)]">
                      <span className="font-serif text-base font-bold leading-none">{day(n.created_at)}</span>
                      <span className="text-[9px] font-bold uppercase text-[var(--theme-brand)]">{month(n.created_at)}</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {n.is_pinned && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--theme-brand)] bg-[var(--theme-brand-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--theme-brand)]">
                            <Pin className="size-2.5" />
                            {pick("পিন করা", "Pinned")}
                          </span>
                        )}
                        <span className="rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--theme-text-title)]">
                          {branch}
                        </span>
                        {n.ref_number && (
                          <span className="font-mono text-[10px] text-[var(--theme-text-body)] opacity-75">
                            {n.ref_number}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/notices?n=${n.id}`}
                        className="block font-serif font-bold text-sm sm:text-base text-[var(--theme-text-title)] hover:text-[var(--theme-brand)] transition leading-snug truncate"
                      >
                        {n.title}
                      </Link>

                      <p className="text-[11px] text-[var(--theme-text-body)] opacity-75">
                        {timeAgo(noticeActivityAt(n))}
                      </p>
                    </div>
                  </div>

                  {n.file_url ? (
                    <a
                      href={downloadUrl(n.file_url, n.file_name)}
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-[var(--theme-brand)] hover:bg-[var(--theme-brand-dark)] text-[var(--theme-bg-solid)] px-3.5 py-1.5 text-xs font-bold transition shadow-xs self-start sm:self-auto"
                    >
                      <Download className="size-3" />
                      <span>{pick("ডাউনলোড", "Download")}</span>
                    </a>
                  ) : safeUrl(n.link_url) ? (
                    <a
                      href={n.link_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-text-title)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)] transition self-start sm:self-auto"
                    >
                      <ExternalLink className="size-3" />
                      <span>{pick("লিংক", "Link")}</span>
                    </a>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <Link
            href="/notices"
            className="flex items-center justify-center gap-1.5 border-t border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] py-2.5 text-xs font-bold text-[var(--theme-brand)] hover:opacity-90 transition"
          >
            <span>{pick("সকল নোটিশ দেখুন", "View all notices")}</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
