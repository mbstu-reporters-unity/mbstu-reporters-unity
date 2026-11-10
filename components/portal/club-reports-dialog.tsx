'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Check,
  Globe,
  Mail,
  Share2,
  UserRound,
  X,
  MessageSquare,
  MapPin,
  Camera,
  Play,
  Sparkles,
  Users,
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
  if (!club) return null
  return <ClubReportsDialogContent club={club} rawClub={rawClub} onClose={onClose} />
}

function ClubReportsDialogContent({
  club,
  rawClub,
  onClose,
}: {
  club: Club
  rawClub?: ClubItem | null
  onClose: () => void
}) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos' | 'videos'>('posts')
  const [liveNews, setLiveNews] = useState<any[]>([])

  useEffect(() => {
    if (!club.id) return
    getClubNewsPosts(club.id)
      .then((data) => setLiveNews(Array.isArray(data) ? data : []))
      .catch(() => setLiveNews([]))
  }, [club.id])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

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

  const allPhotos = useMemo(() => {
    const list: { url: string; title?: string; date?: string }[] = []
    
    liveNews.forEach((p) => {
      if (p?.image_url && !isVideoUrl(p.image_url)) {
        list.push({ url: p.image_url, title: p.title, date: new Date(p.created_at).toLocaleDateString('bn-BD') })
      }
      const parsed = parseActivityMedia(p?.embed_media_url)
      parsed.forEach((m) => {
        if (m?.url && !isVideoUrl(m.url)) {
          list.push({ url: m.url, title: m.title || p.title })
        }
      })
    })

    activityMediaList.forEach((m) => {
      if (m?.url && !isVideoUrl(m.url)) {
        list.push({ url: m.url, title: m.title || club.name })
      }
    })

    manualReports.forEach((r: any) => {
      if (r?.embed_media_url && !isVideoUrl(r.embed_media_url)) {
        list.push({ url: r.embed_media_url, title: r.title, date: r.date })
      }
      if (Array.isArray(r?.media_items)) {
        r.media_items.forEach((m: any) => {
          if (m?.url && !isVideoUrl(m.url)) {
            list.push({ url: m.url, title: m.title || r.title })
          }
        })
      }
    })

    return list
  }, [liveNews, activityMediaList, manualReports, club.name])

  const allVideos = useMemo(() => {
    const list: { url: string; title?: string; date?: string }[] = []

    liveNews.forEach((p) => {
      const parsed = parseActivityMedia(p?.embed_media_url)
      parsed.forEach((m) => {
        if (m?.url && isVideoUrl(m.url)) {
          list.push({ url: m.url, title: m.title || p.title, date: new Date(p.created_at).toLocaleDateString('bn-BD') })
        }
      })
      if (p?.image_url && isVideoUrl(p.image_url)) {
        list.push({ url: p.image_url, title: p.title, date: new Date(p.created_at).toLocaleDateString('bn-BD') })
      }
    })

    activityMediaList.forEach((m) => {
      if (m?.url && isVideoUrl(m.url)) {
        list.push({ url: m.url, title: m.title || club.name })
      }
    })

    manualReports.forEach((r: any) => {
      if (r?.embed_media_url && isVideoUrl(r.embed_media_url)) {
        list.push({ url: r.embed_media_url, title: r.title, date: r.date })
      }
      if (Array.isArray(r?.media_items)) {
        r.media_items.forEach((m: any) => {
          if (m?.url && isVideoUrl(m.url)) {
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
          title: club.name,
          text: `${club.name} (${club.nameBn || ''}) - মাভাবিপ্রবি রিপোর্টার্স ইউনিটি`,
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
        className="animate-in fade-in absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-default hidden sm:block"
      />

      {/* ⭐ পুরো মোডালের কনটেইনার: ক্যাম্পাস ক্লাবের মতো রয়্যাল ব্লু ও গ্লাসমর্ফিক লুক ⭐ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92vh] w-full max-w-5xl overflow-y-auto sm:rounded-3xl border border-white/20 shadow-2xl text-white scrollbar-none"
        style={{
          background: `radial-gradient(circle at 85% 15%, rgba(0, 210, 255, 0.35), transparent 50%),
                       radial-gradient(circle at 15% 85%, rgba(46, 16, 101, 0.5), transparent 55%),
                       linear-gradient(135deg, #0b1540 0%, #032d84 40%, #004e9a 75%, #006f85 100%)`,
        }}
      >
        {/* হেডার (কভার + প্রোফাইল) */}
        <div className="relative border-b border-white/20 bg-white/[0.05] backdrop-blur-xl">
          
          <button
            type="button"
            onClick={onClose}
            className="fixed sm:absolute right-3.5 top-3.5 z-40 flex size-9 items-center justify-center rounded-full bg-slate-950/80 hover:bg-cyan-500/80 text-white backdrop-blur border border-white/30 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <X className="size-5" />
          </button>

          {/* ১. কভার ফটো */}
          <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 sm:rounded-t-3xl">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="Cover" className="size-full object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center text-white/30 font-serif text-2xl font-bold uppercase tracking-widest select-none">
                MBSTU CAMPUS CLUB
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1540] via-black/30 to-transparent pointer-events-none" />
          </div>

          {/* ২. প্রোফাইল লোগো ও নাম */}
          <div className="px-4 sm:px-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-16 sm:-mt-14 pb-4">
              
              <div className="relative size-32 sm:size-38 rounded-full bg-slate-900 ring-4 ring-cyan-400/80 shadow-[0_0_25px_rgba(0,229,255,0.4)] overflow-hidden shrink-0 z-10 flex items-center justify-center p-0.5">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={club.name} className="size-full rounded-full object-cover bg-white" />
                ) : (
                  <div className="size-full rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center text-5xl font-bold">
                    {club.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:mb-2 min-w-0 w-full px-1">
                <h1
                  id={titleId}
                  className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white leading-snug break-words whitespace-normal drop-shadow-md"
                >
                  {club.nameBn || club.name}
                </h1>
                {club.nameBn && (
                  <p className="text-xs sm:text-sm font-medium text-cyan-200/90 mt-0.5 break-words whitespace-normal">
                    {club.name}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 text-white text-[11px] font-bold px-3 py-0.5 rounded-full border border-white/30 shadow-xs backdrop-blur-md">
                  <Sparkles className="size-3 text-yellow-300" />
                  <span>{club.tag} • MBSTU</span>
                </span>
              </div>

              {/* বাটনসমূহ */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto sm:mb-2 mt-2 sm:mt-0">
                {rawClub?.fb_url && (
                  <a
                    href={safeExternalUrl(rawClub.fb_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-white/30 px-4 py-2 text-xs sm:text-sm font-bold transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    Follow
                  </a>
                )}
                {rawClub?.yt_url && (
                  <a
                    href={safeExternalUrl(rawClub.yt_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-white/30 px-4 py-2 text-xs sm:text-sm font-bold transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    YouTube
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 text-xs sm:text-sm font-bold backdrop-blur-md transition shadow-lg active:scale-95 cursor-pointer"
                >
                  {copied ? <Check className="size-4 text-cyan-300" /> : <Share2 className="size-4" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* ৪টি গ্লাসি ট্যাব */}
            <div className="flex items-center gap-2 border-t border-white/20 mt-2 overflow-x-auto scrollbar-none pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-white/25 text-white border border-cyan-300 shadow-md backdrop-blur-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Posts
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-white/25 text-white border border-cyan-300 shadow-md backdrop-blur-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                About
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'photos'
                    ? 'bg-white/25 text-white border border-cyan-300 shadow-md backdrop-blur-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Camera className="size-4" />
                <span>Photos</span>
                {allPhotos.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-bold">
                    {allPhotos.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'videos'
                    ? 'bg-white/25 text-white border border-cyan-300 shadow-md backdrop-blur-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Play className="size-4" />
                <span>Videos</span>
                {allVideos.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-bold">
                    {allVideos.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* পেজ বডি: ফ্রস্টেড গ্লাস কার্ড লেআউট */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-5 pb-10">

          {/* ১. POSTS ট্যাব */}
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              
              {/* বাম কলাম: Intro ও কমিটি */}
              <div className="md:col-span-2 space-y-4">
                
                {/* Intro কার্ড */}
                <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-3">
                  <h2 className="font-bold text-base sm:text-lg text-white border-b border-white/20 pb-2 flex items-center gap-2">
                    <Sparkles className="size-4 text-cyan-300" />
                    <span>Intro / পরিচিতি</span>
                  </h2>
                  <p
                    className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed text-justify"
                    style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                  >
                    {club.activityBn || club.activity || "ক্যাম্পাস ক্লাব ও সংগঠন"}
                  </p>

                  <div className="border-t border-white/20 pt-3 space-y-2 text-xs sm:text-sm text-cyan-100">
                    {rawClub?.contact_info && (
                      <div className="flex items-start gap-2.5">
                        <Mail className="size-4 text-cyan-300 shrink-0 mt-0.5" />
                        <span>{rawClub.contact_info}</span>
                      </div>
                    )}
                    {rawClub?.web_url && (
                      <div className="flex items-center gap-2.5">
                        <Globe className="size-4 text-cyan-300 shrink-0" />
                        <a href={safeExternalUrl(rawClub.web_url)} target="_blank" rel="noopener noreferrer" className="hover:underline text-cyan-300 font-semibold truncate">
                          {rawClub.web_url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <MapPin className="size-4 text-cyan-300 shrink-0" />
                      <span>MBSTU, Santosh, Tangail</span>
                    </div>
                  </div>
                </div>

                {/* কমিটি কার্ড */}
                {members.length > 0 && (
                  <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/20 pb-2">
                      <h2 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                        <Users className="size-4 text-cyan-300" />
                        <span>Committee</span>
                      </h2>
                      {term && <span className="text-[11px] font-bold text-cyan-200 bg-white/20 px-2 py-0.5 rounded-full border border-white/30">{term}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {members.slice(0, 6).map((m: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 items-center">
                          {m?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.photo_url} alt="" className="size-16 rounded-xl object-cover ring-2 ring-cyan-400/60 shadow-md bg-slate-900" />
                          ) : (
                            <div className="size-16 rounded-xl bg-white/10 ring-2 ring-white/30 flex items-center justify-center text-white/60">
                              <UserRound className="size-7" />
                            </div>
                          )}
                          <p className="font-bold text-[11px] text-white text-center truncate w-full px-0.5 mt-1">{m?.name || ''}</p>
                          <p className="text-[10px] text-cyan-200/80 text-center truncate w-full">{m?.role || ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ডান কলাম: টাইমলাইন পোস্ট */}
              <div className="md:col-span-3 space-y-4">
                
                <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-3.5 backdrop-blur-xl flex items-center justify-between">
                  <h2 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                    <Sparkles className="size-4 text-cyan-300" />
                    <span>Timeline Posts</span>
                  </h2>
                  <span className="text-xs text-cyan-100 font-semibold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                    মোট {liveNews.length + manualReports.length}টি পোস্ট
                  </span>
                </div>

                {liveNews.map((post: any) => (
                  <article key={post.id} className="rounded-2xl border border-white/25 bg-white/[0.12] shadow-xl backdrop-blur-xl overflow-hidden space-y-3">
                    <div className="flex items-center gap-2.5 p-4 border-b border-white/10">
                      <div className="size-10 rounded-full overflow-hidden bg-slate-900 ring-2 ring-cyan-400/60 shrink-0">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} loading="lazy" alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-brand text-white flex items-center justify-center font-bold text-lg">
                            {club.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white leading-tight">
                          {club.nameBn || club.name}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-cyan-100 mt-0.5">
                          <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                          <span>·</span>
                          <Globe className="size-3" />
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                        {post.title}
                      </h3>
                    </div>

                    <div className="w-full">
                      {post.embed_media_url && (
                        <div className="px-3">
                          <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                        </div>
                      )}

                      {post.image_url && !post.embed_media_url && (
                        <div className="px-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image_url}
                            alt={post.title}
                            loading="lazy"
                            className="w-full max-h-[500px] object-cover rounded-xl border border-white/20"
                          />
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2.5 border-t border-white/10">
                      <ReactionBar postId={post.id} title={post.title} />
                      <div className="border-t border-white/10 mt-2 pt-2">
                        <Link
                          href={`/post/${post.id}`}
                          onClick={onClose}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm py-2 transition border border-white/20 cursor-pointer"
                        >
                          <MessageSquare className="size-4 text-cyan-300" />
                          <span>বিস্তারিত পড়ুন ও মন্তব্য করুন</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}

                {manualReports.map((r: any, i: number) => (
                  <article key={`manual-${i}`} className="rounded-2xl border border-white/25 bg-white/[0.12] shadow-xl backdrop-blur-xl overflow-hidden space-y-3">
                    <div className="flex items-center gap-2.5 p-4 border-b border-white/10">
                      <div className="size-10 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/30 shrink-0 flex items-center justify-center text-white/70">
                        <UserRound className="size-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{r.reporter || 'Reporter'}</p>
                        <p className="text-[11px] text-cyan-200">{r.date}</p>
                      </div>
                    </div>

                    <div className="px-4 pb-2 space-y-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">{r.title}</h3>
                      {r.subtitle && <p className="text-xs font-semibold text-cyan-200">{r.subtitle}</p>}
                      {r.description && (
                        <p
                          className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed text-justify pt-1"
                          style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                        >
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="w-full px-3 pb-3">
                      {r.embed_media_url && (
                        <UniversalMediaEmbed url={r.embed_media_url} title={r.title} />
                      )}

                      {Array.isArray(r.media_items) && r.media_items.length > 0 && (
                        <div className="space-y-2">
                          {r.media_items.map((m: any, mi: number) => (
                            <div key={mi} className="rounded-xl border border-white/20 bg-black/20 p-2 space-y-1.5">
                              {(m.title || m.description) && (
                                <div className="px-2 pt-1">
                                  {m.title && <h5 className="font-bold text-sm text-white">{m.title}</h5>}
                                  {m.description && <p className="text-xs text-slate-200">{m.description}</p>}
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
                  <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-8 text-center backdrop-blur-xl">
                    <p className="font-bold text-white/80">বর্তমানে কোনো পোস্ট প্রকাশিত হয়নি।</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ২. ABOUT ট্যাব */}
          {activeTab === 'about' && (
            <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white border-b border-white/20 pb-2 flex items-center gap-2">
                  <Sparkles className="size-5 text-cyan-300" />
                  <span>ক্লাবের বিস্তারিত পরিচিতি</span>
                </h2>
                <p
                  className="mt-3 text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed text-justify"
                  style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                >
                  {club.activityBn || club.activity || "বিস্তারিত পরিচিতি শীঘ্রই যুক্ত করা হবে।"}
                </p>
              </div>

              <div className="border-t border-white/20 pt-4 space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-white">যোগাযোগ ও ঠিকানা</h3>
                {rawClub?.contact_info && (
                  <p className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                    <Mail className="size-4 text-cyan-300" />
                    <span>ইমেইল/ফোন: {rawClub.contact_info}</span>
                  </p>
                )}
                {rawClub?.web_url && (
                  <p className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                    <Globe className="size-4 text-cyan-300" />
                    <a href={safeExternalUrl(rawClub.web_url)} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline font-bold">
                      অফিসিয়াল ওয়েবসাইট ভিজিট করুন
                    </a>
                  </p>
                )}
                <p className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                  <MapPin className="size-4 text-cyan-300" />
                  <span>মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (মাভাবিপ্রবি), সন্তোষ, টাঙ্গাইল-১৯০২</span>
                </p>
              </div>

              {members.length > 0 && (
                <div className="border-t border-white/20 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <Users className="size-4 text-cyan-300" />
                      <span>কার্যনির্বাহী পরিষদ / কমিটি</span>
                    </h3>
                    {term && <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-0.5 rounded-full font-bold">{term}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {members.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                        {m?.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photo_url} alt="" className="size-12 rounded-full object-cover ring-2 ring-cyan-400/60 bg-slate-900" />
                        ) : (
                          <div className="size-12 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                            {m?.name?.charAt(0) || 'স'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{m?.name || ''}</p>
                          <p className="text-[11px] text-cyan-200/80 truncate">{m?.role || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ৩. PHOTOS ট্যাব */}
          {activeTab === 'photos' && (
            <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="size-5 text-cyan-300" />
                  <span>ফটোগ্যালারি (Photos)</span>
                </h2>
                <span className="text-xs text-cyan-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 font-bold">
                  মোট {allPhotos.length}টি ছবি
                </span>
              </div>

              {allPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {allPhotos.map((photo, i) => (
                    <a
                      key={i}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-900 border border-white/20 block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.title || 'Photo'}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                        <p className="text-white text-[11px] font-semibold line-clamp-1">{photo.title || 'ছবি'}</p>
                        {photo.date && <p className="text-cyan-200 text-[10px]">{photo.date}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/70 text-sm">
                  এই ক্লাবে এখনো কোনো ছবি যুক্ত করা হয়নি।
                </div>
              )}
            </div>
          )}

          {/* ৪. VIDEOS ট্যাব */}
          {activeTab === 'videos' && (
            <div className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Play className="size-5 text-cyan-300" />
                  <span>ভিডিও গ্যালারি (Videos)</span>
                </h2>
                <span className="text-xs text-cyan-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 font-bold">
                  মোট {allVideos.length}টি ভিডিও
                </span>
              </div>

              {allVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allVideos.map((video, i) => (
                    <div key={i} className="rounded-xl border border-white/20 bg-black/30 p-2.5 space-y-2">
                      <UniversalMediaEmbed url={video.url} title={video.title || 'ভিডিও'} />
                      <div className="px-1">
                        <p className="font-bold text-xs sm:text-sm text-white line-clamp-2">
                          {video.title || 'ভিডিও ক্লিপ'}
                        </p>
                        {video.date && (
                          <p className="text-[11px] text-cyan-200 mt-0.5">{video.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/70 text-sm">
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
