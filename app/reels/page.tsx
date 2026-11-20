import { BackNavigation } from '@/components/portal/back-navigation'
import { BackToTop } from '@/components/portal/back-to-top'
import { FbReelsSection } from '@/components/portal/fb-reels-section'
import { SiteFooter } from '@/components/portal/site-footer'
import { SiteHeader } from '@/components/portal/site-header'
import { TopBar } from '@/components/portal/top-bar'

export default function ReelsPage() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <BackNavigation items={[{ label: 'রিলস ও ভিডিও হাব' }]} />
          <header className="hero-daylight-dark-surface rounded-3xl border border-white/15 bg-gradient-to-br from-rose-950 via-slate-950 to-indigo-950 p-6 text-center text-white shadow-xl sm:p-9">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl">রিলস ও ভিডিও হাব</h1>
            <p className="mt-2 text-sm text-slate-200">সাম্প্রতিক ক্যাম্পাস ভিডিও দেখুন।</p>
          </header>
          <FbReelsSection standalone />
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
