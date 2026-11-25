"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Bell, Download, ExternalLink, MessageSquare, Pin, Search } from "lucide-react"
import {
  BRANCHES, getNotices, getNoticeComments, addNoticeComment,
  downloadUrl, fmtDateTime, timeAgo, isImageType,
} from "../../lib/notices"
import type { Notice, NoticeComment } from "../../lib/notices"
import { getDepartments, type Department } from "../../lib/faculties"
import { getImagesMetaForMany, getLayoutsForMany } from "../../lib/sb"
import RichGallery from "../../components/portal/rich-gallery"
import type { GalleryItem } from "../../components/portal/rich-gallery"
import { FormattedText } from "../../components/portal/formatted-text"
import { UniversalMediaEmbed } from "../../components/portal/universal-media-embed"
import { PostMetaBadges } from "../../components/portal/post-meta-badges"
import { TopBar } from "../../components/portal/top-bar"
import { SiteHeader } from "../../components/portal/site-header"
import { SiteFooter } from "../../components/portal/site-footer"
import { BackToTop } from "../../components/portal/back-to-top"
import { BackNavigation } from "@/components/portal/back-navigation"
import { useSiteSettings } from "@/components/portal/site-settings-context"
import { useLang } from "@/lib/i18n"

const safeUrl = (u: string | null) => !!u && /^https?:\/\//i.test(u)

function Comments({ id }: { id: string }) {
  const { pick } = useLang()
  const [list, setList] = useState<NoticeComment[]>([])
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => { getNoticeComments(id).then(setList) }, [id])

  async function send() {
    if (!text.trim()) return
    setBusy(true)
    setErr("")
    try {
      await addNoticeComment(id, name.trim(), text.trim())
      setText("")
      setList(await getNoticeComments(id))
    } catch (e) {
      setErr("❌ " + (e instanceof Error ? e.message : pick("মন্তব্য জমা দেওয়া যায়নি।", "The comment could not be submitted.")))
    }
    setBusy(false)
  }

  return (
    <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
      {list.map((c) => (
        <div key={c.id} className="text-xs sm:text-sm bg-white/5 p-2.5 rounded-xl border border-white/10">
          <p className="font-bold text-cyan-300">
            {c.name || pick("নামহীন পাঠক", "Anonymous reader")}{" "}
            <span className="font-normal text-[10px] text-white/50 ml-1">{timeAgo(c.created_at)}</span>
          </p>
          <p className="whitespace-pre-line text-slate-200 mt-0.5">{c.message}</p>
        </div>
      ))}
      {list.length === 0 && <p className="text-xs text-white/50">{pick("এখনো কোনো মন্তব্য নেই।", "There are no comments yet.")}</p>}

      <div className="space-y-2 pt-1">
        <input
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          placeholder={pick("আপনার নাম (ঐচ্ছিক)", "Your name (optional)")}
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          rows={2}
          maxLength={1000}
          placeholder={pick("মন্তব্য লিখুন…", "Write a comment…")}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={send}
          disabled={busy || !text.trim()}
          className="rounded-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer shadow transition"
        >
          {busy ? pick("জমা দেওয়া হচ্ছে…", "Submitting…") : pick("মন্তব্য জমা দিন", "Submit comment")}
        </button>
      </div>
      {err && <p className="text-xs text-rose-400">{err}</p>}
    </div>
  )
}

