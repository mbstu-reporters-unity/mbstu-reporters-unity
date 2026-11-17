'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, WifiOff, X } from 'lucide-react'
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
  const pathname = usePathname() || ''
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)

  const hideInstallPill =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/reset')

  async function autoSyncOfflineData() {
    if (!navigator.onLine || !('serviceWorker' in navigator)) return
    const path = window.location.pathname
    if (path.startsWith('/admin')) return

    try {
      const reg = await navigator.serviceWorker.ready
      reg.active?.postMessage({ type: 'CACHE_URLS', urls: collectLoadedResources() })

      const last = Number(sessionStorage.getItem('mbsturu_auto_sync') || '0')
      if (Date.now() - last < 3 * 60 * 1000) return
      sessionStorage.setItem('mbsturu_auto_sync', String(Date.now()))

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

      const allToCache = Array.from(new Set([...assetUrls, ...imageUrlsToCache])).slice(0, 140)
      reg.active?.postMessage({ type: 'CACHE_URLS', urls: allToCache })
      setIsOnline(true)
    } catch {
      setIsOnline(false)
    }
  }

  useEffect(() => {
    setIsOnline(navigator.onLine)
    try {
      if (sessionStorage.getItem('mbsturu_install_dismissed') === '1') {
        setDismissed(true)
      }
    } catch {}

    let timer: ReturnType<typeof setTimeout> | null = null

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update().catch(() => {})
          timer = setTimeout(() => {
            autoSyncOfflineData()
          }, 2000)
        })
        .catch(() => {})

      const onSwMsg = (event: MessageEvent) => {
        if (event.data?.type === 'OFFLINE_DETECTED') setIsOnline(false)
        if (event.data?.type === 'ONLINE_DETECTED') setIsOnline(true)
      }
      navigator.serviceWorker.addEventListener('message', onSwMsg)

      return () => {
        if (timer) clearTimeout(timer)
        navigator.serviceWorker.removeEventListener('message', onSwMsg)
      }
    }
  }, [])

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true)
      sessionStorage.removeItem('mbsturu_auto_sync')
      autoSyncOfflineData()
    }
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

  async function handleInstallApp() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice.catch(() => {})
    setInstallPrompt(null)
  }

  function handleDismiss() {
    setDismissed(true)
    try {
      sessionStorage.setItem('mbsturu_install_dismissed', '1')
    } catch {}
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed bottom-4 left-3 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-300/50 backdrop-blur-md">
          <WifiOff className="size-3.5 shrink-0" />
          <span>অফলাইন মোড — সংরক্ষিত তথ্য দেখাচ্ছে</span>
        </div>
      )}

      {isOnline && installPrompt && !hideInstallPill && !dismissed && (
        <div className="fixed bottom-4 left-3 z-30 flex items-center rounded-full bg-slate-900/95 text-cyan-300 border border-cyan-400/40 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={handleInstallApp}
            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-[11px] font-bold hover:text-white cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>অ্যাপ ইনস্টল</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="বন্ধ করুন"
            className="pr-2.5 pl-1 py-1.5 text-white/60 hover:text-white border-l border-white/15 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </>
  )
}
