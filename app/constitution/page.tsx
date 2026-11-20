'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Download,
  Printer,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { useSiteSettings } from '@/components/portal/site-settings-context'
import { Tx } from '@/lib/i18n'

interface ArticleItem {
  id: string
  number: string
  title: string
  clauses: string[]
}

const ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    number: 'ধারা ১',
    title: 'নাম ও কার্যক্ষেত্র',
    clauses: [
      'এই সংগঠনটির পূর্ণ নাম হবে "মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি" (সংক্ষেপে "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি" বা ইংরেজিতে "MBSTU Reporters\' Unity - MBSTURU")।',
      'সংগঠনটির কেন্দ্রীয় কার্যালয় মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (সন্তোষ, টাঙ্গাইল-১৯০২) ক্যাম্পাসে অবস্থিত থাকবে।',
      'সংগঠনের কার্যপরিধি সমগ্র বিশ্ববিদ্যালয় ক্যাম্পাস ও সংশ্লিষ্ট পরিসরে সীমাবদ্ধ থাকবে।',
    ],
  },
  {
    id: 'art-2',
    number: 'ধারা ২',
    title: 'মূল দর্শন ও উদ্দেশ্য',
    clauses: [
      'বিশ্ববিদ্যালয়ের মুক্তবুদ্ধিচর্চা, শিক্ষার সুষ্ঠু পরিবেশ এবং তথ্যের অবাধ অধিকার সমুন্নত রাখা।',
      'জাতীয়, আঞ্চলিক ও অনলাইন গণমাধ্যমে বিশ্ববিদ্যালয় সম্পর্কিত সংবাদ বস্তুনিষ্ঠ, সঠিক ও নিরপেক্ষভাবে তুলে ধরা।',
      'ক্যাম্পাসে কর্মরত সাংবাদিকদের পেশাগত নিরাপত্তা, ঐক্য ও অধিকার নিশ্চিত করা।',
      'অপসাংবাদিকতা ও হলুদ সাংবাদিকতা প্রতিরোধে সাংবাদিকদের দক্ষতা উন্নয়ন ও নীতিশাস্ত্র প্রশিক্ষণ দেওয়া।',
    ],
  },
  {
    id: 'art-3',
    number: 'ধারা ৩',
    title: 'সদস্যপদ লাভ ও প্রকারভেদ',
    clauses: [
      'সাধারণ সদস্য (General Member): বিশ্ববিদ্যালয়ের নিয়মিত শিক্ষার্থী, যিনি কোনো জাতীয়/স্থানীয়/অনলাইন গণমাধ্যমে ক্যাম্পাস প্রতিনিধি হিসেবে ন্যূনতম ৬ মাস দায়িত্বশীলভাবে কর্মরত আছেন।',
      'সহযোগী সদস্য (Associate Member): সাংবাদিকতায় আগ্রহী নবীন শিক্ষার্থী, যারা সংগঠনের প্রাথমিক প্রশিক্ষণ ও শিক্ষানবিস পর্বে সফলভাবে উত্তীর্ণ হয়েছেন।',
      'আজীবন সদস্য (Life Member): সংগঠনের প্রাক্তন নেতৃত্ব বা সিনিয়র সদস্য, যারা কর্মজীবনে জাতীয় গণমাধ্যমে প্রতিষ্ঠিত এবং সংগঠনের সার্বিক কল্যাণে ভূমিকা রাখছেন।',
      'সদস্যপদ প্রাপ্তির জন্য নির্ধারিত ফরমে আবেদন করতে হবে এবং কার্যনির্বাহী পরিষদের সংখ্যাগরিষ্ঠ মতামতে তা অনুমোদিত হতে হবে।',
    ],
  },
  {
    id: 'art-4',
    number: 'ধারা ৪',
    title: 'সদস্যপদের অবসান ও শাস্তিমূলক ব্যবস্থা',
    clauses: [
      'কোনো সদস্যের ছাত্রত্ব শেষ হলে বা স্বেচ্ছায় পদত্যাগপত্র জমা দিলে তার সদস্যপদ সাধারণ সদস্য থেকে প্রাক্তন সদস্যে রূপান্তরিত হবে।',
      'সংগঠনবিরোধী কার্যকলাপ, আর্থিক অনিয়ম, অনৈতিক আচরণ বা গঠনতন্ত্র পরিপন্থী কর্মকাণ্ড প্রমাণিত হলে কার্যনির্বাহী পরিষদ সদস্যপদ স্থগিত বা স্থায়ী বহিষ্কার করতে পারবে।',
      'অভিযুক্ত সদস্যকে আত্মপক্ষ সমর্থনের জন্য ন্যূনতম ৭ দিনের লিখিত নোটিশ প্রদান বাধ্যতামূলক।',
    ],
  },
  {
    id: 'art-5',
    number: 'ধারা ৫',
    title: 'সাংগঠনিক কাঠামো ও কার্যনির্বাহী পরিষদ',
    clauses: [
      'সংগঠন পরিচালনার জন্য ১ বছর মেয়াদি একটি কার্যনির্বাহী পরিষদ গঠিত হবে।',
      'কার্যনির্বাহী পরিষদের পদসমূহ: সভাপতি, সহ-সভাপতি, সাধারণ সম্পাদক, যুগ্ম-সাধারণ সম্পাদক, অর্থ সম্পাদক, দপ্তর সম্পাদক, প্রচার ও প্রকাশনা সম্পাদক, তথ্য ও প্রযুক্তি সম্পাদক, ক্রীড়া ও সাংস্কৃতিক সম্পাদক এবং কার্যনির্বাহী সদস্যবৃন্দ।',
      'কার্যনির্বাহী পরিষদের সকল সিদ্ধান্ত গণতান্ত্রিকভাবে সংখ্যাগরিষ্ঠ মতামতের ভিত্তিতে গৃহীত হবে।',
    ],
  },
  {
    id: 'art-6',
    number: 'ধারা ৬',
    title: 'নির্বাচন ও নির্বাচন কমিশন',
    clauses: [
      'কার্যনির্বাহী পরিষদের মেয়াদ সমাপ্তির পূর্বে কার্যনির্বাহী পরিষদ কর্তৃক ৩ সদস্যবিশিষ্ট একটি নিরপেক্ষ নির্বাচন কমিশন গঠিত হবে (শিক্ষক উপদেষ্টা ও সিনিয়র সদস্যের সমন্বয়ে)।',
      'ভোটার তালিকায় অন্তর্ভুক্ত সাধারণ সদস্যদের প্রত্যক্ষ ও গোপন ব্যালটের মাধ্যমে নতুন নেতৃত্ব নির্বাচিত হবে।',
      'নির্বাচন কমিশন তফসিল ঘোষণা থেকে শুরু করে ফলাফল গেজেট প্রকাশ পর্যন্ত নির্বাচন সংক্রান্ত সকল বিষয়ে চূড়ান্ত সিদ্ধান্ত প্রদান করবে।',
    ],
  },
  {
    id: 'art-7',
    number: 'ধারা ৭',
    title: 'তহবিল ও আর্থিক ব্যবস্থাপনা',
    clauses: [
      'সদস্যদের মাসিক চাঁদা, অনুদান এবং প্রকাশনাসমূহ থেকে অর্জিত অর্থ নিয়ে সংগঠনের কেন্দ্রীয় তহবিল গঠিত হবে।',
      'সংগঠনের নামে তফসিলি ব্যাংকে পরিচালিত হিসাবের মাধ্যমে আর্থিক লেনদেন হবে, যা সভাপতি, সাধারণ সম্পাদক ও অর্থ সম্পাদকের যৌথ স্বাক্ষরে পরিচালিত হবে।',
      'প্রতিটি আর্থিক বছরের শেষে কার্যনির্বাহী পরিষদ সাধারণ সভায় পূর্ণাঙ্গ অডিট প্রতিবেদন পেশ করতে বাধ্য থাকবে।',
    ],
  },
  {
    id: 'art-8',
    number: 'ধারা ৮',
    title: 'গঠনতন্ত্র সংশোধন প্রক্রিয়া',
    clauses: [
      'গঠনতন্ত্রের কোনো ধারা সংশোধন, পরিবর্তন বা পরিমার্জনের জন্য সাধারণ সভার মোট সাধারণ সদস্যের ন্যূনতম দুই-তৃতীয়াংশ (২/৩) সদস্যের সমর্থন আবশ্যক হবে।',
      'সংশোধনী প্রস্তাবটি সাধারণ সভার আলোচ্যসূচিতে ন্যূনতম ৩ দিন পূর্বে আনুষ্ঠানিকভাবে উত্থাপন করতে হবে।',
    ],
  },
]

