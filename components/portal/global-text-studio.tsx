'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  Sparkles,
  Type,
  Palette,
  Code2,
  CheckCircle2,
  X,
  Heading1,
  Heading2,
  Quote,
  Calendar,
  Layers,
  Sliders,
  AlignLeft,
} from 'lucide-react'

export function GlobalTextStudio() {
  const [activeEl, setActiveEl] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'typography' | 'gradient' | 'tokens' | 'seo'>('typography')

  // রিয়েল-টাইম টেক্সট স্ট্যাটাস
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  // পুরো সাইটের যেকোনো ইনপুট বা টেক্সট এরিয়া ফোকাস হলে তা শনাক্ত করা
  useEffect(() => {
    function handleFocus(e: FocusEvent) {
      const target = e.target
      if (
        target instanceof HTMLInputElement &&
        (target.type === 'text' || target.type === 'search' || !target.type)
      ) {
        setActiveEl(target)
        updateCounts(target.value)
      } else if (target instanceof HTMLTextAreaElement) {
        setActiveEl(target)
        updateCounts(target.value)
      }
    }

    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  function updateCounts(text: string) {
    setCharCount(text.length)
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
  }

  // রিঅ্যাক্ট-সেফ উপায়ে ইনপুট ফিল্ডে টেক্সট ইনজেক্ট ও পরিবর্তন করা
  function applyTransform(transformFn: (selected: string, fullText: string) => string | { newText: string; selectOffset?: number }) {
    if (!activeEl) return

    const start = activeEl.selectionStart ?? activeEl.value.length
    const end = activeEl.selectionEnd ?? activeEl.value.length
    const fullText = activeEl.value
    const selected = fullText.slice(start, end)

    const result = transformFn(selected, fullText)
    let replacement = ''
    let nextText = ''

    if (typeof result === 'string') {
      replacement = result
      nextText = fullText.slice(0, start) + replacement + fullText.slice(end)
    } else {
      nextText = result.newText
    }

    // রিঅ্যাক্টের ভার্চুয়াল ডমের স্টেট ঠিক রাখার জন্য নেটিভ ইভেন্ট ডিসপ্যাচ
    const nativeSetter = Object.getOwnPropertyDescriptor(
      activeEl instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value'
    )?.set

    nativeSetter?.call(activeEl, nextText)
    activeEl.dispatchEvent(new Event('input', { bubbles: true }))
    activeEl.dispatchEvent(new Event('change', { bubbles: true }))

    updateCounts(nextText)
    activeEl.focus()
  }

  if (!activeEl) return null

  return (
    <>
      {/* স্ক্রিনে সবসময়ে দৃশ্যমান ছোট ফ্লোটিং বাটন */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 z-50 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-700 to-green-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xl ring-2 ring-white/50 transition-all hover:scale-105 active:scale-95"
        title="টেক্সট ফরম্যাটিং স্টুডিও"
      >
        <Sparkles className="size-4 animate-spin-slow text-yellow-300" />
        <span>টেক্সট টুলস</span>
      </button>

      {/* পপআপ ড্রপডাউন / বটম শিট */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-5 z-50 mx-auto max-w-lg rounded-3xl border border-border bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-20 sm:inset-x-auto sm:right-5 sm:w-96 animate-in slide-in-from-bottom-3 fade-in">
          
          {/* হেডার ও স্ট্যাটাস */}
          <div className="flex items-center justify-between border-b pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Sparkles className="size-4 text-emerald-700" />
              </span>
              <div>
                <p className="text-xs font-bold text-navy">স্মার্ট টেক্সট স্টুডিও</p>
                <p className="text-[10px] text-muted-foreground">
                  শব্দ: {wordCount} | অক্ষর: {charCount} | পড়ার সময়: ~{Math.ceil(wordCount / 180)} মিনিট
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* ৪টি বিভাগীয় ট্যাব */}
          <div className="flex border-b border-gray-100 pt-2 gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('typography')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'typography' ? 'bg-brand text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              টাইপো
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gradient')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'gradient' ? 'bg-brand text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              গ্রেডিয়েন্ট
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'tokens' ? 'bg-brand text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              টোকেন
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'seo' ? 'bg-brand text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              এসইও
            </button>
          </div>

          {/* ট্যাব কনটেন্ট */}
          <div className="py-3 max-h-64 overflow-y-auto space-y-2 text-xs">
            
            {/* ১. টাইপোগ্রাফি ও ফ্লুইড সাইজ */}
            {activeTab === 'typography' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyTransform((s) => `<b>${s || 'বোল্ড টেক্সট'}</b>`)}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left font-bold"
                >
                  B. বোল্ড (Bold)
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform((s) => `<i>${s || 'ইটালিক টেক্সট'}</i>`)}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left italic"
                >
                  I. ইটালিক (Italic)
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform((s) => `<mark class="bg-yellow-200 px-1 rounded">${s || 'হাইলাইটেড টেক্সট'}</mark>`)}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left"
                >
                  🖍️ টেক্সট হাইলাইট
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform((s) => `<span style="font-size: clamp(1.2rem, 3vw, 2.2rem); font-weight: bold;">${s || 'ফ্লুইড টাইটেল'}</span>`)}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left"
                >
                  📏 ফ্লুইড সাইজ (clamp)
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform((s) => `<div class="line-clamp-3">${s || 'দীর্ঘ অনুচ্ছেদ...'}</div>`)}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left col-span-2"
                >
                  ✂️ লাইন ক্ল্যাম্প (৩ লাইনে সীমাবদ্ধ)
                </button>
              </div>
            )}

            {/* ২. গ্রেডিয়েন্ট ও অ্যাডভান্সড ভিজ্যুয়াল */}
            {activeTab === 'gradient' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    applyTransform(
                      (s) =>
                        `<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">${
                          s || 'সবুজ গ্রেডিয়েন্ট টেক্সট'
                        }</span>`
                    )
                  }
                  className="w-full p-2.5 border rounded-xl text-left bg-gradient-to-r from-emerald-50 to-teal-50 hover:border-brand"
                >
                  🌿 রয়্যাল গ্রিন গ্রেডিয়েন্ট
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTransform(
                      (s) =>
                        `<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">${
                          s || 'গোল্ডেন শাইন টেক্সট'
                        }</span>`
                    )
                  }
                  className="w-full p-2.5 border rounded-xl text-left bg-gradient-to-r from-amber-50 to-yellow-50 hover:border-brand"
                >
                  ✨ গোল্ডেন শাইন গ্রেডিয়েন্ট
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTransform(
                      (s) =>
                        `<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">${
                          s || 'জরুরি ব্রেকিং টেক্সট'
                        }</span>`
                    )
                  }
                  className="w-full p-2.5 border rounded-xl text-left bg-gradient-to-r from-rose-50 to-red-50 hover:border-brand"
                >
                  🔥 ক্রিমসন রেড গ্রেডিয়েন্ট
                </button>
              </div>
            )}

            {/* ৩. স্মার্ট টোকেন ও ব্লক */}
            {activeTab === 'tokens' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyTransform(() => '২০২৬')}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left"
                >
                  📅 বর্তমান সাল (২০২৬)
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform(() => new Date().toLocaleDateString('bn-BD'))}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left"
                >
                  🗓️ আজকের বাংলা তারিখ
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform(() => 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়')}
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left col-span-2 truncate"
                >
                  🏛️ বিশ্ববিদ্যালয়ের পূর্ণ নাম
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTransform(
                      (s) =>
                        `<blockquote class="border-l-4 border-emerald-600 bg-emerald-50/60 p-3 rounded-r-xl italic my-2 font-serif text-gray-800">${
                          s || 'উদ্ধৃতি বা বক্তব্য এখানে লিখুন...'
                        }</blockquote>`
                    )
                  }
                  className="p-2 border rounded-xl hover:bg-brand-soft text-left col-span-2"
                >
                  💬 উদ্ধৃতি / কোটেশন ব্লক
                </button>
              </div>
            )}

            {/* ৪. এসইও ও অ্যাক্সেসিবিলিটি */}
            {activeTab === 'seo' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTransform((s) => `<h1 class="font-serif text-2xl font-bold my-2">${s || 'মূল শিরোনাম (H1)'}</h1>`)}
                    className="p-2 border rounded-xl hover:bg-brand-soft text-left font-bold"
                  >
                    H1 ট্যাগ (প্রধান শিরোনাম)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTransform((s) => `<h2 class="font-serif text-xl font-bold my-1.5">${s || 'উপশিরোনাম (H2)'}</h2>`)}
                    className="p-2 border rounded-xl hover:bg-brand-soft text-left font-bold"
                  >
                    H2 ট্যাগ (উপশিরোনাম)
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border space-y-1">
                  <p className="font-bold text-[11px] text-gray-700 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" /> WCAG 2.1 অ্যাক্সেসিবিলিটি গাইড:
                  </p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    সাদা ব্যাকগ্রাউন্ডে সবসময় গাঢ় সবুজ (#046A38) বা নেভি ব্লু (#0F172A) ব্যবহার করুন, যা দৃষ্টিপ্রতিবন্ধী ও সাধারণ সবার জন্য ৪.৫:১ কন্ট্রাস্ট নিশ্চিত করে।
                  </p>
                </div>
              </div>
            )}

          </div>

          <p className="text-[10px] text-gray-400 text-center border-t pt-1.5">
            💡 টেক্সট সিলেক্ট করে অপশনে চাপ দিলে সরাসরি স্টাইল হয়ে যাবে।
          </p>
        </div>
      )}
    </>
  )
}
