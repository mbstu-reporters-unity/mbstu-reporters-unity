'use client'

import React from 'react'
import type { HeroSettings } from '@/lib/hero'
import { ArrowRight } from 'lucide-react'

interface HeroBreakingBannerProps {
  settings: HeroSettings | null
}

export function HeroBreakingBanner({ settings }: HeroBreakingBannerProps) {
  // যদি এডমিন ব্রেকিং মোড বন্ধ রাখে, তবে এই কম্পোনেন্ট কোনো জায়গা নেবে না (০ হাইট)
  // ফলে নিচের স্লাইডার স্বয়ংক্রিয়ভাবে সরাসরি উপরে উঠে আসবে
  if (!settings?.breaking_on) {
    return null
  }

  const bgStyle = {
    background: `linear-gradient(135deg, ${settings.breaking_bg_color || '#881337'}, ${settings.breaking_bg_gradient || '#0f172a'})`,
  }

  return (
    <section
      style={bgStyle}
      aria-label="জরুরি ব্রেকিং নিউজ"
      className="relative w-full py-4 sm:py-5 px-4 sm:px-8 border-b border-red-900/60 shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/95 text-white text-xs font-bold tracking-wider shadow-md">
            <span className="size-2 rounded-full bg-white animate-ping" />
            <span>ব্রেকিং নিউজ</span>
          </div>

          {settings.breaking_title && (
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow leading-snug">
              {settings.breaking_title}
            </h2>
          )}

          {settings.breaking_text && (
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
              {settings.breaking_text}
            </p>
          )}
        </div>

        {settings.breaking_link && (
          <a
            href={settings.breaking_link}
            target={settings.breaking_link.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-red-50 text-red-700 font-semibold text-xs transition-all shadow-lg shrink-0 cursor-pointer"
          >
            <span>{settings.breaking_btn_text || 'বিস্তারিত'}</span>
            <ArrowRight className="size-3.5" />
          </a>
        )}
      </div>
    </section>
  )
}

export default HeroBreakingBanner
