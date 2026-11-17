"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  Bell,
  Newspaper,
  FileWarning,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Send,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Share2,
  Video,
  Image as ImageIcon,
} from "lucide-react"
import { uploadImage, uploadVideo } from "../../lib/sb"
import {
  sendSubmissionToAdmin,
  normalizeWhatsappNumber,
  type SubmissionMedia,
  type SubmissionType,
} from "../../lib/submissions"

const MAX_VIDEO_MB = 50
const inp =
  "w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"

type PendingFile = {
  uid: string
  file: File
  preview: string
  kind: "image" | "video"
}

const OPTION_CARDS: Array<{
  key: SubmissionType
  title: string
  subtitle: string
  icon: typeof Bell
  accentCls: string
  badgeCls: string
}> = [
  {
    key: "notice",
    title: "১. নোটিশ পাঠান",
    subtitle: "ক্যাম্পাস, হল বা বিভাগীয় যেকোনো নোটিশ অ্যাডমিনের কাছে পাঠান",
    icon: Bell,
    accentCls: "border-emerald-200 hover:border-emerald-400",
    badgeCls: "bg-emerald-600 text-white",
  },
  {
    key: "news",
    title: "২. সংবাদ পাঠান",
    subtitle: "ক্যাম্পাসের খবর, ছবি বা ভিডিও সরাসরি অ্যাডমিনের ইমেইলে পাঠান",
    icon: Newspaper,
    accentCls: "border-cyan-200 hover:border-cyan-400",
    badgeCls: "bg-cyan-600 text-white",
  },
  {
    key: "info",
    title: "৩. যেকোনো তথ্য পাঠান",
    subtitle: "গুরুত্বপূর্ণ তথ্য, প্রমাণ ও সত্যতা অঙ্গীকারনামাসহ পাঠান",
    icon: FileWarning,
    accentCls: "border-amber-200 hover:border-amber-400",
    badgeCls: "bg-amber-600 text-white",
  },
]

