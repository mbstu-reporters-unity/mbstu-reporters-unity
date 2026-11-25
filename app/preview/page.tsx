'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Monitor,
  Smartphone,
  Tablet,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Sliders,
} from 'lucide-react'

type DeviceType = 'iphone' | 'android' | 'tablet'

interface DeviceConfig {
  name: string
  width: number
  height: number
  label: string
}

const DEVICES: Record<DeviceType, DeviceConfig> = {
  iphone: { name: 'iPhone 15 Pro', width: 393, height: 852, label: '393 × 852 px' },
  android: { name: 'Pixel 8', width: 412, height: 892, label: '412 × 892 px' },
  tablet: { name: 'iPad Mini', width: 768, height: 1024, label: '768 × 1024 px' },
}

const QUICK_ROUTES = [
  { label: '✨ মডার্ন ডেমো', path: '/demo' },
  { label: 'হোম পেজ (বর্তমান)', path: '/' },
  { label: 'সংবাদ', path: '/news' },
  { label: 'ক্যাম্পাস ক্লাব', path: '/clubs' },
  { label: 'নোটিশ বোর্ড', path: '/notices' },
  { label: 'স্টুডেন্ট কর্নার', path: '/student-corner' },
  { label: 'আমাদের সম্পর্কে', path: '/about' },
]

export default function DualPreviewPage() {
  const [currentPath, setCurrentPath] = useState('/')
  const [inputPath, setInputPath] = useState('/')
  const [mobileDevice, setMobileDevice] = useState<DeviceType>('iphone')
  const [desktopScale, setDesktopScale] = useState(0.65)
  const [mobileScale, setMobileScale] = useState(0.85)
  const [refreshKey, setRefreshKey] = useState(0)

  const activeDevice = DEVICES[mobileDevice]

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setInputPath(path)
    handleRefresh()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let p = inputPath.trim()
    if (!p.startsWith('/')) p = '/' + p
    setCurrentPath(p)
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* শীর্ষ কন্ট্রোল বার */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 shadow-lg">
        <div className="max-w-[1900px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* লোগো ও টাইটেল */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            >
              <Monitor className="size-4 text-cyan-400" />
              <span>ডুয়াল প্রিভিউ স্টুডিও</span>
            </Link>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              Live PC + Mobile
            </span>
          </div>

          {/* ইউআরএল নেভিগেশন বার */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="/ বা /news বা /notices"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0"
            >
              যান
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              title="উভয় স্ক্রিন রিফ্রেশ করুন"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            >
              <RotateCw className="size-4" />
            </button>
          </form>

          {/* কুইক রাউটস */}
          <div className="hidden xl:flex items-center gap-1.5">
            {QUICK_ROUTES.map((route) => (
              <button
                key={route.path}
                type="button"
                onClick={() => handleNavigate(route.path)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition ${
                  currentPath === route.path
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {route.label}
              </button>
            ))}
          </div>

          {/* ডিভাইস এবং স্কেল কন্ট্রোল */}
          <div className="flex items-center gap-3">
            {/* মোবাইল ডিভাইস নির্বাচন */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setMobileDevice('iphone')}
                title="iPhone 15 Pro"
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition ${
                  mobileDevice === 'iphone' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="size-3.5" />
                <span>iPhone</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileDevice('android')}
                title="Google Pixel 8"
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition ${
                  mobileDevice === 'android' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="size-3.5" />
                <span>Pixel</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileDevice('tablet')}
                title="iPad Mini"
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition ${
                  mobileDevice === 'tablet' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="size-3.5" />
                <span>Tablet</span>
              </button>
            </div>

            {/* সরাসরি নতুন ট্যাবে ওপেন */}
            <a
              href={currentPath}
              target="_blank"
              rel="noopener noreferrer"
              title="নতুন ট্যাবে ওপেন করুন"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </header>

      {/* মূল ডুয়াল ভিউপোর্ট কন্টেইনার (পাশাপাশি ২ স্ক্রিন) */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 overflow-auto">
        {/* =========================================================
            ১. পিসি ভিউ (ডেস্কটপ উইন্ডো - বাম পাশে)
            ========================================================= */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center justify-between w-full max-w-[850px] px-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Monitor className="size-4 text-cyan-400" />
              <span>ডেস্কটপ / পিসি ভিউ</span>
              <span className="text-[11px] text-slate-500 font-mono">(1280 × 800 px)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">স্কেল:</span>
              {[0.55, 0.65, 0.75].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDesktopScale(s)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    desktopScale === s ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* ডেস্কটপ উইন্ডো ফ্রেম */}
          <div
            className="rounded-2xl border-2 border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
            style={{
              width: `${1280 * desktopScale}px`,
              height: `${820 * desktopScale + 40}px`,
            }}
          >
            {/* ব্রাউজার হেডার বার */}
            <div className="h-9 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 select-none">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500 inline-block" />
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-0.5 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 max-w-[280px] truncate">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>localhost:3000{currentPath}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-bold">PC Desktop</div>
            </div>

            {/* আইফ্রেম কন্টেইনার স্কেলিং সহ */}
            <div className="flex-1 relative overflow-hidden bg-slate-950">
              <iframe
                key={`pc-${refreshKey}`}
                src={currentPath}
                title="Desktop View"
                style={{
                  width: '1280px',
                  height: '820px',
                  transform: `scale(${desktopScale})`,
                  transformOrigin: 'top left',
                }}
                className="absolute top-0 left-0 border-0 bg-slate-950"
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            ২. মোবাইল ভিউ (স্মার্টফোন ফ্রেম - ডান পাশে)
            ========================================================= */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center justify-between w-full max-w-[390px] px-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Smartphone className="size-4 text-cyan-400" />
              <span>মোবাইল ভিউ</span>
              <span className="text-[11px] text-slate-500 font-mono">({activeDevice.label})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">স্কেল:</span>
              {[0.75, 0.85, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setMobileScale(s)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    mobileScale === s ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* রিয়ালিস্টিক স্মার্টফোন বডি ফ্রেম */}
          <div
            className="relative rounded-[48px] border-[10px] border-slate-800 bg-slate-900 shadow-2xl p-1 flex flex-col transition-all duration-300 ring-1 ring-slate-700"
            style={{
              width: `${(activeDevice.width + 16) * mobileScale}px`,
              height: `${(activeDevice.height + 20) * mobileScale}px`,
            }}
          >
            {/* ডায়নামিক আইল্যান্ড / ক্যামেরা নচ */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-end pr-2">
              <div className="size-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* স্ক্রিন কন্টেইনার */}
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-slate-950 relative">
              <iframe
                key={`mobile-${refreshKey}-${mobileDevice}`}
                src={currentPath}
                title="Mobile View"
                style={{
                  width: `${activeDevice.width}px`,
                  height: `${activeDevice.height}px`,
                  transform: `scale(${mobileScale})`,
                  transformOrigin: 'top left',
                }}
                className="absolute top-0 left-0 border-0 bg-slate-950"
              />
            </div>

            {/* হোম বার ইন্ডিকেটর (নিচে) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-20 pointer-events-none" />
          </div>
        </div>
      </main>
    </div>
  )
}
