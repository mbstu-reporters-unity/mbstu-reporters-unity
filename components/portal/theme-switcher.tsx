'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const KEY = 'mbstu_theme'

export const THEMES = [
  {
    id: 'ocean-glass',
    bn: '১. ব্লু লিকুইড গ্লাস',
    en: 'Ocean Liquid Glass',
    dbn: 'উজ্জ্বল নীল লিকুইড পিল বাটন গ্লাস',
    den: 'Glossy ocean blue liquid glass',
    bg: '#3b82f6',
    dot: '#0284c7',
  },
  {
    id: 'sunset-peach',
    bn: '২. সানসেট পিচ গ্লাস',
    en: 'Sunset Beach Glass',
    dbn: 'গোধূলি সানসেট বিচ ফ্রস্টেড উইজেট',
    den: 'Warm peach frosted beach glass',
    bg: '#3d2325',
    dot: '#f97316',
  },
  {
    id: 'pure-frost',
    bn: '৩. স্নো হোয়াইট ফ্রস্টেড',
    en: 'Pure White Frost',
    dbn: 'মিনিমালিস্ট সিলভার ফ্রস্টেড গ্লাস',
    den: 'Ultra-clean frosted white glass',
    bg: '#f1f5f9',
    dot: '#475569',
  },
  {
    id: 'pastel-lilac',
    bn: '৪. ল্যাভেন্ডার প্যাস্টেল',
    en: 'Pastel Lilac Glass',
    dbn: 'স্নিগ্ধ ল্যাভেন্ডার ফ্রস্টেড গ্লাস',
    den: 'Soft lilac-blue frosted pastel',
    bg: '#e0e7ff',
    dot: '#9333ea',
  },
  {
    id: 'midnight-neon',
    bn: '৫. মিডনাইট নিয়ন গ্লাস',
    en: 'Midnight Neon Glass',
    dbn: 'কালো গ্লাসের পেছনে জ্বলজ্বলে নিয়ন আভা',
    den: 'Dark obsidian glass with neon glow',
    bg: '#0a1122',
    dot: '#f97316',
  },
  {
    id: 'glass-pay',
    bn: '৬. গ্লাসপে রয়্যাল ভায়োলেট',
    en: 'GlassPay Royal Violet',
    dbn: 'রয়্যাল ভায়োলেট ও ম্যাজেন্টা গ্লাস',
    den: 'Royal magenta-violet frosted glass',
    bg: '#2e1065',
    dot: '#ec4899',
  },
  {
    id: 'pastel-dashboard',
    bn: '৭. লাইট প্যাস্টেল ড্যাশবোর্ড',
    en: 'Pastel Dashboard',
    dbn: 'নরম নীল-বেগুনি ড্যাশবোর্ড গ্লাস',
    den: 'Soft pastel UI with indigo glass',
    bg: '#cdd5ed',
    dot: '#4f46e5',
  },
  {
    id: 'neon-wireframe',
    bn: '৮. নিয়ন সাইবার ব্ল্যাক',
    en: 'Neon Wireframe Dark',
    dbn: 'কালো ব্যাকগ্রাউন্ডে নিয়ন তারজালি গ্লাস',
    den: 'Cyber dark glass with neon waves',
    bg: '#05050a',
    dot: '#f59e0b',
  },
  {
    id: 'visionos-taupe',
    bn: '৯. ভিশন ওএস টাউপ গ্লাস',
    en: 'VisionOS Taupe Glass',
    dbn: 'অ্যাপল ভিশনওএস মিউজিক প্লেয়ার গ্লাস',
    den: 'Apple VisionOS frosted taupe glass',
    bg: '#2b2724',
    dot: '#facc15',
  },
  {
    id: 'cyan-daylight',
    bn: '১০. আকাশী ক্লিয়ার গ্লাস',
    en: 'Cyan Sky Daylight',
    dbn: 'আকাশী নীল ডেলাইট গ্লাস প্যানেল',
    den: 'Bright sky cyan frosted glass',
    bg: '#38bdf8',
    dot: '#0284c7',
  },
  {
    id: 'chromatic-liquid',
    bn: '১১. ইরিডিসেন্ট লিকুইড গ্লাস',
    en: 'Chromatic Liquid Glass',
    dbn: 'আইওএস ২৬ রেইনবো রিফ্লেকশন গ্লাস',
    den: 'Iridescent liquid glass on deep blue',
    bg: '#1e40af',
    dot: '#38bdf8',
  },
  {
    id: 'aurora-teal',
    bn: '১২. অরোরা পার্পল-টিয়াল',
    en: 'Aurora Teal & Purple',
    dbn: 'অরোরা আলোর বেগুনি-ফিরোজা গ্লাস',
    den: 'Aurora borealis purple to teal glass',
    bg: '#0e7490',
    dot: '#06b6d4',
  },
  {
    id: 'bubble-pop',
    bn: '১৩. ফ্লোটিং বাবল পপ',
    en: 'Floating Bubble Pop',
    dbn: 'রঙিন বুদবুদ এবং স্বচ্ছ শুভ্র গ্লাস',
    den: 'Colorful floating orbs behind glass',
    bg: '#f8fafc',
    dot: '#4338ca',
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
        className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/25 active:scale-95 cursor-pointer"
      >
        <Palette className="size-3.5" aria-hidden="true" />
        <span>{pick('১৩টি গ্লাস থিম', '13 Glass Themes')}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/20 bg-slate-950/85 p-2 text-left shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 fade-in max-h-[75vh] overflow-y-auto scrollbar-none"
        >
          <div className="px-3 pb-2 pt-2 border-b border-white/10 mb-1 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              {pick('১৩টি 3D লিকুইড গ্লাস থিম', '13 Liquid Glass Themes')}
            </p>
            <span className="text-[10px] text-sky-400 font-bold">১৩টি শৈলী</span>
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
                {theme === t.id && <Check className="size-4 shrink-0 text-sky-400" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
