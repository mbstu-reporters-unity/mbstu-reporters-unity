'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const KEY = 'mbstu_theme'

export const THEMES = [
  { id: 'light', bn: 'ডিফল্ট আলো', en: 'Daylight Green', dbn: 'উজ্জ্বল ক্লাসিক সবুজ', den: 'Default bright green', bg: '#ffffff', dot: '#046a38' },
  { id: 'sky', bn: 'আকাশী আলো', en: 'Sky Breeze', dbn: 'উজ্জ্বল স্নিগ্ধ নীলাভ রোদ', den: 'Bright sky daylight', bg: '#f0f7ff', dot: '#0284c7' },
  { id: 'sunshine', bn: 'স্বর্ণালী রোদ', en: 'Golden Sun', dbn: 'উজ্জ্বল সোনালী আভা', den: 'Warm golden daylight', bg: '#fffbeb', dot: '#b45309' },
  { id: 'rose', bn: 'গোলাপী প্রভাত', en: 'Morning Rose', dbn: 'উজ্জ্বল স্নিগ্ধ প্রভাত', den: 'Bright rose glow', bg: '#fff1f2', dot: '#e11d48' },
  { id: 'lavender', bn: 'ল্যাভেন্ডার স্নিগ্ধ', en: 'Royal Lavender', dbn: 'উজ্জ্বল রাজকীয় বেগুনি', den: 'Vibrant bright violet', bg: '#f5f3ff', dot: '#7c3aed' },
  { id: 'spring', bn: 'ক্যাম্পাস বসন্ত', en: 'Spring Emerald', dbn: 'উজ্জ্বল কচি পাতার সবুজ', den: 'Bright spring emerald', bg: '#f0fdf4', dot: '#15803d' },
  { id: 'mint', bn: 'মিন্ট আরাম', en: 'Soft Mint', dbn: 'চোখ জুড়ানো হালকা সবুজ', den: 'Calming mint green', bg: '#f0fdf9', dot: '#0d9488' },
  { id: 'sepia', bn: 'সেপিয়া পেপার', en: 'Warm Sepia', dbn: 'কাগজের মতো পড়ার আরাম', den: 'Vintage warm paper', bg: '#fbf7ee', dot: '#854d0e' },
  { id: 'contrast', bn: 'হাই কনট্রাস্ট', en: 'High Contrast', dbn: 'সাদা-কালো, সর্বোচ্চ স্পষ্ট', den: 'Pure black on white', bg: '#ffffff', dot: '#000000' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

function apply(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  const t = THEMES.find((x) => x.id === id)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && t) meta.setAttribute('content', t.bg === '#ffffff' ? '#046A38' : t.dot)
}

export function ThemeSwitcher() {
  const { pick } = useLang()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>('light')
  const box = useRef<HTMLDivElement>(null)

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
        className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 cursor-pointer"
      >
        <Palette className="size-3.5" aria-hidden="true" />
        {pick('উজ্জ্বল থিম', 'Bright Themes')}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-2 text-left shadow-2xl animate-in zoom-in-95 fade-in max-h-[80vh] overflow-y-auto"
        >
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b mb-1">
            {pick('উজ্জ্বল আলোর থিম বেছে নিন', 'Choose a bright daylight theme')}
          </p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => choose(t.id)}
              className={
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-gray-100 cursor-pointer ' +
                (theme === t.id ? 'bg-emerald-50 border border-emerald-200' : '')
              }
            >
              <span
                aria-hidden="true"
                className="size-7 shrink-0 rounded-full border border-gray-300 shadow-xs"
                style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.dot} 50%)` }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-gray-800">{pick(t.bn, t.en)}</span>
                <span className="block truncate text-[10px] text-gray-500">{pick(t.dbn, t.den)}</span>
              </span>
              {theme === t.id && <Check className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
