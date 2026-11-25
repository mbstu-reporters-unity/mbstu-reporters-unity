import { BackNavigation } from '@/components/portal/back-navigation'
import { Tx } from '@/lib/i18n'
import { BackToTop } from '@/components/portal/back-to-top'
import { FbStoriesTray } from '@/components/portal/fb-stories-tray'
import { SiteFooter } from '@/components/portal/site-footer'
import { SiteHeader } from '@/components/portal/site-header'
import { TopBar } from '@/components/portal/top-bar'

export default function StoriesPage() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <BackNavigation items={[{ label: <Tx bn="ক্যাম্পাস স্টোরিজ" en="Campus Stories" /> }]} />
          <header className="hero-daylight-dark-surface rounded-3xl border border-white/15 bg-gradient-to-br from-fuchsia-950 via-slate-950 to-blue-950 p-6 text-center text-white shadow-xl sm:p-9">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl"><Tx bn="ক্যাম্পাস স্টোরিজ" en="Campus Stories" /></h1>
            <p className="mt-2 text-sm text-slate-200"><Tx bn="ক্যাম্পাসের সাম্প্রতিক ছবি ও ভিডিও দেখুন।" en="View recent photographs and videos from campus." /></p>
          </header>
          <FbStoriesTray standalone />
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
