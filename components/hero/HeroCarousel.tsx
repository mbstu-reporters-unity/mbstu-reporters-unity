'use client'

import React, { useEffect, useState } from 'react'
import { getHeroSlides, getHeroSettings } from '@/lib/hero'
import type { HeroSlide, HeroSettings } from '@/lib/hero'
import { HeroMediaRenderer } from './HeroMediaRenderer'
import { HeroBreakingBanner } from './HeroBreakingBanner'
import { useHeroSlider } from '@/hooks/useHeroSlider'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Layers,
  ExternalLink,
} from 'lucide-react'

// কালার ও অপাসিটি কনভার্টার (ক্র্যাশ-প্রুফ)
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

const bn = (n: number) => n.toLocaleString('bn-BD')

export function HeroCarousel() {
  const [posts, setPosts] = useState<HeroSlide[]>([])
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loaded, setLoaded] = useState(false)

  // ডেটাবেজ থেকে ডাটা লোড করা
  useEffect(() => {
    Promise.all([getHeroSlides(), getHeroSettings()])
      .then(([slidesData, settingsData]) => {
        // শুধুমাত্র অ্যাক্টিভ এবং মেয়াদ থাকা পোস্টগুলো ফিল্টার করা
        const activeSlides = (slidesData || []).filter(
          (s) => s.is_active && (!s.expires_at || new Date(s.expires_at) > new Date())
        )
        setPosts(activeSlides)
        setSettings(settingsData)
        setLoaded(true)
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [])

  // সোয়াইপ ও স্লাইড লজিক হুক
  const {
    postIdx,
    subIdx,
    currentPost,
    curSubMedia,
    mediaItems,
    totalPosts,
    isPaused,
    setIsPaused,
    nextSlide,
    prevSlide,
    goToPost,
    handleTouchStart,
    handleTouchEnd,
  } = useHeroSlider({ posts })

  // ডাটা লোড হওয়ার আগে কোনো ফাঁকা জায়গা তৈরি না হওয়া
  if (!loaded) return null

  // ১. কোনো স্লাইড পোস্ট না থাকলে এবং ব্রেকিং মোড বন্ধ থাকলে হোম পেজে কোনো ফাঁকা জায়গা থাকবে না
  if (totalPosts === 0 && !settings?.breaking_on) {
    return null
  }

  const animDuration = Math.max(0.4, 3.2 - ((currentPost?.text_effect_speed || 50) / 100) * 2.8).toFixed(2)
  const isVideo = curSubMedia?.type === 'video'
  const postDuration = currentPost?.slide_duration || 5000

  return (
    <div id="home" className="w-full flex flex-col bg-slate-950 text-white relative">
      {/* ১. ব্রেকিং ব্যানার (চালু থাকলে উপরে দেখাবে, বন্ধ থাকলে ০ হাইট) */}
      <HeroBreakingBanner settings={settings} />

      {/* ২. মূল হিরো স্লাইডার (পোস্ট থাকলে কেবল তখনই তৈরি হবে) */}
      {totalPosts > 0 && currentPost && (
        <section
          aria-label="Hero Slider"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
          className="relative h-[480px] sm:h-[540px] lg:h-[620px] w-full overflow-hidden select-none bg-black"
        >
          {/* স্লাইড মিডিয়া রেন্ডারার */}
          <div className="absolute inset-0">
            <HeroMediaRenderer
              item={curSubMedia}
              fitMode={currentPost.fit_mode || 'contain'}
              isActive={true}
            />
          </div>

          {/* টেক্সট ও গ্লাস কার্ড ওভারলে (যদি কোনো টেক্সট বা ব্যাজ দেওয়া থাকে) */}
          {(currentPost.title || currentPost.summary || currentPost.category) && (
            <div
              className={`absolute inset-0 p-4 sm:p-10 pointer-events-none flex z-10 ${
                currentPost.content_pos_v === 'top'
                  ? 'items-start pt-8 sm:pt-12'
                  : currentPost.content_pos_v === 'center'
                  ? 'items-center'
                  : 'items-end pb-16 sm:pb-20'
              } ${
                currentPost.content_pos_h === 'right'
                  ? 'justify-end'
                  : currentPost.content_pos_h === 'center'
                  ? 'justify-center'
                  : 'justify-start'
              }`}
            >
              <div
                className={`pointer-events-auto max-w-full transition-all duration-300 ${
                  currentPost.show_card_bg ? 'border border-white/20 shadow-2xl' : ''
                } ${
                  currentPost.text_align === 'center'
                    ? 'text-center'
                    : currentPost.text_align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
                style={{
                  width: `${currentPost.card_width_pct || 90}%`,
                  padding: currentPost.show_card_bg ? `${currentPost.card_padding_val || 20}px` : undefined,
                  borderRadius: currentPost.show_card_bg
                    ? `${Math.round(((currentPost.card_radius_pct || 20) / 100) * 40)}px`
                    : undefined,
                  backgroundColor: currentPost.show_card_bg
                    ? hexToRgba(currentPost.card_bg_color || '#000000', currentPost.card_opacity || 60)
                    : 'transparent',
                  backdropFilter: currentPost.show_card_bg ? `blur(${currentPost.card_blur || 12}px)` : undefined,
                  WebkitBackdropFilter: currentPost.show_card_bg ? `blur(${currentPost.card_blur || 12}px)` : undefined,
                }}
              >
                {/* কাস্টম ব্যাজ */}
                {currentPost.category && (
                  <span
                    className="inline-block px-3 py-1 rounded text-xs font-semibold mb-2 shadow"
                    style={{
                      backgroundColor: currentPost.badge_color || '#EAB308',
                      color: currentPost.badge_text_color || '#0f172a',
                    }}
                  >
                    {currentPost.category}
                  </span>
                )}

                {/* শিরোনাম (৩০টি অ্যানিমেশন ইফেক্ট সহ) */}
                {currentPost.title && (
                  <h2
                    key={currentPost.id + subIdx + currentPost.title}
                    className={`font-bold leading-snug drop-shadow-md ${
                      currentPost.title_size === '3xl'
                        ? 'text-2xl sm:text-4xl'
                        : currentPost.title_size === '2xl'
                        ? 'text-xl sm:text-3xl'
                        : 'text-lg sm:text-xl'
                    }`}
                    style={{
                      color: currentPost.title_color || '#ffffff',
                      fontFamily: currentPost.title_font || undefined,
                      animation: `anim_${currentPost.text_effect || 'fade-up'} ${animDuration}s ease-in-out forwards`,
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

                {/* সংক্ষিপ্ত বিবরণ */}
                {currentPost.summary && (
                  <p
                    className="mt-2 text-xs sm:text-sm line-clamp-2 drop-shadow leading-relaxed"
                    style={{
                      color: currentPost.summary_color || '#e2e8f0',
                      fontFamily: currentPost.summary_font || undefined,
                    }}
                  >
                    {currentPost.summary}
                  </p>
                )}

                {/* বিস্তারিত বাটন */}
                {currentPost.link_url && (
                  <div
                    className={`mt-4 ${
                      currentPost.text_align === 'center'
                        ? 'flex justify-center'
                        : currentPost.text_align === 'right'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }`}
                  >
                    <a
                      href={currentPost.link_url}
                      target={currentPost.link_url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg hover:opacity-90 transition-all cursor-pointer"
                      style={{
                        backgroundColor: currentPost.btn_bg_color || '#15803d',
                        color: currentPost.btn_color || '#ffffff',
                      }}
                    >
                      <span>{currentPost.button_text || 'বিস্তারিত'}</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ইনফো ব্যাজ: পোস্ট ও সাব-স্লাইড সংখ্যা */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow">
            <Layers className="size-3.5 text-yellow-400" />
            <span className="text-xs text-white font-medium">
              পোস্ট {bn(postIdx + 1)}/{bn(totalPosts)} · স্লাইড {bn(subIdx + 1)}/{bn(mediaItems.length)}
            </span>
          </div>

          {/* বাটন নেভিগেশন (ডানদিকের নিচে) */}
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
            {!isVideo && (
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে বন্ধ করুন'}
                className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="আগের স্লাইড"
              className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="পরের স্লাইড"
              className="size-9 sm:size-10 rounded-full bg-black/60 text-white backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* পোস্ট বুলেটিং ডটস (বামদিকের নিচে) */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5">
            {posts.map((_, pI) => (
              <button
                key={pI}
                type="button"
                onClick={() => goToPost(pI)}
                aria-label={`পোস্ট ${pI + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  pI === postIdx ? 'w-8 bg-yellow-400' : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* প্রোগ্রেস বার (সাব-স্লাইডের সময় নিয়ন্ত্রণ) */}
          {!isPaused && !isVideo && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30 pointer-events-none">
              <div
                key={`${postIdx}-${subIdx}`}
                className="h-full bg-yellow-400 origin-left"
                style={{
                  animation: `heroProgressTimer ${postDuration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default HeroCarousel
