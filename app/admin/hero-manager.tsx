"use client"

import { useEffect, useState } from "react"
import { uploadImage } from "../../lib/sb"
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
} from "../../lib/hero"
import type { HeroSlide, SubMediaItem } from "../../lib/hero"
import { Plus, Trash2, Video, Image as ImageIcon, Palette } from "lucide-react"

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-950 text-white focus:outline-none focus:border-green-500 transition-all"

export default function HeroManager({ token, shrink }: { token: string; shrink: (f: File) => Promise<Blob> }) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; image_url?: string; summary?: string }>>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // ট্যাব
  const [activeTab, setActiveTab] = useState<"media" | "text" | "publish">("media")
  const [editId, setEditId] = useState<string | null>(null)

  // ব্রেকিং মোড
  const [bOn, setBOn] = useState(false)
  const [bTitle, setBTitle] = useState("")
  const [bText, setBText] = useState("")
  const [bLink, setBLink] = useState("")

  // পোস্ট বেসিক তথ্য
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [buttonText, setButtonText] = useState("বিস্তারিত")

  // সাব-স্লাইড সমূহ (ছবি, ভিডিও, কালার)
  const [mediaItems, setMediaItems] = useState<SubMediaItem[]>([
    { id: "1", type: "color", color: "#0f172a", gradient: "linear-gradient(135deg, #1e293b, #0f172a)" }
  ])
  const [slideDuration, setSlideDuration] = useState<number>(5000)

  // ৩০টি টেক্সট অ্যানিমেশন ও স্টাইল
  const [textEffect, setTextEffect] = useState("fade-up")
  const [textEffectSpeed, setTextEffectSpeed] = useState<number>(50)
  const [titleFont, setTitleFont] = useState(FONTS[0].value)
  const [titleSize, setTitleSize] = useState("2xl")
  const [titleColor, setTitleColor] = useState("#FFFFFF")
  const [titleBgColor, setTitleBgColor] = useState("")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")

  // কার্ড অপশন
  const [showCardBg, setShowCardBg] = useState(true)
  const [cardWidthPct, setCardWidthPct] = useState<number>(90)
  const [cardRadiusPct, setCardRadiusPct] = useState<number>(20)
  const [cardBgColor, setCardBgColor] = useState("#000000")
  const [cardOpacity, setCardOpacity] = useState<number>(60)

  async function loadData() {
    try {
      const [res, p, s] = await Promise.all([getHeroSlides(token), getRecentPosts(), getHeroSettings()])
      setList(res)
      setPosts(p)
      if (s) {
        setBOn(Boolean(s.breaking_on))
        setBTitle(s.breaking_title || "")
        setBText(s.breaking_text || "")
        setBLink(s.breaking_link || "")
      }
    } catch {}
  }

  useEffect(() => {
    loadData()
  }, [token])

  // সাব-স্লাইড যোগ করার অপশন
  function addMedia(type: "color" | "image" | "video") {
    const newItem: SubMediaItem = {
      id: Math.random().toString(),
      type,
      color: "#0f172a",
      gradient: "linear-gradient(135deg, #1e293b, #0f172a)",
      url: "",
      link: ""
    }
    setMediaItems([...mediaItems, newItem])
  }

  function removeMedia(idx: number) {
    if (mediaItems.length <= 1) return
    setMediaItems(mediaItems.filter((_, i) => i !== idx))
  }

  function updateMedia(idx: number, field: keyof SubMediaItem, val: string) {
    const arr = [...mediaItems]
    arr[idx] = { ...arr[idx], [field]: val }
    setMediaItems(arr)
  }

  async function handleFileUpload(idx: number, file: File) {
    setBusy(true)
    try {
      const safeShrink = typeof shrink === "function" ? shrink : async (f: File) => f
      const fileToUpload = file.type.startsWith("video/") ? file : await safeShrink(file)
      const url = await uploadImage(token, fileToUpload)
      updateMedia(idx, "url", url)
      setMsg("✅ ফাইল আপলোড সফল হয়েছে")
    } catch {
      setMsg("❌ ফাইল আপলোড ব্যর্থ হয়েছে")
    }
    setBusy(false)
  }

  function resetForm() {
    setEditId(null)
    setTitle("")
    setSummary("")
    setCategory("")
    setLinkUrl("")
    setButtonText("বিস্তারিত")
    setMediaItems([{ id: "1", type: "color", color: "#0f172a", gradient: "linear-gradient(135deg, #1e293b, #0f172a)" }])
    setActiveTab("media")
  }

  function startEdit(slide: HeroSlide) {
    setEditId(slide.id)
    setTitle(slide.title || "")
    setSummary(slide.summary || "")
    setCategory(slide.category || "")
    setLinkUrl(slide.link_url || "")
    setButtonText(slide.button_text || "বিস্তারিত")
    setTextEffect(slide.text_effect || "fade-up")
    setTextEffectSpeed(slide.text_effect_speed || 50)
    setTitleFont(slide.title_font || FONTS[0].value)
    setTitleColor(slide.title_color || "#ffffff")
    setTitleBgColor(slide.title_bg_color || "")
    setCardWidthPct(slide.card_width_pct || 90)
    setCardRadiusPct(slide.card_radius_pct || 20)
    setSlideDuration(slide.slide_duration || 5000)
    if (slide.media_items && Array.isArray(slide.media_items) && slide.media_items.length > 0) {
      setMediaItems(slide.media_items)
    }
    setActiveTab("media")
    window.scrollTo({ top: 300, behavior: "smooth" })
  }

  async function saveSlide() {
    setBusy(true)
    try {
      const data = {
        title: title.trim() || null,
        summary: summary.trim() || null,
        category: category.trim() || null,
        link_url: linkUrl.trim() || null,
        button_text: buttonText.trim() || "বিস্তারিত",
        media_items: mediaItems,
        slide_duration: Number(slideDuration),
        text_effect: textEffect,
        text_effect_speed: Number(textEffectSpeed),
        title_font: titleFont,
        title_size: titleSize,
        title_color: titleColor,
        title_bg_color: titleBgColor.trim() || null,
        text_align: textAlign,
        show_card_bg: showCardBg,
        card_width_pct: Number(cardWidthPct),
        card_radius_pct: Number(cardRadiusPct),
        card_bg_color: cardBgColor,
        card_opacity: Number(cardOpacity),
        is_active: true,
      }

      if (editId) {
        await updateHeroSlide(token, editId, data)
        setMsg("✅ পোস্ট আপডেট সফল হয়েছে")
      } else {
        const sortOrder = list.length ? Math.min(...list.map((s) => s.sort_order)) - 10 : 0
        await createHeroSlide(token, { ...data, sort_order: sortOrder })
        setMsg("✅ নতুন পোস্ট ও স্লাইড যুক্ত হয়েছে")
      }
      resetForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + e.message)
    }
    setBusy(false)
  }

  async function toggleBreaking(state: boolean) {
    setBusy(true)
    try {
      await saveHeroSettings(token, {
        breaking_on: state,
        breaking_title: bTitle,
        breaking_text: bText,
        breaking_link: bLink,
      })
      setBOn(state)
      setMsg(state ? "🔴 ব্রেকিং মোড চালু হয়েছে" : "✅ ব্রেকিং মোড বন্ধ হয়েছে")
    } catch {}
    setBusy(false)
  }

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-20">
      {msg && <div className="p-3 bg-blue-950 border border-blue-500 rounded-xl text-xs">{msg}</div>}

      {/* ব্রেকিং মোড কন্ট্রোল */}
      <div className={cn("p-4 rounded-2xl bg-slate-900 border", bOn ? "border-red-600 bg-red-950/20" : "border-slate-800")}>
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-sm text-red-400">🚨 জরুরি ব্রেকিং নিউজ মোড</span>
          <button
            onClick={() => toggleBreaking(!bOn)}
            disabled={busy}
            className={cn("px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer", bOn ? "bg-red-600 text-white" : "bg-slate-800 text-gray-300")}
          >
            {bOn ? "ব্রেকিং বন্ধ করুন" : "ব্রেকিং চালু করুন"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className={inp} placeholder="ব্রেকিং শিরোনাম" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
          <input className={inp} placeholder="সংক্ষিপ্ত বিবরণ" value={bText} onChange={(e) => setBText(e.target.value)} />
          <input className={inp} placeholder="লিঙ্ক (ঐচ্ছিক)" value={bLink} onChange={(e) => setBLink(e.target.value)} />
        </div>
      </div>

      {/* স্লাইড তৈরির ড্যাশবোর্ড */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="font-semibold text-base">{editId ? "পোস্ট ও স্লাইড এডিট" : "নতুন পোস্ট ও মাল্টি-স্লাইড তৈরি"}</h2>
          {editId && <button onClick={resetForm} className="text-xs text-red-400 hover:underline">বাতিল</button>}
        </div>

        {/* ৩টি ট্যাব */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={cn("flex-1 py-2 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer", activeTab === "media" ? "text-green-400 border-green-500 bg-slate-800" : "text-gray-400 border-transparent")}
          >
            🖼️ ১. মিডিয়া ও স্লাইডসমূহ ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={cn("flex-1 py-2 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer", activeTab === "text" ? "text-green-400 border-green-500 bg-slate-800" : "text-gray-400 border-transparent")}
          >
            ✍️ ২. টেক্সট ও ৩০টি ইফেক্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publish")}
            className={cn("flex-1 py-2 text-xs font-semibold rounded-t-xl border-b-2 cursor-pointer", activeTab === "publish" ? "text-green-400 border-green-500 bg-slate-800" : "text-gray-400 border-transparent")}
          >
            🚀 ৩. প্রকাশ ও সংরক্ষণ
          </button>
        </div>

        {/* ট্যাব ১: মিডিয়া উপাদান */}
        {activeTab === "media" && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400">এই পোস্টে স্লাইড যোগ করুন:</span>
              <button type="button" onClick={() => addMedia("color")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Palette className="size-3.5 text-purple-400" /> + সলিড / গ্রেডিয়েন্ট কালার
              </button>
              <button type="button" onClick={() => addMedia("image")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <ImageIcon className="size-3.5 text-blue-400" /> + ছবি
              </button>
              <button type="button" onClick={() => addMedia("video")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Video className="size-3.5 text-red-400" /> + ভিডিও / লিঙ্ক
              </button>
            </div>

            <div className="space-y-3">
              {mediaItems.map((item, idx) => (
                <div key={item.id || idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-green-400">স্লাইড #{idx + 1} ({item.type.toUpperCase()})</span>
                    {mediaItems.length > 1 && (
                      <button type="button" onClick={() => removeMedia(idx)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {item.type === "color" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-gray-400 block mb-1">সলিড RGB কালার কোড:</span>
                        <input className={inp} value={item.color || ""} placeholder="#0f172a" onChange={(e) => updateMedia(idx, "color", e.target.value)} />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 block mb-1">অথবা গ্রেডিয়েন্ট CSS:</span>
                        <input className={inp} value={item.gradient || ""} placeholder="linear-gradient(135deg, #1e293b, #0f172a)" onChange={(e) => updateMedia(idx, "gradient", e.target.value)} />
                      </div>
                    </div>
                  )}

                  {item.type === "image" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])} className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white" />
                        <input className={inp} placeholder="বা ছবির সরাসরি URL পেস্ট করুন" value={item.url || ""} onChange={(e) => updateMedia(idx, "url", e.target.value)} />
                      </div>
                    </div>
                  )}

                  {item.type === "video" && (
                    <div className="space-y-2">
                      <input className={inp} placeholder="ইউটিউব, ফেসবুক ভিডিও লিংক অথবা সরাসরি MP4 ভিডিও লিংক পেস্ট করুন" value={item.url || ""} onChange={(e) => updateMedia(idx, "url", e.target.value)} />
                      <div className="text-[11px] text-gray-400">
                        অথবা ফাইল আপলোড:
                        <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])} className="ml-2 text-xs file:py-1 file:px-2 file:rounded file:bg-slate-800 file:text-white" />
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] text-gray-400 block mb-1">🔗 এই মিডিয়াটির সাথে ওয়েবসাইট বা সোশ্যাল মিডিয়া লিঙ্ক (ঐচ্ছিক):</span>
                    <input className={inp} placeholder="https://example.com বা ফেসবুক/পোস্ট লিঙ্ক" value={item.link || ""} onChange={(e) => updateMedia(idx, "link", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>এক স্লাইড থেকে অন্য স্লাইডের সময়কাল (Duration):</span>
                <span className="font-bold text-green-400">{slideDuration / 1000} সেকেন্ড</span>
              </div>
              <input type="range" min="1000" max="15000" step="500" value={slideDuration} onChange={(e) => setSlideDuration(Number(e.target.value))} className="w-full accent-green-600" />
            </div>
          </div>
        )}

        {/* ট্যাব ২: টেক্সট ও ৩০টি ইফেক্ট */}
        {activeTab === "text" && (
          <div className="space-y-3 pt-2">
            <input className={inp} placeholder="শিরোনাম (ঐচ্ছিক)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ" value={summary} onChange={(e) => setSummary(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} placeholder="কাস্টম ব্যাজ (যেমন: বিশেষ প্রতিবেদন)" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input className={inp} placeholder="বাটনের নাম (যেমন: বিস্তারিত)" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-amber-400 block">✨ ৩০টি টেক্সট অ্যানিমেশন ইফেক্ট ও স্টাইল:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">অ্যানিমেশন ইফেক্ট বেছে নিন:</span>
                  <select className={selectInp} value={textEffect} onChange={(e) => setTextEffect(e.target.value)}>
                    {TEXT_EFFECTS_30.map((ef) => (
                      <option key={ef.value} value={ef.value}>{ef.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">ফন্ট:</span>
                  <select className={selectInp} value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>অ্যানিমেশন স্পিড:</span>
                  <span className="text-green-400 font-bold">{textEffectSpeed}%</span>
                </div>
                <input type="range" min="10" max="100" value={textEffectSpeed} onChange={(e) => setTextEffectSpeed(Number(e.target.value))} className="w-full accent-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* ট্যাব ৩: প্রকাশ */}
        {activeTab === "publish" && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-gray-300 block">ওয়েবসাইটের লিঙ্ক নির্বাচন:</span>
              <input className={inp} placeholder="মূল খবরের লিঙ্ক (যেমন: /post/123 বা https://...)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>

            <button onClick={saveSlide} disabled={busy} className="w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3 font-semibold text-sm transition-all cursor-pointer">
              {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পোস্ট আপডেট করুন" : "পোস্ট ও সব স্লাইড প্রকাশ করুন"}
            </button>
          </div>
        )}
      </div>

      {/* পোস্ট তালিকা */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-300">বর্তমান পোস্টসমূহ ({list.length})</h3>
        {list.map((s) => (
          <div key={s.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm text-gray-200">{s.title || "শিরোনামহীন পোস্ট"}</p>
              <p className="text-xs text-gray-500">সাব-স্লাইড সংখ্যা: {s.media_items?.length || 1} টি</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(s)} className="px-3 py-1 bg-green-950 border border-green-800 text-green-300 rounded-lg text-xs">এডিট</button>
              <button onClick={() => deleteHeroSlide(token, s.id).then(loadData)} className="px-3 py-1 bg-red-950 border border-red-800 text-red-300 rounded-lg text-xs">মুছুন</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
