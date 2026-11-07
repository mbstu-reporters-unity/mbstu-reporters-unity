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

  // স্লাইড সক্রিয় বা নিষ্ক্রিয় হলে ভিডিও নিয়ন্ত্রণ
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
      // স্লাইড সরে গেলে ভিডিও পজ হবে
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

  // সরাসরি ভিডিও ফাইল (MP4) প্লে/পজ
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

  // সরাসরি ভিডিও সাউন্ড মিউট/আনমিউট
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (v) {
      v.muted = !v.muted
      setMuted(v.muted)
    }
  }

  // ইউটিউব/ফেসবুক এম্বেড ভিডিওর জন্য প্লে/পজ টগল
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

  // ইউটিউব এম্বেড ভিডিওর সাউন্ড টগল
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

        {/* ৩. ভিডিও ব্যানার (ইউটিউব ও ডিরেক্ট ভিডিও) */}
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
                  {/* ইউটিউব প্লেয়ারের নিজস্ব কন্ট্রোল ছাড়াও সরাসরি টগল করার বোতাম */}
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

        {/* ================= ৪. টেক্সট লেয়ার (সম্পূর্ণ pointer-events-none যাতে ভিডিওতে কোনো বাধা না দেয়) ================= */}
        {isCompact ? (
          <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between z-20 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-black/40">
            <div className="my-auto text-center space-y-1.5 px-1">
              {titleLayer && (titleLayer.text || titleLayer.title) && (
                <h3
                  className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-md"
                  style={{ color: titleLayer.color || '#FFFFFF', fontFamily: titleLayer.font }}
                >
                  {titleLayer.text || titleLayer.title}
                </h3>
              )}
              {subtitleLayer && (subtitleLayer.text || subtitleLayer.subtitle) && (
                <p
                  className="text-[10px] sm:text-xs opacity-90 line-clamp-1 drop-shadow"
                  style={{ color: subtitleLayer.color || '#E2E8F0' }}
                >
                  {subtitleLayer.text || subtitleLayer.subtitle}
                </p>
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
          layers.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {layers.map((layer: any, idx: number) => {
                if (layer.enabled === false) return null
                const displayText = layer.text || layer.title || ''
                if (!displayText && !layer.subtitle && !layer.description) return null

                const scale = layer.size_scale || layer.scale || 1
                const align = layer.align || 'center'
                const anim = layer.animation || 'fade-up'

                return (
                  <div
                    key={layer.id || idx}
                    /* ⭐ এখানে pointer-events-none নিশ্চিত করা হয়েছে যাতে ভিডিও টাচ আটকানো না যায় ⭐ */
                    className="absolute pointer-events-none transition-all duration-300"
                    style={{
                      left: `${layer.x ?? 50}%`,
                      top: `${layer.y ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
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
                            } ${layer.italic ? 'italic' : ''} text-sm sm:text-xl md:text-2xl`}
                          >
                            {layer.label === 'তারিখ' && <Calendar className="inline-block size-3.5 mr-1.5 opacity-80" />}
                            {layer.label === 'প্রতিবেদক' && <User className="inline-block size-3.5 mr-1.5 opacity-80" />}
                            {layer.text}
                          </div>
                        )}
                        {!layer.text && layer.title && (
                          <h2 className="font-bold text-base sm:text-2xl drop-shadow-lg leading-tight">
                            {layer.title}
                          </h2>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* বিস্তারিত বোতাম */}
        {!isCompact && slide?.link_url && (
          <a
            href={slide.link_url}
            target={slide.link_url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="absolute bottom-4 left-5 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold backdrop-blur shadow-lg transition-all pointer-events-auto"
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
