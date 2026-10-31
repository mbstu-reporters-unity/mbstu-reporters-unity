"use client"

import { useEffect, useState } from "react"
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
          eyebrow="Digital Notice Board"
          title="ডিজিটাল নোটিশ বোর্ড"
          subtitle="Latest notices from the university, halls, departments and MBSTU Reporters' Unity."
        />

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-brand px-5 py-3 text-sm font-semibold text-white">
            <Megaphone className="size-4" aria-hidden="true" />
            Latest Notices / সর্বশেষ নোটিশ
          </div>

          {loading && <p className="p-5 text-sm text-muted-foreground">লোড হচ্ছে...</p>}
          {!loading && list.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">এখনো কোনো নোটিশ দেওয়া হয়নি।</p>
          )}

          <ul className="divide-y divide-border">
            {list.map((n) => {
              const branch = BRANCHES.find((b) => b.key === n.branch)?.bn || n.branch
              return (
                <li
                  key={n.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-brand-soft/50 sm:flex-row sm:items-center"
                >
                  <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-brand bg-brand-soft text-brand">
                    <span className="font-serif text-xl font-bold leading-none">{day(n.created_at)}</span>
                    <span className="text-[10px] font-bold uppercase">{month(n.created_at)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/30 px-2 py-0.5 text-[11px] font-semibold text-navy">
                          <Pin className="size-3" aria-hidden="true" />
                          পিন করা
                        </span>
                      )}
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                        {branch}
                      </span>
                      {n.ref_number && (
                        <p className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                          <FileText className="size-3" aria-hidden="true" />
                          Ref: {n.ref_number}
                        </p>
                      )}
                    </div>
                    <a href={`/notices?n=${n.id}`} className="mt-1.5 block text-pretty font-semibold text-navy hover:text-brand">
                      {n.title}
                    </a>
                    {n.heading && <p className="text-sm text-muted-foreground">{n.heading}</p>}
                    <p className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                  </div>

                  {n.file_url ? (
                    <a
                      href={downloadUrl(n.file_url, n.file_name)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-2 text-sm font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Download / ডাউনলোড
                    </a>
                  ) : safeUrl(n.link_url) ? (
                    <a
                      href={n.link_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Open Link / লিংক
                    </a>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <a
            href="/notices"
            className="flex items-center justify-center gap-2 border-t border-border bg-muted px-5 py-4 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            সব নোটিশ দেখুন
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
