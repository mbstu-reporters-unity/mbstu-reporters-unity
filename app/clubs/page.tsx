import { BackNavigation } from '@/components/portal/back-navigation'
import { BackToTop } from '@/components/portal/back-to-top'
import { ClubNews } from '@/components/portal/club-news'
import { ClubPosts } from '@/components/portal/club-posts'
import { SiteFooter } from '@/components/portal/site-footer'
import { SiteHeader } from '@/components/portal/site-header'
import { TopBar } from '@/components/portal/top-bar'
import { Tx } from '@/lib/i18n'

export default function ClubsPage() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <BackNavigation items={[{ label: <Tx bn="ক্যাম্পাস ক্লাব ও সংবাদ" en="Campus Clubs and News" /> }]} />
          </div>
          <header className="hero-daylight-dark-surface mx-4 rounded-3xl border border-white/15 bg-gradient-to-br from-orange-950 via-slate-950 to-blue-950 p-6 text-center text-white shadow-xl sm:mx-6 sm:p-9 lg:mx-8">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl"><Tx bn="ক্যাম্পাস ক্লাব ও সংগঠন" en="Campus Clubs and Organisations" /></h1>
            <p className="mt-2 text-sm text-slate-200"><Tx bn="ক্লাবের কার্যক্রম, প্রতিবেদন ও কমিটি সম্পর্কে জানুন।" en="Explore club activities, reports, and committees." /></p>
          </header>
          <ClubNews standalone />
          <ClubPosts standalone />
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
