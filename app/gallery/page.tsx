'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Camera,
  Video,
  Play,
  Search,
  ZoomIn,
  CalendarDays,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getVisiblePosts, getImagesMetaForMany, type ImageMeta } from '@/lib/sb'
import { getLiveReels } from '@/lib/reels'
import { useLang } from '@/lib/i18n'

type MediaKind = 'photo' | 'video'
type VideoPlatform = 'youtube' | 'facebook' | 'direct'

interface GalleryEntry {
  id: string
  kind: MediaKind
  url: string
  thumbnailUrl: string | null
  title: string
  caption: string | null
  credit: string | null
  category: string | null
  date: string
  postHref: string | null
  platform?: VideoPlatform
  embedSrc?: string
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i
  )
  return m && m[1]?.length === 11 ? m[1] : null
}

function classifyUrl(raw: string): {
  kind: MediaKind
  platform?: VideoPlatform
  embedSrc?: string
  thumbnailUrl?: string | null
} | null {
  const u = raw.trim()
  if (!u || !/^https?:\/\//i.test(u)) return null

  const ytId = extractYouTubeId(u)
  if (ytId) {
    return {
      kind: 'video',
      platform: 'youtube',
      embedSrc: `https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0&playsinline=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    }
  }

  if (u.includes('facebook.com') || u.includes('fb.watch')) {
    return {
      kind: 'video',
      platform: 'facebook',
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        u
      )}&show_text=false&autoplay=true`,
      thumbnailUrl: null,
    }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u)) {
    return {
      kind: 'video',
      platform: 'direct',
      thumbnailUrl: null,
    }
  }

  return { kind: 'photo', thumbnailUrl: u }
}

function parseEmbedItems(raw?: string | null): Array<{
  url: string
  title?: string | null
  caption?: string | null
}> {
  if (!raw || !raw.trim()) return []
  const s = raw.trim()
  if (s.startsWith('[') || s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      return arr
        .filter((x) => x && typeof x.url === 'string' && x.url.trim())
        .map((x) => ({
          url: x.url.trim(),
          title: x.title || null,
          caption: x.caption || x.description || null,
        }))
    } catch {}
  }
  return [{ url: s }]
}

function fmtDate(iso: string | null | undefined, lang: 'bn' | 'en'): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  })
}

