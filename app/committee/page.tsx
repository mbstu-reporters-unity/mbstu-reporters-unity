import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Users,
  Award,
  Mail,
  Phone,
  GraduationCap,
  Quote,
  ShieldCheck,
  FileText,
  ArrowRight,
  Sparkles,
  ExternalLink,
  History,
  Newspaper,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { PhotoFrame } from '@/components/portal/photo-frame'
import { getLeaders, POSITIONS, SB_URL, SB_KEY } from '@/lib/sb'
import { DEFAULT_STYLE, getGlobalStyle, styleFor, type LeaderWithStyle } from '@/lib/photo-style'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'বর্তমান কার্যনির্বাহী পরিষদ | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটির বর্তমান কার্যনির্বাহী কমিটির সভাপতি, সাধারণ সম্পাদক ও সকল দায়িত্বপ্রাপ্ত কর্মকর্তার তালিকা ও পরিচিতি।',
}

interface EnrichedLeader extends LeaderWithStyle {
  profile?: {
    email?: string | null
    phone?: string | null
    newspaper_name?: string | null
    batch?: string | null
  } | null
}

async function loadEnrichedLeaders(): Promise<EnrichedLeader[]> {
  try {
    const leaders = (await getLeaders()) as LeaderWithStyle[]
    if (!leaders || leaders.length === 0) return []

    const visibleLeaders = leaders.filter((l) => l.is_visible !== false)
    const profileIds = visibleLeaders.map((l) => l.profile_id).filter(Boolean)

    const profileMap = new Map<string, any>()
    if (profileIds.length > 0) {
      try {
        const idList = profileIds.map((id) => encodeURIComponent(id)).join(',')
        const res = await fetch(
          `${SB_URL}/rest/v1/profiles?select=id,email,phone,newspaper_name,batch&id=in.(${idList})`,
          {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
            cache: 'no-store',
          }
        )
        if (res.ok) {
          const profiles = await res.json()
          if (Array.isArray(profiles)) {
            profiles.forEach((p) => {
              if (p.id) profileMap.set(p.id, p)
            })
          }
        }
      } catch {}
    }

    return visibleLeaders.map((l) => ({
      ...l,
      profile: profileMap.get(l.profile_id) || null,
    }))
  } catch {
    return []
  }
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()

export default async function CommitteePage() {
  const [leaders, globalStyle, settings] = await Promise.all([
    loadEnrichedLeaders(),
    getGlobalStyle(),
    getSiteSettings(),
  ])

  // শীর্ষ নেতৃত্ব (সভাপতি ও সাধারণ সম্পাদক)
  const topLeaders = leaders.filter(
    (l) => l.position === 'president' || l.position === 'general_secretary'
  )

  // অন্যান্য কর্মকর্তাবৃন্দ
  const otherOfficers = leaders.filter(
    (l) => l.position !== 'president' && l.position !== 'general_secretary'
  )

  const posLabel = (posKey: string) => {
    const found = POSITIONS.find((p) => p.key === posKey)
    return {
      bn: found?.bn || posKey,
      en: found?.en || 'Officer',
    }
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-8">

          {/* ব্রেডক্রাম্ব নেভিগেশন */}
          <BackNavigation
            items={[
              { label: 'আমাদের সম্পর্কে', href: '/about' },
              { label: 'বর্তমান কমিটি' },
            ]}
          />

          {/* ১. আকর্ষণীয় হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Users className="size-3.5" />
              <span>কার্যনির্বাহী পরিষদ • Executive Council</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">
              বর্তমান কার্যনির্বাহী পরিষদ
            </h1>

            <p className="text-cyan-200 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি
            </p>

            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-1">
              ক্যাম্পাসে বস্তুনিষ্ঠ সাংবাদিকতা চর্চা, তথ্যের স্বচ্ছ প্রবাহ এবং সাংবাদিকদের অধিকার ও মর্যাদা সুরক্ষায় নির্বাচিত বর্তমান কার্যনির্বাহী পরিষদ।
            </p>

            {/* সংক্ষিপ্ত পরিসংখ্যান স্ট্রিপ */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="bg-white/10 border border-white/20 text-white px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur">
                মোট কর্মকর্তা: <b className="text-cyan-300">{leaders.length.toLocaleString('bn-BD')} জন</b>
              </span>
              <span className="bg-white/10 border border-white/20 text-white px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur">
                মেয়াদকাল: <b className="text-amber-300">১ বছর</b>
              </span>
            </div>
          </div>

          {/* ২. শীর্ষ নেতৃত্ব সেকশন (সভাপতি ও সাধারণ সম্পাদক) */}
          {topLeaders.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <Award className="size-5 text-amber-400" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">
                  শীর্ষ নেতৃত্ব (President & General Secretary)
                </h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {topLeaders.map((leader) => {
                  const ps = styleFor(leader, globalStyle)
                  const pLabels = posLabel(leader.position)
                  const email = leader.profile?.email
                  const phone = leader.profile?.phone
                  const newspaper = leader.profile?.newspaper_name
                  const batch = leader.profile?.batch

                  return (
                    <article
                      key={leader.id}
                      className="glass-card relative p-6 sm:p-8 flex flex-col justify-between"
                    >
                      <Quote className="absolute right-5 top-5 size-12 text-white/10 pointer-events-none" />

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                          <div className="relative shrink-0">
                            <PhotoFrame
                              src={leader.photo_url}
                              alt={leader.display_name}
                              style={ps}
                              fallback={
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-serif text-2xl font-bold shadow-inner">
                                  {initials(leader.display_name)}
                                </div>
                              }
                            />
                            <span className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-md border border-white/30">
                              {pLabels.bn}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 basis-40 space-y-1">
                            <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200 border border-white/20">
                              {pLabels.en}
                            </span>
                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-sm leading-snug">
                              {leader.display_name}
                            </h3>

                            {leader.department && (
                              <p className="text-xs sm:text-sm text-cyan-100/90 font-medium flex items-center gap-1.5 pt-0.5">
                                <GraduationCap className="size-3.5 text-cyan-300 shrink-0" />
                                <span>
                                  {leader.department} {batch ? `(${batch})` : ''}
                                </span>
                              </p>
                            )}

                            {newspaper && (
                              <p className="text-[11px] text-amber-200 flex items-center gap-1">
                                <Newspaper className="size-3 shrink-0" />
                                <span>ক্যাম্পাস প্রতিনিধি, {newspaper}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {leader.message && (
                          <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-100 text-justify border-t border-white/10 pt-3">
                            "{leader.message}"
                          </p>
                        )}
                      </div>

                      {/* যোগাযোগ ও প্রোফাইল লিংক */}
                      <div className="mt-5 border-t border-white/15 pt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {phone && (
                            <a
                              href={`tel:${phone}`}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1 font-semibold transition"
                            >
                              <Phone className="size-3" /> কল করুন
                            </a>
                          )}
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3 py-1 font-semibold transition"
                            >
                              <Mail className="size-3 text-cyan-300" /> ইমেইল
                            </a>
                          )}
                        </div>

                        {leader.profile_id && (
                          <Link
                            href={`/u/${leader.profile_id}`}
                            className="inline-flex items-center gap-1 text-cyan-300 hover:text-white font-bold ml-auto"
                          >
                            <span>প্রোফাইল দেখুন</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {/* ৩. অন্যান্য সকল কর্মকর্তার পূর্ণাঙ্গ গ্রিড */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
              <Users className="size-5 text-cyan-400" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">
                কার্যনির্বাহী পরিষদের অন্যান্য কর্মকর্তাবৃন্দ
              </h2>
            </div>

            {otherOfficers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherOfficers.map((officer) => {
                  const ps = styleFor(officer, globalStyle)
                  const pLabels = posLabel(officer.position)
                  const email = officer.profile?.email
                  const phone = officer.profile?.phone
                  const newspaper = officer.profile?.newspaper_name
                  const batch = officer.profile?.batch

                  return (
                    <div
                      key={officer.id}
                      className="glass-card p-5 flex flex-col justify-between text-white space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3.5">
                          <div className="shrink-0">
                            {officer.photo_url ? (
                              <PhotoFrame
                                src={officer.photo_url}
                                alt={officer.display_name}
                                style={{ ...ps, size: 70 }}
                                fallback={
                                  <div className="flex size-16 items-center justify-center rounded-2xl bg-cyan-600 text-white font-bold text-xl">
                                    {initials(officer.display_name)}
                                  </div>
                                }
                              />
                            ) : (
                              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xl border border-white/20">
                                {officer.display_name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="inline-block rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-bold">
                              {pLabels.bn}
                            </span>
                            <h3 className="font-serif text-base font-bold text-white leading-snug truncate">
                              {officer.display_name}
                            </h3>
                            <p className="text-[11px] text-cyan-100/90 font-medium truncate">
                              {officer.department || 'মাভাবিপ্রবি'} {batch ? `· ${batch}` : ''}
                            </p>
                            {newspaper && (
                              <p className="text-[10px] text-slate-300 truncate">
                                📰 {newspaper}
                              </p>
                            )}
                          </div>
                        </div>

                        {officer.message && (
                          <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed border-t border-white/10 pt-2 line-clamp-2">
                            "{officer.message}"
                          </p>
                        )}
                      </div>

                      {/* যোগাযোগ ও পাবলিক লিঙ্ক */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-white/10 pt-3 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {phone && (
                            <a
                              href={`tel:${phone}`}
                              className="p-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white transition"
                              title="কল করুন"
                            >
                              <Phone className="size-3" />
                            </a>
                          )}
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
                              title="ইমেইল পাঠান"
                            >
                              <Mail className="size-3 text-cyan-300" />
                            </a>
                          )}
                        </div>

                        {officer.profile_id && (
                          <Link
                            href={`/u/${officer.profile_id}`}
                            className="inline-flex items-center gap-1 text-cyan-300 hover:text-white font-semibold ml-auto"
                          >
                            <span>প্রোফাইল</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-slate-300 text-xs">
                কার্যনির্বাহী পরিষদের অন্যান্য কর্মকর্তাদের তথ্য শীঘ্রই ড্যাশবোর্ড থেকে হালনাগাদ করা হবে।
              </div>
            )}
          </section>

          {/* ৪. কুইক লিংক ও রেফারেন্সসমূহ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/advisors"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">উপদেষ্টা পরিষদ</p>
                  <p className="text-[10px] text-slate-300">শিক্ষক ও পেশাদার উপদেষ্টা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/constitution"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <FileText className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">গঠনতন্ত্র ও নীতিমালা</p>
                  <p className="text-[10px] text-slate-300">সাংগঠনিক আচরণবিধি ও ধারা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/committee/archive"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <History className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">প্রাক্তন কমিটি আর্কাইভ</p>
                  <p className="text-[10px] text-slate-300">পূর্ববর্তী মেয়াদের কমিটিসমূহ</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ফুটার ব্যাক বাটন */}
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
