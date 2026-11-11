'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Volume2,
  VolumeX,
  Radio,
  Siren,
  Flame,
  Zap,
  BellRing,
  Megaphone,
  Newspaper,
  AlertTriangle,
  Sparkles,
  Star,
  Award,
  Clock,
  Compass,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Info,
  Globe,
  FlameKindling,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  getLiveTicker,
  DEFAULT_SPEED,
  getTickerBadgeConfig,
  DEFAULT_TICKER_BADGE_CONFIG,
  bn,
  type TickerItem,
  type TickerBadgeConfig,
} from '@/lib/ticker'

const POLL = 20000
const MASK = 'linear-gradient(to right, transparent 0, #000 30px, #000 calc(100% - 30px), transparent 100%)'

export function renderTickerBadgeIcon(key?: string, className = "size-4 shrink-0") {
  switch (key) {
    case "radio": return <Radio className={className} />
    case "siren": return <Siren className={className} />
    case "flame": return <Flame className={className} />
    case "zap": return <Zap className={className} />
    case "bell": return <BellRing className={className} />
    case "megaphone": return <Megaphone className={className} />
    case "newspaper": return <Newspaper className={className} />
    case "alert-triangle": return <AlertTriangle className={className} />
    case "sparkles": return <Sparkles className={className} />
    case "star": return <Star className={className} />
    case "award": return <Award className={className} />
    case "clock": return <Clock className={className} />
    case "compass": return <Compass className={className} />
    case "check-circle": return <CheckCircle2 className={className} />
    case "shield-alert": return <ShieldAlert className={className} />
    case "activity": return <Activity className={className} />
    case "volume-2": return <Volume2 className={className} />
    case "info": return <Info className={className} />
    case "globe": return <Globe className={className} />
    case "flame-kindling": return <FlameKindling className={className} />
    default: return <Radio className={className} />
  }
}

