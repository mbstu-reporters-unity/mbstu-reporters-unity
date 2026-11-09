"use client"

import { useEffect, useState } from "react"
import {
  getCommunityPages,
  createCommunityPage,
  updateCommunityPage,
  deleteCommunityPage,
  type CommunityPage,
} from "../../lib/pages"
import { uploadImage } from "../../lib/sb"
import { ExternalLink, CheckCircle2, Trash2, Edit3, PlusCircle, X } from "lucide-react"

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-800 disabled:opacity-50 cursor-pointer shadow-sm"

export default function CommunityPageManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<CommunityPage[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // পেজ ফর্ম স্টেট
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
  const [isVerified, setIsVerified] = useState(false)

  // ছবি
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setList(await getCommunityPages())
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setEditId(null)
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
    setIsVerified(false)
    setAvatarUrl(null)
    setAvatarFile(null)
    setCoverUrl(null)
    setCoverFile(null)
  }

  function startEdit(p: CommunityPage) {
    setEditId(p.id)
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
    setIsVerified(Boolean(p.is_verified))
    setAvatarUrl(p.avatar_url || null)
    setCoverUrl(p.cover_url || null)
    setAvatarFile(null)
    setCoverFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave() {
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
    if (!name.trim() || !cleanSlug) {
      setMsg("❌ পেজের নাম এবং ইউনিক লিংক (Slug) অবশ্যই দিতে হবে")
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

      const data = {
        name: name.trim(),
        name_en: nameEn.trim() || null,
        slug: cleanSlug,
        category: category.trim() || "ক্যাম্পাস সংগঠন",
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        location: location.trim() || null,
        website_url: websiteUrl.trim() || null,
        fb_url: fbUrl.trim() || null,
        is_verified: isVerified,
        avatar_url: finalAvatar,
        cover_url: finalCover,
        is_active: true,
      }

      if (editId) {
        await updateCommunityPage(token, editId, data)
        setMsg("✅ পেজ সফলভাবে আপডেট হয়েছে")
      } else {
        await createCommunityPage(token, {
          ...data,
          sort_order: list.length * 10,
        })
        setMsg("✅ নতুন পেজ সফলভাবে তৈরি হয়েছে! নিচে লিংক দেওয়া হয়েছে।")
      }

      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function handleDelete(id: string, pageName: string) {
    if (!confirm(`"${pageName}" পেজটি মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteCommunityPage(token, id)
      await load()
      setMsg("✅ পেজ মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ মুছতে সমস্যা হয়েছে")
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {/* নতুন পেজ তৈরি বা এডিট ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-bold text-base text-gray-800">
            {editId ? "✏️ পেজের তথ্য এডিট করুন" : "➕ ফেসবুকে মতো নতুন পেজ তৈরি করুন"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-red-600 flex items-center gap-1 font-semibold">
              <X className="size-3.5" /> বাতিল
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="পেজের নাম (বাংলা) *" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inp} placeholder="পেজের নাম (English - ঐচ্ছিক)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>

        {/* পেজের ইউনিক লিংক (Slug) */}
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">
            পেজের সরাসরি লিংক (Unique Slug):
          </label>
          <div className="flex items-center">
            <span className="bg-gray-100 border border-r-0 rounded-l-xl px-2.5 py-2 text-xs text-gray-500 font-mono">
              /p/
            </span>
            <input
              className={`${inp} rounded-l-none font-mono text-xs`}
              placeholder="যেমন: debating-club অথবা hall-council"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">💡 শুধু ছোট হাতের ইংরেজি অক্ষর ও ড্যাশ (-) ব্যবহার করবেন।</p>
        </div>

        <input className={inp} placeholder="ক্যাটাগরি (যেমন: ডিবেট ক্লাব, রক্তদান, হল সংসদ, বিভাগীয় সোসাইটি)" value={category} onChange={(e) => setCategory(e.target.value)} />

        {/* ভেরিফাইড টিকচিহ্ন সুইচ */}
        <label className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 cursor-pointer">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="size-4 accent-blue-600 rounded cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-4 fill-blue-600 text-white" />
            <span>অফিসিয়াল ভেরিফাইড ব্যাজ (Blue Tick Badge) চালু রাখুন</span>
          </span>
        </label>

        {/* প্রোফাইল লোগো ও কভার ফটো আপলোড */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">১. গোল প্রোফাইল লোগো:</label>
            <input type="file" accept="image/*" className="text-xs" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            {(avatarFile || avatarUrl) && (
              <p className="text-[10px] text-green-700 font-semibold">✓ লোগো নির্বাচিত হয়েছে</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">২. বড় কভার ফটো:</label>
            <input type="file" accept="image/*" className="text-xs" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            {(coverFile || coverUrl) && (
              <p className="text-[10px] text-green-700 font-semibold">✓ কভার ফটো নির্বাচিত হয়েছে</p>
            )}
          </div>
        </div>

        <textarea className={inp} rows={3} placeholder="পেজের পরিচিতি বা বিবরণ (About)" value={bio} onChange={(e) => setBio(e.target.value)} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className={inp} placeholder="মোবাইল নম্বর" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={inp} placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inp} placeholder="ঠিকানা বা অফিস রুম" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="ফেসবুক পেজ লিংক (https://facebook.com/...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
          <input className={inp} placeholder="অফিসিয়াল ওয়েবসাইট (https://...)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
        </div>

        <button className={btn} onClick={handleSave} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পেজ আপডেট করুন" : "🚀 নতুন পেজ প্রকাশ করুন"}
        </button>

        {msg && <p className="text-xs font-bold text-center text-green-800 bg-green-50 p-2.5 rounded-xl border border-green-200">{msg}</p>}
      </div>

      {/* বর্তমান পেজসমূহের তালিকা */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-sm text-gray-800">
          বর্তমান পেজসমূহ ({list.length})
        </h3>

        {list.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-2xl shadow p-3.5 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
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
                  <p className="font-bold text-navy truncate">{item.name}</p>
                  {item.is_verified && <CheckCircle2 className="size-3.5 fill-blue-600 text-white shrink-0" />}
                </div>
                <a
                  href={`/p/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 font-mono hover:underline flex items-center gap-1"
                >
                  <span>/p/{item.slug}</span>
                  <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
              <button onClick={() => startEdit(item)} className="text-green-700 hover:underline">
                এডিট
              </button>
              <button onClick={() => handleDelete(item.id, item.name)} className="text-red-600 hover:underline">
                মুছুন
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
