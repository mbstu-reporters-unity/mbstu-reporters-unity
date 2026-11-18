"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  FileEdit,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  X,
  Sparkles,
} from "lucide-react"
import { uploadImage, type Profile } from "../../lib/sb"
import {
  getMyNewsroomDrafts,
  getEditorNewsroomDrafts,
  createNewsroomDraft,
  updateNewsroomDraft,
  deleteNewsroomDraft,
  publishNewsroomDraftToPosts,
  type NewsroomDraft,
  type DraftStatus,
} from "../../lib/newsroom"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"

const STATUS_UI: Record<
  DraftStatus,
  { label: string; badgeCls: string; Icon: typeof Clock }
> = {
  draft: {
    label: "খসড়া (Draft)",
    badgeCls: "bg-slate-100 text-slate-700 border-slate-300",
    Icon: FileEdit,
  },
  submitted: {
    label: "পর্যালোচনাধীন (Submitted)",
    badgeCls: "bg-amber-100 text-amber-800 border-amber-300",
    Icon: Clock,
  },
  needs_revision: {
    label: "সংশোধন প্রয়োজন",
    badgeCls: "bg-rose-100 text-rose-800 border-rose-300",
    Icon: AlertCircle,
  },
  published: {
    label: "প্রকাশিত (Published)",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Icon: CheckCircle2,
  },
}

