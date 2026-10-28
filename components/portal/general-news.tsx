import Image from 'next/image'
import { ArrowRight, CalendarDays, Clock, User } from 'lucide-react'
import { generalNews } from '@/lib/data'
import { SectionHeading } from './section-heading'

export function GeneralNews() {
  return (
    <section id="general-news" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="General Campus News"
          title="সাধারণ ক্যাম্পাস সংবাদ"
          subtitle="Verified reports from across MBSTU — academics, administration, environment and sports."
          action={
            <a href="#general-news" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
              View all news <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {generalNews.map((news) => (
            <article
              key={news.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={news.image}
                  alt={news.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 rounded bg-brand px-2.5 py-1 text-xs font-bold text-white">
                  {news.category}
                </span>
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-xs text-white backdrop-blur">
                  <Clock className="size-3" aria-hidden="true" />
                  {news.readTime}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {news.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3.5" aria-hidden="true" />
                    {news.author}
                  </span>
                </div>
                <h3 className="mt-3 text-pretty font-serif text-lg font-bold leading-snug text-navy transition-colors group-hover:text-brand">
                  <a href="#general-news">{news.title}</a>
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{news.excerpt}</p>
                <a
                  href="#general-news"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-all hover:gap-2.5"
                >
                  Read More / বিস্তারিত
                  <ArrowRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">: {news.title}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
