'use client'

import { useEffect, useState } from 'react'

const KEY = 'mbstu_font_scale'
const STEPS = ['14.5px', '16px', '17.5px', '19px'] as const

export function FontSizeSwitcher() {
  const [idx, setIdx] = useState(1)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY)
      const found = STEPS.indexOf(saved as any)
      if (found >= 0) {
        setIdx(found)
        document.documentElement.style.fontSize = STEPS[found]
      }
    } catch {}
  }, [])

  function applyStep(nextIdx: number) {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, nextIdx))
    setIdx(clamped)
    const val = STEPS[clamped]
    document.documentElement.style.fontSize = val
    try {
      localStorage.setItem(KEY, val)
    } catch {}
  }

  return (
    <div
      role="group"
      aria-label="লেখার ফন্ট সাইজ পরিবর্তন"
      className="inline-flex items-center rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[11px] font-bold text-[var(--theme-text-title)] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => applyStep(idx - 1)}
        disabled={idx === 0}
        title="লেখা ছোট করুন"
        className="px-2 py-1 hover:bg-[var(--theme-brand-soft)] disabled:opacity-35 cursor-pointer"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => applyStep(1)}
        title="স্বাভাবিক ফন্ট সাইজ"
        className="px-1.5 py-1 border-x border-[var(--theme-card-border)] hover:bg-[var(--theme-brand-soft)] cursor-pointer"
      >
        A
      </button>
      <button
        type="button"
        onClick={() => applyStep(idx + 1)}
        disabled={idx === STEPS.length - 1}
        title="লেখা বড় করুন"
        className="px-2 py-1 hover:bg-[var(--theme-brand-soft)] disabled:opacity-35 cursor-pointer"
      >
        A+
      </button>
    </div>
  )
}
