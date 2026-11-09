"use client"

import { useEffect, useState } from "react"
import {
  getCampusClubs,
  createCampusClub,
  updateCampusClub,
  deleteCampusClub,
  parseActivityMedia,
  stringifyActivityMedia,
  getClubCarouselConfig,
  saveClubCarouselConfig,
  DEFAULT_CLUB_CAROUSEL_CONFIG,
  type ClubItem,
  type CommitteeMember,
  type ClubReportItem,
  type ClubMediaItem,
  type ClubCarouselConfig,
  type ClubTransitionDirection,
  type ClubTransitionEffect,
} from "../../lib/clubs"
import { uploadImage, uploadVideo } from "../../lib/sb"
import { Sliders, PlusCircle, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Upload, Trash2, Eye } from "lucide-react"

const MAX_VIDEO_MB = 50

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600"
const smallInp = "w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-800 disabled:opacity-50 cursor-pointer shadow-md"

const ICON_OPTIONS = [
  { key: "star", label: "⭐ তারা (ধ্রুবতারা / সাধারণ)" },
  { key: "megaphone", label: "📢 মেগাফোন (সচেতনতা / সোচ্চার)" },
  { key: "camera", label: "📷 ক্যামেরা (ফটোগ্রাফি)" },
  { key: "mic", label: "🎤 মাইক্রোফোন (বিতর্ক / ডিবেট)" },
  { key: "book", label: "📚 বই (সাহিত্য / রিডার জোন)" },
  { key: "briefcase", label: "💼 ব্রিফকেস (ক্যারিয়ার ক্লাব)" },
  { key: "droplet", label: "🩸 রক্তের ফোঁটা (বাঁধন / রক্তদান)" },
  { key: "flask", label: "🧪 টেস্টটিউব (বিজ্ঞান ও গবেষণা)" },
  { key: "baby", label: "👶 শিশু (শিশু কল্যাণ)" },
  { key: "footprints", label: "👣 পদচিহ্ন (পথশিশু / সেবা)" },
]

function formatUrl(u?: string | null): string | null {
  if (!u || !u.trim()) return null
  const t = u.trim()
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

// ⭐ মোবাইলের জন্য নিরাপদ ইমেজ প্রসেসর (কখনোই ক্র্যাশ করবে না) ⭐
async function safeShrink(file: File): Promise<Blob> {
  try {
    if (!file.type.startsWith("image/")) return file
    return await new Promise<Blob>((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const maxDim = 1200
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) return resolve(file)
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => resolve(blob || file),
          file.type === "image/png" ? "image/png" : "image/jpeg",
          0.85
        )
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(file)
      }
      img.src = url
    })
  } catch {
    return file
  }
}

