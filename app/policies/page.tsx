import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  FileCheck2,
  Image,
  Megaphone,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getSiteSettings } from '@/lib/site-settings'
import { Tx } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'নীতি, স্বচ্ছতা ও নিরাপত্তা | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'সংশোধনী, কপিরাইট, স্পন্সরশিপ, বিশ্ববিদ্যালয়ের স্বীকৃতি, বার্ষিক প্রতিবেদন এবং সাংবাদিক নিরাপত্তা সংক্রান্ত নীতি।',
}

const policies: {
  id: string
  icon: LucideIcon
  titleBn: string
  titleEn: string
  paragraphs: { bn: string; en: string }[]
  points?: { bn: string; en: string }[]
}[] = [
  {
    id: 'corrections',
    icon: FileCheck2,
    titleBn: 'সংশোধনী ও ভুল স্বীকারের নীতি',
    titleEn: 'Corrections Policy',
    paragraphs: [
      {
        bn: 'প্রকাশিত প্রতিবেদনে ভুলের নির্ভরযোগ্য তথ্য পেলে আমরা তা যাচাই করে প্রয়োজনমতো সংশোধন বা হালনাগাদ করব। সংশোধনের অনুরোধে লেখার শিরোনাম বা লিংক, ভুল অংশ, সঠিক তথ্য এবং সম্ভব হলে নির্ভরযোগ্য প্রমাণ দিন।',
        en: 'When credible information shows an error in a published report, we will review it and correct or update it as appropriate. Please include the headline or link, the disputed passage, the accurate information, and supporting evidence when available.',
      },
      {
        bn: 'গুরুত্বপূর্ণ তথ্যগত সংশোধনের ক্ষেত্রে লেখায় সংশোধনের নোট ও তারিখ দেওয়া হবে; সাধারণ সম্পাদনা বা নতুন তথ্য যোগ করাকে ভুল সংশোধন হিসেবে দেখানো হবে না। সংশোধনী অনুরোধ পাঠানোর অর্থ এই নয় যে প্রতিবেদনটি স্বয়ংক্রিয়ভাবে সরানো হবে।',
        en: 'Material factual corrections will be identified with a correction note and date. Routine editing or adding new information will not be presented as a correction. A correction request does not automatically mean a report will be removed.',
      },
    ],
    points: [
      {
        bn: 'সংশোধনের অনুরোধ: যোগাযোগ ফর্মে “সংশোধনী” লিখে পাঠান।',
        en: 'To request a correction, use the contact form and mention “Correction”.',
      },
    ],
  },
  {
    id: 'copyright',
    icon: Image,
    titleBn: 'কপিরাইট ও ছবি/মিডিয়া ব্যবহারের নীতি',
    titleEn: 'Copyright & Media Usage',
    paragraphs: [
      {
        bn: 'ওয়েবসাইটের প্রতিটি লেখা, ছবি বা ভিডিওর স্বত্ব এক রকম নাও হতে পারে। প্রকাশিত হলেই কোনো উপাদান সংগঠন বা প্রতিবেদকের একক মালিকানাধীন—এমন ধরে নেওয়া যাবে না; তৃতীয় পক্ষের উপাদানের স্বত্ব তাদের অধিকারীর কাছেই থাকতে পারে।',
        en: 'Rights may differ from one article, photograph, or video to another. Publication on this website does not by itself mean the material is exclusively owned by the organization or a reporter; third-party material may remain the property of its rights holder.',
      },
      {
        bn: 'পুনঃপ্রকাশ বা বাণিজ্যিক ব্যবহারের আগে সংশ্লিষ্ট স্বত্বাধিকারীর অনুমতি নিন এবং প্রযোজ্য ক্ষেত্রে যথাযথ কৃতিত্ব দিন। কোনো ছবি বা কনটেন্টের অধিকার, কৃতিত্ব বা অপসারণ বিষয়ে জানাতে যোগাযোগ ফর্মে উপাদানটির লিংক ও আপনার দাবির বিবরণ দিন।',
        en: 'Before republishing or using material commercially, obtain permission from the relevant rights holder and provide appropriate credit where applicable. For rights, attribution, or removal concerns, send the material link and details through the contact form.',
      },
    ],
  },
  {
    id: 'advertising',
    icon: Megaphone,
    titleBn: 'বিজ্ঞাপন ও স্পন্সরশিপ নীতি',
    titleEn: 'Advertising & Sponsorship Policy',
    paragraphs: [
      {
        bn: 'ভবিষ্যতে বিজ্ঞাপন বা স্পন্সরশিপ প্রকাশ করা হলে তা পাঠকের কাছে স্পষ্টভাবে বিজ্ঞাপন/স্পন্সরড কনটেন্ট হিসেবে চিহ্নিত করা হবে। বিজ্ঞাপনদাতা বা স্পন্সরের পরিচয় ও সহায়তার ধরন প্রকাশের উপযুক্ত জায়গায় জানানো হবে।',
        en: 'If advertising or sponsorship is published in the future, it will be clearly identified as advertising or sponsored content. The sponsor and the nature of its support will be disclosed in an appropriate place.',
      },
      {
        bn: 'অর্থ বা পৃষ্ঠপোষকতা কোনো সংবাদ, মতামত বা সম্পাদনাগত সিদ্ধান্ত কেনার নিশ্চয়তা দেয় না। সম্পাদকীয় সিদ্ধান্ত এবং বিজ্ঞাপন/স্পন্সরশিপ ব্যবস্থাপনা আলাদা রাখা হবে।',
        en: 'Payment or sponsorship does not buy news coverage, favorable opinion, or editorial decisions. Editorial decisions will remain separate from advertising and sponsorship arrangements.',
      },
    ],
  },
  {
    id: 'recognition',
    icon: ShieldCheck,
    titleBn: 'বিশ্ববিদ্যালয় কর্তৃপক্ষের স্বীকৃতি ও অনুমোদন',
    titleEn: 'University Recognition & Approval',
    paragraphs: [
      {
        bn: 'বর্তমান ওয়েবসাইট প্রকল্পের উপকরণে বিশ্ববিদ্যালয় কর্তৃপক্ষের লিখিত স্বীকৃতি বা অনুমোদনের নথি পাওয়া যায়নি। তাই এই ওয়েবসাইটে আনুষ্ঠানিক অনুমোদন বা বিশ্ববিদ্যালয়ের পক্ষ থেকে সমর্থনের দাবি করা হচ্ছে না। এটি স্বীকৃতি নেই—এমন চূড়ান্ত সিদ্ধান্তও নয়; যাচাইযোগ্য নথি ছাড়া কোনো দাবি প্রকাশ করা হচ্ছে না।',
        en: 'The current website project materials do not include written recognition or approval from the university authority. Therefore, this website does not claim formal approval or university endorsement. This is not a final determination that recognition does not exist; no claim is made without verifiable documentation.',
      },
      {
        bn: 'যাচাইযোগ্য অনুমোদনপত্র পাওয়া গেলে ইস্যুকারী কর্তৃপক্ষ, স্মারক/রেফারেন্স নম্বর, তারিখ এবং প্রযোজ্য মেয়াদসহ এই অংশ হালনাগাদ করা হবে।',
        en: 'If verifiable approval documentation becomes available, this section will be updated with the issuing authority, reference number, date, and applicable term.',
      },
    ],
  },
  {
    id: 'annual-reports',
    icon: CircleDollarSign,
    titleBn: 'বার্ষিক প্রতিবেদন ও আর্থিক স্বচ্ছতা',
    titleEn: 'Annual Reports & Financial Transparency',
    paragraphs: [
      {
        bn: 'অনুমোদিত বার্ষিক প্রতিবেদন, নিরীক্ষা প্রতিবেদন বা আর্থিক বিবরণী প্রকাশের জন্য প্রস্তুত হলে প্রকাশনা আর্কাইভে যুক্ত করা হবে। যাচাই করা নথি ছাড়া কোনো আয়-ব্যয়, তহবিল বা নিরীক্ষার তথ্য এখানে অনুমান করে প্রকাশ করা হবে না।',
        en: 'Approved annual reports, audit reports, or financial statements will be added to the publications archive when they are ready for release. No income, expenditure, fund, or audit figures will be estimated or published here without verified documents.',
      },
      {
        bn: 'আর্কাইভে প্রতিবেদন না থাকা মানেই কোনো হিসাব বা প্রতিবেদন নেই—এমন সিদ্ধান্ত নয়; এটি কেবল এই ওয়েবসাইটে প্রকাশিত নথির অবস্থা বোঝায়।',
        en: 'The absence of a report in the archive does not establish that no accounts or reports exist; it only describes what is published on this website.',
      },
    ],
    points: [
      {
        bn: 'বার্ষিক প্রতিবেদন বিভাগ দেখতে প্রকাশনা আর্কাইভ খুলুন।',
        en: 'Open the publications archive to view annual reports.',
      },
    ],
  },
  {
    id: 'journalist-safety',
    icon: BookOpen,
    titleBn: 'সাংবাদিক নিরাপত্তা ও আইনি সহায়তার নির্দেশিকা',
    titleEn: 'Journalist Safety & Legal Aid Guide',
    paragraphs: [
      {
        bn: 'ঝুঁকিপূর্ণ প্রতিবেদন বা মাঠ-অ্যাসাইনমেন্টের আগে সম্পাদক/দায়িত্বশীল সহকর্মীর সঙ্গে পরিকল্পনা ভাগ করুন, নির্ধারিত সময়ে যোগাযোগের ব্যবস্থা রাখুন এবং প্রয়োজনীয় নিরাপত্তা সরঞ্জাম সঙ্গে নিন। ঝুঁকি বাড়লে একা মুখোমুখি হওয়া বা অপ্রয়োজনীয় সংঘাতে জড়ানো এড়িয়ে নিরাপদ স্থানে সরে যান।',
        en: 'Before a high-risk story or field assignment, share a plan with an editor or responsible colleague, agree on check-ins, and carry appropriate safety equipment. If risk escalates, move to safety and avoid confronting people alone or entering unnecessary conflict.',
      },
      {
        bn: 'অনলাইন হুমকি বা হয়রানির ক্ষেত্রে প্রাসঙ্গিক লিংক, সময় ও বার্তার কপি নিরাপদে সংরক্ষণ করুন; প্রকাশের আগে নিজের বা সূত্রের পরিচয়/ব্যক্তিগত তথ্য প্রকাশ হয়ে যাচ্ছে কি না যাচাই করুন। তাৎক্ষণিক বিপদে বাংলাদেশে জাতীয় জরুরি সেবা ৯৯৯ বা স্থানীয় জরুরি সহায়তায় যোগাযোগ করুন।',
        en: 'For online threats or harassment, securely preserve relevant links, timestamps, and message copies; check that publication will not expose your or a source’s identity or personal information. In immediate danger in Bangladesh, contact the national emergency service at 999 or local emergency assistance.',
      },
      {
        bn: 'এই নির্দেশিকা সাধারণ তথ্য, আইনি পরামর্শ নয়। নির্দিষ্ট আইনি সহায়তার জন্য যোগ্য আইনজীবী বা সংশ্লিষ্ট কর্তৃপক্ষের পরামর্শ নিন। এই সংগঠন আইনি প্রতিনিধিত্ব বা সহায়তার নিশ্চয়তা দিচ্ছে না।',
        en: 'This guide provides general information, not legal advice. For a specific legal matter, consult a qualified lawyer or relevant authority. The organization does not guarantee legal representation or assistance.',
      },
    ],
  },
]

