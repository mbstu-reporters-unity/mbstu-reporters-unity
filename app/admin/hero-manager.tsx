"use client"

import { useEffect, useState } from "react"
import { uploadImage } from "../../lib/sb"
import {
  BADGES,
  FONTS,
  FONT_WEIGHTS,
  MAX_LIVE,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getHeroSettings,
  saveHeroSettings,
  getRecentPosts,
} from "../../lib/hero"
import type { HeroSlide } from "../../lib/hero"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
const POS = { top: "উপরে", center: "মাঝে", bottom: "নিচে" } as const

const isLive = (s: HeroSlide) => s.is_active && (!s.expires_at || new Date(s.expires_at) > new Date())

export default function HeroManager({ token, shrink }: { token: string; shrink: (f: File) => Promise<Blob> }) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; image_url?: string; summary?: string }>>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // ব্রেকিং মোড
  const [bOn, setBOn] = useState(false)
  const [bTitle, setBTitle] = useState("")
  const [bText, setBText] = useState("")
  const [bLink, setBLink] = useState("")

  // সার্বিক স্লাইডার গতি ও ট্রানজিশন সেটিংস
  const [slideSpeed, setSlideSpeed] = useState<number>(4500)
  const [transType, setTransType] = useState<"fade" | "slide-left" | "slide-right" | "slide-up">("fade")
  const [textMotion, setTextMotion] = useState<boolean>(true)

  // একক স্লাইড ফর্ম
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
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [titleColor, setTitleColor] = useState("#FFFFFF")
  const [titleBgColor, setTitleBgColor] = useState("")
  const [badgeColor, setBadgeColor] = useState("#EAB308")
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)
  const [fontWeight, setFontWeight] = useState("700")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  // কাস্টম পজিশন
  const [contentPosV, setContentPosV] = useState<"top" | "center" | "bottom">("bottom")
  const [contentPosH, setContentPosH] = useState<"left" | "center" | "right">("left")
  const [showCardBg, setShowCardBg] = useState(true)

  // ০-১০০% স্লাইডার স্টেট
  const [cardWidthPct, setCardWidthPct] = useState<number>(90)
  const [cardRadiusPct, setCardRadiusPct] = useState<number>(20)
  const [cardPaddingVal, setCardPaddingVal] = useState<number>(20)
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
    setMsg("✅ পোস্টের তথ্য ও লিংক ফর্মে যুক্ত হয়েছে")
  }

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

  async function saveSliderSettings() {
    try {
      await saveHeroSettings(token, {
        slide_speed: Number(slideSpeed),
        transition_type: transType,
        text_motion: textMotion,
      })
      setMsg("✅ স্লাইডারের গতি ও ট্রানজিশন সেটিংস সফলভাবে সেভ হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
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
    setCardBgColor(s.card_bg_color || "#000000")
    setCardOpacity(s.card_opacity ?? 60)
    setFitMode(s.fit_mode || "contain")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function save() {
    if (!title.trim() && !file && !oldImage && !videoUrl.trim()) {
      setMsg("❌ অন্তত একটি ছবি, ভিডিও অথবা শিরোনাম দিন")
      return
    }
    const l = link.trim()
    if (l && !/^(https?:\/\/|\/)/i.test(l)) {
      setMsg("❌ লিংক https:// বা / দিয়ে শুরু হতে হবে")
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
      setMsg("✅ স্লাইড সেভ হয়েছে")
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
    return idx < MAX_LIVE ? `স্লাইডারে আছে (${idx + 1})` : "অপেক্ষায় (৫টির বেশি)"
  }

  return (
    <div className="space-y-4">
      {msg && <p className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-sm font-medium">{msg}</p>}

      {/* স্লাইডার গতি ও ট্রানজিশন কন্ট্রোল */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3 border border-gray-100">
        <h2 className="font-semibold text-gray-800">⚙️ স্লাইডার গতি ও ট্রানজিশন নিয়ন্ত্রণ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-600">স্লাইড পরিবর্তনের গতি / সময়</span>
            <select className={inp} value={slideSpeed} onChange={(e) => setSlideSpeed(Number(e.target.value))}>
              <option value={0}>♾️ আনলিমিটেড (অটোপ্লে বন্ধ - ভিডিও দেখতে সুবিধা)</option>
              <option value={3000}>৩ সেকেন্ড</option>
              <option value={5000}>৫ সেকেন্ড (স্বাভাবিক)</option>
              <option value={8000}>৮ সেকেন্ড</option>
              <option value={15000}>১৫ সেকেন্ড</option>
              <option value={30000}>৩০ সেকেন্ড</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-gray-600">ট্রানজিশনের ধরন</span>
            <select className={inp} value={transType} onChange={(e) => setTransType(e.target.value as any)}>
              <option value="fade">ফেড (মসৃণভাবে মিলিয়ে আসা)</option>
              <option value="slide-left">ডান থেকে বামে স্লাইড</option>
              <option value="slide-right">বাম থেকে ডানে স্লাইড</option>
              <option value="slide-up">নিচ থেকে উপরে স্লাইড</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer pt-1">
          <input type="checkbox" checked={textMotion} onChange={(e) => setTextMotion(e.target.checked)} className="rounded" />
          শিরোনামে মোশন অ্যানিমেশন চালু রাখুন
        </label>

        <button onClick={saveSliderSettings} className="bg-slate-800 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-slate-700">
          গতি ও ট্রানজিশন সংরক্ষণ করুন
        </button>
      </div>

      {/* জরুরি ব্রেকিং মোড */}
      <div className={`rounded-2xl shadow p-4 space-y-3 ${bOn ? "bg-red-50 border border-red-300" : "bg-white"}`}>
        <h2 className="font-semibold">🔴 জরুরি ব্রেকিং মোড {bOn && "(চালু আছে)"}</h2>
        <p className="text-xs text-gray-600">চালু করলে স্লাইডারের জায়গায় একটি বড় ব্রেকিং বক্স দেখাবে। বন্ধ করলে স্বাভাবিক স্লাইডার ফিরে আসবে।</p>
        <input className={inp} placeholder="ব্রেকিং শিরোনাম *" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ" value={bText} onChange={(e) => setBText(e.target.value)} />
        <input className={inp} placeholder="লিংক (ঐচ্ছিক)" value={bLink} onChange={(e) => setBLink(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={() => saveBreaking(true)} className="flex-1 bg-red-600 text-white rounded-xl py-3 font-semibold">
            {bOn ? "আপডেট করুন" : "ব্রেকিং মোড চালু করুন"}
          </button>
          {bOn && (
            <button onClick={() => saveBreaking(false)} className="flex-1 border rounded-xl py-3 font-semibold">
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>

      {/* স্লাইড তৈরির ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <h2 className="font-semibold text-lg text-gray-800">{editId ? "স্লাইড এডিট করুন" : "নতুন স্লাইড যোগ করুন"}</h2>

        {/* সাইটের পোস্ট থেকে স্বয়ংক্রিয় নেওয়ার অপশন */}
        {posts.length > 0 && !editId && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-green-800">📰 ওয়েবসাইটের কোনো পোস্ট স্লাইডারে আনুন (এক ক্লিকে)</span>
            <select className={inp} onChange={(e) => handlePostSelect(e.target.value)} defaultValue="">
              <option value="">-- ওয়েবসাইট থেকে খবর বেছে নিন --</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* মিডিয়া চয়েস */}
        <div className="flex gap-4 p-2 bg-gray-50 rounded-xl text-sm">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input type="radio" name="mtype" checked={mediaType === "image"} onChange={() => setMediaType("image")} />
            🖼️ ছবি
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input type="radio" name="mtype" checked={mediaType === "video"} onChange={() => setMediaType("video")} />
            🎥 ইউটিউব / ফেসবুক ভিডিও প্লেয়ার (প্রথম আলোর মতো টেনে দেখা যাবে)
          </label>
        </div>

        {/* ছবি বা ভিডিও ফিট মোড (কাটবে কি না) */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">ছবি/ভিডিওর মাপ:</span>
          <div className="flex gap-3 text-xs">
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

        {/* শিরোনাম ও বিবরণ */}
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-500">শিরোনাম (ঐচ্ছিক)</span>
            <input className={inp} placeholder="শিরোনাম লিখুন (না চাইলে খালি রাখুন)" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* শিরোনামের নিজস্ব ব্যাকগ্রাউন্ড হাইলাইট কালার */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs">
            <span className="text-gray-600">শিরোনামের পেছনের ব্যাকগ্রাউন্ড কালার (ঐচ্ছিক):</span>
            <input type="color" value={titleBgColor || "#000000"} onChange={(e) => setTitleBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border" />
            {titleBgColor ? (
              <button type="button" onClick={() => setTitleBgColor("")} className="text-red-500 text-xs underline">বাদ দিন</button>
            ) : (
              <span className="text-gray-400">কোনো ব্যাকগ্রাউন্ড নেই</span>
            )}
          </div>

          <div>
            <span className="text-xs text-gray-500">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</span>
            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (না চাইলে খালি রাখুন)" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
        </div>

        {/* গ্লাস কার্ড ও ০-১০০% স্লাইডার কন্ট্রোল */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950">📍 সেমি-ট্রান্সপারেন্ট গ্লাস লেয়ার ও পজিশন সেটিংস</span>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={showCardBg} onChange={(e) => setShowCardBg(e.target.checked)} className="rounded" />
              কার্ড চালু রাখুন
            </label>
          </div>

          {/* পজিশন ড্রপডাউন */}
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-gray-600">উপরে-নিচে অবস্থান</span>
              <select className={inp} value={contentPosV} onChange={(e) => setContentPosV(e.target.value as any)}>
                <option value="bottom">নিচে (Bottom)</option>
                <option value="center">মাঝামাঝি (Center)</option>
                <option value="top">উপরে (Top)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-600">ডানে-বামে অবস্থান</span>
              <select className={inp} value={contentPosH} onChange={(e) => setContentPosH(e.target.value as any)}>
                <option value="left">বামে (Left)</option>
                <option value="center">মাঝে (Center)</option>
                <option value="right">ডানে (Right)</option>
              </select>
            </label>
          </div>

          {/* ০ থেকে ১০০% স্লাইডার বারসমূহ */}
          {showCardBg && (
            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-3 pt-2">
              <span className="text-xs font-semibold text-gray-700 block">🎚️ ০-১০০% স্লাইডার দিয়ে কার্ডের আকার ও স্টাইল পরিবর্তন:</span>

              {/* প্রস্থ স্লাইডার */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>কার্ডের প্রস্থ (Width):</span>
                  <span className="font-bold text-green-700">{cardWidthPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cardWidthPct}
                  onChange={(e) => setCardWidthPct(Number(e.target.value))}
                  className="w-full accent-green-700 cursor-pointer"
                />
              </div>

              {/* রাউন্ডনেস স্লাইডার */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>রাউন্ডনেস (০% = চতুর্ভুজাকার চারকোনা, ১০০% = সম্পূর্ণ গোল):</span>
                  <span className="font-bold text-green-700">{cardRadiusPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cardRadiusPct}
                  onChange={(e) => setCardRadiusPct(Number(e.target.value))}
                  className="w-full accent-green-700 cursor-pointer"
                />
              </div>

              {/* প্যাডিং / দৈর্ঘ্য স্লাইডার */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>কার্ডের ভেতরের ফাঁকা জায়গা (Padding):</span>
                  <span className="font-bold text-green-700">{cardPaddingVal}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="50"
                  value={cardPaddingVal}
                  onChange={(e) => setCardPaddingVal(Number(e.target.value))}
                  className="w-full accent-green-700 cursor-pointer"
                />
              </div>

              {/* স্বচ্ছতা স্লাইডার */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>স্বচ্ছতা / অপাসিটি (০% = অদৃশ্য, ১০০% = পুরোপুরি স্পষ্ট):</span>
                  <span className="font-bold text-green-700">{cardOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cardOpacity}
                  onChange={(e) => setCardOpacity(Number(e.target.value))}
                  className="w-full accent-green-700 cursor-pointer"
                />
              </div>

              {/* ব্যাকগ্রাউন্ড আরজিবি রঙ */}
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="text-xs text-gray-600">কার্ডের ব্যাকগ্রাউন্ড RGB রঙ:</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={cardBgColor} onChange={(e) => setCardBgColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                  <span className="text-xs font-mono">{cardBgColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ফন্ট নির্বাচন */}
        <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
          <span className="text-xs font-semibold text-gray-700">🔤 ফন্ট, স্টাইল ও টেক্সট দিক</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="block">
              <span className="text-xs text-gray-500">ফন্ট (১০টি)</span>
              <select className={inp} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {FONTS.map((f) => (
                  <option key={f.label} value={f.value}>{f.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">থিকনেস (বোল্ডনেস)</span>
              <select className={inp} value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
                {FONT_WEIGHTS.map((w) => (
                  <option key={w.label} value={w.value}>{w.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">টেক্সট দিক</span>
              <select className={inp} value={textAlign} onChange={(e) => setTextAlign(e.target.value as any)}>
                <option value="left">বামে (Left)</option>
                <option value="center">মাঝে (Center)</option>
                <option value="right">ডানে (Right)</option>
              </select>
            </label>
          </div>
        </div>

        {/* ব্যাজ নির্বাচন */}
        <div className="space-y-2">
          <span className="text-xs text-gray-500">ব্যাজ (ঐচ্ছিক)</span>
          <input className={inp} placeholder="কাস্টম ব্যাজ (না চাইলে খালি রাখুন)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            {BADGES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setCategory(b)}
                className={`rounded-full px-3 py-1 text-xs border ${category === b ? "bg-green-700 text-white" : "bg-gray-50 text-gray-700"}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* কালার পছন্দ */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
          <label className="block text-xs">
            <span className="text-gray-600 block mb-1">শিরোনামের লেখার রঙ</span>
            <div className="flex items-center gap-2">
              <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              <span className="text-xs font-mono">{titleColor}</span>
            </div>
          </label>
          <label className="block text-xs">
            <span className="text-gray-600 block mb-1">ব্যাজের ব্যাকগ্রাউন্ড রঙ</span>
            <div className="flex items-center gap-2">
              <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              <span className="text-xs font-mono">{badgeColor}</span>
            </div>
          </label>
        </div>

        {/* বাটন টেক্সট ও লিংক */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-500">বাটনের লেখা (ঐচ্ছিক)</span>
            <input className={inp} placeholder="বাটনের লেখা (যেমন: বিস্তারিত)" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
          </div>
          <div>
            <span className="text-xs text-gray-500">ক্লিক লিংক (ঐচ্ছিক)</span>
            <input className={inp} placeholder="লিংক (না দিলে পপ-আপে পূর্ণ বিবরণ দেখাবে)" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
        </div>

        {/* মিডিয়া ইনপুট */}
        {mediaType === "video" ? (
          <div>
            <span className="text-xs text-gray-600">ইউটিউব বা ভিডিও লিঙ্ক</span>
            <input className={inp} placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
        ) : (
          <>
            <label className="block">
              <span className="text-xs text-gray-600">ছবি আপলোড</span>
              <input className="block mt-1 text-sm" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            {(file || oldImage) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file ? URL.createObjectURL(file) : oldImage || ""}
                alt=""
                className="w-full h-36 object-cover rounded-xl"
                style={{ objectPosition: pos }}
              />
            )}
            <label className="block">
              <span className="text-xs text-gray-600">ছবির ফোকাস অবস্থান</span>
              <select className={inp} value={pos} onChange={(e) => setPos(e.target.value as "top" | "center" | "bottom")}>
                {(Object.keys(POS) as Array<keyof typeof POS>).map((k) => (
                  <option key={k} value={k}>{POS[k]}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="block">
          <span className="text-xs text-gray-600">স্লাইডারে কতক্ষণ থাকবে</span>
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
          স্লাইডারে চালু রাখুন (Show)
        </label>

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "স্লাইড যোগ করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline text-gray-600">বাতিল</button>}
      </div>

      {/* স্লাইড তালিকা */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-800">সব স্লাইড ({list.length})</h2>
        <p className="text-xs text-gray-500">সর্বোচ্চ {MAX_LIVE}টি স্লাইড হোমপেজে ঘুরবে।</p>
        {list.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl shadow p-3 text-sm space-y-2 border border-gray-100">
            <div className="flex gap-3">
              {s.media_type === "video" ? (
                <div className="w-20 h-14 bg-red-600 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                  ▶ ভিডিও
                </div>
              ) : s.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" style={{ objectPosition: s.image_pos }} />
              ) : (
                <div className="w-20 h-14 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-xs text-gray-400">
                  কোনো ছবি নেই
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{s.title || "কোনো শিরোনাম নেই"}</p>
                <p className="text-xs text-gray-500">
                  {s.category ? `${s.category} · ` : ""}{status(s)}
                </p>
                {s.expires_at && (
                  <p className="text-xs text-gray-400">
                    মেয়াদ: {new Date(s.expires_at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-1 border-t text-xs">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30 font-medium">⬆ উপরে</button>
              <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="disabled:opacity-30 font-medium">⬇ নিচে</button>
              <button onClick={() => startEdit(s)} className="text-green-700 font-medium">এডিট</button>
              <button onClick={() => run(() => updateHeroSlide(token, s.id, { is_active: !s.is_active }))} className="text-gray-700 font-medium">
                {s.is_active ? "লুকান" : "দেখান"}
              </button>
              <button onClick={() => run(() => deleteHeroSlide(token, s.id), "স্লাইডটি মুছে ফেলবেন?")} className="text-red-600 font-medium">মুছুন</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
