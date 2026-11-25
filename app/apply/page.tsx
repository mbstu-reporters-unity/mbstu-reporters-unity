'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  UserPlus,
  Upload,
  CheckCircle2,
  Sparkles,
  FileText,
  Scale,
  ArrowRight,
  Trash2,
  Send,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { HumanVerification, useHumanVerification } from '@/components/portal/human-verification'
import { INTEREST_AREAS } from '@/lib/membership'
import { useLang } from '@/lib/i18n'

const INTEREST_AREA_EN: Record<string, string> = {
  'সংবাদ প্রতিবেদন (Reporting)': 'News Reporting',
  'ফিচার ও কলাম (Feature Writing)': 'Feature and Column Writing',
  'ফটোগ্রাফি (Photography)': 'Photography',
  'ভিডিও ও মোবাইল জার্নালিজম (MoJo)': 'Video and Mobile Journalism',
  'ফ্যাক্ট-চেকিং (Fact-Checking)': 'Fact-checking',
  'গ্রাফিক্স ও ডিজাইন (Graphics)': 'Graphics and Design',
  'উপস্থাপনা ও পডকাস্ট (Anchoring)': 'Presentation and Podcasting',
}

async function compressAvatarToDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file)
  const maxDim = 360
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(bmp.width * scale))
  c.height = Math.max(1, Math.round(bmp.height * scale))
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  if (typeof bmp.close === 'function') bmp.close()
  return c.toDataURL('image/jpeg', 0.78)
}

const inp =
  'w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/45 focus:outline-none focus:border-cyan-400 transition'

