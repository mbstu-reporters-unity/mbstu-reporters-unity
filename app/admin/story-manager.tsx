"use client"

import React, { useState, useEffect } from "react"
import { uploadImage, uploadVideo } from "../../lib/sb"
import { getAllStoriesAdmin, createStory, deleteStory, type StoryItem } from "../../lib/stories"
import { Sparkles, Trash2, Upload, Plus, Film, Clock, Eye } from "lucide-react"

const inp = "w-full border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-blue-600"

export default function StoryManager({
  token,
  authorName,
  authorAvatar,
  shrink,
}: {
  token: string
  authorName: string
  authorAvatar?: string | null
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<StoryItem[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [isHighlight, setIsHighlight] = useState(false)
  const [highlightTitle, setHighlightTitle] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    try {
      const data = await getAllStoriesAdmin(token)
      setList(data)
    } catch {}
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSave() {
    if (!file) {
      setMsg("❌ একটি ছবি অথবা ভিডিও ফাইল নির্বাচন করুন")
      return
    }

    setBusy(true)
    setMsg("মিডিয়া আপলোড হচ্ছে...")

    try {
      const isVideo = file.type.startsWith("video/")
      let mediaUrl = ""

      if (isVideo) {
        mediaUrl = await uploadVideo(token, file)
      } else {
        const compressed = await shrink(file)
        mediaUrl = await uploadImage(token, compressed)
      }

      await createStory(token, {
        author_name: authorName || "অ্যাডমিন",
        author_avatar: authorAvatar || null,
        media_url: mediaUrl,
        media_type: isVideo ? "video" : "image",
        caption: caption.trim() || null,
        is_highlight: isHighlight,
        highlight_title: isHighlight ? highlightTitle.trim() || "হাইলাইট" : null,
      })

      setFile(null)
      setCaption("")
      setIsHighlight(false)
      setHighlightTitle("")
      setMsg("✅ স্টোরি সফলভাবে লাইভ হয়েছে!")
      await load()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("এই স্টোরিটি মুছে ফেলতে চান?")) return
    try {
      await deleteStory(token, id)
      await load()
      setMsg("✅ স্টোরি মুছে ফেলা হয়েছে")
    } catch (e: any) {
      setMsg("❌ মুছতে সমস্যা হয়েছে: " + e.message)
    }
  }

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* আপলোড ফর্ম */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-5 space-y-3.5 border border-slate-200">
        <div className="border-b pb-2 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Sparkles className="size-5 text-blue-600" />
            <span>ফেসবুক স্টোরি ও হাইলাইটস আপলোড</span>
          </h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            📁 মোবাইলের গ্যালারি থেকে ছবি বা ভিডিও বাছাই করুন:
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            className="w-full text-xs file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <p className="text-[11px] text-emerald-700 font-bold">
              ✓ নির্বাচিত: {file.name} ({file.type.startsWith("video/") ? "ভিডিও" : "ছবি"})
            </p>
          )}
        </div>

        <input
          className={inp}
          placeholder="স্টোরির ক্যাপশন বা শিরোনাম লিখুন (ঐচ্ছিক)..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* হাইলাইট বনাম ২৪ ঘণ্টার স্টোরি */}
        <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isHighlight}
              onChange={(e) => setIsHighlight(e.target.checked)}
              className="size-4 accent-blue-600 rounded cursor-pointer"
            />
            <span>⭐ আজীবনের জন্য “হাইলাইট” (Highlight) হিসেবে রাখুন</span>
          </label>
          <p className="text-[11px] text-slate-500">
            টিক না দিলে ফেসবুকের মতো এটি ঠিক ২৪ ঘণ্টা পর হোমপেজ থেকে স্বয়ংক্রিয়ভাবে উধাও হয়ে যাবে।
          </p>

          {isHighlight && (
            <input
              className={inp}
              placeholder="হাইলাইটের ফোল্ডারের নাম (যেমন: ক্যাম্পাস জীবন, ইভেন্ট ২০২৬)"
              value={highlightTitle}
              onChange={(e) => setHighlightTitle(e.target.value)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow cursor-pointer transition disabled:opacity-50"
        >
          {busy ? "আপলোড হচ্ছে..." : "🚀 স্টোরি প্রকাশ করুন (হোমপেজে যাবে)"}
        </button>

        {msg && <p className="text-xs font-bold text-center text-blue-900 bg-blue-50 p-2 rounded-xl">{msg}</p>}
      </div>

      {/* বর্তমান স্টোরি ও হাইলাইটস তালিকা */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-800">
          বর্তমান স্টোরিজ ও হাইলাইটস ({list.length})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {list.map((st) => (
            <div key={st.id} className="bg-white rounded-2xl border p-2 space-y-2 shadow-xs text-xs flex flex-col justify-between">
              <div className="relative aspect-[9/14] rounded-xl overflow-hidden bg-black">
                {st.media_type === "video" ? (
                  <video src={st.media_url} className="size-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={st.media_url} alt="" className="size-full object-cover" />
                )}
                {st.is_highlight && (
                  <span className="absolute top-1.5 right-1.5 bg-amber-500 text-black text-[9px] px-1.5 py-0.2 rounded font-bold">
                    হাইলাইট
                  </span>
                )}
              </div>

              <div>
                <p className="font-bold text-slate-900 truncate">{st.caption || st.author_name}</p>
                <p className="text-[10px] text-slate-500">{new Date(st.created_at).toLocaleDateString("bn-BD")}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(st.id)}
                className="w-full py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>মুছুন</span>
              </button>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6 bg-white rounded-xl border">
            বর্তমানে কোনো স্টোরি নেই। উপরের ফর্ম দিয়ে যোগ করুন।
          </p>
        )}
      </div>

    </div>
  )
}