export default function NewsroomWorkflow({
  token,
  currentUser,
  isEditor,
  categories,
  shrink,
  onPublished,
}: {
  token: string
  currentUser: Profile
  isEditor: boolean
  categories: string[]
  shrink: (f: File) => Promise<Blob>
  onPublished?: () => Promise<void> | void
}) {
  const [view, setView] = useState<"my_drafts" | "editor_desk">(
    isEditor ? "editor_desk" : "my_drafts"
  )
  const [myDrafts, setMyDrafts] = useState<NewsroomDraft[]>([])
  const [editorDrafts, setEditorDrafts] = useState<NewsroomDraft[]>([])
  const [missingTable, setMissingTable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // লেখক ফর্ম স্টেট
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [category, setCategory] = useState(categories[0] || "ক্যাম্পাস সংবাদ")
  const [body, setBody] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // সম্পাদকীয় রিভিউ স্টেট
  const [editorFilter, setEditorFilter] = useState<"all" | DraftStatus>("submitted")
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [revTitle, setRevTitle] = useState("")
  const [revHeading, setRevHeading] = useState("")
  const [revCategory, setRevCategory] = useState("")
  const [revBody, setRevBody] = useState("")
  const [revNote, setRevNote] = useState("")

  const imgPreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : imageUrl),
    [imageFile, imageUrl]
  )

  useEffect(() => {
    return () => {
      if (imageFile && imgPreview) URL.revokeObjectURL(imgPreview)
    }
  }, [imageFile, imgPreview])

  async function loadAll() {
    setLoading(true)
    const tasks: Promise<any>[] = [getMyNewsroomDrafts(token, currentUser.id)]
    if (isEditor) {
      tasks.push(getEditorNewsroomDrafts(token))
    }
    const results = await Promise.all(tasks)
    const myRes = results[0] as { rows: NewsroomDraft[]; missingTable: boolean }
    setMyDrafts(myRes.rows)
    let isMissing = myRes.missingTable

    if (isEditor && results[1]) {
      const edRes = results[1] as { rows: NewsroomDraft[]; missingTable: boolean }
      setEditorDrafts(edRes.rows)
      isMissing = isMissing || edRes.missingTable
    }
    setMissingTable(isMissing)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser.id, isEditor])

  function resetWriterForm() {
    setEditId(null)
    setTitle("")
    setHeading("")
    setCategory(categories[0] || "ক্যাম্পাস সংবাদ")
    setBody("")
    setLinkUrl("")
    setImageUrl(null)
    setImageFile(null)
  }

  function startEditDraft(d: NewsroomDraft) {
    setEditId(d.id)
    setTitle(d.title)
    setHeading(d.heading || "")
    setCategory(d.category || categories[0] || "ক্যাম্পাস সংবাদ")
    setBody(d.body)
    setLinkUrl(d.link_url || "")
    setImageUrl(d.image_url || null)
    setImageFile(null)
    setView("my_drafts")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function saveDraft(targetStatus: "draft" | "submitted") {
    if (!title.trim() || !body.trim()) {
      setMsg("❌ শিরোনাম এবং সংবাদের মূল লেখা লিখুন")
      return
    }
    if (linkUrl.trim() && !/^https?:\/\//i.test(linkUrl.trim())) {
      setMsg("❌ ওয়েবসাইট লিংক http:// বা https:// দিয়ে শুরু হতে হবে")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      let finalImg = imageUrl
      if (imageFile) {
        setMsg("ছবি আপলোড হচ্ছে...")
        finalImg = await uploadImage(token, await shrink(imageFile))
      }

      const payload = {
        user_id: currentUser.id,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar_url || null,
        title: title.trim(),
        heading: heading.trim() || null,
        category: category || "ক্যাম্পাস সংবাদ",
        body: body.trim(),
        image_url: finalImg,
        link_url: linkUrl.trim() || null,
        status: targetStatus as DraftStatus,
      }

      if (editId) {
        await updateNewsroomDraft(token, editId, payload)
      } else {
        await createNewsroomDraft(token, payload)
      }

      resetWriterForm()
      await loadAll()
      setMsg(
        targetStatus === "submitted"
          ? "✅ লেখাটি সম্পাদকের পর্যালোচনার জন্য জমা দেওয়া হয়েছে!"
          : "✅ খসড়া (Draft) সংরক্ষণ করা হয়েছে"
      )
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  function openEditorReview(d: NewsroomDraft) {
    setReviewingId(d.id)
    setRevTitle(d.title)
    setRevHeading(d.heading || "")
    setRevCategory(d.category || categories[0] || "ক্যাম্পাস সংবাদ")
    setRevBody(d.body)
    setRevNote(d.editor_note || "")
  }

  async function handleRequestRevision(d: NewsroomDraft) {
    if (!revNote.trim()) {
      setMsg("❌ সংশোধনের কারণ বা মন্তব্য লিখে ফেরত পাঠান")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      await updateNewsroomDraft(token, d.id, {
        title: revTitle.trim() || d.title,
        heading: revHeading.trim() || null,
        category: revCategory || d.category,
        body: revBody.trim() || d.body,
        editor_note: revNote.trim(),
        status: "needs_revision",
      })
      setReviewingId(null)
      await loadAll()
      setMsg("✅ সংশোধনের নোটসহ লেখাটি লেখকের কাছে ফেরত পাঠানো হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "আপডেট করা যায়নি"))
    }
    setBusy(false)
  }

  async function handleApproveAndPublish(d: NewsroomDraft) {
    if (!confirm(`"${revTitle.trim() || d.title}" লেখাটি অনুমোদন করে মূল সাইটে প্রকাশ করতে চান?`)) {
      return
    }
    setBusy(true)
    setMsg("")
    try {
      const updatedDraft: NewsroomDraft = {
        ...d,
        title: reviewingId === d.id ? revTitle.trim() || d.title : d.title,
        heading: reviewingId === d.id ? revHeading.trim() || null : d.heading,
        category: reviewingId === d.id ? revCategory || d.category : d.category,
        body: reviewingId === d.id ? revBody.trim() || d.body : d.body,
        editor_note: reviewingId === d.id ? revNote.trim() || null : d.editor_note,
      }
      await updateNewsroomDraft(token, d.id, {
        title: updatedDraft.title,
        heading: updatedDraft.heading,
        category: updatedDraft.category,
        body: updatedDraft.body,
        editor_note: updatedDraft.editor_note,
      })
      await publishNewsroomDraftToPosts(token, updatedDraft)
      setReviewingId(null)
      await loadAll()
      await onPublished?.()
      setMsg("🚀 লেখাটি সফলভাবে অনুমোদিত ও ওয়েবসাইটে প্রকাশিত হয়েছে!")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "প্রকাশ করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  async function handleDeleteDraft(d: NewsroomDraft) {
    if (!confirm(`"${d.title}" খসড়াটি মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteNewsroomDraft(token, d.id)
      if (editId === d.id) resetWriterForm()
      await loadAll()
      setMsg("✅ লেখাটি মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছা যায়নি"))
    }
    setBusy(false)
  }

  const filteredEditorDrafts = useMemo(() => {
    if (editorFilter === "all") return editorDrafts
    return editorDrafts.filter((d) => d.status === editorFilter)
  }, [editorDrafts, editorFilter])

  const pendingReviewCount = editorDrafts.filter((d) => d.status === "submitted").length

  return (
    <div className="space-y-4">
      {/* টপ সুইচার (লেখকের ডেস্ক বনাম সম্পাদকের ডেস্ক) */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setView("my_drafts")}
          className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            view === "my_drafts"
              ? "bg-emerald-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileEdit className="size-4 shrink-0" />
          <span>আমার খসড়া ও লেখা ({myDrafts.length})</span>
        </button>

        {isEditor && (
          <button
            type="button"
            onClick={() => setView("editor_desk")}
            className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
              view === "editor_desk"
                ? "bg-cyan-700 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="size-4 shrink-0" />
            <span>সম্পাদকীয় রিভিউ ডেস্ক</span>
            {pendingReviewCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">
                {pendingReviewCount}
              </span>
            )}
          </button>
        )}
      </div>

      {missingTable && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
          <p className="font-bold">⚠️ Supabase-এ `newsroom_drafts` টেবিলটি এখনো তৈরি করা হয়নি।</p>
          <p>
            এই নিউজরুম ওয়ার্কফ্লো সক্রিয় করতে Supabase SQL Editor-এ ধাপ ৪-এ দেওয়া SQL স্ক্রিপ্টটি একবার রান করুন।
          </p>
        </div>
      )}

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {/* ==================== ১. আমার খসড়া ও লেখা ফর্ম ==================== */}
      {view === "my_drafts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {editId ? "✏️ খসড়া / লেখা সংশোধন করুন" : "📝 নতুন প্রতিবেদন বা খসড়া লিখুন"}
              </h2>
              {editId && (
                <button
                  type="button"
                  onClick={resetWriterForm}
                  className="text-xs text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="size-3.5" /> বাতিল
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500">
              আপনার লেখা প্রথমে <b>খসড়া</b> হিসেবে সেভ করতে পারেন অথবা সম্পূর্ণ হলে <b>সম্পাদনার জন্য জমা</b> দিতে পারেন। সম্পাদক রিভিউ করে মূল পোর্টালে প্রকাশ করবেন।
            </p>

            <input
              className={inp}
              placeholder="সংবাদ বা প্রতিবেদনের শিরোনাম *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className={inp}
              placeholder="উপশিরোনাম / হেডিং (ঐচ্ছিক)"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />

            <select
              className={inp}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <textarea
              className={inp}
              rows={6}
              placeholder="প্রতিবেদনের বিস্তারিত লেখা এখানে লিখুন *"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <input
              className={inp}
              placeholder="সূত্র বা সংযুক্ত লিংক (ঐচ্ছিক: https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />

            <div className="rounded-xl border p-2.5 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-emerald-700" />
                <span>কভার ছবি (ঐচ্ছিক):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="text-xs ml-1"
                />
              </label>
              {imgPreview && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgPreview} alt="" className="h-16 w-24 rounded-lg object-cover border bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImageUrl(null)
                    }}
                    className="text-xs text-rose-600 font-bold underline"
                  >
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => saveDraft("draft")}
                className="w-full rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50"
              >
                💾 খসড়া হিসেবে রাখুন (Draft)
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => saveDraft("submitted")}
                className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 font-bold text-xs sm:text-sm cursor-pointer shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="size-4" />
                <span>{busy ? "অপেক্ষা করুন..." : "সম্পাদনার জন্য জমা দিন"}</span>
              </button>
            </div>
          </div>

          {/* আমার লেখাসমূহের তালিকা */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm text-slate-800">
                আমার জমাকৃত ও খসড়া লেখাসমূহ ({myDrafts.length})
              </h3>
              <button
                type="button"
                onClick={loadAll}
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
              >
                <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            {myDrafts.map((d) => {
              const st = STATUS_UI[d.status] || STATUS_UI.draft
              const StIcon = st.Icon
              const canEdit = d.status === "draft" || d.status === "needs_revision"

              return (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${st.badgeCls}`}
                      >
                        <StIcon className="size-3" />
                        <span>{st.label}</span>
                      </span>
                      <p className="font-bold text-sm text-slate-900">{d.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {d.category} · {new Date(d.updated_at).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>

                  {d.editor_note && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-900">
                      <p className="font-bold text-[11px]">সম্পাদকের মন্তব্য:</p>
                      <p className="whitespace-pre-line">{d.editor_note}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 font-bold">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => startEditDraft(d)}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
                      >
                        <Edit3 className="size-3.5" /> এডিট ও পুনরায় জমা
                      </button>
                    )}

                    {d.status === "published" && d.published_post_id && (
                      <a
                        href={`/post/${d.published_post_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-700 hover:underline"
                      >
                        <ExternalLink className="size-3.5" /> প্রকাশিত সংবাদ দেখুন
                      </a>
                    )}

                    {d.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(d)}
                        className="ml-auto inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> মুছুন
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {!loading && myDrafts.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6 bg-white rounded-2xl border">
                আপনি এখনো কোনো খসড়া বা লেখা তৈরি করেননি।
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==================== ২. সম্পাদকীয় রিভিউ ডেস্ক (Admin / Moderator) ==================== */}
      {view === "editor_desk" && isEditor && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  📰 সম্পাদকীয় রিভিউ ও প্রকাশনা ডেস্ক
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  সদস্যদের জমাকৃত লেখা সম্পাদনা করুন, সংশোধনের জন্য ফেরত পাঠান অথবা সরাসরি মূল সাইটে প্রকাশ করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={loadAll}
                className="p-2 rounded-xl border bg-slate-50 hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              {(
                [
                  { k: "submitted", l: `পর্যালোচনাধীন (${editorDrafts.filter((x) => x.status === "submitted").length})` },
                  { k: "needs_revision", l: `সংশোধন ফেরত (${editorDrafts.filter((x) => x.status === "needs_revision").length})` },
                  { k: "published", l: `প্রকাশিত (${editorDrafts.filter((x) => x.status === "published").length})` },
                  { k: "all", l: `সব (${editorDrafts.length})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.k}
                  type="button"
                  onClick={() => setEditorFilter(f.k)}
                  className={`px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                    editorFilter === f.k
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {filteredEditorDrafts.map((d) => {
            const st = STATUS_UI[d.status] || STATUS_UI.submitted
            const StIcon = st.Icon
            const isReviewing = reviewingId === d.id

            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {d.author_avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.author_avatar} alt="" className="size-10 rounded-full object-cover border shrink-0" />
                    ) : (
                      <div className="size-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center shrink-0">
                        {d.author_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${st.badgeCls}`}>
                          <StIcon className="size-3" />
                          <span>{st.label}</span>
                        </span>
                        <span className="text-[11px] font-bold text-cyan-800">{d.category}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-900">{d.title}</p>
                      <p className="text-[11px] text-slate-500">
                        প্রতিবেদক: <b>{d.author_name}</b> · {new Date(d.updated_at).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>
                </div>

                {d.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image_url} alt="" className="max-h-48 w-full object-cover rounded-xl border" />
                )}

                {!isReviewing ? (
                  <div className="space-y-2">
                    <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border leading-relaxed">
                      {d.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-bold">
                      {d.status !== "published" && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditorReview(d)}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 cursor-pointer"
                          >
                            <Edit3 className="size-3.5" /> সম্পাদনা ও মন্তব্য
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleApproveAndPublish(d)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-3.5" /> সরাসরি প্রকাশ করুন
                          </button>
                        </>
                      )}

                      {d.status === "published" && d.published_post_id && (
                        <a
                          href={`/post/${d.published_post_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                        >
                          <ExternalLink className="size-3.5" /> প্রকাশিত সংবাদ দেখুন
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(d)}
                        className="ml-auto inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> মুছুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 rounded-2xl bg-slate-50 border border-cyan-300 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-900">✏️ সম্পাদকের সংশোধন ও রিভিউ প্যানেল</span>
                      <button
                        type="button"
                        onClick={() => setReviewingId(null)}
                        className="text-rose-600 font-bold"
                      >
                        বন্ধ
                      </button>
                    </div>

                    <input className={inp} value={revTitle} onChange={(e) => setRevTitle(e.target.value)} placeholder="শিরোনাম" />
                    <input className={inp} value={revHeading} onChange={(e) => setRevHeading(e.target.value)} placeholder="উপশিরোনাম" />
                    <select className={inp} value={revCategory} onChange={(e) => setRevCategory(e.target.value)}>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <textarea className={inp} rows={5} value={revBody} onChange={(e) => setRevBody(e.target.value)} />
                    <textarea
                      className={inp}
                      rows={2}
                      placeholder="লেখকের জন্য সম্পাদকের নোট / সংশোধনের নির্দেশনা..."
                      value={revNote}
                      onChange={(e) => setRevNote(e.target.value)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-bold">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRequestRevision(d)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2.5 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>সংশোধনের জন্য ফেরত পাঠান</span>
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleApproveAndPublish(d)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-4" />
                        <span>অনুমোদন ও প্রকাশ করুন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {!loading && filteredEditorDrafts.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-8 bg-white rounded-2xl border">
              এই বিভাগে কোনো লেখা জমা নেই।
            </p>
          )}
        </div>
      )}
    </div>
  )
}
