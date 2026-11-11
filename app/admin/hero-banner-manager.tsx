"use client"

import { useEffect, useState } from "react"
import { uploadImage, uploadVideo } from "@/lib/sb"
import {
  FONTS,
  TEXT_EFFECTS_35,
  TRANSITIONS_30,
  parseVideoUrl,
  type HeroSlide,
  type HeroPostType,
  type GradientStop,
  type IndependentTextItem,
} from "@/lib/hero"
import {
  getHeroBannerSlides,
  createHeroBannerSlide,
  updateHeroBannerSlide,
  deleteHeroBannerSlide,
  BANNER_BADGE_ICONS,
} from "@/lib/hero-banner"
import {
  Palette,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Type,
  Upload,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Calendar,
  ExternalLink,
  Siren,
  Flame,
  Zap,
  Radio,
  BellRing,
  Sparkles,
  Megaphone,
  Newspaper,
  TrendingUp,
  AlertTriangle,
  Star,
  Award,
  Clock,
  Compass,
  CheckCircle2,
} from "lucide-react"

const inp = "w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-500 transition-all"
const selectInp = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition-all"
const btnSave = "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-50 shadow-md cursor-pointer active:scale-98"
const cardBox = "bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-slate-800"

function renderBadgeIcon(key?: string, className = "size-3.5 mr-1.5 inline-block") {
  switch (key) {
    case "siren": return <Siren className={className} />
    case "flame": return <Flame className={className} />
    case "zap": return <Zap className={className} />
    case "radio": return <Radio className={className} />
    case "bell-ring": return <BellRing className={className} />
    case "sparkles": return <Sparkles className={className} />
    case "megaphone": return <Megaphone className={className} />
    case "newspaper": return <Newspaper className={className} />
    case "trending-up": return <TrendingUp className={className} />
    case "alert-triangle": return <AlertTriangle className={className} />
    case "star": return <Star className={className} />
    case "award": return <Award className={className} />
    case "clock": return <Clock className={className} />
    case "compass": return <Compass className={className} />
    case "check-circle": return <CheckCircle2 className={className} />
    default: return null
  }
}

const DEFAULT_BANNER_TEXT_ITEMS: IndependentTextItem[] = [
  {
    id: "txt_title",
    label: "১. প্রধান শিরোনাম (Title)",
    text: "ব্যানার শিরোনাম লিখুন",
    enabled: true,
    x: 35,
    y: 42,
    size_scale: 1.15,
    color: "#FFFFFF",
    weight: "bold",
    italic: false,
    align: "left",
    font: FONTS[0].value,
    animation: "fade-up",
  },
  {
    id: "txt_desc",
    label: "২. সাব-হেডিং / বর্ণনা (Text)",
    text: "এখানে বিস্তারিত বা বিবরণ লিখুন",
    enabled: true,
    x: 35,
    y: 68,
    size_scale: 0.9,
    color: "#CBD5E1",
    weight: "normal",
    italic: false,
    align: "left",
    font: FONTS[0].value,
    animation: "fade-up",
  },
  {
    id: "txt_badge",
    label: "৩. ব্যাজ (Badge - ব্রেকিং, হট নিউজ, আপডেট ইত্যাদি)",
    text: "ব্রেকিং নিউজ",
    enabled: true,
    x: 18,
    y: 20,
    size_scale: 0.8,
    color: "#FFFFFF",
    bg_color: "#DC2626",
    weight: "bold",
    italic: false,
    align: "center",
    font: FONTS[0].value,
    animation: "fade-up",
    ...({ icon: "siren", badge_pulse: true } as any),
  },
  {
    id: "txt_date",
    label: "৪. তারিখ / অতিরিক্ত তথ্য (ঐচ্ছিক)",
    text: "৮ নভেম্বর ২০২৬",
    enabled: false,
    x: 82,
    y: 22,
    size_scale: 0.75,
    color: "#FDE047",
    weight: "normal",
    italic: false,
    align: "right",
    font: FONTS[0].value,
    animation: "fade-up",
  },
]

