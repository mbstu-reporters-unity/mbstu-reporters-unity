'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { useLang } from '@/lib/i18n'

// বাংলায় বাংলা সংখ্যা ও মাসের নাম, ইংরেজিতে আগের মতো
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
    <div className="flex items-center gap-3 text-white/80" aria-live="off">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 text-gold" aria-hidden="true" />
        <span className="min-w-[10ch]">{now ? fmt.date.format(now) : ' '}</span>
      </span>
      <span className="hidden h-3 w-px bg-white/25 sm:block" aria-hidden="true" />
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <Clock className="size-3.5 text-gold" aria-hidden="true" />
        <time>{now ? fmt.time.format(now) : '--:--:--'}</time>
      </span>
    </div>
  )
}
