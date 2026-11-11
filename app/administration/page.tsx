import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Building2, Mail, Phone, UserCheck } from 'lucide-react'
import { getAdministrationOfficials, ADMIN_CATEGORIES, type AdministrationOfficial } from '@/lib/administration'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'MBSTU Administration | মাভাবিপ্রবি প্রশাসন',
  description: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের শীর্ষ প্রশাসন, প্রশাসনিক দপ্তরসমূহ এবং বিশেষায়িত সেলের কর্মকর্তা ও দায়িত্বপ্রাপ্ত ব্যক্তিবর্গের তালিকা।',
}

export default async function AdministrationPage() {
  const officials = await getAdministrationOfficials()

  const grouped: Record<string, AdministrationOfficial[]> = {}
  ADMIN_CATEGORIES.forEach((cat) => {
    grouped[cat] = officials.filter((o) => o.category === cat)
  })

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 space-y-8">
          
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
          </Link>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center">
            <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider mb-2 shadow">
              Mawlana Bhashani Science and Technology University
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              MBSTU Administration (মাভাবিপ্রবি প্রশাসন)
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1.5 max-w-2xl mx-auto">
              বিশ্ববিদ্যালয়ের শীর্ষ প্রশাসন, রেজিস্ট্রার অফিস, প্রক্টর অফিস, অনুষদীয় ডিন এবং সকল প্রশাসনিক দপ্তরের দায়িত্বপ্রাপ্ত ব্যক্তিবর্গের তথ্যাবলি
            </p>
          </div>

          {/* প্রশাসনিক স্তরসমূহ প্রদর্শন */}
          {ADMIN_CATEGORIES.map((cat) => {
            const list = grouped[cat] || []
            if (list.length === 0) return null

            return (
              <section key={cat} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                  <Building2 className="size-5 text-cyan-400" />
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">{cat}</h2>
                  <span className="ml-auto text-xs bg-white/15 text-cyan-300 font-bold px-3 py-0.5 rounded-full border border-white/20">
                    {list.length} জন
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {list.map((official) => (
                    <div
                      key={official.id}
                      className="glass-card flex flex-col justify-between p-5 text-white"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3.5">
                          {official.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={official.photo_url}
                              alt={official.name}
                              className="size-16 rounded-full object-cover border-2 border-cyan-400/50 shadow-md shrink-0 bg-slate-900"
                            />
                          ) : (
                            <div className="size-16 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center text-2xl font-bold border border-white/20 shrink-0">
                              👤
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] bg-white/15 text-cyan-200 font-bold px-2 py-0.5 rounded-full border border-white/20 truncate block max-w-fit">
                              {official.office_name}
                            </span>
                            <h3 className="font-serif text-base font-bold text-white mt-1 leading-snug">
                              {official.name}
                            </h3>
                            <p className="text-xs font-semibold text-cyan-300">{official.designation}</p>
                          </div>
                        </div>

                        {official.bio && (
                          <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed border-t border-white/10 pt-2 line-clamp-3">
                            {official.bio}
                          </p>
                        )}
                      </div>

                      {(official.email || official.phone) && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs">
                          {official.phone && (
                            <a
                              href={`tel:${official.phone}`}
                              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 font-semibold hover:opacity-90 transition shadow-sm"
                            >
                              <Phone className="size-3" /> কল করুন
                            </a>
                          )}
                          {official.email && (
                            <a
                              href={`mailto:${official.email}`}
                              className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/20 text-white px-3 py-1 hover:bg-white/25 transition font-semibold truncate max-w-[170px]"
                            >
                              <Mail className="size-3 shrink-0 text-cyan-300" /> <span className="truncate">{official.email}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {officials.length === 0 && (
            <div className="glass-card p-12 text-center space-y-2">
              <UserCheck className="size-10 text-white/50 mx-auto" />
              <p className="text-base font-bold text-white">এখনো প্রশাসনিক কর্মকর্তাদের তথ্য যুক্ত করা হয়নি।</p>
            </div>
          )}

          <div className="pt-4 text-center border-t border-white/15">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>
          </div>

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
