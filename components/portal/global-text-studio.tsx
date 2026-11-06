'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  Sparkles,
  X,
  Check,
  Bold,
  Italic,
  Highlighter,
  Quote,
  Palette,
  Eraser,
} from 'lucide-react'

export function GlobalTextStudio() {
  const [activeEl, setActiveEl] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [visualContent, setVisualContent] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  // পুরো সাইটের যেকোনো ইনপুট বা টেক্সট এরিয়া ফোকাস হলে তা শনাক্ত করা
  useEffect(() => {
    function handleFocus(e: FocusEvent) {
      const target = e.target
      if (target instanceof HTMLTextAreaElement) {
        // স্টুডিওর ভেতরের নিজস্ব বক্স হলে ইগনোর করবে
        if (target.closest('.text-studio-modal')) return

        setActiveEl(target)
        // প্রাথমিক টেক্সট লোড করা (এইচটিএমএল কোড বা শর্টকোড থাকলে তা সরাসরি ডিজাইনে বদলে নেওয়া)
        let clean = target.value || ''
        clean = clean.replace(/\[gold\](.*?)\[\/gold\]/gi, '<span class="text-gold-gradient font-bold">$1</span>')
        clean = clean.replace(/\[green\](.*?)\[\/green\]/gi, '<span class="text-green-gradient font-bold">$1</span>')
        clean = clean.replace(/\[red\](.*?)\[\/red\]/gi, '<span class="text-red-gradient font-bold">$1</span>')
        clean = clean.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>')
        clean = clean.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>')
        clean = clean.replace(/\[highlight\](.*?)\[\/highlight\]/gi, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
        clean = clean.replace(/\[quote\](.*?)\[\/quote\]/gi, '<blockquote class="border-l-4 border-emerald-600 bg-emerald-50 p-2 italic my-2">$1</blockquote>')
        setVisualContent(clean)
      }
    }

    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  // পপআপ খোলার সাথে সাথে ভিজ্যুয়াল এডিটরে টেক্সট সিঙ্ক করা
  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.innerHTML = visualContent
      editorRef.current.focus()
    }
  }, [isOpen])

  // সরাসরি লাইভ স্টাইল প্রয়োগ (কোনো কোড দেখতে হবে না)
  function applyLiveStyle(styleType: 'gold' | 'green' | 'red' | 'bold' | 'italic' | 'highlight' | 'quote' | 'clear') {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      alert("আগে আঙুল দিয়ে লেখার যেকোনো শব্দ বা অংশ সিলেক্ট (Select) করুন!")
      return
    }

    const range = selection.getRangeAt(0)

    if (styleType === 'clear') {
      const text = range.toString()
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      return
    }

    const span = document.createElement(styleType === 'quote' ? 'blockquote' : 'span')

    if (styleType === 'gold') {
      span.className = 'text-gold-gradient font-bold'
      span.style.background = 'linear-gradient(to right, #f59e0b, #eab308, #d97706)'
      span.style.webkitBackgroundClip = 'text'
      span.style.webkitTextFillColor = 'transparent'
      span.style.fontWeight = 'bold'
    } else if (styleType === 'green') {
      span.className = 'text-green-gradient font-bold'
      span.style.background = 'linear-gradient(to right, #059669, #0d9488, #047857)'
      span.style.webkitBackgroundClip = 'text'
      span.style.webkitTextFillColor = 'transparent'
      span.style.fontWeight = 'bold'
    } else if (styleType === 'red') {
      span.className = 'text-red-gradient font-bold'
      span.style.background = 'linear-gradient(to right, #dc2626, #e11d48)'
      span.style.webkitBackgroundClip = 'text'
      span.style.webkitTextFillColor = 'transparent'
      span.style.fontWeight = 'bold'
    } else if (styleType === 'bold') {
      span.style.fontWeight = 'bold'
    } else if (styleType === 'italic') {
      span.style.fontStyle = 'italic'
    } else if (styleType === 'highlight') {
      span.style.backgroundColor = '#fef08a'
      span.style.padding = '1px 4px'
      span.style.borderRadius = '4px'
      span.style.color = '#0f172a'
    } else if (styleType === 'quote') {
      span.style.borderLeft = '4px solid #059669'
      span.style.backgroundColor = '#ecfdf5'
      span.style.padding = '6px 10px'
      span.style.fontStyle = 'italic'
      span.style.display = 'block'
      span.style.margin = '6px 0'
    }

    span.appendChild(range.extractContents())
    range.insertNode(span)
    selection.removeAllRanges()

    if (editorRef.current) {
      setVisualContent(editorRef.current.innerHTML)
    }
  }

  // লেখা সম্পন্ন হলে কোনো কোড ছাড়াই মূল ফিল্ডে পাঠিয়ে দেওয়া
  function handleSaveAndApply() {
    if (!activeEl || !editorRef.current) return

    let finalHtml = editorRef.current.innerHTML

    // সাধারণ ফাঁকা ট্যাগগুলো পরিষ্কার করা
    if (finalHtml === '<br>') finalHtml = ''

    const nativeSetter = Object.getOwnPropertyDescriptor(
      activeEl instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value'
    )?.set

    nativeSetter?.call(activeEl, finalHtml)
    activeEl.dispatchEvent(new Event('input', { bubbles: true }))
    activeEl.dispatchEvent(new Event('change', { bubbles: true }))

    setIsOpen(false)
    activeEl.focus()
  }

  if (!activeEl) return null

  return (
    <>
      <style>{`
        .text-gold-gradient {
          background: linear-gradient(to right, #f59e0b, #eab308, #d97706) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          font-weight: bold;
        }
        .text-green-gradient {
          background: linear-gradient(to right, #059669, #0d9488, #047857) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          font-weight: bold;
        }
        .text-red-gradient {
          background: linear-gradient(to right, #dc2626, #e11d48) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          font-weight: bold;
        }
      `}</style>

      {/* স্ক্রিনে ভেসে থাকা সুন্দর ফ্লোটিং বাটন */}
      <button
        type="button"
        onClick={() => {
          if (activeEl) {
            setVisualContent(activeEl.value || '')
          }
          setIsOpen(true)
        }}
        className="fixed bottom-20 right-5 z-50 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xl ring-2 ring-white/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Sparkles className="size-4 text-yellow-300 animate-pulse" />
        <span>লাইভ স্টাইল প্যাড</span>
      </button>

      {/* সরাসরি লাইভ এডিটর (Google Docs / Word-এর মতো কোনো কোড ছাড়া) */}
      {isOpen && (
        <div className="text-studio-modal fixed inset-x-3 bottom-4 top-16 z-50 mx-auto max-w-lg rounded-3xl border border-emerald-600/30 bg-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in">
          
          {/* হেডার */}
          <div className="flex items-center justify-between border-b bg-emerald-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold">
                <Palette className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-800">লাইভ ভিজ্যুয়াল এডিটর</p>
                <p className="text-[10px] text-gray-500">শব্দ সিলেক্ট করে নিচে চাপুন—সরাসরি লাইভ রঙ হবে</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* লাইভ স্টাইল টুলবার (এক ক্লিকে কোনো কোড ছাড়াই রঙ হবে) */}
          <div className="flex flex-wrap items-center gap-1.5 border-b bg-gray-50 p-2.5 text-xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('gold') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 shadow-sm"
            >
              ✨ গোল্ডেন
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('green') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 shadow-sm"
            >
              🌿 সবুজ
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('red') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 font-bold hover:bg-rose-100 shadow-sm"
            >
              🔥 লাল
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('bold') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-white font-bold hover:bg-gray-100"
            >
              <Bold className="size-3.5" /> বোল্ড
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('italic') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-white italic hover:bg-gray-100"
            >
              <Italic className="size-3.5" /> ইটালিক
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('highlight') }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border bg-yellow-100 text-yellow-900 font-semibold"
            >
              <Highlighter className="size-3.5" /> হাইলাইট
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('quote') }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border bg-white text-gray-700"
            >
              <Quote className="size-3.5" /> কোট
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('clear') }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border bg-gray-100 text-gray-500 hover:text-red-600"
              title="রং মুছুন"
            >
              <Eraser className="size-3.5" />
            </button>
          </div>

          {/* সরাসরি লেখার ক্যানভাস (এখানে কোনো কোড থাকবে না, সরাসরি আসল রূপ দেখা যাবে) */}
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-full w-full outline-none text-sm text-gray-800 leading-relaxed font-sans"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              placeholder="এখানে লিখুন বা শব্দ সিলেক্ট করে সরাসরি ওপরে চাপ দিন..."
            />
          </div>

          {/* ফুটার বাটন */}
          <div className="border-t bg-gray-50 p-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-gray-400">
              💡 কোনো কোড নেই, পুরোটাই লাইভ ডিজাইন।
            </p>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer active:scale-95"
            >
              <Check className="size-4" />
              <span>✓ প্রয়োগ করুন</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
