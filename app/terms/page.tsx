import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { Tx } from '@/lib/i18n'

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
          <BackNavigation items={[{ label: <Tx bn="ব্যবহারের শর্তাবলি" en="Terms of Use" /> }]} />

          <div className="glass-card p-6 sm:p-10 space-y-6 text-white border border-white/20 rounded-3xl shadow-2xl">
            <div className="border-b border-white/15 pb-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
                <Scale className="size-3.5" />
                <span>Terms & Conditions</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold">
                <Tx bn="ব্যবহারের শর্তাবলি ও কপিরাইট" en="Terms of Use and Copyright" />
              </h1>
              <p className="text-xs text-slate-300"><Tx bn="সর্বশেষ পরিমার্জন: ২০২৬" en="Last revised: 2026" /></p>
            </div>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300"><Tx bn="১. লেখা ও কপিরাইট" en="1. Content and Copyright" /></h2>
              <p>
                <Tx
                  bn="প্রতিটি লেখা, ছবি, ভিডিও বা প্রকাশনার স্বত্ব পৃথক হতে পারে। কোনো উপাদান প্রকাশিত হলেই তা সংগঠন বা প্রতিবেদকের একক মালিকানাধীন—এমনটি ধরে নেওয়া যাবে না; তৃতীয় পক্ষের উপাদানের স্বত্ব সংশ্লিষ্ট অধিকারীর কাছে থাকতে পারে। পুনঃপ্রকাশ বা বাণিজ্যিক ব্যবহারের আগে স্বত্বাধিকারীর অনুমতি গ্রহণ করুন এবং প্রযোজ্য ক্ষেত্রে যথাযথ স্বীকৃতি দিন।"
                  en="Rights may differ for each article, photo, video, or publication. Publication does not by itself mean the material is exclusively owned by the organization or a reporter; third-party rights may remain with their owners. Obtain permission before republishing or commercial use, and credit the rights holder where appropriate."
                />
              </p>
              <Link
                href="/policies#copyright"
                className="inline-flex items-center gap-1 text-cyan-300 underline underline-offset-4 hover:text-white"
              >
                <Tx bn="কপিরাইট ও গণমাধ্যম উপকরণ ব্যবহারের বিস্তারিত নীতি" en="Copyright and media usage policy" />{' '}
                <AlertTriangle className="size-3.5" />
              </Link>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300"><Tx bn="২. মন্তব্য ও মতপ্রকাশের নিয়ম" en="2. Comments and Freedom of Expression" /></h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><Tx bn="সংবাদের নিচে পাঠকের গঠনমূলক মন্তব্যকে স্বাগত জানানো হয়।" en="Constructive reader comments on news reports are welcome." /></li>
                <li><Tx bn="ধর্মীয় বিদ্বেষ, ব্যক্তিগত আক্রমণ, অশালীন ভাষা, বিভ্রান্তিকর প্রচারণা অথবা আইন লঙ্ঘনকারী মন্তব্য গ্রহণযোগ্য নয়। এ ধরনের মন্তব্য অপসারণের অধিকার সংরক্ষণ করে মডারেশন দল।" en="Comments involving religious hatred, personal attacks, abusive language, misleading propaganda, or unlawful content are not permitted. The moderation team reserves the right to remove such comments." /></li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300"><Tx bn="৩. সংশোধনী নীতি" en="3. Corrections Policy" /></h2>
              <p>
                <Tx
                  bn="প্রকাশিত প্রতিবেদনে ভুলের বিষয়ে নির্ভরযোগ্য তথ্য পেলে আমরা তা যাচাই করে প্রয়োজন অনুযায়ী সংশোধন বা হালনাগাদ করব। গুরুত্বপূর্ণ তথ্যগত সংশোধনের ক্ষেত্রে সংশোধনী-নোট ও তারিখ উল্লেখ করা হবে। অনুরোধের সঙ্গে প্রতিবেদনের লিংক, ভুল অংশ, সঠিক তথ্য এবং সম্ভব হলে প্রমাণ যুক্ত করুন।"
                  en="If credible information indicates an error in a published report, we will review and correct or update it as appropriate. Material factual corrections will include a note and date. Please include the article link, disputed passage, accurate information, and evidence when possible."
                />
              </p>
              <Link
                href="/policies#corrections"
                className="inline-flex items-center gap-1 text-cyan-300 underline underline-offset-4 hover:text-white"
              >
                <Tx bn="সম্পূর্ণ সংশোধনী নীতি দেখুন" en="Read the full corrections policy" />{' '}
                <CheckCircle2 className="size-3.5" />
              </Link>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300"><Tx bn="৪. বিজ্ঞাপন ও পৃষ্ঠপোষকতা" en="4. Advertising and Sponsorship" /></h2>
              <p>
                <Tx
                  bn="বিজ্ঞাপন বা পৃষ্ঠপোষকতাপ্রাপ্ত উপাদান প্রকাশ করা হলে তা স্পষ্টভাবে চিহ্নিত করা হবে। পৃষ্ঠপোষকতা কোনো সংবাদ বা সম্পাদনাগত সিদ্ধান্তকে প্রভাবিত করার অধিকার দেয় না। বিস্তারিত জানতে "
                  en="Any advertising or sponsored content will be clearly labelled. Sponsorship does not buy news coverage or editorial decisions. Read our "
                />
                <Link href="/policies#advertising" className="text-cyan-300 underline underline-offset-4 hover:text-white">
                  <Tx bn="বিজ্ঞাপন ও পৃষ্ঠপোষকতা নীতি" en="advertising and sponsorship policy" />
                </Link>{' '}
                <Tx bn="দেখুন।" en="." />
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
