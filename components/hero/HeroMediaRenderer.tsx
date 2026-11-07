'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { HeroSlide, SubMediaItem } from '@/lib/hero'
import { parseVideoUrl } from '@/lib/hero'
import { Volume2, VolumeX, Play, Pause, Calendar, User, ExternalLink } from 'lucide-react'

interface HeroMediaRendererProps {
  slide?: HeroSlide | null
  item?: SubMediaItem | null
  fitMode?: 'contain' | 'cover'
  isActive: boolean
  onVideoStateChange?: (isPlaying: boolean) => void
  onVideoEnd?: () => void
}

function getBannerBackground(slide?: HeroSlide | null, item?: SubMediaItem | null) {
  if (slide?.banner_config) {
    const cfg = slide.banner_config
    if (cfg.mode === 'solid') {
      return cfg.stops?.[0]?.color || '#064e3b'
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

    return `linear-gradient(${angle}deg, ${stopString})`
  }

  if (item?.gradient) return item.gradient
  if (item?.color) return item.color
  return 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #1e1b4b 100%)'
}

export function HeroMediaRenderer({
  slide,
  item,
  fitMode = 'contain',
  isActive,
  onVideoStateChange,
  onVideoEnd,
}: HeroMediaRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const type = slide?.slide_type || item?.type || 'color'
  const videoUrl = slide?.video_config?.url || item?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = item?.url || (slide?.media_items?.[0] as any)?.url || ''

  const bannerWidth = slide?.banner_config?.width_pct ?? 100
  const bannerHeight = slide?.banner_config?.height_px ?? 480

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.play()
        .then(() => {
          setIsPlaying(true)
          onVideoStateChange?.(true)
        })
        .catch(() => {
          setIsPlaying(false)
          onVideoStateChange?.(false)
        })
    } else {
      v.pause()
      v.muted = true
      setMuted(true)
      setIsPlaying(false)
      onVideoStateChange?.(false)
    }
  }, [isActive, onVideoStateChange])

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
        .then(() => {
          setIsPlaying(true)
          onVideoStateChange?.(true)
        })
        .catch(() => {})
    } else {
      v.pause()
      setIsPlaying(false)
      onVideoStateChange?.(false)
    }
  }

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (v) {
      v.muted = !v.muted
      setMuted(v.muted)
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-slate-950">
      <div
        className="relative h-full transition-all duration-500 overflow-hidden"
        style={{
          width: `${bannerWidth}%`,
          maxWidth: '100%',
          maxHeight: `${bannerHeight}px`,
        }}
      >
        {/* ১. কালার ব্যানার */}
        {type === 'color' && (
          <div
            className="w-full h-full transition-all duration-700"
            style={{ background: getBannerBackground(slide, item) }}
          />
        )}

        {/* ২. ছবি ব্যানার */}
        {type === 'image' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black/90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || '/images/hero-1.png'}
              alt="Hero Banner"
              className={`w-full h-full transition-all duration-700 select-none ${
                fitMode === 'cover' ? 'object-cover' : 'object-contain'
              }`}
              loading="eager"
              draggable={false}
            />
          </div>
        )}

        {/* ৩. ভিডিও ব্যানার */}
        {type === 'video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {parsedVideo.isEmbed ? (
              isActive ? (
                <iframe
                  src={`${parsedVideo.embedSrc}&autoplay=1&mute=1`}
                  className="w-full h-full aspect-video border-0 pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white/40 text-xs">
                  ভিডিও পজ করা
                </div>
              )
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  loop={false}
                  muted={muted}
                  onEnded={() => {
                    setIsPlaying(false)
                    onVideoStateChange?.(false)
                    onVideoEnd?.()
                  }}
                  className="w-full h-full object-contain pointer-events-auto"
                  onClick={togglePlayPause}
                />
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/20 shadow cursor-pointer"
                    aria-label="ভিডিও চালান বা বন্ধ করুন"
                  >
                    {isPlaying ? <Pause className="size-4 text-yellow-400" /> : <Play className="size-4 text-green-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/20 shadow cursor-pointer"
                    aria-label="সাউন্ড অন/অফ"
                  >
                    {muted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4 text-green-400" />}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ৪. স্বাধীন টেক্সট লেয়ারসমূহ (পূর্বের মতোই অক্ষত) */}
        {slide?.text_layers && slide.text_layers.length > 0 ? (
          <div className="absolute inset-0 pointer-events-none">
            {slide.text_layers.map((layer: any, idx: number) => {
              if (layer.enabled === false) return null
              const displayText = layer.text || layer.title || ''
              if (!displayText && !layer.subtitle && !layer.description) return null

              const scale = layer.size_scale || layer.scale || 1
              const align = layer.align || 'center'
              const anim = layer.animation || 'fade-up'

              return (
                <div
                  key={layer.id || idx}
                  className="absolute pointer-events-auto transition-all duration-300"
                  style={{
                    left: `${layer.x ?? 50}%`,
                    top: `${layer.y ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 25,
                    maxWidth: '92%',
                    textAlign: align,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center center',
                    }}
                  >
                    <div
                      className={`anim_${anim}`}
                      style={{
                        fontFamily: layer.font || undefined,
                        color: layer.color || '#FFFFFF',
                        backgroundColor: layer.bg_color || undefined,
                        padding: layer.bg_color ? '4px 12px' : undefined,
                        borderRadius: layer.bg_color ? '8px' : undefined,
                        textAlign: align,
                      }}
                    >
                      {layer.text && (
                        <div
                          className={`leading-tight drop-shadow-lg ${
                            layer.weight === 'bold'
                              ? 'font-bold'
                              : layer.weight === 'semibold'
                              ? 'font-semibold'
                              : 'font-normal'
                          } ${layer.italic ? 'italic' : ''} text-base sm:text-2xl md:text-3xl`}
                        >
                          {layer.label === 'তারিখ' && <Calendar className="inline-block size-4 mr-1.5 opacity-80" />}
                          {layer.label === 'প্রতিবেদক' && <User className="inline-block size-4 mr-1.5 opacity-80" />}
                          {layer.text}
                        </div>
                      )}
                      {!layer.text && layer.title && (
                        <h2 className="font-bold text-lg sm:text-2xl drop-shadow-lg leading-tight">
                          {layer.title}
                        </h2>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        {/* লিঙ্ক বোতাম */}
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
    </div>
  )
}

export default HeroMediaRenderer
