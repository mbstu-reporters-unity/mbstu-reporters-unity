'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Layers, Lock, Menu, X } from 'lucide-react'
import { navLinks, clubs as fallbackClubs } from '@/lib/data'
import { getCampusClubs, type ClubItem } from '@/lib/clubs'
import { getVisibleCategoryNames } from '@/lib/categories'
import { SB_URL, SB_KEY } from '@/lib/sb'
import { Logo } from './logo'
import { Tx, useLang } from '@/lib/i18n'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [clubsExpanded, setClubsExpanded] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [clubsList, setClubsList] = useState<ClubItem[]>([])
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const { lang, pick } = useLang()

  // বিশ্ববিদ্যালয় লোগো, লিংক ও ঐচ্ছিক টেক্সট স্টেট
  const [univLogo, setUnivLogo] = useState('https://mbstu.ac.bd/images/logo.png')
  const [univLink, setUnivLink] = useState('https://mbstu.ac.bd')
  const [univText, setUnivText] = useState('')

  // ডেটাবেস থেকে রিয়েল-টাইমে লোড করা
  useEffect(() => {
    // ১. বিশ্ববিদ্যালয় লোগো, লিংক ও টেক্সট লোড
    fetch(
      `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(univ_logo_url,univ_link_url,univ_text)`,
      { headers: { apikey: SB_KEY }, cache: 'no-store' }
    )
      .then((res) => res.json())
      .then((rows) => {
        if (Array.isArray(rows)) {
          rows.forEach((r) => {
            if (r.key === 'univ_logo_url' && r.value) setUnivLogo(r.value)
            if (r.key === 'univ_link_url' && r.value) setUnivLink(r.value)
            if (r.key === 'univ_text') setUnivText(r.value || '')
          })
        }
      })
      .catch(() => {})

    // ২. ক্লাব লোড
    getCampusClubs().then((res) => {
      if (res && res.length > 0) {
        setClubsList(res)
      } else {
        setClubsList(
          fallbackClubs.map((c) => ({
            id: c.id,
            name: c.name,
            name_bn: c.nameBn,
            tag: c.tag,
            icon: c.icon,
            logo_url: null,
            activity: c.activity,
            activity_bn: c.activityBn,
            date: c.date,
            fb_url: null,
            yt_url: null,
            web_url: null,
            contact_info: null,
            sort_order: 0,
            is_active: true,
            created_at: '',
          }))
        )
      }
    })

    // ৩. ক্যাটাগরি লোড
    getVisibleCategoryNames().then((cats) => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats)
      } else {
        setCategoriesList([
          'ক্যাম্পাস সংবাদ',
          'ক্লাব',
          'একাডেমিক',
          'গবেষণা',
          'খেলাধুলা',
          'সংস্কৃতি',
          'পরিবেশ',
        ])
      }
    })
  }, [])

  function openClubWindow(clubId: string) {
    setMenuOpen(false)
    setClubsExpanded(false)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('club', clubId)
      window.history.pushState({}, '', url.toString())
      window.dispatchEvent(new CustomEvent('open-club-modal', { detail: clubId }))

      const el = document.getElementById(`club-${clubId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/75 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-4 px-4 py-3">
          
          {/* ==================== বামপাশ: সাইট লোগো + বিশ্ববিদ্যালয়ের লোগো ==================== */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* ১. মাভাবিপ্রবি রিপোর্টার্স ইউনিটি লোগো ও নাম */}
            <Logo />

            {/* হালকা পার্টিশন দাগ (Divider) */}
            <span className="h-6 w-px bg-border/80 shrink-0" aria-hidden="true" />

            {/* ২. বিশ্ববিদ্যালয়ের অফিশিয়াল লোগো, লিংক ও ঐচ্ছিক বক্স */}
            <a
              href={univLink || 'https://mbstu.ac.bd'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
              title="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (অফিশিয়াল ওয়েবসাইট)"
            >
              {univLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={univLogo}
                  alt="MBSTU University Official Logo"
                  className="size-8 sm:size-9 rounded-full object-contain bg-white p-0.5 border border-border/80 shadow-sm transition-all group-hover:border-brand group-hover:shadow"
                />
              )}

              {/* ঐচ্ছিক লেখা: কিছু লিখলে তবেই জায়গা নেবে, ফাঁকা থাকলে একদম হাইড থাকবে (0px) */}
              {univText && univText.trim() !== '' && (
                <span className="text-[11px] sm:text-xs font-bold text-navy/90 group-hover:text-brand transition-colors max-w-[100px] sm:max-w-[150px] truncate leading-tight">
                  {univText}
                </span>
              )}
            </a>
          </div>

          {/* ==================== ডেস্কটপ মেনু ==================== */}
          <nav aria-label="Main navigation" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isClubLink = link.href === '#club-news'

                if (isClubLink) {
                  return (
                    <li key={link.href} className="flex items-center gap-1">
                      {/* নিউজ ক্যাটাগরি ড্রপডাউন */}
                      <div className="relative group">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 transition-colors hover:bg-brand-soft hover:text-brand"
                        >
                          <span>{pick('নিউজ ক্যাটাগরি', 'News Categories')}</span>
                          <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                        </button>

                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-60 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
                          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                            {pick('সংবাদ বিভাগসমূহ', 'All Categories')}
                          </p>
                          <div className="space-y-0.5 pt-1">
                            {categoriesList.map((cat, i) => (
                              <a
                                key={cat}
                                href={`/category/${encodeURIComponent(cat)}`}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-navy hover:bg-brand-soft transition-colors"
                              >
                                <span className="truncate">
                                  <span className="font-bold text-brand mr-1.5">{i + 1}.</span>
                                  {cat}
                                </span>
                                <ChevronRight className="size-3 text-muted-foreground opacity-60" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ক্যাম্পাস ক্লাবসমূহ ড্রপডাউন */}
                      <div className="relative group">
                        <a
                          href="#club-news"
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 transition-colors hover:bg-brand-soft hover:text-brand"
                        >
                          {lang === 'bn' ? link.bn : link.label}
                          <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                        </a>

                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
                          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                            {pick('ক্লাবসমূহের নামের তালিকা:', 'List of Clubs:')}
                          </p>
                          <a
                            href="#club-news"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-brand hover:bg-brand-soft mt-1"
                          >
                            <ChevronRight className="size-3.5" />
                            <span>{pick('➔ সব ক্লাব একনজরে দেখুন', '➔ View All Clubs')}</span>
                          </a>

                          <div className="space-y-1 pt-1">
                            {clubsList.map((c, i) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => openClubWindow(c.id)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-brand-soft transition-colors"
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                                  {i + 1}
                                </span>
                                {c.logo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={c.logo_url}
                                    alt=""
                                    className="size-7 shrink-0 rounded-lg object-contain bg-white p-0.5 border border-border"
                                  />
                                ) : (
                                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white text-xs font-bold">
                                    {c.name.charAt(0)}
                                  </span>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-xs text-navy truncate">{c.name}</p>
                                  {c.name_bn && <p className="text-[10px] text-muted-foreground truncate">{c.name_bn}</p>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                }

                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 transition-colors hover:bg-brand-soft hover:text-brand"
                    >
                      {lang === 'bn' ? link.bn : link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* ==================== ডানপাশ: লগইন বাটন ও মেনু টগল ==================== */}
          <div className="flex items-center gap-2 shrink-0">
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
              <span className="sr-only">
                {pick(menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন', menuOpen ? 'Close menu' : 'Open menu')}
              </span>
            </button>
          </div>
        </div>

        {/* ==================== মোবাইল ড্রয়ার মেনু ==================== */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="animate-in slide-in-from-top-2 fade-in border-t border-border bg-card xl:hidden max-h-[85vh] overflow-y-auto"
          >
            <ul className="mx-auto grid max-w-7xl gap-1.5 px-4 py-3 sm:grid-cols-2">
              {navLinks.map((link) => {
                const isClubLink = link.href === '#club-news'

                if (isClubLink) {
                  return (
                    <div key={link.href} className="sm:col-span-2 space-y-1.5">
                      {/* মোবাইল: নিউজ ক্যাটাগরি সাব-মেনু */}
                      <li className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                          className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="size-4" />
                            <span>{pick('নিউজ ক্যাটাগরি', 'News Categories')}</span>
                            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                              {categoriesList.length}টি
                            </span>
                          </span>
                          <ChevronDown
                            className={`size-4 text-brand transition-transform duration-200 ${
                              categoriesExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {categoriesExpanded && (
                          <div className="border-t border-brand/20 bg-card px-2.5 py-2 space-y-1 animate-in fade-in">
                            <p className="px-2 pt-1 pb-1 text-[11px] font-bold text-muted-foreground">
                              {pick('ক্যাটাগরি বেছে নিন:', 'Select a Category:')}
                            </p>
                            <div className="divide-y divide-border/40">
                              {categoriesList.map((cat, i) => (
                                <a
                                  key={cat}
                                  href={`/category/${encodeURIComponent(cat)}`}
                                  onClick={() => setMenuOpen(false)}
                                  className="flex items-center justify-between rounded-xl px-2.5 py-2.5 text-xs font-medium text-navy hover:bg-brand-soft transition-colors active:scale-[0.99]"
                                >
                                  <span className="font-semibold">
                                    <span className="font-bold text-brand mr-1.5">{i + 1}.</span>
                                    {cat}
                                  </span>
                                  <span className="text-[10px] text-brand bg-brand-soft px-2 py-0.5 rounded-full font-bold">
                                    খবর দেখুন →
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </li>

                      {/* মোবাইল: ক্যাম্পাস ক্লাবসমূহ সাব-মেনু */}
                      <li className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setClubsExpanded(!clubsExpanded)}
                          className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang === 'bn' ? link.bn : link.label}</span>
                            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                              {clubsList.length}টি ক্লাব
                            </span>
                          </span>
                          <ChevronDown
                            className={`size-4 text-brand transition-transform duration-200 ${
                              clubsExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {clubsExpanded && (
                          <div className="border-t border-brand/20 bg-card px-2.5 py-2 space-y-1 animate-in fade-in">
                            <a
                              href="#club-news"
                              onClick={() => {
                                setMenuOpen(false)
                                setClubsExpanded(false)
                              }}
                              className="flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white mb-2 shadow-sm"
                            >
                              <ChevronRight className="size-3.5" />
                              <span>{pick('➔ সব ক্লাব একনজরে দেখুন', '➔ View All Clubs')}</span>
                            </a>

                            <p className="px-2 pt-1 pb-1 text-[11px] font-bold text-muted-foreground">
                              {pick('ক্লাবসমূহের নামের তালিকা:', 'List of Clubs:')}
                            </p>

                            <div className="divide-y divide-border/40">
                              {clubsList.map((c, i) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => openClubWindow(c.id)}
                                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left hover:bg-brand-soft transition-colors active:scale-[0.99]"
                                >
                                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                                    {i + 1}
                                  </span>

                                  {c.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={c.logo_url}
                                      alt=""
                                      className="size-8 shrink-0 rounded-lg object-contain bg-white p-0.5 border border-border shadow-sm"
                                    />
                                  ) : (
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white text-xs font-bold">
                                      {c.name.charAt(0)}
                                    </span>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-xs text-navy truncate">{c.name}</p>
                                    {c.name_bn && (
                                      <p className="text-[10px] text-muted-foreground truncate">
                                        {c.name_bn}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </li>
                    </div>
                  )
                }

                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-brand-soft hover:text-brand"
                    >
                      {lang === 'bn' ? link.bn : link.label}
                      <span className="text-xs text-muted-foreground">
                        {lang === 'bn' ? link.label : link.bn}
                      </span>
                    </a>
                  </li>
                )
              })}

              <li className="sm:col-span-2 pt-2">
                <a
                  href="/admin"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-dark"
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
