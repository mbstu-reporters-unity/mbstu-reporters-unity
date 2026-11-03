'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { getHeroSlides, getHeroSettings } from '@/lib/hero'
import type { HeroSlide, HeroSettings, SubMediaItem } from '@/lib/hero'

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

function hexToRgba(hex: any, opacity: any) {
  const alpha = (Number(opacity) || 60) / 100
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0, 0, 0, ${alpha})`
  try {
    let c = hex.substring(1)
    if (c.length === 3) c = c.split('').map((x) => x + x).join('')
    const num = parseInt(c, 16)
    if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
  } catch {
    return `rgba(0, 0, 0, ${alpha})`
  }
}

// সামাজিক যোগাযোগ মাধ্যম ও ইউটিউব এম্বেড জেনারেটর
function getVideoEmbed(url: string | null | undefined) {
  if (!url || typeof url !== 'string') return null
  try {
    // YouTube
    const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
    if (ytMatch && ytMatch[2]?.length === 11) {
      return {
        type: 'youtube',
        src: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&controls=1`,
      }
    }
    // Facebook Video
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return {
        type: 'facebook',
        src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
      }
    }
  } catch {}
  return null
}

const bn = (n: number) => n.toLocaleString('bn-BD')

export function HeroCarousel() {
  const [posts, setPosts] = useState<HeroSlide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [postIdx, setPostIdx] = useState(0)
  const [subIdx, setSubIdx] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [dragging, setDragging] = useState(false)

  const startRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    Promise.all([getHeroSlides(), getHeroSettings()]).then(([data, s]) => {
      const active = data.filter((d) => d.is_active && (!d.expires_at || new Date(d.expires_at) > new Date()))
      setPosts(active)
      setSettings(s)
    })
  }, [])

  const currentPost = posts[postIdx] || null
  const mediaItems: SubMediaItem[] = (currentPost?.media_items && currentPost.media_items.length > 0)
    ? currentPost.media_items
    : [{ id: '1', type: 'color', color: '#0f172a' }]

  const curSubMedia = mediaItems[subIdx] || mediaItems[0]
  const isVideo = curSubMedia.type === 'video'
  const postDuration = currentPost?.slide_duration || settings?.slide_speed || 5000
  const isAutoplayDisabled = postDuration <= 0

  // সাব-স্লাইড পরিবর্তন ও পোস্ট শেষ হলে পরবর্তী পোস্টে যাওয়া
  const nextStep = useCallback(() => {
    if (mediaItems.length > 1 && subIdx < mediaItems.length - 1) {
      setSubIdx((prev) => prev + 1)
    } else {
      setSubIdx(0)
      if (posts.length > 0) {
        setPostIdx((prev) => (prev + 1) % posts.length)
      }
    }
  }, [mediaItems.length, subIdx, posts.length])

  // আগের সাব-স্লাইড
  const prevStep = useCallback(() => {
    if (subIdx > 0) {
      setSubIdx((prev) => prev - 1)
    } else if (posts.length > 1) {
      const prevP = (postIdx - 1 + posts.length) % posts.length
      setPostIdx(prevP)
      const prevMedia = posts[prevP]?.media_items || []
      setSubIdx(Math.max(0, prevMedia.length - 1))
    }
  }, [subIdx, posts, postIdx])

  // সোয়াইপ পুশ (Swipe / Drag) নেভিগেশন (পোস্ট পরিবর্তন)
  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('iframe, video, button, a, input')) return
    startRef.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    const st = startRef.current
    startRef.current = null
    setDragging(false)
    if (!st || posts.length < 2) return
    const dx = e.clientX - st.x
    const dy = e.clientY - st.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        // সোয়াইপ বামে -> পরবর্তী পোস্ট
        setPostIdx((p) => (p + 1) % posts.length)
        setSubIdx(0)
      } else {
        // সোয়াইপ ডানে -> আগের পোস্ট
        setPostIdx((p) => (p - 1 + posts.length) % posts.length)
        setSubIdx(0)
      }
    }
  }

  const animSec = Math.max(0.4, 3.2 - ((currentPost?.text_effect_speed || 50) / 100) * 2.8).toFixed(2)

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* ৩০টি টেক্সট অ্যানিমেশনের কিফ্রেম স্টাইল */}
      <style>{`
        @keyframes heroProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes anim_zoom-pop { 0% { transform: scale(0.65); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes anim_neon-pulse { 0%, 100% { text-shadow: 0 0 4px #fff, 0 0 15px #38bdf8; } 50% { text-shadow: 0 0 2px #fff; } }
        @keyframes anim_bounce-in { 0% { transform: translateY(-40px); opacity: 0; } 60% { transform: translateY(8px); } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes anim_flip-x { 0% { transform: perspective(400px) rotateX(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateX(0deg); opacity: 1; } }
        @keyframes anim_flip-y { 0% { transform: perspective(400px) rotateY(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateY(0deg); opacity: 1; } }
        @keyframes anim_cyber-glitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-3px, 2px); } 40% { transform: translate(3px, -2px); } }
        @keyframes anim_smoke-fade { 0% { filter: blur(12px); opacity: 0; } 100% { filter: blur(0); opacity: 1; } }
        @keyframes anim_letter-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes anim_slide-left { 0% { transform: translateX(60px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes anim_slide-right { 0% { transform: translateX(-60px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes anim_rotate-drop { 0% { transform: rotate(-10deg) translateY(-25px); opacity: 0; } 100% { transform: rotate(0) translateY(0); opacity: 1; } }
        @keyframes anim_flash-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes anim_shake-alert { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes anim_rainbow-shift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
        @keyframes anim_tracking-expand { 0% { letter-spacing: -3px; opacity: 0; } 100% { letter-spacing: normal; opacity: 1; } }
        @keyframes anim_golden-shimmer { 0%, 100% { filter: drop-shadow(0 0 2px #eab308); } 50% { filter: drop-shadow(0 0 14px #facc15) brightness(1.2); } }
        @keyframes anim_twist-3d { 0% { transform: rotate(-10deg) scale(0.85); opacity: 0; } 100% { transform: rotate(0) scale(1); opacity: 1; } }
        @keyframes anim_smooth-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes anim_swing-in { 0% { transform: rotateZ(-12deg); opacity: 0; } 100% { transform: rotateZ(0deg); opacity: 1; } }
        @keyframes anim_spotlight { 0% { filter: brightness(0.2); } 100% { filter: brightness(1); } }
        @keyframes anim_rubber-band { 0% { transform: scale(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 100% { transform: scale(1); } }
        @keyframes anim_heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes anim_jello { 0%, 100% { transform: skewX(0deg) skewY(0deg); } 50% { transform: skewX(-4deg) skewY(-4deg); } }
        @keyframes anim_pulse-expand { 0% { transform: scale(0.9); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
        @keyframes anim_tilt-in { 0% { transform: perspective(300px) rotateY(15deg); opacity: 0; } 100% { transform: perspective(300px) rotateY(0); opacity: 1; } }
        @keyframes anim_gradient-flow { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
      `}</style>

      {/* ১. ব্রেকিং মোড (অন থাকলে উপরে থাকবে, অফ থাকলে স্বয়ংক্রিয়ভাবে অদৃশ্য হবে এবং স্লাইডার উপরে উঠবে) */}
      {settings?.breaking_on && (
        <div
          className="relative w-full py-6 px-4 sm:px-8 border-b border-red-900/60 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${settings.breaking_bg_color || '#881337'}, ${settings.breaking_bg_gradient || '#0f172a'})`,
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-xs font-bold tracking-wide">
                <span className="size-2 rounded-full bg-white animate-ping" />
                ব্রেকিং নিউজ
              </span>
              {settings.breaking_title && <h2 className="text-lg sm:text-xl font-bold text-white">{settings.breaking_title}</h2>}
              {settings.breaking_text && <p className="text-xs sm:text-sm text-slate-200">{settings.breaking_text}</p>}
            </div>
            {settings.breaking_link && (
              <a
                href={settings.breaking_link}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-red-700 hover:bg-red-600 hover:text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                {settings.breaking_btn_text || 'বিস্তারিত'} <ArrowRight className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ২. মূল হিরো স্লাইডার সেকশন */}
      {posts.length > 0 && currentPost && (
        <div
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
          className="relative h-[480px] sm:h-[540px] lg:h-[600px] w-full overflow-hidden select-none bg-black"
        >
          {/* স্লাইড ব্যাকগ্রাউন্ড (কালার / ছবি / ভিডিও) */}
          <div className="absolute inset-0">
            {curSubMedia.type === 'color' && (
              <div
                className="w-full h-full transition-colors duration-700"
                style={{
                  background: curSubMedia.gradient || curSubMedia.color || '#0f172a',
                }}
              />
            )}

            {curSubMedia.type === 'image' && (
              <div className="relative w-full h-full flex items-center justify-center bg-black/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={curSubMedia.url || '/images/hero-1.png'}
                  alt=""
                  className={cn(
                    'w-full h-full transition-all duration-700',
                    currentPost.fit_mode === 'cover' ? 'object-cover' : 'object-contain'
                  )}
                />
              </div>
            )}

            {curSubMedia.type === 'video' && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {(() => {
                  const embed = getVideoEmbed(curSubMedia.url)
                  if (embed) {
                    return (
                      <iframe
                        src={embed.src}
                        className="w-full h-full max-h-[600px] aspect-video border-0 pointer-events-auto"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded Video"
                      />
                    )
                  }
                  return (
                    <video
                      src={curSubMedia.url}
                      controls
                      playsInline
                      className="w-full h-full max-h-[600px] object-contain pointer-events-auto"
                    />
                  )
                })()}
              </div>
            )}

            {/* ঐচ্ছিক লিঙ্ক ক্লিক গার্ড (যদি কোনো নির্দিষ্ট মিডিয়ার নিজস্ব লিঙ্ক থাকে) */}
            {curSubMedia.link && !isVideo && (
              <a
                href={curSubMedia.link}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-0 cursor-pointer"
                aria-label="মিডিয়া লিঙ্ক দেখুন"
              />
            )}
          </div>

          {/* টেক্সট ও কাস্টমাইজড কার্ড ওভারলে */}
          <div
            className={cn(
              'absolute inset-0 p-4 sm:p-10 pointer-events-none flex z-10',
              currentPost.content_pos_v === 'top' ? 'items-start' : currentPost.content_pos_v === 'center' ? 'items-center' : 'items-end pb-16 sm:pb-20',
              currentPost.content_pos_h === 'right' ? 'justify-end' : currentPost.content_pos_h === 'center' ? 'justify-center' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'pointer-events-auto max-w-full transition-all duration-300',
                currentPost.show_card_bg ? 'border border-white/20 shadow-2xl' : '',
                currentPost.text_align === 'center' ? 'text-center' : currentPost.text_align === 'right' ? 'text-right' : 'text-left'
              )}
              style={{
                width: `${currentPost.card_width_pct || 90}%`,
                padding: currentPost.show_card_bg ? `${currentPost.card_padding_val || 20}px` : undefined,
                borderRadius: currentPost.show_card_bg ? `${Math.round(((currentPost.card_radius_pct || 20) / 100) * 40)}px` : undefined,
                backgroundColor: currentPost.show_card_bg ? hexToRgba(currentPost.card_bg_color || '#000000', currentPost.card_opacity || 60) : 'transparent',
                backdropFilter: currentPost.show_card_bg ? `blur(${currentPost.card_blur || 12}px)` : undefined,
              }}
            >
              {currentPost.category && (
                <span
                  className="inline-block px-2.5 py-1 rounded text-xs font-semibold mb-2"
                  style={{
                    backgroundColor: currentPost.badge_color || '#EAB308',
                    color: currentPost.badge_text_color || '#0f172a',
                  }}
                >
                  {currentPost.category}
                </span>
              )}

              {currentPost.title && (
                <h2
                  key={currentPost.id + subIdx + currentPost.title}
                  className={cn(
                    'font-bold leading-snug drop-shadow-md',
                    currentPost.title_size === '3xl' ? 'text-2xl sm:text-4xl' : currentPost.title_size === '2xl' ? 'text-xl sm:text-3xl' : 'text-lg sm:text-xl'
                  )}
                  style={{
                    color: currentPost.title_color || '#ffffff',
                    fontFamily: currentPost.title_font || undefined,
                    animation: `anim_${currentPost.text_effect || 'fade-up'} ${animSec}s ease-in-out forwards`,
                  }}
                >
                  <span
                    style={{
                      backgroundColor: currentPost.title_bg_color || undefined,
                      padding: currentPost.title_bg_color ? '2px 8px' : undefined,
                      borderRadius: '4px',
                    }}
                  >
                    {currentPost.title}
                  </span>
                </h2>
              )}

              {currentPost.summary && (
                <p
                  className="mt-2 text-xs sm:text-sm line-clamp-2 drop-shadow"
                  style={{
                    color: currentPost.summary_color || '#e2e8f0',
                    fontFamily: currentPost.summary_font || undefined,
                  }}
                >
                  {currentPost.summary}
                </p>
              )}

              {currentPost.link_url && (
                <div className="mt-3.5">
                  <a
                    href={currentPost.link_url}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg hover:opacity-90 transition-all"
                    style={{
                      backgroundColor: currentPost.btn_bg_color || '#15803d',
                      color: currentPost.btn_color || '#ffffff',
                    }}
                  >
                    {currentPost.button_text || 'বিস্তারিত'} <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* কন্ট্রোল বার: সাব-স্লাইড ইন্ডিকেটর ও পোস্ট নেভিগেশন */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <Layers className="size-3.5 text-gold" />
            <span className="text-xs text-white font-medium">
              পোস্ট {bn(postIdx + 1)}/{bn(posts.length)} · স্লাইড {bn(subIdx + 1)}/{bn(mediaItems.length)}
            </span>
          </div>

          {/* নেভিগেশন বোতাম (স্লাইড ও পোস্ট নেভিগেট) */}
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
            {!isAutoplayDisabled && !isVideo && (
              <button
                onClick={() => setUserPaused((p) => !p)}
                className="size-9 rounded-full bg-black/50 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer"
                aria-label="Pause or Play"
              >
                {userPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            )}
            <button
              onClick={prevStep}
              className="size-9 rounded-full bg-black/50 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer"
              aria-label="আগের স্লাইড"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={nextStep}
              className="size-9 rounded-full bg-black/50 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer"
              aria-label="পরের স্লাইড"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* পোস্ট বুলেটিং ইন্ডিকেটর */}
          <div className="absolute bottom-6 left-6 z-20 flex gap-1.5">
            {posts.map((_, pI) => (
              <button
                key={pI}
                onClick={() => {
                  setPostIdx(pI)
                  setSubIdx(0)
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all cursor-pointer',
                  pI === postIdx ? 'w-6 bg-gold' : 'w-2 bg-white/40'
                )}
                aria-label={`পোস্ট ${pI + 1}`}
              />
            ))}
          </div>

          {/* প্রোগ্রেস বার (সাব-স্লাইডের সময় নিয়ন্ত্রণ) */}
          {!userPaused && !isVideo && !isAutoplayDisabled && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30">
              <div
                key={`${postIdx}-${subIdx}`}
                onAnimationEnd={nextStep}
                className="h-full bg-gold origin-left"
                style={{
                  animation: `heroProgress ${postDuration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HeroCarousel
