import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'

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
                মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (MBSTURU) পাঠক, শিক্ষার্থী ও সদস্যদের ব্যক্তিগত তথ্যের সুরক্ষাকে সর্বোচ্চ অগ্রাধিকার দেয়। আমাদের ওয়েবসাইট ব্রাউজ করার সময় বা সদস্যপদ আবেদনের ক্ষেত্রে আপনি যেসব তথ্য প্রদান করেন, তা কোনো বাণিজ্যিক বা অননুমোদিত তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করা হয় না।
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Eye className="size-4" /> ২. আমরা কী ধরনের তথ্য সংগ্রহ করি
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>সদস্যপদ আবেদন ও নিবন্ধন:</b> নাম, বিভাগ, ব্যাচ, রোল/স্টুডেন্ট আইডি, মোবাইল নম্বর, ইমেইল এবং ছবি।</li>
                <li><b>সংবাদ ও তথ্য প্রেরক:</b> হুইসেলব্লোয়ার বা টিপস ফর্মের মাধ্যমে প্রেরিত তথ্য (প্রেরক নাম গোপন রাখতে চাইলে তা শতভাগ অজ্ঞাত ও সুরক্ষিত রাখা হয়)।</li>
                <li><b>স্বয়ংক্রিয় তথ্য:</b> ওয়েবসাইট অপ্টিমাইজেশনের জন্য ব্রাউজারের ধরন, পেজ ভিউ অ্যানালিটিক্স ও কুকিজ (ক্যাশিং সুবিধার জন্য)।</li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                <FileText className="size-4" /> ৩. সাংবাদিকতার গোপনীয় সূত্র সুরক্ষা (Source Confidentiality)
              </h2>
              <p>
                ক্যাম্পাসের কোনো শিক্ষার্থী বা কর্মকর্তা যদি জনস্বার্থে কোনো অনিয়ম, দুর্নীতি বা সংবাদের গোপন সূত্র হিসেবে তথ্য দেন, তবে সাংবাদিকতার আন্তর্জাতিক নৈতিক আচরণবিধি অনুযায়ী তার পরিচয় সর্বদা অপ্রকাশিত ও সুরক্ষিত থাকবে।
              </p>
            </section>

            <section className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <h2 className="text-base sm:text-lg font-bold text-cyan-300">৪. যোগাযোগ</h2>
              <p>
                গোপনীয়তা নীতি সম্পর্কিত যেকোনো জিজ্ঞাসা বা তথ্যের জন্য যোগাযোগ করুন: <a href="mailto:mbstureportersunity@gmail.com" className="text-cyan-300 underline">mbstureportersunity@gmail.com</a>
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
