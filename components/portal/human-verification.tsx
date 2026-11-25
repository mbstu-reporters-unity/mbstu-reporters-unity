'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Tx } from '@/lib/i18n'
import type { AntiSpamPayload } from '@/lib/anti-spam'

type Challenge = Pick<AntiSpamPayload, 'captcha_left' | 'captcha_right' | 'captcha_operator'>

function createChallenge(): Challenge {
  const left = Math.floor(Math.random() * 10) + 2
  const right = Math.floor(Math.random() * 10) + 2
  const captcha_operator = Math.random() < 0.5 ? '+' : '-'

  if (captcha_operator === '-' && left < right) {
    return { captcha_left: right, captcha_right: left, captcha_operator }
  }

  return { captcha_left: left, captcha_right: right, captcha_operator }
}

export function useHumanVerification(enabled = true) {
  const [challenge, setChallenge] = useState<Challenge>({
    captcha_left: 4,
    captcha_right: 3,
    captcha_operator: '+',
  })
  const [answer, setAnswer] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (enabled) {
      setChallenge(createChallenge())
      setAnswer('')
      setWebsite('')
    }
  }, [enabled])

  function refresh() {
    setChallenge(createChallenge())
    setAnswer('')
  }

  function reset() {
    refresh()
    setWebsite('')
  }

  const payload: AntiSpamPayload = {
    ...challenge,
    captcha_answer: answer,
    website,
  }

  return {
    challenge,
    answer,
    setAnswer,
    website,
    setWebsite,
    payload,
    refresh,
    reset,
  }
}

export function HumanVerification({
  idPrefix,
  challenge,
  answer,
  onAnswerChange,
  website,
  onWebsiteChange,
  onRefresh,
  compact = false,
}: {
  idPrefix: string
  challenge: Challenge
  answer: string
  onAnswerChange: (value: string) => void
  website: string
  onWebsiteChange: (value: string) => void
  onRefresh: () => void
  compact?: boolean
}) {
  const answerId = `${idPrefix}-human-answer`
  const question =
    challenge.captcha_operator === '+'
      ? `${challenge.captcha_left} + ${challenge.captcha_right}`
      : `${challenge.captcha_left} − ${challenge.captcha_right}`

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute h-px w-px overflow-hidden"
        style={{ left: '-10000px' }}
      >
        <label htmlFor={`${idPrefix}-website`}>Leave this field empty</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => onWebsiteChange(event.target.value)}
        />
      </div>

      <fieldset
        className={`rounded-xl border border-white/15 bg-white/5 ${
          compact ? 'p-2.5 space-y-2' : 'p-3.5 space-y-2.5'
        }`}
      >
        <legend className="px-1 text-[11px] font-bold text-cyan-200">
          <Tx bn="স্বয়ংক্রিয় যাচাই" en="Automated check" />
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={answerId} className="text-xs text-slate-200">
            <Tx bn={`${question} = কত?`} en={`${question} = ?`} />
          </label>
          <input
            id={answerId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            pattern="[0-9০-৯]{1,2}"
            maxLength={2}
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            className="w-20 rounded-lg border border-white/20 bg-black/30 px-2.5 py-1.5 text-center text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-cyan-200 hover:bg-white/10"
          >
            <RefreshCw className="size-3.5" />
            <Tx bn="নতুন প্রশ্ন দেখুন" en="Refresh question" />
          </button>
        </div>
      </fieldset>
    </>
  )
}
