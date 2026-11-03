"use client"

import { useEffect, useState } from "react"
import { uploadImage } from "@/lib/sb"
import {
  FONTS,
  TEXT_SIZES,
  TEXT_STYLES,
  TEXT_EFFECTS_30,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getHeroSettings,
  saveHeroSettings,
  getRecentPosts,
} from "@/lib/hero"
import type { HeroSlide, SubMediaItem } from "@/lib/hero"
import { HeroMediaBuilder } from "@/components/hero/HeroMediaBuilder"

// সেফ ইউটিলিটি ফাংশন
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

function hexToRgba(hex: any, opacity: any) {
  const alpha = (Number(opacity) || 60) / 100
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0, 0, 0, ${alpha})`
  try {
    let c = hex.substring(1)
    if (c.length === 3) c = c.split('').map((x) => x + x).join('')
    const num = parseInt(c, 16)
    if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
  } catch {
    return `rgba(0, 0, 0, ${alpha})`
  }
}

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-950 text-white focus:outline-none focus:border-green-500 transition-all"
const btnSave = "w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50 shadow-lg cursor-pointer"
const cardBox = "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"

export default function HeroManager({ token, shrink }: { token: string; shrink: (f: File) => Promise<Blob> }) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; image_url?: string; summary?: string }>>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // ট্যাব নেভিগেশন
  const [activeTab, setActiveTab] = useState<"media" | "text" | "card" | "publish">("media")
  const [editId, setEditId] = useState<string | null>(null)

  // ব্রেকিং মোড সেটিংস
  const [bOn, setBOn] = useState(false)
  const [bTitle, setBTitle] = useState("")
  const [bText, setBText] = useState("")
  const [bLink, setBLink] = useState("")
  const [bBtnText, setBBtnText] = useState("বিস্তারিত")

  // পোস্টের মূল তথ্য (সব ঐচ্ছিক)
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [linkUrl, setLinkUrl] = useState("")

  // সাব-স্লাইড মিডিয়া এবং ০-১০০% স্পিড
  const [mediaItems, setMediaItems] = useState<SubMediaItem[]>([
    { id: "1", type: "color", color: "#0f172a", gradient: "linear-gradient(135deg, #1e293b, #0f172a)" }
  ])
  const [slideDuration, setSlideDuration] = useState<number>(5000)
  const [slideSpeedPct, setSlideSpeedPct] = useState<number>(30)

  // ৩০টি টেক্সট অ্যানিমেশন ও স্টাইল সেটিংস
  const [textEffect, setTextEffect] = useState("fade-up")
  const [textEffectSpeed, setTextEffectSpeed] = useState<number>(50)
  const [titleFont, setTitleFont] = useState(FONTS[0].value)
  const [titleSize, setTitleSize] = useState("2xl")
  const [titleStyle, setTitleStyle] = useState("bold")
  const [titleColor, setTitleColor] = useState("#FFFFFF")
  const [titleBgColor, setTitleBgColor] = useState("")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")

  const [summaryFont, setSummaryFont] = useState(FONTS[0].value)
  const [summarySize, setSummarySize] = useState("base")
  const [summaryColor, setSummaryColor] = useState("#e2e8f0")

  const [badgeColor, setBadgeColor] = useState("#EAB308")
  const [badgeTextColor, setBadgeTextColor] = useState("#0f172a")
  const [btnBgColor, setBtnBgColor] = useState("#15803d")
  const [btnColor, setBtnColor] = useState("#ffffff")

  // গ্লাস কার্ড কাস্টমাইজেশন
  const [contentPosV, setContentPosV] = useState<"top" | "center" | "bottom">("bottom")
  const [contentPosH, setContentPosH] = useState<"left" | "center" | "right">("left")
  const [showCardBg, setShowCardBg] = useState(true)
  const [cardWidthPct, setCardWidthPct] = useState<number>(90)
  const [cardRadiusPct, setCardRadiusPct] = useState<number>(20)
  const [cardPaddingVal, setCardPaddingVal] = useState<number>(20)
  const [cardBlur, setCardBlur] = useState<number>(12)
  const [cardBgColor, setCardBgColor] = useState("#000000")
  const [cardOpacity, setCardOpacity] = useState<number>(60)

  // ডাটা লোড
  async function loadData() {
    try {
      const [slidesData, postsData, settingsData] = await Promise.all([
        getHeroSlides(token),
        getRecentPosts(),
        getHeroSettings(),
      ])
      setList(Array.isArray(slidesData) ? slidesData : [])
      setPosts(Array.isArray(postsData) ? postsData : [])
      if (settingsData) {
        setBOn(Boolean(settingsData.breaking_on))
        setBTitle(settingsData.breaking_title || "")
        setBText(settingsData.breaking_text || "")
        setBLink(settingsData.breaking_link || "")
        setBBtnText(settingsData.breaking_btn_text || "বিস্তারিত")
      }
    } catch {}
  }

  useEffect(() => {
    loadData()
  }, [token])

  // ফাইল আপলোড মেথড
  async function handleFileUpload(idx: number, file: File) {
    setBusy(true)
    try {
      const safeShrink = typeof shrink === "function" ? shrink : async (f: File) => f
      const fileToUpload = file.type.startsWith("video/") ? file : await safeShrink(file)
      const url = await uploadImage(token, fileToUpload)
      const updated = [...mediaItems]
      updated[idx] = { ...updated[idx], url }
      setMediaItems(updated)
      setMsg("✅ ফাইল সফলভাবে আপলোড হয়েছে")
    } catch {
      setMsg("❌ ফাইল আপলোড ব্যর্থ হয়েছে")
    }
    setBusy(false)
  }

  // পোস্ট সিলেক্ট করলে ডাটা স্বয়ংক্রিয়ভাবে ফর্মে আসা
  function handlePostSelect(postId: string) {
    const p = posts.find((x) => x.id === postId)
    if (!p) return
    setTitle(p.title || "")
    if (p.summary) setSummary(p.summary)
    if (p.image_url) {
      setMediaItems([{ id: "p1", type: "image", url: p.image_url, link: `/post/${p.id}` }])
    }
    setLinkUrl(`/post/${p.id}`)
    setBtnText("বিস্তারিত পড়ুন")
    setMsg("✅ পোস্টের তথ্য ফর্মে যুক্ত হয়েছে")
  }

  // ফর্ম রিসেট
  function resetForm() {
    setEditId(null)
    setTitle("")
    setSummary("")
    setCategory("")
    setBtnText("বিস্তারিত")
    setLinkUrl("")
    setMediaItems([{ id: "1", type: "color", color: "#0f172a", gradient: "linear-gradient(135deg, #1e293b, #0f172a)" }])
    setSlideDuration(5000)
    setSlideSpeedPct(30)
    setTextEffect("fade-up")
    setActiveTab("media")
  }

  // এডিট শুরু
  function startEdit(slide: HeroSlide) {
    setEditId(slide.id)
    setTitle(slide.title || "")
    setSummary(slide.summary || "")
    setCategory(slide.category || "")
    setBtnText(slide.button_text || "বিস্তারিত")
    setLinkUrl(slide.link_url || "")
    if (slide.media_items && Array.isArray(slide.media_items) && slide.media_items.length > 0) {
      setMediaItems(slide.media_items)
    }
    setSlideDuration(slide.slide_duration || 5000)
    setSlideSpeedPct(slide.slide_speed_pct || 30)
    setTextEffect(slide.text_effect || "fade-up")
    setTextEffectSpeed(slide.text_effect_speed || 50)
    setTitleFont(slide.title_font || FONTS[0].value)
    setTitleSize(slide.title_size || "2xl")
    setTitleColor(slide.title_color || "#FFFFFF")
    setTitleBgColor(slide.title_bg_color || "")
    setTextAlign((slide.text_align as any) || "left")
    setShowCardBg(slide.show_card_bg ?? true)
    setCardWidthPct(slide.card_width_pct || 90)
    setCardRadiusPct(slide.card_radius_pct || 20)
    setCardBgColor(slide.card_bg_color || "#000000")
    setCardOpacity(slide.card_opacity || 60)
    setActiveTab("media")
    window.scrollTo({ top: 300, behavior: "smooth" })
  }

  // স্লাইড সংরক্ষণ (নতুন পোস্ট সবসময় উপরে যাবে)
  async function handleSave() {
    setBusy(true)
    setMsg("")
    try {
      const data: Partial<HeroSlide> = {
        title: title.trim() || null,
        summary: summary.trim() || null,
        category: category.trim() || null,
        button_text: btnText.trim() || "বিস্তারিত",
        link_url: linkUrl.trim() || null,
        media_items: mediaItems,
        slide_duration: Number(slideDuration),
        slide_speed_pct: Number(slideSpeedPct),
        text_effect: textEffect,
        text_effect_speed: Number(textEffectSpeed),
        title_font: titleFont,
        title_size: titleSize,
        title_style: titleStyle,
        title_color: titleColor,
        title_bg_color: titleBgColor.trim() || null,
        text_align: textAlign,
        summary_font: summaryFont,
        summary_size: summarySize,
        summary_color: summaryColor,
        badge_color: badgeColor,
        badge_text_color: badgeTextColor,
        btn_bg_color: btnBgColor,
        btn_color: btnColor,
        content_pos_v: contentPosV,
        content_pos_h: contentPosH,
        show_card_bg: showCardBg,
        card_width_pct: Number(cardWidthPct),
        card_radius_pct: Number(cardRadiusPct),
        card_padding_val: Number(cardPaddingVal),
        card_blur: Number(cardBlur),
        card_bg_color: cardBgColor,
        card_opacity: Number(cardOpacity),
        is_active: true,
      }

      if (editId) {
        await updateHeroSlide(token, editId, data)
        setMsg("✅ পোস্ট ও স্লাইড সফলভাবে আপডেট হয়েছে")
      } else {
        // নতুন পোস্টের sort_order সর্বোচ্চ দেওয়া হবে যাতে তা সর্বদা সবার উপরে থাকে
        await createHeroSlide(token, { ...data, sort_order: Date.now() })
        setMsg("✅ নতুন পোস্ট ও স্লাইড তৈরি হয়েছে এবং সবার উপরে যুক্ত হয়েছে")
      }
      resetForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  // ব্রেকিং মোড অন/অফ
  async function handleBreakingToggle(on: boolean) {
    setBusy(true)
    try {
      await saveHeroSettings(token, {
        breaking_on: on,
        breaking_title: bTitle.trim() || null,
        breaking_text: bText.trim() || null,
        breaking_link: bLink.trim() || null,
        breaking_btn_text: bBtnText.trim() || "বিস্তারিত",
      })
      setBOn(on)
      setMsg(on ? "🔴 জরুরি ব্রেকিং মোড চালু হয়েছে (হোমপেজে উপরে দেখাচ্ছে)" : "✅ ব্রেকিং মোড বন্ধ, স্লাইডার স্বাভাবিক হয়েছে")
    } catch {
      setMsg("❌ ব্রেকিং সেটিংস সংরক্ষণ করা যায়নি")
    }
    setBusy(false)
  }

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-20">
      {/* নোটিফিকেশন মেসেজ */}
      {msg && (
        <div className="p-3.5 bg-blue-950/80 border border-blue-500/40 text-blue-200 rounded-xl text-sm font-medium shadow-lg">
          {msg}
        </div>
      )}

      {/* ১. ব্রেকিং নিউজ কন্ট্রোলার */}
      <div className={cn(cardBox, bOn ? "border-red-600/70 bg-red-950/20" : "")}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className={cn("size-3 rounded-full", bOn ? "bg-red-500 animate-ping" : "bg-gray-600")} />
            <h2 className="font-semibold text-base text-red-400">জরুরি ব্রেকিং নিউজ মোড {bOn ? "(চালু আছে)" : "(বন্ধ)"}</h2>
          </div>
          <button
            onClick={() => handleBreakingToggle(!bOn)}
            disabled={busy}
            className={cn("px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer shadow transition-all", bOn ? "bg-red-600 hover:bg-red-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-gray-300")}
          >
            {bOn ? "ব্রেকিং বন্ধ করুন" : "ব্রেকিং চালু করুন"}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          💡 এটি অন থাকলে হোমপেজের সবার শীর্ষে ব্যানার দেখাবে এবং তার ঠিক নিচেই হিরো স্লাইডার চলবে। অফ থাকলে ব্যানার শূন্যস্থান ছাড়াই উধাও হয়ে যাবে।
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <input className={inp} placeholder="ব্রেকিং শিরোনাম" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
          <input className={inp} placeholder="সংক্ষিপ্ত বিবরণ" value={bText} onChange={(e) => setBText(e.target.value)} />
          <input className={inp} placeholder="ক্লিক লিংক (ঐচ্ছিক)" value={bLink} onChange={(e) => setBLink(e.target.value)} />
        </div>
      </div>

      {/* ২. হিরো স্লাইডার ক্রিয়েটর ড্যাশবোর্ড */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-semibold text-base text-gray-200">
            {editId ? "স্লাইড পোস্ট এডিট করুন" : "নতুন হিরো পোস্ট ও মাল্টি-স্লাইড তৈরি"}
          </h2>
          {editId && <button onClick={resetForm} className="text-xs text-red-400 hover:underline cursor-pointer">বাতিল</button>}
        </div>

        {/* ৪টি ট্যাব বার */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={cn("flex-1 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer transition-all", activeTab === "media" ? "text-green-400 border-green-500 bg-slate-850" : "text-gray-400 border-transparent hover:text-white")}
          >
            🖼️ ১. মিডিয়া ও স্লাইডসমূহ ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={cn("flex-1 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer transition-all", activeTab === "text" ? "text-green-400 border-green-500 bg-slate-850" : "text-gray-400 border-transparent hover:text-white")}
          >
            ✍️ ২. টেক্সট ও ৩০টি ইফেক্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={cn("flex-1 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer transition-all", activeTab === "card" ? "text-green-400 border-green-500 bg-slate-850" : "text-gray-400 border-transparent hover:text-white")}
          >
            🎨 ৩. গ্লাস কার্ড ইফেক্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publish")}
            className={cn("flex-1 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer transition-all", activeTab === "publish" ? "text-green-400 border-green-500 bg-slate-850" : "text-gray-400 border-transparent hover:text-white")}
          >
            🚀 ৪. প্রকাশ ও সংরক্ষণ
          </button>
        </div>

        {/* ট্যাব ১: মিডিয়া ও সাব-স্লাইড বিল্ডার */}
        {activeTab === "media" && (
          <div className="space-y-4 pt-2">
            {posts.length > 0 && !editId && (
              <div>
                <span className="text-xs text-gray-400 block mb-1">ওয়েবসাইটের সাম্প্রতিক পোস্ট থেকে স্বয়ংক্রিয় তথ্য নিন (ঐচ্ছিক):</span>
                <select className={selectInp} onChange={(e) => handlePostSelect(e.target.value)} defaultValue="">
                  <option value="">-- ওয়েবসাইট থেকে খবর বেছে নিন --</option>
                  {posts.map((p) => p && <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            )}

            <HeroMediaBuilder
              mediaItems={mediaItems}
              setMediaItems={setMediaItems}
              slideDuration={slideDuration}
              setSlideDuration={setSlideDuration}
              slideSpeedPct={slideSpeedPct}
              setSlideSpeedPct={setSlideSpeedPct}
              onFileUpload={handleFileUpload}
              busy={busy}
            />

            <button type="button" onClick={() => setActiveTab("text")} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer">
              পরবর্তী ধাপ: টেক্সট ও ৩০টি অ্যানিমেশন নির্বাচন →
            </button>
          </div>
        )}

        {/* ট্যাব ২: টেক্সট, ফন্ট ও ৩০টি অ্যানিমেশন */}
        {activeTab === "text" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <input className={inp} placeholder="শিরোনাম লিখুন (ঐচ্ছিক)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ লিখুন (ঐচ্ছিক)" value={summary} onChange={(e) => setSummary(e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={inp} placeholder="কাস্টম ব্যাজ (যেমন: বিশেষ প্রতিবেদন)" value={category} onChange={(e) => setCategory(e.target.value)} />
                <input className={inp} placeholder="বাটনের নাম (যেমন: বিস্তারিত)" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-amber-400 block">✨ ৩০টি টেক্সট অ্যানিমেশন ও স্টাইলিং:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">অ্যানিমেশন ইফেক্ট:</span>
                  <select className={selectInp} value={textEffect} onChange={(e) => setTextEffect(e.target.value)}>
                    {TEXT_EFFECTS_30.map((ef) => (
                      <option key={ef.value} value={ef.value}>{ef.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">ফন্ট স্টাইল:</span>
                  <select className={selectInp} value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-850">
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">শিরোনাম কালার</span>
                  <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">ব্যাজ কালার</span>
                  <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">বাটন ব্যাকগ্রাউন্ড</span>
                  <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">টেক্সট অ্যালাইনমেন্ট</span>
                  <select className={selectInp} value={textAlign} onChange={(e) => setTextAlign(e.target.value as any)}>
                    <option value="left">বামে</option>
                    <option value="center">মাঝে</option>
                    <option value="right">ডানে</option>
                  </select>
                </label>
              </div>
            </div>

            <button type="button" onClick={() => setActiveTab("card")} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer">
              পরবর্তী ধাপ: গ্লাস কার্ড ইফেক্ট কাস্টমাইজেশন →
            </button>
          </div>
        )}

        {/* ট্যাব ৩: গ্লাস কার্ড কাস্টমাইজেশন */}
        {activeTab === "card" && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-green-400">🎚️ গ্লাস কার্ড আকার, আকৃতি ও অপাসিটি:</span>
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={showCardBg} onChange={(e) => setShowCardBg(e.target.checked)} className="rounded accent-green-600" />
                  কার্ড বক্স দৃশ্যমান
                </label>
              </div>

              {showCardBg && (
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>কার্ডের প্রস্থ (Width):</span>
                      <span className="font-bold text-green-400">{cardWidthPct}%</span>
                    </div>
                    <input type="range" min="20" max="100" value={cardWidthPct} onChange={(e) => setCardWidthPct(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>রাউন্ডনেস (আকৃতি ০% = চারকোনা, ১০০% = সম্পূর্ণ গোল):</span>
                      <span className="font-bold text-green-400">{cardRadiusPct}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={cardRadiusPct} onChange={(e) => setCardRadiusPct(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>স্বচ্ছতা / অপাসিটি:</span>
                      <span className="font-bold text-green-400">{cardOpacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={cardOpacity} onChange={(e) => setCardOpacity(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setActiveTab("publish")} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer">
              পরবর্তী ধাপ: প্রকাশ ও সংরক্ষণ →
            </button>
          </div>
        )}

        {/* ট্যাব ৪: প্রকাশ ও সংরক্ষণ */}
        {activeTab === "publish" && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-gray-300 block">ক্লিক লিঙ্ক (ঐচ্ছিক):</span>
              <input className={inp} placeholder="যেমন: /post/123 বা https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              <p className="text-[11px] text-gray-500">
                💡 লিঙ্ক না দিলে ভিজিটররা সরাসরি স্লাইডের কনটেন্ট ও ভিডিও প্লেয়ার দেখতে পাবেন।
              </p>
            </div>

            <button className={btnSave} onClick={handleSave} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পোস্ট আপডেট করুন" : "নতুন পোস্ট ও স্লাইড প্রকাশ করুন (সবার উপরে যাবে)"}
            </button>
          </div>
        )}
      </div>

      {/* ৩. সমস্ত স্লাইড পোস্টের তালিকা */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-semibold text-base text-gray-200">সব স্লাইড পোস্ট ({list.length})</h2>
          <span className="text-xs text-green-400 font-medium">ক্রম: সর্বশেষ পোস্ট সবার উপরে</span>
        </div>

        <div className="space-y-2.5">
          {list.map((slide) => (
            <div key={slide.id} className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-200">{slide.title || "শিরোনামহীন পোস্ট"}</p>
                <p className="text-xs text-gray-500">
                  {slide.category ? `${slide.category} · ` : ""}সাব-স্লাইড সংখ্যা: {slide.media_items?.length || 1} টি
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(slide)} className="px-3 py-1.5 bg-green-950 border border-green-800/70 text-green-300 rounded-lg text-xs hover:bg-green-900 cursor-pointer">এডিট</button>
                <button onClick={() => deleteHeroSlide(token, slide.id).then(loadData)} className="px-3 py-1.5 bg-red-950 border border-red-800/70 text-red-300 rounded-lg text-xs hover:bg-red-900 cursor-pointer">মুছুন</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-sm text-gray-500 text-center py-4">কোনো স্লাইড পোস্ট নেই।</p>}
        </div>
      </div>
    </div>
  )
}
