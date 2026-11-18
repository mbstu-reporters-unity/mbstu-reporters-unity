"use client"

import React, { useEffect, useState } from "react"
import {
  CalendarDays,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Users,
  Ticket,
  Award,
  RefreshCw,
  Search,
} from "lucide-react"
import {
  getCampusEvents,
  saveCampusEvents,
  getEventRegistrations,
  type CampusEvent,
  type EventRegistration,
} from "../../lib/events"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const btnPrimary =
  "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-sm transition"

export default function EventManager({ token }: { token: string }) {
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [venue, setVenue] = useState("কেন্দ্রীয় অডিটোরিয়াম, মাভাবিপ্রবি")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [organizer, setOrganizer] = useState("MBSTU Reporters Unity")
  const [capacity, setCapacity] = useState(150)
  const [isUpcoming, setIsUpcoming] = useState(true)

  const [searchReg, setSearchReg] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setLoading(true)
    const [evs, regs] = await Promise.all([
      getCampusEvents(),
      getEventRegistrations(),
    ])
    setEvents(evs)
    setRegistrations(regs)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setEditId(null)
    setTitle("")
    setSubtitle("")
    setDescription("")
    setVenue("কেন্দ্রীয় অডিটোরিয়াম, মাভাবিপ্রবি")
    setEventDate("")
    setEventTime("")
    setOrganizer("MBSTU Reporters Unity")
    setCapacity(150)
    setIsUpcoming(true)
  }

  function startEdit(ev: CampusEvent) {
    setEditId(ev.id)
    setTitle(ev.title)
    setSubtitle(ev.subtitle || "")
    setDescription(ev.description)
    setVenue(ev.venue)
    setEventDate(ev.event_date)
    setEventTime(ev.event_time || "")
    setOrganizer(ev.organizer)
    setCapacity(ev.capacity || 150)
    setIsUpcoming(ev.is_upcoming !== false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSaveEvent() {
    if (!title.trim() || !eventDate.trim() || !description.trim()) {
      setMsg("❌ ইভেন্টের শিরোনাম, তারিখ এবং বিবরণ লিখুন")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      const nextItem: CampusEvent = {
        id: editId || `ev-${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim(),
        venue: venue.trim() || "মাভাবিপ্রবি",
        event_date: eventDate.trim(),
        event_time: eventTime.trim() || null,
        organizer: organizer.trim() || "MBSTU Reporters Unity",
        capacity: Number(capacity) || 150,
        is_upcoming: isUpcoming,
        created_at: editId
          ? events.find((x) => x.id === editId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      }

      const nextList = editId
        ? events.map((x) => (x.id === editId ? nextItem : x))
        : [nextItem, ...events]

      await saveCampusEvents(token, nextList)
      setEvents(nextList)
      resetForm()
      setMsg("✅ ইভেন্ট সফলভাবে সংরক্ষণ ও লাইভ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function handleDeleteEvent(ev: CampusEvent) {
    if (!confirm(`"${ev.title}" ইভেন্টটি মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      const next = events.filter((x) => x.id !== ev.id)
      await saveCampusEvents(token, next)
      setEvents(next)
      if (editId === ev.id) resetForm()
      setMsg("✅ ইভেন্ট মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছে ফেলা যায়নি"))
    }
    setBusy(false)
  }

  const filteredRegistrations = registrations.filter((r) => {
    const q = searchReg.trim().toLowerCase()
    if (!q) return true
    return [r.full_name, r.department, r.student_id, r.phone, r.email, r.certificate_code]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      {/* ১. ইভেন্ট তৈরি ও এডিট ফর্ম */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <CalendarDays className="size-5 text-cyan-700" />
            <span>{editId ? "✏️ ইভেন্ট এডিট করুন" : "➕ নতুন ইভেন্ট / কর্মশালা তৈরি করুন"}</span>
          </h2>
          <div className="flex items-center gap-2">
            <a
              href="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-cyan-700 hover:underline inline-flex items-center gap-1"
            >
              <span>লাইভ ক্যালেন্ডার</span>
              <ExternalLink className="size-3" />
            </a>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <X className="size-3.5" /> বাতিল
              </button>
            )}
          </div>
        </div>

        <input
          className={inp}
          placeholder="ইভেন্টের শিরোনাম *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={inp}
          placeholder="উপশিরোনাম বা ট্যাগলাইন (ঐচ্ছিক)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <textarea
          className={inp}
          rows={3}
          placeholder="ইভেন্টের বিস্তারিত বিবরণ *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className={inp}
            placeholder="তারিখ (যেমন: ২৫ নভেম্বর ২০২৬) *"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <input
            className={inp}
            placeholder="সময় (যেমন: সকাল ১০:০০ টা)"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            className={inp}
            placeholder="স্থান / ভেন্যু"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />
          <input
            className={inp}
            placeholder="আয়োজক"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
          <input
            type="number"
            className={inp}
            placeholder="আসনসংখ্যা"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>

        <label className="flex items-center gap-2 p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-xs font-bold text-cyan-950 cursor-pointer">
          <input
            type="checkbox"
            checked={isUpcoming}
            onChange={(e) => setIsUpcoming(e.target.checked)}
            className="size-4 accent-cyan-600"
          />
          <span>এই ইভেন্টটি বর্তমানে আসন্ন (Upcoming) হিসেবে দেখান</span>
        </label>

        <button className={btnPrimary} onClick={handleSaveEvent} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "ইভেন্ট আপডেট করুন" : "➕ ইভেন্ট প্রকাশ করুন"}
        </button>

        {msg && (
          <p className="p-2 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold text-center">
            {msg}
          </p>
        )}
      </div>

      {/* ইভেন্ট তালিকা */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-800 px-1">
          বর্তমান ইভেন্টসমূহ ({events.length}টি)
        </h3>
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-[10px]">
                  {ev.event_date} ({ev.is_upcoming ? "আসন্ন" : "সম্পন্ন"})
                </span>
                <p className="font-bold text-sm text-slate-900">{ev.title}</p>
                <p className="text-[11px] text-slate-500">ভেন্যু: {ev.venue}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2 font-bold">
              <button
                type="button"
                onClick={() => startEdit(ev)}
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
              >
                <Edit3 className="size-3" /> এডিট
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(ev)}
                className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="size-3" /> মুছুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ২. রেজিস্ট্রেশন ও সার্টিফিকেট ইনবক্স */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <Ticket className="size-5 text-emerald-700" />
            <span>ইভেন্ট রেজিস্ট্রেশন ও সার্টিফিকেট ইনবক্স ({registrations.length}টি)</span>
          </h3>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600"
            placeholder="শিক্ষার্থীর নাম, আইডি, মোবাইল বা সার্টিফিকেট কোড দিয়ে খুঁজুন..."
            value={searchReg}
            onChange={(e) => setSearchReg(e.target.value)}
          />
        </div>

        <div className="space-y-2.5 pt-1">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-sm text-slate-900">{reg.full_name}</p>
                {reg.certificate_code && (
                  <span className="font-mono bg-cyan-100 text-cyan-900 border border-cyan-300 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                    <Award className="size-3 inline-block mr-1 text-cyan-700" />
                    {reg.certificate_code}
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                বিভাগ: <b>{reg.department}</b> ({reg.batch}) · আইডি: <span className="font-mono">{reg.student_id}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                মোবাইল: {reg.phone} · ইমেইল: {reg.email} · সময়: {new Date(reg.created_at).toLocaleDateString("bn-BD")}
              </p>
            </div>
          ))}

          {filteredRegistrations.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">কোনো রেজিস্ট্রেশন পাওয়া যায়নি।</p>
          )}
        </div>
      </div>
    </div>
  )
}
