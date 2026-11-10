'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Globe,
  Mail,
  Newspaper,
  Share2,
  UserRound,
  Users,
  Video,
  X,
  MessageSquare
} from 'lucide-react'
import type { Club } from '@/lib/data'
import {
  getClubNewsPosts,
  parseActivityMedia,
  safeExternalUrl,
  type ClubItem,
} from '@/lib/clubs'
import { UniversalMediaEmbed } from './universal-media-embed'
import { ReactionBar } from './reaction-bar'

export function ClubReportsDialog({
  club,
  rawClub,
  onClose,
}: {
  club: Club | null
  rawClub?: ClubItem | null
  onClose: () => void
}) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)
  const [liveNews, setLiveNews] = useState<
    Array<{
      id: string
      title: string
      created_at: string
      author: string
      image_url: string | null
      embed_media_url?: string | null
    }>
  >([])

  // ক্লাবের আইডি পেলে সরাসরি নিউজগুলো নিয়ে আসবে (কোনো রিলোড ছাড়াই)
  useEffect(() => {
    if (!club?.id) return
    getClubNewsPosts(club.id).then(setLiveNews)
  }, [club?.id])

  // স্ক্রল লক ও এস্কেপ বাটন হ্যান্ডলার
  useEffect(() => {
    if (!club) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [club, onClose])

  if (!club) return null

  const members = rawClub?.committee_members || []
  const term = rawClub?.committee_term
  const logo = rawClub?.logo_url
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?club=${club.id}` : ''
  const activityMediaList = parseActivityMedia(rawClub?.embed_media_url)

  const manualReports =
    rawClub?.reports && rawClub.reports.length > 0
      ? rawClub.reports
      : club.reports && club.reports.length > 0
      ? club.reports
      : []

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: club?.name,
          text: `${club?.name} (${club?.nameBn || ''}) - মাভাবিপ্রবি রিপোর্টার্স ইউনিটি`,
          url: shareUrl,
        })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 club-dialog-font">
      {/* ব্যাকড্রপ */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-navy/90 backdrop-blur-sm cursor-default"
      />

      {/* বিশাল পপ-আপ কন্টেইনার (সম্পূর্ণ পেজের মতো কাজ করবে) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-slate-100 shadow-2xl border border-border"
      >
        {/* ==================== হেডার (কভার + প্রোফাইল) ==================== */}
        <div className="bg-white border-b border-border shadow-xs relative">
          
          {/* ক্লোজ বাটন */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* কভার ফটো / গ্রেডিয়েন্ট */}
          <div className="relative h-40 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 sm:rounded-t-3xl flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.2),rgba(255,255,255,0))]" />
            <h1 className="text-white/10 font-serif text-3xl sm:text-5xl font-bold px-4 text-center select-none uppercase">
              {club.tag}
            </h1>
          </div>

          {/* প্রোফাইল লোগো, নাম ও সোশ্যাল লিংক */}
          <div className="px-5 sm:px-8 pb-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14 sm:-mt-20">
              
              <div className="relative size-28 sm:size-36 rounded-full bg-white ring-4 ring-white shadow-xl overflow-hidden shrink-0 z-10 flex items-center justify-center">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={club.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-5xl font-bold">
                    {club.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 id={titleId} className="font-serif text-2xl sm:text-3xl font-bold text-navy truncate">
                  {club.nameBn || club.name}
                </h1>
                {club.nameBn && (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">{club.name}</p>
                )}
                <span className="inline-block mt-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {club.tag}
                </span>
              </div>

              {/* সোশ্যাল লিংক বাটন */}
              <div className="shrink-0 flex gap-2 pt-2 sm:pt-0">
                {rawClub?.fb_url && (
                  <a href={safeExternalUrl(rawClub.fb_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow transition">
                    Facebook
                  </a>
                )}
                {rawClub?.yt_url && (
                  <a href={safeExternalUrl(rawClub.yt_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold shadow transition">
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== পেজ কন্টেন্ট: পরিচিতি ও টাইমলাইন ==================== */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* বাম পাশ: About / পেজের পরিচিতি, কমিটি ও ওয়েবসাইট */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-border space-y-4">
              <h2 className="font-bold text-base text-navy border-b pb-2 flex items-center justify-between">
                <span>📌 পরিচিতি ও কার্যক্রম</span>
                <button type="button" onClick={handleShare} className="text-brand hover:underline flex items-center gap-1 text-xs">
                  {copied ? <Check className="size-3 text-green-600" /> : <Share2 className="size-3" />}
                  শেয়ার
                </button>
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {club.activityBn || club.activity || "কোনো বিবরণ দেওয়া হয়নি।"}
              </p>
              
              {/* যোগাযোগের লিংকসমূহ */}
              <div className="space-y-2 pt-2 border-t">
                {rawClub?.contact_info && (
                  <p className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="size-3.5 text-brand shrink-0" /> {rawClub.contact_info}
                  </p>
                )}
                {rawClub?.web_url && (
                  <a href={safeExternalUrl(rawClub.web_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-700 font-bold hover:underline text-xs">
                    <Globe className="size-4 shrink-0" /> ওয়েবসাইট ভিজিট করুন
                  </a>
                )}
              </div>
            </div>

            {/* কার্যনির্বাহী কমিটি */}
            {members.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-border space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-bold text-sm text-navy flex items-center gap-2">
                    <Users className="size-4 text-brand" /> কমিটি
                  </h2>
                  {term && (
                    <span className="text-[10px] bg-brand-soft text-brand px-2 py-0.5 rounded-full font-bold">
                      {term}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {members.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      {m.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photo_url} alt="" className="size-10 rounded-full object-cover border" />
                      ) : (
                        <div className="size-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-navy truncate">{m.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ডান পাশ: টাইমলাইন (নিউজ, ভিডিও, পোস্ট) */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-navy flex items-center gap-2">
                <Newspaper className="size-5 text-brand" />
                <span>টাইমলাইন ও সংবাদসমূহ ({liveNews.length + manualReports.length})</span>
              </h2>
            </div>

            {/* লাইভ নিউজ তালিকা (অ্যাডমিন প্যানেল থেকে পোস্ট করা সংবাদ) */}
            {liveNews.map((post: any) => (
              <article
                key={post.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-border space-y-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full overflow-hidden bg-slate-100 border shrink-0">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} loading="lazy" alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                        {club.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-navy flex items-center gap-1">
                      <span>{club.nameBn || club.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded-full font-bold">Official</span>
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <CalendarDays className="size-3 text-gold" />
                      <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                      {post.author && <span>· {post.author}</span>}
                    </p>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-navy leading-snug">
                  {post.title}
                </h3>

                {post.embed_media_url && (
                  <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                )}

                {post.image_url && !post.embed_media_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image_url}
                    alt={post.title}
                    loading="lazy"
                    className="w-full max-h-96 object-cover rounded-2xl border"
                  />
                )}

                {/* রিঅ্যাকশন ও কমেন্টে যাওয়ার বাটন (কোনো রিলোড ছাড়া) */}
                <ReactionBar postId={post.id} title={post.title} />
                <div className="pt-2 border-t">
                  <Link
                    href={`/post/${post.id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    <MessageSquare className="size-3.5" /> বিস্তারিত পড়ুন ও মন্তব্য করুন <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}

            {/* ম্যানুয়াল রিপোর্টসমূহ (ক্লাব সেটিংস থেকে যোগ করা) */}
            {manualReports.map((r: any, i: number) => (
              <article
                key={`manual-${i}`}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-border space-y-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full overflow-hidden bg-slate-100 border shrink-0 flex items-center justify-center text-brand">
                    <UserRound className="size-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-navy">{r.reporter || 'রিপোর্টার'}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <CalendarDays className="size-3 text-gold" /> {r.date}
                    </p>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-navy leading-snug">{r.title}</h3>
                {r.subtitle && <p className="text-xs font-semibold text-brand">{r.subtitle}</p>}
                
                {r.description && (
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {r.description}
                  </p>
                )}

                {r.embed_media_url && (
                  <UniversalMediaEmbed url={r.embed_media_url} title={r.title} />
                )}

                {r.media_items && r.media_items.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {r.media_items.map((m: any, mi: number) => (
                      <div key={mi} className="rounded-xl bg-gray-50 p-2.5 border border-border/70 space-y-1">
                        {m.title && <h5 className="font-bold text-xs text-navy">{m.title}</h5>}
                        {m.subtitle && <p className="text-[11px] font-semibold text-brand">{m.subtitle}</p>}
                        {m.description && <p className="text-[11px] text-gray-600 whitespace-pre-line">{m.description}</p>}
                        <UniversalMediaEmbed url={m.url} title={m.title || r.title} compact />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {liveNews.length === 0 && manualReports.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed space-y-2">
                <Video className="size-10 text-gray-300 mx-auto" />
                <p className="font-bold text-sm text-gray-600">এই ক্লাবের কোনো কার্যক্রম বা সংবাদ এখনো দেওয়া হয়নি।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
