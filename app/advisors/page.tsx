import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Mail,
  Phone,
  Building2,
  Quote,
  Users,
  FileText,
  History,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Newspaper,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { SB_URL, SB_KEY } from '@/lib/sb'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'উপদেষ্টা পরিষদ | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটির প্রধান পৃষ্ঠপোষক, শিক্ষক উপদেষ্টামণ্ডলী ও পেশাদার সাংবাদিক উপদেষ্টাবৃন্দের তালিকা ও দিকনির্দেশনা।',
}

interface AdvisorItem {
  id: string
  name: string
  role: string // e.g. "প্রধান পৃষ্ঠপোষক", "শিক্ষক উপদেষ্টা", "পেশাদার সাংবাদিক উপদেষ্টা"
  roleEn: string
  designation: string
  institution: string
  department?: string | null
  photo_url?: string | null
  message?: string | null
  email?: string | null
  phone?: string | null
  category: 'chief_patron' | 'faculty' | 'professional'
}

const DEFAULT_ADVISORS: AdvisorItem[] = [
  {
    id: 'adv-1',
    name: 'মাননীয় উপাচার্য',
    role: 'প্রধান পৃষ্ঠপোষক (Chief Patron)',
    roleEn: 'Chief Patron',
    designation: 'উপাচার্য (Vice-Chancellor)',
    institution: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (মাভাবিপ্রবি)',
    photo_url: null,
    message:
      'বিশ্ববিদ্যালয়ের সার্বিক শিক্ষা, গবেষণা ও উদ্ভাবনী কর্মকাণ্ডকে দেশ ও বিদেশের সামনে দায়িত্বশীলভাবে তুলে ধরতে মাভাবিপ্রবি রিপোর্টার্স ইউনিটি প্রশংসনীয় ভূমিকা পালন করছে। বস্তুনিষ্ঠ ও সত্যনিষ্ঠ ক্যাম্পাস সাংবাদিকতা বিশ্ববিদ্যালয়ের গণতান্ত্রিক ও বুদ্ধিবৃত্তিক অগ্রযাত্রার অন্যতম শক্তি।',
    category: 'chief_patron',
  },
  {
    id: 'adv-2',
    name: 'পরিচালক, ছাত্র কল্যাণ ও পরামর্শদান কেন্দ্র',
    role: 'শিক্ষক উপদেষ্টা',
    roleEn: 'Faculty Advisor',
    designation: 'পরিচালক ও অধ্যাপক',
    institution: 'মাভাবিপ্রবি',
    department: 'ছাত্র কল্যাণ ও পরামর্শদান কেন্দ্র',
    photo_url: null,
    message:
      'শিক্ষার্থীদের অধিকার রক্ষা ও গঠনমূলক ক্যাম্পাস সাংবাদিকতা চর্চায় রিপোর্টার্স ইউনিটি সবসময় সচেতন ভূমিকা বজায় রাখবে—এটাই প্রত্যাশা।',
    category: 'faculty',
  },
  {
    id: 'adv-3',
    name: 'পরিচালক, জনসংযোগ ও প্রেস প্রকাশনা দপ্তর',
    role: 'শিক্ষক উপদেষ্টা',
    roleEn: 'Faculty Advisor',
    designation: 'পরিচালক (ভারপ্রাপ্ত)',
    institution: 'মাভাবিপ্রবি',
    department: 'জনসংযোগ ও প্রেস প্রকাশনা দপ্তর',
    photo_url: null,
    message:
      'তথ্যনির্ভর সংবাদ প্রচার এবং বিশ্ববিদ্যালয়ের ভাবমূর্তি উজ্জ্বল করতে ক্যাম্পাস সাংবাদিকদের ভূমিকা অনস্বীকার্য।',
    category: 'faculty',
  },
  {
    id: 'adv-4',
    name: 'সিনিয়র স্পেশাল করেসপন্ডেন্ট',
    role: 'পেশাদার সাংবাদিক উপদেষ্টা',
    roleEn: 'Professional Media Advisor',
    designation: 'সিনিয়র করেসপন্ডেন্ট ও মাভাবিপ্রবির প্রাক্তন শিক্ষার্থী',
    institution: 'জাতীয় গণমাধ্যম, ঢাকা',
    photo_url: null,
    message:
      'ক্যাম্পাস থেকেই প্রকৃত অনুসন্ধানী ও নৈতিক সাংবাদিকতার হাতেখড়ি হয়। নবীন রিপোর্টারদের জন্য আমাদের সার্বক্ষণিক সহযোগিতা ও পরামর্শ অব্যাহত থাকবে।',
    category: 'professional',
  },
]

