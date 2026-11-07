"use client"

import { useEffect, useState } from "react"
import {
  getAdministrationOfficials,
  createAdministrationOfficial,
  updateAdministrationOfficial,
  deleteAdministrationOfficial,
  ADMIN_CATEGORIES,
  DEFAULT_OFFICES,
  type AdministrationOfficial,
} from "../../lib/administration"
import { uploadImage } from "../../lib/sb"

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-800 disabled:opacity-50 cursor-pointer shadow-sm"

export default function AdministrationManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<AdministrationOfficial[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // ফর্মের ফিল্ডসমূহ
  const [category, setCategory] = useState<string>(ADMIN_CATEGORIES[0])
  const [officeName, setOfficeName] = useState<string>(DEFAULT_OFFICES[ADMIN_CATEGORIES[0]][0])
  const [customOffice, setCustomOffice] = useState("")
  const [isCustomOffice, setIsCustomOffice] = useState(false)

  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [order, setOrder] = useState(0)

  // ছবি
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // ফিল্টার ভিউ
  const [selectedCatFilter, setSelectedCatFilter] = useState("all")

  async function load() {
    setList(await getAdministrationOfficials())
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setEditId(null)
    setName("")
    setDesignation("")
    setEmail("")
    setPhone("")
    setBio("")
    setOrder(0)
    setPhotoUrl(null)
    setPhotoFile(null)
    setIsCustomOffice(false)
    setCustomOffice("")
  }

  function startEdit(item: AdministrationOfficial) {
    setEditId(item.id)
    setCategory(item.category)
    setOfficeName(item.office_name)
    setName(item.name)
    setDesignation(item.designation)
    setEmail(item.email || "")
    setPhone(item.phone || "")
    setBio(item.bio || "")
    setOrder(item.sort_order || 0)
    setPhotoUrl(item.photo_url || null)
    setPhotoFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave() {
    const finalOffice = isCustomOffice ? customOffice.trim() : officeName.trim()

    if (!name.trim() || !designation.trim() || !finalOffice) {
      setMsg("❌ কর্মকর্তার নাম, পদবি এবং দপ্তর নির্বাচন/লিখুন")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      let finalPhoto = photoUrl
      if (photoFile) {
        setMsg("ছবি আপলোড হচ্ছে...")
        finalPhoto = await uploadImage(token, await shrink(photoFile))
      }

      const data = {
        category,
        office_name: finalOffice,
        name: name.trim(),
        designation: designation.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        photo_url: finalPhoto,
        sort_order: Number(order) || 0,
        is_active: true,
      }

      if (editId) {
        await updateAdministrationOfficial(token, editId, data)
        setMsg("✅ তথ্য সফলভাবে আপডেট হয়েছে")
      } else {
        await createAdministrationOfficial(token, data)
        setMsg("✅ নতুন কর্মকর্তা সফলভাবে যুক্ত হয়েছেন")
      }

      resetForm()
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function handleDelete(id: string, officialName: string) {
    if (!confirm(`"${officialName}" এর তথ্য মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteAdministrationOfficial(token, id)
      await load()
      setMsg("✅ তথ্য মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  const filteredList = selectedCatFilter === "all" ? list : list.filter((item) => item.category === selectedCatFilter)

  return (
    <div className="space-y-4">
      {/* এডিট বা যোগ করার ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-bold text-base text-gray-800">
          {editId ? "✏️ প্রশাসনিক কর্মকর্তার তথ্য এডিট করুন" : "➕ নতুন প্রশাসনিক কর্মকর্তা/দায়িত্বপ্রাপ্ত সদস্য যুক্ত করুন"}
        </h2>
        <p className="text-xs text-gray-500">
          মাভাবিপ্রবির শীর্ষ প্রশাসন, রেজিস্ট্রার, প্রক্টর, ডিন, বা যেকোনো প্রশাসনিক দপ্তরের সদস্যদের তথ্য এখান থেকে যুক্ত ও পরিচালনা করুন।
        </p>

        {/* ক্যাটাগরি ও দপ্তর নির্বাচন */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">প্রশাসনিক স্তর/ক্যাটাগরি:</label>
            <select
              className={inp}
              value={category}
              onChange={(e) => {
                const newCat = e.target.value
                setCategory(newCat)
                setOfficeName(DEFAULT_OFFICES[newCat]?.[0] || "")
                setIsCustomOffice(false)
              }}
            >
              {ADMIN_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">দপ্তর / শাখা / পদবি খাত:</label>
            {!isCustomOffice ? (
              <select
                className={inp}
                value={officeName}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomOffice(true)
                  } else {
                    setOfficeName(e.target.value)
                  }
                }}
              >
                {(DEFAULT_OFFICES[category] || []).map((off) => (
                  <option key={off} value={off}>{off}</option>
                ))}
                <option value="custom">✍️ অন্য কোনো নতুন দপ্তর লিখুন...</option>
              </select>
            ) : (
              <div className="flex gap-1.5">
                <input
                  className={inp}
                  placeholder="দপ্তরের নাম লিখুন..."
                  value={customOffice}
                  onChange={(e) => setCustomOffice(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setIsCustomOffice(false)}
                  className="px-2.5 text-xs text-red-600 border rounded-xl"
                >
                  বাতিল
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ছবি আপলোড */}
        <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 block">কর্মকর্তার অফিসিয়াল ছবি (ঐচ্ছিক):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
          {(photoFile || photoUrl) && (
            <div className="flex items-center gap-2 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoFile ? URL.createObjectURL(photoFile) : photoUrl || ""}
                alt="Preview"
                className="size-14 rounded-full object-cover bg-white border p-0.5"
              />
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoUrl(null) }}
                className="text-xs text-red-600 underline"
              >
                ছবি সরান
              </button>
            </div>
          )}
        </div>

        {/* নাম ও পদবি */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className={inp}
            placeholder="কর্মকর্তার পূর্ণ নাম *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inp}
            placeholder="পদবি (যেমন: উপাচার্য / রেজিস্ট্রার / প্রক্টর) *"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </div>

        {/* ইমেইল ও মোবাইল */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className={inp}
            placeholder="অফিসিয়াল ইমেইল (ঐচ্ছিক)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inp}
            placeholder="মোবাইল / অফিস ফোন নম্বর (ঐচ্ছিক)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* সংক্ষিপ্ত পরিচিতি বা বার্তা */}
        <textarea
          className={inp}
          rows={2}
          placeholder="সংক্ষিপ্ত পরিচিতি বা বাণী/বার্তা (ঐচ্ছিক)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* ক্রম নম্বর */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">প্রদর্শনের ক্রম (ছোট সংখ্যা আগে দেখাবে, যেমন ১, ২, ৩):</label>
          <input
            type="number"
            className={inp}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>

        <button className={btn} onClick={handleSave} disabled={busy}>
          {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "আপডেট করুন" : "➕ কর্মকর্তা সংরক্ষণ করুন"}
        </button>

        {editId && (
          <button type="button" onClick={resetForm} className="w-full text-xs underline text-gray-500">
            বাতিল
          </button>
        )}

        {msg && <p className="text-xs font-bold text-center text-green-800 bg-green-50 p-2.5 rounded-xl border border-green-200">{msg}</p>}
      </div>

      {/* তালিকা */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800">
            বর্তমান কর্মকর্তা ও দায়িত্বপ্রাপ্ত সদস্যবৃন্দ ({filteredList.length})
          </h3>
          <select
            className="text-xs border rounded-lg p-1.5 bg-white"
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
          >
            <option value="all">সব ক্যাটাগরি</option>
            {ADMIN_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {filteredList.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-3 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              {item.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photo_url}
                  alt=""
                  className="size-11 rounded-full object-cover border shrink-0 bg-white"
                />
              ) : (
                <span className="size-11 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 text-base">
                  👤
                </span>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-green-700 font-semibold truncate">{item.designation}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.office_name}</p>
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

        {filteredList.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4 bg-white rounded-xl border">
            এখনো কোনো তথ্য যোগ করা হয়নি। উপরের ফর্ম পূরণ করে যোগ করুন।
          </p>
        )}
      </div>
    </div>
  )
}
