'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Globe2, GraduationCap, Layers, Lock, Menu, Newspaper, X } from 'lucide-react'
import { navLinks, clubs as fallbackClubs } from '@/lib/data'
import { getCampusClubs, type ClubItem } from '@/lib/clubs'
import { getVisibleCategoryNames } from '@/lib/categories'
import { getFacultiesWithDepartments, type FacultyWithDepartments } from '@/lib/faculties'
import { getUniversityAssociations, type UniversityAssociation } from '@/lib/associations'
import { getSocialSites, type SocialSite } from '@/lib/social-sites'
import { SB_URL, SB_KEY } from '@/lib/sb'
import { Logo } from './logo'
import { Tx, useLang } from '@/lib/i18n'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [clubsExpanded, setClubsExpanded] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [facultiesExpanded, setFacultiesExpanded] = useState(false)
  const [associationsExpanded, setAssociationsExpanded] = useState(false)
  const [socialSitesExpanded, setSocialSitesExpanded] = useState(false)

  const [clubsList, setClubsList] = useState<ClubItem[]>([])
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [facultiesList, setFacultiesList] = useState<FacultyWithDepartments[]>([])
  const [associationsList, setAssociationsList] = useState<UniversityAssociation[]>([])
  const [socialSitesList, setSocialSitesList] = useState<SocialSite[]>([])
  const { lang, pick } = useLang()

  // বিশ্ববিদ্যালয় লোগো, লিংক ও টেক্সট
  const [univLogo, setUnivLogo] = useState('https://mbstu.ac.bd/images/logo.png')
  const [univLink, setUnivLink] = useState('https://mbstu.ac.bd')
  const [univText, setUnivText] = useState('')

  useEffect(() => {
    // বিশ্ববিদ্যালয় লোগো ও লিংক
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

    // ক্লাবসমূহ
    getCampusClubs().then((res) => {
      if (res && res.length > 0) setClubsList(res)
    })

    // ক্যাটাগরি
    getVisibleCategoryNames().then(setCategoriesList)

    // অনুষদ ও বিভাগসমূহ
    getFacultiesWithDepartments().then(setFacultiesList)

    // অন্যান্য সাংবাদিক সমিতি
    getUniversityAssociations().then(setAssociationsList)

    // MBSTU Social Site
    getSocialSites().then(setSocialSitesList)
  }, [])

  function openClubWindow(clubId: string) {
    setMenuOpen(false)
    setClubsExpanded(false)
    if (typeof window !== 'undefined') {
      const isHome = window.location.pathname === '/' || window.location.pathname === ''
      if (isHome) {
        const url = new URL(window.location.href)
        url.searchParams.set('club', clubId)
        window.history.pushState({}, '', url.toString())
        window.dispatchEvent(new CustomEvent('open-club-modal', { detail: clubId }))
        const el = document.getElementById(`club-${clubId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = `/?club=${clubId}#club-${clubId}`
      }
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/75 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-4 px-4 py-3">
          
          {/* লোগো ও বিশ্ববিদ্যালয়ের তথ্য */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <Logo />
            <span className="h-6 w-px bg-border/80 shrink-0" aria-hidden="true" />
            <a
              href={univLink || 'https://mbstu.ac.bd'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
              title="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়"
            >
              {univLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={univLogo}
                  alt="MBSTU University Official Logo"
                  className="size-8 sm:size-9 rounded-full object-contain bg-white p-0.5 border border-border/80 shadow-sm"
                />
              )}
              {univText && univText.trim() !== '' && (
                <span className="text-[11px] sm:text-xs font-bold text-navy/90 group-hover:text-brand transition-colors max-w-[100px] sm:max-w-[150px] truncate leading-tight">
                  {univText}
                </span>
              )}
            </a>
          </div>

          {/* ==================== ডেস্কটপ মেনুবার ==================== */}
          <nav aria-label="Main navigation" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              
              {/* হোম */}
              <li>
                <a href="/" className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand">
                  {pick('হোম', 'Home')}
                </a>
              </li>

              {/* অনুষদ ও বিভাগসমূহ */}
              <li className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <GraduationCap className="size-4 text-brand" />
                  <span>{pick('অনুষদ ও বিভাগসমূহ', 'Faculties & Depts')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </button>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                    {pick('অনুষদ ও এর অধীনস্থ বিভাগসমূহ', 'Faculties & Departments')}
                  </p>

                  <div className="space-y-3 pt-2">
                    {facultiesList.map((f) => (
                      <div key={f.id} className="rounded-xl border border-border/60 bg-gray-50/70 p-2.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          {f.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.image_url} alt="" className="size-6 rounded-md object-cover border" />
                          ) : (
                            <span className="text-xs">🏛️</span>
                          )}
                          <p className="text-xs font-bold text-navy truncate">{f.name}</p>
                        </div>

                        {f.departments && f.departments.length > 0 ? (
                          <div className="space-y-1 pl-4 border-l-2 border-brand/40 ml-2">
                            {f.departments.map((d) => (
                              <a
                                key={d.id}
                                href={`/department/${d.id}`}
                                className="flex items-center justify-between text-xs text-navy/85 hover:text-brand hover:underline py-0.5 truncate"
                              >
                                <span>{d.name} {d.code ? `(${d.code})` : ""}</span>
                                <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 pl-4">কোনো বিভাগ যুক্ত নেই</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </li>

              {/* অন্যান্য সাংবাদিক সমিতি */}
              <li className="relative group">
                <a
                  href="/associations"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <Newspaper className="size-4 text-brand" />
                  <span>{pick('অন্যান্য সাংবাদিক সমিতি', 'Other Press Clubs')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </a>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {pick('সাংবাদিক সমিতিসমূহ', 'Journalist Associations')}
                    </p>
                    <a href="/associations" className="text-[11px] font-bold text-brand hover:underline">
                      {pick('সবগুলো দেখুন →', 'View All →')}
                    </a>
                  </div>

                  <div className="space-y-1 pt-2">
                    {associationsList.map((assoc, i) => {
                      const link = assoc.website_url || assoc.fb_url || assoc.yt_url || '/associations'
                      return (
                        <a
                          key={assoc.id}
                          href={link}
                          target={link.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {assoc.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={assoc.logo_url} alt="" className="size-7 rounded-lg object-contain bg-white border p-0.5 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{assoc.name}</p>
                            {assoc.university_name && (
                              <p className="text-[10px] text-gray-500 truncate">{assoc.university_name}</p>
                            )}
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              </li>

              {/* ⭐ নতুন ড্রপডাউন: MBSTU Social Site ⭐ */}
              <li className="relative group">
                <a
                  href="/social-sites"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <Globe2 className="size-4 text-brand" />
                  <span>{pick('MBSTU Social Site', 'MBSTU Social Site')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </a>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {pick('সোশ্যাল সাইট ও গ্রুপসমূহ', 'Social Sites & Groups')}
                    </p>
                    <a href="/social-sites" className="text-[11px] font-bold text-brand hover:underline">
                      {pick('সবগুলো দেখুন →', 'View All →')}
                    </a>
                  </div>

                  <div className="space-y-1 pt-2">
                    {socialSitesList.map((site, i) => {
                      const link = site.fb_url || site.website_url || site.yt_url || '/social-sites'
                      return (
                        <a
                          key={site.id}
                          href={link}
                          target={link.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {site.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={site.logo_url} alt="" className="size-7 rounded-lg object-contain bg-white border p-0.5 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{site.name}</p>
                            {site.category && (
                              <p className="text-[10px] text-gray-500 truncate">{site.category}</p>
                            )}
                          </div>
                        </a>
                      )
                    })}
                    {socialSitesList.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-2">কোনো সাইট যোগ করা হয়নি।</p>
                    )}
                  </div>
                </div>
              </li>

              {/* বাকি মেনু লিংকসমূহ */}
              {navLinks.slice(1).map((link) => {
                const isClubLink = link.href === '#club-news'

                if (isClubLink) {
                  return (
                    <li key={link.href} className="flex items-center gap-1">
                      {/* নিউজ ক্যাটাগরি */}
                      <div className="relative group">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
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

                      {/* ক্যাম্পাস ক্লাবসমূহ */}
                      <div className="relative group">
                        <a
                          href="/#club-news"
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                        >
                          {lang === 'bn' ? link.bn : link.label}
                          <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                        </a>

                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
                          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                            {pick('ক্লাবসমূহের নামের তালিকা:', 'List of Clubs:')}
                          </p>
                          <a
                            href="/#club-news"
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
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-brand-soft transition-colors cursor-pointer"
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                                  {i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-xs text-navy truncate">{c.name}</p>
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
                      className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                    >
                      {lang === 'bn' ? link.bn : link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* লগইন বাটন ও মোবাইল মেনু টগল */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/admin"
              className="hidden items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-dark sm:inline-flex"
            >
              <Lock className="size-4" aria-hidden="true" />
              <Tx bn="সাংবাদিক লগইন" en="Reporter Login" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-navy xl:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* ==================== মোবাইল ড্রয়ার মেনু ==================== */}
        {menuOpen && (
          <nav className="border-t border-border bg-card xl:hidden max-h-[85vh] overflow-y-auto px-4 py-3 space-y-2">
            
            {/* মোবাইল: অনুষদ ও বিভাগসমূহ */}
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setFacultiesExpanded(!facultiesExpanded)}
                className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="size-4" />
                  <span>{pick('অনুষদ ও বিভাগসমূহ', 'Faculties & Depts')}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                    {facultiesList.length}টি
                  </span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${facultiesExpanded ? 'rotate-180' : ''}`} />
              </button>

              {facultiesExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-3">
                  {facultiesList.map((f) => (
                    <div key={f.id} className="space-y-1.5 border-b border-border/40 pb-2">
                      <p className="font-bold text-xs text-navy flex items-center gap-1.5">
                        🏛️ {f.name}
                      </p>
                      <div className="pl-4 space-y-1">
                        {f.departments.map((d) => (
                          <a
                            key={d.id}
                            href={`/department/${d.id}`}
                            onClick={() => setMenuOpen(false)}
                            className="block text-xs text-brand font-medium hover:underline py-0.5"
                          >
                            ➔ {d.name} {d.code ? `(${d.code})` : ""}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* মোবাইল: অন্যান্য সাংবাদিক সমিতি */}
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setAssociationsExpanded(!associationsExpanded)}
                className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand"
              >
                <span className="flex items-center gap-2">
                  <Newspaper className="size-4" />
                  <span>{pick('অন্যান্য সাংবাদিক সমিতি', 'Other Press Clubs')}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                    {associationsList.length}টি
                  </span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${associationsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {associationsExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <a
                    href="/associations"
                    onClick={() => setMenuOpen(false)}
                    className="block text-xs font-bold text-brand bg-brand-soft/80 p-2 rounded-xl text-center"
                  >
                    ➔ সকল সমিতি একনজরে দেখুন
                  </a>
                  {associationsList.map((assoc) => {
                    const link = assoc.website_url || assoc.fb_url || assoc.yt_url || '/associations'
                    return (
                      <a
                        key={assoc.id}
                        href={link}
                        target={link.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 text-xs font-semibold text-navy hover:text-brand py-1 px-1 border-b border-border/40"
                      >
                        {assoc.logo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={assoc.logo_url} alt="" className="size-5 rounded object-contain border" />
                        )}
                        <span className="truncate">{assoc.name}</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ⭐ মোবাইল: MBSTU Social Site ⭐ */}
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setSocialSitesExpanded(!socialSitesExpanded)}
                className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand"
              >
                <span className="flex items-center gap-2">
                  <Globe2 className="size-4" />
                  <span>{pick('MBSTU Social Site', 'MBSTU Social Site')}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                    {socialSitesList.length}টি
                  </span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${socialSitesExpanded ? 'rotate-180' : ''}`} />
              </button>

              {socialSitesExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <a
                    href="/social-sites"
                    onClick={() => setMenuOpen(false)}
                    className="block text-xs font-bold text-brand bg-brand-soft/80 p-2 rounded-xl text-center"
                  >
                    ➔ সকল সাইট ও গ্রুপ একনজরে দেখুন
                  </a>
                  {socialSitesList.map((site) => {
                    const link = site.fb_url || site.website_url || site.yt_url || '/social-sites'
                    return (
                      <a
                        key={site.id}
                        href={link}
                        target={link.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 text-xs font-semibold text-navy hover:text-brand py-1 px-1 border-b border-border/40"
                      >
                        {site.logo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={site.logo_url} alt="" className="size-5 rounded object-contain border" />
                        )}
                        <span className="truncate">{site.name}</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* মোবাইল: নিউজ ক্যাটাগরি */}
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand"
              >
                <span className="flex items-center gap-2">
                  <Layers className="size-4" />
                  <span>{pick('নিউজ ক্যাটাগরি', 'News Categories')}</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`} />
              </button>
              {categoriesExpanded && (
                <div className="border-t border-brand/20 bg-card p-2 space-y-1">
                  {categoriesList.map((cat, i) => (
                    <a
                      key={cat}
                      href={`/category/${encodeURIComponent(cat)}`}
                      onClick={() => setMenuOpen(false)}
                      className="block text-xs font-medium text-navy hover:text-brand py-1 px-2"
                    >
                      {i + 1}. {cat}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* মোবাইল: ক্যাম্পাস ক্লাবসমূহ */}
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setClubsExpanded(!clubsExpanded)}
                className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand"
              >
                <span>{pick('ক্যাম্পাস ক্লাবসমূহ', 'Campus Clubs')}</span>
                <ChevronDown className={`size-4 transition-transform ${clubsExpanded ? 'rotate-180' : ''}`} />
              </button>
              {clubsExpanded && (
                <div className="border-t border-brand/20 bg-card p-2 space-y-1">
                  {clubsList.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openClubWindow(c.id)}
                      className="block w-full text-left text-xs font-medium text-navy hover:text-brand py-1.5 px-2 truncate active:bg-brand-soft rounded-lg cursor-pointer"
                    >
                      ➔ {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* বাকি লিংকসমূহ */}
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-navy hover:bg-brand-soft"
              >
                {lang === 'bn' ? link.bn : link.label}
              </a>
            ))}

            <a
              href="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white mt-2"
            >
              <Lock className="size-4" />
              {pick('সাংবাদিক লগইন', 'Reporter Login')}
            </a>
          </nav>
        )}
      </header>
    </>
  )
}
