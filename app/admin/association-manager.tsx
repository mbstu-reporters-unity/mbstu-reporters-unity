"use client"

import { useEffect, useState } from "react"
import {
  getUniversityAssociations,
  createUniversityAssociation,
  updateUniversityAssociation,
  deleteUniversityAssociation,
  type UniversityAssociation,
} from "../../lib/associations"
import { uploadImage } from "../../lib/sb"

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-800 disabled:opacity-50 cursor-pointer shadow-sm"

export default function AssociationManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<UniversityAssociation[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // ফর্মের ফিল্ডসমূহ (সবগুলোই ঐচ্ছিক)
  const [name, setName] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [univName, setUnivName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const [description, setDescription] = useState("")
  const [contactInfo, setContactInfo] = useState("")

  // লগো ছবি
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setList(await getUniversityAssociations())
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setEditId(null)
    setName("")
    setNameEn("")
    setUnivName("")
    setWebsiteUrl("")
    setFbUrl("")
    setYtUrl("")
    setDescription("")
    setContactInfo("")
    setLogoUrl(null)
    setLogoFile(null)
  }

  function startEdit(item: UniversityAssociation) {
    setEditId(item.id)
    setName(item.name || "")
    setNameEn(item.name_en || "")
    setUnivName(item.university_name || "")
    setWebsiteUrl(item.website_url || "")
    setFbUrl(item.fb_url || "")
    setYtUrl(item.yt_url || "")
    setDescription(item.description || "")
    setContactInfo(item.contact_info || "")
    setLogoUrl(item.logo_url || null)
    setLogoFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave() {
    if (!name.trim()) {
      setMsg("❌ অন্তত সমিতির নাম লিখুন")
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
        university_name: univName.trim() || null,
        website_url: websiteUrl.trim() || null,
        fb_url: fbUrl.trim() || null,
        yt_url: ytUrl.trim() || null,
        description: description.trim() || null,
        contact_info: contactInfo.trim() || null,
        logo_url: finalLogo,
      }

      if (editId) {
        await updateUniversityAssociation(token, editId, data)
        setMsg("✅ সমিতির তথ্য সফলভাবে আপডেট হয়েছে")
      } else {
        await createUniversityAssociation(token, {
          ...data,
          sort_order: list.length * 10,
          is_active: true,
        })
        setMsg("✅ নতুন সাংবাদিক সমিতি যুক্ত হয়েছে")
      }

      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function handleDelete(id: string, assocName: string) {
    if (!confirm(`"${assocName}" তালিকা থেকে মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteUniversityAssociation(token, id)
      await load()
      setMsg("✅ সমিতি মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {/* এডিট বা নতুন যোগ করার ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-bold text-base text-gray-800">
          {editId ? "✏️ সাংবাদিক সমিতি এডিট করুন" : "➕ নতুন সাংবাদিক সমিতি যুক্ত করুন"}
        </h2>
        <p className="text-xs text-gray-500">
          সব তথ্যই ঐচ্ছিক। যে তথ্য বা লিঙ্ক খালি রাখবেন, ওয়েবসাইটে তা সম্পূর্ণ হাইড (অদৃশ্য) থাকবে।
        </p>

        {/* লগো আপলোড */}
        <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 block">
            সমিতির লগো বা ছবি (ঐচ্ছিক):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
          {(logoFile || logoUrl) && (
            <div className="flex items-center gap-2 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoFile ? URL.createObjectURL(logoFile) : logoUrl || ""}
                alt="Logo preview"
                className="size-14 rounded-xl object-contain bg-white border p-1"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null)
                  setLogoUrl(null)
                }}
                className="text-xs text-red-600 underline"
              >
                লগো সরান
              </button>
            </div>
          )}
        </div>

        {/* নাম ও বিশ্ববিদ্যালয় */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className={inp}
            placeholder="সাংবাদিক সমিতির নাম (বাংলা) *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inp}
            placeholder="সমিতির নাম (English - ঐচ্ছিক)"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
        </div>

        <input
          className={inp}
          placeholder="বিশ্ববিদ্যালয়ের নাম (যেমন: ঢাকা বিশ্ববিদ্যালয়, রাবি, চবি)"
          value={univName}
          onChange={(e) => setUnivName(e.target.value)}
        />

        {/* সোশ্যাল মিডিয়া ও ওয়েবসাইট লিঙ্ক */}
        <div className="space-y-2 border-t pt-2">
          <p className="text-xs font-semibold text-gray-700">
            ওয়েব ও সোশ্যাল মিডিয়া লিঙ্ক (ক্লিক করলে সরাসরি এই লিঙ্কে যাবে):
          </p>
          <input
            className={inp}
            placeholder="অফিসিয়াল ওয়েবসাইট লিঙ্ক (https://...)"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
          <input
            className={inp}
            placeholder="ফেসবুক পেজ বা গ্রুপের লিঙ্ক (https://facebook.com/...)"
            value={fbUrl}
            onChange={(e) => setFbUrl(e.target.value)}
          />
          <input
            className={inp}
            placeholder="ইউটিউব চ্যানেল লিঙ্ক (https://youtube.com/...)"
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
          />
        </div>

        {/* পরিচিতি ও যোগাযোগ বক্স */}
        <textarea
          className={inp}
          rows={2}
          placeholder="সংক্ষিপ্ত পরিচিতি বা বিবরণ (ঐচ্ছিক)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className={inp}
          rows={2}
          placeholder="যোগাযোগের তথ্য / ফোন নম্বর / ইমেইল / অফিসের ঠিকানা (ঐচ্ছিক)"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />

        <button className={btn} onClick={handleSave} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "➕ নতুন সমিতি সংরক্ষণ করুন"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={resetForm}
            className="w-full text-xs underline text-gray-500"
          >
            বাতিল
          </button>
        )}

        {msg && <p className="text-xs font-bold text-center text-green-800 bg-green-50 p-2 rounded-xl">{msg}</p>}
      </div>

      {/* তালিকা */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-gray-700">
          বর্তমান সাংবাদিক সমিতিসমূহ ({list.length})
        </h3>

        {list.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-3 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              {item.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo_url}
                  alt=""
                  className="size-10 rounded-xl object-contain border p-0.5 shrink-0 bg-white"
                />
              ) : (
                <span className="size-10 rounded-xl bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 text-base">
                  📰
                </span>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {item.university_name || item.name_en || "অন্যান্য ক্যাম্পাস"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 text-xs font-semibold shrink-0">
              <button onClick={() => startEdit(item)} className="text-green-700 hover:underline">
                এডিট
              </button>
              <button onClick={() => handleDelete(item.id, item.name)} className="text-red-600 hover:underline">
                মুছুন
              </button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4 bg-white rounded-xl border">
            এখনো কোনো সাংবাদিক সমিতি যোগ করা হয়নি। উপরের ফর্ম পূরণ করে যোগ করুন।
          </p>
        )}
      </div>
    </div>
  )
}
