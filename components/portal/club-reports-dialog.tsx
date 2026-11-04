'use client'

import { useEffect, useId } from 'react'
import { CalendarDays, Newspaper, UserRound, Users, X } from 'lucide-react'
import type { Club } from '@/lib/data'
import type { ClubItem } from '@/lib/clubs'

export function ClubReportsDialog({
  club,
  rawClub,
  onClose,
}: {
  club: Club | null
  rawClub?: ClubItem | null
  onClose: () => void
}) {
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

  const members = rawClub?.committee_members || []
  const term = rawClub?.committee_term
  const logo = rawClub?.logo_url

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
        {/* হেডার */}
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
          
          <div className="flex items-center gap-3">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 border shadow-sm shrink-0"
              />
            )}
            <div>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                {club.tag}
              </span>
              <h2 id={titleId} className="mt-1 font-serif text-xl font-bold">
                {club.name}
              </h2>
              {club.nameBn && <p className="text-sm text-white/80">{club.nameBn}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ==================== কমিটি সেকশন (যদি দেওয়া থাকে) ==================== */}
          {members.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
                  <Users className="size-4" aria-hidden="true" />
                  কার্যনির্বাহী পরিষদ / Committee
                </h3>
                {term && <span className="text-xs bg-brand-soft text-brand font-semibold px-2 py-0.5 rounded-full">{term}</span>}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 rounded-xl border p-2 bg-gray-50/70">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {m.name.charAt(0) || "স"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-navy truncate">{m.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== ক্লাব প্রতিবেদন সেকশন ==================== */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand border-b pb-2">
              <Newspaper className="size-4" aria-hidden="true" />
              Club Reports / ক্লাব প্রতিবেদন
            </h3>

            <ul className="mt-3 space-y-3">
              {club.reports.map((r, i) => (
                <li key={i} className="rounded-xl border border-border p-4 transition-colors hover:border-brand bg-white">
                  <p className="font-serif font-bold leading-snug text-navy text-sm sm:text-base">{r.title}</p>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-2">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <CalendarDays className="size-3.5 text-gold" aria-hidden="true" />
                      {r.date}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-brand">
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
    </div>
  )
}
