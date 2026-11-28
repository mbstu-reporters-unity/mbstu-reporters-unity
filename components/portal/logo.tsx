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
    <Link
      href="/"
      aria-label={b.orgNameBn || "MBSTU Reporters' Unity"}
      className="flex items-center gap-2 sm:gap-2.5 group select-none cursor-pointer min-w-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.orgLogoUrl || '/logo.png'}
        alt={b.orgNameEn || "MBSTU Reporters' Unity"}
        className="size-8.5 sm:size-10 rounded-full border border-[var(--theme-card-border)] object-cover shrink-0 select-none transition-transform group-hover:scale-105 bg-white shadow-2xs"
      />
      <div className="flex flex-col min-w-0 leading-tight">
        <span
          className={cn(
            'font-serif text-[13px] sm:text-base font-bold tracking-tight transition-colors truncate',
            inverted
              ? 'text-white group-hover:text-gold'
              : 'text-[var(--theme-brand)] group-hover:text-[var(--theme-brand-dark)]'
          )}
        >
          {pick(b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি', b.orgNameEn || "MBSTU Reporters' Unity")}
        </span>
        <span
          className={cn(
            'text-[10px] sm:text-[11px] font-medium truncate',
            inverted ? 'text-white/80' : 'text-[var(--theme-text-body)]'
          )}
        >
          {pick(b.orgNameEn || "MBSTU Reporters' Unity", b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি')}
        </span>
      </div>
    </Link>
  )
}
