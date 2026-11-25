'use client'

import { WifiOff, RefreshCw, Home, Bell, Building2 } from 'lucide-react'
import { BackNavigation } from '@/components/portal/back-navigation'
import { Tx } from '@/lib/i18n'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-white">
      <div className="w-full max-w-md">
        <BackNavigation items={[{ label: <Tx bn="অফলাইন পৃষ্ঠা" en="Offline Page" /> }]} />
      </div>
      <div className="glass-card max-w-md w-full p-6 sm:p-8 text-center space-y-4">
        <div className="size-16 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
          <WifiOff className="size-8" />
        </div>

        <h1 className="font-serif text-xl sm:text-2xl font-bold">
          <Tx bn="আপনি বর্তমানে অফলাইনে আছেন" en="You are currently offline" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <Tx bn="এই পৃষ্ঠাটি আগে খোলা হয়নি, তাই অফলাইনে সংরক্ষিত নেই। তবে আগে খোলা বা সংরক্ষিত পৃষ্ঠাগুলো এখনো দেখা যাবে।" en="This page has not been opened before and is therefore unavailable offline. Previously opened or saved pages may still be available." />
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span><Tx bn="আবার চেষ্টা করুন" en="Try again" /></span>
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2"
          >
            <Home className="size-3.5" />
            <span><Tx bn="প্রচ্ছদ" en="Home" /></span>
          </a>

          <a
            href="/notices"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2"
          >
            <Bell className="size-3.5" />
            <span><Tx bn="বিজ্ঞপ্তি" en="Notices" /></span>
          </a>

          <a
            href="/administration"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2"
          >
            <Building2 className="size-3.5" />
            <span><Tx bn="প্রশাসন" en="Administration" /></span>
          </a>
        </div>
      </div>
    </main>
  )
}
