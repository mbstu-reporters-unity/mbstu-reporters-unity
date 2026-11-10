import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Globe, Mail, MapPin, Newspaper, Phone } from 'lucide-react'
import { getUniversityAssociations } from '@/lib/associations'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'অন্যান্য সাংবাদিক সমিতি | Other Journalist Associations',
  description: 'দেশের বিভিন্ন পাবলিক ও প্রাইভেট বিশ্ববিদ্যালয়ের সাংবাদিক সমিতিসমূহের তালিকা ও পরিচিতি।',
}

export default async function AssociationsPage() {
  const associations = await getUniversityAssociations()

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          
          {/* দ্রুত হোমপেজে ফেরার বাটন (SPA Link) */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
          </Link>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-navy text-white p-6 sm:p-10 shadow-lg text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-gold/90 text-navy font-bold text-xs uppercase tracking-wider mb-2">
              University Press & Reporters
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              অন্যান্য সাংবাদিক সমিতি
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              Other University Journalist Associations Across Bangladesh
            </p>
          </div>

          {/* গ্রিড তালিকা */}
          {associations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {associations.map((assoc) => {
                // লগো বা নামে ক্লিক করলে যে লিঙ্কে যাবে (ওয়েবসাইট, না থাকলে ফেসবুক)
                const targetLink = assoc.website_url || assoc.fb_url || assoc.yt_url || null

                return (
                  <div
                    key={assoc.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-sm hover:border-brand hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      {/* লগো ও বিশ্ববিদ্যালয়ের নাম */}
                      <div className="flex items-start gap-3">
                        {assoc.logo_url ? (
                          targetLink ? (
                            <a href={targetLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={assoc.logo_url}
                                alt={assoc.name}
                                loading="lazy"
                                className="size-14 rounded-2xl object-contain border p-1 bg-white shadow-sm hover:opacity-90"
                              />
                            </a>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={assoc.logo_url}
                              alt={assoc.name}
                              loading="lazy"
                              className="size-14 rounded-2xl object-contain border p-1 bg-white shadow-sm shrink-0"
                            />
                          )
                        ) : (
                          <div className="size-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-xl font-bold border shrink-0">
                            📰
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {assoc.university_name && (
                            <span className="text-[10px] bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200">
                              {assoc.university_name}
                            </span>
                          )}
                          <h2 className="font-serif text-base font-bold text-navy mt-1 leading-snug">
                            {targetLink ? (
                              <a
                                href={targetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-brand transition-colors"
                              >
                                {assoc.name}
                              </a>
                            ) : (
                              assoc.name
                            )}
                          </h2>
                          {assoc.name_en && (
                            <p className="text-xs text-gray-500">{assoc.name_en}</p>
                          )}
                        </div>
                      </div>

                      {/* সংক্ষিপ্ত বিবরণ (ঐচ্ছিক - থাকলে তবেই দেখাবে) */}
                      {assoc.description && (
                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed border-t border-gray-100 pt-2">
                          {assoc.description}
                        </p>
                      )}

                      {/* যোগাযোগের তথ্য (ঐচ্ছিক) */}
                      {assoc.contact_info && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
                          <p className="font-bold text-gray-700 text-[11px]">যোগাযোগের তথ্য:</p>
                          <p className="whitespace-pre-line">{assoc.contact_info}</p>
                        </div>
                      )}
                    </div>

                    {/* সোশ্যাল ও ওয়েব লিঙ্ক বোতাম */}
                    {(assoc.website_url || assoc.fb_url || assoc.yt_url) && (
                      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3 text-xs font-semibold">
                        {assoc.website_url && (
                          <a
                            href={assoc.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-brand text-white px-2.5 py-1 hover:bg-brand-dark transition-colors"
                          >
                            <Globe className="size-3" />
                            Website
                          </a>
                        )}
                        {assoc.fb_url && (
                          <a
                            href={assoc.fb_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700 transition-colors"
                          >
                            Facebook
                          </a>
                        )}
                        {assoc.yt_url && (
                          <a
                            href={assoc.yt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-red-600 text-white px-2.5 py-1 hover:bg-red-700 transition-colors"
                          >
                            YouTube
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed p-12 text-center bg-white shadow-sm space-y-2">
              <Newspaper className="size-10 text-gray-400 mx-auto" />
              <p className="text-base font-bold text-navy">এখনো কোনো সাংবাদিক সমিতি যুক্ত করা হয়নি।</p>
              <p className="text-xs text-muted-foreground">অ্যাডমিন প্যানেল থেকে তথ্য যুক্ত করলেই এখানে সুন্দরভাবে ফুটে উঠবে।</p>
            </div>
          )}

          {/* নিচে স্ক্রল করার পর পাঠকদের জন্য ফিরতি লিংক */}
          <div className="pt-4 text-center border-t">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
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
