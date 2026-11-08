import { cn } from '@/lib/utils'
import { Tx } from '@/lib/i18n'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-2.5">
      {/* বর্ডার ও ব্যাকগ্রাউন্ড সরিয়ে শতভাগ গোল ও ক্লিয়ার লোগো */}
      <img
        src="/logo.png"
        alt="MBSTU Reporters' Unity"
        className="size-11 sm:size-12 rounded-full object-cover shrink-0 select-none"
      />
      <span className="flex flex-col leading-tight min-w-0">
        <span className={cn('text-sm font-bold tracking-tight', inverted ? 'text-white' : 'text-foreground')}>
          {"MBSTU Reporters' Unity"}
        </span>
        <span className={cn('text-xs font-semibold', inverted ? 'text-slate-300' : 'text-brand')}>
          <Tx bn="মাভাবিপ্রবি রিপোর্টার্স ইউনিটি" en="MBSTURU" />
        </span>
      </span>
    </a>
  )
}
