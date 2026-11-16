'use client'

import { useEffect, useState } from 'react'
import { Download, Check, WifiOff, CloudDownload } from 'lucide-react'

const OFFLINE_SYNC_ROUTES = [
  '/',
  '/notices',
  '/administration',
  '/associations',
  '/social-sites',
  '/student-corner',
  '/council',
]

export function OfflinePwaManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

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
    if (!navigator.onLine || syncing) return
    setSyncing(true)
    try {
      await Promise.allSettled(
        OFFLINE_SYNC_ROUTES.map((r) => fetch(r, { credentials: 'same-origin' }))
      )
      setSynced(true)
      setTimeout(() => setSynced(false), 3500)
    } catch {}
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
      {/* অফলাইন সতর্কবার্তা */}
      {!isOnline && (
        <div className="fixed bottom-4 left-3 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-300/50 backdrop-blur-md">
          <WifiOff className="size-3.5 shrink-0" />
          <span>অফলাইন মোড — সংরক্ষিত তথ্য দেখাচ্ছে</span>
        </div>
      )}

      {/* অনলাইনে থাকলে অ্যাপ ইনস্টল ও অফলাইন সেভ বাটন */}
      {isOnline && (installPrompt || syncing || synced) && (
        <div className="fixed bottom-5 left-3.5 z-40 flex items-center gap-2">
          {installPrompt && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/40 px-3 py-2 text-xs font-bold shadow-xl backdrop-blur cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>অ্যাপ ইনস্টল</span>
            </button>
          )}
        </div>
      )}

      {isOnline && (
        <button
          type="button"
          onClick={handleSaveForOffline}
          disabled={syncing}
          title="ইন্টারনেট ছাড়াই পরবর্তীতে পড়ার জন্য মূল পেজগুলো সেভ করুন"
          className="fixed bottom-16 right-3.5 sm:bottom-20 sm:right-6 z-40 inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-cyan-300 border border-white/25 px-3 py-2 text-[11px] font-bold shadow-lg backdrop-blur cursor-pointer transition active:scale-95"
        >
          {synced ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span>অফলাইনের জন্য সেভ হয়েছে</span>
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
