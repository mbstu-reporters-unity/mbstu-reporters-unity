'use client'

import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from './logo'
import { SocialLinks } from './social-links'
import { Tx, useLang } from '@/lib/i18n'
import { useSiteSettings } from './site-settings-context'

export function SiteFooter() {
  const settings = useSiteSettings()
  const { pick } = useLang()
  const f = settings.footer

  const visibleLinks = f.quickLinks.filter((l) => l.visible && l.href.trim())

  return (
    <footer id="contact" className="bg-[#060e24] text-white/80 border-t border-white/10 relative z-10 w-full overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 space-y-4">
          <Logo inverted />
          <p className="max-w-md text-pretty text-xs sm:text-sm leading-relaxed text-slate-300">
            {pick(f.descriptionBn, f.descriptionEn)}
          </p>
          <div className="pt-2">
            <SocialLinks />
          </div>
        </div>

        <nav aria-label="Footer quick links">
          <h2 className="font-serif text-base font-bold text-white"><Tx bn="দ্রুত লিংক" en="Quick Links" /></h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm sm:grid-cols-1">
            {visibleLinks.map((link) => {
              const targetHref = link.href.startsWith('#') ? `/${link.href}` : link.href
              const isExternal = /^https?:\/\//i.test(targetHref)
              return (
                <li key={link.id}>
                  {isExternal ? (
                    <a
                      href={targetHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-cyan-300 cursor-pointer text-slate-300"
                    >
                      {pick(link.labelBn, link.labelEn)}
                    </a>
                  ) : (
                    <Link href={targetHref} className="transition-colors hover:text-cyan-300 cursor-pointer text-slate-300">
                      {pick(link.labelBn, link.labelEn)}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div>
          <h2 className="font-serif text-base font-bold text-white"><Tx bn="যোগাযোগ" en="Contact Desk" /></h2>
          <address className="mt-4 space-y-3 text-xs sm:text-sm not-italic text-slate-300">
            {(f.addressBn || f.addressEn) && (
              <p className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <span>{pick(f.addressBn, f.addressEn)}</span>
              </p>
            )}
            {f.phone && (
              <p className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <a href={`tel:${f.phone.replace(/[^+\d]/g, '')}`} className="hover:text-cyan-300">
                  {f.phone}
                </a>
              </p>
            )}
            {f.email && (
              <p className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <a href={`mailto:${f.email}`} className="break-all hover:text-cyan-300">
                  {f.email}
                </a>
              </p>
            )}
          </address>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#040918] py-4 px-4 text-xs text-white/50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>{pick(f.copyrightBn, f.copyrightEn)}</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-cyan-300 underline">গোপনীয়তা নীতি</Link>
            <Link href="/terms" className="hover:text-cyan-300 underline">ব্যবহারের শর্তাবলি</Link>
            <Link href="/constitution" className="hover:text-cyan-300 underline">গঠনতন্ত্র</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
