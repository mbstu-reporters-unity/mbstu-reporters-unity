'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Building2,
  EyeOff,
  FileWarning,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { HumanVerification, useHumanVerification } from '@/components/portal/human-verification'
import { NewsletterBox } from '@/components/portal/newsletter-box'
import { useSiteSettings } from '@/components/portal/site-settings-context'
import { useLang } from '@/lib/i18n'

type FormKind = 'contact' | 'student_feedback' | 'admin_feedback' | 'correction'

type TabCopy = {
  labelBn: string
  labelEn: string
  titleBn: string
  titleEn: string
  subtitleBn: string
  subtitleEn: string
  icon: typeof MessageSquare
}

const inp =
  'w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/45 focus:outline-none focus:border-cyan-400 transition'

const TAB_INFO: Record<
  FormKind,
  TabCopy
> = {
  contact: {
    labelBn: 'সাধারণ যোগাযোগ',
    labelEn: 'General Enquiries',
    titleBn: 'যোগাযোগ ফর্ম',
    titleEn: 'Contact Form',
    subtitleBn: 'প্রশ্ন, সাক্ষাৎকারের আমন্ত্রণ অথবা মতামত জানাতে বার্তা পাঠান।',
    subtitleEn: 'Send a message with an enquiry, interview invitation, or feedback.',
    icon: Mail,
  },
  student_feedback: {
    labelBn: 'শিক্ষার্থীদের অভিযোগ ও মতামত',
    labelEn: 'Student Feedback',
    titleBn: 'শিক্ষার্থীদের অভিযোগ ও মতামত',
    titleEn: 'Student Feedback Form',
    subtitleBn: 'আবাসন, পরিবহন, খাবার বা ক্যাম্পাসের অন্যান্য সমস্যা জানান। চাইলে পরিচয় গোপন রাখতে পারেন।',
    subtitleEn: 'Report concerns about accommodation, transport, dining, or other campus matters. You may remain anonymous.',
    icon: ShieldAlert,
  },
  admin_feedback: {
    labelBn: 'প্রশাসনের বক্তব্য ও সংবাদ বিজ্ঞপ্তি',
    labelEn: 'University Statements',
    titleBn: 'বিশ্ববিদ্যালয় প্রশাসনের বক্তব্য ও বার্তা',
    titleEn: 'University Administration Statements',
    subtitleBn: 'বিশ্ববিদ্যালয় কর্তৃপক্ষ বা দপ্তরের আনুষ্ঠানিক বক্তব্য, প্রতিবাদলিপি অথবা মতামত পাঠান।',
    subtitleEn: 'Submit an official statement, response, or opinion from the university administration or an office.',
    icon: Building2,
  },
  correction: {
    labelBn: 'সংবাদ সংশোধনের অনুরোধ',
    labelEn: 'Correction Requests',
    titleBn: 'সংবাদ সংশোধনের অনুরোধ',
    titleEn: 'Request a Correction',
    subtitleBn: 'প্রকাশিত সংবাদে তথ্যগত ভুল থাকলে নির্ভরযোগ্য সূত্রসহ সংশোধনের অনুরোধ জানান।',
    subtitleEn: 'If you identify a factual error in a published report, request a correction and provide supporting sources.',
    icon: FileWarning,
  },
}

