'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, CheckCircle2, Copy, Share2, Vote } from 'lucide-react'
import {
  getCampusPolls,
  getPollVotes,
  castPollVote,
  type CampusPoll,
  type PollVoteRow,
} from '@/lib/polls-podcasts'
import { SectionHeading } from './section-heading'
import { useLang } from '@/lib/i18n'

function getDeviceId(): string {
  try {
    let id = localStorage.getItem('mbstu_device')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('mbstu_device', id)
    }
    return id
  } catch {
    return 'guest-' + Math.random().toString(36).slice(2)
  }
}

const bn = (n: number) => n.toLocaleString('bn-BD')

export function PollWidget({
  standalone = false,
  compact = false,
  kalbela = true,
}: {
  standalone?: boolean
  compact?: boolean
  kalbela?: boolean
}) {
  const { pick } = useLang()
  const [polls, setPolls] = useState<CampusPoll[]>([])
  const [votes, setVotes] = useState<PollVoteRow[]>([])
  const [devId, setDevId] = useState('')
  const [busyPoll, setBusyPoll] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const [todayLabel, setTodayLabel] = useState('')

  async function sharePoll(poll: CampusPoll) {
    const url = `${window.location.origin}/polls#${encodeURIComponent(poll.id)}`
    if (navigator.share) {
      try {
        await navigator.share({ title: poll.question, url })
        setShareStatus('')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setShareStatus('শেয়ার করা যায়নি।')
        return
      }
    }
    await copyPollLink(poll)
  }

  async function copyPollLink(poll: CampusPoll) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/polls#${encodeURIComponent(poll.id)}`)
      setShareStatus('জরিপের লিংক কপি হয়েছে!')
      setTimeout(() => setShareStatus(''), 2500)
    } catch {
      setShareStatus('লিংক কপি করা যায়নি।')
    }
  }

  function openSocialShare(service: 'facebook' | 'whatsapp' | 'x', poll: CampusPoll) {
    const url = encodeURIComponent(`${window.location.origin}/polls#${encodeURIComponent(poll.id)}`)
    const text = encodeURIComponent(poll.question)
    const targets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    }
    window.open(targets[service], '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Dhaka',
      }).format(new Date())
    )
    const id = getDeviceId()
    setDevId(id)

    getCampusPolls(false)
      .then(async (rows) => {
        setPolls(rows)
        if (rows.length > 0) {
          const v = await getPollVotes(rows.map((r) => r.id))
          setVotes(v)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  async function handleVote(pollId: string, optionId: string) {
    if (!devId || busyPoll === pollId) return
    const already = votes.some((v) => v.poll_id === pollId && v.device_id === devId)
    if (already) return

    setBusyPoll(pollId)
    setVotes((prev) => [...prev, { poll_id: pollId, option_id: optionId, device_id: devId }])

    try {
      await castPollVote(pollId, optionId, devId)
    } catch {
      const fresh = await getPollVotes(polls.map((p) => p.id))
      setVotes(fresh)
    }
    setBusyPoll(null)
  }

  if (!loaded || polls.length === 0) {
    if (!standalone && !kalbela) return null
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-xs">
        {loaded ? 'এখনো কোনো সক্রিয় জরিপ নেই।' : 'জরিপ লোড হচ্ছে…'}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {polls.slice(0, standalone ? undefined : 1).map((poll) => {
        const pollVotes = votes.filter((v) => v.poll_id === poll.id)
        const totalVotes = pollVotes.length
        const myVote = pollVotes.find((v) => v.device_id === devId)?.option_id || null
        const opts = Array.isArray(poll.options) ? poll.options : []

        return (
          <div
            key={poll.id}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs text-slate-800 space-y-3.5"
          >
            {/* কালবেলা স্টাইল হেডার */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-[#c8102e] border border-rose-200">
                  <BarChart3 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c8102e]">
                    অনলাইন জরিপ
                  </h3>
                  <time className="text-[10px] text-slate-400 font-medium">
                    {todayLabel}
                  </time>
                </div>
              </div>

              <button
                type="button"
                onClick={() => sharePoll(poll)}
                aria-label="জরিপ শেয়ার করুন"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-[#c8102e]"
              >
                <Share2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* জরিপের মূল প্রশ্ন */}
            <div className="space-y-1">
              <p className="font-serif text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {poll.question}
              </p>
            </div>

            {/* অপশনসমূহ */}
            <div className="space-y-2">
              {opts.map((opt) => {
                const count = pollVotes.filter((v) => v.option_id === opt.id).length
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                const isMine = myVote === opt.id

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={Boolean(myVote) || busyPoll === poll.id}
                    onClick={() => handleVote(poll.id, opt.id)}
                    className={`relative w-full overflow-hidden rounded-xl border p-2.5 sm:p-3 text-left transition ${
                      isMine
                        ? 'border-[#c8102e] bg-rose-50/70 text-slate-900 font-bold'
                        : myVote
                          ? 'border-slate-200 bg-slate-50/70 text-slate-700 cursor-default'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-[#c8102e] hover:bg-rose-50/30 cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    {/* ভোট দেওয়ার পর প্রোগ্রেস বার */}
                    {myVote && (
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                          isMine ? 'bg-rose-200/80' : 'bg-slate-200/60'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        {isMine ? (
                          <CheckCircle2 className="size-4 shrink-0 text-[#c8102e]" />
                        ) : (
                          <span className={`size-3.5 rounded-full border-2 shrink-0 ${myVote ? 'border-slate-300' : 'border-slate-400'}`} />
                        )}
                        <span className="truncate">{opt.label}</span>
                      </span>

                      {myVote && (
                        <span className="shrink-0 text-xs font-bold tabular-nums text-slate-700">
                          {bn(pct)}% ({bn(count)})
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* নিচের মেটা ও ফলাফল */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500 font-medium">
              <span>
                মোট ভোট: <b className="text-[#c8102e] font-bold">{bn(totalVotes)} জন</b>
              </span>
              <span>
                {myVote ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="size-3.5" />
                    আপনার ভোট গৃহীত হয়েছে
                  </span>
                ) : (
                  'বিকল্পটিতে ক্লিক করে ভোট দিন'
                )}
              </span>
            </div>

            {/* কালবেলা সোশ্যাল শেয়ার স্ট্রিপ */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
              <div className="flex items-center gap-1.5" aria-label="জরিপ শেয়ার করুন">
                <button
                  type="button"
                  onClick={() => openSocialShare('facebook', poll)}
                  aria-label="Facebook"
                  className="flex size-7 items-center justify-center rounded-full bg-[#1877f2] text-xs font-bold text-white hover:opacity-90"
                >
                  f
                </button>
                <button
                  type="button"
                  onClick={() => openSocialShare('whatsapp', poll)}
                  aria-label="WhatsApp"
                  className="flex size-7 items-center justify-center rounded-full bg-[#25d366] text-[10px] font-bold text-white hover:opacity-90"
                >
                  WA
                </button>
                <button
                  type="button"
                  onClick={() => openSocialShare('x', poll)}
                  aria-label="X"
                  className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white hover:opacity-90"
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => copyPollLink(poll)}
                  aria-label="লিংক কপি"
                  className="flex size-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                >
                  <Copy className="size-3" aria-hidden="true" />
                </button>
              </div>

              {shareStatus && (
                <span className="text-[10px] font-bold text-emerald-700">
                  {shareStatus}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
