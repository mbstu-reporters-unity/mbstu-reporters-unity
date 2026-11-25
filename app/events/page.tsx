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
import { useLang } from '@/lib/i18n'

const inp =
  'w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/45 focus:outline-none focus:border-cyan-400 transition'

export default function EventsCalendarPage() {
  const { pick } = useLang()
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
      setErrMsg('❌ ' + (e?.message || pick('নিবন্ধন সম্পন্ন হয়নি।', 'Registration could not be completed.')))
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
              { label: pick('প্রচ্ছদ', 'Home'), href: '/' },
              { label: pick('অনুষ্ঠানসূচি', 'Events Calendar') },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <CalendarDays className="size-3.5" />
              <span>{pick('অনুষ্ঠান ও কর্মশালা', 'Events and Workshops')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('আসন্ন অনুষ্ঠান ও কর্মশালা', 'Upcoming Events and Workshops')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {pick('মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সেমিনার, কর্মশালা, বার্ষিক সাধারণ সভা ও প্রতিযোগিতার তালিকা দেখুন এবং অনলাইনে নিবন্ধন করুন।', 'View seminars, workshops, annual general meetings, and competitions organised by MBSTU Reporters’ Unity, and register online.')}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Award className="size-4" />
                <span>{pick('অংশগ্রহণ সনদ যাচাই করুন', 'Verify a Participation Certificate')}</span>
              </button>
            </div>
          </div>

          {/* ইভেন্ট তালিকা */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              {pick('অনুষ্ঠানের তথ্য লোড হচ্ছে…', 'Loading event information…')}
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
                        {ev.is_upcoming ? pick('আসন্ন অনুষ্ঠান', 'Upcoming event') : pick('অনুষ্ঠান সম্পন্ন', 'Past event')}
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
                        <span>{pick('স্থান:', 'Venue:')} {ev.venue}</span>
                      </p>
                      {ev.event_time && (
                        <p className="flex items-center gap-2">
                          <Clock className="size-3.5 text-cyan-400 shrink-0" />
                          <span>{pick('সময়:', 'Time:')} {ev.event_time}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{pick('আয়োজক:', 'Organiser:')} {ev.organizer}</span>

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
                      <span>{pick('অনলাইনে নিবন্ধন', 'Register online')}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <CalendarDays className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">{pick('বর্তমানে কোনো আসন্ন অনুষ্ঠান নেই।', 'There are no upcoming events at this time.')}</p>
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
                  <p className="font-bold text-xs sm:text-sm">{pick('তথ্য-উপকরণ', 'Resources')}</p>
                  <p className="text-[10px] text-slate-300">{pick('নির্দেশিকা ও নমুনা', 'Guides and templates')}</p>
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
                  <p className="font-bold text-xs sm:text-sm">{pick('সদস্যপদের আবেদন', 'Membership Application')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সদস্য হওয়ার আবেদন করুন', 'Apply to become a member')}</p>
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
                  <p className="font-bold text-xs sm:text-sm">{pick('সদস্য তালিকা', 'Member Directory')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সাংবাদিক সদস্যদের তালিকা', 'Journalist members')}</p>
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
                <span className="text-[10px] font-bold text-cyan-300 uppercase">{pick('অনলাইন নিবন্ধন', 'Online Registration')}</span>
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
                  {pick('নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।', 'Registration completed successfully.')}
                </h4>
                <p className="text-xs text-slate-200">
                  {pick('আপনার সনদ যাচাইকরণ কোড:', 'Your certificate verification code:')} <b className="font-mono text-cyan-300 text-sm">{certCode}</b>
                </p>
                <p className="text-[11px] text-slate-400">
                  {pick('অনুষ্ঠানে উপস্থিতির সময় এই কোডটি দেখালে আপনার ডিজিটাল সনদ নিশ্চিত করা হবে।', 'Present this code at the event to confirm your digital certificate.')}
                </p>
                {certificateVerificationUrl && (
                  <div className="mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-white p-3 text-left text-slate-900">
                    <QrCodeImage
                      value={certificateVerificationUrl}
                      alt={pick('অনুষ্ঠানের সনদ যাচাইয়ের কিউআর কোড', 'QR code for event certificate verification')}
                      className="size-24 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{pick('সনদ যাচাই', 'Certificate verification')}</p>
                      <p className="text-[10px] leading-snug text-slate-600">
                        {pick('কিউআর কোড স্ক্যান করে নিবন্ধন যাচাই করুন।', 'Scan the QR code to verify the registration.')}
                      </p>
                      <Link
                        href={`/verify-certificate/${encodeURIComponent(certCode)}`}
                        className="mt-1 inline-block break-all text-[10px] font-semibold text-blue-700 underline"
                      >
                        {pick('যাচাইকরণ পৃষ্ঠা খুলুন', 'Open verification page')}
                      </Link>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-full bg-cyan-500 text-slate-950 px-6 py-2 text-xs font-bold cursor-pointer"
                >
                  {pick('বন্ধ করুন', 'Close')}
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
                  <label className="font-bold text-cyan-200 block mb-1">{pick('পূর্ণ নাম *', 'Full name *')}</label>
                  <input
                    required
                    className={inp}
                    placeholder={pick('আপনার পূর্ণ নাম লিখুন', 'Enter your full name')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">{pick('বিভাগ *', 'Department *')}</label>
                    <input
                      required
                      className={inp}
                      placeholder={pick('উদাহরণ: সিএসই', 'For example: CSE')}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">{pick('ব্যাচ / শিক্ষাবর্ষ *', 'Batch / Academic year *')}</label>
                    <input
                      required
                      className={inp}
                      placeholder={pick('উদাহরণ: ১৮তম ব্যাচ', 'For example: 18th batch')}
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-cyan-200 block mb-1">{pick('শিক্ষার্থী আইডি / রোল *', 'Student ID / roll *')}</label>
                  <input
                    required
                    className={inp}
                    placeholder={pick('শিক্ষার্থী আইডি লিখুন', 'Enter your student ID')}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">{pick('মোবাইল নম্বর *', 'Mobile number *')}</label>
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
                    <label className="font-bold text-cyan-200 block mb-1">{pick('ইমেইল ঠিকানা *', 'Email address *')}</label>
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
                  {busy ? pick('নিবন্ধন করা হচ্ছে…', 'Registering…') : pick('নিবন্ধন নিশ্চিত করুন', 'Confirm registration')}
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
                <span>{pick('অংশগ্রহণ সনদ যাচাই', 'Participation Certificate Verification')}</span>
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
                {pick('অনুষ্ঠানের সনদ বা নিবন্ধন কোডটি (উদাহরণ: CERT-EV-1-XXXX) নিচে লিখে যাচাই করুন:', 'Enter the event certificate or registration code (for example, CERT-EV-1-XXXX) below to verify it:')}
              </p>
              <div className="flex gap-2">
                <input
                  className={inp}
                  placeholder={pick('সনদ কোড লিখুন', 'Enter the certificate code')}
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
                  {pick('যাচাই করুন', 'Verify')}
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
                      <p className="font-bold text-sm">{pick('✓ সনদটি বৈধ ও যাচাইকৃত।', '✓ The certificate is valid and verified.')}</p>
                      <p className="text-white font-semibold">{pick('নাম:', 'Name:')} {verifyResult.full_name}</p>
                      <p className="text-[11px]">{pick('বিভাগ:', 'Department:')} {verifyResult.department} ({verifyResult.batch})</p>
                    </>
                  ) : (
                    <p className="font-bold">{pick('❌ এই কোডের বিপরীতে কোনো বৈধ সনদ পাওয়া যায়নি।', '❌ No valid certificate was found for this code.')}</p>
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
