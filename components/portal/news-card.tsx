import Link from 'next/link'
import { ArrowRight, CalendarDays, User } from 'lucide-react'
import type { Post } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import CardGallery from './card-gallery'
import { UniversalMediaEmbed } from './universal-media-embed'

// ⭐ যেকোনো তারিখকে স্পষ্ট বাংলা মাসের নাম সহ রূপান্তরকারী ফাংশন (যেমন: ৯ নভেম্বর ২০২৬) ⭐
function formatBanglaDate(val?: string | null): string {
  if (!val) return ''
  
  // তারিখটি অলরেডি বাংলা মাসের নামে থাকলে তাই রিটার্ন করবে
  if (/জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/.test(val)) {
    return val
  }

  // ISO বা ইংরেজি তারিখ হলে বাংলা মাস সহ ফরম্যাট
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
  }

  // সংখ্যায় থাকলে (যেমন: ৯/১১/২০২৬ বা 9/11/2026) তাকে বাংলায় রূপান্তর
  const normalized = val.replace(/[০-৯]/g, (digit) => '০১২৩৪৫৬৭৮৯'.indexOf(digit).toString())
  const parts = normalized.split(/[/\-.]/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ]
    const toBn = (n: number | string) => String(n).replace(/\d/g, (x) => '০১২৩৪৫৬৭৮৯'[Number(x)])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${toBn(day)} ${monthsBn[month - 1]} ${toBn(year)}`
    }
  }

  return val
}

export function NewsCard({ p }: { p: Post }) {
  const href = p.link_url?.trim() || `/post/${p.id}`
  const isExt = /^https?:\/\//i.test(href)
  const excerpt = (p.heading || p.body || '').slice(0, 140)
  const formattedDate = formatBanglaDate(p.created_at)

  return (
    <article className="group flex flex-col overflow-hidden rounded-[2.25rem] border-[1.5px] border-white/85 bg-white/45 backdrop-blur-2xl shadow-[0_20px_45px_-12px_rgba(10,45,110,0.22),inset_0_2.5px_4px_rgba(255,255,255,0.95),inset_0_-2.5px_4px_rgba(0,35,90,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_55px_-10px_rgba(10,45,110,0.32),inset_0_2.5px_5px_rgba(255,255,255,1)]">
      
      {/* যদি ভিডিও/ছবির এম্বেড লিংক না থাকে, তাহলে কভার ফটো গ্যালারি */}
      {!p.embed_media_url && (
        <div className="overflow-hidden rounded-t-[2.25rem]">
          <CardGallery
            postId={p.id}
            cover={p.image_url}
            href={href}
            external={isExt}
            category={p.category || 'সংবাদ'}
            hasVideo={!!p.video_url}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        
        {/* ক্যাটাগরি গ্লাস ব্যাজ (যদি এম্বেড মিডিয়া থাকে) */}
        {p.embed_media_url && (
          <span className="mb-3 inline-block w-fit rounded-full bg-sky-600/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow-[0_4px_12px_rgba(2,132,199,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.8)] border border-white/50">
            {p.category || 'ক্যাম্পাস সংবাদ'}
          </span>
        )}

        {/* বাংলা তারিখ এবং রিপোর্টার গ্লাস পিল (রেফারেন্স ছবির মতো ফ্রস্টেড লুক) */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-sky-950 bg-white/55 border border-white/80 px-3.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,40,110,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
            <CalendarDays className="size-3.5 text-sky-700 shrink-0" aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>

          {p.author && (
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-white/45 border border-white/80 px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,40,110,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)]">
              <User className="size-3.5 text-slate-600 shrink-0" aria-hidden="true" />
              <span>{p.author}</span>
            </span>
          )}
        </div>

        {/* ১. শিরোনাম (গভীর নেভি ব্লু রঙে নিখুঁত কনট্রাস্ট) */}
        <h3 className="mt-3.5 font-serif text-lg sm:text-xl font-bold leading-snug text-[#071739] group-hover:text-sky-700 transition-colors drop-shadow-xs">
          {isExt ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {p.title}
            </a>
          ) : (
            <Link href={href}>
              {p.title}
            </Link>
          )}
        </h3>

        {/* ২. বিস্তারিত / উপশিরোনাম */}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#0f274a] font-medium">
          {excerpt}
        </p>

        {/* ৩. মিডিয়া প্লেয়ার (ছবি বা ভিডিও লিংক থাকলে) */}
        {p.embed_media_url && (
          <UniversalMediaEmbed url={p.embed_media_url} title={p.title} className="mb-2 mt-3" />
        )}

        {/* ৪. বিস্তারিত পড়ুন অ্যাকশন বাটন (রেফারেন্স ছবির পিল বাটন + সার্কুলার অ্যারো ডট) */}
        <div className="mt-5 pt-3.5 border-t border-white/40 flex items-center justify-between gap-3">
          {isExt ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/45 hover:bg-white/75 border-[1.5px] border-white/90 px-4 py-2 text-xs font-bold text-[#071739] shadow-[0_8px_20px_-3px_rgba(2,55,130,0.18),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(0,30,80,0.08)] active:scale-95 transition-all"
            >
              <span>বিস্তারিত পড়ুন</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-sky-600/15 border border-white/80 text-sky-700 shadow-2xs">
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full bg-white/45 hover:bg-white/75 border-[1.5px] border-white/90 px-4 py-2 text-xs font-bold text-[#071739] shadow-[0_8px_20px_-3px_rgba(2,55,130,0.18),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(0,30,80,0.08)] active:scale-95 transition-all"
            >
              <span>বিস্তারিত পড়ুন</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-sky-600/15 border border-white/80 text-sky-700 shadow-2xs">
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </Link>
          )}

          {/* রিঅ্যাকশন বার */}
          <div className="shrink-0">
            <ReactionBar postId={p.id} title={p.title} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function NewsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <NewsCard key={p.id} p={p} />
      ))}
    </div>
  )
}
