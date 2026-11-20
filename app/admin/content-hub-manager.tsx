"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Clock,
  ShieldCheck,
  BookOpen,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  ExternalLink,
} from "lucide-react"
import { uploadImage } from "../../lib/sb"
import {
  getTimelineItems,
  saveTimelineItems,
  TIMELINE_CATEGORIES,
  type TimelineItem,
  type TimelineStatus,
  getFactCheckItems,
  saveFactCheckItems,
  type FactCheckItem,
  type FactVerdict,
  getPublicationItems,
  savePublicationItems,
  PUBLICATION_TYPES,
  type PublicationItem,
} from "../../lib/content-hub"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const btnPrimary =
  "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-sm transition"

type SubTab = "timeline" | "fact_check" | "publications"

const VERDICT_OPTIONS: Array<{ key: FactVerdict; label: string; badgeCls: string }> = [
  { key: "false", label: "🔴 ভুয়া / গুজব (False)", badgeCls: "bg-rose-100 text-rose-800 border-rose-200" },
  { key: "misleading", label: "🟡 বিভ্রান্তিকর (Misleading)", badgeCls: "bg-amber-100 text-amber-800 border-amber-200" },
  { key: "true", label: "🟢 সত্য প্রমাণিত (True)", badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { key: "unverified", label: "⚪ অযাচাইকৃত (Unverified)", badgeCls: "bg-slate-100 text-slate-700 border-slate-200" },
]

export default function ContentHubManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [subTab, setSubTab] = useState<SubTab>("timeline")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  /* -------------------- ১. টাইমলাইন স্টেট -------------------- */
  const [tlList, setTlList] = useState<TimelineItem[]>([])
  const [tlEditId, setTlEditId] = useState<string | null>(null)
  const [tlDateLabel, setTlDateLabel] = useState("")
  const [tlYear, setTlYear] = useState("২০২৬")
  const [tlCategory, setTlCategory] = useState<string>(TIMELINE_CATEGORIES[0])
  const [tlStatus, setTlStatus] = useState<TimelineStatus>("সম্পন্ন")
  const [tlTitle, setTlTitle] = useState("")
  const [tlSummary, setTlSummary] = useState("")
  const [tlPostUrl, setTlPostUrl] = useState("")
  const [tlHighlight, setTlHighlight] = useState(false)
  const [tlImgUrl, setTlImgUrl] = useState<string | null>(null)
  const [tlImgFile, setTlImgFile] = useState<File | null>(null)

  /* -------------------- ২. ফ্যাক্ট-চেক স্টেট -------------------- */
  const [fcList, setFcList] = useState<FactCheckItem[]>([])
  const [fcEditId, setFcEditId] = useState<string | null>(null)
  const [fcVerdict, setFcVerdict] = useState<FactVerdict>("false")
  const [fcTitle, setFcTitle] = useState("")
  const [fcClaim, setFcClaim] = useState("")
  const [fcSource, setFcSource] = useState("")
  const [fcExplanation, setFcExplanation] = useState("")
  const [fcEvidenceUrl, setFcEvidenceUrl] = useState("")
  const [fcChecker, setFcChecker] = useState("ফ্যাক্ট-চেক ডেস্ক, MBSTURU")
  const [fcDate, setFcDate] = useState("")
  const [fcImgUrl, setFcImgUrl] = useState<string | null>(null)
  const [fcImgFile, setFcImgFile] = useState<File | null>(null)

  /* -------------------- ৩. প্রকাশনা স্টেট -------------------- */
  const [pubList, setPubList] = useState<PublicationItem[]>([])
  const [pubEditId, setPubEditId] = useState<string | null>(null)
  const [pubType, setPubType] = useState<string>(PUBLICATION_TYPES[0])
  const [pubTitle, setPubTitle] = useState("")
  const [pubIssue, setPubIssue] = useState("")
  const [pubDesc, setPubDesc] = useState("")
  const [pubPdfUrl, setPubPdfUrl] = useState("")
  const [pubDownloadUrl, setPubDownloadUrl] = useState("")
  const [pubDate, setPubDate] = useState("")
  const [pubPages, setPubPages] = useState("")
  const [pubEditor, setPubEditor] = useState("সম্পাদনা পর্ষদ, MBSTURU")
  const [pubCoverUrl, setPubCoverUrl] = useState<string | null>(null)
  const [pubCoverFile, setPubCoverFile] = useState<File | null>(null)

  const tlImgPreview = useMemo(
    () => (tlImgFile ? URL.createObjectURL(tlImgFile) : tlImgUrl),
    [tlImgFile, tlImgUrl]
  )
  const fcImgPreview = useMemo(
    () => (fcImgFile ? URL.createObjectURL(fcImgFile) : fcImgUrl),
    [fcImgFile, fcImgUrl]
  )
  const pubCoverPreview = useMemo(
    () => (pubCoverFile ? URL.createObjectURL(pubCoverFile) : pubCoverUrl),
    [pubCoverFile, pubCoverUrl]
  )

  useEffect(() => {
    return () => {
      if (tlImgFile && tlImgPreview) URL.revokeObjectURL(tlImgPreview)
    }
  }, [tlImgFile, tlImgPreview])

  useEffect(() => {
    return () => {
      if (fcImgFile && fcImgPreview) URL.revokeObjectURL(fcImgPreview)
    }
  }, [fcImgFile, fcImgPreview])

  useEffect(() => {
    return () => {
      if (pubCoverFile && pubCoverPreview) URL.revokeObjectURL(pubCoverPreview)
    }
  }, [pubCoverFile, pubCoverPreview])

  async function loadAll() {
    const [t, f, p] = await Promise.all([
      getTimelineItems(),
      getFactCheckItems(),
      getPublicationItems(),
    ])
    setTlList(t)
    setFcList(f)
    setPubList(p)
  }

  useEffect(() => {
    loadAll()
  }, [])

  /* ==================== ১. টাইমলাইন ফাংশন ==================== */
  function resetTimeline() {
    setTlEditId(null)
    setTlDateLabel("")
    setTlYear("২০২৬")
    setTlCategory(TIMELINE_CATEGORIES[0])
    setTlStatus("সম্পন্ন")
    setTlTitle("")
    setTlSummary("")
    setTlPostUrl("")
    setTlHighlight(false)
    setTlImgUrl(null)
    setTlImgFile(null)
  }

  function editTimeline(item: TimelineItem) {
    setTlEditId(item.id)
    setTlDateLabel(item.date_label)
    setTlYear(item.year)
    setTlCategory(item.category)
    setTlStatus(item.status || "সম্পন্ন")
    setTlTitle(item.title)
    setTlSummary(item.summary)
    setTlPostUrl(item.post_url || "")
    setTlHighlight(Boolean(item.is_highlight))
    setTlImgUrl(item.image_url || null)
    setTlImgFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function saveTimeline() {
    if (!tlTitle.trim() || !tlSummary.trim() || !tlDateLabel.trim()) {
      setMsg("❌ তারিখ, শিরোনাম ও ঘটনার বিবরণ লিখুন")
      return
    }
    const cleanUrl = tlPostUrl.trim()
    if (cleanUrl && !/^(https?:\/\/|\/)/i.test(cleanUrl)) {
      setMsg("❌ সংবাদের লিংক https:// অথবা / দিয়ে শুরু হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let finalImg = tlImgUrl
      if (tlImgFile) {
        setMsg("ছবি আপলোড হচ্ছে...")
        finalImg = await uploadImage(token, await shrink(tlImgFile))
      }

      const nextItem: TimelineItem = {
        id: tlEditId || `tl-${Date.now()}`,
        date_label: tlDateLabel.trim(),
        year: tlYear.trim() || "২০২৬",
        category: tlCategory,
        status: tlStatus,
        title: tlTitle.trim(),
        summary: tlSummary.trim(),
        post_url: cleanUrl || null,
        image_url: finalImg,
        is_highlight: tlHighlight,
        created_at: tlEditId
          ? tlList.find((x) => x.id === tlEditId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      }

      const nextList = tlEditId
        ? tlList.map((x) => (x.id === tlEditId ? nextItem : x))
        : [nextItem, ...tlList]

      await saveTimelineItems(token, nextList)
      setTlList(nextList)
      resetTimeline()
      setMsg("✅ টাইমলাইনের ঘটনা সফলভাবে সংরক্ষণ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function moveTimeline(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= tlList.length) return
    const next = [...tlList]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setTlList(next)
    try {
      await saveTimelineItems(token, next)
    } catch {
      await loadAll()
    }
  }

  async function deleteTimeline(item: TimelineItem) {
    if (!confirm(`"${item.title}" টাইমলাইন থেকে মুছতে চান?`)) return
    setBusy(true)
    try {
      const next = tlList.filter((x) => x.id !== item.id)
      await saveTimelineItems(token, next)
      setTlList(next)
      if (tlEditId === item.id) resetTimeline()
      setMsg("✅ ঘটনাটি মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  /* ==================== ২. ফ্যাক্ট-চেক ফাংশন ==================== */
  function resetFactCheck() {
    setFcEditId(null)
    setFcVerdict("false")
    setFcTitle("")
    setFcClaim("")
    setFcSource("")
    setFcExplanation("")
    setFcEvidenceUrl("")
    setFcChecker("ফ্যাক্ট-চেক ডেস্ক, MBSTURU")
    setFcDate("")
    setFcImgUrl(null)
    setFcImgFile(null)
  }

  function editFactCheck(item: FactCheckItem) {
    setFcEditId(item.id)
    setFcVerdict(item.verdict)
    setFcTitle(item.title)
    setFcClaim(item.claim)
    setFcSource(item.claim_source || "")
    setFcExplanation(item.explanation)
    setFcEvidenceUrl(item.evidence_url || "")
    setFcChecker(item.checker_name || "ফ্যাক্ট-চেক ডেস্ক, MBSTURU")
    setFcDate(item.checked_date)
    setFcImgUrl(item.image_url || null)
    setFcImgFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function saveFactCheck() {
    if (!fcTitle.trim() || !fcClaim.trim() || !fcExplanation.trim()) {
      setMsg("❌ শিরোনাম, প্রচারিত দাবি এবং প্রকৃত সত্যের ব্যাখ্যা লিখুন")
      return
    }
    const cleanUrl = fcEvidenceUrl.trim()
    if (cleanUrl && !/^(https?:\/\/|\/)/i.test(cleanUrl)) {
      setMsg("❌ প্রমাণের লিংক https:// অথবা / দিয়ে শুরু হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let finalImg = fcImgUrl
      if (fcImgFile) {
        setMsg("প্রমাণের ছবি আপলোড হচ্ছে...")
        finalImg = await uploadImage(token, await shrink(fcImgFile))
      }

      const nextItem: FactCheckItem = {
        id: fcEditId || `fc-${Date.now()}`,
        verdict: fcVerdict,
        title: fcTitle.trim(),
        claim: fcClaim.trim(),
        claim_source: fcSource.trim() || null,
        explanation: fcExplanation.trim(),
        evidence_url: cleanUrl || null,
        image_url: finalImg,
        checker_name: fcChecker.trim() || "ফ্যাক্ট-চেক ডেস্ক, MBSTURU",
        checked_date:
          fcDate.trim() ||
          new Date().toLocaleDateString("bn-BD", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Dhaka",
          }),
        created_at: fcEditId
          ? fcList.find((x) => x.id === fcEditId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      }

      const nextList = fcEditId
        ? fcList.map((x) => (x.id === fcEditId ? nextItem : x))
        : [nextItem, ...fcList]

      await saveFactCheckItems(token, nextList)
      setFcList(nextList)
      resetFactCheck()
      setMsg("✅ ফ্যাক্ট-চেক প্রতিবেদন সংরক্ষণ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function deleteFactCheck(item: FactCheckItem) {
    if (!confirm(`"${item.title}" ফ্যাক্ট-চেক থেকে মুছতে চান?`)) return
    setBusy(true)
    try {
      const next = fcList.filter((x) => x.id !== item.id)
      await saveFactCheckItems(token, next)
      setFcList(next)
      if (fcEditId === item.id) resetFactCheck()
      setMsg("✅ ফ্যাক্ট-চেক মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  /* ==================== ৩. প্রকাশনা ফাংশন ==================== */
  function resetPublication() {
    setPubEditId(null)
    setPubType(PUBLICATION_TYPES[0])
    setPubTitle("")
    setPubIssue("")
    setPubDesc("")
    setPubPdfUrl("")
    setPubDownloadUrl("")
    setPubDate("")
    setPubPages("")
    setPubEditor("সম্পাদনা পর্ষদ, MBSTURU")
    setPubCoverUrl(null)
    setPubCoverFile(null)
  }

  function editPublication(item: PublicationItem) {
    setPubEditId(item.id)
    setPubType(item.pub_type)
    setPubTitle(item.title)
    setPubIssue(item.issue_label || "")
    setPubDesc(item.description || "")
    setPubPdfUrl(item.pdf_url || "")
    setPubDownloadUrl(item.download_url || "")
    setPubDate(item.published_date)
    setPubPages(item.pages_count || "")
    setPubEditor(item.editor_name || "")
    setPubCoverUrl(item.cover_url || null)
    setPubCoverFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function savePublication() {
    if (!pubTitle.trim()) {
      setMsg("❌ প্রকাশনার শিরোনাম লিখুন")
      return
    }
    const cleanPdf = pubPdfUrl.trim()
    if (cleanPdf && !/^https?:\/\//i.test(cleanPdf)) {
      setMsg("❌ PDF দেখার লিংক http:// অথবা https:// দিয়ে শুরু হতে হবে")
      return
    }
    const cleanDownload = pubDownloadUrl.trim()
    if (cleanDownload && !/^https?:\/\//i.test(cleanDownload)) {
      setMsg("❌ PDF ডাউনলোড লিংক http:// অথবা https:// দিয়ে শুরু হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let finalCover = pubCoverUrl
      if (pubCoverFile) {
        setMsg("কভার ছবি আপলোড হচ্ছে...")
        finalCover = await uploadImage(token, await shrink(pubCoverFile))
      }

      const nextItem: PublicationItem = {
        id: pubEditId || `pub-${Date.now()}`,
        pub_type: pubType,
        title: pubTitle.trim(),
        issue_label: pubIssue.trim() || null,
        description: pubDesc.trim() || null,
        cover_url: finalCover,
        pdf_url: cleanPdf,
        download_url: cleanDownload || null,
        published_date:
          pubDate.trim() ||
          new Date().toLocaleDateString("bn-BD", {
            month: "long",
            year: "numeric",
            timeZone: "Asia/Dhaka",
          }),
        pages_count: pubPages.trim() || null,
        editor_name: pubEditor.trim() || null,
        created_at: pubEditId
          ? pubList.find((x) => x.id === pubEditId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      }

      const nextList = pubEditId
        ? pubList.map((x) => (x.id === pubEditId ? nextItem : x))
        : [nextItem, ...pubList]

      await savePublicationItems(token, nextList)
      setPubList(nextList)
      resetPublication()
      setMsg("✅ প্রকাশনা সফলভাবে সংরক্ষণ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function deletePublication(item: PublicationItem) {
    if (!confirm(`"${item.title}" প্রকাশনা তালিকা থেকে মুছতে চান?`)) return
    setBusy(true)
    try {
      const next = pubList.filter((x) => x.id !== item.id)
      await savePublicationItems(token, next)
      setPubList(next)
      if (pubEditId === item.id) resetPublication()
      setMsg("✅ প্রকাশনা মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {/* ৩টি সাব-ট্যাব */}
      <div className="grid grid-cols-3 bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSubTab("timeline")
            setMsg("")
          }}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "timeline"
              ? "bg-cyan-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="size-3.5 shrink-0" />
          <span className="truncate">টাইমলাইন ({tlList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab("fact_check")
            setMsg("")
          }}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "fact_check"
              ? "bg-rose-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="size-3.5 shrink-0" />
          <span className="truncate">ফ্যাক্ট-চেক ({fcList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab("publications")
            setMsg("")
          }}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "publications"
              ? "bg-indigo-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="size-3.5 shrink-0" />
          <span className="truncate">প্রকাশনা ({pubList.length})</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {/* ==================== ১. টাইমলাইন ম্যানেজার ==================== */}
      {subTab === "timeline" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {tlEditId ? "✏️ টাইমলাইন ঘটনা এডিট" : "➕ টাইমলাইনে নতুন ঘটনা যোগ করুন"}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/timeline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-cyan-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>লাইভ</span>
                  <ExternalLink className="size-3" />
                </a>
                {tlEditId && (
                  <button
                    type="button"
                    onClick={resetTimeline}
                    className="text-xs text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="size-3.5" /> বাতিল
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="তারিখ / মাস * (যেমন: ১৯ নভেম্বর ২০২৬)"
                value={tlDateLabel}
                onChange={(e) => setTlDateLabel(e.target.value)}
              />
              <input
                className={inp}
                placeholder="বছর (যেমন: ২০২৬)"
                value={tlYear}
                onChange={(e) => setTlYear(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                className={inp}
                value={tlCategory}
                onChange={(e) => setTlCategory(e.target.value)}
              >
                {TIMELINE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className={inp}
                value={tlStatus}
                onChange={(e) => setTlStatus(e.target.value as TimelineStatus)}
              >
                <option value="সম্পন্ন">✓ সম্পন্ন</option>
                <option value="চলমান">● চলমান</option>
                <option value="মাইলফলক">🚩 মাইলফলক</option>
              </select>
            </div>

            <input
              className={inp}
              placeholder="ঘটনার শিরোনাম *"
              value={tlTitle}
              onChange={(e) => setTlTitle(e.target.value)}
            />
            <textarea
              className={inp}
              rows={3}
              placeholder="ঘটনার সংক্ষিপ্ত সারসংক্ষেপ *"
              value={tlSummary}
              onChange={(e) => setTlSummary(e.target.value)}
            />
            <input
              className={inp}
              placeholder="মূল সংবাদের লিংক (ঐচ্ছিক: /post/... বা https://...)"
              value={tlPostUrl}
              onChange={(e) => setTlPostUrl(e.target.value)}
            />

            <label className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={tlHighlight}
                onChange={(e) => setTlHighlight(e.target.checked)}
                className="size-4 accent-amber-600"
              />
              <span>⭐ প্রধান ঘটনা হিসেবে হাইলাইট করুন</span>
            </label>

            <div className="rounded-xl border p-2.5 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-cyan-700" />
                <span>ঘটনার ছবি (ঐচ্ছিক):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTlImgFile(e.target.files?.[0] || null)}
                  className="text-xs ml-1"
                />
              </label>
              {tlImgPreview && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tlImgPreview} alt="" className="h-16 w-24 rounded-lg object-cover border bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      setTlImgFile(null)
                      setTlImgUrl(null)
                    }}
                    className="text-xs text-rose-600 font-bold underline"
                  >
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>

            <button className={btnPrimary} onClick={saveTimeline} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : tlEditId ? "টাইমলাইন আপডেট করুন" : "➕ টাইমলাইনে যুক্ত করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {tlList.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-cyan-700">
                      {item.date_label} · {item.category}
                    </p>
                    <p className="font-bold text-sm text-slate-900">{item.title}</p>
                  </div>
                  {item.status && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0">
                      {item.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 border-t border-slate-100 pt-2 font-bold">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTimeline(idx, -1)}
                    className="p-1 rounded border bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === tlList.length - 1}
                    onClick={() => moveTimeline(idx, 1)}
                    className="p-1 rounded border bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => editTimeline(item)}
                    className="ml-auto inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
                  >
                    <Edit3 className="size-3" /> এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTimeline(item)}
                    className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="size-3" /> মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ২. ফ্যাক্ট-চেক ম্যানেজার ==================== */}
      {subTab === "fact_check" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {fcEditId ? "✏️ ফ্যাক্ট-চেক এডিট" : "➕ নতুন ফ্যাক্ট-চেক প্রতিবেদন"}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/fact-check"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-rose-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>লাইভ</span>
                  <ExternalLink className="size-3" />
                </a>
                {fcEditId && (
                  <button
                    type="button"
                    onClick={resetFactCheck}
                    className="text-xs text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="size-3.5" /> বাতিল
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">সিদ্ধান্ত (Verdict):</label>
              <select
                className={inp}
                value={fcVerdict}
                onChange={(e) => setFcVerdict(e.target.value as FactVerdict)}
              >
                {VERDICT_OPTIONS.map((v) => (
                  <option key={v.key} value={v.key}>{v.label}</option>
                ))}
              </select>
            </div>

            <input
              className={inp}
              placeholder="ফ্যাক্ট-চেক শিরোনাম * (যেমন: পরীক্ষা স্থগিতের ভাইরাল নোটিশটি ভুয়া)"
              value={fcTitle}
              onChange={(e) => setFcTitle(e.target.value)}
            />
            <textarea
              className={inp}
              rows={2}
              placeholder="প্রচারিত দাবি বা গুজব * (যে দাবিটি ছড়িয়েছে)"
              value={fcClaim}
              onChange={(e) => setFcClaim(e.target.value)}
            />
            <input
              className={inp}
              placeholder="গুজবের উৎস (যেমন: ফেসবুক গ্রুপ, অজ্ঞাত স্ক্রিনশট)"
              value={fcSource}
              onChange={(e) => setFcSource(e.target.value)}
            />
            <textarea
              className={inp}
              rows={3}
              placeholder="অনুসন্ধান ও প্রকৃত সত্য * (বিস্তারিত প্রমাণ ও বক্তব্য)"
              value={fcExplanation}
              onChange={(e) => setFcExplanation(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="দালিলিক প্রমাণের লিংক (ঐচ্ছিক)"
                value={fcEvidenceUrl}
                onChange={(e) => setFcEvidenceUrl(e.target.value)}
              />
              <input
                className={inp}
                placeholder="তারিখ (ফাঁকা রাখলে আজকের তারিখ)"
                value={fcDate}
                onChange={(e) => setFcDate(e.target.value)}
              />
            </div>

            <input
              className={inp}
              placeholder="যাচাইকারীর নাম / ডেস্ক"
              value={fcChecker}
              onChange={(e) => setFcChecker(e.target.value)}
            />

            <div className="rounded-xl border p-2.5 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-rose-700" />
                <span>প্রমাণের স্ক্রিনশট বা ছবি (ঐচ্ছিক):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFcImgFile(e.target.files?.[0] || null)}
                  className="text-xs ml-1"
                />
              </label>
              {fcImgPreview && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fcImgPreview} alt="" className="h-16 w-24 rounded-lg object-cover border bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      setFcImgFile(null)
                      setFcImgUrl(null)
                    }}
                    className="text-xs text-rose-600 font-bold underline"
                  >
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>

            <button className={btnPrimary} onClick={saveFactCheck} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : fcEditId ? "ফ্যাক্ট-চেক আপডেট করুন" : "➕ ফ্যাক্ট-চেক প্রকাশ করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {fcList.map((item) => {
              const v = VERDICT_OPTIONS.find((x) => x.key === item.verdict) || VERDICT_OPTIONS[3]
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full border font-bold text-[10px] ${v.badgeCls}`}>
                        {v.label}
                      </span>
                      <p className="font-bold text-sm text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">দাবি: {item.claim}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2 font-bold">
                    <button
                      type="button"
                      onClick={() => editFactCheck(item)}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
                    >
                      <Edit3 className="size-3" /> এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFactCheck(item)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                    >
                      <Trash2 className="size-3" /> মুছুন
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== ৩. প্রকাশনা ও PDF ম্যানেজার ==================== */}
      {subTab === "publications" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {pubEditId ? "✏️ প্রকাশনা এডিট করুন" : "➕ নতুন প্রকাশনা / PDF যুক্ত করুন"}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/publications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>লাইভ</span>
                  <ExternalLink className="size-3" />
                </a>
                {pubEditId && (
                  <button
                    type="button"
                    onClick={resetPublication}
                    className="text-xs text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="size-3.5" /> বাতিল
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                className={inp}
                value={pubType}
                onChange={(e) => setPubType(e.target.value)}
              >
                {PUBLICATION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                className={inp}
                placeholder="সংখ্যা / বর্ষ (যেমন: বর্ষ ১, সংখ্যা ২ • ২০২৬)"
                value={pubIssue}
                onChange={(e) => setPubIssue(e.target.value)}
              />
            </div>

            <input
              className={inp}
              placeholder="প্রকাশনার শিরোনাম *"
              value={pubTitle}
              onChange={(e) => setPubTitle(e.target.value)}
            />
            <textarea
              className={inp}
              rows={2}
              placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)"
              value={pubDesc}
              onChange={(e) => setPubDesc(e.target.value)}
            />
            <input
              className={inp}
              placeholder="PDF দেখার লিংক (Google Drive preview / সরাসরি PDF URL: https://...)"
              value={pubPdfUrl}
              onChange={(e) => setPubPdfUrl(e.target.value)}
            />
            <input
              className={inp}
              placeholder="আলাদা PDF ডাউনলোড লিংক (ঐচ্ছিক; Google Drive direct download URL)"
              value={pubDownloadUrl}
              onChange={(e) => setPubDownloadUrl(e.target.value)}
            />
            <p className="text-[11px] leading-relaxed text-slate-600">
              বড় PDF Supabase-এ না দিয়ে Google Drive বা অন্য HTTPS লিংক দিন। Drive ফাইলের access “Anyone with the link” করে দিন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                className={inp}
                placeholder="প্রকাশকাল (যেমন: নভেম্বর ২০২৬)"
                value={pubDate}
                onChange={(e) => setPubDate(e.target.value)}
              />
              <input
                className={inp}
                placeholder="পৃষ্ঠা সংখ্যা (যেমন: ৪৮ পৃষ্ঠা)"
                value={pubPages}
                onChange={(e) => setPubPages(e.target.value)}
              />
              <input
                className={inp}
                placeholder="সম্পাদনা পর্ষদ / সম্পাদক"
                value={pubEditor}
                onChange={(e) => setPubEditor(e.target.value)}
              />
            </div>

            <div className="rounded-xl border p-2.5 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-indigo-700" />
                <span>কভার ছবি (ঐচ্ছিক):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPubCoverFile(e.target.files?.[0] || null)}
                  className="text-xs ml-1"
                />
              </label>
              {pubCoverPreview && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pubCoverPreview} alt="" className="h-20 w-16 rounded-lg object-cover border bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      setPubCoverFile(null)
                      setPubCoverUrl(null)
                    }}
                    className="text-xs text-rose-600 font-bold underline"
                  >
                    কভার সরান
                  </button>
                </div>
              )}
            </div>

            <button className={btnPrimary} onClick={savePublication} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : pubEditId ? "প্রকাশনা আপডেট করুন" : "➕ প্রকাশনা সংরক্ষণ করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {pubList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-[10px]">
                      {item.pub_type}
                    </span>
                    <p className="font-bold text-sm text-slate-900 mt-1">{item.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.published_date} {item.issue_label ? `· ${item.issue_label}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2 font-bold">
                  <button
                    type="button"
                    onClick={() => editPublication(item)}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
                  >
                    <Edit3 className="size-3" /> এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePublication(item)}
                    className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                  >
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
