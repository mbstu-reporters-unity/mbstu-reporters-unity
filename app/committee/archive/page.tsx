'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  History,
  Calendar,
  Users,
  Award,
  GraduationCap,
  Newspaper,
  ArrowRight,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { SB_URL, SB_KEY } from '@/lib/sb'

interface PastOfficer {
  name: string
  role: string
  department?: string
  batch?: string
  media?: string
  currentStatus?: string
  photo_url?: string | null
}

interface PastCommitteeSession {
  id: string
  sessionBn: string // e.g. "২০২৪-২০২৫"
  sessionEn: string // e.g. "2024-2025"
  termTitle: string
  president: PastOfficer
  generalSecretary: PastOfficer
  otherOfficers: PastOfficer[]
  groupPhotoUrl?: string | null
  achievementsSummary?: string
}

const DEFAULT_ARCHIVE_DATA: PastCommitteeSession[] = [
  {
    id: 'term-2024-2025',
    sessionBn: '২০২৪-২০২৫',
    sessionEn: '2024-2025',
    termTitle: 'কার্যনির্বাহী পরিষদ ২০২৪-২০২৫',
    president: {
      name: 'মো. তৌহিদুল ইসলাম',
      role: 'সভাপতি',
      department: 'ক্রিমিনোলজি অ্যান্ড পুলিশ সায়েন্স (সিপিএস)',
      batch: '১৫তম ব্যাচ',
      media: 'দৈনিক ইত্তেফাক',
      currentStatus: 'সাংবাদিক ও গবেষক',
      photo_url: null,
    },
    generalSecretary: {
      name: 'আরিফুল হক সানি',
      role: 'সাধারণ সম্পাদক',
      department: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (সিএসই)',
      batch: '১৬তম ব্যাচ',
      media: 'ঢাকা পোস্ট',
      currentStatus: 'সফটওয়্যার ইঞ্জিনিয়ার ও সাবেক ক্যাম্পাস রিপোর্টার',
      photo_url: null,
    },
    otherOfficers: [
      { name: 'ফারহানা ইয়াসমিন', role: 'সহ-সভাপতি', department: 'ইংরেজি বিভাগ', batch: '১৫তম ব্যাচ' },
      { name: 'তানভীর আহমেদ', role: 'যুগ্ম-সাধারণ সম্পাদক', department: 'টেক্সটাইল ইঞ্জিনিয়ারিং', batch: '১৬তম ব্যাচ' },
      { name: 'মাহমুদুল হাসান', role: 'কোষাধ্যক্ষ', department: 'অর্থনীতি বিভাগ', batch: '১৬তম ব্যাচ' },
      { name: 'ইশরাত জাহান', role: 'দপ্তর সম্পাদক', department: 'বায়োটেকনোলজি (বিজিই)', batch: '১৭তম ব্যাচ' },
      { name: 'সাদিয়া ইসলাম', role: 'প্রচার ও প্রকাশনা সম্পাদক', department: 'ফার্মেসি বিভাগ', batch: '১৭তম ব্যাচ' },
      { name: 'রাকিবুল হাসান', role: 'কার্যনির্বাহী সদস্য', department: 'গণিত বিভাগ', batch: '১৬তম ব্যাচ' },
      { name: 'নাঈম হোসেন', role: 'কার্যনির্বাহী সদস্য', department: 'রসায়ন বিভাগ', batch: '১৭তম ব্যাচ' },
    ],
    achievementsSummary:
      'এই মেয়াদে জাতীয় গণমাধ্যমে ক্যাম্পাস সংক্রান্ত শতাধিক অনুসন্ধানী প্রতিবেদন প্রকাশিত হয় এবং "ক্যাম্পাস সাংবাদিকতা ও ফ্যাক্ট-চেকিং কর্মশালা ২০২৪" সফলভাবে অনুষ্ঠিত হয়।',
  },
  {
    id: 'term-2023-2024',
    sessionBn: '২০২৩-২০২৪',
    sessionEn: '2023-2024',
    termTitle: 'কার্যনির্বাহী পরিষদ ২০২৩-২০২৪',
    president: {
      name: 'শেখ মো. আশিকুর রহমান',
      role: 'সভাপতি',
      department: 'ইনফরমেশন অ্যান্ড কমিউনিকেশন টেকনোলজি (আইসিটি)',
      batch: '১৪তম ব্যাচ',
      media: 'দৈনিক প্রথম আলো',
      currentStatus: 'সিনিয়র সহ-সম্পাদক, জাতীয় দৈনিক',
      photo_url: null,
    },
    generalSecretary: {
      name: 'নাজমুল হাসান রুবেল',
      role: 'সাধারণ সম্পাদক',
      department: 'পরিবেশ বিজ্ঞান ও সম্পদ ব্যবস্থাপনা (ইএসআরএম)',
      batch: '১৫তম ব্যাচ',
      media: 'বিডিনিউজ২৪',
      currentStatus: 'পরিবেশ উন্নয়ন গবেষক',
      photo_url: null,
    },
    otherOfficers: [
      { name: 'রাফসান চৌধুরী', role: 'সহ-সভাপতি', department: 'সিএসই', batch: '১৪তম ব্যাচ' },
      { name: 'তাসনিম রহমান', role: 'যুগ্ম-সাধারণ সম্পাদক', department: 'সিপিএস', batch: '১৫তম ব্যাচ' },
      { name: 'নুসরাত জাহান', role: 'অর্থ সম্পাদক', department: 'ইংরেজি', batch: '১৫তম ব্যাচ' },
      { name: 'মেহেদী হাসান', role: 'দপ্তর সম্পাদক', department: 'পদার্থবিজ্ঞান', batch: '১৬তম ব্যাচ' },
      { name: 'আলিফ হোসেন', role: 'প্রচার সম্পাদক', department: 'পরিসংখ্যান', batch: '১৬তম ব্যাচ' },
    ],
    achievementsSummary:
      'বিশ্ববিদ্যালয়ের আবাসন সংকট ও কেন্দ্রীয় লাইব্রেরির সময়সীমা বৃদ্ধিতে ধারাবাহিক গঠনমূলক রিপোর্ট প্রকাশের মাধ্যমে ইতিবাচক সংস্কারে বিশেষ ভূমিকা রাখে।',
  },
]

