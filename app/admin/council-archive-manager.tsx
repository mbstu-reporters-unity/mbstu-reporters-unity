"use client"

import React, { useEffect, useState } from "react"
import {
  ShieldCheck,
  History,
  Trash2,
  Edit3,
  Upload,
  X,
  ExternalLink,
  Plus,
} from "lucide-react"
import { SB_URL, SB_KEY, uploadImage } from "../../lib/sb"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const smallInp =
  "w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 focus:outline-none focus:border-cyan-600"
const btnPrimary =
  "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-sm transition"

interface AdvisorItem {
  id: string
  name: string
  role: string
  roleEn: string
  designation: string
  institution: string
  department?: string | null
  photo_url?: string | null
  message?: string | null
  email?: string | null
  phone?: string | null
  category: "chief_patron" | "faculty" | "professional"
}

interface PastOfficer {
  name: string
  role: string
  department?: string
  batch?: string
  media?: string
  currentStatus?: string
  photo_url?: string | null
}

interface PastCommitteeSession {
  id: string
  sessionBn: string
  sessionEn: string
  termTitle: string
  president: PastOfficer
  generalSecretary: PastOfficer
  otherOfficers: PastOfficer[]
  achievementsSummary?: string
}

const ADVISORS_KEY = "advisors_list_data"
const ARCHIVE_KEY = "past_committees_archive"

