import { Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-3">
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md ring-2 ring-gold/70">
        <Newspaper className="size-5" aria-hidden="true" />
        <span className="absolute -bottom-1 -right-1 rounded bg-crimson px-1 text-[9px] font-bold leading-4 text-white">
          RU
        </span>
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn('text-sm font-bold sm:text-base', inverted ? 'text-white' : 'text-navy')}>
          {"MBSTU Reporters' Unity"}
        </span>
        <span className={cn('text-xs font-medium sm:text-sm', inverted ? 'text-white/70' : 'text-brand')}>
          মাভাবিপ্রবি রিপোর্টার্স ইউনিটি
        </span>
      </span>
    </a>
  )
}
