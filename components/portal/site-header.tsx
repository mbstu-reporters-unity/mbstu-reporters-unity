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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071030]/90 shadow-lg backdrop-blur-2xl w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5">
          
          {/* বামপাশ: লোগো ও ভার্সিটি লিঙ্ক (মোবাইলে চওড়া সীমাবদ্ধ করা হয়েছে) */}
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
              {/* মোবাইলে অপ্রয়োজনীয় বড় টেক্সট লুকিয়ে শুধুমাত্র লোগো রাখা হয়েছে */}
              <span className="hidden md:inline text-[11px] font-bold text-white/90 truncate max-w-[120px]">
                {univText || "MBSTU"}
              </span>
            </a>
          </div>

          {/* ==================== ডেস্কটপ মেনুবার (বৃহৎ স্ক্রিনের জন্য) ==================== */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2 text-sm font-semibold text-white/85">
              <li>
                <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                  {pick('হোম', 'Home')}
                </Link>
              </li>

              {/* বিশ্ববিদ্যালয় */}
              <li className="relative group">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Building2 className="size-4 text-cyan-400" />
                  <span>{pick('বিশ্ববিদ্যালয়', 'University')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl max-h-[80vh] overflow-y-auto scrollbar-none space-y-2">
                    <div className="border-b border-white/10 pb-2">
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
                    <Link href="/administration" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors">
                      <span>শীর্ষ প্রশাসন ও কর্মকর্তা</span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                    <Link href="/social-sites" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors">
                      <span>ক্যাম্পাস সোশ্যাল সাইট ও গ্রুপ</span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                  </div>
                </div>
              </li>

              {/* সংবাদ ও মিডিয়া */}
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
                    <Link href="/student-corner" className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                      <span className="flex items-center gap-2"><BookOpen className="size-3.5 text-cyan-400" /><span>স্টুডেন্ট কর্নার</span></span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>
                    <Link href="/associations" className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-white/90 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                      <span className="flex items-center gap-2"><Users className="size-3.5 text-cyan-400" /><span>অন্যান্য সাংবাদিক সমিতি</span></span>
                      <ChevronRight className="size-3 opacity-50" />
                    </Link>
                  </div>
                </div>
              </li>

              {/* ক্লাব ও পরিষদ */}
              <li className="relative group">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Star className="size-4 text-cyan-400" />
                  <span>{pick('ক্লাব ও পরিষদ', 'Clubs & Council')}</span>
                  <ChevronDown className="size-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-3xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl space-y-2">
                    <Link href="/#leadership" className="block text-xs font-bold text-cyan-300 p-2 hover:bg-white/10 rounded-xl">
                      👥 কার্যনির্বাহী পরিষদ একনজরে →
                    </Link>
                    <Link href="/council" className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors">
                      <span>ডিরেক্টর প্যানেল</span>
                      <ChevronRight className="size-3 text-cyan-400" />
                    </Link>
                    <Link href="/#club-news" className="block text-xs font-bold text-cyan-300 p-2 hover:bg-white/10 rounded-xl">
                      ⭐ ক্যাম্পাস ক্লাবসমূহ ({clubsList.length}) →
                    </Link>
                  </div>
                </div>
              </li>

              <li>
                <Link href="/#about" className="rounded-full px-3 py-1.5 hover:bg-white/15 hover:text-cyan-300 transition-colors">
                  {pick('পরিচিতি', 'About')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* ডানপাশ: লগইন ও ৩-দাগের মোবাইল মেনু বাটন (কখনোই স্ক্রিনের বাইরে যাবে না) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-md border border-white/20 transition active:scale-95 shrink-0"
            >
              <Lock className="size-3 sm:size-3.5" />
              <span>{pick('লগইন', 'Login')}</span>
            </Link>

            {/* ৩-দাগের মোবাইল মেনু বাটন (১০০% দৃশ্যমান) */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 lg:hidden cursor-pointer shrink-0 active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="size-4 sm:size-5" /> : <Menu className="size-4 sm:size-5" />}
            </button>
          </div>

        </div>

        {/* মোবাইল ড্রয়ার মেনু */}
        {menuOpen && (
          <nav className="border-t border-white/10 bg-slate-950/95 lg:hidden max-h-[80vh] overflow-y-auto px-4 py-3 space-y-2.5 backdrop-blur-2xl animate-in slide-in-from-top-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15"
            >
              <span className="flex items-center gap-2"><Home className="size-4 text-cyan-400" /><span>হোমপেজ (Home)</span></span>
              <ChevronRight className="size-4 text-white/50" />
            </Link>

            {/* বিশ্ববিদ্যালয় */}
            <div className="rounded-xl border border-white/15 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileTab('univ')}
                className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white hover:bg-white/10"
              >
                <span className="flex items-center gap-2"><Building2 className="size-4 text-cyan-400" /><span>বিশ্ববিদ্যালয় ও প্রশাসন</span></span>
                <ChevronDown className={`size-4 transition-transform ${activeMobileTab === 'univ' ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
              </button>
              {activeMobileTab === 'univ' && (
                <div className="p-2.5 border-t border-white/10 bg-black/30 space-y-1.5 text-xs">
                  <Link href="/administration" onClick={() => setMenuOpen(false)} className="block font-semibold text-cyan-300 py-1">🏛️ শীর্ষ প্রশাসন ও দপ্তরসমূহ →</Link>
                  <Link href="/social-sites" onClick={() => setMenuOpen(false)} className="block font-semibold text-cyan-300 py-1">🌐 সোশ্যাল সাইট ও গ্রুপসমূহ →</Link>
                </div>
              )}
            </div>

            {/* সংবাদ ও নোটিশ */}
            <div className="rounded-xl border border-white/15 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileTab('news')}
                className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white hover:bg-white/10"
              >
                <span className="flex items-center gap-2"><Newspaper className="size-4 text-cyan-400" /><span>সংবাদ, নোটিশ ও স্টুডেন্ট কর্নার</span></span>
                <ChevronDown className={`size-4 transition-transform ${activeMobileTab === 'news' ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
              </button>
              {activeMobileTab === 'news' && (
                <div className="p-2.5 border-t border-white/10 bg-black/30 space-y-1.5 text-xs">
                  <Link href="/notices" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-1 text-white"><span>📢 ডিজিটাল নোটিশ বোর্ড</span><ChevronRight className="size-3 text-cyan-400" /></Link>
                  <Link href="/student-corner" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-1 text-white"><span>✍️ স্টুডেন্ট কর্নার</span><ChevronRight className="size-3 text-cyan-400" /></Link>
                  <Link href="/associations" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-1 text-white"><span>📰 অন্যান্য সাংবাদিক সমিতি</span><ChevronRight className="size-3 text-cyan-400" /></Link>
                </div>
              )}
            </div>

            {/* ক্লাব ও পরিষদ */}
            <div className="rounded-xl border border-white/15 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileTab('clubs')}
                className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white hover:bg-white/10"
              >
                <span className="flex items-center gap-2"><Star className="size-4 text-cyan-400" /><span>ক্লাব ও কার্যনির্বাহী পরিষদ</span></span>
                <ChevronDown className={`size-4 transition-transform ${activeMobileTab === 'clubs' ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
              </button>
              {activeMobileTab === 'clubs' && (
                <div className="p-2.5 border-t border-white/10 bg-black/30 space-y-1.5 text-xs">
                  <Link href="/#leadership" onClick={() => setMenuOpen(false)} className="block font-semibold text-cyan-300 py-1">👥 কার্যনির্বাহী পরিষদ →</Link>
                  <Link href="/council" onClick={() => setMenuOpen(false)} className="block font-semibold text-cyan-300 py-1">🛡️ ডিরেক্টর প্যানেল →</Link>
                  <Link href="/#club-news" onClick={() => setMenuOpen(false)} className="block font-semibold text-cyan-300 py-1">⭐ ক্যাম্পাস ক্লাবসমূহ ({clubsList.length}) →</Link>
                </div>
              )}
            </div>

            <Link
              href="/#about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-white text-xs font-bold border border-white/10"
            >
              <span className="flex items-center gap-2"><Info className="size-4 text-cyan-400" /><span>পরিচিতি (About)</span></span>
              <ChevronRight className="size-4 text-white/50" />
            </Link>
          </nav>
        )}
      </header>
    </>
  )
}
