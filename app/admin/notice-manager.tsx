"use client"

import { useEffect, useState } from "react"
import {
  BRANCHES,
  MAX_NOTICE_FILE_MB,
  getNotices,
  getNoticeOwners,
  createNoticeReturningId,
  updateNotice,
  deleteNotice,
  uploadNoticeFile,
  getNoticeComments,
  deleteNoticeComment,
  fmtDateTime,
  isImageType,
} from "../../lib/notices"
import type { Notice, NoticeOwner, NoticeComment } from "../../lib/notices"
import { getDepartments, type Department } from "../../lib/faculties"
import { removeAllImages, getMe, SB_URL, SB_KEY, type UserType } from "../../lib/sb"
import ImageSection, { useImageSection } from "../../components/portal/image-section"
import FbPostComposer from "../../components/admin/fb-post-composer"
import { Pin, Bell, GraduationCap, Briefcase, ShieldCheck } from "lucide-react"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50 cursor-pointer shadow-sm hover:bg-green-800 transition"

async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = document.createElement("canvas")
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("ছবি প্রসেস করা যায়নি"))), "image/jpeg", 0.82)
  )
}

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
            className="text-red-600 shrink-0 cursor-pointer hover:underline"
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

export default function NoticeManager({
  token,
  isAdmin,
  authorName,
  authorAvatar,
  currentUserId,
  userType,
}: {
  token: string
  isAdmin: boolean
  authorName?: string
  authorAvatar?: string | null
  currentUserId?: string
  userType?: UserType
}) {
  const [myId, setMyId] = useState<string>(currentUserId || "")
  const [myType, setMyType] = useState<UserType | undefined>(userType)

  const [list, setList] = useState<Notice[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [owners, setOwners] = useState<Record<string, any>>({})
  const [editId, setEditId] = useState<string | null>(null)
  const [branch, setBranch] = useState<string>(BRANCHES[0].key)
  const [deptId, setDeptId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [ref, setRef] = useState("")
  const [body, setBody] = useState("")
  const [link, setLink] = useState("")
  const [embedMediaUrl, setEmbedMediaUrl] = useState("")
  const [showName, setShowName] = useState(true)
  const [pinned, setPinned] = useState(false)
  const [expiry, setExpiry] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [old, setOld] = useState<{ url: string; name: string | null; type: string | null } | null>(null)
  const [openC, setOpenC] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // ফেসবুক-স্টাইল মোড স্টেট
  const [fbMode, setFbMode] = useState(false)
  const [fbEditNotice, setFbEditNotice] = useState<Notice | null>(null)

  const imgs = useImageSection("notice")

  useEffect(() => {
    if (!myId) {
      getMe(token).then((p) => {
        if (p) {
          setMyId(p.id)
          setMyType(p.user_type)
        }
      }).catch(() => {})
    }
  }, [token, myId])

  async function load() {
    const [ns, osRows, depts] = await Promise.all([
      getNotices(token, true),
      fetch(
        `${SB_URL}/rest/v1/board_notice_owners?select=notice_id,user_id,created_at,profiles(full_name)`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` }, cache: "no-store" }
      )
        .then((r) => (r.ok ? r.json() : getNoticeOwners(token)))
        .catch(() => getNoticeOwners(token)),
      getDepartments(),
    ])
    setList(ns)
    setDepartments(depts)
    const m: Record<string, any> = {}
    if (Array.isArray(osRows)) {
      osRows.forEach((o: any) => {
        if (o?.notice_id) m[o.notice_id] = o
      })
    }
    setOwners(m)
  }

  useEffect(() => { load() }, [token])

  // শুধু অ্যাডমিন সব নোটিশ এডিট করতে পারবেন, আর শিক্ষকরা/অন্যরা শুধু নিজেদের নোটিশ এডিট করতে পারবেন
  const canEdit = (n: Notice) => {
    if (isAdmin) return true
    const o = owners[n.id]
    if (!o) return false
    if (o.user_id && myId) {
      return o.user_id === myId
    }
    return Boolean(o)
  }

  const bnBranch = (k: string) => BRANCHES.find((b) => b.key === k)?.bn || k

  function reset() {
    setEditId(null); setBranch(BRANCHES[0].key); setDeptId(""); setTitle(""); setHeading(""); setRef("")
    setBody(""); setLink(""); setEmbedMediaUrl(""); setShowName(true); setPinned(false); setExpiry("")
    setFile(null); setOld(null)
    imgs.reset()
  }

  async function startEdit(n: Notice) {
    setEditId(n.id); setBranch(n.branch); setDeptId(n.department_id || ""); setTitle(n.title); setHeading(n.heading || "")
    setRef(n.ref_number || ""); setBody(n.body || ""); setLink(n.link_url || "")
    setEmbedMediaUrl(n.embed_media_url || "")
    setShowName(n.show_name); setPinned(n.is_pinned)
    setExpiry(n.expires_at ? new Date(n.expires_at).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) : "")
    setFile(null)
    setOld(n.file_url ? { url: n.file_url, name: n.file_name, type: n.file_type } : null)
    window.scrollTo({ top: 0, behavior: "smooth" })
    await imgs.load(n.id)
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
    const hasImages = imgs.visible.length + imgs.fresh.length > 0

    if (!title.trim()) { setMsg("❌ শিরোনাম লিখুন"); return }
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      setMsg("❌ লিংক http:// বা https:// দিয়ে শুরু হতে হবে")
      return
    }
    if (embedMediaUrl.trim() && !/^https?:\/\//i.test(embedMediaUrl.trim())) {
      setMsg("❌ ভিডিও/ছবির লিংক http:// বা https:// দিয়ে শুরু হতে হবে")
      return
    }
    if (!body.trim() && !link.trim() && !embedMediaUrl.trim() && !file && !old && !hasImages) {
      setMsg("❌ লেখা, লিংক, ভিডিও, ছবি বা ফাইল— অন্তত একটি দিন")
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

      const up = await imgs.uploadNew(token, shrink, (i, n) => setMsg(`ছবি আপলোড হচ্ছে (${i}/${n})...`))

      const data = {
        branch,
        department_id: branch === "department" && deptId ? deptId : null,
        title: title.trim(),
        heading: heading.trim() || null,
        body: body.trim() || null,
        ref_number: ref.trim() || null,
        link_url: link.trim() || null,
        embed_media_url: embedMediaUrl.trim() || null,
        file_url: f ? f.url : null,
        file_name: f ? f.name : null,
        file_type: f ? f.type : null,
        show_name: showName,
        is_pinned: isAdmin ? pinned : false,
        expires_at: expiry ? new Date(expiry + "T23:59:59+06:00").toISOString() : null,
      }

      let noticeId = editId
      if (editId) {
        await updateNotice(token, editId, data)
      } else {
        noticeId = await createNoticeReturningId(token, data)
        // নতুন নোটিশ হলে মালিকানা সংরক্ষণ
        if (noticeId && myId) {
          await fetch(`${SB_URL}/rest/v1/board_notice_owners`, {
            method: "POST",
            headers: {
              apikey: SB_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Prefer: "resolution=ignore-duplicates,return=minimal",
            },
            body: JSON.stringify({ notice_id: noticeId, user_id: myId }),
          }).catch(() => {})
        }
      }

      let warn = ""
      if (noticeId) {
        try {
          await imgs.commit(token, noticeId, up, null)
        } catch {
          warn = " (নোটিশ সেভ হয়েছে, কিন্তু ছবির তালিকা জোড়া যায়নি)"
        }
      }

      reset()
      setMsg("✅ নোটিশ সফলভাবে সেভ হয়েছে" + warn)
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
      {/* ব্যবহারকারী ভূমিকা অনুযায়ী নির্দেশনামূলক ব্যানার */}
      {myType === "teacher" && !isAdmin && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 flex items-center gap-2">
          <GraduationCap className="size-4 text-indigo-700 shrink-0" />
          <span><b>শিক্ষক প্যানেল:</b> আপনি সরাসরি নোটিশ প্রকাশ করতে পারবেন এবং আপনার দেওয়া নোটিশগুলো এডিট ও ডিলিট করতে পারবেন।</span>
        </div>
      )}
      {myType === "staff" && !isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-center gap-2">
          <Briefcase className="size-4 text-amber-700 shrink-0" />
          <span><b>কর্মকর্তা প্যানেল:</b> আপনি সরাসরি নোটিশ প্রকাশ ও নিজের নোটিশ পরিচালনা করার অনুমতিপ্রাপ্ত।</span>
        </div>
      )}

      {/* পোস্ট করার মোড সুইচার */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setFbMode(false); setFbEditNotice(null) }}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            !fbMode ? "bg-green-700 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📝 ক্লাসিক ফর্ম
        </button>
        <button
          type="button"
          onClick={() => { setFbEditNotice(null); setFbMode(true) }}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            fbMode ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📱 ফেসবুক স্টাইল পোস্ট
        </button>
      </div>

      {fbMode && (
        <FbPostComposer
          mode="notice"
          token={token}
          isAdmin={isAdmin}
          authorName={authorName}
          authorAvatar={authorAvatar}
          shrink={shrink}
          departments={departments}
          editItem={fbEditNotice}
          onCancel={() => { setFbMode(false); setFbEditNotice(null) }}
          onSuccess={async (m) => {
            setFbMode(false)
            setFbEditNotice(null)
            setMsg(m)
            await load()
          }}
        />
      )}

      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold text-base text-gray-800">
          {editId ? "✏️ নোটিশ এডিট করুন" : "➕ নতুন নোটিশ প্রকাশ করুন"}
        </h2>

        <select className={inp} value={branch} onChange={(e) => setBranch(e.target.value)}>
          {BRANCHES.map((b) => <option key={b.key} value={b.key}>{b.bn}</option>)}
        </select>

        {branch === "department" && (
          <div className="space-y-1.5 rounded-xl border border-green-600 bg-green-50/60 p-3 animate-in fade-in">
            <label className="text-xs font-bold text-green-900 block">
              📌 কোন ডিপার্টমেন্টের নোটিশ? (বাছাই করলে সরাসরি ওই ডিপার্টমেন্ট পেজেও সিঙ্ক হয়ে যাবে):
            </label>
            <select
              className={inp}
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
            >
              <option value="">— সব ডিপার্টমেন্ট (সাধারণ নোটিশ) —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.code ? `(${d.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <input className={inp} placeholder="শিরোনাম (টাইটেল) *" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inp} placeholder="হেডিং (উপশিরোনাম - ঐচ্ছিক)" value={heading} onChange={(e) => setHeading(e.target.value)} />
        <input className={inp} placeholder="রেফ নম্বর (ঐচ্ছিক, যেমন MBSTU-RU/2026/015)" value={ref} onChange={(e) => setRef(e.target.value)} />
        <textarea className={inp} rows={6} placeholder="নোটিশের লেখা..." value={body} onChange={(e) => setBody(e.target.value)} />

        <div className="space-y-1 rounded-xl border border-emerald-300 bg-emerald-50/60 p-3">
          <label className="text-xs font-bold text-emerald-900 block">
            🎥 ভিডিও / ছবির লিংক (YouTube, Facebook ভিডিও বা ছবির সরাসরি লিংক - ঐচ্ছিক):
          </label>
          <input
            className={inp}
            placeholder="যেমন: https://youtube.com/watch?v=... বা ফেসবুক ভিডিও লিংক"
            value={embedMediaUrl}
            onChange={(e) => setEmbedMediaUrl(e.target.value)}
          />
          <p className="text-[11px] text-emerald-700">
            💡 লিংক দিলে নোটিশে শিরোনাম ও লেখার ঠিক নিচে স্বয়ংক্রিয়ভাবে ভিডিও চলবে বা ছবি দেখাবে।
          </p>
        </div>

        <input className={inp} type="url" placeholder="অন্য ওয়েবসাইটের লিংক (https://...)" value={link} onChange={(e) => setLink(e.target.value)} />

        <ImageSection s={imgs} />

        <label className="block">
          <span className="text-sm text-gray-600">ছবি / PDF / DOC ফাইল (ডাউনলোডের জন্য, সর্বোচ্চ {MAX_NOTICE_FILE_MB} MB)</span>
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
            <button type="button" onClick={() => setOld(null)} className="text-sm text-red-600 cursor-pointer">ফাইল সরান</button>
          </div>
        )}

        <label className="block">
          <span className="text-sm text-gray-600">মেয়াদ শেষের তারিখ (ঐচ্ছিক, ফাঁকা = সবসময় থাকবে)</span>
          <input className={inp} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
          আমার নাম নোটিশে দেখান
        </label>

        {isAdmin && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            📌 পিন করুন (সবার উপরে থাকবে)
          </label>
        )}

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "প্রকাশ করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline cursor-pointer text-gray-600">বাতিল</button>}
        {msg && <p className="text-sm font-semibold text-center text-green-800 bg-green-50 p-2.5 rounded-xl border border-green-200">{msg}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-gray-800">সকল নোটিশের তালিকা ({list.length}টি)</h2>
        {list.map((n) => {
          const o = owners[n.id]
          const expired = !!n.expires_at && new Date(n.expires_at) < new Date()
          const dept = departments.find((d) => d.id === n.department_id)
          const userCanManage = canEdit(n)

          return (
            <div key={n.id} className="bg-white rounded-2xl shadow p-3.5 text-sm space-y-2 border border-slate-200">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-green-100 text-green-800 font-semibold rounded-full px-2.5 py-0.5">
                  {dept ? `🎓 ${dept.name}` : bnBranch(n.branch)}
                </span>
                {n.is_pinned && <span className="bg-amber-100 text-amber-800 font-bold rounded-full px-2 py-0.5">📌 পিন</span>}
                {n.embed_media_url && <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 font-semibold">🎥 মিডিয়া</span>}
                {expired && <span className="bg-gray-200 rounded-full px-2 py-0.5 text-gray-600">মেয়াদ শেষ</span>}
                {!n.show_name && <span className="bg-gray-100 rounded-full px-2 py-0.5 text-gray-500">নাম লুকানো</span>}
              </div>
              <p className="font-bold text-gray-900 text-base">{n.title}</p>
              <p className="text-xs text-gray-500">{fmtDateTime(n.created_at)}</p>
              {o && (
                <p className="text-xs text-gray-700">
                  দিয়েছেন: <b>{o.profiles?.full_name || "সদস্য"}</b>
                </p>
              )}
              {userCanManage ? (
                <div className="flex flex-wrap gap-4 pt-1 font-bold text-xs">
                  <button onClick={() => startEdit(n)} className="text-green-700 hover:underline cursor-pointer">এডিট</button>
                  <button
                    onClick={() => {
                      setFbEditNotice(n)
                      setFbMode(true)
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    FB এডিট
                  </button>
                  {isAdmin && (
                    <button onClick={() => run(() => updateNotice(token, n.id, { is_pinned: !n.is_pinned }))} className="text-gray-700 hover:underline cursor-pointer">
                      {n.is_pinned ? "পিন সরান" : "পিন করুন"}
                    </button>
                  )}
                  <button onClick={() => setOpenC(openC === n.id ? "" : n.id)} className="text-gray-700 hover:underline cursor-pointer">কমেন্ট</button>
                  <button
                    onClick={() =>
                      run(async () => {
                        try { await removeAllImages(token, "notice", n.id) } catch {}
                        await deleteNotice(token, n.id)
                      }, "সত্যিই নোটিশটি মুছে ফেলবেন?")
                    }
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400">শুধু দেখা যাবে (অন্যের নোটিশ)</p>
              )}
              {openC === n.id && <ManageComments id={n.id} token={token} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