export default function HeroBannerManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const [slideType, setSlideType] = useState<HeroPostType>("color")
  const [bannerMode, setBannerMode] = useState<"solid" | "gradient">("gradient")
  const [bannerAngle, setBannerAngle] = useState(135)
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: "#1e1b4b", stop: 0 },
    { color: "#1e3a8a", stop: 50 },
    { color: "#0f172a", stop: 100 },
  ])
  const [bannerHeight, setBannerHeight] = useState(200)

  const [imgUrl, setImgUrl] = useState("")
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [textItems, setTextItems] = useState<IndependentTextItem[]>(DEFAULT_BANNER_TEXT_ITEMS)
  
  const [showBtn, setShowBtn] = useState(true)
  const [linkUrl, setLinkUrl] = useState("")
  const [btnText, setBtnText] = useState("বিস্তারিত --")

  const [slideDuration, setSlideDuration] = useState(5)
  const [transitionEffect, setTransitionEffect] = useState("slide-left")

  async function loadData() {
    try {
      const data = await getHeroBannerSlides()
      setList(data)
    } catch {}
  }

  useEffect(() => { loadData() }, [])

  const addColorStop = () => {
    if (gradientStops.length >= 5) return
    const nextStop = Math.min(100, gradientStops.length * 25)
    setGradientStops([...gradientStops, { color: "#3b82f6", stop: nextStop }])
  }

  const removeColorStop = (idx: number) => {
    if (gradientStops.length <= 2) return
    setGradientStops(gradientStops.filter((_, i) => i !== idx))
  }

  const updateColorStop = (idx: number, field: "color" | "stop", val: any) => {
    const updated = [...gradientStops]
    updated[idx] = { ...updated[idx], [field]: val }
    setGradientStops(updated)
  }

  const updateTextItem = (idx: number, field: keyof IndependentTextItem | "icon" | "badge_pulse", val: any) => {
    const updated = [...textItems]
    updated[idx] = { ...updated[idx], [field]: val }
    setTextItems(updated)
  }

  const setQuickBadgePreset = (text: string, iconKey: string, bgColor: string) => {
    const badgeIdx = textItems.findIndex((t) => t.id === "txt_badge")
    if (badgeIdx >= 0) {
      const updated = [...textItems]
      updated[badgeIdx] = {
        ...updated[badgeIdx],
        text,
        bg_color: bgColor,
        enabled: true,
        ...({ icon: iconKey, badge_pulse: true } as any),
      }
      setTextItems(updated)
    }
  }

  const addNewCustomBox = () => {
    const newBox: IndependentTextItem = {
      id: `txt_custom_${Date.now()}`,
      label: `অতিরিক্ত লেখা #${textItems.length + 1}`,
      text: "নতুন লেখা",
      enabled: true,
      x: 50,
      y: 75,
      size_scale: 0.85,
      color: "#FFFFFF",
      weight: "normal",
      italic: false,
      align: "center",
      font: FONTS[0].value,
      animation: "fade-up",
    }
    setTextItems([...textItems, newBox])
  }

  const removeCustomBox = (id: string) => {
    setTextItems(textItems.filter((item) => item.id !== id))
  }

  const resetForm = () => {
    setEditId(null)
    setSlideType("color")
    setBannerMode("gradient")
    setBannerAngle(135)
    setGradientStops([
      { color: "#1e1b4b", stop: 0 },
      { color: "#1e3a8a", stop: 50 },
      { color: "#0f172a", stop: 100 },
    ])
    setBannerHeight(200)
    setImgUrl("")
    setImgFile(null)
    setVideoUrl("")
    setVideoFile(null)
    setTextItems(DEFAULT_BANNER_TEXT_ITEMS)
    setShowBtn(true)
    setLinkUrl("")
    setBtnText("বিস্তারিত --")
    setSlideDuration(5)
    setTransitionEffect("slide-left")
  }

  const startEdit = (s: HeroSlide) => {
    setEditId(s.id)
    setSlideType(s.slide_type || "color")
    if (s.banner_config) {
      setBannerMode(s.banner_config.mode || "gradient")
      setBannerAngle(s.banner_config.angle ?? 135)
      setGradientStops(s.banner_config.stops || [{ color: "#1e1b4b", stop: 0 }, { color: "#0f172a", stop: 100 }])
      setBannerHeight(s.banner_config.height_px || 200)
    }

    if (s.text_layers && s.text_layers.length > 0) {
      setTextItems(s.text_layers as IndependentTextItem[])
    }

    setImgUrl(s.media_items?.[0]?.url || "")
    setVideoUrl(s.video_config?.url || "")
    setShowBtn(Boolean(s.button_text && s.button_text.trim()))
    setBtnText(s.button_text || "")
    setLinkUrl(s.link_url || "")
    setSlideDuration(s.slide_duration ? Math.round(s.slide_duration / 1000) : 5)
    setTransitionEffect(s.transition_effect || "slide-left")
    window.scrollTo({ top: 100, behavior: "smooth" })
  }

  const handleSaveSlide = async () => {
    setBusy(true)
    setMsg("")
    try {
      let finalImg = imgUrl
      if (imgFile) {
        setMsg("ছবি আপলোড হচ্ছে...")
        finalImg = await uploadImage(token, await shrink(imgFile))
      }

      let finalVideo = videoUrl
      if (videoFile) {
        setMsg("ভিডিও আপলোড হচ্ছে...")
        finalVideo = await uploadVideo(token, videoFile)
      }

      const primaryTitle = textItems.find((t) => t.enabled && t.text)?.text || "ব্যানার বার্তা"
      const primarySummary = textItems.find((t) => t.id === "txt_desc" && t.enabled)?.text || null

      const payload: Partial<HeroSlide> = {
        title: primaryTitle,
        summary: primarySummary,
        category: "ব্রেকিং ব্যানার",
        button_text: showBtn && btnText.trim() ? btnText.trim() : null,
        link_url: showBtn && linkUrl.trim() ? linkUrl.trim() : null,
        slide_type: slideType,
        banner_config: {
          mode: bannerMode,
          angle: Number(bannerAngle),
          stops: gradientStops,
          height_px: Number(bannerHeight),
          width_pct: 100,
        },
        text_layers: textItems,
        video_config: {
          type: "direct",
          url: finalVideo,
          autoplay: true,
          mute_on_leave: true,
        },
        media_items: [
          {
            id: "m_banner_1",
            type: slideType === "video" ? "video" : slideType === "image" ? "image" : "color",
            url: slideType === "video" ? finalVideo : finalImg,
          },
        ],
        slide_duration: Math.max(1, Number(slideDuration)) * 1000,
        transition_effect: transitionEffect,
        is_active: true,
      }

      if (editId) {
        await updateHeroBannerSlide(token, editId, payload)
        setMsg("✅ ব্যানার স্লাইড আপডেট হয়েছে")
      } else {
        await createHeroBannerSlide(token, payload)
        setMsg("✅ নতুন ব্যানার স্লাইড যুক্ত ও লাইভ হয়েছে")
      }

      resetForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  const previewBg =
    bannerMode === "solid"
      ? gradientStops[0]?.color || "#1e1b4b"
      : `linear-gradient(${bannerAngle}deg, ${[...gradientStops]
          .sort((a, b) => a.stop - b.stop)
          .map((s) => `${s.color} ${s.stop}%`)
          .join(", ")})`

  return (
    <div className="space-y-5 text-slate-800">
      
      {/* অ্যানিমেশন ইঞ্জিন */}
      <style>{`
        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(22px); } 100% { opacity: 1; transform: translateY(0); } }
        .anim_fade-up { animation: anim_fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-flex; }
        @keyframes anim_typewriter { 0% { opacity: 0; clip-path: inset(0 100% 0 0); } 100% { opacity: 1; clip-path: inset(0 0 0 0); } }
        .anim_typewriter { animation: anim_typewriter 1s ease-out forwards; display: inline-flex; }
        @keyframes anim_zoom-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        .anim_zoom-pop { animation: anim_zoom-pop 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; display: inline-flex; }
        @keyframes anim_neon-pulse { 0%, 100% { text-shadow: 0 0 4px #fff, 0 0 14px #38bdf8; } 50% { text-shadow: 0 0 2px #fff, 0 0 6px #0284c7; } }
        .anim_neon-pulse { animation: anim_neon-pulse 1.4s ease-in-out infinite; display: inline-flex; }
        @keyframes anim_bounce-in { 0% { opacity: 0; transform: translateY(-40px); } 60% { opacity: 1; transform: translateY(8px); } 80% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        .anim_bounce-in { animation: anim_bounce-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards; display: inline-flex; }
      `}</style>

      {msg && (
        <div className="p-3 bg-cyan-50 border border-cyan-300 text-cyan-900 rounded-2xl text-xs font-bold text-center shadow-xs">
          {msg}
        </div>
      )}

      {/* ১. লাইভ প্রিভিউ বক্স */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold text-cyan-700 flex items-center gap-1.5">
            <Eye className="size-4" /> 👁️ লাইভ প্রিভিউ (হোমপেজে যেমন দেখাবে):
          </span>
          <span className="text-[10px] text-slate-500">লেখা ও ব্যাজের নড়াচড়া সরাসরি দেখুন</span>
        </div>

        <div className="w-full flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-slate-800">
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              height: `${bannerHeight}px`,
              background: slideType === "color" ? previewBg : "#000000",
            }}
          >
            {slideType === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgFile ? URL.createObjectURL(imgFile) : imgUrl || "/images/hero-1.png"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}

            {slideType === "video" && (
              <div className="w-full h-full flex items-center justify-center bg-black">
                {parseVideoUrl(videoUrl).isEmbed ? (
                  <iframe
                    src={`${parseVideoUrl(videoUrl).embedSrc}&playsinline=1`}
                    className="w-full h-full aspect-video border-0 pointer-events-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title="Preview"
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain pointer-events-auto"
                  />
                )}
              </div>
            )}

            {/* টেক্সট ও ব্যাজ লেয়ার প্রিভিউ */}
            <div className="absolute inset-0 pointer-events-none">
              {textItems.map((item) => {
                if (!item.enabled || !item.text) return null
                const iconKey = (item as any).icon
                const isBadge = item.id === 'txt_badge' || Boolean(item.bg_color)
                const showPulse = (item as any).badge_pulse !== false && isBadge

                return (
                  <div
                    key={`${item.id}_${item.animation}`}
                    className="absolute transition-all duration-150"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: "translate(-50%, -50%)",
                      maxWidth: "92%",
                      textAlign: item.align,
                    }}
                  >
                    <div style={{ transform: `scale(${item.size_scale})` }}>
                      <div
                        className={`anim_${item.animation}`}
                        style={{
                          fontFamily: item.font,
                          color: item.color,
                          backgroundColor: item.bg_color || undefined,
                          padding: item.bg_color ? "4px 14px" : undefined,
                          borderRadius: item.bg_color ? "9999px" : undefined,
                          textAlign: item.align,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {showPulse && (
                          <span className="relative flex size-2 mr-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                            <span className="relative inline-flex rounded-full size-2 bg-white" />
                          </span>
                        )}

                        <div
                          className={`leading-tight drop-shadow-md flex items-center ${
                            item.weight === "bold"
                              ? "font-bold"
                              : item.weight === "semibold"
                              ? "font-semibold"
                              : "font-normal"
                          } ${item.italic ? "italic" : ""} text-xs sm:text-base`}
                        >
                          {iconKey && renderBadgeIcon(iconKey, "size-3.5 mr-1 shrink-0")}
                          {item.id === "txt_date" && !iconKey && <Calendar className="inline-block size-3.5 mr-1 opacity-80" />}
                          <span>{item.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {showBtn && btnText.trim() && (
              <div className="absolute bottom-4 left-6 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white text-red-700 font-bold text-xs shadow-lg">
                  {btnText} <ExternalLink className="size-3" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ২. ব্যানার এডিট ও ক্রিয়েট ফর্ম */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-bold text-sm sm:text-base text-slate-800">
            {editId ? "✏️ হিরো ব্যানার স্লাইড এডিট করুন" : "➕ নতুন ব্যানার স্লাইড তৈরি করুন"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-rose-600 hover:underline cursor-pointer">
              বাতিল
            </button>
          )}
        </div>

        {/* ব্যাকগ্রাউন্ড ধরন */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">১. ব্যাকগ্রাউন্ড ধরন:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSlideType("color")}
              className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                slideType === "color"
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Palette className="size-3.5" /> কালার
            </button>
            <button
              type="button"
              onClick={() => setSlideType("image")}
              className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                slideType === "image"
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <ImageIcon className="size-3.5" /> ছবি
            </button>
            <button
              type="button"
              onClick={() => setSlideType("video")}
              className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                slideType === "video"
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Video className="size-3.5" /> ভিডিও
            </button>
          </div>
        </div>

        {/* কালার ব্যানার সেটিংস */}
        {slideType === "color" && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">🎨 কালার ও গ্রেডিয়েন্ট:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBannerMode("solid")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    bannerMode === "solid" ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  সলিড
                </button>
                <button
                  type="button"
                  onClick={() => setBannerMode("gradient")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    bannerMode === "gradient" ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  গ্রেডিয়েন্ট
                </button>
              </div>
            </div>

            {bannerMode === "gradient" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">গ্রেডিয়েন্টের দিক: {bannerAngle}°</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={bannerAngle}
                    onChange={(e) => setBannerAngle(Number(e.target.value))}
                    className="w-36 accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-semibold">রঙের প্যালেট:</span>
                    {gradientStops.length < 5 && (
                      <button
                        type="button"
                        onClick={addColorStop}
                        className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3" /> + রঙ যোগ
                      </button>
                    )}
                  </div>

                  {gradientStops.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                      <input
                        type="color"
                        value={st.color}
                        onChange={(e) => updateColorStop(i, "color", e.target.value)}
                        className="size-7 rounded border bg-transparent cursor-pointer"
                      />
                      <input
                        className="w-20 border border-slate-200 rounded px-1.5 py-1 text-xs font-mono"
                        value={st.color}
                        onChange={(e) => updateColorStop(i, "color", e.target.value)}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={st.stop}
                        onChange={(e) => updateColorStop(i, "stop", Number(e.target.value))}
                        className="flex-1 accent-cyan-600 cursor-pointer"
                      />
                      <span className="w-8 text-[11px] text-cyan-700 font-bold">{st.stop}%</span>
                      {gradientStops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColorStop(i)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">↕️ ব্যানারের উচ্চতা: {bannerHeight}px</span>
              <input
                type="range"
                min="140"
                max="360"
                value={bannerHeight}
                onChange={(e) => setBannerHeight(Number(e.target.value))}
                className="w-44 accent-cyan-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ছবি */}
        {slideType === "image" && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 block">🖼️ ছবি আপলোড বা লিংক:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0">
                <Upload className="size-3.5 text-cyan-600" />
                <span>ফাইল বাছাই করুন</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <input
                className={inp}
                placeholder="ছবির সরাসরি লিংক (https://...)"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
            </div>
            {imgFile && <p className="text-[11px] text-emerald-700 font-semibold">ফাইল: {imgFile.name}</p>}
          </div>
        )}

        {/* ভিডিও */}
        {slideType === "video" && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 block">🎥 ভিডিও ফাইল বা ইউটিউব লিংক:</label>
            <input
              className={inp}
              placeholder="ইউটিউব ভিডিওর লিংক (https://youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-100 cursor-pointer w-fit">
              <Upload className="size-3 text-red-500" />
              <span>ভিডিও ফাইল আপলোড (সর্বোচ্চ ৫০ MB)</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {videoFile && <span className="text-[10px] text-emerald-700 font-bold">{videoFile.name}</span>}
          </div>
        )}

        {/* দ্রুত ব্যাজ প্রিসেট */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-700 block">⚡ দ্রুত ব্যাজ প্রিসেট:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setQuickBadgePreset("ব্রেকিং নিউজ", "siren", "#DC2626")}
              className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Siren className="size-3" /> ব্রেকিং নিউজ
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("হট নিউজ", "flame", "#EA580C")}
              className="px-2.5 py-1 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Flame className="size-3" /> হট নিউজ
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("ফ্ল্যাশ আপডেট", "zap", "#D97706")}
              className="px-2.5 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Zap className="size-3" /> ফ্ল্যাশ আপডেট
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("লাইভ আপডেট", "radio", "#2563EB")}
              className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Radio className="size-3" /> লাইভ আপডেট
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("জরুরি বিজ্ঞপ্তি", "bell-ring", "#B91C1C")}
              className="px-2.5 py-1 rounded-full bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <BellRing className="size-3" /> জরুরি বিজ্ঞপ্তি
            </button>
          </div>
        </div>

        {/* টেক্সট লেয়ারসমূহ */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="size-4 text-cyan-600" /> ২. লেখার স্বাধীন বক্সসমূহ ও অ্যানিমেশন:
            </span>
            <button
              type="button"
              onClick={addNewCustomBox}
              className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> নতুন বক্স যোগ
            </button>
          </div>

          <div className="space-y-3">
            {textItems.map((item, idx) => {
              const isBadge = item.id === 'txt_badge' || Boolean(item.bg_color)
              return (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => updateTextItem(idx, "enabled", e.target.checked)}
                        className="accent-cyan-600 rounded"
                      />
                      <span>{item.label}</span>
                    </label>
                    {idx >= 4 && (
                      <button type="button" onClick={() => removeCustomBox(item.id)} className="text-rose-500 hover:text-rose-700 p-1">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {item.enabled && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            className={inp}
                            placeholder={`${item.label}-এর লেখা লিখুন...`}
                            value={item.text}
                            onChange={(e) => updateTextItem(idx, "text", e.target.value)}
                          />
                        </div>
                        <div>
                          <select
                            className={selectInp}
                            value={(item as any).icon || "none"}
                            onChange={(e) => updateTextItem(idx, "icon" as any, e.target.value === "none" ? undefined : e.target.value)}
                          >
                            <option value="none">— আইকন নেই —</option>
                            {BANNER_BADGE_ICONS.map((ic) => (
                              <option key={ic.key} value={ic.key}>{ic.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* পজিশন স্লাইডার */}
                      <div className="grid grid-cols-2 gap-3 p-2 bg-slate-50 rounded-lg text-xs">
                        <div>
                          <span className="text-[10px] text-slate-600 block">↔️ ডানে-বামে (X): {item.x}%</span>
                          <input type="range" min="0" max="100" value={item.x} onChange={(e) => updateTextItem(idx, "x", Number(e.target.value))} className="w-full accent-cyan-600 cursor-pointer" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 block">↕️ উপরে-নিচে (Y): {item.y}%</span>
                          <input type="range" min="0" max="100" value={item.y} onChange={(e) => updateTextItem(idx, "y", Number(e.target.value))} className="w-full accent-cyan-600 cursor-pointer" />
                        </div>
                      </div>

                      {/* স্টাইল, ফন্ট ও অ্যানিমেশন */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-600 block">সাইজ: {item.size_scale}x</span>
                          <input type="range" min="0.5" max="2.0" step="0.05" value={item.size_scale} onChange={(e) => updateTextItem(idx, "size_scale", Number(e.target.value))} className="w-full accent-cyan-600 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-1.5 pt-3">
                          <input type="color" value={item.color} onChange={(e) => updateTextItem(idx, "color", e.target.value)} className="size-6 rounded border bg-transparent cursor-pointer" title="লেখার রঙ" />
                          <input type="color" value={item.bg_color || "#DC2626"} onChange={(e) => updateTextItem(idx, "bg_color", e.target.value)} className="size-6 rounded border bg-transparent cursor-pointer" title="ব্যাজের রঙ" />
                        </div>
                        <div>
                          <select className={selectInp} value={item.font} onChange={(e) => updateTextItem(idx, "font", e.target.value)}>
                            {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <select className={selectInp} value={item.animation} onChange={(e) => updateTextItem(idx, "animation", e.target.value)}>
                            {TEXT_EFFECTS_35.map((ef) => <option key={ef.value} value={ef.value}>{ef.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* স্লাইডারের গতি ও ট্রানজিশন */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-700 block">৩. স্লাইডারের গতি ও ট্রানজিশন:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>প্রদর্শনের সময়:</span>
                <span className="text-cyan-700 font-bold">{slideDuration} সেকেন্ড</span>
              </div>
              <input type="range" min="1" max="60" value={slideDuration} onChange={(e) => setSlideDuration(Number(e.target.value))} className="w-full accent-cyan-600 cursor-pointer" />
            </div>
            <div>
              <select className={selectInp} value={transitionEffect} onChange={(e) => setTransitionEffect(e.target.value)}>
                {TRANSITIONS_30.map((tr) => <option key={tr.value} value={tr.value}>{tr.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* বিস্তারিত বাটন সুইচ */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={showBtn} onChange={(e) => setShowBtn(e.target.checked)} className="accent-cyan-600 rounded size-4" />
            <span>৪. বিস্তারিত অ্যাকশন বাটন দেখান (ঐচ্ছিক)</span>
          </label>
          {showBtn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <input className={inp} placeholder="বাটন টেক্সট (যেমন: বিস্তারিত --)" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
              <input className={inp} placeholder="লিংক (https://...)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
          )}
        </div>

        <button className={btnSave} onClick={handleSaveSlide} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "ব্যানার স্লাইড আপডেট করুন" : "🚀 ব্যানার স্লাইড সংরক্ষণ ও লাইভ করুন"}
        </button>
      </div>

      {/* ৩. বর্তমান ব্যানার স্লাইডসমূহের তালিকা */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-bold text-xs sm:text-sm text-slate-800">বর্তমান ব্যানার স্লাইডসমূহ ({list.length})</h2>
          <span className="text-[10px] text-cyan-700 font-semibold">সব মুছে ফেললে হোমপেজে ব্যানার বন্ধ থাকবে</span>
        </div>

        <div className="space-y-2">
          {list.map((slide, idx) => (
            <div key={slide.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-6 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{slide.title || "শিরোনামহীন ব্যানার"}</p>
                  <p className="text-[10px] text-slate-500">
                    ধরণ: {slide.slide_type === "color" ? "কালার" : slide.slide_type === "image" ? "ছবি" : "ভিডিও"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-bold">
                <button type="button" onClick={() => startEdit(slide)} className="text-cyan-700 hover:underline">এডিট</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("এই ব্যানার স্লাইডটি মুছে ফেলতে চান?")) {
                      setBusy(true)
                      await deleteHeroBannerSlide(token, slide.id)
                      await loadData()
                      if (editId === slide.id) resetForm()
                      setBusy(false)
                    }
                  }}
                  className="text-rose-600 hover:underline"
                >
                  মুছুন
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-xs text-slate-400 text-center py-4">বর্তমানে কোনো ব্যানার নেই।</p>}
        </div>
      </div>
    </div>
  )
}
