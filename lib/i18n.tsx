'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'bn' | 'en'
const KEY = 'mbstu_lang'

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'bn',
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('bn')

  // সেভ করা ভাষা পড়া (প্রথম রেন্ডার সার্ভারের সাথে মেলাতে বাংলা দিয়ে শুরু)
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY)
      if (s === 'en' || s === 'bn') setLangState(s)
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {}
  }, [])

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang() {
  const { lang, setLang } = useContext(Ctx)
  /** pick(বাংলা, English) — বর্তমান ভাষার লেখাটি ফেরত দেয় */
  const pick = (bn: string, en: string) => (lang === 'bn' ? bn : en)
  return { lang, setLang, pick }
}

/** <Tx bn="..." en="..." /> — দুই ভাষার লেখা থেকে বর্তমানটি দেখায় */
export function Tx({ bn, en }: { bn: ReactNode; en: ReactNode }) {
  const { lang } = useLang()
  return <>{lang === 'bn' ? bn : en}</>
}

/* ---------- স্বয়ংক্রিয় অনুবাদ (সেকশনের শিরোনাম ইত্যাদির জন্য) ---------- */

// [বাংলা, English] জোড়া। এখানে নতুন জোড়া যোগ করলেই Tr সেটা অনুবাদ করবে।
const PAIRS: [string, string][] = [
  ['নেতৃত্বের বার্তা', 'Leadership Messages'],
  [
    "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির নেতৃত্বের বার্তা — নির্ভীক, নিরপেক্ষ ও তথ্যনির্ভর ক্যাম্পাস সাংবাদিকতায় অঙ্গীকারবদ্ধ।",
    "Messages from the leadership of MBSTU Reporters' Unity — committed to fearless, fair and factual campus journalism.",
  ],
  ['ডিজিটাল নোটিশ বোর্ড', 'Notice Board'],
  [
    'বিশ্ববিদ্যালয়, হল, বিভাগ ও মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশ।',
    "Latest notices from the university, halls, departments and MBSTU Reporters' Unity.",
  ],
  ['ক্লাব নিউজ কর্নার', 'Club Highlights'],
  [
    'মাভাবিপ্রবির ১০টি ক্যাম্পাস ক্লাব ও সংগঠনের সর্বশেষ কার্যক্রম।',
    'Latest activities from the 10 campus clubs and organisations of MBSTU.',
  ],
  ['ক্যাম্পাস সংবাদ', 'Latest Campus Reports'],
  ['মাভাবিপ্রবির সর্বত্র থেকে যাচাইকৃত প্রতিবেদন।', 'Verified reports from across MBSTU.'],
  ['স্টুডেন্ট কর্নার', 'Voices of Students'],
  [
    'মতামত, সৃজনশীল লেখা, গবেষণার আলোচিত অর্জন ও সাফল্য — মাভাবিপ্রবির শিক্ষার্থীদের লেখা।',
    'Opinions, creative writing, research highlights and achievements — written by MBSTU students.',
  ],
  ['ক্লাব', 'Club'],
  ['সংবাদ', 'News'],
]

const TO_EN = new Map(PAIRS.map(([bn, en]) => [bn, en]))
const TO_BN = new Map(PAIRS.map(([bn, en]) => [en, bn]))

// ছোট লেবেল (eyebrow): ইংরেজিতে যেমন আছে তেমনই, বাংলায় আলাদা ছোট রূপ
const EYEBROW_BN: Record<string, string> = {
  'Leadership & At a Glance': 'নেতৃত্ব ও এক নজরে',
  'Digital Notice Board': 'নোটিশ বোর্ড',
  'Club News Corner': 'ক্লাব সংবাদ',
  'Campus News': 'সর্বশেষ',
  'Student Corner': 'শিক্ষার্থীদের লেখা',
  News: 'সংবাদ',
}

export function translate(text: string, lang: Lang): string {
  const k = text.trim()
  if (lang === 'en') {
    const m = k.match(/^(.+) বিভাগের সর্বশেষ সংবাদ$/)
    if (m) return `Latest news in ${TO_EN.get(m[1]) ?? m[1]}`
    return TO_EN.get(k) ?? text
  }
  const m = k.match(/^Latest news in (.+)$/)
  if (m) return `${TO_BN.get(m[1]) ?? m[1]} বিভাগের সর্বশেষ সংবাদ`
  return TO_BN.get(k) ?? text
}

/** <Tr text="..." /> — জানা লেখা হলে অনুবাদ করে, না জানলে যেমন আছে তেমন রাখে */
export function Tr({ text, eyebrow = false }: { text: string; eyebrow?: boolean }) {
  const { lang } = useLang()
  if (eyebrow) return <>{lang === 'bn' ? EYEBROW_BN[text] ?? text : text}</>
  return <>{translate(text, lang)}</>
}
