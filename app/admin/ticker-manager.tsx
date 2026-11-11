"use client"

import { useEffect, useState } from "react"
import {
  MAX_LIVE_TICKER,
  SPEEDS,
  DEFAULT_SPEED,
  bn,
  getAllTicker,
  createTickerItem,
  updateTickerItem,
  deleteTickerItem,
  getTickerBadgeConfig,
  saveTickerBadgeConfig,
  TICKER_BADGE_ICONS,
  TICKER_ANIMATIONS,
  TICKER_BG_ANIMATIONS,
  DEFAULT_TICKER_BADGE_CONFIG,
  type TickerItem,
  type TickerInput,
  type TickerLevel,
  type TickerBadgeConfig,
} from "../../lib/ticker"
import { renderTickerBadgeIcon } from "../../components/portal/news-ticker"
import { login, SB_URL, SB_KEY } from "../../lib/sb"
import {
  Palette,
  Sparkles,
  Eye,
  Settings2,
  Clock,
  Radio,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  Lock,
  PlusCircle,
  CheckCircle,
} from "lucide-react"

const inp = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition"
const selectInp = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition"
const btnPrimary = "w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl py-3 font-bold text-sm shadow cursor-pointer transition disabled:opacity-50 active:scale-98"

const DEF_TEXT = "#1e293b"
const DEF_BG = "#ffffff"

function isJwtExpired(tokenStr: string): boolean {
  try {
    const parts = tokenStr.split(".")
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000 - 60000
  } catch {
    return false
  }
}

async function refreshAuthToken(): Promise<string | null> {
  try {
    const rt = typeof window !== "undefined" ? localStorage.getItem("mbstu_admin_refresh_token") : null
    if (!rt) return null
    const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) return null
    const j = await res.json()
    if (j.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("mbstu_admin_token", j.access_token)
        if (j.refresh_token) {
          localStorage.setItem("mbstu_admin_refresh_token", j.refresh_token)
        }
      }
      return j.access_token as string
    }
  } catch {}
  return null
}

