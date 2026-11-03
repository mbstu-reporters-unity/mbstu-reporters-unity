'use client'

import React from 'react'
import type { SubMediaItem } from '@/lib/hero'
import { ExternalLink, Play } from 'lucide-react'

interface HeroMediaRendererProps {
  item: SubMediaItem
  fitMode?: 'contain' | 'cover'
  isActive: boolean
}

// ইউটিউব ও ফেসবুক এম্বেড রূপান্তর
function getEmbedDetails(url?: string) {
  if (!url || typeof url !== 'string') return null
  const cleanUrl = url.trim()

  // ইউটিউব লিংক শনাক্তকরণ
  const ytMatch = cleanUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&controls=1&playsinline=1`,
    }
  }

  // ফেসবুক ভিডিও লিংক শনাক্তকরণ
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

  // ১. কালার ব্যাকগ্রাউন্ড (সলিড RGB বা গ্রেডিয়েন্ট)
  if (item.type === 'color') {
    const bgStyle = {
      background: item.gradient || item.color || '#0f172a',
    }
    return (
      <div className="relative w-full h-full" style={bgStyle}>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 cursor-pointer"
            aria-label="ভিজিট করুন"
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
          className={`w-full h-full transition-all duration-700 ${
            fitMode === 'cover' ? 'object-cover' : 'object-contain'
          }`}
          loading="eager"
        />
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 cursor-pointer"
            aria-label="ছবিতে ক্লিক করে লিংকে যান"
          />
        )}
      </div>
    )
  }

  // ৩. ভিডিও সেকশন (ভিডিও ফাইল অথবা সোশ্যাল ভিডিও লিংক)
  if (item.type === 'video') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {embed ? (
          // যদি ইউটিউব বা ফেসবুক ভিডিও হয়
          <iframe
            src={isActive ? embed.src : ''}
            className="w-full h-full aspect-video border-0 pointer-events-auto z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
        ) : (
          // যদি সরাসরি MP4 ফাইল বা আপলোড করা ভিডিও হয়
          <video
            src={item.url}
            controls
            playsInline
            className="w-full h-full max-h-[620px] object-contain pointer-events-auto z-10"
          />
        )}

        {/* ঐচ্ছিক লিংক গার্ড (যদি ভিডিওর সাথে আলাদা বহিঃস্থ লিংক থাকে) */}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur transition-all border border-white/20"
          >
            <span>মূল লিংক দেখুন</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    )
  }

  // ৪. হাইপারলিংক প্রিভিউ (সোশ্যাল বা ওয়েবসাইট লিংক কার্ড প্রিভিউ)
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
