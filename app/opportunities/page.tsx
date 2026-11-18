'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  GraduationCap,
  CalendarDays,
  ExternalLink,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Send,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'

type OpportunityItem = {
  id: string
  type: 'workshop' | 'internship' | 'fellowship' | 'contest'
  title: string
  organizer: string
  deadline: string
  description: string
  apply_url: string
  badgeText: string
}

const DEMO_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'opp-1',
    type: 'workshop',
    title: 'ক্যাম্পাস সাংবাদিকতা ও ফ্যাক্ট-চেকিং বুটক্যাম্প ২০২৬',
    organizer: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি (MBSTURU)',
    deadline: '১৫ নভেম্বর ২০২৬',
    description:
      'নবীন শিক্ষার্থীদের জন্য ৩ দিনব্যাপী ব্যবহারিক সাংবাদিকতা, নিউজ রাইটিং ও ছবি তোলার কর্মশালা। অংশগ্রহণকারীদের সার্টিফিকেট প্রদান করা হবে।',
    apply_url: '/apply',
    badgeText: 'নিবন্ধন চলছে',
  },
  {
    id: 'opp-2',
    type: 'internship',
    title: 'জাতীয় দৈনিকে ক্যাম্পাস করেসপন্ডেন্ট ও অনলাইন ইন্টার্নশিপ',
    organizer: 'শীর্ষস্থানীয় জাতীয় গণমাধ্যম ও অনলাইন পোর্টাল',
    deadline: 'চলমান প্রক্রিয়া',
    description:
      'মাভাবিপ্রবি শিক্ষার্থীদের মধ্য থেকে তরুণ ও উদীয়মান লেখকদের জন্য অনলাইন নিউজ পোর্টাল ও জাতীয় দৈনিকের ক্যাম্পাস প্রতিনিধি হিসেবে কাজ করার সুযোগ।',
    apply_url: '/admin',
    badgeText: 'সোনালী সুযোগ',
  },
  {
    id: 'opp-3',
    type: 'contest',
    title: 'বার্ষিক ক্যাম্পাস ফিচার রাইটিং ও আলোকচিত্র প্রতিযোগিতা ২০২৬',
    organizer: 'MBSTURU কালচারাল সেল',
    deadline: '৩০ নভেম্বর ২০২৬',
    description:
      'সেরা ফিচার লেখা এবং সেরা ক্যাম্পাস আলোকচিত্রের জন্য আকর্ষণীয় প্রাইজমানি ও ক্রেস্ট।',
    apply_url: '/student-corner',
    badgeText: 'প্রতিযোগিতা',
  },
]

export default function OpportunitiesPage() {
  const [list] = useState<OpportunityItem[]>(DEMO_OPPORTUNITIES)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: 'পরিচিতি', href: '/about' },
              { label: 'ওয়ার্কশপ ও ইন্টার্নশিপ' },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Briefcase className="size-3.5" />
              <span>Training, Internships & Fellowships • দক্ষতা উন্নয়ন সুযোগ</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              ওয়ার্কশপ, ইন্টার্নশিপ ও সুযোগসমূহ
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              সাংবাদিকতা প্রশিক্ষণ কর্মশালা, মিডিয়া হাউসে ইন্টার্নশিপ, স্কলারশিপ, ফেলোশিপ এবং লেখালেখি প্রতিযোগিতার সর্বশেষ বিজ্ঞপ্তি।
            </p>
          </div>

          {/* সুযোগের কার্ড গ্রিড */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {list.map((item) => {
              const isExternal = /^https?:\/\//i.test(item.apply_url)
              return (
                <article
                  key={item.id}
                  className="glass-card p-6 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 px-3 py-0.5 text-xs font-bold">
                        <Sparkles className="size-3" />
                        {item.badgeText}
                      </span>
                      <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                        <CalendarDays className="size-3.5" /> ডেডলাইন: {item.deadline}
                      </span>
                    </div>

                    <h2 className="font-serif text-lg font-bold text-white leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-xs font-semibold text-cyan-200">
                      আয়োজক: {item.organizer}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">মাভাবিপ্রবি শিক্ষার্থীদের জন্য উন্মুক্ত</span>

                    {isExternal ? (
                      <a
                        href={item.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 font-bold shadow transition"
                      >
                        <span>আবেদন করুন</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={item.apply_url}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 font-bold shadow transition"
                      >
                        <span>আবেদন করুন</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {/* অন্যান্য পাতার দ্রুত লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/resources"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">রিসোর্স সেন্টার</p>
                  <p className="text-[10px] text-slate-300">গাইড ও টেমপ্লেট</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/apply"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <GraduationCap className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">সদস্যপদ আবেদন</p>
                  <p className="text-[10px] text-slate-300">ইউনিটিতে যুক্ত হোন</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/student-corner"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Award className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">স্টুডেন্ট কর্নার</p>
                  <p className="text-[10px] text-slate-300">শিক্ষার্থীদের লেখা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

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
