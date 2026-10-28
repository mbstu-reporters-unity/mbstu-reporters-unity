'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Dhaka',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-3 text-white/80" aria-live="off">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 text-gold" aria-hidden="true" />
        <span className="min-w-[10ch]">{now ? dateFormatter.format(now) : '\u00A0'}</span>
      </span>
      <span className="hidden h-3 w-px bg-white/25 sm:block" aria-hidden="true" />
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <Clock className="size-3.5 text-gold" aria-hidden="true" />
        <time>{now ? timeFormatter.format(now) : '--:--:--'}</time>
      </span>
    </div>
  )
}
