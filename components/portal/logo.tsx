import { cn } from '@/lib/utils'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="MBSTU Reporters' Unity"
        className="size-10 rounded-full object-contain shadow-sm"
      />
      <span className="flex flex-col leading-tight">
        <span className={cn('text-sm font-bold', inverted ? 'text-white' : 'text-slate-900')}>
          {"MBSTU Reporters' Unity"}
        </span>
        <span className={cn('text-xs font-medium', inverted ? 'text-slate-300' : 'text-emerald-700')}>
          মাভাবিপ্রবি রিপোর্টার্স ইউনিটি
        </span>
      </span>
    </a>
  )
}
