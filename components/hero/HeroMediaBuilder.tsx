'use client'

import React from 'react'
import type { SubMediaItem, SubMediaType } from '@/lib/hero'
import { Plus, Trash2, Palette, Image as ImageIcon, Video, Link2, Upload } from 'lucide-react'

interface HeroMediaBuilderProps {
  mediaItems: SubMediaItem[]
  setMediaItems: (items: SubMediaItem[]) => void
  slideDuration: number
  setSlideDuration: (duration: number) => void
  slideSpeedPct: number
  setSlideSpeedPct: (pct: number) => void
  onFileUpload: (idx: number, file: File) => Promise<void>
  busy: boolean
}

const inpStyle = "w-full border border-slate-700 rounded-xl px-3.5 py-2 text-xs bg-slate-950 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"

export function HeroMediaBuilder({
  mediaItems,
  setMediaItems,
  slideDuration,
  setSlideDuration,
  slideSpeedPct,
  setSlideSpeedPct,
  onFileUpload,
  busy,
}: HeroMediaBuilderProps) {

  // নতুন মিডিয়া সাব-স্লাইড যোগ করা
  const addMedia = (type: SubMediaType) => {
    const newItem: SubMediaItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      color: '#0f172a',
      gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
      url: '',
      link: '',
      external_url: '',
      preview_title: '',
      preview_desc: '',
    }
    setMediaItems([...mediaItems, newItem])
  }

  // মিডিয়া সাব-স্লাইড মুছে ফেলা
  const removeMedia = (idx: number) => {
    if (mediaItems.length <= 1) return
    setMediaItems(mediaItems.filter((_, i) => i !== idx))
  }

  // যেকোনো ফিল্ড আপডেট করা
  const updateItem = (idx: number, field: keyof SubMediaItem, val: string) => {
    const updated = [...mediaItems]
    updated[idx] = { ...updated[idx], [field]: val }
    setMediaItems(updated)
  }

  // ০ থেকে ১০০% স্লাইডার দিয়ে সময়কাল নির্ধারণ
  const handleSpeedChange = (pct: number) => {
    setSlideSpeedPct(pct)
    // ০% = ১ সেকেন্ড (খুব দ্রুত), ৫০% = ৮ সেকেন্ড, ১০০% = ১৫ সেকেন্ড
    const calculatedMs = Math.round(1000 + (pct / 100) * 14000)
    setSlideDuration(calculatedMs)
  }

  return (
    <div className="space-y-4">
      {/* ৪টি মিডিয়া টাইপ বাছাই করার বোতাম */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap gap-2 items-center justify-between">
        <span className="text-xs font-semibold text-gray-300">নতুন স্লাইড মিডিয়া যোগ করুন:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => addMedia('color')}
            className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/60 text-purple-200 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Palette className="size-3.5" />
            <span>১. কালার/RGB</span>
          </button>
          <button
            type="button"
            onClick={() => addMedia('image')}
            className="px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-200 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ImageIcon className="size-3.5" />
            <span>২. ছবি</span>
          </button>
          <button
            type="button"
            onClick={() => addMedia('video')}
            className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-200 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Video className="size-3.5" />
            <span>৩. ভিডিও</span>
          </button>
          <button
            type="button"
            onClick={() => addMedia('link_preview')}
            className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Link2 className="size-3.5" />
            <span>৪. লিংক প্রিভিউ</span>
          </button>
        </div>
      </div>

      {/* তৈরি হওয়া সাব-স্লাইডগুলোর তালিকা */}
      <div className="space-y-3">
        {mediaItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative shadow-inner"
          >
            <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
              <span className="font-bold text-green-400">
                স্লাইড #{idx + 1} —{' '}
                {item.type === 'color' && '🎨 কালার ব্যাকগ্রাউন্ড'}
                {item.type === 'image' && '🖼️ ছবি'}
                {item.type === 'video' && '🎥 ভিডিও'}
                {item.type === 'link_preview' && '🔗 হাইপারলিংক প্রিভিউ'}
              </span>
              {mediaItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 cursor-pointer transition-all"
                  title="এই স্লাইডটি মুছুন"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            {/* ধরন ১: কালার / RGB / গ্রেডিয়েন্ট */}
            {item.type === 'color' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1">সলিড কালার (RGB বা Hex):</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={item.color || '#0f172a'}
                      onChange={(e) => updateItem(idx, 'color', e.target.value)}
                      className="size-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      className={inpStyle}
                      value={item.color || ''}
                      placeholder="#0f172a বা rgb(15, 23, 42)"
                      onChange={(e) => updateItem(idx, 'color', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1">অথবা গ্রেডিয়েন্ট CSS:</span>
                  <input
                    className={inpStyle}
                    value={item.gradient || ''}
                    placeholder="linear-gradient(135deg, #1e293b, #0f172a)"
                    onChange={(e) => updateItem(idx, 'gradient', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ধরন ২: ছবি */}
            {item.type === 'image' && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-gray-400 block">কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন অথবা সরাসরি লিঙ্ক দিন:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-gray-300 hover:bg-slate-800 cursor-pointer shrink-0">
                    <Upload className="size-3.5 text-blue-400" />
                    <span>ফাইল বাছাই করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={busy}
                      onChange={(e) => e.target.files?.[0] && onFileUpload(idx, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <input
                    className={inpStyle}
                    placeholder="অথবা ছবির ওয়েব লিংক পেস্ট করুন (https://...)"
                    value={item.url || ''}
                    onChange={(e) => updateItem(idx, 'url', e.target.value)}
                  />
                </div>
                {item.url && (
                  <div className="text-[11px] text-green-400 truncate">
                    ছবি লিঙ্ক: {item.url}
                  </div>
                )}
              </div>
            )}

            {/* ধরন ৩: ভিডিও */}
            {item.type === 'video' && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-gray-400 block">ভিডিও ফাইল আপলোড অথবা ইউটিউব/ফেসবুক ভিডিও লিংক:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-gray-300 hover:bg-slate-800 cursor-pointer shrink-0">
                    <Upload className="size-3.5 text-red-400" />
                    <span>ভিডিও ফাইল</span>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={busy}
                      onChange={(e) => e.target.files?.[0] && onFileUpload(idx, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <input
                    className={inpStyle}
                    placeholder="ইউটিউব, ফেসবুক বা সরাসরি MP4 ভিডিও লিংক (https://...)"
                    value={item.url || ''}
                    onChange={(e) => updateItem(idx, 'url', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ধরন ৪: হাইপারলিংক প্রিভিউ */}
            {item.type === 'link_preview' && (
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] text-gray-400 block">সোশ্যাল বা ওয়েবসাইট লিংক (হোম পেজে প্রিভিউ কার্ড হবে):</span>
                <input
                  className={inpStyle}
                  placeholder="টার্গেট ওয়েবসাইট বা ফেসবুক/এক্স পোস্ট লিংক (https://...)"
                  value={item.external_url || ''}
                  onChange={(e) => updateItem(idx, 'external_url', e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className={inpStyle}
                    placeholder="প্রিভিউ শিরোনাম (ঐচ্ছিক)"
                    value={item.preview_title || ''}
                    onChange={(e) => updateItem(idx, 'preview_title', e.target.value)}
                  />
                  <input
                    className={inpStyle}
                    placeholder="প্রিভিউ সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)"
                    value={item.preview_desc || ''}
                    onChange={(e) => updateItem(idx, 'preview_desc', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* প্রতিটি স্লাইডের নিজস্ব ঐচ্ছিক বহিঃস্থ লিংক */}
            <div className="pt-2 border-t border-slate-850">
              <span className="text-[11px] text-gray-400 block mb-1">
                🔗 এই স্লাইডে দর্শক ক্লিক করলে কোথায় যাবে? (ঐচ্ছিক সোশ্যাল বা ওয়েব লিংক):
              </span>
              <input
                className={inpStyle}
                placeholder="যেমন: https://facebook.com/... বা /post/123"
                value={item.link || ''}
                onChange={(e) => updateItem(idx, 'link', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* স্লাইড গতি ও সময়কাল নিয়ন্ত্রণ (০ থেকে ১০০% স্লাইডার) */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300 font-medium">
            ⏱️ স্লাইডের গতি ও সময় নিয়ন্ত্রণ (Duration):
          </span>
          <span className="text-green-400 font-bold bg-green-950/60 border border-green-800/60 px-2 py-0.5 rounded">
            {slideSpeedPct}% ({(slideDuration / 1000).toFixed(1)} সেকেন্ড পর পর পরিবর্তন)
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={slideSpeedPct}
          onChange={(e) => handleSpeedChange(Number(e.target.value))}
          className="w-full accent-green-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>০% (১ সেকেন্ড - দ্রুত)</span>
          <span>৫০% (৮ সেকেন্ড - স্বাভাবিক)</span>
          <span>১০০% (১৫ সেকেন্ড - ধীর)</span>
        </div>
      </div>
    </div>
  )
}

export default HeroMediaBuilder
