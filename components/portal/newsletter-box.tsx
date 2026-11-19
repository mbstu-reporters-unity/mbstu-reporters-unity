'use client'

import React, { useState } from 'react'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/lib/i18n'

export function NewsletterBox() {
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
      setErr(pick('সঠিক ইমেইল লিখুন', 'Please enter a valid email'))
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || 'সাবস্ক্রাইব করা যায়নি')
      }
      setDone(true)
      setEmail('')
    } catch (e: any) {
      setErr(e?.message || pick('সমস্যা হয়েছে, পরে চেষ্টা করুন', 'Failed to subscribe'))
    }
    setBusy(false)
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 space-y-2.5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
          <Mail className="size-4" />
        </span>
        <div>
          <p className="text-xs sm:text-sm font-bold text-white">
            {pick('নিউজলেটার সাবস্ক্রিপশন', 'Newsletter Subscription')}
          </p>
          <p className="text-[11px] text-slate-300">
            {pick(
              'সাপ্তাহিক সেরা ক্যাম্পাস সংবাদ ও নোটিশ সরাসরি ইমেইলে পান।',
              'Get weekly campus news and notices directly in your inbox.'
            )}
          </p>
        </div>
      </div>

      {done ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-3 py-2 text-xs font-bold text-emerald-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            {pick(
              'সফলভাবে নিউজলেটারে যুক্ত হয়েছেন!',
              'Successfully subscribed to our newsletter!'
            )}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <input
            type="email"
            required
            placeholder={pick('আপনার ইমেইল লিখুন...', 'Enter your email...')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-xs text-white placeholder-white/45 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow cursor-pointer disabled:opacity-50 transition"
          >
            <Send className="size-3.5" />
            <span>{busy ? '...' : pick('সাবস্ক্রাইব', 'Subscribe')}</span>
          </button>
        </form>
      )}

      {err && <p className="text-[11px] font-semibold text-rose-300">{err}</p>}
    </div>
  )
}
