'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Radio, Volume2, VolumeX } from 'lucide-react'
import { getLiveTicker, DEFAULT_SPEED } from '@/lib/ticker'
import type { TickerItem } from '@/lib/ticker'

const POLL = 20000

// দুই প্রান্তে লেখা ফেড ইন / ফেড আউট
const MASK = 'linear-gradient(to right, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%)'

const CSS = `@keyframes tkScroll{from{transform:translateX(var(--from))}to{transform:translateX(var(--to))}}`

const alive = (t: TickerItem) => !t.expires_at || new Date(t.expires_at).getTime() > Date.now()

function Slide({ item, paused, onEnd }: { item: TickerItem; paused: boolean; onEnd: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  const [dim, setDim] = useState<{ cw: number; tw: number } | null>(null)
  const [still, setStill] = useState(false)

  // মাপ নিয়ে তবেই স্ক্রল শুরু হয়
  useLayoutEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setDim({
      cw: boxRef.current?.clientWidth || 0,
      tw: textRef.current?.offsetWidth || 0,
    })
  }, [])

  // যারা অ্যানিমেশন বন্ধ রাখেন, তাদের জন্য স্থির লেখা, ৬ সেকেন্ড পরপর বদলায়
  useEffect(() => {
    if (!still) return
    const id = setTimeout(() => endRef.current(), 6000)
    return () => clearTimeout(id)
  }, [still])

  const external = !!item.url && /^https?:\/\//i.test(item.url)
  const speed = Math.max(20, item.speed || DEFAULT_SPEED)
  const dur = dim ? (dim.cw + dim.tw) / speed : 0

  const vars = {
    '--from': `${dim?.cw ?? 0}px`,
    '--to': `-${dim?.tw ?? 0}px`,
  } as CSSProperties

  const moving: CSSProperties = still
    ? { position: 'relative', paddingLeft: 12, maxWidth: '100%', overflow: 'hidden' }
    : {
        ...vars,
        visibility: dim ? 'visible' : 'hidden',
        animationName: dim ? 'tkScroll' : 'none',
        animationDuration: `${dur}s`,
        animationTimingFunction: 'linear',
        animationDelay: '0.3s',
        animationFillMode: 'both',
        animationPlayState: paused ? 'paused' : 'running',
      }

  return (
    <div
      ref={boxRef}
      className="relative h-10 overflow-hidden"
      style={{ WebkitMaskImage: MASK, maskImage: MASK }}
    >
      <div
        ref={textRef}
        onAnimationEnd={onEnd}
        className="absolute left-0 top-0 flex h-full items-center whitespace-nowrap text-sm font-medium"
        style={moving}
      >
        <span
          className="mr-3 size-1.5 shrink-0 rounded-full bg-crimson"
          style={item.text_color ? { backgroundColor: item.text_color } : undefined}
          aria-hidden="true"
        />
        {item.url ? (
          <a
            href={item.url}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {item.title}
          </a>
        ) : (
          <>
            <span className="mr-2 text-xs opacity-70">[সংক্ষেপ]</span>
            <span>{item.title}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
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
        setIndex(Math.max(0, rows.findIndex((r) => r.id === fresh[0].id)))
        setCycle((c) => c + 1)
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

  // একটার স্ক্রল শেষ হলে পরেরটা
  const next = useCallback(() => {
    setIndex((i) => i + 1)
    setCycle((c) => c + 1)
  }, [])

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
    touchTimer.current = setTimeout(() => setPaused(false), 2000)
  }

  // কোনো লাইভ শিরোনাম না থাকলে বার দেখাবে না
  if (!loaded || total === 0) return null

  const cur = list[idx]

  return (
    <div className="border-b border-border bg-white" role="region" aria-label="সর্বশেষ সংবাদ">
      <style>{CSS}</style>
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-crimson px-3 py-2.5 text-xs font-bold text-white sm:px-4 sm:text-sm">
          <Radio className="size-4 animate-pulse" aria-hidden="true" />
          <span>
            সর্বশেষ <span className="hidden sm:inline">/ LIVE UPDATES</span>
          </span>
        </div>

        <div
          className="min-w-0 flex-1 text-navy transition-colors duration-500"
          style={{ backgroundColor: cur.bg_color || undefined, color: cur.text_color || undefined }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Slide key={`${cur.id}-${cur.updated_at}-${cycle}`} item={cur} paused={paused} onEnd={next} />
        </div>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'অ্যালার্ট শব্দ বন্ধ করুন' : 'অ্যালার্ট শব্দ চালু করুন'}
          className="hidden h-10 w-10 shrink-0 items-center justify-center text-navy/60 hover:text-navy sm:flex"
        >
          {soundOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
    </div>
  )
}
