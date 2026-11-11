import { cn } from '@/lib/utils'
import { Tr } from '@/lib/i18n'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  inverted = true, // ডিফল্টভাবেই সব শিরোনাম উজ্জ্বল ও স্পষ্ট থাকবে
  action,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  inverted?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 sm:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
          <span className="h-0.5 w-6 sm:w-8 bg-amber-400" aria-hidden="true" />
          <Tr text={eyebrow} eyebrow />
        </p>
        <h2 className="mt-1.5 text-balance font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-md">
          <Tr text={title} />
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-pretty text-xs sm:text-sm text-slate-200/90 leading-relaxed">
            <Tr text={subtitle} />
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
