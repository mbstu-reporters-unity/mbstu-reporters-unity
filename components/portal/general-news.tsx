import { ArrowRight, CalendarDays, User, Video } from 'lucide-react'
import { getVisiblePosts, getHomeLimit } from '@/lib/sb'
import { SectionHeading } from './section-heading'

export async function GeneralNews() {
  const limit = await getHomeLimit()
  const posts = await getVisiblePosts(limit)
  const items = posts.map((p) => {
    const href = p.link_url?.trim() || `/post/${p.id}`
    return {
      key: p.id,
      href,
      external: /^https?:\/\//i.test(href),
      image: p.image_url,
      category: p.category || 'সংবাদ',
      title: p.title,
      excerpt: (p.heading || p.body || '').slice(0, 140),
      date: new Date(p.created_at).toLocaleDateString('bn-BD'),
      author: p.author || '',
      video: !!p.video_url,
    }
  })

  return (
    <section id="general-news" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Campus News"
          title="ক্যাম্পাস সংবাদ"
          subtitle="Verified reports from across MBSTU."
        />
        <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => {
            const ext = n.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
            return (
              <article key={n.key} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <a href={n.href} {...ext} className="relative block overflow-hidden bg-gray-100">
                  {n.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.image} alt="" className="block h-auto w-full transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <span className="absolute left-4 top-4 rounded bg-brand px-2.5 py-1 text-xs font-bold text-white">{n.category}</span>
                  {n.video && (
                    <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-xs text-white">
                      <Video className="size-3" aria-hidden="true" /> ভিডিও
                    </span>
                  )}
                </a>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />{n.date}</span>
                    {n.author && <span className="inline-flex items-center gap-1"><User className="size-3.5" aria-hidden="true" />{n.author}</span>}
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-navy group-hover:text-brand">
                    <a href={n.href} {...ext}>{n.title}</a>
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{n.excerpt}</p>
                  <a href={n.href} {...ext} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    বিস্তারিত <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
