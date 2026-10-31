"use client"

import { useEffect, useMemo, useState } from "react"
import { getLeaders, addLeader, updateLeader, removeLeader, uploadImage, POSITIONS } from "../../lib/sb"
import type { Profile } from "../../lib/sb"
import { DEFAULT_STYLE, getGlobalStyle } from "@/lib/photo-style"
import type { LeaderWithStyle, PhotoStyle } from "@/lib/photo-style"
import { PhotoFrame } from "@/components/portal/photo-frame"
import { GlobalStylePanel, StyleControls } from "./photo-style-editor"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

export default function LeadershipManager({
  token,
  members,
  shrink,
}: {
  token: string
  members: Profile[]
  shrink: (f: File) => Promise<Blob>
}) {
  const [list, setList] = useState<LeaderWithStyle[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState("")
  const [position, setPosition] = useState<string>(POSITIONS[0].key)
  const [name, setName] = useState("")
  const [dept, setDept] = useState("")
  const [message, setMessage] = useState("")
  const [order, setOrder] = useState(0)
  const [visible, setVisible] = useState(true)
  const [oldPhoto, setOldPhoto] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [globalStyle, setGlobalStyle] = useState<PhotoStyle>(DEFAULT_STYLE)
  const [custom, setCustom] = useState(false)
  const [style, setStyle] = useState<PhotoStyle>(DEFAULT_STYLE)

  async function load() {
    setList((await getLeaders(token)) as LeaderWithStyle[])
  }
  useEffect(() => { load() }, [token])
  useEffect(() => {
    getGlobalStyle().then((g) => {
      setGlobalStyle(g)
      setStyle(g)
    })
  }, [])

  const available = members.filter((m) => !list.some((l) => l.profile_id === m.id))
  const label = (k: string) => POSITIONS.find((p) => p.key === k)?.bn || k
  const filePreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  const previewSrc = filePreview || oldPhoto

  function reset() {
    setEditId(null); setProfileId(""); setPosition(POSITIONS[0].key); setName("")
    setDept(""); setMessage(""); setOrder(0); setVisible(true); setOldPhoto(null); setFile(null)
    setCustom(false); setStyle(globalStyle)
  }

  function pickMember(id: string) {
    setProfileId(id)
    const m = members.find((x) => x.id === id)
    if (m) {
      setName(m.full_name || "")
      setDept(m.department || "")
      setOldPhoto(m.avatar_url || null)
    }
  }

  function startEdit(l: LeaderWithStyle) {
    setEditId(l.id); setProfileId(l.profile_id); setPosition(l.position)
    setName(l.display_name); setDept(l.department || ""); setMessage(l.message || "")
    setOrder(l.sort_order); setVisible(l.is_visible); setOldPhoto(l.photo_url); setFile(null)
    setCustom(!!l.photo_style)
    setStyle(l.photo_style ? { ...globalStyle, ...l.photo_style } : globalStyle)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function save() {
    if (!profileId || !name.trim()) {
      setMsg("❌ সদস্য বেছে নিন ও নাম লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let photo = oldPhoto
      if (file) photo = await uploadImage(token, await shrink(file))
      const data = {
        profile_id: profileId,
        position,
        sort_order: Number(order) || 0,
        display_name: name.trim(),
        department: dept.trim() || null,
        message: message.trim() || null,
        photo_url: photo,
        is_visible: visible,
        photo_style: custom ? style : null,
      }
      if (editId) await updateLeader(token, editId, data)
      else await addLeader(token, data)
      reset()
      setMsg("✅ সেভ হয়েছে")
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function run(fn: () => Promise<void>, ask?: string) {
    if (ask && !confirm(ask)) return
    try { await fn(); await load() } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
  }

  return (
    <div className="space-y-4">
      <GlobalStylePanel
        token={token}
        previewSrc={list[0]?.photo_url}
        previewName={list[0]?.display_name}
        onSaved={(s) => {
          setGlobalStyle(s)
          if (!custom) setStyle(s)
        }}
      />

      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{editId ? "নেতৃত্বের তথ্য এডিট" : "নেতৃত্বে যোগ করুন"}</h2>

        {!editId && (
          <select className={inp} value={profileId} onChange={(e) => pickMember(e.target.value)}>
            <option value="">— সদস্য বেছে নিন —</option>
            {available.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} {m.role === "admin" ? "(অ্যাডমিন)" : ""}
              </option>
            ))}
          </select>
        )}

        <select className={inp} value={position} onChange={(e) => setPosition(e.target.value)}>
          {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.bn} ({p.en})</option>)}
        </select>
        <input className={inp} placeholder="নাম *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inp} placeholder="বিভাগ (যেমন: Dept. of English)" value={dept} onChange={(e) => setDept(e.target.value)} />
        <textarea className={inp} rows={5} placeholder="বাণী / বক্তব্য" value={message} onChange={(e) => setMessage(e.target.value)} />
        <label className="block">
          <span className="text-sm text-gray-600">ক্রম (একই পদে ছোট সংখ্যা আগে দেখাবে)</span>
          <input className={inp} type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          হোমপেজে দেখান
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">ছবি (ফাঁকা রাখলে প্রোফাইলের ছবি)</span>
          <input className="block mt-1 text-sm" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <div className="space-y-3 rounded-xl border p-3">
          <p className="text-sm font-semibold">ছবির স্টাইল</p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={custom}
              onChange={(e) => {
                setCustom(e.target.checked)
                if (e.target.checked) setStyle(globalStyle)
              }}
            />
            <span>এই সদস্যের জন্য আলাদা স্টাইল (বন্ধ থাকলে সবার ডিফল্ট স্টাইল প্রযোজ্য)</span>
          </label>
          {custom ? (
            <StyleControls value={style} onChange={setStyle} previewSrc={previewSrc} previewName={name} />
          ) : (
            <div className="flex justify-center py-4">
              <PhotoFrame
                src={previewSrc}
                alt={name || "preview"}
                style={globalStyle}
                fallback={<div className="flex h-full w-full items-center justify-center bg-green-700 text-xl font-bold text-white">ছবি</div>}
              />
            </div>
          )}
        </div>

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "যোগ করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline">বাতিল</button>}
        {msg && <p className="text-sm">{msg}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">বর্তমান নেতৃত্ব ({list.length})</h2>
        {list.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl shadow p-3 text-sm space-y-2">
            <div className="flex items-center gap-3">
              {l.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">{l.display_name}</p>
                <p className="text-gray-500">
                  {label(l.position)}
                  {!l.is_visible && " · লুকানো"}
                  {l.photo_style && " · আলাদা স্টাইল"}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => startEdit(l)} className="text-green-700">এডিট</button>
              <button onClick={() => run(() => updateLeader(token, l.id, { is_visible: !l.is_visible }))} className="text-gray-700">
                {l.is_visible ? "লুকান" : "দেখান"}
              </button>
              <button onClick={() => run(() => removeLeader(token, l.id), "নেতৃত্ব থেকে বাদ দেবেন?")} className="text-red-600">বাদ দিন</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-gray-500">এখনো কাউকে যোগ করা হয়নি।</p>}
      </div>
    </div>
  )
}
