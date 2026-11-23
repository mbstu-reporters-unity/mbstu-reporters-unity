'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Bookmark, Trash2, X, ExternalLink, CalendarDays, BookOpen } from 'lucide-react'
import { useBookmarks } from '@/lib/bookmarks'
import { useLang } from '@/lib/i18n'

export function BookmarksDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { bookmarks, remove, clear, count } = useBookmarks()
  const { pick } = useLang()
  const boxRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-modal-title"
        className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-white/20 bg-slate-900/95 text-white shadow-2xl backdrop-blur-2xl overflow-hidden glass-card"
      >
        {/* হেডার */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Bookmark className="size-4.5 fill-cyan-400" />
            </div>
            <div>
              <h2 id="bookmarks-modal-title" className="font-serif text-base sm:text-lg font-bold leading-tight">
                {pick('সংরক্ষিত সংবাদ', 'Saved Articles')}
              </h2>
              <p className="text-[11px] text-cyan-200/80">
                {count > 0
                  ? pick(`মোট ${count}টি সংবাদ সংরক্ষিত`, `${count} articles saved`)
                  : pick('কোনো সংবাদ সংরক্ষিত নেই', 'No articles saved')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {count > 0 && (
              <button
                type="button"
                onClick={clear}
                title={pick('সব মুছুন', 'Clear all')}
                className="text-[11px] font-semibold text-rose-300 hover:text-rose-200 px-2 py-1 rounded-lg hover:bg-rose-500/15 transition cursor-pointer"
              >
                {pick('সব মুছুন', 'Clear all')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={pick('বন্ধ করুন', 'Close')}
              className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* বডি / তালিকা */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {count === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="flex size-14 items-center justify-center rounded-full bg-white/10 text-white/50 mx-auto">
                <BookOpen className="size-7" />
              </div>
              <h3 className="font-bold text-sm text-white/90">
                {pick('এখনো কোনো সংবাদ সংরক্ষণ করা হয়নি', 'No bookmarks yet')}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {pick(
                  'যেকোনো সংবাদের কার্ডে থাকা বুকমার্ক আইকনে ক্লিক করে পরবর্তীতে পড়ার জন্য এখানে জমা রাখতে পারবেন।',
                  'Click the bookmark icon on any news card to save articles for later reading.'
                )}
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="group relative flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-all shadow-xs"
              >
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image_url}
                    alt=""
                    className="size-16 sm:size-18 rounded-xl object-cover shrink-0 bg-slate-950 border border-white/10"
                  />
                ) : (
                  <div className="flex size-16 sm:size-18 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-white/10 shrink-0 text-cyan-300">
                    <Bookmark className="size-6 opacity-60" />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-6">
                  {b.category && (
                    <span className="inline-block text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                      {b.category}
                    </span>
                  )}
                  <Link
                    href={`/post/${b.id}`}
                    onClick={onClose}
                    className="block text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors line-clamp-2 leading-snug"
                  >
                    {b.title}
                  </Link>
                  {b.author && (
                    <p className="text-[11px] text-slate-300 mt-1 truncate">
                      {b.author}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  title={pick('মুছুন', 'Remove')}
                  className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/15 transition cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ফুটার */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
          <span>{pick('আপনার ব্রাউজারে সংরক্ষিত থাকে', 'Saved locally in your browser')}</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-cyan-300 hover:underline cursor-pointer"
          >
            {pick('বন্ধ করুন', 'Close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
