"use client"

import { useEffect, useState } from "react"
import {
  getStudentItems, saveStudentItem, deleteStudentItem,
  saveStudentItemReturningId, removeAllImages,
} from "../../lib/sb"
import type { StudentItem } from "../../lib/sb"
import ImageSection, { useImageSection } from "../../components/portal/image-section"

const KINDS = ["Opinion", "Creative Writing", "Achievement", "Research Highlight"]
const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

export default function StudentManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [items, setItems] = useState<StudentItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [kind, setKind] = useState(KINDS[0])
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [author, setAuthor] = useState("")
  const [dept, setDept] = useState("")
  const [batch, setBatch] = useState("")
  const [link, setLink] = useState("")
  const [featured, setFeatured] = useState(false)
  const [order, setOrder] = useState("0")
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const imgs = useImageSection("student")

  async function load() {
    setItems(await getStudentItems(true))
  }
  useEffect(() => {
    load()
  }, [])

  function reset() {
    setEditId(null); setKind(KINDS[0]); setTitle(""); setExcerpt(""); setAuthor("")
    setDept(""); setBatch(""); setLink(""); setFeatured(false); setOrder("0")
    setOldImage(null)
    imgs.reset()
  }

  async function edit(it: StudentItem) {
    setEditId(it.id); setKind(it.kind); setTitle(it.title); setExcerpt(it.excerpt || "")
    setAuthor(it.author || ""); setDept(it.dept || ""); setBatch(it.batch || "")
    setLink(it.link_url || ""); setFeatured(it.featured); setOrder(String(it.sort_order))
    setOldImage(it.image_url)
    window.scrollTo({ top: 0, behavior: "smooth" })
    const rows = await imgs.load(it.id)
    if (it.image_url && rows.some((r) => r.url === it.image_url)) setOldImage(null)
  }

  async function submit() {
    if (!title.trim()) {
      setMsg("শিরোনাম লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      const up = await imgs.uploadNew(token, shrink, (i, n) => setMsg(`ছবি আপলোড হচ্ছে (${i}/${n})...`))
      const cover = oldImage || imgs.visible[0]?.url || up[0]?.url || null

      const itemId = await saveStudentItemReturningId(token, editId, {
        kind,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        author: author.trim() || null,
        dept: dept.trim() || null,
        batch: batch.trim() || null,
        image_url: cover,
        link_url: link.trim() || null,
        featured,
        sort_order: Number(order) || 0,
      })

      let warn = ""
      if (itemId) {
        try {
          await imgs.commit(token, itemId, up, oldImage)
        } catch (e) {
          warn = " (লেখা সেভ হয়েছে, কিন্তু ছবির তালিকা জোড়া যায়নি: " + (e instanceof Error ? e.message : "ত্রুটি") + ")"
        }
      } else if (up.length > 0) {
        warn = " (লেখা সেভ হয়েছে, কিন্তু ছবি জোড়া যায়নি)"
      }

      reset()
      setMsg("✅ সেভ হয়েছে" + warn)
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  async function run(fn: () => Promise<void>, ask?: string) {
    if (ask && !confirm(ask)) return
    try {
      await fn()
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{editId ? "লেখা এডিট করুন" : "স্টুডেন্ট কর্নারে নতুন লেখা"}</h2>
        <select className={inp} value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map((k) => <option key={k}>{k}</option>)}
        </select>
        <input className={inp} placeholder="শিরোনাম *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={inp} rows={3} placeholder="সংক্ষিপ্ত বিবরণ (বড় কার্ডে দেখাবে)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        <input className={inp} placeholder="লেখকের নাম" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input className={inp} placeholder="বিভাগ (যেমন: Pharmacy)" value={dept} onChange={(e) => setDept(e.target.value)} />
        <input className={inp} placeholder="ব্যাচ (যেমন: 18th Batch)" value={batch} onChange={(e) => setBatch(e.target.value)} />
        <input className={inp} placeholder="লিংক (ঐচ্ছিক): /post/... অথবা https://..." value={link} onChange={(e) => setLink(e.target.value)} />

        {oldImage && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={oldImage} alt="" className="w-full max-h-48 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => setOldImage(null)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-xs"
            >
              ✕ ছবি সরান
            </button>
          </div>
        )}

        <ImageSection s={imgs} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          বড় কার্ডে দেখান (একটি মাত্র বড় কার্ড থাকে)
        </label>
        <input className={inp} type="number" placeholder="ক্রম (ছোট সংখ্যা আগে দেখাবে)" value={order} onChange={(e) => setOrder(e.target.value)} />
        <button className={btn} onClick={submit} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "যোগ করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline">বাতিল</button>}
        {msg && <p className="text-sm">{msg}</p>}
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="bg-white rounded-2xl shadow p-3 text-sm">
            <p className="text-xs font-bold text-red-700">{it.kind}{it.featured ? " · ⭐ বড় কার্ড" : ""}</p>
            <p className="font-semibold">{it.hidden ? "🙈 " : ""}{it.title}</p>
            <p className="text-xs text-gray-500">{it.author} {it.dept ? "· " + it.dept : ""}</p>
            <div className="flex gap-4 mt-2">
              <button onClick={() => edit(it)} className="text-green-700">এডিট</button>
              <button onClick={() => run(() => saveStudentItem(token, it.id, { hidden: !it.hidden }))} className="text-amber-600">
                {it.hidden ? "দেখান" : "হাইড"}
              </button>
              <button
                onClick={() =>
                  run(async () => {
                    try { await removeAllImages(token, "student", it.id) } catch {}
                    await deleteStudentItem(token, it.id)
                  }, "সত্যিই মুছবেন?")
                }
                className="text-red-600"
              >
                ডিলিট
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500">এখনো কিছু নেই।</p>}
      </div>
    </div>
  )
}
