"use client"

import { useEffect, useState } from "react"
import {
  login, getPosts, createPost, updatePost, deletePost, uploadImage,
  getPendingComments, approveComment, deleteComment,
} from "../../lib/sb"
import type { Post, PendingComment } from "../../lib/sb"

const TOKEN_KEY = "mbstu_admin_token"
const CATS = ["সাধারণ ক্যাম্পাস", "ক্লাব", "স্টুডেন্ট কর্নার", "একাডেমিক", "গবেষণা", "খেলাধুলা", "সংস্কৃতি", "পরিবেশ"]
const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = document.createElement("canvas")
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("ছবি প্রসেস করা যায়নি"))), "image/jpeg", 0.82)
  )
}

export default function AdminPage() {
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tab, setTab] = useState<"posts" | "comments">("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [pending, setPending] = useState<PendingComment[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState(CATS[0])
  const [author, setAuthor] = useState("")
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  function logout() {
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    setToken("")
  }

  function fail(e: unknown) {
    const m = e instanceof Error ? e.message : "কিছু ভুল হয়েছে"
    if (/jwt|expired/i.test(m)) {
      logout()
      setMsg("সেশন শেষ, আবার লগইন করুন")
      return
    }
    setMsg("❌ " + m)
  }

  async function refresh(t: string) {
    try {
      const [p, c] = await Promise.all([getPosts(100), getPendingComments(t)])
      setPosts(p)
      setPending(c)
    } catch (e) { fail(e) }
  }

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY)
      if (t) setToken(t)
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (token) refresh(token)
  }, [token])

  async function onLogin() {
    setBusy(true)
    setMsg("")
    try {
      const t = await login(email.trim(), password)
      try { localStorage.setItem(TOKEN_KEY, t) } catch {}
      setToken(t)
      setPassword("")
    } catch (e) { fail(e) }
    setBusy(false)
  }

  function pick(f: File | null) {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function resetForm() {
    setEditId(null); setTitle(""); setHeading(""); setBody("")
    setCategory(CATS[0]); setAuthor(""); setOldImage(null); pick(null)
  }

  async function submit() {
    if (!title.trim() || !body.trim()) {
      setMsg("শিরোনাম ও ক্যাপশন লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let url = oldImage
      if (file) url = await uploadImage(token, await shrink(file))
      const data = {
        title: title.trim(),
        heading: heading.trim() || null,
        body: body.trim(),
        category,
        author: author.trim() || null,
        image_url: url,
      }
      if (editId) await updatePost(token, editId, data)
      else await createPost(token, data)
      resetForm()
      setMsg("✅ প্রকাশিত হয়েছে")
      await refresh(token)
    } catch (e) { fail(e) }
    setBusy(false)
  }

  function startEdit(p: Post) {
    setEditId(p.id)
    setTitle(p.title)
    setHeading(p.heading || "")
    setBody(p.body || "")
    setCategory(p.category || CATS[0])
    setAuthor(p.author || "")
    setOldImage(p.image_url)
    pick(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function onDelete(id: string) {
    if (!confirm("সত্যিই মুছে ফেলবেন?")) return
    try { await deletePost(token, id); await refresh(token) } catch (e) { fail(e) }
  }

  async function onApprove(id: string) {
    try { await approveComment(token, id); await refresh(token) } catch (e) { fail(e) }
  }

  async function onDeleteComment(id: string) {
    if (!confirm("কমেন্ট মুছবেন?")) return
    try { await deleteComment(token, id); await refresh(token) } catch (e) { fail(e) }
  }

  if (!ready) return null

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-xl font-bold text-green-800">অ্যাডমিন লগইন</h1>
          <input className={inp} type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inp} type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className={btn} onClick={onLogin} disabled={busy}>{busy ? "অপেক্ষা করুন..." : "লগইন"}</button>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-800">অ্যাডমিন ড্যাশবোর্ড</h1>
          <div className="flex gap-3 text-sm">
            <a href="/" className="underline">সাইট</a>
            <button onClick={logout} className="text-red-600">লগআউট</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab("posts")} className={`flex-1 rounded-xl py-2 ${tab === "posts" ? "bg-green-700 text-white" : "bg-white border"}`}>সংবাদ</button>
          <button onClick={() => setTab("comments")} className={`flex-1 rounded-xl py-2 ${tab === "comments" ? "bg-green-700 text-white" : "bg-white border"}`}>কমেন্ট ({pending.length})</button>
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        {tab === "posts" ? (
          <>
            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h2 className="font-semibold">{editId ? "সংবাদ এডিট করুন" : "নতুন সংবাদ"}</h2>
              <input className={inp} placeholder="শিরোনাম (টাইটেল) *" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className={inp} placeholder="হেডিং (উপশিরোনাম)" value={heading} onChange={(e) => setHeading(e.target.value)} />
              <textarea className={inp} rows={6} placeholder="ক্যাপশন / বিস্তারিত লেখা *" value={body} onChange={(e) => setBody(e.target.value)} />
              <select className={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className={inp} placeholder="প্রতিবেদকের নাম" value={author} onChange={(e) => setAuthor(e.target.value)} />
              <label className="block">
                <span className="text-sm text-gray-600">ছবি (গ্যালারি থেকে)</span>
                <input className="block mt-1 text-sm" type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0] || null)} />
              </label>
              {(preview || oldImage) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview || oldImage || ""} alt="" className="w-full max-h-60 object-cover rounded-xl" />
              )}
              <button className={btn} onClick={submit} disabled={busy}>
                {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "প্রকাশ করুন"}
              </button>
              {editId && <button onClick={resetForm} className="w-full text-sm underline">বাতিল</button>}
            </div>

            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow p-3 flex gap-3">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString("bn-BD")}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <button onClick={() => startEdit(p)} className="text-green-700">এডিট</button>
                      <button onClick={() => onDelete(p.id)} className="text-red-600">ডিলিট</button>
                    </div>
                  </div>
                </div>
              ))}
              {posts.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো সংবাদ নেই।</p>}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow p-4 space-y-2">
                <p className="text-xs text-gray-500">সংবাদ: {c.posts?.title || "—"}</p>
                <p className="font-semibold">{c.name || "নামহীন"}</p>
                <p className="whitespace-pre-line">{c.message}</p>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => onApprove(c.id)} className="text-green-700">অনুমোদন</button>
                  <button onClick={() => onDeleteComment(c.id)} className="text-red-600">মুছুন</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-gray-500">অপেক্ষমাণ কোনো কমেন্ট নেই।</p>}
          </div>
        )}
      </div>
    </main>
  )
}
