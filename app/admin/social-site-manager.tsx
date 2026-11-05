"use client"

import { useEffect, useState } from "react"
import {
  getSocialSites,
  createSocialSite,
  updateSocialSite,
  deleteSocialSite,
  getSocialSiteNotices,
  createSocialSiteNotice,
  deleteSocialSiteNotice,
  type SocialSite,
  type SocialSiteNotice,
} from "../../lib/social-sites"
import { uploadImage } from "../../lib/sb"

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-800 disabled:opacity-50 cursor-pointer shadow-sm"

export default function SocialSiteManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [tab, setTab] = useState<"sites" | "notices">("sites")
  const [list, setList] = useState<SocialSite[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // সাইট/গ্রুপ ফর্ম স্টেট
  const [name, setName] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [category, setCategory] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const [description, setDescription] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // নোটিশ স্টেট (একাধিক ছবি সহ)
  const [selectedSiteId, setSelectedSiteId] = useState("")
  const [notices, setNotices] = useState<SocialSiteNotice[]>([])
  const [nTitle, setNTitle] = useState("")
  const [nDetails, setNDetails] = useState("")
  const [nDate, setNDate] = useState("")
  const [nFiles, setNFiles] = useState<File[]>([])

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    const data = await getSocialSites()
    setList(data)
    if (data.length > 0 && !selectedSiteId) {
      setSelectedSiteId(data[0].id)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (selectedSiteId) {
      getSocialSiteNotices(selectedSiteId).then(setNotices)
    }
  }, [selectedSiteId])

  function resetForm() {
    setEditId(null)
    setName("")
    setNameEn("")
    setCategory("")
    setWebsiteUrl("")
    setFbUrl("")
    setYtUrl("")
    setDescription("")
    setContactInfo("")
    setLogoUrl(null)
    setLogoFile(null)
  }

  function startEdit(item: SocialSite) {
    setEditId(item.id)
    setName(item.name || "")
    setNameEn(item.name_en || "")
    setCategory(item.category || "")
    setWebsiteUrl(item.website_url || "")
    setFbUrl(item.fb_url || "")
    setYtUrl(item.yt_url || "")
    setDescription(item.description || "")
    setContactInfo(item.contact_info || "")
    setLogoUrl(item.logo_url || null)
    setLogoFile(null)
    setTab("sites")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* সাইট সংরক্ষণ */
  async function handleSaveSite() {
    if (!name.trim()) {
      setMsg("❌ অন্তত গ্রুপের নাম লিখুন")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      let finalLogo = logoUrl
      if (logoFile) {
        setMsg("লগো আপলোড হচ্ছে...")
        finalLogo = await uploadImage(token, await shrink(logoFile))
      }

      const data = {
        name: name.trim(),
        name_en: nameEn.trim() || null,
        category: category.trim() || null,
        website_url: websiteUrl.trim() || null,
        fb_url: fbUrl.trim() || null,
        yt_url: ytUrl.trim() || null,
        description: description.trim() || null,
        contact_info: contactInfo.trim() || null,
        logo_url: finalLogo,
      }

      if (editId) {
        await updateSocialSite(token, editId, data)
        setMsg("✅ সাইট/গ্রুপ সফলভাবে আপডেট হয়েছে")
      } else {
        await createSocialSite(token, {
          ...data,
          sort_order: list.length * 10,
          is_active: true,
        })
        setMsg("✅ নতুন সাইট/গ্রুপ যুক্ত হয়েছে")
      }

      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  /* নোটিশ প্রকাশ (একাধিক ছবি সহ) */
  async function handleAddNotice() {
    if (!selectedSiteId || !nTitle.trim()) {
      setMsg("❌ নোটিশের শিরোনাম লিখুন")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      const uploadedUrls: string[] = []
      if (nFiles.length > 0) {
        for (let i = 0; i < nFiles.length; i++) {
          setMsg(`নোটিশের ছবি আপলোড হচ্ছে (${i + 1}/${nFiles.length})...`)
          const u = await uploadImage(token, await shrink(nFiles[i]))
          uploadedUrls.push(u)
        }
      }

      await createSocialSiteNotice(token, {
        site_id: selectedSiteId,
        title: nTitle.trim(),
        details: nDetails.trim() || null,
        date: nDate.trim() || new Date().toLocaleDateString("bn-BD"),
        image_urls: uploadedUrls,
      })

      setNTitle("")
      setNDetails("")
      setNDate("")
      setNFiles([])
      setNotices(await getSocialSiteNotices(selectedSiteId))
      setMsg("✅ নোটিশ সফলভাবে যুক্ত হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {/* সাব-ট্যাব */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 gap-1 text-xs font-semibold">
        <button
          onClick={() => setTab("sites")}
          className={`flex-1 py-2 rounded-lg transition-all ${tab === "sites" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          🌐 ১. সোশ্যাল সাইট/গ্রুপ ({list.length})
        </button>
        <button
          onClick={() => setTab("notices")}
          className={`flex-1 py-2 rounded-lg transition-all ${tab === "notices" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          📢 ২. সাইট নোটিশ ও আপডেট ({notices.length})
        </button>
      </div>

      {msg && <p className="text-xs font-bold text-center text-green-800 bg-green-50 p-2.5 rounded-xl border border-green-200">{msg}</p>}

      {/* ট্যাব ১: সোশ্যাল সাইট ও গ্রুপ ব্যবস্থাপনা */}
      {tab === "sites" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-bold text-base text-gray-800">
              {editId ? "✏️ সাইট/গ্রুপ এডিট করুন" : "➕ নতুন সোশ্যাল সাইট / গ্রুপ যুক্ত করুন"}
            </h2>
            <p className="text-xs text-gray-500">
              সব তথ্য ঐচ্ছিক। লগো ও লিঙ্ক যুক্ত করলে ছবিতে চাপ দিলেই সরাসরি সেই গ্রুপ/পেজে চলে যাবে।
            </p>

            {/* লগো আপলোড */}
            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">লগো বা ব্যানার (ঐচ্ছিক):</label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-xs" />
              {(logoFile || logoUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoFile ? URL.createObjectURL(logoFile) : logoUrl || ""} alt="" className="size-14 rounded-xl object-contain bg-white border p-1" />
                  <button type="button" onClick={() => { setLogoFile(null); setLogoUrl(null) }} className="text-xs text-red-600 underline">ছবি সরান</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="সাইট/গ্রুপের নাম (যেমন: জনসংযোগ দপ্তর বা মেস আপডেট) *" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={inp} placeholder="নাম (English - ঐচ্ছিক)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </div>

            <input className={inp} placeholder="ক্যাটাগরি বা বিষয় (যেমন: দপ্তর, মেস ও বাসা, পরিবহন)" value={category} onChange={(e) => setCategory(e.target.value)} />

            {/* লিঙ্কসমূহ */}
            <div className="space-y-2 border-t pt-2">
              <p className="text-xs font-semibold text-gray-700">লিঙ্ক (ছবি বা নামে চাপলে সরাসরি এই পেজে যাবে):</p>
              <input className={inp} placeholder="ফেসবুক পেজ বা গ্রুপ লিঙ্ক (https://facebook.com/...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
              <input className={inp} placeholder="অফিসিয়াল ওয়েবসাইট লিঙ্ক (https://...)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              <input className={inp} placeholder="ইউটিউব চ্যানেল লিঙ্ক (https://youtube.com/...)" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
            </div>

            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত পরিচিতি বা বিবরণ (ঐচ্ছিক)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="যোগাযোগের তথ্য / ফোন নম্বর / ইমেইল (ঐচ্ছিক)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />

            <button className={btn} onClick={handleSaveSite} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "আপডেট করুন" : "➕ নতুন সাইট সংরক্ষণ করুন"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="w-full text-xs underline text-gray-500">বাতিল</button>
            )}
          </div>

          {/* তালিকা */}
          <div className="space-y-2">
            {list.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-xl shadow p-3 text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="size-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {item.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.logo_url} alt="" className="size-10 rounded-xl object-contain border p-0.5 shrink-0 bg-white" />
                  ) : (
                    <span className="size-10 rounded-xl bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0">🌐</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.category || item.name_en || "ক্যাম্পাস সোশ্যাল সাইট"}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs font-semibold shrink-0">
                  <button onClick={() => startEdit(item)} className="text-green-700 hover:underline">এডিট</button>
                  <button
                    onClick={async () => {
                      if (!confirm(`"${item.name}" সাইটটি মুছে ফেলতে চান?`)) return
                      setBusy(true)
                      await deleteSocialSite(token, item.id)
                      await load()
                      setBusy(false)
                    }}
                    className="text-red-600 hover:underline"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ট্যাব ২: নোটিশ ও আপডেট ব্যবস্থাপনা (একাধিক ছবি সহ) */}
      {tab === "notices" && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 space-y-1">
            <label className="text-xs font-bold text-green-900 block">📌 কোন পেজ/গ্রুপের নোটিশ দিতে চান? বেছে নিন:</label>
            <select className={inp} value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
              {list.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.category ? `(${s.category})` : ""}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-2">
              📢 নতুন নোটিশ / আপডেট প্রকাশ করুন
            </h3>
            <input className={inp} placeholder="নোটিশের শিরোনাম *" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
            <textarea className={inp} rows={3} placeholder="নোটিশ বা তথ্যের বিস্তারিত বিবরণ" value={nDetails} onChange={(e) => setNDetails(e.target.value)} />
            <input className={inp} placeholder="তারিখ (ফাঁকা রাখলে আজকের তারিখ বসবে)" value={nDate} onChange={(e) => setNDate(e.target.value)} />

            {/* নোটিশে একাধিক ছবি আপলোড */}
            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                🖼️ নোটিশের ছবি যুক্ত করুন (একাধিক ছবি বাছা যাবে):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) setNFiles(Array.from(e.target.files))
                }}
                className="text-xs"
              />
              {nFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {nFiles.map((f, i) => (
                    <div key={i} className="relative size-12 rounded-lg border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                  <p className="w-full text-[11px] text-green-700 font-bold">{nFiles.length}টি ছবি বাছাই করা হয়েছে</p>
                </div>
              )}
            </div>

            <button className={btn} onClick={handleAddNotice} disabled={busy}>+ নোটিশ প্রকাশ করুন</button>

            {/* নোটিশ তালিকা */}
            <div className="space-y-1.5 pt-2">
              {notices.map((n) => (
                <div key={n.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/60">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{n.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {n.date}
                      {n.image_urls?.length ? ` · 📷 ${n.image_urls.length}টি ছবি` : ""}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm("নোটিশটি মুছবেন?")) return
                      await deleteSocialSiteNotice(token, n.id)
                      setNotices(await getSocialSiteNotices(selectedSiteId))
                    }}
                    className="text-red-600 font-bold hover:underline shrink-0"
                  >
                    মুছুন
                  </button>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">এই সাইটে কোনো নোটিশ নেই।</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
