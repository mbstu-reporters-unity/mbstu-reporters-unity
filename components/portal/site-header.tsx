'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  Lock,
  Menu,
  Newspaper,
  Star,
  Users,
  X,
  FileText,
  Globe2,
  ShieldCheck,
  Tag,
  Landmark,
  MessageSquare,
  User,
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
import { CallModal, type CallType, type CallState } from './call-modal'
import { supabase } from '@/lib/chat'
import { ringtone } from '@/lib/webrtc'

export function SiteHeader() {
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

  // ব্যবহারকারীর লগইন ও প্রোফাইল স্টেট
  const [me, setMe] = useState<Profile | null>(null)
  const [token, setToken] = useState('')

  // গ্লোবাল ইনকামিং কল স্টেট (পুরো ওয়েবসাইটের যেকোনো পেজে রিং বাজার জন্য)
  const [callState, setCallState] = useState<CallState>('idle')
  const [callType, setCallType] = useState<CallType>('audio')
  const [incomingCaller, setIncomingCaller] = useState<Profile | null>(null)
  const [activeCallConvId, setActiveCallConvId] = useState<string | null>(null)

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

    getCampusClubs().then((res) => { if (res && res.length > 0) setClubsList(res) })
    getVisibleCategoryNames().then(setCategoriesList)
    getFacultiesWithDepartments().then(setFacultiesList)
    getCommunityPages().then((res) => {
      if (res && res.length > 0) setCommunityPagesList(res.filter((p) => p.is_active !== false))
    })
    getUniversityAssociations().then(setAssociationsList)
    getSocialSites().then(setSocialSitesList)

    // লগইন থাকলে প্রোফাইল ও গ্লোবাল কলিং লিসেনার সক্রিয় করা
    const t = localStorage.getItem('mbstu_admin_token') || ''
    if (t) {
      setToken(t)
      getMe(t).then((profile) => {
        if (profile) {
          setMe(profile)

          // অপর প্রান্ত থেকে কল আসলে যেকোনো পেজেই রিংটোন বেজে উঠবে
          const channel = supabase.channel(`user_calls_${profile.id}`)
          channel
            .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
              setIncomingCaller(payload.caller)
              setCallType(payload.callType)
              setActiveCallConvId(payload.conversationId)
              setCallState('incoming')
              ringtone.start()
            })
            .subscribe()

          return () => {
            supabase.removeChannel(channel)
          }
        }
      })
    }
  }, [])

  const openMenuDrawer = () => {
    setNavStack(['root'])
    setMenuOpen(true)
  }

  const closeMenuDrawer = () => {
    setNavStack(['root'])
    setMenuOpen(false)
  }

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
        const el = document.getElementById(`club-${clubId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = `/?club=${clubId}#club-${clubId}`
      }
    }
  }

  const currentLevel = navStack[navStack.length - 1]

  const getBreadcrumbInfo = () => {
    switch (currentLevel) {
      case 'univ': return { parent: 'মূল মেনু', current: 'বিশ্ববিদ্যালয় ও প্রশাসন' }
      case 'admin_tier': return { parent: 'বিশ্ববিদ্যালয়', current: 'প্রশাসন ও দপ্তরসমূহ' }
      case 'faculties_dept': return { parent: 'বিশ্ববিদ্যালয়', current: 'অনুষদ ও বিভাগসমূহ' }
      case 'social_sites': return { parent: 'বিশ্ববিদ্যালয়', current: 'সোশ্যাল সাইট ও গ্রুপ' }
      case 'news': return { parent: 'মূল মেনু', current: 'সংবাদ, রিলস ও নোটিশ' }
      case 'associations_tier': return { parent: 'সংবাদ ও মিডিয়া', current: 'সাংবাদিক সমিতিসমূহ' }
      case 'community': return { parent: 'মূল মেনু', current: 'ক্যাম্পাস ক্লাব ও পেজ' }
      case 'clubs_tier': return { parent: 'কমিউনিটি', current: 'ক্যাম্পাস ক্লাবসমূহ' }
      case 'pages_tier': return { parent: 'কমিউনিটি', current: 'ক্যাম্পাস পেজসমূহ' }
      case 'about': return { parent: 'মূল মেনু', current: 'পরিষদ ও পরিচিতি' }
      default: return { parent: '', current: 'মূল মেনু' }
    }
  }

  const breadcrumb = getBreadcrumbInfo()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071030]/90 shadow-lg backdrop-blur-2xl w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5">
          
          {/* লোগো ও বিশ্ববিদ্যালয়ের তথ্য */}
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

          {/* ডেস্কটপ মেনুবার */}
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

          {/* ডানপাশ: M-RU টেক্সট বাটন, লগইন/প্রোফাইল বাটন ও মোবাইল মেনু টগল */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* ✅ ১. নতুন M-RU টেক্সট (মেসেঞ্জার) বাটন */}
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-300 border border-cyan-400/40 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition active:scale-95 shadow-sm"
              title="M-RU টেক্সট (মেসেঞ্জার)"
            >
              <MessageSquare className="size-3.5 sm:size-4" />
              <span className="hidden xs:inline">টেক্সট</span>
            </Link>

            {/* ২. লগইন বা প্রোফাইল লিংক */}
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

        {/* ==================== মোবাইল ড্রিল-ডাউন মেনু ==================== */}
        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#071030]/98 lg:hidden max-h-[84vh] overflow-y-auto px-3.5 py-3 space-y-3 backdrop-blur-2xl animate-in slide-in-from-top-2 select-none scrollbar-none">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-white/15 gap-2">
              {navStack.length > 1 ? (
                <button
                  type="button"
                  onClick={goStepBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs active:scale-95 transition shadow cursor-pointer shrink-0"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>এক ধাপ পেছনে</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Menu className="size-3.5" />
                  <span>ক্যাম্পাস মেনু</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 rounded-full truncate">
                {breadcrumb.parent && (
                  <span className="text-white/60 font-normal truncate max-w-[85px]">{breadcrumb.parent} ›</span>
                )}
                <span className="truncate max-w-[130px]">{breadcrumb.current}</span>
              </div>
            </div>

            {/* লেভেল ০: মূল মেনু তালিকা */}
            {currentLevel === 'root' && (
              <div className="space-y-2 animate-in fade-in">
                {/* সরাসরি মেসেঞ্জার লিংক */}
                <Link
                  href="/messages"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between p-3 rounded-2xl bg-cyan-600/25 hover:bg-cyan-600/35 text-cyan-200 text-xs font-bold border border-cyan-400/40 active:scale-98 transition shadow-xs"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className="size-4 text-cyan-400" />
                    <span>M-RU টেক্সট (মেসেঞ্জার)</span>
                  </span>
                  <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">চ্যাট</span>
                </Link>

                <Link
                  href="/"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 active:scale-98 transition"
                >
                  <span className="flex items-center gap-2.5"><Home className="size-4 text-cyan-400" /><span>হোমপেজ (Home)</span></span>
                  <ChevronRight className="size-4 text-white/40" />
                </Link>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('univ', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 active:scale-98 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Building2 className="size-4 text-cyan-400" /><span>বিশ্ববিদ্যালয় ও প্রশাসন</span></span>
                  <ChevronRight className="size-4 text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('news', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 active:scale-98 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Newspaper className="size-4 text-rose-400" /><span>সংবাদ, রিলস ও নোটিশ</span></span>
                  <ChevronRight className="size-4 text-rose-400" />
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('community', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 active:scale-98 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Star className="size-4 text-amber-400" /><span>ক্যাম্পাস ক্লাব ও পেজসমূহ</span></span>
                  <ChevronRight className="size-4 text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('about', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 active:scale-98 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Users className="size-4 text-emerald-400" /><span>কার্যনির্বাহী পরিষদ ও পরিচিতি</span></span>
                  <ChevronRight className="size-4 text-emerald-400" />
                </button>

                {me && (
                  <Link
                    href={`/u/${me.id}`}
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 active:scale-98 transition mt-2"
                  >
                    <span className="flex items-center gap-2.5"><User className="size-4 text-cyan-300" /><span>আমার পাবলিক প্রোফাইল</span></span>
                    <ChevronRight className="size-4 text-white/40" />
                  </Link>
                )}
              </div>
            )}

            {/* লেভেল ১: বিশ্ববিদ্যালয় ও প্রশাসন */}
            {currentLevel === 'univ' && (
              <div className="space-y-2 animate-in fade-in">
                <button
                  type="button"
                  onClick={(e) => goToNextLevel('admin_tier', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-200 text-xs font-bold border border-cyan-800/40 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Landmark className="size-4 text-cyan-400" /><span>শীর্ষ প্রশাসন ও দপ্তরসমূহ</span></span>
                  <ChevronRight className="size-4 text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('faculties_dept', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><GraduationCap className="size-4 text-amber-400" /><span>অনুষদ ও বিভাগসমূহ ({facultiesList.length})</span></span>
                  <ChevronRight className="size-4 text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('social_sites', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Globe2 className="size-4 text-blue-400" /><span>সোশ্যাল সাইট ও গ্রুপসমূহ</span></span>
                  <ChevronRight className="size-4 text-blue-400" />
                </button>
              </div>
            )}

            {/* লেভেল ২: শীর্ষ প্রশাসন */}
            {currentLevel === 'admin_tier' && (
              <div className="space-y-1.5 animate-in fade-in max-h-64 overflow-y-auto scrollbar-none">
                {ADMIN_CATEGORIES.map((cat, idx) => (
                  <Link
                    key={idx}
                    href="/administration"
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10"
                  >
                    <span>🏛️ {cat}</span>
                    <ChevronRight className="size-3.5 text-cyan-400" />
                  </Link>
                ))}
                <Link
                  href="/administration"
                  onClick={closeMenuDrawer}
                  className="block text-center font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded-xl py-2 text-xs mt-2"
                >
                  🔗 সকল কর্মকর্তার পূর্ণাঙ্গ তালিকা পেজে যান →
                </Link>
              </div>
            )}

            {/* লেভেল ২: অনুষদ ও বিভাগসমূহ */}
            {currentLevel === 'faculties_dept' && (
              <div className="space-y-2 animate-in fade-in max-h-72 overflow-y-auto scrollbar-none">
                {facultiesList.map((f) => (
                  <div key={f.id} className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1">
                    <p className="font-bold text-cyan-300 text-xs truncate">🏛️ {f.name}</p>
                    <div className="pl-3 space-y-1 border-l-2 border-cyan-400/50 mt-1">
                      {f.departments.map((d) => (
                        <Link
                          key={d.id}
                          href={`/department/${d.id}`}
                          onClick={closeMenuDrawer}
                          className="flex items-center justify-between text-[11px] text-white/80 hover:text-cyan-200 py-0.5"
                        >
                          <span className="truncate">➔ {d.name} {d.code ? `(${d.code})` : ''}</span>
                          <ChevronRight className="size-3 text-cyan-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* লেভেল ২: সোশ্যাল সাইট ও গ্রুপসমূহ */}
            {currentLevel === 'social_sites' && (
              <div className="space-y-1.5 animate-in fade-in max-h-64 overflow-y-auto scrollbar-none">
                {socialSitesList.map((s) => (
                  <Link
                    key={s.id}
                    href="/social-sites"
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10"
                  >
                    <span className="truncate">🌐 {s.name}</span>
                    <ChevronRight className="size-3.5 text-cyan-400" />
                  </Link>
                ))}
                <Link
                  href="/social-sites"
                  onClick={closeMenuDrawer}
                  className="block text-center font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded-xl py-2 text-xs mt-2"
                >
                  🔗 সকল সোশ্যাল সাইটের মূল পেজে যান →
                </Link>
              </div>
            )}

            {/* লেভেল ১: সংবাদ ও মিডিয়া */}
            {currentLevel === 'news' && (
              <div className="space-y-2 animate-in fade-in">
                <Link
                  href="/notices"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15"
                >
                  <span className="flex items-center gap-2.5"><Bell className="size-4 text-cyan-400" /><span>ডিজিটাল নোটিশ বোর্ড</span></span>
                  <ChevronRight className="size-4 text-cyan-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => scrollToSection('home')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Film className="size-4 text-rose-400" /><span>ক্যাম্পাস রিলস ও ভিডিও হাব</span></span>
                  <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">LIVE</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('associations_tier', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Users className="size-4 text-cyan-400" /><span>অন্যান্য সাংবাদিক সমিতি</span></span>
                  <ChevronRight className="size-4 text-cyan-400" />
                </button>

                {categoriesList.length > 0 && (
                  <div className="border-t border-white/15 pt-2.5 p-1 space-y-1.5">
                    <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <Tag className="size-3.5" />
                      <span>সংবাদের ক্যাটাগরিসমূহ:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {categoriesList.map((cat) => (
                        <Link
                          key={cat}
                          href={`/category/${encodeURIComponent(cat)}`}
                          onClick={closeMenuDrawer}
                          className="bg-white/10 hover:bg-white/20 text-cyan-200 border border-white/15 px-3 py-1 rounded-lg text-xs font-semibold"
                        >
                          #{cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* লেভেল ২: সাংবাদিক সমিতি */}
            {currentLevel === 'associations_tier' && (
              <div className="space-y-1.5 animate-in fade-in max-h-64 overflow-y-auto scrollbar-none">
                {associationsList.map((assoc) => (
                  <Link
                    key={assoc.id}
                    href="/associations"
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10"
                  >
                    <span className="truncate">📰 {assoc.name}</span>
                    <ChevronRight className="size-3.5 text-cyan-400" />
                  </Link>
                ))}
                <Link
                  href="/associations"
                  onClick={closeMenuDrawer}
                  className="block text-center font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded-xl py-2 text-xs mt-2"
                >
                  🔗 সকল সাংবাদিক সমিতির পেজে যান →
                </Link>
              </div>
            )}

            {/* লেভেল ১: ক্যাম্পাস কমিউনিটি */}
            {currentLevel === 'community' && (
              <div className="space-y-2 animate-in fade-in">
                <button
                  type="button"
                  onClick={(e) => goToNextLevel('clubs_tier', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><Star className="size-4 text-amber-400" /><span>ক্যাম্পাস ক্লাবসমূহ ({clubsList.length})</span></span>
                  <ChevronRight className="size-4 text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={(e) => goToNextLevel('pages_tier', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5"><FileText className="size-4 text-emerald-400" /><span>ক্যাম্পাস পেজ ও সোসাইটি</span></span>
                  <ChevronRight className="size-4 text-emerald-400" />
                </button>

                <Link
                  href="/student-corner"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15"
                >
                  <span className="flex items-center gap-2.5"><BookOpen className="size-4 text-cyan-400" /><span>স্টুডেন্ট কর্নার</span></span>
                  <ChevronRight className="size-4 text-cyan-400" />
                </Link>
              </div>
            )}

            {/* লেভেল ২: ১০টি ক্লাবের তালিকা */}
            {currentLevel === 'clubs_tier' && (
              <div className="space-y-1.5 animate-in fade-in max-h-72 overflow-y-auto scrollbar-none">
                {clubsList.map((club) => (
                  <button
                    key={club.id}
                    type="button"
                    onClick={() => openClubWindow(club.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white text-left cursor-pointer border border-white/10"
                  >
                    <span className="truncate">⭐ {club.name_bn || club.name}</span>
                    <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">পপআপ খুলুন</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => scrollToSection('club-news')}
                  className="w-full text-center font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded-xl py-2 text-xs mt-2 cursor-pointer"
                >
                  🔗 ক্লাব ফিড সেকশনে যান →
                </button>
              </div>
            )}

            {/* লেভেল ২: ক্যাম্পাস পেজ তালিকা */}
            {currentLevel === 'pages_tier' && (
              <div className="space-y-1.5 animate-in fade-in max-h-64 overflow-y-auto scrollbar-none">
                {communityPagesList.map((cp) => (
                  <Link
                    key={cp.id}
                    href={`/p/${cp.slug}`}
                    onClick={closeMenuDrawer}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10"
                  >
                    <span className="truncate">📄 {cp.name}</span>
                    <ChevronRight className="size-3.5 text-cyan-400" />
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => scrollToSection('community-pages')}
                  className="w-full text-center font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded-xl py-2 text-xs mt-2 cursor-pointer"
                >
                  🔗 পেজ শোকেস সেকশনে যান →
                </button>
              </div>
            )}

            {/* লেভেল ১: পরিষদ ও পরিচিতি */}
            {currentLevel === 'about' && (
              <div className="space-y-2 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => scrollToSection('leadership')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-white/15 text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Users className="size-4 text-cyan-400" /><span>কার্যনির্বাহী পরিষদ একনজরে</span></span>
                  <ChevronRight className="size-4 text-cyan-400" />
                </button>

                <Link
                  href="/council"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/15"
                >
                  <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-400" /><span>ডিরেক্টর প্যানেল (মডারেটর)</span></span>
                  <ChevronRight className="size-4 text-emerald-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/15 text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Info className="size-4 text-amber-400" /><span>রিপোর্টার্স ইউনিটি পরিচিতি</span></span>
                  <ChevronRight className="size-4 text-amber-400" />
                </button>
              </div>
            )}

          </nav>
        )}
      </header>

      {/* ✅ গ্লোবাল কলিং মডাল (ইউজার ওয়েবসাইটের যেকোনো পেজে থাকা অবস্থাতেই ইনকামিং কল রিসিভ করতে পারবেন) */}
      {me && (
        <CallModal
          currentUser={me}
          targetUser={null}
          conversationId={activeCallConvId}
          callType={callType}
          callState={callState}
          incomingCaller={incomingCaller}
          onClose={() => {
            setCallState('idle')
            setIncomingCaller(null)
          }}
          onAcceptIncoming={() => {
            setCallState('connected')
          }}
        />
      )}
    </>
  )
}
