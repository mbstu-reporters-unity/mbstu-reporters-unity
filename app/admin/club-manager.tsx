"use client"

import { useEffect, useState } from "react"
import { getCampusClubs, createCampusClub, updateCampusClub, deleteCampusClub } from "../../lib/clubs"
import type { ClubItem, CommitteeMember, ClubReportItem } from "../../lib/clubs"
import { uploadImage } from "../../lib/sb"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const smallInp = "w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

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

async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1000 / Math.max(bmp.width, bmp.height))
  const c = document.createElement("canvas")
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("ছবি প্রসেস করা যায়নি"))), "image/jpeg", 0.82)
  )
}

export default function ClubManager({ token }: { token: string }) {
  const [list, setList] = useState<ClubItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // সাধারণ ফিল্ড
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [tag, setTag] = useState("Social")
  const [icon, setIcon] = useState("star")
  const [activity, setActivity] = useState("")
  const [activityBn, setActivityBn] = useState("")
  const [date, setDate] = useState("")
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const [webUrl, setWebUrl] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [order, setOrder] = useState(0)

  // লগো
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // কমিটি
  const [committeeTerm, setCommitteeTerm] = useState("")
  const [members, setMembers] = useState<CommitteeMember[]>([])

  // প্রতিবেদন
  const [reports, setReports] = useState<ClubReportItem[]>([])

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setList(await getCampusClubs(token))
  }

  useEffect(() => { load() }, [])

  function reset() {
    setEditId(null); setName(""); setNameBn(""); setTag("Social"); setIcon("star")
    setActivity(""); setActivityBn(""); setDate(""); setFbUrl(""); setYtUrl("")
    setWebUrl(""); setContactInfo(""); setOrder(0)
    setLogoUrl(null); setLogoFile(null)
    setCommitteeTerm(""); setMembers([])
    setReports([])
  }

  function startEdit(c: ClubItem) {
    setEditId(c.id)
    setName(c.name)
    setNameBn(c.name_bn || "")
    setTag(c.tag || "General")
    setIcon(c.icon || "star")
    setActivity(c.activity || "")
    setActivityBn(c.activity_bn || "")
    setDate(c.date || "")
    setFbUrl(c.fb_url || "")
    setYtUrl(c.yt_url || "")
    setWebUrl(c.web_url || "")
    setContactInfo(c.contact_info || "")
    setOrder(c.sort_order || 0)
    setLogoUrl(c.logo_url || null)
    setLogoFile(null)
    setCommitteeTerm(c.committee_term || "")
    setMembers(c.committee_members || [])
    setReports(c.reports || [])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // কমিটি সদস্য যোগ/বিয়োগ
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

  // প্রতিবেদন যোগ/বিয়োগ
  function addReport() {
    setReports([...reports, { title: "", date: "Recent", reporter: "MBSTU Reporters Unity" }])
  }
  function updateReport(index: number, field: keyof ClubReportItem, val: string) {
    const updated = [...reports]
    updated[index] = { ...updated[index], [field]: val }
    setReports(updated)
  }
  function removeReport(index: number) {
    setReports(reports.filter((_, i) => i !== index))
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

      const data = {
        name: name.trim(),
        name_bn: nameBn.trim() || null,
        tag: tag.trim() || "General",
        icon,
        logo_url: finalLogo,
        activity: activity.trim() || null,
        activity_bn: activityBn.trim() || null,
        date: date.trim() || null,
        fb_url: fbUrl.trim() || null,
        yt_url: ytUrl.trim() || null,
        web_url: webUrl.trim() || null,
        contact_info: contactInfo.trim() || null,
        committee_term: committeeTerm.trim() || null,
        committee_members: members.filter((m) => m.name.trim() || m.role.trim()),
        reports: reports.filter((r) => r.title.trim()),
        sort_order: Number(order) || 0,
        is_active: true,
      }

      if (editId) {
        await updateCampusClub(token, editId, data)
        setMsg("✅ ক্লাবের তথ্য সফলভাবে আপডেট হয়েছে")
      } else {
        await createCampusClub(token, data)
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
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold text-lg">{editId ? "ক্লাব এডিট করুন" : "নতুন ক্লাব যুক্ত করুন"}</h2>
        <p className="text-xs text-gray-500">সব তথ্য ঐচ্ছিক। লগো, কমিটি ও প্রতিবেদন আপনার পছন্দমতো যোগ/বিয়োগ করুন।</p>

        {/* নাম ও ট্যাগ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="ক্লাবের নাম (English) *" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inp} placeholder="ক্লাবের নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="ক্যাটেগরি/ট্যাগ (যেমন: Debate, Blood)" value={tag} onChange={(e) => setTag(e.target.value)} />
          <div>
            <label className="text-xs text-gray-600 block mb-1">ক্লাবের প্রতীক (লগো না থাকলে এটি দেখাবে):</label>
            <select className={inp} value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_OPTIONS.map((ic) => <option key={ic.key} value={ic.key}>{ic.label}</option>)}
            </select>
          </div>
        </div>

        {/* ক্লাবের লগো / ছবি আপলোড */}
        <div className="rounded-xl border p-3 bg-gray-50 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">ক্লাবের লগো / অফিসিয়াল ছবি (ঐচ্ছিক):</label>
          <input
            type="file"
            accept="image/*"
            className="block text-sm"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
          {(logoFile || logoUrl) && (
            <div className="flex items-center gap-3 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoFile ? URL.createObjectURL(logoFile) : logoUrl || ""}
                alt="Logo preview"
                className="w-14 h-14 rounded-xl object-contain bg-white border p-1"
              />
              <button
                type="button"
                onClick={() => { setLogoFile(null); setLogoUrl(null) }}
                className="text-xs text-red-600 underline"
              >
                লগো সরান
              </button>
            </div>
          )}
        </div>

        {/* সাম্প্রতিক কার্যক্রম */}
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (English)" value={activity} onChange={(e) => setActivity(e.target.value)} />
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (বাংলা)" value={activityBn} onChange={(e) => setActivityBn(e.target.value)} />
        <input className={inp} placeholder="কার্যক্রমের তারিখ (যেমন: 27 Oct 2026)" value={date} onChange={(e) => setDate(e.target.value)} />

        {/* সোশ্যাল লিংক */}
        <div className="space-y-2 border-t pt-2">
          <p className="text-xs font-semibold text-gray-700">সোশ্যাল মিডিয়া ও ওয়েবসাইট (ঐচ্ছিক):</p>
          <input className={inp} placeholder="ফেসবুক পেজ লিংক (https://facebook.com/...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
          <input className={inp} placeholder="ইউটিউব চ্যানেল লিংক (https://youtube.com/...)" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
          <input className={inp} placeholder="অফিসিয়াল ওয়েবসাইট লিংক (https://...)" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} />
        </div>

        {/* ==================== কমিটি সেকশন ==================== */}
        <div className="rounded-xl border p-3 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">কমিটি ও সদস্যবৃন্দ (ঐচ্ছিক):</p>
            <button
              type="button"
              onClick={addMember}
              className="text-xs bg-green-700 text-white rounded-lg px-2.5 py-1 hover:bg-green-800"
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
            <div key={idx} className="rounded-lg border bg-white p-2.5 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">সদস্য #{idx + 1}</span>
                <button type="button" onClick={() => removeMember(idx)} className="text-xs text-red-600 font-semibold">✕ সদস্য সরান</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={smallInp}
                  placeholder="নাম (যেমন: মো: তানভীর আহমেদ)"
                  value={m.name}
                  onChange={(e) => updateMember(idx, "name", e.target.value)}
                />
                <input
                  className={smallInp}
                  placeholder="পদবি (যেমন: সভাপতি / সাধারণ সম্পাদক)"
                  value={m.role}
                  onChange={(e) => updateMember(idx, "role", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 shrink-0">সদস্যের ছবি:</label>
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
                  <img src={m.photo_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border" />
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-xs text-gray-500 italic">কোনো সদস্য যোগ করা হয়নি। প্রয়োজনে উপরে "+ সদস্য যোগ করুন" চাপুন।</p>
          )}
        </div>

        {/* ==================== ক্লাব প্রতিবেদন সেকশন ==================== */}
        <div className="rounded-xl border p-3 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">ক্লাব প্রতিবেদন / Reports (ঐচ্ছিক):</p>
              <p className="text-xs text-gray-500">পপআপে দেখানো খবরের শিরোনাম, তারিখ ও প্রতিবেদকের নাম এখান থেকেই বদলানো যাবে।</p>
            </div>
            <button
              type="button"
              onClick={addReport}
              className="text-xs bg-green-700 text-white rounded-lg px-2.5 py-1 hover:bg-green-800 shrink-0"
            >
              + প্রতিবেদন যোগ করুন
            </button>
          </div>

          {reports.map((r, idx) => (
            <div key={idx} className="rounded-lg border bg-white p-2.5 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">প্রতিবেদন #{idx + 1}</span>
                <button type="button" onClick={() => removeReport(idx)} className="text-xs text-red-600 font-semibold">✕ সরান</button>
              </div>
              <input
                className={smallInp}
                placeholder="প্রতিবেদনের শিরোনাম (যেমন: মাদকবিরোধী র‍্যালি অনুষ্ঠিত)"
                value={r.title}
                onChange={(e) => updateReport(idx, "title", e.target.value)}
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
                  placeholder="প্রতিবেদক (যেমন: তানভীর আহমেদ / যেকারো নাম)"
                  value={r.reporter}
                  onChange={(e) => updateReport(idx, "reporter", e.target.value)}
                />
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-xs text-gray-500 italic">কোনো কাস্টম প্রতিবেদন নেই। ডিফল্টভাবে ক্লাবের সাম্প্রতিক কার্যক্রমটি প্রতিবেদন হিসেবে দেখাবে।</p>
          )}
        </div>

        <input className={inp} placeholder="যোগাযোগের ইমেইল / ফোন (ঐচ্ছিক)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />

        <label className="block text-xs text-gray-600">
          ক্রম / Serial Order (ছোট সংখ্যা আগে দেখাবে):
          <input className={inp} type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </label>

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "যুক্ত করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline text-gray-600">বাতিল</button>}
        {msg && <p className="text-sm font-semibold">{msg}</p>}
      </div>

      {/* ক্লাবের তালিকা */}
      <div className="space-y-3">
        <h2 className="font-semibold">বর্তমান ক্লাবসমূহ ({list.length})</h2>
        {list.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow p-3 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {c.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_url} alt="" className="w-10 h-10 rounded-xl object-contain border p-0.5 shrink-0 bg-white" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.name_bn || "বাংলা নাম নেই"} · ট্যাগ: {c.tag}</p>
                <p className="text-[11px] text-gray-400">
                  {c.committee_members?.length ? `কমিটি: ${c.committee_members.length} জন · ` : ""}
                  {c.reports?.length ? `প্রতিবেদন: ${c.reports.length} টি` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => startEdit(c)} className="text-green-700 font-semibold">এডিট</button>
              <button onClick={() => remove(c.id, c.name)} className="text-red-600 font-semibold">মুছুন</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
