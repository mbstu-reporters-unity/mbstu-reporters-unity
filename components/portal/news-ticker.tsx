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

// দুই প্রান্তে লেখা মসৃণভাবে ফেড ইন / ফেড আউট
const MASK = 'linear-gradient(to right, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%)'

// ২০টি আইকন রেন্ডারার
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

// একাধিক টিকার স্ক্রলিং ও সাইক্লিং ইঞ্জিন
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

  // সেফটি টাইমার: অ্যানিমেশন শেষ হওয়া মাত্রই পরের টিকারে নিয়ে যাবে
  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => {
      handleFinish()
    }, (dur + 0.35) * 1000)

    return () => clearTimeout(timer)
  }, [dur, paused, handleFinish, item.id, cycle])

  const external = !!item.url && /^https?:\/\//i.test(item.url)
  const animKey = `tk_anim_${item.id.replace(/[^a-zA-Z0-9]/g, '_')}_${cycle}`

  const briefAnimClass = badgeConfig.brief_animation && badgeConfig.brief_animation !== "none"
    ? `anim_${badgeConfig.brief_animation.replace(/-/g, '_')}`
    : ""

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
        className={`absolute left-0 top-0 flex h-full items-center whitespace-nowrap text-sm font-medium ${animKey}`}
      >
        <span
          className="mr-3 size-2 shrink-0 rounded-full"
          style={{ backgroundColor: item.text_color || badgeConfig.bg_color || '#c8102e' }}
          aria-hidden="true"
        />

        {item.url ? (
          external ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {item.title}
            </a>
          ) : (
            <Link
              href={item.url}
              className="hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {item.title}
            </Link>
          )
        ) : (
          <div className="flex items-center gap-1.5">
            {badgeConfig.show_brief && badgeConfig.brief_text && (
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-bold shrink-0 shadow-xs ${briefAnimClass}`}
                style={{
                  color: badgeConfig.brief_color || '#c8102e',
                  backgroundColor: badgeConfig.brief_bg_color || '#fee2e2',
                }}
              >
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
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02)
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

  const iconAnimClass = badgeConfig.icon_animation && badgeConfig.icon_animation !== "none"
    ? `anim_${badgeConfig.icon_animation.replace(/-/g, '_')}`
    : ""

  const textAnimClass = badgeConfig.text_animation && badgeConfig.text_animation !== "none"
    ? `anim_${badgeConfig.text_animation.replace(/-/g, '_')}`
    : ""

  const bgAnimClass = badgeConfig.bg_animation && badgeConfig.bg_animation !== "none"
    ? `anim_${badgeConfig.bg_animation.replace(/-/g, '_')}`
    : ""

  const badgeBg = badgeConfig.bg_color2
    ? `linear-gradient(135deg, ${badgeConfig.bg_color}, ${badgeConfig.bg_color2})`
    : badgeConfig.bg_color

  return (
    <div className="border-b border-border bg-white" role="region" aria-label="সর্বশেষ সংবাদ">
      <div className="mx-auto flex max-w-7xl items-stretch">
        
        {/* কাস্টমাইজেবল ব্রেকিং বেজ */}
        <div
          className={`relative z-10 flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm select-none ${bgAnimClass}`}
          style={{
            background: badgeBg,
            color: badgeConfig.text_color || '#ffffff',
          }}
        >
          <span className={iconAnimClass}>
            {renderTickerBadgeIcon(badgeConfig.icon, 'size-3.5 sm:size-4 shrink-0')}
          </span>
          <span
            className={`${textAnimClass} flex items-center gap-1 leading-none font-bold`}
            style={{ color: badgeConfig.text_color || '#ffffff' }}
          >
            <span>{badgeConfig.badge_text || 'সর্বশেষ'}</span>
            {badgeConfig.show_subtext && badgeConfig.badge_subtext && (
              <span className="hidden md:inline font-semibold opacity-90 text-[11px] sm:text-xs">
                / {badgeConfig.badge_subtext}
              </span>
            )}
          </span>
        </div>

        {/* স্ক্রলিং সংবাদ বক্স */}
        <div
          className="min-w-0 flex-1 text-navy transition-colors duration-500 overflow-hidden"
          style={{ backgroundColor: cur.bg_color || undefined, color: cur.text_color || undefined }}
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

        {/* মোবাইল ও ডেস্কটপ উভয়ের জন্য নেভিগেশন কাউন্টার ও কন্ট্রোল */}
        {total > 1 && (
          <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 border-l border-border/60 text-xs text-navy/70 select-none shrink-0 bg-white">
            <button
              type="button"
              onClick={prevSlide}
              className="p-1 hover:bg-gray-100 rounded-md cursor-pointer active:scale-95 transition-transform"
              title="আগের ব্রেকিং"
              aria-label="Previous Breaking News"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="font-bold tabular-nums text-[10px] sm:text-[11px] px-0.5">
              {bn(idx + 1)}/{bn(total)}
            </span>
            <button
              type="button"
              onClick={nextSlide}
              className="p-1 hover:bg-gray-100 rounded-md cursor-pointer active:scale-95 transition-transform"
              title="পরের ব্রেকিং"
              aria-label="Next Breaking News"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* অডিও অ্যালার্ট টগল */}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'অ্যালার্ট শব্দ বন্ধ করুন' : 'অ্যালার্ট শব্দ চালু করুন'}
          className="hidden h-10 w-10 shrink-0 items-center justify-center text-navy/60 hover:text-navy sm:flex cursor-pointer border-l border-border/60"
        >
          {soundOn ? <Volume2 className="size-4 text-emerald-600" /> : <VolumeX className="size-4 opacity-50" />}
        </button>
      </div>
    </div>
  )
}
