"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  login, signUp, getMe, getAllPosts, setPostHidden, setPostAuthorAvatarVisible, getCategoryNames, getCategories,
  updatePost, deletePost, uploadImage, uploadVideo,
  getPendingComments, approveComment, deleteComment,
  getReporters, approveReporter, removeReporter,
  updateMyProfile, createPostReturningId, removeAllImages,
  isTokenExpired, refreshSession,
} from "../../lib/sb"
import type { Post, PendingComment, Profile, CategoryRow } from "../../lib/sb"
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
import StoryManager from "./story-manager"
import ImageSection, { useImageSection } from "../../components/portal/image-section"
import { GlobalTextStudio } from "../../components/portal/global-text-studio"
import FbPostComposer from "../../components/admin/fb-post-composer"
import {
  Menu, X, ExternalLink, LogOut, Newspaper, Bell, Radio, MessageSquare,
  Sparkles, Sliders, Layers, Building2, GraduationCap, Users, UserCheck,
  Star, FileText, BookOpen, Globe2, ShieldCheck, User, Settings, Upload, Trash2,
  Camera, Eye, EyeOff, Film
} from "lucide-react"

const TOKEN_KEY = "mbstu_admin_token"
const MAX_VIDEO_MB = 50
const CATS = ["ক্যাম্পাস সংবাদ", "ক্লাব", "একাডেমিক", "গবেষণা", "খেলাধুলা", "সংস্কৃতি", "পরিবেশ"]

const inp = "w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const smallInp = "w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 focus:outline-none focus:border-cyan-600"
const btn = "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50 cursor-pointer shadow-md transition active:scale-98"

