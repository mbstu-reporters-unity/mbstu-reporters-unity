'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Film,
  GraduationCap,
  Home,
  Info,
  LayoutGrid,
  Lock,
  Menu,
  Newspaper,
  Phone,
  Settings,
  Star,
  Users,
  X,
  FileText,
  Globe2,
  ShieldCheck,
  Tag,
  Landmark,
  User,
  Sparkles,
} from 'lucide-react'
import { getCampusClubs, type ClubItem } from '@/lib/clubs'
import { getVisibleCategoryNames } from '@/lib/categories'
import { getFacultiesWithDepartments, type FacultyWithDepartments } from '@/lib/faculties'
import { getCommunityPages, type CommunityPage } from '@/lib/pages'
import { getUniversityAssociations, type UniversityAssociation } from '@/lib/associations'
import { getSocialSites, type SocialSite } from '@/lib/social-sites'
import { ADMIN_CATEGORIES } from '@/lib/administration'
import { SB_URL, SB_KEY, getMe, type Profile } from '@/lib/sb'
import { Logo } from './logo'
import { useLang } from '@/lib/i18n'

const HEADER_CACHE_KEY = 'mbstu_header_cache_v1'
const HEADER_CACHE_TTL = 3 * 60 * 1000
const ME_CACHE_TTL = 60 * 1000

type HeaderCachePayload = {
  ts: number
  univLogo: string
  univLink: string
  univText: string
  clubsList: ClubItem[]
  categoriesList: string[]
  facultiesList: FacultyWithDepartments[]
  communityPagesList: CommunityPage[]
  associationsList: UniversityAssociation[]
  socialSitesList: SocialSite[]
}

let memHeaderCache: HeaderCachePayload | null = null
let memHeaderPromise: Promise<HeaderCachePayload> | null = null
let memMeCache: { token: string; ts: number; profile: Profile | null } | null = null

async function fetchHeaderData(): Promise<HeaderCachePayload> {
  if (memHeaderPromise) return memHeaderPromise

  memHeaderPromise = (async () => {
    let univLogo = 'https://mbstu.ac.bd/images/logo.png'
    let univLink = 'https://mbstu.ac.bd'
    let univText = ''

    const [cfgRows, clubs, categories, faculties, pages, associations, socialSites] = await Promise.all([
      fetch(
        `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(univ_logo_url,univ_link_url,univ_text)`,
        { headers: { apikey: SB_KEY }, cache: 'no-store' }
      )
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []),
      getCampusClubs().catch(() => []),
      getVisibleCategoryNames().catch(() => []),
      getFacultiesWithDepartments().catch(() => []),
      getCommunityPages().catch(() => []),
      getUniversityAssociations().catch(() => []),
      getSocialSites().catch(() => []),
    ])

    if (Array.isArray(cfgRows)) {
      cfgRows.forEach((r: { key?: string; value?: string }) => {
        if (r.key === 'univ_logo_url' && r.value) univLogo = r.value
        if (r.key === 'univ_link_url' && r.value) univLink = r.value
        if (r.key === 'univ_text') univText = r.value || ''
      })
    }

    const payload: HeaderCachePayload = {
      ts: Date.now(),
      univLogo,
      univLink,
      univText,
      clubsList: clubs || [],
      categoriesList: categories || [],
      facultiesList: faculties || [],
      communityPagesList: (pages || []).filter((p) => p.is_active !== false),
      associationsList: associations || [],
      socialSitesList: socialSites || [],
    }

    memHeaderCache = payload
    try {
      sessionStorage.setItem(HEADER_CACHE_KEY, JSON.stringify(payload))
    } catch {}
    return payload
  })().finally(() => {
    memHeaderPromise = null
  })

  return memHeaderPromise
}

