"use client"

import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2, Upload } from "lucide-react"
import { getAdBanners, saveAdBanners, type AdBannerItem, type AdBannerSlot } from "@/lib/ads"
import { uploadImage } from "@/lib/sb"

const slots: Array<{ value: AdBannerSlot; label: string }> = [
  { value: "home_top", label: "হোমপেজ: হেডারের ওপরে" },
  { value: "home_mid_1", label: "হোমপেজ: মাঝখানে ১" },
  { value: "home_mid_2", label: "হোমপেজ: মাঝখানে ২" },
  { value: "home_mid_3", label: "হোমপেজ: মাঝখানে ৩" },
  { value: "home_mid_4", label: "হোমপেজ: মাঝখানে ৪" },
  { value: "post_top", label: "সংবাদের ভেতরে: ছবির নিচে" },
  { value: "post_middle", label: "সংবাদের ভেতরে: মাঝখানে" },
  { value: "post_bottom", label: "সংবাদের ভেতরে: শেষে" },
]

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none"

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "বিজ্ঞাপন সংরক্ষণ করা যায়নি"
}

function validUrl(value: string, allowPath: boolean): boolean {
  return (
    /^https?:\/\/\S+$/i.test(value) ||
    (allowPath && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
  )
}

export default function AdManager({
  token,
  shrink,
}: {
  token: string
  shrink: (file: File) => Promise<Blob>
}) {
  const [list, setList] = useState<AdBannerItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [slot, setSlot] = useState<AdBannerSlot>("home_top")
  const [active, setActive] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : imageUrl),
    [imageFile, imageUrl]
  )

  useEffect(() => {
    return () => {
      if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [imageFile, previewUrl])

  useEffect(() => {
    getAdBanners().then(setList)
  }, [])

  function resetForm() {
    setEditId(null)
    setTitle("")
    setImageUrl("")
    setImageFile(null)
    setLinkUrl("")
    setSlot("home_top")
    setActive(true)
  }

  function editAd(ad: AdBannerItem) {
    setEditId(ad.id)
    setTitle(ad.title)
    setImageUrl(ad.image_url)
    setImageFile(null)
    setLinkUrl(ad.link_url)
    setSlot(ad.slot)
    setActive(ad.is_active)
    setMessage("")
  }

  async function saveAd() {
    if (!title.trim()) {
      setMessage("বিজ্ঞাপনের শিরোনাম / বিকল্প লেখা দিন।")
      return
    }
    if (!imageFile && !validUrl(imageUrl.trim(), true)) {
      setMessage("সঠিক ছবির URL দিন অথবা ছবি আপলোড করুন।")
      return
    }
    if (!validUrl(linkUrl.trim(), true)) {
      setMessage("গন্তব্য লিংক https:// অথবা / দিয়ে শুরু হতে হবে।")
      return
    }

    setBusy(true)
    setMessage("")
    try {
      const current = list.find((ad) => ad.id === editId)
      const uploadedImage = imageFile
        ? await uploadImage(token, await shrink(imageFile))
        : imageUrl.trim()
      const item: AdBannerItem = {
        id: editId || crypto.randomUUID(),
        title: title.trim(),
        image_url: uploadedImage,
        link_url: linkUrl.trim(),
        slot,
        is_active: active,
        created_at: current?.created_at || new Date().toISOString(),
      }
      const updatedList = editId
        ? list.map((ad) => (ad.id === editId ? item : ad))
        : [item, ...list]

      await saveAdBanners(token, updatedList)
      setList(updatedList)
      resetForm()
      setMessage("বিজ্ঞাপন সংরক্ষণ হয়েছে।")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function deleteAd(ad: AdBannerItem) {
    if (!confirm(`"${ad.title}" বিজ্ঞাপনটি মুছে ফেলবেন?`)) return

    setBusy(true)
    setMessage("")
    try {
      const updatedList = list.filter((item) => item.id !== ad.id)
      await saveAdBanners(token, updatedList)
      setList(updatedList)
      if (editId === ad.id) resetForm()
      setMessage("বিজ্ঞাপন মুছে ফেলা হয়েছে।")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {editId ? "বিজ্ঞাপন / স্পন্সর সম্পাদনা" : "নতুন বিজ্ঞাপন / স্পন্সর ব্যানার"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            ব্যানারের ছবি আপলোড করুন বা URL দিন, ক্লিকের লিংক বাছুন এবং প্রদর্শনের স্থান নির্ধারণ করুন।
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-slate-700">
            অভ্যন্তরীণ নাম / ছবির বিকল্প লেখা
            <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-700">
            প্রদর্শনের স্থান
            <select className={inputClass} value={slot} onChange={(event) => setSlot(event.target.value as AdBannerSlot)}>
              {slots.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-700">
            ছবির URL (অথবা নিচে ছবি আপলোড করুন)
            <input
              className={inputClass}
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value)
                setImageFile(null)
              }}
              placeholder="https://... অথবা /images/banner.jpg"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-700">
            ক্লিকের গন্তব্য লিংক
            <input
              className={inputClass}
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://... অথবা /news"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Upload className="size-4" aria-hidden="true" />
            ব্যানার ছবি আপলোড
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </label>
          {imageFile && <span className="max-w-56 truncate text-xs text-slate-500">{imageFile.name}</span>}
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            সক্রিয়
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={saveAd}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            {busy ? "সংরক্ষণ হচ্ছে..." : editId ? "পরিবর্তন সংরক্ষণ" : "বিজ্ঞাপন যোগ করুন"}
          </button>
          {editId && (
            <button type="button" disabled={busy} onClick={resetForm} className="text-xs font-bold text-slate-600 hover:underline">
              সম্পাদনা বাতিল
            </button>
          )}
        </div>

        {previewUrl && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={title || "বিজ্ঞাপন ব্যানার প্রিভিউ"} className="mx-auto max-h-48 w-full object-contain" />
          </div>
        )}
        {message && <p role="status" className="text-xs font-semibold text-slate-700">{message}</p>}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">সংরক্ষিত ব্যানার ({list.length})</h3>
        {list.map((ad) => (
          <article key={ad.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image_url} alt={ad.title} className="h-16 w-28 rounded-lg border border-slate-200 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{ad.title}</p>
              <p className="text-xs text-slate-500">
                {slots.find((item) => item.value === ad.slot)?.label || ad.slot} · {ad.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </p>
              <p className="truncate text-xs text-slate-500">{ad.link_url}</p>
            </div>
            <button type="button" disabled={busy} onClick={() => editAd(ad)} aria-label="বিজ্ঞাপন সম্পাদনা" className="rounded-lg p-2 text-cyan-700 hover:bg-cyan-50">
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button type="button" disabled={busy} onClick={() => deleteAd(ad)} aria-label="বিজ্ঞাপন মুছুন" className="rounded-lg p-2 text-rose-700 hover:bg-rose-50">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </article>
        ))}
        {list.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">এখনো কোনো বিজ্ঞাপন যোগ করা হয়নি।</p>}
      </section>
    </div>
  )
}
