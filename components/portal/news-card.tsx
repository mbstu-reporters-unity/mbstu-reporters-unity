import Link from 'next/link'
import { ArrowRight, CalendarDays, User, Sparkles } from 'lucide-react'
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
    <article className="glass-card group flex flex-col overflow-hidden">
      
      {/* ছবি গ্যালারি */}
      {!p.embed_media_url && (
        <div className="overflow-hidden rounded-t-[1.75rem] border-b border-white/10">
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

      <div className="flex flex-1 flex-col p-5 sm:p-6 space-y-3">
        
        {/* ক্যাটাগরি পিল (স্ক্রিনশটের মতো ব্যাজ) */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white border border-white/25 backdrop-blur-md shadow-xs">
            <Sparkles className="size-3 text-cyan-300" />
            <span>{p.category || 'ক্যাম্পাস সংবাদ'}</span>
          </span>

          {p.author && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              <User className="size-3 text-cyan-300 shrink-0" />
              <span>{p.author}</span>
            </span>
          )}
        </div>

        {/* তারিখ */}
        <div className="text-xs text-cyan-200/90 flex items-center gap-1 font-medium">
          <CalendarDays className="size-3.5 text-cyan-300 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {/* ১. শিরোনাম */}
        <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors drop-shadow-sm">
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

        {/* ২. বিস্তারিত লেখা */}
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-200 opacity-95">
          {excerpt}
        </p>

        {/* ৩. মিডিয়া প্লেয়ার */}
        {p.embed_media_url && (
          <UniversalMediaEmbed url={p.embed_media_url} title={p.title} className="mb-1 mt-2" />
        )}

        {/* ৪. স্ক্রিনশটের মতো গ্রেডিয়েন্ট বাটন ও রিঅ্যাকশন */}
        <div className="mt-auto pt-4 border-t border-white/15 flex items-center justify-between gap-3">
          {isExt ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 text-xs font-bold shadow-md border border-white/30 transition-all active:scale-95"
            >
              <span>বিস্তারিত পড়ুন</span>
              <ArrowRight className="size-3" />
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 text-xs font-bold shadow-md border border-white/30 transition-all active:scale-95"
            >
              <span>বিস্তারিত পড়ুন</span>
              <ArrowRight className="size-3" />
            </Link>
          )}

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
