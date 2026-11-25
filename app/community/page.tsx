import { BackNavigation } from '@/components/portal/back-navigation'
import { BackToTop } from '@/components/portal/back-to-top'
import { CommunityFeed } from '@/components/portal/community-feed'
import { CommunityPagesSection } from '@/components/portal/community-pages-section'
import { SiteFooter } from '@/components/portal/site-footer'
import { SiteHeader } from '@/components/portal/site-header'
import { TopBar } from '@/components/portal/top-bar'
import { Tx } from '@/lib/i18n'

export default function CommunityPage() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <BackNavigation items={[{ label: <Tx bn="কমিউনিটি পেজ ও পোস্ট" en="Community Pages and Posts" /> }]} />
          <header className="hero-daylight-dark-surface rounded-3xl border border-white/15 bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950 p-6 text-center text-white shadow-xl sm:p-9">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl"><Tx bn="ক্যাম্পাস কমিউনিটি" en="Campus Community" /></h1>
            <p className="mt-2 text-sm text-slate-200"><Tx bn="সক্রিয় পেজ, সংগঠন ও কমিউনিটির সাম্প্রতিক পোস্ট।" en="Recent posts from active pages, organisations, and campus communities." /></p>
          </header>
          <CommunityPagesSection mode="directory" />
          <CommunityFeed standalone />
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