export default function PastCommitteesArchivePage() {
  const [archiveList, setArchiveList] = useState<PastCommitteeSession[]>(DEFAULT_ARCHIVE_DATA)
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_ARCHIVE_DATA[0].id)

  useEffect(() => {
    async function fetchArchiveData() {
      try {
        const res = await fetch(
          `${SB_URL}/rest/v1/app_config?select=value&key=eq.past_committees_archive`,
          {
            headers: { apikey: SB_KEY },
            cache: 'no-store',
          }
        )
        if (res.ok) {
          const rows: { value?: string }[] = await res.json()
          if (rows?.[0]?.value) {
            const parsed = JSON.parse(rows[0].value)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArchiveList(parsed)
              setSelectedId(parsed[0].id)
            }
          }
        }
      } catch {}
    }
    fetchArchiveData()
  }, [])

  const currentCommittee = archiveList.find((c) => c.id === selectedId) || archiveList[0]

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
              { label: 'বর্তমান কমিটি', href: '/committee' },
              { label: 'প্রাক্তন কমিটি আর্কাইভ' },
            ]}
          />

          {/* ১. হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <History className="size-3.5" />
              <span>সাংগঠনিক ইতিহাস ও ধারাবাহিকতা • Committee Archive</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">
              প্রাক্তন কার্যনির্বাহী কমিটি আর্কাইভ
            </h1>

            <p className="text-cyan-200 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি
            </p>

            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-1">
              প্রতিষ্ঠার পর থেকে বিভিন্ন মেয়াদে সংগঠনের দায়িত্ব পালনকারী সাবেক সভাপতি, সাধারণ সম্পাদক ও কার্যনির্বাহী পরিষদের কর্মকর্তাদের ঐতিহাসিক তালিকা।
            </p>
          </div>

          {/* ২. সেশন সিলেক্টর চিপস (মেয়াদ বাছাই) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1 text-white">
              <h2 className="font-serif text-sm sm:text-base font-bold flex items-center gap-2">
                <Calendar className="size-4 text-cyan-400" />
                <span>মেয়াদকাল বা সেশন নির্বাচন করুন:</span>
              </h2>
              <span className="text-xs text-cyan-300 font-bold">
                মোট {archiveList.length.toLocaleString('bn-BD')}টি মেয়াদ
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {archiveList.map((comm) => {
                const isActive = comm.id === selectedId
                return (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => setSelectedId(comm.id)}
                    className={`shrink-0 rounded-2xl border px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-lg scale-[1.02]'
                        : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <History className="size-3.5" />
                    <span>মেয়াদ: {comm.sessionBn}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ৩. নির্বাচিত মেয়াদের পূর্ণাঙ্গ বিবরণ */}
          {currentCommittee && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* নির্বাচিত সেশনের টাইটেল কার্ড */}
              <div className="glass-card p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-cyan-400">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full text-cyan-200 border border-white/20">
                    মেয়াদ সেশন: {currentCommittee.sessionBn} ({currentCommittee.sessionEn})
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                    {currentCommittee.termTitle}
                  </h2>
                </div>

                {currentCommittee.achievementsSummary && (
                  <p className="text-xs text-slate-200 max-w-md sm:text-right leading-relaxed">
                    💡 {currentCommittee.achievementsSummary}
                  </p>
                )}
              </div>

              {/* নির্বাচিত মেয়াদের সভাপতি ও সাধারণ সম্পাদক */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/15 pb-2 text-white">
                  <Award className="size-5 text-amber-400" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold">
                    সাবেক সভাপতি ও সাধারণ সম্পাদক ({currentCommittee.sessionBn})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[currentCommittee.president, currentCommittee.generalSecretary].map((lead, idx) => (
                    <article
                      key={idx}
                      className="glass-card p-6 flex flex-col justify-between text-white space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-white/25 shrink-0">
                          {lead.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={lead.photo_url}
                              alt={lead.name}
                              className="size-full rounded-2xl object-cover"
                            />
                          ) : (
                            lead.name.charAt(0)
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="inline-block rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold">
                            {lead.role} ({currentCommittee.sessionBn})
                          </span>

                          <h4 className="font-serif text-lg font-bold text-white leading-snug">
                            {lead.name}
                          </h4>

                          {lead.department && (
                            <p className="text-xs text-cyan-200 flex items-center gap-1.5">
                              <GraduationCap className="size-3.5 shrink-0" />
                              <span>{lead.department} {lead.batch ? `(${lead.batch})` : ''}</span>
                            </p>
                          )}

                          {lead.media && (
                            <p className="text-xs text-slate-300 flex items-center gap-1.5">
                              <Newspaper className="size-3.5 shrink-0 text-cyan-400" />
                              <span>প্রতিনিধি: {lead.media}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {lead.currentStatus && (
                        <div className="rounded-xl bg-white/10 p-2.5 border border-white/10 text-xs text-slate-200 flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                          <span>বর্তমান অবস্থান: <b>{lead.currentStatus}</b></span>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              {/* নির্বাচিত মেয়াদের অন্যান্য কর্মকর্তাবৃন্দ */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/15 pb-2 text-white">
                  <Users className="size-5 text-cyan-400" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold">
                    কার্যনির্বাহী পরিষদের অন্যান্য দায়িত্বপ্রাপ্ত সদস্যবৃন্দ
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentCommittee.otherOfficers.map((off, oIdx) => (
                    <div
                      key={oIdx}
                      className="glass-card p-4 flex items-center gap-3 text-white hover:border-cyan-400/60 transition-colors"
                    >
                      <div className="size-11 rounded-xl bg-white/10 text-cyan-300 font-bold flex items-center justify-center text-sm shrink-0 border border-white/15">
                        {off.name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-cyan-300 font-bold block">
                          {off.role}
                        </span>
                        <h4 className="font-bold text-sm text-white truncate">{off.name}</h4>
                        {off.department && (
                          <p className="text-[11px] text-slate-300 truncate">
                            {off.department} {off.batch ? `· ${off.batch}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* ৪. অন্যান্য পাতার সাথে দ্রুত লিংক */}
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
                  <p className="text-[10px] text-slate-300">বর্তমান মেয়াদের নেতৃত্ব দেখুন</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>

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
                  <p className="font-bold text-xs sm:text-sm">গঠনতন্ত্র ও আচরণবিধি</p>
                  <p className="text-[10px] text-slate-300">সাংগঠনিক নিয়ম ও ধারা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
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
