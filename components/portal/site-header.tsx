'use client'

import { useState } from 'react'
import { Lock, Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/data'
import { Logo } from './logo'
import { Tx, useLang } from '@/lib/i18n'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { lang, pick } = useLang()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/75 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Logo />

          <nav aria-label="Main navigation" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 transition-colors hover:bg-brand-soft hover:text-brand"
                  >
                    {lang === 'bn' ? link.bn : link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/admin"
              className="hidden items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(4,106,56,0.55)] transition-all hover:bg-brand-dark hover:shadow-[0_0_26px_rgba(4,106,56,0.75)] sm:inline-flex"
            >
              <Lock className="size-4" aria-hidden="true" />
              <Tx bn="সাংবাদিক লগইন" en="Reporter Login" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-navy xl:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">{pick(menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন', menuOpen ? 'Close menu' : 'Open menu')}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="animate-in slide-in-from-top-2 fade-in border-t border-border bg-card xl:hidden"
          >
            <ul className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:grid-cols-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-brand-soft hover:text-brand"
                  >
                    {lang === 'bn' ? link.bn : link.label}
                    <span className="text-xs text-muted-foreground">{lang === 'bn' ? link.label : link.bn}</span>
                  </a>
                </li>
              ))}
              <li className="sm:col-span-2">
                <a
                  href="/admin"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white"
                >
                  <Lock className="size-4" aria-hidden="true" />
                  {pick('সাংবাদিক লগইন / নিবন্ধন', 'Reporter Login / Sign up')}
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  )
}
