'use client'

import Link from 'next/link'
import { ArrowRight, Layers } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { NewsGrid } from './news-card'
import { SectionHeading } from './section-heading'

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
      className="border-b border-[var(--theme-card-border)] py-8 sm:py-12 relative"
      aria-label={`${cat} বিভাগ`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border shadow-xs"
              style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
              aria-label={`ক্যাটাগরি: ${cat}`}
            >
              <Layers className="size-3.5" aria-hidden="true" />
              {cat}
            </span>
          </div>

          <Link
            href={`/category/${encodeURIComponent(cat)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] hover:bg-[var(--theme-brand-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--theme-text-title)] hover:text-[var(--theme-brand)] transition active:scale-95 shadow-xs"
          >
            সব দেখুন
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <SectionHeading
          inverted={false}
          eyebrow={eyebrow}
          title={cat}
          subtitle={`${cat} ${subSuffixBn}`}
          subtitleEn={`${subPrefixEn} ${cat}`}
        />

        {posts.length ? (
          <NewsGrid posts={posts.slice(0, 3)} />
        ) : (
          <p className="glass-card p-5 text-sm text-[var(--theme-text-body)]">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>
        )}
      </div>
    </section>
  )
}
