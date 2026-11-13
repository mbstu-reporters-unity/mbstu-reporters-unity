"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { requestReset, updatePassword } from "../../lib/sb"

const inp = "w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
const btn = "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50 cursor-pointer shadow-md transition active:scale-98"

export default function ResetPage() {
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    if (h.get("type") === "recovery" && h.get("access_token")) {
      setToken(h.get("access_token") as string)
    } else if (h.get("error_description")) {
      setMsg("❌ লিংকটি মেয়াদোত্তীর্ণ বা ব্যবহৃত। আবার ইমেইল দিয়ে লিংক চান।")
    }
  }, [])

  async function sendLink() {
    if (!email.trim()) { setMsg("❌ জিমেইল লিখুন"); return }
    setBusy(true); setMsg("")
    try {
      await requestReset(email.trim(), window.location.origin + "/reset")
      setMsg("✅ ইমেইলে লিংক পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function save() {
    if (pw.length < 6) { setMsg("❌ কমপক্ষে ৬ অক্ষর দিন"); return }
    if (pw !== pw2) { setMsg("❌ দুটি পাসওয়ার্ড মিলছে না"); return }
    setBusy(true); setMsg("")
    try {
      await updatePassword(token, pw)
      setDone(true)
      setMsg("✅ পাসওয়ার্ড বদলানো হয়েছে।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <main className="min-h-screen bg-[#071030] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900/90 shadow-2xl p-6 sm:p-7 space-y-4 backdrop-blur-xl">
        <div className="text-center space-y-1 border-b border-white/10 pb-3">
          <h1 className="text-xl font-serif font-bold text-cyan-300">
            {token ? "নতুন পাসওয়ার্ড দিন" : "পাসওয়ার্ড রিসেট"}
          </h1>
          <p className="text-xs text-white/60">মাভাবিপ্রবি রিপোর্টার্স ইউনিটি পোর্টাল</p>
        </div>

        {!token && !done && (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              নিবন্ধনের জিমেইল দিন। পাসওয়ার্ড রিসেটের লিংক সেখানে পাঠানো হবে।
            </p>
            <input
              className={inp}
              type="email"
              placeholder="জিমেইল লিখুন *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={btn} onClick={sendLink} disabled={busy}>
              {busy ? "অপেক্ষা করুন..." : "রিসেট লিংক পাঠান"}
            </button>
          </>
        )}

        {token && !done && (
          <>
            <input
              className={inp}
              type="password"
              placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <input
              className={inp}
              type="password"
              placeholder="আবার লিখুন"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
            <button className={btn} onClick={save} disabled={busy}>
              {busy ? "অপেক্ষা করুন..." : "পাসওয়ার্ড বদলান"}
            </button>
          </>
        )}

        {msg && (
          <p className={`text-xs text-center font-semibold p-2.5 rounded-xl border ${
            msg.startsWith("✅")
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
              : "bg-rose-500/20 border-rose-400/40 text-rose-300"
          }`}>
            {msg}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <Link href="/" className="text-white/50 hover:text-white transition">
            ← সাইটে ফিরুন
          </Link>
          <Link href="/admin" className="text-cyan-300 hover:underline font-semibold">
            লগইন পাতায় যান →
          </Link>
        </div>
      </div>
    </main>
  )
}
