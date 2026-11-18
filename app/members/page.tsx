'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  GraduationCap,
  Newspaper,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { SB_URL, SB_KEY } from '@/lib/sb'

interface PublicMember {
  id: string
  full_name: string
  department: string | null
  batch: string | null
  newspaper_name: string | null
  avatar_url: string | null
  role: string
  user_type: string
  designation?: string | null
  created_at: string
}

const FALLBACK_MEMBERS: PublicMember[] = [
  {
    id: 'demo-1',
    full_name: 'মো. তানভীর আহমেদ',
    department: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
    batch: '১৮তম ব্যাচ',
    newspaper_name: 'দৈনিক প্রথম আলো',
    avatar_url: null,
    role: 'moderator',
    user_type: 'reporter',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    full_name: 'সাদিয়া ইসলাম',
    department: 'ফার্মেসি বিভাগ',
    batch: '১৯তম ব্যাচ',
    newspaper_name: 'দৈনিক যুগান্তর',
    avatar_url: null,
    role: 'user',
    user_type: 'reporter',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    full_name: 'ড. মো. রেজাউল করিম',
    department: 'টেক্সটাইল ইঞ্জিনিয়ারিং বিভাগ',
    batch: null,
    newspaper_name: null,
    avatar_url: null,
    role: 'user',
    user_type: 'teacher',
    designation: 'অধ্যাপক ও কলামিস্ট',
    created_at: new Date().toISOString(),
  },
]

type FilterRole = 'all' | 'reporter' | 'moderator' | 'teacher'

