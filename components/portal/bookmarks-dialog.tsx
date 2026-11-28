'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Bookmark, Trash2, X, BookOpen } from 'lucide-react'
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
        className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] shadow-2xl backdrop-blur-2xl overflow-hidden glass-card"
      >
        {/* হেডার */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--theme-card-border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--theme-brand-soft)] text-[var(--theme-brand)] border border-[var(--theme-card-border)]">
              <Bookmark className="size-4.5 fill-[var(--theme-brand)]" />
            </div>
            <div>
              <h2 id="bookmarks-modal-title" className="font-serif text-base sm:text-lg font-bold leading-tight text-[var(--theme-text-title)]">
                {pick('সংরক্ষিত সংবাদ', 'Saved Articles')}
              </h2>
              <p className="text-[11px] text-[var(--theme-text-body)] opacity-75">
                {count > 0
                  ? pick(`সংরক্ষিত সংবাদ: ${count}টি`, `${count} articles saved`)
                  : pick('কোনো সংবাদ সংরক্ষিত নেই', 'No articles saved')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {count > 0 && (
              <button
                type="button"
                onClick={clear}
                title={pick('সংরক্ষিত সব সংবাদ সরান', 'Remove all saved articles')}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              >
                {pick('সব সংবাদ সরান', 'Remove all')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={pick('বন্ধ করুন', 'Close')}
              className="flex size-8 items-center justify-center rounded-full bg-[var(--theme-brand-soft)] text-[var(--theme-text-title)] hover:bg-[var(--theme-brand)] hover:text-white transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* বডি / তালিকা */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {count === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="flex size-14 items-center justify-center rounded-full bg-[var(--theme-brand-soft)] text-[var(--theme-brand)] mx-auto">
                <BookOpen className="size-7" />
              </div>
              <h3 className="font-bold text-sm text-[var(--theme-text-title)]">
                {pick('এখনো কোনো সংবাদ সংরক্ষিত হয়নি', 'No articles have been saved yet')}
              </h3>
              <p className="text-xs text-[var(--theme-text-body)] max-w-xs mx-auto leading-relaxed">
                {pick(
                  'পরে পড়ার জন্য যেকোনো সংবাদের পাশে থাকা সংরক্ষণ আইকনটি নির্বাচন করুন।',
                  'Select the save icon beside an article to keep it for later reading.'
                )}
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="group relative flex items-start gap-3 rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-3 hover:border-[var(--theme-brand)] transition-all shadow-xs"
              >
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image_url}
                    alt=""
                    className="size-16 sm:size-18 rounded-xl object-cover shrink-0 bg-slate-900 border border-[var(--theme-card-border)]"
                  />
                ) : (
                  <div className="flex size-16 sm:size-18 items-center justify-center rounded-xl bg-[var(--theme-brand-soft)] border border-[var(--theme-card-border)] shrink-0 text-[var(--theme-brand)]">
                    <Bookmark className="size-6 opacity-60" />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-6">
                  {b.category && (
                    <span className="inline-block text-[10px] font-bold text-[var(--theme-brand)] uppercase tracking-wider mb-1">
                      {b.category}
                    </span>
                  )}
                  <Link
                    href={`/post/${b.id}`}
                    onClick={onClose}
                    className="block text-xs sm:text-sm font-bold text-[var(--theme-text-title)] hover:text-[var(--theme-brand)] transition-colors line-clamp-2 leading-snug"
                  >
                    {b.title}
                  </Link>
                  {b.author && (
                    <p className="text-[11px] text-[var(--theme-text-body)] opacity-75 mt-1 truncate">
                      {b.author}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  title={pick('মুছুন', 'Remove')}
                  className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ফুটার */}
        <div className="px-5 py-3 border-t border-[var(--theme-card-border)] bg-[var(--theme-card-bg)]/80 flex items-center justify-between text-[11px] text-[var(--theme-text-body)] shrink-0">
          <span>{pick('তথ্য আপনার ব্রাউজারেই সংরক্ষিত থাকে', 'Saved in your browser')}</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[var(--theme-brand)] hover:underline cursor-pointer"
          >
            {pick('বন্ধ করুন', 'Close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
