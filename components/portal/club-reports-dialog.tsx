'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Globe,
  Mail,
  Share2,
  UserRound,
  Users,
  Video,
  X,
  MessageSquare,
  MapPin,
  Camera,
  Play
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

// ভিডিও ইউআরএল শনাক্তকারী নিরাপদ ফাংশন
function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false
  const u = url.toLowerCase()
  return (
    u.includes('youtube.com') ||
    u.includes('youtu.be') ||
    u.includes('facebook.com') ||
    u.includes('fb.watch') ||
    u.endsWith('.mp4') ||
    u.endsWith('.webm') ||
    u.endsWith('.mov')
  )
}

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
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos' | 'videos'>('posts')
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
    getClubNewsPosts(club.id)
      .then((data) => setLiveNews(Array.isArray(data) ? data : []))
      .catch(() => setLiveNews([]))
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

  const members = Array.isArray(rawClub?.committee_members) ? rawClub.committee_members : []
  const term = rawClub?.committee_term
  const logo = rawClub?.logo_url
  const cover = rawClub?.cover_url
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?club=${club.id}` : ''
  const activityMediaList = parseActivityMedia(rawClub?.embed_media_url)

  const manualReports =
    Array.isArray(rawClub?.reports) && rawClub.reports.length > 0
      ? rawClub.reports
      : Array.isArray(club.reports) && club.reports.length > 0
      ? club.reports
      : []

  // ⭐ নিরাপদভাবে সকল পোস্ট থেকে ফটোগুলো সংগ্রহ করা ⭐
  const allPhotos = useMemo(() => {
    const list: { url: string; title?: string; date?: string }[] = []
    
    // ১. লাইভ নিউজ
    liveNews.forEach((p) => {
      if (p.image_url && !isVideoUrl(p.image_url)) {
        list.push({ url: p.image_url, title: p.title, date: new Date(p.created_at).toLocaleDateString('bn-BD') })
      }
      const parsed = parseActivityMedia(p.embed_media_url)
      parsed.forEach((m) => {
        if (m && m.url && !isVideoUrl(m.url)) {
          list.push({ url: m.url, title: m.title || p.title })
        }
      })
    })

    // ২. ক্লাবের সাম্প্রতিক কার্যক্রম
    activityMediaList.forEach((m) => {
      if (m && m.url && !isVideoUrl(m.url)) {
        list.push({ url: m.url, title: m.title || club.name })
      }
    })

    // ৩. ম্যানুয়াল রিপোর্ট
    manualReports.forEach((r: any) => {
      if (r?.embed_media_url && !isVideoUrl(r.embed_media_url)) {
        list.push({ url: r.embed_media_url, title: r.title, date: r.date })
      }
      if (Array.isArray(r?.media_items)) {
        r.media_items.forEach((m: any) => {
          if (m && m.url && !isVideoUrl(m.url)) {
            list.push({ url: m.url, title: m.title || r.title })
          }
        })
      }
    })

    return list
  }, [liveNews, activityMediaList, manualReports, club.name])

  // ⭐ নিরাপদভাবে সকল পোস্ট থেকে ভিডিও ও ভিডিও লিংক সংগ্রহ করা ⭐
  const allVideos = useMemo(() => {
    const list: { url: string; title?: string; date?: string }[] = []

    // ১. লাইভ নিউজ
    liveNews.forEach((p) => {
      const parsed = parseActivityMedia(p.embed_media_url)
      parsed.forEach((m) => {
        if (m && m.url && isVideoUrl(m.url)) {
          list.push({ url: m.url, title: m.title || p.title, date: new Date(p.created_at).toLocaleDateString('bn-BD') })
        }
      })
      if (p.image_url && isVideoUrl(p.image_url)) {
        list.push({ url: p.image_url, title: p.title, date: new Date(p.created_at).toLocaleDateString('bn-BD') })
      }
    })

    // ২. ক্লাবের কার্যক্রমের ভিডিও
    activityMediaList.forEach((m) => {
      if (m && m.url && isVideoUrl(m.url)) {
        list.push({ url: m.url, title: m.title || club.name })
      }
    })

    // ৩. ম্যানুয়াল রিপোর্ট
    manualReports.forEach((r: any) => {
      if (r?.embed_media_url && isVideoUrl(r.embed_media_url)) {
        list.push({ url: r.embed_media_url, title: r.title, date: r.date })
      }
      if (Array.isArray(r?.media_items)) {
        r.media_items.forEach((m: any) => {
          if (m && m.url && isVideoUrl(m.url)) {
            list.push({ url: m.url, title: m.title || r.title })
          }
        })
      }
    })

    return list
  }, [liveNews, activityMediaList, manualReports, club.name])

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
          <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 sm:rounded-t-2xl">
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
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-16 sm:-mt-12 pb-4">
              
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

              {/* পেজের নাম (ভাঙবে না বা কাটবে না) */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:mb-2 min-w-0 w-full px-1">
                <h1
                  id={titleId}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-[#050505] leading-snug break-words whitespace-normal"
                >
                  {club?.nameBn || club?.name}
                </h1>
                {club?.nameBn && (
                  <p className="text-xs sm:text-sm font-medium text-[#65676B] mt-0.5 break-words whitespace-normal">
                    {club?.name}
                  </p>
                )}
                <span className="inline-block mt-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {club?.tag} • MBSTU
                </span>
              </div>

              {/* সোশ্যাল ও শেয়ার বাটন */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto sm:mb-2 mt-2 sm:mt-0">
                {rawClub?.fb_url && (
                  <a
                    href={safeExternalUrl(rawClub.fb_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#0866FF] hover:bg-[#0054e0] text-white px-4 py-2 text-sm font-semibold transition cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                    </svg>
                    Follow
                  </a>
                )}
                {rawClub?.yt_url && (
                  <a
                    href={safeExternalUrl(rawClub.yt_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-4 py-2 text-sm font-semibold transition cursor-pointer"
                  >
                    YouTube
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-4 py-2 text-sm font-semibold transition cursor-pointer"
                >
                  {copied ? <Check className="size-4 text-green-600" /> : <Share2 className="size-4" />}
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>
            </div>

            {/* ৪টি কার্যকর ফেসবুক মেনু ট্যাব (Posts, About, Photos, Videos) */}
            <div className="flex items-center gap-1 border-t border-gray-200 mt-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-3 text-sm font-bold border-b-[3px] transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'posts'
                    ? 'text-[#0866FF] border-[#0866FF]'
                    : 'text-[#65676B] border-transparent hover:bg-gray-100 rounded-lg'
                }`}
              >
                Posts
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`px-4 py-3 text-sm font-bold border-b-[3px] transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'about'
                    ? 'text-[#0866FF] border-[#0866FF]'
                    : 'text-[#65676B] border-transparent hover:bg-gray-100 rounded-lg'
                }`}
              >
                About
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-3 text-sm font-bold border-b-[3px] transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'photos'
                    ? 'text-[#0866FF] border-[#0866FF]'
                    : 'text-[#65676B] border-transparent hover:bg-gray-100 rounded-lg'
                }`}
              >
                <Camera className="size-4" />
                <span>Photos</span>
                {allPhotos.length > 0 && (
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
                    {allPhotos.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-3 text-sm font-bold border-b-[3px] transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'videos'
                    ? 'text-[#0866FF] border-[#0866FF]'
                    : 'text-[#65676B] border-transparent hover:bg-gray-100 rounded-lg'
                }`}
              >
                <Play className="size-4" />
                <span>Videos</span>
                {allVideos.length > 0 && (
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
                    {allVideos.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ==================== পেজ বডি কনটেন্ট ==================== */}
        <div className="max-w-5xl mx-auto px-2 sm:px-4 mt-4 pb-10">

          {/* ================= ১. POSTS ট্যাব ================= */}
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              
              {/* বাম পাশ: About (Intro) ও কমিটি */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h2 className="font-bold text-lg text-[#050505] mb-2.5">Intro</h2>
                  
                  {/* ইন্ট্রো টেক্সট শতভাগ জাস্টিফাই */}
                  <p
                    className="text-[14px] sm:text-[15px] text-[#050505] whitespace-pre-line leading-relaxed text-justify"
                    style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                  >
                    {club?.activityBn || club?.activity || "ক্যাম্পাস ক্লাব ও সংগঠন"}
                  </p>

                  <div className="border-t border-gray-200 mt-4 pt-3 space-y-2.5">
                    {rawClub?.contact_info && (
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#050505]">
                        <Mail className="size-4 text-[#8C939D] shrink-0 mt-0.5" />
                        <span>{rawClub.contact_info}</span>
                      </div>
                    )}
                    {rawClub?.web_url && (
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#050505]">
                        <Globe className="size-4 text-[#8C939D] shrink-0" />
                        <a href={safeExternalUrl(rawClub.web_url)} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#0866FF] truncate">
                          {rawClub.web_url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#050505]">
                      <MapPin className="size-4 text-[#8C939D] shrink-0" />
                      <span>MBSTU, Santosh, Tangail</span>
                    </div>
                  </div>
                </div>

                {/* কার্যনির্বাহী কমিটি প্রিভিউ */}
                {members.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <h2 className="font-bold text-base text-[#050505]">Committee</h2>
                      {term && <span className="text-xs font-semibold text-[#0866FF]">{term}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {members.slice(0, 6).map((m: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 items-center">
                          {m?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.photo_url} alt="" className="size-16 rounded-lg object-cover border border-gray-200 shadow-sm" />
                          ) : (
                            <div className="size-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                              <UserRound className="size-7" />
                            </div>
                          )}
                          <p className="font-semibold text-[11px] text-[#050505] text-center truncate w-full px-0.5">{m?.name || ''}</p>
                          <p className="text-[10px] text-[#65676B] text-center truncate w-full">{m?.role || ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ডান পাশ: টাইমলাইন (Posts) */}
              <div className="md:col-span-3 space-y-4">
                
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center justify-between">
                  <h2 className="font-bold text-base text-[#050505]">Timeline Posts</h2>
                  <span className="text-xs text-[#65676B]">
                    মোট {liveNews.length + manualReports.length}টি পোস্ট
                  </span>
                </div>

                {/* লাইভ নিউজ তালিকা */}
                {liveNews.map((post: any) => (
                  <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                        <p className="font-semibold text-[15px] text-[#050505] leading-tight">
                          {club?.nameBn || club?.name}
                        </p>
                        <div className="flex items-center gap-1 text-[12px] text-[#65676B] mt-0.5">
                          <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                          <span>·</span>
                          <Globe className="size-3" />
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-2">
                      <h3 className="text-[15px] text-[#050505] font-medium leading-relaxed">
                        {post.title}
                      </h3>
                    </div>

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

                    <div className="px-4 py-2 border-t border-gray-100">
                      <ReactionBar postId={post.id} title={post.title} />
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <Link
                          href={`/post/${post.id}`}
                          onClick={onClose}
                          className="flex w-full items-center justify-center gap-2 rounded-lg hover:bg-[#F0F2F5] text-[#65676B] font-semibold text-xs sm:text-sm py-1.5 transition cursor-pointer"
                        >
                          <MessageSquare className="size-4" />
                          <span>বিস্তারিত পড়ুন ও মন্তব্য করুন</span>
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
                        <p className="text-[12px] text-[#65676B]">{r.date}</p>
                      </div>
                    </div>

                    <div className="px-4 pb-3 space-y-1">
                      <h3 className="font-bold text-[16px] text-[#050505] leading-snug">{r.title}</h3>
                      {r.subtitle && <p className="text-[13px] font-semibold text-gray-700">{r.subtitle}</p>}
                      {r.description && (
                        <p
                          className="text-[14px] text-[#050505] whitespace-pre-line leading-relaxed text-justify"
                          style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                        >
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="w-full">
                      {r.embed_media_url && (
                        <UniversalMediaEmbed url={r.embed_media_url} title={r.title} />
                      )}

                      {Array.isArray(r.media_items) && r.media_items.length > 0 && (
                        <div className="space-y-1">
                          {r.media_items.map((m: any, mi: number) => (
                            <div key={mi} className="bg-white pb-2">
                              {(m.title || m.description) && (
                                <div className="px-4 pb-2">
                                  {m.title && <h5 className="font-semibold text-[14px]">{m.title}</h5>}
                                  {m.description && <p className="text-[13px] text-gray-700">{m.description}</p>}
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
                    <p className="font-bold text-[#65676B]">বর্তমানে কোনো পোস্ট প্রকাশিত হয়নি।</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= ২. ABOUT ট্যাব ================= */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 space-y-6">
              <div>
                <h2 className="font-bold text-xl text-[#050505] border-b pb-2">ক্লাবের বিস্তারিত পরিচিতি</h2>
                <p
                  className="mt-3 text-[15px] text-[#050505] whitespace-pre-line leading-relaxed text-justify"
                  style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                >
                  {club?.activityBn || club?.activity || "বিস্তারিত পরিচিতি শীঘ্রই যুক্ত করা হবে।"}
                </p>
              </div>

              {/* যোগাযোগের তথ্য */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="font-bold text-base text-[#050505]">যোগাযোগ ও ঠিকানা</h3>
                {rawClub?.contact_info && (
                  <p className="flex items-center gap-2 text-sm text-[#050505]">
                    <Mail className="size-4 text-emerald-700" />
                    <span>ইমেইল/ফোন: {rawClub.contact_info}</span>
                  </p>
                )}
                {rawClub?.web_url && (
                  <p className="flex items-center gap-2 text-sm text-[#050505]">
                    <Globe className="size-4 text-emerald-700" />
                    <a href={safeExternalUrl(rawClub.web_url)} target="_blank" rel="noopener noreferrer" className="text-[#0866FF] hover:underline font-semibold">
                      অফিসিয়াল ওয়েবসাইট ভিজিট করুন
                    </a>
                  </p>
                )}
                <p className="flex items-center gap-2 text-sm text-[#050505]">
                  <MapPin className="size-4 text-emerald-700" />
                  <span>মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (মাভাবিপ্রবি), সন্তোষ, টাঙ্গাইল-১৯০২</span>
                </p>
              </div>

              {/* পূর্ণাঙ্গ কমিটি */}
              {members.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[#050505]">কার্যনির্বাহী পরিষদ / কমিটি</h3>
                    {term && <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">{term}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {members.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {m?.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photo_url} alt="" className="size-12 rounded-full object-cover border" />
                        ) : (
                          <div className="size-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-base shrink-0">
                            {m?.name?.charAt(0) || 'স'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#050505] truncate">{m?.name || ''}</p>
                          <p className="text-[11px] text-gray-500 truncate">{m?.role || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ৩. PHOTOS ট্যাব ================= */}
          {activeTab === 'photos' && (
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="font-bold text-lg text-[#050505]">ফটোগ্যালারি (Photos)</h2>
                <span className="text-xs text-gray-500">মোট {allPhotos.length}টি ছবি</span>
              </div>

              {allPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {allPhotos.map((photo, i) => (
                    <a
                      key={i}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-200 block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.title || 'Photo'}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                        <p className="text-white text-[11px] font-semibold line-clamp-1">{photo.title || 'ছবি'}</p>
                        {photo.date && <p className="text-gray-300 text-[10px]">{photo.date}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  এই ক্লাবে এখনো কোনো ছবি যুক্ত করা হয়নি।
                </div>
              )}
            </div>
          )}

          {/* ================= ৪. VIDEOS ট্যাব ================= */}
          {activeTab === 'videos' && (
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="font-bold text-lg text-[#050505]">ভিডিও গ্যালারি (Videos)</h2>
                <span className="text-xs text-gray-500">মোট {allVideos.length}টি ভিডিও</span>
              </div>

              {allVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allVideos.map((video, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 space-y-2">
                      <UniversalMediaEmbed url={video.url} title={video.title || 'ভিডিও'} />
                      <div className="px-1">
                        <p className="font-semibold text-xs sm:text-sm text-[#050505] line-clamp-2">
                          {video.title || 'ভিডিও ক্লিপ'}
                        </p>
                        {video.date && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{video.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  এই ক্লাবে এখনো কোনো ভিডিও যুক্ত করা হয়নি।
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