export default function MembersDirectoryPage() {
  const [members, setMembers] = useState<PublicMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterRole>('all')

  async function loadApprovedMembers() {
    setLoading(true)
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/profiles?select=id,full_name,department,batch,newspaper_name,avatar_url,role,user_type,designation,created_at&approved=eq.true&order=created_at.asc`,
        {
          headers: {
            apikey: SB_KEY,
            Authorization: `Bearer ${SB_KEY}`,
          },
          cache: 'no-store',
        }
      )
      if (res.ok) {
        const rows: PublicMember[] = await res.json()
        if (Array.isArray(rows) && rows.length > 0) {
          setMembers(rows)
        } else {
          setMembers(FALLBACK_MEMBERS)
        }
      } else {
        setMembers(FALLBACK_MEMBERS)
      }
    } catch {
      setMembers(FALLBACK_MEMBERS)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadApprovedMembers()
  }, [])

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      // ফিল্টার ক্যাটাগরি যাচাই
      if (activeFilter === 'reporter' && m.user_type !== 'reporter' && !m.newspaper_name) return false
      if (activeFilter === 'moderator' && m.role !== 'admin' && m.role !== 'moderator') return false
      if (activeFilter === 'teacher' && m.user_type !== 'teacher') return false

      if (!q) return true

      return [m.full_name, m.department, m.batch, m.newspaper_name, m.designation]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q))
    })
  }, [members, activeFilter, search])

  const counts = useMemo(() => {
    return {
      all: members.length,
      reporter: members.filter((m) => m.user_type === 'reporter' || Boolean(m.newspaper_name)).length,
      moderator: members.filter((m) => m.role === 'admin' || m.role === 'moderator').length,
      teacher: members.filter((m) => m.user_type === 'teacher').length,
    }
  }, [members])

  const resolveBadge = (m: PublicMember) => {
    if (m.role === 'admin') return { label: 'প্রধান অ্যাডমিন', cls: 'bg-purple-500/20 text-purple-300 border-purple-400/40' }
    if (m.role === 'moderator') return { label: 'মডারেটর', cls: 'bg-blue-500/20 text-blue-300 border-blue-400/40' }
    if (m.user_type === 'teacher') return { label: 'শিক্ষক কলামিস্ট', cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40' }
    if (m.user_type === 'reporter' || m.newspaper_name) return { label: 'ক্যাম্পাস প্রতিনিধি', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' }
    return { label: 'সদস্য', cls: 'bg-white/10 text-slate-300 border-white/20' }
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-8">

          {/* ব্রেডক্রাম্ব নেভিগেশন */}
          <BackNavigation
            items={[
              { label: 'আমাদের সম্পর্কে', href: '/about' },
              { label: 'সদস্য ডিরেক্টরি' },
            ]}
          />

          {/* ১. হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <Users className="size-3.5" />
              <span>সাংবাদিক ও সদস্য ডিরেক্টরি • Member Directory</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">
              সদস্য ডিরেক্টরি
            </h1>

            <p className="text-cyan-200 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি
            </p>

            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-1">
              সংগঠনের সকল অনুমোদিত ক্যাম্পাস সাংবাদিক, মডারেটর পরিষদ এবং শিক্ষক কলামিস্টদের অফিশিয়াল পরিচিতি তালিকা।
            </p>
          </div>

          {/* ২. সার্চ ও ফিল্টার বার */}
          <section className="glass-card p-4 sm:p-6 space-y-4 text-white">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* সার্চ ইনপুট */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <input
                  type="text"
                  placeholder="নাম, বিভাগ, সেশন বা পত্রিকার নাম লিখে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 backdrop-blur transition"
                />
              </div>

              {/* রিফ্রেশ বাটন */}
              <button
                type="button"
                onClick={loadApprovedMembers}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold transition shrink-0 cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            {/* ফিল্টার বাটনসমূহ */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {[
                { key: 'all' as FilterRole, label: 'সকল সদস্য', count: counts.all, icon: Users },
                { key: 'reporter' as FilterRole, label: 'ক্যাম্পাস প্রতিনিধি', count: counts.reporter, icon: Newspaper },
                { key: 'moderator' as FilterRole, label: 'পরিচালনা পর্ষদ', count: counts.moderator, icon: ShieldCheck },
                { key: 'teacher' as FilterRole, label: 'শিক্ষক কলামিস্ট', count: counts.teacher, icon: GraduationCap },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeFilter === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFilter(tab.key)}
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow-md font-bold scale-[1.02]'
                        : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-75">({tab.count})</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ৩. সদস্যদের কার্ড গ্রিড */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1 text-white">
              <h2 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2">
                <UserCheck className="size-5 text-cyan-400" />
                <span>অনুমোদিত সদস্য তালিকা ({filteredMembers.length} জন)</span>
              </h2>
            </div>

            {loading ? (
              <div className="glass-card p-12 text-center text-slate-300 text-sm">
                সদস্য তালিকা লোড হচ্ছে...
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMembers.map((m) => {
                  const badge = resolveBadge(m)
                  return (
                    <article
                      key={m.id}
                      className="glass-card p-5 flex flex-col justify-between text-white space-y-4 hover:border-cyan-400/70 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3.5">
                          {m.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.avatar_url}
                              alt={m.full_name}
                              loading="lazy"
                              className="size-16 rounded-2xl object-cover object-top border-2 border-cyan-400/50 shadow-md shrink-0 bg-slate-900"
                            />
                          ) : (
                            <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl border border-white/20 shrink-0">
                              {m.full_name.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
                            >
                              {badge.label}
                            </span>

                            <h3 className="font-serif text-base font-bold text-white leading-snug truncate group-hover:text-cyan-300 transition-colors">
                              {m.full_name}
                            </h3>

                            {m.department && (
                              <p className="text-xs text-cyan-100/90 font-medium truncate flex items-center gap-1">
                                <GraduationCap className="size-3 shrink-0 text-cyan-300" />
                                <span>{m.department} {m.batch ? `(${m.batch})` : ''}</span>
                              </p>
                            )}

                            {m.designation && (
                              <p className="text-[11px] text-amber-200 truncate">
                                📌 {m.designation}
                              </p>
                            )}

                            {m.newspaper_name && (
                              <p className="text-[11px] text-slate-300 truncate flex items-center gap-1">
                                <Newspaper className="size-3 shrink-0 text-cyan-400" />
                                <span>{m.newspaper_name}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* পোর্টফোলিও লিংক বাটন */}
                      <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                        <span className="text-[10px] text-white/50">
                          ভেরিফাইড আইডি • MBSTURU
                        </span>

                        <Link
                          href={`/u/${m.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-cyan-300 hover:text-white px-3 py-1 text-xs font-bold transition shadow-xs"
                        >
                          <span>প্রোফাইল ও রিপোর্ট</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-slate-300 text-sm space-y-1">
                <p className="font-bold text-white">কোনো সদস্য পাওয়া যায়নি।</p>
                <p className="text-xs text-white/60">ভিন্ন কোনো নাম বা বিভাগ দিয়ে পুনরায় সার্চ করুন।</p>
              </div>
            )}
          </section>

          {/* ৪. দ্রুত রেফারেন্স ও সম্পর্কিত পাতার লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/committee"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Users className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">বর্তমান কমিটি</p>
                  <p className="text-[10px] text-slate-300">কার্যনির্বাহী পরিষদের তালিকা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/advisors"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">উপদেষ্টা পরিষদ</p>
                  <p className="text-[10px] text-slate-300">শিক্ষক ও পেশাদার উপদেষ্টা</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/about"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">আমাদের সম্পর্কে</p>
                  <p className="text-[10px] text-slate-300">ইতিহাস, ভিশন ও অর্জন</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ফুটার ব্যাক বাটন */}
          <div className="pt-4 border-t border-white/15">
            <BackNavigation fallbackHref="/" />
          </div>

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
