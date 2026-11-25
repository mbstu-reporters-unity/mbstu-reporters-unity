'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ExternalLink,
  CalendarDays,
  Share2,
  Check,
  Send,
  ArrowRight,
  Clock,
  BookOpen,
  Camera,
  User,
} from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import {
  getFactCheckItems,
  type FactCheckItem,
  type FactVerdict,
} from '@/lib/content-hub'
import { useLang } from '@/lib/i18n'

const VERDICT_META: Record<
  FactVerdict,
  {
    label: string
    short: string
    badgeCls: string
    cardBorder: string
    stampCls: string
    Icon: typeof CheckCircle2
  }
> = {
  false: {
    label: 'মিথ্যা / গুজব',
    short: 'মিথ্যা',
    badgeCls: 'bg-rose-600 text-white border-rose-400',
    cardBorder: 'border-l-4 border-l-rose-500',
    stampCls: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Icon: XCircle,
  },
  misleading: {
    label: 'বিভ্রান্তিকর',
    short: 'বিভ্রান্তিকর',
    badgeCls: 'bg-amber-400 text-slate-950 border-amber-200',
    cardBorder: 'border-l-4 border-l-amber-400',
    stampCls: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    Icon: AlertTriangle,
  },
  true: {
    label: 'সত্য',
    short: 'সত্য',
    badgeCls: 'bg-emerald-600 text-white border-emerald-400',
    cardBorder: 'border-l-4 border-l-emerald-500',
    stampCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    Icon: CheckCircle2,
  },
  unverified: {
    label: 'যাচাই অসম্পূর্ণ',
    short: 'অযাচাইকৃত',
    badgeCls: 'bg-slate-600 text-white border-slate-400',
    cardBorder: 'border-l-4 border-l-slate-400',
    stampCls: 'bg-white/10 text-slate-300 border-white/25',
    Icon: HelpCircle,
  },
}

const VERDICT_LABEL_EN: Record<FactVerdict, string> = {
  false: 'False / Rumour',
  misleading: 'Misleading',
  true: 'True',
  unverified: 'Unverified',
}

