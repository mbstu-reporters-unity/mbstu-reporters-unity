"use client"

import React, { useState, useEffect } from "react"
import { uploadImage, uploadVideo, getAllPosts, type Post } from "../../lib/sb"
import { getAllStoriesAdmin, createStory, updateStory, deleteStory, type StoryItem } from "../../lib/stories"
import { getAllReelsAdmin, createReel, updateReel, deleteReel, type ReelItem } from "../../lib/reels"
import { Sparkles, Trash2, Film, Edit3, Link2, PlusCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

const inp = "w-full border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-blue-600"
const selectInp = "w-full border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-blue-600 font-medium"

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i)
  return match ? match[1] : null
}

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
  const [activeTab, setActiveTab] = useState<"stories" | "reels">("stories")
  const [allPosts, setAllPosts] = useState<Post[]>([])

  // স্টোরি স্টেট
  const [stories, setStories] = useState<StoryItem[]>([])
  const [storyEditId, setStoryEditId] = useState<string | null>(null)
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyUrl, setStoryUrl] = useState("")
  const [storyCaption, setStoryCaption] = useState("")
  const [storyLink, setStoryLink] = useState("")
  const [isHighlight, setIsHighlight] = useState(false)
  const [highlightTitle, setHighlightTitle] = useState("")

  // রিলস স্টেট
  const [reels, setReels] = useState<ReelItem[]>([])
  const [reelEditId, setReelEditId] = useState<string | null>(null)
  const [reelFile, setReelFile] = useState<File | null>(null)
  const [reelVideoUrl, setReelVideoUrl] = useState("")
  const [reelThumbUrl, setReelThumbUrl] = useState("")
  const [reelTitle, setReelTitle] = useState("")
  const [reelLink, setReelLink] = useState("")

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function loadData() {
    try {
      const [sList, rList, pList] = await Promise.all([
        getAllStoriesAdmin(token),
        getAllReelsAdmin(token),
        getAllPosts(60),
      ])
      setStories(sList)
      setReels(rList)
      setAllPosts(pList)
    } catch {}
  }

  useEffect(() => {
    loadData()
  }, [])

  // পোস্ট সিলেক্ট করে স্টোরি প্রি-ফিল করা
  function pickPostForStory(postId: string) {
    const found = allPosts.find((p) => p.id === postId)
    if (!found) return
    setStoryCaption(found.title)
    setStoryLink(`${window.location.origin}/post/${found.id}`)
    setStoryUrl(found.image_url || "")
    setStoryFile(null)
  }

  // পোস্ট সিলেক্ট করে রিলস প্রি-ফিল করা
  function pickPostForReel(postId: string) {
    const found = allPosts.find((p) => p.id === postId)
    if (!found) return
    setReelTitle(found.title)
    setReelLink(`${window.location.origin}/post/${found.id}`)

    const vUrl = found.video_url || (found.embed_media_url && found.embed_media_url.includes("http") ? found.embed_media_url : "")
    setReelVideoUrl(vUrl)
    setReelThumbUrl(found.image_url || "")
    setReelFile(null)
  }

  function resetStoryForm() {
    setStoryEditId(null)
    setStoryFile(null)
    setStoryUrl("")
    setStoryCaption("")
    setStoryLink("")
    setIsHighlight(false)
    setHighlightTitle("")
  }

  function resetReelForm() {
    setReelEditId(null)
    setReelFile(null)
    setReelVideoUrl("")
    setReelThumbUrl("")
    setReelTitle("")
    setReelLink("")
  }

  // স্টোরি সংরক্ষণ / আপডেট
  async function handleSaveStory() {
    if (!storyFile && !storyUrl.trim()) {
      setMsg("❌ ছবি/ভিডিও ফাইল দিন অথবা পোস্ট থেকে সিলেক্ট করুন")
      return
    }

    setBusy(true)
    setMsg("স্টোরি আপলোড হচ্ছে...")

    try {
      let finalMedia = storyUrl.trim()
      let isVideo = finalMedia.includes(".mp4") || finalMedia.includes("video")

      if (storyFile) {
        isVideo = storyFile.type.startsWith("video/")
        if (isVideo) {
          finalMedia = await uploadVideo(token, storyFile)
        } else {
          finalMedia = await uploadImage(token, await shrink(storyFile))
        }
      }

      const payload = {
        author_name: authorName || "অ্যাডমিন",
        author_avatar: authorAvatar || null,
        media_url: finalMedia,
        media_type: (isVideo ? "video" : "image") as "video" | "image",
        caption: storyCaption.trim() || null,
        link_url: storyLink.trim() || null,
        is_highlight: isHighlight,
        highlight_title: isHighlight ? highlightTitle.trim() || "হাইলাইট" : null,
        is_active: true,
      }

      if (storyEditId) {
        await updateStory(token, storyEditId, payload)
        setMsg("✅ স্টোরি আপডেট সম্পন্ন হয়েছে!")
      } else {
        await createStory(token, payload)
        setMsg("✅ নতুন স্টোরি লাইভ হয়েছে!")
      }

      resetStoryForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  // রিলস সংরক্ষণ / আপডেট
  async function handleSaveReel() {
    if (!reelFile && !reelVideoUrl.trim()) {
      setMsg("❌ ভিডিও ফাইল বাছাই করুন অথবা ইউটিউব/ফেসবুক ভিডিও লিংক দিন")
      return
    }

    setBusy(true)
    setMsg("রিলস সংরক্ষণ হচ্ছে...")

    try {
      let finalVideo = reelVideoUrl.trim()
      let finalThumb = reelThumbUrl.trim()

      if (reelFile) {
        finalVideo = await uploadVideo(token, reelFile)
      }

      const ytId = extractYouTubeId(finalVideo)
      if (ytId && !finalThumb) {
        finalThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      }

      const payload = {
        title: reelTitle.trim() || "ক্যাম্পাস রিল",
        author_name: authorName || "ক্যাম্পাস সাংবাদিক",
        author_avatar: authorAvatar || null,
        video_url: finalVideo,
        thumbnail_url: finalThumb || null,
        link_url: reelLink.trim() || null,
        is_active: true,
      }

      if (reelEditId) {
        await updateReel(token, reelEditId, payload)
        setMsg("✅ রিলস তথ্য আপডেট হয়েছে!")
      } else {
        await createReel(token, payload)
        setMsg("✅ নতুন রিলস সফলভাবে যোগ হয়েছে!")
      }

      resetReelForm()
      await loadData()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* ২ সাব-ট্যাব সুইচার */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setActiveTab("stories"); setMsg("") }}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "stories" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="size-4" />
          <span>১. স্টোরিজ ও হাইলাইটস ({stories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("reels"); setMsg("") }}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "reels" ? "bg-rose-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Film className="size-4" />
          <span>২. রিলস ও ভিডিও হাব ({reels.length})</span>
        </button>
      </div>

      {msg && (
        <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {/* ==================== ট্যাব ১: কাস্টম স্টোরিজ ও হাইলাইটস ==================== */}
      {activeTab === "stories" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>{storyEditId ? "✏️ স্টোরি এডিট করুন" : "➕ নতুন স্টোরি / হাইলাইট তৈরি করুন"}</span>
              {storyEditId && (
                <button type="button" onClick={resetStoryForm} className="text-xs text-rose-600 underline">বাতিল</button>
              )}
            </h3>

            {/* অপশন ১: বিদ্যমান পোস্ট থেকে বেছে নেওয়া */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <label className="text-[11px] font-bold text-blue-950 block">
                📌 যেকোনো প্রকাশিত পোস্ট থেকে সিলেক্ট করে স্টোরি বানান:
              </label>
              <select
                className={selectInp}
                defaultValue=""
                onChange={(e) => pickPostForStory(e.target.value)}
              >
                <option value="">— পোস্ট নির্বাচন করুন (ছবি ও শিরোনাম চলে আসবে) —</option>
                {allPosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({new Date(p.created_at).toLocaleDateString("bn-BD")})
                  </option>
                ))}
              </select>
            </div>

            {/* অপশন ২: সম্পূর্ণ নতুন মিডিয়া আপলোড */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                অথবা মোবাইল থেকে নতুন ছবি / ভিডিও ফাইল বাছাই করুন:
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                className="text-xs w-full"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setStoryFile(f)
                  if (f) setStoryUrl("")
                }}
              />
              {storyFile && <p className="text-[11px] text-emerald-700 font-bold">✓ ফাইল: {storyFile.name}</p>}
            </div>

            {storyUrl && (
              <input
                className={inp}
                placeholder="ছবির লিংক"
                value={storyUrl}
                onChange={(e) => setStoryUrl(e.target.value)}
              />
            )}

            <input
              className={inp}
              placeholder="ক্যাপশন / শিরোনাম..."
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
            />

            <input
              className={inp}
              placeholder="হাইপারলিংক (ক্লিক করলে দর্শক যে লিংকে যাবে - ঐচ্ছিক)"
              value={storyLink}
              onChange={(e) => setStoryLink(e.target.value)}
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
                <span>⭐ আজীবনের জন্য “হাইলাইট” (Highlight) হিসেবে রাখুন</span>
              </label>
              <p className="text-[10px] text-slate-500">
                টিক না দিলে ফেসবুকের মতো এটি ঠিক ২৪ ঘণ্টা পর হোমপেজ থেকে উধাও হয়ে যাবে।
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
              disabled={busy}
              onClick={handleSaveStory}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
            >
              {busy ? "সংরক্ষণ হচ্ছে..." : storyEditId ? "✓ স্টোরি আপডেট করুন" : "🚀 স্টোরি হিসেবে প্রকাশ করুন"}
            </button>
          </div>

          {/* স্টোরিজ তালিকা: এডিট, ডিলিট, দৃশ্যমানতা */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800">হোমপেজে থাকা স্টোরিজ ({stories.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {stories.map((st) => (
                <div key={st.id} className="bg-white rounded-2xl border p-2 space-y-2 shadow-xs text-xs flex flex-col justify-between">
                  <div className="relative aspect-[9/13] rounded-xl overflow-hidden bg-black">
                    {st.media_type === "video" ? (
                      <video src={st.media_url} className="size-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={st.media_url} alt="" className="size-full object-cover" />
                    )}
                    {st.is_highlight && (
                      <span className="absolute top-1 right-1 bg-amber-500 text-black text-[9px] px-1.5 py-0.2 rounded font-bold">
                        হাইলাইট
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 truncate">{st.caption || st.author_name}</p>
                    <p className="text-[10px] text-slate-500">{new Date(st.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setStoryEditId(st.id)
                        setStoryCaption(st.caption || "")
                        setStoryLink(st.link_url || "")
                        setStoryUrl(st.media_url)
                        setIsHighlight(st.is_highlight)
                        setHighlightTitle(st.highlight_title || "")
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                      className="flex-1 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-center"
                    >
                      এডিট
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("এই স্টোরিটি মুছে ফেলতে চান?")) return
                        await deleteStory(token, st.id)
                        await loadData()
                      }}
                      className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                      title="মুছুন"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== ট্যাব ২: কাস্টম রিলস ও ভিডিও হাব ==================== */}
      {activeTab === "reels" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>{reelEditId ? "✏️ রিলস এডিট করুন" : "➕ নতুন রিলস যুক্ত করুন"}</span>
              {reelEditId && (
                <button type="button" onClick={resetReelForm} className="text-xs text-rose-600 underline">বাতিল</button>
              )}
            </h3>

            {/* অপশন ১: বিদ্যমান পোস্ট সিলেক্ট করে রিলস বানানো */}
            <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <label className="text-[11px] font-bold text-rose-950 block">
                📌 যেকোনো প্রকাশিত ভিডিও পোস্ট সিলেক্ট করে রিলস বানান:
              </label>
              <select
                className={selectInp}
                defaultValue=""
                onChange={(e) => pickPostForReel(e.target.value)}
              >
                <option value="">— ভিডিও পোস্ট নির্বাচন করুন —</option>
                {allPosts
                  .filter((p) => p.video_url || (p.embed_media_url && p.embed_media_url.includes("http")))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* অপশন ২: সম্পূর্ণ নতুন ভিডিও */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                অথবা ইউটিউব/ফেসবুক ভিডিও লিংক দিন:
              </label>
              <input
                className={inp}
                placeholder="যেমন: https://youtube.com/watch?v=... বা সরাসরি MP4 লিংক"
                value={reelVideoUrl}
                onChange={(e) => setReelVideoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                অথবা মোবাইল থেকে ভিডিও ফাইল আপলোড করুন:
              </label>
              <input
                type="file"
                accept="video/*"
                className="text-xs w-full"
                onChange={(e) => setReelFile(e.target.files?.[0] || null)}
              />
              {reelFile && <p className="text-[11px] text-emerald-700 font-bold">✓ নির্বাচিত: {reelFile.name}</p>}
            </div>

            <input
              className={inp}
              placeholder="রিলসের শিরোনাম / টাইটেল *"
              value={reelTitle}
              onChange={(e) => setReelTitle(e.target.value)}
            />

            <input
              className={inp}
              placeholder="কাস্টম থাম্বনেইল লিংক (ঐচ্ছিক)"
              value={reelThumbUrl}
              onChange={(e) => setReelThumbUrl(e.target.value)}
            />

            <input
              className={inp}
              placeholder="হাইপারলিংক (ক্লিক করলে দর্শক যে লিংকে যাবে - ঐচ্ছিক)"
              value={reelLink}
              onChange={(e) => setReelLink(e.target.value)}
            />

            <button
              type="button"
              disabled={busy}
              onClick={handleSaveReel}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
            >
              {busy ? "সংরক্ষণ হচ্ছে..." : reelEditId ? "✓ রিলস আপডেট করুন" : "🚀 রিলস হিসেবে প্রকাশ করুন"}
            </button>
          </div>

          {/* রিলস তালিকা: এডিট, ডিলিট, হাইড */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800">হোমপেজে থাকা রিলস তালিকা ({reels.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {reels.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border p-2 space-y-2 shadow-xs text-xs flex flex-col justify-between">
                  <div className="relative aspect-[9/13] rounded-xl overflow-hidden bg-black">
                    {r.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnail_url} alt="" className="size-full object-cover" />
                    ) : (
                      <video src={r.video_url} className="size-full object-cover" muted />
                    )}
                    <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                      Reel
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setReelEditId(r.id)
                        setReelTitle(r.title)
                        setReelVideoUrl(r.video_url)
                        setReelThumbUrl(r.thumbnail_url || "")
                        setReelLink(r.link_url || "")
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                      className="flex-1 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-center"
                    >
                      এডিট
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("এই রিলসটি মুছে ফেলতে চান?")) return
                        await deleteReel(token, r.id)
                        await loadData()
                      }}
                      className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                      title="মুছুন"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
