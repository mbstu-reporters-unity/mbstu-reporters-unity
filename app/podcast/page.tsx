'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Headphones,
  Play,
  CalendarDays,
  User,
  Mic,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { getCampusPodcasts, type CampusPodcast } from '@/lib/polls-podcasts'

function parsePodcastEmbed(rawUrl: string):
  | { kind: 'youtube'; src: string }
  | { kind: 'spotify'; src: string }
  | { kind: 'audio'; src: string }
  | { kind: 'video'; src: string }
  | { kind: 'external'; src: string } {
  const url = rawUrl.trim()

  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i
  )
  if (yt && yt[1]?.length === 11) {
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1`,
    }
  }

  if (url.includes('open.spotify.com/')) {
    return {
      kind: 'spotify',
      src: url.replace('open.spotify.com/', 'open.spotify.com/embed/'),
    }
  }

  if (/\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(url)) {
    return { kind: 'audio', src: url }
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
    return { kind: 'video', src: url }
  }

  return { kind: 'external', src: url }
}

export default function PodcastSeriesPage() {
  const [list, setList] = useState<CampusPodcast[]>([])
  const [loading, setLoading] = useState(true)
  const [seriesFilter, setSeriesFilter] = useState('সব')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const rows = await getCampusPodcasts(false)
    setList(rows)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const seriesNames = useMemo(() => {
    const s = new Set<string>(['সব'])
    list.forEach((p) => {
      if (p.series_name) s.add(p.series_name)
    })
    return Array.from(s)
  }, [list])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter((p) => {
      if (seriesFilter !== 'সব' && p.series_name !== seriesFilter) return false
      if (!q) return true
      return [p.title, p.description, p.series_name, p.guest_name, p.host_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [list, seriesFilter, search])

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: 'সংবাদ ও মিডিয়া' },
              { label: 'পডকাস্ট ও ভিডিও সিরিজ' },
            ]}
          />

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Headphones className="size-3.5" />
              <span>Podcast & Video Series • ক্যাম্পাস কথোপকথন</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              পডকাস্ট ও বিশেষ ভিডিও সিরিজ
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              মাভাবিপ্রবির গবেষক, শিক্ষক, শিক্ষার্থী ও প্রাক্তন সফল সদস্যদের নিয়ে ধারাবাহিক সাক্ষাৎকার, ক্যাম্পাস আড্ডা ও অডিও-ভিডিও সিরিজ।
            </p>
          </div>

          <section className="glass-card p-4 sm:p-5 space-y-4 text-white">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <input
                  type="text"
                  placeholder="পডকাস্ট পর্ব, অতিথি বা সিরিজের নাম দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold cursor-pointer shrink-0"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            {seriesNames.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {seriesNames.map((sn) => (
                  <button
                    key={sn}
                    type="button"
                    onClick={() => setSeriesFilter(sn)}
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold cursor-pointer transition ${
                      seriesFilter === sn
                        ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow'
                        : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                    }`}
                  >
                    {sn}
                  </button>
                ))}
              </div>
            )}
          </section>

          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              পডকাস্ট পর্ব লোড হচ্ছে...
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((ep) => {
                const player = parsePodcastEmbed(ep.media_url)
                return (
                  <article key={ep.id} className="glass-card p-5 space-y-4 text-white flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-200 px-3 py-0.5 font-bold">
                          <Mic className="size-3" />
                          <span>{ep.series_name}</span>
                          {ep.episode_number ? ` · ${ep.episode_number}` : ''}
                        </span>
                        {ep.duration && (
                          <span className="inline-flex items-center gap-1 text-cyan-200 text-[11px]">
                            <Clock className="size-3" /> {ep.duration}
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif text-lg font-bold text-white leading-snug">
                        {ep.title}
                      </h2>

                      {player.kind === 'youtube' && (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/15">
                          <iframe
                            src={player.src}
                            className="size-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            title={ep.title}
                          />
                        </div>
                      )}

                      {player.kind === 'spotify' && (
                        <iframe
                          src={player.src}
                          className="w-full h-[152px] rounded-2xl border-0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          title={ep.title}
                        />
                      )}

                      {player.kind === 'video' && (
                        <video
                          src={player.src}
                          poster={ep.thumbnail_url || undefined}
                          controls
                          playsInline
                          className="w-full aspect-video rounded-2xl bg-black border border-white/15"
                        />
                      )}

                      {player.kind === 'audio' && (
                        <div className="p-3 rounded-2xl bg-black/35 border border-white/15 space-y-2">
                          {ep.thumbnail_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ep.thumbnail_url}
                              alt={ep.title}
                              className="w-full h-36 object-cover rounded-xl"
                            />
                          )}
                          <audio src={player.src} controls className="w-full" />
                        </div>
                      )}

                      {player.kind === 'external' && (
                        <a
                          href={player.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 text-slate-950 px-4 py-2 text-xs font-bold"
                        >
                          <Play className="size-3.5 fill-current" />
                          <span>পর্বটি শুনুন / দেখুন</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}

                      {ep.description && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                          {ep.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] text-slate-300">
                      <div className="flex flex-wrap gap-3">
                        {ep.guest_name && (
                          <span className="inline-flex items-center gap-1">
                            <User className="size-3 text-amber-300" /> অতিথি: <b>{ep.guest_name}</b>
                          </span>
                        )}
                        {ep.host_name && <span>সঞ্চালনায়: {ep.host_name}</span>}
                      </div>
                      <span className="inline-flex items-center gap-1 text-white/60">
                        <CalendarDays className="size-3 text-cyan-400" />
                        {new Date(ep.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <Headphones className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">এখনো কোনো পডকাস্ট পর্ব যুক্ত করা হয়নি।</p>
              <p className="text-xs">অ্যাডমিন প্যানেল থেকে পডকাস্ট বা ভিডিও সিরিজ যোগ করলেই এখানে দেখা যাবে।</p>
            </div>
          )}

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
