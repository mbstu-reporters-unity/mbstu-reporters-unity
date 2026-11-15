'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, Globe, User } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { PostMetaBadges } from './post-meta-badges'
import { FormattedText } from './formatted-text'

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

function cleanText(text?: string | null): string {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function truncateText(clean: string, maxLength = 140): { short: string; hasMore: boolean } {
  if (clean.length <= maxLength) return { short: clean, hasMore: false }
  const truncated = clean.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  const cut = lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated
  return { short: cut, hasMore: true }
}

export function NewsCard({ p }: { p: Post }) {
  const [expanded, setExpanded] = useState(false)
  const articleRef = useRef<HTMLElement>(null)

  const formattedDate = formatBanglaDate(p.created_at)
  const authorName = p.author?.trim() || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'
  const categoryName = p.category || 'ক্যাম্পাস সংবাদ'
  const showAvatar = Boolean(p.author_avatar && p.show_author_avatar !== false)

  const pageInfo = p.page || null
  const primaryHref = pageInfo ? `/p/${pageInfo.slug}` : p.user_id ? `/u/${p.user_id}` : null
  const primaryAvatar = pageInfo ? pageInfo.avatar_url : showAvatar ? p.author_avatar : null
  const primaryName = pageInfo ? pageInfo.name : authorName

  const fullBody = cleanText(p.body)
  const { short: shortBody, hasMore } = truncateText(fullBody, 140)

  function toggleExpand() {
    setExpanded((prev) => !prev)
  }

  return (
    <article
      ref={articleRef}
      className="scroll-mt-20 group flex flex-col bg-[var(--theme-card-bg,rgba(14,34,78,0.65))] backdrop-blur-xl transition-all md:glass-card rounded-2xl border border-white/10"
    >
      {/* ১. পেজ ও পোস্টদাতার তথ্য */}
      <div className="flex items-center justify-between gap-2.5 px-3.5 pt-3.5 pb-2.5 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          {primaryHref ? (
            <Link href={primaryHref} className="shrink-0">
              {primaryAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryAvatar}
                  alt={primaryName}
                  className="size-10 rounded-full object-cover object-top ring-2 ring-cyan-400/50 shadow-sm bg-slate-900"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm ring-2 ring-white/25 shadow-sm">
                  {primaryName ? primaryName.charAt(0) : <User className="size-4" />}
                </div>
              )}
            </Link>
          ) : primaryAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryAvatar}
              alt={primaryName}
              className="size-10 shrink-0 rounded-full object-cover object-top ring-2 ring-cyan-400/50 shadow-sm bg-slate-900"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm ring-2 ring-white/25 shadow-sm">
              {primaryName ? primaryName.charAt(0) : <User className="size-4" />}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              {primaryHref ? (
                <Link
                  href={primaryHref}
                  className="text-sm font-bold text-white hover:text-cyan-300 truncate leading-tight transition-colors"
                >
                  {primaryName}
                </Link>
              ) : (
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {primaryName}
                </p>
              )}
              {pageInfo?.is_verified && (
                <CheckCircle2 className="size-3.5 fill-blue-500 text-white shrink-0" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-cyan-200/85 mt-0.5">
              {pageInfo && (
                <>
                  {p.user_id ? (
                    <Link href={`/u/${p.user_id}`} className="text-white/80 hover:text-cyan-300 hover:underline truncate max-w-[120px]">
                      {authorName}
                    </Link>
                  ) : (
                    <span className="text-white/80 truncate max-w-[120px]">{authorName}</span>
                  )}
                  <span>·</span>
                </>
              )}
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
          href={pageInfo ? `/p/${pageInfo.slug}` : `/category/${encodeURIComponent(categoryName)}`}
          className="shrink-0 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-[11px] font-bold text-cyan-200 border border-white/20 backdrop-blur-md transition max-w-[120px] truncate"
        >
          {pageInfo ? 'পেজ' : categoryName}
        </Link>
      </div>

      {/* ২. মিডিয়া (ভিডিও বা ছবি) */}
      <CardGallery
        postId={p.id}
        cover={p.image_url}
        videoUrl={p.video_url}
        embedMediaUrl={p.embed_media_url}
        postTitle={p.title}
        postDate={p.created_at}
      />

      {/* ৩. শিরোনাম ও লেখা */}
      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3 sm:px-5 sm:pb-4 space-y-2">
        <h3
          onClick={toggleExpand}
          className="font-serif text-lg sm:text-xl font-bold leading-snug text-white hover:text-cyan-200 transition-colors drop-shadow-sm cursor-pointer select-none"
        >
          {p.title}
        </h3>

        {p.heading && p.heading.trim() !== p.title.trim() && (
          <p
            onClick={toggleExpand}
            className="text-xs sm:text-sm font-medium text-cyan-100/90 leading-snug border-l-2 border-cyan-400/70 pl-2.5 cursor-pointer"
          >
            {p.heading}
          </p>
        )}

        <PostMetaBadges data={p} compact={!expanded} />

        {p.body && (
          <div
            onClick={toggleExpand}
            className="text-xs sm:text-sm leading-relaxed text-slate-200 opacity-95 cursor-pointer"
          >
            {expanded ? (
              <div className="space-y-2">
                <FormattedText text={p.body} className="text-xs sm:text-sm text-slate-100 leading-relaxed" />
                <Link
                  href={`/post/${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block text-xs font-bold text-cyan-300 hover:underline pt-1"
                >
                  আলাদা পেজে দেখুন →
                </Link>
              </div>
            ) : (
              <p className="whitespace-pre-line">
                {hasMore ? (
                  <>
                    <span>{shortBody}</span>
                    <span className="ml-1 font-bold text-cyan-300">...আরও দেখুন</span>
                  </>
                ) : (
                  fullBody
                )}
              </p>
            )}
          </div>
        )}

        {/* ৪. ইনলাইন রিয়েক্ট ও ফেসবুক কমেন্ট */}
        <div className="mt-auto pt-2 border-t border-white/15">
          <ReactionBar
            postId={p.id}
            title={p.title}
            noTopBorder
            inlineComments
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
