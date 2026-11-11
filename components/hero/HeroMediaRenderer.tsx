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
  isCompact = false,
  onVideoStateChange,
  onVideoEnd,
}: HeroMediaRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const type = slide?.slide_type || item?.type || 'color'
  const videoUrl = slide?.video_config?.url || item?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = item?.url || (slide?.media_items?.[0] as any)?.url || ''

  const bannerWidth = slide?.banner_config?.width_pct ?? 100
  const bannerHeight = slide?.banner_config?.height_px ?? 480

  useEffect(() => {
    if (isActive) {
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
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.muted = true
        setMuted(true)
        setIsPlaying(false)
      }
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        )
        setIsPlaying(false)
      }
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

  const toggleEmbedPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return

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
    if (!iframe?.contentWindow) return

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
  const titleLayer = layers.find((l: any) => l.enabled && (l.id === 'txt_title' || l.label?.includes('শিরোনাম'))) || layers[0]
  const subtitleLayer = layers.find((l: any) => l.enabled && (l.id === 'txt_subtitle' || l.label?.includes('সাব-হেডিং')))
  const descLayer = layers.find((l: any) => l.enabled && (l.id === 'txt_desc' || l.label?.includes('বিস্তারিত')))
  const dateLayer = layers.find((l: any) => l.enabled && (l.id === 'txt_date' || l.label?.includes('তারিখ')))
  const reporterLayer = layers.find((l: any) => l.enabled && (l.id === 'txt_reporter' || l.label?.includes('সাংবাদিক')))

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-slate-950">
      
      {/* ৩৫টি অ্যানিমেশন সিএসএস ইঞ্জিন */}
      <style>{`
        @keyframes anim_fade-up { 0% { opacity: 0; transform: translateY(22px); } 100% { opacity: 1; transform: translateY(0); } }
        .anim_fade-up { animation: anim_fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-block; }

        @keyframes anim_typewriter { 0% { opacity: 0; clip-path: inset(0 100% 0 0); } 100% { opacity: 1; clip-path: inset(0 0 0 0); } }
        .anim_typewriter { animation: anim_typewriter 1s ease-out forwards; display: inline-block; }

        @keyframes anim_zoom-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        .anim_zoom-pop { animation: anim_zoom-pop 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; display: inline-block; }

        @keyframes anim_neon-pulse { 0%, 100% { text-shadow: 0 0 4px #fff, 0 0 14px #38bdf8; } 50% { text-shadow: 0 0 2px #fff, 0 0 6px #0284c7; } }
        .anim_neon-pulse { animation: anim_neon-pulse 1.4s ease-in-out infinite; display: inline-block; }

        @keyframes anim_bounce-in { 0% { opacity: 0; transform: translateY(-40px); } 60% { opacity: 1; transform: translateY(8px); } 80% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        .anim_bounce-in { animation: anim_bounce-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards; display: inline-block; }

        @keyframes anim_flip-x { 0% { opacity: 0; transform: perspective(400px) rotateX(90deg); } 100% { opacity: 1; transform: perspective(400px) rotateX(0deg); } }
        .anim_flip-x { animation: anim_flip-x 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-block; }

        @keyframes anim_flip-y { 0% { opacity: 0; transform: perspective(400px) rotateY(90deg); } 100% { opacity: 1; transform: perspective(400px) rotateY(0deg); } }
        .anim_flip-y { animation: anim_flip-y 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; display: inline-block; }

        @keyframes anim_cyber-glitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-3px, 2px); } 40% { transform: translate(3px, -2px); } 60% { transform: translate(-2px, -1px); } 80% { transform: translate(2px, 1px); } }
        .anim_cyber-glitch { animation: anim_cyber-glitch 2s infinite; display: inline-block; }

        @keyframes anim_smoke-fade { 0% { opacity: 0; filter: blur(14px); transform: scale(1.08); } 100% { opacity: 1; filter: blur(0); transform: scale(1); } }
        .anim_smoke-fade { animation: anim_smoke-fade 0.9s ease-out forwards; display: inline-block; }

        @keyframes anim_letter-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .anim_letter-wave { animation: anim_letter-wave 2s ease-in-out infinite; display: inline-block; }

        @keyframes anim_slide-left { 0% { opacity: 0; transform: translateX(60px); } 100% { opacity: 1; transform: translateX(0); } }
        .anim_slide-left { animation: anim_slide-left 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-block; }

        @keyframes anim_slide-right { 0% { opacity: 0; transform: translateX(-60px); } 100% { opacity: 1; transform: translateX(0); } }
        .anim_slide-right { animation: anim_slide-right 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: inline-block; }

        @keyframes anim_auto-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .anim_auto-float { animation: anim_auto-float 3s ease-in-out infinite; display: inline-block; }

        @keyframes anim_auto-heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
        .anim_auto-heartbeat { animation: anim_auto-heartbeat 1.6s ease-in-out infinite; display: inline-block; }

        @keyframes anim_auto-neon { 0%, 100% { text-shadow: 0 0 3px #fff, 0 0 10px #22c55e; } 50% { text-shadow: 0 0 7px #fff, 0 0 20px #4ade80; } }
        .anim_auto-neon { animation: anim_auto-neon 2s ease-in-out infinite; display: inline-block; }
      `}</style>

      <div
        className="relative h-full w-full transition-all duration-500 overflow-hidden"
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
          </div>
        )}

        {/* ৩. ভিডিও ব্যানার */}
        {type === 'video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {parsedVideo.isEmbed ? (
              isActive ? (
                <>
                  <iframe
                    ref={iframeRef}
                    src={`${parsedVideo.embedSrc}&autoplay=1&mute=1`}
                    className="w-full h-full aspect-video border-0 pointer-events-auto z-10"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video Player"
                  />
                  <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={toggleEmbedPlayPause}
                      className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                    >
                      {isPlaying ? <Pause className="size-3 text-yellow-400" /> : <Play className="size-3 text-green-400" />}
                      <span>{isPlaying ? 'পজ' : 'চালান'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleEmbedSound}
                      className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg cursor-pointer active:scale-95"
                    >
                      {muted ? <VolumeX className="size-3 text-red-400" /> : <Volume2 className="size-3 text-green-400" />}
                    </button>
                  </div>
                </>
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
                  className="w-full h-full object-contain pointer-events-auto z-10"
                  onClick={togglePlayPause}
                />
                <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                  >
                    {isPlaying ? <Pause className="size-3 text-yellow-400" /> : <Play className="size-3 text-green-400" />}
                    <span>{isPlaying ? 'পজ' : 'চালান'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/20 shadow-lg cursor-pointer active:scale-95"
                  >
                    {muted ? <VolumeX className="size-3 text-red-400" /> : <Volume2 className="size-3 text-green-400" />}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ৪. সেফটি স্ক্রিম ওভারলে (লেখা স্পষ্ট রাখার জন্য) */}
        {(type === 'image' || type === 'video') && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25 pointer-events-none z-[15]" />
        )}

        {/* ================= ৫. টেক্সট লেয়ারসমূহ ================= */}
        {isCompact ? (
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
            {/* মোবাইল মোড (< sm): ওভারল্যাপহীন সুশৃঙ্খল স্ট্যাক */}
            <div className="sm:hidden absolute inset-0 z-20 flex flex-col justify-end p-4 pb-8 pointer-events-none">
              <div className="space-y-2 max-w-sm">
                {titleLayer && (titleLayer.text || titleLayer.title) && (
                  <h2
                    className={`font-serif text-lg font-bold text-white leading-tight drop-shadow-lg anim_${titleLayer.animation || 'fade-up'}`}
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

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-cyan-200/90 font-medium">
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
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg"
                    >
                      <span>{slide.button_text || 'বিস্তারিত'}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ডেস্কটপ মোড (>= sm): অ্যাডমিনের মূল পজিশন ভিউ */}
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
                            } ${layer.italic ? 'italic' : ''} text-base sm:text-xl md:text-2xl`}
                          >
                            {layer.label === 'তারিখ' && <Calendar className="inline-block size-3.5 mr-1.5 opacity-80" />}
                            {layer.label === 'প্রতিবেদক' && <User className="inline-block size-3.5 mr-1.5 opacity-80" />}
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
        )}
      </div>
    </div>
  )
}

export default HeroMediaRenderer
