import { Download, FileText, Megaphone } from 'lucide-react'
import { notices } from '@/lib/data'
import { SectionHeading } from './section-heading'

export function NoticeBoard() {
  return (
    <section id="notices" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading
          eyebrow="Digital Notice Board"
          title="ডিজিটাল নোটিশ বোর্ড"
          subtitle="Official press releases and announcements from MBSTU Reporters' Unity."
        />

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-brand px-5 py-3 text-sm font-semibold text-white">
            <Megaphone className="size-4" aria-hidden="true" />
            Official Notices / অফিসিয়াল বিজ্ঞপ্তি
          </div>
          <ul className="divide-y divide-border">
            {notices.map((notice) => (
              <li
                key={notice.ref}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-brand-soft/50 sm:flex-row sm:items-center"
              >
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-brand bg-brand-soft text-brand">
                  <span className="font-serif text-xl font-bold leading-none">{notice.day}</span>
                  <span className="text-[10px] font-bold uppercase">{notice.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    <FileText className="size-3" aria-hidden="true" />
                    Ref: {notice.ref}
                  </p>
                  <h3 className="mt-1.5 text-pretty font-semibold text-navy">{notice.title}</h3>
                  <p className="text-sm text-muted-foreground">{notice.titleEn}</p>
                </div>
                <a
                  href="#notices"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-2 text-sm font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download PDF / বিজ্ঞপ্তি
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
