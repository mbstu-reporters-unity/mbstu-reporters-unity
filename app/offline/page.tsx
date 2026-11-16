'use client'

import { WifiOff, RefreshCw, Home, Bell, Building2 } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 text-white">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 text-center space-y-4">
        <div className="size-16 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
          <WifiOff className="size-8" />
        </div>

        <h1 className="font-serif text-xl sm:text-2xl font-bold">
          আপনি এখন অফলাইনে আছেন
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          এই পাতাটি আগে কখনো খোলা হয়নি বলে অফলাইনে সংরক্ষিত নেই। তবে আগে খোলা বা সেভ করা পাতাগুলো আপনি এখনো দেখতে পারবেন।
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>আবার চেষ্টা করুন</span>
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2"
          >
            <Home className="size-3.5" />
            <span>হোমপেজ</span>
          </a>

          <a
            href="/notices"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2"
          >
            <Bell className="size-3.5" />
            <span>নোটিশ</span>
          </a>

          <a
            href="/administration"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2"
          >
            <Building2 className="size-3.5" />
            <span>প্রশাসন</span>
          </a>
        </div>
      </div>
    </main>
  )
}
