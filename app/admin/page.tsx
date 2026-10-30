"use client"

import { useEffect, useState } from "react"
import {
  login, signUp, getMe, getPosts, createPost, updatePost, deletePost, uploadImage, uploadVideo,
  getPendingComments, approveComment, deleteComment,
  getReporters, approveReporter, removeReporter,
  updateMyProfile,
} from "../../lib/sb"
import type { Post, PendingComment, Profile } from "../../lib/sb"

const TOKEN_KEY = "mbstu_admin_token"
const MAX_VIDEO_MB = 50
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
  const [me, setMe] = useState<Profile | null>(null)
  const [mode, setMode] = useState<"login" | "signup">("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [dept, setDept] = useState("")
  const [batch, setBatch] = useState("")
  const [sid, setSid] = useState("")
  const [phone, setPhone] = useState("")
  const [paper, setPaper] = useState("")

  const [tab, setTab] = useState<"posts" | "comments" | "reporters" | "profile">("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [pending, setPending] = useState<PendingComment[]>([])
  const [waiting, setWaiting] = useState<Profile[]>([])
  const [active, setActive] = useState<Profile[]>([])

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState(CATS[0])
  const [author, setAuthor] = useState("")
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [oldVideo, setOldVideo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const [pName, setPName] = useState("")
  const [pPaper, setPPaper] = useState("")
  const [pDept, setPDept] = useState("")
  const [pBatch, setPBatch] = useState("")
  const [pPhone, setPPhone] = useState("")
  const [pFile, setPFile] = useState<File | null>(null)

  const isAdmin = me?.role === "admin" && me.approved

  useEffect(() => {
    if (me) {
      setPName(me.full_name || "")
      setPPaper(me.newspaper_name || "")
      setPDept(me.department || "")
      setPBatch(me.batch || "")
      setPPhone(me.phone || "")
    }
  }, [me])

  function logout() {
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    setToken("")
    setMe(null)
    setMsg("")
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

  async function refresh(t: string, profile: Profile | null) {
    try {
      const p = await getPosts(100)
      setPosts(p)
      if (profile?.role === "admin" && profile.approved) {
        const [c, w, a] = await Promise.all([
          getPendingComments(t),
          getReporters(t, false),
          getReporters(t, true),
        ])
        setPending(c)
        setWaiting(w)
        setActive(a)
      }
    } catch (e) { fail(e) }
  }

  async function loadMe(t: string) {
    try {
      const p = await getMe(t)
      setMe(p)
      if (p) {
        setAuthor((a) => a || p.full_name)
        await refresh(t, p)
      }
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
    if (token) loadMe(token)
  }, [token])

  async function onLogin() {
    setBusy(true)
    setMsg("")
    try {
      const t = await login(email.trim(), password)
      try { localStorage.setItem(TOKEN_KEY, t) } catch {}
      setToken(t)
      setPassword("")
    } catch (e) {
      const m = e instanceof Error ? e.message : ""
      setMsg(/invalid/i.test(m) ? "❌ ইমেইল বা পাসওয়ার্ড ভুল" : "❌ " + m)
    }
    setBusy(false)
  }

  async function onSignup() {
    if (!paper.trim() || !fullName.trim() || !dept.trim() || !batch.trim() || !sid.trim() || !phone.trim() || !email.trim()) {
      setMsg("❌ সব তথ্য পূরণ করুন")
      return
    }
    if (password.length < 6) {
      setMsg("❌ পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        department: dept.trim(),
        batch: batch.trim(),
        student_id: sid.trim(),
        phone: phone.trim(),
        newspaper_name: paper.trim(),
      })
      setMode("login")
      setPassword("")
      setMsg("✅ নিবন্ধন সম্পন্ন। অ্যাডমিন অনুমোদন দিলে পোস্ট করতে পারবেন। এখন লগইন করুন।")
    } catch (e) { fail(e) }
    setBusy(false)
  }

  async function saveProfile() {
    if (!me) return
    setBusy(true)
    setMsg("")
    try {
      let avatar = me.avatar_url || null
      if (pFile) avatar = await uploadImage(token, await shrink(pFile))
      await updateMyProfile(token, me.id, {
        full_name: pName.trim(),
        newspaper_name: pPaper.trim(),
        department: pDept.trim(),
        batch: pBatch.trim(),
        phone: pPhone.trim(),
        avatar_url: avatar,
      })
      setPFile(null)
      setMsg("✅ প্রোফাইল সেভ হয়েছে")
      await loadMe(token)
    } catch (e) { fail(e) }
    setBusy(false)
  }

  function pick(f: File | null) {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function pickVideo(f: File | null) {
    if (f && f.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না (আপনারটি ${(f.size / 1048576).toFixed(1)} MB)`)
      setVideoFile(null)
      return
    }
    setMsg("")
    setVideoFile(f)
  }

  function resetForm() {
    setEditId(null); setTitle(""); setHeading(""); setBody("")
    setCategory(CATS[0]); setAuthor(me?.full_name || ""); setOldImage(null)
    setOldVideo(null); setVideoFile(null); pick(null)
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

      let vurl = oldVideo
      if (videoFile) {
        setMsg("ভিডিও আপলোড হচ্ছে, অপেক্ষা করুন...")
        vurl = await uploadVideo(token, videoFile)
      }

      const data = {
        title: title.trim(),
        heading: heading.trim() || null,
        body: body.trim(),
        category,
        author: author.trim() || me?.full_name || null,
        image_url: url,
        video_url: vurl,
      }
      if (editId) await updatePost(token, editId, data)
      else await createPost(token, data)
      resetForm()
      setMsg("✅ প্রকাশিত হয়েছে")
      await refresh(token, me)
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
    setOldVideo(p.video_url || null)
    setVideoFile(null)
    pick(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function act(fn: () => Promise<void>, ask?: string) {
    if (ask && !confirm(ask)) return
    try { await fn(); await refresh(token, me) } catch (e) { fail(e) }
  }

  if (!ready) return null

  /* ---------- লগইন / সাইনআপ ---------- */
  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-3">
          <h1 className="text-xl font-bold text-green-800">
            {mode === "login" ? "সাংবাদিক লগইন" : "সাংবাদিক নিবন্ধন"}
          </h1>

          {mode === "signup" && (
            <>
              <input className={inp} placeholder="পূর্ণ নাম *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input className={inp} placeholder="পত্রিকার নাম *" value={paper} onChange={(e) => setPaper(e.target.value)} />
              <input className={inp} placeholder="বিভাগ (যেমন: ইংরেজি) *" value={dept} onChange={(e) => setDept(e.target.value)} />
              <input className={inp} placeholder="ব্যাচ / সেশন (যেমন: ২০২২-২৩) *" value={batch} onChange={(e) => setBatch(e.target.value)} />
              <input className={inp} placeholder="স্টুডেন্ট আইডি *" value={sid} onChange={(e) => setSid(e.target.value)} />
              <input className={inp} type="tel" placeholder="মোবাইল নম্বর *" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </>
          )}

          <input className={inp} type="email" placeholder="জিমেইল *" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inp} type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button className={btn} onClick={mode === "login" ? onLogin : onSignup} disabled={busy}>
            {busy ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন" : "নিবন্ধন করুন"}
          </button>

          <button
            className="w-full text-sm underline text-green-800"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg("") }}
          >
            {mode === "login" ? "নতুন সাংবাদিক? নিবন্ধন করুন" : "আগে নিবন্ধন করেছেন? লগইন করুন"}
          </button>

          {mode === "login" && (
            <a href="/reset" className="block text-center text-sm underline text-green-800">পাসওয়ার্ড ভুলে গেছেন?</a>
          )}
          {msg && <p className="text-sm">{msg}</p>}
          <a href="/" className="block text-center text-sm underline">সাইটে ফিরুন</a>
        </div>
      </main>
    )
  }

  /* ---------- অনুমোদনের অপেক্ষা ---------- */
  if (me && !me.approved) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-3 text-center">
          <h1 className="text-xl font-bold text-green-800">অনুমোদনের অপেক্ষায়</h1>
          <p>{me.full_name}, আপনার নিবন্ধন সম্পন্ন হয়েছে। অ্যাডমিন যাচাই করে অনুমোদন দিলে আপনি পোস্ট করতে পারবেন।</p>
          <button onClick={() => loadMe(token)} className={btn}>আবার দেখুন</button>
          <button onClick={logout} className="text-sm text-red-600 underline">লগআউট</button>
        </div>
      </main>
    )
  }

  if (!me) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p>প্রোফাইল পাওয়া যায়নি।</p>
          {msg && <p className="text-sm">{msg}</p>}
          <button onClick={logout} className="underline text-red-600">লগআউট</button>
        </div>
      </main>
    )
  }

  /* ---------- ড্যাশবোর্ড ---------- */
  const canDelete = (_p: Post) => !!isAdmin || true

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {me.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-xl font-bold text-green-800">ড্যাশবোর্ড</h1>
              <p className="text-xs text-gray-500">{me.full_name} · {isAdmin ? "অ্যাডমিন" : "সাংবাদিক"}</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <a href="/" className="underline">সাইট</a>
            <button onClick={logout} className="text-red-600">লগআউট</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab("posts")} className={`flex-1 rounded-xl py-2 text-sm ${tab === "posts" ? "bg-green-700 text-white" : "bg-white border"}`}>সংবাদ</button>
          <button onClick={() => setTab("profile")} className={`flex-1 rounded-xl py-2 text-sm ${tab === "profile" ? "bg-green-700 text-white" : "bg-white border"}`}>প্রোফাইল</button>
          {isAdmin && (
            <>
              <button onClick={() => setTab("comments")} className={`flex-1 rounded-xl py-2 text-sm ${tab === "comments" ? "bg-green-700 text-white" : "bg-white border"}`}>কমেন্ট ({pending.length})</button>
              <button onClick={() => setTab("reporters")} className={`flex-1 rounded-xl py-2 text-sm ${tab === "reporters" ? "bg-green-700 text-white" : "bg-white border"}`}>সাংবাদিক ({waiting.length})</button>
            </>
          )}
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        {tab === "posts" && (
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

              <label className="block">
                <span className="text-sm text-gray-600">ভিডিও (সর্বোচ্চ {MAX_VIDEO_MB} MB)</span>
                <input className="block mt-1 text-sm" type="file" accept="video/*" onChange={(e) => pickVideo(e.target.files?.[0] || null)} />
              </label>
              {videoFile && (
                <p className="text-xs text-gray-600">
                  {videoFile.name} ({(videoFile.size / 1048576).toFixed(1)} MB)
                </p>
              )}
              {!videoFile && oldVideo && (
                <div className="space-y-1">
                  <video src={oldVideo} controls className="w-full max-h-60 rounded-xl" />
                  <button type="button" onClick={() => setOldVideo(null)} className="text-sm text-red-600">ভিডিও সরান</button>
                </div>
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
                    <p className="text-xs text-gray-500">
                      {p.author} · {new Date(p.created_at).toLocaleDateString("bn-BD")}
                      {p.video_url ? " · 🎥" : ""}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <button onClick={() => startEdit(p)} className="text-green-700">এডিট</button>
                      {canDelete(p) && (
                        <button onClick={() => act(() => deletePost(token, p.id), "সত্যিই মুছে ফেলবেন?")} className="text-red-600">ডিলিট</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {posts.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো সংবাদ নেই।</p>}
            </div>
          </>
        )}

        {tab === "profile" && (
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-semibold">আমার প্রোফাইল</h2>
            {(pFile || me.avatar_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pFile ? URL.createObjectURL(pFile) : me.avatar_url || ""} alt="" className="w-28 h-28 rounded-full object-cover mx-auto" />
            )}
            <label className="block">
              <span className="text-sm text-gray-600">আমার ছবি (গ্যালারি থেকে)</span>
              <input className="block mt-1 text-sm" type="file" accept="image/*" onChange={(e) => setPFile(e.target.files?.[0] || null)} />
            </label>
            <input className={inp} placeholder="পূর্ণ নাম" value={pName} onChange={(e) => setPName(e.target.value)} />
            <input className={inp} placeholder="পত্রিকার নাম" value={pPaper} onChange={(e) => setPPaper(e.target.value)} />
            <input className={inp} placeholder="বিভাগ" value={pDept} onChange={(e) => setPDept(e.target.value)} />
            <input className={inp} placeholder="ব্যাচ" value={pBatch} onChange={(e) => setPBatch(e.target.value)} />
            <input className={inp} type="tel" placeholder="মোবাইল" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
            <button className={btn} onClick={saveProfile} disabled={busy}>{busy ? "অপেক্ষা করুন..." : "সেভ করুন"}</button>
          </div>
        )}

        {tab === "comments" && isAdmin && (
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow p-4 space-y-2">
                <p className="text-xs text-gray-500">সংবাদ: {c.posts?.title || "—"}</p>
                <p className="font-semibold">{c.name || "নামহীন"}</p>
                <p className="whitespace-pre-line">{c.message}</p>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => act(() => approveComment(token, c.id))} className="text-green-700">অনুমোদন</button>
                  <button onClick={() => act(() => deleteComment(token, c.id), "কমেন্ট মুছবেন?")} className="text-red-600">মুছুন</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-gray-500">অপেক্ষমাণ কোনো কমেন্ট নেই।</p>}
          </div>
        )}

        {tab === "reporters" && isAdmin && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h2 className="font-semibold">অনুমোদনের অপেক্ষায়</h2>
              {waiting.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow p-4 space-y-1 text-sm">
                  <p className="font-semibold text-base">{r.full_name}</p>
                  {r.newspaper_name && <p>পত্রিকা: {r.newspaper_name}</p>}
                  <p>বিভাগ: {r.department} · ব্যাচ: {r.batch}</p>
                  <p>আইডি: {r.student_id}</p>
                  <p>মোবাইল: {r.phone}</p>
                  <p>ইমেইল: {r.email}</p>
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => act(() => approveReporter(token, r.id))} className="text-green-700">অনুমোদন</button>
                    <button onClick={() => act(() => removeReporter(token, r.id), "বাতিল করবেন?")} className="text-red-600">বাতিল</button>
                  </div>
                </div>
              ))}
              {waiting.length === 0 && <p className="text-sm text-gray-500">কেউ অপেক্ষায় নেই।</p>}
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold">অনুমোদিত সাংবাদিক ({active.length})</h2>
              {active.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow p-3 text-sm flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    {r.avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-semibold">{r.full_name} {r.role === "admin" && "(অ্যাডমিন)"}</p>
                      <p className="text-gray-500">{r.newspaper_name || r.department} · {r.batch}</p>
                    </div>
                  </div>
                  {r.id !== me.id && (
                    <button onClick={() => act(() => removeReporter(token, r.id), "এই সাংবাদিককে সরাবেন?")} className="text-red-600">সরান</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
