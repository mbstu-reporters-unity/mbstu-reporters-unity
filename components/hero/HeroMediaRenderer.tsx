'use client'

import React, { useEffect, useRef } from 'react'
import type { HeroSlide, SubMediaItem } from '@/lib/hero'
import { parseVideoUrl } from '@/lib/hero'
import { Volume2, VolumeX, ExternalLink } from 'lucide-react'

interface HeroMediaRendererProps {
  slide?: HeroSlide | null
  item?: SubMediaItem | null
  fitMode?: 'contain' | 'cover'
  isActive: boolean
}

// ৩ থেকে ৫ রঙের গ্রেডিয়েন্ট এবং সাইজ তৈরির ফাংশন
function getBannerStyle(slide?: HeroSlide | null, item?: SubMediaItem | null) {
  if (slide?.banner_config) {
    const cfg = slide.banner_config
    if (cfg.mode === 'solid') {
      const color = cfg.stops?.[0]?.color || '#064e3b'
      return { background: color }
    }
    const angle = cfg.angle ?? 135
    const stops = cfg.stops && cfg.stops.length > 0
      ? cfg.stops
      : [
          { color: '#064e3b', stop: 0 },
          { color: '#0f172a', stop: 50 },
          { color: '#1e1b4b', stop: 100 },
        ]
    const stopString = [...stops]
      .sort((a, b) => a.stop - b.stop)
      .map((s) => `${s.color} ${s.stop}%`)
      .join(', ')

    return {
      background: `linear-gradient(${angle}deg, ${stopString})`,
    }
  }

  if (item?.gradient) return { background: item.gradient }
  if (item?.color) return { background: item.color }
  return { background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #1e1b4b 100%)' }
}

export function HeroMediaRenderer({
  slide,
  item,
  fitMode = 'contain',
  isActive,
}: HeroMediaRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = React.useState(true)

  const type = slide?.slide_type || item?.type || 'color'
  const videoUrl = slide?.video_config?.url || item?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = item?.url || (slide?.media_items?.[0] as any)?.url || ''

  // স্লাইড সরে গেলে ভিডিও পজ ও সাউন্ড বন্ধ হওয়ার লজিক
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.play().catch(() => {})
    } else {
      v.pause()
      v.muted = true
      setMuted(true)
    }
  }, [isActive])

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (v) {
      v.muted = !v.muted
      setMuted(v.muted)
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* ================= ১. কালার ব্যানার (সলিড বা ৩-৫ রঙের গ্রেডিয়েন্ট) ================= */}
      {type === 'color' && (
        <div
          className="w-full h-full transition-all duration-700"
          style={getBannerStyle(slide, item)}
        />
      )}

      {/* ================= ২. ছবি ব্যানার ================= */}
      {type === 'image' && (
        <div className="relative w-full h-full flex items-center justify-center bg-black/90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl || '/images/hero-1.png'}
            alt="Hero Slide"
            className={`w-full h-full transition-all duration-700 select-none ${
              fitMode === 'cover' ? 'object-cover' : 'object-contain'
            }`}
            loading="eager"
            draggable={false}
          />
        </div>
      )}

      {/* ================= ৩. ভিডিও বা ভিডিওর লিঙ্ক ================= */}
      {type === 'video' && (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {parsedVideo.isEmbed ? (
            isActive ? (
              <iframe
                src={`${parsedVideo.embedSrc}&autoplay=1&mute=1`}
                className="w-full h-full aspect-video border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded Video Player"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white/40 text-xs">
                ভিডিও পজ করা আছে
              </div>
            )
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                loop
                muted={muted}
                className="w-full h-full object-contain pointer-events-auto"
              />
              <button
                type="button"
                onClick={toggleSound}
                className="absolute top-4 left-4 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all border border-white/20 shadow cursor-pointer"
                aria-label="সাউন্ড অন/অফ"
              >
                {muted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4 text-green-400" />}
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= ৪. লিঙ্ক প্রিভিউ ================= */}
      {type === 'link_preview' && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-5 shadow-2xl text-center space-y-2">
            <span className="text-xs text-green-400 font-bold px-3 py-1 bg-green-950/60 rounded-full border border-green-800">
              🔗 লিঙ্ক প্রিভিউ
            </span>
            <p className="text-sm font-bold text-white truncate">{item?.external_url || slide?.link_url || 'ওয়েব লিঙ্ক'}</p>
          </div>
        </div>
      )}

      {/* ================= ৫. ফ্রি-ফর্ম টেক্সট লেয়ার (এলাইনমেন্ট: বামে, মাঝে, ডানে, জাস্টিফাই) ================= */}
      {slide?.text_layers && slide.text_layers.length > 0 ? (
        <div className="absolute inset-0 pointer-events-none">
          {slide.text_layers.map((layer, idx) => (
            <div
              key={layer.id || idx}
              className="absolute pointer-events-auto transition-all duration-300"
              style={{
                left: `${layer.x ?? 50}%`,
                top: `${layer.y ?? 50}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 25,
                maxWidth: '92%',
                textAlign: layer.align || 'center',
              }}
            >
              <div
                style={{
                  transform: `scale(${layer.scale || 1})`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className={`anim_${layer.animation || 'fade-up'}`}
                  style={{
                    fontFamily: layer.font || undefined,
                    color: layer.color || '#FFFFFF',
                    backgroundColor: layer.bg_color || undefined,
                    padding: layer.bg_color ? '4px 12px' : undefined,
                    borderRadius: layer.bg_color ? '8px' : undefined,
                    textAlign: layer.align || 'center',
                  }}
                >
                  {layer.title && (
                    <h2
                      className={`leading-tight drop-shadow-lg ${
                        layer.weight === 'bold'
                          ? 'font-bold'
                          : layer.weight === 'semibold'
                          ? 'font-semibold'
                          : 'font-normal'
                      } ${layer.italic ? 'italic' : ''} text-lg sm:text-2xl md:text-3xl`}
                    >
                      {layer.title}
                    </h2>
                  )}
                  {layer.subtitle && (
                    <h3 className="text-xs sm:text-sm md:text-base opacity-90 mt-1 drop-shadow">
                      {layer.subtitle}
                    </h3>
                  )}
                  {layer.description && (
                    <p className="text-[11px] sm:text-xs md:text-sm opacity-80 mt-1 line-clamp-3 drop-shadow leading-relaxed">
                      {layer.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* ক্লিক লিঙ্ক বাটন (যদি লিঙ্ক দেওয়া থাকে) */}
      {slide?.link_url && (
        <a
          href={slide.link_url}
          target={slide.link_url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="absolute bottom-5 left-6 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold backdrop-blur shadow-lg transition-all"
        >
          <span>{slide.button_text || 'বিস্তারিত'}</span>
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  )
}

export default HeroMediaRenderer
