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
  isCompact?: boolean
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
    const stops =
      cfg.stops && cfg.stops.length > 0
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
  isCompact = false,
  onVideoStateChange,
  onVideoEnd,
}: HeroMediaRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [inViewport, setInViewport] = useState(true)

  const type = slide?.slide_type || item?.type || 'color'
  const videoUrl = slide?.video_config?.url || item?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = item?.url || (slide?.media_items?.[0] as any)?.url || ''

  const bannerWidth = slide?.banner_config?.width_pct ?? 100
  const bannerHeight = slide?.banner_config?.height_px ?? 480

  // ১. ভিউপোর্ট অবজারভার: ইউজার যখন স্ক্রল করে নিচের দিকে যাবে, তখন ভিডিও স্বয়ংক্রিয়ভাবে পজ হবে
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.25)
        setInViewport(visible)
      },
      { threshold: [0, 0.25, 0.5] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ২. স্লাইড অ্যাক্টিভ বা ইন-ভিউ না থাকলে তাৎক্ষণিক ভিডিও ও সাউন্ড বন্ধ করা
  const shouldPlay = isActive && inViewport

  useEffect(() => {
    if (shouldPlay) {
      if (videoRef.current) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true)
            onVideoStateChange?.(true)
          })
          .catch(() => {
            setIsPlaying(false)
            onVideoStateChange?.(false)
          })
      }
      if (iframeRef.current?.contentWindow && parsedVideo.platform === 'youtube') {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        )
      }
    } else {
      // স্লাইড স্ক্রিনের বাইরে চলে গেলে অথবা অন্য স্লাইড আসলে ভিডিও পজ
      if (videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
      if (iframeRef.current?.contentWindow && parsedVideo.platform === 'youtube') {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        )
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*'
        )
      }
      onVideoStateChange?.(false)
    }
  }, [shouldPlay, onVideoStateChange, parsedVideo.platform])

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

  const toggleEmbedPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    const iframe = iframeRef.current
    if (!iframe?.contentWindow || parsedVideo.platform !== 'youtube') return

    if (isPlaying) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      )
      setIsPlaying(false)
      onVideoStateChange?.(false)
    } else {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      )
      setIsPlaying(true)
      onVideoStateChange?.(true)
    }
  }

  const toggleEmbedSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const iframe = iframeRef.current
    if (!iframe?.contentWindow || parsedVideo.platform !== 'youtube') return

    if (muted) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
        '*'
      )
      setMuted(false)
    } else {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'mute', args: [] }),
        '*'
      )
      setMuted(true)
    }
  }

  const layers = slide?.text_layers || []
  const titleLayer =
    layers.find((l: any) => l.enabled && (l.id === 'txt_title' || l.label?.includes('শিরোনাম'))) ||
    layers[0]
  const subtitleLayer = layers.find(
    (l: any) => l.enabled && (l.id === 'txt_subtitle' || l.label?.includes('সাব-হেডিং'))
  )
  const dateLayer = layers.find(
    (l: any) => l.enabled && (l.id === 'txt_date' || l.label?.includes('তারিখ'))
  )
  const reporterLayer = layers.find(
    (l: any) => l.enabled && (l.id === 'txt_reporter' || l.label?.includes('সাংবাদিক'))
  )

  const hasCustomLayers = layers.some((l: any) => l.enabled && l.text?.trim())

  return (
    <div
      ref={containerRef}
      className="hero-daylight-dark-surface relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-slate-950"
    >
      <div
        className="relative h-full w-full transition-all duration-500 overflow-hidden flex items-center justify-center"
        style={{
          width: isCompact ? '100%' : `${bannerWidth}%`,
          maxWidth: '100%',
          maxHeight: isCompact ? '100%' : `${bannerHeight}px`,
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
            {/* ছবির উপরেই শুধু হালকা সুরক্ষা শ্যাডো থাকবে যাতে লেখা পড়তে সুবিধা হয় */}
            {hasCustomLayers && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-[15]" />
            )}
          </div>
        )}

        {/* ৩. ভিডিও ব্যানার (ইউটিউব, ফেসবুক ও ডিরেক্ট ফাইল) - কোনো ঝাপসা ওভারলে ছাড়া সম্পূর্ণ ক্লিয়ার */}
        {type === 'video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            {parsedVideo.isEmbed ? (
              shouldPlay ? (
                <div className="relative w-full h-full flex items-center justify-center aspect-video max-h-full">
                  <iframe
                    ref={iframeRef}
                    src={`${parsedVideo.embedSrc}&autoplay=1&mute=1`}
                    className="w-full h-full border-0 pointer-events-auto z-10"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    title={slide?.title || 'Video Player'}
                  />

                  {parsedVideo.platform === 'youtube' && (
                    <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={toggleEmbedPlayPause}
                        className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                      >
                        {isPlaying ? (
                          <Pause className="size-3 text-yellow-400" />
                        ) : (
                          <Play className="size-3 text-green-400" />
                        )}
                        <span>{isPlaying ? 'পজ' : 'চালান'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={toggleEmbedSound}
                        className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg cursor-pointer active:scale-95"
                      >
                        {muted ? (
                          <VolumeX className="size-3 text-red-400" />
                        ) : (
                          <Volume2 className="size-3 text-green-400" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white/50 text-xs">
                  ভিডিও পজ করা হয়েছে
                </div>
              )
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  loop
                  muted={muted}
                  onEnded={() => {
                    setIsPlaying(false)
                    onVideoStateChange?.(false)
                    onVideoEnd?.()
                  }}
                  className="w-full h-full object-contain pointer-events-auto z-10"
                  onClick={togglePlayPause}
                />
                <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="size-3 text-yellow-400" />
                    ) : (
                      <Play className="size-3 text-green-400" />
                    )}
                    <span>{isPlaying ? 'পজ' : 'চালান'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg cursor-pointer active:scale-95"
                  >
                    {muted ? (
                      <VolumeX className="size-3 text-red-400" />
                    ) : (
                      <Volume2 className="size-3 text-green-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ৪. টেক্সট লেয়ার ও বাটন (ভিডিও থাকলে দৃশ্যমানতা রক্ষা করে নিচে অবস্থান নেবে) ================= */}
        {hasCustomLayers && (
          isCompact ? (
            <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between z-20 pointer-events-none">
              <div className="my-auto text-center space-y-1.5 px-1">
                {titleLayer && (titleLayer.text || titleLayer.title) && (
                  <div key={`${slide?.id}_comp_title`} className={`anim_${titleLayer.animation || 'fade-up'}`}>
                    <h3
                      className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-md"
                      style={{ color: titleLayer.color || '#FFFFFF', fontFamily: titleLayer.font }}
                    >
                      {titleLayer.text || titleLayer.title}
                    </h3>
                  </div>
                )}
                {subtitleLayer && (subtitleLayer.text || subtitleLayer.subtitle) && (
                  <div key={`${slide?.id}_comp_sub`} className={`anim_${subtitleLayer.animation || 'fade-up'}`}>
                    <p
                      className="text-[10px] sm:text-xs opacity-90 line-clamp-1 drop-shadow"
                      style={{ color: subtitleLayer.color || '#E2E8F0' }}
                    >
                      {subtitleLayer.text || subtitleLayer.subtitle}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/15 pointer-events-auto text-[10px]">
                {slide?.link_url ? (
                  <a
                    href={slide.link_url}
                    className="px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all shrink-0"
                  >
                    {slide.button_text || 'বিস্তারিত'}
                  </a>
                ) : (
                  <span />
                )}
                <div className="text-[9px] sm:text-[10px] text-white/80 truncate text-right">
                  {dateLayer?.text || reporterLayer?.text || ''}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* মোবাইল ভিউ: ভিডিওর উপরে লেখার ওভারল্যাপ কমানো */}
              <div className="sm:hidden absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-3 pb-6 pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="space-y-1.5 max-w-sm">
                  {titleLayer && (titleLayer.text || titleLayer.title) && (
                    <h2
                      className={`font-serif text-base font-bold text-white leading-tight drop-shadow-lg anim_${titleLayer.animation || 'fade-up'}`}
                      style={{ color: titleLayer.color || '#FFFFFF' }}
                    >
                      {titleLayer.text || titleLayer.title}
                    </h2>
                  )}

                  {subtitleLayer && (subtitleLayer.text || subtitleLayer.subtitle) && (
                    <p
                      className={`text-xs text-slate-200 line-clamp-2 drop-shadow anim_${subtitleLayer.animation || 'fade-up'}`}
                      style={{ color: subtitleLayer.color || '#E2E8F0' }}
                    >
                      {subtitleLayer.text || subtitleLayer.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-cyan-200/90 font-medium">
                    {dateLayer?.text && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {dateLayer.text}
                      </span>
                    )}
                    {reporterLayer?.text && (
                      <span className="flex items-center gap-1">
                        <User className="size-3" /> {reporterLayer.text}
                      </span>
                    )}
                  </div>

                  {slide?.link_url && (
                    <div className="pt-1 pointer-events-auto">
                      <a
                        href={slide.link_url}
                        target={slide.link_url.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg"
                      >
                        <span>{slide.button_text || 'বিস্তারিত'}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* ডেস্কটপ ভিউ */}
              <div className="hidden sm:block absolute inset-0 pointer-events-none z-20">
                {layers.map((layer: any, idx: number) => {
                  if (layer.enabled === false) return null
                  const displayText = layer.text || layer.title || ''
                  if (!displayText && !layer.subtitle && !layer.description) return null

                  const scale = layer.size_scale || layer.scale || 1
                  const align = layer.align || 'center'
                  const anim = layer.animation || 'fade-up'

                  return (
                    <div
                      key={`${slide?.id}_${layer.id || idx}`}
                      className="absolute pointer-events-none transition-all duration-300"
                      style={{
                        left: `${layer.x ?? 50}%`,
                        top: `${layer.y ?? 50}%`,
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '90%',
                        textAlign: align,
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${scale})`,
                          transformOrigin:
                            align === 'left'
                              ? 'left center'
                              : align === 'right'
                              ? 'right center'
                              : 'center center',
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
                              } ${layer.italic ? 'italic' : ''} text-base sm:text-xl md:text-2xl`}
                            >
                              {layer.label === 'তারিখ' && (
                                <Calendar className="inline-block size-3.5 mr-1.5 opacity-80" />
                              )}
                              {layer.label === 'প্রতিবেদক' && (
                                <User className="inline-block size-3.5 mr-1.5 opacity-80" />
                              )}
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

                {!isCompact && slide?.link_url && (
                  <a
                    href={slide.link_url}
                    target={slide.link_url.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="absolute bottom-5 left-6 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold backdrop-blur shadow-lg transition-all pointer-events-auto cursor-pointer"
                  >
                    <span>{slide.button_text || 'বিস্তারিত'}</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default HeroMediaRenderer
