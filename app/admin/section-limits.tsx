"use client"

import { useEffect, useState } from "react"
import { getLimits, saveLimit, limitKey, CAT_CAMPUS, CAT_CLUB, CAT_STUDENT } from "../../lib/sb"

const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50 hover:bg-green-800 transition-all shadow-md cursor-pointer"
  export default function SectionLimits({ token, cats = [] }: { token: string; cats?: string[] }) {
  const [vals, setVals] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const fixed = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const names = [...fixed, ...cats.filter((c) => !fixed.includes(c))]

  useEffect(() => {
    getLimits().then(setVals)
  }, [])

  const get = (n: string) => vals[limitKey(n)] ?? 12
  const set = (n: string, v: number) =>
    setVals((o) => ({ ...o, [limitKey(n)]: Math.max(1, Math.min(500, v || 1)) }))

  async function saveAll() {
    setBusy(true)
    setMsg("")
    try {
      await Promise.all(names.map((n) => saveLimit(token, limitKey(n), get(n))))
      setMsg("✅ সেভ হয়েছে। হোম পেজ রিফ্রেশ করে দেখুন।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4 max-w-xl mx-auto">
      <h2 className="font-bold text-lg text-green-800">হোম পেজে কতটি করে দেখাবে</h2>
      <p className="text-xs text-gray-500">− / + চেপে বা সংখ্যা লিখে ঠিক করুন, তারপর নিচে সেভ চাপুন। (১ থেকে ৫০০)</p>
      
      <div className="space-y-3">
        {names.map((n) => (
          <div key={n} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
            <span className="text-sm font-medium text-gray-700">
              {n === CAT_STUDENT ? "স্টুডেন্ট কর্নার (মোট কার্ড)" : n === CAT_CLUB ? "সর্বশেষ ক্লাব সংবাদ" : n}
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => set(n, get(n) - 1)} className="w-9 h-9 rounded-xl border text-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">−</button>
              <input
                type="number"
                min={1}
                value={get(n)}
                onChange={(e) => set(n, Number(e.target.value))}
                className="w-16 border rounded-xl py-1.5 text-center text-sm font-semibold text-gray-800"
              />
              <button type="button" onClick={() => set(n, get(n) + 1)} className="w-9 h-9 rounded-xl border text-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">+</button>
            </div>
          </div>
        ))}
      </div>

      <button className={btn} onClick={saveAll} disabled={busy}>
        {busy ? "অপেক্ষা করুন..." : "সেভ করুন"}
      </button>
      {msg && <p className="text-sm font-semibold text-center text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">{msg}</p>}
    </div>
  )
}
