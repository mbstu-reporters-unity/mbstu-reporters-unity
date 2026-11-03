"use client"

import { useEffect, useState } from "react"
import { uploadImage } from "../../lib/sb"
import {
  BADGES,
  FONTS,
  FONT_WEIGHTS,
  TEXT_SIZES,
  TEXT_STYLES,
  MAX_LIVE,
  TRANSITIONS,
  BREAKING_BADGES,
  BREAKING_TEXT_EFFECTS,
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

  // ডাইনামিক ব্রেকিং মোড স্টেট
  const [bOn, setBOn] = useState(false)
  const [bTitle, setBTitle] = useState("")
  const [bTitleSize, setBTitleSize] = useState("3xl")
  const [bTitleColor, setBTitleColor] = useState("#ffffff")
  const [bText, setBText] = useState("")
  const [bTextSize, setBTextSize] = useState("base")
  const [bTextColor, setBTextColor] = useState("#f1f5f9")
  const [bLink, setBLink] = useState("")
  const [bBtnText, setBBtnText] = useState("বিস্তারিত")
  const [bMediaType, setBMediaType] = useState<"none" | "image" | "video">("none")
  const [bMediaUrl, setBMediaUrl] = useState("")
  const [bFiles, setBFiles] = useState<File[]>([])
  const [bExtraMedia, setBExtraMedia] = useState("")
  const [bBgColor, setBBgColor] = useState("#881337")
  const [bBgGradient, setBBgGradient] = useState("#0f172a")
  const [bBadgeStyle, setBBadgeStyle] = useState("pulse-circle")
  const [bPulseSpeedPct, setBPulseSpeedPct] = useState<number>(50)
  const [bTextEffect, setBTextEffect] = useState("auto")
  const [bTextSpeedPct, setBTextSpeedPct] = useState<number>(50)

  // একক স্লাইড ফর্ম স্টেট
  const [editId, setEditId] = useState<string | null>(null)

  // শিরোনাম ও নিজস্ব টুলস
  const [title, setTitle] = useState("")
  const [titleFont, setTitleFont] = useState(FONTS[0].value)
  const [titleSize, setTitleSize] = useState("2xl")
  const [titleStyle, setTitleStyle] = useState("bold")
  const [titleColor, setTitleColor] = useState("#FFFFFF")
  const [titleBgColor, setTitleBgColor] = useState("")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")

  // বিবরণ ও নিজস্ব টুলস
  const [summary, setSummary] = useState("")
  const [summaryFont, setSummaryFont] = useState(FONTS[0].value)
  const [summarySize, setSummarySize] = useState("base")
  const [summaryStyle, setSummaryStyle] = useState("normal")
  const [summaryColor, setSummaryColor] = useState("#e2e8f0")

  // ব্যাজ ও নিজস্ব টুলস
  const [category, setCategory] = useState("")
  const [badgeFont, setBadgeFont] = useState(FONTS[0].value)
  const [badgeSize, setBadgeSize] = useState("xs")
  const [badgeTextColor, setBadgeTextColor] = useState("#0f172a")
  const [badgeColor, setBadgeColor] = useState("#EAB308")

  // বাটন ও নিজস্ব টুলস
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [btnFont, setBtnFont] = useState(FONTS[0].value)
  const [btnSize, setBtnSize] = useState("sm")
  const [btnColor, setBtnColor] = useState("#ffffff")
  const [btnBgColor, setBtnBgColor] = useState("#15803d")
  const [link, setLink] = useState("")

  // মিডিয়া স্টেট (ডিভাইস থেকে একাধিক ফাইল)
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [videoUrl, setVideoUrl] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [oldMediaUrls, setOldMediaUrls] = useState<string | null>(null)
  const [extraMedia, setExtraMedia] = useState("")
  const [pos, setPos] = useState<"top" | "center" | "bottom">("center")
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  // গ্লাস কার্ড ও ০-১০০% স্লাইডার
  const [contentPosV, setContentPosV] = useState<"top" | "center" | "bottom">("bottom")
  const [contentPosH, setContentPosH] = useState<"left" | "center" | "right">("left")
  const [showCardBg, setShowCardBg] = useState(true)
  const [cardWidthPct, setCardWidthPct] = useState<number>(90)
  const [cardRadiusPct, setCardRadiusPct] = useState<number>(20)
  const [cardPaddingVal, setCardPaddingVal] = useState<number>(20)
  const [cardBlur, setCardBlur] = useState<number>(12)
  const [cardBgColor, setCardBgColor] = useState("#000000")
  const [cardOpacity, setCardOpacity] = useState<number>(60)

  // মেয়াদ ও সক্রিয়তা
  const [active, setActive] = useState(true)
  const [expSel, setExpSel] = useState("none")
  const [oldExpires, setOldExpires] = useState<string | null>(null)

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
        setBTitleSize(s.breaking_title_size || "3xl")
        setBTitleColor(s.breaking_title_color || "#ffffff")
        setBText(s.breaking_text || "")
        setBTextSize(s.breaking_text_size || "base")
        setBTextColor(s.breaking_text_color || "#f1f5f9")
        setBLink(s.breaking_link || "")
        setBBtnText(s.breaking_btn_text || "বিস্তারিত")
        setBMediaType(s.breaking_media_type || "none")
        setBMediaUrl(s.breaking_media_url || "")
        setBExtraMedia(s.breaking_extra_media || "")
        setBBgColor(s.breaking_bg_color || "#881337")
        setBBgGradient(s.breaking_bg_gradient || "#0f172a")
        setBBadgeStyle(s.breaking_badge_style || "pulse-circle")
        setBPulseSpeedPct(s.breaking_pulse_speed_pct ?? 50)
        setBTextEffect(s.breaking_text_effect || "auto")
        setBTextSpeedPct(s.breaking_text_speed_pct ?? 50)
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

  // ব্রেকিং মোড সেভ (একাধিক ফাইল আপলোড সাপোর্টসহ)
  async function saveBreaking(on: boolean) {
    setBusy(true)
    try {
      let uploadedBreakingUrls: string[] = []
      if (bFiles.length > 0) {
        for (const f of bFiles) {
          if (f.type.startsWith("video/")) {
            uploadedBreakingUrls.push(await uploadImage(token, f))
          } else {
            uploadedBreakingUrls.push(await uploadImage(token, await shrink(f)))
          }
        }
      }

      const allBreakingMedia = [
        ...(bMediaUrl ? [bMediaUrl] : []),
        ...uploadedBreakingUrls,
        ...(bExtraMedia ? bExtraMedia.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean) : []),
      ].join("\n")

      await saveHeroSettings(token, {
        breaking_on: on,
        breaking_title: bTitle.trim() || null,
        breaking_title_size: bTitleSize,
        breaking_title_color: bTitleColor,
        breaking_text: bText.trim() || null,
        breaking_text_size: bTextSize,
        breaking_text_color: bTextColor,
        breaking_link: bLink.trim() || null,
        breaking_btn_text: bBtnText.trim() || "বিস্তারিত",
        breaking_media_type: bMediaType,
        breaking_media_url: uploadedBreakingUrls[0] || bMediaUrl.trim() || null,
        breaking_extra_media: allBreakingMedia || null,
        breaking_bg_color: bBgColor,
        breaking_bg_gradient: bBgGradient,
        breaking_badge_style: bBadgeStyle,
        breaking_pulse_speed_pct: Number(bPulseSpeedPct),
        breaking_text_effect: bTextEffect,
        breaking_text_speed_pct: Number(bTextSpeedPct),
      })
      setBOn(on)
      setMsg(on ? "🔴 ব্রেকিং মোড আপডেট ও চালু হয়েছে (স্লাইডারের উপরে থাকবে)" : "✅ ব্রেকিং মোড বন্ধ, স্বাভাবিক স্লাইডার উপরে ফিরেছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  function reset() {
    setEditId(null)
    setTitle("")
    setTitleFont(FONTS[0].value)
    setTitleSize("2xl")
    setTitleStyle("bold")
    setTitleColor("#FFFFFF")
    setTitleBgColor("")
    setTextAlign("left")

    setSummary("")
    setSummaryFont(FONTS[0].value)
    setSummarySize("base")
    setSummaryStyle("normal")
    setSummaryColor("#e2e8f0")

    setCategory("")
    setBadgeFont(FONTS[0].value)
    setBadgeSize("xs")
    setBadgeTextColor("#0f172a")
    setBadgeColor("#EAB308")

    setBtnText("বিস্তারিত")
    setBtnFont(FONTS[0].value)
    setBtnSize("sm")
    setBtnColor("#ffffff")
    setBtnBgColor("#15803d")
    setLink("")

    setMediaType("image")
    setVideoUrl("")
    setSelectedFiles([])
    setOldImage(null)
    setOldMediaUrls(null)
    setExtraMedia("")
    setPos("center")
    setFitMode("contain")

    setContentPosV("bottom")
    setContentPosH("left")
    setShowCardBg(true)
    setCardWidthPct(90)
    setCardRadiusPct(20)
    setCardPaddingVal(20)
    setCardBlur(12)
    setCardBgColor("#000000")
    setCardOpacity(60)

    setActive(true)
    setExpSel("none")
    setOldExpires(null)
  }

  function startEdit(s: HeroSlide) {
    setEditId(s.id)
    setTitle(s.title || "")
    setTitleFont(s.title_font || FONTS[0].value)
    setTitleSize(s.title_size || "2xl")
    setTitleStyle(s.title_style || "bold")
    setTitleColor(s.title_color || "#FFFFFF")
    setTitleBgColor(s.title_bg_color || "")
    setTextAlign(s.text_align || "left")

    setSummary(s.summary || "")
    setSummaryFont(s.summary_font || FONTS[0].value)
    setSummarySize(s.summary_size || "base")
    setSummaryStyle(s.summary_style || "normal")
    setSummaryColor(s.summary_color || "#e2e8f0")

    setCategory(s.category || "")
    setBadgeFont(s.badge_font || FONTS[0].value)
    setBadgeSize(s.badge_size || "xs")
    setBadgeTextColor(s.badge_text_color || "#0f172a")
    setBadgeColor(s.badge_color || "#EAB308")

    setBtnText(s.button_text || "বিস্তারিত")
    setBtnFont(s.btn_font || FONTS[0].value)
    setBtnSize(s.btn_size || "sm")
    setBtnColor(s.btn_color || "#ffffff")
    setBtnBgColor(s.btn_bg_color || "#15803d")
    setLink(s.link_url || "")

    setMediaType(s.media_type || "image")
    setVideoUrl(s.video_url || "")
    setSelectedFiles([])
    setOldImage(s.image_url)
    setOldMediaUrls(s.media_urls || null)
    setExtraMedia(s.extra_media || "")
    setPos(s.image_pos)
    setFitMode(s.fit_mode || "contain")

    setContentPosV(s.content_pos_v || "bottom")
    setContentPosH(s.content_pos_h || "left")
    setShowCardBg(s.show_card_bg ?? true)
    setCardWidthPct(s.card_width_pct ?? 90)
    setCardRadiusPct(s.card_radius_pct ?? 20)
    setCardPaddingVal(s.card_padding_val ?? 20)
    setCardBlur(s.card_blur ?? 12)
    setCardBgColor(s.card_bg_color || "#000000")
    setCardOpacity(s.card_opacity ?? 60)

    setActive(s.is_active)
    setExpSel("keep")
    setOldExpires(s.expires_at)
    window.scrollTo({ top: 300, behavior: "smooth" })
  }

  // নতুন স্লাইড সেভ (ডিভাইস থেকে একাধিক ছবি/ভিডিও আপলোড হ্যান্ডলার)
  async function save() {
    if (!title.trim() && selectedFiles.length === 0 && !oldImage && !videoUrl.trim() && !extraMedia.trim()) {
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
      // ডিভাইস থেকে একাধিক ফাইল আপলোড
      let uploadedUrls: string[] = []
      if (selectedFiles.length > 0) {
        for (const f of selectedFiles) {
          if (f.type.startsWith("video/")) {
            uploadedUrls.push(await uploadImage(token, f))
          } else {
            uploadedUrls.push(await uploadImage(token, await shrink(f)))
          }
        }
      }

      const primaryImg = uploadedUrls[0] || oldImage
      const allMediaCombined = [
        ...uploadedUrls,
        ...(oldMediaUrls ? oldMediaUrls.split("\n") : []),
        ...(extraMedia ? extraMedia.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean) : []),
      ].filter(Boolean).join("\n")

      let expires: string | null = oldExpires
      if (expSel === "none") expires = null
      else if (expSel !== "keep") expires = new Date(Date.now() + Number(expSel) * 3600 * 1000).toISOString()

      const data = {
        category: category.trim() || null,
        title: title.trim() || null,
        title_font: titleFont,
        title_size: titleSize,
        title_style: titleStyle,
        title_color: titleColor,
        title_bg_color: titleBgColor.trim() || null,
        text_align: textAlign,

        summary: summary.trim() || null,
        summary_font: summaryFont,
        summary_size: summarySize,
        summary_style: summaryStyle,
        summary_color: summaryColor,

        badge_font: badgeFont,
        badge_size: badgeSize,
        badge_text_color: badgeTextColor,
        badge_color: badgeColor,

        button_text: btnText.trim() || "বিস্তারিত",
        btn_font: btnFont,
        btn_size: btnSize,
        btn_color: btnColor,
        btn_bg_color: btnBgColor,
        link_url: l || null,

        image_url: primaryImg,
        image_pos: pos,
        is_active: active,
        expires_at: expires,
        media_type: mediaType,
        video_url: videoUrl.trim() || null,
        extra_media: extraMedia.trim() || null,
        media_urls: allMediaCombined || null,
        fit_mode: fitMode,

        content_pos_v: contentPosV,
        content_pos_h: contentPosH,
        show_card_bg: showCardBg,
        card_width_pct: Number(cardWidthPct),
        card_radius_pct: Number(cardRadiusPct),
        card_padding_val: Number(cardPaddingVal),
        card_blur: Number(cardBlur),
        card_bg_color: cardBgColor,
        card_opacity: Number(cardOpacity),
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
          সেকশন ২: 🔴 জরুরি ব্রেকিং মোড (সহাবস্থান ও মাল্টি-ফাইল)
      ======================================================== */}
      <div className={`${cardBox} ${bOn ? "border-red-600/60 bg-red-950/20" : ""}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-600 animate-pulse" />
            <h2 className="font-semibold text-base text-red-400">জরুরি ব্রেকিং মোড {bOn ? "(চালু আছে)" : "(বন্ধ)"}</h2>
          </div>
          {bOn && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">LIVE ON TOP</span>}
        </div>

        <p className="text-xs text-gray-400">
          💡 এটি চালু করলে হোমপেজের সবার ওপরে জরুরি ব্রেকিং ব্যানার দেখাবে এবং ঠিক তার নিচেই মূল স্লাইডার চলতে থাকবে।
        </p>

        {/* ব্রেকিং শিরোনাম ও নিজস্ব টেক্সট টুলস */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">ব্রেকিং শিরোনাম ও টেক্সট স্টাইল</span>
          <input className={inp} placeholder="ব্রেকিং শিরোনাম (ঐচ্ছিক)" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-xs text-gray-400 block mb-1">শিরোনাম সাইজ</span>
              <select className={selectInp} value={bTitleSize} onChange={(e) => setBTitleSize(e.target.value)}>
                {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <label className="block text-xs">
              <span className="text-gray-400 block mb-1">শিরোনাম কালার</span>
              <div className="flex items-center gap-2">
                <input type="color" value={bTitleColor} onChange={(e) => setBTitleColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                <span className="text-xs font-mono">{bTitleColor}</span>
              </div>
            </label>
          </div>
        </div>

        {/* ব্রেকিং বিবরণ ও নিজস্ব টেক্সট টুলস */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">ব্রেকিং বিবরণ ও টেক্সট স্টাইল</span>
          <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" value={bText} onChange={(e) => setBText(e.target.value)} />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-xs text-gray-400 block mb-1">বিবরণ সাইজ</span>
              <select className={selectInp} value={bTextSize} onChange={(e) => setBTextSize(e.target.value)}>
                {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <label className="block text-xs">
              <span className="text-gray-400 block mb-1">বিবরণ কালার</span>
              <div className="flex items-center gap-2">
                <input type="color" value={bTextColor} onChange={(e) => setBTextColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                <span className="text-xs font-mono">{bTextColor}</span>
              </div>
            </label>
          </div>
        </div>

        {/* ২১টি অ্যানিমেটেড ব্রেকিং ব্যাজ ও ০-১০০% শেপ স্পিড */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">অ্যানিমেটেড প্রতীক ও স্পিড</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">অ্যানিমেটেড প্রতীক (২১টি)</label>
              <select className={selectInp} value={bBadgeStyle} onChange={(e) => setBBadgeStyle(e.target.value)}>
                {BREAKING_BADGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>শেপ অ্যানিমেশনের গতি:</span>
                <span className="font-bold text-red-400">{bPulseSpeedPct}%</span>
              </div>
              <input type="range" min="5" max="100" value={bPulseSpeedPct} onChange={(e) => setBPulseSpeedPct(Number(e.target.value))} className="w-full accent-red-600 cursor-pointer pt-1" />
            </div>
          </div>
        </div>

        {/* ২০টি টেক্সট অ্যানিমেশন ইফেক্ট */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">শিরোনাম ও বিবরণের ২০টি টেক্সট অ্যানিমেশন ইফেক্ট</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">টেক্সট ইফেক্ট</label>
              <select className={selectInp} value={bTextEffect} onChange={(e) => setBTextEffect(e.target.value)}>
                {BREAKING_TEXT_EFFECTS.map((eff) => <option key={eff.value} value={eff.value}>{eff.label}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>টেক্সট অ্যানিমেশনের গতি:</span>
                <span className="font-bold text-amber-400">{bTextSpeedPct}%</span>
              </div>
              <input type="range" min="5" max="100" value={bTextSpeedPct} onChange={(e) => setBTextSpeedPct(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer pt-1" />
            </div>
          </div>
        </div>

        {/* ডিভাইস থেকে একাধিক ফাইল বাছাই ও মিডিয়া */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">ব্রেকিং মিডিয়া ব্যাকগ্রাউন্ড (ডিভাইস থেকে একাধিক ফাইল)</span>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="bmedia" checked={bMediaType === "none"} onChange={() => setBMediaType("none")} />
              RGB গ্রেডিয়েন্ট রঙ
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="bmedia" checked={bMediaType === "image"} onChange={() => setBMediaType("image")} />
              ছবি (একাধিক বাছাই)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="bmedia" checked={bMediaType === "video"} onChange={() => setBMediaType("video")} />
              ভিডিও ফাইল বা লিঙ্ক
            </label>
          </div>

          {bMediaType === "image" && (
            <div className="pt-1">
              <span className="text-xs text-gray-400 block mb-1">ডিভাইস থেকে এক বা একাধিক ছবি নির্বাচন করুন:</span>
              <input type="file" multiple accept="image/*" onChange={(e) => setBFiles(Array.from(e.target.files || []))} className="text-xs text-gray-400" />
            </div>
          )}

          {bMediaType === "video" && (
            <div className="space-y-2 pt-1">
              <input className={inp} placeholder="ইউটিউব বা ভিডিও লিঙ্ক (https://...)" value={bMediaUrl} onChange={(e) => setBMediaUrl(e.target.value)} />
              <div>
                <span className="text-xs text-gray-400 block mb-1">অথবা মেমোরি থেকে ভিডিও ফাইল সিলেক্ট করুন:</span>
                <input type="file" accept="video/*" onChange={(e) => setBFiles(Array.from(e.target.files || []))} className="text-xs text-gray-400" />
              </div>
            </div>
          )}

          {bMediaType === "none" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
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

          <div className="pt-1">
            <span className="text-xs text-gray-400 block mb-1">অতিরিক্ত ছবি ও ভিডিও লিঙ্ক (প্রতি লাইনে একটি করে লিঙ্ক):</span>
            <textarea className={inp} rows={2} placeholder="https://...ছবি১.jpg&#10;https://...ছবি২.jpg" value={bExtraMedia} onChange={(e) => setBExtraMedia(e.target.value)} />
          </div>
        </div>

        {/* ব্রেকিং বাটন ও লিঙ্ক */}
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
          সেকশন ৩: ➕ নতুন স্লাইড তৈরি (স্বয়ংসম্পূর্ণ ইন-সেকশন টুলসহ)
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

        {/* ১. কনটেন্ট ও ডিভাইস থেকে একাধিক ফাইল বাছাই */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider block">১. কনটেন্ট ও মিডিয়া নির্বাচন (একাধিক ফাইল সাপোর্ট)</span>

          {posts.length > 0 && !editId && (
            <div>
              <span className="text-xs text-gray-400 block mb-1">ওয়েবসাইটের পোস্ট থেকে নির্বাচন করুন (এক ক্লিকে অটো-ফিল):</span>
              <select className={selectInp} onChange={(e) => handlePostSelect(e.target.value)} defaultValue="">
                <option value="">-- ওয়েবসাইট থেকে খবর বেছে নিন --</option>
                {posts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-5 text-xs pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input type="radio" name="mtype" checked={mediaType === "image"} onChange={() => setMediaType("image")} />
              🖼️ ছবি (এক বা একাধিক ফাইল)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input type="radio" name="mtype" checked={mediaType === "video"} onChange={() => setMediaType("video")} />
              🎥 ভিডিও প্লেয়ার
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
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block mb-1">ইউটিউব বা ভিডিও লিঙ্ক</span>
              <input className={inp} placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              <div>
                <span className="text-xs text-gray-400 block mb-1">অথবা ফোন/কম্পিউটার থেকে ভিডিও ফাইল আপলোড করুন:</span>
                <input type="file" multiple accept="video/*" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="text-xs text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block mb-1">ফোন বা কম্পিউটারের ফাইল থেকে এক বা একাধিক ছবি বাছাই করুন:</span>
              <input type="file" multiple accept="image/*" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="text-xs text-gray-400" />
              {selectedFiles.length > 0 && (
                <p className="text-xs text-green-400">✅ {selectedFiles.length}টি ফাইল বাছাই করা হয়েছে (এরা নিজেদের মাঝে স্লাইড হবে)</p>
              )}
            </div>
          )}

          <div>
            <span className="text-xs text-gray-400 block mb-1">অতিরিক্ত ছবি/ভিডিও লিঙ্ক (ঐচ্ছিক - প্রতি লাইনে একটি করে লিঙ্ক দিন):</span>
            <textarea className={inp} rows={2} placeholder="https://...ছবি১.jpg&#10;https://...ছবি২.jpg" value={extraMedia} onChange={(e) => setExtraMedia(e.target.value)} />
          </div>
        </div>

        {/* ২. শিরোনাম সেকশন ও এর নিজস্ব স্বাধীন এডিটিং টুলস */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">২. শিরোনাম সেকশন ও স্বাধীন টেক্সট এডিটিং টুলস</span>
          <input className={inp} placeholder="শিরোনাম লিখুন (না চাইলে খালি রাখুন)" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />

          {/* শিরোনামের নিজস্ব টুলবক্স */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-gray-300 block">শিরোনামের নিজস্ব স্টাইলিং টুলস:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-xs text-gray-400 block mb-1">শিরোনাম ফন্ট</span>
                <select className={selectInp} value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>
                  {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">শিরোনাম সাইজ</span>
                <select className={selectInp} value={titleSize} onChange={(e) => setTitleSize(e.target.value)}>
                  {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">স্টাইল (বোল্ড/ইটালিক)</span>
                <select className={selectInp} value={titleStyle} onChange={(e) => setTitleStyle(e.target.value)}>
                  {TEXT_STYLES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
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
                <span className="text-gray-400 block mb-1">শিরোনাম টেক্সট কালার</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{titleColor}</span>
                </div>
              </label>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">শিরোনাম হাইলাইট ব্যাকগ্রাউন্ড</span>
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
        </div>

        {/* ৩. সংক্ষিপ্ত বিবরণ সেকশন ও এর নিজস্ব স্বাধীন এডিটিং টুলস */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">৩. সংক্ষিপ্ত বিবরণ সেকশন ও স্বাধীন টেক্সট এডিটিং টুলস</span>
          <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (না চাইলে খালি রাখুন)" value={summary} onChange={(e) => setSummary(e.target.value)} />

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-gray-300 block">বিবরণের নিজস্ব স্টাইলিং টুলস:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-xs text-gray-400 block mb-1">বিবরণ ফন্ট</span>
                <select className={selectInp} value={summaryFont} onChange={(e) => setSummaryFont(e.target.value)}>
                  {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">বিবরণ সাইজ</span>
                <select className={selectInp} value={summarySize} onChange={(e) => setSummarySize(e.target.value)}>
                  {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">স্টাইল</span>
                <select className={selectInp} value={summaryStyle} onChange={(e) => setSummaryStyle(e.target.value)}>
                  {TEXT_STYLES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                </select>
              </div>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">বিবরণ কালার</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={summaryColor} onChange={(e) => setSummaryColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{summaryColor}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ৪. কাস্টম ব্যাজ সেকশন ও নিজস্ব টুলস */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">৪. কাস্টম ব্যাজ সেকশন ও স্বাধীন স্টাইলিং টুলস</span>
          <input className={inp} placeholder="কাস্টম ব্যাজ (যেমন: আজকের খবর)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="flex flex-wrap gap-1.5 pt-1">
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

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-gray-300 block">ব্যাজের নিজস্ব স্টাইলিং টুলস:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-xs text-gray-400 block mb-1">ব্যাজ ফন্ট</span>
                <select className={selectInp} value={badgeFont} onChange={(e) => setBadgeFont(e.target.value)}>
                  {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">ব্যাজ সাইজ</span>
                <select className={selectInp} value={badgeSize} onChange={(e) => setBadgeSize(e.target.value)}>
                  {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">ব্যাজ টেক্সট কালার</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={badgeTextColor} onChange={(e) => setBadgeTextColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{badgeTextColor}</span>
                </div>
              </label>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">ব্যাজ ব্যাকগ্রাউন্ড কালার</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{badgeColor}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ৫. বাটন সেকশন ও নিজস্ব টুলস */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">৫. বাটন ও লিঙ্ক সেকশন ও স্বাধীন স্টাইলিং টুলস</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inp} placeholder="বাটন লেখা (যেমন: বিস্তারিত)" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
            <input className={inp} placeholder="ক্লিক লিঙ্ক (না দিলে পপ-আপে পূর্ণ খবর দেখাবে)" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-gray-300 block">বাটনের নিজস্ব স্টাইলিং টুলস:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-xs text-gray-400 block mb-1">বাটন ফন্ট</span>
                <select className={selectInp} value={btnFont} onChange={(e) => setBtnFont(e.target.value)}>
                  {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">বাটন সাইজ</span>
                <select className={selectInp} value={btnSize} onChange={(e) => setBtnSize(e.target.value)}>
                  {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">বাটন টেক্সট কালার</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnColor} onChange={(e) => setBtnColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{btnColor}</span>
                </div>
              </label>
              <label className="block text-xs">
                <span className="text-gray-400 block mb-1">বাটন ব্যাকগ্রাউন্ড কালার</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                  <span className="text-xs font-mono">{btnBgColor}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ৬. গ্লাস কার্ডের আকার ও অবস্থান নিয়ন্ত্রণ */}
        <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">৬. গ্লাস কার্ডের আকার ও অবস্থান নিয়ন্ত্রণ</span>
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
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>কার্ডের প্রস্থ (Width ১০-১০০%):</span>
                  <span className="font-bold text-green-400">{cardWidthPct}%</span>
                </div>
                <input type="range" min="10" max="100" value={cardWidthPct} onChange={(e) => setCardWidthPct(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>রাউন্ডনেস (০% = চারকোনা, ১০০% = গোল):</span>
                  <span className="font-bold text-green-400">{cardRadiusPct}%</span>
                </div>
                <input type="range" min="0" max="100" value={cardRadiusPct} onChange={(e) => setCardRadiusPct(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>কার্ডের প্যাডিং/দৈর্ঘ্য:</span>
                  <span className="font-bold text-green-400">{cardPaddingVal}px</span>
                </div>
                <input type="range" min="8" max="60" value={cardPaddingVal} onChange={(e) => setCardPaddingVal(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>ব্যাকগ্রাউন্ড ব্লার (Glass Blur):</span>
                  <span className="font-bold text-green-400">{cardBlur}px</span>
                </div>
                <input type="range" min="0" max="30" value={cardBlur} onChange={(e) => setCardBlur(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>স্বচ্ছতা / অপাসিটি (০% = স্বচ্ছ, ১০০% = গাঢ়):</span>
                  <span className="font-bold text-green-400">{cardOpacity}%</span>
                </div>
                <input type="range" min="0" max="100" value={cardOpacity} onChange={(e) => setCardOpacity(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

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

        {/* ৭. মেয়াদ ও সেভ বাটন */}
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