const ETHICS_CODE = [
  '১. সত্যতা ও বস্তুনিষ্ঠতা: প্রতিটি তথ্যের সত্যতা অন্তত দুটি নির্ভরযোগ্য উৎস থেকে যাচাই করে প্রকাশ করা।',
  '২. নিরপেক্ষতা ও পক্ষপাতহীনতা: ব্যক্তিগত বা রাজনৈতিক মতাদর্শকে সংবাদের ঊর্ধ্বে রাখা।',
  '৩. সূত্রের সুরক্ষা (Confidentiality): গোপনীয় সংবাদের বিশ্বস্ত সূত্রের নিরাপত্তা ও গোপনীয়তা শতভাগ রক্ষা করা।',
  '৪. কনফ্লিক্ট অফ ইন্টারেস্ট বর্জন: কোনো ব্যক্তি বা প্রতিষ্ঠানের কাছ থেকে ব্যক্তিগত সুবিধা, উপহার বা অনৈতিক সুবিধা না নেওয়া।',
  '৫. ভুল স্বীকার ও দ্রুত সংশোধন: সংবাদে অনিচ্ছাকৃত ভুল প্রকাশিত হলে দ্রুততম সময়ে তা স্বীকার করে স্পষ্ট সংশোধনী প্রকাশ করা।',
  '৬. ব্যক্তিগত আক্রমণ পরিহার: কারো ধর্মীয় বিশ্বাস, জাতিসত্তা, শারীরিক অক্ষমতা বা লিঙ্গ নিয়ে কটূক্তি ও আক্রমণাত্মক লেখা সম্পূর্ণরূপে নিষিদ্ধ।',
]

