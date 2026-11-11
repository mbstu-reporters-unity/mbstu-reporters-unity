'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { useLang } from '@/lib/i18n'

function makeFormatters(lang: 'bn' | 'en') {
  const locale = lang === 'bn' ? 'bn-BD' : 'en-GB'
  return {
    date: new Intl.DateTimeFormat(locale, {
      timeZone: 'Asia/Dhaka',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
    <div className="flex items-center justify-between w-full text-white/90 text-[11px] sm:text-xs font-medium" aria-live="off">
      {/* বামে: ক্যালেন্ডার আইকন ও তারিখ */}
      <span className="inline-flex items-center gap-1.5 text-slate-200">
        <CalendarDays className="size-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        <span>{now ? fmt.date.format(now) : 'লোড হচ্ছে...'}</span>
      </span>

      {/* ডানে: ঘড়ির আইকন ও সময় */}
      <span className="inline-flex items-center gap-1.5 tabular-nums text-cyan-200 font-semibold">
        <Clock className="size-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        <time>{now ? fmt.time.format(now) : '--:--:--'}</time>
      </span>
    </div>
  )
}
