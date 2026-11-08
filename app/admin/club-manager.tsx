"use client"

import { useEffect, useState } from "react"
import {
  getCampusClubs,
  createCampusClub,
  updateCampusClub,
  deleteCampusClub,
  parseActivityMedia,
  stringifyActivityMedia,
  type ClubItem,
  type CommitteeMember,
  type ClubReportItem,
  type ClubMediaItem,
} from "../../lib/clubs"
import { uploadImage, uploadVideo } from "../../lib/sb"

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

async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height))
  const c = document.createElement("canvas")
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg"
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("ছবি প্রসেস করা যায়নি"))), mime, 0.88)
  )
}

export default function ClubManager({ token }: { token: string }) {
  const [list, setList] = useState<ClubItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)

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

  // ক্লাবের লোগো
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // পরিচিতি ও সাম্প্রতিক কার্যক্রমের একাধিক মিডিয়া আইটেম
  const [activityMediaList, setActivityMediaList] = useState<ClubMediaItem[]>([])

  // কমিটি
  const [committeeTerm, setCommitteeTerm] = useState("")
  const [members, setMembers] = useState<CommitteeMember[]>([])

  // ক্লাব প্রতিবেদন
  const [reportsTitle, setReportsTitle] = useState("ক্লাব প্রতিবেদন / Club Reports")
  const [reports, setReports] = useState<ClubReportItem[]>([])

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setList(await getCampusClubs(token))
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

    setActivityMediaList(parseActivityMedia(c.embed_media_url))
    setCommitteeTerm(c.committee_term || "")
    setMembers(c.committee_members || [])
    setReportsTitle(c.reports_title || "ক্লাব প্রতিবেদন / Club Reports")
    setReports(c.reports || [])
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
  async function uploadActivityMediaFile(index: number, file: File) {
    if (file.type.startsWith("video/") && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না`)
      return
    }
    try {
      setMsg("মিডিয়া ফাইল আপলোড হচ্ছে...")
      let uploaded = ""
      if (file.type.startsWith("video/")) {
        uploaded = await uploadVideo(token, file)
      } else {
        uploaded = await uploadImage(token, await shrink(file))
      }
      updateActivityMedia(index, "url", uploaded)
      setMsg("✅ ফাইল আপলোড সফল হয়েছে")
    } catch {
      setMsg("❌ ফাইল আপলোড ব্যর্থ হয়েছে")
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
      const url = await uploadImage(token, await shrink(file))
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
  async function uploadReportMediaFile(reportIdx: number, mediaIdx: number, file: File) {
    if (file.type.startsWith("video/") && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না`)
      return
    }
    try {
      setMsg("প্রতিবেদনের মিডিয়া আপলোড হচ্ছে...")
      let uploaded = ""
      if (file.type.startsWith("video/")) {
        uploaded = await uploadVideo(token, file)
      } else {
        uploaded = await uploadImage(token, await shrink(file))
      }
      updateReportMedia(reportIdx, mediaIdx, "url", uploaded)
      setMsg("✅ মিডিয়া আপলোড সম্পন্ন")
    } catch {
      setMsg("❌ মিডিয়া আপলোড ব্যর্থ হয়েছে")
    }
  }

  // অপটিমাইজড ক্রম পরিবর্তন
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
        finalLogo = await uploadImage(token, await shrink(logoFile))
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
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
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

  return (
    <div className="space-y-4">
      {/* ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <h2 className="font-bold text-lg text-gray-800">{editId ? "✏️ ক্লাব এডিট করুন" : "➕ নতুন ক্লাব যুক্ত করুন"}</h2>
        <p className="text-xs text-gray-500">সব তথ্য ঐচ্ছিক। লগো, ভিডিও, কমিটি ও প্রতিবেদন আপনার পছন্দমতো যোগ/বিয়োগ করুন।</p>

        {/* নাম ও ট্যাগ */}
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

        {/* সক্রিয় রাখার চেকবক্স */}
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer p-2 bg-gray-50 rounded-xl border">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 accent-green-700 rounded cursor-pointer"
          />
          <span>হোমপেজে এই ক্লাবটি সক্রিয় (Active) রাখুন</span>
        </label>

        {/* লগো আপলোড */}
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
                className="size-20 rounded-2xl object-contain bg-white border-2 border-emerald-500/40 p-1.5 shadow-md"
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

        {/* কার্যক্রম */}
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (English)" value={activity} onChange={(e) => setActivity(e.target.value)} />
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (বাংলা)" value={activityBn} onChange={(e) => setActivityBn(e.target.value)} />
        <input className={inp} placeholder="কার্যক্রমের তারিখ (যেমন: 27 Oct 2026)" value={date} onChange={(e) => setDate(e.target.value)} />

        {/* পরিচিতি ও সাম্প্রতিক কার্যক্রমের মিডিয়া */}
        <div className="space-y-3 rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-950">
                🎥 পরিচিতি ও সাম্প্রতিক কার্যক্রমের মিডিয়া (ছবি, ভিডিও, লিঙ্ক):
              </p>
              <p className="text-[11px] text-blue-800">ভিডিও সর্বোচ্চ ৫০ MB পর্যন্ত হতে পারবে।</p>
            </div>
            <button
              type="button"
              onClick={addActivityMedia}
              className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl px-3 py-1.5 shadow shrink-0 cursor-pointer"
            >
              + মিডিয়া যোগ করুন
            </button>
          </div>

          {activityMediaList.map((m, idx) => (
            <div key={idx} className="rounded-xl border border-blue-200 bg-white p-3 space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between border-b pb-1">
                <span className="font-bold text-blue-900">মিডিয়া #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeActivityMedia(idx)}
                  className="text-red-600 font-semibold hover:underline cursor-pointer"
                >
                  ✕ সরান
                </button>
              </div>

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
                  <span className="text-[10px] text-gray-500">অথবা ফাইল আপলোড:</span>
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
            <p className="text-[11px] text-gray-500 text-center py-2 italic bg-white/70 rounded-xl">
              এখনো কোনো মিডিয়া যোগ করা হয়নি।
            </p>
          )}
        </div>

        {/* সোশ্যাল লিংক */}
        <div className="space-y-2 border-t pt-2">
          <p className="text-xs font-semibold text-gray-700">সোশ্যাল মিডিয়া ও ওয়েবসাইট (ঐচ্ছিক):</p>
          <input className={inp} placeholder="ফেসবুক পেজ লিংক (https://facebook.com/...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
          <input className={inp} placeholder="ইউটিউব চ্যানেল লিংক (https://youtube.com/...)" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
          <input className={inp} placeholder="অফিসিয়াল ওয়েবসাইট লিংক (https://...)" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} />
        </div>

        {/* কমিটি */}
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
                <input
                  className={smallInp}
                  placeholder="নাম"
                  value={m.name}
                  onChange={(e) => updateMember(idx, "name", e.target.value)}
                />
                <input
                  className={smallInp}
                  placeholder="পদবি (যেমন: সভাপতি)"
                  value={m.role}
                  onChange={(e) => updateMember(idx, "role", e.target.value)}
                />
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

        {/* ক্লাব প্রতিবেদন */}
        <div className="rounded-2xl border p-3.5 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">ক্লাব প্রতিবেদন / Reports (ঐচ্ছিক):</p>
              <p className="text-[11px] text-gray-500">প্রতিবেদনে শিরোনাম, বিস্তারিত এবং ছবি/ভিডিও লিংক দেওয়া যাবে।</p>
            </div>
            <button
              type="button"
              onClick={addReport}
              className="text-xs bg-green-700 text-white rounded-lg px-2.5 py-1.5 hover:bg-green-800 shrink-0 shadow cursor-pointer"
            >
              + প্রতিবেদন যোগ করুন
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
            <div key={idx} className="rounded-xl border bg-white p-3 space-y-2.5 text-xs shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b pb-1">
                <span className="font-bold text-gray-700">প্রতিবেদন #{idx + 1}</span>
                <button type="button" onClick={() => removeReport(idx)} className="text-xs text-red-600 font-semibold hover:underline cursor-pointer">✕ সরান</button>
              </div>

              <input
                className={smallInp}
                placeholder="প্রতিবেদনের প্রধান শিরোনাম *"
                value={r.title}
                onChange={(e) => updateReport(idx, "title", e.target.value)}
              />
              <input
                className={smallInp}
                placeholder="উপশিরোনাম (ঐচ্ছিক)"
                value={r.subtitle || ""}
                onChange={(e) => updateReport(idx, "subtitle", e.target.value)}
              />
              <textarea
                className={smallInp}
                rows={2}
                placeholder="প্রতিবেদনের বিস্তারিত বিবরণ (ঐচ্ছিক)"
                value={r.description || ""}
                onChange={(e) => updateReport(idx, "description", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  className={smallInp}
                  placeholder="তারিখ (যেমন: 27 Oct 2026)"
                  value={r.date}
                  onChange={(e) => updateReport(idx, "date", e.target.value)}
                />
                <input
                  className={smallInp}
                  placeholder="প্রতিবেদকের নাম (যেমন: তানভীর আহমেদ)"
                  value={r.reporter}
                  onChange={(e) => updateReport(idx, "reporter", e.target.value)}
                />
              </div>

              {/* প্রতিবেদনের সাথে ছবি/ভিডিও */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">
                    📷 এই প্রতিবেদনের ছবি/ভিডিও/লিংক ({r.media_items?.length || 0}):
                  </span>
                  <button
                    type="button"
                    onClick={() => addReportMedia(idx)}
                    className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded-lg font-semibold hover:bg-emerald-800 cursor-pointer"
                  >
                    + মিডিয়া যোগ
                  </button>
                </div>

                {r.media_items?.map((rm, rmi) => (
                  <div key={rmi} className="rounded-lg border bg-white p-2 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-500">মিডিয়া #{rmi + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeReportMedia(idx, rmi)}
                        className="text-[10px] text-red-600 font-semibold cursor-pointer"
                      >
                        ✕ বাদ দিন
                      </button>
                    </div>
                    <input
                      className={smallInp}
                      placeholder="মিডিয়া শিরোনাম (ঐচ্ছিক)"
                      value={rm.title || ""}
                      onChange={(e) => updateReportMedia(idx, rmi, "title", e.target.value)}
                    />
                    <input
                      className={smallInp}
                      placeholder="উপশিরোনাম (ঐচ্ছিক)"
                      value={rm.subtitle || ""}
                      onChange={(e) => updateReportMedia(idx, rmi, "subtitle", e.target.value)}
                    />
                    <textarea
                      className={smallInp}
                      rows={1}
                      placeholder="মিডিয়ার বিস্তারিত বিবরণ (ঐচ্ছিক)"
                      value={rm.description || ""}
                      onChange={(e) => updateReportMedia(idx, rmi, "description", e.target.value)}
                    />
                    <input
                      className={smallInp}
                      placeholder="ভিডিও/ছবি/ইউটিউব/ফেসবুক লিংক (https://...)"
                      value={rm.url || ""}
                      onChange={(e) => updateReportMedia(idx, rmi, "url", e.target.value)}
                    />
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-gray-400">অথবা ফাইল:</span>
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
              </div>
            </div>
          ))}
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
                  <img src={c.logo_url} alt="" className="size-14 rounded-xl object-contain border p-1 shrink-0 bg-white shadow-sm" />
                ) : (
                  <span className="size-14 rounded-xl bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 text-xl">
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
    </div>
  )
}
