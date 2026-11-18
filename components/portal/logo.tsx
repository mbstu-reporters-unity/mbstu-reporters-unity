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
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none cursor-pointer min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.orgLogoUrl || '/logo.png'}
        alt={b.orgNameEn || "MBSTU Reporters' Unity"}
        className="size-9 sm:size-11 rounded-full object-cover shrink-0 select-none transition-transform group-hover:scale-105 bg-white/10"
      />
      <span className="flex flex-col leading-snug min-w-0">
        <span
          className={cn(
            'text-[15px] sm:text-lg font-bold tracking-tight transition-colors whitespace-nowrap truncate',
            inverted ? 'text-white group-hover:text-gold' : 'text-foreground group-hover:text-brand'
          )}
        >
          {b.orgNameEn || "MBSTU Reporters' Unity"}
        </span>
        <span className={cn('text-[13px] sm:text-sm font-semibold whitespace-nowrap truncate', inverted ? 'text-cyan-200/90' : 'text-brand')}>
          {pick(b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি', b.orgShortEn || 'MBSTURU')}
        </span>
      </span>
    </Link>
  )
}