function NoticeCard({
  n, highlight, items, layout, deptName,
}: {
  n: Notice
  highlight: boolean
  items: GalleryItem[]
  layout: string
  deptName?: string
}) {
  const { pick } = useLang()
  const [open, setOpen] = useState(false)
  const [more, setMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])
  useEffect(() => {
    if (highlight) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [highlight])

  const branch = deptName ? `🎓 ${deptName}` : (BRANCHES.find((b) => b.key === n.branch)?.bn || n.branch)
  const isNew = Date.now() - new Date(n.created_at).getTime() < 48 * 3600 * 1000
  const link = `${origin}/notices?n=${n.id}`
  const long = (n.body || "").length > 300

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: n.title, text: n.title, url: link })
        return
      }
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const allImages = items.length > 0 ? items : (n.image_urls || []).map((u) => ({ url: u }))

  return (
    <div
      ref={ref}
      className={`glass-card p-5 space-y-3.5 text-white transition-all ${
        highlight ? "ring-2 ring-cyan-400" : ""
      } ${n.is_pinned ? "border-l-4 border-amber-400" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {n.is_pinned && (
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full px-2.5 py-0.5 font-bold flex items-center gap-1">
            <Pin className="size-3" /> {pick("পিন করা", "Pinned")}
          </span>
        )}
        {isNew && (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full px-2.5 py-0.5 font-bold">
            {pick("নতুন", "New")}
          </span>
        )}
        <span className="bg-white/15 text-cyan-200 border border-white/20 rounded-full px-3 py-0.5 font-semibold">
          {branch}
        </span>
        {n.ref_number && <span className="text-white/60 font-mono text-[11px]">{pick("স্মারক:", "Ref:")} {n.ref_number}</span>}
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-serif font-bold text-white leading-snug drop-shadow-sm">
          {n.title}
        </h2>
        {n.heading && <p className="text-cyan-200/90 text-xs sm:text-sm mt-1">{n.heading}</p>}
      </div>

      <PostMetaBadges data={n} />

      {n.body && (
        <div>
          <div className={long && !more ? "line-clamp-5" : ""}>
            <FormattedText text={n.body} className="text-xs sm:text-sm text-slate-100 leading-relaxed" />
          </div>
          {long && (
            <button
              onClick={() => setMore(!more)}
              className="text-xs font-bold text-cyan-300 mt-1 cursor-pointer hover:underline"
            >
              {more ? pick("সংক্ষিপ্ত করুন", "Show less") : pick("আরও পড়ুন", "Read more")}
            </button>
          )}
        </div>
      )}

      {n.embed_media_url && (
        <UniversalMediaEmbed url={n.embed_media_url} title={n.title} />
      )}

      <RichGallery items={allImages} layout={layout} />

      {n.file_url && isImageType(n.file_type) && (
        <a href={n.file_url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={n.file_url} alt={n.title} className="w-full max-h-96 object-contain rounded-2xl bg-black/40 border border-white/15" />
        </a>
      )}

      {(n.file_url || safeUrl(n.link_url)) && (
        <div className="flex flex-wrap gap-2 text-xs pt-1">
          {n.file_url && (
            <>
              {!isImageType(n.file_type) && (
                <a
                  href={n.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-white font-semibold flex items-center gap-1.5 transition"
                >
                  📄 {pick("পূর্বরূপ দেখুন", "Preview")}
                </a>
              )}
              <a
                href={downloadUrl(n.file_url, n.file_name)}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-1.5 font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                <span>{pick("ডাউনলোড", "Download")}{n.file_name ? ` (${n.file_name.length > 18 ? n.file_name.slice(0, 16) + "…" : n.file_name})` : ""}</span>
              </a>
            </>
          )}
          {safeUrl(n.link_url) && (
            <a
              href={n.link_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-cyan-300 px-3.5 py-1.5 font-semibold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="size-3.5" />
              <span>{pick("লিংক খুলুন", "Open link")}</span>
            </a>
          )}
        </div>
      )}

      <div className="text-[11px] text-white/60 space-y-0.5 border-t border-white/10 pt-2.5">
        <p>{pick("প্রকাশক:", "Published by:")} {n.poster_name || pick("পরিচালক প্যানেল", "Director Panel")}</p>
        <p>
          {fmtDateTime(n.created_at)} · {timeAgo(n.created_at)}
          {n.updated_at ? ` · ${pick("সম্পাদিত:", "Updated:")} ${fmtDateTime(n.updated_at)}` : ""}
        </p>
        {n.expires_at && <p className="text-amber-300/80">{pick("মেয়াদ শেষ:", "Expires:")} {fmtDateTime(n.expires_at)}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs border-t border-white/10 pt-2.5">
        <button
          onClick={() => setOpen(!open)}
          className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
        >
          <MessageSquare className="size-3.5" />
          <span>{pick("মন্তব্য", "Comments")}</span>
        </button>
        <button
          onClick={share}
          className="text-cyan-300 hover:text-white font-bold cursor-pointer"
        >
          {copied ? `✅ ${pick("লিংক কপি হয়েছে", "Link copied")}` : `↗ ${pick("শেয়ার করুন", "Share")}`}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(n.title + " " + link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white ml-auto"
        >
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white"
        >
          Facebook
        </a>
      </div>

      {open && <Comments id={n.id} />}
    </div>
  )
}

export default function NoticesPage() {
  const { pick } = useLang()
  const settings = useSiteSettings()
  const [list, setList] = useState<Notice[]>([])
  const [departments, setDepartments] = useState<Record<string, Department>>({})
  const [imgs, setImgs] = useState<Record<string, GalleryItem[]>>({})
  const [layouts, setLayouts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [branch, setBranch] = useState("all")
  const [q, setQ] = useState("")
  const [hl, setHl] = useState("")

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("n")
    if (n) setHl(n)

    Promise.all([getNotices(), getDepartments()]).then(async ([r, depts]) => {
      setList(r)
      const dMap: Record<string, Department> = {}
      depts.forEach((d) => { dMap[d.id] = d })
      setDepartments(dMap)
      setLoading(false)

      const ids = r.map((x) => x.id)
      const [map, lay] = await Promise.all([
        getImagesMetaForMany("notice", ids),
        getLayoutsForMany("notice", ids),
      ])
      const out: Record<string, GalleryItem[]> = {}
      Object.keys(map).forEach((k) => {
        out[k] = map[k].map((i) => ({ url: i.url, caption: i.caption, credit: i.credit }))
      })
      setImgs(out)
      setLayouts(lay)
    })
  }, [])

  const banner = settings.behaviorAndPages.subPages.notices

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return list.filter((n) => {
      if (branch !== "all" && n.branch !== branch) return false
      if (!s) return true
      return [n.title, n.heading, n.body, n.ref_number, n.poster_name]
        .filter(Boolean)
        .some((t) => (t as string).toLowerCase().includes(s))
    })
  }, [list, branch, q])

  const count = (k: string) => (k === "all" ? list.length : list.filter((n) => n.branch === k).length)

  const tabCls = (on: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-all ${
      on
        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md border border-cyan-300/40"
        : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/15"
    }`

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10 px-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-5">

          <BackNavigation items={[{ label: pick('ডিজিটাল বিজ্ঞপ্তি', 'Digital Notices') }]} />

          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center justify-center gap-2 drop-shadow-md">
              <Bell className="size-6 text-cyan-400" />
              <span>{banner.title || pick('ডিজিটাল বিজ্ঞপ্তি বোর্ড', 'Digital Notice Board')}</span>
            </h1>
            <p className="text-xs text-cyan-200/80">
              {banner.subtitle || pick('বিশ্ববিদ্যালয়, হল, বিভাগ ও রিপোর্টার্স ইউনিটির আনুষ্ঠানিক বিজ্ঞপ্তি।', 'Official notices from the university, halls, departments, and Reporters’ Unity.')}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button onClick={() => setBranch("all")} className={tabCls(branch === "all")}>
              {pick("সব বিজ্ঞপ্তি", "All notices")} ({count("all")})
            </button>
            {BRANCHES.map((b) => (
              <button key={b.key} onClick={() => setBranch(b.key)} className={tabCls(branch === b.key)}>
                {pick(b.bn, ({ university: "University", hall: "Residential Halls", department: "Departments", mbsturu: "MBSTURU", other: "Other" } as const)[b.key])} ({count(b.key)})
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 backdrop-blur-md transition"
              placeholder={pick("বিজ্ঞপ্তির শিরোনাম বা স্মারক নম্বর দিয়ে খুঁজুন", "Search notices by title or reference number")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {loading && <p className="text-center text-sm text-cyan-200/70 py-6">{pick("বিজ্ঞপ্তি লোড হচ্ছে…", "Loading notices…")}</p>}
          {!loading && shown.length === 0 && (
            <div className="glass-card text-center p-8 text-white/70">
              <p className="text-sm font-bold">{pick("কোনো বিজ্ঞপ্তি পাওয়া যায়নি।", "No notices were found.")}</p>
            </div>
          )}

          <div className="space-y-4">
            {shown.map((n) => (
              <NoticeCard
                key={n.id}
                n={n}
                highlight={n.id === hl}
                items={imgs[n.id] || []}
                layout={layouts[n.id] || "grid"}
                deptName={n.department_id ? departments[n.department_id]?.name : undefined}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
