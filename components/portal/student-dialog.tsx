'use client'

import { useEffect, useState } from 'react'
import { X, Share2, Check, GraduationCap, CalendarDays, MessageSquareQuote, Feather, Award, BookOpen } from 'lucide-react'
import type { StudentItem } from '@/lib/sb'
import { getImages } from '@/lib/sb'
import { ReactionBar } from './reaction-bar'

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

    // ইমেজ লোড
    getImages('student', item.id).then((rows) => {
      if (rows.length > 0) {
        setImages(rows.map((r) => r.url))
      } else if (item.image_url) {
        setImages([item.image_url])
      } else {
        setImages([])
      }
    })

    // লোকাল কমেন্ট লোড
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
        className="animate-in fade-in absolute inset-0 bg-navy/80 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="animate-in zoom-in-95 fade-in relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl border border-border"
      >
        {/* হেডার */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-5 py-3.5 backdrop-blur">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson/10 px-2.5 py-1 text-xs font-bold text-crimson">
            <Icon className="size-3.5" />
            {item.kind}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* শিরোনাম */}
          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-navy">
            {item.title}
          </h2>

          {/* লেখক পরিচিতি */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3 text-xs text-muted-foreground">
            {item.author && <span className="font-bold text-navy text-sm">{item.author}</span>}
            {item.dept && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-brand">
                <GraduationCap className="size-3" /> {item.dept}
              </span>
            )}
            {item.batch && (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-semibold text-[#8a6a0a]">
                {item.batch}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1">
              <CalendarDays className="size-3 text-gold" />
              {new Date(item.created_at).toLocaleDateString('bn-BD')}
            </span>
          </div>

          {/* ছবি / ছবির গ্যালারি */}
          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={item.title}
                  className="w-full max-h-96 rounded-2xl object-cover bg-gray-100 shadow-sm"
                />
              ))}
            </div>
          )}

          {/* মূল লেখা / বিবরণ */}
          {item.excerpt && (
            <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-navy/90 py-2">
              {item.excerpt}
            </div>
          )}

          {/* বহিঃস্থ লিংক (যদি থাকে) */}
          {item.link_url && (
            <div className="pt-1">
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                🔗 মূল প্রকাশিত লিংক দেখুন →
              </a>
            </div>
          )}

          {/* শেয়ার বার */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-50 p-3 border">
            <span className="text-xs font-bold text-gray-700">শেয়ার করুন:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-lg bg-white border px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-soft"
              >
                {copied ? <Check className="size-3 text-green-600" /> : <Share2 className="size-3" />}
                {copied ? 'কপি হয়েছে!' : 'লিংক'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(item.title + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-semibold hover:bg-emerald-700"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-600 text-white px-2.5 py-1 text-xs font-semibold hover:bg-blue-700"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* রিঅ্যাকশন বার */}
          <ReactionBar postId={item.id} title={item.title} />

          {/* কমেন্ট সেকশন */}
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
              মন্তব্য ({comments.length})
            </h4>

            {comments.map((c, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-2.5 text-xs space-y-1">
                <p className="font-bold text-navy flex justify-between">
                  <span>{c.name}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{c.time}</span>
                </p>
                <p className="text-gray-700 leading-relaxed">{c.text}</p>
              </div>
            ))}

            <div className="space-y-2 pt-1">
              <input
                className="w-full rounded-xl border px-3 py-1.5 text-xs bg-white"
                placeholder="আপনার নাম (ঐচ্ছিক)"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
              />
              <textarea
                rows={2}
                className="w-full rounded-xl border px-3 py-1.5 text-xs bg-white"
                placeholder="এই লেখার ওপর আপনার মন্তব্য লিখুন..."
                value={cText}
                onChange={(e) => setCText(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="rounded-xl bg-green-700 text-white px-4 py-1.5 text-xs font-bold hover:bg-green-800"
              >
                মন্তব্য পাঠান
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
