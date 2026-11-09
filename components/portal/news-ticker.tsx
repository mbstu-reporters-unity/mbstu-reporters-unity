'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
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
} from 'lucide-react'
import {
  getLiveTicker,
  DEFAULT_SPEED,
  getTickerBadgeConfig,
  DEFAULT_TICKER_BADGE_CONFIG,
  type TickerItem,
  type TickerBadgeConfig,
} from '@/lib/ticker'

const POLL = 20000

const MASK = 'linear-gradient(to right, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%)'

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

const CSS_ANIMATIONS = `
@keyframes tkScroll{from{transform:translateX(var(--from))}to{transform:translateX(var(--to))}}

@keyframes anim_pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.18); opacity: 0.82; } }
.anim_pulse { animation: anim_pulse 1.4s ease-in-out infinite; display: inline-flex; }

@keyframes anim_ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.6); opacity: 0; } }
.anim_ping { animation: anim_ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; display: inline-flex; }

@keyframes anim_bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.anim_bounce { animation: anim_bounce 1.2s ease-in-out infinite; display: inline-flex; }

@keyframes anim_heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.22); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
.anim_heartbeat { animation: anim_heartbeat 1.5s ease-in-out infinite; display: inline-flex; }

@keyframes anim_neon { 0%, 100% { filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 8px #facc15); } 50% { filter: drop-shadow(0 0 6px #fff) drop-shadow(0 0 16px #ef4444); } }
.anim_neon { animation: anim_neon 1.6s ease-in-out infinite; display: inline-flex; }

@keyframes anim_flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0.2; } }
.anim_flash { animation: anim_flash 1.3s ease-in-out infinite; display: inline-flex; }

@keyframes anim_shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-3px); } 40%, 80% { transform: translateX(3px); } }
.anim_shake { animation: anim_shake 0.8s ease-in-out infinite; display: inline-flex; }

@keyframes anim_wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-12deg); } 75% { transform: rotate(12deg); } }
.anim_wiggle { animation: anim_wiggle 1.2s ease-in-out infinite; display: inline-flex; }

@keyframes anim_rubber { 0%, 100% { transform: scale(1, 1); } 30% { transform: scale(1.25, 0.75); } 40% { transform: scale(0.75, 1.25); } 60% { transform: scale(1.15, 0.85); } }
.anim_rubber { animation: anim_rubber 1.5s ease-in-out infinite; display: inline-flex; }

@keyframes anim_swing { 0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(12deg); } 40% { transform: rotate(-8deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } }
.anim_swing { animation: anim_swing 1.8s ease-in-out infinite; transform-origin: top center; display: inline-flex; }

@keyframes anim_jello { 0%, 100% { transform: scale3d(1, 1, 1); } 30% { transform: scale3d(1.2, 0.8, 1); } 40% { transform: scale3d(0.8, 1.2, 1); } 50% { transform: scale3d(1.1, 0.9, 1); } 65% { transform: scale3d(0.95, 1.05, 1); } }
.anim_jello { animation: anim_jello 1.6s ease-in-out infinite; display: inline-flex; }

@keyframes anim_float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.anim_float { animation: anim_float 2s ease-in-out infinite; display: inline-flex; }

@keyframes anim_glow_expand { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.06); filter: brightness(1.35); } }
.anim_glow_expand { animation: anim_glow_expand 1.8s ease-in-out infinite; display: inline-flex; }

@keyframes anim_flip_x { 0%, 100% { transform: perspective(400px) rotateX(0deg); } 50% { transform: perspective(400px) rotateX(180deg); } }
.anim_flip_x { animation: anim_flip_x 2.5s ease-in-out infinite; display: inline-flex; }

@keyframes anim_flip_y { 0%, 100% { transform: perspective(400px) rotateY(0deg); } 50% { transform: perspective(400px) rotateY(180deg); } }
.anim_flip_y { animation: anim_flip_y 2.5s ease-in-out infinite; display: inline-flex; }

@keyframes anim_glitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-2px, 1px); } 40% { transform: translate(2px, -1px); } 60% { transform: translate(-1px, -1px); } 80% { transform: translate(1px, 1px); } }
.anim_glitch { animation: anim_glitch 2s infinite; display: inline-flex; }

@keyframes anim_breathe { 0%, 100% { transform: scale(0.97); opacity: 0.85; } 50% { transform: scale(1.04); opacity: 1; } }
.anim_breathe { animation: anim_breathe 2.4s ease-in-out infinite; display: inline-flex; }

@keyframes anim_zoom { 0%, 100% { transform: scale(0.92); } 50% { transform: scale(1.1); } }
.anim_zoom { animation: anim_zoom 1.6s ease-in-out infinite; display: inline-flex; }

@keyframes anim_spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.anim_spin { animation: anim_spin 3s linear infinite; display: inline-flex; }

@keyframes anim_tilt { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
.anim_tilt { animation: anim_tilt 1.6s ease-in-out infinite; display: inline-flex; }

@keyframes anim_tada { 0%, 100% { transform: scale(1) rotate(0); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } }
.anim_tada { animation: anim_tada 2s ease-in-out infinite; display: inline-flex; }

@keyframes anim_wobble { 0%, 100% { transform: translateX(0%); } 15% { transform: translateX(-8%) rotate(-4deg); } 30% { transform: translateX(6%) rotate(3deg); } 45% { transform: translateX(-5%) rotate(-2deg); } 60% { transform: translateX(3%) rotate(1deg); } }
.anim_wobble { animation: anim_wobble 2s ease-in-out infinite; display: inline-flex; }

@keyframes anim_shiver { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(1px, -1px); } 50% { transform: translate(-1px, 1px); } 75% { transform: translate(-1px, -1px); } }
.anim_shiver { animation: anim_shiver 0.7s ease-in-out infinite; display: inline-flex; }

@keyframes anim_pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.22); } }
.anim_pop { animation: anim_pop 1.3s ease-in-out infinite; display: inline-flex; }

@keyframes anim_ripple { 0% { transform: scale(0.96); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.75; } 100% { transform: scale(0.96); opacity: 1; } }
.anim_ripple { animation: anim_ripple 1.8s ease-in-out infinite; display: inline-flex; }

@keyframes anim_beacon { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); } 50% { opacity: 0.4; filter: drop-shadow(0 0 1px currentColor); } }
.anim_beacon { animation: anim_beacon 1.4s ease-in-out infinite; display: inline-flex; }

@keyframes anim_electric { 0%, 100% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(90deg) brightness(1.4); } }
.anim_electric { animation: anim_electric 2s linear infinite; display: inline-flex; }

@keyframes anim_slide_shift { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
.anim_slide_shift { animation: anim_slide_shift 1.5s ease-in-out infinite; display: inline-flex; }

@keyframes anim_rotate_slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.anim_rotate_slow { animation: anim_rotate_slow 6s linear infinite; display: inline-flex; }

@keyframes anim_radar { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.6); } 70% { box-shadow: 0 0 0 8px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
.anim_radar { animation: anim_radar 1.5s infinite; display: inline-flex; border-radius: 9999px; }

@keyframes bg_pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.3) contrast(1.1); } }
.anim_bg_pulse { animation: bg_pulse 2s ease-in-out infinite; }

@keyframes bg_shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.anim_bg_shimmer {
  background-size: 200% 100% !important;
  background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%) !important;
  animation: bg_shimmer 2.5s infinite;
}

@keyframes bg_gradient_shift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
.anim_bg_gradient_shift { animation: bg_gradient_shift 6s linear infinite; }

@keyframes bg_glow { 0%, 100% { box-shadow: 0 0 4px rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 16px rgba(255,255,255,0.7); } }
.anim_bg_glow { animation: bg_glow 2s ease-in-out infinite; }

@keyframes bg_breathe { 0%, 100% { opacity: 0.9; } 50% { opacity: 1; filter: brightness(1.15); } }
.anim_bg_breathe { animation: bg_breathe 2.5s ease-in-out infinite; }

@keyframes bg_flame { 0%, 100% { filter: brightness(1) saturate(1); } 50% { filter: brightness(1.25) saturate(1.4); } }
.anim_bg_flame { animation: bg_flame 1.5s ease-in-out infinite; }

@keyframes bg_electric { 0%, 100% { filter: brightness(1); } 10%, 30% { filter: brightness(1.4) drop-shadow(0 0 6px #67e8f9); } 20%, 40% { filter: brightness(0.95); } }
.anim_bg_electric { animation: bg_electric 3s infinite; }
`

