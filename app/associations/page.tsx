import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Globe, Newspaper } from 'lucide-react'
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
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
          </Link>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider mb-2 shadow">
              University Press & Reporters
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              অন্যান্য সাংবাদিক সমিতি
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              Other University Journalist Associations Across Bangladesh
            </p>
          </div>

          {associations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {associations.map((assoc) => {
                const targetLink = assoc.website_url || assoc.fb_url || assoc.yt_url || null

                return (
                  <div
                    key={assoc.id}
                    className="glass-card flex flex-col justify-between p-5 text-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {assoc.logo_url ? (
                          targetLink ? (
                            <a href={targetLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={assoc.logo_url}
                                alt={assoc.name}
                                loading="lazy"
                                className="size-14 rounded-2xl object-contain border border-white/30 p-1 bg-white shadow-md hover:opacity-90"
                              />
                            </a>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={assoc.logo_url}
                              alt={assoc.name}
                              loading="lazy"
                              className="size-14 rounded-2xl object-contain border border-white/30 p-1 bg-white shadow-md shrink-0"
                            />
                          )
                        ) : (
                          <div className="size-14 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center text-xl font-bold border border-white/20 shrink-0">
                            📰
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {assoc.university_name && (
                            <span className="text-[10px] bg-white/15 text-cyan-200 font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                              {assoc.university_name}
                            </span>
                          )}
                          <h2 className="font-serif text-base font-bold text-white mt-1 leading-snug">
                            {targetLink ? (
                              <a
                                href={targetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-cyan-300 transition-colors"
                              >
                                {assoc.name}
                              </a>
                            ) : (
                              assoc.name
                            )}
                          </h2>
                          {assoc.name_en && (
                            <p className="text-xs text-slate-300 mt-0.5">{assoc.name_en}</p>
                          )}
                        </div>
                      </div>

                      {assoc.description && (
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed border-t border-white/10 pt-2 line-clamp-3">
                          {assoc.description}
                        </p>
                      )}

                      {assoc.contact_info && (
                        <div className="text-xs text-slate-300 bg-white/10 p-2.5 rounded-2xl border border-white/15 space-y-1">
                          <p className="font-bold text-cyan-300 text-[11px]">যোগাযোগের তথ্য:</p>
                          <p className="whitespace-pre-line">{assoc.contact_info}</p>
                        </div>
                      )}
                    </div>

                    {(assoc.website_url || assoc.fb_url || assoc.yt_url) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold">
                        {assoc.website_url && (
                          <a
                            href={assoc.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 transition-colors shadow"
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
                            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 transition-colors shadow"
                          >
                            Facebook
                          </a>
                        )}
                        {assoc.yt_url && (
                          <a
                            href={assoc.yt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-red-600 hover:bg-red-500 text-white px-3 py-1 transition-colors shadow"
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
            <div className="glass-card p-12 text-center space-y-2">
              <Newspaper className="size-10 text-white/50 mx-auto" />
              <p className="text-base font-bold text-white">এখনো কোনো সাংবাদিক সমিতি যুক্ত করা হয়নি।</p>
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
