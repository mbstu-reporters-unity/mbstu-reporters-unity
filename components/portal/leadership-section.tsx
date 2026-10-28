import { CalendarCheck, Globe2, Newspaper, Quote, Users } from 'lucide-react'
import { leaders, stats } from '@/lib/data'
import { SectionHeading } from './section-heading'

const statIcons = {
  calendar: CalendarCheck,
  users: Users,
  globe: Globe2,
  newspaper: Newspaper,
}

export function LeadershipSection() {
  return (
    <section id="leadership" className="bg-muted py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div id="about" className="-mt-24 pt-24" />
        <SectionHeading
          eyebrow="Leadership & At a Glance"
          title="নেতৃত্বের বার্তা"
          subtitle="Messages from the leadership of MBSTU Reporters' Unity — committed to fearless, fair and factual campus journalism."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {leaders.map((leader) => (
            <article
              key={leader.role}
              className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg sm:p-8"
            >
              <Quote className="absolute right-6 top-6 size-14 text-brand/10" aria-hidden="true" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-serif text-2xl font-bold text-white ring-4 ring-brand-soft"
                    role="img"
                    aria-label={`Portrait placeholder for ${leader.name}`}
                  >
                    {leader.initials}
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">
                    {leader.roleBn}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-crimson">{leader.role}</p>
                  <h3 className="font-serif text-xl font-bold text-navy">{leader.name}</h3>
                  <p className="text-sm text-muted-foreground">{leader.dept}</p>
                </div>
              </div>
              <p className="mt-6 text-pretty leading-relaxed text-navy/80">{leader.message}</p>
              <div className="mt-6 border-t border-dashed border-border pt-4">
                <p className="font-serif text-lg italic text-brand">— {leader.name}</p>
                <p className="text-xs text-muted-foreground">
                  {leader.role}, {"MBSTU Reporters' Unity"}
                </p>
              </div>
            </article>
          ))}
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon]
            return (
              <li
                key={stat.label}
                className="group rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-serif text-3xl font-bold text-navy sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-navy">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.bn}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
