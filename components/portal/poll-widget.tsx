'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, CheckCircle2, Vote } from 'lucide-react'
import {
  getCampusPolls,
  getPollVotes,
  castPollVote,
  type CampusPoll,
  type PollVoteRow,
} from '@/lib/polls-podcasts'
import { SectionHeading } from './section-heading'

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

export function PollWidget({ standalone = false }: { standalone?: boolean }) {
  const [polls, setPolls] = useState<CampusPoll[]>([])
  const [votes, setVotes] = useState<PollVoteRow[]>([])
  const [devId, setDevId] = useState('')
  const [busyPoll, setBusyPoll] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
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
    if (!standalone) return null
    return (
      <section id="polls" className="py-12 sm:py-16 border-b border-white/10 relative">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <SectionHeading
            inverted
            eyebrow="Campus Opinion Poll"
            title="ক্যাম্পাস জরিপ ও পাঠকের মতামত"
            titleEn="Campus Opinion Polls"
            subtitle="সমসাময়িক ক্যাম্পাস বিষয়ে আপনার মতামত দিন ও লাইভ ফলাফল দেখুন।"
            subtitleEn="Share your opinion and view live results."
          />
          <div className="glass-card p-8 text-center text-sm text-slate-300" aria-live="polite">
            {loaded ? 'এখনো কোনো সক্রিয় জরিপ নেই।' : 'জরিপ লোড হচ্ছে...'}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="polls" className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="mx-auto max-w-5xl px-4 space-y-6">
        <SectionHeading
          inverted
          eyebrow="Campus Opinion Poll"
          title="ক্যাম্পাস জরিপ ও পাঠকের মতামত"
          titleEn="Campus Opinion Polls"
          subtitle="সমসাময়িক ক্যাম্পাস বিষয়ে আপনার মতামত দিন ও লাইভ ফলাফল দেখুন।"
          subtitleEn="Share your opinion and view live results."
          action={
            !standalone ? (
              <Link
                href="/polls"
                className="inline-flex shrink-0 items-center rounded-full bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
              >
                সব জরিপ
              </Link>
            ) : undefined
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
          {polls.map((poll) => {
            const pollVotes = votes.filter((v) => v.poll_id === poll.id)
            const totalVotes = pollVotes.length
            const myVote = pollVotes.find((v) => v.device_id === devId)?.option_id || null
            const opts = Array.isArray(poll.options) ? poll.options : []

            return (
              <div key={poll.id} className="glass-card p-5 sm:p-6 space-y-4 text-white">
                <div className="flex items-start justify-between gap-2 border-b border-white/15 pb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                      <BarChart3 className="size-4" />
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold leading-snug">
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
                        className={`relative w-full overflow-hidden rounded-xl border text-left p-3 transition ${
                          isMine
                            ? 'border-cyan-400 bg-cyan-500/15'
                            : myVote
                              ? 'border-white/15 bg-white/5 cursor-default'
                              : 'border-white/20 bg-white/10 hover:border-cyan-400 hover:bg-white/15 cursor-pointer'
                        }`}
                      >
                        {myVote && (
                          <div
                            className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                              isMine ? 'bg-cyan-500/30' : 'bg-white/10'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold">
                          <span className="flex items-center gap-2 min-w-0">
                            {isMine ? (
                              <CheckCircle2 className="size-4 text-cyan-300 shrink-0" />
                            ) : (
                              <Vote className="size-3.5 text-white/50 shrink-0" />
                            )}
                            <span className="truncate">{opt.label}</span>
                          </span>

                          {myVote && (
                            <span className="shrink-0 font-bold text-cyan-200 tabular-nums text-xs">
                              {bn(pct)}% ({bn(count)})
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
                  <span>মোট ভোট: <b className="text-cyan-300">{bn(totalVotes)}</b></span>
                  <span>{myVote ? '✓ আপনি ভোট দিয়েছেন' : 'পছন্দের অপশনে ট্যাপ করে ভোট দিন'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
