import { ArrowUpRight, Award, BookOpen, Feather, GraduationCap, MessageSquareQuote } from 'lucide-react'
import { getStudentItems, getLimits, CAT_STUDENT } from '@/lib/sb'
import { SectionHeading } from './section-heading'

const typeIcon: Record<string, typeof Award> = {
  Opinion: MessageSquareQuote,
  'Creative Writing': Feather,
  Achievement: Award,
  'Research Highlight': BookOpen,
}

function AuthorBadges({ dept, batch }: { dept?: string | null; batch?: string | null }) {
  if (!dept && !batch) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {dept && (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
          <GraduationCap className="size-3" aria-hidden="true" />
          {dept}
        </span>
      )}
      {batch && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-[#8a6a0a]">{batch}</span>}
    </div>
  )
}

function linkProps(url?: string | null) {
  const href = url?.trim() || '#student-corner'
  const ext = /^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return { href, ...ext }
}

export async function StudentCorner() {
  const [all, limits] = await Promise.all([getStudentItems(false), getLimits()])
  if (!all.length) return null
  const limit = limits[`limit:${CAT_STUDENT}`] || 12
  const featured = all.find((i) => i.featured) || all[0]
  const rest = all.filter((i) => i.id !== featured.id).slice(0, Math.max(0, limit - 1))
  const FeaturedIcon = typeIcon[featured.kind] || MessageSquareQuote

  return (
    <section id="student-corner" className="bg-brand-soft/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Student Corner"
          title="স্টুডেন্ট কর্নার"
          subtitle="Opinions, creative writing, research highlights and achievements — written by MBSTU students."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="group relative overflow-hidden rounded-2xl bg-navy text-white shadow-lg">
            <div className="relative aspect-[4/3] sm:aspect-[16/11]">
              {featured.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded bg-crimson px-2.5 py-1 text-xs font-bold">
                <FeaturedIcon className="size-3.5" aria-hidden="true" />
                {featured.kind}
              </span>
              <h3 className="mt-3 text-balance font-serif text-xl font-bold leading-snug sm:text-2xl">
                {featured.link_url ? <a {...linkProps(featured.link_url)}>{featured.title}</a> : featured.title}
              </h3>
              {featured.excerpt && <p className="mt-2 line-clamp-2 text-sm text-white/80">{featured.excerpt}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {featured.author && <span className="text-sm font-semibold">{featured.author}</span>}
                <AuthorBadges dept={featured.dept} batch={featured.batch} />
              </div>
            </div>
          </article>

          <ul className="grid gap-4 sm:grid-cols-2">
            {rest.map((item) => {
              const Icon = typeIcon[item.kind] || MessageSquareQuote
              return (
                <li key={item.id}>
                  <a
                    {...linkProps(item.link_url)}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {item.kind}
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-brand" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 flex-1 text-pretty font-serif text-base font-bold leading-snug text-navy group-hover:text-brand">
                      {item.title}
                    </h3>
                    <div className="mt-4 space-y-2 border-t border-border pt-3">
                      {item.author && <p className="text-sm font-medium text-navy">{item.author}</p>}
                      <AuthorBadges dept={item.dept} batch={item.batch} />
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
