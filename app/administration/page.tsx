import type { Metadata } from 'next'
import { ArrowLeft, Building2, Mail, Phone, Search, UserCheck } from 'lucide-react'
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

  // ক্যাটাগরি অনুযায়ী গ্রুপিং
  const grouped: Record<string, AdministrationOfficial[]> = {}
  ADMIN_CATEGORIES.forEach((cat) => {
    grouped[cat] = officials.filter((o) => o.category === cat)
  })

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 space-y-8">
          
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline">
            <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
          </a>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-navy text-white p-6 sm:p-10 shadow-lg text-center">
            <span className="inline-block px-3.5 py-1 rounded-full bg-gold/90 text-navy font-bold text-xs uppercase tracking-wider mb-2">
              Mawlana Bhashani Science and Technology University
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
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
                <div className="flex items-center gap-2 border-b-2 border-brand/20 pb-2">
                  <Building2 className="size-5 text-brand" />
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy">{cat}</h2>
                  <span className="ml-auto text-xs bg-brand/10 text-brand font-bold px-2.5 py-0.5 rounded-full">
                    {list.length} জন
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {list.map((official) => (
                    <div
                      key={official.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-sm hover:border-brand hover:shadow-md transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3.5">
                          {official.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={official.photo_url}
                              alt={official.name}
                              className="size-16 rounded-full object-cover border-2 border-brand/30 shadow-sm shrink-0 bg-gray-50"
                            />
                          ) : (
                            <div className="size-16 rounded-full bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold border shrink-0">
                              👤
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200 truncate block max-w-fit">
                              {official.office_name}
                            </span>
                            <h3 className="font-serif text-base font-bold text-navy mt-1 leading-snug">
                              {official.name}
                            </h3>
                            <p className="text-xs font-semibold text-brand">{official.designation}</p>
                          </div>
                        </div>

                        {official.bio && (
                          <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed border-t border-gray-100 pt-2 line-clamp-3">
                            {official.bio}
                          </p>
                        )}
                      </div>

                      {/* যোগাযোগ বাটন (কল ও ইমেইল) */}
                      {(official.email || official.phone) && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs">
                          {official.phone && (
                            <a
                              href={`tel:${official.phone}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 hover:bg-emerald-700 transition font-medium"
                            >
                              <Phone className="size-3" /> কল করুন
                            </a>
                          )}
                          {official.email && (
                            <a
                              href={`mailto:${official.email}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 text-white px-2.5 py-1 hover:bg-slate-900 transition font-medium truncate max-w-[160px]"
                            >
                              <Mail className="size-3 shrink-0" /> <span className="truncate">{official.email}</span>
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
            <div className="rounded-3xl border border-dashed p-12 text-center bg-white shadow-sm space-y-2">
              <UserCheck className="size-10 text-gray-400 mx-auto" />
              <p className="text-base font-bold text-navy">এখনো প্রশাসনিক কর্মকর্তাদের তথ্য যুক্ত করা হয়নি।</p>
              <p className="text-xs text-muted-foreground">অ্যাডমিন প্যানেল থেকে তথ্য যুক্ত করলেই এখানে সুন্দরভাবে ফুটে উঠবে।</p>
            </div>
          )}

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
