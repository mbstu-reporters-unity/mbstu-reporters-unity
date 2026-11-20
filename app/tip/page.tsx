'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle2, Lock, EyeOff } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { HumanVerification, useHumanVerification } from '@/components/portal/human-verification'

export default function AnonymousTipPage() {
  const humanCheck = useHumanVerification()
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 3 || details.trim().length < 10) {
      setErrMsg('❌ বিষয় (কমপক্ষে ৩ অক্ষর) এবং বিস্তারিত বিবরণ (কমপক্ষে ১০ অক্ষর) লিখুন')
      return
    }
    if (!isAnonymous && name.trim().length < 2) {
      setErrMsg('❌ আপনার নাম লিখুন অথবা পরিচয় গোপন রাখার অপশনে টিক দিন')
      return
    }

    setBusy(true)
    setErrMsg('')

    const cleanContact = contact.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact)

    try {
      const res = await fetch('/api/contact-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'student_feedback',
          is_anonymous: isAnonymous,
          name: isAnonymous ? 'গোপন (Anonymous)' : name.trim(),
          email: !isAnonymous && isEmail ? cleanContact : '',
          phone: !isAnonymous && !isEmail ? cleanContact : '',
          subject: `[গোপন টিপস] ${title.trim()}`,
          message: `${details.trim()}\n\n[প্রাথমিক তথ্য যাচাইয়ের অনুরোধসহ গোপন টিপস ফর্ম থেকে প্রেরিত]`,
          ...humanCheck.payload,
        }),
      })

      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || 'তথ্যটি পাঠানো যায়নি')
      }

      setSubmitted(true)
      humanCheck.reset()
    } catch (err: any) {
      setErrMsg('❌ ' + (err?.message || 'তথ্য পাঠাতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।'))
    }
    setBusy(false)
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 space-y-6">
          <BackNavigation items={[{ label: 'গোপন সংবাদ ও টিপস' }]} />

          <div className="glass-card p-6 sm:p-10 space-y-6 text-white border border-white/20 rounded-3xl shadow-2xl">
            <div className="text-center space-y-2 border-b border-white/15 pb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow">
                <Lock className="size-3.5" />
                <span>Whistleblower & Anonymous Tips</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                গোপন সংবাদ ও তথ্য জানান
              </h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                ক্যাম্পাসের যেকোনো সমস্যা, অনিয়ম বা খবরের ক্লু সম্পূর্ণ নাম গোপন রেখে সরাসরি রিপোর্টার্স ইউনিটিতে পাঠান।
              </p>
            </div>

            {submitted ? (
              <div className="text-center space-y-4 py-8 animate-in fade-in">
                <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-9" />
                </div>
                <h2 className="text-lg font-bold text-emerald-300">
                  আপনার তথ্যটি সফলভাবে পৌঁছেছে!
                </h2>
                <p className="text-xs text-slate-300">
                  মাভাবিপ্রবি রিপোর্টার্স ইউনিটির অনুসন্ধানী সেল তথ্যটি গুরুত্বের সাথে যাচাই করে পরবর্তী পদক্ষেপ গ্রহণ করবে।
                </p>
                <Link
                  href="/"
                  className="inline-block mt-2 rounded-full bg-cyan-500 text-slate-950 px-6 py-2 text-xs font-bold"
                >
                  হোমপেজে ফিরুন
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errMsg && (
                  <p className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-xl font-bold text-center">
                    {errMsg}
                  </p>
                )}

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/15 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="size-4 accent-rose-600 rounded"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white flex items-center gap-1">
                      <EyeOff className="size-3.5 text-rose-400" />
                      <span>আমার পরিচয় সম্পূর্ণ গোপন রাখুন (Anonymous)</span>
                    </p>
                    <p className="text-[10px] text-slate-300">
                      আপনার নাম বা কোনো ব্যক্তিগত তথ্য প্রকাশ করা হবে না।
                    </p>
                  </div>
                </label>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">আপনার নাম *:</label>
                      <input
                        required
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                        placeholder="আপনার নাম"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">যোগাযোগ (মোবাইল / ইমেইল):</label>
                      <input
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                        placeholder="017... / email@..."
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-300 block mb-1">সংবাদের মূল বিষয় / শিরোনাম *</label>
                  <input
                    required
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="যেমন: ডাইনিংয়ের খাবারের মান অথবা নতুন নোটিশ সংক্রান্ত"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">বিস্তারিত বিবরণ ও ঘটনা *</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                    placeholder="কোথায়, কখন এবং কী ঘটেছে তা বিস্তারিত লিখুন..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>

                <HumanVerification
                  idPrefix="anonymous-tip"
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="size-4" />
                  <span>{busy ? 'তথ্য পাঠানো হচ্ছে...' : 'নিরাপদে তথ্য পাঠান'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
