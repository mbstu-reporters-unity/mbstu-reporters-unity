import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Tx } from '@/lib/i18n'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none cursor-pointer">
      {/* বর্ডার ও ব্যাকগ্রাউন্ড ছাড়া শতভাগ গোল ও স্পষ্ট লোগো */}
      <img
        src="/logo.png"
        alt="MBSTU Reporters' Unity"
        className="size-11 sm:size-12 rounded-full object-cover shrink-0 select-none transition-transform group-hover:scale-105"
      />
      <span className="flex flex-col leading-tight min-w-0">
        <span
          className={cn(
            'text-sm font-bold tracking-tight transition-colors',
            inverted ? 'text-white group-hover:text-gold' : 'text-foreground group-hover:text-brand'
          )}
        >
          {"MBSTU Reporters' Unity"}
        </span>
        <span className={cn('text-xs font-semibold', inverted ? 'text-slate-300' : 'text-brand')}>
          <Tx bn="মাভাবিপ্রবি রিপোর্টার্স ইউনিটি" en="MBSTURU" />
        </span>
      </span>
    </Link>
  )
}