const alive = (t: TickerItem) => !t.expires_at || new Date(t.expires_at).getTime() > Date.now()

function Slide({
  item,
  paused,
  badgeConfig,
  onEnd,
}: {
  item: TickerItem
  paused: boolean
  badgeConfig: TickerBadgeConfig
  onEnd: () => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  const [dim, setDim] = useState<{ cw: number; tw: number } | null>(null)
  const [still, setStill] = useState(false)

  useLayoutEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setDim({
      cw: boxRef.current?.clientWidth || 0,
      tw: textRef.current?.offsetWidth || 0,
    })
  }, [item.title])

  useEffect(() => {
    if (!still) return
    const id = setTimeout(() => endRef.current(), 7000)
    return () => clearTimeout(id)
  }, [still])

  const external = !!item.url && /^https?:\/\//i.test(item.url)
  const speed = Math.max(20, item.speed || DEFAULT_SPEED)
  const dur = dim ? Math.max(4, (dim.cw + dim.tw) / speed) : 0

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
        animationDelay: '0.2s',
        animationFillMode: 'both',
        animationPlayState: paused ? 'paused' : 'running',
      }

  const briefAnimClass = badgeConfig.brief_animation && badgeConfig.brief_animation !== "none"
    ? `anim_${badgeConfig.brief_animation}`
    : ""

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
          className="mr-3 size-2 shrink-0 rounded-full"
          style={{ backgroundColor: item.text_color || badgeConfig.bg_color || '#c8102e' }}
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

  const loadData = useCallback(async () => {
    try {
      const [rows, cfg] = await Promise.all([
        getLiveTicker(),
        getTickerBadgeConfig(),
      ])
      if (cfg) setBadgeConfig(cfg)
      if (!rows) return

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
    } catch {}
  }, [ping])

  useEffect(() => {
    loadData()
    const id = setInterval(loadData, POLL)
    const vis = () => {
      if (document.visibilityState === 'visible') loadData()
    }
    document.addEventListener('visibilitychange', vis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [loadData])

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
      <style>{CSS_ANIMATIONS}</style>
      <div className="mx-auto flex max-w-7xl items-stretch">
        
        {/* কাস্টমাইজেবল ব্রেকিং বেজ */}
        <div
          className={`relative z-10 flex shrink-0 items-center gap-2 px-3 py-2.5 text-xs font-bold transition-all sm:px-4 sm:text-sm select-none ${bgAnimClass}`}
          style={{
            background: badgeBg,
            color: badgeConfig.text_color || '#ffffff',
          }}
        >
          <span className={iconAnimClass}>
            {renderTickerBadgeIcon(badgeConfig.icon, 'size-4 shrink-0')}
          </span>
          <span
            className={`${textAnimClass} flex items-center gap-1 leading-none font-bold`}
            style={{ color: badgeConfig.text_color || '#ffffff' }}
          >
            <span>{badgeConfig.badge_text || 'সর্বশেষ'}</span>
            {badgeConfig.show_subtext && badgeConfig.badge_subtext && (
              <span className="hidden sm:inline font-semibold opacity-90 text-[11px] sm:text-xs">
                / {badgeConfig.badge_subtext}
              </span>
            )}
          </span>
        </div>

        {/* স্ক্রলিং সংবাদ বক্স */}
        <div
          className="min-w-0 flex-1 text-navy transition-colors duration-500"
          style={{ backgroundColor: cur.bg_color || undefined, color: cur.text_color || undefined }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Slide
            key={`${cur.id}-${cur.updated_at}-${cycle}`}
            item={cur}
            paused={paused}
            badgeConfig={badgeConfig}
            onEnd={next}
          />
        </div>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'অ্যালার্ট শব্দ বন্ধ করুন' : 'অ্যালার্ট শব্দ চালু করুন'}
          className="hidden h-10 w-10 shrink-0 items-center justify-center text-navy/60 hover:text-navy sm:flex cursor-pointer"
        >
          {soundOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
    </div>
  )
}
