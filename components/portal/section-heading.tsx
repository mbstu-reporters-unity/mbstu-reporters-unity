import { cn } from '@/lib/utils'
import { Tr } from '@/lib/i18n'
import { getSectionText } from '@/lib/sb'

export async function SectionHeading({
  eyebrow,
  title,
  subtitle,
  inverted = false,
  action,
  configKey, // কোন সেকশন তা চেনার জন্য ইউনিক আইডি (যেমন: leadership, general_news ইত্যাদি)
}: {
  eyebrow: string
  title: string
  subtitle?: string
  inverted?: boolean
  action?: React.ReactNode
  configKey?: string
}) {
  // যদি ডাটাবেজে কাস্টম টেক্সট সেভ করা থাকে, তবে তা ফেচ করবে, না থাকলে ডিফল্ট প্রপস দেখাবে
  let finalEyebrow = eyebrow
  let finalTitle = title
  let finalSubtitle = subtitle

  if (configKey) {
    try {
      const [dbEyebrow, dbTitle, dbDesc] = await Promise.all([
        getSectionText(`sec_${configKey}_eyebrow`, eyebrow),
        getSectionText(`sec_${configKey}_title`, title),
        subtitle ? getSectionText(`sec_${configKey}_desc`, subtitle) : Promise.resolve(undefined),
      ])
      finalEyebrow = dbEyebrow
      finalTitle = dbTitle
      if (subtitle) finalSubtitle = dbDesc
    } catch {}
  }

  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className={cn('flex items-center gap-2 text-sm font-semibold uppercase tracking-widest', inverted ? 'text-gold' : 'text-brand')}>
          <span className="h-0.5 w-8 bg-current" aria-hidden="true" />
          <Tr text={finalEyebrow} eyebrow />
        </p>
        <h2 className={cn('mt-2 text-balance font-serif text-3xl font-bold sm:text-4xl', inverted ? 'text-white' : 'text-navy')}>
          <Tr text={finalTitle} />
        </h2>
        {finalSubtitle && (
          <p className={cn('mt-2 max-w-2xl text-pretty', inverted ? 'text-white/70' : 'text-muted-foreground')}>
            <Tr text={finalSubtitle} />
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
