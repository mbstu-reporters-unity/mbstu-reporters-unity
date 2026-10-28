import Image from 'next/image'
import { ArrowUpRight, Award, BookOpen, Feather, GraduationCap, MessageSquareQuote } from 'lucide-react'
import { studentFeatured, studentPosts } from '@/lib/data'
import { SectionHeading } from './section-heading'

const typeIcon: Record<string, typeof Award> = {
  Opinion: MessageSquareQuote,
  'Creative Writing': Feather,
  Achievement: Award,
  'Research Highlight': BookOpen,
}

function AuthorBadges({ dept, batch }: { dept: string; batch: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
        <GraduationCap className="size-3" aria-hidden="true" />
        {dept}
      </span>
      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-[#8a6a0a]">{batch}</span>
    </div>
  )
}

export function StudentCorner() {
  const FeaturedIcon = typeIcon[studentFeatured.type]

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
              <Image
                src={studentFeatured.image}
                alt={studentFeatured.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded bg-crimson px-2.5 py-1 text-xs font-bold">
                <FeaturedIcon className="size-3.5" aria-hidden="true" />
                {studentFeatured.type}
              </span>
              <h3 className="mt-3 text-balance font-serif text-xl font-bold leading-snug sm:text-2xl">
                {studentFeatured.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-white/80">{studentFeatured.excerpt}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold">{studentFeatured.author}</span>
                <AuthorBadges dept={studentFeatured.dept} batch={studentFeatured.batch} />
              </div>
            </div>
          </article>

          <ul className="grid gap-4 sm:grid-cols-2">
            {studentPosts.map((post) => {
              const Icon = typeIcon[post.type]
              return (
                <li key={post.title}>
                  <a
                    href="#student-corner"
                    className="group flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {post.type}
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-brand" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 flex-1 text-pretty font-serif text-base font-bold leading-snug text-navy group-hover:text-brand">
                      {post.title}
                    </h3>
                    <div className="mt-4 space-y-2 border-t border-border pt-3">
                      <p className="text-sm font-medium text-navy">{post.author}</p>
                      <AuthorBadges dept={post.dept} batch={post.batch} />
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