export default function ClubManager({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<"clubs" | "slider_config">("clubs")
  const [list, setList] = useState<ClubItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // স্লাইডার কনফিগারেশন স্টেট
  const [sliderCfg, setSliderCfg] = useState<ClubCarouselConfig>(DEFAULT_CLUB_CAROUSEL_CONFIG)
  const [sliderBusy, setSliderBusy] = useState(false)
  const [sliderMsg, setSliderMsg] = useState("")

  // ক্লাব ফিল্ডসমূহ
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [tag, setTag] = useState("Social")
  const [icon, setIcon] = useState("star")
  const [isActive, setIsActive] = useState(true)
  const [activity, setActivity] = useState("")
  const [activityBn, setActivityBn] = useState("")
  const [date, setDate] = useState("")
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const [webUrl, setWebUrl] = useState("")
  const [contactInfo, setContactInfo] = useState("")

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [activityMediaList, setActivityMediaList] = useState<ClubMediaItem[]>([])
  const [committeeTerm, setCommitteeTerm] = useState("")
  const [members, setMembers] = useState<CommitteeMember[]>([])
  const [reportsTitle, setReportsTitle] = useState("ক্লাব প্রতিবেদন / Club Reports")
  const [reports, setReports] = useState<ClubReportItem[]>([])

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    const [clubsData, cfgData] = await Promise.all([
      getCampusClubs(token),
      getClubCarouselConfig(),
    ])
    setList(clubsData)
    if (cfgData) setSliderCfg(cfgData)
  }

  useEffect(() => { load() }, [])

  function reset() {
    setEditId(null); setName(""); setNameBn(""); setTag("Social"); setIcon("star"); setIsActive(true)
    setActivity(""); setActivityBn(""); setDate(""); setFbUrl(""); setYtUrl("")
    setWebUrl(""); setContactInfo("")
    setLogoUrl(null); setLogoFile(null)
    setActivityMediaList([])
    setCommitteeTerm(""); setMembers([])
    setReportsTitle("ক্লাব প্রতিবেদন / Club Reports"); setReports([])
  }

  // ⭐ এডিট শুরু করার সময় পুরোনো মিডিয়া ও প্রতিবেদন ঠিকমতো লোড করা ⭐
  function startEdit(c: ClubItem) {
    setEditId(c.id)
    setName(c.name)
    setNameBn(c.name_bn || "")
    setTag(c.tag || "General")
    setIcon(c.icon || "star")
    setIsActive(c.is_active ?? true)
    setActivity(c.activity || "")
    setActivityBn(c.activity_bn || "")
    setDate(c.date || "")
    setFbUrl(c.fb_url || "")
    setYtUrl(c.yt_url || "")
    setWebUrl(c.web_url || "")
    setContactInfo(c.contact_info || "")
    setLogoUrl(c.logo_url || null)
    setLogoFile(null)

    // অ্যাক্টিভিটি মিডিয়া উদ্ধার
    setActivityMediaList(parseActivityMedia(c.embed_media_url))
    setCommitteeTerm(c.committee_term || "")
    setMembers(c.committee_members || [])
    setReportsTitle(c.reports_title || "ক্লাব প্রতিবেদন / Club Reports")

    // পুরোনো রিপোর্টের ভেতরের মিডিয়া থাকলে তাও উদ্ধার করা
    const normalizedReports: ClubReportItem[] = (c.reports || []).map((r) => {
      let mList = r.media_items || []
      if ((!mList || mList.length === 0) && r.embed_media_url) {
        mList = parseActivityMedia(r.embed_media_url)
      }
      return {
        ...r,
        media_items: mList,
      }
    })

    setReports(normalizedReports)
    setActiveTab("clubs")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // কার্যক্রমের মিডিয়া হ্যান্ডলার
  function addActivityMedia() {
    setActivityMediaList([...activityMediaList, { title: "", subtitle: "", description: "", url: "" }])
  }
  function updateActivityMedia(index: number, field: keyof ClubMediaItem, val: string) {
    const updated = [...activityMediaList]
    updated[index] = { ...updated[index], [field]: val }
    setActivityMediaList(updated)
  }
  function removeActivityMedia(index: number) {
    setActivityMediaList(activityMediaList.filter((_, i) => i !== index))
  }

  // ⭐ আনলিমিটেড অ্যাক্টিভিটি মিডিয়া ব্যাচ আপলোড ⭐
  async function batchUploadActivityFiles(files: File[]) {
    if (files.length === 0) return
    setBusy(true)
    const newItems: ClubMediaItem[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setMsg(`মিডিয়া আপলোড হচ্ছে (${i + 1}/${files.length})...`)
        let uploaded = ""
        if (file.type.startsWith("video/")) {
          if (file.size > MAX_VIDEO_MB * 1024 * 1024) continue
          uploaded = await uploadVideo(token, file)
        } else {
          uploaded = await uploadImage(token, await safeShrink(file))
        }
        if (uploaded) {
          newItems.push({
            title: "",
            subtitle: "",
            description: "",
            url: uploaded,
          })
        }
      }
      setActivityMediaList((prev) => [...prev, ...newItems])
      setMsg(`✅ ${newItems.length}টি ফাইল সফলভাবে আপলোড হয়েছে`)
    } catch (err: any) {
      setMsg("❌ আপলোড ব্যর্থ: " + (err?.message || "নেটওয়ার্ক সমস্যা"))
    }
    setBusy(false)
  }

  async function uploadActivityMediaFile(index: number, file: File) {
    if (file.type.startsWith("video/") && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না`)
      return
    }
    try {
      setMsg("ফাইল আপলোড হচ্ছে...")
      let uploaded = ""
      if (file.type.startsWith("video/")) {
        uploaded = await uploadVideo(token, file)
      } else {
        uploaded = await uploadImage(token, await safeShrink(file))
      }
      updateActivityMedia(index, "url", uploaded)
      setMsg("✅ ফাইল আপলোড সম্পন্ন হয়েছে")
    } catch (err: any) {
      setMsg("❌ আপলোড ব্যর্থ: " + (err?.message || "ত্রুটি হয়েছে"))
    }
  }

  // কমিটি হ্যান্ডলার
  function addMember() {
    setMembers([...members, { name: "", role: "", photo_url: "" }])
  }
  function updateMember(index: number, field: keyof CommitteeMember, val: string) {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: val }
    setMembers(updated)
  }
  async function uploadMemberPhoto(index: number, file: File) {
    try {
      setMsg("সদস্যের ছবি আপলোড হচ্ছে...")
      const url = await uploadImage(token, await safeShrink(file))
      updateMember(index, "photo_url", url)
      setMsg("✅ ছবি আপলোড সম্পন্ন")
    } catch {
      setMsg("❌ ছবি আপলোড ব্যর্থ হয়েছে")
    }
  }
  function removeMember(index: number) {
    setMembers(members.filter((_, i) => i !== index))
  }

  // প্রতিবেদন হ্যান্ডলার
  function addReport() {
    setReports([
      ...reports,
      {
        title: "",
        subtitle: "",
        description: "",
        date: "Recent",
        reporter: "MBSTU Reporters Unity",
        media_items: [],
      },
    ])
  }
  function updateReport(index: number, field: keyof ClubReportItem, val: any) {
    const updated = [...reports]
    updated[index] = { ...updated[index], [field]: val }
    setReports(updated)
  }
  function removeReport(index: number) {
    setReports(reports.filter((_, i) => i !== index))
  }

  function addReportMedia(reportIdx: number) {
    const currentList = reports[reportIdx].media_items || []
    updateReport(reportIdx, "media_items", [
      ...currentList,
      { title: "", subtitle: "", description: "", url: "" },
    ])
  }
  function updateReportMedia(reportIdx: number, mediaIdx: number, field: keyof ClubMediaItem, val: string) {
    const currentList = [...(reports[reportIdx].media_items || [])]
    currentList[mediaIdx] = { ...currentList[mediaIdx], [field]: val }
    updateReport(reportIdx, "media_items", currentList)
  }
  function removeReportMedia(reportIdx: number, mediaIdx: number) {
    const currentList = (reports[reportIdx].media_items || []).filter((_, i) => i !== mediaIdx)
    updateReport(reportIdx, "media_items", currentList)
  }

  // ⭐ প্রতিবেদনের আনলিমিটেড ব্যাচ আপলোড ⭐
  async function batchUploadReportMediaFiles(reportIdx: number, files: File[]) {
    if (files.length === 0) return
    setBusy(true)
    const newItems: ClubMediaItem[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setMsg(`প্রতিবেদনের মিডিয়া আপলোড হচ্ছে (${i + 1}/${files.length})...`)
        let uploaded = ""
        if (file.type.startsWith("video/")) {
          if (file.size > MAX_VIDEO_MB * 1024 * 1024) continue
          uploaded = await uploadVideo(token, file)
        } else {
          uploaded = await uploadImage(token, await safeShrink(file))
        }
        if (uploaded) {
          newItems.push({
            title: "",
            subtitle: "",
            description: "",
            url: uploaded,
          })
        }
      }
      const currentList = reports[reportIdx].media_items || []
      updateReport(reportIdx, "media_items", [...currentList, ...newItems])
      setMsg(`✅ প্রতিবেদনে ${newItems.length}টি মিডিয়া যুক্ত হয়েছে`)
    } catch (err: any) {
      setMsg("❌ আপলোড ব্যর্থ: " + (err?.message || "নেটওয়ার্ক সমস্যা"))
    }
    setBusy(false)
  }

  async function uploadReportMediaFile(reportIdx: number, mediaIdx: number, file: File) {
    if (file.type.startsWith("video/") && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না`)
      return
    }
    try {
      setMsg("প্রতিবেদনের ফাইল আপলোড হচ্ছে...")
      let uploaded = ""
      if (file.type.startsWith("video/")) {
        uploaded = await uploadVideo(token, file)
      } else {
        uploaded = await uploadImage(token, await safeShrink(file))
      }
      updateReportMedia(reportIdx, mediaIdx, "url", uploaded)
      setMsg("✅ ফাইল আপলোড সম্পন্ন")
    } catch (err: any) {
      setMsg("❌ আপলোড ব্যর্থ: " + (err?.message || "ত্রুটি হয়েছে"))
    }
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const arr = [...list]
    const itemA = arr[i]
    const itemB = arr[j]
    arr[i] = itemB
    arr[j] = itemA
    setList(arr)

    try {
      const orderA = itemA.sort_order ?? i * 10
      const orderB = itemB.sort_order ?? j * 10
      const newOrderA = orderA === orderB ? j * 10 : orderB
      const newOrderB = orderA === orderB ? i * 10 : orderA

      await Promise.all([
        updateCampusClub(token, itemA.id, { sort_order: newOrderA }),
        updateCampusClub(token, itemB.id, { sort_order: newOrderB }),
      ])
      await load()
    } catch (e) {
      setMsg("❌ ক্রম পরিবর্তন ব্যর্থ হয়েছে: " + (e instanceof Error ? e.message : ""))
    }
  }

  async function toggleActive(club: ClubItem) {
    setBusy(true)
    try {
      await updateCampusClub(token, club.id, { is_active: !club.is_active })
      await load()
      setMsg(club.is_active ? "✅ ক্লাবটি লুকানো হয়েছে" : "✅ ক্লাবটি ওয়েবসাইটে দৃশ্যমান করা হয়েছে")
    } catch {
      setMsg("❌ স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে")
    }
    setBusy(false)
  }

  async function save() {
    if (!name.trim()) {
      setMsg("❌ অন্তত ক্লাবের ইংরেজি নামটি লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let finalLogo = logoUrl
      if (logoFile) {
        setMsg("লগো আপলোড হচ্ছে...")
        finalLogo = await uploadImage(token, await safeShrink(logoFile))
      }

      const finalEmbedMedia = stringifyActivityMedia(activityMediaList)

      const data = {
        name: name.trim(),
        name_bn: nameBn.trim() || null,
        tag: tag.trim() || "General",
        icon,
        is_active: isActive,
        logo_url: finalLogo,
        activity: activity.trim() || null,
        activity_bn: activityBn.trim() || null,
        date: date.trim() || null,
        fb_url: formatUrl(fbUrl),
        yt_url: formatUrl(ytUrl),
        web_url: formatUrl(webUrl),
        embed_media_url: finalEmbedMedia,
        contact_info: contactInfo.trim() || null,
        committee_term: committeeTerm.trim() || null,
        committee_members: members.filter((m) => m.name.trim() || m.role.trim()),
        reports_title: reportsTitle.trim() || "ক্লাব প্রতিবেদন / Club Reports",
        reports: reports.filter((r) => r.title.trim()),
      }

      if (editId) {
        await updateCampusClub(token, editId, data)
        setMsg("✅ ক্লাবের তথ্য সফলভাবে আপডেট হয়েছে")
      } else {
        const nextOrder = list.length ? Math.max(...list.map((c) => c.sort_order || 0)) + 10 : 0
        await createCampusClub(token, { ...data, sort_order: nextOrder })
        setMsg("✅ নতুন ক্লাব যোগ করা হয়েছে")
      }
      reset()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function remove(id: string, clubName: string) {
    if (!confirm(`"${clubName}" ক্লাবটি মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteCampusClub(token, id)
      await load()
      setMsg("✅ ক্লাব মুছে ফেলা হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  async function handleSaveCarouselConfig() {
    setSliderBusy(true)
    setSliderMsg("")
    try {
      await saveClubCarouselConfig(token, sliderCfg)
      setSliderMsg("✅ ক্লাব স্লাইডার ও ট্রানজিশন সেটিংস সফলভাবে সেভ হয়েছে! হোমপেজ রিফ্রেশ করে দেখুন।")
    } catch (e) {
      setSliderMsg("❌ সেটিংস সেভ করতে সমস্যা হয়েছে: " + (e instanceof Error ? e.message : ""))
    }
    setSliderBusy(false)
  }

  return (
    <div className="space-y-4">
      {/* সাব-ট্যাব ন্যাভিগেশন */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("clubs")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "clubs" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <PlusCircle className="size-4" />
          <span>১. ক্লাব তথ্য ও তালিকা ({list.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("slider_config")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "slider_config" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Sliders className="size-4" />
          <span>২. ট্রানজিশন ও স্লাইডার সেটিংস</span>
        </button>
      </div>

      {/* ==================== ট্যাব ২: ট্রানজিশন ও স্লাইডার সেটিংস ==================== */}
      {activeTab === "slider_config" && (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5 space-y-4">
          <div className="border-b pb-2">
            <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <Sliders className="size-5 text-green-700" />
              <span>হোমপেজ ক্লাব স্লাইডার ও ট্রানজিশন কন্ট্রোল</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              হোমপেজে ক্লাব কার্ডগুলো কীভাবে একটার পর একটা ট্রানজিশন করবে তা এখান থেকে নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border cursor-pointer">
            <span className="text-xs font-bold text-gray-800">
              স্বয়ংক্রিয় স্লাইডার/ট্রানজিশন সক্রিয় রাখুন:
            </span>
            <input
              type="checkbox"
              checked={sliderCfg.enabled}
              onChange={(e) => setSliderCfg({ ...sliderCfg, enabled: e.target.checked })}
              className="size-4.5 accent-green-700 rounded cursor-pointer"
            />
          </label>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              ১. ট্রানজিশনের দিক (Transition Direction):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSliderCfg({ ...sliderCfg, direction: "right-to-left" })}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sliderCfg.direction === "right-to-left"
                    ? "bg-green-700 text-white border-green-700 shadow"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ArrowRight className="size-3.5" /> ডান ➔ বাম
              </button>

              <button
                type="button"
                onClick={() => setSliderCfg({ ...sliderCfg, direction: "left-to-right" })}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sliderCfg.direction === "left-to-right"
                    ? "bg-green-700 text-white border-green-700 shadow"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ArrowLeft className="size-3.5" /> বাম ➔ ডান
              </button>

              <button
                type="button"
                onClick={() => setSliderCfg({ ...sliderCfg, direction: "bottom-to-top" })}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sliderCfg.direction === "bottom-to-top"
                    ? "bg-green-700 text-white border-green-700 shadow"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ArrowUp className="size-3.5" /> নিচ ➔ উপর
              </button>

              <button
                type="button"
                onClick={() => setSliderCfg({ ...sliderCfg, direction: "top-to-bottom" })}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sliderCfg.direction === "top-to-bottom"
                    ? "bg-green-700 text-white border-green-700 shadow"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ArrowDown className="size-3.5" /> উপর ➔ নিচ
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              ২. ট্রানজিশনের অ্যানিমেশন ইফেক্ট (Animation Effect):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: "slide", label: "স্মুথ স্লাইড (Slide)" },
                { key: "fade", label: "সফট ফেড (Soft Fade)" },
                { key: "zoom", label: "জুম পপ (Zoom Pop)" },
                { key: "flip", label: "৩ডি ফ্লিপ (3D Flip)" },
              ].map((eff) => (
                <button
                  key={eff.key}
                  type="button"
                  onClick={() => setSliderCfg({ ...sliderCfg, effect: eff.key as ClubTransitionEffect })}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                    sliderCfg.effect === eff.key
                      ? "bg-green-700 text-white border-green-700 shadow"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {eff.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">⏱️ প্রতিটি স্লাইডের বিরতি:</span>
                <span className="font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded">
                  {sliderCfg.duration_sec} সেকেন্ড
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={sliderCfg.duration_sec}
                onChange={(e) => setSliderCfg({ ...sliderCfg, duration_sec: Number(e.target.value) })}
                className="w-full accent-green-700 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">⚡ অ্যানিমেশনের মসৃণতা গতি:</span>
                <span className="font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded">
                  {sliderCfg.anim_speed_ms} ms
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1500"
                step="50"
                value={sliderCfg.anim_speed_ms}
                onChange={(e) => setSliderCfg({ ...sliderCfg, anim_speed_ms: Number(e.target.value) })}
                className="w-full accent-green-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                ডেস্কটপে দৃশ্যমান কার্ড সংখ্যা:
              </label>
              <select
                className={inp}
                value={sliderCfg.cards_desktop}
                onChange={(e) => setSliderCfg({ ...sliderCfg, cards_desktop: Number(e.target.value) })}
              >
                <option value="1">১টি বড় কার্ড (Featured)</option>
                <option value="2">২টি কার্ড পাশাপাশি</option>
                <option value="3">৩টি কার্ড পাশাপাশি (ডিফল্ট)</option>
                <option value="4">৪টি কার্ড পাশাপাশি</option>
              </select>
            </div>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border cursor-pointer self-end text-xs font-semibold">
              <input
                type="checkbox"
                checked={sliderCfg.show_arrows}
                onChange={(e) => setSliderCfg({ ...sliderCfg, show_arrows: e.target.checked })}
                className="size-4 accent-green-700 rounded cursor-pointer"
              />
              <span>নেভিগেশন তীর (Arrows) দেখান</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border cursor-pointer self-end text-xs font-semibold">
              <input
                type="checkbox"
                checked={sliderCfg.show_dots}
                onChange={(e) => setSliderCfg({ ...sliderCfg, show_dots: e.target.checked })}
                className="size-4 accent-green-700 rounded cursor-pointer"
              />
              <span>নিচে ডট ইন্ডিকেটর (Dots) দেখান</span>
            </label>
          </div>

          <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={sliderCfg.pause_on_hover}
              onChange={(e) => setSliderCfg({ ...sliderCfg, pause_on_hover: e.target.checked })}
              className="size-4 accent-green-700 rounded cursor-pointer"
            />
            <span>পাঠক কার্ডের ওপর মাউস বা আঙুল রাখলে স্লাইড থামা রাখুন (Pause on Hover/Touch)</span>
          </label>

          <button
            type="button"
            onClick={handleSaveCarouselConfig}
            disabled={sliderBusy}
            className={btn}
          >
            {sliderBusy ? "সংরক্ষণ হচ্ছে..." : "💾 স্লাইডার সেটিংস সেভ করুন"}
          </button>

          {sliderMsg && (
            <p className="text-xs font-bold text-center text-green-900 bg-green-50 p-2.5 rounded-xl border border-green-200">
              {sliderMsg}
            </p>
          )}
        </div>
      )}

      {/* ==================== ট্যাব ১: ক্লাব তৈরি ও এডিট ফরম ==================== */}
      {activeTab === "clubs" && (
        <>
          <div className="bg-white rounded-2xl shadow p-4 space-y-4">
            <h2 className="font-bold text-lg text-gray-800">{editId ? "✏️ ক্লাব এডিট করুন" : "➕ নতুন ক্লাব যুক্ত করুন"}</h2>
            <p className="text-xs text-gray-500">সব তথ্য ঐচ্ছিক। লগো, ভিডিও, কমিটি ও প্রতিবেদন আপনার পছন্দমতো যোগ/বিয়োগ করুন।</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="ক্লাবের নাম (English) *" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={inp} placeholder="ক্লাবের নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="ক্যাটেগরি/ট্যাগ (যেমন: Debate, Blood, Cultural)" value={tag} onChange={(e) => setTag(e.target.value)} />
              <div>
                <label className="text-xs text-gray-600 block mb-1">ক্লাবের প্রতীক (লগো না থাকলে এটি দেখাবে):</label>
                <select className={inp} value={icon} onChange={(e) => setIcon(e.target.value)}>
                  {ICON_OPTIONS.map((ic) => <option key={ic.key} value={ic.key}>{ic.label}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer p-2 bg-gray-50 rounded-xl border">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 accent-green-700 rounded cursor-pointer"
              />
              <span>হোমপেজে এই ক্লাবটি সক্রিয় (Active) রাখুন</span>
            </label>

            <div className="rounded-2xl border-2 border-emerald-200 p-3.5 bg-emerald-50/40 space-y-2">
              <label className="block text-xs font-bold text-emerald-950">
                🖼️ ক্লাবের লগো / অফিসিয়াল ছবি:
              </label>
              <input
                type="file"
                accept="image/*"
                className="block text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              {(logoFile || logoUrl) && (
                <div className="flex items-center gap-4 pt-2 bg-white p-3 rounded-xl border border-emerald-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : logoUrl || ""}
                    alt="Logo preview"
                    className="size-20 rounded-full object-cover bg-white border-2 border-emerald-500/40 p-1 shadow-md"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">লগোর প্রিভিউ</p>
                    <button
                      type="button"
                      onClick={() => { setLogoFile(null); setLogoUrl(null) }}
                      className="text-xs text-red-600 font-semibold underline hover:text-red-700 cursor-pointer"
                    >
                      ✕ লগো সরান
                    </button>
                  </div>
                </div>
              )}
            </div>

            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (English)" value={activity} onChange={(e) => setActivity(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (বাংলা)" value={activityBn} onChange={(e) => setActivityBn(e.target.value)} />
            <input className={inp} placeholder="কার্যক্রমের তারিখ (যেমন: 27 Oct 2026)" value={date} onChange={(e) => setDate(e.target.value)} />

            {/* ⭐ পরিচিতি ও সাম্প্রতিক কার্যক্রমের মিডিয়া (থাম্বনেইল প্রিভিউ ও ডিলিট অপশন সহ) ⭐ */}
            <div className="space-y-3 rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-blue-950">
                    🎥 পরিচিতি ও সাম্প্রতিক কার্যক্রমের মিডিয়া ({activityMediaList.length}টি):
                  </p>
                  <p className="text-[11px] text-blue-800">ভিডিও সর্বোচ্চ ৫০ MB পর্যন্ত হতে পারবে।</p>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-3 py-1.5 shadow flex items-center gap-1 cursor-pointer">
                    <Upload className="size-3.5" />
                    <span>📁 একসাথে একাধিক ফাইল যোগ (আনলিমিটেড)</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          batchUploadActivityFiles(Array.from(e.target.files))
                          e.target.value = ""
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={addActivityMedia}
                    className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl px-2.5 py-1.5 shadow cursor-pointer"
                  >
                    + লিংক বক্স
                  </button>
                </div>
              </div>

              {activityMediaList.map((m, idx) => (
                <div key={idx} className="rounded-xl border border-blue-200 bg-white p-3 space-y-2.5 text-xs shadow-sm">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span>মিডিয়া #{idx + 1}</span>
                      {m.url && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.2 rounded font-semibold">সংযুক্ত</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeActivityMedia(idx)}
                      className="text-red-600 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg border border-red-200"
                    >
                      <Trash2 className="size-3.5" />
                      <span>মুছুন / বাদ দিন</span>
                    </button>
                  </div>

                  {/* ছবি/ভিডিওর লাইভ থাম্বনেইল প্রিভিউ */}
                  {m.url && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                      {m.url.includes("youtube.com") || m.url.includes("youtu.be") ? (
                        <div className="size-16 rounded-lg bg-red-600 text-white font-bold flex flex-col items-center justify-center text-[10px] shrink-0">
                          <span>▶ YouTube</span>
                        </div>
                      ) : m.url.includes(".mp4") || m.url.includes("video") ? (
                        <div className="size-16 rounded-lg bg-black text-white font-bold flex flex-col items-center justify-center text-[10px] shrink-0">
                          <span>🎥 Video</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.url}
                          alt="Preview"
                          className="size-16 rounded-lg object-cover border shrink-0 bg-white"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-800 truncate">সংযুক্ত মিডিয়া লিঙ্ক/ফাইল</p>
                        <p className="text-[10px] text-gray-500 font-mono truncate">{m.url}</p>
                      </div>
                    </div>
                  )}

                  <input
                    className={smallInp}
                    placeholder="মিডিয়ার প্রধান শিরোনাম (ঐচ্ছিক)"
                    value={m.title || ""}
                    onChange={(e) => updateActivityMedia(idx, "title", e.target.value)}
                  />
                  <input
                    className={smallInp}
                    placeholder="মিডিয়ার উপশিরোনাম (ঐচ্ছিক)"
                    value={m.subtitle || ""}
                    onChange={(e) => updateActivityMedia(idx, "subtitle", e.target.value)}
                  />
                  <textarea
                    className={smallInp}
                    rows={2}
                    placeholder="মিডিয়া সম্পর্কে বিস্তারিত বিবরণ (ঐচ্ছিক)"
                    value={m.description || ""}
                    onChange={(e) => updateActivityMedia(idx, "description", e.target.value)}
                  />

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 block">মিডিয়া লিঙ্ক বা সরাসরি ফাইল:</label>
                    <input
                      className={smallInp}
                      placeholder="ইউটিউব, ফেসবুক ভিডিও বা ছবির সরাসরি লিংক (https://...)"
                      value={m.url || ""}
                      onChange={(e) => updateActivityMedia(idx, "url", e.target.value)}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-gray-500">ফাইল পরিবর্তন করতে চান?:</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="text-xs"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) uploadActivityMediaFile(idx, f)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {activityMediaList.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-3 bg-white/80 rounded-xl border border-dashed border-blue-200">
                  এখনো কোনো কার্যক্রমের মিডিয়া যুক্ত করা হয়নি। উপরে <b>"ফাইল যোগ"</b> বা <b>"লিংক বক্স"</b> চাপুন।
                </p>
              )}
            </div>

            <div className="space-y-2 border-t pt-2">
              <p className="text-xs font-semibold text-gray-700">সোশ্যাল মিডিয়া ও ওয়েবসাইট (ঐচ্ছিক):</p>
              <input className={inp} placeholder="ফেসবুক পেজ লিংক (https://facebook.com/...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
              <input className={inp} placeholder="ইউটিউব চ্যানেল লিংক (https://youtube.com/...)" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
              <input className={inp} placeholder="অফিসিয়াল ওয়েবসাইট লিংক (https://...)" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} />
            </div>

            <div className="rounded-2xl border p-3.5 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">কমিটি ও সদস্যবৃন্দ (ঐচ্ছিক):</p>
                <button
                  type="button"
                  onClick={addMember}
                  className="text-xs bg-green-700 text-white rounded-lg px-2.5 py-1 hover:bg-green-800 cursor-pointer"
                >
                  + সদস্য যোগ করুন
                </button>
              </div>
              <input
                className={inp}
                placeholder="কমিটির মেয়াদ (যেমন: কার্যনির্বাহী পরিষদ ২০২৫-২০২৬)"
                value={committeeTerm}
                onChange={(e) => setCommitteeTerm(e.target.value)}
              />

              {members.map((m, idx) => (
                <div key={idx} className="rounded-xl border bg-white p-2.5 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">সদস্য #{idx + 1}</span>
                    <button type="button" onClick={() => removeMember(idx)} className="text-xs text-red-600 font-semibold cursor-pointer">✕ সদস্য সরান</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={smallInp} placeholder="নাম" value={m.name} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                    <input className={smallInp} placeholder="পদবি (যেমন: সভাপতি)" value={m.role} onChange={(e) => updateMember(idx, "role", e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 shrink-0">ছবি:</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) uploadMemberPhoto(idx, f)
                      }}
                    />
                    {m.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo_url} alt="" className="size-8 rounded-full object-cover shrink-0 border" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ⭐ ক্লাব প্রতিবেদন / Reports (পূর্ণাঙ্গ এডিট, লাইভ থাম্বনেইল ও ডিলিট অপশন সহ) ⭐ */}
            <div className="rounded-2xl border p-3.5 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">ক্লাব প্রতিবেদন / Reports ({reports.length}টি):</p>
                  <p className="text-[11px] text-gray-500">প্রতিবেদনে শিরোনাম, বিস্তারিত এবং ছবি/ভিডিও লিংক দেওয়া যাবে।</p>
                </div>
                <button
                  type="button"
                  onClick={addReport}
                  className="text-xs bg-green-700 text-white rounded-lg px-2.5 py-1.5 hover:bg-green-800 shrink-0 shadow cursor-pointer font-bold"
                >
                  + নতুন প্রতিবেদন যোগ
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পপআপের প্রতিবেদনের শিরোনাম:
                </label>
                <input
                  className={inp}
                  placeholder="যেমন: ক্লাব প্রতিবেদন / Club Reports"
                  value={reportsTitle}
                  onChange={(e) => setReportsTitle(e.target.value)}
                />
              </div>

              {reports.map((r, idx) => (
                <div key={idx} className="rounded-2xl border-2 border-emerald-200 bg-white p-3.5 space-y-3 text-xs shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <span className="font-bold text-sm text-gray-800">প্রতিবেদন #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeReport(idx)}
                      className="text-xs text-red-600 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200"
                    >
                      <Trash2 className="size-3.5" />
                      <span>সম্পূর্ণ প্রতিবেদন ডিলিট</span>
                    </button>
                  </div>

                  <input className={smallInp} placeholder="প্রতিবেদনের প্রধান শিরোনাম *" value={r.title} onChange={(e) => updateReport(idx, "title", e.target.value)} />
                  <input className={smallInp} placeholder="উপশিরোনাম (ঐচ্ছিক)" value={r.subtitle || ""} onChange={(e) => updateReport(idx, "subtitle", e.target.value)} />
                  <textarea className={smallInp} rows={3} placeholder="প্রতিবেদনের বিস্তারিত বিবরণ (ঐচ্ছিক)" value={r.description || ""} onChange={(e) => updateReport(idx, "description", e.target.value)} />

                  <div className="grid grid-cols-2 gap-2">
                    <input className={smallInp} placeholder="তারিখ" value={r.date} onChange={(e) => updateReport(idx, "date", e.target.value)} />
                    <input className={smallInp} placeholder="প্রতিবেদকের নাম" value={r.reporter} onChange={(e) => updateReport(idx, "reporter", e.target.value)} />
                  </div>

                  {/* ⭐ প্রতিবেদনের মিডিয়া সেকশন (থাম্বনেইল ও ডিলিট অপশন সহ) ⭐ */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b pb-1.5">
                      <span className="text-[11px] font-bold text-gray-700">
                        📷 এই প্রতিবেদনের ছবি/ভিডিও/লিংক ({r.media_items?.length || 0}টি):
                      </span>

                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow cursor-pointer">
                          <Upload className="size-3" />
                          <span>📁 একাধিক ফাইল যোগ (আনলিমিটেড)</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                batchUploadReportMediaFiles(idx, Array.from(e.target.files))
                                e.target.value = ""
                              }
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => addReportMedia(idx)}
                          className="text-[11px] bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded-lg font-semibold cursor-pointer"
                        >
                          + লিংক
                        </button>
                      </div>
                    </div>

                    {r.media_items?.map((rm, rmi) => (
                      <div key={rmi} className="rounded-xl border bg-white p-2.5 space-y-2 text-xs shadow-xs">
                        <div className="flex items-center justify-between border-b pb-1">
                          <span className="text-[11px] font-bold text-gray-600">মিডিয়া #{rmi + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeReportMedia(idx, rmi)}
                            className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200"
                          >
                            <Trash2 className="size-3" />
                            <span>মুছুন / বাদ দিন</span>
                          </button>
                        </div>

                        {/* লাইভ থাম্বনেইল প্রিভিউ */}
                        {rm.url && (
                          <div className="flex items-center gap-2.5 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            {rm.url.includes("youtube.com") || rm.url.includes("youtu.be") ? (
                              <div className="size-12 rounded bg-red-600 text-white font-bold flex flex-col items-center justify-center text-[9px] shrink-0">
                                <span>▶ YouTube</span>
                              </div>
                            ) : rm.url.includes(".mp4") || rm.url.includes("video") ? (
                              <div className="size-12 rounded bg-black text-white font-bold flex flex-col items-center justify-center text-[9px] shrink-0">
                                <span>🎥 Video</span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={rm.url}
                                alt="Preview"
                                className="size-12 rounded object-cover border shrink-0 bg-white"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold text-gray-800 truncate">{rm.title || "মিডিয়া ফাইল"}</p>
                              <p className="text-[10px] text-gray-500 font-mono truncate">{rm.url}</p>
                            </div>
                          </div>
                        )}

                        <input className={smallInp} placeholder="মিডিয়া শিরোনাম (ঐচ্ছিক)" value={rm.title || ""} onChange={(e) => updateReportMedia(idx, rmi, "title", e.target.value)} />
                        <input className={smallInp} placeholder="উপশিরোনাম (ঐচ্ছিক)" value={rm.subtitle || ""} onChange={(e) => updateReportMedia(idx, rmi, "subtitle", e.target.value)} />
                        <textarea className={smallInp} rows={1} placeholder="মিডিয়ার বিস্তারিত বিবরণ (ঐচ্ছিক)" value={rm.description || ""} onChange={(e) => updateReportMedia(idx, rmi, "description", e.target.value)} />
                        <input className={smallInp} placeholder="ভিডিও/ছবি/ইউটিউব/ফেসবুক লিংক (https://...)" value={rm.url || ""} onChange={(e) => updateReportMedia(idx, rmi, "url", e.target.value)} />
                        
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-gray-400">ফাইল পরিবর্তন:</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="text-xs"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) uploadReportMediaFile(idx, rmi, f)
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {(!r.media_items || r.media_items.length === 0) && (
                      <p className="text-xs text-gray-400 text-center py-2 italic bg-white/70 rounded-lg">
                        এই প্রতিবেদনে এখনো কোনো মিডিয়া নেই। উপরে ফাইল বা লিংক যোগ করুন।
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {reports.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3 bg-white rounded-xl border border-dashed">
                  বর্তমানে কোনো প্রতিবেদন যোগ করা নেই।
                </p>
              )}
            </div>

            <input className={inp} placeholder="যোগাযোগের ইমেইল / ফোন (ঐচ্ছিক)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />

            <button className={btn} onClick={save} disabled={busy}>
              {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "➕ ক্লাব সংরক্ষণ করুন"}
            </button>
            {editId && <button onClick={reset} className="w-full text-xs underline text-gray-600 cursor-pointer">বাতিল</button>}
            {msg && <p className="text-xs font-bold text-center text-green-800 bg-green-50 p-2.5 rounded-xl border border-green-200">{msg}</p>}
          </div>

          {/* ক্লাব তালিকা */}
          <div className="space-y-3">
            <h2 className="font-semibold text-base text-gray-800">বর্তমান ক্লাবসমূহ ({list.length})</h2>

            {list.map((c, i) => (
              <div key={c.id} className="bg-white rounded-2xl shadow p-3.5 text-sm space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-xs text-green-800">
                      {i + 1}
                    </span>

                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt="" className="size-14 rounded-full object-cover border p-0.5 shrink-0 bg-white shadow-sm" />
                    ) : (
                      <span className="size-14 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 text-xl">
                        ⭐
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-base text-gray-800 truncate">{c.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          {c.is_active ? "সক্রিয়" : "লুকানো"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.name_bn || "বাংলা নাম নেই"} · ট্যাগ: {c.tag}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t pt-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-lg border px-2.5 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    ⬆ উপরে
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === list.length - 1}
                    className="rounded-lg border px-2.5 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    ⬇ নিচে
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    className={`ml-auto ${c.is_active ? "text-amber-600" : "text-green-700"} hover:underline cursor-pointer`}
                  >
                    {c.is_active ? "লুকান" : "দেখান"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-green-700 hover:underline cursor-pointer"
                  >
                    এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id, c.name)}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
