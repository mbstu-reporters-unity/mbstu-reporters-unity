'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useLang } from '@/lib/i18n'
import { useSiteSettings } from './site-settings-context'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const settings = useSiteSettings()
  const { pick } = useLang()
  const b = settings.branding

  return (
    <Link href="/" aria-label={b.orgNameBn || "MBSTU Reporters' Unity"} className="flex items-center gap-2.5 sm:gap-3 group select-none cursor-pointer min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.orgLogoUrl || '/logo.png'}
        alt={b.orgNameEn || "MBSTU Reporters' Unity"}
        className="size-9 sm:size-11 rounded-full border border-[var(--theme-card-border)] object-cover shrink-0 select-none transition-transform group-hover:scale-105 bg-white"
      />
      <span className="flex flex-col leading-snug min-w-0">
        <span
          className={cn(
            'font-serif text-[15px] sm:text-lg font-bold tracking-tight transition-colors whitespace-nowrap truncate',
            inverted ? 'text-white group-hover:text-gold' : 'text-[var(--theme-brand)] group-hover:text-[var(--theme-brand-dark)]'
          )}
        >
          {pick(b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি', b.orgNameEn || "MBSTU Reporters' Unity")}
        </span>
        <span className={cn('text-[11px] sm:text-xs font-medium whitespace-nowrap truncate', inverted ? 'text-white/80' : 'text-[var(--theme-text-body)]')}>
          {pick(b.orgNameEn || "MBSTU Reporters' Unity", b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি')}
        </span>
      </span>
    </Link>
  )
}
