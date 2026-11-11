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
} from "lucide-react"

const inp = "w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-500 transition-all"
const selectInp = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition-all"
const btnSave = "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-50 shadow-md cursor-pointer active:scale-98"
const cardBox = "bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-slate-800"

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

  const [slideType, setSlideType] = useState<HeroPostType>("color")

  const [bannerMode, setBannerMode] = useState<"solid" | "gradient">("gradient")
  const [bannerAngle, setBannerAngle] = useState(135)
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: "#064e3b", stop: 0 },
    { color: "#0f172a", stop: 50 },
    { color: "#1e1b4b", stop: 100 },
  ])
  const [bannerHeight, setBannerHeight] = useState(480)
  const [bannerWidth, setBannerWidth] = useState(100)

  const [imgUrl, setImgUrl] = useState("")
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [textItems, setTextItems] = useState<IndependentTextItem[]>(DEFAULT_TEXT_ITEMS)

  const [linkUrl, setLinkUrl] = useState("")
  const [btnText] = useState("বিস্তারিত")
  const [slideDuration, setSlideDuration] = useState(5)
  const [transitionEffect, setTransitionEffect] = useState("slide-left")
  const [desktopSplits, setDesktopSplits] = useState(1)

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

  useEffect(() => { loadData() }, [token])

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

  const updateTextItem = (idx: number, field: keyof IndependentTextItem, val: any) => {
    const updated = [...textItems]
    updated[idx] = { ...updated[idx], [field]: val }
    setTextItems(updated)
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
      if (s.text_layers[0]?.label) {
        setTextItems(s.text_layers as IndependentTextItem[])
      }
    }

    setImgUrl(s.media_items?.[0]?.url || "")
    setVideoUrl(s.video_config?.url || "")
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
        setMsg("✅ নতুন পোস্ট সফলভাবে প্রকাশিত হয়েছে")
      }

      resetForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "পোস্ট করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  const handleSaveSplits = async (splits: number) => {
    setDesktopSplits(splits)
    try {
      await saveHeroSettings(token, { desktop_splits: splits })
      setMsg(`✅ হোমপেজে ${splits}টি স্প্লিট ভিউ সেট হয়েছে`)
    } catch {
      setMsg("❌ স্প্লিট সেভ করা যায়নি")
    }
  }

  const previewBg =
    bannerMode === "solid"
      ? gradientStops[0]?.color || "#064e3b"
      : `linear-gradient(${bannerAngle}deg, ${[...gradientStops]
          .sort((a, b) => a.stop - b.stop)
          .map((s) => `${s.color} ${s.stop}%`)
          .join(", ")})`

  return (
    <div className="space-y-5 text-slate-800">
      
      {msg && (
        <div className="p-3 bg-cyan-50 border border-cyan-300 text-cyan-900 rounded-2xl text-xs font-bold text-center shadow-xs">
          {msg}
        </div>
      )}

      {/* ১. লাইভ প্রিভিউ */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold text-cyan-700 flex items-center gap-1.5">
            <Eye className="size-4" /> 👁️ লাইভ প্রিভিউ (হোমপেজে যেমন দেখাবে):
          </span>
          <span className="text-[10px] text-slate-500">প্রস্থ ও উচ্চতা সরাসরি দেখুন</span>
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
                className="w-full h-full object-contain"
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

      {/* ২. হিরো কন্ট্রোল ও ফর্ম */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-bold text-sm sm:text-base text-slate-800">
            {editId ? "✏️ হিরো পোস্ট এডিট করুন" : "➕ নতুন হিরো পোস্ট তৈরি করুন"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-rose-600 hover:underline">
              বাতিল
            </button>
          )}
        </div>

        {/* পোস্টের ধরন */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">১. পোস্টের ধরন বেছে নিন:</label>
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
              <Palette className="size-3.5" /> কালার ব্যানার
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
              <span className="text-xs font-bold text-slate-700">🎨 কালার ব্যানার সেটিংস:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBannerMode("solid")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    bannerMode === "solid" ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  সলিড রঙ
                </button>
                <button
                  type="button"
                  onClick={() => setBannerMode("gradient")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    bannerMode === "gradient" ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  গ্রেডিয়েন্ট রঙ
                </button>
              </div>
            </div>

            {bannerMode === "gradient" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">গ্রেডিয়েন্টের দিক: {bannerAngle}°</span>
                  <input type="range" min="0" max="360" value={bannerAngle} onChange={(e) => setBannerAngle(Number(e.target.value))} className="w-36 accent-cyan-600 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-semibold">রঙের প্যালেট:</span>
                    {gradientStops.length < 5 && (
                      <button type="button" onClick={addColorStop} className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="size-3" /> + রঙ যোগ
                      </button>
                    )}
                  </div>

                  {gradientStops.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                      <input type="color" value={st.color} onChange={(e) => updateColorStop(i, "color", e.target.value)} className="size-7 rounded border bg-transparent cursor-pointer" />
                      <input className="w-20 border border-slate-200 rounded px-1.5 py-1 text-xs font-mono" value={st.color} onChange={(e) => updateColorStop(i, "color", e.target.value)} />
                      <input type="range" min="0" max="100" value={st.stop} onChange={(e) => updateColorStop(i, "stop", Number(e.target.value))} className="flex-1 accent-cyan-600 cursor-pointer" />
                      <span className="w-8 text-[11px] text-cyan-700 font-bold">{st.stop}%</span>
                      {gradientStops.length > 2 && (
                        <button type="button" onClick={() => removeColorStop(i)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* দৈর্ঘ্য ও প্রস্থ স্লাইডার */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">↔️ প্রস্থ (Width): {bannerWidth}%</span>
                <input type="range" min="50" max="100" value={bannerWidth} onChange={(e) => setBannerWidth(Number(e.target.value))} className="w-44 accent-cyan-600 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">↕️ উচ্চতা (Height): {bannerHeight}px</span>
                <input type="range" min="300" max="700" value={bannerHeight} onChange={(e) => setBannerHeight(Number(e.target.value))} className="w-44 accent-cyan-600 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* ছবি */}
        {slideType === "image" && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 block">🖼️ ছবি আপলোড বা সরাসরি লিঙ্ক:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0">
                <Upload className="size-3.5 text-cyan-600" />
                <span>ফাইল বাছাই করুন</span>
                <input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <input className={inp} placeholder="ছবির সরাসরি লিঙ্ক পেস্ট করুন (https://...)" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
            </div>
            {imgFile && <p className="text-[11px] text-emerald-700 font-semibold">ফাইল: {imgFile.name}</p>}
          </div>
        )}

        {/* ভিডিও */}
        {slideType === "video" && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 block">🎥 ভিডিও ফাইল বা ইউটিউব লিঙ্ক:</label>
            <input className={inp} placeholder="ইউটিউব বা সরাসরি MP4 লিঙ্ক পেস্ট করুন (https://...)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-100 cursor-pointer w-fit">
              <Upload className="size-3 text-red-500" />
              <span>ভিডিও ফাইল আপলোড করুন</span>
              <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
            {videoFile && <span className="text-[10px] text-emerald-700 font-bold">{videoFile.name}</span>}
          </div>
        )}

        {/* টেক্সট লেয়ারসমূহ */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="size-4 text-cyan-600" /> ২. লেখার স্বাধীন বক্সসমূহ:
            </span>
            <button type="button" onClick={addNewCustomBox} className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0">
              <Plus className="size-3" /> নতুন বক্স যোগ
            </button>
          </div>

          <div className="space-y-3">
            {textItems.map((item, idx) => (
              <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                    <input type="checkbox" checked={item.enabled} onChange={(e) => updateTextItem(idx, "enabled", e.target.checked)} className="accent-cyan-600 rounded" />
                    <span>{item.label}</span>
                  </label>
                  {idx >= 5 && (
                    <button type="button" onClick={() => removeCustomBox(item.id)} className="text-rose-500 hover:text-rose-700 p-1">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {item.enabled && (
                  <div className="space-y-2 pt-1">
                    <input className={inp} placeholder={`${item.label}-এর লেখা...`} value={item.text} onChange={(e) => updateTextItem(idx, "text", e.target.value)} />
                    
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-600 block">সাইজ: {item.size_scale}x</span>
                        <input type="range" min="0.5" max="2.0" step="0.05" value={item.size_scale} onChange={(e) => updateTextItem(idx, "size_scale", Number(e.target.value))} className="w-full accent-cyan-600 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-1.5 pt-3">
                        <input type="color" value={item.color} onChange={(e) => updateTextItem(idx, "color", e.target.value)} className="size-6 rounded border bg-transparent cursor-pointer" title="লেখার রঙ" />
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
            ))}
          </div>
        </div>

        {/* স্লাইডার গতি ও ট্রানজিশন */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-700 block">৩. স্লাইডার স্পিড ও ট্রানজিশন:</span>
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

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">ক্লিক লিঙ্ক (ঐচ্ছিক):</label>
          <input className={inp} placeholder="https://... অথবা /post/..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        </div>

        <button className={btnSave} onClick={handleSaveSlide} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পোস্ট আপডেট করুন" : "🚀 নতুন পোস্ট প্রকাশ করুন"}
        </button>
      </div>

      {/* ৩. স্প্লিট লেআউট নিয়ন্ত্রণ */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="size-4 text-cyan-600" /> হোমপেজ স্প্লিট ভিউ:
          </span>
          <span className="text-[11px] text-cyan-700 font-bold">বর্তমান: {desktopSplits} স্প্লিট</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSaveSplits(num)}
              className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                desktopSplits === num
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {num === 1 ? "১টি স্প্লিট" : `${num}টি স্প্লিট`}
            </button>
          ))}
        </div>
      </div>

      {/* ৪. বর্তমান পোস্টের তালিকা */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-bold text-xs sm:text-sm text-slate-800">বর্তমান হিরো স্লাইডসমূহ ({list.length})</h2>
          <span className="text-[10px] text-cyan-700 font-semibold">সর্বশেষ পোস্ট সবার শীর্ষে থাকবে</span>
        </div>

        <div className="space-y-2">
          {list.map((slide, idx) => (
            <div key={slide.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-6 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{slide.title || "শিরোনামহীন পোস্ট"}</p>
                  <p className="text-[10px] text-slate-500">
                    ধরণ: {slide.slide_type === "color" ? "কালার ব্যানার" : slide.slide_type === "image" ? "ছবি" : "ভিডিও"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-bold">
                <button type="button" onClick={() => startEdit(slide)} className="text-cyan-700 hover:underline">এডিট</button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("এই স্লাইড পোস্টটি মুছে ফেলতে চান?")) {
                      deleteHeroSlide(token, slide.id).then(loadData)
                    }
                  }}
                  className="text-rose-600 hover:underline"
                >
                  মুছুন
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
