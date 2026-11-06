nowe client"

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
  getRecentPosts,
  parseVideoUrl,
  type HeroSlide,
  type HeroSettings,
  type HeroPostType,
  type GradientStop,
  type TextLayer,
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
} from "lucide-react"

const inp = "w-full border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
const selectInp = "w-full border border-slate-700 rounded-xl px-3 py-2 text-xs bg-slate-950 text-white focus:outline-none focus:border-green-500 transition-all"
const btnSave = "w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-50 shadow-lg cursor-pointer"
const cardBox = "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"

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

  const [imgUrl, setImgUrl] = useState("")
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  // টেক্সট লেয়ারে ডিফল্টভাবে এলাইনমেন্ট সেন্টার ও মার্জিত করা হয়েছে
  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    {
      id: "txt_1",
      title: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
      subtitle: "সত্য ও ন্যায়ের সাথে ক্যাম্পাস সাংবাদিকতা",
      description: "ক্যাম্পাসের সকল খবর, আপডেট ও অনুসন্ধানী প্রতিবেদন এক ক্লিকেই।",
      x: 50,
      y: 50,
      scale: 1,
      font: FONTS[0].value,
      weight: "bold",
      italic: false,
      align: "center", // ডিফল্ট সেন্টার
      color: "#FFFFFF",
      bg_color: "",
      animation: "fade-up",
    },
  ])

  const [linkUrl, setLinkUrl] = useState("")
  const [category, setCategory] = useState("ক্যাম্পাস বার্তা")
  const [btnText, setBtnText] = useState("বিস্তারিত")
  const [slideDuration, setSlideDuration] = useState(5)
  const [transitionEffect, setTransitionEffect] = useState("fade")
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

  useEffect(() => {
    loadData()
  }, [token])

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

  const addTextLayer = () => {
    const newL: TextLayer = {
      id: `txt_${Date.now()}`,
      title: "নতুন শিরোনাম",
      subtitle: "",
      description: "",
      x: 50,
      y: 65,
      scale: 1,
      font: FONTS[0].value,
      weight: "bold",
      italic: false,
      align: "center",
      color: "#FFFFFF",
      animation: "zoom-pop",
    }
    setTextLayers([...textLayers, newL])
  }

  const removeTextLayer = (id: string) => {
    setTextLayers(textLayers.filter((l) => l.id !== id))
  }

  const updateTextLayer = (idx: number, field: keyof TextLayer, val: any) => {
    const updated = [...textLayers]
    updated[idx] = { ...updated[idx], [field]: val }
    setTextLayers(updated)
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
    setImgUrl("")
    setImgFile(null)
    setVideoUrl("")
    setVideoFile(null)
    setTextLayers([
      {
        id: "txt_1",
        title: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
        subtitle: "",
        description: "",
        x: 50,
        y: 50,
        scale: 1,
        weight: "bold",
        italic: false,
        align: "center",
        color: "#FFFFFF",
        animation: "fade-up",
      },
    ])
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
    }
    if (s.text_layers && s.text_layers.length > 0) {
      setTextLayers(s.text_layers)
    } else if (s.title) {
      setTextLayers([
        {
          id: "txt_legacy",
          title: s.title,
          subtitle: s.category || "",
          description: s.summary || "",
          x: 50,
          y: 75,
          scale: 1,
          weight: "bold",
          italic: false,
          align: "center",
          color: "#FFFFFF",
          animation: "fade-up",
        },
      ])
    }
    setImgUrl(s.media_items?.[0]?.url || "")
    setVideoUrl(s.video_config?.url || "")
    setLinkUrl(s.link_url || "")
    setSlideDuration(s.slide_duration ? Math.round(s.slide_duration / 1000) : 5)
    setTransitionEffect(s.transition_effect || "fade")
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

      const primaryTitle = textLayers[0]?.title || "হিরো পোস্ট"
      const primarySummary = textLayers[0]?.description || null

      const payload: Partial<HeroSlide> = {
        title: primaryTitle,
        summary: primarySummary,
        category: category.trim() || null,
        button_text: btnText.trim() || "বিস্তারিত",
        link_url: linkUrl.trim() || null,
        slide_type: slideType,
        banner_config: {
          mode: bannerMode,
          angle: Number(bannerAngle),
          stops: gradientStops,
          height_px: Number(bannerHeight),
          width_pct: 100,
        },
        text_layers: textLayers,
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
        await createHeroSlide(token, { ...payload, sort_order: await createHeroSlide(token, { ...payload, sort_order: Math.floor(Date.now() / 1000) }) })
        setMsg("✅ নতুন পোস্ট সফলভাবে তৈরি হয়েছে এবং হোমপেজে দৃশ্যমান")
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
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-20">
      {msg && (
        <div className="p-3 bg-blue-950/90 border border-blue-500/50 text-blue-200 rounded-xl text-xs font-semibold text-center shadow-lg">
          {msg}
        </div>
      )}

      {/* ================= ১. রিয়েল-টাইম প্রিভিউ বক্স ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-green-400 flex items-center gap-1.5">
            <Eye className="size-4" /> 👁️ লাইভ রিয়েল-টাইম প্রিভিউ (হোমপেজে যেমন দেখাবে):
          </span>
          <span className="text-[10px] text-gray-400">এলাইনমেন্ট ও পজিশন পরিবর্তন এখানে সরাসরি দেখা যাবে</span>
        </div>

        <div
          className="relative w-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center transition-all duration-300"
          style={{
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

          {/* টেক্সট লেয়ারসমূহ (এলাইনমেন্ট অনুযায়ী রেন্ডার) */}
          <div className="absolute inset-0 pointer-events-none">
            {textLayers.map((layer) => (
              <div
                key={layer.id}
                className="absolute transition-all duration-150"
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  transform: "translate(-50%, -50%)",
                  maxWidth: "92%",
                  textAlign: layer.align || "center",
                }}
              >
                <div style={{ transform: `scale(${layer.scale || 1})` }}>
                  <div
                    className={`anim_${layer.animation || "fade-up"}`}
                    style={{
                      fontFamily: layer.font,
                      color: layer.color || "#FFFFFF",
                      backgroundColor: layer.bg_color || undefined,
                      padding: layer.bg_color ? "4px 10px" : undefined,
                      borderRadius: layer.bg_color ? "8px" : undefined,
                      textAlign: layer.align || "center",
                    }}
                  >
                    {layer.title && (
                      <h3
                        className={`leading-tight text-sm sm:text-base md:text-xl drop-shadow-md ${
                          layer.weight === "bold"
                            ? "font-bold"
                            : layer.weight === "semibold"
                            ? "font-semibold"
                            : "font-normal"
                        } ${layer.italic ? "italic" : ""}`}
                      >
                        {layer.title}
                      </h3>
                    )}
                    {layer.subtitle && <p className="text-[10px] sm:text-xs opacity-90 drop-shadow mt-1">{layer.subtitle}</p>}
                    {layer.description && <p className="text-[9px] sm:text-[11px] opacity-80 line-clamp-2 drop-shadow mt-1">{layer.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ২. হিরো পোস্ট ফর্ম ================= */}
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

        {/* কালার ব্যানার কন্ট্রোল */}
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
                    <div key={i} className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
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

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">ব্যানারের উচ্চতা: {bannerHeight}px</span>
              <input
                type="range"
                min="320"
                max="650"
                value={bannerHeight}
                onChange={(e) => setBannerHeight(Number(e.target.value))}
                className="w-48 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ছবি আপলোড */}
        {slideType === "image" && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
            <label className="text-xs font-bold text-blue-400 block">🖼️ ছবি আপলোড বা লিঙ্ক:</label>
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
                placeholder="অথবা ছবির সরাসরি লিঙ্ক (https://...)"
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

        {/* ================= টেক্সট লেয়ার ও এলাইনমেন্ট কন্ট্রোল ================= */}
        <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <Type className="size-4" /> ২. লেখা, এলাইনমেন্ট ও পজিশন:
            </span>
            <button
              type="button"
              onClick={addTextLayer}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
            >
              <Plus className="size-3" /> নতুন লেখা যোগ
            </button>
          </div>

          {textLayers.map((layer, idx) => (
            <div key={layer.id || idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="font-bold text-white">লেখা বক্স #{idx + 1}</span>
                {textLayers.length > 1 && (
                  <button type="button" onClick={() => removeTextLayer(layer.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {/* ৩টি টেক্সট বক্স */}
              <input
                className={inp}
                placeholder="শিরোনাম (ঐচ্ছিক)"
                value={layer.title || ""}
                onChange={(e) => updateTextLayer(idx, "title", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  className={inp}
                  placeholder="সাব-হেডিং (ঐচ্ছিক)"
                  value={layer.subtitle || ""}
                  onChange={(e) => updateTextLayer(idx, "subtitle", e.target.value)}
                />
                <input
                  className={inp}
                  placeholder="সংক্ষিপ্ত বিস্তারিত (ঐচ্ছিক)"
                  value={layer.description || ""}
                  onChange={(e) => updateTextLayer(idx, "description", e.target.value)}
                />
              </div>

              {/* ⭐ নতুন: এলাইনমেন্ট অপশন (বামে, মাঝে, ডানে, জাস্টিফাই) ⭐ */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 block">
                  📐 লেখার এলাইনমেন্ট (Alignment) নির্ধারণ করুন:
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => updateTextLayer(idx, "align", "left")}
                    className={`py-1.5 rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                      (layer.align || "center") === "left"
                        ? "bg-emerald-700 border-emerald-500 text-white"
                        : "border-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <AlignLeft className="size-3.5" /> বামে
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTextLayer(idx, "align", "center")}
                    className={`py-1.5 rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                      (layer.align || "center") === "center"
                        ? "bg-emerald-700 border-emerald-500 text-white"
                        : "border-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <AlignCenter className="size-3.5" /> মাঝে
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTextLayer(idx, "align", "right")}
                    className={`py-1.5 rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                      layer.align === "right"
                        ? "bg-emerald-700 border-emerald-500 text-white"
                        : "border-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <AlignRight className="size-3.5" /> ডানে
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTextLayer(idx, "align", "justify")}
                    className={`py-1.5 rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                      layer.align === "justify"
                        ? "bg-emerald-700 border-emerald-500 text-white"
                        : "border-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <AlignJustify className="size-3.5" /> জাস্টিফাই
                  </button>
                </div>
              </div>

              {/* ০-১০০% X ও Y পজিশন স্লাইডার */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>ডানে-বামে স্লাইডার (X পজিশন):</span>
                    <span className="text-emerald-400 font-bold">{layer.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.x}
                    onChange={(e) => updateTextLayer(idx, "x", Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>উপরে-নিচে স্লাইডার (Y পজিশন):</span>
                    <span className="text-emerald-400 font-bold">{layer.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.y}
                    onChange={(e) => updateTextLayer(idx, "y", Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* ফন্ট, স্টাইল ও অ্যানিমেশন */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">অ্যানিমেশন:</span>
                  <select
                    className={selectInp}
                    value={layer.animation}
                    onChange={(e) => updateTextLayer(idx, "animation", e.target.value)}
                  >
                    {TEXT_EFFECTS_35.map((ef) => (
                      <option key={ef.value} value={ef.value}>{ef.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">ফন্ট স্টাইল:</span>
                  <select
                    className={selectInp}
                    value={layer.font || FONTS[0].value}
                    onChange={(e) => updateTextLayer(idx, "font", e.target.value)}
                  >
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">লেখার রঙ ও বোল্ড:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={layer.color || "#FFFFFF"}
                      onChange={(e) => updateTextLayer(idx, "color", e.target.value)}
                      className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => updateTextLayer(idx, "weight", layer.weight === "bold" ? "normal" : "bold")}
                      className={`px-2 py-1 rounded text-xs font-bold border ${layer.weight === "bold" ? "bg-white text-black" : "border-slate-700 text-gray-400"}`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTextLayer(idx, "italic", !layer.italic)}
                      className={`px-2 py-1 rounded text-xs italic font-bold border ${layer.italic ? "bg-white text-black" : "border-slate-700 text-gray-400"}`}
                    >
                      I
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">সাইজ স্কেল:</span>
                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.1"
                    value={layer.scale || 1}
                    onChange={(e) => updateTextLayer(idx, "scale", Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* স্লাইডার সময়কাল ও ট্রানজিশন */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
          <span className="text-xs font-bold text-gray-300 block">৩. স্লাইডার স্পিড ও ট্রানজিশন:</span>
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

      {/* ================= ৩. হোমপেজ স্প্লিট লেআউট ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Layers className="size-4 text-emerald-400" /> হোমপেজ স্প্লিট ভিউ (কম্পিউটার স্ক্রিন):
          </span>
          <span className="text-[11px] text-emerald-400 font-bold">বর্তমান: {desktopSplits} স্প্লিট</span>
        </div>
        <p className="text-xs text-gray-400">
          💡 কম্পিউটারে ১টি, ২টি নাকি ৩টি স্প্লিটে দেখাতে চান তা বেছে নিন। মোবাইলে স্বয়ংক্রিয়ভাবে সোয়াইপ স্লাইডার হিসেবে থাকবে।
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
              {num === 1 ? "১টি স্প্লিট" : `${num}টি স্প্লিট`}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ৪. বর্তমান পোস্টসমূহের তালিকা ================= */}
      <div className={cardBox}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-bold text-xs sm:text-sm text-gray-200">বর্তমান হিরো স্লাইডসমূহ ({list.length})</h2>
          <span className="text-[10px] text-green-400 font-semibold">সর্বশেষ পোস্টটি সবার শীর্ষে থাকবে</span>
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
                    {slide.title || slide.text_layers?.[0]?.title || "শিরোনামহীন পোস্ট"}
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