export default function FactCheckPage() {
  const { lang, pick } = useLang()
  const [items, setItems] = useState<FactCheckItem[]>([])
  const [loading, setLoading] = useState(true)
  const [verdictFilter, setVerdictFilter] = useState<'all' | FactVerdict>('all')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const count = (value: number) => value.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')

  async function loadData() {
    setLoading(true)
    const rows = await getFactCheckItems()
    setItems(rows)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const counts = useMemo(() => {
    return {
      all: items.length,
      false: items.filter((i) => i.verdict === 'false').length,
      misleading: items.filter((i) => i.verdict === 'misleading').length,
      true: items.filter((i) => i.verdict === 'true').length,
      unverified: items.filter((i) => i.verdict === 'unverified').length,
    }
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      if (verdictFilter !== 'all' && it.verdict !== verdictFilter) return false
      if (!q) return true
      return [it.title, it.claim, it.explanation, it.claim_source, it.checker_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [items, verdictFilter, search])

  async function handleShare(item: FactCheckItem) {
    const meta = VERDICT_META[item.verdict] || VERDICT_META.unverified
    const url = `${window.location.origin}/fact-check#${item.id}`
    const shareText = `[${pick(`তথ্য-যাচাই: ${meta.short}`, `Fact-check: ${VERDICT_LABEL_EN[item.verdict]}`)}] ${item.title}`
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: shareText, url })
        return
      }
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <BackNavigation
            items={[
              { label: pick('সংবাদ ও গণমাধ্যম', 'News and Media') },
              { label: pick('তথ্য-যাচাই ডেস্ক', 'Fact-check Desk') },
            ]}
          />

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
              <ShieldCheck className="size-3.5" />
              <span>{pick('তথ্য-যাচাই ডেস্ক', 'Fact-check Desk')}</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
              {pick('তথ্য-যাচাই প্রতিবেদন', 'Fact-check Reports')}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {pick('বিশ্ববিদ্যালয় ক্যাম্পাস ও সামাজিক যোগাযোগমাধ্যমে প্রচারিত বিভ্রান্তিকর তথ্য, জাল বিজ্ঞপ্তি ও গুজবের প্রমাণভিত্তিক যাচাই প্রতিবেদন।', 'Evidence-based reviews of misleading claims, false notices, and rumours circulating on campus and social media.')}
            </p>

            {/* ফ্যাক্ট-চেক স্ট্যাটাস ব্যাজ ও আবেদন বাটন */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-bold">
              <span className="bg-rose-500/20 border border-rose-400/40 text-rose-200 px-3 py-1 rounded-full">
                {pick('মিথ্যা / গুজব', 'False / Rumour')}: {count(counts.false)}
              </span>
              <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3 py-1 rounded-full">
                {pick('বিভ্রান্তিকর', 'Misleading')}: {count(counts.misleading)}
              </span>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-3 py-1 rounded-full">
                {pick('সত্য', 'True')}: {count(counts.true)}
              </span>
            </div>

            <div className="pt-2">
              <Link
                href="/tip"
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-950 hover:bg-cyan-100 px-4 py-2 text-xs font-bold shadow-lg transition active:scale-95"
              >
                <Send className="size-3.5 text-rose-600" />
                <span>{pick('সন্দেহজনক তথ্য যাচাইয়ের জন্য পাঠান', 'Submit a claim for verification')}</span>
              </Link>
            </div>
          </div>

          {/* সার্চ ও ভার্ডিক্ট ফিল্টার */}
          <section className="glass-card p-4 sm:p-5 space-y-4 text-white">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <input
                  type="text"
                  placeholder={pick('প্রচারিত দাবি, গুজব বা ব্যাখ্যার শব্দ দিয়ে খুঁজুন', 'Search by claim, rumour, or explanation')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold transition shrink-0 cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{pick('তথ্য হালনাগাদ করুন', 'Refresh')}</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setVerdictFilter('all')}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold cursor-pointer transition ${
                  verdictFilter === 'all'
                    ? 'border-cyan-300 bg-cyan-500 text-slate-950 shadow'
                    : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                }`}
              >
                {pick('সব প্রতিবেদন', 'All reports')} ({count(counts.all)})
              </button>

              {(['false', 'misleading', 'true', 'unverified'] as FactVerdict[]).map((vk) => {
                const m = VERDICT_META[vk]
                const Icon = m.Icon
                const active = verdictFilter === vk
                return (
                  <button
                    key={vk}
                    type="button"
                    onClick={() => setVerdictFilter(vk)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${
                      active
                        ? m.badgeCls + ' shadow'
                        : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{pick(m.short, VERDICT_LABEL_EN[vk])} ({count(counts[vk])})</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ফ্যাক্ট-চেক কার্ড তালিকা */}
          {loading ? (
            <div className="glass-card p-12 text-center text-sm text-slate-300">
              {pick('তথ্য-যাচাই প্রতিবেদন লোড হচ্ছে…', 'Loading fact-check reports…')}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-5">
              {filtered.map((item) => {
                const meta = VERDICT_META[item.verdict] || VERDICT_META.unverified
                const VerdictIcon = meta.Icon
                const evidenceHref = item.evidence_url?.trim() || ''
                const isExternal = /^https?:\/\//i.test(evidenceHref)
                const isInternal = evidenceHref.startsWith('/')

                return (
                  <article
                    key={item.id}
                    id={item.id}
                    className={`glass-card p-5 sm:p-6 space-y-4 text-white ${meta.cardBorder}`}
                  >
                    {/* স্ট্যাম্প ও তারিখ */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold shadow ${meta.badgeCls}`}
                      >
                        <VerdictIcon className="size-4 shrink-0" />
                        <span>{pick('যাচাইয়ের সিদ্ধান্ত:', 'Verdict:')} {pick(meta.label, VERDICT_LABEL_EN[item.verdict])}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-cyan-200/80 font-medium">
                        <CalendarDays className="size-3.5 text-cyan-300" />
                        <span>{item.checked_date}</span>
                      </span>
                    </div>

                    {/* মূল শিরোনাম */}
                    <h2 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug">
                      {item.title}
                    </h2>

                    {/* দাবি বনাম বাস্তবতা */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="rounded-2xl bg-black/35 border border-white/15 p-4 space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                          <ShieldAlert className="size-3.5" />
                          <span>{pick('প্রচারিত দাবি / গুজব:', 'Claim / rumour:')}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed italic">
                          “{item.claim}”
                        </p>
                        {item.claim_source && (
                          <p className="text-[11px] text-white/55 pt-1">
                            {pick('উৎস:', 'Source:')} {item.claim_source}
                          </p>
                        )}
                      </div>

                      <div className={`rounded-2xl border p-4 space-y-1.5 ${meta.stampCls}`}>
                        <p className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <VerdictIcon className="size-3.5" />
                          <span>{pick('যাচাইয়ের ফলাফল:', 'Findings:')}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-line">
                          {item.explanation}
                        </p>
                      </div>
                    </div>

                    {/* প্রমাণ ছবি (যদি থাকে) */}
                    {item.image_url && (
                      <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full max-h-80 object-contain mx-auto"
                        />
                      </div>
                    )}

                    {/* ফুটার: যাচাইকারী, প্রমাণ লিংক ও শেয়ার */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                      <div className="flex flex-wrap items-center gap-3 text-slate-300">
                        {item.checker_name && (
                          <span className="inline-flex items-center gap-1">
                            <User className="size-3.5 text-cyan-400" />
                            <span>{item.checker_name}</span>
                          </span>
                        )}

                        {evidenceHref && (isExternal || isInternal) && (
                          isExternal ? (
                            <a
                              href={evidenceHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-cyan-300 hover:underline font-bold"
                            >
                              <ExternalLink className="size-3.5" />
                              <span>{pick('প্রমাণসূত্র দেখুন', 'View supporting evidence')}</span>
                            </a>
                          ) : (
                            <Link
                              href={evidenceHref}
                              className="inline-flex items-center gap-1 text-cyan-300 hover:underline font-bold"
                            >
                              <ExternalLink className="size-3.5" />
                              <span>{pick('প্রমাণসূত্র দেখুন', 'View supporting evidence')}</span>
                            </Link>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleShare(item)}
                          className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 font-bold text-white cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="size-3 text-emerald-300" />
                              <span>{pick('লিংক কপি হয়েছে', 'Link copied')}</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="size-3" />
                              <span>{pick('শেয়ার করুন', 'Share')}</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `[${pick(`তথ্য-যাচাই: ${meta.short}`, `Fact-check: ${VERDICT_LABEL_EN[item.verdict]}`)}] ${item.title} - ${
                              typeof window !== 'undefined'
                                ? `${window.location.origin}/fact-check#${item.id}`
                                : ''
                            }`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 font-bold"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-300 space-y-2">
              <ShieldCheck className="size-10 text-white/40 mx-auto" />
              <p className="text-base font-bold text-white">{pick('কোনো তথ্য-যাচাই প্রতিবেদন পাওয়া যায়নি।', 'No fact-check reports were found.')}</p>
            </div>
          )}

          {/* অন্যান্য পাতার দ্রুত লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/timeline"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('ক্যাম্পাসের ঘটনাপঞ্জি', 'Campus Timeline')}</p>
                  <p className="text-[10px] text-slate-300">{pick('ঘটনাবলির ধারাবাহিক বিবরণ', 'A chronological record of events')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/gallery"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Camera className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('ছবি ও ভিডিও গ্যালারি', 'Photo and Video Gallery')}</p>
                  <p className="text-[10px] text-slate-300">{pick('ছবি ও ভিডিওর আর্কাইভ', 'Archive of photographs and videos')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/publications"
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400 transition group text-white"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">{pick('প্রকাশনা আর্কাইভ', 'Publication Archive')}</p>
                  <p className="text-[10px] text-slate-300">{pick('সাময়িকী, বুলেটিন ও পিডিএফ', 'Periodicals, bulletins, and PDFs')}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

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
