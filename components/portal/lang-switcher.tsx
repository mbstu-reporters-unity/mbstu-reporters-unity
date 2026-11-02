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
      aria-label="ভাষা / Language"
      className="inline-flex overflow-hidden rounded-full border border-white/30 text-xs font-semibold"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={
            'px-3 py-1.5 transition-colors ' +
            (lang === o.id ? 'bg-[#ffffff] text-[#0f172a]' : 'text-white/80 hover:bg-white/10')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