async function loadAdvisorsData(): Promise<AdvisorItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.advisors_list_data`,
      {
        headers: { apikey: SB_KEY },
        cache: 'no-store',
      }
    )
    if (res.ok) {
      const rows: { value?: string }[] = await res.json()
      if (rows?.[0]?.value) {
        const parsed = JSON.parse(rows[0].value)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch {}
  return DEFAULT_ADVISORS
}

export default async function AdvisorsPage() {
  const [advisors, settings] = await Promise.all([
    loadAdvisorsData(),
    getSiteSettings(),
  ])

  const chiefPatrons = advisors.filter((a) => a.category === 'chief_patron')
  const facultyAdvisors = advisors.filter((a) => a.category === 'faculty')
  const professionalAdvisors = advisors.filter((a) => a.category === 'professional')

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
              { label: 'উপদেষ্টা পরিষদ' },
            ]}
          />

          {/* ১. হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <ShieldCheck className="size-3.5" />
              <span>অভিভাবকত্ব ও দিকনির্দেশনা • Advisory Council</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">
              উপদেষ্টা পরিষদ
            </h1>

            <p className="text-cyan-200 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি
            </p>

            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-1">
              সংগঠনের নীতিগত দিকনির্দেশনা, পেশাগত নৈতিকতা রক্ষা এবং সুস্থ ক্যাম্পাস সাংবাদিকতার চর্চায় সার্বক্ষণিক পরামর্শ ও অভিভাবকত্ব প্রদানকারী সম্মানিত উপদেষ্টামণ্ডলী।
            </p>
          </div>

          {/* ২. প্রধান পৃষ্ঠপোষক (Chief Patron) */}
          {chiefPatrons.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <Award className="size-5 text-amber-400" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">
                  প্রধান পৃষ্ঠপোষক (Chief Patron)
                </h2>
              </div>

              <div className="space-y-4">
                {chiefPatrons.map((patron) => (
                  <article
                    key={patron.id}
                    className="glass-card relative p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-white border-2 border-amber-400/40 shadow-xl"
                  >
                    <Quote className="absolute right-5 top-5 size-12 text-white/10 pointer-events-none" />

                    <div className="relative shrink-0">
                      {patron.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={patron.photo_url}
                          alt={patron.name}
                          className="size-32 sm:size-36 rounded-2xl object-cover ring-4 ring-amber-400/60 shadow-xl bg-slate-900"
                        />
                      ) : (
                        <div className="size-32 sm:size-36 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white flex flex-col items-center justify-center ring-4 ring-amber-400/50 shadow-xl text-center p-3">
                          <Building2 className="size-10 mb-1 opacity-90" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">উপদেষ্টা</span>
                        </div>
                      )}
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-0.5 text-[10px] font-bold text-slate-950 shadow-md border border-white/30">
                        প্রধান অভিভাবক
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 text-center md:text-left min-w-0">
                      <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold text-amber-300 border border-white/20">
                        {patron.role}
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                        {patron.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-cyan-200 font-semibold">
                        {patron.designation}
                      </p>
                      <p className="text-xs text-slate-300">{patron.institution}</p>

                      {patron.message && (
                        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed border-t border-white/10 pt-3 italic bg-white/5 p-3 rounded-xl border border-white/10 text-justify">
                          "{patron.message}"
                        </p>
                      )}

                      {(patron.email || patron.phone) && (
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-xs">
                          {patron.phone && (
                            <a
                              href={`tel:${patron.phone}`}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1 font-semibold transition"
                            >
                              <Phone className="size-3" /> কল করুন
                            </a>
                          )}
                          {patron.email && (
                            <a
                              href={`mailto:${patron.email}`}
                              className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3 py-1 font-semibold transition"
                            >
                              <Mail className="size-3 text-cyan-300" /> ইমেইল
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ৩. শিক্ষক উপদেষ্টামণ্ডলী (Faculty Advisors) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
              <GraduationCap className="size-5 text-cyan-400" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">
                শিক্ষক উপদেষ্টামণ্ডলী (Faculty Advisors)
              </h2>
            </div>

            {facultyAdvisors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {facultyAdvisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="glass-card p-5 sm:p-6 flex flex-col justify-between text-white space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        {advisor.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={advisor.photo_url}
                            alt={advisor.name}
                            className="size-16 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md shrink-0 bg-slate-900"
                          />
                        ) : (
                          <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-xl border border-white/20 shrink-0">
                            👨‍🏫
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="inline-block rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-bold">
                            {advisor.role}
                          </span>
                          <h3 className="font-serif text-base font-bold text-white truncate">
                            {advisor.name}
                          </h3>
                          <p className="text-xs text-cyan-200/90 font-medium truncate">
                            {advisor.designation}
                          </p>
                          <p className="text-[11px] text-slate-300 truncate">
                            {advisor.department || advisor.institution}
                          </p>
                        </div>
                      </div>

                      {advisor.message && (
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed border-t border-white/10 pt-2 italic line-clamp-3">
                          "{advisor.message}"
                        </p>
                      )}
                    </div>

                    {(advisor.email || advisor.phone) && (
                      <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs">
                        {advisor.phone && (
                          <a
                            href={`tel:${advisor.phone}`}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white px-2.5 py-0.5 font-semibold transition text-[11px]"
                          >
                            <Phone className="size-2.5" /> কল
                          </a>
                        )}
                        {advisor.email && (
                          <a
                            href={`mailto:${advisor.email}`}
                            className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-2.5 py-0.5 font-semibold transition text-[11px] truncate max-w-[180px]"
                          >
                            <Mail className="size-2.5 text-cyan-300" />
                            <span className="truncate">{advisor.email}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-slate-300 text-xs">
                শিক্ষক উপদেষ্টাদের তথ্য শীঘ্রই প্রকাশিত হবে।
              </div>
            )}
          </section>

          {/* ৪. পেশাদার সাংবাদিক ও অ্যালামনাই উপদেষ্টা */}
          {professionalAdvisors.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <Newspaper className="size-5 text-amber-400" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">
                  পেশাদার সাংবাদিক ও অ্যালামনাই উপদেষ্টাবৃন্দ
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {professionalAdvisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="glass-card p-5 sm:p-6 flex flex-col justify-between text-white space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        {advisor.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={advisor.photo_url}
                            alt={advisor.name}
                            className="size-16 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md shrink-0 bg-slate-900"
                          />
                        ) : (
                          <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-700 text-white flex items-center justify-center font-bold text-xl border border-white/20 shrink-0">
                            📰
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="inline-block rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold">
                            {advisor.role}
                          </span>
                          <h3 className="font-serif text-base font-bold text-white truncate">
                            {advisor.name}
                          </h3>
                          <p className="text-xs text-amber-200/90 font-medium truncate">
                            {advisor.designation}
                          </p>
                          <p className="text-[11px] text-slate-300 truncate">{advisor.institution}</p>
                        </div>
                      </div>

                      {advisor.message && (
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed border-t border-white/10 pt-2 italic line-clamp-3">
                          "{advisor.message}"
                        </p>
                      )}
                    </div>

                    {(advisor.email || advisor.phone) && (
                      <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs">
                        {advisor.phone && (
                          <a
                            href={`tel:${advisor.phone}`}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white px-2.5 py-0.5 font-semibold transition text-[11px]"
                          >
                            <Phone className="size-2.5" /> কল
                          </a>
                        )}
                        {advisor.email && (
                          <a
                            href={`mailto:${advisor.email}`}
                            className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-2.5 py-0.5 font-semibold transition text-[11px] truncate max-w-[180px]"
                          >
                            <Mail className="size-2.5 text-cyan-300" />
                            <span className="truncate">{advisor.email}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ৫. দ্রুত রেফারেন্স ও সম্পর্কিত পাতার লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/committee"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Users className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">বর্তমান কমিটি</p>
                  <p className="text-[10px] text-slate-300">কার্যনির্বাহী পরিষদের তালিকা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
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
                  <p className="text-[10px] text-slate-300">সাংগঠনিক মূল ধারা ও আচরণবিধি</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/about"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">আমাদের সম্পর্কে</p>
                  <p className="text-[10px] text-slate-300">ইতিহাস, ভিশন ও অর্জন</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
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
