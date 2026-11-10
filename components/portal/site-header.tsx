'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Globe2,
  GraduationCap,
  Home,
  Info,
  Layers,
  Lock,
  Menu,
  Newspaper,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { navLinks, clubs as fallbackClubs } from '@/lib/data'
import { getCampusClubs, type ClubItem } from '@/lib/clubs'
import { getVisibleCategoryNames } from '@/lib/categories'
import { getFacultiesWithDepartments, type FacultyWithDepartments } from '@/lib/faculties'
import { getUniversityAssociations, type UniversityAssociation } from '@/lib/associations'
import { getSocialSites, type SocialSite } from '@/lib/social-sites'
import { getLeaders, POSITIONS, type Leader } from '@/lib/sb'
import { getAdministrationOfficials, type AdministrationOfficial } from '@/lib/administration'
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
  const [executiveExpanded, setExecutiveExpanded] = useState(false)
  const [administrationExpanded, setAdministrationExpanded] = useState(false)

  const [clubsList, setClubsList] = useState<ClubItem[]>([])
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [facultiesList, setFacultiesList] = useState<FacultyWithDepartments[]>([])
  const [associationsList, setAssociationsList] = useState<UniversityAssociation[]>([])
  const [socialSitesList, setSocialSitesList] = useState<SocialSite[]>([])
  const [leadersList, setLeadersList] = useState<Leader[]>([])
  const [adminOfficialsList, setAdminOfficialsList] = useState<AdministrationOfficial[]>([])
  
  const { lang, pick } = useLang()

  // বিশ্ববিদ্যালয় লোগো, লিংক ও টেক্সট
  const [univLogo, setUnivLogo] = useState('https://mbstu.ac.bd/images/logo.png')
  const [univLink, setUnivLink] = useState('https://mbstu.ac.bd')
  const [univText, setUnivText] = useState('')

  useEffect(() => {
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

    getCampusClubs().then((res) => {
      if (res && res.length > 0) setClubsList(res)
    })

    getVisibleCategoryNames().then(setCategoriesList)
    getFacultiesWithDepartments().then(setFacultiesList)
    getUniversityAssociations().then(setAssociationsList)
    getSocialSites().then(setSocialSitesList)

    getLeaders().then((rows) => {
      if (Array.isArray(rows)) {
        setLeadersList(rows.filter((l) => l.is_visible))
      }
    })

    getAdministrationOfficials().then((rows) => {
      if (Array.isArray(rows)) {
        setAdminOfficialsList(rows)
      }
    })
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

  function scrollToSection(href: string) {
    setMenuOpen(false)
    if (typeof window !== 'undefined') {
      if (href.startsWith('#')) {
        const id = href.replace('#', '')
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else if (window.location.pathname !== '/') {
          window.location.href = `/${href}`
        }
      }
    }
  }

  const mobileCardCls =
    'flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-brand hover:bg-brand-soft transition-colors'
  const mobileWrapperCls =
    'rounded-2xl border border-brand/20 bg-brand-soft/20 overflow-hidden'

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
                  className="size-9 sm:size-10 rounded-full object-cover shrink-0 select-none"
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
              
              <li>
                <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand">
                  {pick('হোম', 'Home')}
                </Link>
              </li>

              {/* কার্যনির্বাহী পরিষদ */}
              <li className="relative group">
                <Link
                  href="/#leadership"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <Users className="size-4 text-brand" />
                  <span>{pick('কার্যনির্বাহী পরিষদ', 'Executive Council')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </Link>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {pick('কার্যনির্বাহী পরিষদ সদস্যবৃন্দ', 'Council Members')}
                    </p>
                    <Link href="/#leadership" className="text-[11px] font-bold text-brand hover:underline">
                      {pick('একনজরে দেখুন →', 'View All →')}
                    </Link>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {leadersList.map((leader) => {
                      const pos = POSITIONS.find((p) => p.key === leader.position)
                      return (
                        <Link
                          key={leader.id}
                          href="/#leadership"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-brand-soft transition-colors"
                        >
                          {leader.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={leader.photo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <span className="size-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {leader.display_name.charAt(0)}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{leader.display_name}</p>
                            <p className="text-[10px] text-brand font-semibold truncate">{pos?.bn || leader.position}</p>
                          </div>
                        </Link>
                      )
                    })}
                    {leadersList.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">কোনো সদস্য যুক্ত নেই।</p>
                    )}
                  </div>
                </div>
              </li>

              {/* MBSTU Administration */}
              <li className="relative group">
                <Link
                  href="/administration"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <Building2 className="size-4 text-brand" />
                  <span>{pick('MBSTU Administration', 'MBSTU Administration')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </Link>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {pick('প্রশাসনিক দপ্তর ও কর্মকর্তা', 'Administration & Offices')}
                    </p>
                    <Link href="/administration" className="text-[11px] font-bold text-brand hover:underline">
                      {pick('সকল দপ্তর দেখুন →', 'View All →')}
                    </Link>
                  </div>
                  <div className="space-y-1 pt-2">
                    {adminOfficialsList.slice(0, 7).map((item) => (
                      <Link
                        key={item.id}
                        href="/administration"
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-brand-soft transition-colors"
                      >
                        {item.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.photo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                            👤
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-navy truncate">{item.name}</p>
                          <p className="text-[10px] text-brand font-semibold truncate">{item.designation} · {item.office_name}</p>
                        </div>
                      </Link>
                    ))}
                    {adminOfficialsList.length === 0 && (
                      <Link href="/administration" className="block text-center text-xs text-brand font-bold py-2 bg-brand-soft/60 rounded-xl">
                        ➔ প্রশাসন পেজে যান
                      </Link>
                    )}
                  </div>
                </div>
              </li>

              {/* অনুষদ ও বিভাগসমূহ */}
              <li className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand cursor-pointer"
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
                              <Link
                                key={d.id}
                                href={`/department/${d.id}`}
                                className="flex items-center justify-between text-xs text-navy/85 hover:text-brand hover:underline py-0.5 truncate"
                              >
                                <span>{d.name} {d.code ? `(${d.code})` : ""}</span>
                                <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                              </Link>
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
                <Link
                  href="/associations"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <Newspaper className="size-4 text-brand" />
                  <span>{pick('অন্যান্য সাংবাদিক সমিতি', 'Other Press Clubs')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </Link>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {pick('সাংবাদিক সমিতিসমূহ', 'Journalist Associations')}
                    </p>
                    <Link href="/associations" className="text-[11px] font-bold text-brand hover:underline">
                      {pick('সবগুলো দেখুন →', 'View All →')}
                    </Link>
                  </div>
                  <div className="space-y-1 pt-2">
                    {associationsList.map((assoc, i) => {
                      const link = assoc.website_url || assoc.fb_url || assoc.yt_url || '/associations'
                      const isExt = link.startsWith('http')
                      return isExt ? (
                        <a
                          key={assoc.id}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {assoc.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={assoc.logo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{assoc.name}</p>
                          </div>
                        </a>
                      ) : (
                        <Link
                          key={assoc.id}
                          href={link}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {assoc.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={assoc.logo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{assoc.name}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </li>

              {/* MBSTU Social Site */}
              <li className="relative group">
                <Link
                  href="/social-sites"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                >
                  <Globe2 className="size-4 text-brand" />
                  <span>{pick('MBSTU Social Site', 'MBSTU Social Site')}</span>
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                </Link>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {pick('সোশ্যাল সাইট ও গ্রুপসমূহ', 'Social Sites & Groups')}
                    </p>
                    <Link href="/social-sites" className="text-[11px] font-bold text-brand hover:underline">
                      {pick('সবগুলো দেখুন →', 'View All →')}
                    </Link>
                  </div>
                  <div className="space-y-1 pt-2">
                    {socialSitesList.map((site, i) => {
                      const link = site.fb_url || site.website_url || site.yt_url || '/social-sites'
                      const isExt = link.startsWith('http')
                      return isExt ? (
                        <a
                          key={site.id}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {site.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={site.logo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{site.name}</p>
                          </div>
                        </a>
                      ) : (
                        <Link
                          key={site.id}
                          href={link}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-brand-soft transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {site.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={site.logo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-navy truncate">{site.name}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </li>

              {/* নিউজ ক্যাটাগরি ও ক্লাবসমূহ */}
              <li className="flex items-center gap-1">
                <div className="relative group">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand cursor-pointer"
                  >
                    <span>{pick('নিউজ ক্যাটাগরি', 'News Categories')}</span>
                    <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-60 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-0.5 pt-1">
                      {categoriesList.map((cat) => (
                        <Link
                          key={cat}
                          href={`/category/${encodeURIComponent(cat)}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-navy hover:bg-brand-soft transition-colors"
                        >
                          <span className="truncate">{cat}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/#club-news"
                    className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand"
                  >
                    {pick('ক্যাম্পাস ক্লাবসমূহ', 'Campus Clubs')}
                    <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1 w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
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
                          {c.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.logo_url}
                              alt=""
                              className="size-8 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
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

              {/* ডিরেক্টর প্যানেল */}
              <li>
                <Link href="/council" className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand">
                  {pick('ডিরেক্টর প্যানেল', 'Director Panel')}
                </Link>
              </li>

              {/* স্টুডেন্ট কর্নার */}
              <li>
                <Link href="/student-corner" className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand">
                  {pick('স্টুডেন্ট কর্নার', 'Student Corner')}
                </Link>
              </li>

              {/* নোটিশ */}
              <li>
                <Link href="/notices" className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand">
                  {pick('নোটিশ', 'Notices')}
                </Link>
              </li>

              {/* পরিচিতি */}
              <li>
                <Link href="/#about" className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-brand-soft hover:text-brand">
                  {pick('পরিচিতি', 'About')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* লগইন বাটন ও মোবাইল মেনু টগল */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-dark sm:inline-flex cursor-pointer transition-colors"
            >
              <Lock className="size-4" aria-hidden="true" />
              <Tx bn="সাংবাদিক লগইন" en="Reporter Login" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-navy xl:hidden cursor-pointer"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* ==================== মোবাইল ড্রয়ার মেনু ==================== */}
        {menuOpen && (
          <nav className="border-t border-border bg-card xl:hidden max-h-[85vh] overflow-y-auto px-4 py-3 space-y-2">
            
            <div className={mobileWrapperCls}>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Home className="size-4" />
                  <span>{pick('হোম', 'Home')}</span>
                </span>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            </div>

            {/* কার্যনির্বাহী পরিষদ */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setExecutiveExpanded(!executiveExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="size-4" />
                  <span>{pick('কার্যনির্বাহী পরিষদ', 'Executive Council')}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                    {leadersList.length} জন
                  </span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${executiveExpanded ? 'rotate-180' : ''}`} />
              </button>

              {executiveExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <Link
                    href="/#leadership"
                    onClick={() => scrollToSection('#leadership')}
                    className="block text-xs font-bold text-brand bg-brand-soft/80 p-2 rounded-xl text-center"
                  >
                    ➔ সম্পূর্ণ পরিষদ একনজরে দেখুন
                  </Link>
                  {leadersList.map((leader) => {
                    const pos = POSITIONS.find((p) => p.key === leader.position)
                    return (
                      <Link
                        key={leader.id}
                        href="/#leadership"
                        onClick={() => scrollToSection('#leadership')}
                        className="flex items-center gap-2.5 py-1.5 border-b border-border/40 text-xs"
                      >
                        {leader.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={leader.photo_url} alt="" className="size-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <span className="size-7 rounded-full bg-brand text-white font-bold text-[10px] flex items-center justify-center">
                            {leader.display_name.charAt(0)}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-navy truncate">{leader.display_name}</p>
                          <p className="text-[10px] text-brand font-semibold truncate">{pos?.bn || leader.position}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* MBSTU Administration */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setAdministrationExpanded(!administrationExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Building2 className="size-4" />
                  <span>{pick('MBSTU Administration', 'MBSTU Administration')}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                    {adminOfficialsList.length} জন
                  </span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${administrationExpanded ? 'rotate-180' : ''}`} />
              </button>

              {administrationExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <Link
                    href="/administration"
                    onClick={() => setMenuOpen(false)}
                    className="block text-xs font-bold text-brand bg-brand-soft/80 p-2 rounded-xl text-center"
                  >
                    ➔ সকল প্রশাসনিক কর্মকর্তা ও দপ্তর দেখুন
                  </Link>
                  {adminOfficialsList.slice(0, 8).map((official) => (
                    <Link
                      key={official.id}
                      href="/administration"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 py-1.5 border-b border-border/40 text-xs"
                    >
                      {official.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={official.photo_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="size-8 rounded-full bg-brand text-white font-bold text-[10px] flex items-center justify-center">
                          👤
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-navy truncate">{official.name}</p>
                        <p className="text-[10px] text-brand font-semibold truncate">{official.designation} · {official.office_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* অনুষদ ও বিভাগসমূহ */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setFacultiesExpanded(!facultiesExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <GraduationCap className="size-4" />
                  <span>{pick('অনুষদ ও বিভাগসমূহ', 'Faculties & Depts')}</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${facultiesExpanded ? 'rotate-180' : ''}`} />
              </button>
              {facultiesExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-3">
                  {facultiesList.map((f) => (
                    <div key={f.id} className="space-y-1.5 border-b border-border/40 pb-2">
                      <p className="font-bold text-xs text-navy">🏛️ {f.name}</p>
                      <div className="pl-4 space-y-1">
                        {f.departments.map((d) => (
                          <Link key={d.id} href={`/department/${d.id}`} onClick={() => setMenuOpen(false)} className="block text-xs text-brand py-0.5">
                            ➔ {d.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* অন্যান্য সাংবাদিক সমিতি */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setAssociationsExpanded(!associationsExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Newspaper className="size-4" />
                  <span>{pick('অন্যান্য সাংবাদিক সমিতি', 'Other Press Clubs')}</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${associationsExpanded ? 'rotate-180' : ''}`} />
              </button>
              {associationsExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <Link href="/associations" onClick={() => setMenuOpen(false)} className="block text-xs font-bold text-brand bg-brand-soft/80 p-2 rounded-xl text-center">
                    ➔ সকল সমিতি একনজরে দেখুন
                  </Link>
                  {associationsList.map((assoc) => (
                    <Link key={assoc.id} href={assoc.website_url || '/associations'} onClick={() => setMenuOpen(false)} className="block text-xs font-semibold py-1 border-b truncate">
                      {assoc.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* MBSTU Social Site */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setSocialSitesExpanded(!socialSitesExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Globe2 className="size-4" />
                  <span>{pick('MBSTU Social Site', 'MBSTU Social Site')}</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${socialSitesExpanded ? 'rotate-180' : ''}`} />
              </button>
              {socialSitesExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <Link href="/social-sites" onClick={() => setMenuOpen(false)} className="block text-xs font-bold text-brand bg-brand-soft/80 p-2 rounded-xl text-center">
                    ➔ সকল সাইট ও গ্রুপ একনজরে দেখুন
                  </Link>
                  {socialSitesList.map((site) => (
                    <Link key={site.id} href={site.fb_url || '/social-sites'} onClick={() => setMenuOpen(false)} className="block text-xs font-semibold py-1 border-b truncate">
                      {site.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* নিউজ ক্যাটাগরি */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="size-4" />
                  <span>{pick('নিউজ ক্যাটাগরি', 'News Categories')}</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`} />
              </button>
              {categoriesExpanded && (
                <div className="border-t border-brand/20 bg-card p-2 space-y-1">
                  {categoriesList.map((cat, i) => (
                    <Link
                      key={cat}
                      href={`/category/${encodeURIComponent(cat)}`}
                      onClick={() => setMenuOpen(false)}
                      className="block text-xs font-medium text-navy hover:text-brand py-1 px-2"
                    >
                      {i + 1}. {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ক্যাম্পাস ক্লাবসমূহ */}
            <div className={mobileWrapperCls}>
              <button
                type="button"
                onClick={() => setClubsExpanded(!clubsExpanded)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Star className="size-4" />
                  <span>{pick('ক্যাম্পাস ক্লাবসমূহ', 'Campus Clubs')}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                    {clubsList.length}টি ক্লাব
                  </span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${clubsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {clubsExpanded && (
                <div className="border-t border-brand/20 bg-card p-3 space-y-2">
                  <Link
                    href="/#club-news"
                    onClick={() => scrollToSection('#club-news')}
                    className="flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    <ChevronRight className="size-3.5" />
                    <span>{pick('➔ সব ক্লাব একনজরে দেখুন', '➔ View All Clubs')}</span>
                  </Link>

                  <div className="divide-y divide-border/40">
                    {clubsList.map((c, i) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => openClubWindow(c.id)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-brand-soft transition-colors active:scale-[0.99] cursor-pointer"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                          {i + 1}
                        </span>
                        {c.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.logo_url}
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
                            {c.name.charAt(0)}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-navy truncate">{c.name}</p>
                          {c.name_bn && (
                            <p className="text-[10px] text-muted-foreground truncate">{c.name_bn}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ডিরেক্টর প্যানেল */}
            <div className={mobileWrapperCls}>
              <Link
                href="/council"
                onClick={() => setMenuOpen(false)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <UserCheck className="size-4" />
                  <span>{pick('ডিরেক্টর প্যানেল', 'Director Panel')}</span>
                </span>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            </div>

            {/* স্টুডেন্ট কর্নার */}
            <div className={mobileWrapperCls}>
              <Link
                href="/student-corner"
                onClick={() => setMenuOpen(false)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="size-4" />
                  <span>{pick('স্টুডেন্ট কর্নার', 'Student Corner')}</span>
                </span>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            </div>

            {/* নোটিশ */}
            <div className={mobileWrapperCls}>
              <Link
                href="/notices"
                onClick={() => setMenuOpen(false)}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Bell className="size-4" />
                  <span>{pick('নোটিশ', 'Notices')}</span>
                </span>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            </div>

            {/* পরিচিতি */}
            <div className={mobileWrapperCls}>
              <Link
                href="/#about"
                onClick={() => scrollToSection('#about')}
                className={mobileCardCls}
              >
                <span className="flex items-center gap-2.5">
                  <Info className="size-4" />
                  <span>{pick('পরিচিতি', 'About')}</span>
                </span>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            </div>

            <Link
              href="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-semibold text-white mt-3 shadow-md"
            >
              <Lock className="size-4" />
              {pick('সাংবাদিক লগইন', 'Reporter Login')}
            </Link>
          </nav>
        )}
      </header>
    </>
  )
}
