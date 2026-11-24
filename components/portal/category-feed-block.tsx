'use client'

import Link from 'next/link'
import { ArrowRight, ArrowLeft, Layers } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { buildHomepageRotation } from '@/lib/homepage-feed'
import { NewsGrid } from './news-card'
import { SectionHeading } from './section-heading'
import { useHomepageAutoplay } from './use-homepage-autoplay'
import { useMemo } from 'react'

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
  initialNow,
}: {
  cat: string
  index: number
  posts: Post[]
  archiveLimit: number
  eyebrow: string
  subSuffixBn: string
  subPrefixEn: string
  initialNow: number
}) {
  const palette = getpalette(cat)
  const style = BADGE_STYLES[palette]

  // ওয়েইটেড রোটেশন তৈরি করি (homepage-feed এলগরিদম)
  const rotation = useMemo(
    () => buildHomepageRotation(posts, (p) => p.created_at, initialNow),
    [posts, initialNow],
  )

  const autoplay = useHomepageAutoplay(rotation.length, 7000, index)
  const current = rotation[autoplay.index]

  const uniqIds = Array.from(new Set(rotation.map((p) => p.id)))
  const dotIndex = uniqIds.indexOf(current?.id ?? '')

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

        {/* রোটেটিং কার্ড */}
        {current ? (
          <div
            ref={autoplay.containerRef}
            {...autoplay.interactionProps}
            className="touch-pan-y"
            role="region"
            aria-label={`${cat} ফিড`}
            aria-live="polite"
            aria-atomic="false"
          >
            <div
              key={current.id}
              className={`${
                autoplay.reducedMotion ? '' : 'animate-in fade-in slide-in-from-right-4 duration-500'
              } motion-reduce:animate-none`}
            >
              <NewsGrid posts={[current]} />
            </div>

            {/* নেভিগেশন — ডট + বাটন */}
            {rotation.length > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  className="text-xs font-bold rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                >
                  {autoplay.index + 1} / {uniqIds.length}
                </span>

                <div className="flex items-center gap-2">
                  {/* ডট ইন্ডিকেটর */}
                  {uniqIds.length <= 7 && (
                    <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
                      {uniqIds.map((id, i) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            autoplay.setIndex(rotation.findIndex((p) => p.id === id))
                          }
                          aria-label={`${i + 1} নম্বর সংবাদে যান`}
                          className={`rounded-full transition-all duration-300 ${
                            i === dotIndex
                              ? 'w-5 h-2'
                              : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                          }`}
                          style={i === dotIndex ? { backgroundColor: style.bg, width: '1.25rem' } : {}}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={autoplay.previous}
                    aria-label="আগের সংবাদ"
                    className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-95"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={autoplay.next}
                    aria-label="পরের সংবাদ"
                    className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-95"
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* মোবাইল সোয়াইপ ইঙ্গিত */}
            {rotation.length > 1 && (
              <p className="mt-1.5 text-center text-[10px] text-white/30 sm:hidden select-none" aria-hidden="true">
                ← আঙুল দিয়ে সোয়াইপ করুন →
              </p>
            )}
          </div>
        ) : (
          <p className="glass-card p-5 text-sm text-slate-200">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>
        )}
      </div>
    </section>
  )
}
