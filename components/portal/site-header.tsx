'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Bookmark,
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
  Scale,
  Search,
  Send,
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
  Vote,
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
import { DEFAULT_SITE_SETTINGS, normalizeUniversityLogoUrl } from '@/lib/site-settings'
import { BookmarksDialog } from './bookmarks-dialog'
import { TipSubmissionDialog } from './tip-submission-dialog'

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
    let univLogo = DEFAULT_SITE_SETTINGS.branding.univLogoUrl
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
        if (r.key === 'univ_logo_url' && r.value) univLogo = normalizeUniversityLogoUrl(r.value)
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
  const pathname = usePathname()
  const settings = useSiteSettings()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)

  const [clubsList, setClubsList] = useState<ClubItem[]>([])
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [facultiesList, setFacultiesList] = useState<FacultyWithDepartments[]>([])
  const [communityPagesList, setCommunityPagesList] = useState<CommunityPage[]>([])
  const [associationsList, setAssociationsList] = useState<UniversityAssociation[]>([])
  const [socialSitesList, setSocialSitesList] = useState<SocialSite[]>([])

  const { pick } = useLang()

  const [univLogo, setUnivLogo] = useState(DEFAULT_SITE_SETTINGS.branding.univLogoUrl)
  const [univLink, setUnivLink] = useState('https://mbstu.ac.bd')
  const [univText, setUnivText] = useState('')

  const [me, setMe] = useState<Profile | null>(null)

  useEffect(() => {
    let alive = true

    const applyHeaderData = (d: HeaderCachePayload) => {
      if (!alive) return
      setUnivLogo(normalizeUniversityLogoUrl(d.univLogo))
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

  const openClubWindow = useCallback((clubId: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/clubs') {
      const url = new URL(window.location.href)
      url.searchParams.set('club', clubId)
      window.history.pushState({}, '', url.toString())
      window.dispatchEvent(new CustomEvent('open-club-modal', { detail: clubId }))
      return
    }
    router.push(`/clubs?club=${encodeURIComponent(clubId)}`)
  }, [router])

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
        label: pick('বিশ্ববিদ্যালয়ের কর্মকর্তা তালিকা', 'University Personnel Directory'),
        sublabel: pick('পূর্ণাঙ্গ তালিকা দেখুন', 'View the full directory'),
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
            label: pick('এই স্তরের কর্মকর্তাবৃন্দ', 'Officers in this category'),
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
        label: pick('সামাজিক যোগাযোগমাধ্যম ও গ্রুপসমূহ', 'Social Media and Groups'),
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
        label: pick('ক্যাম্পাস ক্লাবসমূহ দেখুন', 'View Campus Clubs'),
        icon: Sparkles,
        iconClass: 'bg-orange-500 text-white',
        href: '/clubs',
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
        label: pick('কমিউনিটি পেজসমূহ দেখুন', 'View Community Pages'),
        icon: LayoutGrid,
        iconClass: 'bg-violet-600 text-white',
        href: '/community',
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
        label: pick('সাংবাদিক সমিতিসমূহ দেখুন', 'View Journalists’ Associations'),
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
              href: '/news',
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
              sublabel: pick('ক্যাম্পাসের ছবি ও ভিডিও সংরক্ষণাগার', 'Campus photo and video archive'),
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
              sublabel: pick('ঘটনাবলির ধারাবাহিক দলিল', 'A chronological campus record'),
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
              sublabel: pick('দাবি ও তথ্যের সত্যতা যাচাই', 'Verify claims and information'),
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
              sublabel: pick('ম্যাগাজিন, বুলেটিন ও সংবাদ আর্কাইভ', 'Magazines, bulletins and news archive'),
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
              href: '/reels',
            },
          ]
        : []),
      ...(isVisible('news-stories')
        ? [
            {
              id: 'news-stories',
              label: getLabel('news-stories', 'ক্যাম্পাস স্টোরিজ', 'Campus Stories'),
              sublabel: pick('সাম্প্রতিক গল্পসমূহ দেখুন', 'View recent stories'),
              icon: Sparkles,
              iconClass: 'bg-fuchsia-600 text-white',
              href: '/stories',
            },
          ]
        : []),
      ...(isVisible('news-polls')
        ? [
            {
              id: 'news-polls',
              label: getLabel('news-polls', 'ক্যাম্পাস জরিপ', 'Campus Polls'),
              sublabel: pick('জরিপে অংশ নিয়ে ফলাফল দেখুন', 'Participate in a poll and view its results'),
              icon: Vote,
              iconClass: 'bg-cyan-600 text-white',
              href: '/polls',
            },
          ]
        : []),
      {
        id: 'news-podcast',
        label: pick('পডকাস্ট ও ভিডিও সিরিজ', 'Podcast & Video Series'),
        sublabel: pick('অডিও-ভিডিও কথোপকথন ও সিরিজ', 'Audio-video interviews and series'),
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
              label: getLabel('comm-student', 'শিক্ষার্থী বিভাগ', 'Student Contributions'),
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
        label: pick('তথ্য-উপকরণ', 'Resources'),
        sublabel: pick('সাংবাদিকতার নির্দেশিকা ও তথ্য অধিকার আবেদনপত্র', 'Journalism guides and Right to Information templates'),
        icon: BookOpen,
        iconClass: 'bg-cyan-600 text-white',
        href: '/resources',
      },
      {
        id: 'res-opp',
        label: pick('কর্মশালা ও শিক্ষানবিশি', 'Workshops and Internships'),
        sublabel: pick('প্রশিক্ষণ ও কর্মজীবনের সুযোগ', 'Training and career opportunities'),
        icon: Briefcase,
        iconClass: 'bg-purple-600 text-white',
        href: '/opportunities',
      },
      {
        id: 'res-alumni',
        label: pick('অ্যালামনাই নেটওয়ার্ক', 'Alumni Network'),
        sublabel: pick('প্রাক্তন সদস্য ও মেন্টরশিপ', 'Former members and mentoring'),
        icon: Users,
        iconClass: 'bg-amber-600 text-white',
        href: '/alumni',
      },
      {
        id: 'res-events',
        label: pick('অনুষ্ঠানসূচি', 'Events Calendar'),
        sublabel: pick('কর্মশালা ও সনদ যাচাই', 'Workshops and certificate verification'),
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
              label: getLabel('about-unity', 'সংগঠন পরিচিতি', 'About the Organisation'),
              sublabel: pick('ইতিহাস, লক্ষ্য ও অর্জন', 'History, mission, and achievements'),
              icon: Info,
              iconClass: 'bg-amber-600 text-white',
              href: '/about',
            },
          ]
        : []),
      ...(isVisible('about-leadership')
        ? [
            {
              id: 'about-leadership',
              label: getLabel('about-leadership', 'কার্যনির্বাহী পরিষদ', 'Executive Council'),
              sublabel: pick('কার্যনির্বাহী পরিষদের সদস্য তালিকা', 'Executive council directory'),
              icon: Users,
              iconClass: 'bg-teal-700 text-white',
              href: '/committee',
            },
          ]
        : []),
      ...(isVisible('about-advisors')
        ? [
            {
              id: 'about-advisors',
              label: getLabel('about-advisors', 'উপদেষ্টা পরিষদ', 'Advisory Council'),
              sublabel: pick('প্রধান পৃষ্ঠপোষক ও উপদেষ্টাবৃন্দ', 'Patrons and advisors'),
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
              label: getLabel('about-members', 'সদস্য তালিকা', 'Member Directory'),
              sublabel: pick('অনুমোদিত সাংবাদিক ও সদস্যদের তালিকা', 'Approved reporters and members'),
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
              sublabel: pick('সাংগঠনিক নীতিমালা ও ধারা', 'Organization rules and articles'),
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
              sublabel: pick('পূর্ববর্তী মেয়াদের নেতৃত্ব', 'Leadership of previous terms'),
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
              label: getLabel('about-council', 'পরিচালনা পর্ষদ', 'Council'),
              sublabel: pick('মডারেশন ও প্রশাসনিক পরিষদ', 'Moderation and administration'),
              icon: ShieldCheck,
              iconClass: 'bg-emerald-600 text-white',
              href: '/council',
            },
          ]
        : []),
      ...(isVisible('about-contact')
        ? [
            {
              id: 'about-contact',
              label: getLabel('about-contact', 'যোগাযোগ ও অভিযোগ বিভাগ', 'Contact and Grievances'),
              sublabel: pick('কার্যালয়, মানচিত্র ও বার্তা', 'Office, map, and messages'),
              icon: Mail,
              iconClass: 'bg-pink-600 text-white',
              href: '/contact',
            },
          ]
        : []),
      ...(isVisible('about-policies')
        ? [
            {
              id: 'about-policies',
              label: getLabel('about-policies', 'নীতি ও স্বচ্ছতা', 'Policies & Transparency'),
              sublabel: pick('সংশোধনী, স্বীকৃতি ও নিরাপত্তা নীতি', 'Corrections, recognition and safety policies'),
              icon: ShieldCheck,
              iconClass: 'bg-emerald-600 text-white',
              href: '/policies',
            },
          ]
        : []),
      ...customByPlacement('council-about'),
    ]

    const authItems: MenuItem[] = me
      ? [
          {
            id: 'my-profile',
            label: pick('আমার প্রোফাইল ও প্রেস কার্ড', 'My Profile & Press Card'),
            sublabel: me.full_name,
            icon: User,
            iconClass: 'bg-pink-600 text-white',
            href: `/u/${me.id}`,
          },
          {
            id: 'my-dashboard',
            label: pick('ড্যাশবোর্ড', 'Dashboard'),
            sublabel: pick('পোস্ট ও সেটিংস পরিচালনা', 'Manage posts and settings'),
            icon: Settings,
            iconClass: 'bg-emerald-600 text-white',
            href: '/admin',
          },
          {
            id: 'my-logout',
            label: pick('লগআউট', 'Log Out'),
            sublabel: pick('অ্যাকাউন্ট থেকে বের হন', 'Sign out of your account'),
            icon: LogOut,
            iconClass: 'bg-rose-600/80 text-white',
            onSelect: handleLogout,
          },
        ]
      : [
          {
            id: 'login-register',
            label: pick('লগইন / নিবন্ধন', 'Log In / Register'),
            sublabel: pick('অ্যাকাউন্টে প্রবেশ করুন', 'Sign in to your account'),
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
        id: 'global-search',
        label: pick('সংবাদ অনুসন্ধান', 'Search News'),
        sublabel: pick('তারিখ, লেখক ও বিভাগ অনুযায়ী অনুসন্ধান করুন', 'Search by date, author, and category'),
        icon: Search,
        iconClass: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
        href: '/search',
      },
      {
        id: 'saved-bookmarks',
        label: pick('সংরক্ষিত সংবাদ', 'Saved Articles'),
        sublabel: pick('আপনার সংরক্ষিত সংবাদের তালিকা', 'View your saved articles'),
        icon: Bookmark,
        iconClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
        onSelect: () => setBookmarksOpen(true),
      },
      {
        id: 'submit-campus-tip',
        label: pick('সংবাদ-তথ্য পাঠান', 'Submit a News Tip'),
        sublabel: pick('গোপনীয় সংবাদ বা তথ্য পাঠান', 'Submit a confidential news tip'),
        icon: Send,
        iconClass: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white',
        onSelect: () => setTipOpen(true),
      },
      {
        id: 'membership-apply',
        label: pick('সদস্যপদের আবেদন', 'Apply for Membership'),
        sublabel: pick('অনলাইন সদস্যপদ আবেদনপত্র', 'Online membership application'),
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
        sublabel: pick('রিসোর্স, ইন্টার্নশিপ ও অ্যালামনাই', 'Resources, internships and alumni'),
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
  const categoryNavigation = useMemo(
    () => Array.from(new Set(categoriesList.filter((category) => category.trim()))),
    [categoriesList]
  )

  return (
    <>
      <header className="site-header sticky top-0 z-50 w-full border-b border-[var(--theme-card-border)] bg-[var(--theme-header-bg,var(--theme-bg-solid))] text-[var(--theme-text-title)] shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
          <div className="min-w-0 max-w-[55%] sm:max-w-none shrink">
            <Logo />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            <Link
              href="/search"
              aria-label="Search"
              title={pick('সংবাদ অনুসন্ধান করুন', 'Search News')}
              className="flex size-8.5 sm:size-9 items-center justify-center rounded-lg border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text-body)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)] cursor-pointer active:scale-95"
            >
              <Search className="size-4" />
            </Link>

            <Link
              href="/publications"
              aria-label={pick('প্রকাশনা ও ই-পেপার', 'Publications and e-paper')}
              title={pick('প্রকাশনা ও ই-পেপার', 'Publications and e-paper')}
              className="inline-flex size-8.5 sm:size-auto items-center justify-center gap-1.5 rounded-lg border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] px-2 sm:px-2.5 py-1 text-xs font-bold text-[var(--theme-text-body)] transition hover:border-[var(--theme-brand)] hover:text-[var(--theme-brand)]"
            >
              <Newspaper className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{pick('ই-পেপার', 'E-paper')}</span>
            </Link>

            <a
              href={activeUnivLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 shrink-0"
              title={activeUnivText || 'মাভাবিপ্রবি'}
            >
              {activeUnivText && (
                <span className="hidden xl:inline text-xs font-bold text-[var(--theme-text-body)] truncate max-w-[130px]">
                  {activeUnivText}
                </span>
              )}
              {activeUnivLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeUnivLogo}
                  alt="MBSTU"
                  className="size-8.5 sm:size-9 rounded-full border border-[var(--theme-card-border)] object-cover shrink-0 select-none bg-white shadow-2xs transition-transform hover:scale-105"
                />
              )}
            </a>

            <span className="h-5 w-px bg-[var(--theme-card-border)] shrink-0" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Toggle Navigation Menu"
              className="inline-flex items-center gap-1.5 h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-[var(--theme-brand)] hover:bg-[var(--theme-brand-dark)] text-[var(--theme-brand-contrast,var(--theme-bg-solid))] border border-[var(--theme-brand)] cursor-pointer shrink-0 active:scale-95 transition shadow-xs"
            >
              <Menu className="size-4 sm:size-4.5" />
              <span className="hidden sm:inline text-xs font-bold">
                {pick('মেনু', 'Menu')}
              </span>
            </button>
          </div>
        </div>

        <nav className="home-category-nav border-t border-[var(--theme-card-border)] bg-[var(--theme-card-bg)]" aria-label="সংবাদ বিভাগ">
          <div className="mx-auto flex max-w-7xl items-center gap-0 overflow-x-auto px-2 sm:px-4 scrollbar-none">
            <Link
              href="/"
              aria-label="হোম"
              aria-current={pathname === '/' ? 'page' : undefined}
              className="home-category-nav-link flex shrink-0 items-center justify-center border-r border-[var(--theme-card-border)] px-3 py-2.5 text-[var(--theme-text-body)] transition hover:bg-[var(--theme-brand-soft)] hover:text-[var(--theme-brand)]"
            >
              <Home className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/news"
              aria-current={pathname === '/news' ? 'page' : undefined}
              className="home-category-nav-link shrink-0 border-r border-[var(--theme-card-border)] px-3 py-2.5 text-xs font-bold text-[var(--theme-text-body)] transition hover:bg-[var(--theme-brand-soft)] hover:text-[var(--theme-brand)] sm:text-sm whitespace-nowrap"
            >
              {pick('সর্বশেষ', 'Latest')}
            </Link>
            {categoryNavigation.map((category) => (
              <Link
                key={category}
                href={`/category/${encodeURIComponent(category)}`}
                aria-current={pathname === `/category/${encodeURIComponent(category)}` ? 'page' : undefined}
                className="home-category-nav-link shrink-0 border-r border-[var(--theme-card-border)] px-3 py-2.5 text-xs font-bold text-[var(--theme-text-body)] transition hover:bg-[var(--theme-brand-soft)] hover:text-[var(--theme-brand)] sm:text-sm whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
            {[
              [pick('মতামত ও সম্পাদকীয়', 'Opinion & Editorial'), '/editorial'],
              [pick('ডিজিটাল নোটিশ', 'Notices'), '/notices'],
              [pick('স্টুডেন্ট কর্নার', 'Student Corner'), '/student-corner'],
              [pick('ক্লাব', 'Clubs'), '/clubs'],
              [pick('গ্যালারি', 'Gallery'), '/gallery'],
              [pick('প্রকাশনা', 'Publications'), '/publications'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className="home-category-nav-link shrink-0 border-r border-[var(--theme-card-border)] px-3 py-2.5 text-xs font-bold text-[var(--theme-text-body)] transition hover:bg-[var(--theme-brand-soft)] hover:text-[var(--theme-brand)] sm:text-sm whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <DrillDownMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
        rootTitle={pick('প্রধান মেনু', 'Main Menu')}
        userBanner={userBanner}
      />

      <BookmarksDialog open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
      <TipSubmissionDialog open={tipOpen} onClose={() => setTipOpen(false)} />
    </>
  )
}
