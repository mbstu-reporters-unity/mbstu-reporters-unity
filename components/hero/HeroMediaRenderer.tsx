'use client'

import React from 'react'
import type { SubMediaItem } from '@/lib/hero'
import { ExternalLink } from 'lucide-react'

interface HeroMediaRendererProps {
  item: SubMediaItem
  fitMode?: 'contain' | 'cover'
  isActive: boolean
}

// সোশ্যাল ও ভিডিও প্ল্যাটফর্ম এম্বেড শনাক্তকরণ ফাংশন
function getEmbedDetails(url?: string) {
  if (!url || typeof url !== 'string') return null
  const cleanUrl = url.trim()

  // ১. YouTube ভিডিও শনাক্তকরণ
  const ytMatch = cleanUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&controls=1&playsinline=1`,
    }
  }

  // ২. Facebook ভিডিও শনাক্তকরণ
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    return {
      type: 'facebook',
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false`,
    }
  }

  return null
}

export function HeroMediaRenderer({ item, fitMode = 'contain', isActive }: HeroMediaRendererProps) {
  const embed = getEmbedDetails(item.url || item.external_url)

  // ১. সলিড কালার বা গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড
  if (item.type === 'color') {
    const bgStyle = {
      background: item.gradient || item.color || '#0f172a',
    }
    return (
      <div className="relative w-full h-full" style={bgStyle}>
        {item.link && (
          <a
            href={item.link}
            target={item.link.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 cursor-pointer"
            aria-label="লিংকে যান"
          />
        )}
      </div>
    )
  }

  // ২. ছবি স্লাইডার
  if (item.type === 'image') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/90 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url || '/images/hero-1.png'}
          alt="Slide Media"
          className={`w-full h-full transition-all duration-700 select-none ${
            fitMode === 'cover' ? 'object-cover' : 'object-contain'
          }`}
          loading="eager"
          draggable={false}
        />
        {/* ছবিতে ক্লিক করলে নির্দিষ্ট লিংকে যাওয়ার ব্যবস্থা */}
        {item.link && (
          <a
            href={item.link}
            target={item.link.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 cursor-pointer"
            aria-label="ছবিতে ক্লিক করে লিংকে যান"
          />
        )}
      </div>
    )
  }

  // ৩. ভিডিও সেকশন (ভিডিও ফাইল অথবা ইউটিউব/ফেসবুক ভিডিও লিংক)
  if (item.type === 'video') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {embed ? (
          // সোশ্যাল ভিডিও এম্বেড প্লেয়ার (ইউটিউব/ফেসবুক)
          <iframe
            src={isActive ? embed.src : ''}
            className="w-full h-full aspect-video border-0 pointer-events-auto z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded Video Player"
          />
        ) : (
          // সরাসরি MP4 ভিডিও প্লেয়ার
          <video
            src={item.url}
            controls
            playsInline
            className="w-full h-full max-h-[620px] object-contain pointer-events-auto z-10"
          />
        )}

        {/* ভিডিওর সাথে আলাদা বহিঃস্থ লিংক থাকলে প্রদর্শনের বোতাম */}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-medium backdrop-blur transition-all border border-white/20 shadow-md"
          >
            <span>মূল লিংক দেখুন</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    )
  }

  // ৪. হাইপারলিংক প্রিভিউ (সোশ্যাল বা ওয়েবসাইট লিংক কার্ড)
  if (item.type === 'link_preview') {
    const targetUrl = item.external_url || item.url || item.link || '#'
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 sm:p-12">
        {embed ? (
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={isActive ? embed.src : ''}
              className="w-full h-full aspect-video border-0 pointer-events-auto rounded-xl shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Social Video Preview"
            />
          </div>
        ) : (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group max-w-lg w-full bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-green-500 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 text-left cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                <span>🔗 হাইপারলিংক প্রিভিউ</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-green-300 transition-colors line-clamp-2">
                {item.preview_title || targetUrl}
              </h3>
              {item.preview_desc && (
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-3">
                  {item.preview_desc}
                </p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400 group-hover:text-white">
              <span className="truncate max-w-[220px]">{targetUrl}</span>
              <span className="flex items-center gap-1 text-green-400 font-semibold">
                ভিজিট করুন <ExternalLink className="size-3.5" />
              </span>
            </div>
          </a>
        )}
      </div>
    )
  }

  return <div className="w-full h-full bg-slate-950" />
}

export default HeroMediaRenderer