export default function ContactAndFeedbackPage() {
  const { pick } = useLang()
  const humanCheck = useHumanVerification()
  const settings = useSiteSettings()
  const f = settings.footer

  const [kind, setKind] = useState<FormKind>('contact')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deptOrOffice, setDeptOrOffice] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [postUrl, setPostUrl] = useState('')

  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [sent, setSent] = useState(false)

  function switchTab(next: FormKind) {
    setKind(next)
    setErrMsg('')
    setSent(false)
    if (next !== 'student_feedback') {
      setIsAnonymous(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrMsg('')
    setBusy(true)

    try {
      const res = await fetch('/api/contact-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          is_anonymous: kind === 'student_feedback' ? isAnonymous : false,
          name,
          email,
          phone,
          department_or_office: deptOrOffice,
          subject,
          message,
          post_url: kind === 'correction' ? postUrl : '',
          ...humanCheck.payload,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || pick('বার্তা জমা দেওয়া সম্ভব হয়নি।', 'The message could not be submitted.'))
      }
      setSent(true)
      setName('')
      setEmail('')
      setPhone('')
      setDeptOrOffice('')
      setSubject('')
      setMessage('')
      setPostUrl('')
      humanCheck.reset()
    } catch (err: any) {
      setErrMsg('❌ ' + (err?.message || pick('বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'The message could not be sent. Please try again.')))
    }
    setBusy(false)
  }

  const activeMeta = TAB_INFO[kind]
  const ActiveIcon = activeMeta.icon

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation items={[{ label: pick('যোগাযোগ ও অভিযোগ বিভাগ', 'Contact and Feedback')}]} />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <MessageSquare className="size-3.5" />
              <span>{pick('যোগাযোগ ও অভিযোগ', 'Contact and Feedback')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('যোগাযোগ ও ক্যাম্পাস মানচিত্র', 'Contact and Campus Map')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {pick('মাভাবিপ্রবি রিপোর্টার্স ইউনিটির ঠিকানা ও অবস্থান দেখুন এবং শিক্ষার্থী ও প্রশাসনের বার্তা, অভিযোগ বা সংশোধনী পাঠান।', 'Find the MBSTU Reporters’ Unity office and location, or submit a message, concern, or correction request.')}
            </p>
          </div>

          {/* ১. যোগাযোগ কার্ড + ক্যাম্পাস ম্যাপ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 glass-card p-5 sm:p-6 space-y-4 text-white">
              <h2 className="font-serif text-lg font-bold border-b border-white/15 pb-2">
                {pick('প্রাতিষ্ঠানিক যোগাযোগের তথ্য', 'Official Contact Information')}
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="font-bold text-white text-xs">{pick('কার্যালয়ের ঠিকানা', 'Office address')}</p>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{pick(f.addressBn, f.addressEn)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="font-bold text-white text-xs">{pick('ফোন / হটলাইন', 'Telephone / Hotline')}</p>
                    <a
                      href={`tel:${f.phone.replace(/[^+\d]/g, '')}`}
                      className="text-cyan-300 hover:underline font-semibold mt-0.5 block"
                    >
                      {f.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="font-bold text-white text-xs">{pick('ইমেইল', 'Email')}</p>
                    <a
                      href={`mailto:${f.email}`}
                      className="text-cyan-300 hover:underline font-semibold break-all mt-0.5 block"
                    >
                      {f.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <NewsletterBox />
              </div>
            </div>

            <div className="lg:col-span-3 glass-card overflow-hidden p-3 sm:p-4 flex flex-col space-y-2.5 text-white">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-serif text-base sm:text-lg font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-cyan-400" />
                  <span>{pick('ক্যাম্পাসের মানচিত্র (সন্তোষ, টাঙ্গাইল)', 'Campus Map (Santosh, Tangail)')}</span>
                </h2>
                <a
                  href="https://maps.google.com/?q=Mawlana+Bhashani+Science+and+Technology+University"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-cyan-300 hover:underline"
                >
                  {pick('Google Maps-এ দেখুন →', 'View on Google Maps →')}
                </a>
              </div>
              <div className="flex-1 min-h-[260px] sm:min-h-[320px] rounded-2xl overflow-hidden border border-white/15 bg-slate-900">
                <iframe
                  title={pick('মাভাবিপ্রবি ক্যাম্পাসের মানচিত্র', 'MBSTU Campus Map')}
                  src="https://maps.google.com/maps?q=Mawlana+Bhashani+Science+and+Technology+University,+Santosh,+Tangail&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[260px] sm:min-h-[320px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* ২. যোগাযোগ, অভিযোগ ও মতামত ফর্ম */}
          <section className="glass-card p-5 sm:p-8 space-y-5 text-white">
            {/* ৪টি ট্যাব */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(Object.keys(TAB_INFO) as FormKind[]).map((k) => {
                const TIcon = TAB_INFO[k].icon
                const active = kind === k
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => switchTab(k)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold cursor-pointer transition ${
                      active
                        ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow-md'
                        : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                    }`}
                  >
                    <TIcon className="size-3.5" />
                    <span>{pick(TAB_INFO[k].labelBn, TAB_INFO[k].labelEn)}</span>
                  </button>
                )
              })}
            </div>

            <div className="border-b border-white/15 pb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                <ActiveIcon className="size-5 text-cyan-400" />
                <span>{pick(activeMeta.titleBn, activeMeta.titleEn)}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{pick(activeMeta.subtitleBn, activeMeta.subtitleEn)}</p>
            </div>

            {sent ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <div className="size-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-300">
                  {pick('আপনার বার্তা গ্রহণ করা হয়েছে।', 'Your message has been received.')}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {pick('মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সংশ্লিষ্ট দল বার্তাটি পর্যালোচনা করে প্রয়োজনীয় পদক্ষেপ নেবে।', 'The relevant team at MBSTU Reporters’ Unity will review your message and take any necessary action.')}
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="rounded-full bg-cyan-500 text-slate-950 px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  {pick('আরেকটি বার্তা পাঠান', 'Send another message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errMsg && (
                  <p className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 font-bold text-center">
                    {errMsg}
                  </p>
                )}

                {kind === 'student_feedback' && (
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/15 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="size-4 accent-cyan-400"
                    />
                    <div>
                      <p className="font-bold text-sm text-white flex items-center gap-1.5">
                        <EyeOff className="size-3.5 text-cyan-300" />
                        <span>{pick('আমার পরিচয় গোপন রাখুন', 'Submit anonymously')}</span>
                      </p>
                      <p className="text-[10px] text-slate-300">
                        {pick('নাম ও ব্যক্তিগত যোগাযোগের তথ্য ছাড়াই অভিযোগ বা মতামত পাঠান।', 'Submit a concern or feedback without providing your name or contact details.')}
                      </p>
                    </div>
                  </label>
                )}

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-cyan-200 block mb-1">
                        {kind === 'admin_feedback' ? pick('কর্মকর্তা / দপ্তরের নাম *', 'Officer / office name *') : pick('আপনার পূর্ণ নাম *', 'Your full name *')}
                      </label>
                      <input
                        required
                        className={inp}
                        placeholder={pick('পূর্ণ নাম লিখুন', 'Enter your full name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-cyan-200 block mb-1">
                        {pick('ইমেইল', 'Email')} {kind === 'contact' ? '*' : pick('(ঐচ্ছিক)', '(optional)')}
                      </label>
                      <input
                        type="email"
                        className={inp}
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-cyan-200 block mb-1">
                        {pick('মোবাইল নম্বর (ঐচ্ছিক)', 'Mobile number (optional)')}
                      </label>
                      <input
                        type="tel"
                        className={inp}
                        placeholder="017XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">
                      {kind === 'admin_feedback'
                        ? pick('দপ্তর / অনুষদের নাম', 'Office / faculty')
                        : pick('বিভাগ / ব্যাচ / হল (ঐচ্ছিক)', 'Department / batch / hall (optional)')}
                    </label>
                    <input
                      className={inp}
                      placeholder={
                        kind === 'admin_feedback'
                          ? pick('উদাহরণ: রেজিস্ট্রার অফিস / প্রক্টর অফিস', 'For example: Registrar’s Office / Proctor’s Office')
                          : pick('উদাহরণ: সিএসই, ১৮তম ব্যাচ / শহীদ জিয়া হল', 'For example: CSE, 18th batch / Shaheed Zia Hall')
                      }
                      value={deptOrOffice}
                      onChange={(e) => setDeptOrOffice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">{pick('বিষয় *', 'Subject *')}</label>
                    <input
                      required
                      className={inp}
                      placeholder={pick('বিষয়টি সংক্ষেপে লিখুন', 'Enter a brief subject')}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                {kind === 'correction' && (
                  <div>
                    <label className="font-bold text-cyan-200 block mb-1">
                      {pick('যে সংবাদে সংশোধন প্রয়োজন, তার লিংক (ঐচ্ছিক)', 'Link to the report requiring correction (optional)')}
                    </label>
                    <input
                      className={inp}
                      placeholder="https://mbsturu.vercel.app/post/..."
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-cyan-200 block mb-1">{pick('বিস্তারিত বার্তা *', 'Message *')}</label>
                  <textarea
                    required
                    rows={5}
                    className={inp}
                    placeholder={pick('আপনার অভিযোগ, মতামত বা বার্তার বিস্তারিত লিখুন', 'Provide details of your concern, feedback, or message')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <HumanVerification
                  idPrefix="contact-feedback"
                  challenge={humanCheck.challenge}
                  answer={humanCheck.answer}
                  onAnswerChange={humanCheck.setAnswer}
                  website={humanCheck.website}
                  onWebsiteChange={humanCheck.setWebsite}
                  onRefresh={humanCheck.refresh}
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-7 py-3 font-bold text-sm shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="size-4" />
                  <span>{busy ? pick('পাঠানো হচ্ছে…', 'Sending…') : pick('বার্তা পাঠান', 'Send message')}</span>
                </button>
              </form>
            )}
          </section>

          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
