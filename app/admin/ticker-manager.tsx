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
import { refreshAuthToken, isJwtExpired, login } from "../../lib/sb"
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

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600 transition"
const selectInp = "w-full border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-green-600 transition"
const btnPrimary = "w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-bold text-sm shadow cursor-pointer transition disabled:opacity-50"

const DEF_TEXT = "#1e293b"
const DEF_BG = "#ffffff"

function formatTimeLeft(iso: string, now: number) {
  const s = Math.floor((new Date(iso).getTime() - now) / 1000)
  if (s <= 0) return null
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${bn(d)} দিন ${bn(h)} ঘণ্টা`
  if (h > 0) return `${bn(h)} ঘণ্টা ${bn(m)} মিনিট`
  if (m > 0) return `${bn(m)} মিনিট`
  return `${bn(s)} সেকেন্ড`
}

export default function TickerManager({ token: initialToken, author }: { token: string; author: string }) {
  const [token, setToken] = useState(initialToken)
  const [activeTab, setActiveTab] = useState<"items" | "badge">("items")

  const [list, setList] = useState<TickerItem[]>([])
  const [badgeCfg, setBadgeCfg] = useState<TickerBadgeConfig>(DEFAULT_TICKER_BADGE_CONFIG)
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // রি-লগইন মোডাল স্টেট (যাতে টাইপ করা লেখা নষ্ট না হয়)
  const [showReLogin, setShowReLogin] = useState(false)
  const [reLoginEmail, setReLoginEmail] = useState("")
  const [reLoginPassword, setReLoginPassword] = useState("")
  const [reLoginBusy, setReLoginBusy] = useState(false)

  // টিকার আইটেম স্টেট (আনলিমিটেড টেক্সট)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState<TickerLevel>("normal")
  const [textColor, setTextColor] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string | null>(null)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [sound, setSound] = useState(false)

  // ⭐ ডিফল্ট মেয়াদ স্থায়ী (মেয়াদের কোনো বাধা থাকবে না) ⭐
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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // ভ্যালিড টোকেন পাওয়ার অটো ফাংশন
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
    setExpiryMode("none") // ডিফল্ট সবসময় স্থায়ী
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
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function calculateExpiry(): string | null {
    if (expiryMode === "none") return null // স্থায়ী
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

  // ⭐ ব্রেকিং সংরক্ষণ (একের পর এক যত খুশি টিকার যোগ করা যাবে) ⭐
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
          // নতুন টিকার ক্রমানুসারে সিরিয়ালে যুক্ত হবে
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

      setMsg("🚀 ব্রেকিং সফলভাবে যুক্ত হয়েছে! এটি সাইটে যুক্ত হয়ে গেছে এবং একটার পর একটা ধারাবাহিকভাবে চলবে।")
      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "পোস্ট করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  // ব্রেকিং বেজ সেটিংস সংরক্ষণ
  async function handleSaveBadgeConfig() {
    setBusy(true)
    setMsg("")
    try {
      let activeTok = await getActiveToken()
      try {
        await saveTickerBadgeConfig(activeTok, badgeCfg)
      } catch (err: any) {
        if (/jwt|expired|token/i.test(err?.message || "")) {
          const fresh = await refreshAuthToken()
          if (fresh) {
            await saveTickerBadgeConfig(fresh, badgeCfg)
          } else {
            setShowReLogin(true)
            setBusy(false)
            return
          }
        } else {
          throw err
        }
      }
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
      if (/jwt|expired|token/i.test(e?.message || "")) {
        const fresh = await refreshAuthToken()
        if (fresh) {
          setToken(fresh)
          try {
            await updateTickerItem(fresh, id, data)
            return
          } catch {}
        }
        setShowReLogin(true)
      }
      setList(prev)
    }
  }

  // সুইচ অন/অফ লজিক (অন করলেই মেয়াদের বাধা ছাড়া সরাসরি একটার পর একটা ঘুরবে)
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
    } catch (e: any) {
      setList(prev)
      if (/jwt|expired|token/i.test(e?.message || "")) setShowReLogin(true)
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
    } catch (e: any) {
      setList(prev)
      if (/jwt|expired|token/i.test(e?.message || "")) setShowReLogin(true)
    }
  }

  // পাসওয়ার্ড দিয়ে তাৎক্ষণিক রি-লগইন (টাইপ করা লেখা হারাবে না)
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
      setMsg("✅ সেশন সফলভাবে রিনিউ হয়েছে! এবার নিচের বাটনে চাপ দিন।")
      await load()
    } catch (err: any) {
      alert("লগইন ব্যর্থ: " + (err?.message || "ইমেইল বা পাসওয়ার্ড ভুল"))
    }
    setReLoginBusy(false)
  }

  const liveCount = list.filter((t) => t.is_active !== false).length

  return (
    <div className="space-y-4">
      {/* দ্রুত রি-লগইন পপআপ */}
      {showReLogin && (
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded-2xl space-y-2.5 text-xs text-red-950 animate-in fade-in shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-sm text-red-800">
              <Lock className="size-4" /> সেশনের মেয়াদ শেষ — ঝটপট রি-লগইন করুন
            </span>
            <button type="button" onClick={() => setShowReLogin(false)} className="text-gray-500 underline font-bold">বন্ধ</button>
          </div>
          <p className="text-[11px] text-gray-700">
            💡 আপনার টাইপ করা শিরোনামটি সুরক্ষিত আছে, মুছে যায়নি। শুধু পাসওয়ার্ড দিয়ে রি-লগইন করুন:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              className={inp}
              placeholder="আপনার জিমেইল"
              type="email"
              value={reLoginEmail}
              onChange={(e) => setReLoginEmail(e.target.value)}
            />
            <input
              className={inp}
              placeholder="পাসওয়ার্ড"
              type="password"
              value={reLoginPassword}
              onChange={(e) => setReLoginPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleQuickReLogin}
            disabled={reLoginBusy}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded-xl transition cursor-pointer"
          >
            {reLoginBusy ? "লগইন হচ্ছে..." : "✓ রি-লগইন করে সাথে সাথে পোস্ট করুন"}
          </button>
        </div>
      )}

      {/* ট্যাব সুইচ */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("items")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "items" ? "bg-red-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Radio className="size-4" />
          <span>১. ব্রেকিং প্রকাশ ({list.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("badge")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "badge" ? "bg-red-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Palette className="size-4" />
          <span>২. ব্রেকিং বেজ ও [সংক্ষেপ] স্টুডিও</span>
        </button>
      </div>

      {msg && (
        <div className={`text-xs sm:text-sm font-bold text-center p-3 rounded-xl border ${
          msg.includes("❌") ? "text-red-800 bg-red-50 border-red-200" : "text-green-900 bg-green-50 border-green-200"
        }`}>
          {msg}
        </div>
      )}

      {/* লাইভ প্রিভিউ বার */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs">
          <span className="text-green-400 font-bold flex items-center gap-1.5">
            <Eye className="size-3.5" /> 👁️ লাইভ প্রিভিউ:
          </span>
          <span className="text-[10px] text-amber-400 font-semibold">
            {liveCount}টি ব্রেকিং ধারাবাহিকভাবে একটার পর একটা চলবে
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 flex items-center bg-white text-navy text-xs sm:text-sm">
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

      {/* ট্যাব ১: ব্রেকিং প্রকাশ ও সময় নিয়ন্ত্রণ */}
      {activeTab === "items" && (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <span>{editId ? "✏️ ব্রেকিং শিরোনাম এডিট করুন" : "⚡ নতুন ব্রেকিং যুক্ত করুন"}</span>
            </h2>

            {/* নতুন টিকার লেখার বাটন */}
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="size-3.5" /> + নতুন আরেকটি লিখুন
              </button>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700">
                ব্রেকিং শিরোনাম * (সীমাহীন অক্ষর):
              </label>
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                মোট {bn(title.length)} টি অক্ষর (আনলিমিটেড)
              </span>
            </div>
            <textarea
              className={inp}
              rows={3}
              placeholder="আপনার ইচ্ছামতো যেকোনো দৈর্ঘ্যের ব্রেকিং সংবাদ এখানে লিখুন বা পেস্ট করুন..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">মূল সংবাদের লিংক (ঐচ্ছিক):</label>
            <input
              className={inp}
              placeholder="https://... অথবা /post/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              💡 লিংক না দিলে শিরোনামের আগে স্বয়ংক্রিয়ভাবে <span className="font-bold text-red-600">{badgeCfg.brief_text || "[সংক্ষেপ]"}</span> দেখাবে।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => presetLevel("normal")}
              className={`rounded-xl py-2 text-xs font-bold border cursor-pointer transition ${
                level === "normal" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-700"
              }`}
            >
              সাধারণ
            </button>
            <button
              type="button"
              onClick={() => presetLevel("urgent")}
              className={`rounded-xl py-2 text-xs font-bold border cursor-pointer transition ${
                level === "urgent" ? "bg-red-600 text-white border-red-600" : "bg-white text-red-600"
              }`}
            >
              🚨 রেড অ্যালার্ট
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border">
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">লেখার রং:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor || DEF_TEXT}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="size-8 rounded border bg-white p-0.5 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setTextColor(null)}
                  className="text-xs underline text-gray-500 cursor-pointer"
                >
                  {textColor ? "রিসেট" : "ডিফল্ট ✓"}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">পিছনের রং:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor || DEF_BG}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="size-8 rounded border bg-white p-0.5 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setBgColor(null)}
                  className="text-xs underline text-gray-500 cursor-pointer"
                >
                  {bgColor ? "রিসেট" : "ডিফল্ট ✓"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">স্ক্রলের গতি:</label>
            <select className={inp} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              {SPEEDS.map((p) => (
                <option key={p.v} value={p.v}>{p.t}</option>
              ))}
            </select>
          </div>

          {/* মেয়াদের অপশন */}
          <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                <Clock className="size-4 text-red-600" /> কতক্ষণ টিকারে চলবে:
              </span>
              <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {expiryMode === "none" ? "✓ সবসময় চলবে (স্থায়ী)" : "নির্দিষ্ট সময় পর থামবে"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setExpiryMode("none")}
                className={`py-2 px-2 rounded-lg border font-bold cursor-pointer transition ${
                  expiryMode === "none" ? "bg-red-600 text-white border-red-600 shadow" : "bg-white text-gray-700"
                }`}
              >
                ♾️ স্থায়ী (অফ/ডিলিট না করা পর্যন্ত)
              </button>
              <button
                type="button"
                onClick={() => setExpiryMode("preset")}
                className={`py-2 px-2 rounded-lg border font-semibold cursor-pointer transition ${
                  expiryMode === "preset" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700"
                }`}
              >
                প্রিসেট সময়
              </button>
              <button
                type="button"
                onClick={() => setExpiryMode("custom")}
                className={`py-2 px-2 rounded-lg border font-semibold cursor-pointer transition ${
                  expiryMode === "custom" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700"
                }`}
              >
                ✍️ কাস্টম লিখুন
              </button>
              <button
                type="button"
                onClick={() => setExpiryMode("datetime")}
                className={`py-2 px-2 rounded-lg border font-semibold cursor-pointer transition ${
                  expiryMode === "datetime" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700"
                }`}
              >
                📅 ক্যালেন্ডার নির্বাচন
              </button>
            </div>

            {expiryMode === "preset" && (
              <select
                className={inp}
                value={presetDuration}
                onChange={(e) => setPresetDuration(e.target.value)}
              >
                <option value="60">১ ঘণ্টা</option>
                <option value="120">২ ঘণ্টা</option>
                <option value="360">৬ ঘণ্টা</option>
                <option value="720">১২ ঘণ্টা</option>
                <option value="1440">১ দিন (২৪ ঘণ্টা)</option>
                <option value="4320">৩ দিন</option>
                <option value="10080">৭ দিন</option>
              </select>
            )}

            {expiryMode === "custom" && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  className="w-28 border rounded-xl px-3 py-2 text-sm bg-white font-bold"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                />
                <select
                  className={inp}
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as any)}
                >
                  <option value="min">মিনিট</option>
                  <option value="hour">ঘণ্টা</option>
                  <option value="day">দিন</option>
                </select>
              </div>
            )}

            {expiryMode === "datetime" && (
              <input
                type="datetime-local"
                className={inp}
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer p-2 bg-gray-50 rounded-xl border">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="size-4 accent-red-600 rounded cursor-pointer"
            />
            <span>🔊 পাঠকদের জন্য হালকা অ্যালার্ট শব্দ বাজান (Ping Tone)</span>
          </label>

          <button className={btnPrimary} onClick={handleSaveItem} disabled={busy}>
            {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "ব্রেকিং আপডেট করুন" : "🚀 GO LIVE (ব্রেকিং প্রকাশ করুন)"}
          </button>
        </div>
      )}

      {/* ট্যাব ২: ব্রেকিং বেজ ও [সংক্ষেপ] স্টুডিও */}
      {activeTab === "badge" && (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
                <Settings2 className="size-4 text-red-600" />
                <span>ব্রেকিং বেজ ও [সংক্ষেপ] ডিজাইন স্টুডিও</span>
              </h2>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              ১. ব্রেকিং বেজ আইকন (২০টি আইকন):
            </label>
            <select
              className={selectInp}
              value={badgeCfg.icon}
              onChange={(e) => setBadgeCfg({ ...badgeCfg, icon: e.target.value })}
            >
              {TICKER_BADGE_ICONS.map((ic) => (
                <option key={ic.key} value={ic.key}>{ic.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              ২. বেজ আইকনের অ্যানিমেশন (৩০টি ইফেক্ট):
            </label>
            <select
              className={selectInp}
              value={badgeCfg.icon_animation}
              onChange={(e) => setBadgeCfg({ ...badgeCfg, icon_animation: e.target.value })}
            >
              {TICKER_ANIMATIONS.map((an) => (
                <option key={an.key} value={an.key}>{an.label}</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border space-y-3">
            <p className="text-xs font-bold text-gray-800">৩. ব্রেকিং বেজের লেখা ও রঙ:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-600 block mb-0.5">প্রধান লেখা (যেমন: সর্বশেষ):</label>
                <input
                  className={inp}
                  value={badgeCfg.badge_text}
                  onChange={(e) => setBadgeCfg({ ...badgeCfg, badge_text: e.target.value })}
                  placeholder="যেমন: সর্বশেষ / ব্রেকিং"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-600 block mb-0.5">উপ-লেখা (যেমন: LIVE UPDATES):</label>
                <input
                  className={inp}
                  value={badgeCfg.badge_subtext}
                  onChange={(e) => setBadgeCfg({ ...badgeCfg, badge_subtext: e.target.value })}
                  placeholder="যেমন: LIVE UPDATES"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">লেখার রঙ (Text Color):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeCfg.text_color}
                    onChange={(e) => setBadgeCfg({ ...badgeCfg, text_color: e.target.value })}
                    className="size-8 rounded border bg-white cursor-pointer"
                  />
                  <input
                    className="w-24 border rounded-lg px-2 py-1 text-xs font-mono"
                    value={badgeCfg.text_color}
                    onChange={(e) => setBadgeCfg({ ...badgeCfg, text_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 block mb-1">লেখার অ্যানিমেশন (৩০টি ইফেক্ট):</label>
                <select
                  className={selectInp}
                  value={badgeCfg.text_animation}
                  onChange={(e) => setBadgeCfg({ ...badgeCfg, text_animation: e.target.value })}
                >
                  {TICKER_ANIMATIONS.map((an) => (
                    <option key={an.key} value={an.key}>{an.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border space-y-3">
            <p className="text-xs font-bold text-gray-800">৪. ব্রেকিং বেজের ব্যাকগ্রাউন্ড ও অ্যানিমেশন:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">প্রাথমিক ব্যাকগ্রাউন্ড রঙ:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeCfg.bg_color}
                    onChange={(e) => setBadgeCfg({ ...badgeCfg, bg_color: e.target.value })}
                    className="size-8 rounded border bg-white cursor-pointer"
                  />
                  <input
                    className="w-24 border rounded-lg px-2 py-1 text-xs font-mono"
                    value={badgeCfg.bg_color}
                    onChange={(e) => setBadgeCfg({ ...badgeCfg, bg_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 block mb-1">গ্রেডিয়েন্টের ২য় রঙ (ঐচ্ছিক):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeCfg.bg_color2 || "#991b1b"}
                    onChange={(e) => setBadgeCfg({ ...badgeCfg, bg_color2: e.target.value })}
                    className="size-8 rounded border bg-white cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setBadgeCfg({ ...badgeCfg, bg_color2: undefined })}
                    className="text-xs text-red-600 underline"
                  >
                    সলিড করুন
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-600 block mb-1">ব্যাকগ্রাউন্ড অ্যানিমেশন (৮টি ইফেক্ট):</label>
              <select
                className={selectInp}
                value={badgeCfg.bg_animation}
                onChange={(e) => setBadgeCfg({ ...badgeCfg, bg_animation: e.target.value })}
              >
                {TICKER_BG_ANIMATIONS.map((an) => (
                  <option key={an.key} value={an.key}>{an.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-950">৫. টিকারে [সংক্ষেপ] লেবেল সেটিংস:</p>
              <label className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeCfg.show_brief}
                  onChange={(e) => setBadgeCfg({ ...badgeCfg, show_brief: e.target.checked })}
                  className="size-4 accent-amber-600 rounded"
                />
                <span>দেখান</span>
              </label>
            </div>

            {badgeCfg.show_brief && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] text-gray-700 block mb-1">লেবেলের টেক্সট (যেমন: [সংক্ষেপ] বা [আপডেট]):</label>
                  <input
                    className={inp}
                    value={badgeCfg.brief_text}
                    onChange={(e) => setBadgeCfg({ ...badgeCfg, brief_text: e.target.value })}
                    placeholder="[সংক্ষেপ]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-600 block mb-1">টেক্সট রঙ:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={badgeCfg.brief_color}
                        onChange={(e) => setBadgeCfg({ ...badgeCfg, brief_color: e.target.value })}
                        className="size-7 rounded border bg-white cursor-pointer"
                      />
                      <input
                        className="w-20 border rounded px-1.5 py-0.5 text-xs font-mono"
                        value={badgeCfg.brief_color}
                        onChange={(e) => setBadgeCfg({ ...badgeCfg, brief_color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-600 block mb-1">ব্যাকগ্রাউন্ড রঙ:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={badgeCfg.brief_bg_color || "#fee2e2"}
                        onChange={(e) => setBadgeCfg({ ...badgeCfg, brief_bg_color: e.target.value })}
                        className="size-7 rounded border bg-white cursor-pointer"
                      />
                      <input
                        className="w-20 border rounded px-1.5 py-0.5 text-xs font-mono"
                        value={badgeCfg.brief_bg_color}
                        onChange={(e) => setBadgeCfg({ ...badgeCfg, brief_bg_color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-600 block mb-1">অ্যানিমেশন (৩০টি):</label>
                    <select
                      className={selectInp}
                      value={badgeCfg.brief_animation}
                      onChange={(e) => setBadgeCfg({ ...badgeCfg, brief_animation: e.target.value })}
                    >
                      {TICKER_ANIMATIONS.map((an) => (
                        <option key={an.key} value={an.key}>{an.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 font-bold text-sm shadow cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            onClick={handleSaveBadgeConfig}
            disabled={busy}
          >
            <Sparkles className="size-4" />
            <span>{busy ? "সংরক্ষণ হচ্ছে..." : "ব্রেকিং বেজ ও ডিজাইন সেভ করুন"}</span>
          </button>
        </div>
      )}

      {/* তালিকা সেকশন */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm sm:text-base text-gray-800">
            সব শিরোনাম ({bn(list.length)})
          </h2>
          <span className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            🔄 {bn(liveCount)}টি ব্রেকিং ধারাবাহিকভাবে সাইটে ঘুরবে
          </span>
        </div>

        {list.map((s, i) => {
          return (
            <div key={s.id} className="bg-white rounded-2xl shadow p-3.5 text-sm space-y-2 border border-gray-100">
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-xs text-red-800">
                  #{bn(i + 1)}
                </span>

                <div className="min-w-0 flex-1 space-y-1">
                  <div
                    className="rounded-lg border px-2.5 py-1.5 font-semibold text-xs sm:text-sm break-words"
                    style={{ background: s.bg_color || DEF_BG, color: s.text_color || DEF_TEXT }}
                  >
                    {!s.url && badgeCfg.show_brief && badgeCfg.brief_text && (
                      <span
                        className="mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          color: badgeCfg.brief_color || "#c8102e",
                          backgroundColor: badgeCfg.brief_bg_color || "#fee2e2",
                        }}
                      >
                        {badgeCfg.brief_text}
                      </span>
                    )}
                    <span>{s.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 pt-0.5">
                    {s.is_active ? (
                      <span className="text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle className="size-3.5" /> ক্রমানুসারে লাইভ চলবে
                      </span>
                    ) : (
                      <span className="text-gray-400">বন্ধ আছে</span>
                    )}
                    <span>· {bn(s.title.length)} অক্ষর</span>
                    {s.sound_alert && <span>· 🔊 শব্দ</span>}
                    {s.url && <span>· 🔗 লিংক</span>}
                  </div>
                </div>

                <button
                  role="switch"
                  aria-checked={s.is_active}
                  aria-label="চালু/বন্ধ"
                  onClick={() => toggleActive(s)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                    s.is_active ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      s.is_active ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t pt-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="rounded-lg border px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <ArrowUp className="size-3" /> উপরে
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(i, 1)}
                  disabled={i === list.length - 1}
                  className="rounded-lg border px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <ArrowDown className="size-3" /> নিচে
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="text-green-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="size-3" /> এডিট
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(s.id)}
                  className="text-red-600 hover:underline cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="size-3" /> মুছুন
                </button>
              </div>
            </div>
          )
        })}

        {list.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-6 bg-white rounded-2xl border">
            বর্তমানে কোনো ব্রেকিং শিরোনাম নেই। উপরের ফর্ম পূরণ করে যোগ করুন।
          </p>
        )}
      </div>
    </div>
  )
}
