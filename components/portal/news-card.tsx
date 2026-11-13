import Link from 'next/link'
import { ArrowRight, CalendarDays, User, Sparkles, Images } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { PostMetaBadges } from './post-meta-badges'

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

function cleanExcerpt(text?: string | null, maxLength = 130): string {
  if (!text) return ''
  const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const truncated = clean.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

function extractFirstMediaUrl(raw?: string | null): string | null {
  if (!raw || !raw.trim()) return null
  const s = raw.trim()
  if (s.startsWith('[') || s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed) && parsed[0]?.url) return parsed[0].url
      if (parsed?.url) return parsed.url
    } catch {}
  }
  if (/^https?:\/\//i.test(s)) return s
  return null
}

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const isExt = /^https?:\/\//i.test(href)
  const excerpt = cleanExcerpt(p.heading || p.body, 130)
  const formattedDate = formatBanglaDate(p.created_at)

  const coverImage = p.image_url || extractFirstMediaUrl(p.embed_media_url) || null
  const hasVideo = !!p.video_url || (p.embed_media_url?.includes('youtube') || p.embed_media_url?.includes('youtu.be') || p.embed_media_url?.includes('facebook') || p.embed_media_url?.includes('video'))
  const hasExtraMedia = !!p.embed_media_url

  return (
    <article className="glass-card group flex flex-col overflow-hidden">
      <div className="relative overflow-hidden rounded-t-[1.75rem] border-b border-white/10 bg-black/25">
        <CardGallery
          postId={p.id}
          cover={coverImage}
          href={href}
          external={isExt}
          category={p.category || 'সংবাদ'}
          hasVideo={Boolean(hasVideo)}
        />

        {hasExtraMedia && !hasVideo && (
          <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
            <Images className="size-3 text-cyan-400" />
            <span>মাল্টিমিডিয়া</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6 space-y-3">
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

        <div className="text-xs text-cyan-200/90 flex items-center gap-1 font-medium">
          <CalendarDays className="size-3.5 text-cyan-300 shrink-0" />
          <span>{formattedDate}</span>
        </div>

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

        <PostMetaBadges data={p} compact />

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-200 opacity-95">
          {excerpt}
        </p>

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