export default function GalleryPage() {
  const { lang, pick } = useLang()
  const [entries, setEntries] = useState<GalleryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'photo' | 'video'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('সব')
  const [search, setSearch] = useState('')
  const count = (value: number) => value.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')

  // লাইটবক্স ও ভিডিও প্লেয়ার স্টেট
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null)
  const [activeVideo, setActiveVideo] = useState<GalleryEntry | null>(null)
  const touchStartX = useRef<number | null>(null)

  async function loadGallery() {
    setLoading(true)
    try {
      const [posts, reels] = await Promise.all([
        getVisiblePosts(60),
        getLiveReels(),
      ])

      const postIds = posts.map((p) => p.id).slice(0, 45)
      const imagesMap: Record<string, ImageMeta[]> =
        postIds.length > 0 ? await getImagesMetaForMany('post', postIds) : {}

      const seenUrls = new Set<string>()
      const collected: GalleryEntry[] = []

      const pushUnique = (entry: GalleryEntry) => {
        const norm = entry.url.split('?')[0].trim()
        if (!norm || seenUrls.has(norm)) return
        seenUrls.add(norm)
        collected.push(entry)
      }

      // ১. সংবাদ ও পোস্টের ছবি এবং ভিডিও সংগ্রহ
      for (const p of posts) {
        const postHref = `/post/${p.id}`
        const metaRows = imagesMap[p.id] || []

        // ক. post_images টেবিলের ছবিগুলো (ক্যাপশন ও ক্রেডিটসহ)
        metaRows.forEach((img, idx) => {
          const info = classifyUrl(img.url)
          if (!info) return
          pushUnique({
            id: `pm-${p.id}-${img.id || idx}`,
            kind: info.kind,
            url: img.url,
            thumbnailUrl: info.thumbnailUrl || img.url,
            title: p.title,
            caption: img.caption || null,
            credit: img.credit || p.author || null,
            category: p.category || 'ক্যাম্পাস সংবাদ',
            date: p.created_at,
            postHref,
            platform: info.platform,
            embedSrc: info.embedSrc,
          })
        })

        // খ. embed_media_url থেকে ছবি ও ভিডিও
        const embeds = parseEmbedItems(p.embed_media_url)
        embeds.forEach((em, idx) => {
          const info = classifyUrl(em.url)
          if (!info) return
          pushUnique({
            id: `em-${p.id}-${idx}`,
            kind: info.kind,
            url: em.url,
            thumbnailUrl:
              info.kind === 'video' ? info.thumbnailUrl || p.image_url : em.url,
            title: em.title || p.title,
            caption: em.caption || null,
            credit: p.author || null,
            category: p.category || 'ক্যাম্পাস সংবাদ',
            date: p.created_at,
            postHref,
            platform: info.platform,
            embedSrc: info.embedSrc,
          })
        })

        // গ. সরাসরি পোস্টের video_url
        if (p.video_url) {
          pushUnique({
            id: `pv-${p.id}`,
            kind: 'video',
            url: p.video_url,
            thumbnailUrl: p.image_url || null,
            title: p.title,
            caption: p.heading || null,
            credit: p.author || null,
            category: p.category || 'ভিডিও প্রতিবেদন',
            date: p.created_at,
            postHref,
            platform: 'direct',
          })
        }

        // ঘ. পোস্টের মূল কভার ছবি (যদি আগে যোগ না হয়ে থাকে)
        if (p.image_url) {
          const info = classifyUrl(p.image_url)
          if (info && info.kind === 'photo') {
            pushUnique({
              id: `pc-${p.id}`,
              kind: 'photo',
              url: p.image_url,
              thumbnailUrl: p.image_url,
              title: p.title,
              caption: p.heading || null,
              credit: p.author || null,
              category: p.category || 'ক্যাম্পাস সংবাদ',
              date: p.created_at,
              postHref,
            })
          }
        }
      }

      // ২. রিলস ও ভিডিও হাবের ভিডিওগুলো যুক্ত করা
      for (const r of reels) {
        const info = classifyUrl(r.video_url)
        pushUnique({
          id: `reel-${r.id}`,
          kind: 'video',
          url: r.video_url,
          thumbnailUrl: r.thumbnail_url || info?.thumbnailUrl || null,
          title: r.title,
          caption: null,
          credit: r.author_name || null,
          category: 'রিলস ও ভিডিও',
          date: r.created_at,
          postHref: r.link_url || null,
          platform: info?.platform || 'direct',
          embedSrc: info?.embedSrc,
        })
      }

      collected.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setEntries(collected)
    } catch {
      setEntries([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>(['সব'])
    entries.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set)
  }, [entries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (tab !== 'all' && e.kind !== tab) return false
      if (categoryFilter !== 'সব' && e.category !== categoryFilter) return false
      if (!q) return true
      return [e.title, e.caption, e.credit, e.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [entries, tab, categoryFilter, search])

  const filteredPhotos = useMemo(
    () => filtered.filter((e) => e.kind === 'photo'),
    [filtered]
  )

  const photoCount = useMemo(
    () => entries.filter((e) => e.kind === 'photo').length,
    [entries]
  )
  const videoCount = useMemo(
    () => entries.filter((e) => e.kind === 'video').length,
    [entries]
  )

  // লাইটবক্স কিবোর্ড ও স্ক্রল লক
  useEffect(() => {
    const isModalOpen = activePhotoIdx !== null || activeVideo !== null
    if (!isModalOpen) return

    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePhotoIdx(null)
        setActiveVideo(null)
      }
      if (activePhotoIdx !== null && filteredPhotos.length > 1) {
        if (e.key === 'ArrowLeft') {
          setActivePhotoIdx((i) =>
            i !== null ? (i - 1 + filteredPhotos.length) % filteredPhotos.length : null
          )
        }
        if (e.key === 'ArrowRight') {
          setActivePhotoIdx((i) =>
            i !== null ? (i + 1) % filteredPhotos.length : null
          )
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [activePhotoIdx, activeVideo, filteredPhotos.length])

  function handleCardClick(item: GalleryEntry) {
    if (item.kind === 'video') {
      setActiveVideo(item)
      return
    }
    const idx = filteredPhotos.findIndex((p) => p.id === item.id)
    setActivePhotoIdx(idx >= 0 ? idx : 0)
  }

  const activePhoto =
    activePhotoIdx !== null ? filteredPhotos[activePhotoIdx] || null : null

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: pick('সংবাদ ও গণমাধ্যম', 'News and Media') },
              { label: pick('ছবি ও ভিডিও গ্যালারি', 'Photo and Video Gallery') },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Camera className="size-3.5" />
              <span>{pick('ক্যাম্পাসের ছবি ও ভিডিও সংরক্ষণাগার', 'Campus Photo and Video Archive')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('ছবি ও ভিডিও গ্যালারি', 'Photo and Video Gallery')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {pick('মাভাবিপ্রবির ক্যাম্পাস জীবন, অনুষ্ঠান, অর্জন এবং সাংবাদিকদের ধারণ করা আলোকচিত্র ও ভিডিও প্রতিবেদনের ডিজিটাল সংরক্ষণাগার।', 'A digital archive of campus life, events, achievements, photographs, and video reports from MBSTU.')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-bold">
              <span className="bg-white/10 border border-white/20 px-3.5 py-1 rounded-full">
                📷 {pick('ছবি:', 'Photographs:')} <b className="text-cyan-300">{count(photoCount)}</b>
              </span>
              <span className="bg-white/10 border border-white/20 px-3.5 py-1 rounded-full">
                🎥 {pick('ভিডিও:', 'Videos:')} <b className="text-rose-300">{count(videoCount)}</b>
              </span>
            </div>
          </div>

          {/* সার্চ ও ফিল্টার বার */}
          <section className="glass-card p-4 sm:p-5 space-y-4 text-white">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <input
                  type="text"
                  placeholder={pick('শিরোনাম, ক্যাপশন বা আলোকচিত্রীর নাম দিয়ে খুঁজুন', 'Search by title, caption, or photographer')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex gap-1.5">
                  {[
                    { k: 'all' as const, l: `${pick('সব', 'All')} (${count(entries.length)})`, Icon: Sparkles },
                    { k: 'photo' as const, l: `${pick('ছবি', 'Photographs')} (${count(photoCount)})`, Icon: ImageIcon },
                    { k: 'video' as const, l: `${pick('ভিডিও', 'Videos')} (${count(videoCount)})`, Icon: Video },
                  ].map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      onClick={() => setTab(t.k)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold cursor-pointer transition ${
                        tab === t.k
                          ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow'
                          : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                      }`}
                    >
                      <t.Icon className="size-3.5" />
                      <span>{t.l}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={loadGallery}
                  disabled={loading}
                  className="p-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title={pick('তথ্য হালনাগাদ করুন', 'Refresh')}
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {categories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold cursor-pointer transition ${
                      categoryFilter === cat
                        ? 'border-amber-300 bg-amber-400 text-slate-950'
                        : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* মিডিয়া গ্রিড */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              {pick('গ্যালারি লোড হচ্ছে…', 'Loading gallery…')}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="glass-card overflow-hidden flex flex-col justify-between text-white cursor-pointer group hover:border-cyan-400/70 transition"
                >
                  <div>
                    <div className="relative w-full bg-black/60 overflow-hidden">
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt={item.caption || item.title}
                          loading="lazy"
                          className="block h-auto w-full object-contain"
                        />
                      ) : (
                        <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white/60 gap-2">
                          <Video className="size-10 text-rose-400" />
                          <span className="text-[11px] font-semibold">{pick('ভিডিও প্রতিবেদন', 'Video report')}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      <span
                        className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow ${
                          item.kind === 'video'
                            ? 'bg-rose-600/90 text-white border-rose-300/40'
                            : 'bg-black/65 text-cyan-200 border-white/25 backdrop-blur'
                        }`}
                      >
                        {item.kind === 'video' ? (
                          <>
                            <Play className="size-2.5 fill-current" />
                            <span>
                              {item.platform === 'youtube'
                                ? 'YouTube'
                                : item.platform === 'facebook'
                                  ? 'FB Video'
                                  : pick('ভিডিও', 'Video')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Camera className="size-2.5" />
                            <span>{pick('ছবি', 'Photo')}</span>
                          </>
                        )}
                      </span>

                      {item.category && (
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-black/65 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/20 max-w-[130px] truncate">
                          {item.category}
                        </span>
                      )}

                      {item.kind === 'video' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="size-12 rounded-full bg-black/65 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="size-5 fill-current text-rose-400 ml-0.5" />
                          </span>
                        </div>
                      ) : (
                        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 opacity-90 group-hover:opacity-100">
                          <ZoomIn className="size-3 text-cyan-300" />
                          <span>{pick('বড় করে দেখুন', 'View larger')}</span>
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h2 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h2>
                      {item.caption && (
                        <p className="text-xs text-slate-300 line-clamp-2">{item.caption}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-3.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] text-slate-300">
                    <span className="truncate">
                      {item.credit ? `📷 ${item.credit}` : fmtDate(item.date, lang)}
                    </span>

                    {item.postHref && (
                      <Link
                        href={item.postHref}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-cyan-300 hover:text-white font-bold shrink-0"
                      >
                        <span>{pick('মূল সংবাদ', 'Original report')}</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <Camera className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">{pick('কোনো ছবি বা ভিডিও পাওয়া যায়নি।', 'No photographs or videos were found.')}</p>
              <p className="text-xs">{pick('অন্য কোনো ফিল্টার বা অনুসন্ধান-শব্দ ব্যবহার করে দেখুন।', 'Try a different filter or search term.')}</p>
            </div>
          )}

          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />

      {/* ছবির লাইটবক্স মোডাল */}
      {activePhoto && activePhotoIdx !== null && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 text-white flex flex-col justify-between select-none animate-in fade-in"
          onClick={() => setActivePhotoIdx(null)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || filteredPhotos.length <= 1) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            touchStartX.current = null
            if (Math.abs(dx) > 40) {
              setActivePhotoIdx((i) => {
                if (i === null) return null
                return dx > 0
                  ? (i - 1 + filteredPhotos.length) % filteredPhotos.length
                  : (i + 1) % filteredPhotos.length
              })
            }
          }}
        >
          <div
            className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-bold bg-white/15 px-3 py-1 rounded-full border border-white/20">
              {count(activePhotoIdx + 1)} / {count(filteredPhotos.length)}
            </span>

            <button
              type="button"
              onClick={() => setActivePhotoIdx(null)}
              className="flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              aria-label={pick('বন্ধ করুন', 'Close')}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center p-2 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto.url}
              alt={activePhoto.caption || activePhoto.title}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {filteredPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePhotoIdx(
                      (activePhotoIdx - 1 + filteredPhotos.length) % filteredPhotos.length
                    )
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/65 hover:bg-black/90 border border-white/20 cursor-pointer"
                  aria-label={pick('আগের ছবি', 'Previous photograph')}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePhotoIdx((activePhotoIdx + 1) % filteredPhotos.length)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/65 hover:bg-black/90 border border-white/20 cursor-pointer"
                  aria-label={pick('পরের ছবি', 'Next photograph')}
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          <div
            className="p-4 text-center bg-gradient-to-t from-black via-black/80 to-transparent space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-sm sm:text-base font-bold text-white">
              {activePhoto.title}
            </p>
            {activePhoto.caption && (
              <p className="text-xs text-slate-200 max-w-xl mx-auto">{activePhoto.caption}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] pt-1">
              {activePhoto.credit && (
                <span className="text-cyan-300 font-semibold">📷 {pick('ছবি:', 'Photograph:')} {activePhoto.credit}</span>
              )}
              <span className="inline-flex items-center gap-1 text-white/70">
                <CalendarDays className="size-3 text-cyan-400" />
                <span>{fmtDate(activePhoto.date, lang)}</span>
              </span>
              {activePhoto.postHref && (
                <Link
                  href={activePhoto.postHref}
                  onClick={() => setActivePhotoIdx(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-500 text-slate-950 px-3 py-0.5 font-bold"
                >
                  <span>{pick('মূল সংবাদ পড়ুন', 'Read original report')}</span>
                  <ExternalLink className="size-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ভিডিও থিয়েটার মোডাল */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 text-white flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <button
            type="button"
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
            aria-label={pick('বন্ধ করুন', 'Close')}
          >
            <X className="size-5" />
          </button>

          <div
            className="w-full max-w-4xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl">
              {activeVideo.embedSrc ? (
                <iframe
                  src={activeVideo.embedSrc}
                  className="size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  title={activeVideo.title}
                />
              ) : (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  playsInline
                  className="size-full object-contain"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="min-w-0">
                <p className="font-serif text-sm sm:text-base font-bold text-white">
                  {activeVideo.title}
                </p>
                <p className="text-xs text-slate-400">{fmtDate(activeVideo.date, lang)}</p>
              </div>
              {activeVideo.postHref && (
                <Link
                  href={activeVideo.postHref}
                  onClick={() => setActiveVideo(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 text-slate-950 px-4 py-1.5 text-xs font-bold"
                >
                  <span>{pick('মূল সংবাদ ও মন্তব্য', 'Original report and comments')}</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
