"use client"

import { useEffect, useState } from "react"
import { uploadImage } from "../../lib/sb"
import {
  BADGES, MAX_LIVE, getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  getHeroSettings, saveHeroSettings,
} from "../../lib/hero"
import type { HeroSlide } from "../../lib/hero"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
const POS = { top: "উপরে", center: "মাঝে", bottom: "নিচে" } as const

const isLive = (s: HeroSlide) => s.is_active && (!s.expires_at || new Date(s.expires_at) > new Date())

export default function HeroManager({ token, shrink }: { token: string; shrink: (f: File) => Promise<Blob> }) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // ব্রেকিং মোড
  const [bOn, setBOn] = useState(false)
  const [bTitle, setBTitle] = useState("")
  const [bText, setBText] = useState("")
  const [bLink, setBLink] = useState("")

  // স্লাইড ফর্ম
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [link, setLink] = useState("")
  const [pos, setPos] = useState<"top" | "center" | "bottom">("center")
  const [active, setActive] = useState(true)
  const [expSel, setExpSel] = useState("none")
  const [oldExpires, setOldExpires] = useState<string | null>(null)
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  async function load() {
    setList(await getHeroSlides(token))
  }

  useEffect(() => {
    load()
    getHeroSettings().then((s) => {
      if (s) {
        setBOn(s.breaking_on)
        setBTitle(s.breaking_title || "")
        setBText(s.breaking_text || "")
        setBLink(s.breaking_link || "")
      }
    })
  }, [token])

  async function saveBreaking(on: boolean) {
    if (on && !bTitle.trim()) {
      setMsg("❌ ব্রেকিং মোড চালুর আগে শিরোনাম লিখুন")
      return
    }
    try {
      await saveHeroSettings(token, {
        breaking_on: on,
        breaking_title: bTitle.trim() || null,
        breaking_text: bText.trim() || null,
        breaking_link: bLink.trim() || null,
      })
      setBOn(on)
      setMsg(on ? "🔴 ব্রেকিং মোড চালু হয়েছে" : "✅ ব্রেকিং মোড বন্ধ, স্বাভাবিক স্লাইডার ফিরেছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  function reset() {
    setEditId(null); setTitle(""); setSummary(""); setCategory(""); setLink("")
    setPos("center"); setActive(true); setExpSel("none"); setOldExpires(null)
    setOldImage(null); setFile(null)
  }

  function startEdit(s: HeroSlide) {
    setEditId(s.id); setTitle(s.title); setSummary(s.summary || ""); setCategory(s.category || "")
    setLink(s.link_url || ""); setPos(s.image_pos); setActive(s.is_active)
    setExpSel("keep"); setOldExpires(s.expires_at); setOldImage(s.image_url); setFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function save() {
    if (!title.trim()) { setMsg("❌ শিরোনাম লিখুন"); return }
    const l = link.trim()
    if (l && !/^(https?:\/\/|\/)/i.test(l)) {
      setMsg("❌ লিংক https:// বা / দিয়ে শুরু হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let img = oldImage
      if (file) img = await uploadImage(token, await shrink(file))

      let expires: string | null = oldExpires
      if (expSel === "none") expires = null
      else if (expSel !== "keep") expires = new Date(Date.now() + Number(expSel) * 3600 * 1000).toISOString()

      const data = {
        category: category.trim() || null,
        title: title.trim(),
        summary: summary.trim() || null,
        image_url: img,
        image_pos: pos,
        link_url: l || null,
        is_active: active,
        expires_at: expires,
      }
      if (editId) await updateHeroSlide(token, editId, data)
      else {
        // নতুন স্লাইড সবার আগে বসবে
        const first = list.length ? Math.min(...list.map((s) => s.sort_order)) - 10 : 0
        await createHeroSlide(token, { ...data, sort_order: first })
      }
      reset()
      setMsg("✅ সেভ হয়েছে")
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const arr = [...list]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    try {
      await Promise.all(
        arr.map((s, k) => (s.sort_order === k * 10 ? Promise.resolve() : updateHeroSlide(token, s.id, { sort_order: k * 10 })))
      )
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  async function run(fn: () => Promise<void>, ask?: string) {
    if (ask && !confirm(ask)) return
    try { await fn(); await load() } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  const liveList = list.filter(isLive)

  function status(s: HeroSlide) {
    if (!s.is_active) return "লুকানো"
    if (s.expires_at && new Date(s.expires_at) <= new Date()) return "মেয়াদ শেষ"
    const idx = liveList.findIndex((x) => x.id === s.id)
    return idx < MAX_LIVE ? `স্লাইডারে আছে (${idx + 1})` : "অপেক্ষায় (৫টির বেশি)"
  }

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm">{msg}</p>}

      {/* ব্রেকিং মোড */}
      <div className={`rounded-2xl shadow p-4 space-y-3 ${bOn ? "bg-red-50 border border-red-300" : "bg-white"}`}>
        <h2 className="font-semibold">🔴 জরুরি ব্রেকিং মোড {bOn && "(চালু আছে)"}</h2>
        <p className="text-xs text-gray-600">চালু করলে স্লাইডারের জায়গায় একটি বড় ব্রেকিং বক্স দেখাবে। বন্ধ করলে স্বাভাবিক স্লাইডার ফিরে আসবে।</p>
        <input className={inp} placeholder="ব্রেকিং শিরোনাম *" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
        <textarea className={inp} rows={3} placeholder="সংক্ষিপ্ত বিবরণ" value={bText} onChange={(e) => setBText(e.target.value)} />
        <input className={inp} placeholder="লিংক (ঐচ্ছিক)" value={bLink} onChange={(e) => setBLink(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={() => saveBreaking(true)} className="flex-1 bg-red-600 text-white rounded-xl py-3 font-semibold">
            {bOn ? "আপডেট করুন" : "ব্রেকিং মোড চালু করুন"}
          </button>
          {bOn && (
            <button onClick={() => saveBreaking(false)} className="flex-1 border rounded-xl py-3 font-semibold">বন্ধ করুন</button>
          )}
        </div>
      </div>

      {/* স্লাইড ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{editId ? "স্লাইড এডিট করুন" : "নতুন স্লাইড"}</h2>
        <input className={inp} placeholder="শিরোনাম *" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={inp} rows={3} placeholder="সংক্ষিপ্ত বিবরণ" value={summary} onChange={(e) => setSummary(e.target.value)} />

        <div className="space-y-2">
          <input className={inp} placeholder="ব্যাজ (যেমন: ব্রেকিং)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setCategory(b)}
                className={`rounded-full px-3 py-1 text-xs border ${category === b ? "bg-green-700 text-white" : "bg-white"}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <input className={inp} placeholder="বিস্তারিত লিংক (https://... বা /notices)" value={link} onChange={(e) => setLink(e.target.value)} />

        <label className="block">
          <span className="text-sm text-gray-600">ছবি (গ্যালারি থেকে, ১৬:৯ আকারের হলে সবচেয়ে ভালো)</span>
          <input className="block mt-1 text-sm" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {(file || oldImage) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file ? URL.createObjectURL(file) : oldImage || ""}
            alt=""
            className="w-full h-40 object-cover rounded-xl"
            style={{ objectPosition: pos }}
          />
        )}

        <label className="block">
          <span className="text-sm text-gray-600">ছবির কোন অংশ ফোকাসে থাকবে</span>
          <select className={inp} value={pos} onChange={(e) => setPos(e.target.value as "top" | "center" | "bottom")}>
            {(Object.keys(POS) as Array<keyof typeof POS>).map((k) => <option key={k} value={k}>{POS[k]}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">স্লাইডারে কতক্ষণ থাকবে</span>
          <select className={inp} value={expSel} onChange={(e) => setExpSel(e.target.value)}>
            {editId && <option value="keep">আগের মেয়াদ রাখুন{oldExpires ? "" : " (স্থায়ী)"}</option>}
            <option value="none">স্থায়ী (নিজে সরানো পর্যন্ত)</option>
            <option value="3">৩ ঘণ্টা</option>
            <option value="6">৬ ঘণ্টা</option>
            <option value="12">১২ ঘণ্টা</option>
            <option value="24">২৪ ঘণ্টা</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          স্লাইডারে দেখান
        </label>

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "যোগ করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline">বাতিল</button>}
      </div>

      {/* তালিকা */}
      <div className="space-y-3">
        <h2 className="font-semibold">সব স্লাইড ({list.length})</h2>
        <p className="text-xs text-gray-500">
          সর্বোচ্চ {MAX_LIVE}টি স্লাইড দেখায়। উপরের স্লাইড আগে আসে, নতুন স্লাইড সবার আগে বসে।
        </p>
        {list.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl shadow p-3 text-sm space-y-2">
            <div className="flex gap-3">
              {s.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" style={{ objectPosition: s.image_pos }} />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">{s.title}</p>
                <p className="text-xs text-gray-500">
                  {s.category ? `${s.category} · ` : ""}{status(s)}
                </p>
                {s.expires_at && (
                  <p className="text-xs text-gray-500">
                    মেয়াদ: {new Date(s.expires_at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">⬆ উপরে</button>
              <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="disabled:opacity-30">⬇ নিচে</button>
              <button onClick={() => startEdit(s)} className="text-green-700">এডিট</button>
              <button onClick={() => run(() => updateHeroSlide(token, s.id, { is_active: !s.is_active }))} className="text-gray-700">
                {s.is_active ? "লুকান" : "দেখান"}
              </button>
              <button onClick={() => run(() => deleteHeroSlide(token, s.id), "স্লাইড মুছে ফেলবেন?")} className="text-red-600">মুছুন</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো স্লাইড নেই। এখন হোমপেজে পুরনো নমুনা স্লাইড দেখাচ্ছে।</p>}
      </div>
    </div>
  )
}