async function readAppConfigList<T>(key: string): Promise<T[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${encodeURIComponent(key)}`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: { value?: string }[] = await res.json()
    if (!rows?.[0]?.value) return []
    const parsed = JSON.parse(rows[0].value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function saveAppConfigList<T>(token: string, key: string, list: T[]) {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key, value: JSON.stringify(list) }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "সংরক্ষণ করা যায়নি")
  }
}

export default function CouncilArchiveManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [subTab, setSubTab] = useState<"advisors" | "archive">("advisors")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // ১. উপদেষ্টা পরিষদ স্টেট
  const [advisors, setAdvisors] = useState<AdvisorItem[]>([])
  const [advEditId, setAdvEditId] = useState<string | null>(null)
  const [advCat, setAdvCat] = useState<"chief_patron" | "faculty" | "professional">("faculty")
  const [advRole, setAdvRole] = useState("শিক্ষক উপদেষ্টা")
  const [advName, setAdvName] = useState("")
  const [advDesig, setAdvDesig] = useState("")
  const [advInst, setAdvInst] = useState("মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়")
  const [advDept, setAdvDept] = useState("")
  const [advEmail, setAdvEmail] = useState("")
  const [advPhone, setAdvPhone] = useState("")
  const [advMsg, setAdvMsg] = useState("")
  const [advPhoto, setAdvPhoto] = useState<string | null>(null)

  // ২. প্রাক্তন কমিটি আর্কাইভ স্টেট
  const [archives, setArchives] = useState<PastCommitteeSession[]>([])
  const [arcEditId, setArcEditId] = useState<string | null>(null)
  const [sessionBn, setSessionBn] = useState("২০২৪-২০২৫")
  const [sessionEn, setSessionEn] = useState("2024-2025")
  const [termTitle, setTermTitle] = useState("কার্যনির্বাহী পরিষদ ২০২৪-২০২৫")
  const [achievements, setAchievements] = useState("")

  const [presName, setPresName] = useState("")
  const [presDept, setPresDept] = useState("")
  const [presBatch, setPresBatch] = useState("")
  const [presMedia, setPresMedia] = useState("")
  const [presStatus, setPresStatus] = useState("")
  const [presPhoto, setPresPhoto] = useState<string | null>(null)

  const [gsName, setGsName] = useState("")
  const [gsDept, setGsDept] = useState("")
  const [gsBatch, setGsBatch] = useState("")
  const [gsMedia, setGsMedia] = useState("")
  const [gsStatus, setGsStatus] = useState("")
  const [gsPhoto, setGsPhoto] = useState<string | null>(null)

  const [others, setOthers] = useState<PastOfficer[]>([])

  async function loadAll() {
    const [aList, pList] = await Promise.all([
      readAppConfigList<AdvisorItem>(ADVISORS_KEY),
      readAppConfigList<PastCommitteeSession>(ARCHIVE_KEY),
    ])
    setAdvisors(aList)
    setArchives(pList)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleDirectPhotoUpload(file: File, setter: (url: string) => void) {
    setBusy(true)
    setMsg("ছবি আপলোড হচ্ছে...")
    try {
      const url = await uploadImage(token, await shrink(file))
      setter(url)
      setMsg("✅ ছবি আপলোড সম্পন্ন হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "ছবি আপলোড ব্যর্থ"))
    }
    setBusy(false)
  }

  /* ---------- উপদেষ্টা পরিষদ ফাংশন ---------- */
  function resetAdvisor() {
    setAdvEditId(null)
    setAdvCat("faculty")
    setAdvRole("শিক্ষক উপদেষ্টা")
    setAdvName("")
    setAdvDesig("")
    setAdvInst("মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়")
    setAdvDept("")
    setAdvEmail("")
    setAdvPhone("")
    setAdvMsg("")
    setAdvPhoto(null)
  }

  function startEditAdvisor(a: AdvisorItem) {
    setAdvEditId(a.id)
    setAdvCat(a.category)
    setAdvRole(a.role)
    setAdvName(a.name)
    setAdvDesig(a.designation)
    setAdvInst(a.institution)
    setAdvDept(a.department || "")
    setAdvEmail(a.email || "")
    setAdvPhone(a.phone || "")
    setAdvMsg(a.message || "")
    setAdvPhoto(a.photo_url || null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSaveAdvisor() {
    if (!advName.trim() || !advDesig.trim()) {
      setMsg("❌ উপদেষ্টার নাম এবং পদবি লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      const roleEnMap = {
        chief_patron: "Chief Patron",
        faculty: "Faculty Advisor",
        professional: "Professional Media Advisor",
      }
      const nextItem: AdvisorItem = {
        id: advEditId || `adv-${Date.now()}`,
        category: advCat,
        role: advRole.trim() || "উপদেষ্টা",
        roleEn: roleEnMap[advCat],
        name: advName.trim(),
        designation: advDesig.trim(),
        institution: advInst.trim() || "মাভাবিপ্রবি",
        department: advDept.trim() || null,
        email: advEmail.trim() || null,
        phone: advPhone.trim() || null,
        message: advMsg.trim() || null,
        photo_url: advPhoto,
      }
      const nextList = advEditId
        ? advisors.map((x) => (x.id === advEditId ? nextItem : x))
        : [...advisors, nextItem]

      await saveAppConfigList(token, ADVISORS_KEY, nextList)
      setAdvisors(nextList)
      resetAdvisor()
      setMsg("✅ উপদেষ্টার তথ্য সফলভাবে সেভ ও লাইভ হয়েছে!")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function handleDeleteAdvisor(a: AdvisorItem) {
    if (!confirm(`"${a.name}"-কে উপদেষ্টা পরিষদ থেকে মুছতে চান?`)) return
    setBusy(true)
    try {
      const nextList = advisors.filter((x) => x.id !== a.id)
      await saveAppConfigList(token, ADVISORS_KEY, nextList)
      setAdvisors(nextList)
      if (advEditId === a.id) resetAdvisor()
      setMsg("✅ মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছা যায়নি"))
    }
    setBusy(false)
  }

  /* ---------- প্রাক্তন কমিটি আর্কাইভ ফাংশন ---------- */
  function resetArchive() {
    setArcEditId(null)
    setSessionBn("")
    setSessionEn("")
    setTermTitle("")
    setAchievements("")
    setPresName("")
    setPresDept("")
    setPresBatch("")
    setPresMedia("")
    setPresStatus("")
    setPresPhoto(null)
    setGsName("")
    setGsDept("")
    setGsBatch("")
    setGsMedia("")
    setGsStatus("")
    setGsPhoto(null)
    setOthers([])
  }

  function startEditArchive(c: PastCommitteeSession) {
    setArcEditId(c.id)
    setSessionBn(c.sessionBn)
    setSessionEn(c.sessionEn)
    setTermTitle(c.termTitle)
    setAchievements(c.achievementsSummary || "")
    setPresName(c.president?.name || "")
    setPresDept(c.president?.department || "")
    setPresBatch(c.president?.batch || "")
    setPresMedia(c.president?.media || "")
    setPresStatus(c.president?.currentStatus || "")
    setPresPhoto(c.president?.photo_url || null)
    setGsName(c.generalSecretary?.name || "")
    setGsDept(c.generalSecretary?.department || "")
    setGsBatch(c.generalSecretary?.batch || "")
    setGsMedia(c.generalSecretary?.media || "")
    setGsStatus(c.generalSecretary?.currentStatus || "")
    setGsPhoto(c.generalSecretary?.photo_url || null)
    setOthers(Array.isArray(c.otherOfficers) ? c.otherOfficers : [])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSaveArchive() {
    if (!sessionBn.trim() || !presName.trim() || !gsName.trim()) {
      setMsg("❌ মেয়াদ/সেশন, সভাপতির নাম এবং সাধারণ সম্পাদকের নাম লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      const nextItem: PastCommitteeSession = {
        id: arcEditId || `term-${Date.now()}`,
        sessionBn: sessionBn.trim(),
        sessionEn: sessionEn.trim() || sessionBn.trim(),
        termTitle: termTitle.trim() || `কার্যনির্বাহী পরিষদ ${sessionBn.trim()}`,
        achievementsSummary: achievements.trim() || undefined,
        president: {
          name: presName.trim(),
          role: "সভাপতি",
          department: presDept.trim() || undefined,
          batch: presBatch.trim() || undefined,
          media: presMedia.trim() || undefined,
          currentStatus: presStatus.trim() || undefined,
          photo_url: presPhoto,
        },
        generalSecretary: {
          name: gsName.trim(),
          role: "সাধারণ সম্পাদক",
          department: gsDept.trim() || undefined,
          batch: gsBatch.trim() || undefined,
          media: gsMedia.trim() || undefined,
          currentStatus: gsStatus.trim() || undefined,
          photo_url: gsPhoto,
        },
        otherOfficers: others.filter((o) => o.name.trim() && o.role.trim()),
      }

      const nextList = arcEditId
        ? archives.map((x) => (x.id === arcEditId ? nextItem : x))
        : [nextItem, ...archives]

      await saveAppConfigList(token, ARCHIVE_KEY, nextList)
      setArchives(nextList)
      resetArchive()
      setMsg("✅ প্রাক্তন কমিটি আর্কাইভ সফলভাবে সেভ ও লাইভ হয়েছে!")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function handleDeleteArchive(c: PastCommitteeSession) {
    if (!confirm(`"${c.termTitle}" আর্কাইভ থেকে মুছতে চান?`)) return
    setBusy(true)
    try {
      const nextList = archives.filter((x) => x.id !== c.id)
      await saveAppConfigList(token, ARCHIVE_KEY, nextList)
      setArchives(nextList)
      if (arcEditId === c.id) resetArchive()
      setMsg("✅ মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছা যায়নি"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSubTab("advisors")
            setMsg("")
          }}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "advisors" ? "bg-purple-700 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>উপদেষ্টা পরিষদ ({advisors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab("archive")
            setMsg("")
          }}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "archive" ? "bg-amber-700 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="size-4" />
          <span>প্রাক্তন কমিটি ({archives.length})</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {/* ==================== ট্যাব ১: উপদেষ্টা পরিষদ ==================== */}
      {subTab === "advisors" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {advEditId ? "✏️ উপদেষ্টার তথ্য এডিট" : "➕ নতুন উপদেষ্টা / পৃষ্ঠপোষক যুক্ত করুন"}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/advisors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>লাইভ</span>
                  <ExternalLink className="size-3" />
                </a>
                {advEditId && (
                  <button type="button" onClick={resetAdvisor} className="text-xs text-rose-600 font-bold flex items-center gap-0.5">
                    <X className="size-3.5" /> বাতিল
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                className={inp}
                value={advCat}
                onChange={(e) => {
                  const val = e.target.value as "chief_patron" | "faculty" | "professional"
                  setAdvCat(val)
                  if (val === "chief_patron") setAdvRole("প্রধান পৃষ্ঠপোষক (Chief Patron)")
                  else if (val === "faculty") setAdvRole("শিক্ষক উপদেষ্টা")
                  else setAdvRole("পেশাদার সাংবাদিক উপদেষ্টা")
                }}
              >
                <option value="chief_patron">প্রধান পৃষ্ঠপোষক (উপাচার্য)</option>
                <option value="faculty">শিক্ষক উপদেষ্টা</option>
                <option value="professional">পেশাদার সাংবাদিক / অ্যালামনাই উপদেষ্টা</option>
              </select>

              <input
                className={inp}
                placeholder="উপদেষ্টা পরিষদের ভূমিকা (যেমন: শিক্ষক উপদেষ্টা)"
                value={advRole}
                onChange={(e) => setAdvRole(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="পূর্ণ নাম *" value={advName} onChange={(e) => setAdvName(e.target.value)} />
              <input className={inp} placeholder="পদবি * (যেমন: অধ্যাপক ও চেয়ারম্যান)" value={advDesig} onChange={(e) => setAdvDesig(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="প্রতিষ্ঠান" value={advInst} onChange={(e) => setAdvInst(e.target.value)} />
              <input className={inp} placeholder="বিভাগ বা দপ্তর (ঐচ্ছিক)" value={advDept} onChange={(e) => setAdvDept(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="ইমেইল (ঐচ্ছিক)" value={advEmail} onChange={(e) => setAdvEmail(e.target.value)} />
              <input className={inp} placeholder="মোবাইল (ঐচ্ছিক)" value={advPhone} onChange={(e) => setAdvPhone(e.target.value)} />
            </div>

            <textarea
              className={inp}
              rows={2}
              placeholder="উপদেষ্টার বাণী / দিকনির্দেশনা (ঐচ্ছিক)"
              value={advMsg}
              onChange={(e) => setAdvMsg(e.target.value)}
            />

            <div className="rounded-xl border p-2.5 bg-slate-50 flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-purple-700" />
                <span>ছবি আপলোড (ঐচ্ছিক)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleDirectPhotoUpload(f, setAdvPhoto)
                    e.target.value = ""
                  }}
                />
              </label>
              {advPhoto && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={advPhoto} alt="" className="size-11 rounded-full object-cover border" />
                  <button type="button" onClick={() => setAdvPhoto(null)} className="text-xs text-rose-600 font-bold underline">
                    ছবি সরান
                  </button>
                </>
              )}
            </div>

            <button className={btnPrimary} onClick={handleSaveAdvisor} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : advEditId ? "আপডেট করুন" : "➕ উপদেষ্টা যুক্ত করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {advisors.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {a.role}
                  </span>
                  <p className="font-bold text-sm text-slate-900 mt-1 truncate">{a.name}</p>
                  <p className="text-slate-500 truncate">{a.designation}</p>
                </div>
                <div className="flex gap-3 font-bold shrink-0">
                  <button type="button" onClick={() => startEditAdvisor(a)} className="text-emerald-700 hover:underline flex items-center gap-1">
                    <Edit3 className="size-3" /> এডিট
                  </button>
                  <button type="button" onClick={() => handleDeleteAdvisor(a)} className="text-rose-600 hover:underline flex items-center gap-1">
                    <Trash2 className="size-3" /> মুছুন
                  </button>
                </div>
              </div>
            ))}
            {advisors.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4 bg-white rounded-2xl border">
                এখনো কাস্টম উপদেষ্টা যোগ করা হয়নি (তাই /advisors পেজে প্রাথমিক নমুনা দেখাচ্ছে)। উপরের ফর্ম থেকে আসল উপদেষ্টা যোগ করুন।
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==================== ট্যাব ২: প্রাক্তন কমিটি আর্কাইভ ==================== */}
      {subTab === "archive" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {arcEditId ? "✏️ প্রাক্তন কমিটি এডিট" : "➕ প্রাক্তন মেয়াদের কমিটি যুক্ত করুন"}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/committee/archive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>লাইভ</span>
                  <ExternalLink className="size-3" />
                </a>
                {arcEditId && (
                  <button type="button" onClick={resetArchive} className="text-xs text-rose-600 font-bold flex items-center gap-0.5">
                    <X className="size-3.5" /> বাতিল
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className={inp} placeholder="সেশন (বাংলা) * যেমন: ২০২৪-২০২৫" value={sessionBn} onChange={(e) => setSessionBn(e.target.value)} />
              <input className={inp} placeholder="Session (EN) যেমন: 2024-2025" value={sessionEn} onChange={(e) => setSessionEn(e.target.value)} />
              <input className={inp} placeholder="কমিটির শিরোনাম" value={termTitle} onChange={(e) => setTermTitle(e.target.value)} />
            </div>

            <textarea
              className={inp}
              rows={2}
              placeholder="এই মেয়াদের উল্লেখযোগ্য অর্জন বা সারসংক্ষেপ (ঐচ্ছিক)"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
            />

            {/* সাবেক সভাপতি */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <p className="font-bold text-slate-800">১. সাবেক সভাপতি:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={smallInp} placeholder="সাবেক সভাপতির নাম *" value={presName} onChange={(e) => setPresName(e.target.value)} />
                <input className={smallInp} placeholder="বিভাগ ও ব্যাচ" value={presDept} onChange={(e) => setPresDept(e.target.value)} />
                <input className={smallInp} placeholder="পত্রিকার নাম" value={presMedia} onChange={(e) => setPresMedia(e.target.value)} />
                <input className={smallInp} placeholder="বর্তমান কর্মস্থল / অবস্থান" value={presStatus} onChange={(e) => setPresStatus(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 rounded-lg bg-white border px-2.5 py-1 font-bold cursor-pointer">
                  <Upload className="size-3" /> ছবি
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleDirectPhotoUpload(f, setPresPhoto)
                      e.target.value = ""
                    }}
                  />
                </label>
                {presPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={presPhoto} alt="" className="size-8 rounded-full object-cover border" />
                )}
              </div>
            </div>

            {/* সাবেক সাধারণ সম্পাদক */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <p className="font-bold text-slate-800">২. সাবেক সাধারণ সম্পাদক:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={smallInp} placeholder="সাবেক সাধারণ সম্পাদকের নাম *" value={gsName} onChange={(e) => setGsName(e.target.value)} />
                <input className={smallInp} placeholder="বিভাগ ও ব্যাচ" value={gsDept} onChange={(e) => setGsDept(e.target.value)} />
                <input className={smallInp} placeholder="পত্রিকার নাম" value={gsMedia} onChange={(e) => setGsMedia(e.target.value)} />
                <input className={smallInp} placeholder="বর্তমান কর্মস্থল / অবস্থান" value={gsStatus} onChange={(e) => setGsStatus(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 rounded-lg bg-white border px-2.5 py-1 font-bold cursor-pointer">
                  <Upload className="size-3" /> ছবি
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleDirectPhotoUpload(f, setGsPhoto)
                      e.target.value = ""
                    }}
                  />
                </label>
                {gsPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gsPhoto} alt="" className="size-8 rounded-full object-cover border" />
                )}
              </div>
            </div>

            {/* অন্যান্য কর্মকর্তাবৃন্দ */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">৩. অন্যান্য দায়িত্বপ্রাপ্ত সদস্য ({others.length}):</span>
                <button
                  type="button"
                  onClick={() => setOthers([...others, { name: "", role: "", department: "", batch: "" }])}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-2.5 py-1 font-bold cursor-pointer"
                >
                  <Plus className="size-3" /> সদস্য যোগ
                </button>
              </div>

              {others.map((o, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white p-2 rounded-lg border">
                  <input
                    className={smallInp}
                    placeholder="নাম *"
                    value={o.name}
                    onChange={(e) => {
                      const n = [...others]
                      n[idx] = { ...n[idx], name: e.target.value }
                      setOthers(n)
                    }}
                  />
                  <input
                    className={smallInp}
                    placeholder="পদবি *"
                    value={o.role}
                    onChange={(e) => {
                      const n = [...others]
                      n[idx] = { ...n[idx], role: e.target.value }
                      setOthers(n)
                    }}
                  />
                  <input
                    className={smallInp}
                    placeholder="বিভাগ"
                    value={o.department || ""}
                    onChange={(e) => {
                      const n = [...others]
                      n[idx] = { ...n[idx], department: e.target.value }
                      setOthers(n)
                    }}
                  />
                  <div className="flex gap-1">
                    <input
                      className={smallInp}
                      placeholder="ব্যাচ"
                      value={o.batch || ""}
                      onChange={(e) => {
                        const n = [...others]
                        n[idx] = { ...n[idx], batch: e.target.value }
                        setOthers(n)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setOthers(others.filter((_, i) => i !== idx))}
                      className="text-rose-600 px-1.5 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className={btnPrimary} onClick={handleSaveArchive} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : arcEditId ? "কমিটি আপডেট করুন" : "➕ প্রাক্তন কমিটি সংরক্ষণ করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {archives.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    সেশন: {c.sessionBn}
                  </span>
                  <p className="font-bold text-sm text-slate-900 mt-1 truncate">{c.termTitle}</p>
                  <p className="text-slate-500 truncate">
                    সভাপতি: {c.president?.name} · সা. সম্পাদক: {c.generalSecretary?.name}
                  </p>
                </div>
                <div className="flex gap-3 font-bold shrink-0">
                  <button type="button" onClick={() => startEditArchive(c)} className="text-emerald-700 hover:underline flex items-center gap-1">
                    <Edit3 className="size-3" /> এডিট
                  </button>
                  <button type="button" onClick={() => handleDeleteArchive(c)} className="text-rose-600 hover:underline flex items-center gap-1">
                    <Trash2 className="size-3" /> মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
