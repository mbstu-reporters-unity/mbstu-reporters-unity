'use client'

import { useEffect, useId } from 'react'
import { CalendarDays, Newspaper, UserRound, X } from 'lucide-react'
import type { Club } from '@/lib/data'

export function ClubReportsDialog({ club, onClose }: { club: Club | null; onClose: () => void }) {
  const titleId = useId()

  useEffect(() => {
    if (!club) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [club, onClose])

  if (!club) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close reports"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-navy/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative bg-brand px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {club.tag}
          </span>
          <h2 id={titleId} className="mt-3 pr-8 font-serif text-xl font-bold">
            {club.name}
          </h2>
          <p className="text-sm text-white/80">{club.nameBn}</p>
        </div>
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
            <Newspaper className="size-4" aria-hidden="true" />
            Club Reports / ক্লাব প্রতিবেদন
          </h3>
          <ul className="mt-4 space-y-3">
            {club.reports.map((r) => (
              <li key={r.title} className="rounded-xl border border-border p-4 transition-colors hover:border-brand">
                <p className="font-serif font-bold leading-snug text-navy">{r.title}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {r.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="size-3.5" aria-hidden="true" />
                    {r.reporter}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
