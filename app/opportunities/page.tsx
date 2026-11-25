import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, CalendarDays, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getOpportunitiesList } from '@/lib/alumni-opportunities'
import { Tx } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ওয়ার্কশপ, ইন্টার্নশিপ ও সুযোগসমূহ | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description: 'ক্যাম্পাস সাংবাদিকদের জন্য প্রশিক্ষণ কর্মশালা, ইন্টার্নশিপ, ফেলোশিপ ও লেখালেখি প্রতিযোগিতার তালিকা।',
}

export default async function OpportunitiesPage() {
  const list = await getOpportunitiesList(true)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: <Tx bn="আমাদের সম্পর্কে" en="About" />, href: '/about' },
              { label: <Tx bn="কর্মশালা ও ইন্টার্নশিপ" en="Workshops and Internships" /> },
            ]}
          />

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Briefcase className="size-3.5" />
              <span><Tx bn="প্রশিক্ষণ ও পেশাগত সুযোগ" en="Training and Career Opportunities" /></span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              <Tx bn="কর্মশালা, ইন্টার্নশিপ ও অন্যান্য সুযোগ" en="Workshops, Internships, and Other Opportunities" />
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              <Tx
                bn="সাংবাদিকতা প্রশিক্ষণ কর্মশালা, গণমাধ্যম প্রতিষ্ঠানে ইন্টার্নশিপ, বৃত্তি, ফেলোশিপ ও লেখালেখির প্রতিযোগিতা-সংক্রান্ত হালনাগাদ বিজ্ঞপ্তি।"
                en="Current notices about journalism workshops, media internships, scholarships, fellowships, and writing competitions."
              />
            </p>
          </div>

          {list.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.map((item) => {
                const isExternal = /^https?:\/\//i.test(item.apply_url)
                return (
                  <article
                    key={item.id}
                    className="glass-card p-6 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 px-3 py-0.5 text-xs font-bold">
                          <Sparkles className="size-3" />
                          {item.badgeText}
                        </span>
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                          <CalendarDays className="size-3.5" /> <Tx bn="আবেদনের শেষ তারিখ:" en="Application deadline:" /> {item.deadline}
                        </span>
                      </div>

                      <h2 className="font-serif text-lg font-bold text-white leading-snug">
                        {item.title}
                      </h2>
                      <p className="text-xs font-semibold text-cyan-200">
                        <Tx bn="আয়োজক:" en="Organiser:" /> {item.organizer}
                      </p>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]"><Tx bn="মাভাবিপ্রবির শিক্ষার্থীদের জন্য উন্মুক্ত" en="Open to MBSTU students" /></span>

                      {isExternal ? (
                        <a
                          href={item.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 font-bold shadow transition"
                        >
                          <span><Tx bn="আবেদন করুন" en="Apply" /></span>
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={item.apply_url}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 font-bold shadow transition"
                        >
                          <span><Tx bn="আবেদন করুন" en="Apply" /></span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 text-sm space-y-2">
              <Briefcase className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white"><Tx bn="বর্তমানে কোনো নতুন বিজ্ঞপ্তি নেই।" en="There are no new notices at this time." /></p>
            </div>
          )}

          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
