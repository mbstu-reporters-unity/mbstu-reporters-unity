"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  UserPlus,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Star,
  XCircle,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Hash,
  Newspaper,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Save,
} from "lucide-react"
import {
  getMembershipApplications,
  updateMembershipApplicationStatus,
  deleteMembershipApplication,
  type MembershipApplication,
  type ApplicationStatus,
} from "../../lib/membership"
import { normalizeWhatsappNumber } from "../../lib/submissions"

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; badgeCls: string; Icon: typeof Clock }
> = {
  pending: {
    label: "অপেক্ষমান",
    badgeCls: "bg-amber-100 text-amber-800 border-amber-300",
    Icon: Clock,
  },
  shortlisted: {
    label: "শর্টলিস্টেড",
    badgeCls: "bg-cyan-100 text-cyan-800 border-cyan-300",
    Icon: Star,
  },
  approved: {
    label: "অনুমোদিত",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "বাতিল",
    badgeCls: "bg-rose-100 text-rose-800 border-rose-300",
    Icon: XCircle,
  },
}

export default function MembershipManager({ token }: { token: string }) {
  const [list, setList] = useState<MembershipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all")
  const [search, setSearch] = useState("")
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [copiedLink, setCopiedLink] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setLoading(true)
    const rows = await getMembershipApplications(token)
    setList(rows)
    const noteMap: Record<string, string> = {}
    rows.forEach((r) => {
      noteMap[r.id] = r.admin_note || ""
    })
    setNotes(noteMap)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const counts = useMemo(() => {
    return {
      all: list.length,
      pending: list.filter((x) => x.status === "pending").length,
      shortlisted: list.filter((x) => x.status === "shortlisted").length,
      approved: list.filter((x) => x.status === "approved").length,
      rejected: list.filter((x) => x.status === "rejected").length,
    }
  }, [list])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false
      if (!q) return true
      return [
        item.full_name,
        item.department,
        item.batch,
        item.student_id,
        item.phone,
        item.email,
        item.current_media,
        ...(Array.isArray(item.interests) ? item.interests : []),
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [list, filter, search])

  async function handleStatusChange(
    item: MembershipApplication,
    nextStatus: ApplicationStatus
  ) {
    setBusyId(item.id)
    setMsg("")
    try {
      const noteVal = (notes[item.id] ?? "").trim() || null
      await updateMembershipApplicationStatus(token, item.id, nextStatus, noteVal)
      setList((prev) =>
        prev.map((x) =>
          x.id === item.id ? { ...x, status: nextStatus, admin_note: noteVal } : x
        )
      )
      setMsg(
        `✅ ${item.full_name}-এর আবেদন "${STATUS_META[nextStatus].label}" হিসেবে আপডেট হয়েছে`
      )
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "আপডেট করা যায়নি"))
    }
    setBusyId(null)
  }

  async function handleSaveNote(item: MembershipApplication) {
    setBusyId(item.id)
    setMsg("")
    try {
      const noteVal = (notes[item.id] ?? "").trim() || null
      await updateMembershipApplicationStatus(token, item.id, item.status, noteVal)
      setList((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, admin_note: noteVal } : x))
      )
      setMsg(`✅ ${item.full_name}-এর নোট সংরক্ষণ হয়েছে`)
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "নোট সেভ করা যায়নি"))
    }
    setBusyId(null)
  }

  async function handleDelete(item: MembershipApplication) {
    if (!confirm(`"${item.full_name}"-এর সদস্যপদ আবেদন স্থায়ীভাবে মুছে ফেলতে চান?`)) return
    setBusyId(item.id)
    setMsg("")
    try {
      await deleteMembershipApplication(token, item.id)
      setList((prev) => prev.filter((x) => x.id !== item.id))
      setMsg(`✅ ${item.full_name}-এর আবেদন মুছে ফেলা হয়েছে`)
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছে ফেলা যায়নি"))
    }
    setBusyId(null)
  }

  function copyApplyUrl() {
    try {
      const url = `${window.location.origin}/apply`
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* হেডার ও টুলবার */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <UserPlus className="size-5 text-cyan-700" />
              <span>নতুন সদস্যপদ আবেদন ইনবক্স ({list.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              অনলাইন ফর্ম (/apply) থেকে জমা হওয়া শিক্ষার্থীদের আবেদন যাচাই, শর্টলিস্ট এবং অনুমোদন করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyApplyUrl}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>/apply লিংক</span>
                </>
              )}
            </button>

            <a
              href="/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-1.5 text-xs font-bold"
            >
              <span>ফর্ম দেখুন</span>
              <ExternalLink className="size-3" />
            </a>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* সার্চ ও স্ট্যাটাস ফিল্টার */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600"
            placeholder="নাম, বিভাগ, ব্যাচ, স্টুডেন্ট আইডি, ফোন বা আগ্রহের ক্ষেত্র দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {(
            [
              { k: "all", t: `সব (${counts.all})` },
              { k: "pending", t: `অপেক্ষমান (${counts.pending})` },
              { k: "shortlisted", t: `শর্টলিস্টেড (${counts.shortlisted})` },
              { k: "approved", t: `অনুমোদিত (${counts.approved})` },
              { k: "rejected", t: `বাতিল (${counts.rejected})` },
            ] as const
          ).map((f) => (
            <button
              key={f.k}
              type="button"
              onClick={() => setFilter(f.k)}
              className={`px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                filter === f.k
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.t}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
          আবেদনসমূহ লোড হচ্ছে...
        </div>
      )}

      {!loading &&
        filtered.map((item) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending
          const StIcon = meta.Icon
          const waNum = normalizeWhatsappNumber(item.phone)
          const waText = encodeURIComponent(
            `আসসালামু আলাইকুম ${item.full_name}, মাভাবিপ্রবি রিপোর্টার্স ইউনিটিতে আপনার সদস্যপদ আবেদনের প্রেক্ষিতে সাক্ষাৎকারের জন্য যোগাযোগ করছি।`
          )

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3 text-xs"
            >
              {/* উপরের অংশ: ছবি, নাম ও স্ট্যাটাস */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                  {item.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photo_url}
                      alt={item.full_name}
                      className="size-14 rounded-2xl object-cover border-2 border-cyan-500/40 shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="size-14 rounded-2xl bg-cyan-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                      {item.full_name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900">
                        {item.full_name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${meta.badgeCls}`}
                      >
                        <StIcon className="size-3" />
                        <span>{meta.label}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      আবেদনের তারিখ:{" "}
                      {new Date(item.created_at).toLocaleString("bn-BD", {
                        timeZone: "Asia/Dhaka",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                {waNum && (
                  <a
                    href={`https://wa.me/${waNum}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-bold shrink-0 shadow-xs"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* বিস্তারিত তথ্য গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-700">
                <p className="flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-indigo-600 shrink-0" />
                  <span>
                    বিভাগ: <b className="text-slate-900">{item.department}</b> ({item.batch})
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Hash className="size-3.5 text-slate-500 shrink-0" />
                  <span>
                    স্টুডেন্ট আইডি: <b className="font-mono text-slate-900">{item.student_id}</b>
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-emerald-700 shrink-0" />
                  <a href={`tel:${item.phone}`} className="font-bold text-slate-900 hover:underline">
                    {item.phone}
                  </a>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 text-cyan-700 shrink-0" />
                  <a href={`mailto:${item.email}`} className="font-semibold text-slate-900 hover:underline truncate">
                    {item.email}
                  </a>
                </p>
                {item.current_media && (
                  <p className="sm:col-span-2 flex items-center gap-1.5">
                    <Newspaper className="size-3.5 text-amber-700 shrink-0" />
                    <span>
                      বর্তমান মিডিয়া/অভিজ্ঞতা: <b className="text-slate-900">{item.current_media}</b>
                    </span>
                  </p>
                )}
              </div>

              {/* আগ্রহের ক্ষেত্র */}
              {Array.isArray(item.interests) && item.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.interests.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 px-2.5 py-0.5 text-[11px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* নমুনা লেখা */}
              <div className="rounded-xl bg-slate-50 border-l-4 border-cyan-600 p-3 space-y-1">
                <p className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                  <FileText className="size-3.5 text-cyan-700" />
                  <span>আগ্রহের কারণ ও নমুনা লেখা:</span>
                </p>
                <p className="whitespace-pre-line text-xs text-slate-800 leading-relaxed">
                  {item.sample_writing}
                </p>
              </div>

              {/* অ্যাডমিন নোট */}
              <div className="flex gap-2 items-center">
                <input
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                  placeholder="অ্যাডমিনের নোট লিখুন (যেমন: ভাইভা তারিখ, মন্তব্য)..."
                  value={notes[item.id] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleSaveNote(item)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 font-bold text-slate-700 cursor-pointer shrink-0"
                >
                  <Save className="size-3.5" />
                  <span>নোট সেভ</span>
                </button>
              </div>

              {/* অ্যাকশন বাটনসমূহ */}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 font-bold">
                <button
                  type="button"
                  disabled={busyId === item.id || item.status === "shortlisted"}
                  onClick={() => handleStatusChange(item, "shortlisted")}
                  className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white px-3 py-1.5 cursor-pointer"
                >
                  <Star className="size-3.5" />
                  <span>শর্টলিস্ট</span>
                </button>

                <button
                  type="button"
                  disabled={busyId === item.id || item.status === "approved"}
                  onClick={() => handleStatusChange(item, "approved")}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>অনুমোদন দিন</span>
                </button>

                <button
                  type="button"
                  disabled={busyId === item.id || item.status === "rejected"}
                  onClick={() => handleStatusChange(item, "rejected")}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 px-3 py-1.5 cursor-pointer"
                >
                  <XCircle className="size-3.5" />
                  <span>বাতিল</span>
                </button>

                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleDelete(item)}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>মুছুন</span>
                </button>
              </div>
            </div>
          )
        })}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">কোনো সদস্যপদ আবেদন পাওয়া যায়নি।</p>
          <p>
            নোট: ধাপ ১-এ দেওয়া Supabase SQL রান করা থাকলে `/apply` ফর্মের সব আবেদন এখানে সরাসরি জমা হবে।
          </p>
        </div>
      )}
    </div>
  )
}
