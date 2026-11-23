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
      setErrMsg(pick('❌ সংবাদের বিষয় কমপক্ষে ৩ অক্ষরের হতে হবে', '❌ Title must be at least 3 characters'))
      return
    }
    if (details.trim().length < 10) {
      setErrMsg(pick('❌ বিস্তারিত বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে', '❌ Details must be at least 10 characters'))
      return
    }
    if (!isAnonymous && name.trim().length < 2) {
      setErrMsg(pick('❌ আপনার নাম লিখুন অথবা গোপন রাখুন অপশন চালু রাখুন', '❌ Please enter your name or keep anonymous'))
      return
    }
    if (!humanCheck.answer.trim()) {
      setErrMsg(pick('❌ অনুগ্রহ করে মানব যাচাইয়ের উত্তর দিন', '❌ Please solve the math verification'))
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
        throw new Error(j.error || pick('তথ্যটি পাঠানো যায়নি', 'Failed to submit tip'))
      }

      setSubmitted(true)
      humanCheck.reset()
    } catch (err: any) {
      setErrMsg('❌ ' + (err?.message || pick('তথ্য পাঠাতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।', 'Error submitting, please try again.')))
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
                <span>{pick('সংবাদ বা টিপ পাঠান', 'Submit a Campus Tip')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Lock className="size-2.5" />
                  <span>{pick('১০০% গোপন', 'Confidential')}</span>
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                {pick('ক্যাম্পাসের যেকোনো খবর বা তথ্যের ক্লু সরাসরি রিপোর্টারদের কাছে পাঠান', 'Directly alert campus reporters with news clues')}
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
                  {pick('আপনার টিপসটি সফলভাবে পৌঁছেছে!', 'Tip successfully submitted!')}
                </h3>
                <p className="text-xs text-slate-200 max-w-sm mx-auto leading-relaxed">
                  {pick(
                    'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির ডেস্ক আপনার পাঠানো তথ্যটি যাচাই করে প্রয়োজনীয় অনুসন্ধান ও প্রতিবেদন তৈরি করবে। সত্যানুসন্ধানে সহযোগিতার জন্য ধন্যবাদ।',
                    'The MBSTU Reporters\' Unity editorial desk will review the information for verification. Thank you for supporting campus journalism.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer mt-2"
              >
                <span>{pick('ঠিক আছে / বন্ধ করুন', 'Done / Close')}</span>
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
                      {pick('পরিচয় সম্পূর্ণ গোপন রাখুন', 'Keep identity fully anonymous')}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {isAnonymous
                        ? pick('আপনার নাম বা পরিচয় কাউকে জানানো হবে না', 'Your name will not be shared')
                        : pick('রিপোর্টার আপনার সাথে যোগাযোগ করতে পারবে', 'Reporters can contact you')}
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
                        placeholder="উদা: আরিফুল ইসলাম"
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
                        placeholder="উদা: CSE, ১৮তম ব্যাচ"
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
                      placeholder="উদা: 017XXXXXXXX বা user@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* ক্যাটাগরি / ডেস্ক নির্বাচন */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  {pick('তথ্যের ধরন / ক্যাটাগরি *', 'Topic / Category *')}
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
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* সংবাদের সংক্ষিপ্ত শিরোনাম */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {pick('সংবাদের বিষয় বা শিরোনাম *', 'Subject or Headline *')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={pick('উদা: বঙ্গবন্ধু হলের পানির ফিল্টার সমস্যা', 'e.g. Issue regarding dormitory facilities')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              {/* বিস্তারিত বিবরণ */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {pick('বিস্তারিত তথ্য বা ক্লু *', 'Detailed Info or Clues *')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={pick(
                    'কী ঘটেছে, কখন ও কোথায় ঘটেছে এবং কী ধরনের প্রমাণ বা সূত্র আছে বিস্তারিত লিখুন...',
                    'Describe what happened, where, when, and any evidence or leads available...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 leading-relaxed resize-none"
                />
              </div>

              {/* সহজ মানব যাচাই (Captcha) */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  {pick('স্প্যাম রোধে সহজ যাচাই *', 'Quick human verification *')}
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
                  <span>{busy ? pick('পাঠানো হচ্ছে...', 'Submitting...') : pick('টিপস জমা দিন', 'Submit Campus Tip')}</span>
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
