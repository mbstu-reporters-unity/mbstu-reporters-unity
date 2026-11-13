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

function toEditorHtml(raw: string): string {
  if (!raw) return ''
  let clean = raw
    .replace(/<\/?(script|iframe|object|embed|svg|form|input|button|style|link|meta|applet)[^>]*>/gi, '')
    .replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  clean = clean.replace(/\[gold\](.*?)\[\/gold\]/gi, '<span class="text-gold-gradient font-bold">$1</span>')
  clean = clean.replace(/\[green\](.*?)\[\/green\]/gi, '<span class="text-green-gradient font-bold">$1</span>')
  clean = clean.replace(/\[red\](.*?)\[\/red\]/gi, '<span class="text-red-gradient font-bold">$1</span>')
  clean = clean.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>')
  clean = clean.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>')
  clean = clean.replace(/\[highlight\](.*?)\[\/highlight\]/gi, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
  clean = clean.replace(/\[quote\](.*?)\[\/quote\]/gi, '<blockquote class="border-l-4 border-emerald-600 bg-emerald-50 p-2 italic my-2">$1</blockquote>')
  return clean
}

export function GlobalTextStudio() {
  const [activeEl, setActiveEl] = useState<HTMLTextAreaElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleFocus(e: FocusEvent) {
      const target = e.target
      if (target instanceof HTMLTextAreaElement) {
        if (target.closest('.text-studio-modal')) return
        setActiveEl(target)
      }
    }

    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  useEffect(() => {
    if (isOpen && editorRef.current && activeEl) {
      const html = toEditorHtml(activeEl.value || '')
      editorRef.current.innerHTML = html
      setIsEmpty(!editorRef.current.innerText.trim())
      editorRef.current.focus()
    }
  }, [isOpen, activeEl])

  function applyLiveStyle(
    styleType: 'gold' | 'green' | 'red' | 'bold' | 'italic' | 'highlight' | 'quote' | 'clear'
  ) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      alert('আগে আঙুল দিয়ে লেখার যেকোনো শব্দ বা অংশ সিলেক্ট (Select) করুন!')
      return
    }

    const range = selection.getRangeAt(0)

    if (styleType === 'clear') {
      const text = range.toString()
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      if (editorRef.current) setIsEmpty(!editorRef.current.innerText.trim())
      return
    }

    const el = document.createElement(styleType === 'quote' ? 'blockquote' : 'span')

    if (styleType === 'gold') {
      el.className = 'text-gold-gradient font-bold'
      el.style.background = 'linear-gradient(to right, #f59e0b, #eab308, #d97706)'
      el.style.setProperty('-webkit-background-clip', 'text')
      el.style.setProperty('-webkit-text-fill-color', 'transparent')
      el.style.fontWeight = 'bold'
    } else if (styleType === 'green') {
      el.className = 'text-green-gradient font-bold'
      el.style.background = 'linear-gradient(to right, #059669, #0d9488, #047857)'
      el.style.setProperty('-webkit-background-clip', 'text')
      el.style.setProperty('-webkit-text-fill-color', 'transparent')
      el.style.fontWeight = 'bold'
    } else if (styleType === 'red') {
      el.className = 'text-red-gradient font-bold'
      el.style.background = 'linear-gradient(to right, #dc2626, #e11d48)'
      el.style.setProperty('-webkit-background-clip', 'text')
      el.style.setProperty('-webkit-text-fill-color', 'transparent')
      el.style.fontWeight = 'bold'
    } else if (styleType === 'bold') {
      el.style.fontWeight = 'bold'
    } else if (styleType === 'italic') {
      el.style.fontStyle = 'italic'
    } else if (styleType === 'highlight') {
      el.style.backgroundColor = '#fef08a'
      el.style.padding = '1px 4px'
      el.style.borderRadius = '4px'
      el.style.color = '#0f172a'
    } else if (styleType === 'quote') {
      el.style.borderLeft = '4px solid #059669'
      el.style.backgroundColor = '#ecfdf5'
      el.style.color = '#0f172a'
      el.style.padding = '6px 10px'
      el.style.fontStyle = 'italic'
      el.style.display = 'block'
      el.style.margin = '6px 0'
    }

    el.appendChild(range.extractContents())
    range.insertNode(el)
    selection.removeAllRanges()

    if (editorRef.current) {
      setIsEmpty(!editorRef.current.innerText.trim())
    }
  }

  function handleSaveAndApply() {
    if (!activeEl || !editorRef.current) return

    let finalHtml = editorRef.current.innerHTML
    if (finalHtml === '<br>') finalHtml = ''

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
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

      {/* ফ্লোটিং বাটন */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xl ring-2 ring-white/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Sparkles className="size-4 text-yellow-300 animate-pulse" />
        <span>লাইভ স্টাইল প্যাড</span>
      </button>

      {/* লাইভ এডিটর পপআপ */}
      {isOpen && (
        <div className="text-studio-modal fixed inset-x-3 bottom-4 top-16 z-50 mx-auto max-w-lg rounded-3xl border border-emerald-600/30 bg-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in">

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
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 border-b bg-gray-50 p-2.5 text-xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('gold') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 shadow-sm cursor-pointer"
            >
              ✨ গোল্ডেন
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('green') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 shadow-sm cursor-pointer"
            >
              🌿 সবুজ
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('red') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 font-bold hover:bg-rose-100 shadow-sm cursor-pointer"
            >
              🔥 লাল
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('bold') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-white text-gray-800 font-bold hover:bg-gray-100 cursor-pointer"
            >
              <Bold className="size-3.5" /> বোল্ড
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('italic') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-white text-gray-800 italic hover:bg-gray-100 cursor-pointer"
            >
              <Italic className="size-3.5" /> ইটালিক
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('highlight') }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border bg-yellow-100 text-yellow-900 font-semibold cursor-pointer"
            >
              <Highlighter className="size-3.5" /> হাইলাইট
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('quote') }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border bg-white text-gray-700 cursor-pointer"
            >
              <Quote className="size-3.5" /> কোট
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyLiveStyle('clear') }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border bg-gray-100 text-gray-500 hover:text-red-600 cursor-pointer"
              title="রং মুছুন"
            >
              <Eraser className="size-3.5" />
            </button>
          </div>

          <div className="relative flex-1 p-4 overflow-y-auto bg-white">
            {isEmpty && (
              <p className="pointer-events-none absolute top-4 left-4 right-4 text-sm text-gray-400">
                এখানে লিখুন বা শব্দ সিলেক্ট করে ওপরে স্টাইল চাপুন...
              </p>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => {
                if (editorRef.current) setIsEmpty(!editorRef.current.innerText.trim())
              }}
              className="min-h-full w-full outline-none text-sm text-gray-800 leading-relaxed font-sans"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            />
          </div>

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
