"use client"

import { useEffect, useState } from "react"
import {
  getStudentItems, saveStudentItem, deleteStudentItem,
  saveStudentItemReturningId, removeAllImages,
  getStudentCategories, addStudentCategory, updateStudentCategory, deleteStudentCategory,
} from "../../lib/sb"
import type { StudentItem } from "../../lib/sb"
import ImageSection, { useImageSection } from "../../components/portal/image-section"

const DEFAULT_KINDS = ["Opinion", "Creative Writing", "Achievement", "Research Highlight"]
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
  const [kinds, setKinds] = useState<string[]>(DEFAULT_KINDS)
  const [showKindManager, setShowKindManager] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [kind, setKind] = useState(DEFAULT_KINDS[0])
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [author, setAuthor] = useState("")
  const [dept, setDept] = useState("")
  const [batch, setBatch] = useState("")
  const [link, setLink] = useState("")
  const [embedMediaUrl, setEmbedMediaUrl] = useState("")
  const [featured, setFeatured] = useState(false)
  const [order, setOrder] = useState("0")
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const imgs = useImageSection("student")

  async function loadKinds() {
    try {
      const list = await getStudentCategories()
      if (list && list.length > 0) {
        setKinds(list)
        setKind((prev) => (list.includes(prev) ? prev : list[0]))
      }
    } catch {}
  }

  async function load() {
    setItems(await getStudentItems(true))
  }

  useEffect(() => {
    load()
    loadKinds()
  }, [])

  function reset() {
    setEditId(null); setKind(kinds[0] || DEFAULT_KINDS[0]); setTitle(""); setExcerpt(""); setAuthor("")
    setDept(""); setBatch(""); setLink(""); setEmbedMediaUrl(""); setFeatured(false); setOrder("0")
    setOldImage(null)
    imgs.reset()
  }

  async function edit(it: StudentItem) {
    setEditId(it.id); setKind(it.kind); setTitle(it.title); setExcerpt(it.excerpt || "")
    setAuthor(it.author || ""); setDept(it.dept || ""); setBatch(it.batch || "")
    setLink(it.link_url || ""); setEmbedMediaUrl(it.embed_media_url || "")
    setFeatured(it.featured); setOrder(String(it.sort_order))
    setOldImage(it.image_url)
    window.scrollTo({ top: 0, behavior: "smooth" })
    const rows = await imgs.load(it.id)
    if (it.image_url && rows.some((r) => r.url === it.image_url)) setOldImage(null)
  }

  /* --- ক্যাটাগরি যোগ / এডিট / ডিলিট হ্যান্ডলার --- */
  async function handleAddKind() {
    const name = window.prompt("নতুন ক্যাটাগরির নাম লিখুন:")?.trim()
    if (!name) return
    if (kinds.some((k) => k.toLowerCase() === name.toLowerCase())) {
      alert("এই নামের ক্যাটাগরি ইতিমধ্যে রয়েছে!")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      await addStudentCategory(token, name)
      await loadKinds()
      setKind(name)
      setMsg("✅ নতুন ক্যাটাগরি যোগ হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  async function handleRenameKind(oldName: string) {
    const newName = window.prompt(`"${oldName}"-এর নতুন নাম লিখুন:`, oldName)?.trim()
    if (!newName || newName === oldName) return
    setBusy(true)
    setMsg("")
    try {
      await updateStudentCategory(token, oldName, newName)
      await loadKinds()
      if (kind === oldName) setKind(newName)
      await load()
      setMsg("✅ ক্যাটাগরির নাম পরিবর্তন হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  async function handleDeleteKind(delName: string) {
    if (kinds.length <= 1) {
      alert("কমপক্ষে একটি ক্যাটাগরি থাকতে হবে!")
      return
    }
    const count = items.filter((it) => it.kind === delName).length
    if (count > 0) {
      alert(`❌ এই ক্যাটাগরিতে ${count}টি পোস্ট আছে, তাই মোছা যাবে না!`)
      return
    }
    if (!confirm(`"${delName}" ক্যাটাগরি কি মুছে ফেলবেন?`)) return

    setBusy(true)
    setMsg("")
    try {
      await deleteStudentCategory(token, delName)
      await loadKinds()
      setMsg("✅ ক্যাটাগরি মুছে ফেলা হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  async function submit() {
    if (!title.trim()) {
      setMsg("শিরোনাম লিখুন")
      return
    }
    if (embedMediaUrl.trim() && !/^https?:\/\//i.test(embedMediaUrl.trim())) {
      setMsg("❌ ভিডিও/ছবির লিংক http:// বা https:// দিয়ে শুরু হতে হবে")
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
        embed_media_url: embedMediaUrl.trim() || null,
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

        {/* ক্যাটাগরি নির্বাচন এবং ম্যানেজমেন্ট ড্রপডাউন */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">ক্যাটাগরি বা বিষয়</span>
            <button
              type="button"
              onClick={() => setShowKindManager(!showKindManager)}
              className="text-xs text-green-700 font-semibold hover:underline"
            >
              {showKindManager ? "✕ বন্ধ করুন" : "⚙️ ক্যাটাগরি ম্যানেজ"}
            </button>
          </div>

          <select className={inp} value={kind} onChange={(e) => setKind(e.target.value)}>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>

          {showKindManager && (
            <div className="bg-gray-50 border border-green-200 rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between items-center pb-1 border-b">
                <span className="font-semibold text-xs text-gray-700">ক্যাটাগরি তালিকা ({kinds.length})</span>
                <button
                  type="button"
                  onClick={handleAddKind}
                  className="bg-green-700 text-white text-xs px-2.5 py-1 rounded-lg font-medium"
                >
                  + নতুন যোগ
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {kinds.map((k) => (
                  <div key={k} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border text-xs">
                    <span className="font-medium text-gray-800">{k}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRenameKind(k)}
                        className="text-green-700 font-semibold hover:underline"
                      >
                        এডিট
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKind(k)}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        ডিলিট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <input className={inp} placeholder="শিরোনাম *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={inp} rows={3} placeholder="সংক্ষিপ্ত বিবরণ বা মূল লেখা" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        <input className={inp} placeholder="লেখকের নাম" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input className={inp} placeholder="বিভাগ (যেমন: Pharmacy)" value={dept} onChange={(e) => setDept(e.target.value)} />
        <input className={inp} placeholder="ব্যাচ (যেমন: 18th Batch)" value={batch} onChange={(e) => setBatch(e.target.value)} />

        {/* ⭐ নতুন: ইউটিউব, ফেসবুক বা ছবির লিংক দেওয়ার ঐচ্ছিক বক্স ⭐ */}
        <div className="space-y-1 rounded-xl border border-emerald-300 bg-emerald-50/60 p-3">
          <label className="text-xs font-bold text-emerald-900 block">
            🎥 ভিডিও / ছবির লিংক (YouTube, Facebook ভিডিও বা ছবির সরাসরি লিংক - ঐচ্ছিক):
          </label>
          <input
            className={inp}
            placeholder="যেমন: https://youtube.com/watch?v=... বা ফেসবুক ভিডিও লিংক"
            value={embedMediaUrl}
            onChange={(e) => setEmbedMediaUrl(e.target.value)}
          />
          <p className="text-[11px] text-emerald-700">
            💡 লিংক দিলে স্টুডেন্ট কর্নারে লেখার ঠিক নিচে স্বয়ংক্রিয়ভাবে ভিডিও চলবে বা ছবি দেখাবে।
          </p>
        </div>

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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-red-700">{it.kind}</span>
              {it.featured && <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">⭐ বড় কার্ড</span>}
              {it.embed_media_url && <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">🎥 মিডিয়া</span>}
            </div>
            <p className="font-semibold mt-1">{it.hidden ? "🙈 " : ""}{it.title}</p>
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
