import Link from 'next/link'
import { CalendarDays, MapPin, TrendingUp, ArrowRight, Ticket, Eye } from 'lucide-react'
import { getCampusEvents } from '@/lib/events'
import { getTopPopularPosts, type Post } from '@/lib/sb'
import { SectionHeading } from './section-heading'
import { HomepageCompactCarousel } from './homepage-transition-sections'

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

export async function HomeEventsAndPopular({
  prefetchedPopularPosts,
  compact = false,
}: {
  prefetchedPopularPosts?: Post[]
  compact?: boolean
} = {}) {
  const [events, popular] = await Promise.all([
    getCampusEvents(),
    prefetchedPopularPosts ? Promise.resolve(prefetchedPopularPosts) : getTopPopularPosts(4),
  ])

  const upcomingEvents = events.filter((e) => e.is_upcoming !== false).slice(0, 2)
  const popularPosts = popular.slice(0, 4)

  if (upcomingEvents.length === 0 && popularPosts.length === 0) return null

  if (compact) {
    const slides = [
      ...upcomingEvents.map((event) => (
        <article key={`event-${event.id}`} className="glass-card space-y-4 p-4 text-white sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
              <CalendarDays className="size-4" aria-hidden="true" />
              {event.event_date}
            </span>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/20 px-2.5 py-1 text-[10px] font-bold text-cyan-100">
              {event.is_upcoming ? 'নিবন্ধন চলছে' : 'ইভেন্ট'}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-bold leading-snug sm:text-xl">{event.title}</h3>
            <p className="text-sm leading-relaxed text-slate-200 line-clamp-3">{event.description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-slate-300">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
              <span className="truncate">{event.venue}</span>
            </span>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <Ticket className="size-3.5" aria-hidden="true" />
              ইভেন্ট দেখুন
            </Link>
          </div>
        </article>
      )),
      ...popularPosts.map((post, index) => (
        <article key={`popular-${post.id}`} className="glass-card space-y-4 p-4 text-white sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
              <TrendingUp className="size-4" aria-hidden="true" />
              সর্বাধিক পঠিত সংবাদ · {bn(index + 1)}
            </span>
            <Link
              href="/search?q=&sort=popular"
              className="text-xs font-bold text-cyan-300 hover:underline"
            >
              আর্কাইভ
            </Link>
          </div>
          <Link href={`/post/${post.id}`} className="group block space-y-2">
            <span className="text-xs font-bold uppercase text-cyan-300">{post.category || 'সংবাদ'}</span>
            <h3 className="font-serif text-lg font-bold leading-snug transition-colors group-hover:text-cyan-200 sm:text-xl">
              {post.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span>{post.author || 'প্রতিবেদক'}</span>
              {post.view_count ? (
                <span className="inline-flex items-center gap-1 text-cyan-200">
                  <Eye className="size-3.5" aria-hidden="true" />
                  {bn(post.view_count)} বার পঠিত
                </span>
              ) : null}
            </div>
          </Link>
        </article>
      )),
    ]

    return (
      <section className="relative border-b border-white/10 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            inverted
            eyebrow="Events & Most Read"
            title="ইভেন্ট ও জনপ্রিয় সংবাদ"
            titleEn="Events & Most Read"
            action={
              <Link
                href="/events"
                className="inline-flex shrink-0 items-center rounded-full bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
              >
                সব দেখুন
              </Link>
            }
          />
          <HomepageCompactCarousel
            slides={slides}
            title="ইভেন্ট ও জনপ্রিয় সংবাদ"
            interval={8500}
            className="max-w-none"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* চলমান ও আসন্ন ইভেন্ট */}
          <div className="glass-card p-5 sm:p-6 space-y-4 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    <CalendarDays className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold">আসন্ন ইভেন্ট ও কর্মশালা</h3>
                    <p className="text-[11px] text-slate-300">ক্যাম্পাস সাংবাদিকতা প্রশিক্ষণ ও সেমিনার</p>
                  </div>
                </div>
                <Link href="/events" className="text-xs font-bold text-cyan-300 hover:underline">
                  সব দেখুন →
                </Link>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((ev) => (
                    <div key={ev.id} className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <CalendarDays className="size-3" /> {ev.event_date}
                        </span>
                        <span className="text-[10px] bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded font-bold border border-cyan-400/30">
                          {ev.is_upcoming ? 'নিবন্ধন চলছে' : 'ইভেন্ট'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base leading-snug">{ev.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{ev.description}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300 border-t border-white/10">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="size-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </span>
                        <Link
                          href="/events"
                          className="inline-flex items-center gap-1 rounded-full bg-cyan-500 text-slate-950 px-3 py-1 font-bold text-[10px] hover:bg-cyan-400 transition"
                        >
                          <Ticket className="size-3" />
                          <span>রেজিস্ট্রেশন</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 py-6 text-center">বর্তমানে কোনো আসন্ন ইভেন্ট নেই।</p>
              )}
            </div>

            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-cyan-300 transition mt-2"
            >
              <span>ইভেন্ট ক্যালেন্ডার ও সার্টিফিকেট ভেরিফিকেশন</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* সর্বাধিক পঠিত সংবাদ (Most Read) */}
          <div className="glass-card p-5 sm:p-6 space-y-4 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <TrendingUp className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold">সর্বাধিক পঠিত সংবাদ</h3>
                    <p className="text-[11px] text-slate-300">পাঠকদের সর্বাধিক পঠিত আলোচিত প্রতিবেদন</p>
                  </div>
                </div>
                <Link href="/search?q=&sort=popular" className="text-xs font-bold text-amber-300 hover:underline">
                  আর্কাইভ →
                </Link>
              </div>

              {popularPosts.length > 0 ? (
                <div className="space-y-3">
                  {popularPosts.map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-3 transition group"
                    >
                      <span className="flex size-7 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 font-bold text-sm shrink-0 border border-amber-400/30">
                        {bn(idx + 1)}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] text-cyan-300 font-bold uppercase">{post.category || 'সংবাদ'}</span>
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                          <span>{post.author || 'প্রতিবেদক'}</span>
                          {post.view_count ? (
                            <span className="flex items-center gap-1 text-cyan-200">
                              <Eye className="size-3" /> {bn(post.view_count)} বার পঠিত
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 py-6 text-center">কোনো সংবাদ পাওয়া যায়নি।</p>
              )}
            </div>

            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-amber-300 transition mt-2"
            >
              <span>ফিল্টারসহ সকল সংবাদ অনুসন্ধান করুন</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
