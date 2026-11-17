"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  GraduationCap,
  Hash,
  Inbox,
  Mail,
  MessageCircle,
  Newspaper,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react"
import {
  deleteAdminSubmission,
  getAdminSubmissions,
  getSubmissionSettings,
  saveSubmissionSettings,
  type SubmissionType,
  type UserSubmission,
} from "../../lib/submissions"

const inp =
  "w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"

const SENDER_LABELS: Record<string, string> = {
  student: "শিক্ষার্থী",
  teacher: "শিক্ষক",
  staff: "কর্মকর্তা",
  reporter: "সাংবাদিক",
}

const SUB_META: Record<
  SubmissionType,
  { label: string; badgeCls: string; icon: typeof Bell }
> = {
  notice: {
    label: "নোটিশ",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Bell,
  },
  news: {
    label: "সংবাদ",
    badgeCls: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: Newspaper,
  },
  info: {
    label: "যেকোনো তথ্য",
    badgeCls: "bg-amber-100 text-amber-800 border-amber-200",
    icon: FileWarning,
  },
}

export default function SubmissionsInbox({ token }: { token: string }) {
  const [receiverEmail, setReceiverEmail] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [cfgBusy, setCfgBusy] = useState(false)
  const [cfgMsg, setCfgMsg] = useState("")

  const [list, setList] = useState<UserSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | SubmissionType>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  async function loadAll() {
    setLoading(true)
    try {
      const [cfg, rows] = await Promise.all([
        getSubmissionSettings(),
        getAdminSubmissions(token),
      ])
      setReceiverEmail(cfg.receiverEmail || "")
      setWhatsappNumber(cfg.whatsappNumber || "")
      setList(Array.isArray(rows) ? rows : [])
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "তথ্য লোড করা যায়নি"))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleSaveSettings() {
    if (receiverEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail.trim())) {
      setCfgMsg("❌ অনুগ্রহ করে সঠিক ইমেইল ঠিকানা লিখুন")
      return
    }
    setCfgBusy(true)
    setCfgMsg("")
    try {
      await saveSubmissionSettings(token, {
        receiverEmail,
        whatsappNumber,
      })
      setCfgMsg("✅ কাস্টম ইমেইল ও হোয়াটসঅ্যাপ নম্বর সফলভাবে সেভ হয়েছে!")
    } catch (e) {
      setCfgMsg("❌ " + (e instanceof Error ? e.message : "সেভ করা যায়নি"))
    }
    setCfgBusy(false)
  }

  async function handleDelete(item: UserSubmission) {
    if (
      !confirm(
        `"${item.sender_name}"-এর পাঠানো তথ্য এবং এর সাথে থাকা সব ছবি/ভিডিও ফাইল স্থায়ীভাবে মুছে ফেলতে চান?`
      )
    ) {
      return
    }
    setDeletingId(item.id)
    setMsg("")
    try {
      await deleteAdminSubmission(token, item)
      setList((prev) => prev.filter((x) => x.id !== item.id))
      setMsg("✅ তথ্য ও সংযুক্ত ফাইলসমূহ ডাটাবেজ এবং স্টোরেজ থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "মুছে ফেলা যায়নি"))
    }
    setDeletingId(null)
  }

  const counts = useMemo(() => {
    return {
      all: list.length,
      notice: list.filter((x) => x.submission_type === "notice").length,
      news: list.filter((x) => x.submission_type === "news").length,
      info: list.filter((x) => x.submission_type === "info").length,
    }
  }, [list])

  const filtered = useMemo(() => {
    if (filter === "all") return list
    return list.filter((x) => x.submission_type === filter)
  }, [list, filter])

  return (
    <div className="space-y-4">
      {/* ১. কাস্টম ইমেইল ও হোয়াটসঅ্যাপ সেটিং বক্স */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Mail className="size-5 text-cyan-700" />
            <span>কাস্টম রিসিভার ইমেইল ও হোয়াটসঅ্যাপ সেটিং</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            শিক্ষার্থী বা শিক্ষকরা নোটিশ, সংবাদ ও তথ্য পাঠালে লেখা ও ছবি নিচের ইমেইলে যাবে এবং ভিডিওগুলো নিচের হোয়াটসঅ্যাপ নম্বরে আসবে।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Mail className="size-3.5 text-cyan-700" />
              <span>যে ইমেইলে তথ্য/সংবাদ/নোটিশ আসবে:</span>
            </label>
            <input
              type="email"
              className={inp}
              placeholder="যেমন: example@gmail.com"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <MessageCircle className="size-3.5 text-emerald-700" />
              <span>যে হোয়াটসঅ্যাপ নম্বরে ভিডিও আসবে:</span>
            </label>
            <input
              type="tel"
              className={inp}
              placeholder="যেমন: 017XXXXXXXX"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={cfgBusy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          <Save className="size-4" />
          <span>{cfgBusy ? "সেভ হচ্ছে..." : "ইমেইল ও হোয়াটসঅ্যাপ সেটিং সেভ করুন"}</span>
        </button>

        {cfgMsg && (
          <p className="text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 rounded-xl p-2.5">
            {cfgMsg}
          </p>
        )}
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {/* ২. প্রাপ্ত তথ্য, সংবাদ ও নোটিশ তালিকা */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Inbox className="size-5 text-emerald-700" />
              <span>প্রাপ্ত নোটিশ, সংবাদ ও তথ্য ({filtered.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ইমেইলে পাওয়ার পর ডাটাবেজ ও স্টোরেজের জায়গা বাঁচাতে এখান থেকে যেকোনো বক্স ডিলিট করতে পারবেন।
            </p>
          </div>

          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {(
            [
              { k: "all", t: `সব (${counts.all})` },
              { k: "notice", t: `নোটিশ (${counts.notice})` },
              { k: "news", t: `সংবাদ (${counts.news})` },
              { k: "info", t: `তথ্য (${counts.info})` },
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

      {loading && (
        <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
          তালিকা লোড হচ্ছে...
        </div>
      )}

      {!loading &&
        filtered.map((item) => {
          const meta = SUB_META[item.submission_type] || SUB_META.info
          const TypeIcon = meta.icon
          const mediaList = Array.isArray(item.media_urls) ? item.media_urls : []

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3 text-xs"
            >
              {/* টপ ব্যাজ ও ডিলিট বাটন */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-bold ${meta.badgeCls}`}
                  >
                    <TypeIcon className="size-3" />
                    <span>{meta.label}</span>
                  </span>

                  {item.email_sent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      <CheckCircle2 className="size-3" /> ইমেইল পাঠানো হয়েছে
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold"
                      title={item.email_error || ""}
                    >
                      <AlertTriangle className="size-3" /> ইমেইল যায়নি
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500">
                    {new Date(item.created_at).toLocaleString("bn-BD", {
                      timeZone: "Asia/Dhaka",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item)}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 font-bold cursor-pointer transition disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                  <span>{deletingId === item.id ? "মুছছে..." : "ডিলিট করুন"}</span>
                </button>
              </div>

              {/* প্রেরকের পরিচয় বক্স */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-700">
                <p className="flex items-center gap-1.5">
                  <User className="size-3.5 text-cyan-700 shrink-0" />
                  <span>
                    প্রেরক: <b className="text-slate-900">{item.sender_name}</b> (
                    {SENDER_LABELS[item.sender_type] || "সদস্য"})
                  </span>
                </p>

                {item.sender_phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-emerald-700 shrink-0" />
                    <a href={`tel:${item.sender_phone}`} className="font-bold text-slate-900 hover:underline">
                      {item.sender_phone}
                    </a>
                  </p>
                )}

                {item.sender_email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-cyan-700 shrink-0" />
                    <a href={`mailto:${item.sender_email}`} className="font-semibold text-slate-900 hover:underline truncate">
                      {item.sender_email}
                    </a>
                  </p>
                )}

                {item.sender_dept && (
                  <p className="flex items-center gap-1.5">
                    <GraduationCap className="size-3.5 text-indigo-600 shrink-0" />
                    <span>
                      বিভাগ: <b>{item.sender_dept}</b>
                      {item.sender_batch ? ` (${item.sender_batch})` : ""}
                    </span>
                  </p>
                )}

                {item.sender_student_id && (
                  <p className="flex items-center gap-1.5">
                    <Hash className="size-3.5 text-slate-500 shrink-0" />
                    <span>আইডি: <b className="font-mono">{item.sender_student_id}</b></span>
                  </p>
                )}

                {item.sender_designation && (
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-amber-700 shrink-0" />
                    <span>পদবি: <b>{item.sender_designation}</b></span>
                  </p>
                )}

                {item.sender_office_section && (
                  <p className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-slate-600 shrink-0" />
                    <span>দপ্তর: <b>{item.sender_office_section}</b></span>
                  </p>
                )}
              </div>

              {/* প্রেরিত লেখা */}
              <div className="space-y-1.5">
                {item.title && (
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                )}
                {item.subtitle && (
                  <p className="font-semibold text-xs text-slate-700">{item.subtitle}</p>
                )}
                {item.details && (
                  <p className="whitespace-pre-line text-xs text-slate-800 bg-slate-50 border-l-4 border-cyan-600 p-2.5 rounded-r-xl leading-relaxed">
                    {item.details}
                  </p>
                )}

                {item.truth_pledge && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 space-y-0.5">
                    <p className="font-bold text-[11px] text-emerald-900 flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-emerald-700" />
                      <span>তথ্যের সত্যতা ও দায়িত্ব / অঙ্গীকারনামা:</span>
                    </p>
                    <p className="whitespace-pre-line text-xs text-emerald-950">
                      {item.truth_pledge}
                    </p>
                  </div>
                )}

                {!item.email_sent && item.email_error && (
                  <p className="text-[11px] text-rose-600 font-semibold">
                    ইমেইল এরর: {item.email_error}
                  </p>
                )}
              </div>

              {/* সংযুক্ত ছবি ও ভিডিও */}
              {mediaList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="font-bold text-[11px] text-slate-600">
                    সংযুক্ত মিডিয়া ({mediaList.length}টি):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {mediaList.map((m, idx) =>
                      m.type === "video" ? (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-black overflow-hidden space-y-1"
                        >
                          <video
                            src={m.url}
                            controls
                            playsInline
                            className="w-full max-h-52 object-contain"
                          />
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 bg-slate-900 text-cyan-300 py-1.5 text-[11px] font-bold hover:underline"
                          >
                            <ExternalLink className="size-3" />
                            <span>ভিডিও #{idx + 1} ডাউনলোড/দেখুন</span>
                          </a>
                        </div>
                      ) : (
                        <a
                          key={idx}
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:opacity-90"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.url}
                            alt=""
                            className="w-full max-h-52 object-cover"
                          />
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          এখনো কোনো নোটিশ, সংবাদ বা তথ্য পাঠানো হয়নি।
        </div>
      )}
    </div>
  )
}
