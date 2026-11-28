'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { useLang } from '@/lib/i18n'

function makeFormatters(lang: 'bn' | 'en') {
  const locale = lang === 'bn' ? 'bn-BD' : 'en-GB'
  return {
    date: new Intl.DateTimeFormat(locale, {
      timeZone: 'Asia/Dhaka',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      timeZone: 'Asia/Dhaka',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  }
}

export function LiveClock() {
  const { lang } = useLang()
  const [now, setNow] = useState<Date | null>(null)
  const fmt = useMemo(() => makeFormatters(lang), [lang])

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 text-[var(--theme-text-body)] text-[11px] sm:text-xs font-semibold whitespace-nowrap overflow-hidden" aria-live="off">
      {/* ঘড়ির আইকন ও লাইভ সময় */}
      <span className="inline-flex shrink-0 items-center gap-1 text-[var(--theme-text-title)]">
        <Clock className="size-3.5 text-[var(--theme-brand)] shrink-0" aria-hidden="true" />
        <time className="tabular-nums font-bold">{now ? fmt.time.format(now) : '--:--'}</time>
      </span>

      <span className="text-[var(--theme-card-border)] hidden sm:inline" aria-hidden="true">|</span>

      {/* তারিখ */}
      <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 truncate">
        <CalendarDays className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span>{now ? fmt.date.format(now) : '...'}</span>
      </span>
    </div>
  )
}
