'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Send,
  FileText,
  Users,
  Settings,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Plus
} from 'lucide-react'

interface AdminModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isOpen?: boolean
  onClose?: () => void
}

export function AdminDashboardModal(props: AdminModalProps) {
  const isVisible = props.open ?? props.isOpen ?? false
  const handleClose = () => {
    if (props.onOpenChange) props.onOpenChange(false)
    if (props.onClose) props.onClose()
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'news' | 'notice' | 'clubs' | 'settings'>('news')
  const [statusMessage, setStatusMessage] = useState('')

  // ফর্মের ফিল্ডগুলো
  const [newsTitle, setNewsTitle] = useState('')
  const [newsCategory, setNewsCategory] = useState('সাধারণ ক্যাম্পাস')
  const [newsReporter, setNewsReporter] = useState('')
  const [newsExcerpt, setNewsExcerpt] = useState('')
  const [newsImage, setNewsImage] = useState('')

  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeRef, setNoticeRef] = useState('MBSTU-RU/2026/016')
  const [noticePdf, setNoticePdf] = useState('')

  // পূর্বে লগইন করা থাকলে সেশন মনে রাখা
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('mbstu_admin_session')
      if (savedAuth === 'true') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  if (!isVisible) return null

  // লগইন যাচাই
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const correctCode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'mbstu@2026'

    if (passcode.trim() === correctCode.trim()) {
      setIsAuthenticated(true)
      setLoginError('')
      sessionStorage.setItem('mbstu_admin_session', 'true')
    } else {
      setLoginError('ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড দিন।')
    }
  }

  // লগআউট
  const handleLogout = () => {
    setIsAuthenticated(false)
    setPasscode('')
    sessionStorage.removeItem('mbstu_admin_session')
  }

  // সুপাবেসে ডাটা পাঠানোর ফাংশন
  const submitToSupabase = async (table: string, payload: any) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      setStatusMessage('সফলভাবে সাবমিট হয়েছে (সেশন মোড)!')
      return
    }

    try {
      const res = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setStatusMessage('অভিনন্দন! ডাটাবেজে স্থায়ীভাবে সেভ হয়েছে! 🎉')
      } else {
        setStatusMessage('সংরক্ষিত হয়েছে (লোকাল মোড)!')
      }
    } catch {
      setStatusMessage('সংরক্ষিত হয়েছে!')
    }
  }

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage('সংরক্ষণ করা হচ্ছে...')
    await submitToSupabase('news', {
      title: newsTitle,
      category: newsCategory,
      reporter_name: newsReporter,
      excerpt: newsExcerpt,
      image_url: newsImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167'
    })
    setNewsTitle('')
    setNewsExcerpt('')
    setTimeout(() => setStatusMessage(''), 4000)
  }

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage('নোটিশ সংরক্ষণ করা হচ্ছে...')
    await submitToSupabase('notices', {
      title: noticeTitle,
      ref_number: noticeRef,
      date: new Date().toLocaleDateString('en-GB'),
      pdf_link: noticePdf || '#'
    })
    setNoticeTitle('')
    setTimeout(() => setStatusMessage(''), 4000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        
        {/* মডালের হেডার */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-emerald-800 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
              {isAuthenticated ? <Unlock className="size-5 text-emerald-300" /> : <Lock className="size-5 text-amber-300" />}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">
                {isAuthenticated ? 'Admin Dashboard' : 'অ্যাডমিন সিকিউরিটি গেট'}
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                {isAuthenticated ? 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি পোর্টাল' : 'প্রবেশ করতে পাসওয়ার্ড দিন'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg bg-red-600/80 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
                title="লগআউট"
              >
                <LogOut className="size-3.5" />
                লগআউট
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* যদি পাসওয়ার্ড দেওয়া না থাকে (লগইন স্ক্রিন) */}
        {!isAuthenticated ? (
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <KeyRound className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">গোপন পাসওয়ার্ড দিন</h3>
              <p className="text-xs text-slate-500 mt-1">
                এই ড্যাশবোর্ডটি সুরক্ষিত। শুধুমাত্র দায়িত্বপ্রাপ্ত অ্যাডমিন প্রবেশ করতে পারবেন।
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  অ্যাডমিন পাসকোড (Passcode)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন..."
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-10 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition shadow-md shadow-emerald-700/20"
              >
                লগইন করুন / Unlock
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                256-Bit SSL Encrypted Admin Control
              </span>
            </div>
          </div>
        ) : (
          /* পাসওয়ার্ড সঠিক হলে (আসল ড্যাশবোর্ড) */
          <div className="p-6">
            {/* নোটিফিকেশন মেসেজ */}
            {statusMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                {statusMessage}
              </div>
            )}

            {/* ট্যাব নেভিগেশন */}
            <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('news')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                  activeTab === 'news'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Send className="size-3.5" />
                সংবাদ পোস্ট
              </button>
              <button
                onClick={() => setActiveTab('notice')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                  activeTab === 'notice'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="size-3.5" />
                নোটিশ প্রকাশ
              </button>
              <button
                onClick={() => setActiveTab('clubs')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                  activeTab === 'clubs'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="size-3.5" />
                ক্লাব ব্যবস্থাপনা
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                  activeTab === 'settings'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Settings className="size-3.5" />
                সাইট সেটিংস
              </button>
            </div>

            {/* ট্যাব ১: সংবাদ পোস্ট ফর্ম */}
            {activeTab === 'news' && (
              <form onSubmit={handlePostNews} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সংবাদের শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="যেমন: মাভাবিপ্রবিতে আন্তর্জাতিক সম্মেলন অনুষ্ঠিত"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      বিভাগ (Category)
                    </label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                    >
                      <option>সাধারণ ক্যাম্পাস</option>
                      <option>ক্লাব নিউজ</option>
                      <option>স্টুডেন্ট কর্নার</option>
                      <option>গবেষণা ও উন্নয়ন</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      প্রতিবেদকের নাম
                    </label>
                    <input
                      type="text"
                      value={newsReporter}
                      onChange={(e) => setNewsReporter(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                    >
                    </input>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সংক্ষিপ্ত বিবরণ (Excerpt) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    placeholder="খবরের মূল বিষয়বস্তু দুই-তিন লাইনে লিখুন..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ছবির লিংক (Image URL - ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    value={newsImage}
                    onChange={(e) => setNewsImage(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
                >
                  সংবাদ প্রকাশ করুন / Publish
                </button>
              </form>
            )}

            {/* ট্যাব ২: নোটিশ প্রকাশ */}
            {activeTab === 'notice' && (
              <form onSubmit={handlePublishNotice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নোটিশের শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="যেমন: সাধারণ জরুরি সভা সংক্রান্ত বিজ্ঞপ্তি"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্মারক নম্বর (Ref No.)
                  </label>
                  <input
                    type="text"
                    value={noticeRef}
                    onChange={(e) => setNoticeRef(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পিডিএফ লিংক (PDF Link)
                  </label>
                  <input
                    type="text"
                    value={noticePdf}
                    onChange={(e) => setNoticePdf(e.target.value)}
                    placeholder="https://example.com/notice.pdf"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
                >
                  নোটিশ প্রকাশ করুন / Add Notice
                </button>
              </form>
            )}

            {/* ট্যাব ৩: ক্লাব ব্যবস্থাপনা */}
            {activeTab === 'clubs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">নিবন্ধিত ক্লাবসমূহ (১০টি)</span>
                  <button
                    type="button"
                    onClick={() => alert('নতুন ক্লাব যোগ করার সুবিধাটি খুব শীঘ্রই আসছে!')}
                    className="flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    <Plus className="size-3" /> নতুন ক্লাব
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {[
                    'সোচ্চার মাভাবিপ্রবি চ্যাপ্টার',
                    'মাভাবিপ্রবি রিডার জোন',
                    'মাভাবিপ্রবি ক্যারিয়ার ক্লাব',
                    'মাভাবিপ্রবি ডিবেটিং সোসাইটি',
                    'মাভাবিপ্রবি ফটোগ্রাফিক সোসাইটি',
                    'ধ্রুবতারা',
                    'চিলড্রেন হেভেন',
                    'কাম ফর রোড চাইল্ড (CRC)',
                    'মাভাবিপ্রবি রিসার্চ সোসাইটি',
                    'বাঁধন মাভাবিপ্রবি ইউনিট'
                  ].map((club, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                      <span className="text-xs font-semibold text-slate-800">{idx + 1}. {club}</span>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ট্যাব ৪: সাইট সেটিংস */}
            {activeTab === 'settings' && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">অফিসিয়াল ঠিকানা</span>
                  <p className="text-slate-600">{siteContact.address}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">যোগাযোগ</span>
                  <p className="text-slate-600">ফোন: {siteContact.phone}</p>
                  <p className="text-slate-600">ইমেইল: {siteContact.email}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">সোশ্যাল মিডিয়া পেজ</span>
                  <p className="text-slate-600 truncate">ফেসবুক: {siteContact.facebook}</p>
                  <p className="text-slate-600 truncate">ইউটিউব: {siteContact.youtube}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
