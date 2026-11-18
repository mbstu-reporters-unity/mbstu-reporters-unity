import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'

export const metadata: Metadata = {
  title: 'ব্যবহারের শর্তাবলি (Terms of Use) | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির ওয়েবসাইট ব্যবহারের সাধারণ নিয়ম ও কপিরাইট শর্তাবলি।',
}

export default function TermsOfUsePage() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-6">
          <BackNavigation items={[{ label: 'ব্যবহারের শর্তাবলি' }]} />

          <div className="glass-card p-6 sm:p-10 space-y-6 text-white border border-white/20 rounded-3xl shadow-2xl">
            <div className="border-b border-white/15 pb-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
                <Scale className="size-3.5" />
                <span>Terms & Conditions</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold">
                ব্যবহারের শর্তাবলি ও কপিরাইট
              </h1>
              <p className="text-xs text-slate-300">সর্বশেষ পরিমার্জন: ২০২৬</p>
            </div>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300">১. কনটেন্ট ও কপিরাইট স্বত্ব</h2>
              <p>
                মাভাবিপ্রবি রিপোর্টার্স ইউনিটি পোর্টালে প্রকাশিত সকল সংবাদ, আলোকচিত্র, ভিডিও ও প্রকাশনা সংগঠনের নিজস্ব ও সংশ্লিষ্ট প্রতিবেদকের মেধা-সম্পদ। অনুমতি ব্যতীত বাণিজ্যিক উদ্দেশ্যে কোনো লেখা বা ছবি হুবহু কপি করা বা পরিবর্তন করে প্রচার করা কপিরাইট আইনের লঙ্ঘন। তবে সংবাদ উদ্ধৃতি বা গবেষণার উদ্দেশ্যে ক্রেডিট (সৌজন্যে: মাভাবিপ্রবি রিপোর্টার্স ইউনিটি) উল্লেখপূর্বক প্রচার করা যাবে।
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300">২. মন্তব্য ও মুক্তমতের নিয়মাবলি</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>সংবাদের নিচে পাঠকের গঠনমূলক মন্তব্যকে স্বাগত জানানো হয়।</li>
                <li>ধর্মীয় বিদ্বেষ, ব্যক্তিগত আক্রমণ, গালাগালি, বিভ্রান্তিকর প্রোপাগান্ডা বা আইনি সীমা লঙ্ঘনকারী কোনো মন্তব্য গ্রহণযোগ্য নয়। মডারেশন টিম তা মুছে দেওয়ার ক্ষমতা রাখে।</li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300">৩. সংশোধনী নীতি (Corrections Policy)</h2>
              <p>
                আমরা সংবাদের শতভাগ সত্যতা নিশ্চিত করে সংবাদ পরিবেশন করি। তবে অনিচ্ছাকৃত কোনো তথ্যের ভুল নজরে এলে বা উপযুক্ত প্রমাণসহ যোগাযোগ করা হলে তা দ্রুত সংশোধন ও আপডেট করা হয়।
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
