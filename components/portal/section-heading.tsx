import { cn } from '@/lib/utils'
import { Tr } from '@/lib/i18n'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  inverted = false,
  action,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  inverted?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className={cn('flex items-center gap-2 text-sm font-semibold uppercase tracking-widest', inverted ? 'text-gold' : 'text-brand')}>
          <span className="h-0.5 w-8 bg-current" aria-hidden="true" />
          <Tr text={eyebrow} eyebrow />
        </p>
        <h2 className={cn('mt-2 text-balance font-serif text-3xl font-bold sm:text-4xl', inverted ? 'text-white' : 'text-navy')}>
          <Tr text={title} />
        </h2>
        {subtitle && (
          <p className={cn('mt-2 max-w-2xl text-pretty', inverted ? 'text-white/70' : 'text-muted-foreground')}>
            <Tr text={subtitle} />
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
