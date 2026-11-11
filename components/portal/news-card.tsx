import Link from 'next/link'
import { ArrowRight, CalendarDays, User } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { UniversalMediaEmbed } from './universal-media-embed'

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
  return val
}

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const isExt = /^https?:\/\//i.test(href)
  const excerpt = (p.heading || p.body || '').slice(0, 140)
  const formattedDate = formatBanglaDate(p.created_at)

  return (
    <article className="theme-card group flex flex-col overflow-hidden">
      
      {/* ছবি গ্যালারি */}
      {!p.embed_media_url && (
        <div className="overflow-hidden rounded-t-[1.5rem]">
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
        
        {/* ক্যাটাগরি ব্যাজ */}
        {p.embed_media_url && (
          <span className="mb-3 inline-block w-fit rounded-lg bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wide">
            {p.category || 'ক্যাম্পাস সংবাদ'}
          </span>
        )}

        {/* তারিখ ও রিপোর্টার চিপস */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-full bg-[var(--theme-pill-bg)] border border-[var(--theme-pill-border)] text-[var(--theme-pill-text)]">
            <CalendarDays className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>

          {p.author && (
            <span className="inline-flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--theme-text-muted)]">
              <User className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
              <span>{p.author}</span>
            </span>
          )}
        </div>

        {/* ১. শিরোনাম */}
        <h3 className="mt-3.5 font-serif text-lg sm:text-xl font-bold leading-snug text-[var(--theme-text-title)] group-hover:text-brand transition-colors">
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
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--theme-text-body)] opacity-90">
          {excerpt}
        </p>

        {/* ৩. মিডিয়া প্লেয়ার */}
        {p.embed_media_url && (
          <UniversalMediaEmbed url={p.embed_media_url} title={p.title} className="mb-2 mt-3" />
        )}

        {/* ৪. বাটন ও রিঅ্যাকশন */}
        <div className="mt-auto pt-4 border-t border-[var(--theme-divider)] flex items-center justify-between gap-3">
          {isExt ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-white hover:bg-brand-dark px-3.5 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span>বিস্তারিত পড়ুন</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-white hover:bg-brand-dark px-3.5 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span>বিস্তারিত পড়ুন</span>
              <ArrowRight className="size-3" aria-hidden="true" />
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