export default function SubmissionSender({
  token,
  shrink,
  senderName,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
  senderName: string
}) {
  const [activeType, setActiveType] = useState<SubmissionType | null>("notice")

  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [details, setDetails] = useState("")
  const [truthPledge, setTruthPledge] = useState("")
  const [files, setFiles] = useState<PendingFile[]>([])

  const [busy, setBusy] = useState(false)
  const [progressText, setProgressText] = useState("")
  const [errMsg, setErrMsg] = useState("")

  const [successInfo, setSuccessInfo] = useState<{
    type: SubmissionType
    emailSent: boolean
    emailError: string | null
    whatsappUrl: string | null
    videoUrls: string[]
    rawVideoFiles: File[]
  } | null>(null)

  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  function switchOption(next: SubmissionType) {
    setErrMsg("")
    if (activeType === next) {
      setActiveType(null)
    } else {
      setActiveType(next)
      setSuccessInfo(null)
    }
  }

  function handleAddFiles(picked: File[]) {
    if (!picked.length) return
    setErrMsg("")
    const nextList: PendingFile[] = []

    for (const f of picked) {
      const isVideo = f.type.startsWith("video/")
      const isImage = f.type.startsWith("image/")
      if (!isVideo && !isImage) continue

      if (isVideo && f.size > MAX_VIDEO_MB * 1024 * 1024) {
        setErrMsg(`❌ প্রতিটি ভিডিও সর্বোচ্চ ${MAX_VIDEO_MB} MB হতে পারবে (${f.name} বাদ দেওয়া হয়েছে)`)
        continue
      }

      const preview = URL.createObjectURL(f)
      urlsRef.current.push(preview)
      nextList.push({
        uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        preview,
        kind: isVideo ? "video" : "image",
      })
    }

    if (nextList.length > 0) {
      setFiles((prev) => [...prev, ...nextList])
    }
  }

  function removePendingFile(uid: string) {
    setFiles((prev) => {
      const found = prev.find((x) => x.uid === uid)
      if (found) URL.revokeObjectURL(found.preview)
      return prev.filter((x) => x.uid !== uid)
    })
  }

  function resetFields() {
    setTitle("")
    setSubtitle("")
    setDetails("")
    setTruthPledge("")
    files.forEach((f) => URL.revokeObjectURL(f.preview))
    setFiles([])
  }

  async function handleSend() {
    if (!activeType) return
    setErrMsg("")
    setSuccessInfo(null)

    if (activeType === "info" && !truthPledge.trim()) {
      setErrMsg("❌ তথ্যটি যে সত্য তার দায়িত্ব ও অঙ্গীকারনামা বক্সে লিখতে হবে")
      return
    }

    if (
      !title.trim() &&
      !subtitle.trim() &&
      !details.trim() &&
      files.length === 0
    ) {
      setErrMsg("❌ অনুগ্রহ করে কিছু লিখুন অথবা অন্তত একটি ছবি/ভিডিও যুক্ত করুন")
      return
    }

    setBusy(true)
    try {
      const uploadedMedia: SubmissionMedia[] = []
      const rawVideoFiles: File[] = []

      for (let i = 0; i < files.length; i++) {
        const item = files[i]
        if (item.kind === "video") {
          setProgressText(`ভিডিও আপলোড হচ্ছে (${i + 1}/${files.length})...`)
          const url = await uploadVideo(token, item.file)
          uploadedMedia.push({ url, type: "video", name: item.file.name })
          rawVideoFiles.push(item.file)
        } else {
          setProgressText(`ছবি আপলোড হচ্ছে (${i + 1}/${files.length})...`)
          const shrunk = await shrink(item.file)
          const url = await uploadImage(token, shrunk)
          uploadedMedia.push({ url, type: "image", name: item.file.name })
        }
      }

      setProgressText("অ্যাডমিনের ইমেইলে পাঠানো হচ্ছে...")
      const result = await sendSubmissionToAdmin(token, {
        submission_type: activeType,
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        details: details.trim() || undefined,
        truth_pledge: activeType === "info" ? truthPledge.trim() : undefined,
        media_urls: uploadedMedia,
      })

      const videoUrls = uploadedMedia
        .filter((m) => m.type === "video")
        .map((m) => m.url)

      let whatsappUrl: string | null = null
      if (videoUrls.length > 0) {
        const typeLabel =
          activeType === "notice"
            ? "নোটিশ"
            : activeType === "news"
              ? "সংবাদ"
              : "তথ্য"
        const lines = [
          `আসসালামু আলাইকুম, আমি ${senderName} একটি ${typeLabel}-এর ভিডিও পাঠাচ্ছি:`,
          title.trim() ? `শিরোনাম: ${title.trim()}` : "",
          details.trim() ? `বিস্তারিত: ${details.trim().slice(0, 150)}` : "",
          "",
          ...videoUrls.map((u, idx) => `ভিডিও #${idx + 1}: ${u}`),
        ].filter(Boolean)

        const waNum = normalizeWhatsappNumber(result.whatsappNumber)
        whatsappUrl = waNum
          ? `https://wa.me/${waNum}?text=${encodeURIComponent(lines.join("\n"))}`
          : `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`
      }

      const currentSentType = activeType
      resetFields()
      setSuccessInfo({
        type: currentSentType,
        emailSent: result.emailSent,
        emailError: result.emailError,
        whatsappUrl,
        videoUrls,
        rawVideoFiles,
      })
    } catch (e) {
      setErrMsg("❌ " + (e instanceof Error ? e.message : "পাঠাতে সমস্যা হয়েছে"))
    }
    setProgressText("")
    setBusy(false)
  }

  async function handleNativeShareVideos(rawVideoFiles: File[]) {
    try {
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean
      }
      if (nav.share && (!nav.canShare || nav.canShare({ files: rawVideoFiles }))) {
        await nav.share({
          title: `${senderName}-এর পাঠানো ভিডিও`,
          files: rawVideoFiles,
        })
      } else {
        alert("আপনার ব্রাউজারে সরাসরি ফাইল শেয়ার সমর্থিত নয়, উপরের হোয়াটসঅ্যাপ বাটনটি ব্যবহার করুন।")
      }
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-1">
        <h2 className="font-bold text-base text-slate-900">
          স্বাগতম, {senderName}!
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          নিচের যেকোনো একটি অপশন বেছে নিয়ে সরাসরি অ্যাডমিনের কাছে নোটিশ, সংবাদ বা তথ্য পাঠাতে পারবেন। লেখা ও ছবি স্বয়ংক্রিয়ভাবে অ্যাডমিনের ইমেইলে চলে যাবে।
        </p>
      </div>

      {successInfo && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 space-y-3 shadow-sm">
          <div className="flex items-start gap-2.5 text-emerald-950">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm">
                {successInfo.emailSent
                  ? "✅ আপনার তথ্য সফলভাবে অ্যাডমিনের ইমেইলে পাঠানো হয়েছে!"
                  : "✅ আপনার তথ্য অ্যাডমিন প্যানেলে জমা হয়েছে!"}
              </p>
              {!successInfo.emailSent && successInfo.emailError && (
                <p className="text-amber-800 font-semibold">
                  ⚠️ ইমেইল পাঠাতে সমস্যা হয়েছে: {successInfo.emailError}
                </p>
              )}
            </div>
          </div>

          {successInfo.whatsappUrl && (
            <div className="rounded-xl bg-white border border-emerald-200 p-3 space-y-2">
              <p className="text-xs font-bold text-slate-800">
                🎥 আপনি {successInfo.videoUrls.length}টি ভিডিও যুক্ত করেছেন — এখন হোয়াটসঅ্যাপে পাঠান:
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={successInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow cursor-pointer transition"
                >
                  <MessageCircle className="size-4" />
                  <span>হোয়াটসঅ্যাপে ভিডিও পাঠান</span>
                </a>

                {successInfo.rawVideoFiles.length > 0 &&
                  typeof navigator !== "undefined" &&
                  "share" in navigator && (
                    <button
                      type="button"
                      onClick={() => handleNativeShareVideos(successInfo.rawVideoFiles)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 text-xs font-bold shadow cursor-pointer transition"
                    >
                      <Share2 className="size-3.5" />
                      <span>সরাসরি ফাইল শেয়ার</span>
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {errMsg && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
          {errMsg}
        </div>
      )}

      {/* ৩টি ড্রপডাউন অপশন কার্ড */}
      <div className="space-y-3">
        {OPTION_CARDS.map((card) => {
          const Icon = card.icon
          const isOpen = activeType === card.key

          return (
            <div
              key={card.key}
              className={`bg-white rounded-2xl shadow-xs border transition overflow-hidden ${
                isOpen ? "border-cyan-500 ring-1 ring-cyan-200" : card.accentCls
              }`}
            >
              {/* ড্রপডাউন হেডার বাটন */}
              <button
                type="button"
                onClick={() => switchOption(card.key)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer hover:bg-slate-50/70 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.badgeCls}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm sm:text-base text-slate-900">
                      {card.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{card.subtitle}</p>
                  </div>
                </div>
                <span className="p-1.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                  {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </span>
              </button>

              {/* ড্রপডাউন বক্স */}
              {isOpen && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
                  {card.key !== "info" ? (
                    <>
                      <input
                        className={inp}
                        placeholder="শিরোনাম (ঐচ্ছিক)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <input
                        className={inp}
                        placeholder="উপশিরোনাম (ঐচ্ছিক)"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />
                      <textarea
                        className={inp}
                        rows={4}
                        placeholder={
                          card.key === "notice"
                            ? "নোটিশের বিস্তারিত লিখুন (ঐচ্ছিক)..."
                            : "সংবাদের বিস্তারিত লিখুন (ঐচ্ছিক)..."
                        }
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          তথ্য সম্পর্কিত লেখা:
                        </label>
                        <textarea
                          className={inp}
                          rows={4}
                          placeholder="আপনার কাছে থাকা তথ্যটি বিস্তারিত লিখুন..."
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                        />
                      </div>

                      <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-3 space-y-1.5">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-emerald-700 shrink-0" />
                          <span>তথ্যের সত্যতা ও দায়িত্ব / অঙ্গীকারনামা * (বাধ্যতামূলক):</span>
                        </label>
                        <textarea
                          className={inp}
                          rows={2}
                          placeholder="এই তথ্যটি সত্য এবং এর সম্পূর্ণ দায়িত্ব আমি গ্রহণ করছি — এভাবে আপনার অঙ্গীকারনামা লিখুন..."
                          value={truthPledge}
                          onChange={(e) => setTruthPledge(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* একাধিক ছবি / ভিডিও ফাইল সিলেক্ট */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          📁 ছবি ও ভিডিও ফাইল যুক্ত করুন (একাধিক বাছা যাবে):
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ছবি অ্যাডমিনের ইমেইলে যাবে এবং ভিডিও হোয়াটসঅ্যাপে পাঠাতে পারবেন (সর্বোচ্চ {MAX_VIDEO_MB} MB)।
                        </p>
                      </div>

                      <label className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-3.5 py-2 text-xs font-bold cursor-pointer shadow-xs shrink-0">
                        <Upload className="size-3.5" />
                        <span>ফাইল বাছাই করুন</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleAddFiles(Array.from(e.target.files))
                              e.target.value = ""
                            }
                          }}
                        />
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {files.map((f) => (
                          <div
                            key={f.uid}
                            className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
                          >
                            {f.kind === "video" ? (
                              <div className="h-24 bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center gap-1">
                                <Video className="size-5 text-cyan-400" />
                                <span className="text-[10px] truncate w-full">{f.file.name}</span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={f.preview}
                                alt=""
                                className="h-24 w-full object-cover"
                              />
                            )}
                            <span className="absolute top-1 left-1 rounded bg-black/70 text-white px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
                              {f.kind === "video" ? <Video className="size-2.5" /> : <ImageIcon className="size-2.5" />}
                              <span>{f.kind === "video" ? "ভিডিও" : "ছবি"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removePendingFile(f.uid)}
                              className="absolute top-1 right-1 size-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow cursor-pointer"
                              title="সরান"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* পাঠান বাটন */}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleSend}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 font-bold text-sm shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="size-4" />
                    <span>{busy ? progressText || "পাঠানো হচ্ছে..." : "অ্যাডমিনের কাছে পাঠান"}</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
