"use client"

import React, { useState } from "react"
import {
  Download,
  Database,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from "lucide-react"
import { SB_URL, SB_KEY } from "../../lib/sb"

export default function BackupExportManager({ token }: { token: string }) {
  const [busy, setBusy] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [success, setSuccess] = useState(false)
  const [errMsg, setErrMsg] = useState("")

  async function downloadFullBackup() {
    setBusy(true)
    setErrMsg("")
    setSuccess(false)
    setStatusText("ডাটাবেজ থেকে সকল তথ্য সংগ্রহ করা হচ্ছে...")

    try {
      // ১. RPC কল করে একবারে সম্পূর্ণ ব্যাকআপ JSON আনা
      let backupData: any = null
      const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/admin_export_backup`, {
        method: "POST",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (rpcRes.ok) {
        backupData = await rpcRes.json()
      } else {
        // ফলব্যাক: প্রধান টেবিলগুলো আলাদা ফেচ করে মার্জ করা
        setStatusText("টেবিলসমূহ ধাপে ধাপে এক্সপোর্ট হচ্ছে...")
        const tables = [
          "posts",
          "board_notices",
          "profiles",
          "leaders",
          "campus_clubs",
          "faculties",
          "departments",
          "community_pages",
          "student_items",
          "ticker_items",
          "membership_applications",
          "contact_feedback",
          "newsletter_subscribers",
          "campus_polls",
          "campus_podcasts",
          "app_config",
        ]

        const backupMap: Record<string, any> = {
          exported_at: new Date().toISOString(),
          version: "1.0",
        }

        for (const tbl of tables) {
          const res = await fetch(`${SB_URL}/rest/v1/${tbl}?select=*&limit=2000`, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            backupMap[tbl] = await res.json()
          }
        }
        backupData = backupMap
      }

      // ২. ব্রাউজারে JSON ফাইল ডাউনলোড করানো
      setStatusText("ফাইল প্রস্তুত হচ্ছে...")
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const dateStr = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `mbsturu-full-backup-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(true)
      setStatusText("")
    } catch (e: any) {
      setErrMsg(e?.message || "ব্যাকআপ ডাউনলোডে সমস্যা হয়েছে")
    }
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs text-slate-800">
      <div className="border-b pb-3">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Database className="size-5 text-cyan-700" />
          <span>১-ক্লিকে সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON Export)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          সংবাদ, নোটিশ, সদস্য, ক্লাব, পেজ, প্রকাশনা, পোল, যোগাযোগ ও সেটিংসের সব তথ্য একসাথে আপনার ডিভাইসে অফলাইন ব্যাকআপ ফাইল হিসেবে সেভ করুন।
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <HardDrive className="size-4 text-emerald-700" />
          <span>এই ফাইলে যা যা সংরক্ষিত থাকবে:</span>
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-slate-600 list-disc pl-4">
          <li>সকল সংবাদ ও পোস্ট</li>
          <li>ডিজিটাল নোটিশসমূহ</li>
          <li>সদস্য ও প্রোফাইল ডাটা</li>
          <li>ক্যাম্পাস ক্লাব ও কমিটি</li>
          <li>অনুষদ ও বিভাগসমূহ</li>
          <li>কমিউনিটি পেজ ও লেখা</li>
          <li>সদস্যপদ আবেদনসমূহ</li>
          <li>অভিযোগ ও ফিডব্যাক</li>
          <li>নিউজলেটার সাবস্ক্রাইবার</li>
          <li>জরিপ ও পডকাস্ট পর্ব</li>
          <li>সাইটের সকল সেটিংস</li>
        </ul>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={downloadFullBackup}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
      >
        <Download className="size-4" />
        <span>{busy ? statusText || "ব্যাকআপ তৈরি হচ্ছে..." : "সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড করুন (JSON)"}</span>
      </button>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>✅ সম্পূর্ণ ডাটাবেজ ব্যাকআপ ফাইল আপনার ডিভাইসে ডাউনলোড হয়েছে!</span>
        </div>
      )}

      {errMsg && (
        <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          ❌ {errMsg}
        </p>
      )}
    </div>
  )
}
