"use client"

import { useEffect, useState } from "react"
import {
  login, signUp, getMe, getAllPosts, setPostHidden, getCategoryNames, getHomeLimit, updatePost, deletePost, uploadImage, uploadVideo,
  getPendingComments, approveComment, deleteComment,
  getReporters, approveReporter, removeReporter,
  updateMyProfile,
  createPostReturningId, removeAllImages,
} from "../../lib/sb"
import type { Post, PendingComment, Profile } from "../../lib/sb"
import { getCampusClubs, type ClubItem } from "../../lib/clubs"
import { getCommunityPages, type CommunityPage } from "../../lib/pages"
import LeadershipManager from "./leadership-manager"
import NoticeManager from "./notice-manager"
import HeroManager from "./hero-manager"
import HeroBannerManager from "./hero-banner-manager"
import TickerManager from "./ticker-manager"
import StudentManager from "./student-manager"
import SectionLimits from "./section-limits"
import DirectorManager from "./director-manager"
import CategoryManager from "./category-manager"
import ClubManager from "./club-manager"
import FacultyManager from "./faculty-manager"
import AssociationManager from "./association-manager"
import SocialSiteManager from "./social-site-manager"
import AdministrationManager from "./administration-manager"
import CommunityPageManager from "./community-page-manager"
import ImageSection, { useImageSection } from "../../components/portal/image-section"

const TOKEN_KEY = "mbstu_admin_token"
const MAX_VIDEO_MB = 50
const CATS = ["ক্যাম্পাস সংবাদ", "ক্লাব", "একাডেমিক", "গবেষণা", "খেলাধুলা", "সংস্কৃতি", "পরিবেশ"]
const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const smallInp = "w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

type Tab =
  | "posts" | "comments" | "reporters" | "profile" | "leaders" | "notices"
  | "hero" | "hero_banner" | "ticker" | "students" | "limits" | "directors" | "categories" 
  | "clubs" | "faculties" | "associations" | "social_sites" | "administration"
  | "community_pages"