export default async function PoliciesPage() {
  const settings = await getSiteSettings()
  const policiesCustom = settings.behaviorAndPages?.policiesPage
  const customOverrides: Record<string, string | undefined> = {
    corrections: policiesCustom?.correctionsBn,
    copyright: policiesCustom?.copyrightBn,
    recognition: policiesCustom?.recognitionBn,
    'journalist-safety': policiesCustom?.safetyBn,
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <BackNavigation
            items={[{ label: <Tx bn="নীতি ও স্বচ্ছতা" en="Policies & Transparency" /> }]}
          />

          <header className="glass-card rounded-3xl border border-white/15 p-6 sm:p-10 text-white space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              <Tx bn="বিশ্বাসযোগ্যতা · স্বচ্ছতা · নিরাপত্তা" en="Trust · Transparency · Safety" />
            </p>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">
              <Tx bn="নীতি ও স্বচ্ছতা" en="Policies & Transparency" />
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
              <Tx
                bn="সংশোধনী, কপিরাইট, পৃষ্ঠপোষকতা, অনুমোদনের অবস্থা, প্রতিবেদন এবং সাংবাদিক নিরাপত্তা বিষয়ে আমাদের প্রকাশ্য নীতিগুলো এখানে দেওয়া হলো।"
                en="Our public policies on corrections, copyright, sponsorship, approval status, reports, and journalist safety are collected here."
              />
            </p>
          </header>

          <nav aria-label="নীতি বিষয়সূচি" className="glass-card rounded-2xl p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-bold text-white">
              <Tx bn="এই পৃষ্ঠার বিষয়গুলো" en="On this page" />
            </h2>
            <div className="flex flex-wrap gap-2">
              {policies.map((policy) => (
                <a
                  key={policy.id}
                  href={`#${policy.id}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
                >
                  <Tx bn={policy.titleBn} en={policy.titleEn} />
                </a>
              ))}
            </div>
          </nav>

          {policies.map((policy) => {
            const Icon = policy.icon
            const customText = customOverrides[policy.id]?.trim()
            return (
              <section
                key={policy.id}
                id={policy.id}
                className="glass-card scroll-mt-24 rounded-3xl border border-white/15 p-5 sm:p-8 text-white space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-2 text-cyan-200">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="font-serif text-lg sm:text-2xl font-bold leading-snug">
                    <Tx bn={policy.titleBn} en={policy.titleEn} />
                  </h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-200">
                  {customText ? (
                    <p className="whitespace-pre-line">{customText}</p>
                  ) : (
                    policy.paragraphs.map((paragraph, index) => (
                      <p key={index}>
                        <Tx bn={paragraph.bn} en={paragraph.en} />
                      </p>
                    ))
                  )}
                </div>
                {policy.points && (
                  <ul className="space-y-2 border-t border-white/10 pt-4 text-sm text-cyan-100">
                    {policy.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                        <span>
                          {policy.id === 'annual-reports' ? (
                            <Link
                              href={`/publications?type=${encodeURIComponent('বার্ষিক প্রতিবেদন')}`}
                              className="underline underline-offset-4 hover:text-white"
                            >
                              <Tx bn={point.bn} en={point.en} />
                            </Link>
                          ) : (
                            <Link
                              href="/contact"
                              className="underline underline-offset-4 hover:text-white"
                            >
                              <Tx bn={point.bn} en={point.en} />
                            </Link>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}

          <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-slate-300">
            <Tx
              bn="কোনো নীতির বিষয়ে প্রশ্ন বা সংশোধনের প্রস্তাব থাকলে যোগাযোগ করুন। বাস্তব অনুমোদনপত্র বা প্রতিবেদন পাওয়া গেলে সংশ্লিষ্ট অংশ যাচাই করে হালনাগাদ করা হবে।"
              en="Contact us with questions or suggested corrections to these policies. Relevant sections will be updated after any approval document or report is verified."
            />{' '}
            <Link href="/contact" className="font-bold text-cyan-300 underline underline-offset-4">
              <Tx bn="যোগাযোগ" en="Contact" />
            </Link>
          </p>

          <BackNavigation fallbackHref="/" />
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
