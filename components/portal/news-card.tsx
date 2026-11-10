import Link from 'next/link'
import { ArrowRight, CalendarDays, User } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { UniversalMediaEmbed } from './universal-media-embed'

// ⭐ যেকোনো তারিখকে স্পষ্ট বাংলা মাসের নাম সহ রূপান্তরকারী ফাংশন (যেমন: ৯ নভেম্বর ২০২৬) ⭐
function formatBanglaDate(val?: string | null): string {
  if (!val) return ''
  
  // তারিখটি অলরেডি বাংলা মাসের নামে থাকলে তাই রিটার্ন করবে
  if (/জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/.test(val)) {
    return val
  }

  // ISO বা ইংরেজি তারিখ হলে বাংলা মাস সহ ফরম্যাট
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
  }

  // সংখ্যায় থাকলে (যেমন: ৯/১১/২০২৬ বা 9/11/2026) তাকে বাংলায় রূপান্তর
  const normalized = val.replace(/[০-৯]/g, (digit) => '০১২৩৪৫৬৭৮৯'.indexOf(digit).toString())
  const parts = normalized.split(/[/\-.]/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ]
    const toBn = (n: number | string) => String(n).replace(/\d/g, (x) => '০১২৩৪৫৬৭৮৯'[Number(x)])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${toBn(day)} ${monthsBn[month - 1]} ${toBn(year)}`
    }
  }

  return val
}

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const isExt = /^https?:\/\//i.test(href)
  const excerpt = (p.heading || p.body || '').slice(0, 140)
  const formattedDate = formatBanglaDate(p.created_at)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      
      {/* যদি ভিডিও/ছবির এম্বেড লিংক না থাকে, তাহলে কভার ফটো দেখাবে */}
      {!p.embed_media_url && (
        <CardGallery
          postId={p.id}
          cover={p.image_url}
          href={href}
          external={isExt}
          category={p.category || 'সংবাদ'}
          hasVideo={!!p.video_url}
        />
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* ক্যাটাগরি ব্যাজ */}
        {p.embed_media_url && (
          <span className="mb-2.5 inline-block w-fit rounded bg-brand px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
            {p.category || 'ক্যাম্পাস সংবাদ'}
          </span>
        )}

        {/* বাংলা তারিখ এবং রিপোর্টার ব্যাজ */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-950 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
            <CalendarDays className="size-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>

          {p.author && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <User className="size-3.5 text-slate-600 shrink-0" aria-hidden="true" />
              <span>{p.author}</span>
            </span>
          )}
        </div>

        {/* ১. শিরোনাম (SPA Link যুক্ত) */}
        <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-navy group-hover:text-brand transition-colors">
          {isExt ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {p.title}
            </a>
          ) : (
            <Link href={href}>
              {p.title}
            </Link>
          )}
        </h3>

        {/* ২. বিস্তারিত / উপশিরোনাম */}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-700">
          {excerpt}
        </p>

        {/* ৩. মিডিয়া প্লেয়ার (ছবি বা ভিডিও লিংক থাকলে) */}
        {p.embed_media_url && (
          <UniversalMediaEmbed url={p.embed_media_url} title={p.title} className="mb-2" />
        )}

        {/* ৪. বিস্তারিত পড়ুন অ্যাকশন বাটন (SPA Link যুক্ত) */}
        {isExt ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
          >
            বিস্তারিত পড়ুন <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        ) : (
          <Link
            href={href}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
          >
            বিস্তারিত পড়ুন <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}

        <ReactionBar postId={p.id} title={p.title} />
      </div>
    </article>
  )
}

export function NewsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <NewsCard key={p.id} p={p} />
      ))}
    </div>
  )
}
