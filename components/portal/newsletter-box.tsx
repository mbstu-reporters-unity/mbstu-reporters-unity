'use client'

import React, { useState } from 'react'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { HumanVerification, useHumanVerification } from './human-verification'

export function NewsletterBox() {
  const humanCheck = useHumanVerification()
  const { pick } = useLang()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const clean = email.trim()
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErr(pick('অনুগ্রহ করে বৈধ ইমেইল ঠিকানা লিখুন।', 'Please enter a valid email address.'))
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean, ...humanCheck.payload }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || pick('নিউজলেটারে নিবন্ধন করা যায়নি।', 'Unable to subscribe to the newsletter.'))
      }
      setDone(true)
      setEmail('')
      humanCheck.reset()
    } catch (e: any) {
      setErr(e?.message || pick('নিবন্ধন সম্পন্ন হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।', 'Subscription could not be completed. Please try again later.'))
    }
    setBusy(false)
  }

  return (
    <div className="rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 space-y-2.5 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--theme-brand-soft)] text-[var(--theme-brand)] border border-[var(--theme-card-border)] shrink-0">
          <Mail className="size-4" />
        </span>
        <div>
          <p className="text-xs sm:text-sm font-bold text-[var(--theme-text-title)]">
            {pick('নিউজলেটার নিবন্ধন', 'Newsletter Subscription')}
          </p>
          <p className="text-[11px] text-[var(--theme-text-body)] opacity-80">
            {pick(
              'সাপ্তাহিক ক্যাম্পাস সংবাদ ও নোটিশ ইমেইলে পেতে নিবন্ধন করুন।',
              'Subscribe to receive weekly campus news and notices by email.'
            )}
          </p>
        </div>
      </div>

      {done ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>
            {pick(
              'নিউজলেটারে আপনার নিবন্ধন সম্পন্ন হয়েছে।',
              'Your newsletter subscription is confirmed.'
            )}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              required
              placeholder={pick('আপনার ইমেইল ঠিকানা লিখুন', 'Enter your email address')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-bg-solid)] px-3 py-2 text-xs text-[var(--theme-text-title)] placeholder:text-[var(--theme-text-body)]/50 focus:outline-none focus:border-[var(--theme-brand)]"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--theme-brand)] hover:bg-[var(--theme-brand-dark)] text-[var(--theme-brand-contrast,var(--theme-bg-solid))] px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition"
            >
              <Send className="size-3.5" />
              <span>{busy ? '...' : pick('নিবন্ধন করুন', 'Subscribe')}</span>
            </button>
          </div>
          <HumanVerification
            idPrefix="newsletter"
            challenge={humanCheck.challenge}
            answer={humanCheck.answer}
            onAnswerChange={humanCheck.setAnswer}
            website={humanCheck.website}
            onWebsiteChange={humanCheck.setWebsite}
            onRefresh={humanCheck.refresh}
            compact
          />
        </form>
      )}

      {err && <p className="text-[11px] font-semibold text-rose-500">{err}</p>}
    </div>
  )
}