function Slide({
  item,
  paused,
  badgeConfig,
  cycle,
  onEnd,
}: {
  item: TickerItem
  paused: boolean
  badgeConfig: TickerBadgeConfig
  cycle: number
  onEnd: () => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [dim, setDim] = useState<{ cw: number; tw: number } | null>(null)
  const finishedRef = useRef(false)
  finishedRef.current = false

  useLayoutEffect(() => {
    const cw = boxRef.current?.clientWidth || 360
    const tw = textRef.current?.offsetWidth || 240
    setDim({ cw, tw })
  }, [item.title, item.id])

  const cw = dim?.cw || 360
  const tw = dim?.tw || 240
  const speed = Math.max(20, item.speed || DEFAULT_SPEED)
  const dur = Math.max(3.5, (cw + tw) / speed)

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onEnd()
  }, [onEnd])

  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => {
      handleFinish()
    }, (dur + 0.35) * 1000)

    return () => clearTimeout(timer)
  }, [dur, paused, handleFinish, item.id, cycle])

  const external = !!item.url && /^https?:\/\//i.test(item.url)
  const animKey = `tk_anim_${item.id.replace(/[^a-zA-Z0-9]/g, '_')}_${cycle}`

  return (
    <div
      ref={boxRef}
      className="relative h-10 w-full overflow-hidden"
      style={{ WebkitMaskImage: MASK, maskImage: MASK }}
    >
      <style>{`
        @keyframes ${animKey} {
          0% { transform: translateX(${cw}px); }
          100% { transform: translateX(-${tw + 20}px); }
        }
        .${animKey} {
          animation: ${animKey} ${dur}s linear 0.1s both;
          animation-play-state: ${paused ? 'paused' : 'running'};
        }
      `}</style>

      <div
        ref={textRef}
        onAnimationEnd={handleFinish}
        className={`absolute left-0 top-0 flex h-full items-center whitespace-nowrap text-xs sm:text-sm font-semibold text-foreground ${animKey}`}
      >
        <span
          className="mr-2.5 size-2 shrink-0 rounded-full bg-crimson"
          aria-hidden="true"
        />

        {item.url ? (
          external ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand hover:underline transition-colors"
            >
              {item.title}
            </a>
          ) : (
            <Link
              href={item.url}
              className="hover:text-brand hover:underline transition-colors"
            >
              {item.title}
            </Link>
          )
        ) : (
          <div className="flex items-center gap-2">
            {badgeConfig.show_brief && badgeConfig.brief_text && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 bg-crimson/10 text-crimson border border-crimson/20">
                {badgeConfig.brief_text}
              </span>
            )}
            <span>{item.title}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([])
  const [badgeConfig, setBadgeConfig] = useState<TickerBadgeConfig>(DEFAULT_TICKER_BADGE_CONFIG)
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [paused, setPaused] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const audio = useRef<AudioContext | null>(null)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const list = items.filter((t) => t.is_active !== false)
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
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.45)
    } catch {}
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [rows, cfg] = await Promise.all([
        getLiveTicker(),
        getTickerBadgeConfig(),
      ])
      if (cfg) setBadgeConfig(cfg)
      if (rows && rows.length > 0) {
        setItems(rows)
        setLoaded(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    loadData()
    const id = setInterval(loadData, POLL)
    return () => clearInterval(id)
  }, [loadData])

  const nextSlide = useCallback(() => {
    if (total <= 0) return
    setIndex((prev) => (prev + 1) % total)
    setCycle((c) => c + 1)
  }, [total])

  const prevSlide = useCallback(() => {
    if (total <= 0) return
    setIndex((prev) => (prev - 1 + total) % total)
    setCycle((c) => c + 1)
  }, [total])

  function toggleSound() {
    if (!soundOn) {
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!audio.current) audio.current = new AC()
        void audio.current.resume()
      } catch {}
      setSoundOn(true)
      ping()
    } else {
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

  if (!loaded || total === 0) return null

  const cur = list[idx]

  return (
    <div className="relative z-20 mx-auto max-w-7xl px-3 sm:px-4 py-2" role="region" aria-label="সর্বশেষ সংবাদ">
      <div className="flex items-center rounded-2xl border border-border bg-card/90 shadow-xs p-1">
        
        {/* ব্রেকিং বেজ */}
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl bg-crimson shadow-2xs">
          <span>{renderTickerBadgeIcon(badgeConfig.icon, 'size-3.5 shrink-0')}</span>
          <span>{badgeConfig.badge_text || 'সর্বশেষ'}</span>
        </div>

        {/* স্ক্রলিং সংবাদ বক্স */}
        <div
          className="min-w-0 flex-1 overflow-hidden px-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Slide
            key={`${cur.id}-${cycle}`}
            item={cur}
            paused={paused}
            badgeConfig={badgeConfig}
            cycle={cycle}
            onEnd={nextSlide}
          />
        </div>

        {/* অ্যারো বাটন */}
        {total > 1 && (
          <div className="flex items-center gap-1 px-1.5 text-xs select-none shrink-0 font-medium text-muted-foreground">
            <button
              type="button"
              onClick={prevSlide}
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted transition cursor-pointer"
              title="আগের ব্রেকিং"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            
            <span className="tabular-nums text-[11px] px-1 font-semibold">
              {bn(idx + 1)}/{bn(total)}
            </span>

            <button
              type="button"
              onClick={nextSlide}
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted transition cursor-pointer"
              title="পরের ব্রেকিং"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {/* অডিও অ্যালার্ট বাটন */}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'অ্যালার্ট বন্ধ' : 'অ্যালার্ট চালু'}
          className="hidden size-7 sm:flex shrink-0 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground cursor-pointer mr-1 transition"
        >
          {soundOn ? <Volume2 className="size-3.5 text-brand" /> : <VolumeX className="size-3.5 opacity-40" />}
        </button>
      </div>
    </div>
  )
}
