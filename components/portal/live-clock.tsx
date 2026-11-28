'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { useLang } from '@/lib/i18n'

function makeFormatters(lang: 'bn' | 'en') {
  const locale = lang === 'bn' ? 'bn-BD' : 'en-GB'
  return {
    // ডেস্কটপে পূর্ণ তারিখ
    date: new Intl.DateTimeFormat(locale, {
      timeZone: 'Asia/Dhaka',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    // মোবাইলে পরিচ্ছন্ন সংক্ষিপ্ত তারিখ
    shortDate: new Intl.DateTimeFormat(locale, {
      timeZone: 'Asia/Dhaka',
      day: 'numeric',
      month: 'short',
    }),
    // সেকেন্ডসহ লাইভ রিয়েলটাইম ডায়নামিক ঘড়ি
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
    // তাৎক্ষণিক লোড
    setNow(new Date())
    // প্রতি সেকেন্ডে ডায়নামিক টাইম রান করানোর টাইমার
    const id = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 text-[var(--theme-text-body)] text-[11px] sm:text-xs font-semibold whitespace-nowrap"
      aria-live="off"
    >
      {/* তারিখ — মোবাইলে ও কম্পিউটারে উভয় জায়গাতেই দৃশ্যমান */}
      <span className="inline-flex items-center gap-1 text-[var(--theme-text-body)]">
        <CalendarDays className="size-3.5 text-[var(--theme-brand)] shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{now ? fmt.date.format(now) : '...'}</span>
        <span className="sm:hidden font-bold">{now ? fmt.shortDate.format(now) : '...'}</span>
      </span>

      <span className="text-[var(--theme-card-border)] opacity-60" aria-hidden="true">·</span>

      {/* সেকেন্ডসহ ডায়নামিক লাইভ ঘড়ি (প্রতি সেকেন্ডে রান করবে) */}
      <span className="inline-flex items-center gap-1 text-[var(--theme-text-title)] tabular-nums font-bold">
        <Clock className="size-3.5 text-[var(--theme-brand)] shrink-0" aria-hidden="true" />
        <time>{now ? fmt.time.format(now) : '--:--:--'}</time>
      </span>
    </div>
  )
}
