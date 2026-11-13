import Link from 'next/link'
import { CalendarDays, Globe, User } from 'lucide-react'
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

function cleanExcerpt(text?: string | null, maxLength = 150): string {
  if (!text) return ''
  const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const truncated = clean.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

function extractFirstImageUrl(raw?: string | null): string | null {
  if (!raw || !raw.trim()) return null
  const s = raw.trim()
  const isVideo = (u: string) =>
    /youtube\.com|youtu\.be|facebook\.com|fb\.watch|\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u)

  if (s.startsWith('[') || s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      const firstImg = arr.find((x) => x?.url && !isVideo(x.url))
      return firstImg?.url || null
    } catch {}
  }
  if (/^https?:\/\//i.test(s) && !isVideo(s)) return s
  return null
}

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const isExt = /^https?:\/\//i.test(href)
  const formattedDate = formatBanglaDate(p.created_at)

  const coverImage = p.image_url || extractFirstImageUrl(p.embed_media_url) || null
  const authorName = p.author?.trim() || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'
  const categoryName = p.category || 'ক্যাম্পাস সংবাদ'
  const bodyExcerpt = cleanExcerpt(p.body, 150)

  return (
    <article className="group flex flex-col overflow-hidden bg-[var(--theme-card-bg,rgba(14,34,78,0.65))] backdrop-blur-xl transition-all md:glass-card">
      {/* ১. পোস্টকারীর তথ্য: সবার উপরে বামপাশের কোনায় (ফেসবুকের মতো) */}
      <div className="flex items-center justify-between gap-2.5 px-3.5 pt-3.5 pb-2.5 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm ring-2 ring-white/25 shadow-sm">
            {authorName ? authorName.charAt(0) : <User className="size-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {authorName}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-cyan-200/85 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3 text-cyan-300 shrink-0" />
                <span>{formattedDate}</span>
              </span>
              <span>·</span>
              <Globe className="size-3 opacity-80 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>

        <Link
          href={`/category/${encodeURIComponent(categoryName)}`}
          className="shrink-0 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-[11px] font-bold text-cyan-200 border border-white/20 backdrop-blur-md transition"
        >
          {categoryName}
        </Link>
      </div>

      {/* ২. মিডিয়া (ছবি / কোলাজ / ডিরেক্ট ভিডিও / লিংক ভিডিও — এজ-টু-এজ ফ্রি সাইজ) */}
      <CardGallery
        postId={p.id}
        cover={coverImage}
        videoUrl={p.video_url}
        embedMediaUrl={p.embed_media_url}
        href={href}
        external={isExt}
      />

      {/* ৩. শিরোনাম, উপশিরোনাম, বিস্তারিত ও মেটা ব্যাজ */}
      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5 sm:px-5 sm:pb-5 space-y-2">
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

        {p.heading && p.heading.trim() !== p.title.trim() && (
          <p className="text-xs sm:text-sm font-medium text-cyan-100/90 leading-snug border-l-2 border-cyan-400/70 pl-2.5">
            {p.heading}
          </p>
        )}

        <PostMetaBadges data={p} compact />

        {bodyExcerpt && (
          <p className="line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-200 opacity-95">
            {bodyExcerpt}
          </p>
        )}

        {/* ৪. বটম অ্যাকশন বার: রিঅ্যাকশন, বিস্তারিত ও শেয়ার */}
        <div className="mt-auto pt-2.5 border-t border-white/15">
          <ReactionBar
            postId={p.id}
            title={p.title}
            readMoreHref={href}
            readMoreExternal={isExt}
            noTopBorder
          />
        </div>
      </div>
    </article>
  )
}

export function NewsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col divide-y divide-white/20 border-y border-white/15 md:border-y-0 md:divide-y-0 md:grid md:items-start md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <NewsCard key={p.id} p={p} />
      ))}
    </div>
  )
}
