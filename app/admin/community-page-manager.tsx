"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getCommunityPages,
  getMyPages,
  ensureUserAutoPage,
  getPagePosts,
  getPageFollowStats,
  createCommunityPage,
  updateCommunityPage,
  deleteCommunityPage,
  type CommunityPage,
} from "../../lib/pages"
import {
  getCategoryNames,
  getMe,
  uploadImage,
  setPostHidden,
  deletePost,
  removeAllImages,
  type Post,
} from "../../lib/sb"
import { getCampusClubs, type ClubItem } from "../../lib/clubs"
import FbPostComposer from "../../components/admin/fb-post-composer"
import {
  ExternalLink,
  CheckCircle2,
  X,
  PlusCircle,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Copy,
  Check,
  Settings,
  Newspaper,
} from "lucide-react"

const inp = "w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:border-blue-600"
const btn = "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold text-sm disabled:opacity-50 cursor-pointer shadow-sm transition"

function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(t)) {
    throw new Error("লিংক অবশ্যই http:// বা https:// দিয়ে শুরু হতে হবে")
  }
  return `https://${t}`
}

export default function CommunityPageManager({
  token,
  shrink,
  authorName,
  authorAvatar,
  currentUserId,
  isAdmin = false,
  onPostCreated,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
  authorName?: string
  authorAvatar?: string | null
  currentUserId?: string
  isAdmin?: boolean
  onPostCreated?: () => Promise<void> | void
}) {
  const [list, setList] = useState<CommunityPage[]>([])
  const [activePageId, setActivePageId] = useState<string>("")
  const [pagePosts, setPagePosts] = useState<Post[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [loadingPosts, setLoadingPosts] = useState(false)

  const [cats, setCats] = useState<string[]>(["ক্যাম্পাস সংগঠন"])
  const [clubs, setClubs] = useState<ClubItem[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [fbPostPageId, setFbPostPageId] = useState<string | null>(null)
  const [fbEditPost, setFbEditPost] = useState<Post | null>(null)

  const [name, setName] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("ক্যাম্পাস সংগঠন")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl),
    [avatarFile, avatarUrl]
  )
  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : coverUrl),
    [coverFile, coverUrl]
  )

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarFile, avatarPreview])

  useEffect(() => {
    return () => {
      if (coverFile && coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverFile, coverPreview])

  async function load() {
    const [rawPages, catNames, clubList] = await Promise.all([
      isAdmin ? getCommunityPages() : currentUserId ? getMyPages(token, currentUserId) : Promise.resolve([]),
      getCategoryNames(),
      getCampusClubs(token),
    ])

    let pages = rawPages
    if (!isAdmin && currentUserId && pages.length === 0) {
      const meProfile = await getMe(token).catch(() => null)
      if (meProfile) {
        pages = await ensureUserAutoPage(token, meProfile)
      }
    }

    setList(pages)
    if (pages.length > 0) {
      setActivePageId((prev) => (prev && pages.some((p) => p.id === prev) ? prev : pages[0].id))
    } else {
      setActivePageId("")
    }
    if (catNames.length) setCats(catNames)
    setClubs(clubList)
  }

  async function loadPageDetails(pageId: string) {
    if (!pageId) {
      setPagePosts([])
      setFollowerCount(0)
      return
    }
    setLoadingPosts(true)
    const [postsData, followStats] = await Promise.all([
      getPagePosts(pageId, true, token),
      getPageFollowStats(pageId),
    ])
    setPagePosts(postsData)
    setFollowerCount(followStats.count)
    setLoadingPosts(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, isAdmin])

  useEffect(() => {
    if (activePageId) {
      loadPageDetails(activePageId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId])

  const selectedPage = list.find((p) => p.id === activePageId) || list[0] || null

  function resetForm() {
    setEditId(null)
    setShowForm(false)
    setName("")
    setNameEn("")
    setSlug("")
    setCategory("ক্যাম্পাস সংগঠন")
    setBio("")
    setPhone("")
    setEmail("")
    setLocation("")
    setWebsiteUrl("")
    setFbUrl("")
    setYtUrl("")
    setIsVerified(false)
    setIsActive(true)
    setAvatarUrl(null)
    setAvatarFile(null)
    setCoverUrl(null)
    setCoverFile(null)
  }

  function openNewPageForm() {
    resetForm()
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function startEdit(p: CommunityPage) {
    setEditId(p.id)
    setShowForm(true)
    setName(p.name)
    setNameEn(p.name_en || "")
    setSlug(p.slug)
    setCategory(p.category || "ক্যাম্পাস সংগঠন")
    setBio(p.bio || "")
    setPhone(p.phone || "")
    setEmail(p.email || "")
    setLocation(p.location || "")
    setWebsiteUrl(p.website_url || "")
    setFbUrl(p.fb_url || "")
    setYtUrl(p.yt_url || "")
    setIsVerified(Boolean(p.is_verified))
    setIsActive(p.is_active !== false)
    setAvatarUrl(p.avatar_url || null)
    setCoverUrl(p.cover_url || null)
    setAvatarFile(null)
    setCoverFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave() {
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "")
    if (!name.trim() || !cleanSlug) {
      setMsg("❌ পেজের নাম এবং ইউনিক লিংক (Slug) অবশ্যই দিতে হবে")
      return
    }

    let finalWebsiteUrl: string | null = null
    let finalFbUrl: string | null = null
    let finalYtUrl: string | null = null

    try {
      finalWebsiteUrl = normalizeHttpUrl(websiteUrl)
      finalFbUrl = normalizeHttpUrl(fbUrl)
      finalYtUrl = normalizeHttpUrl(ytUrl)
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সঠিক ওয়েব লিংক লিখুন"))
      return
    }

    setBusy(true)
    setMsg("")
    try {
      let finalAvatar = avatarUrl
      if (avatarFile) {
        setMsg("লোগো আপলোড হচ্ছে...")
        finalAvatar = await uploadImage(token, await shrink(avatarFile))
      }

      let finalCover = coverUrl
      if (coverFile) {
        setMsg("কভার ফটো আপলোড হচ্ছে...")
        finalCover = await uploadImage(token, await shrink(coverFile))
      }

      const baseData = {
        name: name.trim(),
        name_en: nameEn.trim() || null,
        slug: cleanSlug,
        category: category.trim() || "ক্যাম্পাস সংগঠন",
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        location: location.trim() || null,
        website_url: finalWebsiteUrl,
        fb_url: finalFbUrl,
        yt_url: finalYtUrl,
        avatar_url: finalAvatar,
        cover_url: finalCover,
        is_active: isActive,
        ...(isAdmin ? { is_verified: isVerified } : {}),
      }

      if (editId) {
        await updateCommunityPage(token, editId, baseData)
        setMsg("✅ পেজ সফলভাবে আপডেট হয়েছে")
      } else {
        await createCommunityPage(token, {
          ...baseData,
          creator_id: currentUserId || null,
          is_verified: isAdmin ? isVerified : false,
          sort_order: list.length * 10,
        })
        setMsg("✅ নতুন পেজ সফলভাবে তৈরি হয়েছে এবং লাইভ হয়েছে!")
      }

      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function toggleStatus(p: CommunityPage) {
    setBusy(true)
    try {
      await updateCommunityPage(token, p.id, { is_active: !(p.is_active !== false) })
      await load()
      setMsg(p.is_active !== false ? "✅ পেজটি লুকানো হয়েছে" : "✅ পেজটি দৃশ্যমান করা হয়েছে")
    } catch {
      setMsg("❌ পরিবর্তন করা যায়নি")
    }
    setBusy(false)
  }

  async function handleDeletePage(id: string, pageName: string) {
    if (!confirm(`"${pageName}" পেজটি স্থায়ীভাবে মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteCommunityPage(token, id)
      await load()
      setMsg("✅ পেজ মুছে ফেলা হয়েছে")
    } catch {
      setMsg("❌ মুছতে সমস্যা হয়েছে")
    }
    setBusy(false)
  }

  async function handleTogglePostHidden(p: Post) {
    try {
      await setPostHidden(token, p.id, !p.hidden)
      if (selectedPage) await loadPageDetails(selectedPage.id)
      setMsg(p.hidden ? "✅ পোস্টটি পাবলিক করা হয়েছে" : "✅ পোস্টটি লুকানো (Only Me) করা হয়েছে")
      if (onPostCreated) await onPostCreated()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "পোস্ট আপডেট করা যায়নি"))
    }
  }

  async function handleDeletePost(p: Post) {
    if (!confirm(`"${p.title}" পোস্টটি মুছে ফেলতে চান?`)) return
    try {
      try {
        await removeAllImages(token, "post", p.id)
      } catch {}
      await deletePost(token, p.id)
      if (selectedPage) await loadPageDetails(selectedPage.id)
      setMsg("✅ পোস্ট মুছে ফেলা হয়েছে")
      if (onPostCreated) await onPostCreated()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "পোস্ট মুছতে সমস্যা হয়েছে"))
    }
  }

  function copyLink(s: string) {
    try {
      const full = `${window.location.origin}/p/${s}`
      navigator.clipboard.writeText(full)
      setCopiedSlug(s)
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch {}
  }

  return (
    <div className="space-y-4">
      {fbPostPageId !== null && (
        <FbPostComposer
          mode="post"
          token={token}
          isAdmin={isAdmin}
          authorName={authorName}
          authorAvatar={authorAvatar}
          shrink={shrink}
          categories={cats}
          clubs={clubs}
          communityPages={list}
          defaultPageId={fbPostPageId}
          lockToPage={!isAdmin}
          editItem={fbEditPost}
          onCancel={() => {
            setFbPostPageId(null)
            setFbEditPost(null)
          }}
          onSuccess={async (m) => {
            const targetId = fbPostPageId
            setFbPostPageId(null)
            setFbEditPost(null)
            setMsg(m)
            if (targetId) await loadPageDetails(targetId)
            if (onPostCreated) await onPostCreated()
          }}
        />
      )}

      {msg && (
        <p className="text-xs font-bold text-center text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
          {msg}
        </p>
      )}

      {selectedPage && !showForm && (
        <div className="bg-white rounded-3xl shadow border border-slate-200 overflow-hidden">
          <div className="relative z-0 h-28 sm:h-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900">
            {selectedPage.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPage.cover_url} alt="" className="size-full object-cover" />
            )}
            <span
              className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow ${
                selectedPage.is_active !== false
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {selectedPage.is_active !== false ? "● পাবলিক" : "🙈 লুকানো"}
            </span>
          </div>

          <div className="relative z-10 px-4 sm:px-6 pb-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 min-w-0">
                <div className="-mt-10 sm:-mt-12 relative z-10 size-20 sm:size-24 rounded-full bg-white ring-4 ring-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center border">
                  {selectedPage.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedPage.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="size-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center">
                      {selectedPage.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 pt-0.5 sm:pt-2 pb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-bold text-lg sm:text-xl text-slate-900 truncate">
                      {selectedPage.name}
                    </h2>
                    {selectedPage.is_verified && (
                      <CheckCircle2 className="size-4 fill-blue-600 text-white shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-blue-700">{selectedPage.category || "পেজ"}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Users className="size-3.5 text-blue-600" />
                      {followerCount.toLocaleString("bn-BD")} ফলোয়ার
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">
                      {pagePosts.length.toLocaleString("bn-BD")} টি পোস্ট
                    </span>
                  </div>
                </div>
              </div>

              {list.length > 1 && (
                <select
                  className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-800 shrink-0"
                  value={selectedPage.id}
                  onChange={(e) => setActivePageId(e.target.value)}
                >
                  {list.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      📄 {pg.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setFbEditPost(null)
                  setFbPostPageId(selectedPage.id)
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 shadow-sm cursor-pointer transition"
              >
                <PlusCircle className="size-4" />
                <span>পোস্ট দিন</span>
              </button>

              <button
                type="button"
                onClick={() => startEdit(selectedPage)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 border border-slate-200 cursor-pointer transition"
              >
                <Settings className="size-4 text-slate-700" />
                <span>পেজ সেটিংস</span>
              </button>

              <a
                href={`/p/${selectedPage.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2.5 px-3 border border-emerald-200 transition"
              >
                <ExternalLink className="size-4" />
                <span>লাইভ পেজ</span>
              </a>

              <button
                type="button"
                onClick={() => copyLink(selectedPage.slug)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 px-3 border border-slate-200 cursor-pointer transition"
              >
                {copiedSlug === selectedPage.slug ? (
                  <>
                    <Check className="size-4 text-emerald-600" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>লিংক কপি</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPage && !showForm && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Newspaper className="size-4 text-blue-600" />
              <span>“{selectedPage.name}”-এর পোস্টসমূহ ({pagePosts.length})</span>
            </h3>
            <button
              type="button"
              onClick={openNewPageForm}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              + নতুন পেজ খুলুন
            </button>
          </div>

          {loadingPosts && <p className="text-xs text-slate-500 text-center py-4">পোস্ট লোড হচ্ছে...</p>}

          {!loadingPosts && pagePosts.length > 0 && (
            <div className="space-y-2.5">
              {pagePosts.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-3 flex gap-3 text-xs ${
                    p.hidden ? "bg-amber-50/40 border-amber-200" : "bg-slate-50/60 border-slate-200"
                  }`}
                >
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="size-16 rounded-xl object-cover border shrink-0 bg-white" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-slate-900 line-clamp-1">
                        {p.hidden ? "🙈 " : ""}{p.title}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(p.created_at).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                    {p.body && <p className="text-slate-600 line-clamp-2">{p.body}</p>}

                    <div className="flex flex-wrap items-center gap-3 pt-1 font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setFbEditPost(p)
                          setFbPostPageId(selectedPage.id)
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
                      >
                        <Pencil className="size-3" /> এডিট
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePostHidden(p)}
                        className="inline-flex items-center gap-1 text-amber-700 hover:underline cursor-pointer"
                      >
                        {p.hidden ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        <span>{p.hidden ? "পাবলিক করুন" : "লুকান (Only Me)"}</span>
                      </button>

                      <a
                        href={`/post/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                      >
                        <ExternalLink className="size-3" /> দেখুন
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(p)}
                        className="ml-auto inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                      >
                        <Trash2 className="size-3" /> ডিলিট
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingPosts && pagePosts.length === 0 && (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-slate-500">এই পেজে এখনো কোনো পোস্ট দেওয়া হয়নি।</p>
              <button
                type="button"
                onClick={() => {
                  setFbEditPost(null)
                  setFbPostPageId(selectedPage.id)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold cursor-pointer shadow"
              >
                <PlusCircle className="size-3.5" /> প্রথম পোস্ট দিন
              </button>
            </div>
          )}
        </div>
      )}

      {(showForm || list.length === 0) && (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5 space-y-3 border border-slate-200">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-base text-slate-900">
              {editId ? "✏️ পেজ সেটিংস ও তথ্য এডিট করুন" : "➕ নতুন ক্যাম্পাস পেজ খুলুন"}
            </h2>
            {list.length > 0 && (
              <button type="button" onClick={resetForm} className="text-xs text-rose-600 flex items-center gap-1 font-bold cursor-pointer">
                <X className="size-4" /> বাতিল
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className={inp} placeholder="পেজের নাম *" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={inp} placeholder="পেজের নাম (English - ঐচ্ছিক)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              পেজের সরাসরি লিংক (Unique Slug):
            </label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 rounded-l-xl px-2.5 py-2 text-xs text-slate-500 font-mono">
                /p/
              </span>
              <input
                className={`${inp} rounded-l-none font-mono text-xs`}
                placeholder="যেমন: cse-21-batch অথবা rahim-uddin"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />
            </div>
          </div>

          <input
            className={inp}
            placeholder="ক্যাটাগরি (যেমন: শিক্ষক পেজ, শিক্ষার্থী পেজ, ব্যাচ পেজ, সোসাইটি)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {isAdmin && (
              <label className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="size-4 accent-blue-600 rounded cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-4 fill-blue-600 text-white" />
                  <span>অফিসিয়াল ব্লু-টিক ব্যাজ (Blue Tick)</span>
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>পাবলিকভাবে দৃশ্যমান রাখুন</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">১. গোল প্রোফাইল লোগো:</label>
              <input type="file" accept="image/*" className="text-xs w-full" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              {avatarPreview && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarPreview} alt="" className="size-12 rounded-full object-cover border bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarUrl(null)
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">২. বড় কভার ফটো:</label>
              <input type="file" accept="image/*" className="text-xs w-full" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              {coverPreview && (
                <div className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="" className="w-full h-20 rounded-xl object-cover border bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null)
                      setCoverUrl(null)
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    কভার সরান
                  </button>
                </div>
              )}
            </div>
          </div>

          <textarea className={inp} rows={3} placeholder="পেজের পরিচিতি বা বিবরণ (About)" value={bio} onChange={(e) => setBio(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className={inp} placeholder="পাবলিক মোবাইল (ঐচ্ছিক)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className={inp} placeholder="পাবলিক ইমেইল (ঐচ্ছিক)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inp} placeholder="ঠিকানা / বিভাগ / রুম" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className={inp} placeholder="ফেসবুক লিংক (https://...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
            <input className={inp} placeholder="ইউটিউব লিংক (https://...)" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
            <input className={inp} placeholder="ওয়েবসাইট (https://...)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
          </div>

          <button className={btn} onClick={handleSave} disabled={busy}>
            {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পেজ আপডেট করুন" : "🚀 নতুন পেজ তৈরি করুন"}
          </button>
        </div>
      )}

      {list.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              {isAdmin ? `সকল কমিউনিটি পেজ (${list.length})` : `আমার পেজসমূহ (${list.length})`}
            </h3>
            {!showForm && (
              <button
                type="button"
                onClick={openNewPageForm}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-slate-800"
              >
                <PlusCircle className="size-3.5" />
                <span>নতুন পেজ</span>
              </button>
            )}
          </div>

          {list.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl shadow-xs border p-3.5 text-sm space-y-2 ${
                selectedPage?.id === item.id ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="size-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {item.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.avatar_url} alt="" className="size-11 rounded-full object-cover border p-0.5 shrink-0 bg-white" />
                  ) : (
                    <span className="size-11 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0">
                      {item.name.charAt(0)}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      {item.is_verified && <CheckCircle2 className="size-3.5 fill-blue-600 text-white shrink-0" />}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.is_active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.is_active !== false ? "সক্রিয়" : "লুকানো"}
                      </span>
                    </div>
                    <a
                      href={`/p/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 font-mono hover:underline inline-flex items-center gap-1"
                    >
                      <span>/p/{item.slug}</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 border-t pt-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActivePageId(item.id)
                    setShowForm(false)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 cursor-pointer"
                >
                  📊 পরিচালনা
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFbEditPost(null)
                    setFbPostPageId(item.id)
                  }}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 cursor-pointer"
                >
                  📱 পোস্ট দিন
                </button>

                <button
                  type="button"
                  onClick={() => toggleStatus(item)}
                  className={`ml-auto ${item.is_active !== false ? "text-amber-600" : "text-green-700"} hover:underline cursor-pointer`}
                >
                  {item.is_active !== false ? "লুকান" : "দেখান"}
                </button>

                <button type="button" onClick={() => startEdit(item)} className="text-green-700 hover:underline cursor-pointer">
                  এডিট
                </button>
                <button type="button" onClick={() => handleDeletePage(item.id, item.name)} className="text-red-600 hover:underline cursor-pointer">
                  মুছুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