export default function ConstitutionPage() {
  const settings = useSiteSettings()
  const [openArticle, setOpenArticle] = useState<string | null>('art-1')

  // অ্যাডমিন প্যানেলের site_settings থেকে ডায়নামিক PDF লিংক পড়া
  const rawPdfUrl =
    settings?.behaviorAndPages?.constitutionPdfUrl ||
    (settings?.behaviorAndPages?.subPages as Record<string, unknown> | undefined)?.constitutionPdfUrl
  const constitutionPdfUrl = typeof rawPdfUrl === 'string' ? rawPdfUrl.trim() : ''

  const toggleArticle = (id: string) => {
    setOpenArticle((prev) => (prev === id ? null : id))
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <>
      {/* ক্লিন প্রিন্ট হওয়ার স্টাইল */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, nav, .print-hidden {
            display: none !important;
          }
          .glass-card {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          h1, h2, h3, p, span {
            color: #111827 !important;
          }
        }
      `}</style>

      <div className="print-hidden">
        <TopBar />
        <SiteHeader />
      </div>

      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 space-y-6">

          {/* ব্রেডক্রাম্ব নেভিগেশন */}
          <div className="print-hidden">
            <BackNavigation
              items={[
                { label: 'আমাদের সম্পর্কে', href: '/about' },
                { label: 'গঠনতন্ত্র ও নীতিমালা' },
              ]}
            />
          </div>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Scale className="size-3.5" />
              <span>সাংগঠনিক মূল বিধিমালা ও সংবিধিবদ্ধ কাঠামো</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              গঠনতন্ত্র ও আচরণবিধি
            </h1>
            <p className="text-cyan-200 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              Constitution & Code of Ethics — MBSTU Reporters' Unity
            </p>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-1">
              মাভাবিপ্রবি রিপোর্টার্স ইউনিটি পরিচালনাকারী সংবিধিবদ্ধ নীতিমালা, সদস্যপদের বিধান, নির্বাচন প্রক্রিয়া ও দায়িত্বশীল সাংবাদিকতার নৈতিক আচরণবিধি।
            </p>

            {/* অ্যাকশন বাটন: আসল PDF ডাউনলোড, প্রিন্ট ও আচরণবিধি লিংক */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 print-hidden">
              {constitutionPdfUrl ? (
                <a
                  href={constitutionPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-2 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>অফিসিয়াল PDF ডাউনলোড</span>
                </a>
              ) : null}

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Printer className="size-4" />
                <span>প্রিন্ট / PDF সংরক্ষণ</span>
              </button>

              <a
                href="#ethics"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 text-xs font-bold transition active:scale-95"
              >
                <ShieldCheck className="size-4 text-cyan-300" />
                <span>সাংবাদিকতার আচরণবিধি</span>
              </a>
            </div>
          </div>

          {/* প্রস্তাবনা (Preamble) */}
          <section className="glass-card p-6 sm:p-8 space-y-3 text-white border-l-4 border-l-cyan-400">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-cyan-300 flex items-center gap-2">
              <BookOpen className="size-5" />
              <span>প্রস্তাবনা (Preamble)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed text-justify">
              "আমরা, মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের ক্যাম্পাসে সক্রিয় গণমাধ্যম প্রতিনিধিবৃন্দ—ক্যাম্পাসে মুক্ত ও নিরপেক্ষ সাংবাদিকতা চর্চা, তথ্যের অবাধ প্রবাহ নিশ্চিতকরণ, সাধারণ শিক্ষার্থীদের ন্যায্য অধিকার ও সমস্যা তুলে ধরা এবং বিশ্ববিদ্যালয়ের ইতিবাচক ভাবমূর্তি সমুন্নত রাখার দৃঢ় প্রত্যয়ে ঐক্যবদ্ধ হয়ে এই গঠনতন্ত্র প্রণয়ন ও গ্রহণ করছি।"
            </p>
          </section>

          {/* আচরণবিধি সেকশন (Code of Ethics) */}
          <section id="ethics" className="glass-card p-6 sm:p-8 space-y-4 text-white">
            <div className="flex items-center gap-2.5 border-b border-white/15 pb-3">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  ক্যাম্পাস সাংবাদিকতার আচরণবিধি (Code of Ethics)
                </h2>
                <p className="text-xs text-slate-300">সংগঠনের সকল সদস্যের জন্য অবশ্য পালনীয় পেশাগত নীতি</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {ETHICS_CODE.map((ethic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-start gap-2.5 hover:border-amber-400/60 transition-colors"
                >
                  <CheckCircle2 className="size-4 text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-100 leading-relaxed">{ethic}</p>
                </div>
              ))}
            </div>
          </section>

          {/* মূল গঠনতন্ত্রের ধারাসমূহ (Interactive Accordion) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1 text-white">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                <Scale className="size-5 text-cyan-400" />
                <span>গঠনতন্ত্রের পূর্ণাঙ্গ ধারাসমূহ ({ARTICLES.length}টি ধারা)</span>
              </h2>
              <span className="text-xs text-cyan-200 print-hidden">ক্লিক করে বিস্তারিত পড়ুন</span>
            </div>

            <div className="space-y-2.5">
              {ARTICLES.map((art) => {
                const isOpen = openArticle === art.id
                return (
                  <div
                    key={art.id}
                    className={`glass-card transition-all overflow-hidden ${
                      isOpen ? 'border-cyan-400/70 shadow-lg' : 'hover:border-white/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleArticle(art.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-bold text-xs">
                          {art.number}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-white truncate">
                          {art.title}
                        </h3>
                      </div>
                      <span className="p-1 rounded-full bg-white/10 text-white/70 shrink-0 print-hidden">
                        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-white/10 space-y-2 animate-in fade-in">
                        {art.clauses.map((clause, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                            <span className="size-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
                            <p>{clause}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* দ্রুত লিংক ও রেফারেন্স */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 print-hidden">
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
                  <p className="text-[10px] text-slate-300">কার্যনির্বাহী পরিষদের সকল কর্মকর্তা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/about"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">আমাদের সম্পর্কে</p>
                  <p className="text-[10px] text-slate-300">ইতিহাস, ভিশন ও সাংগঠনিক অর্জন</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/policies#annual-reports"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">
                    <Tx bn="বার্ষিক প্রতিবেদন ও স্বচ্ছতা" en="Annual Reports & Transparency" />
                  </p>
                  <p className="text-[10px] text-slate-300">
                    <Tx bn="প্রকাশিত নথি ও আর্থিক প্রতিবেদন" en="Published records and financial reports" />
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ফুটার ব্যাক বাটন */}
          <div className="pt-4 border-t border-white/15 print-hidden">
            <BackNavigation fallbackHref="/" />
          </div>

        </div>
      </main>

      <div className="print-hidden">
        <SiteFooter />
        <BackToTop />
      </div>
    </>
  )
}
