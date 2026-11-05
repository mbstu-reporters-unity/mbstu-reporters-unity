"use client"

import { useEffect, useState } from "react"
import {
  getLimits,
  saveLimit,
  limitKey,
  CAT_CAMPUS,
  CAT_CLUB,
  CAT_STUDENT,
  SB_URL,
  SB_KEY,
  saveSectionText,
} from "../../lib/sb"

const btn =
  "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50 hover:bg-green-800 transition-all shadow-md cursor-pointer"

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

  // বিশ্ববিদ্যালয় লোগো, লিংক ও টেক্সট স্টেট
  const [univLogo, setUnivLogo] = useState("")
  const [univLink, setUnivLink] = useState("")
  const [univText, setUnivText] = useState("")

  const fixed = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const names = [...fixed, ...cats.filter((c) => !fixed.includes(c))]

  useEffect(() => {
    // সেকশন লিমিট লোড
    getLimits().then(setVals)

    // ডাটাবেজ থেকে বিশ্ববিদ্যালয় লোগো, লিংক ও টেক্সট লোড
    fetch(
      `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(univ_logo_url,univ_link_url,univ_text)`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
      .then((res) => res.json())
      .then((rows) => {
        if (Array.isArray(rows)) {
          rows.forEach((r) => {
            if (r.key === "univ_logo_url") setUnivLogo(r.value || "")
            if (r.key === "univ_link_url") setUnivLink(r.value || "")
            if (r.key === "univ_text") setUnivText(r.value || "")
          })
        }
      })
      .catch(() => {})
  }, [])

  const get = (n: string) => vals[limitKey(n)] ?? 12
  const set = (n: string, v: number) =>
    setVals((o) => ({ ...o, [limitKey(n)]: Math.max(1, Math.min(500, v || 1)) }))

  async function saveAll() {
    setBusy(true)
    setMsg("")
    try {
      await Promise.all([
        ...names.map((n) => saveLimit(token, limitKey(n), get(n))),
        saveSectionText(token, "univ_logo_url", univLogo.trim()),
        saveSectionText(token, "univ_link_url", univLink.trim()),
        saveSectionText(token, "univ_text", univText.trim()),
      ])
      setMsg("✅ সব তথ্য সফলভাবে সেভ হয়েছে। হোম পেজ রিফ্রেশ করে দেখুন।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4 max-w-xl mx-auto">
      <h2 className="font-bold text-lg text-green-800">হোম পেজ ও বিশ্ববিদ্যালয় সেটিংস</h2>
      <p className="text-xs text-gray-500">
        সেকশনের খবর সংখ্যা ও হেডারের বিশ্ববিদ্যালয় লোগো-লিংক এখান থেকে পরিবর্তন করুন।
      </p>

      {/* ==================== ১. বিশ্ববিদ্যালয় লোগো, লিংক ও ঐচ্ছিক লেখা ==================== */}
      <div className="rounded-xl border border-green-200 bg-green-50/60 p-3.5 space-y-3">
        <p className="text-xs font-bold text-green-900">
          🏛️ বিশ্ববিদ্যালয় লোগো, ওয়েবসাইট লিংক ও টেক্সট বক্স:
        </p>

        <div>
          <label className="text-[11px] font-semibold text-gray-600 block mb-1">
            লোগোর ছবির লিংক (Image URL):
          </label>
          <input
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-green-600"
            placeholder="যেমন: https://mbstu.ac.bd/images/logo.png"
            value={univLogo}
            onChange={(e) => setUnivLogo(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-600 block mb-1">
            ক্লিক করলে যে ওয়েবসাইটে যাবে (Website Link):
          </label>
          <input
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-green-600"
            placeholder="যেমন: https://mbstu.ac.bd"
            value={univLink}
            onChange={(e) => setUnivLink(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-600 block mb-1">
            লোগোর ডানপাশের লেখা (ঐচ্ছিক):
          </label>
          <input
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-green-600"
            placeholder="যেমন: মাভাবিপ্রবি / MBSTU (ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে হাইড থাকবে)"
            value={univText}
            onChange={(e) => setUnivText(e.target.value)}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            💡 এই বক্সে কিছু না লিখলে তা সম্পূর্ণ হাইড থাকবে এবং এক পিক্সেল জায়গাও নিবে না।
          </p>
        </div>

        {/* লাইভ প্রিভিউ */}
        {(univLogo || univText) && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-green-300 text-xs">
            <span className="text-[10px] text-gray-500 font-semibold">হেডারে যেমন দেখাবে:</span>
            {univLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={univLogo}
                alt="Logo preview"
                className="size-7 object-contain rounded-full border p-0.5 bg-white"
                onError={(e) => ((e.target as HTMLElement).style.display = "none")}
              />
            )}
            {univText && (
              <span className="font-bold text-gray-800 text-xs truncate max-w-[150px]">
                {univText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ==================== ২. হোম পেজে কতটি করে পোস্ট দেখাবে ==================== */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-bold text-gray-700">খবর প্রদর্শনের সংখ্যা নির্ধারণ:</p>
        {names.map((n) => (
          <div
            key={n}
            className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2"
          >
            <span className="text-sm font-medium text-gray-700">
              {n === CAT_STUDENT
                ? "স্টুডেন্ট কর্নার (মোট কার্ড)"
                : n === CAT_CLUB
                ? "সর্বশেষ ক্লাব সংবাদ"
                : n}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => set(n, get(n) - 1)}
                className="w-9 h-9 rounded-xl border text-lg bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-center font-bold"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={get(n)}
                onChange={(e) => set(n, Number(e.target.value))}
                className="w-16 border rounded-xl py-1.5 text-center text-sm font-semibold text-gray-800"
              />
              <button
                type="button"
                onClick={() => set(n, get(n) + 1)}
                className="w-9 h-9 rounded-xl border text-lg bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={btn} onClick={saveAll} disabled={busy}>
        {busy ? "সেভ হচ্ছে, অপেক্ষা করুন..." : "সব পরিবর্তন সেভ করুন"}
      </button>

      {msg && (
        <p className="text-sm font-semibold text-center text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
          {msg}
        </p>
      )}
    </div>
  )
}
