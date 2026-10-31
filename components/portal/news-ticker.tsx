'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { getLiveTicker, bn } from '@/lib/ticker'
import type { TickerItem } from '@/lib/ticker'

const INTERVAL = 6000
const POLL = 20000

const CSS = `
@keyframes tkUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes tkDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes tkGlow{0%,100%{box-shadow:0 0 0 0 rgba(225,29,72,0)}50%{box-shadow:0 0 18px 2px rgba(225,29,72,.45)}}
.tk-up{animation:tkUp .45s cubic-bezier(.22,1,.36,1)}
.tk-down{animation:tkDown .45s cubic-bezier(.22,1,.36,1)}
.tk-glow{animation:tkGlow 2s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.tk-up,.tk-down,.tk-glow{animation:none}}
`

const alive = (t: TickerItem) => !t.expires_at || new Date(t.expires_at).getTime() > Date.now()

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'এইমাত্র'
  if (m < 60) return `${bn(m)} মিনিট আগে`
  const h = Math.floor(m / 60)
  if (h < 24) return `${bn(h)} ঘণ্টা আগে`
  return `${bn(Math.floor(h / 24))} দিন আগে`
}

function Radar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5">
        <animate attributeName="r" from="3" to="8" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<'up' | 'down'>('up')
  const [paused, setPaused] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [announce, setAnnounce] = useState('')

  const seen = useRef<Set<string> | null>(null)
  const audio = useRef<AudioContext | null>(null)
  const soundRef = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const list = items.filter(alive)
  const total = list.length
  const idx = total ? index % total : 0

  const ping = useCallback(() => {
    const ctx = audio.current
    if (!ctx) return
    try {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      const t = ctx.currentTime
      o.type = 'sine'
      o.frequency.setValueAtTime(880, t)
      o.frequency.exponentialRampToValueAtTime(660, t + 0.35)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.45)
    } catch {}
  }, [])

  // প্রতি ২০ সেকেন্ডে নতুন শিরোনাম আনে
  useEffect(() => {
    let on = true
    async function load() {
      const rows = await getLiveTicker()
      if (!on || !rows) return
      const prev = seen.current
      const fresh = prev ? rows.filter((r) => !prev.has(r.id)) : []
      seen.current = new Set(rows.map((r) => r.id))
      setItems(rows)
      setLoaded(true)
      if (fresh.length > 0) {
        setDir('up')
        setIndex(Math.max(0, rows.findIndex((r) => r.id === fresh[0].id)))
        setAnnounce(fresh[0].title)
        if (soundRef.current && fresh.some((f) => f.sound_alert)) ping()
      }
    }
    load()
    const id = setInterval(load, POLL)
    const vis = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', vis)
    return () => {
      on = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [ping])

  // ৬ সেকেন্ডে অটো-পরিবর্তন, হাত রাখলে থামে
  useEffect(() => {
    if (paused || total < 2) return
    const id = setTimeout(() => {
      setDir('up')
      setIndex((i) => (i + 1) % total)
    }, INTERVAL)
    return () => clearTimeout(id)
  }, [paused, total, index])

  function go(d: 1 | -1) {
    if (total < 2) return
    setDir(d === 1 ? 'up' : 'down')
    setIndex((i) => (((i % total) + d + total) % total))
  }

  function toggleSound() {
    if (!soundOn) {
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!audio.current) audio.current = new AC()
        void audio.current.resume()
      } catch {}
      soundRef.current = true
      setSoundOn(true)
      ping()
    } else {
      soundRef.current = false
      setSoundOn(false)
    }
  }

  function onTouchStart() {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    setPaused(true)
  }
  function onTouchEnd() {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => setPaused(false), 5000)
  }

  // ডেটাবেসে কোনো লাইভ শিরোনাম না থাকলে বার দেখাবে না
  if (!loaded || total === 0) return null

  const cur = list[idx]
  const urgent = cur.level === 'urgent'
  const external = !!cur.url && /^https?:\/\//i.test(cur.url)
  const ctrl = 'flex h-11 w-11 items-center justify-center transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none'

  return (
    <section
      role="region"
      aria-label="ব্রেকিং নিউজ"
      className={
        urgent
          ? 'tk-glow relative z-20 border-b-2 border-rose-600 bg-rose-950/95 text-rose-50'
          : 'relative z-20 border-b border-slate-700 bg-slate-900 text-slate-100'
      }
    >
      <style>{CSS}</style>
      <div
        className="mx-auto flex max-w-7xl items-stretch"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex shrink-0 items-center gap-2 bg-red-600 px-3 text-xs font-bold text-white sm:px-4 sm:text-sm">
          <Radar />
          <span>{urgent ? '🚨 জরুরি' : 'ব্রেকিং'}</span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div
            key={cur.id}
            className={`${dir === 'up' ? 'tk-up' : 'tk-down'} flex h-11 items-center gap-2 px-3 sm:px-4`}
          >
            {cur.url ? (
              <a
                href={cur.url}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="min-w-0 truncate text-sm font-medium leading-7 hover:underline focus-visible:underline focus-visible:outline-none sm:text-base"
              >
                {cur.title}
              </a>
            ) : (
              <>
                <span className="shrink-0 rounded border border-current px-1.5 text-xs leading-5 opacity-80">[সংক্ষেপ]</span>
                <span className="min-w-0 truncate text-sm font-medium leading-7 sm:text-base">{cur.title}</span>
              </>
            )}
            <span className="hidden shrink-0 text-xs opacity-70 md:inline">{ago(cur.created_at)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {total > 1 && (
            <span
              className="px-1 text-xs tabular-nums opacity-80 sm:px-2"
              aria-label={`${bn(total)}টির মধ্যে ${bn(idx + 1)} নম্বর`}
            >
              {bn(idx + 1)}/{bn(total)}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'অ্যালার্ট শব্দ বন্ধ করুন' : 'অ্যালার্ট শব্দ চালু করুন'}
            className={`${ctrl} hidden sm:flex`}
          >
            {soundOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
          </button>
          {total > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="আগের শিরোনাম" className={ctrl}>
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="পরের শিরোনাম" className={ctrl}>
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
    </section>
  )
}
