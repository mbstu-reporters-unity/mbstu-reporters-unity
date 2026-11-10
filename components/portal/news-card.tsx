import Link from 'next/link'
import { ArrowRight, CalendarDays, User } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { UniversalMediaEmbed } from './universal-media-embed'

// ⭐ যেকোনো তারিখকে স্পষ্ট বাংলা মাসের নাম সহ রূপান্তরকারী ফাংশন (যেমন: ৯ নভেম্বর ২০২৬) ⭐
function formatBanglaDate(val?: string | null): string {
  if (!val) return ''
  
  if (/জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/.test(val)) {
    return val
  }

  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
  }

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
    <article className="group flex flex-col overflow-hidden rounded-[2.25rem] border-[1.2px] border-white/20 bg-slate-950/60 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85),inset_0_1.5px_2px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-500/40 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.95),0_0_25px_rgba(249,115,22,0.18)]">
      
      {/* ছবি গ্যালারি */}
      {!p.embed_media_url && (
        <div className="overflow-hidden rounded-t-[2.25rem]">
          <CardGallery
            postId={p.id}
            cover={p.image_url}
            href={href}
            external={isExt}
            category={p.category || 'সংবাদ'}
            hasVideo={!!p.video_url}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        
        {/* ক্যাটাগরি ব্যাজ (ছবির GLASS ব্যাজের মতো অরেঞ্জ-রেড গ্রেডিয়েন্ট) */}
        {p.embed_media_url && (
          <span className="mb-3 inline-block w-fit rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 px-3.5 py-1 text-xs font-bold text-white shadow-md border border-white/30 tracking-wide uppercase">
            {p.category || 'ক্যাম্পাস সংবাদ'}
          </span>
        )}

        {/* তারিখ এবং রিপোর্টার ডার্ক গ্লাস চিপস */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-orange-200 bg-white/[0.08] border border-white/15 px-3 py-1 rounded-full shadow-inner">
            <CalendarDays className="size-3.5 text-orange-400 shrink-0" aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>

          {p.author && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300 bg-white/[0.06] border border-white/12 px-3 py-1 rounded-full">
              <User className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>{p.author}</span>
            </span>
          )}
        </div>

        {/* ১. শিরোনাম (উজ্জ্বল সাদা রঙ) */}
        <h3 className="mt-3.5 font-serif text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-orange-400 transition-colors drop-shadow-sm">
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
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300 font-medium">
          {excerpt}
        </p>

        {/* ৩. মিডিয়া প্লেয়ার */}
        {p.embed_media_url && (
          <UniversalMediaEmbed url={p.embed_media_url} title={p.title} className="mb-2 mt-3" />
        )}

        {/* ৪. বিস্তারিত পড়ুন বাটন (ছবির মতো অরেঞ্জ গ্রেডিয়েন্ট বাটন) */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
          {isExt ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 border border-white/30 px-4 py-2 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              <span>বিস্তারিত পড়ুন</span>
              <span className="flex size-4 items-center justify-center rounded-full bg-white/20 text-white">
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 border border-white/30 px-4 py-2 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              <span>বিস্তারিত পড়ুন</span>
              <span className="flex size-4 items-center justify-center rounded-full bg-white/20 text-white">
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </Link>
          )}

          {/* রিঅ্যাকশন বার */}
          <div className="shrink-0">
            <ReactionBar postId={p.id} title={p.title} />
          </div>
        </div>
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
