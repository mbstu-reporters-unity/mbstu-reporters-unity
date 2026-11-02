'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const KEY = 'mbstu_theme'

export const THEMES = [
  { id: 'light', bn: 'আলো', en: 'Light', dbn: 'ডিফল্ট উজ্জ্বল ডিজাইন', den: 'Default bright look', bg: '#ffffff', dot: '#046a38' },
  { id: 'dark', bn: 'ডার্ক', en: 'Dark', dbn: 'রাতে ও অন্ধকারে আরামদায়ক', den: 'Easy in the dark', bg: '#0c1311', dot: '#2a9d62' },
  { id: 'sepia', bn: 'সেপিয়া', en: 'Sepia', dbn: 'কাগজের মতো, পড়ার আরাম', den: 'Paper-like, good for reading', bg: '#f3ead3', dot: '#3d6e3a' },
  { id: 'mint', bn: 'সবুজ আরাম', en: 'Soft green', dbn: 'চোখ জুড়ানো হালকা সবুজ', den: 'Calming eye-care green', bg: '#d5ead8', dot: '#18683a' },
  { id: 'night', bn: 'রাতের উষ্ণ', en: 'Warm night', dbn: 'কম নীল আলো, ঘুমের আগে', den: 'Low blue light, before sleep', bg: '#15100c', dot: '#b7791f' },
  { id: 'contrast', bn: 'হাই কনট্রাস্ট', en: 'High contrast', dbn: 'সাদা-কালো, স্পষ্ট লেখা', den: 'Black on white, sharp text', bg: '#ffffff', dot: '#000000' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

function apply(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  const t = THEMES.find((x) => x.id === id)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && t) meta.setAttribute('content', t.bg === '#ffffff' ? '#046A38' : t.bg)
}

export function ThemeSwitcher() {
  const { pick } = useLang()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>('light')
  const box = useRef<HTMLDivElement>(null)

  // লেআউটের স্ক্রিপ্ট আগেই থিম বসিয়ে রাখে, এখানে শুধু সেটা পড়া
  useEffect(() => {
    const cur = document.documentElement.getAttribute('data-theme') as ThemeId | null
    if (cur && THEMES.some((t) => t.id === cur)) setTheme(cur)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(id: ThemeId) {
    setTheme(id)
    apply(id)
    try {
      localStorage.setItem(KEY, id)
    } catch {}
    setOpen(false)
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10"
      >
        <Palette className="size-3.5" aria-hidden="true" />
        {pick('থিম', 'Theme')}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-2 text-left text-card-foreground shadow-xl"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {pick('চোখের জন্য মোড বেছে নিন', 'Choose a viewing mode')}
          </p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => choose(t.id)}
              className={
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-soft ' +
                (theme === t.id ? 'bg-brand-soft' : '')
              }
            >
              <span
                aria-hidden="true"
                className="size-8 shrink-0 rounded-full border border-border"
                style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.dot} 50%)` }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-navy">{pick(t.bn, t.en)}</span>
                <span className="block truncate text-xs text-muted-foreground">{pick(t.dbn, t.den)}</span>
              </span>
              {theme === t.id && <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
