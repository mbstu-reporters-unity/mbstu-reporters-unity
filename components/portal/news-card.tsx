import { ArrowRight, CalendarDays, User, Video } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const ext = /^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const excerpt = (p.heading || p.body || '').slice(0, 140)
  const date = new Date(p.created_at).toLocaleDateString('bn-BD')

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <a href={href} {...ext} className="relative block overflow-hidden bg-gray-100">
        {p.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt="" className="block h-auto w-full transition-transform duration-500 group-hover:scale-105" />
        )}
        <span className="absolute left-4 top-4 rounded bg-brand px-2.5 py-1 text-xs font-bold text-white">{p.category || 'সংবাদ'}</span>
        {p.video_url && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-xs text-white">
            <Video className="size-3" aria-hidden="true" /> ভিডিও
          </span>
        )}
      </a>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />{date}</span>
          {p.author && <span className="inline-flex items-center gap-1"><User className="size-3.5" aria-hidden="true" />{p.author}</span>}
        </div>
        <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-navy group-hover:text-brand">
          <a href={href} {...ext}>{p.title}</a>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
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
