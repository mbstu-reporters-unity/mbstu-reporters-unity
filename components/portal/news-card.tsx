import { ArrowRight, CalendarDays, User } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { UniversalMediaEmbed } from './universal-media-embed'

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const isExt = /^https?:\/\//i.test(href)
  const ext = isExt ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const excerpt = (p.heading || p.body || '').slice(0, 140)
  const date = new Date(p.created_at).toLocaleDateString('bn-BD')

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      
      {/* যদি ভিডিও/ছবির এম্বেড লিংক না থাকে, তাহলে আগের মতো সাধারণ কভার ফটো দেখাবে */}
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
        {/* এম্বেড লিংক থাকলে উপরে ক্যাটাগরি ব্যাজ প্রদর্শন */}
        {p.embed_media_url && (
          <span className="mb-2.5 inline-block w-fit rounded bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
            {p.category || 'সংবাদ'}
          </span>
        )}

        <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {date}
          </span>
          {p.author && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" aria-hidden="true" />
              {p.author}
            </span>
          )}
        </div>

        {/* ১. শিরোনাম (Title) */}
        <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-navy group-hover:text-brand">
          <a href={href} {...ext}>{p.title}</a>
        </h3>

        {/* ২. বিস্তারিত / উপশিরোনাম (Excerpt) */}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {excerpt}
        </p>

        {/* ⭐ ৩. লেখার ঠিক নিচে স্বয়ংক্রিয়ভাবে ভিডিও চলবে বা ছবির প্রিভিউ দেখাবে ⭐ */}
        {p.embed_media_url && (
          <UniversalMediaEmbed url={p.embed_media_url} title={p.title} className="mb-2" />
        )}

        <a href={href} {...ext} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          বিস্তারিত <ArrowRight className="size-4" aria-hidden="true" />
        </a>

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
