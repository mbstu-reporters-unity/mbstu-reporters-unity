"use client"

import { useEffect, useState } from "react"
import { uploadImage, uploadVideo } from "@/lib/sb"
import {
  FONTS,
  TEXT_EFFECTS_35,
  TRANSITIONS_30,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getHeroSettings,
  saveHeroSettings,
  parseVideoUrl,
  type HeroSlide,
  type HeroSettings,
  type HeroPostType,
  type GradientStop,
  type IndependentTextItem,
} from "@/lib/hero"
import {
  Palette,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Type,
  Layers,
  Upload,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Calendar,
  User,
  Sliders,
  Check,
} from "lucide-react"

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2 text-xs bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-xs bg-slate-950 text-white focus:outline-none focus:border-green-500 transition-all"
const btnSave = "w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-50 shadow-lg cursor-pointer"
const cardBox = "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"

// ডিফল্ট ৫টি স্বাধীন টেক্সট বক্স
const DEFAULT_TEXT_ITEMS: IndependentTextItem[] = [
  {
    id: "txt_title",
    label: "১. প্রধান শিরোনাম (Title)",
    text: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
    enabled: true,
    x: 50,
    y: 38,
    size_scale: 1.1,
    color: "#FFFFFF",
    weight: "bold",
    italic: false,
    align: "center",
    font: FONTS[0].value,
    animation: "fade-up",
  },
  {
    id: "txt_subtitle",
    label: "২. সাব-হেডিং (Sub-heading)",
    text: "সত্য ও ন্যায়ের সাথে ক্যাম্পাস সাংবাদিকতা",
    enabled: true,
    x: 50,
    y: 52,
    size_scale: 0.9,
    color: "#E2E8F0",
    weight: "semibold",
    italic: false,
    align: "center",
    font: FONTS[0].value,
    animation: "fade-up",
  },
  {
    id: "txt_desc",
    label: "৩. সংক্ষিপ্ত বিস্তারিত (Description)",
    text: "ক্যাম্পাসের সকল খবর, আপডেট ও অনুসন্ধানী প্রতিবেদন এক ক্লিকেই।",
    enabled: true,
    x: 50,
    y: 65,
    size_scale: 0.8,
    color: "#CBD5E1",
    weight: "normal",
    italic: false,
    align: "center",
    font: FONTS[0].value,
    animation: "fade-up",
  },
  {
    id: "txt_date",
    label: "৪. তারিখ (Date)",
    text: "৭ নভেম্বর ২০২৬",
    enabled: true,
    x: 28,
    y: 84,
    size_scale: 0.75,
    color: "#FDE047",
    weight: "normal",
    italic: false,
    align: "left",
    font: FONTS[0].value,
    animation: "fade-up",
  },
  {
    id: "txt_reporter",
    label: "৫. সাংবাদিকের নাম (Reporter Name)",
    text: "বিশেষ প্রতিবেদক",
    enabled: true,
    x: 72,
    y: 84,
    size_scale: 0.75,
    color: "#38BDF8",
    weight: "semibold",
    italic: false,
    align: "right",
    font: FONTS[0].value,
    animation: "fade-up",
  },
]

