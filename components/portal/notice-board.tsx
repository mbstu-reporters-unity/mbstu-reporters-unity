"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, ExternalLink, FileText, Bell, Pin } from "lucide-react"
import { BRANCHES, getNotices, downloadUrl, timeAgo } from "@/lib/notices"
import type { Notice } from "@/lib/notices"
import { SectionHeading } from "./section-heading"
import { useSiteSettings } from "./site-settings-context"
import { selectHomepageItems } from "@/lib/homepage-feed"
import { useHomepageAging } from "./use-homepage-aging"
import { useLang } from "@/lib/i18n"
import NoticeMediaPreview from "./notice-media-preview"

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
    <section id="notices" className="border-b border-slate-200 py-6 sm:py-9 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <SectionHeading
          inverted={false}
          eyebrow={sec?.eyebrow ?? "Digital Notice Board"}
          title={sec?.titleBn || "ডিজিটাল নোটিশ বোর্ড"}
          titleEn={sec?.titleEn || "Digital Notice Board"}
          subtitle={
            sec?.subtitleBn ||
            "বিশ্ববিদ্যালয়, হল, বিভাগ ও রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশসমূহ।"
          }
          subtitleEn={sec?.subtitleEn || "Latest notices from MBSTU & MBSTURU."}
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-2 bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800">
            <Bell className="size-4 text-[#c8102e]" aria-hidden="true" />
            <span>{pick('সাম্প্রতিক নোটিশ', 'Recent Notices')}</span>
          </div>

          {loading && <p className="p-4 text-xs text-slate-500">{pick('লোড হচ্ছে…', 'Loading…')}</p>}
          {!loading && list.length === 0 && (
            <p className="p-4 text-xs text-slate-500">{pick('এখনো কোনো নোটিশ প্রকাশিত হয়নি।', 'No notices have been published yet.')}</p>
          )}

          <ul className="divide-y divide-slate-100">
            {list.map((n) => {
              const branch = BRANCHES.find((b) => b.key === n.branch)?.bn || n.branch
              return (
                <li
                  key={n.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800">
                      <span className="font-serif text-base font-bold leading-none">{day(n.created_at)}</span>
                      <span className="text-[9px] font-bold uppercase text-[#c8102e]">{month(n.created_at)}</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {n.is_pinned && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.2 text-[10px] font-bold text-[#c8102e]">
                            <Pin className="size-2.5" />
                            {pick('পিন করা', 'Pinned')}
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-bold text-slate-700">
                          {branch}
                        </span>
                        {n.ref_number && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {n.ref_number}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/notices?n=${n.id}`}
                        className="block font-serif font-bold text-sm sm:text-base text-slate-900 hover:text-[#c8102e] transition leading-snug truncate"
                      >
                        {n.title}
                      </Link>

                      <p className="text-[11px] text-slate-400">
                        {timeAgo(noticeActivityAt(n))}
                      </p>
                    </div>
                  </div>

                  {n.file_url ? (
                    <a
                      href={downloadUrl(n.file_url, n.file_name)}
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-[#c8102e] hover:bg-[#a50d25] text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs self-start sm:self-auto"
                    >
                      <Download className="size-3" />
                      <span>{pick('ডাউনলোড', 'Download')}</span>
                    </a>
                  ) : safeUrl(n.link_url) ? (
                    <a
                      href={n.link_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-slate-300 bg-white text-slate-800 px-3 py-1.5 text-xs font-semibold hover:border-[#c8102e] hover:text-[#c8102e] transition self-start sm:self-auto"
                    >
                      <ExternalLink className="size-3" />
                      <span>{pick('লিংক', 'Link')}</span>
                    </a>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <Link
            href="/notices"
            className="flex items-center justify-center gap-1.5 border-t border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-[#c8102e] hover:bg-slate-100 transition"
          >
            <span>{pick('সকল নোটিশ দেখুন', 'View all notices')}</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
