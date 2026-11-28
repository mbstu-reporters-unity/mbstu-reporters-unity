"use client"

import React, { useEffect, useState } from "react"
import { BarChart3, CheckCircle2, Copy, Share2 } from "lucide-react"
import {
  getCampusPolls,
  getPollVotes,
  castPollVote,
  type CampusPoll,
  type PollVoteRow,
} from "@/lib/polls-podcasts"

function getDeviceId(): string {
  try {
    let id = localStorage.getItem("mbstu_device")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("mbstu_device", id)
    }
    return id
  } catch {
    return "guest-" + Math.random().toString(36).slice(2)
  }
}

const bn = (n: number) => n.toLocaleString("bn-BD")

export function PollWidget({
  standalone = false,
  compact: _compact = false,
  kalbela = true,
}: {
  standalone?: boolean
  compact?: boolean
  kalbela?: boolean
}) {
  const [polls, setPolls] = useState<CampusPoll[]>([])
  const [votes, setVotes] = useState<PollVoteRow[]>([])
  const [devId, setDevId] = useState("")
  const [busyPoll, setBusyPoll] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [shareStatus, setShareStatus] = useState("")
  const [todayLabel, setTodayLabel] = useState("")

  async function sharePoll(poll: CampusPoll) {
    const url = `${window.location.origin}/polls#${encodeURIComponent(poll.id)}`
    if (navigator.share) {
      try {
        await navigator.share({ title: poll.question, url })
        setShareStatus("")
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setShareStatus("শেয়ার করা যায়নি।")
        return
      }
    }
    await copyPollLink(poll)
  }

  async function copyPollLink(poll: CampusPoll) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/polls#${encodeURIComponent(poll.id)}`)
      setShareStatus("জরিপের লিংক কপি হয়েছে!")
      setTimeout(() => setShareStatus(""), 2500)
    } catch {
      setShareStatus("লিংক কপি করা যায়নি।")
    }
  }

  function openSocialShare(service: "facebook" | "whatsapp" | "x", poll: CampusPoll) {
    const url = encodeURIComponent(`${window.location.origin}/polls#${encodeURIComponent(poll.id)}`)
    const text = encodeURIComponent(poll.question)
    const targets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    }
    window.open(targets[service], "_blank", "noopener,noreferrer")
  }

  useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Dhaka",
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
      <div className="glass-card w-full rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-6 text-center text-sm text-[var(--theme-text-body)] shadow-xs">
        {loaded ? "এখনো কোনো সক্রিয় জরিপ নেই।" : "জরিপ লোড হচ্ছে…"}
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
            className="glass-card w-full rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4 sm:p-5 shadow-xs text-[var(--theme-text-body)] space-y-3.5"
          >
            {/* হেডার */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--theme-card-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-brand)]">
                  <BarChart3 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-brand)]">
                    অনলাইন জরিপ
                  </h3>
                  <time className="text-[10px] font-medium text-[var(--theme-text-body)] opacity-75">
                    {todayLabel}
                  </time>
                </div>
              </div>

              <button
                type="button"
                onClick={() => sharePoll(poll)}
                aria-label="জরিপ শেয়ার করুন"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-text-title)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)] cursor-pointer"
              >
                <Share2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* জরিপের মূল প্রশ্ন */}
            <div className="space-y-1">
              <p className="font-serif text-sm sm:text-base font-bold text-[var(--theme-text-title)] leading-snug">
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
                        ? "border-[var(--theme-brand)] bg-[var(--theme-brand-soft)] text-[var(--theme-text-title)] font-bold"
                        : myVote
                          ? "border-[var(--theme-card-border)] bg-transparent text-[var(--theme-text-body)] cursor-default"
                          : "border-[var(--theme-card-border)] bg-transparent text-[var(--theme-text-title)] hover:border-[var(--theme-brand)] hover:bg-[var(--theme-brand-soft)] cursor-pointer active:scale-[0.99]"
                    }`}
                  >
                    {myVote && (
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isMine ? "var(--theme-brand)" : "var(--theme-text-body)",
                          opacity: isMine ? 0.22 : 0.12,
                        }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        {isMine ? (
                          <CheckCircle2 className="size-4 shrink-0 text-[var(--theme-brand)]" />
                        ) : (
                          <span
                            className={`size-3.5 rounded-full border-2 shrink-0 ${
                              myVote ? "border-[var(--theme-card-border)]" : "border-[var(--theme-text-body)] opacity-60"
                            }`}
                          />
                        )}
                        <span className="truncate">{opt.label}</span>
                      </span>

                      {myVote && (
                        <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--theme-text-title)]">
                          {bn(pct)}% ({bn(count)})
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* নিচের মেটা ও ফলাফল */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--theme-card-border)] pt-2 text-[11px] text-[var(--theme-text-body)] font-medium">
              <span>
                মোট ভোট: <b className="font-bold text-[var(--theme-brand)]">{bn(totalVotes)} জন</b>
              </span>
              <span>
                {myVote ? (
                  <span className="inline-flex items-center gap-1 font-bold text-[var(--theme-brand)]">
                    <CheckCircle2 className="size-3.5" />
                    আপনার ভোট গৃহীত হয়েছে
                  </span>
                ) : (
                  "বিকল্পটিতে ক্লিক করে ভোট দিন"
                )}
              </span>
            </div>

            {/* সোশ্যাল শেয়ার স্ট্রিপ */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--theme-card-border)] pt-2.5">
              <div className="flex items-center gap-1.5" aria-label="জরিপ শেয়ার করুন">
                <button
                  type="button"
                  onClick={() => openSocialShare("facebook", poll)}
                  aria-label="Facebook"
                  className="hero-daylight-dark-surface flex size-7 items-center justify-center rounded-full bg-[#1877f2] text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  f
                </button>
                <button
                  type="button"
                  onClick={() => openSocialShare("whatsapp", poll)}
                  aria-label="WhatsApp"
                  className="hero-daylight-dark-surface flex size-7 items-center justify-center rounded-full bg-[#25d366] text-[10px] font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  WA
                </button>
                <button
                  type="button"
                  onClick={() => openSocialShare("x", poll)}
                  aria-label="X"
                  className="hero-daylight-dark-surface flex size-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => copyPollLink(poll)}
                  aria-label="লিংক কপি"
                  className="flex size-7 items-center justify-center rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] text-[var(--theme-text-title)] hover:border-[var(--theme-brand)] cursor-pointer"
                >
                  <Copy className="size-3" aria-hidden="true" />
                </button>
              </div>

              {shareStatus && (
                <span className="text-[10px] font-bold text-[var(--theme-brand)]">
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
