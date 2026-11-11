'use client'

import { useEffect, useState } from 'react'
import { X, Share2, Check, GraduationCap, CalendarDays, MessageSquareQuote, Feather, Award, BookOpen, Send } from 'lucide-react'
import type { StudentItem } from '@/lib/sb'
import { getImages } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'
import { UniversalMediaEmbed } from './universal-media-embed'

const kindIcons: Record<string, any> = {
  Opinion: MessageSquareQuote,
  'Creative Writing': Feather,
  Achievement: Award,
  'Research Highlight': BookOpen,
}

export function StudentDialog({
  item,
  onClose,
}: {
  item: StudentItem | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [comments, setComments] = useState<Array<{ name: string; text: string; time: string }>>([])
  const [cName, setCName] = useState('')
  const [cText, setCText] = useState('')

  useEffect(() => {
    if (!item) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    getImages('student', item.id).then((rows) => {
      if (rows.length > 0) {
        setImages(rows.map((r) => r.url))
      } else if (item.image_url) {
        setImages([item.image_url])
      } else {
        setImages([])
      }
    })

    try {
      const saved = localStorage.getItem(`student_comments_${item.id}`)
      if (saved) setComments(JSON.parse(saved))
    } catch {}

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  if (!item) return null

  const Icon = kindIcons[item.kind] || MessageSquareQuote
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/student-corner?id=${item.id}` : ''

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: `${item?.title} - ${item?.author || 'স্টুডেন্ট কর্নার'}`,
          url: shareUrl,
        })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function handleAddComment() {
    if (!cText.trim()) return
    const newC = {
      name: cName.trim() || 'নামহীন পাঠক',
      text: cText.trim(),
      time: 'এইমাত্র',
    }
    const updated = [...comments, newC]
    setComments(updated)
    try {
      localStorage.setItem(`student_comments_${item!.id}`, JSON.stringify(updated))
    } catch {}
    setCText('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* ব্যাকড্রপ */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="animate-in zoom-in-95 fade-in relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/20 bg-slate-950/95 text-white shadow-2xl backdrop-blur-2xl scrollbar-none"
      >
        {/* হেডার */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/15 bg-slate-900/90 px-5 py-3.5 backdrop-blur">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-3 py-1 text-xs font-bold">
            <Icon className="size-3.5" />
            {item.kind}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-white drop-shadow-md">
            {item.title}
          </h2>

          <div className="flex flex-wrap items-center gap-2 border-b border-white/15 pb-3 text-xs text-slate-300">
            {item.author && <span className="font-bold text-white text-sm">{item.author}</span>}
            {item.dept && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/20 px-2.5 py-0.5 font-semibold text-cyan-200">
                <GraduationCap className="size-3" /> {item.dept}
              </span>
            )}
            {item.batch && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-semibold text-amber-300 border border-white/15">
                {item.batch}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-cyan-200/80">
              <CalendarDays className="size-3 text-cyan-400" />
              {new Date(item.created_at).toLocaleDateString('bn-BD')}
            </span>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={item.title}
                  className="w-full max-h-96 rounded-2xl object-cover bg-black/40 border border-white/15 shadow-sm"
                />
              ))}
            </div>
          )}

          {item.excerpt && (
            <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-100 py-1">
              {item.excerpt}
            </div>
          )}

          {item.embed_media_url && (
            <UniversalMediaEmbed url={item.embed_media_url} title={item.title} />
          )}

          {item.link_url && (
            <div className="pt-1">
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:underline"
              >
                🔗 মূল প্রকাশিত লিংক দেখুন →
              </a>
            </div>
          )}

          {/* শেয়ার বার */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 p-3 border border-white/15">
            <span className="text-xs font-bold text-white/80">শেয়ার করুন:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 text-xs font-bold text-white cursor-pointer"
              >
                {copied ? <Check className="size-3 text-cyan-300" /> : <Share2 className="size-3" />}
                {copied ? 'কপি হয়েছে!' : 'লিংক'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(item.title + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 text-xs font-semibold"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 text-xs font-semibold"
              >
                Facebook
              </a>
            </div>
          </div>

          <ReactionBar postId={item.id} title={item.title} />

          {/* কমেন্ট সেকশন */}
          <div className="space-y-3 pt-3 border-t border-white/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              মন্তব্য ({comments.length})
            </h4>

            {comments.map((c, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs space-y-1">
                <p className="font-bold text-white flex justify-between">
                  <span>{c.name}</span>
                  <span className="text-[10px] text-white/50">{c.time}</span>
                </p>
                <p className="text-slate-200 leading-relaxed">{c.text}</p>
              </div>
            ))}

            <div className="space-y-2 pt-1">
              <input
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                placeholder="আপনার নাম (ঐচ্ছিক)"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
              />
              <textarea
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                placeholder="এই লেখার ওপর আপনার মন্তব্য লিখুন..."
                value={cText}
                onChange={(e) => setCText(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-1.5 text-xs font-bold cursor-pointer shadow"
              >
                <Send className="size-3" />
                <span>মন্তব্য পাঠান</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
