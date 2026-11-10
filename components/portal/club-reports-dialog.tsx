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
  MessageSquare,
  MapPin,
  Info
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

  useEffect(() => {
    if (!club?.id) return
    getClubNewsPosts(club.id).then(setLiveNews)
  }, [club?.id])

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
  const cover = rawClub?.cover_url
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 club-dialog-font">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default hidden sm:block"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] w-full max-w-5xl overflow-y-auto sm:rounded-2xl bg-[#f0f2f5] shadow-2xl"
      >
        {/* ==================== ফেসবুক স্টাইল হেডার (কভার + প্রোফাইল) ==================== */}
        <div className="bg-white shadow-sm relative">
          
          {/* ক্লোজ বাটন */}
          <button
            type="button"
            onClick={onClose}
            className="fixed sm:absolute right-3 top-3 z-30 flex size-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur transition-all cursor-pointer shadow-md"
          >
            <X className="size-5" />
          </button>

          {/* ১. কভার ফটো */}
          <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 sm:rounded-t-2xl">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="Cover" className="size-full object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center text-gray-400 font-bold text-xl uppercase tracking-widest select-none">
                MBSTU CLUB
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* ২. প্রোফাইল লোগো, নাম ও বাটনসমূহ */}
          <div className="px-4 sm:px-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-16 sm:-mt-10 pb-4">
              
              {/* গোল প্রোফাইল লোগো */}
              <div className="relative size-32 sm:size-40 rounded-full bg-white ring-4 ring-white shadow-md overflow-hidden shrink-0 z-10 flex items-center justify-center">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={club?.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-6xl font-bold">
                    {club?.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* পেজের নাম ও বিবরণ */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:mb-2 min-w-0">
                <h1 id={titleId} className="text-2xl sm:text-3xl font-bold text-[#050505] truncate leading-tight">
                  {club?.nameBn || club?.name}
                </h1>
                <p className="text-sm font-semibold text-[#65676B] mt-0.5">{club?.tag} • MBSTU</p>
              </div>

              {/* সোশ্যাল ও অ্যাকশন বাটন */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto sm:mb-2 mt-2 sm:mt-0">
                {rawClub?.fb_url && (
                  <a href={safeExternalUrl(rawClub.fb_url)} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#0866FF] hover:bg-[#0054e0] text-white px-4 py-2 text-sm font-semibold transition cursor-pointer">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
                    Follow
                  </a>
                )}
                {rawClub?.yt_url && (
                  <a href={safeExternalUrl(rawClub.yt_url)} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-4 py-2 text-sm font-semibold transition cursor-pointer">
                    YouTube
                  </a>
                )}
                <button type="button" onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-4 py-2 text-sm font-semibold transition cursor-pointer">
                  {copied ? <Check className="size-4 text-green-600" /> : <Share2 className="size-4" />}
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>
            </div>

            {/* ফেসবুক স্টাইল মেনু ট্যাব */}
            <div className="flex items-center gap-1 border-t border-gray-200 mt-2">
              <button className="px-4 py-3 text-sm font-bold text-[#0866FF] border-b-[3px] border-[#0866FF]">
                Posts
              </button>
              <button className="px-4 py-3 text-sm font-semibold text-[#65676B] hover:bg-gray-100 rounded-lg my-1 transition">
                About
              </button>
              <button className="px-4 py-3 text-sm font-semibold text-[#65676B] hover:bg-gray-100 rounded-lg my-1 transition hidden sm:block">
                Photos
              </button>
            </div>
          </div>
        </div>

        {/* ==================== পেজ বডি (About & Posts) ==================== */}
        <div className="max-w-5xl mx-auto px-2 sm:px-4 mt-4 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
            
            {/* বাম পাশ: About (Intro) */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg text-[#050505] mb-3">Intro</h2>
                <p className="text-[15px] text-[#050505] whitespace-pre-line text-center leading-relaxed">
                  {club?.activityBn || club?.activity || "ক্যাম্পাস ক্লাব ও সংগঠন"}
                </p>
                <div className="border-t border-gray-200 mt-4 pt-3 space-y-3">
                  {rawClub?.contact_info && (
                    <div className="flex items-start gap-3 text-[15px] text-[#050505]">
                      <Mail className="size-5 text-[#8C939D] shrink-0" />
                      <span>{rawClub.contact_info}</span>
                    </div>
                  )}
                  {rawClub?.web_url && (
                    <div className="flex items-center gap-3 text-[15px] text-[#050505]">
                      <Globe className="size-5 text-[#8C939D] shrink-0" />
                      <a href={safeExternalUrl(rawClub.web_url)} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#0866FF]">
                        {rawClub.web_url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[15px] text-[#050505]">
                    <MapPin className="size-5 text-[#8C939D] shrink-0" />
                    <span>MBSTU, Santosh, Tangail</span>
                  </div>
                </div>
              </div>

              {/* কার্যনির্বাহী কমিটি */}
              {members.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-lg text-[#050505]">Committee</h2>
                    {term && <span className="text-sm font-semibold text-[#0866FF]">{term}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {members.map((m: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1 items-center">
                        {m.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photo_url} alt="" className="size-16 sm:size-20 rounded-lg object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="size-16 sm:size-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                            <UserRound className="size-8" />
                          </div>
                        )}
                        <p className="font-semibold text-xs text-[#050505] text-center truncate w-full px-1">{m.name}</p>
                        <p className="text-[10px] text-[#65676B] text-center truncate w-full">{m.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ডান পাশ: টাইমলাইন (Posts) */}
            <div className="md:col-span-3 space-y-4">
              
              {/* ফিল্টার বার */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center justify-between">
                <h2 className="font-bold text-lg text-[#050505]">Posts</h2>
                <div className="flex gap-2 bg-[#F0F2F5] px-2 py-1 rounded-lg">
                  <button className="px-3 py-1 bg-white rounded-md text-sm font-semibold shadow-sm">All</button>
                  <button className="px-3 py-1 text-sm font-semibold text-[#65676B]">Photos</button>
                </div>
              </div>

              {/* লাইভ নিউজ তালিকা (ফেসবুক পোস্ট স্টাইল) */}
              {liveNews.map((post: any) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* পোস্ট হেডার */}
                  <div className="flex items-center gap-2.5 p-4">
                    <div className="size-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} loading="lazy" alt="" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-brand text-white flex items-center justify-center font-bold text-lg">
                          {club?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[15px] text-[#050505] hover:underline cursor-pointer flex items-center gap-1">
                        {club?.nameBn || club?.name}
                      </p>
                      <div className="flex items-center gap-1 text-[13px] text-[#65676B]">
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>·</span>
                        <Globe className="size-3" />
                      </div>
                    </div>
                  </div>

                  {/* পোস্টের শিরোনাম/টেক্সট */}
                  <div className="px-4 pb-2">
                    <h3 className="text-[15px] text-[#050505]">
                      {post.title}
                    </h3>
                  </div>

                  {/* মিডিয়া */}
                  <div className="w-full">
                    {post.embed_media_url && (
                      <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                    )}

                    {post.image_url && !post.embed_media_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image_url}
                        alt={post.title}
                        loading="lazy"
                        className="w-full max-h-[500px] object-cover"
                      />
                    )}
                  </div>

                  {/* রিঅ্যাকশন ও কমেন্ট বাটন (ফেসবুক স্টাইল) */}
                  <div className="px-4 py-2">
                    <ReactionBar postId={post.id} title={post.title} />
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <Link
                        href={`/post/${post.id}`}
                        onClick={onClose}
                        className="flex w-full items-center justify-center gap-2 rounded-lg hover:bg-[#F0F2F5] text-[#65676B] font-semibold text-[15px] py-1.5 transition cursor-pointer"
                      >
                        <MessageSquare className="size-5" />
                        Write a comment...
                      </Link>
                    </div>
                  </div>
                </article>
              ))}

              {/* ম্যানুয়াল রিপোর্টসমূহ */}
              {manualReports.map((r: any, i: number) => (
                <article key={`manual-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2.5 p-4">
                    <div className="size-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-gray-500">
                      <UserRound className="size-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-[15px] text-[#050505]">{r.reporter || 'Reporter'}</p>
                      <p className="text-[13px] text-[#65676B]">{r.date}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-3 space-y-1">
                    <h3 className="font-bold text-[16px] text-[#050505] leading-snug">{r.title}</h3>
                    {r.subtitle && <p className="text-[14px] font-semibold text-gray-700">{r.subtitle}</p>}
                    {r.description && <p className="text-[15px] text-[#050505] whitespace-pre-line">{r.description}</p>}
                  </div>

                  <div className="w-full">
                    {r.embed_media_url && (
                      <UniversalMediaEmbed url={r.embed_media_url} title={r.title} />
                    )}

                    {r.media_items && r.media_items.length > 0 && (
                      <div className="space-y-1">
                        {r.media_items.map((m: any, mi: number) => (
                          <div key={mi} className="bg-white pb-2">
                            {(m.title || m.description) && (
                              <div className="px-4 pb-2">
                                {m.title && <h5 className="font-semibold text-[15px]">{m.title}</h5>}
                                {m.description && <p className="text-[14px] text-gray-700">{m.description}</p>}
                              </div>
                            )}
                            <UniversalMediaEmbed url={m.url} title={m.title || r.title} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {liveNews.length === 0 && manualReports.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <p className="font-bold text-[#65676B]">No posts available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
