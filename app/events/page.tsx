'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  Award,
  Printer,
  Ticket,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { QrCodeImage } from '@/components/portal/qr-code-image'
import { HumanVerification, useHumanVerification } from '@/components/portal/human-verification'
import { getCampusEvents, registerForEvent, type CampusEvent } from '@/lib/events'

const inp =
  'w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/45 focus:outline-none focus:border-cyan-400 transition'

export default function EventsCalendarPage() {
  const humanCheck = useHumanVerification()
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [loading, setLoading] = useState(true)

  // রেজিস্ট্রেশন মোডাল স্টেট
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [batch, setBatch] = useState('')
  const [studentId, setStudentId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [certCode, setCertCode] = useState<string | null>(null)

  // সার্টিফিকেট ভেরিফিকেশন পপআপ স্টেট
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [inputCertCode, setInputCertCode] = useState('')
  const [verifyResult, setVerifyResult] = useState<any | null>(null)

  useEffect(() => {
    getCampusEvents().then((rows) => {
      setEvents(rows)
      setLoading(false)
    })
  }, [])

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvent) return
    setErrMsg('')
    setBusy(true)

    try {
      const res = await registerForEvent({
        event_id: selectedEvent.id,
        full_name: fullName,
        department,
        batch,
        student_id: studentId,
        phone,
        email,
        ...humanCheck.payload,
      })
      setCertCode(res.code)
      humanCheck.reset()
    } catch (e: any) {
      setErrMsg('❌ ' + (e?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে'))
    }
    setBusy(false)
  }

  const certificateVerificationUrl =
    certCode && typeof window !== 'undefined'
      ? `${window.location.origin}/verify-certificate/${encodeURIComponent(certCode)}`
      : ''

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: 'হোম', href: '/' },
              { label: 'ইভেন্ট ক্যালেন্ডার' },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <CalendarDays className="size-3.5" />
              <span>Events & Workshops • ইভেন্ট ক্যালেন্ডার</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              আসন্ন ইভেন্ট ও কর্মশালা
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              মাভাবিপ্রবি রিপোর্টার্স ইউনিটির আয়োজিত সেমিনার, কর্মশালা, বার্ষিক সাধারণ সভা ও প্রতিযোগিতাসমূহের তালিকা এবং অনলাইন রেজিস্ট্রেশন।
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Award className="size-4" />
                <span>অংশগ্রহণ সার্টিফিকেট ভেরিফাই করুন</span>
              </button>
            </div>
          </div>

          {/* ইভেন্ট তালিকা */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              ইভেন্ট লোড হচ্ছে...
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => (
                <article
                  key={ev.id}
                  className="glass-card p-6 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 px-3 py-0.5 text-xs font-bold">
                        <Sparkles className="size-3" />
                        {ev.is_upcoming ? 'আসন্ন ইভেন্ট' : 'সম্পন্ন ইভেন্ট'}
                      </span>
                      <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                        <CalendarDays className="size-3.5" /> {ev.event_date}
                      </span>
                    </div>

                    <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                      {ev.title}
                    </h2>
                    {ev.subtitle && (
                      <p className="text-xs font-semibold text-cyan-200">{ev.subtitle}</p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-white/10">
                      <p className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-cyan-400 shrink-0" />
                        <span>স্থান: {ev.venue}</span>
                      </p>
                      {ev.event_time && (
                        <p className="flex items-center gap-2">
                          <Clock className="size-3.5 text-cyan-400 shrink-0" />
                          <span>সময়: {ev.event_time}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">আয়োজক: {ev.organizer}</span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(ev)
                        setCertCode(null)
                        setErrMsg('')
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 font-bold shadow transition cursor-pointer active:scale-95"
                    >
                      <Ticket className="size-3.5" />
                      <span>অনলাইন রেজিস্ট্রেশন</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <CalendarDays className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">বর্তমানে কোনো আসন্ন ইভেন্ট নেই।</p>
            </div>
          )}

          {/* দ্রুত লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/resources"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <CalendarDays className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">রিসোর্স সেন্টার</p>
                  <p className="text-[10px] text-slate-300">গাইড ও টেমপ্লেট</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/apply"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Users className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">সদস্যপদ আবেদন</p>
                  <p className="text-[10px] text-slate-300">ইউনিটিতে যুক্ত হোন</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/members"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Award className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">সদস্য ডিরেক্টরি</p>
                  <p className="text-[10px] text-slate-300">সকল সাংবাদিক সদস্য</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />

      {/* রেজিস্ট্রেশন মোডাল */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-slate-900 text-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-300 uppercase">অনলাইন রেজিস্ট্রেশন</span>
                <h3 className="font-serif text-base font-bold text-white truncate max-w-sm">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {certCode ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in">
                <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-9" />
                </div>
                <h4 className="font-serif text-lg font-bold text-emerald-300">
                  রেজিস্ট্রেশন সফল হয়েছে!
                </h4>
                <p className="text-xs text-slate-200">
                  আপনার সার্টিফিকেট ভেরিফিকেশন কোড: <b className="font-mono text-cyan-300 text-sm">{certCode}</b>
                </p>
                <p className="text-[11px] text-slate-400">
                  অনুষ্ঠানে উপস্থিত থাকার সময় এই কোডটি প্রদর্শন করলে আপনার ডিজিটাল সার্টিফিকেট নিশ্চিত করা হবে।
                </p>
                {certificateVerificationUrl && (
                  <div className="mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-white p-3 text-left text-slate-900">
                    <QrCodeImage
                      value={certificateVerificationUrl}
                      alt="ইভেন্ট সার্টিফিকেট যাচাইয়ের QR কোড"
                      className="size-24 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">সার্টিফিকেট যাচাই</p>
                      <p className="text-[10px] leading-snug text-slate-600">
                        QR স্ক্যান করে রেজিস্ট্রেশন যাচাই করুন।
                      </p>
                      <Link
                        href={`/verify-certificate/${encodeURIComponent(certCode)}`}
                        className="mt-1 inline-block break-all text-[10px] font-semibold text-blue-700 underline"
                      >
                        যাচাই পেজ খুলুন
                      </Link>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-full bg-cyan-500 text-slate-950 px-6 py-2 text-xs font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                {errMsg && (
                  <p className="p-2.5 rounded-xl bg-rose-500/25 border border-rose-400 text-rose-200 font-bold text-center">
                    {errMsg}
                  </p>
                )}

                <div>
                  <label className="font-bold text-cyan-200 block mb-1">পূর্ণ নাম *</label>
                  <input
                    required
                    className={inp}
                    placeholder="আপনার পূর্ণ নাম"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">বিভাগ *</label>
                    <input
                      required
                      className={inp}
                      placeholder="যেমন: CSE"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">ব্যাচ / সেশন *</label>
                    <input
                      required
                      className={inp}
                      placeholder="যেমন: ১৮তম ব্যাচ"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-cyan-200 block mb-1">স্টুডেন্ট আইডি / রোল *</label>
                  <input
                    required
                    className={inp}
                    placeholder="স্টুডেন্ট আইডি"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">মোবাইল নম্বর *</label>
                    <input
                      required
                      type="tel"
                      className={inp}
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">ইমেইল *</label>
                    <input
                      required
                      type="email"
                      className={inp}
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <HumanVerification
                  idPrefix="event-registration"
                  challenge={humanCheck.challenge}
                  answer={humanCheck.answer}
                  onAnswerChange={humanCheck.setAnswer}
                  website={humanCheck.website}
                  onWebsiteChange={humanCheck.setWebsite}
                  onRefresh={humanCheck.refresh}
                  compact
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-3 shadow transition cursor-pointer disabled:opacity-50 mt-2"
                >
                  {busy ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্ট্রেশন নিশ্চিত করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* সার্টিফিকেট ভেরিফিকেশন মোডাল */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-slate-900 text-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h3 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                <Award className="size-5" />
                <span>অংশগ্রহণ সার্টিফিকেট ভেরিফিকেশন</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setVerifyModalOpen(false)
                  setVerifyResult(null)
                  setInputCertCode('')
                }}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                ইভেন্টের সার্টিফিকেট বা রেজিস্ট্রেশন কোডটি (যেমন: CERT-EV-1-XXXX) নিচে লিখে ভেরিফাই করুন:
              </p>
              <div className="flex gap-2">
                <input
                  className={inp}
                  placeholder="সার্টিফিকেট কোড লিখুন..."
                  value={inputCertCode}
                  onChange={(e) => setInputCertCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const code = inputCertCode.trim()
                    if (!code) return
                    try {
                      const res = await fetch('/api/verify-certificate?code=' + encodeURIComponent(code))
                      const j = await res.json().catch(() => ({}))
                      setVerifyResult(j)
                    } catch {
                      setVerifyResult({ valid: false })
                    }
                  }}
                  className="rounded-xl bg-cyan-500 text-slate-950 px-4 font-bold cursor-pointer"
                >
                  যাচাই
                </button>
              </div>

              {verifyResult && (
                <div
                  className={`p-3 rounded-2xl border text-center space-y-1 ${
                    verifyResult.valid
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-rose-500/20 border-rose-400 text-rose-200'
                  }`}
                >
                  {verifyResult.valid ? (
                    <>
                      <p className="font-bold text-sm">✓ সার্টিফিকেটটি বৈধ ও যাচাইকৃত!</p>
                      <p className="text-white font-semibold">নাম: {verifyResult.full_name}</p>
                      <p className="text-[11px]">বিভাগ: {verifyResult.department} ({verifyResult.batch})</p>
                    </>
                  ) : (
                    <p className="font-bold">❌ এই কোডের কোনো বৈধ সার্টিফিকেট পাওয়া যায়নি।</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
