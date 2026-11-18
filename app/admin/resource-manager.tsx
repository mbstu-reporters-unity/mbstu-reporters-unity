"use client"

import React, { useEffect, useState } from "react"
import {
  BookOpen,
  Trash2,
  Edit3,
  PlusCircle,
  ExternalLink,
  X,
  Upload,
} from "lucide-react"
import {
  getResourcesList,
  saveResourcesList,
  RESOURCE_CATEGORIES,
  type ResourceItem,
} from "../../lib/resources"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const btnPrimary =
  "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-sm transition"

export default function ResourceManager({ token }: { token: string }) {
  const [list, setList] = useState<ResourceItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [category, setCategory] = useState<string>(RESOURCE_CATEGORIES[0])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [author, setAuthor] = useState("MBSTURU রিসোর্স ডেস্ক")

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    const rows = await getResourcesList()
    setList(rows)
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setEditId(null)
    setCategory(RESOURCE_CATEGORIES[0])
    setTitle("")
    setDescription("")
    setExternalUrl("")
    setAuthor("MBSTURU রিসোর্স ডেস্ক")
  }

  function startEdit(item: ResourceItem) {
    setEditId(item.id)
    setCategory(item.category || RESOURCE_CATEGORIES[0])
    setTitle(item.title)
    setDescription(item.description)
    setExternalUrl(item.external_url || item.file_url || "")
    setAuthor(item.author_or_source || "MBSTURU রিসোর্স ডেস্ক")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      setMsg("❌ শিরোনাম এবং বিবরণ লিখুন")
      return
    }
    const cleanUrl = externalUrl.trim()
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      setMsg("❌ লিংক অবশ্যই https:// দিয়ে শুরু হতে হবে")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      const nextItem: ResourceItem = {
        id: editId || `res-${Date.now()}`,
        category,
        title: title.trim(),
        description: description.trim(),
        external_url: cleanUrl || null,
        file_url: null,
        author_or_source: author.trim() || null,
        sort_order: editId
          ? list.find((x) => x.id === editId)?.sort_order || 10
          : list.length ? Math.max(...list.map((x) => x.sort_order)) + 10 : 10,
        created_at: editId
          ? list.find((x) => x.id === editId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      }

      const nextList = editId
        ? list.map((x) => (x.id === editId ? nextItem : x))
        : [nextItem, ...list]

      await saveResourcesList(token, nextList)
      setList(nextList)
      resetForm()
      setMsg("✅ রিসোর্স সফলভাবে সংরক্ষণ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  async function handleDelete(item: ResourceItem) {
    if (!confirm(`"${item.title}" রিসোর্সটি মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      const next = list.filter((x) => x.id !== item.id)
      await saveResourcesList(token, next)
      setList(next)
      if (editId === item.id) resetForm()
      setMsg("✅ রিসোর্স মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-700" />
            <span>{editId ? "✏️ রিসোর্স এডিট করুন" : "➕ নতুন রিসোর্স বা গাইডলাইন যুক্ত করুন"}</span>
          </h2>
          <div className="flex items-center gap-2">
            <a
              href="/resources"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-cyan-700 hover:underline inline-flex items-center gap-1"
            >
              <span>লাইভ</span>
              <ExternalLink className="size-3" />
            </a>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <X className="size-3.5" /> বাতিল
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">ক্যাটাগরি:</label>
          <select
            className={inp}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <input
          className={inp}
          placeholder="রিসোর্সের শিরোনাম *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={inp}
          rows={3}
          placeholder="বিস্তারিত বিবরণ *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className={inp}
          placeholder="ডাউনলোড বা ওয়েবসাইট লিংক (https://... ঐচ্ছিক)"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
        />
        <input
          className={inp}
          placeholder="লেখক বা উৎস (যেমন: MBSTURU রিসোর্স ডেস্ক)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <button className={btnPrimary} onClick={handleSave} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "রিসোর্স আপডেট করুন" : "➕ রিসোর্স সংরক্ষণ করুন"}
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-800 px-1">
          বর্তমান রিসোর্সসমূহ ({list.length}টি)
        </h3>
        {list.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                  {item.category}
                </span>
                <p className="font-bold text-sm text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-600 line-clamp-1">{item.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2 font-bold">
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
              >
                <Edit3 className="size-3" /> এডিট
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="size-3" /> মুছুন
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
