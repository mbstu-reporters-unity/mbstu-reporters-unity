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

// ক্র্যাশ রোধে সেফ cn ফাংশন
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-950 text-white focus:outline-none focus:border-green-500 transition-all"
const btnSave = "w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50 shadow-lg cursor-pointer"
const cardBox = "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"

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

const isLive = (s: HeroSlide) => s && s.is_active && (!s.expires_at || new Date(s.expires_at) > new Date())

export default function HeroManager({ token, shrink }: { token: string; shrink: (f: File) => Promise<Blob> }) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; image_url?: string; summary?: string }>>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  const [activeTab, setActiveTab] = useState<"content" | "design" | "publish">("content")

  // গতি ও ট্রানজিশন সেটিংস
  const [slideSpeed, setSlideSpeed] = useState<number>(4500)
  const [transType, setTransType] = useState<string>("fade")
  const [textMotion, setTextMotion] = useState<boolean>(true)

  // ব্রেকিং মোড
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

  // একক স্লাইড
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [link, setLink] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [videoUrl, setVideoUrl] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [oldMediaUrls, setOldMediaUrls] = useState<string | null>(null)
  const [extraMedia, setExtraMedia] = useState("")
  const [pos, setPos] = useState<"top" | "center" | "bottom">("center")
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  const [titleFont, setTitleFont] = useState(FONTS[0].value)
  const [titleSize, setTitleSize] = useState("2xl")
  const [titleStyle, setTitleStyle] = useState("bold")
  const [titleColor, setTitleColor] = useState("#FFFFFF")
  const [titleBgColor, setTitleBgColor] = useState("")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")

  const [summaryFont, setSummaryFont] = useState(FONTS[0].value)
  const [summarySize, setSummarySize] = useState("base")
  const [summaryStyle, setSummaryStyle] = useState("normal")
  const [summaryColor, setSummaryColor] = useState("#e2e8f0")

  const [badgeFont, setBadgeFont] = useState(FONTS[0].value)
  const [badgeSize, setBadgeSize] = useState("xs")
  const [badgeTextColor, setBadgeTextColor] = useState("#0f172a")
  const [badgeColor, setBadgeColor] = useState("#EAB308")

  const [btnFont, setBtnFont] = useState(FONTS[0].value)
  const [btnSize, setBtnSize] = useState("sm")
  const [btnColor, setBtnColor] = useState("#ffffff")
  const [btnBgColor, setBtnBgColor] = useState("#15803d")

  const [contentPosV, setContentPosV] = useState<"top" | "center" | "bottom">("bottom")
  const [contentPosH, setContentPosH] = useState<"left" | "center" | "right">("left")
  const [showCardBg, setShowCardBg] = useState(true)
  const [cardWidthPct, setCardWidthPct] = useState<number>(90)
  const [cardRadiusPct, setCardRadiusPct] = useState<number>(20)
  const [cardPaddingVal, setCardPaddingVal] = useState<number>(20)
  const [cardBlur, setCardBlur] = useState<number>(12)
  const [cardBgColor, setCardBgColor] = useState("#000000")
  const [cardOpacity, setCardOpacity] = useState<number>(60)

  const [active, setActive] = useState(true)
  const [expSel, setExpSel] = useState("none")
  const [oldExpires, setOldExpires] = useState<string | null>(null)

  async function load() {
    try {
      const res = await getHeroSlides(token)
      setList(Array.isArray(res) ? res : [])
    } catch {
      setList([])
    }

    try {
      const p = await getRecentPosts()
      setPosts(Array.isArray(p) ? p : [])
    } catch {
      setPosts([])
    }
  }

  useEffect(() => {
    load()
    getHeroSettings()
      .then((s) => {
        if (s) {
          setBOn(Boolean(s.breaking_on))
          setBTitle(s.breaking_title || "")
          setBTitleSize(s.breaking_title_size || "3xl")
          setBTitleColor(s.breaking_title_color || "#ffffff")
          setBText(s.breaking_text || "")
          setBTextSize(s.breaking_text_size || "base")
          setBTextColor(s.breaking_text_color || "#f1f5f9")
          setBLink(s.breaking_link || "")
          setBBtnText(s.breaking_btn_text || "বিস্তারিত")
          setBMediaType((s.breaking_media_type as any) || "none")
          setBMediaUrl(s.breaking_media_url || "")
          setBExtraMedia(s.breaking_extra_media || "")
          setBBgColor(s.breaking_bg_color || "#881337")
          setBBgGradient(s.breaking_bg_gradient || "#0f172a")
          setBBadgeStyle(s.breaking_badge_style || "pulse-circle")
          setBPulseSpeedPct(Number(s.breaking_pulse_speed_pct) || 50)
          setBTextEffect(s.breaking_text_effect || "auto")
          setBTextSpeedPct(Number(s.breaking_text_speed_pct) || 50)
          setSlideSpeed(Number(s.slide_speed) || 4500)
          setTransType(s.transition_type || "fade")
          setTextMotion(s.text_motion ?? true)
        }
      })
      .catch(() => {})
  }, [token])

  const [previewImg, setPreviewImg] = useState<string>("/images/hero-1.png")
  useEffect(() => {
    if (Array.isArray(selectedFiles) && selectedFiles.length > 0 && typeof window !== "undefined") {
      try {
        const url = URL.createObjectURL(selectedFiles[0])
        setPreviewImg(url)
        return () => URL.revokeObjectURL(url)
      } catch {}
    } else {
      setPreviewImg(oldImage || "/images/hero-1.png")
    }
  }, [selectedFiles, oldImage])

  function applyTemplate(type: "classic" | "minimal" | "golden" | "compact") {
    if (type === "classic") {
      setShowCardBg(true)
      setCardWidthPct(90)
      setCardRadiusPct(20)
      setCardPaddingVal(20)
      setCardBlur(12)
      setCardBgColor("#000000")
      setCardOpacity(60)
      setContentPosV("bottom")
      setContentPosH("left")
      setTextAlign("left")
    } else if (type === "minimal") {
      setShowCardBg(false)
      setTitleColor("#FFFFFF")
      setTitleBgColor("#000000")
      setContentPosV("bottom")
      setContentPosH("left")
    } else if (type === "golden") {
      setShowCardBg(true)
      setCardWidthPct(85)
      setCardRadiusPct(35)
      setCardPaddingVal(24)
      setCardBlur(15)
      setCardBgColor("#1a1300")
      setCardOpacity(75)
      setBadgeColor("#EAB308")
      setTitleColor("#fef08a")
      setContentPosV("center")
      setContentPosH("center")
      setTextAlign("center")
    } else if (type === "compact") {
      setShowCardBg(true)
      setCardWidthPct(55)
      setCardRadiusPct(30)
      setCardPaddingVal(16)
      setCardBlur(10)
      setCardBgColor("#0f172a")
      setCardOpacity(80)
      setContentPosV("bottom")
      setContentPosH("left")
      setTextAlign("left")
    }
    setMsg("✨ টেমপ্লেট সফলভাবে প্রয়োগ করা হয়েছে")
  }

  function handlePostSelect(postId: string) {
    const safePosts = Array.isArray(posts) ? posts : []
    const p = safePosts.find((x) => x && x.id === postId)
    if (!p) return
    setTitle(p.title || "")
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
      setMsg("✅ স্লাইডারের গতি ও ট্রানজিশন সংরক্ষিত হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  async function saveBreaking(on: boolean) {
    setBusy(true)
    try {
      let uploadedBreakingUrls: string[] = []
      const safeShrink = typeof shrink === "function" ? shrink : async (f: File) => f
      if (Array.isArray(bFiles) && bFiles.length > 0) {
        for (const f of bFiles) {
          if (f.type.startsWith("video/")) {
            uploadedBreakingUrls.push(await uploadImage(token, f))
          } else {
            uploadedBreakingUrls.push(await uploadImage(token, await safeShrink(f)))
          }
        }
      }

      const allBreakingMedia = [
        ...(bMediaUrl ? [bMediaUrl] : []),
        ...uploadedBreakingUrls,
        ...(typeof bExtraMedia === "string" ? bExtraMedia.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean) : []),
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
      setMsg(on ? "🔴 ব্রেকিং মোড চালু হয়েছে (স্লাইডারের ওপরে দেখাচ্ছে)" : "✅ ব্রেকিং মোড বন্ধ, স্লাইডার স্বাভাবিক হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  function reset() {
    setEditId(null)
    setActiveTab("content")
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
    if (!s) return
    setEditId(s.id)
    setActiveTab("content")
    setTitle(s.title || "")
    setTitleFont(s.title_font || FONTS[0].value)
    setTitleSize(s.title_size || "2xl")
    setTitleStyle(s.title_style || "bold")
    setTitleColor(s.title_color || "#FFFFFF")
    setTitleBgColor(s.title_bg_color || "")
    setTextAlign((s.text_align as any) || "left")

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

    setMediaType((s.media_type as any) || "image")
    setVideoUrl(s.video_url || "")
    setSelectedFiles([])
    setOldImage(s.image_url)
    setOldMediaUrls(s.media_urls || null)
    setExtraMedia(s.extra_media || "")
    setPos(s.image_pos || "center")
    setFitMode((s.fit_mode as any) || "contain")

    setContentPosV((s.content_pos_v as any) || "bottom")
    setContentPosH((s.content_pos_h as any) || "left")
    setShowCardBg(s.show_card_bg ?? true)
    setCardWidthPct(Number(s.card_width_pct) || 90)
    setCardRadiusPct(Number(s.card_radius_pct) || 20)
    setCardPaddingVal(Number(s.card_padding_val) || 20)
    setCardBlur(Number(s.card_blur) || 12)
    setCardBgColor(s.card_bg_color || "#000000")
    setCardOpacity(Number(s.card_opacity) || 60)

    setActive(Boolean(s.is_active))
    setExpSel("keep")
    setOldExpires(s.expires_at)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 350, behavior: "smooth" })
    }
  }

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
      let uploadedUrls: string[] = []
      const safeShrink = typeof shrink === "function" ? shrink : async (f: File) => f

      if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
        for (const f of selectedFiles) {
          if (f.type.startsWith("video/")) {
            uploadedUrls.push(await uploadImage(token, f))
          } else {
            uploadedUrls.push(await uploadImage(token, await safeShrink(f)))
          }
        }
      }

      const primaryImg = uploadedUrls[0] || oldImage
      const allMediaCombined = [
        ...uploadedUrls,
        ...(typeof oldMediaUrls === "string" ? oldMediaUrls.split("\n") : []),
        ...(typeof extraMedia === "string" ? extraMedia.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean) : []),
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

      const safeList = Array.isArray(list) ? list : []
      if (editId) await updateHeroSlide(token, editId, data)
      else {
        const first = safeList.length ? Math.min(...safeList.map((s) => s.sort_order)) - 10 : 0
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
    const safeList = Array.isArray(list) ? list : []
    const j = i + dir
    if (j < 0 || j >= safeList.length) return
    const arr = [...safeList]
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

  const safeList = Array.isArray(list) ? list : []
  const safePosts = Array.isArray(posts) ? posts : []

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-16">
      {msg && (
        <div className="p-3.5 bg-blue-950/80 border border-blue-500/40 text-blue-200 rounded-xl text-sm font-medium shadow-lg">
          {msg}
        </div>
      )}

      {/* সেকশন ১: সার্বিক স্লাইডার গতি ও ট্রানজিশন নিয়ন্ত্রণ */}
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
            <label className="text-xs text-gray-400 block mb-1.5">ট্রানজিশনের ধরন (২০টি বিকল্প)</label>
            <select className={selectInp} value={transType} onChange={(e) => setTransType(e.target.value)}>
              {TRANSITIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={saveSliderSettings} className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer">
          গতি ও ট্রানজিশন সংরক্ষণ করুন
        </button>
      </div>

      {/* সেকশন ২: 🔴 জরুরি ব্রেকিং মোড */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inp} placeholder="ব্রেকিং শিরোনাম (ঐচ্ছিক)" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
          <textarea className={inp} rows={1} placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" value={bText} onChange={(e) => setBText(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={() => saveBreaking(true)} disabled={busy} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 font-semibold text-xs transition-all shadow-lg cursor-pointer">
            {bOn ? "ব্রেকিং মোড আপডেট করুন" : "ব্রেকিং মোড চালু করুন"}
          </button>
          {bOn && (
            <button onClick={() => saveBreaking(false)} disabled={busy} className="flex-1 border border-slate-700 hover:bg-slate-800 text-gray-300 rounded-xl py-2.5 font-semibold text-xs transition-all cursor-pointer">
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>

      {/* সেকশন ৩: 📱 লাইভ প্রিভিউ ও ট্যাবভিত্তিক স্লাইডার বিল্ডার */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <h2 className="font-semibold text-base text-gray-200">
              {editId ? "স্লাইড এডিট ও লাইভ প্রিভিউ" : "নতুন স্লাইড তৈরি ও লাইভ প্রিভিউ"}
            </h2>
          </div>
          {editId && <button onClick={reset} className="text-xs text-red-400 hover:underline cursor-pointer">বাতিল করুন</button>}
        </div>

        {/* 👁️ লাইভ প্রিভিউ বক্স */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-400 block">👁️ রিয়েল-টাইম লাইভ প্রিভিউ:</span>
          <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-inner flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImg}
              alt="Live Preview"
              className={cn(
                "absolute inset-0 w-full h-full",
                fitMode === "cover" ? "object-cover" : "object-contain"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            <div
              className={cn(
                "absolute inset-0 p-4 flex pointer-events-none",
                contentPosV === "top" ? "items-start" : contentPosV === "center" ? "items-center" : "items-end",
                contentPosH === "right" ? "justify-end" : contentPosH === "center" ? "justify-center" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "transition-all duration-200 max-w-full",
                  showCardBg ? "border border-white/20 shadow-2xl" : "",
                  textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left"
                )}
                style={{
                  width: `${cardWidthPct}%`,
                  padding: showCardBg ? `${cardPaddingVal}px` : undefined,
                  borderRadius: showCardBg ? `${Math.round(((Number(cardRadiusPct) || 20) / 100) * 45)}px` : undefined,
                  backgroundColor: showCardBg ? hexToRgba(cardBgColor, cardOpacity) : "transparent",
                  backdropFilter: showCardBg ? `blur(${cardBlur}px)` : undefined,
                }}
              >
                {category && (
                  <span
                    className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold mb-1"
                    style={{ backgroundColor: badgeColor, color: badgeTextColor, fontFamily: badgeFont }}
                  >
                    {category}
                  </span>
                )}

                {title ? (
                  <h3
                    className={cn("leading-snug block", titleStyle === "italic" ? "italic" : titleStyle === "bold-italic" ? "font-bold italic" : "font-bold")}
                    style={{ color: titleColor, fontFamily: titleFont, fontSize: titleSize === "3xl" ? "20px" : titleSize === "2xl" ? "17px" : "14px" }}
                  >
                    <span style={{ backgroundColor: titleBgColor || undefined, padding: titleBgColor ? "2px 6px" : undefined, borderRadius: "4px" }}>
                      {title}
                    </span>
                  </h3>
                ) : (
                  <p className="text-gray-500 text-xs italic">শিরোনাম লিখলে এখানে ফুটে উঠবে...</p>
                )}

                {summary && (
                  <p className="text-xs line-clamp-2 mt-1" style={{ color: summaryColor, fontFamily: summaryFont }}>
                    {summary}
                  </p>
                )}

                {btnText && (
                  <div className="mt-2">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold shadow"
                      style={{ backgroundColor: btnBgColor, color: btnColor, fontFamily: btnFont }}
                    >
                      {btnText} →
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ৩টি ট্যাব */}
        <div className="flex border-b border-slate-800 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2",
              activeTab === "content" ? "bg-slate-800/80 text-green-400 border-green-500" : "text-gray-400 hover:text-white border-transparent"
            )}
          >
            📝 ১. কনটেন্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("design")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2",
              activeTab === "design" ? "bg-slate-800/80 text-green-400 border-green-500" : "text-gray-400 hover:text-white border-transparent"
            )}
          >
            🎨 ২. ডিজাইন ও কার্ড
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publish")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2",
              activeTab === "publish" ? "bg-slate-800/80 text-green-400 border-green-500" : "text-gray-400 hover:text-white border-transparent"
            )}
          >
            ⏱️ ৩. প্রকাশ ও মেয়াদ
          </button>
        </div>

        {/* ট্যাব ১: কনটেন্ট */}
        {activeTab === "content" && (
          <div className="space-y-4 pt-2">
            {safePosts.length > 0 && !editId && (
              <div>
                <span className="text-xs text-gray-400 block mb-1">ওয়েবসাইটের পোস্ট থেকে নির্বাচন করুন:</span>
                <select className={selectInp} onChange={(e) => handlePostSelect(e.target.value)} defaultValue="">
                  <option value="">-- ওয়েবসাইট থেকে খবর বেছে নিন --</option>
                  {safePosts.map((p) => p && <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            )}

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input type="radio" name="mtype" checked={mediaType === "image"} onChange={() => setMediaType("image")} />
                  🖼️ ছবি (এক বা একাধিক)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input type="radio" name="mtype" checked={mediaType === "video"} onChange={() => setMediaType("video")} />
                  🎥 ভিডিও প্লেয়ার
                </label>
              </div>

              {mediaType === "video" ? (
                <input className={inp} placeholder="ইউটিউব বা ভিডিও লিঙ্ক (https://...)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              ) : (
                <div>
                  <span className="text-xs text-gray-400 block mb-1">ছবি নির্বাচন করুন:</span>
                  <input type="file" multiple accept="image/*" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="text-xs text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input className={inp} placeholder="শিরোনাম লিখুন (ঐচ্ছিক)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inp} placeholder="কাস্টম ব্যাজ (যেমন: আজকের খবর)" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input className={inp} placeholder="বাটন লেখা (যেমন: বিস্তারিত)" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
            </div>
            <input className={inp} placeholder="ক্লিক লিঙ্ক (না দিলে পপ-আপে পূর্ণ খবর দেখাবে)" value={link} onChange={(e) => setLink(e.target.value)} />

            <button type="button" onClick={() => setActiveTab("design")} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer">
              পরবর্তী ধাপ: ডিজাইন ও কার্ড কাস্টমাইজেশন →
            </button>
          </div>
        )}

        {/* ট্যাব ২: ডিজাইন ও কার্ড */}
        {activeTab === "design" && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-gray-300 block">⚡ ৪টি কুইক টেমপ্লেট:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button type="button" onClick={() => applyTemplate("classic")} className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-green-500 text-xs text-left cursor-pointer">
                  🌟 প্রমিত গ্লাস
                </button>
                <button type="button" onClick={() => applyTemplate("minimal")} className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-green-500 text-xs text-left cursor-pointer">
                  🖤 বোল্ড মিনিমাল
                </button>
                <button type="button" onClick={() => applyTemplate("golden")} className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-green-500 text-xs text-left cursor-pointer">
                  👑 গোল্ডেন অ্যালার্ট
                </button>
                <button type="button" onClick={() => applyTemplate("compact")} className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-green-500 text-xs text-left cursor-pointer">
                  📱 কম্প্যাক্ট কার্ড
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-amber-400 block">🔤 ফন্ট ও লেখার নিজস্ব স্টাইল:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">ফন্ট</span>
                  <select className={selectInp} value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>
                    {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">সাইজ</span>
                  <select className={selectInp} value={titleSize} onChange={(e) => setTitleSize(e.target.value)}>
                    {TEXT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">স্টাইল</span>
                  <select className={selectInp} value={titleStyle} onChange={(e) => setTitleStyle(e.target.value)}>
                    {TEXT_STYLES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">অ্যালাইনমেন্ট</span>
                  <select className={selectInp} value={textAlign} onChange={(e) => setTextAlign(e.target.value as any)}>
                    <option value="left">বামে</option>
                    <option value="center">মাঝে</option>
                    <option value="right">ডানে</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800">
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">শিরোনাম কালার</span>
                  <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">ব্যাজ কালার</span>
                  <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">বাটন কালার</span>
                  <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
                <label className="block text-xs">
                  <span className="text-gray-400 block mb-1">কার্ড RGB কালার</span>
                  <input type="color" value={cardBgColor} onChange={(e) => setCardBgColor(e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-green-400">🎚️ গ্লাস কার্ডের আকার ও স্লাইডার:</span>
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={showCardBg} onChange={(e) => setShowCardBg(e.target.checked)} className="rounded accent-green-600" />
                  কার্ড বক্স চালু
                </label>
              </div>

              {showCardBg && (
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>কার্ডের প্রস্থ (Width):</span>
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
                      <span>স্বচ্ছতা / অপাসিটি:</span>
                      <span className="font-bold text-green-400">{cardOpacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={cardOpacity} onChange={(e) => setCardOpacity(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setActiveTab("publish")} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer">
              পরবর্তী ধাপ: প্রকাশ ও মেয়াদ নির্বাচন →
            </button>
          </div>
        )}

        {/* ট্যাব ৩: প্রকাশ ও মেয়াদ */}
        {activeTab === "publish" && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-gray-300 block">স্লাইডারের দৃশ্যমানতা ও সময়কাল:</span>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded accent-green-600" />
                স্লাইডারটি হোমপেজে সক্রিয় রাখুন (Show)
              </label>

              <div>
                <span className="text-xs text-gray-400 block mb-1">মেয়াদ নির্বাচন:</span>
                <select className={selectInp} value={expSel} onChange={(e) => setExpSel(e.target.value)}>
                  {editId && <option value="keep">আগের মেয়াদ রাখুন</option>}
                  <option value="none">স্থায়ী স্লাইড</option>
                  <option value="6">৬ ঘণ্টা পর বন্ধ হবে</option>
                  <option value="12">১২ ঘণ্টা পর বন্ধ হবে</option>
                  <option value="24">২৪ ঘণ্টা পর বন্ধ হবে</option>
                </select>
              </div>
            </div>

            <button className={btnSave} onClick={save} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "স্লাইড আপডেট করুন" : "নতুন স্লাইড সংরক্ষণ করুন"}
            </button>
          </div>
        )}
      </div>

      {/* সেকশন ৪: সব স্লাইডের তালিকা */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-semibold text-base text-gray-200">সব স্লাইড ({safeList.length})</h2>
          <span className="text-xs text-gray-400 font-medium">লাইভ স্লাইড: আনলিমিটেড</span>
        </div>

        <div className="space-y-2.5">
          {safeList.map((s, i) => s && (
            <div key={s.id || i} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
                    {s.category ? `${s.category} · ` : ""}স্লাইডারে আছে ({i + 1})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center text-xs">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 cursor-pointer">⬆</button>
                <button onClick={() => move(i, 1)} disabled={i === safeList.length - 1} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 cursor-pointer">⬇</button>
                <button onClick={() => startEdit(s)} className="px-3 py-1.5 bg-green-950 border border-green-800/60 text-green-300 rounded-lg hover:bg-green-900 cursor-pointer">এডিট</button>
                <button onClick={() => run(() => updateHeroSlide(token, s.id, { is_active: !s.is_active }))} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-gray-300 rounded-lg hover:bg-slate-800 cursor-pointer">
                  {s.is_active ? "লুকান" : "দেখান"}
                </button>
                <button onClick={() => run(() => deleteHeroSlide(token, s.id), "স্লাইডটি মুছে ফেলবেন?")} className="px-3 py-1.5 bg-red-950 border border-red-800/60 text-red-300 rounded-lg hover:bg-red-900 cursor-pointer">মুছুন</button>
              </div>
            </div>
          ))}
          {safeList.length === 0 && <p className="text-sm text-gray-500 text-center py-4">কোনো স্লাইড নেই।</p>}
        </div>
      </div>
    </div>
  )
}

export { HeroManager }
