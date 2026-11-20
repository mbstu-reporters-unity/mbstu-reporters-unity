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
      setErrMsg('❌ অনুগ্রহ করে একটি সঠিক ছবির ফাইল বাছাই করুন')
      return
    }
    try {
      const compact = await compressAvatarToDataUrl(file)
      setPhotoDataUrl(compact)
      setErrMsg('')
    } catch {
      setErrMsg('❌ ছবিটি প্রসেস করা যায়নি, অন্য ছবি চেষ্টা করুন')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrMsg('')

    if (!pledgeAccepted) {
      setErrMsg('❌ অনুগ্রহ করে গঠনতন্ত্র ও আচরণবিধি মেনে চলার অঙ্গীকার বক্সে টিক দিন')
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
        throw new Error(j.error || 'আবেদন জমা দেওয়া যায়নি')
      }
      setSubmitted(true)
      humanCheck.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setErrMsg('❌ ' + (err?.message || 'কিছু ভুল হয়েছে, পুনরায় চেষ্টা করুন'))
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
              { label: 'পরিচিতি', href: '/about' },
              { label: 'সদস্যপদ আবেদন' },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <UserPlus className="size-3.5" />
              <span>Join MBSTURU • সদস্য সংগ্রহ</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              অনলাইন সদস্যপদ আবেদন ফর্ম
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              ক্যাম্পাস সাংবাদিকতা, ফটোগ্রাফি, ভিডিও নির্মাণ বা ফ্যাক্ট-চেকিংয়ে আগ্রহী মাভাবিপ্রবির নিয়মিত শিক্ষার্থীরা নিচের ফর্ম পূরণ করে সদস্যপদের জন্য আবেদন করতে পারবেন।
            </p>
          </div>

          {/* সফলতার বার্তা */}
          {submitted ? (
            <div className="glass-card p-6 sm:p-10 text-center text-white space-y-4 border-2 border-emerald-400/50">
              <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-9" />
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-300">
                আপনার আবেদন সফলভাবে গৃহীত হয়েছে!
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
                ধন্যবাদ, <b className="text-white">{fullName}</b>! মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ আপনার তথ্য ও নমুনা লেখা পর্যালোচনা করে শীঘ্রই ইমেইল বা ফোনে যোগাযোগ করবে।
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href="/constitution"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 text-xs font-bold text-white transition"
                >
                  <Scale className="size-3.5 text-cyan-300" />
                  <span>গঠনতন্ত্র ও আচরণবিধি পড়ুন</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 text-xs font-bold transition"
                >
                  <span>হোমপেজে ফিরুন</span>
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
                    alt="Applicant"
                    className="size-20 rounded-2xl object-cover ring-2 ring-cyan-400 shrink-0 bg-slate-900"
                  />
                ) : (
                  <div className="size-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/50 text-xs text-center p-2 shrink-0">
                    পাসপোর্ট ছবি
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs font-bold text-cyan-200">
                    আপনার সাম্প্রতিক পরিষ্কার ছবি যুক্ত করুন (ঐচ্ছিক):
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 text-xs font-bold cursor-pointer shadow transition">
                      <Upload className="size-3.5" />
                      <span>{photoDataUrl ? 'ছবি পরিবর্তন' : 'ছবি বাছাই করুন'}</span>
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
                        <span>সরান</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ২. ব্যক্তিগত ও একাডেমিক তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    পূর্ণ নাম (বাংলা বা ইংরেজি) *
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder="আপনার পূর্ণ নাম"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    বিভাগ (Department) *
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder="যেমন: CSE, CPS, ICT, Pharmacy"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    ব্যাচ / শিক্ষাবর্ষ *
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder="যেমন: ২০তম ব্যাচ / 2023-24"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    স্টুডেন্ট আইডি / রোল নম্বর *
                  </label>
                  <input
                    required
                    className={inp}
                    placeholder="যেমন: CE22015"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-200 block mb-1">
                    মোবাইল নম্বর (১১ ডিজিট) *
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
                    সক্রিয় ইমেইল *
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
                  বর্তমান গণমাধ্যম বা পূর্বের অভিজ্ঞতা (যদি থাকে — ঐচ্ছিক)
                </label>
                <input
                  className={inp}
                  placeholder="কোনো পত্রিকা/অনলাইন পোর্টালের প্রতিনিধি থাকলে নাম লিখুন (নবীন হলে ফাঁকা রাখুন)"
                  value={currentMedia}
                  onChange={(e) => setCurrentMedia(e.target.value)}
                />
              </div>

              {/* ৩. আগ্রহের ক্ষেত্র (Multi-Select) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-300" />
                  <span>আগ্রহের ক্ষেত্র / দক্ষতা নির্বাচন করুন (একাধিক বাছা যাবে) *</span>
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
                        {area}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ৪. নমুনা লেখা / কেন যুক্ত হতে চান */}
              <div>
                <label className="text-xs font-bold text-cyan-200 flex items-center gap-1.5 mb-1">
                  <FileText className="size-3.5 text-cyan-300" />
                  <span>কেন রিপোর্টার্স ইউনিটিতে যুক্ত হতে চান এবং নমুনা প্রতিবেদন/লেখার লিংক *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className={inp}
                  placeholder="আপনার সম্পর্কে, সাংবাদিকতার আগ্রহ এবং কোনো নমুনা লেখা বা প্রকাশিত লিংক থাকলে এখানে লিখুন..."
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
                  আমি ঘোষণা করছি যে, প্রদত্ত সকল তথ্য সত্য এবং আমি{' '}
                  <Link href="/constitution" target="_blank" className="text-cyan-300 underline font-bold">
                    মাভাবিপ্রবি রিপোর্টার্স ইউনিটির গঠনতন্ত্র ও সাংবাদিকতার আচরণবিধি
                  </Link>{' '}
                  সম্পূর্ণরূপে মেনে চলতে অঙ্গীকারবদ্ধ।
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
                <span>{busy ? 'আবেদন জমা হচ্ছে...' : 'সদস্যপদের আবেদন জমা দিন'}</span>
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
