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
} from "../../lib/sb"

const btn =
  "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50 hover:bg-green-800 transition-all shadow-md cursor-pointer text-sm"

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

  // বিশ্ববিদ্যালয় লোগো, ফাইল, লিংক ও টেক্সট স্টেট
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [univLogo, setUnivLogo] = useState("")
  const [univLink, setUnivLink] = useState("")
  const [univText, setUnivText] = useState("")
  const [univBusy, setUnivBusy] = useState(false)
  const [univMsg, setUnivMsg] = useState("")

  const fixed = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const names = [...fixed, ...cats.filter((c) => !fixed.includes(c))]

  // ডাটাবেজের app_config টেবিলে নিরাপদে সেভ করার ফাংশন (যেখানে updated_at নেই)
  async function saveConfigData(keyName: string, val: string) {
    const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ key: keyName, value: val }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || "সংরক্ষণ করা যায়নি")
    }
  }

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

  // ১. শুধুমাত্র বিশ্ববিদ্যালয়ের তথ্য ও লোগো আপডেট করার ফাংশন
  async function saveUnivInfo() {
    setUnivBusy(true)
    setUnivMsg("")
    try {
      let finalLogo = univLogo

      // ফাইল সিলেক্ট করা থাকলে তা হাই-কোয়ালিটিতে সরাসরি আপলোড করা
      if (logoFile) {
        setUnivMsg("লোগো ফাইল আপলোড হচ্ছে, অপেক্ষা করুন...")
        const ext = (logoFile.name.split(".").pop() || "png").toLowerCase()
        const name = `univ-logo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`

        const res = await fetch(`${SB_URL}/storage/v1/object/post-images/${name}`, {
          method: "POST",
          headers: {
            apikey: SB_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": logoFile.type || "image/png",
          },
          body: logoFile,
        })

        if (!res.ok) throw new Error("লোগো আপলোড ব্যর্থ হয়েছে")
        finalLogo = `${SB_URL}/storage/v1/object/public/post-images/${name}`
        setUnivLogo(finalLogo)
        setLogoFile(null)
      }

      // নিরাপদে শুধুমাত্র key ও value সেভ করা
      await Promise.all([
        saveConfigData("univ_logo_url", finalLogo.trim()),
        saveConfigData("univ_link_url", univLink.trim()),
        saveConfigData("univ_text", univText.trim()),
      ])

      setUnivMsg("✅ বিশ্ববিদ্যালয়ের তথ্য সফলভাবে আপডেট হয়েছে! হোমপেজ রিফ্রেশ করে দেখুন।")
    } catch (e) {
      setUnivMsg("❌ " + (e instanceof Error ? e.message : "আপডেট ব্যর্থ হয়েছে"))
    }
    setUnivBusy(false)
  }

  // ২. সব সেকশন লিমিট সেভ করার ফাংশন
  async function saveAll() {
    setBusy(true)
    setMsg("")
    try {
      await Promise.all(names.map((n) => saveLimit(token, limitKey(n), get(n))))
      setMsg("✅ সব সেকশনের খবর সংখ্যা সেভ হয়েছে।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  // লোগোর বর্তমান প্রিভিউ URL
  const previewUrl = logoFile ? URL.createObjectURL(logoFile) : univLogo

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-5 max-w-xl mx-auto">
      <div>
        <h2 className="font-bold text-lg text-green-800">হোম পেজ ও বিশ্ববিদ্যালয় সেটিংস</h2>
        <p className="text-xs text-gray-500">
          হেডারের বিশ্ববিদ্যালয় লোগো ও সেকশনগুলোর খবর সংখ্যা এখান থেকে পরিবর্তন করুন।
        </p>
      </div>

      {/* ==================== ১. বিশ্ববিদ্যালয় লোগো ও লিংক বক্স ==================== */}
      <div className="rounded-2xl border-2 border-green-600/30 bg-green-50/50 p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-green-200 pb-2">
          <p className="text-xs font-bold text-green-900 flex items-center gap-1.5">
            🏛️ বিশ্ববিদ্যালয় লোগো, ওয়েবসাইট লিংক ও টেক্সট:
          </p>
        </div>

        {/* ফাইল আপলোড অপশন (মোবাইল ও কম্পিউটারের গ্যালারি/ফাইলস থেকে) */}
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
            📁 মোবাইলের ফাইল বা গ্যালারি থেকে লোগো বাছাই করুন (High-Quality PNG, JPG, WEBP, SVG):
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setLogoFile(f)
            }}
            className="w-full text-xs text-gray-600 file:mr-2.5 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-700 file:text-white hover:file:bg-green-800 file:cursor-pointer border border-green-300 rounded-xl bg-white p-1"
          />
        </div>

        {/* বর্তমান লোগোর লাইভ প্রিভিউ */}
        {previewUrl && (
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Logo preview"
                className="size-11 object-contain rounded-full border p-1 bg-white shadow-sm"
                onError={(e) => ((e.target as HTMLElement).style.display = "none")}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {logoFile ? `নতুন ফাইল: ${logoFile.name}` : "বর্তমান সেভ করা লোগো"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : "সরাসরি হেডারে দৃশ্যমান"}
                </p>
              </div>
            </div>
            {logoFile && (
              <button
                type="button"
                onClick={() => setLogoFile(null)}
                className="text-[11px] text-red-600 font-bold hover:underline shrink-0"
              >
                ✕ বাতিল
              </button>
            )}
          </div>
        )}

        {/* ওয়েবসাইট লিংক ইনপুট */}
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1">
            🔗 লোগোতে ক্লিক করলে যে ওয়েবসাইটে যাবে (Website Link):
          </label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-green-600"
            placeholder="যেমন: https://mbstu.ac.bd"
            value={univLink}
            onChange={(e) => setUnivLink(e.target.value)}
          />
        </div>

        {/* ঐচ্ছিক টেক্সট বক্স */}
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1">
            ✍️ লোগোর ডানপাশের লেখা (ঐচ্ছিক):
          </label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-green-600"
            placeholder="যেমন: মাভাবিপ্রবি / MBSTU (ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে হাইড থাকবে)"
            value={univText}
            onChange={(e) => setUnivText(e.target.value)}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            💡 এই বক্সে কিছু না লিখলে তা সম্পূর্ণ হাইড থাকবে এবং এক পিক্সেল জায়গাও নিবে না।
          </p>
        </div>

        {/* ডেডিকেটেড আপডেট বাটন */}
        <button
          type="button"
          onClick={saveUnivInfo}
          disabled={univBusy}
          className="w-full bg-green-700 hover:bg-green-800 active:scale-[0.99] text-white rounded-xl py-2.5 font-bold text-xs transition-all disabled:opacity-50 shadow cursor-pointer"
        >
          {univBusy ? "আপডেট হচ্ছে, অপেক্ষা করুন..." : "🏛️ বিশ্ববিদ্যালয়ের তথ্য আপডেট করুন"}
        </button>

        {/* আপডেট মেসেজ */}
        {univMsg && (
          <p className="text-xs font-bold text-center text-green-800 bg-green-100/80 p-2.5 rounded-xl border border-green-300">
            {univMsg}
          </p>
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
        {busy ? "সেভ হচ্ছে, অপেক্ষা করুন..." : "খবরের সংখ্যা সেটিংস সেভ করুন"}
      </button>

      {msg && (
        <p className="text-sm font-semibold text-center text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
          {msg}
        </p>
      )}
    </div>
  )
}
