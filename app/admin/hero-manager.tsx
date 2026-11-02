"use client"

import { useEffect, useState } from "react"
import { uploadImage } from "../../lib/sb"
import {
  BADGES,
  FONTS,
  FONT_WEIGHTS,
  MAX_LIVE,
  TRANSITIONS,
  BREAKING_BADGES,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getHeroSettings,
  saveHeroSettings,
  getRecentPosts,
} from "../../lib/hero"
import type { HeroSlide } from "../../lib/hero"

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-950 text-white focus:outline-none focus:border-green-500"
const btnSave = "w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50 shadow-lg cursor-pointer"
const cardBox = "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"

const POS = { top: "উপরে", center: "মাঝে", bottom: "নিচে" } as const
const isLive = (s: HeroSlide) => s.is_active && (!s.expires_at || new Date(s.expires_at) > new Date())

export default function HeroManager({ token, shrink }: { token: string; shrink: (f: File) => Promise<Blob> }) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; image_url?: string; summary?: string }>>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // সার্বিক স্লাইডার গতি ও ট্রানজিশন সেটিংস (২০টি ট্রানজিশন)
  const [slideSpeed, setSlideSpeed] = useState<number>(4500)
  const [transType, setTransType] = useState<string>("fade")
  const [textMotion, setTextMotion] = useState<boolean>(true)

  // ডাইনামিক ব্রেকিং মোড স্টেট (২১টি ব্যাজ ও ০-১০০% স্পিড)
  const [bOn, setBOn] = useState(false)
  const [bTitle, setBTitle] = useState("")
  const [bText, setBText] = useState("")
  const [bLink, setBLink] = useState("")
  const [bBtnText, setBBtnText] = useState("বিস্তারিত")
  const [bMediaType, setBMediaType] = useState<"none" | "image" | "video">("none")
  const [bMediaUrl, setBMediaUrl] = useState("")
  const [bFile, setBFile] = useState<File | null>(null)
  const [bBgColor, setBBgColor] = useState("#881337")
  const [bBgGradient, setBBgGradient] = useState("#0f172a")
  const [bBadgeStyle, setBBadgeStyle] = useState("pulse-circle")
  const [bPulseSpeedPct, setBPulseSpeedPct] = useState<number>(50)

  // একক স্লাইড ফর্ম স্টেট
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

  // মিডিয়া, কালার ও ফন্ট স্টেট
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [videoUrl, setVideoUrl] = useState("")
  const [extraMedia, setExtraMedia] = useState("")
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [titleColor, setTitleColor] = useState("#FFFFFF")
  const [titleBgColor, setTitleBgColor] = useState("")
  const [badgeColor, setBadgeColor] = useState("#EAB308")
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)
  const [fontWeight, setFontWeight] = useState("700")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  // কাস্টম পজিশন ও ০-১০০% স্লাইডার
  const [contentPosV, setContentPosV] = useState<"top" | "center" | "bottom">("bottom")
  const [contentPosH, setContentPosH] = useState<"left" | "center" | "right">("left")
  const [showCardBg, setShowCardBg] = useState(true)
  const [cardWidthPct, setCardWidthPct] = useState<number>(90)
  const [cardRadiusPct, setCardRadiusPct] = useState<number>(20)
  const [cardPaddingVal, setCardPaddingVal] = useState<number>(20)
  const [cardBlur, setCardBlur] = useState<number>(12)
  const [cardBgColor, setCardBgColor] = useState("#000000")
  const [cardOpacity, setCardOpacity] = useState<number>(60)

  async function load() {
    setList(await getHeroSlides(token))
    getRecentPosts().then(setPosts)
  }

  useEffect(() => {
    load()
    getHeroSettings().then((s) => {
      if (s) {
        setBOn(s.breaking_on)
        setBTitle(s.breaking_title || "")
        setBText(s.breaking_text || "")
        setBLink(s.breaking_link || "")
        setBBtnText(s.breaking_btn_text || "বিস্তারিত")
        setBMediaType(s.breaking_media_type || "none")
        setBMediaUrl(s.breaking_media_url || "")
        setBBgColor(s.breaking_bg_color || "#881337")
        setBBgGradient(s.breaking_bg_gradient || "#0f172a")
        setBBadgeStyle(s.breaking_badge_style || "pulse-circle")
        setBPulseSpeedPct(s.breaking_pulse_speed_pct ?? 50)
        setSlideSpeed(s.slide_speed ?? 4500)
        setTransType(s.transition_type || "fade")
        setTextMotion(s.text_motion ?? true)
      }
    })
  }, [token])

  function handlePostSelect(postId: string) {
    const p = posts.find((x) => x.id === postId)
    if (!p) return
    setTitle(p.title)
    if (p.summary) setSummary(p.summary)
    if (p.image_url) setOldImage(p.image_url)
    setLink(`/post/${p.id}`)
    setBtnText("বিস্তারিত পড়ুন")
    setMsg("✅ পোস্টের তথ্য ও লিঙ্ক ফর্মে যুক্ত হয়েছে")
  }

  async function saveSliderSettings() {
    try {
      await saveHeroSettings(token, {
        slide_speed: Number(slideSpeed),
        transition_type: transType,
        text_motion: textMotion,
      })
      setMsg("✅ স্লাইডারের ২০টি ট্রানজিশন ও গতি সেটিংস সফলভাবে সেভ হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  async function saveBreaking(on: boolean) {
    setBusy(true)
    try {
      let mediaUrl = bMediaUrl
      if (bFile && bMediaType === "image") {
        mediaUrl = await uploadImage(token, await shrink(bFile))
      }

      await saveHeroSettings(token, {
        breaking_on: on,
        breaking_title: bTitle.trim() || null,
        breaking_text: bText.trim() || null,
        breaking_link: bLink.trim() || null,
        breaking_btn_text: bBtnText.trim() || "বিস্তারিত",
        breaking_media_type: bMediaType,
        breaking_media_url: mediaUrl.trim() || null,
        breaking_bg_color: bBgColor,
        breaking_bg_gradient: bBgGradient,
        breaking_badge_style: bBadgeStyle,
        breaking_pulse_speed_pct: Number(bPulseSpeedPct),
      })
      setBOn(on)
      setMsg(on ? "🔴 ব্রেকিং মোড চালু হয়েছে" : "✅ ব্রেকিং মোড বন্ধ, স্বাভাবিক স্লাইডার ফিরেছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  function reset() {
    setEditId(null)
    setTitle("")
    setSummary("")
    setCategory("")
    setLink("")
    setPos("center")
    setActive(true)
    setExpSel("none")
    setOldExpires(null)
    setOldImage(null)
    setFile(null)
    setMediaType("image")
    setVideoUrl("")
    setExtraMedia("")
    setBtnText("বিস্তারিত")
    setTitleColor("#FFFFFF")
    setTitleBgColor("")
    setBadgeColor("#EAB308")
    setFontFamily(FONTS[0].value)
    setFontWeight("700")
    setTextAlign("left")
    setContentPosV("bottom")
    setContentPosH("left")
    setShowCardBg(true)
    setCardWidthPct(90)
    setCardRadiusPct(20)
    setCardPaddingVal(20)
    setCardBlur(12)
    setCardBgColor("#000000")
    setCardOpacity(60)
    setFitMode("contain")
  }

  function startEdit(s: HeroSlide) {
    setEditId(s.id)
    setTitle(s.title || "")
    setSummary(s.summary || "")
    setCategory(s.category || "")
    setLink(s.link_url || "")
    setPos(s.image_pos)
    setActive(s.is_active)
    setExpSel("keep")
    setOldExpires(s.expires_at)
    setOldImage(s.image_url)
    setFile(null)
    setMediaType(s.media_type || "image")
    setVideoUrl(s.video_url || "")
    setExtraMedia(s.extra_media || "")
    setBtnText(s.button_text || "বিস্তারিত")
    setTitleColor(s.title_color || "#FFFFFF")
    setTitleBgColor(s.title_bg_color || "")
    setBadgeColor(s.badge_color || "#EAB308")
    setFontFamily(s.font_family || FONTS[0].value)
    setFontWeight(s.font_weight || "700")
    setTextAlign(s.text_align || "left")
    setContentPosV(s.content_pos_v || "bottom")
    setContentPosH(s.content_pos_h || "left")
    setShowCardBg(s.show_card_bg ?? true)
    setCardWidthPct(s.card_width_pct ?? 90)
    setCardRadiusPct(s.card_radius_pct ?? 20)
    setCardPaddingVal(s.card_padding_val ?? 20)
    setCardBlur(s.card_blur ?? 12)
    setCardBgColor(s.card_bg_color || "#000000")
    setCardOpacity(s.card_opacity ?? 60)
    setFitMode(s.fit_mode || "contain")
    window.scrollTo({ top: 300, behavior: "smooth" })
  }

  async function save() {
    if (!title.trim() && !file && !oldImage && !videoUrl.trim() && !extraMedia.trim()) {
      setMsg("❌ অন্তত একটি ছবি, ভিডিও অথবা শিরোনাম দিন")
      return
    }
    const l = link.trim()
    if (l && !/^(https?:\/\/|\/)/i.test(l)) {
      setMsg("❌ লিঙ্ক https:// বা / দিয়ে শুরু হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let img = oldImage
      if (file && mediaType === "image") img = await uploadImage(token, await shrink(file))

      let expires: string | null = oldExpires
      if (expSel === "none") expires = null
      else if (expSel !== "keep") expires = new Date(Date.now() + Number(expSel) * 3600 * 1000).toISOString()

      const data = {
        category: category.trim() || null,
        title: title.trim() || null,
        summary: summary.trim() || null,
        image_url: img,
        image_pos: pos,
        link_url: l || null,
        is_active: active,
        expires_at: expires,
        media_type: mediaType,
        video_url: videoUrl.trim() || null,
        extra_media: extraMedia.trim() || null,
        button_text: btnText.trim() || "বিস্তারিত",
        title_color: titleColor,
        title_bg_color: titleBgColor.trim() || null,
        badge_color: badgeColor,
        font_family: fontFamily,
        font_weight: fontWeight,
        text_align: textAlign,
        content_pos_v: contentPosV,
        content_pos_h: contentPosH,
        show_card_bg: showCardBg,
        card_width_pct: Number(cardWidthPct),
        card_radius_pct: Number(cardRadiusPct),
        card_padding_val: Number(cardPaddingVal),
        card_blur: Number(cardBlur),
        card_bg_color: cardBgColor,
        card_opacity: Number(cardOpacity),
        fit_mode: fitMode,
      }
      if (editId) await updateHeroSlide(token, editId, data)
      else {
        const first = list.length ? Math.min(...list.map((s) => s.sort_order)) - 10 : 0
        await createHeroSlide(token, { ...data, sort_order: first })
      }
      reset()
      setMsg("✅ স্লাইড সফলভাবে সংরক্ষণ হয়েছে")
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
    try {
      await fn()
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  const liveList = list.filter(isLive)

  function status(s: HeroSlide) {
    if (!s.is_active) return "লুকানো"
    if (s.expires_at && new Date(s.expires_at) <= new Date()) return "মেয়াদ শেষ"
    const idx = liveList.findIndex((x) => x.id === s.id)
    return `স্লাইডারে আছে (${idx + 1})`
  }

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-16">
      {msg && (
        <div className="p-3.5 bg-blue-950/80 border border-blue-500/40 text-blue-200 rounded-xl text-sm font-medium shadow-lg">
          {msg}
        </div>
      )}

      {/* ========================================================
          সেকশন ১: ২০টি জনপ্রিয় ট্রানজিশন ও সার্বিক স্লাইডার গতি
      ======================================================== */}
      <div className={cardBox}>
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-lg">⚙️</span>
          <h2 className="font-semibold text-base text-gray-200">সার্বিক স্লাইডার গতি ও ২০টি ট্রানজিশন নিয়ন্ত্রণ</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">স্লাইড পরিবর্তনের গতি / সময়</label>
            <select className={selectInp} value={slideSpeed} onChange={(e) => setSlideSpeed(Number(e.target.value))}>
              <option value={0}>♾️ আনলিমিটেড (অটোপ্লে বন্ধ - ভিডিও দেখতে সুবিধা)</option>
              <option value={3000}>৩ সেকেন্ড (দ্রুত)</option>
              <option value={5000}>৫ সেকেন্ড (স্বাভাবিক)</option>
              <option value={8000}>৮ সেকেন্ড (ধীরগতি)</option>
              <option value={15000}>১৫ সেকেন্ড</option>
              <option value={30000}>৩০ সেকেন্ড</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">ট্রানজিশনের ধরন (২০টি জনপ্রিয় অপশন)</label>
            <select className={selectInp} value={transType} onChange={(e) => setTransType(e.target.value)}>
              {TRANSITIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
          <input type="checkbox" checked={textMotion} onChange={(e) => setTextMotion(e.target.checked)} className="rounded accent-green-600" />
          শিরোনামে মোশন অ্যানিমেশন চালু রাখুন
        </label>

        <button onClick={saveSliderSettings} className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2.5 rounded-xl font-medium transition-all">
          গতি ও ট্রানজিশন সংরক্ষণ করুন
        </button>
      </div>

      {/* ========================================================
          সেকশন ২: 🔴 জরুরি ব্রেকিং মোড (২১টি অ্যানিমেটেড ব্যাজ ও ০-১০০% স্পিড)
      ======================================================== */}
      <div className={`${cardBox} ${bOn ? "border-red-600/60 bg-red-950/20" : ""}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-600 animate-pulse" />
            <h2 className="font-semibold text-base text-red-400">জরুরি ব্রেকিং মোড {bOn ? "(চালু আছে)" : "(বন্ধ)"}</h2>
          </div>
          {bOn && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>}
        </div>

        <p className="text-xs text-gray-400">
          চালু করলে সম্পূর্ণ হোমপেজ স্লাইডারের জায়গায় এই ব্রেকিং স্ক্রিনটি দেখাবে।
        </p>

        {/* ২১টি অ্যানিমেটেড ব্রেকিং ব্যাজ ও ০-১০০% স্পিড স্লাইডার */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">২১টি অ্যানিমেটেড ব্যাজ ও স্পিড কন্ট্রোল</span>

          <div>
            <label className="text-xs text-gray-400 block mb-1">অ্যানিমেটেড ব্যাজ/প্রতীক নির্বাচন (২১টি)</label>
            <select className={selectInp} value={bBadgeStyle} onChange={(e) => setBBadgeStyle(e.target.value)}>
              {BREAKING_BADGES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* ০-১০০% শেপ স্পিড স্লাইডার */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>শেপ অ্যানিমেশনের গতি (০-১০০%):</span>
              <span className="font-bold text-red-400">{bPulseSpeedPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={bPulseSpeedPct}
              onChange={(e) => setBPulseSpeedPct(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>
        </div>

        {/* ব্রেকিং মিডিয়া পছন্দ */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
          <span className="text-xs font-semibold text-gray-300 block">মিডিয়া ব্যাকগ্রাউন্ড (ঐচ্ছিক):</span>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="bmedia" checked={bMediaType === "none"} onChange={() => setBMediaType("none")} />
              RGB গ্রেডিয়েন্ট রঙ
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="bmedia" checked={bMediaType === "image"} onChange={() => setBMediaType("image")} />
              ছবি
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="bmedia" checked={bMediaType === "video"} onChange={() => setBMediaType("video")} />
              ভিডিও
            </label>
          </div>

          {bMediaType === "image" && (
            <div className="pt-2">
              <input type="file" accept="image/*" onChange={(e) => setBFile(e.target.files?.[0] || null)} className="text-xs text-gray-400" />
            </div>
          )}

          {bMediaType === "video" && (
            <div className="pt-2">
              <input className={inp} placeholder="ইউটিউব বা ভিডিও লিঙ্ক (https://...)" value={bMediaUrl} onChange={(e) => setBMediaUrl(e.target.value)} />
            </div>
          )}

          {bMediaType === "none" && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">মূল রঙ (RGB 1)</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={bBgColor} onChange={(e) => setBBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent" />
                  <span className="text-xs font-mono">{bBgColor}</span>
                </div>
              </label>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">গ্রেডিয়েন্ট রঙ (RGB 2)</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={bBgGradient} onChange={(e) => setBBgGradient(e.target.value)} className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent" />
                  <span className="text-xs font-mono">{bBgGradient}</span>
                </div>
              </label>
            </div>
          )}
        </div>

        <input className={inp} placeholder="ব্রেকিং শিরোনাম (ঐচ্ছিক)" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" value={bText} onChange={(e) => setBText(e.target.value)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inp} placeholder="বাটন লেখা (ডিফল্ট: বিস্তারিত)" value={bBtnText} onChange={(e) => setBBtnText(e.target.value)} />
          <input className={inp} placeholder="ক্লিক লিঙ্ক (ঐচ্ছিক)" value={bLink} onChange={(e) => setBLink(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => saveBreaking(true)} disabled={busy} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg cursor-pointer">
            {bOn ? "ব্রেকিং মোড আপডেট করুন" : "ব্রেকিং মোড চালু করুন"}
          </button>
          {bOn && (
            <button onClick={() => saveBreaking(false)} disabled={busy} className="flex-1 border border-slate-700 hover:bg-slate-800 text-gray-300 rounded-xl py-3 font-semibold text-sm transition-all cursor-pointer">
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          সেকশন ৩: ➕ নতুন স্লাইড তৈরি / এডিট (একাধিক মিডিয়া সাপোর্টসহ)
      ======================================================== */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">➕</span>
            <h2 className="font-semibold text-base text-gray-200">
              {editId ? "স্লাইড এডিট করুন" : "নতুন স্লাইড তৈরি করুন"}
            </h2>
          </div>
          {editId && <button onClick={reset} className="text-xs text-red-400 hover:underline">বাতিল করুন</button>}
        </div>

        {/* ধাপ ১: কনটেন্ট ও একাধিক মিডিয়া */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider block">১. কনটেন্ট ও মিডিয়া নির্বাচন</span>

          {posts.length > 0 && !editId && (
            <div>
              <span className="text-xs text-gray-400 block mb-1">ওয়েবসাইটের পোস্ট থেকে নির্বাচন করুন (এক ক্লিকে অটো-ফিল):</span>
              <select className={selectInp} onChange={(e) => handlePostSelect(e.target.value)} defaultValue="">
                <option value="">-- ওয়েবসাইট থেকে খবর বেছে নিন --</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-5 text-xs pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input type="radio" name="mtype" checked={mediaType === "image"} onChange={() => setMediaType("image")} />
              🖼️ ছবি আপলোড
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input type="radio" name="mtype" checked={mediaType === "video"} onChange={() => setMediaType("video")} />
              🎥 ভিডিও প্লেয়ার (প্রথম আলোর মতো)
            </label>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <span className="text-gray-300">ছবি/ভিডিওর মাপ:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="fit" checked={fitMode === "contain"} onChange={() => setFitMode("contain")} />
                অটো-ফিট (কাটবে না - প্রমিত)
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="fit" checked={fitMode === "cover"} onChange={() => setFitMode("cover")} />
                ফুল-কভার (পুরো স্ক্রিন)
              </label>
            </div>
          </div>

          {mediaType === "video" ? (
            <div>
              <span className="text-xs text-gray-400 block mb-1">মূল ইউটিউব বা ভিডিও লিঙ্ক</span>
              <input className={inp} placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-2">
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs text-gray-400" />
              {(file || oldImage) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file ? URL.createObjectURL(file) : oldImage || ""}
                  alt=""
                  className="w-full h-36 object-contain bg-black rounded-lg border border-slate-800"
                />
              )}
            </div>
          )}

          {/* একাধিক মিডিয়া / নেস্টেড স্লাইড শো */}
          <div>
            <span className="text-xs text-gray-400 block mb-1">একাধিক ছবি/ভিডিও লিঙ্ক (ঐচ্ছিক - প্রতি লাইনে একটি করে লিঙ্ক দিন):</span>
            <textarea
              className={inp}
              rows={2}
              placeholder="https://...ছবি১.jpg&#10;https://...ছবি২.jpg&#10;https://youtube.com/..."
              value={extraMedia}
              onChange={(e) => setExtraMedia(e.target.value)}
            />
          </div>
        </div>

        {/* ধাপ ২: শিরোনাম ও বিবরণ */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider block">২. লেখা ও ফন্ট স্টাইলিং (ঐচ্ছিক)</span>
          <input className={inp} placeholder="শিরোনাম লিখুন (না চাইলে খালি রাখুন)" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (না চাইলে খালি রাখুন)" value={summary} onChange={(e) => setSummary(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-gray-400 block mb-1">ফন্ট (১০টি)</span>
              <select className={selectInp} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">থিকনেস</span>
              <select className={selectInp} value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
                {FONT_WEIGHTS.map((w) => <option key={w.label} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">টেক্সট দিক</span>
              <select className={selectInp} value={textAlign} onChange={(e) => setTextAlign(e.target.value as any)}>
                <option value="left">বামে (Left)</option>
                <option value="center">মাঝে (Center)</option>
                <option value="right">ডানে (Right)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="block text-xs">
              <span className="text-gray-400 block mb-1">শিরোনাম লেখার রঙ</span>
              <div className="flex items-center gap-2">
                <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                <span className="text-xs font-mono">{titleColor}</span>
              </div>
            </label>
            <label className="block text-xs">
              <span className="text-gray-400 block mb-1">শিরোনাম হাইলাইট রঙ (ঐচ্ছিক)</span>
              <div className="flex items-center gap-2">
                <input type="color" value={titleBgColor || "#000000"} onChange={(e) => setTitleBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                {titleBgColor ? (
                  <button type="button" onClick={() => setTitleBgColor("")} className="text-red-400 text-xs underline">মুছুন</button>
                ) : (
                  <span className="text-gray-500">নেই</span>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* ধাপ ৩: ব্যাজ ও বাটন */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider block">৩. ব্যাজ, বাটন ও লিঙ্ক (ঐচ্ছিক)</span>

          <div>
            <span className="text-xs text-gray-400 block mb-1">ব্যাজের নাম</span>
            <input className={inp} placeholder="কাস্টম ব্যাজ (যেমন: আজকের খবর)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <div className="flex flex-wrap gap-1.5 pt-2">
              {BADGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setCategory(b)}
                  className={`rounded-full px-2.5 py-1 text-xs border transition-all ${category === b ? "bg-green-700 border-green-600 text-white" : "border-slate-800 bg-slate-900 text-gray-300 hover:border-slate-700"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-xs text-gray-400 block mb-1">বাটনের লেখা</span>
              <input className={inp} placeholder="যেমন: বিস্তারিত" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">ক্লিক লিঙ্ক</span>
              <input className={inp} placeholder="না দিলে পপ-আপে পূর্ণ খবর দেখাবে" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ধাপ ৪: গ্লাস কার্ড ও ০-১০০% অত্যাধুনিক কন্ট্রোল */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">৪. গ্লাস কার্ডের আকার ও অবস্থান নিয়ন্ত্রণ</span>
            <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
              <input type="checkbox" checked={showCardBg} onChange={(e) => setShowCardBg(e.target.checked)} className="rounded accent-green-600" />
              কার্ড চালু রাখুন
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-400 block mb-1">উপরে-নিচে অবস্থান</span>
              <select className={selectInp} value={contentPosV} onChange={(e) => setContentPosV(e.target.value as any)}>
                <option value="bottom">নিচে (Bottom)</option>
                <option value="center">মাঝামাঝি (Center)</option>
                <option value="top">উপরে (Top)</option>
              </select>
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">ডানে-বামে অবস্থান</span>
              <select className={selectInp} value={contentPosH} onChange={(e) => setContentPosH(e.target.value as any)}>
                <option value="left">বামে (Left)</option>
                <option value="center">মাঝে (Center)</option>
                <option value="right">ডানে (Right)</option>
              </select>
            </div>
          </div>

          {showCardBg && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {/* প্রস্থ */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>কার্ডের প্রস্থ (Width ১০-১০০%):</span>
                  <span className="font-bold text-green-400">{cardWidthPct}%</span>
                </div>
                <input type="range" min="10" max="100" value={cardWidthPct} onChange={(e) => setCardWidthPct(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              {/* রাউন্ডনেস */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>রাউন্ডনেস (০% = চারকোনা, ১০০% = গোল):</span>
                  <span className="font-bold text-green-400">{cardRadiusPct}%</span>
                </div>
                <input type="range" min="0" max="100" value={cardRadiusPct} onChange={(e) => setCardRadiusPct(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              {/* প্যাডিং */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>কার্ডের ভেতরের ফাঁকা জায়গা (Padding):</span>
                  <span className="font-bold text-green-400">{cardPaddingVal}px</span>
                </div>
                <input type="range" min="8" max="60" value={cardPaddingVal} onChange={(e) => setCardPaddingVal(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              {/* ব্লার */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>ব্যাকগ্রাউন্ড ব্লার (Glass Blur):</span>
                  <span className="font-bold text-green-400">{cardBlur}px</span>
                </div>
                <input type="range" min="0" max="30" value={cardBlur} onChange={(e) => setCardBlur(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              {/* অপাসিটি */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>স্বচ্ছতা / অপাসিটি (০% = স্বচ্ছ, ১০০% = গাঢ়):</span>
                  <span className="font-bold text-green-400">{cardOpacity}%</span>
                </div>
                <input type="range" min="0" max="100" value={cardOpacity} onChange={(e) => setCardOpacity(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              {/* কালার */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-400">কার্ডের RGB রঙ:</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={cardBgColor} onChange={(e) => setCardBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{cardBgColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ধাপ ৫: মেয়াদ ও সেভ বাটন */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded accent-green-600" />
              স্লাইডারে চালু রাখুন (Show)
            </label>

            <select className="border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs bg-slate-950 text-gray-300" value={expSel} onChange={(e) => setExpSel(e.target.value)}>
              {editId && <option value="keep">আগের মেয়াদ রাখুন</option>}
              <option value="none">স্থায়ী স্লাইড</option>
              <option value="6">৬ ঘণ্টা</option>
              <option value="12">১২ ঘণ্টা</option>
              <option value="24">২৪ ঘণ্টা</option>
            </select>
          </div>

          <button className={btnSave} onClick={save} disabled={busy}>
            {busy ? "অপেক্ষা করুন..." : editId ? "স্লাইড আপডেট করুন" : "নতুন স্লাইড সংরক্ষণ করুন"}
          </button>
        </div>
      </div>

      {/* ========================================================
          সেকশন ৪: 📋 সব স্লাইডের তালিকা (আনলিমিটেড)
      ======================================================== */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-semibold text-base text-gray-200">সব স্লাইড ({list.length})</h2>
          <span className="text-xs text-gray-400 font-medium">লাইভ স্লাইড সংখ্যা: আনলিমিটেড</span>
        </div>

        <div className="space-y-2.5">
          {list.map((s, i) => (
            <div key={s.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-3 items-center min-w-0">
                {s.media_type === "video" ? (
                  <div className="w-16 h-12 bg-red-600 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    ▶ ভিডিও
                  </div>
                ) : s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0 border border-slate-800" />
                ) : (
                  <div className="w-16 h-12 bg-slate-800 rounded-lg shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-200 truncate">{s.title || "কোনো শিরোনাম নেই"}</p>
                  <p className="text-xs text-gray-500">
                    {s.category ? `${s.category} · ` : ""}{status(s)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center text-xs">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 cursor-pointer">⬆</button>
                <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 cursor-pointer">⬇</button>
                <button onClick={() => startEdit(s)} className="px-3 py-1.5 bg-green-950 border border-green-800/60 text-green-300 rounded-lg hover:bg-green-900 cursor-pointer">এডিট</button>
                <button onClick={() => run(() => updateHeroSlide(token, s.id, { is_active: !s.is_active }))} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-gray-300 rounded-lg hover:bg-slate-800 cursor-pointer">
                  {s.is_active ? "লুকান" : "দেখান"}
                </button>
                <button onClick={() => run(() => deleteHeroSlide(token, s.id), "স্লাইডটি মুছে ফেলবেন?")} className="px-3 py-1.5 bg-red-950 border border-red-800/60 text-red-300 rounded-lg hover:bg-red-900 cursor-pointer">মুছুন</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-sm text-gray-500 text-center py-4">কোনো স্লাইড নেই।</p>}
        </div>
      </div>
    </div>
  )
}
