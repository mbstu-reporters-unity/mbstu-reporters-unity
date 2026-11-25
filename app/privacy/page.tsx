import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { Tx } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতি (Privacy Policy) | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি পোর্টালে ব্যবহারকারী ও পাঠকদের ব্যক্তিগত তথ্যের সুরক্ষা এবং গোপনীয়তা নীতি।',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-6">
          <BackNavigation items={[{ label: <Tx bn="গোপনীয়তা নীতি" en="Privacy Policy" /> }]} />

          <div className="glass-card p-6 sm:p-10 space-y-6 text-white border border-white/20 rounded-3xl shadow-2xl">
            <div className="border-b border-white/15 pb-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
                <ShieldCheck className="size-3.5" />
                <span>Privacy & Data Protection</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold">
                <Tx bn="গোপনীয়তা নীতি" en="Privacy Policy" />
              </h1>
              <p className="text-xs text-slate-300"><Tx bn="সর্বশেষ সংস্করণ: ২০২৬" en="Last updated: 2026" /></p>
            </div>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Lock className="size-4" /> <Tx bn="১. তথ্যের গোপনীয়তা ও আমাদের অঙ্গীকার" en="1. Privacy and Our Commitment" />
              </h2>
              <p>
                <Tx
                  bn="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (MBSTURU) পাঠক, শিক্ষার্থী ও সদস্যদের ব্যক্তিগত তথ্যের সুরক্ষাকে গুরুত্ব দেয়। ওয়েবসাইট পরিচালনার জন্য প্রয়োজনীয় হোস্টিং, তথ্যভান্ডার ও পরিচয়-যাচাই সেবাদাতার মাধ্যমে তথ্য প্রক্রিয়াকৃত হতে পারে। ব্যক্তিগত তথ্য বাণিজ্যিক বিপণনের উদ্দেশ্যে বিক্রি করা হয় না; পরিচালনাগত প্রয়োজনের মধ্যে তথ্যের প্রবেশাধিকার সীমিত রাখা হয়।"
                  en="Mawlana Bhashani Science and Technology University Reporters' Unity (MBSTURU) takes the privacy of readers, students, and members seriously. Hosting, database, and authentication providers may process information as needed to operate the website. Personal information is not sold for commercial marketing, and access is limited to operational needs."
                />
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Eye className="size-4" /> <Tx bn="২. আমরা কী ধরনের তথ্য সংগ্রহ করি" en="2. Information We Collect" />
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b><Tx bn="সদস্যপদের আবেদন ও নিবন্ধন:" en="Membership applications and registration:" /></b> <Tx bn="নাম, বিভাগ, ব্যাচ, রোল বা শিক্ষার্থী আইডি, মোবাইল নম্বর, ইমেইল ঠিকানা এবং ছবি।" en="Name, department, batch, roll or student ID, mobile number, email address, and photograph." /></li>
                <li>
                  <b><Tx bn="সংবাদ ও তথ্য প্রেরক:" en="News and tip senders:" /></b>{' '}
                  <Tx
                    bn="তথ্যদাতা বা সংবাদ-সূত্রের ফর্মের মাধ্যমে প্রেরিত তথ্য। পরিচয় গোপন রাখার অনুরোধ যথাসম্ভব সম্মান করা হয়; তবে কোনো অনলাইন মাধ্যমে পরিচয় বা মেটাডেটা সম্পূর্ণ গোপন রাখার নিশ্চয়তা দেওয়া সম্ভব নয়।"
                    en="Information sent through whistleblower or tip forms. We try to respect requests for anonymity, but no online channel can guarantee complete anonymity or hide all metadata."
                  />
                </li>
                <li><b><Tx bn="স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য:" en="Automatically collected information:" /></b> <Tx bn="ওয়েবসাইটের কার্যকারিতা উন্নয়নের জন্য ব্রাউজারের ধরন, পৃষ্ঠা-দর্শনের পরিসংখ্যান এবং ক্যাশিং-সংক্রান্ত কুকি।" en="Browser type, page-view analytics, and caching-related cookies used to maintain and improve the website." /></li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <FileText className="size-4" /> <Tx bn="৩. সাংবাদিকতার সূত্রের গোপনীয়তা" en="3. Confidentiality of Journalistic Sources" />
              </h2>
              <p>
                <Tx
                  bn="জনস্বার্থে তথ্য প্রদানকারী কোনো সূত্রের পরিচয় অপ্রয়োজনে প্রকাশ করা হবে না এবং দায়িত্ব পালনের জন্য যাঁদের জানা প্রয়োজন, তাঁদের মধ্যেই তথ্যের প্রবেশাধিকার সীমিত রাখা হবে। তবে ওয়েব ফর্ম, যন্ত্র বা নেটওয়ার্কের তথ্য, জমা দেওয়া উপাদানে থাকা পরিচয়সূচক বিবরণ অথবা প্রযোজ্য আইনি প্রক্রিয়ার কারণে সম্পূর্ণ গোপনীয়তার নিশ্চয়তা দেওয়া সম্ভব নয়। অত্যন্ত সংবেদনশীল তথ্য পাঠানোর আগে নিরাপদ যোগাযোগপদ্ধতি সম্পর্কে সম্পাদকীয় বিভাগের সঙ্গে আলোচনা করুন।"
                  en="We will try not to disclose a source's identity unnecessarily and limit access to people who need it for their work. However, web forms, device or network information, identifying details in submitted content, or applicable legal processes may prevent complete confidentiality. For highly sensitive information, contact the editorial desk first to discuss a safer channel."
                />
              </p>
            </section>

            <section className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300"><Tx bn="৪. যোগাযোগ" en="4. Contact" /></h2>
              <p>
                <Tx bn="গোপনীয়তা নীতি সম্পর্কে কোনো প্রশ্ন থাকলে যোগাযোগ করুন:" en="For questions about this privacy policy, contact:" /> <a href="mailto:mbstureportersunity@gmail.com" className="text-cyan-300 underline">mbstureportersunity@gmail.com</a>
              </p>
              <p>
                <Tx bn="সংশোধনী, কপিরাইট ও সাংবাদিক নিরাপত্তা বিষয়ে আরও জানতে " en="For our corrections, copyright, and journalist-safety policies, visit the " />{' '}
                <Link href="/policies" className="text-cyan-300 underline underline-offset-4">
                  <Tx bn="নীতি ও স্বচ্ছতা পৃষ্ঠা" en="Policies & Transparency page" />
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
