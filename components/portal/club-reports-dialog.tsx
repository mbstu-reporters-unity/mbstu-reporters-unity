'use client'

import { useEffect, useId, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Globe,
  Mail,
  Newspaper,
  Share2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import type { Club } from '@/lib/data'
import {
  getClubNewsPosts,
  parseActivityMedia,
  safeExternalUrl,
  type ClubItem,
} from '@/lib/clubs'
import { UniversalMediaEmbed } from './universal-media-embed'

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
  const [liveNews, setLiveNews] = useState<
    Array<{
      id: string
      title: string
      created_at: string
      author: string
      image_url: string | null
      embed_media_url?: string | null
    }>
  >([])

  // ১. শুধুমাত্র ক্লাবের আইডি পরিবর্তন হলেই সংশ্লিষ্ট নিউজ লোড হবে
  useEffect(() => {
    if (!club?.id) return
    getClubNewsPosts(club.id).then(setLiveNews)
  }, [club?.id])

  // ২. বডি স্ক্রল ও কীবোর্ডের Escape বাটন হ্যান্ডলার
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
  const reportsHeading = rawClub?.reports_title || 'Club Reports / ক্লাব প্রতিবেদন'
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/?club=${club.id}` : ''
  const activityMediaList = parseActivityMedia(rawClub?.embed_media_url)

  // ডাটাবেজের রিপোর্ট থাকলে সেটা দেখাবে, না থাকলে ফলব্যাক ক্লাবের রিপোর্ট দেখাবে
  const manualReports =
    rawClub?.reports && rawClub.reports.length > 0
      ? rawClub.reports
      : club.reports && club.reports.length > 0
      ? club.reports
      : []

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 club-dialog-font">
      {/* ব্যাকড্রপ */}
      <button
        type="button"
        aria-label="Close reports"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-navy/85 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl border border-border club-dialog-font"
      >
        {/* হেডার ব্যানার */}
        <div className="relative bg-gradient-to-r from-brand to-brand-dark px-6 py-6 text-white">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex items-center gap-4 pr-8">
            {/* স্পষ্ট গোল লোগো */}
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={club.name}
                className="size-20 sm:size-24 rounded-full object-cover p-0.5 bg-white shadow-lg shrink-0"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="size-20 sm:size-24 rounded-full bg-white/15 flex items-center justify-center font-bold text-3xl border border-white/25 shrink-0">
                {club.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="rounded-full bg-gold px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-navy">
                {club.tag}
              </span>
              <h2 id={titleId} className="mt-1 font-serif text-xl sm:text-2xl font-bold leading-tight">
                {club.name}
              </h2>
              {club.nameBn && <p className="text-sm text-white/90 font-medium">{club.nameBn}</p>}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* সোশ্যাল মিডিয়া ও শেয়ার বার */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3 border border-border/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {rawClub?.fb_url && (
                <a
                  href={safeExternalUrl(rawClub.fb_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700 transition"
                >
                  Facebook
                </a>
              )}
              {rawClub?.yt_url && (
                <a
                  href={safeExternalUrl(rawClub.yt_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-red-600 text-white px-2.5 py-1 hover:bg-red-700 transition"
                >
                  YouTube
                </a>
              )}
              {rawClub?.web_url && (
                <a
                  href={safeExternalUrl(rawClub.web_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-brand text-white px-2.5 py-1 hover:bg-brand-dark transition"
                >
                  <Globe className="size-3" /> Website
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-lg bg-white border px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-soft transition cursor-pointer"
              >
                {copied ? <Check className="size-3 text-green-600" /> : <Share2 className="size-3" />}
                {copied ? 'কপি হয়েছে!' : 'শেয়ার'}
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

          {/* পরিচিতি ও কার্যক্রম */}
          {(club.activity || club.activityBn || activityMediaList.length > 0) && (
            <div className="rounded-2xl border p-4 bg-white space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                পরিচিতি ও সাম্প্রতিক কার্যক্রম
              </p>
              {club.activity && <p className="text-sm text-navy leading-relaxed">{club.activity}</p>}
              {club.activityBn && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">{club.activityBn}</p>
              )}
              {club.date && (
                <p className="pt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5 text-gold" /> {club.date}
                </p>
              )}

              {/* ⭐ একাধিক মিডিয়া প্রদর্শন — কমপ্যাক্ট ১৬:৯ আন্তর্জাতিক মোড ⭐ */}
              {activityMediaList.length > 0 && (
                <div className="mt-3 space-y-3">
                  {activityMediaList.map((m, idx) => (
                    <div key={idx} className="space-y-1.5 pt-2 border-t border-border/80">
                      {m.title && <h4 className="font-bold text-sm text-navy leading-snug">{m.title}</h4>}
                      {m.subtitle && <p className="text-xs font-semibold text-brand">{m.subtitle}</p>}
                      {m.description && (
                        <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                          {m.description}
                        </p>
                      )}
                      <UniversalMediaEmbed url={m.url} title={m.title || club.name} compact />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* কার্যনির্বাহী পরিষদ / কমিটি */}
          {members.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
                  <Users className="size-4" aria-hidden="true" />
                  কার্যনির্বাহী পরিষদ / Committee
                </h3>
                {term && (
                  <span className="text-xs bg-brand-soft text-brand font-semibold px-2.5 py-0.5 rounded-full">
                    {term}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 rounded-xl border p-2 bg-gray-50/70">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="size-11 rounded-full object-cover shrink-0 border bg-white"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {m.name.charAt(0) || 'স'}
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

          {/* ক্লাব প্রতিবেদন সেকশন */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand border-b pb-2">
              <Newspaper className="size-4" aria-hidden="true" />
              {reportsHeading}
            </h3>

            <ul className="mt-3 space-y-4">
              {/* লাইভ নিউজ তালিকা */}
              {liveNews.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border p-4 transition-all hover:border-brand bg-white shadow-sm hover:shadow-md"
                >
                  <a href={`/post/${p.id}`} className="block group">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-serif font-bold leading-snug text-navy text-sm sm:text-base group-hover:text-brand transition-colors">
                        {p.title}
                      </p>
                      <ArrowRight className="size-4 text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-2">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <CalendarDays className="size-3.5 text-gold" aria-hidden="true" />
                        {new Date(p.created_at).toLocaleDateString('bn-BD')}
                      </span>
                      {p.author && (
                        <span className="inline-flex items-center gap-1 font-medium text-brand">
                          <UserRound className="size-3.5" aria-hidden="true" />
                          {p.author}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              ))}

              {/* ম্যানুয়াল রিপোর্টসমূহ */}
              {manualReports.map((r: any, i: number) => (
                <li
                  key={`manual-${i}`}
                  className="rounded-2xl border border-border p-4 bg-white shadow-sm space-y-2.5"
                >
                  <p className="font-serif font-bold leading-snug text-navy text-base">{r.title}</p>
                  {r.subtitle && <p className="text-xs font-semibold text-brand">{r.subtitle}</p>}
                  {r.description && (
                    <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                      {r.description}
                    </p>
                  )}

                  {/* ⭐ একক মিডিয়া — ১৬:৯ কমপ্যাক্ট মোড ⭐ */}
                  {r.embed_media_url && (
                    <UniversalMediaEmbed url={r.embed_media_url} title={r.title} compact />
                  )}

                  {/* ⭐ একাধিক মিডিয়া — ১৬:৯ কমপ্যাক্ট মোড ⭐ */}
                  {r.media_items && r.media_items.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {r.media_items.map((m: any, mi: number) => (
                        <div key={mi} className="rounded-xl bg-gray-50 p-2.5 border border-border/70 space-y-1">
                          {m.title && <h5 className="font-bold text-xs text-navy">{m.title}</h5>}
                          {m.subtitle && <p className="text-[11px] font-semibold text-brand">{m.subtitle}</p>}
                          {m.description && (
                            <p className="text-[11px] text-gray-600 whitespace-pre-line">
                              {m.description}
                            </p>
                          )}
                          <UniversalMediaEmbed url={m.url} title={m.title || r.title} compact />
                        </div>
                      ))}
                    </div>
                  )}

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

              {liveNews.length === 0 && manualReports.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  এই ক্লাবের কোনো প্রতিবেদন এখনো প্রকাশিত হয়নি।
                </p>
              )}
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
