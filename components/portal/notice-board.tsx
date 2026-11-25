"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, ExternalLink, FileText, Megaphone, Pin } from "lucide-react"
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
    <section id="notices" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading
          inverted
          eyebrow={sec?.eyebrow ?? "Digital Notice Board"}
          title={sec?.titleBn || "ডিজিটাল নোটিশ বোর্ড"}
          titleEn={sec?.titleEn || "Digital Notice Board"}
          subtitle={
            sec?.subtitleBn ||
            "বিশ্ববিদ্যালয়, বিভিন্ন হল, বিভাগ ও মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশসমূহ।"
          }
          subtitleEn={sec?.subtitleEn || "Latest notices from MBSTU & MBSTURU."}
        />

        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-700/80 to-indigo-800/80 px-5 py-3 text-sm font-bold text-white border-b border-white/20 backdrop-blur">
            <Megaphone className="size-4 text-cyan-300" aria-hidden="true" />
            <span>{pick('সাম্প্রতিক নোটিশ', 'Recent Notices')}</span>
          </div>

          {loading && <p className="p-5 text-sm text-slate-300">{pick('লোড হচ্ছে…', 'Loading…')}</p>}
          {!loading && list.length === 0 && (
            <p className="p-5 text-sm text-slate-300">{pick('এখনো কোনো নোটিশ প্রকাশিত হয়নি।', 'No notices have been published yet.')}</p>
          )}

          <ul className="divide-y divide-white/10">
            {list.map((n) => {
              const branch = BRANCHES.find((b) => b.key === n.branch)?.bn || n.branch
              return (
                <li
                  key={n.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-white/10 sm:flex-row sm:items-center"
                >
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-md">
                    <span className="font-serif text-lg font-bold leading-none">{day(n.created_at)}</span>
                    <span className="text-[10px] font-bold uppercase text-cyan-300">{month(n.created_at)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                          <Pin className="size-3" aria-hidden="true" />
                          {pick('গুরুত্বপূর্ণ', 'Pinned')}
                        </span>
                      )}
                      <span className="rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-bold text-cyan-200">
                        {branch}
                      </span>
                      {n.ref_number && (
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
                          <FileText className="size-3" aria-hidden="true" />
                          {pick('স্মারক নম্বর:', 'Reference:')} {n.ref_number}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/notices?n=${n.id}`}
                      className="mt-1.5 block font-serif font-bold text-base text-white hover:text-cyan-300 transition-colors"
                    >
                      {n.title}
                    </Link>

                    {n.heading && <p className="text-xs text-slate-300 mt-0.5">{n.heading}</p>}
                    <p className="text-[11px] text-cyan-200/80 mt-1">
                      {n.updated_at && n.updated_at !== n.created_at ? `${pick('হালনাগাদ: ', 'Updated: ')}` : ""}
                      {timeAgo(noticeActivityAt(n))}
                    </p>
                  </div>

                  {n.file_url ? (
                    <a
                      href={downloadUrl(n.file_url, n.file_name)}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-white/30 px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      <span>{pick('ফাইল ডাউনলোড', 'Download file')}</span>
                    </a>
                  ) : safeUrl(n.link_url) ? (
                    <a
                      href={n.link_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95 backdrop-blur"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span>{pick('লিংক খুলুন', 'Open link')}</span>
                    </a>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <Link
            href="/notices"
            className="flex items-center justify-center gap-2 border-t border-white/15 bg-white/10 px-5 py-3.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{pick('সকল নোটিশ দেখুন', 'View all notices')}</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
