import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Tx } from '@/lib/i18n'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none cursor-pointer min-w-0">
      <img
        src="/logo.png"
        alt="MBSTU Reporters' Unity"
        className="size-9 sm:size-11 rounded-full object-cover shrink-0 select-none transition-transform group-hover:scale-105"
      />
      <span className="flex flex-col leading-snug min-w-0">
        <span
          className={cn(
            'text-[15px] sm:text-lg font-bold tracking-tight transition-colors whitespace-nowrap truncate',
            inverted ? 'text-white group-hover:text-gold' : 'text-foreground group-hover:text-brand'
          )}
        >
          {"MBSTU Reporters' Unity"}
        </span>
        <span className={cn('text-[13px] sm:text-sm font-semibold whitespace-nowrap truncate', inverted ? 'text-cyan-200/90' : 'text-brand')}>
          <Tx bn="মাভাবিপ্রবি রিপোর্টার্স ইউনিটি" en="MBSTURU" />
        </span>
      </span>
    </Link>
  )
}
