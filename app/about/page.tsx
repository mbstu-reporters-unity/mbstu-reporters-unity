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
import { Tx } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  description:
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (মাভাবিপ্রবি রিপোর্টার্স ইউনিটি) এর ইতিহাস, লক্ষ্য, উদ্দেশ্য, ভিশন, মিশন ও সাংবাদিকতার অঙ্গীকার।',
}

export default async function AboutPage() {
  const settings = await getSiteSettings()
  const b = settings.branding
  const aboutCustom = settings.behaviorAndPages?.aboutPage

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          
          {/* ব্রেডক্রাম্ব নেভিগেশন */}
          <BackNavigation
            items={[
              { label: <Tx bn="পরিচিতি" en="About" /> },
              { label: <Tx bn="সংগঠন পরিচিতি" en="About the Organisation" /> },
            ]}
          />

          {/* ১. আকর্ষণীয় হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Sparkles className="size-3.5" />
              <Tx bn="ঐতিহ্য ও সত্যনিষ্ঠ ক্যাম্পাস সাংবাদিকতা" en="Campus journalism grounded in integrity and truth" />
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">
              {b.orgNameBn || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'}
            </h1>
            <p className="text-cyan-200 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
              {b.orgNameEn || "Mawlana Bhashani Science and Technology University Reporters' Unity"}
            </p>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto pt-2">
              <Tx
                bn="বস্তুনিষ্ঠ তথ্য, সততা ও নির্ভীক সাংবাদিকতার মাধ্যমে শিক্ষার্থীদের অধিকার ও সাফল্য তুলে ধরার প্রাতিষ্ঠানিক উদ্যোগ।"
                en="An institutional platform committed to objective reporting, integrity, fearless journalism, and recognition of students’ rights and achievements."
              />
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
                  <Tx bn="প্রতিষ্ঠার পটভূমি ও ইতিহাস" en="Background and History" />
                </h2>
                <p className="text-xs text-slate-300"><Tx bn="ক্যাম্পাস সাংবাদিকতার প্রাতিষ্ঠানিক সূচনা" en="The establishment of campus journalism" /></p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">
              {aboutCustom?.historyBn ? (
                <div className="whitespace-pre-line">{aboutCustom.historyBn}</div>
              ) : (
                <>
                  <p>
                    <Tx bn={<>মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের মুক্তচিন্তা, বুদ্ধিবৃত্তিক বিকাশ এবং ক্যাম্পাসের সত্য ও গঠনমূলক সংবাদ প্রকাশের অঙ্গীকার নিয়ে <strong className="text-white">মাভাবিপ্রবি রিপোর্টার্স ইউনিটি (MBSTURU)</strong> প্রতিষ্ঠিত হয়। জাতীয় ও স্থানীয় গণমাধ্যমে কর্মরত বিশ্ববিদ্যালয় প্রতিনিধিদের ঐক্যবদ্ধ করে দায়িত্বশীল ক্যাম্পাস সাংবাদিকতার চর্চা প্রতিষ্ঠা করাই সংগঠনটির মূল লক্ষ্য।</>} en={<>MBSTU Reporters’ Unity (MBSTURU) was established to support free thought, intellectual development, and the publication of accurate and constructive campus news at Mawlana Bhashani Science and Technology University. Its principal aim is to bring together university correspondents working for national and local media and to foster responsible campus journalism.</>} />
                  </p>
                  <p>
                    <Tx bn="সংগঠনটি বিশ্ববিদ্যালয়ের শিক্ষার্থী, শিক্ষক, কর্মকর্তা-কর্মচারী ও প্রশাসনের মধ্যে স্বচ্ছ ও গঠনমূলক যোগাযোগ প্রতিষ্ঠায় কাজ করে। তথ্যের অবাধ প্রবাহ নিশ্চিত করা, ক্যাম্পাসের সমস্যা ও সম্ভাবনা জাতীয় পর্যায়ে তুলে ধরা এবং নবীন ক্যাম্পাস সাংবাদিকদের প্রশিক্ষণ দেওয়া এর অন্যতম অঙ্গীকার।" en="The organisation works to promote constructive and transparent communication among students, teachers, staff, and the university administration. Its commitments include supporting the free flow of information, bringing campus challenges and opportunities to national attention, and training emerging campus journalists." />
                  </p>
                </>
              )}
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
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white"><Tx bn="আমাদের দৃষ্টিভঙ্গি" en="Our Vision" /></h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed text-justify whitespace-pre-line">
                {aboutCustom?.visionBn || <Tx bn="একটি নির্ভীক, নৈতিক ও দায়িত্বশীল সাংবাদিক সমাজ গড়ে তোলা, যা বিশ্ববিদ্যালয়ের প্রশাসনিক জবাবদিহি, শিক্ষার্থীদের অধিকার এবং জাতীয় গণমাধ্যমে বিশ্ববিদ্যালয়ের যথাযথ উপস্থাপন নিশ্চিত করতে ভূমিকা রাখবে।" en="To foster a fearless, ethical, and responsible journalism community that promotes accountability, upholds students’ rights, and represents the university accurately in national media." />}
              </p>
            </div>

            {/* মিশন */}
            <div className="glass-card p-6 space-y-3 text-white">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Target className="size-5" />
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white"><Tx bn="আমাদের লক্ষ্য" en="Our Mission" /></h3>
              </div>
              {aboutCustom?.missionBn ? (
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {aboutCustom.missionBn}
                </div>
              ) : (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><Tx bn="ক্যাম্পাস সংবাদ সংগ্রহ ও প্রকাশে নিরপেক্ষতা ও তথ্যের যথার্থতা বজায় রাখা।" en="Maintain impartiality and accuracy when gathering and publishing campus news." /></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><Tx bn="শিক্ষার্থীদের গবেষণা, উদ্ভাবন ও সাহিত্যকর্ম জাতীয় পর্যায়ে তুলে ধরা।" en="Bring students’ research, innovations, and literary work to national attention." /></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><Tx bn="নিয়মিত সাংবাদিকতা কর্মশালা, সেমিনার ও তথ্য-যাচাই প্রশিক্ষণের আয়োজন করা।" en="Organise journalism workshops, seminars, and fact-checking training." /></span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* ৪. আমাদের মূল লক্ষ্য ও উদ্দেশ্যসমূহ */}
          <section className="glass-card p-6 sm:p-8 space-y-5 text-white">
            <div className="border-b border-white/15 pb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="size-5 text-cyan-400" />
                <span><Tx bn="মূল লক্ষ্য ও উদ্দেশ্য" en="Goals and Objectives" /></span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5"><Tx bn="সংগঠন পরিচালনার মূলনীতি" en="The organisation’s guiding principles" /></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'বস্তুনিষ্ঠ সংবাদচর্চা',
                  titleEn: 'Objective Journalism',
                  desc: 'গুজব ও পক্ষপাত এড়িয়ে মাঠপর্যায়ে তথ্য যাচাই করে সংবাদ প্রকাশ করা।',
                  descEn: 'Verify information at its source and publish reports without rumour or bias.',
                },
                {
                  title: 'শিক্ষার্থীদের কল্যাণ ও অধিকার',
                  titleEn: 'Student Welfare and Rights',
                  desc: 'শিক্ষার্থীদের আবাসন, পরিবহন ও অন্যান্য যৌক্তিক দাবির বিষয়ে প্রশাসনের দৃষ্টি আকর্ষণ করা।',
                  descEn: 'Bring student concerns about accommodation, transport, and other legitimate needs to the administration’s attention.',
                },
                {
                  title: 'সাংবাদিকতার দক্ষতা উন্নয়ন',
                  titleEn: 'Journalism Training',
                  desc: 'আগ্রহী শিক্ষার্থীদের প্রশিক্ষণের মাধ্যমে দক্ষ ও নৈতিক সাংবাদিক হিসেবে গড়ে তোলা।',
                  descEn: 'Train interested students to become skilled and ethical journalists.',
                },
                {
                  title: 'গবেষণা ও অর্জনের প্রচার',
                  titleEn: 'Research and Achievements',
                  desc: 'শিক্ষক-শিক্ষার্থীদের গবেষণা, উদ্ভাবন এবং ক্রীড়া ও সাংস্কৃতিক অর্জন যথাযথভাবে তুলে ধরা।',
                  descEn: 'Recognise and report on the research, innovations, and sporting and cultural achievements of students and faculty.',
                },
                {
                  title: 'ডিজিটাল নোটিশ ও তথ্যসেবা',
                  titleEn: 'Digital Notices and Information',
                  desc: 'বিশ্ববিদ্যালয়ের একাডেমিক নোটিশ, পরীক্ষার ফলাফল ও গুরুত্বপূর্ণ তথ্য সময়মতো পৌঁছে দেওয়া।',
                  descEn: 'Provide timely access to academic notices, examination results, and other important university information.',
                },
                {
                  title: 'আন্তঃবিশ্ববিদ্যালয় সহযোগিতা',
                  titleEn: 'Inter-university Collaboration',
                  desc: 'অন্যান্য সরকারি বিশ্ববিদ্যালয়ের সাংবাদিক সংগঠনের সঙ্গে সহযোগিতা ও অভিজ্ঞতা বিনিময় করা।',
                  descEn: 'Collaborate and share experience with journalism organisations at other public universities.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1.5 hover:border-cyan-400 transition-colors">
                  <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    <span><Tx bn={item.title} en={item.titleEn} /></span>
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed"><Tx bn={item.desc} en={item.descEn} /></p>
                </div>
              ))}
            </div>
          </section>

          {/* ৫. অর্জন ও মাইলফলক (Milestones) */}
          <section className="glass-card p-6 sm:p-8 space-y-4 text-white">
            <div className="flex items-center gap-2 border-b border-white/15 pb-3">
              <Award className="size-5 text-amber-400" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                <Tx bn="অর্জন ও উল্লেখযোগ্য উদ্যোগ" en="Achievements and Milestones" />
              </h2>
            </div>

            <div className="space-y-4 relative border-l-2 border-cyan-400/40 ml-3 sm:ml-4 pl-4 sm:pl-6 pt-1">
              {[
                {
                  title: 'ডিজিটাল ক্যাম্পাস সংবাদ পোর্টাল চালু',
                  titleEn: 'Launch of a Digital Campus News Portal',
                  desc: 'ক্যাম্পাস সাংবাদিকতার তথ্য ও সংবাদ প্রকাশে আধুনিক ওয়েব প্রযুক্তিনির্ভর পোর্টাল চালু করা।',
                  descEn: 'Establish a modern web platform for publishing campus journalism and information.',
                },
                {
                  title: 'ক্যাম্পাস সাংবাদিকতা কর্মশালা',
                  titleEn: 'Campus Journalism Workshops',
                  desc: 'নবীন শিক্ষার্থীদের অনুসন্ধানী সাংবাদিকতা, মোবাইল সাংবাদিকতা ও ফিচার লেখার প্রশিক্ষণ দেওয়া।',
                  descEn: 'Train emerging students in investigative and mobile journalism, as well as feature writing.',
                },
                {
                  title: 'শিক্ষক-লেখক ও সম্পাদকীয় বিভাগ',
                  titleEn: 'Faculty Columns and Editorials',
                  desc: 'শিক্ষকদের গবেষণা ও মতামত প্রকাশের জন্য একটি বিশেষায়িত ডিজিটাল বিভাগ প্রতিষ্ঠা।',
                  descEn: 'Establish a dedicated digital section for faculty research and commentary.',
                },
                {
                  title: 'শিক্ষার্থীদের সমস্যা বিষয়ে গঠনমূলক প্রতিবেদন',
                  titleEn: 'Constructive Reporting on Student Concerns',
                  desc: 'আবাসন, নিরাপদ ক্যাম্পাস ও পরিবহন-সংক্রান্ত বিষয়ে তথ্যভিত্তিক প্রতিবেদন প্রকাশ করে সংশ্লিষ্ট কর্তৃপক্ষের দৃষ্টি আকর্ষণ।',
                  descEn: 'Bring student concerns about accommodation, campus safety, and transport to the attention of relevant authorities through evidence-based reporting.',
                },
              ].map((m, i) => (
                <div key={i} className="relative space-y-1">
                  <span className="absolute -left-[23px] sm:-left-[31px] top-1 size-3 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                  <h3 className="font-bold text-sm sm:text-base text-cyan-200"><Tx bn={m.title} en={m.titleEn} /></h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed"><Tx bn={m.desc} en={m.descEn} /></p>
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
                  <p className="font-bold text-xs sm:text-sm"><Tx bn="গঠনতন্ত্র ও নীতিমালা" en="Constitution and Policies" /></p>
                  <p className="text-[10px] text-slate-300"><Tx bn="পিডিএফ ও বিধিমালা" en="PDF and organisational rules" /></p>
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
                  <p className="font-bold text-xs sm:text-sm"><Tx bn="বর্তমান কার্যনির্বাহী পরিষদ" en="Current Executive Council" /></p>
                  <p className="text-[10px] text-slate-300"><Tx bn="পরিষদের সদস্যদের তালিকা" en="Council member directory" /></p>
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
                  <p className="font-bold text-xs sm:text-sm"><Tx bn="পরিচালনা পর্ষদ" en="Council" /></p>
                  <p className="text-[10px] text-slate-300"><Tx bn="মডারেশন ও প্রশাসনিক পরিষদ" en="Moderation and administration" /></p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/policies#recognition"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">
                    <Tx bn="স্বীকৃতি ও স্বচ্ছতা" en="Recognition & Transparency" />
                  </p>
                  <p className="text-[10px] text-slate-300">
                    <Tx bn="অনুমোদনের অবস্থা ও প্রকাশ্য নীতিমালা" en="Approval status and public policies" />
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
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
