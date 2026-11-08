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

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2 text-xs bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-xs bg-slate-950 text-white focus:outline-none focus:border-green-500 transition-all"
const btnSave = "w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-50 shadow-lg cursor-pointer"
const cardBox = "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"

// ১৫টি আইকন সরাসরি রেন্ডার করার ফাংশন
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
    text: "আসসালামু আলাইকুম ভাই 🫂",
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
    text: "আপনার জন্যই অপেক্ষা করছিলাম 😉",
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

  useEffect(() => {
    loadData()
  }, [])

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

  const updateTextItem = (idx: number, field: keyof IndependentTextItem | "icon", val: any) => {
    const updated = [...textItems]
    updated[idx] = { ...updated[idx], [field]: val }
    setTextItems(updated)
  }

  // দ্রুত ব্যাজ প্রিসেট সেট করার ফাংশন
  const setQuickBadgePreset = (text: string, iconKey: string, bgColor: string) => {
    const badgeIdx = textItems.findIndex((t) => t.id === "txt_badge")
    if (badgeIdx >= 0) {
      const updated = [...textItems]
      updated[badgeIdx] = {
        ...updated[badgeIdx],
        text,
        bg_color: bgColor,
        enabled: true,
        ...({ icon: iconKey } as any),
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
    setLinkUrl(s.link_url || "")
    setBtnText(s.button_text || "বিস্তারিত --")
    setSlideDuration(s.slide_duration ? Math.round(s.slide_duration / 1000) : 5)
    setTransitionEffect(s.transition_effect || "slide-left")
    window.scrollTo({ top: 300, behavior: "smooth" })
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
        button_text: btnText.trim() || "বিস্তারিত --",
        link_url: linkUrl.trim() || null,
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
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-20">
      {msg && (
        <div className="p-3 bg-blue-950/90 border border-blue-500/50 text-blue-200 rounded-xl text-xs font-semibold text-center shadow-lg">
          {msg}
        </div>
      )}

      {/* ১. লাইভ প্রিভিউ বক্স */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-green-400 flex items-center gap-1.5">
            <Eye className="size-4" /> 👁️ লাইভ প্রিভিউ (হোমপেজের ব্যানারে হুবহু যেমন দেখাবে):
          </span>
          <span className="text-[10px] text-gray-400">উচ্চতা ও লেখার অবস্থান সরাসরি দেখুন</span>
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
                    src={parseVideoUrl(videoUrl).embedSrc}
                    className="w-full h-full aspect-video border-0"
                    title="Preview"
                  />
                ) : (
                  <div className="text-xs text-red-400 flex items-center gap-2">
                    <Video className="size-5" />
                    <span>ভিডিও প্রিভিউ সক্রিয়</span>
                  </div>
                )}
              </div>
            )}

            {/* টেক্সট লেয়ার প্রিভিউ */}
            <div className="absolute inset-0 pointer-events-none">
              {textItems.map((item) => {
                if (!item.enabled || !item.text) return null
                const iconKey = (item as any).icon
                return (
                  <div
                    key={item.id}
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
                          padding: item.bg_color ? "4px 12px" : undefined,
                          borderRadius: item.bg_color ? "9999px" : undefined,
                          textAlign: item.align,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
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

            {/* বাটন প্রিভিউ */}
            {btnText && (
              <div className="absolute bottom-4 left-6 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white text-red-700 font-bold text-xs shadow-lg">
                  {btnText} <ExternalLink className="size-3" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ২. ফরম */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-sm sm:text-base text-gray-200">
            {editId ? "✏️ হিরো ব্যানার স্লাইড এডিট করুন" : "➕ নতুন ব্যানার স্লাইড তৈরি করুন"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-red-400 hover:underline cursor-pointer">
              বাতিল
            </button>
          )}
        </div>

        {/* পোস্টের ধরন */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 block">১. ব্যানারের ব্যাকগ্রাউন্ড ধরন:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSlideType("color")}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                slideType === "color"
                  ? "bg-indigo-700 border-indigo-500 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              <Palette className="size-3.5" /> ১. কালার ব্যানার
            </button>
            <button
              type="button"
              onClick={() => setSlideType("image")}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                slideType === "image"
                  ? "bg-indigo-700 border-indigo-500 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon className="size-3.5" /> ২. ছবি
            </button>
            <button
              type="button"
              onClick={() => setSlideType("video")}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                slideType === "video"
                  ? "bg-indigo-700 border-indigo-500 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              <Video className="size-3.5" /> ৩. ভিডিও
            </button>
          </div>
        </div>

        {/* কালার ব্যানার সেটিংস */}
        {slideType === "color" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">🎨 কালার ও গ্রেডিয়েন্ট:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBannerMode("solid")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    bannerMode === "solid" ? "bg-indigo-700 border-indigo-500 text-white" : "border-slate-800 text-gray-400"
                  }`}
                >
                  সলিড
                </button>
                <button
                  type="button"
                  onClick={() => setBannerMode("gradient")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    bannerMode === "gradient" ? "bg-indigo-700 border-indigo-500 text-white" : "border-slate-800 text-gray-400"
                  }`}
                >
                  গ্রেডিয়েন্ট
                </button>
              </div>
            </div>

            {bannerMode === "gradient" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">গ্রেডিয়েন্টের দিক: {bannerAngle}°</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={bannerAngle}
                    onChange={(e) => setBannerAngle(Number(e.target.value))}
                    className="w-36 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-semibold">রঙের প্যালেট:</span>
                    {gradientStops.length < 5 && (
                      <button
                        type="button"
                        onClick={addColorStop}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3" /> + রঙ যোগ
                      </button>
                    )}
                  </div>

                  {gradientStops.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
                      <input
                        type="color"
                        value={st.color}
                        onChange={(e) => updateColorStop(i, "color", e.target.value)}
                        className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        className="w-20 border border-slate-700 rounded px-1.5 py-1 text-xs bg-slate-950 font-mono"
                        value={st.color}
                        onChange={(e) => updateColorStop(i, "color", e.target.value)}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={st.stop}
                        onChange={(e) => updateColorStop(i, "stop", Number(e.target.value))}
                        className="flex-1 accent-indigo-500 cursor-pointer"
                      />
                      <span className="w-8 text-[11px] text-indigo-400 font-bold">{st.stop}%</span>
                      {gradientStops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColorStop(i)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bannerMode === "solid" && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-gray-400">রঙ বেছে নিন:</span>
                <input
                  type="color"
                  value={gradientStops[0]?.color || "#1e1b4b"}
                  onChange={(e) => updateColorStop(0, "color", e.target.value)}
                  className="size-9 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">↕️ ব্যানারের উচ্চতা (Height): {bannerHeight}px</span>
              <input
                type="range"
                min="140"
                max="360"
                value={bannerHeight}
                onChange={(e) => setBannerHeight(Number(e.target.value))}
                className="w-48 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ছবি আপলোড */}
        {slideType === "image" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
            <label className="text-xs font-bold text-blue-400 block">🖼️ ছবি আপলোড বা লিংক:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-gray-300 hover:bg-slate-800 cursor-pointer shrink-0">
                <Upload className="size-3.5 text-blue-400" />
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
                placeholder="ছবির লিংক পেস্ট করুন (https://...)"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
            </div>
            {imgFile && <p className="text-[11px] text-green-400">ফাইল: {imgFile.name}</p>}
          </div>
        )}

        {/* ভিডিও */}
        {slideType === "video" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
            <label className="text-xs font-bold text-red-400 block">🎥 ভিডিও ফাইল বা ইউটিউব লিংক:</label>
            <input
              className={inp}
              placeholder="ইউটিউব বা সরাসরি MP4 লিংক (https://...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-gray-300 hover:bg-slate-800 cursor-pointer">
                <Upload className="size-3 text-red-400" />
                <span>ভিডিও ফাইল আপলোড</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {videoFile && <span className="text-[10px] text-green-400">{videoFile.name}</span>}
            </div>
          </div>
        )}

        {/* ⭐ দ্রুত ব্যাজ প্রিসেট বাটনসমূহ ⭐ */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-bold text-yellow-400 block">⚡ দ্রুত ব্যাজ নির্বাচন (এক ক্লিকে পছন্দের ব্যাজ সেট করুন):</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setQuickBadgePreset("ব্রেকিং নিউজ", "siren", "#DC2626")}
              className="px-2.5 py-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Siren className="size-3" /> ব্রেকিং নিউজ
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("হট নিউজ", "flame", "#EA580C")}
              className="px-2.5 py-1 rounded-full bg-orange-600/90 hover:bg-orange-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Flame className="size-3" /> হট নিউজ
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("ফ্ল্যাশ আপডেট", "zap", "#D97706")}
              className="px-2.5 py-1 rounded-full bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Zap className="size-3" /> ফ্ল্যাশ আপডেট
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("লাইভ আপডেট", "radio", "#2563EB")}
              className="px-2.5 py-1 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Radio className="size-3" /> লাইভ আপডেট
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("নতুন আপডেট", "sparkles", "#7C3AED")}
              className="px-2.5 py-1 rounded-full bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="size-3" /> নতুন আপডেট
            </button>
            <button
              type="button"
              onClick={() => setQuickBadgePreset("বিশেষ বিজ্ঞপ্তি", "bell-ring", "#B91C1C")}
              className="px-2.5 py-1 rounded-full bg-rose-700/90 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <BellRing className="size-3" /> বিশেষ বিজ্ঞপ্তি
            </button>
          </div>
        </div>

        {/* টেক্সট বক্সসমূহ ও ১৫টি আইকন নির্বাচন */}
        <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <Type className="size-4" /> ২. লেখার স্বাধীন বক্সসমূহ ও আইকন:
            </span>
            <button
              type="button"
              onClick={addNewCustomBox}
              className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> নতুন বক্স যোগ
            </button>
          </div>

          <div className="space-y-3.5">
            {textItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => updateTextItem(idx, "enabled", e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                  {idx >= 4 && (
                    <button
                      type="button"
                      onClick={() => removeCustomBox(item.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {item.enabled && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 block mb-0.5">লেখার বিবরণ:</label>
                        <input
                          className={inp}
                          placeholder={`${item.label}-এর লেখা লিখুন...`}
                          value={item.text}
                          onChange={(e) => updateTextItem(idx, "text", e.target.value)}
                        />
                      </div>

                      {/* ⭐ ১৫টি আইকন সিলেক্টর ড্রপডাউন ⭐ */}
                      <div>
                        <label className="text-[10px] text-yellow-400 block mb-0.5 font-bold">
                          আইকন (১৫টি আইকন):
                        </label>
                        <select
                          className={selectInp}
                          value={(item as any).icon || "none"}
                          onChange={(e) =>
                            updateTextItem(
                              idx,
                              "icon" as any,
                              e.target.value === "none" ? undefined : e.target.value
                            )
                          }
                        >
                          <option value="none">— কোনো আইকন নেই —</option>
                          <optgroup label="৫টি ব্রেকিং/হট নিউজ আইকন">
                            {BANNER_BADGE_ICONS.slice(0, 5).map((ic) => (
                              <option key={ic.key} value={ic.key}>
                                {ic.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="১০টি অন্যান্য ব্যাজ আইকন">
                            {BANNER_BADGE_ICONS.slice(5).map((ic) => (
                              <option key={ic.key} value={ic.key}>
                                {ic.label}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* X ও Y অবস্থান */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>↔️ ডানে-বামে (X):</span>
                          <span className="text-indigo-400 font-bold">{item.x}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.x}
                          onChange={(e) => updateTextItem(idx, "x", Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>↕️ উপরে-নিচে (Y):</span>
                          <span className="text-indigo-400 font-bold">{item.y}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.y}
                          onChange={(e) => updateTextItem(idx, "y", Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* এলাইনমেন্ট */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                      <span className="text-[11px] text-gray-300 font-medium">📐 এলাইনমেন্ট:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "left")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 cursor-pointer ${
                            item.align === "left" ? "bg-indigo-700 border-indigo-500 text-white" : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignLeft className="size-3" /> বামে
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "center")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 cursor-pointer ${
                            item.align === "center" ? "bg-indigo-700 border-indigo-500 text-white" : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignCenter className="size-3" /> মাঝে
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "right")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 cursor-pointer ${
                            item.align === "right" ? "bg-indigo-700 border-indigo-500 text-white" : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignRight className="size-3" /> ডানে
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "justify")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 cursor-pointer ${
                            item.align === "justify" ? "bg-indigo-700 border-indigo-500 text-white" : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignJustify className="size-3" /> জাস্টিফাই
                        </button>
                      </div>
                    </div>

                    {/* সাইজ, রঙ, ফন্ট ও অ্যানিমেশন */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">সাইজ: {item.size_scale}x</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={item.size_scale}
                          onChange={(e) => updateTextItem(idx, "size_scale", Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">রঙ ও ব্যাকগ্রাউন্ড:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            title="লেখার রঙ"
                            value={item.color}
                            onChange={(e) => updateTextItem(idx, "color", e.target.value)}
                            className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="color"
                            title="ব্যাকগ্রাউন্ড ব্যাজ রঙ"
                            value={item.bg_color || "#DC2626"}
                            onChange={(e) => updateTextItem(idx, "bg_color", e.target.value)}
                            className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => updateTextItem(idx, "weight", item.weight === "bold" ? "normal" : "bold")}
                            className={`px-2 py-1 rounded text-xs font-bold border cursor-pointer ${item.weight === "bold" ? "bg-white text-black" : "border-slate-700 text-gray-400"}`}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTextItem(idx, "italic", !item.italic)}
                            className={`px-2 py-1 rounded text-xs italic font-bold border cursor-pointer ${item.italic ? "bg-white text-black" : "border-slate-700 text-gray-400"}`}
                          >
                            I
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">ফন্ট:</span>
                        <select
                          className={selectInp}
                          value={item.font}
                          onChange={(e) => updateTextItem(idx, "font", e.target.value)}
                        >
                          {FONTS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">অ্যানিমেশন:</span>
                        <select
                          className={selectInp}
                          value={item.animation}
                          onChange={(e) => updateTextItem(idx, "animation", e.target.value)}
                        >
                          {TEXT_EFFECTS_35.map((ef) => (
                            <option key={ef.value} value={ef.value}>{ef.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* স্লাইডারের গতি ও ট্রানজিশন */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
          <span className="text-xs font-bold text-gray-300 block">৩. স্লাইডারের গতি ও ট্রানজিশন:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>স্লাইড প্রদর্শনের সময়:</span>
                <span className="text-indigo-400 font-bold">{slideDuration} সেকেন্ড</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={slideDuration}
                onChange={(e) => setSlideDuration(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-1">ট্রানজিশন ইফেক্ট:</span>
              <select
                className={selectInp}
                value={transitionEffect}
                onChange={(e) => setTransitionEffect(e.target.value)}
              >
                {TRANSITIONS_30.map((tr) => (
                  <option key={tr.value} value={tr.value}>{tr.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* বাটন টেক্সট ও লিংক */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">বাটন টেক্সট (Button Text):</label>
            <input
              className={inp}
              placeholder="যেমন: বিস্তারিত --"
              value={btnText}
              onChange={(e) => setBtnText(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">ক্লিক লিংক (Link URL):</label>
            <input
              className={inp}
              placeholder="https://... অথবা /post/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
        </div>

        {/* সেভ বাটন */}
        <button className={btnSave} onClick={handleSaveSlide} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "ব্যানার স্লাইড আপডেট করুন" : "🚀 ব্যানার স্লাইড সংরক্ষণ ও লাইভ করুন"}
        </button>
      </div>

      {/* ৩. বর্তমান ব্যানার স্লাইডসমূহের তালিকা ও ডিলিট অপশন */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-bold text-xs sm:text-sm text-gray-200">বর্তমান ব্যানার স্লাইডসমূহ ({list.length})</h2>
          <span className="text-[10px] text-green-400 font-semibold">সব মুছে ফেললে হোমপেজে ব্যানার থাকবে না</span>
        </div>

        <div className="space-y-2">
          {list.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-6 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-gray-200 truncate">
                    {slide.title || "শিরোনামহীন ব্যানার"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    ধরণ: {slide.slide_type === "color" ? "কালার" : slide.slide_type === "image" ? "ছবি" : "ভিডিও"} · সময়: {Math.round((slide.slide_duration || 5000) / 1000)}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(slide)}
                  className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg hover:bg-indigo-900 cursor-pointer"
                >
                  এডিট
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`"${slide.title || 'এই ব্যানার স্লাইড'}" মুছে ফেলতে চান? এটি মুছে ফেললে হোমপেজ থেকেও সরে যাবে।`)) {
                      setBusy(true)
                      try {
                        await deleteHeroBannerSlide(token, slide.id)
                        await loadData()
                        setMsg("✅ স্লাইড মুছে ফেলা হয়েছে")
                        if (editId === slide.id) resetForm()
                      } catch {
                        setMsg("❌ মুছতে সমস্যা হয়েছে")
                      }
                      setBusy(false)
                    }
                  }}
                  className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-800 rounded-lg hover:bg-red-900 cursor-pointer"
                >
                  মুছুন
                </button>
              </div>
            </div>
          ))}

          {/* যখন কোনো স্লাইড থাকবে না তখন এই মেসেজ দেখাবে */}
          {list.length === 0 && (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/60 space-y-1">
              <p className="text-sm font-bold text-gray-300">বর্তমানে কোনো ব্যানার স্লাইড নেই</p>
              <p className="text-xs text-gray-500">হোমপেজে এই ব্যানারটি সম্পূর্ণ বন্ধ আছে। অ্যাডমিন চাইলে উপরের ফর্ম পূরণ করে নতুন স্লাইড সেভ করলে আবার লাইভ হবে।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
