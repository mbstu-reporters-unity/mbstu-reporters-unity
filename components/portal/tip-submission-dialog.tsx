'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Send,
  Lock,
  EyeOff,
  User,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { HumanVerification, useHumanVerification } from '@/components/portal/human-verification'
import { useLang } from '@/lib/i18n'

const TIP_BEATS = [
  'ক্যাম্পাস ও সুশাসন',
  'হল ও ছাত্রজীবন',
  'একাডেমিক ও পরীক্ষা',
  'গবেষণা ও উদ্ভাবন',
  'খেলাধুলা ও সংস্কৃতি',
  'ক্যাম্পাস সমস্যা বা অনিয়ম',
  'অন্যান্য',
]

const TIP_BEATS_EN: Record<string, string> = {
  'ক্যাম্পাস ও সুশাসন': 'Campus and governance',
  'হল ও ছাত্রজীবন': 'Halls and student life',
  'একাডেমিক ও পরীক্ষা': 'Academics and examinations',
  'গবেষণা ও উদ্ভাবন': 'Research and innovation',
  'খেলাধুলা ও সংস্কৃতি': 'Sports and culture',
  'ক্যাম্পাস সমস্যা বা অনিয়ম': 'Campus issues or irregularities',
  অন্যান্য: 'Other',
}

