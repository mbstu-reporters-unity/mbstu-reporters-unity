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

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [univLogo, setUnivLogo] = useState("")
  const [univLink, setUnivLink] = useState("")
  const [univText, setUnivText] = useState("")
  const [photoClickMode, setPhotoClickMode] = useState<"lightbox" | "album">("lightbox")
  const [univBusy, setUnivBusy] = useState(false)
  const [univMsg, setUnivMsg] = useState("")

  const fixed = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const names = [...fixed, ...cats.filter((c) => !fixed.includes(c))]

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
    getLimits().then(setVals)

    fetch(
      `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(univ_logo_url,univ_link_url,univ_text,photo_click_mode)`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
      .then((res) => res.json())
      .then((rows) => {
        if (Array.isArray(rows)) {
          rows.forEach((r) => {
            if (r.key === "univ_logo_url") setUnivLogo(r.value || "")
            if (r.key === "univ_link_url") setUnivLink(r.value || "")
            if (r.key === "univ_text") setUnivText(r.value || "")
            if (r.key === "photo_click_mode" && (r.value === "album" || r.value === "lightbox")) {
              setPhotoClickMode(r.value)
            }
          })
        }
      })
      .catch(() => {})
  }, [])

  const get = (n: string) => vals[limitKey(n)] ?? 12
  const set = (n: string, v: number) =>
    setVals((o) => ({ ...o, [limitKey(n)]: Math.max(1, Math.min(500, v || 1)) }))

  async function saveUnivInfo() {
    setUnivBusy(true)
    setUnivMsg("")
    try {
      let finalLogo = univLogo

      if (logoFile) {
        setUnivMsg("লোগো ফাইল আপলোড হচ্ছে...")
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

      await Promise.all([
        saveConfigData("univ_logo_url", finalLogo.trim()),
        saveConfigData("univ_link_url", univLink.trim()),
        saveConfigData("univ_text", univText.trim()),
      ])

      setUnivMsg("✅ বিশ্ববিদ্যালয়ের তথ্য সফলভাবে আপডেট হয়েছে!")
    } catch (e) {
      setUnivMsg("❌ " + (e instanceof Error ? e.message : "আপডেট ব্যর্থ হয়েছে"))
    }
    setUnivBusy(false)
  }

  async function saveAll() {
    setBusy(true)
    setMsg("")
    try {
      await Promise.all([
        ...names.map((n) => saveLimit(token, limitKey(n), get(n))),
        saveConfigData("photo_click_mode", photoClickMode),
      ])
      setMsg("✅ সব সেটিংস সফলভাবে সেভ হয়েছে।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  const previewUrl = logoFile ? URL.createObjectURL(logoFile) : univLogo

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-5 text-slate-800">
      <div>
        <h2 className="font-bold text-base text-slate-800">হোম পেজ ও বিশ্ববিদ্যালয় সেটিংস</h2>
        <p className="text-xs text-slate-500">
          হেডারের বিশ্ববিদ্যালয় লোগো, ছবির ভিউ মোড ও সেকশনগুলোর খবর সংখ্যা এখান থেকে পরিবর্তন করুন।
        </p>
      </div>

      {/* বিশ্ববিদ্যালয় লোগো ও লিংক বক্স */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700">
          🏛️ বিশ্ববিদ্যালয় লোগো, ওয়েবসাইট লিংক ও টেক্সট:
        </p>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            📁 মোবাইলের ফাইল থেকে লোগো বাছাই করুন (PNG, JPG, WEBP, SVG):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setLogoFile(f)
            }}
            className="w-full text-xs text-slate-600 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-700 file:text-white hover:file:bg-cyan-800 border border-slate-300 rounded-xl bg-white p-1 cursor-pointer"
          />
        </div>

        {previewUrl && (
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Logo preview"
                className="size-10 object-cover rounded-full ring-2 ring-cyan-500/50"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {logoFile ? logoFile.name : "বর্তমান বিশ্ববিদ্যালয় লোগো"}
                </p>
              </div>
            </div>
            {logoFile && (
              <button type="button" onClick={() => setLogoFile(null)} className="text-[11px] text-rose-600 font-bold hover:underline">
                ✕ বাতিল
              </button>
            )}
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            🔗 লোগোতে ক্লিক করলে যে ওয়েবসাইটে যাবে (Website Link):
          </label>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:border-cyan-600"
            placeholder="যেমন: https://mbstu.ac.bd"
            value={univLink}
            onChange={(e) => setUnivLink(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            ✍️ লোগোর ডানপাশের লেখা (ঐচ্ছিক):
          </label>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:border-cyan-600"
            placeholder="যেমন: মাভাবিপ্রবি / MBSTU"
            value={univText}
            onChange={(e) => setUnivText(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={saveUnivInfo}
          disabled={univBusy}
          className="w-full bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl py-2 font-bold text-xs transition disabled:opacity-50 shadow cursor-pointer"
        >
          {univBusy ? "আপডেট হচ্ছে..." : "🏛️ বিশ্ববিদ্যালয়ের তথ্য আপডেট করুন"}
        </button>

        {univMsg && (
          <p className="text-xs font-bold text-center text-cyan-900 bg-cyan-100 p-2 rounded-xl border border-cyan-200">
            {univMsg}
          </p>
        )}
      </div>

      {/* ছবিতে ক্লিক ভিউ মোড (সবার জন্য ডিফল্ট) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
        <p className="text-xs font-bold text-slate-700">
          🖼️ ছবিতে ক্লিক করলে ভিউ মোড (ডিফল্ট):
        </p>
        <p className="text-[11px] text-slate-500">
          পাঠক হোমপেজে ছবিতে ক্লিক করলে ক্যাপশন, ফটো ক্রেডিট ও তারিখ কীভাবে দেখবে তা নির্বাচন করুন (পোস্টের ভেতর আলাদাভাবেও পরিবর্তন করা যাবে)।
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPhotoClickMode("lightbox")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              photoClickMode === "lightbox"
                ? "bg-cyan-700 text-white border-cyan-700 font-bold shadow"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span className="block">৩ নং ছবির মতো: স্লাইড লাইটবক্স</span>
            <span className={`text-[10px] block mt-0.5 ${photoClickMode === "lightbox" ? "text-cyan-100" : "text-slate-500"}`}>
              ডানে-বামে স্লাইড + নিচে ক্যাপশন, ক্রেডিট ও তারিখ
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPhotoClickMode("album")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              photoClickMode === "album"
                ? "bg-cyan-700 text-white border-cyan-700 font-bold shadow"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span className="block">২ নং ছবির মতো: ভার্টিকাল অ্যালবাম</span>
            <span className={`text-[10px] block mt-0.5 ${photoClickMode === "album" ? "text-cyan-100" : "text-slate-500"}`}>
              নিচে নিচে সব ছবি + বিবরণ, ক্রেডিট, তারিখ ও জুম বাটন
            </span>
          </button>
        </div>
      </div>

      {/* খবরের সংখ্যা সেটিংস */}
      <div className="space-y-2.5 pt-1">
        <p className="text-xs font-bold text-slate-700">হোম পেজে খবরের সংখ্যা নির্ধারণ:</p>
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
        {busy ? "সেভ হচ্ছে..." : "সব সেটিংস সেভ করুন"}
      </button>

      {msg && (
        <p className="text-xs font-semibold text-center text-cyan-900 bg-cyan-50 p-2.5 rounded-xl border border-cyan-200">
          {msg}
        </p>
      )}
    </div>
  )
}