export function SiteHeader() {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [navStack, setNavStack] = useState<string[]>(['root'])

  const [clubsList, setClubsList] = useState<ClubItem[]>([])
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [facultiesList, setFacultiesList] = useState<FacultyWithDepartments[]>([])
  const [communityPagesList, setCommunityPagesList] = useState<CommunityPage[]>([])
  const [associationsList, setAssociationsList] = useState<UniversityAssociation[]>([])
  const [socialSitesList, setSocialSitesList] = useState<SocialSite[]>([])

  const { pick } = useLang()

  const [univLogo, setUnivLogo] = useState('https://mbstu.ac.bd/images/logo.png')
  const [univLink, setUnivLink] = useState('https://mbstu.ac.bd')
  const [univText, setUnivText] = useState('')

  const [me, setMe] = useState<Profile | null>(null)

  useEffect(() => {
    let alive = true

    const applyHeaderData = (d: HeaderCachePayload) => {
      if (!alive) return
      setUnivLogo(d.univLogo)
      setUnivLink(d.univLink)
      setUnivText(d.univText)
      setClubsList(d.clubsList)
      setCategoriesList(d.categoriesList)
      setFacultiesList(d.facultiesList)
      setCommunityPagesList(d.communityPagesList)
      setAssociationsList(d.associationsList)
      setSocialSitesList(d.socialSitesList)
    }

    let servedFromCache = false
    if (memHeaderCache && Date.now() - memHeaderCache.ts < HEADER_CACHE_TTL) {
      applyHeaderData(memHeaderCache)
      servedFromCache = true
    } else {
      try {
        const raw = sessionStorage.getItem(HEADER_CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as HeaderCachePayload
          if (parsed?.ts && Date.now() - parsed.ts < HEADER_CACHE_TTL) {
            memHeaderCache = parsed
            applyHeaderData(parsed)
            servedFromCache = true
          }
        }
      } catch {}
    }

    if (!servedFromCache) {
      fetchHeaderData().then(applyHeaderData).catch(() => {})
    }

    try {
      const t = localStorage.getItem('mbstu_admin_token') || ''
      if (t) {
        if (memMeCache && memMeCache.token === t && Date.now() - memMeCache.ts < ME_CACHE_TTL) {
          if (alive && memMeCache.profile) setMe(memMeCache.profile)
        } else {
          getMe(t)
            .then((profile) => {
              memMeCache = { token: t, ts: Date.now(), profile }
              if (alive && profile) setMe(profile)
            })
            .catch(() => {})
        }
      }
    } catch {}

    return () => {
      alive = false
    }
  }, [])

  const openMenuDrawer = () => {
    setNavStack(['root'])
    setMenuOpen(true)
  }

  const closeMenuDrawer = () => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
    setNavStack(['root'])
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenuDrawer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const goToNextLevel = (levelKey: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setNavStack((prev) => [...prev, levelKey])
  }

  const goStepBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setNavStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['root']))
  }

  function scrollToSection(sectionId: string) {
    closeMenuDrawer()
    if (typeof window === 'undefined') return

    const isHome = window.location.pathname === '/' || window.location.pathname === ''
    if (isHome) {
      const el = document.getElementById(sectionId)
      if (el) {
        const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - 70
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    } else {
      window.location.href = `/#${sectionId}`
    }
  }

  function openClubWindow(clubId: string) {
    closeMenuDrawer()
    if (typeof window !== 'undefined') {
      const isHome = window.location.pathname === '/' || window.location.pathname === ''
      if (isHome) {
        const url = new URL(window.location.href)
        url.searchParams.set('club', clubId)
        window.history.pushState({}, '', url.toString())
        window.dispatchEvent(new CustomEvent('open-club-modal', { detail: clubId }))
        const el = document.getElementById(`club-${clubId}`) || document.getElementById('club-news')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = `/?club=${clubId}#club-news`
      }
    }
  }

  const currentLevel = navStack[navStack.length - 1]

  const getBreadcrumbInfo = () => {
    switch (currentLevel) {
      case 'admin_tier': return { parent: 'মূল মেনু', current: 'প্রশাসন ও দপ্তর' }
      case 'faculties_dept': return { parent: 'মূল মেনু', current: 'অনুষদ ও বিভাগসমূহ' }
      case 'social_sites': return { parent: 'মূল মেনু', current: 'সোশ্যাল সাইট ও গ্রুপ' }
      case 'news': return { parent: 'মূল মেনু', current: 'সংবাদ ও ক্যাটাগরি' }
      case 'associations_tier': return { parent: 'মূল মেনু', current: 'সাংবাদিক সমিতিসমূহ' }
      case 'clubs_tier': return { parent: 'মূল মেনু', current: 'ক্যাম্পাস ক্লাবসমূহ' }
      case 'pages_tier': return { parent: 'মূল মেনু', current: 'ক্যাম্পাস পেজসমূহ' }
      case 'about': return { parent: 'মূল মেনু', current: 'পরিষদ ও পরিচিতি' }
      default: return { parent: '', current: 'সকল নেভিগেশন মেনু' }
    }
  }

  const breadcrumb = getBreadcrumbInfo()

  const tileCls = (active = false) =>
    `relative flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all active:scale-95 cursor-pointer ${
      active
        ? 'border-blue-500/80 bg-blue-500/15 shadow-[0_0_18px_rgba(59,130,246,0.22)]'
        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/20'
    }`

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071030]/95 shadow-lg backdrop-blur-2xl w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5">
          
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-2 overflow-hidden">
            <Logo inverted />
            <span className="h-5 w-px bg-white/20 shrink-0 hidden xs:block" aria-hidden="true" />
            <a
              href={univLink || 'https://mbstu.ac.bd'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 shrink-0"
              title="মাভাবিপ্রবি"
            >
              {univLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={univLogo}
                  alt="MBSTU"
                  className="size-7 sm:size-9 rounded-full object-cover shrink-0 select-none ring-1 sm:ring-2 ring-white/20 shadow-xs"
                />
              )}
              <span className="hidden md:inline text-[11px] font-bold text-white/90 truncate max-w-[120px]">
                {univText || "MBSTU"}
              </span>
            </a>
          </div>

          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2 text-sm font-semibold text-white/85">
              <li>
                <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                  {pick('হোম', 'Home')}
                </Link>
              </li>

              <li className="relative group">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Building2 className="size-4 text-cyan-400" />
                  <span>{pick('বিশ্ববিদ্যালয়', 'University')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl max-h-[80vh] overflow-y-auto scrollbar-none space-y-2">
                    <Link href="/administration" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors">
                      <span className="font-bold text-cyan-300">🏛️ শীর্ষ প্রশাসন ও দপ্তরসমূহ</span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                    <div className="border-t border-white/10 pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 px-2 mb-1 flex items-center gap-1.5">
                        <GraduationCap className="size-3.5" />
                        <span>অনুষদ ও বিভাগসমূহ</span>
                      </p>
                      <div className="space-y-1">
                        {facultiesList.map((f) => (
                          <div key={f.id} className="rounded-xl p-1.5 hover:bg-white/10 transition-colors">
                            <p className="font-bold text-xs text-white px-1">🏛️ {f.name}</p>
                            <div className="pl-4 pt-1 space-y-0.5">
                              {f.departments.map((d) => (
                                <Link key={d.id} href={`/department/${d.id}`} className="block text-[11px] text-white/75 hover:text-cyan-300 truncate">
                                  ➔ {d.name} {d.code ? `(${d.code})` : ''}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href="/social-sites" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors border-t border-white/10">
                      <span>ক্যাম্পাস সোশ্যাল সাইট ও গ্রুপ</span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                  </div>
                </div>
              </li>

              <li className="relative group">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Newspaper className="size-4 text-cyan-400" />
                  <span>{pick('সংবাদ ও মিডিয়া', 'News & Media')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-72 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl space-y-1">
                    <Link href="/notices" className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                      <span className="flex items-center gap-2"><Bell className="size-3.5 text-cyan-400" /><span>ডিজিটাল নোটিশ বোর্ড</span></span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>
                    <Link href="/associations" className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                      <span className="flex items-center gap-2"><Users className="size-3.5 text-cyan-400" /><span>অন্যান্য সাংবাদিক সমিতি</span></span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>
                    {categoriesList.length > 0 && (
                      <div className="border-t border-white/10 pt-1.5 mt-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">সংবাদের ক্যাটাগরিসমূহ:</p>
                        {categoriesList.slice(0, 6).map((cat) => (
                          <Link key={cat} href={`/category/${encodeURIComponent(cat)}`} className="flex items-center justify-between px-3 py-1.5 text-xs text-white/80 hover:text-cyan-300">
                            <span># {cat}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>

              <li className="relative group">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Star className="size-4 text-cyan-400" />
                  <span>{pick('কমিউনিটি ও ক্লাব', 'Community')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl space-y-2">
                    <button
                      type="button"
                      onClick={() => scrollToSection('club-news')}
                      className="w-full text-left text-xs font-bold text-cyan-300 p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                    >
                      ⭐ ক্যাম্পাস ক্লাবসমূহ ({clubsList.length}) →
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('community-pages')}
                      className="w-full text-left text-xs font-bold text-white/90 p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                    >
                      📄 ক্যাম্পাস পেজ ও সোসাইটিসমূহ →
                    </button>
                    <Link href="/student-corner" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-1.5"><BookOpen className="size-3.5 text-cyan-400" /><span>স্টুডেন্ট কর্নার</span></span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                  </div>
                </div>
              </li>

              <li className="relative group">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Users className="size-4 text-cyan-400" />
                  <span>{pick('পরিষদ ও পরিচিতি', 'About')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full pt-2 w-64 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl space-y-1">
                    <button
                      type="button"
                      onClick={() => scrollToSection('leadership')}
                      className="w-full text-left text-xs font-bold text-cyan-300 p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                    >
                      👥 কার্যনির্বাহী পরিষদ →
                    </button>
                    <Link href="/council" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors">
                      <span>🛡️ ডিরেক্টর প্যানেল</span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => scrollToSection('about')}
                      className="w-full text-left text-xs text-white/90 p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                    >
                      ℹ️ ইউনিটি পরিচিতি →
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {me ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-md border border-white/20 transition active:scale-95 shrink-0"
                title="আমার প্রোফাইল ও ড্যাশবোর্ড"
              >
                {me.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.avatar_url} alt="" className="size-4 sm:size-4.5 rounded-full object-cover" />
                ) : (
                  <User className="size-3 sm:size-3.5" />
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate">{me.full_name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-md border border-white/20 transition active:scale-95 shrink-0"
              >
                <Lock className="size-3 sm:size-3.5" />
                <span>{pick('লগইন', 'Login')}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={menuOpen ? closeMenuDrawer : openMenuDrawer}
              className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 lg:hidden cursor-pointer shrink-0 active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="size-4 sm:size-5" /> : <Menu className="size-4 sm:size-5" />}
            </button>
          </div>

        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[120] lg:hidden bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={closeMenuDrawer}
        >
          <nav
            role="dialog"
            aria-modal="true"
            aria-label="সকল নেভিগেশন মেনু"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[88dvh] flex flex-col rounded-3xl border border-white/15 bg-[#0f172a]/95 text-white shadow-[0_24px_60px_rgba(0,0,0,0.75)] overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 fade-in duration-200 select-none"
          >
            <div className="flex items-center justify-between gap-2.5 px-4 py-3.5 border-b border-white/10 bg-white/[0.03] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {navStack.length > 1 ? (
                  <button
                    type="button"
                    onClick={goStepBack}
                    className="size-10 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
                    aria-label="পেছনে ফিরুন"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                ) : (
                  <div className="size-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shrink-0">
                    <LayoutGrid className="size-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-white truncate leading-tight">
                    {breadcrumb.current}
                  </h2>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {navStack.length > 1
                      ? `${breadcrumb.parent} › ${breadcrumb.current}`
                      : 'যেকোনো সেকশনে দ্রুত যেতে ট্যাপ করুন'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenuDrawer}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white/75 hover:text-white border border-white/10 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
                aria-label="বন্ধ করুন"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 scrollbar-none">
              {currentLevel === 'root' && (
                <div className="grid grid-cols-2 gap-2.5 animate-in fade-in">
                  <Link
                    href="/"
                    onClick={closeMenuDrawer}
                    className={tileCls(pathname === '/')}
                  >
                    <span className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Home className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1 truncate">
                      হোমপেজ
                    </span>
                    {pathname === '/' && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => scrollToSection('general-news')}
                    className={tileCls(false)}
                  >
                    <span className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <Newspaper className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      ক্যাম্পাস সংবাদ
                    </span>
                  </button>

                  <Link
                    href="/notices"
                    onClick={closeMenuDrawer}
                    className={tileCls(pathname.startsWith('/notices'))}
                  >
                    <span className="size-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <Bell className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      ডিজিটাল নোটিশ
                    </span>
                    {pathname.startsWith('/notices') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('news', e)}
                    className={tileCls(pathname.startsWith('/category'))}
                  >
                    <span className="size-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <Tag className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      সংবাদ ও ক্যাটাগরি
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('admin_tier', e)}
                    className={tileCls(pathname.startsWith('/administration'))}
                  >
                    <span className="size-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Landmark className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      প্রশাসন ও দপ্তর
                    </span>
                    {pathname.startsWith('/administration') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('faculties_dept', e)}
                    className={tileCls(pathname.startsWith('/department'))}
                  >
                    <span className="size-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <GraduationCap className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      অনুষদ ও বিভাগ
                    </span>
                    {pathname.startsWith('/department') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('clubs_tier', e)}
                    className={tileCls(false)}
                  >
                    <span className="size-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <Star className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      ক্যাম্পাস ক্লাব
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('pages_tier', e)}
                    className={tileCls(pathname.startsWith('/p/'))}
                  >
                    <span className="size-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <FileText className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      ক্যাম্পাস পেজ
                    </span>
                    {pathname.startsWith('/p/') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </button>

                  <Link
                    href="/student-corner"
                    onClick={closeMenuDrawer}
                    className={tileCls(pathname.startsWith('/student-corner'))}
                  >
                    <span className="size-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <BookOpen className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      স্টুডেন্ট কর্নার
                    </span>
                    {pathname.startsWith('/student-corner') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('social_sites', e)}
                    className={tileCls(pathname.startsWith('/social-sites'))}
                  >
                    <span className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Globe2 className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      সোশ্যাল সাইট
                    </span>
                    {pathname.startsWith('/social-sites') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('associations_tier', e)}
                    className={tileCls(pathname.startsWith('/associations'))}
                  >
                    <span className="size-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <Building2 className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      সাংবাদিক সমিতি
                    </span>
                    {pathname.startsWith('/associations') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => goToNextLevel('about', e)}
                    className={tileCls(pathname.startsWith('/council'))}
                  >
                    <span className="size-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Users className="size-4.5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      পরিষদ ও পরিচিতি
                    </span>
                    {pathname.startsWith('/council') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </button>

                  {me ? (
                    <Link
                      href={`/u/${me.id}`}
                      onClick={closeMenuDrawer}
                      className={tileCls(pathname.startsWith(`/u/${me.id}`))}
                    >
                      <span className="size-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shrink-0">
                        <User className="size-4.5" />
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                        আমার প্রোফাইল
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => scrollToSection('contact')}
                      className={tileCls(false)}
                    >
                      <span className="size-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shrink-0">
                        <Phone className="size-4.5" />
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                        যোগাযোগ
                      </span>
                    </button>
                  )}

                  <Link
                    href="/admin"
                    onClick={closeMenuDrawer}
                    className={tileCls(pathname.startsWith('/admin'))}
                  >
                    <span className="size-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
                      {me ? <Settings className="size-4.5" /> : <Lock className="size-4.5" />}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight flex-1">
                      {me ? 'ড্যাশবোর্ড' : 'লগইন / নিবন্ধন'}
                    </span>
                    {pathname.startsWith('/admin') && (
                      <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] shrink-0" />
                    )}
                  </Link>
                </div>
              )}

              {currentLevel === 'admin_tier' && (
                <div className="space-y-2 animate-in fade-in">
                  {ADMIN_CATEGORIES.map((cat, idx) => (
                    <Link
                      key={idx}
                      href="/administration"
                      onClick={closeMenuDrawer}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10 transition"
                    >
                      <span className="flex items-center gap-2.5">
                        <Landmark className="size-4 text-cyan-400 shrink-0" />
                        <span>{cat}</span>
                      </span>
                      <ChevronRight className="size-4 text-white/40 shrink-0" />
                    </Link>
                  ))}
                  <Link
                    href="/administration"
                    onClick={closeMenuDrawer}
                    className="block text-center font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl py-2.5 text-xs mt-2 shadow-md"
                  >
                    সকল কর্মকর্তার পূর্ণাঙ্গ তালিকা দেখুন →
                  </Link>
                </div>
              )}

              {currentLevel === 'faculties_dept' && (
                <div className="space-y-2.5 animate-in fade-in">
                  {facultiesList.map((f) => (
                    <div key={f.id} className="bg-white/[0.04] rounded-2xl p-3 border border-white/10 space-y-1.5">
                      <p className="font-bold text-cyan-300 text-xs">🏛️ {f.name}</p>
                      <div className="pl-3 space-y-1 border-l-2 border-cyan-400/50">
                        {f.departments.map((d) => (
                          <Link
                            key={d.id}
                            href={`/department/${d.id}`}
                            onClick={closeMenuDrawer}
                            className="flex items-center justify-between text-xs text-white/85 hover:text-cyan-300 py-1"
                          >
                            <span className="truncate">➔ {d.name} {d.code ? `(${d.code})` : ''}</span>
                            <ChevronRight className="size-3.5 text-cyan-400 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  {facultiesList.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">অনুষদের তথ্য লোড হচ্ছে...</p>
                  )}
                </div>
              )}

              {currentLevel === 'news' && (
                <div className="space-y-2 animate-in fade-in">
                  <Link
                    href="/notices"
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/10"
                  >
                    <span className="flex items-center gap-2.5"><Bell className="size-4 text-emerald-400" /><span>ডিজিটাল নোটিশ বোর্ড</span></span>
                    <ChevronRight className="size-4 text-white/40" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => scrollToSection('community-feed')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/10 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5"><Sparkles className="size-4 text-cyan-400" /><span>সবার পোস্ট ও পেজ ফিড</span></span>
                    <ChevronRight className="size-4 text-white/40" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('home')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/10 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5"><Film className="size-4 text-rose-400" /><span>ক্যাম্পাস রিলস ও ভিডিও হাব</span></span>
                    <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">LIVE</span>
                  </button>

                  {categoriesList.length > 0 && (
                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <Tag className="size-3.5" />
                        <span>সংবাদের ক্যাটাগরিসমূহ:</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {categoriesList.map((cat) => (
                          <Link
                            key={cat}
                            href={`/category/${encodeURIComponent(cat)}`}
                            onClick={closeMenuDrawer}
                            className="bg-white/[0.05] hover:bg-white/[0.12] text-cyan-200 border border-white/10 px-3 py-2 rounded-xl text-xs font-semibold truncate"
                          >
                            # {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentLevel === 'clubs_tier' && (
                <div className="space-y-2 animate-in fade-in">
                  {clubsList.map((club) => (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => openClubWindow(club.id)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold text-white text-left cursor-pointer border border-white/10"
                    >
                      <span className="truncate">⭐ {club.name_bn || club.name}</span>
                      <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-700/60 shrink-0 ml-2">
                        দেখুন
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => scrollToSection('club-news')}
                    className="w-full text-center font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl py-2.5 text-xs mt-2 cursor-pointer shadow-md"
                  >
                    ক্লাব সেকশনে যান →
                  </button>
                </div>
              )}

              {currentLevel === 'pages_tier' && (
                <div className="space-y-2 animate-in fade-in">
                  {communityPagesList.map((cp) => (
                    <Link
                      key={cp.id}
                      href={`/p/${cp.slug}`}
                      onClick={closeMenuDrawer}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10"
                    >
                      <span className="truncate">📄 {cp.name}</span>
                      <ChevronRight className="size-4 text-cyan-400 shrink-0" />
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => scrollToSection('community-pages')}
                    className="w-full text-center font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl py-2.5 text-xs mt-2 cursor-pointer shadow-md"
                  >
                    পেজ শোকেস সেকশনে যান →
                  </button>
                </div>
              )}

              {currentLevel === 'social_sites' && (
                <div className="space-y-2 animate-in fade-in">
                  {socialSitesList.map((s) => (
                    <Link
                      key={s.id}
                      href="/social-sites"
                      onClick={closeMenuDrawer}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10"
                    >
                      <span className="truncate">🌐 {s.name}</span>
                      <ChevronRight className="size-4 text-cyan-400 shrink-0" />
                    </Link>
                  ))}
                  <Link
                    href="/social-sites"
                    onClick={closeMenuDrawer}
                    className="block text-center font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-2.5 text-xs mt-2 shadow-md"
                  >
                    সকল সোশ্যাল সাইটের মূল পেজে যান →
                  </Link>
                </div>
              )}

              {currentLevel === 'associations_tier' && (
                <div className="space-y-2 animate-in fade-in">
                  {associationsList.map((assoc) => (
                    <Link
                      key={assoc.id}
                      href="/associations"
                      onClick={closeMenuDrawer}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10"
                    >
                      <span className="truncate">📰 {assoc.name}</span>
                      <ChevronRight className="size-4 text-cyan-400 shrink-0" />
                    </Link>
                  ))}
                  <Link
                    href="/associations"
                    onClick={closeMenuDrawer}
                    className="block text-center font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl py-2.5 text-xs mt-2 shadow-md"
                  >
                    সকল সাংবাদিক সমিতির পেজে যান →
                  </Link>
                </div>
              )}

              {currentLevel === 'about' && (
                <div className="space-y-2 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => scrollToSection('leadership')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-cyan-300 font-bold text-xs border border-white/10 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5"><Users className="size-4 text-cyan-400" /><span>কার্যনির্বাহী পরিষদ একনজরে</span></span>
                    <ChevronRight className="size-4 text-cyan-400" />
                  </button>

                  <Link
                    href="/council"
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/10"
                  >
                    <span className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-emerald-400" /><span>ডিরেক্টর প্যানেল (মডারেটর)</span></span>
                    <ChevronRight className="size-4 text-emerald-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => scrollToSection('about')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/10 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5"><Info className="size-4 text-amber-400" /><span>রিপোর্টার্স ইউনিটি পরিচিতি</span></span>
                    <ChevronRight className="size-4 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('contact')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/10 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5"><Phone className="size-4 text-pink-400" /><span>যোগাযোগ ও অফিস</span></span>
                    <ChevronRight className="size-4 text-pink-400" />
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