export default function MembershipApplyPage() {
  const { pick } = useLang()
  const humanCheck = useHumanVerification()
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [batch, setBatch] = useState('')
  const [studentId, setStudentId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [currentMedia, setCurrentMedia] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [sampleWriting, setSampleWriting] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [pledgeAccepted, setPledgeAccepted] = useState(false)

  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function toggleInterest(area: string) {
    setInterests((prev) =>
      prev.includes(area) ? prev.filter((x) => x !== area) : [...prev, area]
    )
  }

  async function handlePickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrMsg(pick('❌ অনুগ্রহ করে একটি বৈধ ছবির ফাইল নির্বাচন করুন।', '❌ Please select a valid image file.'))
      return
    }
    try {
      const compact = await compressAvatarToDataUrl(file)
      setPhotoDataUrl(compact)
      setErrMsg('')
    } catch {
      setErrMsg(pick('❌ ছবিটি প্রক্রিয়াকরণ করা যায়নি। অনুগ্রহ করে অন্য ছবি নির্বাচন করুন।', '❌ The image could not be processed. Please select another image.'))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrMsg('')

    if (!pledgeAccepted) {
      setErrMsg(pick('❌ গঠনতন্ত্র ও আচরণবিধি মেনে চলার অঙ্গীকারে সম্মতি দিন।', '❌ Please confirm your commitment to the Constitution and Code of Conduct.'))
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/membership-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          department,
          batch,
          student_id: studentId,
          phone,
          email,
          current_media: currentMedia,
          interests,
          sample_writing: sampleWriting,
          photo_data_url: photoDataUrl || '',
          ...humanCheck.payload,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || pick('আবেদন জমা দেওয়া সম্ভব হয়নি।', 'The application could not be submitted.'))
      }
      setSubmitted(true)
      humanCheck.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setErrMsg('❌ ' + (err?.message || pick('একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'An error occurred. Please try again.')))
    }
    setBusy(false)
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: pick('পরিচিতি', 'About'), href: '/about' },
              { label: pick('সদস্যপদের আবেদন', 'Membership Application') },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <UserPlus className="size-3.5" />
              <span>{pick('সদস্যপদ আবেদন', 'Membership Application')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('অনলাইন সদস্যপদ আবেদন', 'Online Membership Application')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              {pick('ক্যাম্পাস সাংবাদিকতা, আলোকচিত্র, ভিডিও নির্মাণ অথবা তথ্য-যাচাইয়ে আগ্রহী মাভাবিপ্রবির নিয়মিত শিক্ষার্থীরা এই ফর্মের মাধ্যমে সদস্যপদের আবেদন করতে পারেন।', 'Current MBSTU students interested in campus journalism, photography, video production, or fact-checking may apply for membership using this form.')}
            </p>
          </div>

          {/* সফলতার বার্তা */}
          {submitted ? (
            <div className="glass-card p-6 sm:p-10 text-center text-white space-y-4 border-2 border-emerald-400/50">
              <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-9" />
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-300">
                {pick('আপনার আবেদন গ্রহণ করা হয়েছে।', 'Your application has been received.')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
                <>{pick('ধন্যবাদ, ', 'Thank you, ')}<b className="text-white">{fullName}</b>{pick('। মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ আপনার তথ্য ও নমুনা লেখা পর্যালোচনা করে ইমেইল অথবা ফোনে যোগাযোগ করবে।', '. The Executive Council of MBSTU Reporters’ Unity will review your information and writing sample and contact you by email or telephone.')}</>
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href="/constitution"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 text-xs font-bold text-white transition"
                >
                  <Scale className="size-3.5 text-cyan-300" />
                  <span>{pick('গঠনতন্ত্র ও আচরণবিধি পড়ুন', 'Read the Constitution and Code of Conduct')}</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 text-xs font-bold transition"
                >
                  <span>{pick('প্রচ্ছদে ফিরুন', 'Return to the homepage')}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-5 sm:p-8 space-y-5 text-white">
              {errMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-bold text-center">
                  {errMsg}
                </div>
              )}

              {/* ১. ছবি আপলোড */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 flex flex-col sm:flex-row items-center gap-4">
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoDataUrl}
                    alt={pick('আবেদনকারীর ছবি', 'Applicant photograph')}
                    className="size-20 rounded-2xl object-cover ring-2 ring-cyan-400 shrink-0 bg-slate-900"
                  />
                ) : (
                  <div className="size-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/50 text-xs text-center p-2 shrink-0">
                    {pick('পাসপোর্ট আকারের ছবি', 'Passport-size photograph')}
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs font-bold text-cyan-200">
                    {pick('সাম্প্রতিক ও স্পষ্ট ছবি যুক্ত করুন (ঐচ্ছিক):', 'Upload a recent, clear photograph (optional):')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 text-xs font-bold cursor-pointer shadow transition">
                      <Upload className="size-3.5" />
                      <span>{photoDataUrl ? pick('ছবি পরিবর্তন করুন', 'Change photograph') : pick('ছবি নির্বাচন করুন', 'Choose photograph')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePickPhoto}
                      />
                    </label>
                    {photoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoDataUrl(null)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 px-3 py-2 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>{pick('ছবি সরান', 'Remove photograph')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ২. ব্যক্তিগত ও একাডেমিক তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    {pick('পূর্ণ নাম (বাংলা অথবা ইংরেজি) *', 'Full name (Bangla or English) *')}
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder={pick('আপনার পূর্ণ নাম লিখুন', 'Enter your full name')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    {pick('বিভাগ *', 'Department *')}
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder={pick('উদাহরণ: সিএসই, সিপিএস, আইসিটি, ফার্মেসি', 'For example: CSE, CPS, ICT, Pharmacy')}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    {pick('ব্যাচ / শিক্ষাবর্ষ *', 'Batch / Academic year *')}
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder={pick('উদাহরণ: ২০তম ব্যাচ / ২০২৩–২৪', 'For example: 20th batch / 2023–24')}
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    {pick('শিক্ষার্থী আইডি / রোল নম্বর *', 'Student ID / roll number *')}
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder={pick('উদাহরণ: CE22015', 'For example: CE22015')}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    {pick('মোবাইল নম্বর (১১ অঙ্ক) *', 'Mobile number (11 digits) *')}
                  </label>
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
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    {pick('সক্রিয় ইমেইল ঠিকানা *', 'Active email address *')}
                  </label>
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

              <div>
                <label className="text-xs font-bold text-cyan-200 block mb-1">
                  {pick('বর্তমান গণমাধ্যমে কাজ অথবা পূর্ব অভিজ্ঞতা (ঐচ্ছিক)', 'Current media affiliation or previous experience (optional)')}
                </label>
                <input
                  className={inp}
                  placeholder={pick('কোনো পত্রিকা বা অনলাইন পোর্টালে প্রতিনিধি হলে তার নাম লিখুন। পূর্ব অভিজ্ঞতা না থাকলে ফাঁকা রাখুন।', 'If you represent a newspaper or online publication, provide its name. Otherwise, leave this field blank.')}
                  value={currentMedia}
                  onChange={(e) => setCurrentMedia(e.target.value)}
                />
              </div>

              {/* ৩. আগ্রহের ক্ষেত্র (Multi-Select) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-300" />
                  <span>{pick('আগ্রহের ক্ষেত্র বা দক্ষতা নির্বাচন করুন (একাধিক নির্বাচন করা যাবে) *', 'Select your areas of interest or skills (you may select more than one) *')}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_AREAS.map((area) => {
                    const active = interests.includes(area)
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleInterest(area)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${
                          active
                            ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow'
                            : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {pick(area.split(' (')[0], INTEREST_AREA_EN[area] || area)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ৪. নমুনা লেখা / কেন যুক্ত হতে চান */}
              <div>
                <label className="text-xs font-bold text-cyan-200 flex items-center gap-1.5 mb-1">
                  <FileText className="size-3.5 text-cyan-300" />
                  <span>{pick('রিপোর্টার্স ইউনিটিতে যুক্ত হওয়ার কারণ এবং নমুনা প্রতিবেদন বা লেখার লিংক *', 'Why you wish to join the Reporters’ Unity and a link to a writing sample *')}</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className={inp}
                  placeholder={pick('নিজের পরিচয়, সাংবাদিকতায় আগ্রহ এবং নমুনা লেখা বা প্রকাশিত প্রতিবেদনের লিংক লিখুন।', 'Describe yourself and your interest in journalism. Include a writing sample or a link to a published report.')}
                  value={sampleWriting}
                  onChange={(e) => setSampleWriting(e.target.value)}
                />
              </div>

              {/* ৫. আচরণবিধি অঙ্গীকার */}
              <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/15 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pledgeAccepted}
                  onChange={(e) => setPledgeAccepted(e.target.checked)}
                  className="size-4 mt-0.5 accent-cyan-400 shrink-0"
                />
                <span>
                  {pick('আমি ঘোষণা করছি যে, প্রদত্ত সব তথ্য সত্য এবং আমি ', 'I declare that all information provided is accurate and that I will abide by the ')}
                  <Link href="/constitution" target="_blank" className="text-cyan-300 underline font-bold">
                    {pick('মাভাবিপ্রবি রিপোর্টার্স ইউনিটির গঠনতন্ত্র ও সাংবাদিকতার আচরণবিধি', 'Constitution and Code of Conduct of MBSTU Reporters’ Unity')}
                  </Link>{' '}
                  {pick(' সম্পূর্ণরূপে মেনে চলতে অঙ্গীকারবদ্ধ।', '.')}
                </span>
              </label>

              <HumanVerification
                idPrefix="membership-application"
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
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3.5 font-bold text-sm shadow-xl transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="size-4" />
                <span>{busy ? pick('আবেদন জমা দেওয়া হচ্ছে…', 'Submitting application…') : pick('সদস্যপদের আবেদন জমা দিন', 'Submit membership application')}</span>
              </button>
            </form>
          )}

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
