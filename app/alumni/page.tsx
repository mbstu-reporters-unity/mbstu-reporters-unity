import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Briefcase, Sparkles, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getAlumniList } from '@/lib/alumni-opportunities'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'প্রাক্তন সদস্য ও অ্যালামনাই নেটওয়ার্ক | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সাবেক সাংবাদিক ও অ্যালামনাই সদস্যদের পরিচিতি ও মেন্টরশিপ হাব।',
}

export default async function AlumniNetworkPage() {
  const list = await getAlumniList()

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: 'আমাদের সম্পর্কে', href: '/about' },
              { label: 'অ্যালামনাই নেটওয়ার্ক' },
            ]}
          />

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Users className="size-3.5" />
              <span>Alumni Network & Mentorship</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              প্রাক্তন সদস্য ও অ্যালামনাই নেটওয়ার্ক
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              মাভাবিপ্রবি রিপোর্টার্স ইউনিটি থেকে অতীতে সাংবাদিকতা করে বর্তমানে দেশের শীর্ষস্থানীয় জাতীয় গণমাধ্যম, টেলিভিশন ও প্রতিষ্ঠানে সফলভাবে কর্মরত প্রাক্তন সাংবাদিকদের পরিচিতি ও মেন্টরশিপ হাব।
            </p>
          </div>

          {list.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((alum) => (
                <article
                  key={alum.id}
                  className="glass-card p-5 sm:p-6 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-xl border border-white/20 shrink-0 shadow overflow-hidden">
                        {alum.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={alum.photo_url} alt={alum.name} className="size-full object-cover" />
                        ) : (
                          alum.name.charAt(0)
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="inline-block rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-bold">
                          অ্যালামনাই • {alum.batch}
                        </span>
                        <h2 className="font-serif text-base font-bold text-white leading-snug truncate">
                          {alum.name}
                        </h2>
                        <p className="text-xs text-amber-200 font-semibold truncate flex items-center gap-1">
                          <Briefcase className="size-3 shrink-0" />
                          <span>{alum.currentPosition}, {alum.mediaHouse}</span>
                        </p>
                        <p className="text-[11px] text-slate-300 truncate">{alum.dept}</p>
                      </div>
                    </div>

                    {alum.bio && (
                      <p className="text-xs text-slate-200 leading-relaxed border-t border-white/10 pt-2.5">
                        {alum.bio}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">MBSTURU Family</span>
                    <span className="inline-flex items-center gap-1 text-cyan-300 font-bold">
                      <Sparkles className="size-3 text-amber-300" />
                      <span>মেন্টর</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 text-sm space-y-2">
              <Users className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">অ্যালামনাই তালিকা শীঘ্রই হালনাগাদ করা হবে।</p>
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
