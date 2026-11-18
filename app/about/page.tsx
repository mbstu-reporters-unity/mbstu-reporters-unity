import type { Metadata } from 'next'
import Link from 'next/link'
import {
  History,
  Target,
  Compass,
  Award,
  CheckCircle2,
  FileText,
  Users,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (মাভাবিপ্রবি রিপোর্টার্স ইউনিটি) এর ইতিহাস, লক্ষ্য, উদ্দেশ্য, ভিশন, মিশন ও সাংবাদিকতার অঙ্গীকার।',
}

export default async function AboutPage() {
  const settings = await getSiteSettings()
  const b = settings.branding

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          
          {/* ব্রেডক্রাম্ব নেভিগেশন */}
          <BackNavigation
            items={[
              { label: 'পরিচিতি' },
              { label: 'আমাদের সম্পর্কে' },
            ]}
          />

          {/* ১. আকর্ষণীয় হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Sparkles className="size-3.5" />
              <span>ঐতিহ্য ও সত্যের সাথে ক্যাম্পাস সাংবাদিকতা</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">
              {b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'}
            </h1>
            <p className="text-cyan-200 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
              {b.orgNameEn || "Mawlana Bhashani Science and Technology University Reporters' Unity"}
            </p>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto pt-2">
              বস্তুনিষ্ঠ তথ্য, সততা, নির্ভীক সাংবাদিকতা এবং ক্যাম্পাস শিক্ষার্থীদের অধিকার ও সাফল্যের প্রতিফলন ঘটানোর এক অনন্য প্রাতিষ্ঠানিক প্ল্যাটফর্ম।
            </p>
          </div>

          {/* ২. প্রতিষ্ঠার পটভূমি ও ইতিহাস */}
          <section className="glass-card p-6 sm:p-8 space-y-4 text-white">
            <div className="flex items-center gap-2.5 border-b border-white/15 pb-3">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <History className="size-5" />
              </span>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  প্রতিষ্ঠার পটভূমি ও ইতিহাস
                </h2>
                <p className="text-xs text-slate-300">ক্যাম্পাসে সাংবাদিকতার প্রাতিষ্ঠানিক সূচনা</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <p>
                মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের মুক্তচিন্তা, বুদ্ধিবৃত্তিক বিকাশ এবং ক্যাম্পাসের সকল সত্য ও গঠনমূলক সংবাদ শিক্ষার্থীদের সামনে উন্মোচন করার প্রত্যয়ে যাত্রা শুরু করে <strong className="text-white">মাভাবিপ্রবি রিপোর্টার্স ইউনিটি (MBSTURU)</strong>। জাতীয় ও স্থানীয় বিভিন্ন গণমাধ্যমে কর্মরত বিশ্ববিদ্যালয় প্রতিনিধিদের ঐক্যবদ্ধ করে ক্যাম্পাসে দায়িত্বশীল সাংবাদিকতা চর্চা গড়ে তোলাই এ সংগঠনের মূল উদ্দেশ্য।
              </p>
              <p>
                বিশ্ববিদ্যালয়ের শিক্ষার্থী, শিক্ষক, কর্মকর্তা-কর্মচারী ও প্রশাসনের মধ্যে একটি ইতিবাচক ও স্বচ্ছ সেতুবন্ধন তৈরিতে কাজ করে যাচ্ছে এই সংগঠন। তথ্যের অবাধ প্রবাহ নিশ্চিত করা, ক্যাম্পাসের সংকট ও সম্ভাবনাসমূহ জাতীয় পরিমণ্ডলে তুলে ধরা এবং উদীয়মান তরুণ ক্যাম্পাস সাংবাদিকদের সঠিক প্রশিক্ষণ প্রদান আমাদের অন্যতম অঙ্গীকার।
              </p>
            </div>
          </section>

          {/* ৩. ভিশন ও মিশন */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ভিশন */}
            <div className="glass-card p-6 space-y-3 text-white">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Compass className="size-5" />
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">আমাদের ভিশন (Vision)</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
                একটি নির্ভীক, নৈতিক ও দায়িত্বশীল সাংবাদিক সমাজ গড়ে তোলা—যা বিশ্ববিদ্যালয়ের প্রশাসনিক জবাবদিহিতা নিশ্চিত করবে, সাধারণ শিক্ষার্থীদের অধিকার ও দাবিকে উচ্চকণ্ঠে ধারণ করবে এবং জাতীয় গণমাধ্যমে বিশ্ববিদ্যালয়কে ইতিবাচকভাবে উপস্থাপন করবে।
              </p>
            </div>

            {/* মিশন */}
            <div className="glass-card p-6 space-y-3 text-white">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Target className="size-5" />
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">আমাদের মিশন (Mission)</h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>ক্যাম্পাস সংবাদ সংগ্রহ ও প্রকাশের ক্ষেত্রে শতভাগ নিরপেক্ষতা ও সত্যতা বজায় রাখা।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>শিক্ষার্থীদের গবেষণা, উদ্ভাবন ও সাহিত্যকর্মকে জাতীয় পর্যায়ে তুলে ধরা।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>নিয়মিত সাংবাদিকতা কর্মশালা, সেমিনার ও ফ্যাক্ট-চেকিং প্রশিক্ষণের আয়োজন করা।</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ৪. আমাদের মূল লক্ষ্য ও উদ্দেশ্যসমূহ */}
          <section className="glass-card p-6 sm:p-8 space-y-5 text-white">
            <div className="border-b border-white/15 pb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="size-5 text-cyan-400" />
                <span>মূল লক্ষ্য ও উদ্দেশ্যসমূহ</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">সংগঠন পরিচালনার মূল স্তম্ভ</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'বস্তুনিষ্ঠ সংবাদ চর্চা',
                  desc: 'গুজব ও পক্ষপাতহীন থেকে প্রতিটি সংবাদের সত্যতা মাঠপর্যায়ে যাচাই করে বস্তুনিষ্ঠভাবে প্রকাশ করা।',
                },
                {
                  title: 'শিক্ষার্থী কল্যাণ ও অধিকার',
                  desc: 'সাধারণ শিক্ষার্থীদের আবাসন সংকট, পরিবহন সমস্যা ও শিক্ষার্থীবান্ধব যৌক্তিক দাবিসমূহ প্রশাসনের দৃষ্টিগোচর করা।',
                },
                {
                  title: 'দক্ষ সাংবাদিক তৈরি',
                  desc: 'বিশ্ববিদ্যালয়ের আগ্রহী শিক্ষার্থীদেরকে প্রশিক্ষণ দিয়ে আধুনিক যুগের দক্ষ ও নৈতিক সাংবাদিক হিসেবে গড়ে তোলা।',
                },
                {
                  title: 'সাফল্য ও গবেষণার প্রচার',
                  desc: 'শিক্ষক-শিক্ষার্থীদের আন্তর্জাতিক গবেষণা, উদ্ভাবন ও ক্রীড়া-সাংস্কৃতিক অর্জনসমূহকে যথাযথ মর্যাদা দিয়ে প্রচার করা।',
                },
                {
                  title: 'ডিজিটাল নোটিশ ও তথ্যসেবা',
                  desc: 'বিশ্ববিদ্যালয়ের একাডেমিক নোটিশ, পরীক্ষার ফলাফল ও গুরুত্বপূর্ণ তথ্য সবার কাছে দ্রুততম সময়ে পৌঁছে দেওয়া।',
                },
                {
                  title: 'আন্তঃবিশ্ববিদ্যালয় ঐক্য',
                  desc: 'দেশের অন্যান্য পাবলিক বিশ্ববিদ্যালয়ের সাংবাদিক সমিতির সাথে সৌহার্দ্যপূর্ণ সম্পর্ক ও অভিজ্ঞতা বিনিময় বজায় রাখা।',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1.5 hover:border-cyan-400 transition-colors">
                  <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ৫. অর্জন ও মাইলফলক (Milestones) */}
          <section className="glass-card p-6 sm:p-8 space-y-4 text-white">
            <div className="flex items-center gap-2 border-b border-white/15 pb-3">
              <Award className="size-5 text-amber-400" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                অর্জন ও মাইলফলক
              </h2>
            </div>

            <div className="space-y-4 relative border-l-2 border-cyan-400/40 ml-3 sm:ml-4 pl-4 sm:pl-6 pt-1">
              {[
                {
                  title: 'ডিজিটাল স্মার্ট ক্যাম্পাস নিউজ পোর্টাল চালু',
                  desc: 'ক্যাম্পাস সাংবাদিক সমিতিগুলোর মধ্যে অন্যতম আধুনিক PWA ও সোশ্যাল ফিচার সংবলিত ডিজিটাল পোর্টাল উন্মোচন।',
                },
                {
                  title: 'ক্যাম্পাস সাংবাদিকতা কর্মশালা',
                  desc: 'প্রতিবছর শতাধিক নবীন শিক্ষার্থীকে অনুসন্ধানী সাংবাদিকতা, মোবাইল জার্নালিজম (MoJo) ও ফিচার রাইটিং প্রশিক্ষণ।',
                },
                {
                  title: 'শিক্ষক মতামত ও সম্পাদকীয় কর্নার',
                  desc: 'সম্মানিত শিক্ষকদের গবেষণা ও চিন্তাভাবনা প্রকাশের জন্য বিশেষায়িত ডিজিটাল কলাম হাব প্রতিষ্ঠা।',
                },
                {
                  title: 'শিক্ষার্থী সমস্যা সমাধানে গঠনমূলক ভূমিকা',
                  desc: 'হল ডাইনিং, নিরাপদ ক্যাম্পাস ও পরিবহন ব্যবস্থা নিয়ে তথ্যবহুল ধারাবাহিক রিপোর্ট প্রকাশের মাধ্যমে সংশ্লিষ্ট কর্তৃপক্ষের দৃষ্টি আকর্ষণ।',
                },
              ].map((m, i) => (
                <div key={i} className="relative space-y-1">
                  <span className="absolute -left-[23px] sm:-left-[31px] top-1 size-3 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                  <h3 className="font-bold text-sm sm:text-base text-cyan-200">{m.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ৬. দ্রুত রেফারেন্স ও অন্যান্য পাতাসমূহের লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
                  <p className="text-[10px] text-slate-300">PDF ডাউনলোড ও বিধিমালা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

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
              href="/council"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">ডিরেক্টর প্যানেল</p>
                  <p className="text-[10px] text-slate-300">মডারেশন ও অ্যাডমিন কাউন্সিল</p>
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
