'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, ExternalLink, MapPin, Megaphone, Send } from 'lucide-react'
import { LiveClock } from './live-clock'
import { SocialLinks } from './social-links'
import { LangSwitcher } from './lang-switcher'
import { ThemeSwitcher } from './theme-switcher'
import { FontSizeSwitcher } from './font-size-switcher'
import { BookmarksDialog } from './bookmarks-dialog'
import { TipSubmissionDialog } from './tip-submission-dialog'
import { useBookmarks } from '@/lib/bookmarks'
import { useLang } from '@/lib/i18n'
import { useSiteSettings } from './site-settings-context'

export function TopBar() {
  const settings = useSiteSettings()
  const { pick } = useLang()
  const { count: bookmarkCount } = useBookmarks()
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const tb = settings.topBar
  const ann = settings.behaviorAndPages

  const showAnnouncement = ann.announcementEnabled && Boolean(ann.announcementText.trim())
  const showSecondRow =
    tb.showLangSwitcher || tb.showLocation || tb.showThemeSwitcher || tb.showSocialLinks

  if (!tb.showTopBar && !showAnnouncement) return null

  return (
    <div className="site-top-bar relative z-[60] border-b border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] shadow-xs">
      {/* জরুরি ঘোষণা ব্যানার */}
      {showAnnouncement && (
        <div className="site-announcement border-b border-amber-300 bg-amber-50 px-3 py-1.5 text-center text-xs font-bold text-amber-900">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 flex-wrap">
            <Megaphone className="size-3.5 text-amber-700 shrink-0" />
            <span>{ann.announcementText}</span>
            {ann.announcementLink.trim() && (
              /^https?:\/\//i.test(ann.announcementLink.trim()) ? (
                <a
                  href={ann.announcementLink.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline text-red-800 hover:text-red-950"
                >
                  <span>{pick('বিস্তারিত দেখুন', 'View details')}</span>
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <Link
                  href={ann.announcementLink.trim()}
                  className="underline text-red-800 hover:text-red-950"
                >
                  {pick('বিস্তারিত দেখুন →', 'View details →')}
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* সারি ১: পরিচ্ছন্ন ও সুনির্দিষ্ট টপ বার */}
      {tb.showTopBar && (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 py-1">
          {/* বামে: তারিখ ও ঘড়ি */}
          {tb.showClock && (
            <div className="min-w-0 shrink">
              <LiveClock />
            </div>
          )}

          {/* ডানে: ইউটিলিটি কন্ট্রোলসমূহ */}
          {showSecondRow && (
            <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
              {tb.showLocation && (
                <div className="hidden lg:flex items-center">
                  <span className="site-location-pill inline-flex items-center gap-1 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-2.5 py-0.5 font-semibold text-[11px] text-[var(--theme-text-body)]">
                    <MapPin className="size-3 text-[var(--theme-brand)] shrink-0" aria-hidden="true" />
                    <span>{pick(tb.locationBn, tb.locationEn)}</span>
                  </span>
                </div>
              )}

              {/* সংরক্ষিত ও তথ্য পাঠান বাটন (ট্যাবলেটে ও কম্পিউটারে দৃশ্যমান) */}
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBookmarksOpen(true)}
                  aria-label={pick('সংরক্ষিত সংবাদ', 'Saved Articles')}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--theme-text-body)] transition hover:border-[var(--theme-brand)]"
                >
                  <Bookmark className={`size-3.5 ${bookmarkCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{pick('সংরক্ষিত', 'Saved')}</span>
                  {bookmarkCount > 0 && (
                    <span className="text-[10px] tabular-nums font-bold px-1 rounded-full bg-[var(--theme-brand-soft)] text-[var(--theme-brand)]">
                      {bookmarkCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTipOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                >
                  <Send className="size-3 text-amber-800" />
                  <span>{pick('তথ্য পাঠান', 'Submit a tip')}</span>
                </button>
              </div>

              {/* ভাষা নির্বাচন */}
              {tb.showLangSwitcher && (
                <div className="shrink-0">
                  <LangSwitcher />
                </div>
              )}

              {/* ফন্ট সাইজ ও থিম বাটন */}
              <div className="flex items-center gap-1">
                <FontSizeSwitcher />
                {tb.showThemeSwitcher && <ThemeSwitcher />}
              </div>

              {tb.showSocialLinks && (
                <div className="hidden xl:block">
                  <SocialLinks size="sm" tooltip="bottom" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ডায়ালগসমূহ */}
      <BookmarksDialog open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
      <TipSubmissionDialog open={tipOpen} onClose={() => setTipOpen(false)} />
    </div>
  )
}
