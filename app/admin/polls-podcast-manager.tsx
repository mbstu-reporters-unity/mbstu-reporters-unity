"use client"

import React, { useEffect, useState } from "react"
import {
  BarChart3,
  Headphones,
  Plus,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  Upload,
} from "lucide-react"
import { uploadImage } from "../../lib/sb"
import {
  getCampusPolls,
  createCampusPoll,
  updateCampusPoll,
  deleteCampusPoll,
  getPollVotes,
  getCampusPodcasts,
  createCampusPodcast,
  updateCampusPodcast,
  deleteCampusPodcast,
  type CampusPoll,
  type PollVoteRow,
  type CampusPodcast,
} from "../../lib/polls-podcasts"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const btnPrimary =
  "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-sm transition"

export default function PollsPodcastManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [subTab, setSubTab] = useState<"polls" | "podcasts">("polls")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // পোল স্টেট
  const [polls, setPolls] = useState<CampusPoll[]>([])
  const [votes, setVotes] = useState<PollVoteRow[]>([])
  const [question, setQuestion] = useState("")
  const [optionsText, setOptionsText] = useState(["হ্যাঁ", "না", "মতামত নেই"])

  // পডকাস্ট স্টেট
  const [podcasts, setPodcasts] = useState<CampusPodcast[]>([])
  const [podEditId, setPodEditId] = useState<string | null>(null)
  const [seriesName, setSeriesName] = useState("ক্যাম্পাস পডকাস্ট")
  const [episodeNum, setEpisodeNum] = useState("")
  const [podTitle, setPodTitle] = useState("")
  const [podDesc, setPodDesc] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [hostName, setHostName] = useState("")
  const [guestName, setGuestName] = useState("")
  const [duration, setDuration] = useState("")
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)

  async function loadAll() {
    const [pRows, podRows] = await Promise.all([
      getCampusPolls(true),
      getCampusPodcasts(true),
    ])
    setPolls(pRows)
    setPodcasts(podRows)
    if (pRows.length > 0) {
      setVotes(await getPollVotes(pRows.map((p) => p.id)))
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  /* ---------- পোল হ্যান্ডলার ---------- */
  async function handleSavePoll() {
    const cleanOpts = optionsText
      .map((t, i) => ({ id: `opt_${i + 1}`, label: t.trim() }))
      .filter((o) => o.label.length > 0)

    if (!question.trim() || cleanOpts.length < 2) {
      setMsg("❌ জরিপের প্রশ্ন এবং কমপক্ষে ২টি অপশন লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      await createCampusPoll(token, {
        question: question.trim(),
        options: cleanOpts,
        is_active: true,
      })
      setQuestion("")
      setOptionsText(["হ্যাঁ", "না", "মতামত নেই"])
      await loadAll()
      setMsg("✅ নতুন জরিপ সফলভাবে হোমপেজে লাইভ হয়েছে")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "তৈরি করা যায়নি"))
    }
    setBusy(false)
  }

  /* ---------- পডকাস্ট হ্যান্ডলার ---------- */
  function resetPodcastForm() {
    setPodEditId(null)
    setSeriesName("ক্যাম্পাস পডকাস্ট")
    setEpisodeNum("")
    setPodTitle("")
    setPodDesc("")
    setMediaUrl("")
    setHostName("")
    setGuestName("")
    setDuration("")
    setThumbUrl(null)
    setThumbFile(null)
  }

  function startEditPodcast(ep: CampusPodcast) {
    setPodEditId(ep.id)
    setSeriesName(ep.series_name || "ক্যাম্পাস পডকাস্ট")
    setEpisodeNum(ep.episode_number || "")
    setPodTitle(ep.title)
    setPodDesc(ep.description || "")
    setMediaUrl(ep.media_url)
    setHostName(ep.host_name || "")
    setGuestName(ep.guest_name || "")
    setDuration(ep.duration || "")
    setThumbUrl(ep.thumbnail_url || null)
    setThumbFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSavePodcast() {
    if (!podTitle.trim() || !mediaUrl.trim()) {
      setMsg("❌ পর্বের শিরোনাম এবং ইউটিউব/স্পটিফাই/অডিও-ভিডিও লিংক লিখুন")
      return
    }
    if (!/^https?:\/\//i.test(mediaUrl.trim())) {
      setMsg("❌ মিডিয়া লিংক অবশ্যই https:// দিয়ে শুরু হতে হবে")
      return
    }

    setBusy(true)
    setMsg("")
    try {
      let finalThumb = thumbUrl
      if (thumbFile) {
        setMsg("থাম্বনেইল আপলোড হচ্ছে...")
        finalThumb = await uploadImage(token, await shrink(thumbFile))
      }

      const payload: Partial<CampusPodcast> = {
        series_name: seriesName.trim() || "ক্যাম্পাস পডকাস্ট",
        episode_number: episodeNum.trim() || null,
        title: podTitle.trim(),
        description: podDesc.trim() || null,
        media_url: mediaUrl.trim(),
        thumbnail_url: finalThumb,
        host_name: hostName.trim() || null,
        guest_name: guestName.trim() || null,
        duration: duration.trim() || null,
        is_active: true,
      }

      if (podEditId) {
        await updateCampusPodcast(token, podEditId, payload)
        setMsg("✅ পডকাস্ট পর্ব আপডেট হয়েছে")
      } else {
        await createCampusPodcast(token, payload)
        setMsg("✅ নতুন পডকাস্ট পর্ব প্রকাশিত হয়েছে")
      }
      resetPodcastForm()
      await loadAll()
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সংরক্ষণ করা যায়নি"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSubTab("polls")
            setMsg("")
          }}
          className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "polls" ? "bg-cyan-700 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="size-4" />
          <span>১. জরিপ / পোল ({polls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab("podcasts")
            setMsg("")
          }}
          className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
            subTab === "podcasts"
              ? "bg-purple-700 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Headphones className="size-4" />
          <span>২. পডকাস্ট ও সিরিজ ({podcasts.length})</span>
        </button>
      </div>

      {msg && (
        <p className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </p>
      )}

      {/* ==================== ট্যাব ১: জরিপ / পোল ==================== */}
      {subTab === "polls" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 border-b pb-2">
              ➕ নতুন পাঠক জরিপ / পোল তৈরি করুন
            </h2>
            <input
              className={inp}
              placeholder="জরিপের প্রশ্ন লিখুন * (যেমন: কেন্দ্রীয় লাইব্রেরির সময়সীমা কেমন হওয়া উচিত?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">ভোটের অপশনসমূহ:</label>
                {optionsText.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setOptionsText([...optionsText, ""])}
                    className="text-xs text-cyan-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" /> অপশন যোগ
                  </button>
                )}
              </div>

              {optionsText.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className={inp}
                    placeholder={`অপশন ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const next = [...optionsText]
                      next[idx] = e.target.value
                      setOptionsText(next)
                    }}
                  />
                  {optionsText.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptionsText(optionsText.filter((_, i) => i !== idx))}
                      className="text-rose-600 p-1.5 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className={btnPrimary} onClick={handleSavePoll} disabled={busy}>
              {busy ? "প্রকাশ হচ্ছে..." : "🚀 জরিপ প্রকাশ করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {polls.map((poll) => {
              const pVotes = votes.filter((v) => v.poll_id === poll.id)
              return (
                <div
                  key={poll.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{poll.question}</p>
                      <p className="text-[11px] text-slate-500">
                        মোট ভোট: <b>{pVotes.length}</b> · স্ট্যাটাস:{" "}
                        <b className={poll.is_active ? "text-emerald-700" : "text-amber-700"}>
                          {poll.is_active ? "সক্রিয়" : "বন্ধ"}
                        </b>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-slate-100 pt-2 font-bold">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateCampusPoll(token, poll.id, { is_active: !poll.is_active })
                        await loadAll()
                      }}
                      className="text-amber-700 hover:underline cursor-pointer"
                    >
                      {poll.is_active ? "বন্ধ করুন" : "চালু করুন"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("জরিপটি মুছে ফেলবেন?")) return
                        await deleteCampusPoll(token, poll.id)
                        await loadAll()
                      }}
                      className="ml-auto text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" /> মুছুন
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== ট্যাব ২: পডকাস্ট ও ভিডিও সিরিজ ==================== */}
      {subTab === "podcasts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                {podEditId ? "✏️ পডকাস্ট পর্ব এডিট করুন" : "➕ নতুন পডকাস্ট / ভিডিও সিরিজ পর্ব"}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/podcast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>লাইভ পাতা</span>
                  <ExternalLink className="size-3" />
                </a>
                {podEditId && (
                  <button
                    type="button"
                    onClick={resetPodcastForm}
                    className="text-xs text-rose-600 font-bold"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="সিরিজের নাম (যেমন: ক্যাম্পাস আলাপন)"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
              />
              <input
                className={inp}
                placeholder="পর্ব নম্বর (যেমন: পর্ব ০১)"
                value={episodeNum}
                onChange={(e) => setEpisodeNum(e.target.value)}
              />
            </div>

            <input
              className={inp}
              placeholder="পর্বের শিরোনাম *"
              value={podTitle}
              onChange={(e) => setPodTitle(e.target.value)}
            />
            <input
              className={inp}
              placeholder="YouTube, Spotify অথবা MP3/MP4 লিংক *"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            <textarea
              className={inp}
              rows={2}
              placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)"
              value={podDesc}
              onChange={(e) => setPodDesc(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                className={inp}
                placeholder="অতিথির নাম"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <input
                className={inp}
                placeholder="সঞ্চালক (Host)"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
              <input
                className={inp}
                placeholder="সময়কাল (যেমন: ১৮ মিনিট)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="rounded-xl border p-2.5 bg-slate-50 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-purple-700" />
                <span>কভার ছবি (অডিও পডকাস্টের জন্য ঐচ্ছিক):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                  className="text-xs ml-1"
                />
              </label>
            </div>

            <button className={btnPrimary} onClick={handleSavePodcast} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : podEditId ? "পর্ব আপডেট করুন" : "➕ পর্ব প্রকাশ করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {podcasts.map((ep) => (
              <div
                key={ep.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 text-xs space-y-2 shadow-xs"
              >
                <p className="font-bold text-sm text-slate-900">
                  {ep.series_name} {ep.episode_number ? `(${ep.episode_number})` : ""} — {ep.title}
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-2 font-bold">
                  <button
                    type="button"
                    onClick={() => startEditPodcast(ep)}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
                  >
                    <Edit3 className="size-3" /> এডিট
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateCampusPodcast(token, ep.id, { is_active: !ep.is_active })
                      await loadAll()
                    }}
                    className="text-amber-700 hover:underline cursor-pointer"
                  >
                    {ep.is_active ? "হাইড" : "দেখান"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("পর্বটি মুছবেন?")) return
                      await deleteCampusPodcast(token, ep.id)
                      await loadAll()
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="size-3" /> মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
