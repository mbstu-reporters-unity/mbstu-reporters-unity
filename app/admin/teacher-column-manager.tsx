"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Feather,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CalendarDays,
  User,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  SB_URL,
  SB_KEY,
  attachProfileAvatars,
  deletePost,
  removeAllImages,
  setPostHidden,
  type Post,
} from "../../lib/sb"

export default function TeacherColumnManager({ token }: { token: string }) {
  const [list, setList] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/posts?select=*&or=(category.eq.সম্পাদকীয় ও মতামত,author_user_type.eq.teacher)&order=created_at.desc&limit=150`,
        {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      )
      if (res.ok) {
        const rows: Post[] = await res.json()
        const enriched = await attachProfileAvatars(rows)
        setList(enriched)
      } else {
        setList([])
      }
    } catch {
      setList([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleDelete(p: Post) {
    if (!confirm(`"${p.title}" কলামটি স্থায়ীভাবে মুছে ফেলতে চান?`)) return
    setDeletingId(p.id)
    setMsg("")
    try {
      try {
        await removeAllImages(token, "post", p.id)
      } catch {}
      await deletePost(token, p.id)
      setList((prev) => prev.filter((x) => x.id !== p.id))
      setMsg("✅ কলামটি সফলভাবে মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setDeletingId(null)
  }

  async function handleToggleHide(p: Post) {
    try {
      await setPostHidden(token, p.id, !p.hidden)
      setList((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, hidden: !p.hidden } : x))
      )
      setMsg(p.hidden ? "✅ কলামটি দৃশ্যমান করা হয়েছে" : "✅ কলামটি লুকানো হয়েছে")
    } catch {
      setMsg("❌ স্ট্যাটাস পরিবর্তন করা যায়নি")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((p) =>
      [p.title, p.body, p.author, p.page?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [list, search])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Feather className="size-5 text-indigo-600" />
              <span>শিক্ষকদের সম্পাদকীয় ও মতামত কলাম মনিটরিং</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              কোন শিক্ষক কোন পেজে কী কলাম লিখেছেন তা এখান থেকে সরাসরি পর্যবেক্ষণ ও প্রয়োজনবোধে ডিলিট করতে পারবেন।
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600"
            placeholder="শিক্ষকের নাম, কলামের শিরোনাম বা পেজের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-slate-800">
            শিক্ষকদের কলাম তালিকা ({filtered.length}টি)
          </h3>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
            কলাম লোড হচ্ছে...
          </div>
        )}

        {!loading &&
          filtered.map((p, idx) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl shadow-xs border p-4 space-y-3 text-xs ${
                p.hidden ? "bg-amber-50/40 border-amber-300" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="size-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>

                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt=""
                      className="size-14 rounded-xl object-cover border shrink-0 bg-slate-50"
                    />
                  )}

                  <div className="min-w-0 space-y-1">
                    <p className="font-bold text-sm text-slate-900 leading-snug">
                      {p.hidden ? "🙈 " : ""}
                      {p.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <User className="size-3 text-indigo-600" />
                        <span>{p.author || "শিক্ষক"}</span>
                      </span>

                      {p.page && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          📄 {p.page.name}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3 text-slate-400" />
                        <span>{new Date(p.created_at).toLocaleDateString("bn-BD")}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/post/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 font-bold text-indigo-700"
                  >
                    <span>দেখুন</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {p.body && (
                <p className="text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl">
                  {p.body}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold">
                <button
                  type="button"
                  onClick={() => handleToggleHide(p)}
                  className={`inline-flex items-center gap-1 text-xs cursor-pointer ${
                    p.hidden ? "text-emerald-700" : "text-amber-700"
                  } hover:underline`}
                >
                  {p.hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  <span>{p.hidden ? "পাবলিক করুন" : "হাইড করুন"}</span>
                </button>

                <button
                  type="button"
                  disabled={deletingId === p.id}
                  onClick={() => handleDelete(p)}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                  <span>{deletingId === p.id ? "মুছছে..." : "কলামটি মুছুন"}</span>
                </button>
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
            শিক্ষকদের কোনো কলাম পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  )
}
