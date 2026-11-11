"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, ExternalLink, FileText, Megaphone, Pin } from "lucide-react"
import { BRANCHES, getNotices, downloadUrl, timeAgo } from "@/lib/notices"
import type { Notice } from "@/lib/notices"
import { SectionHeading } from "./section-heading"

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", timeZone: "Asia/Dhaka" })
const month = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", timeZone: "Asia/Dhaka" }).toUpperCase()
const safeUrl = (u: string | null) => !!u && /^https?:\/\//i.test(u)

export function NoticeBoard() {
  const [list, setList] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotices().then((rows) => {
      setList(rows.slice(0, 5))
      setLoading(false)
    })
  }, [])

  return (
    <section id="notices" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading
          inverted
          eyebrow="Digital Notice Board"
          title="ডিজিটাল নোটিশ বোর্ড"
          subtitle="বিশ্ববিদ্যালয়, বিভিন্ন হল, বিভাগ ও মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশসমূহ।"
        />

        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-700/80 to-indigo-800/80 px-5 py-3 text-sm font-bold text-white border-b border-white/20 backdrop-blur">
            <Megaphone className="size-4 text-cyan-300" aria-hidden="true" />
            <span>Latest Notices / সর্বশেষ নোটিশ</span>
          </div>

          {loading && <p className="p-5 text-sm text-slate-300">লোড হচ্ছে...</p>}
          {!loading && list.length === 0 && (
            <p className="p-5 text-sm text-slate-300">এখনো কোনো নোটিশ দেওয়া হয়নি।</p>
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
                          পিন করা
                        </span>
                      )}
                      <span className="rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-bold text-cyan-200">
                        {branch}
                      </span>
                      {n.ref_number && (
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
                          <FileText className="size-3" aria-hidden="true" />
                          Ref: {n.ref_number}
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
                    <p className="text-[11px] text-cyan-200/80 mt-1">{timeAgo(n.created_at)}</p>
                  </div>

                  {n.file_url ? (
                    <a
                      href={downloadUrl(n.file_url, n.file_name)}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-white/30 px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      <span>Download</span>
                    </a>
                  ) : safeUrl(n.link_url) ? (
                    <a
                      href={n.link_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95 backdrop-blur"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span>লিংক</span>
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
            <span>সব নোটিশ দেখুন</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
