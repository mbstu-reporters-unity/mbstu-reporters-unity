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
          <BackNavigation items={[{ label: 'গোপনীয়তা নীতি' }]} />

          <div className="glass-card p-6 sm:p-10 space-y-6 text-white border border-white/20 rounded-3xl shadow-2xl">
            <div className="border-b border-white/15 pb-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
                <ShieldCheck className="size-3.5" />
                <span>Privacy & Data Protection</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold">
                গোপনীয়তা নীতি (Privacy Policy)
              </h1>
              <p className="text-xs text-slate-300">সর্বশেষ সংস্করণ: ২০২৬</p>
            </div>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Lock className="size-4" /> ১. তথ্যের গোপনীয়তা ও আমাদের অঙ্গীকার
              </h2>
              <p>
                <Tx
                  bn="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (MBSTURU) পাঠক, শিক্ষার্থী ও সদস্যদের ব্যক্তিগত তথ্যের সুরক্ষাকে গুরুত্ব দেয়। ওয়েবসাইট চালাতে প্রয়োজনীয় হোস্টিং, ডাটাবেজ ও লগইন-সেবা প্রদানকারীর মাধ্যমে তথ্য প্রক্রিয়াকৃত হতে পারে। ব্যক্তিগত তথ্য বাণিজ্যিক বিপণনের জন্য বিক্রি করা হয় না; পরিচালনার প্রয়োজন ছাড়া তথ্যের প্রবেশাধিকার সীমিত রাখার চেষ্টা করা হয়।"
                  en="Mawlana Bhashani Science and Technology University Reporters' Unity (MBSTURU) takes the privacy of readers, students, and members seriously. Hosting, database, and authentication providers may process information as needed to operate the website. Personal information is not sold for commercial marketing, and access is limited to operational needs."
                />
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Eye className="size-4" /> ২. আমরা কী ধরনের তথ্য সংগ্রহ করি
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>সদস্যপদ আবেদন ও নিবন্ধন:</b> নাম, বিভাগ, ব্যাচ, রোল/স্টুডেন্ট আইডি, মোবাইল নম্বর, ইমেইল এবং ছবি।</li>
                <li>
                  <b><Tx bn="সংবাদ ও তথ্য প্রেরক:" en="News and tip senders:" /></b>{' '}
                  <Tx
                    bn="হুইসেলব্লোয়ার বা টিপস ফর্মের মাধ্যমে প্রেরিত তথ্য। নাম গোপন রাখার অনুরোধ সম্মান করার চেষ্টা করা হয়, তবে কোনো অনলাইন মাধ্যমেই পরিচয় বা মেটাডেটা শতভাগ গোপন রাখার নিশ্চয়তা দেওয়া যায় না।"
                    en="Information sent through whistleblower or tip forms. We try to respect requests for anonymity, but no online channel can guarantee complete anonymity or hide all metadata."
                  />
                </li>
                <li><b>স্বয়ংক্রিয় তথ্য:</b> ওয়েবসাইট অপ্টিমাইজেশনের জন্য ব্রাউজারের ধরন, পেজ ভিউ অ্যানালিটিক্স ও কুকিজ (ক্যাশিং সুবিধার জন্য)।</li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <FileText className="size-4" /> ৩. সাংবাদিকতার গোপনীয় সূত্র সুরক্ষা (Source Confidentiality)
              </h2>
              <p>
                <Tx
                  bn="জনস্বার্থে তথ্য দেওয়া কোনো সূত্রের পরিচয় অপ্রয়োজনে প্রকাশ না করার চেষ্টা করা হবে এবং তা কেবল দায়িত্ব পালনের প্রয়োজনীয় ব্যক্তিদের মধ্যে সীমিত রাখা হবে। তবে ওয়েব ফর্ম, ডিভাইস বা নেটওয়ার্কের তথ্য, জমা দেওয়া কনটেন্টে থাকা পরিচয়-সংকেত, বা প্রযোজ্য আইনগত প্রক্রিয়ার কারণে সম্পূর্ণ গোপনীয়তার নিশ্চয়তা দেওয়া সম্ভব নয়। খুব সংবেদনশীল তথ্য পাঠানোর আগে নিরাপদ যোগাযোগপদ্ধতি সম্পর্কে সম্পাদকীয় ডেস্কের সঙ্গে কথা বলুন।"
                  en="We will try not to disclose a source's identity unnecessarily and limit access to people who need it for their work. However, web forms, device or network information, identifying details in submitted content, or applicable legal processes may prevent complete confidentiality. For highly sensitive information, contact the editorial desk first to discuss a safer channel."
                />
              </p>
            </section>

            <section className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300">৪. যোগাযোগ</h2>
              <p>
                গোপনীয়তা নীতি সম্পর্কিত যেকোনো জিজ্ঞাসা বা তথ্যের জন্য যোগাযোগ করুন: <a href="mailto:mbstureportersunity@gmail.com" className="text-cyan-300 underline">mbstureportersunity@gmail.com</a>
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