export function TipSubmissionDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { pick } = useLang()
  const humanCheck = useHumanVerification()
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [beat, setBeat] = useState(TIP_BEATS[0])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [dept, setDept] = useState('')
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [mounted, setMounted] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 3) {
      setErrMsg(pick('❌ বিষয় বা শিরোনামে অন্তত ৩টি অক্ষর থাকতে হবে।', '❌ The subject or headline must contain at least 3 characters.'))
      return
    }
    if (details.trim().length < 10) {
      setErrMsg(pick('❌ বিস্তারিত বিবরণে অন্তত ১০টি অক্ষর থাকতে হবে।', '❌ The description must contain at least 10 characters.'))
      return
    }
    if (!isAnonymous && name.trim().length < 2) {
      setErrMsg(pick('❌ আপনার নাম লিখুন অথবা পরিচয় গোপন রাখার বিকল্পটি নির্বাচন করুন।', '❌ Enter your name or select the option to remain anonymous.'))
      return
    }
    if (!humanCheck.answer.trim()) {
      setErrMsg(pick('❌ অনুগ্রহ করে যাচাইয়ের প্রশ্নটির উত্তর দিন।', '❌ Please answer the verification question.'))
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
          name: isAnonymous ? 'গোপন (Anonymous Tip)' : name.trim(),
          email: !isAnonymous && isEmail ? cleanContact : '',
          phone: !isAnonymous && !isEmail ? cleanContact : '',
          department_or_office: !isAnonymous ? dept.trim() : '',
          subject: `[টিপস: ${beat}] ${title.trim()}`,
          message: `${details.trim()}\n\n[ক্যাটাগরি: ${beat}]\n[টিপস ডায়ালগ থেকে সরাসরি প্রেরিত]`,
          ...humanCheck.payload,
        }),
      })

      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || pick('তথ্য জমা দেওয়া সম্ভব হয়নি।', 'The information could not be submitted.'))
      }

      setSubmitted(true)
      humanCheck.reset()
    } catch (err: any) {
      setErrMsg('❌ ' + (err?.message || pick('তথ্য জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।', 'An error occurred while submitting the information. Please try again later.')))
    }
    setBusy(false)
  }

  function handleReset() {
    setTitle('')
    setDetails('')
    setName('')
    setContact('')
    setDept('')
    setSubmitted(false)
    setErrMsg('')
    onClose()
  }

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tip-modal-title"
        className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-white/20 bg-slate-900/95 text-white shadow-2xl backdrop-blur-2xl overflow-hidden glass-card my-auto"
      >
        {/* হেডার */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Send className="size-4.5 text-amber-400" />
            </div>
            <div>
              <h2 id="tip-modal-title" className="font-serif text-base sm:text-lg font-bold leading-tight flex items-center gap-1.5">
                <span>{pick('সংবাদ-তথ্য পাঠান', 'Submit a News Tip')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Lock className="size-2.5" />
                  <span>{pick('গোপনীয়', 'Confidential')}</span>
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                {pick('ক্যাম্পাস-সম্পর্কিত সংবাদ বা তথ্য সম্পাদকীয় ডেস্কে পাঠান।', 'Send campus-related news or information to the editorial desk.')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={pick('বন্ধ করুন', 'Close')}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* কন্টেন্ট বা ফর্ম */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="size-9" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-emerald-300">
                  {pick('আপনার পাঠানো তথ্য গ্রহণ করা হয়েছে।', 'Your information has been received.')}
                </h3>
                <p className="text-xs text-slate-200 max-w-sm mx-auto leading-relaxed">
                  {pick(
                    'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সম্পাদকীয় ডেস্ক তথ্যটি যাচাই করে প্রয়োজনীয় অনুসন্ধান ও প্রতিবেদন তৈরির উদ্যোগ নেবে। দায়িত্বশীল সাংবাদিকতায় সহযোগিতার জন্য ধন্যবাদ।',
                    'The editorial desk of MBSTU Reporters’ Unity will assess the information and undertake any necessary verification and reporting. Thank you for supporting responsible journalism.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer mt-2"
              >
                <span>{pick('বন্ধ করুন', 'Close')}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* অ্যানোনিমাস টগল */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`flex size-8 items-center justify-center rounded-xl transition ${isAnonymous ? 'bg-rose-500/25 text-rose-300 border border-rose-400/30' : 'bg-white/10 text-white/60'}`}>
                    <EyeOff className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight text-white">
                      {pick('পরিচয় গোপন রাখুন', 'Remain anonymous')}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {isAnonymous
                        ? pick('আপনার পরিচয় প্রকাশ করা হবে না।', 'Your identity will not be disclosed.')
                        : pick('প্রয়োজনে প্রতিবেদক আপনার সঙ্গে যোগাযোগ করতে পারবেন।', 'A reporter may contact you if necessary.')}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* নাম ও যোগাযোগ (যদি পরিচয় গোপন না থাকে) */}
              {!isAnonymous && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        {pick('আপনার নাম *', 'Your Name *')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={pick('উদাহরণ: আরিফুল ইসলাম', 'For example: Ariful Islam')}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        {pick('বিভাগ / ব্যাচ', 'Department / Batch')}
                      </label>
                      <input
                        type="text"
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        placeholder={pick('উদাহরণ: সিএসই, ১৮তম ব্যাচ', 'For example: CSE, 18th batch')}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {pick('ফোন বা ইমেইল (যাচাইয়ের জন্য)', 'Phone or Email (for verification)')}
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={pick('উদাহরণ: 017XXXXXXXX অথবা user@example.com', 'For example: 017XXXXXXXX or user@example.com')}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* ক্যাটাগরি / ডেস্ক নির্বাচন */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  {pick('তথ্যের ধরন *', 'Information category *')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TIP_BEATS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBeat(b)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                        beat === b
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-xs'
                          : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {pick(b, TIP_BEATS_EN[b] || b)}
                    </button>
                  ))}
                </div>
              </div>

              {/* সংবাদের সংক্ষিপ্ত শিরোনাম */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {pick('বিষয় বা শিরোনাম *', 'Subject or headline *')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={pick('উদাহরণ: বঙ্গবন্ধু হলের পানির ফিল্টার-সংক্রান্ত সমস্যা', 'For example: A water-filter issue at Bangabandhu Hall')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              {/* বিস্তারিত বিবরণ */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {pick('বিস্তারিত তথ্য *', 'Detailed information *')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={pick(
                    'কী ঘটেছে, কখন ও কোথায় ঘটেছে এবং এ বিষয়ে কী প্রমাণ বা সূত্র রয়েছে—বিস্তারিত লিখুন।',
                    'Describe what happened, when and where it occurred, and any available evidence or sources.'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 leading-relaxed resize-none"
                />
              </div>

              {/* সহজ মানব যাচাই (Captcha) */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  {pick('স্বয়ংক্রিয় জমা প্রতিরোধে যাচাই *', 'Verification to prevent automated submissions *')}
                </label>
                <HumanVerification
                  idPrefix="tip-dialog"
                  challenge={humanCheck.challenge}
                  answer={humanCheck.answer}
                  onAnswerChange={humanCheck.setAnswer}
                  website={humanCheck.website}
                  onWebsiteChange={humanCheck.setWebsite}
                  onRefresh={humanCheck.refresh}
                  compact
                />
              </div>

              {/* ত্রুটি বার্তা */}
              {errMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errMsg}</span>
                </div>
              )}

              {/* সাবমিট বাটন */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <Send className="size-4" />
                  <span>{busy ? pick('জমা দেওয়া হচ্ছে…', 'Submitting…') : pick('তথ্য জমা দিন', 'Submit information')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
