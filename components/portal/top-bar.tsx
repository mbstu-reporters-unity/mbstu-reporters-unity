'use client'

import Link from 'next/link'
import { ExternalLink, MapPin, Megaphone } from 'lucide-react'
import { LiveClock } from './live-clock'
import { SocialLinks } from './social-links'
import { LangSwitcher } from './lang-switcher'
import { ThemeSwitcher } from './theme-switcher'
import { FontSizeSwitcher } from './font-size-switcher'
import { useLang } from '@/lib/i18n'
import { useSiteSettings } from './site-settings-context'

export function TopBar() {
  const settings = useSiteSettings()
  const { pick } = useLang()
  const tb = settings.topBar
  const ann = settings.behaviorAndPages

  const showAnnouncement = ann.announcementEnabled && Boolean(ann.announcementText.trim())
  const showSecondRow =
    tb.showLangSwitcher || tb.showLocation || tb.showThemeSwitcher || tb.showSocialLinks

  if (!tb.showTopBar && !showAnnouncement) return null

  return (
    <div className="site-top-bar bg-[#071030]/95 text-white border-b border-white/10 backdrop-blur-xl relative z-50">
      {showAnnouncement && (
        <div className="site-announcement bg-gradient-to-r from-amber-500/25 via-cyan-500/20 to-amber-500/25 border-b border-amber-400/30 px-3 py-1.5 text-center text-xs font-bold text-amber-200">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 flex-wrap">
            <Megaphone className="size-3.5 text-amber-300 shrink-0" />
            <span>{ann.announcementText}</span>
            {ann.announcementLink.trim() && (
              /^https?:\/\//i.test(ann.announcementLink.trim()) ? (
                <a
                  href={ann.announcementLink.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline text-cyan-300 hover:text-white"
                >
                  <span>বিস্তারিত</span>
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <Link
                  href={ann.announcementLink.trim()}
                  className="underline text-cyan-300 hover:text-white"
                >
                  বিস্তারিত →
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {tb.showTopBar && (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 space-y-2">
          {tb.showClock && (
            <div className="w-full">
              <LiveClock />
            </div>
          )}

          {showSecondRow && (
            <div
              className={`${
                tb.showClock ? 'pt-1.5 border-t border-white/10' : ''
              } flex flex-wrap items-center gap-x-1.5 gap-y-2 sm:justify-between sm:gap-x-3 sm:gap-y-1.5`}
            >
              <div className="order-1 shrink-0 sm:order-none">
                {tb.showLangSwitcher && <LangSwitcher />}
              </div>

              {tb.showLocation && (
                <div className="order-3 flex w-full min-w-0 justify-center sm:order-none sm:w-auto sm:flex-1">
                  <span className="site-location-pill inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-600/80 border border-cyan-400/30 px-2.5 sm:px-3 py-1 font-semibold text-center text-white shadow-xs text-[11px] sm:text-xs whitespace-nowrap">
                    <MapPin className="size-3 text-cyan-200 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">{pick(tb.locationBn, tb.locationEn)}</span>
                  </span>
                </div>
              )}

              <div className="order-2 ml-auto min-w-0 flex flex-wrap items-center justify-end gap-1.5 sm:order-none sm:ml-0 sm:gap-2">
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
    </div>
  )
}
