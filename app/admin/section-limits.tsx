"use client"

import { useEffect, useState } from "react"
import {
  getLimits,
  saveLimit,
  limitKey,
  CAT_CAMPUS,
  CAT_CLUB,
  CAT_STUDENT,
} from "../../lib/sb"

const btn =
  "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl py-3 font-bold disabled:opacity-50 transition-all shadow-md cursor-pointer text-sm active:scale-98"

export default function SectionLimits({
  token,
  cats = [],
}: {
  token: string
  cats?: string[]
}) {
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
      setMsg("✅ সংবাদ ও ক্যাটাগরি সংখ্যা সফলভাবে সেভ হয়েছে।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-5 text-slate-800">
      <div>
        <h2 className="font-bold text-base text-slate-800">সংবাদ ও ক্যাটাগরি সংখ্যা</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          হোমপেজের প্রতিটি সংবাদ ও ক্যাটাগরি সেকশনে সর্বোচ্চ কয়টি পোস্ট দেখাবে তা এখান থেকে নির্ধারণ করুন। (লোগো ও অন্যান্য সাইট সেটিংস পাবেন “সাইট সেটিংস” কর্নারে।)
        </p>
      </div>

      <div className="space-y-2.5 pt-1">
        {names.map((n) => (
          <div key={n} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <span className="text-xs font-medium text-slate-700">
              {n === CAT_STUDENT ? "স্টুডেন্ট কর্নার" : n === CAT_CLUB ? "সর্বশেষ ক্লাব সংবাদ" : n}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => set(n, get(n) - 1)}
                className="size-7 rounded-lg border text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-center font-bold"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={get(n)}
                onChange={(e) => set(n, Number(e.target.value))}
                className="w-14 border rounded-lg py-1 text-center text-xs font-semibold text-slate-800"
              />
              <button
                type="button"
                onClick={() => set(n, get(n) + 1)}
                className="size-7 rounded-lg border text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={btn} onClick={saveAll} disabled={busy}>
        {busy ? "সেভ হচ্ছে..." : "সংখ্যা সেটিংস সেভ করুন"}
      </button>

      {msg && (
        <p className="text-xs font-semibold text-center text-cyan-900 bg-cyan-50 p-2.5 rounded-xl border border-cyan-200">
          {msg}
        </p>
      )}
    </div>
  )
}
