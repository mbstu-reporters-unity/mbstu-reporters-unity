'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Feather,
  FileText,
  Film,
  Globe,
  Globe2,
  GraduationCap,
  Hash,
  Home,
  Info,
  Landmark,
  LayoutGrid,
  Lock,
  LogOut,
  Menu,
  Newspaper,
  Phone,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  UserCheck,
  Users,
} from 'lucide-react'
import { getCampusClubs, type ClubItem } from '@/lib/clubs'
import { getVisibleCategoryNames } from '@/lib/categories'
import { getFacultiesWithDepartments, type FacultyWithDepartments } from '@/lib/faculties'
import { getCommunityPages, type CommunityPage } from '@/lib/pages'
import { getUniversityAssociations, type UniversityAssociation } from '@/lib/associations'
import { getSocialSites, type SocialSite } from '@/lib/social-sites'
import { ADMIN_CATEGORIES, DEFAULT_OFFICES } from '@/lib/administration'
import {
  SB_URL,
  SB_KEY,
  getMe,
  isTokenExpired,
  refreshSession,
  type Profile,
} from '@/lib/sb'
import { Logo } from './logo'
import { useLang } from '@/lib/i18n'
import { DrillDownMenu, type MenuItem } from './drill-down-menu'

const HEADER_CACHE_KEY = 'mbstu_header_cache_v2'
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

    const [cfgRows, clubs, categories, faculties, pages, associations, socialSites] =
      await Promise.all([
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
      clubsList: (clubs || []).filter((c) => c.is_active !== false),
      categoriesList: categories || [],
      facultiesList: faculties || [],
      communityPagesList: (pages || []).filter((p) => p.is_active !== false),
      associationsList: (associations || []).filter((a) => a.is_active !== false),
      socialSitesList: (socialSites || []).filter((s) => s.is_active !== false),
    }

    memHeaderCache = payload
    try {
      localStorage.setItem(HEADER_CACHE_KEY, JSON.stringify(payload))
    } catch {}
    return payload
  })().finally(() => {
    memHeaderPromise = null
  })

  return memHeaderPromise
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

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

    let isFreshCache = false
    if (memHeaderCache) {
      applyHeaderData(memHeaderCache)
      if (Date.now() - memHeaderCache.ts < HEADER_CACHE_TTL) {
        isFreshCache = true
      }
    } else {
      try {
        const raw = localStorage.getItem(HEADER_CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as HeaderCachePayload
          if (parsed?.ts) {
            memHeaderCache = parsed
            applyHeaderData(parsed)
            if (Date.now() - parsed.ts < HEADER_CACHE_TTL) {
              isFreshCache = true
            }
          }
        }
      } catch {}
    }

    if (!isFreshCache && (typeof navigator === 'undefined' || navigator.onLine)) {
      fetchHeaderData().then(applyHeaderData).catch(() => {})
    }

    ;(async () => {
      try {
        let t = localStorage.getItem('mbstu_admin_token') || ''
        if (!t) return
        if (isTokenExpired(t)) {
          const fresh = await refreshSession()
          if (!fresh) return
          t = fresh
        }
        if (memMeCache && memMeCache.token === t && Date.now() - memMeCache.ts < ME_CACHE_TTL) {
          if (alive && memMeCache.profile) setMe(memMeCache.profile)
          return
        }
        const profile = await getMe(t).catch(() => null)
        memMeCache = { token: t, ts: Date.now(), profile }
        if (alive && profile) setMe(profile)
      } catch {}
    })()

    return () => {
      alive = false
    }
  }, [])

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('mbstu_admin_token')
      localStorage.removeItem('mbstu_admin_refresh_token')
    } catch {}
    memMeCache = null
    setMe(null)
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    if (typeof window === 'undefined') return
    const isHome = window.location.pathname === '/' || window.location.pathname === ''
    if (isHome) {
      const el = document.getElementById(sectionId)
      if (el) {
        const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - 70
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        return
      }
    }
    window.location.href = `/#${sectionId}`
  }, [])

  const openClubWindow = useCallback((clubId: string) => {
    if (typeof window === 'undefined') return
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
  }, [])

  const menuItems = useMemo<MenuItem[]>(() => {
    const adminChildren: MenuItem[] = [
      {
        id: 'admin-all',
        label: 'সকল প্রশাসনিক কর্মকর্তা',
        sublabel: 'সম্পূর্ণ তালিকা দেখুন',
        icon: UserCheck,
        iconClass: 'bg-cyan-600/80 text-white',
        href: '/administration',
      },
      ...ADMIN_CATEGORIES.map((cat, idx) => ({
        id: `admin-cat-${idx}`,
        label: cat,
        icon: Landmark,
        iconClass: 'bg-blue-600/80 text-white',
        children: [
          {
            id: `admin-cat-view-${idx}`,
            label: 'এই স্তরের কর্মকর্তাবৃন্দ',
            icon: Users,
            iconClass: 'bg-cyan-600/70 text-white',
            href: '/administration',
          },
          ...(DEFAULT_OFFICES[cat] || []).map((office, oIdx) => ({
            id: `admin-office-${idx}-${oIdx}`,
            label: office,
            icon: Briefcase,
            iconClass: 'bg-white/10 text-cyan-300',
            href: '/administration',
          })),
        ],
      })),
    ]

    const facultyChildren: MenuItem[] = facultiesList.map((fac) => ({
      id: `fac-${fac.id}`,
      label: fac.name,
      sublabel: fac.name_en || undefined,
      badge: fac.departments.length ? `${fac.departments.length}` : undefined,
      icon: Landmark,
      iconClass: 'bg-teal-600/80 text-white',
      children: fac.departments.map((dept) => ({
        id: `dept-${dept.id}`,
        label: dept.name,
        sublabel: dept.name_en || undefined,
        badge: dept.code || undefined,
        icon: BookOpen,
        iconClass: 'bg-white/10 text-cyan-300',
        href: `/department/${dept.id}`,
      })),
    }))

    const socialSiteChildren: MenuItem[] = [
      {
        id: 'social-all',
        label: 'সকল সোশ্যাল সাইট ও গ্রুপ',
        icon: Globe,
        iconClass: 'bg-emerald-600/80 text-white',
        href: '/social-sites',
      },
      ...socialSitesList.map((site) => {
        const extLink = site.fb_url || site.website_url || site.yt_url || null
        return {
          id: `social-${site.id}`,
          label: site.name,
          sublabel: site.category || site.name_en || undefined,
          icon: Globe2,
          iconClass: 'bg-white/10 text-emerald-300',
          href: extLink || `/social-sites#site-${site.id}`,
          external: Boolean(extLink && /^https?:\/\//i.test(extLink)),
        }
      }),
    ]

    const categoryChildren: MenuItem[] = categoriesList.map((cat) => ({
      id: `news-cat-${cat}`,
      label: cat,
      icon: Hash,
      iconClass: 'bg-white/10 text-cyan-300',
      href: `/category/${encodeURIComponent(cat)}`,
    }))

    const clubChildren: MenuItem[] = [
      {
        id: 'clubs-section',
        label: 'ক্লাব সেকশনে যান',
        icon: Sparkles,
        iconClass: 'bg-orange-500 text-white',
        onSelect: () => scrollToSection('club-news'),
      },
      ...clubsList.map((club) => ({
        id: `club-${club.id}`,
        label: club.name_bn || club.name,
        sublabel: club.tag || undefined,
        icon: Star,
        iconClass: 'bg-white/10 text-amber-300',
        onSelect: () => openClubWindow(club.id),
      })),
    ]

    const pageChildren: MenuItem[] = [
      {
        id: 'pages-section',
        label: 'সকল পেজ শোকেস দেখুন',
        icon: LayoutGrid,
        iconClass: 'bg-violet-600 text-white',
        onSelect: () => scrollToSection('community-pages'),
      },
      ...communityPagesList.map((cp) => ({
        id: `page-${cp.id}`,
        label: cp.name,
        sublabel: cp.category || `/p/${cp.slug}`,
        verified: Boolean(cp.is_verified),
        icon: FileText,
        iconClass: 'bg-white/10 text-violet-300',
        href: `/p/${cp.slug}`,
      })),
    ]

    const associationChildren: MenuItem[] = [
      {
        id: 'assoc-all',
        label: 'সকল সাংবাদিক সমিতি দেখুন',
        icon: Newspaper,
        iconClass: 'bg-indigo-600 text-white',
        href: '/associations',
      },
      ...associationsList.map((assoc) => {
        const extLink = assoc.website_url || assoc.fb_url || assoc.yt_url || null
        return {
          id: `assoc-${assoc.id}`,
          label: assoc.name,
          sublabel: assoc.university_name || undefined,
          icon: Building2,
          iconClass: 'bg-white/10 text-indigo-300',
          href: extLink || '/associations',
          external: Boolean(extLink && /^https?:\/\//i.test(extLink)),
        }
      }),
    ]

    const authItems: MenuItem[] = me
      ? [
          {
            id: 'my-profile',
            label: 'আমার প্রোফাইল',
            sublabel: me.full_name,
            icon: User,
            iconClass: 'bg-pink-600 text-white',
            href: `/u/${me.id}`,
          },
          {
            id: 'my-dashboard',
            label: 'ড্যাশবোর্ড',
            sublabel: 'পোস্ট ও সেটিংস পরিচালনা',
            icon: Settings,
            iconClass: 'bg-emerald-600 text-white',
            href: '/admin',
          },
          {
            id: 'my-logout',
            label: 'লগআউট',
            sublabel: 'অ্যাকাউন্ট থেকে বের হন',
            icon: LogOut,
            iconClass: 'bg-rose-600/80 text-white',
            onSelect: handleLogout,
          },
        ]
      : [
          {
            id: 'login-register',
            label: 'লগইন / নিবন্ধন',
            sublabel: 'অ্যাকাউন্টে প্রবেশ করুন',
            icon: Lock,
            iconClass: 'bg-blue-600 text-white',
            href: '/admin',
          },
        ]

    return [
      {
        id: 'home',
        label: pick('হোম', 'Home'),
        icon: Home,
        iconClass: 'bg-blue-600 text-white',
        href: '/',
      },
      {
        id: 'editorial',
        label: pick('সম্পাদকীয় ও মতামত', 'Editorial & Opinion'),
        icon: Feather,
        iconClass: 'bg-indigo-600 text-white',
        href: '/editorial',
      },
      {
        id: 'university',
        label: pick('বিশ্ববিদ্যালয়', 'University'),
        icon: Building2,
        iconClass: 'bg-cyan-600 text-white',
        children: [
          {
            id: 'univ-admin',
            label: 'প্রশাসন ও দপ্তর',
            icon: Landmark,
            iconClass: 'bg-cyan-600/80 text-white',
            children: adminChildren,
          },
          {
            id: 'univ-faculties',
            label: 'অনুষদ ও বিভাগ',
            badge: facultiesList.length ? `${facultiesList.length}` : undefined,
            icon: GraduationCap,
            iconClass: 'bg-teal-600 text-white',
            children: facultyChildren,
          },
          {
            id: 'univ-social',
            label: 'সোশ্যাল সাইট',
            badge: socialSitesList.length ? `${socialSitesList.length}` : undefined,
            icon: Globe2,
            iconClass: 'bg-emerald-600 text-white',
            children: socialSiteChildren,
          },
        ],
      },
      {
        id: 'news-media',
        label: pick('সংবাদ ও মিডিয়া', 'News & Media'),
        icon: Newspaper,
        iconClass: 'bg-amber-500 text-white',
        children: [
          {
            id: 'news-campus',
            label: 'ক্যাম্পাস সংবাদ',
            icon: Newspaper,
            iconClass: 'bg-amber-500/80 text-white',
            onSelect: () => scrollToSection('general-news'),
          },
          {
            id: 'news-notices',
            label: 'ডিজিটাল নোটিশ',
            icon: Bell,
            iconClass: 'bg-emerald-600 text-white',
            href: '/notices',
          },
          {
            id: 'news-reels',
            label: 'রিলস ও ভিডিও হাব',
            badge: 'LIVE',
            icon: Film,
            iconClass: 'bg-rose-600 text-white',
            onSelect: () => scrollToSection('reels-hub'),
          },
          {
            id: 'news-categories',
            label: 'সংবাদের ক্যাটাগরি',
            badge: categoriesList.length ? `${categoriesList.length}` : undefined,
            icon: Tag,
            iconClass: 'bg-blue-600 text-white',
            children: categoryChildren,
          },
        ],
      },
      {
        id: 'community-clubs',
        label: pick('কমিউনিটি ও ক্লাব', 'Community & Clubs'),
        icon: Star,
        iconClass: 'bg-orange-500 text-white',
        children: [
          {
            id: 'comm-clubs',
            label: 'ক্যাম্পাস ক্লাবসমূহ',
            badge: clubsList.length ? `${clubsList.length}` : undefined,
            icon: Star,
            iconClass: 'bg-orange-500 text-white',
            children: clubChildren,
          },
          {
            id: 'comm-pages',
            label: 'ক্যাম্পাস পেজসমূহ',
            badge: communityPagesList.length ? `${communityPagesList.length}` : undefined,
            icon: FileText,
            iconClass: 'bg-violet-600 text-white',
            children: pageChildren,
          },
          {
            id: 'comm-student',
            label: 'স্টুডেন্ট কর্নার',
            icon: BookOpen,
            iconClass: 'bg-sky-500 text-white',
            href: '/student-corner',
          },
          {
            id: 'comm-associations',
            label: 'অন্যান্য সাংবাদিক সমিতি',
            badge: associationsList.length ? `${associationsList.length}` : undefined,
            icon: ShieldCheck,
            iconClass: 'bg-indigo-600 text-white',
            children: associationChildren,
          },
        ],
      },
      {
        id: 'council-about',
        label: pick('পরিষদ ও পরিচিতি', 'Council & About'),
        icon: Users,
        iconClass: 'bg-teal-600 text-white',
        children: [
          {
            id: 'about-leadership',
            label: 'কার্যনির্বাহী পরিষদ',
            icon: Users,
            iconClass: 'bg-teal-600 text-white',
            onSelect: () => scrollToSection('leadership'),
          },
          {
            id: 'about-council',
            label: 'ডিরেক্টর প্যানেল',
            icon: ShieldCheck,
            iconClass: 'bg-emerald-600 text-white',
            href: '/council',
          },
          {
            id: 'about-unity',
            label: 'ইউনিটি পরিচিতি',
            icon: Info,
            iconClass: 'bg-amber-600 text-white',
            onSelect: () => scrollToSection('about'),
          },
          {
            id: 'about-contact',
            label: 'যোগাযোগ',
            icon: Phone,
            iconClass: 'bg-pink-600 text-white',
            onSelect: () => scrollToSection('contact'),
          },
        ],
      },
      ...authItems,
    ]
  }, [
    me,
    pick,
    facultiesList,
    socialSitesList,
    categoriesList,
    clubsList,
    communityPagesList,
    associationsList,
    scrollToSection,
    openClubWindow,
    handleLogout,
  ])

  const userBanner = me
    ? {
        name: me.full_name,
        subtitle: me.role === 'admin' ? 'প্রধান অ্যাডমিন' : 'আমার ড্যাশবোর্ড ও প্রোফাইল',
        avatarUrl: me.avatar_url || null,
        href: `/u/${me.id}`,
      }
    : null

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071030]/95 shadow-lg backdrop-blur-2xl w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 gap-2">
          {/* বামে: সংগঠনের লোগো ও বড় নাম */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <Logo inverted />
          </div>

          {/* ডানে: বিশ্ববিদ্যালয়ের লোগো (রিপোর্টার্স ইউনিটির সমান size-9 sm:size-11) + মেনু বাটন */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={univLink || 'https://mbstu.ac.bd'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 shrink-0"
              title="মাভাবিপ্রবি"
            >
              {univText && (
                <span className="hidden md:inline text-xs font-bold text-white/90 truncate max-w-[140px]">
                  {univText}
                </span>
              )}
              {univLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={univLogo}
                  alt="MBSTU"
                  className="size-9 sm:size-11 rounded-full object-cover shrink-0 select-none bg-white/95 shadow-xs transition-transform hover:scale-105"
                />
              )}
            </a>

            <span className="h-6 w-px bg-white/15 shrink-0" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Toggle Navigation Menu"
              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 cursor-pointer shrink-0 active:scale-95 transition"
            >
              <Menu className="size-4.5 sm:size-5" />
              <span className="hidden sm:inline text-xs font-bold">
                {pick('মেনু', 'Menu')}
              </span>
            </button>
          </div>
        </div>
      </header>

      <DrillDownMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
        rootTitle={pick('প্রধান মেনু', 'Main Menu')}
        userBanner={userBanner}
      />
    </>
  )
}
