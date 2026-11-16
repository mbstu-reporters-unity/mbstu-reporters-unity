'use client'

import { useEffect, useState } from 'react'
import { Download, Check, WifiOff, CloudDownload } from 'lucide-react'
import { SB_URL, SB_KEY } from '@/lib/sb'

const OFFLINE_SYNC_ROUTES = [
  '/',
  '/offline',
  '/notices',
  '/administration',
  '/associations',
  '/social-sites',
  '/student-corner',
  '/council',
]

const OFFLINE_API_ENDPOINTS = [
  '/rest/v1/posts?select=*&or=(hidden.is.null,hidden.eq.false)&order=created_at.desc&limit=300',
  '/rest/v1/board_notices?select=*&order=is_pinned.desc,created_at.desc&or=(expires_at.is.null,expires_at.gt.NOW)&limit=300',
  '/rest/v1/campus_clubs?select=*&order=sort_order.asc,created_at.asc',
  '/rest/v1/faculties?select=*&order=sort_order.asc,created_at.asc',
  '/rest/v1/departments?select=*&order=sort_order.asc,created_at.asc',
  '/rest/v1/mbstu_administration?select=*&order=sort_order.asc,created_at.asc',
  '/rest/v1/community_pages?select=*&order=sort_order.asc,created_at.asc',
  '/rest/v1/student_items?select=*&or=(hidden.is.null,hidden.eq.false)&order=featured.desc,sort_order.asc,created_at.desc',
  '/rest/v1/ticker_items?select=*&is_active=eq.true&order=sort_order.asc,created_at.desc&limit=50',
  '/rest/v1/leaders?select=*&order=sort_order.asc',
  '/rest/v1/hero_slides?select=*&order=sort_order.desc,created_at.desc&limit=100',
  '/rest/v1/hero_settings?select=*&id=eq.1',
  '/rest/v1/stories?select=*&is_active=eq.true&or=(is_highlight.eq.true,expires_at.gt.now())&order=created_at.desc',
  '/rest/v1/reels?select=*&is_active=eq.true&order=sort_order.asc,created_at.desc&limit=50',
  '/rest/v1/categories?select=name&or=(is_hidden.is.null,is_hidden.eq.false)&order=sort_order.asc,created_at.asc',
  '/rest/v1/university_associations?select=*&order=sort_order.asc,created_at.asc',
  '/rest/v1/mbstu_social_sites?select=*&order=sort_order.asc,created_at.asc',
]

function collectStaticAssetsFromHtml(html: string): string[] {
  const urls = new Set<string>()
  const regex = /(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(html)) !== null) {
    urls.add(m[1])
  }
  return Array.from(urls)
}

function collectLoadedResources(): string[] {
  const fromPerf = performance
    .getEntriesByType('resource')
    .map((e) => e.name)
    .filter(
      (n) =>
        n.includes('/_next/static/') ||
        n.includes('/logo.png') ||
        n.includes('/icon.png') ||
        n.includes('/storage/v1/object/public/') ||
        n.includes('mbstu.ac.bd')
    )
  const fromImgs = Array.from(document.querySelectorAll('img'))
    .map((img) => img.currentSrc || img.src)
    .filter((s) => s && s.startsWith('http'))
  return Array.from(new Set([...fromPerf, ...fromImgs, '/logo.png', '/icon.png']))
}

export function OfflinePwaManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          const ready = await navigator.serviceWorker.ready
          ready.active?.postMessage({ type: 'CACHE_URLS', urls: collectLoadedResources() })
          reg.update().catch(() => {})
        })
        .catch(() => {})

      const onSwMsg = (event: MessageEvent) => {
        if (event.data?.type === 'OFFLINE_DETECTED') setIsOnline(false)
        if (event.data?.type === 'ONLINE_DETECTED') setIsOnline(true)
      }
      navigator.serviceWorker.addEventListener('message', onSwMsg)
      return () => navigator.serviceWorker.removeEventListener('message', onSwMsg)
    }
  }, [])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  async function handleSaveForOffline() {
    if (syncing) return
    setSyncing(true)
    try {
      const ping = await fetch('/manifest.webmanifest', { cache: 'no-store' })
      if (!ping.ok) throw new Error('offline')

      const assetUrls = new Set<string>(collectLoadedResources())

      await Promise.allSettled(
        OFFLINE_SYNC_ROUTES.map(async (route) => {
          const res = await fetch(route, {
            credentials: 'same-origin',
            headers: { 'X-Offline-Prefetch': '1' },
          })
          if (res.ok) {
            const html = await res.text()
            collectStaticAssetsFromHtml(html).forEach((u) => assetUrls.add(u))
          }
        })
      )

      const imageUrlsToCache = new Set<string>()
      await Promise.allSettled(
        OFFLINE_API_ENDPOINTS.map(async (ep) => {
          const res = await fetch(`${SB_URL}${ep}`, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
          })
          if (!res.ok) return
          const rows = await res.json().catch(() => [])
          if (Array.isArray(rows)) {
            rows.slice(0, 25).forEach((r: Record<string, any>) => {
              ;['image_url', 'author_avatar', 'avatar_url', 'logo_url', 'photo_url', 'thumbnail_url'].forEach(
                (k) => {
                  if (typeof r?.[k] === 'string' && r[k].startsWith('http')) {
                    imageUrlsToCache.add(r[k])
                  }
                }
              )
            })
          }
        })
      )

      const allToCache = Array.from(new Set([...assetUrls, ...imageUrlsToCache])).slice(0, 120)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        reg.active?.postMessage({ type: 'CACHE_URLS', urls: allToCache })
      }

      setIsOnline(true)
      setSynced(true)
      setTimeout(() => setSynced(false), 4000)
    } catch {
      setIsOnline(false)
    }
    setSyncing(false)
  }

  async function handleInstallApp() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice.catch(() => {})
    setInstallPrompt(null)
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed bottom-4 left-3 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-300/50 backdrop-blur-md">
          <WifiOff className="size-3.5 shrink-0" />
          <span>অফলাইন মোড — সংরক্ষিত তথ্য দেখাচ্ছে</span>
        </div>
      )}

      {isOnline && installPrompt && (
        <div className="fixed bottom-5 left-3.5 z-40">
          <button
            type="button"
            onClick={handleInstallApp}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/40 px-3 py-2 text-xs font-bold shadow-xl backdrop-blur cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>অ্যাপ ইনস্টল</span>
          </button>
        </div>
      )}

      {isOnline && (
        <button
          type="button"
          onClick={handleSaveForOffline}
          disabled={syncing}
          title="ইন্টারনেট ছাড়াই পরবর্তীতে পড়ার জন্য মূল পেজ ও ছবি সেভ করুন"
          className="fixed bottom-16 right-3.5 sm:bottom-20 sm:right-6 z-40 inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-cyan-300 border border-white/25 px-3 py-2 text-[11px] font-bold shadow-lg backdrop-blur cursor-pointer transition active:scale-95"
        >
          {synced ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span>সব তথ্য ও ছবি সেভ হয়েছে</span>
            </>
          ) : (
            <>
              <CloudDownload className={`size-3.5 ${syncing ? 'animate-bounce' : ''}`} />
              <span>{syncing ? 'সেভ হচ্ছে...' : 'অফলাইন সেভ'}</span>
            </>
          )}
        </button>
      )}
    </>
  )
}
