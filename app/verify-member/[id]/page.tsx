import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Newspaper,
  CalendarDays,
  Award,
  ExternalLink,
  User,
  Sparkles,
} from 'lucide-react'
import { SB_URL, SB_KEY, POSITIONS } from '@/lib/sb'
import { getSiteSettings } from '@/lib/site-settings'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { DigitalIdCard, type DigitalMemberInfo } from '@/components/portal/digital-id-card'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সদস্য ও প্রেস কার্ড যাচাই | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটির ডিজিটাল প্রেস আইডি কার্ড ও সদস্যপদ যাচাইকরণ পাতা।',
}

async function fetchMemberVerification(id: string): Promise<DigitalMemberInfo | null> {
  try {
    const cleanId = id.trim()
    if (!cleanId) return null

    const [profRes, leadRes] = await Promise.all([
      fetch(
        `${SB_URL}/rest/v1/profiles?select=id,full_name,department,batch,role,user_type,designation,newspaper_name,avatar_url,approved,created_at&id=eq.${encodeURIComponent(
          cleanId
        )}&limit=1`,
        { headers: { apikey: SB_KEY }, cache: 'no-store' }
      ),
      fetch(
        `${SB_URL}/rest/v1/leaders?select=position,is_visible&profile_id=eq.${encodeURIComponent(
          cleanId
        )}&limit=1`,
        { headers: { apikey: SB_KEY }, cache: 'no-store' }
      ),
    ])

    if (!profRes.ok) return null
    const profiles: DigitalMemberInfo[] = await profRes.json()
    const profile = profiles[0]
    if (!profile) return null

    let execPosBn: string | null = null
    if (leadRes.ok) {
      const leaders: Array<{ position: string; is_visible?: boolean }> = await leadRes.json()
      if (leaders[0]?.position) {
        const found = POSITIONS.find((p) => p.key === leaders[0].position)
        execPosBn = found?.bn || leaders[0].position
      }
    }

    return {
      ...profile,
      executive_position_bn: execPosBn,
    }
  } catch {
    return null
  }
}

export default async function VerifyMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cleanId = decodeURIComponent(id)

  const [member, settings] = await Promise.all([
    fetchMemberVerification(cleanId),
    getSiteSettings(),
  ])

  const b = settings.branding
  const serialCode = `MBSTURU-${cleanId.replace(/-/g, '').slice(0, 6).toUpperCase()}`

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-4xl px-4 space-y-6">
          <div className="print:hidden">
            <BackNavigation
              items={[
                { label: 'সদস্য ডিরেক্টরি', href: '/members' },
                { label: 'সদস্য যাচাই' },
              ]}
            />
          </div>

          {!member ? (
            /* অবৈধ বা খুঁজে না পাওয়া আইডি */
            <div className="glass-card p-8 sm:p-12 text-center text-white space-y-4 border-2 border-rose-500/50">
              <div className="size-16 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 flex items-center justify-center mx-auto">
                <XCircle className="size-9" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rose-300">
                সদস্যপদ যাচাই করা যায়নি (Invalid ID)
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
                প্রদত্ত পরিচয়পত্র বা QR কোডটি ({cleanId}) আমাদের অনুমোদিত সদস্য ডাটাবেজে পাওয়া যায়নি। এটি ভুয়া অথবা বাতিলকৃত পরিচয়পত্র হতে পারে।
              </p>
              <div className="pt-2">
                <Link
                  href="/members"
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 text-slate-950 px-5 py-2 text-xs font-bold"
                >
                  <span>সদস্য ডিরেক্টরি দেখুন</span>
                </Link>
              </div>
            </div>
          ) : !member.approved ? (
            /* অনুমোদন স্থগিত বা পেন্ডিং */
            <div className="glass-card p-8 sm:p-12 text-center text-white space-y-4 border-2 border-amber-400/50">
              <div className="size-16 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center mx-auto">
                <ShieldAlert className="size-9" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">
                সদস্যপদ বর্তমানে সক্রিয় নয়
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
                <b className="text-white">{member.full_name}</b>-এর সদস্যপদ বর্তমানে অনুমোদিত বা সক্রিয় অবস্থায় নেই। বিস্তারিত জানতে প্রশাসনিক দপ্তরের সাথে যোগাযোগ করুন।
              </p>
            </div>
          ) : (
            /* অনুমোদিত ও যাচাইকৃত সদস্য */
            <div className="space-y-6">
              {/* ১. সবুজ ভেরিফাইড স্ট্যাটাস ব্যানার */}
              <div className="glass-card p-5 sm:p-7 text-white border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-blue-950/80 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3.5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-slate-950 px-4 py-1 text-xs font-extrabold shadow-lg">
                    <CheckCircle2 className="size-4" />
                    <span>যাচাইকৃত সদস্য • OFFICIALLY VERIFIED</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    ID: {serialCode}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="size-24 sm:size-28 rounded-2xl object-cover object-top ring-4 ring-emerald-400/70 shadow-xl bg-slate-900 shrink-0"
                    />
                  ) : (
                    <div className="size-24 sm:size-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white font-bold text-3xl flex items-center justify-center ring-4 ring-emerald-400/70 shrink-0">
                      {member.full_name.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {member.full_name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                      {member.executive_position_bn && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 px-3 py-0.5 font-bold">
                          <Award className="size-3.5" />
                          <span>{member.executive_position_bn}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-3 py-0.5 font-bold">
                        <ShieldCheck className="size-3.5" />
                        <span>{b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-200">
                      {member.department && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="size-3.5 text-cyan-300" />
                          <span>
                            {member.department}
                            {member.batch ? ` (${member.batch})` : ''}
                          </span>
                        </span>
                      )}

                      {member.newspaper_name && (
                        <span className="inline-flex items-center gap-1 text-amber-200 font-semibold">
                          <Newspaper className="size-3.5 text-amber-300" />
                          <span>{member.newspaper_name}</span>
                        </span>
                      )}

                      {member.created_at && (
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <CalendarDays className="size-3.5 text-cyan-300" />
                          <span>
                            সদস্যপদ:{' '}
                            {new Date(member.created_at).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'long',
                              timeZone: 'Asia/Dhaka',
                            })}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                      <Link
                        href={`/u/${member.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 text-xs font-bold shadow transition"
                      >
                        <User className="size-3.5" />
                        <span>পোর্টফোলিও ও প্রকাশিত সংবাদ দেখুন</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* ২. ডিজিটাল প্রেস আইডি কার্ড ও সনদ প্রিন্ট/সংরক্ষণ সেকশন */}
              <div className="glass-card p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5 print:hidden">
                  <h2 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-cyan-300" />
                    <span>ডিজিটাল প্রেস কার্ড ও সনদপত্র</span>
                  </h2>
                </div>

                <DigitalIdCard
                  member={member}
                  orgNameBn={b.orgNameBn}
                  orgNameEn={b.orgNameEn}
                  orgLogoUrl={b.orgLogoUrl}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/15 print:hidden">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <SiteFooter />
        <BackToTop />
      </div>
    </>
  )
}
