'use client'

import Link from 'next/link'
import { ArrowRight, Layers } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { NewsGrid } from './news-card'
import { SectionHeading } from './section-heading'

// ক্যাটাগরি রঙের প্যালেট — globals.css-এর data-category-palette মান ব্যবহার করা হচ্ছে
const PALETTES = ['sky', 'amber', 'indigo', 'violet', 'emerald', 'rose', 'teal', 'slate'] as const
const PALETTE_BY_NAME: Record<string, (typeof PALETTES)[number]> = {
  'ক্যাম্পাস সংবাদ': 'sky',
  ক্লাব: 'amber',
  'স্টুডেন্ট কর্নার': 'slate',
  একাডেমিক: 'indigo',
  গবেষণা: 'violet',
  খেলাধুলা: 'emerald',
  সংস্কৃতি: 'rose',
  পরিবেশ: 'teal',
}

function getpalette(cat: string): (typeof PALETTES)[number] {
  const known = PALETTE_BY_NAME[cat]
  if (known) return known
  let hash = 0
  for (const ch of cat) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTES[hash % PALETTES.length]
}

// প্যালেট নাম → Tailwind/CSS কাস্টম প্রপার্টি ম্যাপ
// (globals.css-এ .news-card-category[data-category-palette='*'] দিয়ে নিয়ন্ত্রিত হয়)
// এখানে সেকশন হেডার ব্যাজের জন্য ইনলাইন স্টাইল ব্যবহার করা হচ্ছে
const BADGE_STYLES: Record<(typeof PALETTES)[number], { bg: string; text: string; border: string }> = {
  sky:     { bg: '#075985', text: '#ffffff', border: '#0e7490' },
  amber:   { bg: '#92400e', text: '#ffffff', border: '#b45309' },
  indigo:  { bg: '#3730a3', text: '#ffffff', border: '#4338ca' },
  violet:  { bg: '#6b21a8', text: '#ffffff', border: '#7e22ce' },
  emerald: { bg: '#166534', text: '#ffffff', border: '#15803d' },
  rose:    { bg: '#9f1239', text: '#ffffff', border: '#be123c' },
  teal:    { bg: '#115e59', text: '#ffffff', border: '#0f766e' },
  slate:   { bg: '#334155', text: '#ffffff', border: '#475569' },
}

export function CategoryFeedBlock({
  cat,
  index,
  posts,
  archiveLimit: _archiveLimit,
  eyebrow,
  subSuffixBn,
  subPrefixEn,
}: {
  cat: string
  index: number
  posts: Post[]
  archiveLimit: number
  eyebrow: string
  subSuffixBn: string
  subPrefixEn: string
}) {
  const palette = getpalette(cat)
  const style = BADGE_STYLES[palette]

  return (
    <section
      id={`cat-${index}`}
      className="border-b border-white/10 py-10 sm:py-14 relative"
      aria-label={`${cat} বিভাগ`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        {/* সেকশন শিরোনাম — ক্যাটাগরি ব্যাজ সহ */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* রঙিন ক্যাটাগরি ব্যাজ */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border"
              style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
              aria-label={`ক্যাটাগরি: ${cat}`}
            >
              <Layers className="size-3.5" aria-hidden="true" />
              {cat}
            </span>
          </div>

          {/* আর্কাইভ লিঙ্ক */}
          <Link
            href={`/category/${encodeURIComponent(cat)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/20 active:scale-95"
          >
            সব দেখুন
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <SectionHeading
          inverted
          eyebrow={eyebrow}
          title={cat}
          subtitle={`${cat} ${subSuffixBn}`}
          subtitleEn={`${subPrefixEn} ${cat}`}
        />

        {posts.length ? (
          <NewsGrid posts={posts.slice(0, 3)} />
        ) : (
          <p className="glass-card p-5 text-sm text-slate-200">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>
        )}
      </div>
    </section>
  )
}
