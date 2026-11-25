'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const KEY = 'mbstu_theme'

export const THEMES = [
  {
    id: 'ocean-glass',
    bn: '১. নীল কাচের আবহ',
    en: 'Ocean Blue',
    dbn: 'নীলাভ স্বচ্ছতার আবহ',
    den: 'A clear ocean-blue appearance',
    bg: '#3b82f6',
    dot: '#0284c7',
  },
  {
    id: 'sunset-peach',
    bn: '২. গোধূলি আভা',
    en: 'Sunset Peach',
    dbn: 'উষ্ণ পীচ রঙের আবহ',
    den: 'A warm peach-toned appearance',
    bg: '#3d2325',
    dot: '#f97316',
  },
  {
    id: 'pure-frost',
    bn: '৩. শুভ্র কাচের আবহ',
    en: 'Pure Frost',
    dbn: 'সরল ও স্বচ্ছ শুভ্র আবহ',
    den: 'A clean, frosted-white appearance',
    bg: '#f1f5f9',
    dot: '#475569',
  },
  {
    id: 'midnight-neon',
    bn: '৪. মধ্যরাত্রির আভা',
    en: 'Midnight',
    dbn: 'গাঢ় পটভূমিতে নিয়ন আলোর আভা',
    den: 'A dark appearance with neon accents',
    bg: '#030712',
    dot: '#22c55e',
  },
  {
    id: 'daylight-light',
    bn: '৫. দিবালোক',
    en: 'Daylight',
    dbn: 'পাঠের উপযোগী উজ্জ্বল আবহ',
    den: 'A bright appearance designed for reading',
    bg: '#ffffff',
    dot: '#0284c7',
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

function apply(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  const t = THEMES.find((x) => x.id === id)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && t) meta.setAttribute('content', t.bg)
}

export function ThemeSwitcher() {
  const { pick } = useLang()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>('ocean-glass')
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
    <div ref={box} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/25 active:scale-95 cursor-pointer"
      >
        <Palette className="size-3.5" aria-hidden="true" />
        <span>{pick('৫টি থিম', '5 Themes')}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/20 bg-slate-950/90 p-2 text-left shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 fade-in max-h-[75vh] overflow-y-auto scrollbar-none"
        >
          <div className="px-3 pb-2 pt-2 border-b border-white/10 mb-1 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              {pick('পাঁচটি রঙের বিন্যাস', 'Five colour schemes')}
            </p>
            <span className="text-[10px] text-cyan-400 font-bold">{pick('৫টি বিন্যাস', '5 schemes')}</span>
          </div>

          <div className="space-y-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={theme === t.id}
                onClick={() => choose(t.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all cursor-pointer ${
                  theme === t.id
                    ? 'bg-white/20 border border-white/30 text-white shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="size-7 shrink-0 rounded-full border border-white/40 shadow-xs"
                  style={{ background: `linear-gradient(135deg, ${t.bg} 40%, ${t.dot} 100%)` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold leading-tight truncate">{pick(t.bn, t.en)}</span>
                  <span className="block text-[10px] text-white/60 truncate mt-0.5">{pick(t.dbn, t.den)}</span>
                </span>
                {theme === t.id && <Check className="size-4 shrink-0 text-cyan-400" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