export type PostMediaItem = {
  id?: string
  title: string
  subtitle: string
  description: string
  date: string
  caption: string
  url: string
}

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

  const [tab, setTab] = useState<Tab>("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [pending, setPending] = useState<PendingComment[]>([])
  const [waiting, setWaiting] = useState<Profile[]>([])
  const [active, setActive] = useState<Profile[]>([])
  const [availableClubs, setAvailableClubs] = useState<ClubItem[]>([])
  const [communityPages, setCommunityPages] = useState<CommunityPage[]>([])

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState(CATS[0])
  const [selectedClubId, setSelectedClubId] = useState("")
  const [selectedPageId, setSelectedPageId] = useState("")
  const [author, setAuthor] = useState("")
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [oldVideo, setOldVideo] = useState<string | null>(null)

  const [mediaItems, setMediaItems] = useState<PostMediaItem[]>([])

  const [busy, setBusy] = useState(false)
  const [cats, setCats] = useState<string[]>(CATS)
  const [linkUrl, setLinkUrl] = useState("")
  const [homeLimit, setHomeLimit] = useState("12")
  const [msg, setMsg] = useState("")

  const imgs = useImageSection("post")

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
    if (/jwt|expired|claim|exp/i.test(m)) {
      logout()
      setMsg("সেশন শেষ, আবার লগইন করুন")
      return
    }
    setMsg("❌ " + m)
  }

  async function refresh(t: string, profile: Profile | null) {
    try {
      const p = await getAllPosts(100)
      setPosts(p)
      const names = await getCategoryNames()
      if (names.length) setCats(names)
      setHomeLimit(String(await getHomeLimit()))
      
      const clubs = await getCampusClubs(t)
      setAvailableClubs(clubs)

      const pages = await getCommunityPages()
      setCommunityPages(pages)

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

  function pickVideo(f: File | null) {
    if (f && f.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না`)
      setVideoFile(null)
      return
    }
    setMsg("")
    setVideoFile(f)
  }

  function addMediaItem() {
    setMediaItems([
      ...mediaItems,
      {
        id: `media_${Date.now()}`,
        title: "",
        subtitle: "",
        description: "",
        date: new Date().toLocaleDateString("bn-BD"),
        caption: "",
        url: "",
      },
    ])
  }

  function updateMediaItem(index: number, field: keyof PostMediaItem, val: string) {
    const updated = [...mediaItems]
    updated[index] = { ...updated[index], [field]: val }
    setMediaItems(updated)
  }

  function removeMediaItem(index: number) {
    setMediaItems(mediaItems.filter((_, i) => i !== index))
  }

  async function uploadMediaFile(index: number, file: File) {
    setBusy(true)
    setMsg("মিডিয়া ফাইল আপলোড হচ্ছে...")
    try {
      let uploadedUrl = ""
      if (file.type.startsWith("video/")) {
        uploadedUrl = await uploadVideo(token, file)
      } else {
        uploadedUrl = await uploadImage(token, await shrink(file))
      }
      updateMediaItem(index, "url", uploadedUrl)
      setMsg("✅ ফাইল আপলোড সম্পন্ন হয়েছে")
    } catch (e) {
      setMsg("❌ ফাইল আপলোড ব্যর্থ হয়েছে: " + (e instanceof Error ? e.message : ""))
    }
    setBusy(false)
  }

  function resetForm() {
    setLinkUrl("")
    setMediaItems([])
    setEditId(null); setTitle(""); setHeading(""); setBody("")
    setCategory(CATS[0]); setSelectedClubId(""); setSelectedPageId(""); setAuthor(me?.full_name || ""); setOldImage(null)
    setOldVideo(null); setVideoFile(null)
    imgs.reset()
  }

  async function submit() {
    if (!title.trim() || !body.trim()) {
      setMsg("শিরোনাম ও ক্যাপশন লিখুন")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      const up = await imgs.uploadNew(token, shrink, (i, n) => setMsg(`ছবি আপলোড হচ্ছে (${i}/${n})...`))

      let vurl = oldVideo
      if (videoFile) {
        setMsg("ভিডিও আপলোড হচ্ছে, অপেক্ষা করুন...")
        vurl = await uploadVideo(token, videoFile)
      }

      const cover = oldImage || imgs.visible[0]?.url || up[0]?.url || null
      const isClub = category.includes("ক্লাব") || category.includes("Club")
      const finalClubId = isClub && selectedClubId ? selectedClubId : null

      const validMedia = mediaItems.filter((m) => m.url.trim() || m.title.trim() || m.description.trim())
      const finalEmbedMedia = validMedia.length > 0 ? JSON.stringify(validMedia) : null

      const data: any = {
        title: title.trim(),
        heading: heading.trim() || null,
        body: body.trim(),
        category,
        club_id: finalClubId,
        page_id: selectedPageId || null,
        author: author.trim() || me?.full_name || null,
        image_url: cover,
        video_url: vurl,
        link_url: linkUrl.trim() || null,
        embed_media_url: finalEmbedMedia,
        hidden: false,
      }

      let postId = editId
      if (editId) await updatePost(token, editId, data)
      else postId = await createPostReturningId(token, data)

      let imgWarn = ""
      if (postId) {
        try {
          await imgs.commit(token, postId, up, oldImage)
        } catch (e) {
          imgWarn = " (সংবাদ সেভ হয়েছে, কিন্তু ছবির তালিকা জোড়া যায়নি)"
        }
      }

      resetForm()
      setMsg("✅ প্রকাশিত হয়েছে" + imgWarn)
      await refresh(token, me)
    } catch (e) { fail(e) }
    setBusy(false)
  }

  async function startEdit(p: Post) {
    setEditId(p.id)
    setTitle(p.title)
    setHeading(p.heading || "")
    setBody(p.body || "")
    setCategory(p.category || CATS[0])
    setSelectedClubId((p as any).club_id || "")
    setSelectedPageId((p as any).page_id || "")
    setAuthor(p.author || "")
    setOldImage(p.image_url)
    setOldVideo(p.video_url || null)
    setLinkUrl(p.link_url || "")
    
    const rawMedia = (p as any).embed_media_url || ""
    if (rawMedia.trim().startsWith("[") || rawMedia.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(rawMedia)
        setMediaItems(Array.isArray(parsed) ? parsed : [parsed])
      } catch {
        setMediaItems(rawMedia ? [{ title: "", subtitle: "", description: "", date: "", caption: "", url: rawMedia }] : [])
      }
    } else if (rawMedia.trim()) {
      setMediaItems([{ title: "", subtitle: "", description: "", date: "", caption: "", url: rawMedia.trim() }])
    } else {
      setMediaItems([])
    }

    setVideoFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
    const rows = await imgs.load(p.id)
    if (p.image_url && rows.some((r) => r.url === p.image_url)) setOldImage(null)
  }

  async function act(fn: () => Promise<void>, ask?: string) {
    if (ask && !confirm(ask)) return
    try { await fn(); await refresh(token, me) } catch (e) { fail(e) }
  }

  if (!ready) return null

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
            className="w-full text-sm underline text-green-800 cursor-pointer"
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

  if (me && !me.approved) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-3 text-center">
          <h1 className="text-xl font-bold text-green-800">অনুমোদনের অপেক্ষায়</h1>
          <p>{me.full_name}, আপনার নিবন্ধন সম্পন্ন হয়েছে। অ্যাডমিন যাচাই করে অনুমোদন দিলে আপনি পোস্ট করতে পারবেন।</p>
          <button onClick={() => loadMe(token)} className={btn}>আবার দেখুন</button>
          <button onClick={logout} className="text-sm text-red-600 underline cursor-pointer">লগআউট</button>
        </div>
      </main>
    )
  }

  if (!me) return null

  const canManage = (p: Post) => me.role === "admin" || me.role === "moderator" || p.user_id === me.id
  const tabCls = (name: string) =>
    `flex-1 rounded-xl py-2 px-3 text-sm font-semibold cursor-pointer whitespace-nowrap ${tab === name ? "bg-green-700 text-white shadow" : "bg-white border text-gray-700 hover:bg-gray-50"}`

  const isClubCategory = category.includes("ক্লাব") || category.includes("Club")

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
              <p className="text-xs text-gray-500">{me.full_name} · {isAdmin ? "অ্যাডমিন" : "মডারেটর"}</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <a href="/" className="underline">সাইট</a>
            <button onClick={logout} className="text-red-600 cursor-pointer">লগআউট</button>
          </div>
        </div>

        {/* অ্যাডমিন ট্যাব বার */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTab("posts")} className={tabCls("posts")}>সংবাদ</button>
          <button onClick={() => setTab("notices")} className={tabCls("notices")}>নোটিশ</button>
          <button onClick={() => setTab("profile")} className={tabCls("profile")}>প্রোফাইল</button>
          {isAdmin && (
            <>
              <button onClick={() => setTab("hero")} className={tabCls("hero")}>হিরো</button>
              <button onClick={() => setTab("hero_banner")} className={tabCls("hero_banner")}>হিরো ব্যানার</button>
              <button onClick={() => setTab("ticker")} className={tabCls("ticker")}>টিকার</button>
              <button onClick={() => setTab("comments")} className={tabCls("comments")}>কমেন্ট ({pending.length})</button>
              <button onClick={() => setTab("reporters")} className={tabCls("reporters")}>সাংবাদিক ({waiting.length})</button>
              <button onClick={() => setTab("leaders")} className={tabCls("leaders")}>নেতৃত্ব</button>
              <button onClick={() => setTab("directors")} className={tabCls("directors")}>ডিরেক্টর প্যানেল</button>
              <button onClick={() => setTab("categories")} className={tabCls("categories")}>ক্যাটাগরি</button>
              <button onClick={() => setTab("students")} className={tabCls("students")}>স্টুডেন্ট কর্নার</button>
              <button onClick={() => setTab("clubs")} className={tabCls("clubs")}>ক্যাম্পাস ক্লাব</button>
              <button onClick={() => setTab("faculties")} className={tabCls("faculties")}>অনুষদ ও বিভাগ</button>
              <button onClick={() => setTab("associations")} className={tabCls("associations")}>অন্যান্য সমিতি</button>
              <button onClick={() => setTab("social_sites")} className={tabCls("social_sites")}>সোশ্যাল সাইট</button>
              <button onClick={() => setTab("administration")} className={tabCls("administration")}>প্রশাসন</button>
              {/* ⭐ ফেসবুক স্টাইল পেজ ম্যানেজার ট্যাব ⭐ */}
              <button onClick={() => setTab("community_pages")} className={tabCls("community_pages")}>পেজসমূহ</button>
              <button onClick={() => setTab("limits")} className={tabCls("limits")}>হোম সেটিং</button>
            </>
          )}
        </div>

        {msg && <p className="text-sm font-semibold p-2 bg-green-50 text-green-800 rounded-xl border border-green-200 text-center">{msg}</p>}

        {tab === "posts" && (
          <>
            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h2 className="font-semibold">{editId ? "সংবাদ এডিট করুন" : "নতুন সংবাদ"}</h2>
              <input className={inp} placeholder="শিরোনাম (টাইটেল) *" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className={inp} placeholder="হেডিং (উপশিরোনাম)" value={heading} onChange={(e) => setHeading(e.target.value)} />
              <textarea className={inp} rows={6} placeholder="ক্যাপশন / বিস্তারিত লেখা *" value={body} onChange={(e) => setBody(e.target.value)} />
              
              <select className={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
                {(cats.includes(category) ? cats : [...cats, category]).map((c) => <option key={c}>{c}</option>)}
              </select>

              {/* ⭐ নির্দিষ্ট পেজে পোস্ট করার ঐচ্ছিক ড্রপডাউন (ফেসবুক পেজের মতো টাইমলাইনে দেখাবে) ⭐ */}
              <div className="space-y-1.5 rounded-xl border border-blue-300 bg-blue-50/60 p-3">
                <label className="text-xs font-bold text-blue-950 block">
                  📄 নির্দিষ্ট পেজে পোস্ট করুন (ঐচ্ছিক — ফেসবুক পেজের মতো টাইমলাইনে দেখাবে):
                </label>
                <select
                  className={inp}
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                >
                  <option value="">— কোনো নির্দিষ্ট পেজ নয় (সাধারণ সংবাদ) —</option>
                  {communityPages.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.name} (/p/{cp.slug})
                    </option>
                  ))}
                </select>
              </div>

              {isClubCategory && (
                <div className="space-y-1.5 rounded-xl border border-green-600 bg-green-50/60 p-3">
                  <label className="text-xs font-bold text-green-900 block">
                    📌 কোন ক্যাম্পাসের ক্লাব?:
                  </label>
                  <select
                    className={inp}
                    value={selectedClubId}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                  >
                    <option value="">— কোনো নির্দিষ্ট ক্লাব নয় —</option>
                    {availableClubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.name_bn ? `(${c.name_bn})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input className={inp} placeholder="প্রতিবেদকের নাম" value={author} onChange={(e) => setAuthor(e.target.value)} />

              {/* সংবাদে মিডিয়া সংযুক্তি */}
              <div className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div>
                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      🎥 সংবাদ/প্রতিবেদনে মিডিয়া সংযুক্তি (ছবি, ভিডিও বা লিংক):
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMediaItem}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-3 py-1.5 shadow shrink-0 cursor-pointer"
                  >
                    + মিডিয়া যোগ
                  </button>
                </div>

                {mediaItems.map((m, idx) => (
                  <div key={idx} className="rounded-xl border border-emerald-200 bg-white p-3 space-y-2 text-xs shadow-sm">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-emerald-900">মিডিয়া #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeMediaItem(idx)}
                        className="text-red-600 font-semibold hover:underline cursor-pointer"
                      >
                        ✕ বাদ দিন
                      </button>
                    </div>

                    <input
                      className={smallInp}
                      placeholder="মিডিয়ার প্রধান শিরোনাম (ঐচ্ছিক)"
                      value={m.title}
                      onChange={(e) => updateMediaItem(idx, "title", e.target.value)}
                    />
                    <input
                      className={smallInp}
                      placeholder="মিডিয়ার উপশিরোনাম (ঐচ্ছিক)"
                      value={m.subtitle}
                      onChange={(e) => updateMediaItem(idx, "subtitle", e.target.value)}
                    />
                    <textarea
                      className={smallInp}
                      rows={2}
                      placeholder="মিডিয়া সম্পর্কে বিস্তারিত বিবরণ (ঐচ্ছিক)"
                      value={m.description}
                      onChange={(e) => updateMediaItem(idx, "description", e.target.value)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className={smallInp}
                        placeholder="তারিখ (যেমন: ২৮ অক্টোবর ২০২৬)"
                        value={m.date}
                        onChange={(e) => updateMediaItem(idx, "date", e.target.value)}
                      />
                      <input
                        className={smallInp}
                        placeholder="ক্যাপশন / ফটো ক্রেডিট (ঐচ্ছিক)"
                        value={m.caption}
                        onChange={(e) => updateMediaItem(idx, "caption", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1 pt-1 border-t border-gray-100">
                      <label className="text-[11px] font-semibold text-gray-700 block">মিডিয়া লিংক অথবা ফাইল:</label>
                      <input
                        className={smallInp}
                        placeholder="ফেসবুক ভিডিও, ইউটিউব বা ছবির লিংক (https://...)"
                        value={m.url}
                        onChange={(e) => updateMediaItem(idx, "url", e.target.value)}
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-gray-500">অথবা ফাইল দিন:</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="text-xs"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) uploadMediaFile(idx, f)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <input className={inp} placeholder="অন্য ওয়েবসাইটের লিঙ্ক (ঐচ্ছিক)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />

              {oldImage && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={oldImage} alt="" className="w-full max-h-60 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setOldImage(null)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-xs cursor-pointer"
                  >
                    ✕ ছবি সরান
                  </button>
                </div>
              )}

              <ImageSection s={imgs} />

              <label className="block">
                <span className="text-sm text-gray-600">ভিডিও (সর্বোচ্চ {MAX_VIDEO_MB} MB)</span>
                <input className="block mt-1 text-sm" type="file" accept="video/*" onChange={(e) => pickVideo(e.target.files?.[0] || null)} />
              </label>
              {videoFile && (
                <p className="text-xs text-gray-600">{videoFile.name}</p>
              )}
              {!videoFile && oldVideo && (
                <div className="space-y-1">
                  <video src={oldVideo} controls className="w-full max-h-60 rounded-xl" />
                  <button type="button" onClick={() => setOldVideo(null)} className="text-sm text-red-600 cursor-pointer">ভিডিও সরান</button>
                </div>
              )}

              <button className={btn} onClick={submit} disabled={busy}>
                {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "প্রকাশ করুন"}
              </button>
              {editId && <button onClick={resetForm} className="w-full text-sm underline cursor-pointer">বাতিল</button>}
            </div>

            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow p-3 flex gap-3">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.hidden ? "🙈 " : ""}{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {p.author} · {new Date(p.created_at).toLocaleDateString("bn-BD")}
                      </span>
                      {p.embed_media_url && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.2 font-semibold">
                          🎥 মিডিয়া
                        </span>
                      )}
                    </div>
                    {canManage(p) && (
                      <div className="flex gap-4 mt-2 text-sm">
                        <button onClick={() => startEdit(p)} className="text-green-700 cursor-pointer">এডিট</button>
                        <button onClick={() => act(() => setPostHidden(token, p.id, !p.hidden))} className="text-amber-600 cursor-pointer">{p.hidden ? "দেখান" : "হাইড"}</button>
                        <button
                          onClick={() =>
                            act(async () => {
                              try { await removeAllImages(token, "post", p.id) } catch {}
                              await deletePost(token, p.id)
                            }, "সত্যিই মুছে ফেলবেন?")
                          }
                          className="text-red-600 cursor-pointer"
                        >
                          ডিলিট
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "notices" && <NoticeManager token={token} isAdmin={!!isAdmin} />}
        {tab === "hero" && isAdmin && <HeroManager token={token} shrink={shrink} />}
        {tab === "hero_banner" && isAdmin && <HeroBannerManager token={token} shrink={shrink} />}
        {tab === "ticker" && isAdmin && <TickerManager token={token} author={me.full_name} />}
        {tab === "students" && isAdmin && <StudentManager token={token} shrink={shrink} />}
        {tab === "clubs" && isAdmin && <ClubManager token={token} />}
        {tab === "faculties" && isAdmin && <FacultyManager token={token} shrink={shrink} />}
        {tab === "associations" && isAdmin && <AssociationManager token={token} shrink={shrink} />}
        {tab === "social_sites" && isAdmin && <SocialSiteManager token={token} shrink={shrink} />}
        {tab === "administration" && isAdmin && <AdministrationManager token={token} shrink={shrink} />}
        
        {/* ⭐ ফেসবুক স্টাইল পেজ ম্যানেজার ভিউ ⭐ */}
        {tab === "community_pages" && isAdmin && <CommunityPageManager token={token} shrink={shrink} />}
        
        {tab === "limits" && isAdmin && <SectionLimits token={token} cats={cats} />}
        {tab === "directors" && isAdmin && <DirectorManager token={token} members={active} onChanged={() => refresh(token, me)} />}
        {tab === "categories" && isAdmin && <CategoryManager token={token} onChanged={() => refresh(token, me)} />}

        {tab === "profile" && (
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-semibold">আমার প্রোফাইল</h2>
            {(pFile || me.avatar_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pFile ? URL.createObjectURL(pFile) : me.avatar_url || ""} alt="" className="w-28 h-28 rounded-full object-cover mx-auto" />
            )}
            <label className="block">
              <span className="text-sm text-gray-600">আমার ছবি</span>
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
                  <button onClick={() => act(() => approveComment(token, c.id))} className="text-green-700 cursor-pointer">অনুমোদন</button>
                  <button onClick={() => act(() => deleteComment(token, c.id), "কমেন্ট মুছবেন?")} className="text-red-600 cursor-pointer">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "leaders" && isAdmin && <LeadershipManager token={token} members={active} shrink={shrink} />}

        {tab === "reporters" && isAdmin && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h2 className="font-semibold">অনুমোদনের অপেক্ষায় ({waiting.length})</h2>
              {waiting.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow p-4 space-y-1 text-sm">
                  <p className="font-semibold text-base">{r.full_name}</p>
                  <p>বিভাগ: {r.department} · ব্যাচ: {r.batch}</p>
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => act(() => approveReporter(token, r.id))} className="text-green-700 cursor-pointer">অনুমোদন</button>
                    <button onClick={() => act(() => removeReporter(token, r.id), "বাতিল করবেন?")} className="text-red-600 cursor-pointer">বাতিল</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold">অনুমোদিত সাংবাদিক ({active.length})</h2>
              {active.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow p-3 text-sm flex justify-between items-center gap-3">
                  <p className="font-semibold">{r.full_name}</p>
                  {r.id !== me.id && (
                    <button onClick={() => act(() => removeReporter(token, r.id), "সরবেন?")} className="text-red-600 cursor-pointer">সরান</button>
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
