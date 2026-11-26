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
import { HomepageCompactCarousel } from './homepage-transition-sections'
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
  kalbela = false,
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
        setShareStatus('শেয়ার করা যায়নি। আবার চেষ্টা করুন।')
        return
      }
    }

    await copyPollLink(poll)
  }

  async function copyPollLink(poll: CampusPoll) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/polls#${encodeURIComponent(poll.id)}`)
      setShareStatus('জরিপের লিংক কপি হয়েছে।')
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
    if (kalbela) {
      return (
        <section id="polls" className="w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-rose-600" aria-hidden="true" />
                <h2 className="font-serif text-xl font-bold text-[var(--theme-text-title)] sm:text-2xl">অনলাইন জরিপ</h2>
              </div>
              <time className="text-xs text-[var(--theme-text-muted)]">{todayLabel}</time>
            </div>
            <div className="rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-6 text-center text-sm text-[var(--theme-text-body)] shadow-sm" aria-live="polite">
              {loaded ? 'এখনো কোনো সক্রিয় জরিপ নেই।' : 'জরিপ লোড হচ্ছে…'}
            </div>
          </div>
        </section>
      )
    }
    if (!standalone) return null
    return (
      <section id="polls" className="py-12 sm:py-16 border-b border-white/10 relative">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <SectionHeading
            inverted
            eyebrow={pick('ক্যাম্পাস জনমত জরিপ', 'Campus Opinion Poll')}
            title={pick('ক্যাম্পাস বিষয়ে জনমত', 'Campus Opinion Polls')}
            titleEn="Campus Opinion Polls"
            subtitle={pick('সমসাময়িক ক্যাম্পাস বিষয়ে মতামত দিন এবং ফলাফল দেখুন।', 'Share your views on current campus issues and review the results.')}
            subtitleEn="Share your views on current campus issues and review the results."
          />
          <div className="glass-card p-8 text-center text-sm text-slate-300" aria-live="polite">
            {loaded ? pick('এখনো কোনো সক্রিয় জরিপ নেই।', 'There are no active polls at this time.') : pick('জরিপ লোড হচ্ছে…', 'Loading polls…')}
          </div>
        </div>
      </section>
    )
  }

  const pollCards = polls.map((poll) => {
    const pollVotes = votes.filter((v) => v.poll_id === poll.id)
    const totalVotes = pollVotes.length
    const myVote = pollVotes.find((v) => v.device_id === devId)?.option_id || null
    const opts = Array.isArray(poll.options) ? poll.options : []

    return (
      <div
        key={poll.id}
        className={`${kalbela ? 'rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] shadow-sm' : 'glass-card text-white'} space-y-4 ${
          compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
        }`}
      >
        {kalbela && (
          <div className="flex items-center justify-between gap-3 border-b border-[var(--theme-card-border)] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-rose-600" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold tracking-wide text-[var(--theme-brand)]">অনলাইন জরিপ</p>
                <time className="mt-1 block text-[11px] text-[var(--theme-text-muted)]">
                  {todayLabel}
                </time>
              </div>
            </div>
            <button
              type="button"
              onClick={() => sharePoll(poll)}
              aria-label="জরিপ শেয়ার করুন"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-brand)] transition hover:bg-[var(--theme-brand-soft)]"
            >
              <Share2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className={`flex items-start justify-between gap-2 border-b pb-3 ${kalbela ? "border-[var(--theme-card-border)]" : "border-white/15"}`}>
          <div className="flex items-start gap-2.5">
            <span className={`shrink-0 rounded-xl border p-2 ${kalbela ? "border-rose-200 bg-rose-50 text-rose-600" : "border-cyan-400/30 bg-cyan-500/20 text-cyan-300"}`}>
              <Vote className="size-4" />
            </span>
            <h3 className={`font-serif text-base font-bold leading-snug sm:text-lg ${kalbela ? "text-[var(--theme-text-title)]" : "text-white"}`}>
              {poll.question}
            </h3>
          </div>
        </div>

        <div className="space-y-2.5">
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
                className={`relative w-full overflow-hidden rounded-xl border p-3 text-left transition ${
                  kalbela
                    ? isMine
                      ? 'border-rose-500 bg-rose-50 text-slate-900'
                      : myVote
                        ? 'border-slate-200 bg-slate-50 text-slate-800 cursor-default'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-rose-400 hover:bg-slate-50 cursor-pointer'
                    : isMine
                      ? 'border-cyan-400 bg-cyan-500/15 text-white'
                      : myVote
                        ? 'border-white/15 bg-white/5 text-white cursor-default'
                        : 'border-white/20 bg-white/10 text-white hover:border-cyan-400 hover:bg-white/15 cursor-pointer'
                }`}
              >
                {myVote && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                      kalbela
                        ? isMine ? 'bg-rose-200/80' : 'bg-slate-200/60'
                        : isMine ? 'bg-cyan-500/30' : 'bg-white/10'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    {isMine ? (
                      <CheckCircle2 className={`size-4 shrink-0 ${kalbela ? "text-emerald-600" : "text-cyan-300"}`} />
                    ) : (
                      <Vote className={`size-3.5 shrink-0 ${kalbela ? "text-slate-400" : "text-white/50"}`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>

                  {myVote && (
                    <span className={`shrink-0 text-xs font-bold tabular-nums ${kalbela ? "text-slate-700" : "text-cyan-200"}`}>
                      {bn(pct)}% ({bn(count)})
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-[11px] ${kalbela ? "border-[var(--theme-card-border)] text-[var(--theme-text-muted)]" : "border-white/10 text-slate-300"}`}>
          <span>{pick('মোট ভোটদাতা:', 'Total voters:')} <b className={kalbela ? "text-[var(--theme-brand)]" : "text-cyan-300"}>{bn(totalVotes)}{pick(' জন', '')}</b></span>
          <span>{myVote ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5 text-emerald-600" />{pick('আপনি ভোট দিয়েছেন', 'You have voted')}</span> : pick('আপনার পছন্দের বিকল্পটি নির্বাচন করে ভোট দিন', 'Select your preferred option to vote')}</span>
        </div>
        {kalbela && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--theme-card-border)] pt-3">
            <div className="flex items-center gap-2" aria-label="জরিপ শেয়ার করুন">
              <button
                type="button"
                onClick={() => openSocialShare('facebook', poll)}
                aria-label="Facebook-এ শেয়ার করুন"
                className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white hover:bg-blue-500"
              >
                f
              </button>
              <button
                type="button"
                onClick={() => openSocialShare('whatsapp', poll)}
                aria-label="WhatsApp-এ শেয়ার করুন"
                className="flex size-8 items-center justify-center rounded-full bg-green-600 text-[9px] font-extrabold text-white hover:bg-green-500"
              >
                WA
              </button>
              <button
                type="button"
                onClick={() => openSocialShare('x', poll)}
                aria-label="X-এ শেয়ার করুন"
                className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-xs font-extrabold text-white hover:bg-slate-700"
              >
                X
              </button>
              <button
                type="button"
                onClick={() => copyPollLink(poll)}
                aria-label="জরিপের লিংক কপি করুন"
                className="flex size-8 items-center justify-center rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-title)] hover:bg-[var(--theme-brand-soft)]"
              >
                <Copy className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            {shareStatus && <p className="text-[11px] text-[var(--theme-brand)]" aria-live="polite">{shareStatus}</p>}
          </div>
        )}
      </div>
    )
  })

  if (kalbela) {
    return (
      <section id="polls" className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5">
            {pollCards.slice(0, 1)}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="polls"
      className={`relative border-b border-white/10 ${compact ? 'py-8 sm:py-10' : 'py-12 sm:py-16'}`}
    >
      <div className="mx-auto max-w-5xl space-y-6 px-4">
        <SectionHeading
          inverted
          eyebrow={pick('ক্যাম্পাস জনমত জরিপ', 'Campus Opinion Poll')}
          title={pick('ক্যাম্পাস বিষয়ে জনমত', 'Campus Opinion Polls')}
          titleEn="Campus Opinion Polls"
          subtitle={pick('সমসাময়িক ক্যাম্পাস বিষয়ে মতামত দিন এবং ফলাফল দেখুন।', 'Share your views on current campus issues and review the results.')}
          subtitleEn="Share your views on current campus issues and review the results."
          action={
            !standalone ? (
              <Link
                href="/polls"
                className="inline-flex shrink-0 items-center rounded-full bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
              >
                {compact ? pick('সব দেখুন', 'View all') : pick('সকল জরিপ', 'All polls')}
              </Link>
            ) : undefined
          }
        />
        {compact ? (
          <HomepageCompactCarousel
            slides={pollCards}
            title={pick('ক্যাম্পাস জনমত জরিপ', 'Campus Opinion Polls')}
            interval={9000}
            paused={Boolean(busyPoll)}
            className="max-w-none"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">{pollCards}</div>
        )}
      </div>
    </section>
  )
}
