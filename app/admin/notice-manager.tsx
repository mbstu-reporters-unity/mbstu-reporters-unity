"use client"

import { useEffect, useState } from "react"
import {
  BRANCHES, MAX_NOTICE_FILE_MB, getNotices, getNoticeOwners, createNotice, updateNotice,
  deleteNotice, uploadNoticeFile, getNoticeComments, deleteNoticeComment,
  fmtDateTime, isImageType,
} from "../../lib/notices"
import type { Notice, NoticeOwner, NoticeComment } from "../../lib/notices"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

function ManageComments({ id, token }: { id: string; token: string }) {
  const [list, setList] = useState<NoticeComment[]>([])
  const load = () => getNoticeComments(id).then(setList)
  useEffect(() => { load() }, [id])
  return (
    <div className="border-t pt-2 space-y-2">
      {list.map((c) => (
        <div key={c.id} className="flex justify-between gap-2 text-sm">
          <p><b>{c.name || "নামহীন"}:</b> {c.message}</p>
          <button
            className="text-red-600 shrink-0"
            onClick={async () => {
              if (!confirm("কমেন্ট মুছবেন?")) return
              try { await deleteNoticeComment(token, c.id); await load() } catch {}
            }}
          >
            মুছুন
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-sm text-gray-500">কোনো কমেন্ট নেই।</p>}
    </div>
  )
}

export default function NoticeManager({ token, isAdmin }: { token: string; isAdmin: boolean }) {
  const [list, setList] = useState<Notice[]>([])
  const [owners, setOwners] = useState<Record<string, NoticeOwner>>({})
  const [editId, setEditId] = useState<string | null>(null)
  const [branch, setBranch] = useState<string>(BRANCHES[0].key)
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [ref, setRef] = useState("")
  const [body, setBody] = useState("")
  const [link, setLink] = useState("")
  const [showName, setShowName] = useState(true)
  const [pinned, setPinned] = useState(false)
  const [expiry, setExpiry] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [old, setOld] = useState<{ url: string; name: string | null; type: string | null } | null>(null)
  const [openC, setOpenC] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    const [ns, os] = await Promise.all([getNotices(token, true), getNoticeOwners(token)])
    setList(ns)
    const m: Record<string, NoticeOwner> = {}
    os.forEach((o) => { m[o.notice_id] = o })
    setOwners(m)
  }
  useEffect(() => { load() }, [token])

  const canEdit = (n: Notice) => isAdmin || !!owners[n.id]
  const bn = (k: string) => BRANCHES.find((b) => b.key === k)?.bn || k

  function reset() {
    setEditId(null); setBranch(BRANCHES[0].key); setTitle(""); setHeading(""); setRef("")
    setBody(""); setLink(""); setShowName(true); setPinned(false); setExpiry("")
    setFile(null); setOld(null)
  }

  function startEdit(n: Notice) {
    setEditId(n.id); setBranch(n.branch); setTitle(n.title); setHeading(n.heading || "")
    setRef(n.ref_number || ""); setBody(n.body || ""); setLink(n.link_url || "")
    setShowName(n.show_name); setPinned(n.is_pinned)
    setExpiry(n.expires_at ? new Date(n.expires_at).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) : "")
    setFile(null)
    setOld(n.file_url ? { url: n.file_url, name: n.file_name, type: n.file_type } : null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function pickFile(f: File | null) {
    if (f && f.size > MAX_NOTICE_FILE_MB * 1024 * 1024) {
      setMsg(`❌ ফাইল ${MAX_NOTICE_FILE_MB} MB-এর বেশি হতে পারবে না`)
      setFile(null)
      return
    }
    setMsg("")
    setFile(f)
  }

  async function save() {
    if (!title.trim()) { setMsg("❌ শিরোনাম লিখুন"); return }
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      setMsg("❌ লিংক http:// বা https:// দিয়ে শুরু হতে হবে")
      return
    }
    if (!body.trim() && !link.trim() && !file && !old) {
      setMsg("❌ লেখা, লিংক বা ফাইল— অন্তত একটি দিন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      let f = old
      if (file) {
        setMsg("ফাইল আপলোড হচ্ছে, অপেক্ষা করুন...")
        const u = await uploadNoticeFile(token, file)
        f = { url: u.url, name: u.name, type: u.type }
      }
      const data = {
        branch,
        title: title.trim(),
        heading: heading.trim() || null,
        body: body.trim() || null,
        ref_number: ref.trim() || null,
        link_url: link.trim() || null,
        file_url: f ? f.url : null,
        file_name: f ? f.name : null,
        file_type: f ? f.type : null,
        show_name: showName,
        is_pinned: isAdmin ? pinned : false,
        expires_at: expiry ? new Date(expiry + "T23:59:59+06:00").toISOString() : null,
      }
      if (editId) await updateNotice(token, editId, data)
      else await createNotice(token, data)
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
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{editId ? "নোটিশ এডিট করুন" : "নতুন নোটিশ"}</h2>

        <select className={inp} value={branch} onChange={(e) => setBranch(e.target.value)}>
          {BRANCHES.map((b) => <option key={b.key} value={b.key}>{b.bn}</option>)}
        </select>
        <input className={inp} placeholder="শিরোনাম (টাইটেল) *" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inp} placeholder="হেডিং (উপশিরোনাম)" value={heading} onChange={(e) => setHeading(e.target.value)} />
        <input className={inp} placeholder="রেফ নম্বর (ঐচ্ছিক, যেমন MBSTU-RU/2026/015)" value={ref} onChange={(e) => setRef(e.target.value)} />
        <textarea className={inp} rows={6} placeholder="নোটিশের লেখা" value={body} onChange={(e) => setBody(e.target.value)} />
        <input className={inp} type="url" placeholder="অন্য ওয়েবসাইটের লিংক (https://...)" value={link} onChange={(e) => setLink(e.target.value)} />

        <label className="block">
          <span className="text-sm text-gray-600">ছবি / PDF / DOC (ফোন বা কম্পিউটার থেকে, সর্বোচ্চ {MAX_NOTICE_FILE_MB} MB)</span>
          <input
            className="block mt-1 text-sm"
            type="file"
            accept="image/*,application/pdf,.pdf,.doc,.docx"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
        </label>
        {file && <p className="text-xs text-gray-600">{file.name} ({(file.size / 1048576).toFixed(1)} MB)</p>}
        {!file && old && (
          <div className="space-y-1">
            {isImageType(old.type) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={old.url} alt="" className="w-full max-h-48 object-contain rounded-xl bg-gray-100" />
            )}
            <p className="text-xs text-gray-600">বর্তমান ফাইল: {old.name || "ফাইল"}</p>
            <button type="button" onClick={() => setOld(null)} className="text-sm text-red-600">ফাইল সরান</button>
          </div>
        )}

        <label className="block">
          <span className="text-sm text-gray-600">মেয়াদ শেষের তারিখ (ঐচ্ছিক, ফাঁকা = সবসময় থাকবে)</span>
          <input className={inp} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
          আমার নাম নোটিশে দেখান
        </label>
        <p className="text-xs text-gray-500">নাম লুকালেও অ্যাডমিন সবসময় দেখবেন কে ও কখন নোটিশ দিয়েছেন।</p>

        {isAdmin && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            📌 পিন করুন (সবার উপরে থাকবে)
          </label>
        )}

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "প্রকাশ করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline">বাতিল</button>}
        {msg && <p className="text-sm">{msg}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">সব নোটিশ ({list.length})</h2>
        {list.map((n) => {
          const o = owners[n.id]
          const expired = !!n.expires_at && new Date(n.expires_at) < new Date()
          return (
            <div key={n.id} className="bg-white rounded-2xl shadow p-3 text-sm space-y-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5">{bn(n.branch)}</span>
                {n.is_pinned && <span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">📌 পিন</span>}
                {expired && <span className="bg-gray-200 rounded-full px-2 py-0.5">মেয়াদ শেষ</span>}
                {!n.show_name && <span className="bg-gray-100 rounded-full px-2 py-0.5">নাম লুকানো</span>}
              </div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-xs text-gray-500">{fmtDateTime(n.created_at)}</p>
              {o && (
                <p className="text-xs text-gray-700">
                  দিয়েছেন: {o.profiles?.full_name || "(সদস্য নেই)"} · {fmtDateTime(o.created_at)}
                </p>
              )}
              {canEdit(n) ? (
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => startEdit(n)} className="text-green-700">এডিট</button>
                  {isAdmin && (
                    <button onClick={() => run(() => updateNotice(token, n.id, { is_pinned: !n.is_pinned }))} className="text-gray-700">
                      {n.is_pinned ? "পিন সরান" : "পিন করুন"}
                    </button>
                  )}
                  <button onClick={() => setOpenC(openC === n.id ? "" : n.id)} className="text-gray-700">কমেন্ট</button>
                  <button onClick={() => run(() => deleteNotice(token, n.id), "নোটিশ মুছে ফেলবেন?")} className="text-red-600">মুছুন</button>
                </div>
              ) : (
                <p className="text-xs text-gray-400">শুধু দেখা যাবে</p>
              )}
              {openC === n.id && <ManageComments id={n.id} token={token} />}
            </div>
          )
        })}
        {list.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো নোটিশ নেই।</p>}
      </div>
    </div>
  )
}
