"use client"

import { useEffect, useState } from "react"
import { requestReset, updatePassword } from "../../lib/sb"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-3">
        <h1 className="text-xl font-bold text-green-800">
          {token ? "নতুন পাসওয়ার্ড দিন" : "পাসওয়ার্ড ভুলে গেছেন?"}
        </h1>

        {!token && !done && (
          <>
            <p className="text-sm text-gray-600">নিবন্ধনের জিমেইল দিন। পাসওয়ার্ড রিসেটের লিংক সেখানে যাবে।</p>
            <input className={inp} type="email" placeholder="জিমেইল" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className={btn} onClick={sendLink} disabled={busy}>{busy ? "অপেক্ষা করুন..." : "লিংক পাঠান"}</button>
          </>
        )}

        {token && !done && (
          <>
            <input className={inp} type="password" placeholder="নতুন পাসওয়ার্ড" value={pw} onChange={(e) => setPw(e.target.value)} />
            <input className={inp} type="password" placeholder="আবার লিখুন" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <button className={btn} onClick={save} disabled={busy}>{busy ? "অপেক্ষা করুন..." : "পাসওয়ার্ড বদলান"}</button>
          </>
        )}

        {msg && <p className="text-sm">{msg}</p>}
        <a href="/admin" className="block text-center text-sm underline text-green-800">লগইন পাতায় যান</a>
      </div>
    </main>
  )
}
