'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Clock,
  Feather,
  FileText,
  Film,
  Globe,
  Globe2,
  GraduationCap,
  Hash,
  Headphones,
  History,
  Home,
  Info,
  Landmark,
  LayoutGrid,
  Link2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Phone,
  Scale,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  UserCheck,
  UserPlus,
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
import { useSiteSettings } from './site-settings-context'

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
  const settings = useSiteSettings()
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
    const ctrlMap = new Map(settings.menu.items.map((c) => [c.id, c]))
    const isVisible = (id: string) => ctrlMap.get(id)?.visible !== false
    const getLabel = (id: string, fallbackBn: string, fallbackEn: string) => {
      const found = ctrlMap.get(id)
      if (!found) return pick(fallbackBn, fallbackEn)
      return pick(found.labelBn || fallbackBn, found.labelEn || fallbackEn)
    }

    const customByPlacement = (
      placement: 'root' | 'university' | 'news-media' | 'community-clubs' | 'council-about'
    ): MenuItem[] =>
      settings.menu.customLinks
        .filter((cl) => cl.visible && cl.placement === placement && (cl.labelBn.trim() || cl.labelEn.trim()) && cl.href.trim())
        .map((cl) => ({
          id: cl.id,
          label: pick(cl.labelBn || cl.labelEn, cl.labelEn || cl.labelBn),
          icon: Link2,
          iconClass: 'bg-cyan-600/80 text-white',
          href: cl.href.trim(),
          external: cl.external || /^https?:\/\//i.test(cl.href.trim()),
        }))

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

    const univChildren: MenuItem[] = [
      ...(isVisible('univ-admin')
        ? [
            {
              id: 'univ-admin',
              label: getLabel('univ-admin', 'প্রশাসন ও দপ্তর', 'Administration'),
              icon: Landmark,
              iconClass: 'bg-cyan-600/80 text-white',
              children: adminChildren,
            },
          ]
        : []),
      ...(isVisible('univ-faculties')
        ? [
            {
              id: 'univ-faculties',
              label: getLabel('univ-faculties', 'অনুষদ ও বিভাগ', 'Faculties & Depts'),
              badge: facultiesList.length ? `${facultiesList.length}` : undefined,
              icon: GraduationCap,
              iconClass: 'bg-teal-600 text-white',
              children: facultyChildren,
            },
          ]
        : []),
      ...(isVisible('univ-social')
        ? [
            {
              id: 'univ-social',
              label: getLabel('univ-social', 'সোশ্যাল সাইট', 'Social Sites'),
              badge: socialSitesList.length ? `${socialSitesList.length}` : undefined,
              icon: Globe2,
              iconClass: 'bg-emerald-600 text-white',
              children: socialSiteChildren,
            },
          ]
        : []),
      ...customByPlacement('university'),
    ]

    const newsChildren: MenuItem[] = [
      ...(isVisible('news-campus')
        ? [
            {
              id: 'news-campus',
              label: getLabel('news-campus', 'ক্যাম্পাস সংবাদ', 'Campus News'),
              icon: Newspaper,
              iconClass: 'bg-amber-500/80 text-white',
              onSelect: () => scrollToSection('general-news'),
            },
          ]
        : []),
      ...(isVisible('news-notices')
        ? [
            {
              id: 'news-notices',
              label: getLabel('news-notices', 'ডিজিটাল নোটিশ', 'Digital Notices'),
              icon: Bell,
              iconClass: 'bg-emerald-600 text-white',
              href: '/notices',
            },
          ]
        : []),
      ...(isVisible('news-gallery')
        ? [
            {
              id: 'news-gallery',
              label: getLabel('news-gallery', 'ফটো ও ভিডিও গ্যালারি', 'Photo & Video Gallery'),
              sublabel: 'ক্যাম্পাসের সকল ছবি ও ভিডিও',
              icon: Camera,
              iconClass: 'bg-cyan-600 text-white',
              href: '/gallery',
            },
          ]
        : []),
      ...(isVisible('news-timeline')
        ? [
            {
              id: 'news-timeline',
              label: getLabel('news-timeline', 'ক্যাম্পাস টাইমলাইন', 'Campus Timeline'),
              sublabel: 'ঘটনাবলির ধারাবাহিক দলিল',
              icon: Clock,
              iconClass: 'bg-purple-600 text-white',
              href: '/timeline',
            },
          ]
        : []),
      ...(isVisible('news-factcheck')
        ? [
            {
              id: 'news-factcheck',
              label: getLabel('news-factcheck', 'ফ্যাক্ট-চেক ডেস্ক', 'Fact-Check Desk'),
              sublabel: 'গুজব ও তথ্যের সত্যতা যাচাই',
              icon: ShieldAlert,
              iconClass: 'bg-rose-600 text-white',
              href: '/fact-check',
            },
          ]
        : []),
      ...(isVisible('news-publications')
        ? [
            {
              id: 'news-publications',
              label: getLabel('news-publications', 'প্রকাশনা ও আর্কাইভ', 'Publications & Archive'),
              sublabel: 'ম্যাগাজিন, বুলেটিন ও সংবাদ আর্কাইভ',
              icon: BookOpen,
              iconClass: 'bg-indigo-600 text-white',
              href: '/publications',
            },
          ]
        : []),
      ...(isVisible('news-reels')
        ? [
            {
              id: 'news-reels',
              label: getLabel('news-reels', 'রিলস ও ভিডিও হাব', 'Reels & Video Hub'),
              badge: 'LIVE',
              icon: Film,
              iconClass: 'bg-rose-600 text-white',
              onSelect: () => scrollToSection('reels-hub'),
            },
          ]
        : []),
      {
        id: 'news-podcast',
        label: pick('পডকাস্ট ও ভিডিও সিরিজ', 'Podcast & Video Series'),
        sublabel: 'অডিও-ভিডিও কথোপকথন ও সিরিজ',
        icon: Headphones,
        iconClass: 'bg-purple-600 text-white',
        href: '/podcast',
      },
      {
        id: 'news-categories',
        label: pick('সংবাদের ক্যাটাগরি', 'News Categories'),
        badge: categoriesList.length ? `${categoriesList.length}` : undefined,
        icon: Tag,
        iconClass: 'bg-blue-600 text-white',
        children: categoryChildren,
      },
      ...customByPlacement('news-media'),
    ]

    const commChildren: MenuItem[] = [
      ...(isVisible('comm-clubs')
        ? [
            {
              id: 'comm-clubs',
              label: getLabel('comm-clubs', 'ক্যাম্পাস ক্লাবসমূহ', 'Campus Clubs'),
              badge: clubsList.length ? `${clubsList.length}` : undefined,
              icon: Star,
              iconClass: 'bg-orange-500 text-white',
              children: clubChildren,
            },
          ]
        : []),
      ...(isVisible('comm-pages')
        ? [
            {
              id: 'comm-pages',
              label: getLabel('comm-pages', 'ক্যাম্পাস পেজসমূহ', 'Campus Pages'),
              badge: communityPagesList.length ? `${communityPagesList.length}` : undefined,
              icon: FileText,
              iconClass: 'bg-violet-600 text-white',
              children: pageChildren,
            },
          ]
        : []),
      ...(isVisible('comm-student')
        ? [
            {
              id: 'comm-student',
              label: getLabel('comm-student', 'স্টুডেন্ট কর্নার', 'Student Corner'),
              icon: BookOpen,
              iconClass: 'bg-sky-500 text-white',
              href: '/student-corner',
            },
          ]
        : []),
      ...(isVisible('comm-associations')
        ? [
            {
              id: 'comm-associations',
              label: getLabel('comm-associations', 'অন্যান্য সাংবাদিক সমিতি', 'Associations'),
              badge: associationsList.length ? `${associationsList.length}` : undefined,
              icon: ShieldCheck,
              iconClass: 'bg-indigo-600 text-white',
              children: associationChildren,
            },
          ]
        : []),
      ...customByPlacement('community-clubs'),
    ]

    const educationChildren: MenuItem[] = [
      {
        id: 'res-center',
        label: 'রিসোর্স সেন্টার',
        sublabel: 'সাংবাদিকতা গাইড ও RTI ফরম্যাট',
        icon: BookOpen,
        iconClass: 'bg-cyan-600 text-white',
        href: '/resources',
      },
      {
        id: 'res-opp',
        label: 'ওয়ার্কশপ ও ইন্টার্নশিপ',
        sublabel: 'প্রশিক্ষণ ও চাকরির সুযোগ',
        icon: Briefcase,
        iconClass: 'bg-purple-600 text-white',
        href: '/opportunities',
      },
      {
        id: 'res-alumni',
        label: 'অ্যালামনাই নেটওয়ার্ক',
        sublabel: 'প্রাক্তন সদস্য ও মেন্টরশিপ',
        icon: Users,
        iconClass: 'bg-amber-600 text-white',
        href: '/alumni',
      },
      {
        id: 'res-events',
        label: 'ইভেন্ট ও ক্যালেন্ডার',
        sublabel: 'কর্মশালা ও সার্টিফিকেট ভেরিফিকেশন',
        icon: CalendarDays,
        iconClass: 'bg-rose-600 text-white',
        href: '/events',
      },
    ]

    const aboutChildren: MenuItem[] = [
      ...(isVisible('about-unity')
        ? [
            {
              id: 'about-unity',
              label: getLabel('about-unity', 'আমাদের সম্পর্কে', 'About Us'),
              sublabel: 'ইতিহাস, ভিশন ও অর্জন',
              icon: Info,
              iconClass: 'bg-amber-600 text-white',
              href: '/about',
            },
          ]
        : []),
      ...(isVisible('about-committee')
        ? [
            {
              id: 'about-committee',
              label: getLabel('about-committee', 'বর্তমান কমিটি', 'Executive Committee'),
              sublabel: 'কার্যনির্বাহী পরিষদের কর্মকর্তা',
              icon: Award,
              iconClass: 'bg-teal-600 text-white',
              href: '/committee',
            },
          ]
        : []),
      ...(isVisible('about-advisors')
        ? [
            {
              id: 'about-advisors',
              label: getLabel('about-advisors', 'উপদেষ্টা পরিষদ', 'Advisory Council'),
              sublabel: 'প্রধান পৃষ্ঠপোষক ও উপদেষ্টাবৃন্দ',
              icon: ShieldCheck,
              iconClass: 'bg-purple-600 text-white',
              href: '/advisors',
            },
          ]
        : []),
      ...(isVisible('about-members')
        ? [
            {
              id: 'about-members',
              label: getLabel('about-members', 'সদস্য ডিরেক্টরি', 'Member Directory'),
              sublabel: 'অনুমোদিত সাংবাদিক ও সদস্যবৃন্দ',
              icon: UserCheck,
              iconClass: 'bg-cyan-600 text-white',
              href: '/members',
            },
          ]
        : []),
      ...(isVisible('about-constitution')
        ? [
            {
              id: 'about-constitution',
              label: getLabel('about-constitution', 'গঠনতন্ত্র ও আচরণবিধি', 'Constitution & Ethics'),
              sublabel: 'সাংগঠনিক নীতিমালা ও ধারা',
              icon: Scale,
              iconClass: 'bg-blue-600 text-white',
              href: '/constitution',
            },
          ]
        : []),
      ...(isVisible('about-archive')
        ? [
            {
              id: 'about-archive',
              label: getLabel('about-archive', 'প্রাক্তন কমিটি আর্কাইভ', 'Past Committee Archive'),
              sublabel: 'পূর্ববর্তী মেয়াদের নেতৃত্ব',
              icon: History,
              iconClass: 'bg-rose-600 text-white',
              href: '/committee/archive',
            },
          ]
        : []),
      ...(isVisible('about-council')
        ? [
            {
              id: 'about-council',
              label: getLabel('about-council', 'ডিরেক্টর প্যানেল', 'Director Panel'),
              sublabel: 'মডারেশন ও অ্যাডমিন কাউন্সিল',
              icon: ShieldCheck,
              iconClass: 'bg-emerald-600 text-white',
              href: '/council',
            },
          ]
        : []),
      ...(isVisible('about-leadership')
        ? [
            {
              id: 'about-leadership',
              label: getLabel('about-leadership', 'কার্যনির্বাহী বাণী', 'Executive Messages'),
              sublabel: 'হোমপেজে নেতৃত্বের বার্তা',
              icon: Users,
              iconClass: 'bg-teal-700 text-white',
              onSelect: () => scrollToSection('leadership'),
            },
          ]
        : []),
      ...(isVisible('about-contact')
        ? [
            {
              id: 'about-contact',
              label: getLabel('about-contact', 'যোগাযোগ', 'Contact'),
              sublabel: 'অফিস ও যোগাযোগ ডেস্ক',
              icon: Phone,
              iconClass: 'bg-pink-600 text-white',
              onSelect: () => scrollToSection('contact'),
            },
          ]
        : []),
      {
        id: 'about-contact-desk',
        label: pick('যোগাযোগ, ম্যাপ ও অভিযোগ ডেস্ক', 'Contact, Map & Feedback'),
        sublabel: 'বার্তা, ম্যাপ, অভিযোগ ও সংশোধন',
        icon: Mail,
        iconClass: 'bg-cyan-600 text-white',
        href: '/contact',
      },
      ...customByPlacement('council-about'),
    ]

    const authItems: MenuItem[] = me
      ? [
          {
            id: 'my-profile',
            label: 'আমার প্রোফাইল ও প্রেস কার্ড',
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
      ...(isVisible('home')
        ? [
            {
              id: 'home',
              label: getLabel('home', 'হোম', 'Home'),
              icon: Home,
              iconClass: 'bg-blue-600 text-white',
              href: '/',
            },
          ]
        : []),
      {
        id: 'membership-apply',
        label: pick('সদস্যপদ আবেদন', 'Join as Member'),
        sublabel: 'অনলাইন রিক্রুটমেন্ট ফর্ম',
        icon: UserPlus,
        iconClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
        href: '/apply',
      },
      ...(isVisible('editorial')
        ? [
            {
              id: 'editorial',
              label: getLabel('editorial', 'সম্পাদকীয় ও মতামত', 'Editorial & Opinion'),
              icon: Feather,
              iconClass: 'bg-indigo-600 text-white',
              href: '/editorial',
            },
          ]
        : []),
      ...(isVisible('university') && univChildren.length > 0
        ? [
            {
              id: 'university',
              label: getLabel('university', 'বিশ্ববিদ্যালয়', 'University'),
              icon: Building2,
              iconClass: 'bg-cyan-600 text-white',
              children: univChildren,
            },
          ]
        : []),
      ...(isVisible('news-media') && newsChildren.length > 0
        ? [
            {
              id: 'news-media',
              label: getLabel('news-media', 'সংবাদ ও মিডিয়া', 'News & Media'),
              icon: Newspaper,
              iconClass: 'bg-amber-500 text-white',
              children: newsChildren,
            },
          ]
        : []),
      {
        id: 'menu-education',
        label: pick('শিক্ষা ও রিসোর্স', 'Education & Resources'),
        sublabel: 'রিসোর্স, ইন্টার্নশিপ ও অ্যালামনাই',
        icon: BookOpen,
        iconClass: 'bg-emerald-600 text-white',
        children: educationChildren,
      },
      ...(isVisible('community-clubs') && commChildren.length > 0
        ? [
            {
              id: 'community-clubs',
              label: getLabel('community-clubs', 'কমিউনিটি ও ক্লাব', 'Community & Clubs'),
              icon: Star,
              iconClass: 'bg-orange-500 text-white',
              children: commChildren,
            },
          ]
        : []),
      ...(isVisible('council-about') && aboutChildren.length > 0
        ? [
            {
              id: 'council-about',
              label: getLabel('council-about', 'পরিষদ ও পরিচিতি', 'Council & About'),
              icon: Users,
              iconClass: 'bg-teal-600 text-white',
              children: aboutChildren,
            },
          ]
        : []),
      ...customByPlacement('root'),
      ...authItems,
    ]
  }, [
    settings.menu,
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

  const activeUnivLogo = settings.branding.univLogoUrl || univLogo
  const activeUnivLink = settings.branding.univLinkUrl || univLink || 'https://mbstu.ac.bd'
  const activeUnivText = settings.branding.univText !== undefined ? settings.branding.univText : univText

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071030]/95 shadow-lg backdrop-blur-2xl w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <Logo inverted />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={activeUnivLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 shrink-0"
              title="মাভাবিপ্রবি"
            >
              {activeUnivText && (
                <span className="hidden md:inline text-xs font-bold text-white/90 truncate max-w-[140px]">
                  {activeUnivText}
                </span>
              )}
              {activeUnivLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeUnivLogo}
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