export default function TickerManager({ token: initialToken, author }: { token: string; author: string }) {
  const [token, setToken] = useState(initialToken)
  const [activeTab, setActiveTab] = useState<"items" | "badge">("items")

  const [list, setList] = useState<TickerItem[]>([])
  const [badgeCfg, setBadgeCfg] = useState<TickerBadgeConfig>(DEFAULT_TICKER_BADGE_CONFIG)
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  const [showReLogin, setShowReLogin] = useState(false)
  const [reLoginEmail, setReLoginEmail] = useState("")
  const [reLoginPassword, setReLoginPassword] = useState("")
  const [reLoginBusy, setReLoginBusy] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState<TickerLevel>("normal")
  const [textColor, setTextColor] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string | null>(null)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [sound, setSound] = useState(false)

  const [expiryMode, setExpiryMode] = useState<string>("none")
  const [presetDuration, setPresetDuration] = useState("1440")
  const [customUnit, setCustomUnit] = useState<"min" | "hour" | "day">("day")
  const [customValue, setCustomValue] = useState("7")
  const [customDateTime, setCustomDateTime] = useState("")

  useEffect(() => {
    setToken(initialToken)
    try {
      const savedEmail = localStorage.getItem("mbstu_admin_email")
      if (savedEmail) setReLoginEmail(savedEmail)
    } catch {}
  }, [initialToken])

  async function getActiveToken(): Promise<string> {
    if (!token || isJwtExpired(token)) {
      const fresh = await refreshAuthToken()
      if (fresh) {
        setToken(fresh)
        return fresh
      }
    }
    return token
  }

  async function load() {
    try {
      const currentTok = await getActiveToken()
      const [data, cfg] = await Promise.all([
        getAllTicker(currentTok),
        getTickerBadgeConfig(),
      ])
      setList(data)
      if (cfg) setBadgeCfg(cfg)
    } catch (e: any) {
      if (/jwt|expired|token/i.test(e?.message || "")) {
        setShowReLogin(true)
      }
    }
  }

  useEffect(() => { load() }, [token])

  function resetForm() {
    setEditId(null)
    setTitle("")
    setUrl("")
    setLevel("normal")
    setTextColor(null)
    setBgColor(null)
    setSpeed(DEFAULT_SPEED)
    setExpiryMode("none")
    setPresetDuration("1440")
    setCustomValue("7")
    setCustomDateTime("")
    setSound(false)
  }

  function presetLevel(kind: TickerLevel) {
    setLevel(kind)
    if (kind === "urgent") {
      setTextColor("#ffffff")
      setBgColor("#dc2626")
    } else {
      setTextColor(null)
      setBgColor(null)
    }
  }

  function startEdit(s: TickerItem) {
    setEditId(s.id)
    setTitle(s.title)
    setUrl(s.url || "")
    setLevel(s.level)
    setTextColor(s.text_color)
    setBgColor(s.bg_color)
    setSpeed(s.speed || DEFAULT_SPEED)
    setSound(s.sound_alert)
    setExpiryMode(s.expires_at ? "datetime" : "none")
    setCustomDateTime(s.expires_at ? s.expires_at.slice(0, 16) : "")
    setMsg("")
    setActiveTab("items")
    window.scrollTo({ top: 100, behavior: "smooth" })
  }

  function calculateExpiry(): string | null {
    if (expiryMode === "none") return null
    if (expiryMode === "datetime") {
      return customDateTime ? new Date(customDateTime).toISOString() : null
    }
    if (expiryMode === "custom") {
      const val = Number(customValue) || 1
      let multiplier = 60 * 1000
      if (customUnit === "hour") multiplier = 60 * 60 * 1000
      if (customUnit === "day") multiplier = 24 * 60 * 60 * 1000
      return new Date(Date.now() + val * multiplier).toISOString()
    }
    if (expiryMode === "preset") {
      const minutes = Number(presetDuration) || 1440
      return new Date(Date.now() + minutes * 60000).toISOString()
    }
    return null
  }

  async function handleSaveItem() {
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
      const expires = calculateExpiry()
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

      let activeTok = await getActiveToken()

      const saveOperation = async (currentAuthToken: string) => {
        if (editId) {
          await updateTickerItem(currentAuthToken, editId, base)
        } else {
          const nextOrder = list.length ? Math.max(...list.map((s) => s.sort_order)) + 10 : 0
          await createTickerItem(currentAuthToken, {
            ...base,
            is_active: true,
            sort_order: nextOrder,
            author_name: author || null,
          })
        }
      }

      try {
        await saveOperation(activeTok)
      } catch (err: any) {
        if (/jwt|expired|token/i.test(err?.message || "")) {
          const fresh = await refreshAuthToken()
          if (fresh) {
            setToken(fresh)
            await saveOperation(fresh)
          } else {
            setShowReLogin(true)
            setBusy(false)
            return
          }
        } else {
          throw err
        }
      }

      setMsg("🚀 ব্রেকিং সফলভাবে প্রকাশিত ও লাইভ হয়েছে!")
      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "পোস্ট করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  async function handleSaveBadgeConfig() {
    setBusy(true)
    setMsg("")
    try {
      let activeTok = await getActiveToken()
      await saveTickerBadgeConfig(activeTok, badgeCfg)
      setMsg("✅ ব্রেকিং বেজ ও [সংক্ষেপ] ডিজাইন সফলভাবে সেভ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সেভ করা যায়নি"))
    }
    setBusy(false)
  }

  async function patchItem(id: string, data: Partial<TickerInput>) {
    const prev = list
    setList((l) => l.map((s) => (s.id === id ? { ...s, ...data } : s)))
    try {
      const activeTok = await getActiveToken()
      await updateTickerItem(activeTok, id, data)
    } catch (e: any) {
      setList(prev)
      if (/jwt|expired|token/i.test(e?.message || "")) setShowReLogin(true)
    }
  }

  function toggleActive(s: TickerItem) {
    patchItem(s.id, { is_active: !s.is_active, expires_at: null })
  }

  async function moveItem(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= list.length) return
    const arr = [...list]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    const next = arr.map((s, k) => ({ ...s, sort_order: k * 10 }))
    const prev = list
    setList(next)
    try {
      const activeTok = await getActiveToken()
      await Promise.all(
        next
          .filter((s) => prev.find((p) => p.id === s.id)?.sort_order !== s.sort_order)
          .map((s) => updateTickerItem(activeTok, s.id, { sort_order: s.sort_order }))
      )
    } catch {
      setList(prev)
    }
  }

  async function removeItem(id: string) {
    if (!confirm("এই শিরোনামটি মুছে ফেলতে চান?")) return
    const prev = list
    setList((l) => l.filter((s) => s.id !== id))
    if (editId === id) resetForm()
    try {
      const activeTok = await getActiveToken()
      await deleteTickerItem(activeTok, id)
    } catch {
      setList(prev)
    }
  }

  async function handleQuickReLogin() {
    if (!reLoginEmail.trim() || !reLoginPassword) {
      alert("ইমেইল ও পাসওয়ার্ড লিখুন")
      return
    }
    setReLoginBusy(true)
    try {
      const newTok = await login(reLoginEmail.trim(), reLoginPassword)
      setToken(newTok)
      setShowReLogin(false)
      setReLoginPassword("")
      setMsg("✅ সেশন সফলভাবে রিনিউ হয়েছে!")
      await load()
    } catch (err: any) {
      alert("লগইন ব্যর্থ: " + (err?.message || "ইমেইল বা পাসওয়ার্ড ভুল"))
    }
    setReLoginBusy(false)
  }

  const liveCount = list.filter((t) => t.is_active !== false).length

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* সেশন এক্সপায়ার নোটিশ */}
      {showReLogin && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 text-xs text-rose-950 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-sm text-rose-800">
              <Lock className="size-4" /> সেশনের মেয়াদ শেষ — ঝটপট রি-লগইন করুন
            </span>
            <button type="button" onClick={() => setShowReLogin(false)} className="text-slate-500 underline font-bold">বন্ধ</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className={inp} placeholder="আপনার জিমেইল" type="email" value={reLoginEmail} onChange={(e) => setReLoginEmail(e.target.value)} />
            <input className={inp} placeholder="পাসওয়ার্ড" type="password" value={reLoginPassword} onChange={(e) => setReLoginPassword(e.target.value)} />
          </div>
          <button type="button" onClick={handleQuickReLogin} disabled={reLoginBusy} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl transition cursor-pointer">
            {reLoginBusy ? "লগইন হচ্ছে..." : "✓ রি-লগইন করুন"}
          </button>
        </div>
      )}

      {/* সাব-ট্যাব ন্যাভিগেশন */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("items")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "items" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Radio className="size-4" />
          <span>১. ব্রেকিং প্রকাশ ({list.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("badge")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "badge" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Palette className="size-4" />
          <span>২. ব্রেকিং বেজ ও [সংক্ষেপ] স্টুডিও</span>
        </button>
      </div>

      {msg && (
        <div className="text-xs sm:text-sm font-bold text-center p-3 rounded-2xl border bg-cyan-50 border-cyan-200 text-cyan-900 shadow-xs">
          {msg}
        </div>
      )}

      {/* লাইভ প্রিভিউ বক্স */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 space-y-2 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Eye className="size-3.5" /> 👁️ লাইভ প্রিভিউ:
          </span>
          <span className="text-[10px] text-amber-300 font-semibold">
            {liveCount}টি ব্রেকিং ধারাবাহিকভাবে চলবে
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 flex items-center bg-white text-slate-900 text-xs sm:text-sm">
          <div
            className="flex items-center gap-1.5 px-3 py-2 font-bold shrink-0 select-none"
            style={{
              background: badgeCfg.bg_color2
                ? `linear-gradient(135deg, ${badgeCfg.bg_color}, ${badgeCfg.bg_color2})`
                : badgeCfg.bg_color,
              color: badgeCfg.text_color || "#ffffff",
            }}
          >
            <span>{renderTickerBadgeIcon(badgeCfg.icon, "size-3.5")}</span>
            <span style={{ color: badgeCfg.text_color || "#ffffff" }}>
              {badgeCfg.badge_text || "সর্বশেষ"}
            </span>
          </div>

          <div
            className="px-3 py-2 truncate flex-1 flex items-center gap-2"
            style={{ backgroundColor: bgColor || DEF_BG, color: textColor || DEF_TEXT }}
          >
            {badgeCfg.show_brief && badgeCfg.brief_text && !url.trim() && (
              <span
                className="px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0 shadow-xs"
                style={{
                  color: badgeCfg.brief_color || "#c8102e",
                  backgroundColor: badgeCfg.brief_bg_color || "#fee2e2",
                }}
              >
                {badgeCfg.brief_text}
              </span>
            )}
            <span className="truncate">{title.trim() || "এখানে ব্রেকিং সংবাদের শিরোনাম চলবে..."}</span>
          </div>
        </div>
      </div>

      {/* ট্যাব ১: ব্রেকিং প্রকাশ */}
      {activeTab === "items" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-sm sm:text-base text-slate-800">
              {editId ? "✏️ ব্রেকিং শিরোনাম এডিট করুন" : "⚡ নতুন ব্রেকিং যুক্ত করুন"}
            </h2>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="size-3.5" /> নতুন আরেকটি লিখুন
              </button>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">ব্রেকিং শিরোনাম * (সীমাহীন অক্ষর):</label>
              <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                মোট {bn(title.length)} টি অক্ষর
              </span>
            </div>
            <textarea
              className={inp}
              rows={3}
              placeholder="ব্রেকিং সংবাদ এখানে লিখুন..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">মূল সংবাদের লিংক (ঐচ্ছিক):</label>
            <input className={inp} placeholder="https://... অথবা /post/..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => presetLevel("normal")}
              className={`rounded-xl py-2 text-xs font-bold border cursor-pointer transition ${
                level === "normal" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              সাধারণ
            </button>
            <button
              type="button"
              onClick={() => presetLevel("urgent")}
              className={`rounded-xl py-2 text-xs font-bold border cursor-pointer transition ${
                level === "urgent" ? "bg-rose-600 text-white border-rose-600" : "bg-white text-rose-600 border-rose-200"
              }`}
            >
              🚨 রেড অ্যালার্ট
            </button>
          </div>

          {/* গতি ও সময়কাল */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">স্ক্রলের গতি:</label>
              <select className={selectInp} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                {SPEEDS.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">মেয়াদকাল (স্থায়ী/প্রিসেট):</label>
              <select className={selectInp} value={expiryMode} onChange={(e) => setExpiryMode(e.target.value)}>
                <option value="none">♾️ সবসময় চলবে (স্থায়ী)</option>
                <option value="preset">প্রিসেট নির্দিষ্ট সময়</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="size-4 accent-rose-600 rounded cursor-pointer" />
            <span>🔊 পাঠকদের জন্য হালকা অ্যালার্ট শব্দ বাজান (Ping Tone)</span>
          </label>

          <button className={btnPrimary} onClick={handleSaveItem} disabled={busy}>
            {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "ব্রেকিং আপডেট করুন" : "🚀 GO LIVE (ব্রেকিং প্রকাশ করুন)"}
          </button>
        </div>
      )}

      {/* ট্যাব ২: বেজ স্টুডিও */}
      {activeTab === "badge" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
              <Settings2 className="size-4 text-cyan-600" />
              <span>ব্রেকিং বেজ ও [সংক্ষেপ] ডিজাইন স্টুডিও</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">১. বেজ আইকন (২০টি আইকন):</label>
              <select className={selectInp} value={badgeCfg.icon} onChange={(e) => setBadgeCfg({ ...badgeCfg, icon: e.target.value })}>
                {TICKER_BADGE_ICONS.map((ic) => <option key={ic.key} value={ic.key}>{ic.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">২. আইকন অ্যানিমেশন (৩০টি ইফেক্ট):</label>
              <select className={selectInp} value={badgeCfg.icon_animation} onChange={(e) => setBadgeCfg({ ...badgeCfg, icon_animation: e.target.value })}>
                {TICKER_ANIMATIONS.map((an) => <option key={an.key} value={an.key}>{an.label}</option>)}
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 block">৩. প্রধান লেখা ও ব্যাকগ্রাউন্ড রঙ:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} value={badgeCfg.badge_text} onChange={(e) => setBadgeCfg({ ...badgeCfg, badge_text: e.target.value })} placeholder="যেমন: সর্বশেষ" />
              <div className="flex items-center gap-2">
                <input type="color" value={badgeCfg.bg_color} onChange={(e) => setBadgeCfg({ ...badgeCfg, bg_color: e.target.value })} className="size-8 rounded border bg-white cursor-pointer" />
                <input className="w-24 border rounded-lg px-2 py-1 text-xs font-mono bg-white" value={badgeCfg.bg_color} onChange={(e) => setBadgeCfg({ ...badgeCfg, bg_color: e.target.value })} />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl py-3 font-bold text-sm shadow cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-98"
            onClick={handleSaveBadgeConfig}
            disabled={busy}
          >
            <Sparkles className="size-4" />
            <span>{busy ? "সংরক্ষণ হচ্ছে..." : "ব্রেকিং বেজ ডিজাইন সেভ করুন"}</span>
          </button>
        </div>
      )}

      {/* তালিকা সেকশন */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-sm text-slate-800">সব শিরোনাম ({bn(list.length)})</h3>
        {list.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-xs p-3.5 text-sm space-y-2 border border-slate-200">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-xs text-cyan-800">
                #{bn(i + 1)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 text-xs sm:text-sm break-words">{s.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  {s.is_active ? <span className="text-emerald-700 font-bold">● সক্রিয়</span> : <span className="text-slate-400">বন্ধ</span>}
                  <span>· {bn(s.title.length)} অক্ষর</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleActive(s)}
                className={`h-5 w-9 rounded-full transition-colors cursor-pointer relative ${s.is_active ? "bg-emerald-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${s.is_active ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-2 text-xs font-bold">
              <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-slate-600 hover:text-slate-800 disabled:opacity-30">⬆ উপরে</button>
              <button type="button" onClick={() => moveItem(i, 1)} disabled={i === list.length - 1} className="text-slate-600 hover:text-slate-800 disabled:opacity-30">⬇ নিচে</button>
              <button type="button" onClick={() => startEdit(s)} className="text-cyan-700 hover:underline ml-auto">এডিট</button>
              <button type="button" onClick={() => removeItem(s.id)} className="text-rose-600 hover:underline">মুছুন</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
