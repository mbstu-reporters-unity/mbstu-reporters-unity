"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  BRANCHES, getNotices, getNoticeComments, addNoticeComment,
  downloadUrl, fmtDateTime, timeAgo, isImageType,
} from "../../lib/notices"
import type { Notice, NoticeComment } from "../../lib/notices"
import { getImagesForMany } from "../../lib/sb"
import ImageGallery from "../../components/portal/image-gallery"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const safeUrl = (u: string | null) => !!u && /^https?:\/\//i.test(u)

function Comments({ id }: { id: string }) {
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
      setErr("❌ " + (e instanceof Error ? e.message : "কমেন্ট করা যায়নি"))
    }
    setBusy(false)
  }

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {list.map((c) => (
        <div key={c.id} className="text-sm">
          <p className="font-semibold">
            {c.name || "নামহীন"}{" "}
            <span className="font-normal text-xs text-gray-500">{timeAgo(c.created_at)}</span>
          </p>
          <p className="whitespace-pre-line">{c.message}</p>
        </div>
      ))}
      {list.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো কমেন্ট নেই।</p>}
      <input className={inp} placeholder="আপনার নাম (ঐচ্ছিক)" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className={inp} rows={3} maxLength={1000} placeholder="কমেন্ট লিখুন..." value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send} disabled={busy} className="w-full bg-green-700 text-white rounded-xl py-2 font-semibold disabled:opacity-50">
        {busy ? "অপেক্ষা করুন..." : "কমেন্ট করুন"}
      </button>
      {err && <p className="text-sm">{err}</p>}
    </div>
  )
}

function NoticeCard({ n, highlight, images }: { n: Notice; highlight: boolean; images: string[] }) {
  const [open, setOpen] = useState(false)
  const [more, setMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])
  useEffect(() => {
    if (highlight) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [highlight])

  const branch = BRANCHES.find((b) => b.key === n.branch)?.bn || n.branch
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

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow p-4 space-y-3 ${highlight ? "ring-2 ring-green-600" : ""} ${n.is_pinned ? "border-l-4 border-yellow-500" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {n.is_pinned && <span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">📌 পিন করা</span>}
        {isNew && <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5">নতুন</span>}
        <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5">{branch}</span>
        {n.ref_number && <span className="text-gray-500">Ref: {n.ref_number}</span>}
      </div>

      <div>
        <h2 className="text-lg font-bold">{n.title}</h2>
        {n.heading && <p className="text-gray-600">{n.heading}</p>}
      </div>

      {n.body && (
        <div>
          <p className={`whitespace-pre-line ${long && !more ? "line-clamp-5" : ""}`}>{n.body}</p>
          {long && (
            <button onClick={() => setMore(!more)} className="text-sm text-green-700 mt-1">
              {more ? "কম দেখুন" : "আরও পড়ুন"}
            </button>
          )}
        </div>
      )}

      <ImageGallery urls={images} />

      {n.file_url && isImageType(n.file_type) && (
        <a href={n.file_url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={n.file_url} alt={n.title} className="w-full max-h-96 object-contain rounded-xl bg-gray-100" />
        </a>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        {n.file_url && (
          <>
            {!isImageType(n.file_type) && (
              <a href={n.file_url} target="_blank" rel="noopener noreferrer" className="border rounded-xl px-3 py-2">
                📄 দেখুন
              </a>
            )}
            <a href={downloadUrl(n.file_url, n.file_name)} className="bg-green-700 text-white rounded-xl px-3 py-2">
              ⬇ ডাউনলোড{n.file_name ? ` (${n.file_name.length > 20 ? n.file_name.slice(0, 18) + "…" : n.file_name})` : ""}
            </a>
          </>
        )}
        {safeUrl(n.link_url) && (
          <a href={n.link_url!} target="_blank" rel="noopener noreferrer" className="border border-green-700 text-green-800 rounded-xl px-3 py-2">
            🔗 লিংক খুলুন
          </a>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-0.5">
        <p>
          প্রকাশক: {n.poster_name || "ডিরেক্টর প্যানেল"}
        </p>
        <p>
          {fmtDateTime(n.created_at)} · {timeAgo(n.created_at)}
          {n.updated_at ? ` · সম্পাদিত: ${fmtDateTime(n.updated_at)}` : ""}
        </p>
        {n.expires_at && <p>মেয়াদ: {fmtDateTime(n.expires_at)} পর্যন্ত</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm border-t pt-2">
        <button onClick={() => setOpen(!open)} className="text-green-700">💬 কমেন্ট</button>
        <button onClick={share} className="text-green-700">{copied ? "✅ লিংক কপি হয়েছে" : "↗ শেয়ার"}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(n.title + " " + link)}`} target="_blank" rel="noopener noreferrer" className="text-gray-600">WhatsApp</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" className="text-gray-600">Facebook</a>
      </div>

      {open && <Comments id={n.id} />}
    </div>
  )
}

export default function NoticesPage() {
  const [list, setList] = useState<Notice[]>([])
  const [imgs, setImgs] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [branch, setBranch] = useState("all")
  const [q, setQ] = useState("")
  const [hl, setHl] = useState("")

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("n")
    if (n) setHl(n)
    getNotices().then(async (r) => {
      setList(r)
      setLoading(false)
      const map = await getImagesForMany("notice", r.map((x) => x.id))
      const out: Record<string, string[]> = {}
      Object.keys(map).forEach((k) => { out[k] = map[k].map((i) => i.url) })
      setImgs(out)
    })
  }, [])

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
    `shrink-0 rounded-xl px-3 py-2 text-sm ${on ? "bg-green-700 text-white" : "bg-white border"}`

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-green-800 text-center">ডিজিটাল নোটিশ বোর্ড</h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setBranch("all")} className={tabCls(branch === "all")}>সব ({count("all")})</button>
          {BRANCHES.map((b) => (
            <button key={b.key} onClick={() => setBranch(b.key)} className={tabCls(branch === b.key)}>
              {b.bn} ({count(b.key)})
            </button>
          ))}
        </div>

        <input className={inp} placeholder="🔍 নোটিশ খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} />

        {loading && <p className="text-center text-sm text-gray-500">লোড হচ্ছে...</p>}
        {!loading && shown.length === 0 && (
          <p className="text-center text-sm text-gray-500">কোনো নোটিশ পাওয়া যায়নি।</p>
        )}

        {shown.map((n) => <NoticeCard key={n.id} n={n} highlight={n.id === hl} images={imgs[n.id] || []} />)}

        <div className="flex justify-center gap-4 text-sm">
          <a href="/" className="underline">সাইটে ফিরুন</a>
          <a href="/admin" className="underline text-green-800">নোটিশ দিন (সদস্য)</a>
        </div>
      </div>
    </main>
  )
}