export default function HeroManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<HeroSlide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // পোস্টের ধরন
  const [slideType, setSlideType] = useState<HeroPostType>("color")

  // কালার ব্যানার (দৈর্ঘ্য ও প্রস্থ উভয়ের নিয়ন্ত্রণ সহ)
  const [bannerMode, setBannerMode] = useState<"solid" | "gradient">("gradient")
  const [bannerAngle, setBannerAngle] = useState(135)
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: "#064e3b", stop: 0 },
    { color: "#0f172a", stop: 50 },
    { color: "#1e1b4b", stop: 100 },
  ])
  const [bannerHeight, setBannerHeight] = useState(480) // দৈর্ঘ্য (উচ্চতা)
  const [bannerWidth, setBannerWidth] = useState(100) // প্রস্থ (৫০% থেকে ১০০%)

  // ছবি ও ভিডিও
  const [imgUrl, setImgUrl] = useState("")
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  // ৫টি সম্পূর্ণ স্বাধীন টেক্সট বক্স
  const [textItems, setTextItems] = useState<IndependentTextItem[]>(DEFAULT_TEXT_ITEMS)

  // লিঙ্ক, ডিউরেশন ও স্প্লিট
  const [linkUrl, setLinkUrl] = useState("")
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [slideDuration, setSlideDuration] = useState(5)
  const [transitionEffect, setTransitionEffect] = useState("slide-left")
  const [desktopSplits, setDesktopSplits] = useState(1)

  // ডাটা লোড
  async function loadData() {
    try {
      const [slidesData, settingsData] = await Promise.all([
        getHeroSlides(token),
        getHeroSettings(),
      ])
      setList(slidesData)
      setSettings(settingsData)
      if (settingsData?.desktop_splits) {
        setDesktopSplits(settingsData.desktop_splits)
      }
    } catch {}
  }

  useEffect(() => {
    loadData()
  }, [token])

  // কালার স্টপ যোগ/বিয়োগ
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

  // স্বাধীন টেক্সট আইটেম আপডেট (একটি সরালে অন্যটি স্থির থাকবে)
  const updateTextItem = (idx: number, field: keyof IndependentTextItem, val: any) => {
    const updated = [...textItems]
    updated[idx] = { ...updated[idx], [field]: val }
    setTextItems(updated)
  }

  // অতিরিক্ত নতুন টেক্সট বক্স যোগ করা
  const addNewCustomBox = () => {
    const newBox: IndependentTextItem = {
      id: `txt_custom_${Date.now()}`,
      label: `অতিরিক্ত লেখা বক্স #${textItems.length + 1}`,
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

  // ফর্ম রিসেট
  const resetForm = () => {
    setEditId(null)
    setSlideType("color")
    setBannerMode("gradient")
    setBannerAngle(135)
    setGradientStops([
      { color: "#064e3b", stop: 0 },
      { color: "#0f172a", stop: 50 },
      { color: "#1e1b4b", stop: 100 },
    ])
    setBannerHeight(480)
    setBannerWidth(100)
    setImgUrl("")
    setImgFile(null)
    setVideoUrl("")
    setVideoFile(null)
    setTextItems(DEFAULT_TEXT_ITEMS)
    setLinkUrl("")
    setSlideDuration(5)
  }

  // এডিট শুরু
  const startEdit = (s: HeroSlide) => {
    setEditId(s.id)
    setSlideType(s.slide_type || "color")
    if (s.banner_config) {
      setBannerMode(s.banner_config.mode || "gradient")
      setBannerAngle(s.banner_config.angle ?? 135)
      setGradientStops(s.banner_config.stops || [{ color: "#064e3b", stop: 0 }, { color: "#0f172a", stop: 100 }])
      setBannerHeight(s.banner_config.height_px || 480)
      setBannerWidth(s.banner_config.width_pct ?? 100)
    }

    if (s.text_layers && s.text_layers.length > 0) {
      // যদি আগে থেকেই স্বাধীন আইটেম হিসেবে থাকে
      if (s.text_layers[0]?.label) {
        setTextItems(s.text_layers as IndependentTextItem[])
      } else {
        // পুরোনো পোস্ট হলে তাকে নতুন ৫টি স্বাধীন বক্সে সুন্দরভাবে কনভার্ট করা
        const t1 = s.text_layers[0]?.title || s.title || ""
        const t2 = s.text_layers[0]?.subtitle || ""
        const t3 = s.text_layers[0]?.description || s.summary || ""
        const converted = [...DEFAULT_TEXT_ITEMS]
        converted[0].text = t1
        converted[1].text = t2
        converted[2].text = t3
        setTextItems(converted)
      }
    }

    setImgUrl(s.media_items?.[0]?.url || "")
    setVideoUrl(s.video_config?.url || "")
    setLinkUrl(s.link_url || "")
    setSlideDuration(s.slide_duration ? Math.round(s.slide_duration / 1000) : 5)
    setTransitionEffect(s.transition_effect || "slide-left")
    window.scrollTo({ top: 300, behavior: "smooth" })
  }

  // স্লাইড সংরক্ষণ (আজীবন নিরাপদ টাইমস্ট্যাম্প ও শতভাগ সফল সেভ)
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

      const primaryTitle = textItems.find((t) => t.enabled && t.text)?.text || "হিরো পোস্ট"
      const primarySummary = textItems.find((t) => t.id === "txt_desc" && t.enabled)?.text || null

      const payload: Partial<HeroSlide> = {
        title: primaryTitle,
        summary: primarySummary,
        category: "ক্যাম্পাস বার্তা",
        button_text: btnText.trim() || "বিস্তারিত",
        link_url: linkUrl.trim() || null,
        slide_type: slideType,
        banner_config: {
          mode: bannerMode,
          angle: Number(bannerAngle),
          stops: gradientStops,
          height_px: Number(bannerHeight),
          width_pct: Number(bannerWidth),
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
            id: "m_1",
            type: slideType === "video" ? "video" : slideType === "image" ? "image" : "color",
            url: slideType === "video" ? finalVideo : finalImg,
          },
        ],
        slide_duration: Math.max(1, Number(slideDuration)) * 1000,
        transition_effect: transitionEffect,
        is_active: true,
      }

      if (editId) {
        await updateHeroSlide(token, editId, payload)
        setMsg("✅ পোস্ট সফলভাবে আপডেট হয়েছে")
      } else {
        const safeOrder = Math.floor(Date.now() / 1000)
        await createHeroSlide(token, { ...payload, sort_order: safeOrder })
        setMsg("✅ নতুন পোস্ট সফলভাবে প্রকাশিত হয়েছে এবং হোমপেজে দৃশ্যমান")
      }

      resetForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "পোস্ট করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  // স্প্লিট লেআউট পরিবর্তন
  const handleSaveSplits = async (splits: number) => {
    setDesktopSplits(splits)
    try {
      await saveHeroSettings(token, { desktop_splits: splits })
      setMsg(`✅ হোমপেজে ${splits}টি স্প্লিট ভিউ সেট হয়েছে (সবগুলো পোস্ট চক্রাকারে ঘুরবে)`)
    } catch {
      setMsg("❌ স্প্লিট সেভ করা যায়নি")
    }
  }

  // লাইভ প্রিভিউ ব্যাকগ্রাউন্ড
  const previewBg =
    bannerMode === "solid"
      ? gradientStops[0]?.color || "#064e3b"
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

      {/* ================= ১. রিয়েল-টাইম লাইভ প্রিভিউ বক্স ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-green-400 flex items-center gap-1.5">
            <Eye className="size-4" /> 👁️ লাইভ প্রিভিউ (হোমপেজে হুবহু যেমন দেখাবে):
          </span>
          <span className="text-[10px] text-gray-400">প্রস্থ, দৈর্ঘ্য ও প্রতিটি লেখার অবস্থান সরাসরি দেখুন</span>
        </div>

        <div className="w-full flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-slate-800">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              width: `${bannerWidth}%`,
              height: `${Math.min(380, bannerHeight)}px`,
              background: slideType === "color" ? previewBg : "#000000",
            }}
          >
            {slideType === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgFile ? URL.createObjectURL(imgFile) : imgUrl || "/images/hero-1.png"}
                alt="Preview"
                className={`w-full h-full ${fitMode === "cover" ? "object-cover" : "object-contain"}`}
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
                    <span>ভিডিও প্লেয়ার প্রিভিউ সক্রিয়</span>
                  </div>
                )}
              </div>
            )}

            {/* ৫টি সম্পূর্ণ স্বাধীন টেক্সট বক্স লাইভ প্রিভিউ */}
            <div className="absolute inset-0 pointer-events-none">
              {textItems.map((item) => {
                if (!item.enabled || !item.text) return null
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
                          padding: item.bg_color ? "4px 10px" : undefined,
                          borderRadius: item.bg_color ? "6px" : undefined,
                          textAlign: item.align,
                        }}
                      >
                        <div
                          className={`leading-tight drop-shadow-md ${
                            item.weight === "bold"
                              ? "font-bold"
                              : item.weight === "semibold"
                              ? "font-semibold"
                              : "font-normal"
                          } ${item.italic ? "italic" : ""} text-xs sm:text-base md:text-xl`}
                        >
                          {item.id === "txt_date" && <Calendar className="inline-block size-3.5 mr-1 opacity-80" />}
                          {item.id === "txt_reporter" && <User className="inline-block size-3.5 mr-1 opacity-80" />}
                          {item.text}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ২. হিরো কন্ট্রোল ও ফর্ম ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-sm sm:text-base text-gray-200">
            {editId ? "✏️ হিরো পোস্ট এডিট করুন" : "➕ নতুন হিরো পোস্ট তৈরি করুন"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-red-400 hover:underline">
              বাতিল
            </button>
          )}
        </div>

        {/* পোস্টের ধরন */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 block">১. পোস্টের ধরন বেছে নিন:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSlideType("color")}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                slideType === "color"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              <Palette className="size-3.5" /> ১. কালার ব্যানার
            </button>
            <button
              type="button"
              onClick={() => setSlideType("image")}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                slideType === "image"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon className="size-3.5" /> ২. ছবি
            </button>
            <button
              type="button"
              onClick={() => setSlideType("video")}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                slideType === "video"
                  ? "bg-emerald-700 border-emerald-500 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              <Video className="size-3.5" /> ৩. ভিডিও / লিঙ্ক
            </button>
          </div>
        </div>

        {/* কালার ব্যানার সেটিংস (দৈর্ঘ্য ও প্রস্থ স্লাইডার সহ) */}
        {slideType === "color" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">🎨 কালার ব্যানার সেটিংস:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBannerMode("solid")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    bannerMode === "solid" ? "bg-emerald-700 border-emerald-500 text-white" : "border-slate-800 text-gray-400"
                  }`}
                >
                  সলিড রঙ
                </button>
                <button
                  type="button"
                  onClick={() => setBannerMode("gradient")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    bannerMode === "gradient" ? "bg-emerald-700 border-emerald-500 text-white" : "border-slate-800 text-gray-400"
                  }`}
                >
                  গ্রেডিয়েন্ট রঙ (৩-৫টি)
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
                    className="w-36 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-semibold">রঙের প্যালেট ({gradientStops.length}টি রঙ):</span>
                    {gradientStops.length < 5 && (
                      <button
                        type="button"
                        onClick={addColorStop}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="size-3" /> + রঙ যোগ করুন
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
                      <span className="text-[11px] text-gray-400">অবস্থান:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={st.stop}
                        onChange={(e) => updateColorStop(i, "stop", Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <span className="w-8 text-[11px] text-emerald-400 font-bold">{st.stop}%</span>
                      {gradientStops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColorStop(i)}
                          className="text-red-400 hover:text-red-300 p-1"
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
                  value={gradientStops[0]?.color || "#064e3b"}
                  onChange={(e) => updateColorStop(0, "color", e.target.value)}
                  className="size-9 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            )}

            {/* দৈর্ঘ্য ও প্রস্থ উভয়ের রেসপনসিভ স্লাইডার */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">↔️ ব্যানারের প্রস্থ (Width): {bannerWidth}%</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={bannerWidth}
                  onChange={(e) => setBannerWidth(Number(e.target.value))}
                  className="w-48 accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">↕️ ব্যানারের দৈর্ঘ্য/উচ্চতা (Height): {bannerHeight}px</span>
                <input
                  type="range"
                  min="300"
                  max="700"
                  value={bannerHeight}
                  onChange={(e) => setBannerHeight(Number(e.target.value))}
                  className="w-48 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ছবি আপলোড */}
        {slideType === "image" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
            <label className="text-xs font-bold text-blue-400 block">🖼️ ছবি আপলোড বা সরাসরি লিঙ্ক:</label>
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
                placeholder="অথবা ছবির সরাসরি লিঙ্ক পেস্ট করুন (https://...)"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
            </div>
            {imgFile && <p className="text-[11px] text-green-400">বাছাইকৃত ফাইল: {imgFile.name}</p>}
          </div>
        )}

        {/* ভিডিও আপলোড বা লিঙ্ক */}
        {slideType === "video" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
            <label className="text-xs font-bold text-red-400 block">🎥 ভিডিও ফাইল বা ইউটিউব/ফেসবুক লিঙ্ক:</label>
            <input
              className={inp}
              placeholder="ইউটিউব, ফেসবুক বা সরাসরি MP4 লিঙ্ক পেস্ট করুন (https://...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-gray-300 hover:bg-slate-800 cursor-pointer">
                <Upload className="size-3 text-red-400" />
                <span>মোবাইল/পিসি থেকে ভিডিও ফাইল দিন</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {videoFile && <span className="text-[10px] text-green-400 truncate">{videoFile.name}</span>}
            </div>
          </div>
        )}

        {/* ================= ৫টি সম্পূর্ণ স্বাধীন টেক্সট বক্স কন্ট্রোল ================= */}
        <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div>
              <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                <Type className="size-4" /> ২. লেখার স্বাধীন বক্সসমূহ (প্রতিটির আলাদা X/Y পজিশন ও সাইজ):
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">
                যেকোনো বক্স সরালে বা সাইজ বদলালে অন্য বক্সগুলো সম্পূর্ণ স্থির থাকবে।
              </p>
            </div>
            <button
              type="button"
              onClick={addNewCustomBox}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0"
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
                {/* বক্স হেডার ও অন/অফ সুইচ */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-white">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => updateTextItem(idx, "enabled", e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                      <span>{item.label}</span>
                    </label>
                    <span className="text-[10px] text-gray-500">
                      {item.enabled ? "(চালু)" : "(বন্ধ - ফাঁকা থাকবে)"}
                    </span>
                  </div>
                  {idx >= 5 && (
                    <button
                      type="button"
                      onClick={() => removeCustomBox(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {item.enabled && (
                  <div className="space-y-2.5 pt-1">
                    {/* লেখার ইনপুট */}
                    <input
                      className={inp}
                      placeholder={`${item.label}-এর লেখা লিখুন...`}
                      value={item.text}
                      onChange={(e) => updateTextItem(idx, "text", e.target.value)}
                    />

                    {/* স্বাধীন X এবং Y পজিশন স্লাইডার */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>↔️ ডানে-বামে (X পজিশন):</span>
                          <span className="text-emerald-400 font-bold">{item.x}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.x}
                          onChange={(e) => updateTextItem(idx, "x", Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>↕️ উপরে-নিচে (Y পজিশন):</span>
                          <span className="text-emerald-400 font-bold">{item.y}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.y}
                          onChange={(e) => updateTextItem(idx, "y", Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* স্বাধীন এলাইনমেন্ট বোতাম (বামে, মাঝে, ডানে, জাস্টিফাই) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                      <span className="text-[11px] text-gray-300 font-medium">📐 এলাইনমেন্ট:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "left")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 ${
                            item.align === "left"
                              ? "bg-emerald-700 border-emerald-500 text-white"
                              : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignLeft className="size-3" /> বামে
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "center")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 ${
                            item.align === "center"
                              ? "bg-emerald-700 border-emerald-500 text-white"
                              : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignCenter className="size-3" /> মাঝে
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "right")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 ${
                            item.align === "right"
                              ? "bg-emerald-700 border-emerald-500 text-white"
                              : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignRight className="size-3" /> ডানে
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTextItem(idx, "align", "justify")}
                          className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1 ${
                            item.align === "justify"
                              ? "bg-emerald-700 border-emerald-500 text-white"
                              : "border-slate-800 text-gray-400"
                          }`}
                        >
                          <AlignJustify className="size-3" /> জাস্টিফাই
                        </button>
                      </div>
                    </div>

                    {/* স্বাধীন ফন্ট সাইজ স্কেল, বোল্ড, ইটালিক, রঙ ও অ্যানিমেশন */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">সাইজ স্কেল: {item.size_scale}x</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={item.size_scale}
                          onChange={(e) => updateTextItem(idx, "size_scale", Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">রঙ ও স্টাইল:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={item.color}
                            onChange={(e) => updateTextItem(idx, "color", e.target.value)}
                            className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => updateTextItem(idx, "weight", item.weight === "bold" ? "normal" : "bold")}
                            className={`px-2 py-1 rounded text-xs font-bold border ${item.weight === "bold" ? "bg-white text-black" : "border-slate-700 text-gray-400"}`}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTextItem(idx, "italic", !item.italic)}
                            className={`px-2 py-1 rounded text-xs italic font-bold border ${item.italic ? "bg-white text-black" : "border-slate-700 text-gray-400"}`}
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

        {/* স্লাইডার সময়কাল ও ট্রানজিশন */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
          <span className="text-xs font-bold text-gray-300 block">৩. স্লাইডার স্পিড ও ট্রানজিশন ইফেক্ট:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>স্লাইড প্রদর্শনের সময়:</span>
                <span className="text-emerald-400 font-bold">{slideDuration} সেকেন্ড</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={slideDuration}
                onChange={(e) => setSlideDuration(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-1">ট্রানজিশন ইফেক্ট (হোমপেজে দৃশ্যমান):</span>
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

        {/* লিঙ্ক */}
        <div>
          <label className="text-xs font-bold text-gray-400 block mb-1">ক্লিক লিঙ্ক (ঐচ্ছিক):</label>
          <input
            className={inp}
            placeholder="যেমন: https://... অথবা /post/..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </div>

        {/* সেভ বাটন */}
        <button className={btnSave} onClick={handleSaveSlide} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পোস্ট আপডেট করুন" : "🚀 নতুন পোস্ট প্রকাশ করুন (সবার উপরে লাইভ হবে)"}
        </button>
      </div>

      {/* ================= ৩. হোমপেজ স্প্লিট লেআউট (চক্রাকারে ঘোরার পূর্ণ সহায়তা সহ) ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Layers className="size-4 text-emerald-400" /> হোমপেজ স্প্লিট ভিউ (কম্পিউটার স্ক্রিন):
          </span>
          <span className="text-[11px] text-emerald-400 font-bold">বর্তমান: {desktopSplits} স্প্লিট</span>
        </div>
        <p className="text-xs text-gray-400">
          💡 ২ বা ৩ স্প্লিট ভিউতে ১০টি পোস্ট থাকলেও সবগুলো পোস্ট চক্রাকারে একে একে ঘুরবে। কোনো পোস্ট আটকে থাকবে না।
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSaveSplits(num)}
              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                desktopSplits === num
                  ? "bg-emerald-700 border-emerald-500 text-white shadow"
                  : "bg-slate-950 border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              {num === 1 ? "১টি স্প্লিট" : `${num}টি স্প্লিট (চক্রাকার)`}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ৪. বর্তমান পোস্টসমূহের তালিকা ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-bold text-xs sm:text-sm text-gray-200">বর্তমান হিরো স্লাইডসমূহ ({list.length})</h2>
          <span className="text-[10px] text-green-400 font-semibold">সর্বশেষ পোস্ট সবার শীর্ষে থাকবে</span>
        </div>

        <div className="space-y-2">
          {list.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-gray-200 truncate">
                    {slide.title || "শিরোনামহীন পোস্ট"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    ধরণ: {slide.slide_type === "color" ? "কালার ব্যানার" : slide.slide_type === "image" ? "ছবি" : "ভিডিও"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(slide)}
                  className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg hover:bg-emerald-900"
                >
                  এডিট
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("এই স্লাইড পোস্টটি মুছে ফেলতে চান?")) {
                      deleteHeroSlide(token, slide.id).then(loadData)
                    }
                  }}
                  className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-800 rounded-lg hover:bg-red-900"
                >
                  মুছুন
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-center text-xs text-gray-500 py-4">বর্তমানে কোনো হিরো পোস্ট নেই। উপরের ফর্ম দিয়ে তৈরি করুন।</p>
          )}
        </div>
      </div>
    </div>
  )
}
