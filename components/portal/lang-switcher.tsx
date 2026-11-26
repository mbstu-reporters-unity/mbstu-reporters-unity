'use client'

import { useLang } from '@/lib/i18n'

const OPTIONS = [
  { id: 'bn', label: 'বাংলা' },
  { id: 'en', label: 'EN' },
] as const

export function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div
      role="group"
      aria-label="ভাষা নির্বাচন / Language selection"
      className="inline-flex overflow-hidden rounded-full border border-[var(--theme-card-border)] text-xs font-semibold"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={
            'px-3 py-1.5 transition-colors ' +
            (lang === o.id
              ? 'bg-[var(--theme-brand)] text-[var(--theme-bg-solid)]'
              : 'text-[var(--theme-text-body)] hover:bg-[var(--theme-brand-soft)]')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
