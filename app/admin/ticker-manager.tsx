"use client"

import { useEffect, useState } from "react"
import {
  MAX_LIVE_TICKER, SPEEDS, DEFAULT_SPEED, bn,
  getAllTicker, createTickerItem, updateTickerItem, deleteTickerItem,
} from "../../lib/ticker"
import type { TickerItem, TickerInput, TickerLevel } from "../../lib/ticker"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const MAX_CHARS = 100
const DEF_TEXT = "#1e293b"
const DEF_BG = "#ffffff"

const EXPIRY = [
  { v: "30", t: "৩০ মিনিট" },
  { v: "60", t: "১ ঘণ্টা" },
  { v: "120", t: "২ ঘণ্টা" },
  { v: "none", t: "ম্যানুয়াল অফ না করা পর্যন্ত" },
]

function left(iso: string, now: number) {
  const s = Math.floor((new Date(iso).getTime() - now) / 1000)
  if (s <= 0) return null
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${bn(h)} ঘণ্টা ${bn(m)} মিনিট`
  if (m > 0) return `${bn(m)} মিনিট`
  return `${bn(s)} সেকেন্ড`
}

export default function TickerManager({ token, author }: { token: string; author: string }) {
  const [list, setList] = useState<TickerItem[]>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState<TickerLevel>("normal")
  const [textColor, setTextColor] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string | null>(null)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [exp, setExp] = useState("60")
  const [oldExpires, setOldExpires] = useState<string | null>(null)
  const [sound, setSound] = useState(false)

  const fail = (e: unknown) => setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))

  async function load() {
    try { setList(await getAllTicker(token)) } catch (e) { fail(e) }
  }

  useEffect(() => { load() }, [token])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function resetForm() {
    setEditId(null); setTitle(""); setUrl(""); setLevel("normal")
    setTextColor(null); setBgColor(null); setSpeed(DEFAULT_SPEED)
    setExp("60"); setOldExpires(null); setSound(false)
  }

  function preset(kind: TickerLevel) {
    setLevel(kind)
    if (kind === "urgent") { setTextColor("#ffffff"); setBgColor("#dc2626") }
    else { setTextColor(null); setBgColor(null) }
  }

  function startEdit(s: TickerItem) {
    setEditId(s.id); setTitle(s.title); setUrl(s.url || ""); setLevel(s.level)
    setTextColor(s.text_color); setBgColor(s.bg_color); setSpeed(s.speed || DEFAULT_SPEED)
    setSound(s.sound_alert); setExp("keep"); setOldExpires(s.expires_at)
    setMsg("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function save() {
    const t = title.trim()
    if (!t) { setMsg("❌ শিরোনাম লিখুন"); return }
    const u = url.trim()
    if (u && !/^(https?:\/\/|\/)/i.test(u)) {
      setMsg("❌ লিংক https:// বা / দিয়ে শুরু হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let expires: string | null
      if (exp === "keep") expires = oldExpires
      else if (exp === "none") expires = null
      else expires = new Date(Date.now() + Number(exp) * 60000).toISOString()

      const base = {
        title: t,
        url: u || null,
        level,
        text_color: textColor,
        bg_color: bgColor,
        speed,
        sound_alert: sound,
        expires_at: expires,
      }

      if (editId) {
        await updateTickerItem(token, editId, base)
        setMsg("✅ আপডেট হয়েছে")
      } else {
        // নতুন শিরোনাম সবার আগে বসবে
        const first = list.length ? Math.min(...list.map((s) => s.sort_order)) - 10 : 0
        await createTickerItem(token, { ...base, is_active: true, sort_order: first, author_name: author || null })
        setMsg("🚀 লাইভ হয়েছে")
      }
      resetForm()
      await load()
    } catch (e) { fail(e) }
    setBusy(false)
  }

  // আগে স্ক্রিনে বদলায়, ব্যর্থ হলে আগের অবস্থায় ফেরে
  async function patch(id: string, data: Partial<TickerInput>) {
    const prev = list
    setList((l) => l.map((s) => (s.id === id ? { ...s, ...data } : s)))
    try { await updateTickerItem(token, id, data) } catch (e) { setList(prev); fail(e) }
  }

  function toggle(s: TickerItem) {
    const expired = !!s.expires_at && new Date(s.expires_at).getTime() <= now
    if (!s.is_active && expired) {
      patch(s.id, { is_active: true, expires_at: new Date(Date.now() + 3600 * 1000).toISOString() })
    } else {
      patch(s.id, { is_active: !s.is_active })
    }
  }

  async function move(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= list.length) return
    const arr = [...list]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    const next = arr.map((s, k) => ({ ...s, sort_order: k * 10 }))
    const prev = list
    setList(next)
    try {
      await Promise.all(
        next
          .filter((s) => prev.find((p) => p.id === s.id)?.sort_order !== s.sort_order)
          .map((s) => updateTickerItem(token, s.id, { sort_order: s.sort_order }))
      )
    } catch (e) { setList(prev); fail(e) }
  }

  async function remove(id: string) {
    if (!confirm("এই শিরোনাম মুছে ফেলবেন?")) return
    const prev = list
    setList((l) => l.filter((s) => s.id !== id))
    if (editId === id) resetForm()
    try { await deleteTickerItem(token, id) } catch (e) { setList(prev); fail(e) }
  }

  const alive = (s: TickerItem) => s.is_active && (!s.expires_at || new Date(s.expires_at).getTime() > now)
  const liveList = list.filter(alive)

  function status(s: TickerItem) {
    if (!s.is_active) return "বন্ধ"
    if (s.expires_at && new Date(s.expires_at).getTime() <= now) return "মেয়াদ শেষ"
    const idx = liveList.findIndex((x) => x.id === s.id)
    return idx < MAX_LIVE_TICKER ? `লাইভ (${bn(idx + 1)})` : `অপেক্ষায় (${bn(MAX_LIVE_TICKER)}টির বেশি)`
  }

  const speedName = (v: number) => SPEEDS.find((x) => x.v === v)?.t || `${bn(v)}`

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm">{msg}</p>}

      {/* প্রকাশ / এডিট ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{editId ? "✏️ শিরোনাম এডিট করুন" : "⚡ দ্রুত ব্রেকিং প্রকাশ"}</h2>

        <div>
          <input
            className={inp}
            placeholder="শিরোনাম *"
            maxLength={MAX_CHARS}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className={`text-xs mt-1 text-right ${title.length >= MAX_CHARS ? "text-red-600" : "text-gray-500"}`}>
            {bn(title.length)}/{bn(MAX_CHARS)}
          </p>
        </div>

        <div>
          <input
            className={inp}
            placeholder="মূল সংবাদের লিংক (ঐচ্ছিক)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            সাইটে সংবাদটি খুলে ব্রাউজারের ঠিকানা কপি করে এখানে পেস্ট করুন। শিরোনামে চাপলে সেখানে যাবে।
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => preset("normal")}
            className={`flex-1 rounded-xl py-2 text-sm border ${level === "normal" ? "bg-slate-800 text-white" : "bg-white"}`}
          >
            সাধারণ
          </button>
          <button
            type="button"
            onClick={() => preset("urgent")}
            className={`flex-1 rounded-xl py-2 text-sm border ${level === "urgent" ? "bg-red-600 text-white border-red-600" : "bg-white"}`}
          >
            🚨 রেড অ্যালার্ট
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-sm text-gray-600">লেখার রং</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                aria-label="লেখার রং"
                value={textColor || DEF_TEXT}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-10 w-12 rounded border bg-white p-0.5"
              />
              <button type="button" onClick={() => setTextColor(null)} className="text-xs underline">
                {textColor ? "ডিফল্ট" : "ডিফল্ট ✓"}
              </button>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">পিছনের রং</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                aria-label="পিছনের রং"
                value={bgColor || DEF_BG}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-12 rounded border bg-white p-0.5"
              />
              <button type="button" onClick={() => setBgColor(null)} className="text-xs underline">
                {bgColor ? "ডিফল্ট" : "ডিফল্ট ✓"}
              </button>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          style={{ background: bgColor || DEF_BG, color: textColor || DEF_TEXT }}
        >
          {title.trim() || "নমুনা শিরোনাম এভাবে দেখাবে"}
        </div>

        <label className="block">
          <span className="text-sm text-gray-600">স্ক্রলের গতি</span>
          <select className={inp} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">কতক্ষণ থাকবে</span>
          <select className={inp} value={exp} onChange={(e) => setExp(e.target.value)}>
            {editId && <option value="keep">আগের মেয়াদ রাখুন{oldExpires ? "" : " (স্থায়ী)"}</option>}
            {EXPIRY.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
          🔊 পাঠকদের জন্য হালকা অ্যালার্ট শব্দ
        </label>

        <button
          onClick={save}
          disabled={busy}
          className="w-full bg-red-600 text-white rounded-xl py-3 font-bold disabled:opacity-50"
        >
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "🚀 GO LIVE"}
        </button>
        {editId && <button onClick={resetForm} className="w-full text-sm underline">বাতিল</button>}
      </div>

      {/* তালিকা */}
      <div className="space-y-3">
        <h2 className="font-semibold">সব শিরোনাম ({bn(list.length)})</h2>
        <p className="text-xs text-gray-500">
          সর্বোচ্চ {bn(MAX_LIVE_TICKER)}টি শিরোনাম টিকারে একটার পর একটা চলে। উপরেরটি আগে আসে, নতুনটি সবার আগে বসে।
        </p>

        {list.map((s, i) => {
          const rem = s.expires_at ? left(s.expires_at, now) : null
          return (
            <div key={s.id} className="bg-white rounded-2xl shadow p-3 text-sm space-y-2">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className="rounded border px-2 py-1 font-semibold break-words"
                    style={{ background: s.bg_color || DEF_BG, color: s.text_color || DEF_TEXT }}
                  >
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {status(s)} · গতি: {speedName(s.speed)}
                    {s.sound_alert ? " · 🔊" : ""}
                    {s.url ? " · 🔗" : ""}
                  </p>
                  {s.expires_at ? (
                    <p className="text-xs text-gray-500">
                      {rem ? `⏱️ মেয়াদ শেষ হতে বাকি: ${rem}` : "⏱️ মেয়াদ শেষ হয়েছে"}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">⏱️ মেয়াদ: নিজে বন্ধ না করা পর্যন্ত</p>
                  )}
                </div>
                <button
                  role="switch"
                  aria-checked={s.is_active}
                  aria-label="চালু/বন্ধ"
                  onClick={() => toggle(s)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${s.is_active ? "bg-green-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${s.is_active ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">⬆ উপরে</button>
                <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="disabled:opacity-30">⬇ নিচে</button>
                <button onClick={() => startEdit(s)} className="text-green-700">✏️ এডিট</button>
                <button onClick={() => remove(s.id)} className="text-red-600">মুছুন</button>
              </div>
            </div>
          )
        })}
        {list.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো ব্রেকিং শিরোনাম নেই।</p>}
      </div>
    </div>
  )
}
