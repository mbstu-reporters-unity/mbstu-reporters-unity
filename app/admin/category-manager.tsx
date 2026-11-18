"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllPosts,
} from "../../lib/sb"
import type { CategoryRow } from "../../lib/sb"

const RECOMMENDED_CATEGORIES = [
  "ক্যাম্পাস সংবাদ",
  "একাডেমিক",
  "প্রশাসন",
  "গবেষণা",
  "খেলাধুলা",
  "সংস্কৃতি",
  "শিক্ষার্থীদের সমস্যা",
  "চাকরি ও স্কলারশিপ",
  "অনুসন্ধানী প্রতিবেদন",
  "সাক্ষাৎকার",
  "বিশ্লেষণ",
  "ফিচার",
  "সম্পাদকীয় ও মতামত",
  "ফ্যাক্ট-চেক",
]

export default function CategoryManager({
  token,
  onChanged,
}: {
  token: string
  onChanged: () => Promise<void> | void
}) {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setRows(await getCategories(token))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const missingRecommended = useMemo(() => {
    const existingSet = new Set(rows.map((r) => r.name.normalize("NFC").trim()))
    return RECOMMENDED_CATEGORIES.filter((rc) => !existingSet.has(rc.normalize("NFC")))
  }, [rows])

  async function run(fn: () => Promise<void>, okMsg: string) {
    setBusy(true)
    setMsg("")
    try {
      await fn()
      await load()
      await onChanged()
      setMsg("✅ " + okMsg)
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  function add() {
    const name = window.prompt("নতুন ক্যাটাগরির নাম লিখুন")?.trim()
    if (!name) return
    run(() => addCategory(token, name), "ক্যাটাগরি যোগ হয়েছে")
  }

  async function addAllRecommended() {
    if (missingRecommended.length === 0) return
    setBusy(true)
    setMsg("")
    try {
      for (const rc of missingRecommended) {
        await addCategory(token, rc)
      }
      await load()
      await onChanged()
      setMsg(`✅ ${missingRecommended.length}টি প্রস্তাবিত ক্যাটাগরি যুক্ত হয়েছে`)
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  function rename(c: CategoryRow) {
    const name = window.prompt("নতুন নাম লিখুন", c.name)?.trim()
    if (!name || name === c.name) return
    run(() => updateCategory(token, c.name, { name }), "নাম বদলানো হয়েছে")
  }

  async function remove(c: CategoryRow) {
    if (!confirm(`"${c.name}" ক্যাটাগরি মুছবেন?`)) return
    setBusy(true)
    setMsg("")
    try {
      const posts = await getAllPosts(1000)
      const n = posts.filter((p) => p.category === c.name).length
      if (n > 0) {
        setMsg(`❌ এই ক্যাটাগরিতে ${n}টি পোস্ট আছে, তাই মোছা যাবে না`)
        setBusy(false)
        return
      }
      await deleteCategory(token, c.name)
      await load()
      await onChanged()
      setMsg("✅ মুছে ফেলা হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow p-4 space-y-2">
        <p className="text-sm text-gray-600">
          লুকানো ক্যাটাগরি মডারেটররা দেখবেন না। লক করা ক্যাটাগরিতে মডারেটররা নতুন পোস্ট দিতে পারবেন না (পুরোনো পোস্ট ঠিক থাকবে)।
        </p>
        <button onClick={add} disabled={busy} className="text-sm text-green-700 underline disabled:opacity-50 font-semibold cursor-pointer">
          + নতুন ক্যাটাগরি যোগ করুন
        </button>
      </div>

      {/* ১-ক্লিকে প্রস্তাবিত সাংবাদিকতা ক্যাটাগরি যোগ করার বক্স */}
      {!loading && missingRecommended.length > 0 && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-emerald-950">
                ⚡ সাংবাদিক সমিতির প্রস্তাবিত ক্যাটাগরি ({missingRecommended.length}টি বাকি):
              </p>
              <p className="text-[11px] text-emerald-800">
                নিচের যেকোনো নামের ওপর ট্যাপ করলেই সেটি আপনার সাইটের ক্যাটাগরিতে যুক্ত হয়ে যাবে।
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={addAllRecommended}
              className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              ⚡ সবগুলো একসাথে যোগ করুন
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {missingRecommended.map((rc) => (
              <button
                key={rc}
                type="button"
                disabled={busy}
                onClick={() => run(() => addCategory(token, rc), `"${rc}" ক্যাটাগরি যোগ হয়েছে`)}
                className="rounded-full border border-emerald-300 bg-white hover:bg-emerald-700 hover:text-white text-emerald-900 px-3 py-1 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                + {rc}
              </button>
            ))}
          </div>
        </div>
      )}

      {msg && <p className="text-sm font-semibold">{msg}</p>}
      {loading && <p className="text-sm text-gray-500">লোড হচ্ছে...</p>}

      {/* সকল ক্যাটাগরির তালিকা */}
      {rows.map((c) => (
        <div key={c.name} className="bg-white rounded-2xl shadow p-3 text-sm space-y-2">
          <p className="font-semibold text-base">
            {c.is_hidden ? "🙈 " : ""}
            {c.is_locked ? "🔒 " : ""}
            {c.name}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              disabled={busy}
              onClick={() => rename(c)}
              className="text-green-700 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
            >
              নাম বদলান
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(
                  () => updateCategory(token, c.name, { is_hidden: !c.is_hidden }),
                  c.is_hidden ? "দৃশ্যমান করা হয়েছে" : "লুকানো হয়েছে"
                )
              }
              className="text-amber-600 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
            >
              {c.is_hidden ? "দেখান" : "লুকান"}
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(
                  () => updateCategory(token, c.name, { is_locked: !c.is_locked }),
                  c.is_locked ? "আনলক করা হয়েছে" : "লক করা হয়েছে"
                )
              }
              className="text-blue-600 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
            >
              {c.is_locked ? "আনলক" : "লক"}
            </button>
            <button
              disabled={busy}
              onClick={() => remove(c)}
              className="text-red-600 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
            >
              ডিলিট
            </button>
          </div>
        </div>
      ))}
      {!loading && rows.length === 0 && <p className="text-sm text-gray-500">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>}
    </div>
  )
}
