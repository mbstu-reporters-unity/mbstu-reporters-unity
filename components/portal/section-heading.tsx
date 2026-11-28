'use client'

import { Tr, useLang } from '@/lib/i18n'

export function SectionHeading({
  eyebrow,
  title,
  titleEn,
  subtitle,
  subtitleEn,
  inverted: _inverted = false,
  action,
}: {
  eyebrow: string
  title: string
  titleEn?: string
  subtitle?: string
  subtitleEn?: string
  inverted?: boolean
  action?: React.ReactNode
}) {
  const { lang } = useLang()

  const renderedTitle =
    lang === 'en' && titleEn ? titleEn : <Tr text={title} />

  const renderedSubtitle =
    subtitle
      ? lang === 'en' && subtitleEn
        ? subtitleEn
        : <Tr text={subtitle} />
      : null

  return (
    <div className="section-heading mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--theme-card-border)] pb-2.5">
      <div>
        {eyebrow && (
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--theme-brand)]">
            <span className="h-0.5 w-4 bg-[var(--theme-brand)] rounded-full" aria-hidden="true" />
            <Tr text={eyebrow} eyebrow />
          </p>
        )}

        <h2 className="section-heading-title mt-1 font-serif text-xl sm:text-2xl font-bold leading-tight text-[var(--theme-text-title)]">
          {renderedTitle}
        </h2>

        {renderedSubtitle && (
          <p className="section-heading-subtitle mt-0.5 text-xs sm:text-sm leading-relaxed text-[var(--theme-text-body)] opacity-90">
            {renderedSubtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
