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
    <div className="site-top-bar relative z-[60] border-b border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] shadow-sm">
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

      {tb.showTopBar && (
        <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-2 px-2 sm:px-4 py-0.5">
          {tb.showClock && (
            <div className="min-w-0 flex-1">
              <LiveClock />
            </div>
          )}

          {showSecondRow && (
            <div
              className="flex shrink-0 flex-nowrap items-center justify-end gap-1 sm:gap-2"
            >
              <div className="shrink-0">
                {tb.showLangSwitcher && <LangSwitcher />}
              </div>

              {tb.showLocation && (
                <div className="hidden min-w-0 justify-center md:flex">
                  <span className="site-location-pill inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-2.5 sm:px-3 py-1 font-semibold text-center text-[var(--theme-text-body)] shadow-xs text-[11px] sm:text-xs whitespace-nowrap">
                    <MapPin className="size-3 text-[var(--theme-brand)] shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">{pick(tb.locationBn, tb.locationEn)}</span>
                  </span>
                </div>
              )}

              <div className="min-w-0 flex flex-nowrap items-center justify-end gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setBookmarksOpen(true)}
                  aria-label={pick('সংরক্ষিত সংবাদ', 'Saved Articles')}
                  title={pick('সংরক্ষিত সংবাদ দেখুন', 'View saved articles')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] px-2.5 sm:px-3 py-1 text-xs font-bold text-[var(--theme-text-body)] shadow-xs transition-all hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)] active:scale-95 cursor-pointer"
                >
                  <Bookmark className={`size-3.5 ${bookmarkCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span className="hidden sm:inline">{pick('সংরক্ষিত', 'Saved')}</span>
                  <span className="text-[10px] tabular-nums font-bold px-1.5 py-0.2 rounded-full bg-[var(--theme-brand-soft)] border border-[var(--theme-card-border)] text-[var(--theme-brand)]">
                    {bookmarkCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipOpen(true)}
                  aria-label={pick('সংবাদ-তথ্য পাঠান', 'Submit a news tip')}
                  title={pick('গোপনীয়ভাবে সংবাদ-তথ্য পাঠান', 'Submit a confidential news tip')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 sm:px-3 py-1 text-xs font-bold text-amber-900 shadow-xs transition-all hover:bg-amber-100 active:scale-95 cursor-pointer"
                >
                  <Send className="size-3.5 text-amber-800" />
                  <span className="hidden sm:inline">{pick('তথ্য পাঠান', 'Submit a tip')}</span>
                </button>

                <FontSizeSwitcher />
                {tb.showThemeSwitcher && <ThemeSwitcher />}
                {tb.showSocialLinks && (
                  <div className="hidden lg:block">
                    <SocialLinks size="sm" tooltip="bottom" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* সংরক্ষিত সংবাদ ও টিপস সাবমিশন ডায়ালগ */}
      <BookmarksDialog open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
      <TipSubmissionDialog open={tipOpen} onClose={() => setTipOpen(false)} />
    </div>
  )
}
