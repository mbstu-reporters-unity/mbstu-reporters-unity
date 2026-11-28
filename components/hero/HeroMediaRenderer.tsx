'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { HeroSlide, SubMediaItem } from '@/lib/hero'
import { parseVideoUrl } from '@/lib/hero'
import { Calendar, User, ExternalLink } from 'lucide-react'

interface HeroMediaRendererProps {
  slide?: HeroSlide | null
  item?: SubMediaItem | null
  fitMode?: 'contain' | 'cover'
  isActive: boolean
  autoPlayVideo?: boolean
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
  autoPlayVideo = true,
  isCompact = false,
  onVideoStateChange,
  onVideoEnd,
}: HeroMediaRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [inViewport, setInViewport] = useState(true)

  const type = slide?.slide_type || item?.type || 'color'
  const isVideo = type === 'video'
  const videoUrl = slide?.video_config?.url || item?.url || ''
  const parsedVideo = parseVideoUrl(videoUrl)
  const imageUrl = item?.url || (slide?.media_items?.[0] as any)?.url || ''

  const bannerWidth = slide?.banner_config?.width_pct ?? 100
  const bannerHeight = slide?.banner_config?.height_px ?? 480

  // ভিউপোর্ট ডিটেকশন: স্ক্রল করে নিচে গেলে ভিডিও বন্ধ হবে
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.2)
        setInViewport(visible)
      },
      { threshold: [0, 0.2, 0.5] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ইউটিউব প্লেয়ারের মেসেজ ইভেন্ট ডিটেকশন (Play/Pause/End ট্র্যাক করা)
  useEffect(() => {
    const handleYouTubeMessages = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (data && (data.event === 'onStateChange' || data.event === 'infoDelivery')) {
          const state = data.info?.playerState ?? data.info
          if (state === 1 || state === 3) {
            onVideoStateChange?.(true)
          } else if (state === 2) {
            onVideoStateChange?.(false)
          } else if (state === 0) {
            onVideoStateChange?.(false)
            onVideoEnd?.()
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleYouTubeMessages)
    return () => window.removeEventListener('message', handleYouTubeMessages)
  }, [onVideoStateChange, onVideoEnd])

  const shouldAutoPlay = isActive && inViewport && autoPlayVideo

  useEffect(() => {
    if (!inViewport || !isActive) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      if (iframeRef.current?.contentWindow && parsedVideo.platform === 'youtube') {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        )
      }
      onVideoStateChange?.(false)
    } else if (shouldAutoPlay) {
      if (videoRef.current) {
        videoRef.current
          .play()
          .then(() => {
            onVideoStateChange?.(true)
          })
          .catch(() => {})
      }
    }
  }, [shouldAutoPlay, inViewport, isActive, onVideoStateChange, parsedVideo.platform])

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

  const getEmbedSource = () => {
    if (!parsedVideo.embedSrc) return ''
    const base = parsedVideo.embedSrc
    const autoplayParam = shouldAutoPlay ? '&autoplay=1&mute=1' : '&autoplay=0'
    return `${base}${autoplayParam}`
  }

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
            {hasCustomLayers && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-[15]" />
            )}
          </div>
        )}

        {/* ৩. ভিডিও ব্যানার (ইউটিউব, ফেসবুক ও ডিরেক্ট ফাইল) - কোনো কৃত্রিম বাটন ছাড়া শুধুমাত্র অফিসিয়াল প্লেয়ার */}
        {isVideo && (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            {parsedVideo.isEmbed ? (
              <div className="relative w-full h-full flex items-center justify-center aspect-video max-h-full">
                <iframe
                  ref={iframeRef}
                  src={getEmbedSource()}
                  className="w-full h-full border-0 pointer-events-auto z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  title={slide?.title || 'Video Player'}
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  loop
                  muted
                  onPlay={() => onVideoStateChange?.(true)}
                  onPause={() => onVideoStateChange?.(false)}
                  onEnded={() => {
                    onVideoStateChange?.(false)
                    onVideoEnd?.()
                  }}
                  className="w-full h-full object-contain pointer-events-auto z-10"
                />
              </div>
            )}
          </div>
        )}

        {/* ৪. টেক্সট লেয়ারসমূহ: শুধুমাত্র ছবি বা কালার স্লাইডে দেখাবে, ভিডিওর ওপর কোনো টেক্সট ওভারল্যাপ করবে না */}
        {hasCustomLayers && !isVideo && (
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
              {/* মোবাইল ভিউ */}
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