type Tab =
  | "posts" | "stories" | "comments" | "reporters" | "profile" | "leaders" | "notices"
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
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file
  }
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement("canvas")
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
    if (typeof bmp.close === "function") bmp.close()

    const outType =
      file.type === "image/png"
        ? "image/png"
        : file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg"

    return await new Promise<Blob>((res) =>
      c.toBlob((b) => res(b || file), outType, outType === "image/png" ? undefined : 0.84)
    )
  } catch {
    return file
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [posts, setPosts] = useState<Post[]>([])
  const [pending, setPending] = useState<PendingComment[]>([])
  const [waiting, setWaiting] = useState<Profile[]>([])
  const [active, setActive] = useState<Profile[]>([])
  const [availableClubs, setAvailableClubs] = useState<ClubItem[]>([])
  const [communityPages, setCommunityPages] = useState<CommunityPage[]>([])

  const [editId, setEditId] = useState<string | null>(null)
  const [editHidden, setEditHidden] = useState(false)
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState(CATS[0])
  const [selectedClubId, setSelectedClubId] = useState("")
  const [selectedPageId, setSelectedPageId] = useState("")
  const [author, setAuthor] = useState("")
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null)
  const [authorAvatarFile, setAuthorAvatarFile] = useState<File | null>(null)
  const [authorAvatarPreview, setAuthorAvatarPreview] = useState<string | null>(null)
  const [showAuthorAvatar, setShowAuthorAvatar] = useState(true)
  const authorAvatarInitRef = useRef(false)
  const [oldImage, setOldImage] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [oldVideo, setOldVideo] = useState<string | null>(null)

  const [mediaItems, setMediaItems] = useState<PostMediaItem[]>([])

  const [busy, setBusy] = useState(false)
  const [cats, setCats] = useState<string[]>(CATS)
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([])
  const [linkUrl, setLinkUrl] = useState("")
  const [msg, setMsg] = useState("")

  // ফেসবুক-স্টাইল পোস্ট মোড স্টেট
  const [fbPostMode, setFbPostMode] = useState(false)
  const [fbEditPost, setFbEditPost] = useState<Post | null>(null)

  const imgs = useImageSection("post")

  const [pName, setPName] = useState("")
  const [pPaper, setPPaper] = useState("")
  const [pDept, setPDept] = useState("")
  const [pBatch, setPBatch] = useState("")
  const [pPhone, setPPhone] = useState("")
  const [pFile, setPFile] = useState<File | null>(null)

  const isAdmin = me?.role === "admin" && me.approved

  const selectableCats = useMemo(() => {
    if (isAdmin) return cats
    if (categoryRows.length === 0) return cats
    const filtered = categoryRows
      .filter((r) => !r.is_hidden && (editId || !r.is_locked))
      .map((r) => r.name)
    return filtered.length > 0 ? filtered : cats
  }, [isAdmin, cats, categoryRows, editId])

  useEffect(() => {
    if (me) {
      setPName(me.full_name || "")
      setPPaper(me.newspaper_name || "")
      setPDept(me.department || "")
      setPBatch(me.batch || "")
      setPPhone(me.phone || "")
    }
  }, [me])

  useEffect(() => {
    if (!editId && selectableCats.length > 0 && !selectableCats.includes(category)) {
      setCategory(selectableCats[0])
    }
  }, [selectableCats, category, editId])

  useEffect(() => {
    return () => {
      if (authorAvatarPreview) URL.revokeObjectURL(authorAvatarPreview)
    }
  }, [authorAvatarPreview])

  function pickAuthorAvatarFile(f: File | null) {
    if (f) {
      setAuthorAvatarFile(f)
      setAuthorAvatarPreview(URL.createObjectURL(f))
    } else {
      setAuthorAvatarFile(null)
      setAuthorAvatarPreview(null)
    }
  }

  function logout() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem("mbstu_admin_refresh_token")
    } catch {}
    authorAvatarInitRef.current = false
    setAuthorAvatar(null)
    pickAuthorAvatarFile(null)
    setShowAuthorAvatar(true)
    setToken("")
    setMe(null)
    setMsg("")
  }

  async function fail(e: unknown) {
    const m = e instanceof Error ? e.message : "কিছু ভুল হয়েছে"
    if (/jwt|expired|claim|exp/i.test(m)) {
      const fresh = await refreshSession()
      if (fresh) {
        setToken(fresh)
        setMsg("🔄 সেশন নবায়ন হয়েছে, অনুগ্রহ করে কাজটি আবার করুন")
        return
      }
      logout()
      setMsg("সেশন শেষ, আবার লগইন করুন")
      return
    }
    setMsg("❌ " + m)
  }

  async function refresh(t: string, profile: Profile | null) {
    try {
      const [p, names, catRows, clubs, pages] = await Promise.all([
        getAllPosts(100),
        getCategoryNames(),
        getCategories(t),
        getCampusClubs(t),
        getCommunityPages(),
      ])
      setPosts(p)
      if (names.length) setCats(names)
      setCategoryRows(catRows)
      setAvailableClubs(clubs)
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
    } catch (e) { await fail(e) }
  }

  async function loadMe(t: string) {
    try {
      let activeTok = t
      if (isTokenExpired(t)) {
        const fresh = await refreshSession()
        if (fresh) {
          activeTok = fresh
          setToken(fresh)
        }
      }
      const p = await getMe(activeTok)
      setMe(p)
      if (p) {
        setAuthor((a) => a || p.full_name)
        if (!authorAvatarInitRef.current && !editId) {
          authorAvatarInitRef.current = true
          setAuthorAvatar(p.avatar_url || null)
        }
        await refresh(activeTok, p)
      }
    } catch (e) { await fail(e) }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function onLogin() {
    setBusy(true)
    setMsg("")
    try {
      const t = await login(email.trim(), password)
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
      setMsg("✅ নিবন্ধন সম্পন্ন। অ্যাডমিন অনুমোদন দিলে লগইন করুন।")
    } catch (e) { await fail(e) }
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
      if (!editId) setAuthorAvatar(avatar)
      setMsg("✅ প্রোফাইল সেভ হয়েছে")
      await loadMe(token)
    } catch (e) { await fail(e) }
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

  async function batchUploadMediaFiles(files: File[]) {
    if (files.length === 0) return
    setBusy(true)
    const newItems: PostMediaItem[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setMsg(`মিডিয়া আপলোড হচ্ছে (${i + 1}/${files.length})...`)
        let uploaded = ""
        if (file.type.startsWith("video/")) {
          if (file.size > MAX_VIDEO_MB * 1024 * 1024) continue
          uploaded = await uploadVideo(token, file)
        } else {
          uploaded = await uploadImage(token, await shrink(file))
        }
        if (uploaded) {
          newItems.push({
            id: `media_${Date.now()}_${i}`,
            title: "",
            subtitle: "",
            description: "",
            date: new Date().toLocaleDateString("bn-BD"),
            caption: "",
            url: uploaded,
          })
        }
      }
      setMediaItems((prev) => [...prev, ...newItems])
      setMsg(`✅ ${newItems.length}টি মিডিয়া ফাইল সফলভাবে আপলোড হয়েছে`)
    } catch (err: any) {
      setMsg("❌ আপলোড ব্যর্থ: " + (err?.message || "নেটওয়ার্ক সমস্যা"))
    }
    setBusy(false)
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
    setEditId(null); setEditHidden(false); setTitle(""); setHeading(""); setBody("")
    setCategory(selectableCats[0] || CATS[0]); setSelectedClubId(""); setSelectedPageId("")
    setAuthor(me?.full_name || ""); setAuthorAvatar(me?.avatar_url || null)
    pickAuthorAvatarFile(null); setShowAuthorAvatar(true); setOldImage(null)
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

      let finalAuthorAvatar = authorAvatar
      if (authorAvatarFile) {
        setMsg("প্রতিবেদকের ছবি আপলোড হচ্ছে...")
        finalAuthorAvatar = await uploadImage(token, await shrink(authorAvatarFile))
      }

      let vurl = oldVideo
      if (videoFile) {
        setMsg("ভিডিও আপলোড হচ্ছে...")
        vurl = await uploadVideo(token, videoFile)
      }

      const cover = oldImage || imgs.visible[0]?.url || up[0]?.url || null
      const isClub = category.includes("ক্লাব") || category.includes("Club")
      const finalClubId = isClub && selectedClubId ? selectedClubId : null

      const validMedia = mediaItems.filter((m) => m.url.trim() || m.title.trim() || m.description.trim())
      const finalEmbedMedia = validMedia.length > 0 ? JSON.stringify(validMedia) : null

      const data = {
        title: title.trim(),
        heading: heading.trim() || null,
        body: body.trim(),
        category,
        club_id: finalClubId,
        page_id: selectedPageId || null,
        author: author.trim() || me?.full_name || null,
        author_avatar: finalAuthorAvatar || null,
        show_author_avatar: showAuthorAvatar,
        image_url: cover,
        video_url: vurl,
        link_url: linkUrl.trim() || null,
        embed_media_url: finalEmbedMedia,
        hidden: editId ? editHidden : false,
      }

      let postId = editId
      if (editId) await updatePost(token, editId, data)
      else postId = await createPostReturningId(token, data)

      let imgWarn = ""
      if (postId) {
        try {
          await imgs.commit(token, postId, up, oldImage)
        } catch {
          imgWarn = " (সংবাদ সেভ হয়েছে, কিন্তু ছবির তালিকা জোড়া যায়নি)"
        }
      }

      resetForm()
      setMsg("✅ প্রকাশিত হয়েছে" + imgWarn)
      await refresh(token, me)
    } catch (e) { await fail(e) }
    setBusy(false)
  }

  async function startEdit(p: Post) {
    setEditId(p.id)
    setEditHidden(Boolean(p.hidden))
    setTitle(p.title)
    setHeading(p.heading || "")
    setBody(p.body || "")
    setCategory(p.category || CATS[0])
    setSelectedClubId(p.club_id || "")
    setSelectedPageId(p.page_id || "")
    setAuthor(p.author || "")
    setAuthorAvatar(p.author_avatar || null)
    pickAuthorAvatarFile(null)
    setShowAuthorAvatar(p.show_author_avatar !== false)
    setOldImage(p.image_url)
    setOldVideo(p.video_url || null)
    setLinkUrl(p.link_url || "")

    const rawMedia = p.embed_media_url || ""
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
    setTab("posts")
    window.scrollTo({ top: 0, behavior: "smooth" })
    const rows = await imgs.load(p.id)
    if (p.image_url && rows.some((r) => r.url === p.image_url)) setOldImage(null)
  }

  async function act(fn: () => Promise<void>, ask?: string) {
    if (ask && !confirm(ask)) return
    try { await fn(); await refresh(token, me) } catch (e) { await fail(e) }
  }

  if (!ready) return null

  if (!token) {
    return (
      <main className="min-h-screen bg-[#071030] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900/90 shadow-2xl p-6 sm:p-7 space-y-4 backdrop-blur-xl">
          <div className="text-center space-y-1 border-b border-white/10 pb-3">
            <h1 className="text-xl font-serif font-bold text-cyan-300">
              {mode === "login" ? "সাংবাদিক লগইন" : "সাংবাদিক নিবন্ধন"}
            </h1>
            <p className="text-xs text-white/60">মাভাবিপ্রবি রিপোর্টার্স ইউনিটি পোর্টাল</p>
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <input className={inp} placeholder="পূর্ণ নাম *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input className={inp} placeholder="পত্রিকার নাম *" value={paper} onChange={(e) => setPaper(e.target.value)} />
              <input className={inp} placeholder="বিভাগ (যেমন: ইংরেজি) *" value={dept} onChange={(e) => setDept(e.target.value)} />
              <input className={inp} placeholder="ব্যাচ / সেশন (যেমন: ২০২২-২৩) *" value={batch} onChange={(e) => setBatch(e.target.value)} />
              <input className={inp} placeholder="স্টুডেন্ট আইডি *" value={sid} onChange={(e) => setSid(e.target.value)} />
              <input className={inp} type="tel" placeholder="মোবাইল নম্বর *" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}

          <div className="space-y-2.5">
            <input className={inp} type="email" placeholder="জিমেইল *" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inp} type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button className={btn} onClick={mode === "login" ? onLogin : onSignup} disabled={busy}>
            {busy ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "নিবন্ধন করুন"}
          </button>

          <button
            className="w-full text-xs underline text-cyan-300 cursor-pointer text-center block"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg("") }}
          >
            {mode === "login" ? "নতুন সাংবাদিক? নিবন্ধন করুন" : "আগে নিবন্ধন করেছেন? লগইন করুন"}
          </button>

          {mode === "login" && (
            <a href="/reset" className="block text-center text-xs text-white/60 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</a>
          )}
          {msg && <p className="text-xs text-center text-rose-400 font-semibold">{msg}</p>}
          <a href="/" className="block text-center text-xs text-white/50 hover:text-white">← সাইটে ফিরুন</a>
        </div>
      </main>
    )
  }

  if (me && !me.approved) {
    return (
      <main className="min-h-screen bg-[#071030] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900/90 shadow-2xl p-6 space-y-3 text-center backdrop-blur">
          <h1 className="text-xl font-bold text-amber-300">অনুমোদনের অপেক্ষায়</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            {me.full_name}, আপনার নিবন্ধন সম্পন্ন হয়েছে। অ্যাডমিন যাচাই করে অনুমোদন দিলে আপনি এই প্যানেল থেকে পোস্ট করতে পারবেন।
          </p>
          <button onClick={() => loadMe(token)} className={btn}>স্ট্যাটাস রিলোড করুন</button>
          <button onClick={logout} className="text-xs text-rose-400 underline cursor-pointer">লগআউট</button>
        </div>
      </main>
    )
  }

  if (!me) return null

  const canManage = (p: Post) => me.role === "admin" || me.role === "moderator" || p.user_id === me.id
  const isClubCategory = category.includes("ক্লাব") || category.includes("Club")

  const navigationGroups = [
    {
      groupTitle: "১. কন্টেন্ট ও সংবাদ",
      items: [
        { id: "posts", label: "সংবাদ ও রিপোর্ট", icon: Newspaper },
        { id: "stories", label: "ফেসবুক স্টোরিজ ও রিলস", icon: Film },
        { id: "notices", label: "ডিজিটাল নোটিশ", icon: Bell },
        { id: "ticker", label: "ব্রেকিং টিকার", icon: Radio, adminOnly: true },
        { id: "comments", label: "কমেন্ট মডারেশন", icon: MessageSquare, badge: pending.length, adminOnly: true },
      ]
    },
    {
      groupTitle: "২. হোমপেজ ও ডিজাইন",
      items: [
        { id: "hero", label: "হিরো স্লাইডার", icon: Sparkles, adminOnly: true },
        { id: "hero_banner", label: "হিরো ব্যানার", icon: Sliders, adminOnly: true },
        { id: "limits", label: "হোম সেটিং ও লোগো", icon: Settings, adminOnly: true },
        { id: "categories", label: "ক্যাটাগরি কন্ট্রোল", icon: Layers, adminOnly: true },
      ]
    },
    {
      groupTitle: "৩. প্রশাসন ও বিশ্ববিদ্যালয়",
      items: [
        { id: "administration", label: "প্রশাসন ও কর্মকর্তা", icon: Building2, adminOnly: true },
        { id: "faculties", label: "অনুষদ ও বিভাগসমূহ", icon: GraduationCap, adminOnly: true },
        { id: "leaders", label: "কার্যনির্বাহী পরিষদ", icon: Users, adminOnly: true },
        { id: "directors", label: "ডিরেক্টর প্যানেল", icon: UserCheck, adminOnly: true },
      ]
    },
    {
      groupTitle: "৪. ক্যাম্পাস কমিউনিটি",
      items: [
        { id: "clubs", label: "ক্যাম্পাস ক্লাবসমূহ", icon: Star, adminOnly: true },
        { id: "community_pages", label: "ফেসবুক-স্টাইল পেজ", icon: FileText, adminOnly: true },
        { id: "students", label: "স্টুডেন্ট কর্নার", icon: BookOpen, adminOnly: true },
        { id: "social_sites", label: "সোশ্যাল সাইট ও গ্রুপ", icon: Globe2, adminOnly: true },
        { id: "associations", label: "অন্যান্য সমিতি", icon: ShieldCheck, adminOnly: true },
      ]
    },
    {
      groupTitle: "৫. সাংবাদিক ও প্রোফাইল",
      items: [
        { id: "reporters", label: "সাংবাদিক অনুমোদন", icon: Users, badge: waiting.length, adminOnly: true },
        { id: "profile", label: "আমার প্রোফাইল", icon: User },
      ]
    }
  ]

  const selectTab = (t: Tab) => {
    setTab(t)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const dropdownCats = selectableCats.includes(category) ? selectableCats : [...selectableCats, category]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">

      <header className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div>
            <h1 className="font-bold text-sm text-cyan-300">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{me.full_name} ({isAdmin ? "অ্যাডমিন" : "মডারেটর"})</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a href="/" target="_blank" className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white" title="লাইভ সাইট দেখুন">
            <ExternalLink className="size-4" />
          </a>
          <button onClick={logout} className="p-1.5 rounded-lg bg-red-600/80 text-white" title="লগআউট">
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {me.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar_url} alt="" className="size-10 rounded-full object-cover ring-2 ring-cyan-400 shrink-0" />
            ) : (
              <div className="size-10 rounded-full bg-cyan-600 font-bold text-white flex items-center justify-center shrink-0">
                {me.full_name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">{me.full_name}</p>
              <p className="text-[11px] text-cyan-300 font-semibold">{isAdmin ? "প্রধান অ্যাডমিন" : "মডারেটর"}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none text-xs">
          {navigationGroups.map((grp, gi) => {
            const visibleItems = grp.items.filter((it) => !it.adminOnly || isAdmin)
            if (visibleItems.length === 0) return null

            return (
              <div key={gi} className="space-y-1">
                <p className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  {grp.groupTitle}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = tab === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectTab(item.id as Tab)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer font-medium ${
                          isActive
                            ? "bg-cyan-600 text-white font-bold shadow-md"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <Icon className={`size-4 shrink-0 ${isActive ? "text-white" : "text-cyan-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/60">
          <a href="/" target="_blank" className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 font-semibold">
            <ExternalLink className="size-3.5" />
            <span>লাইভ সাইট</span>
          </a>
          <button onClick={logout} className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
            <LogOut className="size-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden" />
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-4">
        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-center shadow-xs">
            {msg}
          </div>
        )}

        {tab === "posts" && (
          <div className="space-y-4">
            {/* পোস্ট করার মোড সুইচার */}
            <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setFbPostMode(false); setFbEditPost(null) }}
                className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                  !fbPostMode ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                📝 ক্লাসিক ফর্ম (বর্তমান)
              </button>
              <button
                type="button"
                onClick={() => { setFbEditPost(null); setFbPostMode(true) }}
                className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                  fbPostMode ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                📱 ফেসবুক স্টাইল পোস্ট (নতুন)
              </button>
            </div>

            {fbPostMode && (
              <FbPostComposer
                mode="post"
                token={token}
                isAdmin={!!isAdmin}
                authorName={me.full_name}
                authorAvatar={me.avatar_url}
                reporters={active}
                shrink={shrink}
                categories={dropdownCats}
                clubs={availableClubs}
                communityPages={communityPages}
                editItem={fbEditPost}
                onCancel={() => { setFbPostMode(false); setFbEditPost(null) }}
                onSuccess={async (m) => {
                  setFbPostMode(false)
                  setFbEditPost(null)
                  setMsg(m)
                  await refresh(token, me)
                }}
              />
            )}

            <div className="bg-white rounded-2xl shadow p-4 sm:p-5 space-y-3.5 border border-slate-200">
              <div className="border-b pb-2 flex items-center justify-between">
                <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Newspaper className="size-5 text-emerald-700" />
                  <span>{editId ? "✏️ সংবাদ এডিট করুন" : "➕ নতুন সংবাদ প্রকাশ করুন"}</span>
                </h2>
                {editId && (
                  <button onClick={resetForm} className="text-xs text-rose-600 hover:underline">
                    বাতিল
                  </button>
                )}
              </div>

              <input className={inp} placeholder="শিরোনাম (টাইটেল) *" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className={inp} placeholder="হেডিং (উপশিরোনাম - ঐচ্ছিক)" value={heading} onChange={(e) => setHeading(e.target.value)} />
              <textarea className={inp} rows={5} placeholder="ক্যাপশন / সংবাদের বিস্তারিত লেখা *" value={body} onChange={(e) => setBody(e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">ক্যাটাগরি নির্বাচন করুন:</label>
                  <select className={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {dropdownCats.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">প্রতিবেদকের নাম:</label>
                  <input className={inp} placeholder="প্রতিবেদকের নাম" value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
              </div>

              {/* প্রতিবেদকের ছবি: যোগ, এডিট, হাইড, ভিজিবল ও বিয়োগ */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="size-4 text-emerald-700" />
                    <span>প্রতিবেদকের ছবি (যোগ / এডিট / হাইড / বিয়োগ):</span>
                  </span>

                  {(authorAvatarPreview || authorAvatar) && (
                    <button
                      type="button"
                      onClick={() => setShowAuthorAvatar((v) => !v)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer border transition ${
                        showAuthorAvatar
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {showAuthorAvatar ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      <span>{showAuthorAvatar ? "ভিজিবল আছে (হাইড করুন)" : "হাইড করা (দেখান)"}</span>
                    </button>
                  )}
                </div>

                {isAdmin && active.length > 0 && (
                  <select
                    className={smallInp}
                    value=""
                    onChange={(e) => {
                      const chosen = active.find((r) => r.id === e.target.value)
                      if (chosen) {
                        setAuthor(chosen.full_name)
                        setAuthorAvatar(chosen.avatar_url || null)
                        pickAuthorAvatarFile(null)
                        setShowAuthorAvatar(true)
                      }
                    }}
                  >
                    <option value="">— নিবন্ধিত সাংবাদিক থেকে নাম ও ছবি বাছাই করুন (ঐচ্ছিক) —</option>
                    {active.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.full_name} {r.avatar_url ? "📷" : ""}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {(authorAvatarPreview || authorAvatar) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authorAvatarPreview || authorAvatar || ""}
                      alt="Reporter"
                      className={`size-14 rounded-full object-cover object-top border-2 border-emerald-600 bg-white shrink-0 ${
                        !showAuthorAvatar ? "opacity-40 grayscale" : ""
                      }`}
                    />
                  ) : (
                    <div className="size-14 rounded-full bg-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center shrink-0">
                      {(author || me.full_name || "প").charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer shadow-xs">
                      <Upload className="size-3.5" />
                      <span>{(authorAvatarPreview || authorAvatar) ? "ছবি এডিট / বদলান" : "ছবি যোগ করুন"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          if (f) {
                            pickAuthorAvatarFile(f)
                            setShowAuthorAvatar(true)
                          }
                          e.target.value = ""
                        }}
                      />
                    </label>

                    {me.avatar_url && (authorAvatar !== me.avatar_url || authorAvatarFile) && (
                      <button
                        type="button"
                        onClick={() => {
                          pickAuthorAvatarFile(null)
                          setAuthorAvatar(me.avatar_url || null)
                          setShowAuthorAvatar(true)
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        <User className="size-3.5" />
                        <span>আমার প্রোফাইল ছবি</span>
                      </button>
                    )}

                    {(authorAvatarPreview || authorAvatar) && (
                      <button
                        type="button"
                        onClick={() => {
                          pickAuthorAvatarFile(null)
                          setAuthorAvatar(null)
                          setShowAuthorAvatar(false)
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>ছবি বিয়োগ / সরান</span>
                      </button>
                    )}
                  </div>
                </div>

                <input
                  className={smallInp}
                  placeholder="অথবা প্রতিবেদকের ছবির সরাসরি লিংক দিন (https://... ঐচ্ছিক)"
                  value={authorAvatarFile ? "" : authorAvatar || ""}
                  disabled={!!authorAvatarFile}
                  onChange={(e) => {
                    const val = e.target.value.trim()
                    setAuthorAvatar(val || null)
                    if (val) setShowAuthorAvatar(true)
                  }}
                />
              </div>

              <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <label className="text-xs font-bold text-blue-950 block">
                  📄 নির্দিষ্ট পেজে পোস্ট করুন (ফেসবুক পেজের মতো টাইমলাইনে দেখাবে - ঐচ্ছিক):
                </label>
                <select className={inp} value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)}>
                  <option value="">— কোনো নির্দিষ্ট পেজ নয় (সাধারণ সংবাদ) —</option>
                  {communityPages.map((cp) => (
                    <option key={cp.id} value={cp.id}>{cp.name} (/p/{cp.slug})</option>
                  ))}
                </select>
              </div>

              {isClubCategory && (
                <div className="space-y-1 rounded-xl border border-emerald-300 bg-emerald-50/60 p-3">
                  <label className="text-xs font-bold text-emerald-950 block">📌 কোন ক্যাম্পাসের ক্লাব?:</label>
                  <select className={inp} value={selectedClubId} onChange={(e) => setSelectedClubId(e.target.value)}>
                    <option value="">— কোনো নির্দিষ্ট ক্লাব নয় —</option>
                    {availableClubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} {c.name_bn ? `(${c.name_bn})` : ""}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                  <p className="text-xs font-bold text-emerald-950">🎥 সংবাদে মিডিয়া সংযুক্তি (ছবি, ভিডিও বা লিংক):</p>

                  <div className="flex items-center gap-2">
                    <label className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-3 py-1.5 shadow flex items-center gap-1.5 cursor-pointer">
                      <Upload className="size-3.5" />
                      <span>📁 একাধিক ফাইল যোগ</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            batchUploadMediaFiles(Array.from(e.target.files))
                            e.target.value = ""
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={addMediaItem}
                      className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl px-2.5 py-1.5 shadow cursor-pointer"
                    >
                      + লিংক বক্স
                    </button>
                  </div>
                </div>

                {mediaItems.map((m, idx) => (
                  <div key={idx} className="rounded-xl border bg-white p-3 space-y-2 text-xs shadow-xs">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <span>মিডিয়া #{idx + 1}</span>
                        {m.url && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">সংযুক্ত</span>}
                      </span>
                      <button type="button" onClick={() => removeMediaItem(idx)} className="text-rose-600 font-bold hover:underline flex items-center gap-1">
                        <Trash2 className="size-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>

                    {m.url && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        {m.url.includes("youtube.com") || m.url.includes("youtu.be") ? (
                          <div className="size-14 rounded-lg bg-red-600 text-white font-bold flex flex-col items-center justify-center text-[10px] shrink-0">
                            <span>▶ YouTube</span>
                          </div>
                        ) : m.url.includes(".mp4") || m.url.includes("video") ? (
                          <div className="size-14 rounded-lg bg-slate-900 text-white font-bold flex flex-col items-center justify-center text-[10px] shrink-0">
                            <span>🎥 Video</span>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.url}
                            alt="Preview"
                            className="size-14 rounded-lg object-cover border shrink-0 bg-white"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate">ফাইল প্রিভিউ</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{m.url}</p>
                        </div>
                      </div>
                    )}

                    <input className={smallInp} placeholder="মিডিয়ার শিরোনাম (ঐচ্ছিক)" value={m.title} onChange={(e) => updateMediaItem(idx, "title", e.target.value)} />
                    <textarea className={smallInp} rows={2} placeholder="মিডিয়ার বিবরণ (ঐচ্ছিক)" value={m.description} onChange={(e) => updateMediaItem(idx, "description", e.target.value)} />

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">মিডিয়া লিংক অথবা ফাইল:</label>
                      <input className={smallInp} placeholder="ইউটিউব, ফেসবুক ভিডিও বা ছবির সরাসরি লিংক (https://...)" value={m.url} onChange={(e) => updateMediaItem(idx, "url", e.target.value)} />
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-500">ফাইল পরিবর্তন:</span>
                        <input type="file" accept="image/*,video/*" className="text-xs" onChange={(e) => e.target.files?.[0] && uploadMediaFile(idx, e.target.files[0])} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <input className={inp} placeholder="অন্য ওয়েবসাইটের লিঙ্ক (ঐচ্ছিক)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />

              {oldImage && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={oldImage} alt="" className="w-full max-h-60 object-cover rounded-xl border" />
                  <button type="button" onClick={() => setOldImage(null)} className="absolute top-2 right-2 bg-rose-600 text-white rounded-full px-3 py-1 text-xs">
                    ✕ ছবি সরান
                  </button>
                </div>
              )}

              <ImageSection s={imgs} />

              <label className="block text-xs">
                <span className="font-semibold text-slate-700">ভিডিও ফাইল আপলোড (সর্বোচ্চ {MAX_VIDEO_MB} MB):</span>
                <input className="block mt-1 text-xs" type="file" accept="video/*" onChange={(e) => pickVideo(e.target.files?.[0] || null)} />
              </label>

              <button className={btn} onClick={submit} disabled={busy}>
                {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "🚀 সংবাদ প্রকাশ করুন"}
              </button>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-bold text-sm text-slate-800">প্রকাশিত সংবাদসমূহ ({posts.length}টি)</h3>
              {posts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-xs border p-3 flex gap-3 text-sm">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="size-20 object-cover rounded-xl shrink-0 border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{p.hidden ? "🙈 " : ""}{p.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      {p.author_avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.author_avatar}
                          alt=""
                          className={`size-5 rounded-full object-cover object-top border shrink-0 ${
                            p.show_author_avatar === false ? "opacity-40 grayscale" : ""
                          }`}
                        />
                      )}
                      <span className="truncate">
                        {p.author}{p.show_author_avatar === false ? " (ছবি লুকানো)" : ""} · {new Date(p.created_at).toLocaleDateString("bn-BD")} · <span className="text-emerald-700 font-semibold">{p.category}</span>
                      </span>
                    </div>
                    {canManage(p) && (
                      <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold">
                        <button onClick={() => startEdit(p)} className="text-emerald-700 hover:underline">এডিট</button>
                        <button
                          onClick={() => {
                            setFbEditPost(p)
                            setFbPostMode(true)
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          FB এডিট
                        </button>
                        <button onClick={() => act(() => setPostHidden(token, p.id, !p.hidden))} className="text-amber-600 hover:underline">
                          {p.hidden ? "দেখান" : "হাইড"}
                        </button>
                        {(p.author_avatar || p.show_author_avatar === false) && (
                          <button
                            onClick={() => act(() => setPostAuthorAvatarVisible(token, p.id, p.show_author_avatar === false))}
                            className="text-cyan-700 hover:underline"
                          >
                            {p.show_author_avatar === false ? "প্রতিবেদকের ছবি দেখান" : "প্রতিবেদকের ছবি হাইড"}
                          </button>
                        )}
                        <button
                          onClick={() => act(async () => {
                            try { await removeAllImages(token, "post", p.id) } catch {}
                            await deletePost(token, p.id)
                          }, "সত্যিই মুছে ফেলবেন?")}
                          className="text-rose-600 hover:underline"
                        >
                          ডিলিট
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "stories" && (
          <StoryManager
            token={token}
            authorName={me.full_name}
            authorAvatar={me.avatar_url}
            shrink={shrink}
          />
        )}

        {tab === "notices" && (
          <NoticeManager
            token={token}
            isAdmin={!!isAdmin}
            authorName={me.full_name}
            authorAvatar={me.avatar_url}
          />
        )}
        {tab === "hero" && isAdmin && <HeroManager token={token} shrink={shrink} />}
        {tab === "hero_banner" && isAdmin && <HeroBannerManager token={token} shrink={shrink} />}
        {tab === "ticker" && isAdmin && <TickerManager token={token} author={me.full_name} />}
        {tab === "students" && isAdmin && (
          <StudentManager
            token={token}
            shrink={shrink}
            authorName={me.full_name}
            authorAvatar={me.avatar_url}
          />
        )}
        {tab === "clubs" && isAdmin && <ClubManager token={token} />}
        {tab === "faculties" && isAdmin && <FacultyManager token={token} shrink={shrink} />}
        {tab === "associations" && isAdmin && <AssociationManager token={token} shrink={shrink} />}
        {tab === "social_sites" && isAdmin && <SocialSiteManager token={token} shrink={shrink} />}
        {tab === "administration" && isAdmin && <AdministrationManager token={token} shrink={shrink} />}
        {tab === "community_pages" && isAdmin && (
          <CommunityPageManager
            token={token}
            shrink={shrink}
            authorName={me.full_name}
            authorAvatar={me.avatar_url}
            onPostCreated={() => refresh(token, me)}
          />
        )}
        {tab === "limits" && isAdmin && <SectionLimits token={token} cats={cats} />}
        {tab === "directors" && isAdmin && <DirectorManager token={token} members={active} onChanged={() => refresh(token, me)} />}
        {tab === "categories" && isAdmin && <CategoryManager token={token} onChanged={() => refresh(token, me)} />}

        {tab === "profile" && (
          <div className="bg-white rounded-2xl shadow p-5 space-y-3.5 border">
            <h2 className="font-bold text-base text-slate-800 border-b pb-2">আমার প্রোফাইল তথ্য</h2>
            {(pFile || me.avatar_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pFile ? URL.createObjectURL(pFile) : me.avatar_url || ""} alt="" className="size-24 rounded-full object-cover mx-auto ring-2 ring-emerald-500 shadow" />
            )}
            <input type="file" accept="image/*" onChange={(e) => setPFile(e.target.files?.[0] || null)} className="text-xs block mx-auto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="পূর্ণ নাম" value={pName} onChange={(e) => setPName(e.target.value)} />
              <input className={inp} placeholder="পত্রিকার নাম" value={pPaper} onChange={(e) => setPPaper(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className={inp} placeholder="বিভাগ" value={pDept} onChange={(e) => setPDept(e.target.value)} />
              <input className={inp} placeholder="ব্যাচ" value={pBatch} onChange={(e) => setPBatch(e.target.value)} />
              <input className={inp} type="tel" placeholder="মোবাইল" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
            </div>
            <button className={btn} onClick={saveProfile} disabled={busy}>{busy ? "অপেক্ষা করুন..." : "প্রোফাইল সেভ করুন"}</button>
          </div>
        )}

        {tab === "comments" && isAdmin && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800">অনুমোদনের অপেক্ষায় থাকা মন্তব্যসমূহ ({pending.length})</h3>
            {pending.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-xs border p-4 space-y-2">
                <p className="text-xs text-slate-500">সংবাদ: <b>{c.posts?.title || "—"}</b></p>
                <p className="font-bold text-sm text-slate-800">{c.name || "নামহীন"}</p>
                <p className="text-xs text-slate-700 whitespace-pre-line">{c.message}</p>
                <div className="flex gap-4 text-xs font-bold pt-1">
                  <button onClick={() => act(() => approveComment(token, c.id))} className="text-emerald-700 hover:underline">অনুমোদন দিন</button>
                  <button onClick={() => act(() => deleteComment(token, c.id), "মুছবেন?")} className="text-rose-600 hover:underline">মুছে ফেলুন</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8 bg-white rounded-2xl border">কোনো পেন্ডিং মন্তব্য নেই।</p>
            )}
          </div>
        )}

        {tab === "leaders" && isAdmin && <LeadershipManager token={token} members={active} shrink={shrink} />}

        {tab === "reporters" && isAdmin && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-800">অনুমোদনের অপেক্ষায় ({waiting.length})</h3>
              {waiting.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow-xs border p-3.5 text-xs space-y-1">
                  <p className="font-bold text-sm text-slate-800">{r.full_name}</p>
                  <p className="text-slate-600">বিভাগ: {r.department} · ব্যাচ: {r.batch} · পত্রিকা: {r.newspaper_name || "নেই"}</p>
                  <div className="flex gap-3 pt-1 font-bold">
                    <button onClick={() => act(() => approveReporter(token, r.id))} className="text-emerald-700">অনুমোদন দিন</button>
                    <button onClick={() => act(() => removeReporter(token, r.id), "বাতিল করবেন?")} className="text-rose-600">বাতিল</button>
                  </div>
                </div>
              ))}
              {waiting.length === 0 && <p className="text-xs text-slate-400 py-3 text-center bg-white rounded-xl border">কোনো আবেদন নেই।</p>}
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-sm text-slate-800">অনুমোদিত সাংবাদিকবৃন্দ ({active.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {active.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{r.full_name}</p>
                      <p className="text-[11px] text-slate-500">{r.department} · {r.newspaper_name || "রিপোর্টার"}</p>
                    </div>
                    {r.id !== me.id && (
                      <button onClick={() => act(() => removeReporter(token, r.id), "সরিয়ে দেবেন?")} className="text-rose-600 font-bold hover:underline">
                        সরান
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
      <GlobalTextStudio />
    </div>
  )
}
