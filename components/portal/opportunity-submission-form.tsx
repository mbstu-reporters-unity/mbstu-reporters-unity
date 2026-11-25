'use client'

import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { HumanVerification, useHumanVerification } from '@/components/portal/human-verification'
import { useLang } from '@/lib/i18n'

const fieldClass =
  'w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:border-cyan-300 focus:outline-none'

export function OpportunitySubmissionForm({
  opportunityId,
  opportunityTitle,
}: {
  opportunityId: string
  opportunityTitle: string
}) {
  const { pick } = useLang()
  const humanCheck = useHumanVerification()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [fields, setFields] = useState({
    applicant_name: '',
    applicant_email: '',
    department: '',
    batch: '',
    student_id: '',
    entry_title: '',
    entry_text: '',
    work_url: '',
  })

  function updateField(key: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/opportunity-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunityId,
          ...fields,
          ...humanCheck.payload,
        }),
      })
      const result: unknown = await response.json().catch(() => ({}))
      const error =
        typeof result === 'object' && result !== null && 'error' in result &&
        typeof result.error === 'string'
          ? result.error
          : ''
      if (!response.ok) throw new Error(error || pick('জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।', 'Submission could not be completed. Please try again.'))

      setMessage(pick('আপনার জমা দেওয়া কাজ গ্রহণ করা হয়েছে। ধন্যবাদ।', 'Your entry has been received. Thank you.'))
      setFields({
        applicant_name: '',
        applicant_email: '',
        department: '',
        batch: '',
        student_id: '',
        entry_title: '',
        entry_text: '',
        work_url: '',
      })
      humanCheck.reset()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : pick('জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।', 'Submission could not be completed. Please try again.')
      )
      humanCheck.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/50 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-500/25"
        >
          <Send className="size-3.5" />
          {pick('লেখা বা ছবি জমা দিন', 'Submit writing or a photograph')}
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/15 bg-slate-950/40 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-white">
              {pick('প্রতিযোগিতার জন্য কাজ জমা দিন', 'Submit an entry for the competition')}
            </h3>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-300 hover:text-white">
              {pick('বন্ধ করুন', 'Close')}
            </button>
          </div>
          <p className="text-xs text-slate-300">{opportunityTitle}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input required maxLength={120} className={fieldClass} placeholder={pick('পূর্ণ নাম *', 'Full name *')} value={fields.applicant_name} onChange={(e) => updateField('applicant_name', e.target.value)} />
            <input required type="email" maxLength={254} className={fieldClass} placeholder={pick('ইমেইল *', 'Email *')} value={fields.applicant_email} onChange={(e) => updateField('applicant_email', e.target.value)} />
            <input required maxLength={120} className={fieldClass} placeholder={pick('বিভাগ *', 'Department *')} value={fields.department} onChange={(e) => updateField('department', e.target.value)} />
            <input required maxLength={80} className={fieldClass} placeholder={pick('ব্যাচ *', 'Batch *')} value={fields.batch} onChange={(e) => updateField('batch', e.target.value)} />
            <input maxLength={80} className={fieldClass} placeholder={pick('স্টুডেন্ট আইডি (ঐচ্ছিক)', 'Student ID (optional)')} value={fields.student_id} onChange={(e) => updateField('student_id', e.target.value)} />
            <input required maxLength={180} className={fieldClass} placeholder={pick('কাজের শিরোনাম *', 'Entry title *')} value={fields.entry_title} onChange={(e) => updateField('entry_title', e.target.value)} />
          </div>
          <textarea maxLength={12000} rows={5} className={fieldClass} placeholder={pick('লেখা এখানে দিন (ঐচ্ছিক; সর্বোচ্চ ১২,০০০ অক্ষর)', 'Enter your writing here (optional; up to 12,000 characters)')} value={fields.entry_text} onChange={(e) => updateField('entry_text', e.target.value)} />
          <input type="url" className={fieldClass} placeholder={pick('অথবা ছবি বা কাজের লিংক দিন (ঐচ্ছিক)', 'Or provide a link to your photograph or work (optional)')} value={fields.work_url} onChange={(e) => updateField('work_url', e.target.value)} />
          <p className="text-[11px] text-slate-400">
            {pick('লেখা অথবা কাজের লিংক—অন্তত একটি জমা দিন। আপনার যোগাযোগের তথ্য কেবল প্রতিযোগিতা পরিচালনার কাজে ব্যবহৃত হবে।', 'Please provide either your writing or a link to your work. Your contact details will be used only to administer the competition.')}
          </p>
          <HumanVerification
            idPrefix={`opportunity-${opportunityId}`}
            challenge={humanCheck.challenge}
            answer={humanCheck.answer}
            onAnswerChange={humanCheck.setAnswer}
            website={humanCheck.website}
            onWebsiteChange={humanCheck.setWebsite}
            onRefresh={humanCheck.refresh}
            compact
          />
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
            <Send className="size-3.5" />
            {busy ? pick('জমা দেওয়া হচ্ছে…', 'Submitting…') : pick('নিরাপদে জমা দিন', 'Submit securely')}
          </button>
          {message && <p role="status" className="text-xs font-bold text-cyan-200">{message}</p>}
        </form>
      )}
    </div>
  )
}
