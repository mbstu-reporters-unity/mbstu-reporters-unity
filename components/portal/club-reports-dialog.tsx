'use client'

import { useEffect, useId, useState } from 'react'
import { CalendarDays, Check, Globe, Mail, Newspaper, Phone, Share2, UserRound, Users, X } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

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
  const reportsHeading = rawClub?.reports_title || "Club Reports / ক্লাব প্রতিবেদন"
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?club=${club.id}` : ''

  // শেয়ার হ্যান্ডলার
  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: club?.name,
          text: `${club?.name} (${club?.nameBn || ''}) - মাভাবিপ্রবি রিপোর্টার্স ইউনিটি`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* ব্যাকড্রপ */}
      <button
        type="button"
        aria-label="Close reports"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-navy/80 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl border border-border"
      >
        {/* হেডার ব্যানার */}
        <div className="relative bg-gradient-to-r from-brand to-brand-dark px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
          
          <div className="flex items-center gap-3.5 pr-8">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="size-14 rounded-2xl object-contain bg-white p-1 border shadow-md shrink-0"
              />
            ) : (
              <div className="size-14 rounded-2xl bg-white/15 flex items-center justify-center font-bold text-xl border border-white/25 shrink-0">
                {club.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <span className="rounded-full bg-gold/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                {club.tag}
              </span>
              <h2 id={titleId} className="mt-1 font-serif text-xl font-bold leading-tight truncate">
                {club.name}
              </h2>
              {club.nameBn && <p className="text-sm text-white/85 truncate">{club.nameBn}</p>}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* ==================== সোশ্যাল মিডিয়া ও শেয়ার বার ==================== */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3 border border-border/80">
            {/* সোশ্যাল লিংকসমূহ */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {rawClub?.fb_url && (
                <a
                  href={rawClub.fb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700 transition"
                >
                  Facebook
                </a>
              )}
              {rawClub?.yt_url && (
                <a
                  href={rawClub.yt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-red-600 text-white px-2.5 py-1 hover:bg-red-700 transition"
                >
                  YouTube
                </a>
              )}
              {rawClub?.web_url && (
                <a
                  href={rawClub.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-brand text-white px-2.5 py-1 hover:bg-brand-dark transition"
                >
                  <Globe className="size-3" /> Website
                </a>
              )}
              {!rawClub?.fb_url && !rawClub?.yt_url && !rawClub?.web_url && (
                <span className="text-xs text-muted-foreground">ক্যাম্পাস ক্লাব</span>
              )}
            </div>

            {/* শেয়ার বাটনসমূহ */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-lg bg-white border px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-soft transition"
              >
                {copied ? <Check className="size-3 text-green-600" /> : <Share2 className="size-3" />}
                {copied ? "কপি হয়েছে!" : "শেয়ার"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(club.name + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 text-white px-2 py-1 text-xs font-semibold hover:bg-emerald-700 transition"
                title="WhatsApp-এ শেয়ার করুন"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-700 text-white px-2 py-1 text-xs font-semibold hover:bg-blue-800 transition"
                title="Facebook-এ শেয়ার করুন"
              >
                FB
              </a>
            </div>
          </div>

          {/* ==================== ক্লাবের কার্যক্রম / পরিচিতি ==================== */}
          {(club.activity || club.activityBn) && (
            <div className="rounded-2xl border p-4 bg-white space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand">পরিচিতি ও সাম্প্রতিক কার্যক্রম</p>
              {club.activity && <p className="text-sm text-navy leading-relaxed">{club.activity}</p>}
              {club.activityBn && <p className="text-xs text-muted-foreground leading-relaxed pt-1">{club.activityBn}</p>}
              {club.date && (
                <p className="pt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5 text-gold" /> {club.date}
                </p>
              )}
            </div>
          )}

          {/* ==================== কমিটি সেকশন ==================== */}
          {members.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
                  <Users className="size-4" aria-hidden="true" />
                  কার্যনির্বাহী পরিষদ / Committee
                </h3>
                {term && <span className="text-xs bg-brand-soft text-brand font-semibold px-2.5 py-0.5 rounded-full">{term}</span>}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 rounded-xl border p-2 bg-gray-50/70">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo_url} alt="" className="size-10 rounded-full object-cover shrink-0 border bg-white" />
                    ) : (
                      <div className="size-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
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
              {reportsHeading}
            </h3>

            <ul className="mt-3 space-y-3">
              {club.reports.map((r, i) => (
                <li key={i} className="rounded-2xl border border-border p-4 transition-colors hover:border-brand bg-white shadow-sm">
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

          {/* যোগাযোগ */}
          {rawClub?.contact_info && (
            <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Mail className="size-3.5 text-brand shrink-0" />
              <span>যোগাযোগ: {rawClub.contact_info}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
