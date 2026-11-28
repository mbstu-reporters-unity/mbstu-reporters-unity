'use client'

import { Tr, useLang } from '@/lib/i18n'

export function SectionHeading({
  eyebrow,
  title,
  titleEn,
  subtitle,
  subtitleEn,
  inverted = false, // ডিফল্টভাবে আর সাদা টেক্সট দেবে না
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
    <div className="section-heading mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-2.5">
      <div>
        {eyebrow && (
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c8102e]">
            <span className="h-0.5 w-4 bg-[#c8102e] rounded-full" aria-hidden="true" />
            <Tr text={eyebrow} eyebrow />
          </p>
        )}

        <h2
          className={`section-heading-title mt-1 font-serif text-xl sm:text-2xl font-bold leading-tight ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          {renderedTitle}
        </h2>

        {renderedSubtitle && (
          <p
            className={`section-heading-subtitle mt-0.5 text-xs sm:text-sm leading-relaxed ${
              inverted ? 'text-slate-300' : 'text-slate-600'
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
