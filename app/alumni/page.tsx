'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Award,
  GraduationCap,
  Newspaper,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Briefcase,
  Sparkles,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'

type AlumniItem = {
  id: string
  name: string
  dept: string
  batch: string
  currentPosition: string
  mediaHouse: string
  bio: string
  photo_url?: string | null
  fb_url?: string | null
}

const DEMO_ALUMNI: AlumniItem[] = [
  {
    id: 'alum-1',
    name: 'শরীফুল ইসলাম',
    dept: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
    batch: '১০ম ব্যাচ',
    currentPosition: 'সিনিয়র রিপোর্টার',
    mediaHouse: 'দৈনিক প্রথম আলো',
    bio: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির প্রতিষ্ঠাতা সদস্য ও সাবেক সভাপতি। ক্যাম্পাস রিপোর্টিং থেকে শুরু করে বর্তমানে জাতীয় অর্থনীতি ও প্রযুক্তি বিটে কাজ করছেন।',
    photo_url: null,
  },
  {
    id: 'alum-2',
    name: 'তাসমিয়া রহমান',
    dept: 'ইংরেজি বিভাগ',
    batch: '১১তম ব্যাচ',
    currentPosition: 'নিউজ প্রেজেন্টার ও ব্রডকাস্ট জার্নালিস্ট',
    mediaHouse: 'চ্যানেল আই',
    bio: 'ইউনিটির প্রথম কমিটির সাধারণ সম্পাদক। টেলিভিশন ব্রডকাস্ট জার্নালিজম ও ফিচার মেকিংয়ে বিশেষ অবদান রেখে চলেছেন।',
    photo_url: null,
  },
  {
    id: 'alum-3',
    name: 'মেহেদী হাসান শুভ',
    dept: 'ক্রিমিনোলজি অ্যান্ড পুলিশ সায়েন্স',
    batch: '১২তম ব্যাচ',
    currentPosition: 'স্পেশাল করেসপন্ডেন্ট',
    mediaHouse: 'বিডিনিউজ২৪ ডটকম',
    bio: 'অনুসন্ধানী রিপোর্টিংয়ের জন্য একাধিক জাতীয় গণমাধ্যম পুরস্কার প্রাপ্ত। নবীনদের মেন্টরশিপ প্রদানে সর্বদা সচেষ্ট।',
    photo_url: null,
  },
]

export default function AlumniNetworkPage() {
  const [list] = useState<AlumniItem[]>(DEMO_ALUMNI)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: 'পরিচিতি', href: '/about' },
              { label: 'অ্যালামনাই নেটওয়ার্ক' },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Users className="size-3.5" />
              <span>Alumni Network & Mentorship • অ্যালামনাই নেটওয়ার্ক</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              প্রাক্তন সদস্য ও অ্যালামনাই নেটওয়ার্ক
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              মাভাবিপ্রবি রিপোর্টার্স ইউনিটি থেকে অতীতে সাংবাদিকতা করে বর্তমানে দেশের শীর্ষস্থানীয় জাতীয় গণমাধ্যম, টেলিভিশন ও প্রতিষ্ঠানে সফলভাবে কর্মরত প্রাক্তন সাংবাদিকদের পরিচিতি ও মেন্টরশিপ হাব।
            </p>
          </div>

          {/* অ্যালামনাই কার্ড গ্রিড */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((alum) => (
              <article
                key={alum.id}
                className="glass-card p-5 sm:p-6 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-xl border border-white/20 shrink-0 shadow">
                      {alum.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={alum.photo_url} alt="" className="size-full rounded-2xl object-cover" />
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
                      <p className="text-[11px] text-slate-300 truncate">
                        {alum.dept}
                      </p>
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
              href="/opportunities"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Briefcase className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">ইন্টার্নশিপ ও সুযোগ</p>
                  <p className="text-[10px] text-slate-300">কার্যক্রম ও কর্মশালা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/members"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <GraduationCap className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">সদস্য ডিরেক্টরি</p>
                  <p className="text-[10px] text-slate-300">সকল সাংবাদিক সদস্য</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
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
