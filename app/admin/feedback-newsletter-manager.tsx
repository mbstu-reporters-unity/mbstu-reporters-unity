"use client"

import React, { useEffect, useState } from "react"
import {
  Mail,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Building2,
  EyeOff,
  FileWarning,
  ShieldAlert,
} from "lucide-react"
import { SB_URL, SB_KEY } from "../../lib/sb"

type ContactFeedbackRow = {
  id: string
  kind: "contact" | "student_feedback" | "admin_feedback" | "correction"
  name: string | null
  email: string | null
  phone: string | null
  department_or_office: string | null
  subject: string
  message: string
  post_url: string | null
  is_anonymous: boolean
  status: "pending" | "reviewed" | "resolved"
  created_at: string
}

type SubscriberRow = {
  id: string
  email: string
  name: string | null
  created_at: string
}

const KIND_BADGE: Record<string, { label: string; cls: string }> = {
  contact: { label: "সাধারণ যোগাযোগ", cls: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  student_feedback: { label: "শিক্ষার্থীর অভিযোগ/মতামত", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  admin_feedback: { label: "প্রশাসনের মতামত", cls: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  correction: { label: "সংশোধন অনুরোধ", cls: "bg-rose-100 text-rose-800 border-rose-200" },
}

export default function FeedbackNewsletterManager({ token }: { token: string }) {
  const [subTab, setSubTab] = useState<"feedback" | "newsletter">("feedback")
  const [feedbacks, setFeedbacks] = useState<ContactFeedbackRow[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedAll, setCopiedAll] = useState(false)
  const [msg, setMsg] = useState("")

  async function loadAll() {
    setLoading(true)
    try {
      const [fbRes, nlRes] = await Promise.all([
        fetch(`${SB_URL}/rest/v1/contact_feedback?select=*&order=created_at.desc&limit=200`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch(`${SB_URL}/rest/v1/newsletter_subscribers?select=*&order=created_at.desc&limit=500`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ])
      if (fbRes.ok) setFeedbacks(await fbRes.json())
      if (nlRes.ok) setSubscribers(await nlRes.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function updateStatus(id: string, status: "pending" | "reviewed" | "resolved") {
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/contact_feedback?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            apikey: SB_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ status }),
        }
      )
      if (!res.ok) throw new Error()
      setFeedbacks((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
      setMsg("✅ স্ট্যাটাস আপডেট হয়েছে")
    } catch {
      setMsg("❌ আপডেট করা যায়নি")
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm("এই বার্তাটি মুছে ফেলতে চান?")) return
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/contact_feedback?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) throw new Error()
      setFeedbacks((prev) => prev.filter((x) => x.id !== id))
      setMsg("✅ বার্তা মুছে ফেলা হয়েছে")
    } catch {
      setMsg("❌ মুছতে সমস্যা হয়েছে")
    }
  }

  async function deleteSubscriber(id: string) {
    if (!confirm("এই সাবস্ক্রাইবারকে তালিকা থেকে সরাতে চান?")) return
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/newsletter_subscribers?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) throw new Error()
      setSubscribers((prev) => prev.filter((x) => x.id !== id))
      setMsg("✅ সাবস্ক্রাইবার সরানো হয়েছে")
    } catch {
      setMsg("❌ সরানো যায়নি")
    }
  }

  function copyAllEmails() {
    try {
      const all = subscribers.map((s) => s.email).join(", ")
      navigator.clipboard.writeText(all)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setSubTab("feedback")}
          className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "feedback"
              ? "bg-cyan-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="size-4" />
          <span>যোগাযোগ ও অভিযোগ ({feedbacks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("newsletter")}
          className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "newsletter"
              ? "bg-emerald-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Mail className="size-4" />
          <span>নিউজলেটার সাবস্ক্রাইবার ({subscribers.length})</span>
        </button>

        <button
          type="button"
          onClick={loadAll}
          disabled={loading}
          className="px-3 rounded-xl border bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
          title="রিফ্রেশ"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {msg && (
        <p className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </p>
      )}

      {subTab === "feedback" && (
        <div className="space-y-3">
          {feedbacks.map((item) => {
            const kb = KIND_BADGE[item.kind] || KIND_BADGE.contact
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${kb.cls}`}>
                      {kb.label}
                    </span>
                    {item.is_anonymous && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-bold">
                        <EyeOff className="size-3" /> গোপন পরিচয়
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "resolved"
                        ? "✓ সমাধানকৃত"
                        : item.status === "reviewed"
                          ? "পর্যালোচিত"
                          : "নতুন"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleString("bn-BD", {
                      timeZone: "Asia/Dhaka",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="font-bold text-sm text-slate-900">{item.subject}</p>
                <p className="whitespace-pre-line text-slate-700 bg-slate-50 p-3 rounded-xl border leading-relaxed">
                  {item.message}
                </p>

                <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
                  {item.name && (
                    <span>
                      প্রেরক: <b className="text-slate-900">{item.name}</b>
                    </span>
                  )}
                  {item.department_or_office && (
                    <span>
                      বিভাগ/দপ্তর: <b>{item.department_or_office}</b>
                    </span>
                  )}
                  {item.phone && <span>মোবাইল: <b>{item.phone}</b></span>}
                  {item.email && <span>ইমেইল: <b>{item.email}</b></span>}
                  {item.post_url && (
                    <a
                      href={item.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-700 font-bold underline"
                    >
                      সংশ্লিষ্ট পোস্ট
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 font-bold">
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "reviewed")}
                    className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 px-2.5 py-1 cursor-pointer"
                  >
                    পর্যালোচিত
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "resolved")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3" /> সমাধান হয়েছে
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFeedback(item.id)}
                    className="ml-auto inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> মুছুন
                  </button>
                </div>
              </div>
            )
          })}

          {!loading && feedbacks.length === 0 && (
            <p className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
              এখনো কোনো বার্তা বা অভিযোগ জমা হয়নি।
            </p>
          )}
        </div>
      )}

      {subTab === "newsletter" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
            <h3 className="font-bold text-sm text-slate-900">
              সাবস্ক্রাইবার তালিকা ({subscribers.length} জন)
            </h3>
            {subscribers.length > 0 && (
              <button
                type="button"
                onClick={copyAllEmails}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                {copiedAll ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedAll ? "সব ইমেইল কপি হয়েছে" : "সব ইমেইল কপি করুন"}</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {subscribers.map((s, idx) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border bg-slate-50 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {idx + 1}. {s.email}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    যুক্ত হয়েছেন: {new Date(s.created_at).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSubscriber(s.id)}
                  className="text-rose-600 hover:underline font-bold shrink-0 cursor-pointer"
                >
                  মুছুন
                </button>
              </div>
            ))}

            {!loading && subscribers.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-6">
                এখনো কোনো নিউজলেটার সাবস্ক্রাইবার নেই।
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
