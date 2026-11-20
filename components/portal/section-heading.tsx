'use client'

import { Tr, useLang } from '@/lib/i18n'

export function SectionHeading({
  eyebrow,
  title,
  titleEn,
  subtitle,
  subtitleEn,
  inverted = true,
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
    <div className="section-heading mb-6 sm:mb-8 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
            <span className="h-0.5 w-6 sm:w-8 bg-amber-400" aria-hidden="true" />
            <Tr text={eyebrow} eyebrow />
          </p>
        )}

        <h2
          className={`section-heading-title mt-1.5 text-balance font-serif text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-md ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          {renderedTitle}
        </h2>

        {renderedSubtitle && (
          <p
            className={`section-heading-subtitle mt-1 max-w-2xl text-pretty text-xs sm:text-sm leading-relaxed ${
              inverted ? 'text-cyan-100/90' : 'text-slate-600'
            }`}
          >
            {renderedSubtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
