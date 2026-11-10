import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Globe, Megaphone, Share2 } from 'lucide-react'
import { getSocialSites, getSocialSiteNotices, type SocialSite } from '@/lib/social-sites'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'MBSTU Social Site | মাভাবিপ্রবি সোশ্যাল সাইট ও গ্রুপসমূহ',
  description: 'মাভাবিপ্রবির বিভিন্ন দপ্তর, মেস ও বাসা আপডেট, পরিবহন ও গুরুত্বপূর্ণ সোশ্যাল প্ল্যাটফর্মের তথ্য।',
}

async function SocialSiteCard({ site }: { site: SocialSite }) {
  const notices = await getSocialSiteNotices(site.id)
  const targetLink = site.fb_url || site.website_url || site.yt_url || null
  const siteUrl = 'https://mbsturu.vercel.app'
  const sharePageUrl = `${siteUrl}/social-sites#site-${site.id}`

  return (
    <div id={`site-${site.id}`} className="flex flex-col justify-between rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-sm hover:border-brand hover:shadow-md transition-all">
      <div className="space-y-4">
        {/* লগো ও নাম */}
        <div className="flex items-start gap-3.5">
          {site.logo_url ? (
            targetLink ? (
              <a href={targetLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={site.logo_url} alt={site.name} loading="lazy" className="size-16 rounded-2xl object-contain border p-1 bg-white shadow-sm hover:opacity-90" />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logo_url} alt={site.name} loading="lazy" className="size-16 rounded-2xl object-contain border p-1 bg-white shadow-sm shrink-0" />
            )
          ) : (
            <div className="size-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold border shrink-0">
              🌐
            </div>
          )}

          <div className="min-w-0 flex-1">
            {site.category && (
              <span className="text-[10px] bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200">
                {site.category}
              </span>
            )}
            <h2 className="font-serif text-base sm:text-lg font-bold text-navy mt-1 leading-snug">
              {targetLink ? (
                <a href={targetLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                  {site.name}
                </a>
              ) : (
                site.name
              )}
            </h2>
            {site.name_en && <p className="text-xs text-gray-500">{site.name_en}</p>}
          </div>
        </div>

        {/* পরিচিতি (ঐচ্ছিক) */}
        {site.description && (
          <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line leading-relaxed border-t border-gray-100 pt-2.5">
            {site.description}
          </p>
        )}

        {/* যোগাযোগের তথ্য (ঐচ্ছিক) */}
        {site.contact_info && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1">
            <p className="font-bold text-gray-700 text-[11px]">যোগাযোগের তথ্য:</p>
            <p className="whitespace-pre-line">{site.contact_info}</p>
          </div>
        )}

        {/* নোটিশ কর্নার (যদি এই গ্রুপের নোটিশ থাকে তবেই দেখাবে) */}
        {notices.length > 0 && (
          <div className="space-y-3 border-t border-border/80 pt-3">
            <p className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="size-3.5" />
              সাম্প্রতিক নোটিশ ও আপডেট ({notices.length})
            </p>

            <div className="space-y-2.5">
              {notices.map((n) => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-2xl border border-border/60 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-xs sm:text-sm text-navy">{n.title}</p>
                    <span className="text-[10px] text-gold font-semibold shrink-0 flex items-center gap-1">
                      <CalendarDays className="size-3" /> {n.date}
                    </span>
                  </div>

                  {n.details && (
                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{n.details}</p>
                  )}

                  {/* নোটিশের একাধিক ছবি */}
                  {n.image_urls && n.image_urls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                      {n.image_urls.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" loading="lazy" className="size-16 w-full object-cover rounded-lg border hover:opacity-90" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* শেয়ার */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-[10px]">
                    <span className="text-gray-400 font-medium flex items-center gap-1"><Share2 className="size-2.5" /> শেয়ার:</span>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${site.name}: ${n.title} - ${sharePageUrl}`)}`} target="_blank" rel="noopener noreferrer" className="rounded bg-emerald-600 text-white px-2 py-0.5 font-semibold">WhatsApp</a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded bg-blue-600 text-white px-2 py-0.5 font-semibold">Facebook</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* সোশ্যাল ও ওয়েব বোতাম */}
      {(site.website_url || site.fb_url || site.yt_url) && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3 text-xs font-semibold">
          {site.fb_url && (
            <a href={site.fb_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700 transition">
              Facebook
            </a>
          )}
          {site.website_url && (
            <a href={site.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-brand text-white px-2.5 py-1 hover:bg-brand-dark transition">
              <Globe className="size-3" /> Website
            </a>
          )}
          {site.yt_url && (
            <a href={site.yt_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-red-600 text-white px-2.5 py-1 hover:bg-red-700 transition">
              YouTube
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default async function SocialSitesPage() {
  const sites = await getSocialSites()

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
              University Community & Media
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              MBSTU Social Site
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              মাভাবিপ্রবির বিভিন্ন দপ্তর, মেস-বাসা আপডেট, পরিবহন ও সামাজিক গ্রুপসমূহের কেন্দ্রবিন্দু
            </p>
          </div>

          {/* তালিকা */}
          {sites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sites.map((s) => (
                <SocialSiteCard key={s.id} site={s} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed p-12 text-center bg-white shadow-sm space-y-2">
              <p className="text-base font-bold text-navy">এখনো কোনো সাইট বা গ্রুপ যুক্ত করা হয়নি।</p>
              <p className="text-xs text-muted-foreground">অ্যাডমিন প্যানেল থেকে তথ্য যুক্ত করলেই এখানে সরাসরি চলে আসবে।</p>
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
