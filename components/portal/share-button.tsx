'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${path}` : ''

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: title, url: shareUrl })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 text-[11px]">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1 rounded-md bg-white border px-2 py-1 font-semibold text-brand hover:bg-brand-soft"
      >
        {copied ? <Check className="size-3 text-green-600" /> : <Share2 className="size-3" />}
        {copied ? 'কপি হয়েছে' : 'লিংক'}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md bg-emerald-600 text-white px-2 py-1 font-semibold hover:bg-emerald-700"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md bg-blue-600 text-white px-2 py-1 font-semibold hover:bg-blue-700"
      >
        FB
      </a>
    </div>
  )
}
