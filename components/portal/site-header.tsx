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
  Sparkles,
} from 'lucide-react'
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
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null)

  const [clubsList, setClubsList] = useState<ClubItem[]>([])
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [facultiesList, setFacultiesList] = useState<FacultyWithDepartments[]>([])
  const [associationsList, setAssociationsList] = useState<UniversityAssociation[]>([])
  const [socialSitesList, setSocialSitesList] = useState<SocialSite[]>([])
  const [leadersList, setLeadersList] = useState<Leader[]>([])
  const [adminOfficialsList, setAdminOfficialsList] = useState<AdministrationOfficial[]>([])
  
  const { pick } = useLang()

  // বিশ্ববিদ্যালয় লোগো ও লিঙ্ক
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

    getCampusClubs().then((res) => { if (res && res.length > 0) setClubsList(res) })
    getVisibleCategoryNames().then(setCategoriesList)
    getFacultiesWithDepartments().then(setFacultiesList)
    getUniversityAssociations().then(setAssociationsList)
    getSocialSites().then(setSocialSitesList)

    getLeaders().then((rows) => {
      if (Array.isArray(rows)) setLeadersList(rows.filter((l) => l.is_visible))
    })

    getAdministrationOfficials().then((rows) => {
      if (Array.isArray(rows)) setAdminOfficialsList(rows)
    })
  }, [])

  function openClubWindow(clubId: string) {
    setMenuOpen(false)
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

  const toggleMobileTab = (key: string) => {
    setActiveMobileTab((prev) => (prev === key ? null : key))
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 shadow-md backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
          
          {/* লোগো ও বিশ্ববিদ্যালয়ের তথ্য */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 shrink-0">
            <Logo inverted />
            <span className="h-6 w-px bg-white/20 shrink-0" aria-hidden="true" />
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
                  className="size-9 rounded-full object-cover shrink-0 select-none ring-2 ring-white/20 shadow-sm"
                />
              )}
              {univText && univText.trim() !== '' && (
                <span className="text-[11px] sm:text-xs font-bold text-white/90 group-hover:text-cyan-300 transition-colors max-w-[110px] sm:max-w-[150px] truncate leading-tight">
                  {univText}
                </span>
              )}
            </a>
          </div>

          {/* ==================== আধুনিক কমপ্যাক্ট ডেস্কটপ মেনুবার ==================== */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2 text-sm font-semibold text-white/85">
              
              {/* ১. হোম */}
              <li>
                <Link
                  href="/"
                  className="rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {pick('হোম', 'Home')}
                </Link>
              </li>

              {/* ২. বিশ্ববিদ্যালয় (University Mega Dropdown) */}
              <li className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Building2 className="size-4 text-cyan-400" />
                  <span>{pick('বিশ্ববিদ্যালয়', 'University')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>

                {/* হোভার নিরাপদ ব্রিজ ও ড্রপডাউন */}
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl max-h-[80vh] overflow-y-auto scrollbar-none space-y-2">
                    
                    {/* অনুষদ ও বিভাগসমূহ */}
                    <div className="border-b border-white/10 pb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 px-2 mb-1 flex items-center gap-1.5">
                        <GraduationCap className="size-3.5" />
                        <span>অনুষদ ও বিভাগসমূহ ({facultiesList.length})</span>
                      </p>
                      <div className="space-y-1">
                        {facultiesList.map((f) => (
                          <div key={f.id} className="rounded-xl p-1.5 hover:bg-white/10 transition-colors">
                            <p className="font-bold text-xs text-white px-1">🏛️ {f.name}</p>
                            <div className="pl-4 pt-1 space-y-0.5">
                              {f.departments.map((d) => (
                                <Link
                                  key={d.id}
                                  href={`/department/${d.id}`}
                                  className="block text-[11px] text-white/75 hover:text-cyan-300 truncate"
                                >
                                  ➔ {d.name} {d.code ? `(${d.code})` : ''}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* প্রশাসন ও কর্মকর্তা */}
                    <div className="border-b border-white/10 pb-2">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                          প্রশাসন (Administration)
                        </span>
                        <Link href="/administration" className="text-[10px] text-cyan-400 hover:underline">
                          সব দেখুন →
                        </Link>
                      </div>
                      <Link
                        href="/administration"
                        className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
                      >
                        <span>শীর্ষ প্রশাসন ও প্রশাসনিক দপ্তরসমূহ</span>
                        <ChevronRight className="size-3 text-cyan-400" />
                      </Link>
                    </div>

                    {/* সোশ্যাল সাইট ও গ্রুপ */}
                    <Link
                      href="/social-sites"
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs text-white/90 hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Globe2 className="size-3.5 text-cyan-400" />
                        <span>ক্যাম্পাস সোশ্যাল সাইট ও গ্রুপ</span>
                      </span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>

                  </div>
                </div>
              </li>

              {/* ৩. সংবাদ ও মিডিয়া (News & Media Dropdown) */}
              <li className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Newspaper className="size-4 text-cyan-400" />
                  <span>{pick('সংবাদ ও মিডিয়া', 'News & Media')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-72 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl space-y-1">
                    
                    <Link
                      href="/notices"
                      className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="size-3.5 text-cyan-400" />
                        <span>ডিজিটাল নোটিশ বোর্ড</span>
                      </span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>

                    <Link
                      href="/student-corner"
                      className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="size-3.5 text-cyan-400" />
                        <span>শিক্ষার্থীদের কর্নার (Student Corner)</span>
                      </span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>

                    <Link
                      href="/associations"
                      className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="size-3.5 text-cyan-400" />
                        <span>অন্যান্য সাংবাদিক সমিতি</span>
                      </span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>

                    <div className="border-t border-white/10 pt-2 mt-1">
                      <p className="text-[10px] font-bold text-white/60 px-3 uppercase mb-1">ক্যাটাগরি সমূহ</p>
                      <div className="grid grid-cols-2 gap-1 px-1">
                        {categoriesList.slice(0, 6).map((cat) => (
                          <Link
                            key={cat}
                            href={`/category/${encodeURIComponent(cat)}`}
                            className="block px-2 py-1 text-[11px] rounded-lg text-white/80 hover:bg-white/10 hover:text-cyan-300 truncate"
                          >
                            • {cat}
                          </Link>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </li>

              {/* ৪. ক্লাব ও পরিষদ (Community & Clubs Dropdown) */}
              <li className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Star className="size-4 text-cyan-400" />
                  <span>{pick('ক্লাব ও পরিষদ', 'Clubs & Council')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl space-y-2">
                    
                    {/* কার্যনির্বাহী পরিষদ */}
                    <div className="border-b border-white/10 pb-2">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <span className="text-[11px] font-bold text-cyan-300 uppercase">কার্যনির্বাহী পরিষদ</span>
                        <Link href="/#leadership" className="text-[10px] text-cyan-400 hover:underline">
                          বিস্তারিত →
                        </Link>
                      </div>
                      <div className="space-y-1">
                        {leadersList.slice(0, 4).map((l) => (
                          <div key={l.id} className="flex items-center gap-2 px-2 py-1 text-xs">
                            <span className="size-2 rounded-full bg-cyan-400 shrink-0" />
                            <span className="font-bold text-white truncate">{l.display_name}</span>
                            <span className="text-[10px] text-cyan-200/70 truncate ml-auto">
                              {POSITIONS.find((p) => p.key === l.position)?.bn || l.position}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ডিরেক্টর প্যানেল */}
                    <Link
                      href="/council"
                      className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="size-3.5 text-cyan-400" />
                        <span>ডিরেক্টর প্যানেল (Director Panel)</span>
                      </span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>

                    {/* ক্যাম্পাস ক্লাবসমূহ */}
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <span className="text-[11px] font-bold text-cyan-300 uppercase">ক্যাম্পাস ক্লাবসমূহ ({clubsList.length})</span>
                        <Link href="/#club-news" className="text-[10px] text-cyan-400 hover:underline">
                          সবগুলো →
                        </Link>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-none">
                        {clubsList.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => openClubWindow(c.id)}
                            className="flex w-full items-center gap-2 px-2 py-1 rounded-lg text-left text-xs text-white/80 hover:bg-white/10 hover:text-cyan-300 truncate cursor-pointer"
                          >
                            <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                            <span className="truncate">{c.nameBn || c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </li>

              {/* ৫. পরিচিতি */}
              <li>
                <Link
                  href="/#about"
                  className="rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {pick('পরিচিতি', 'About')}
                </Link>
              </li>

            </ul>
          </nav>

          {/* লগইন বাটন ও মোবাইল মেনু টগল বাটন */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2 shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="size-3.5" />
              <span>{pick('লগইন', 'Login')}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex size-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 lg:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

        </div>

        {/* ==================== মোবাইল ড্রয়ার (Mobile App-style Drawer) ==================== */}
        {menuOpen && (
          <nav className="border-t border-white/10 bg-slate-950/95 lg:hidden max-h-[82vh] overflow-y-auto px-4 py-4 space-y-3 backdrop-blur-2xl animate-in slide-in-from-top-2">
            
            {/* কুইক হোম লিংক */}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/10 text-white text-xs font-bold border border-white/15"
            >
              <span className="flex items-center gap-2">
                <Home className="size-4 text-cyan-400" />
                <span>হোমপেজ (Home)</span>
              </span>
              <ChevronRight className="size-4 text-white/50" />
            </Link>

            {/* ১. বিশ্ববিদ্যালয় গ্রুপ */}
            <div className="rounded-2xl border border-white/15 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileTab('univ')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="size-4 text-cyan-400" />
                  <span>বিশ্ববিদ্যালয় ও প্রশাসন</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${activeMobileTab === 'univ' ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
              </button>

              {activeMobileTab === 'univ' && (
                <div className="p-3 border-t border-white/10 bg-black/30 space-y-2 text-xs">
                  <Link
                    href="/administration"
                    onClick={() => setMenuOpen(false)}
                    className="block font-bold text-cyan-300 py-1"
                  >
                    🏛️ শীর্ষ প্রশাসন ও দপ্তরসমূহ →
                  </Link>
                  <Link
                    href="/social-sites"
                    onClick={() => setMenuOpen(false)}
                    className="block font-bold text-cyan-300 py-1"
                  >
                    🌐 সোশ্যাল সাইট ও গ্রুপসমূহ →
                  </Link>
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <p className="font-bold text-white/60 text-[11px] uppercase">অনুষদসমূহ:</p>
                    {facultiesList.map((f) => (
                      <div key={f.id} className="pl-2">
                        <p className="font-semibold text-white/90">🏛️ {f.name}</p>
                        {f.departments.map((d) => (
                          <Link
                            key={d.id}
                            href={`/department/${d.id}`}
                            onClick={() => setMenuOpen(false)}
                            className="block pl-3 text-white/70 py-0.5 hover:text-cyan-300"
                          >
                            ➔ {d.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ২. সংবাদ ও মিডিয়া গ্রুপ */}
            <div className="rounded-2xl border border-white/15 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileTab('news')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Newspaper className="size-4 text-cyan-400" />
                  <span>সংবাদ, নোটিশ ও স্টুডেন্ট কর্নার</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${activeMobileTab === 'news' ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
              </button>

              {activeMobileTab === 'news' && (
                <div className="p-3 border-t border-white/10 bg-black/30 space-y-2 text-xs">
                  <Link href="/notices" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-1 text-white">
                    <span>📢 ডিজিটাল নোটিশ বোর্ড</span>
                    <ChevronRight className="size-3 text-cyan-400" />
                  </Link>
                  <Link href="/student-corner" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-1 text-white">
                    <span>✍️ শিক্ষার্থীদের লেখা ও কর্নার</span>
                    <ChevronRight className="size-3 text-cyan-400" />
                  </Link>
                  <Link href="/associations" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-1 text-white">
                    <span>📰 অন্যান্য সাংবাদিক সমিতি</span>
                    <ChevronRight className="size-3 text-cyan-400" />
                  </Link>
                  <div className="pt-2 border-t border-white/10">
                    <p className="font-bold text-white/60 text-[11px] mb-1">ক্যাটাগরি সমূহ:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {categoriesList.map((c) => (
                        <Link
                          key={c}
                          href={`/category/${encodeURIComponent(c)}`}
                          onClick={() => setMenuOpen(false)}
                          className="px-2 py-1 rounded bg-white/5 text-[11px] text-white/80 truncate"
                        >
                          • {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ৩. ক্লাব ও পরিষদ গ্রুপ */}
            <div className="rounded-2xl border border-white/15 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileTab('clubs')}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Star className="size-4 text-cyan-400" />
                  <span>ক্লাব ও কার্যনির্বাহী পরিষদ</span>
                </span>
                <ChevronDown className={`size-4 transition-transform ${activeMobileTab === 'clubs' ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
              </button>

              {activeMobileTab === 'clubs' && (
                <div className="p-3 border-t border-white/10 bg-black/30 space-y-2 text-xs">
                  <Link href="/#leadership" onClick={() => setMenuOpen(false)} className="block font-bold text-cyan-300 py-1">
                    👥 কার্যনির্বাহী পরিষদ একনজরে দেখুন →
                  </Link>
                  <Link href="/council" onClick={() => setMenuOpen(false)} className="block font-bold text-cyan-300 py-1">
                    🛡️ ডিরেক্টর প্যানেল →
                  </Link>
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <p className="font-bold text-white/60 text-[11px]">ক্যাম্পাস ক্লাবসমূহ:</p>
                    {clubsList.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => openClubWindow(c.id)}
                        className="w-full text-left py-1 text-white/80 hover:text-cyan-300 truncate"
                      >
                        ➔ {c.nameBn || c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* পরিচিতি */}
            <Link
              href="/#about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 text-white text-xs font-bold border border-white/10"
            >
              <span className="flex items-center gap-2">
                <Info className="size-4 text-cyan-400" />
                <span>রিপোর্টার্স ইউনিটি পরিচিতি (About)</span>
              </span>
              <ChevronRight className="size-4 text-white/50" />
            </Link>

          </nav>
        )}
      </header>
    </>
  )
}
