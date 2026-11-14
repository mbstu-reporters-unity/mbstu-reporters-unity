"use client"

import React, { useState } from "react"
import { X, Upload, Sparkles, Clock } from "lucide-react"
import { uploadImage, uploadVideo } from "@/lib/sb"
import { createStory } from "@/lib/stories"

export function StoryCreatorModal({
  token,
  authorName,
  authorAvatar,
  shrink,
  onClose,
  onSuccess,
}: {
  token: string
  authorName: string
  authorAvatar?: string | null
  shrink?: (f: File) => Promise<Blob>
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [isHighlight, setIsHighlight] = useState(false)
  const [highlightTitle, setHighlightTitle] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function handlePublish() {
    if (!file) {
      setMsg("❌ একটি ছবি বা ভিডিও বাছাই করুন")
      return
    }

    setBusy(true)
    setMsg("মিডিয়া আপলোড হচ্ছে...")

    try {
      let finalUrl = ""
      const isVideo = file.type.startsWith("video/")

      if (isVideo) {
        finalUrl = await uploadVideo(token, file)
      } else {
        const processed = shrink ? await shrink(file) : file
        finalUrl = await uploadImage(token, processed)
      }

      await createStory(token, {
        author_name: authorName,
        author_avatar: authorAvatar || null,
        media_url: finalUrl,
        media_type: isVideo ? "video" : "image",
        caption: caption.trim() || null,
        is_highlight: isHighlight,
        highlight_title: isHighlight ? highlightTitle.trim() || "হাইলাইট" : null,
      })

      onSuccess()
      onClose()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl text-slate-800">
        
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-base flex items-center gap-1.5">
            <Sparkles className="size-4 text-blue-600" />
            <span>নতুন স্টোরি / হাইলাইট যোগ</span>
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>

        {/* ফাইল আপলোড */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">ছবি বা ভিডিও নির্বাচন করুন:</label>
          <input
            type="file"
            accept="image/*,video/*"
            className="text-xs w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <p className="text-[11px] text-emerald-700 font-bold">✓ {file.name}</p>
          )}
        </div>

        <input
          className="w-full border rounded-xl px-3 py-2 text-xs"
          placeholder="ক্যাপশন লিখুন (ঐচ্ছিক)..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* হাইলাইট সুইচ */}
        <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isHighlight}
              onChange={(e) => setIsHighlight(e.target.checked)}
              className="size-4 accent-blue-600 rounded cursor-pointer"
            />
            <span>আজীবনের জন্য “হাইলাইট” হিসেবে রাখুন</span>
          </label>
          <p className="text-[10px] text-slate-500">
            টিক না দিলে ফেসবুকের মতো এটি ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে উধাও হয়ে যাবে।
          </p>

          {isHighlight && (
            <input
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
              placeholder="হাইলাইটের ফোল্ডারের নাম (যেমন: ক্যাম্পাসের স্মৃতি)"
              value={highlightTitle}
              onChange={(e) => setHighlightTitle(e.target.value)}
            />
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={handlePublish}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition disabled:opacity-50 cursor-pointer"
        >
          {busy ? "আপলোড হচ্ছে..." : "🚀 স্টোরি শেয়ার করুন"}
        </button>

        {msg && <p className="text-xs text-center font-bold text-rose-600">{msg}</p>}
      </div>
    </div>
  )
}
