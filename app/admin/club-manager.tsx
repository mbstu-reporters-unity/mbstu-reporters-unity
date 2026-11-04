"use client"

import { useEffect, useState } from "react"
import { getCampusClubs, createCampusClub, updateCampusClub, deleteCampusClub } from "../../lib/clubs"
import type { ClubItem } from "../../lib/clubs"

const inp = "w-full border rounded-xl px-3 py-2 text-base bg-white"
const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"

const ICONS = ["star", "megaphone", "book", "briefcase", "mic", "camera", "baby", "footprints", "flask", "droplet"]

export default function ClubManager({ token }: { token: string }) {
  const [list, setList] = useState<ClubItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  
  // ফর্ম স্টেট (সব ঐচ্ছিক)
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [tag, setTag] = useState("Social")
  const [icon, setIcon] = useState("star")
  const [activity, setActivity] = useState("")
  const [activityBn, setActivityBn] = useState("")
  const [date, setDate] = useState("")
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const [webUrl, setWebUrl] = useState("")
  const [committee, setCommittee] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [order, setOrder] = useState(0)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    setList(await getCampusClubs(token))
  }

  useEffect(() => {
    load()
  }, [])

  function reset() {
    setEditId(null); setName(""); setNameBn(""); setTag("Social"); setIcon("star")
    setActivity(""); setActivityBn(""); setDate(""); setFbUrl(""); setYtUrl("")
    setWebUrl(""); setCommittee(""); setContactInfo(""); setOrder(0)
  }

  function startEdit(c: ClubItem) {
    setEditId(c.id)
    setName(c.name)
    setNameBn(c.name_bn || "")
    setTag(c.tag || "General")
    setIcon(c.icon || "star")
    setActivity(c.activity || "")
    setActivityBn(c.activity_bn || "")
    setDate(c.date || "")
    setFbUrl(c.fb_url || "")
    setYtUrl(c.yt_url || "")
    setWebUrl(c.web_url || "")
    setCommittee(c.committee || "")
    setContactInfo(c.contact_info || "")
    setOrder(c.sort_order || 0)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function save() {
    if (!name.trim()) {
      setMsg("❌ অন্তত ক্লাবের ইংরেজি নামটি লিখুন")
      return
    }
    setBusy(true)
    setMsg("")
    try {
      const data = {
        name: name.trim(),
        name_bn: nameBn.trim() || null,
        tag: tag.trim() || "General",
        icon,
        activity: activity.trim() || null,
        activity_bn: activityBn.trim() || null,
        date: date.trim() || null,
        fb_url: fbUrl.trim() || null,
        yt_url: ytUrl.trim() || null,
        web_url: webUrl.trim() || null,
        committee: committee.trim() || null,
        contact_info: contactInfo.trim() || null,
        sort_order: Number(order) || 0,
        is_active: true,
      }

      if (editId) {
        await updateCampusClub(token, editId, data)
        setMsg("✅ ক্লাবের তথ্য আপডেট হয়েছে")
      } else {
        await createCampusClub(token, data)
        setMsg("✅ নতুন ক্লাব যোগ করা হয়েছে")
      }
      reset()
      await load()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  async function remove(id: string, clubName: string) {
    if (!confirm(`"${clubName}" ক্লাবটি মুছে ফেলতে চান?`)) return
    setBusy(true)
    try {
      await deleteCampusClub(token, id)
      await load()
      setMsg("✅ ক্লাব মুছে ফেলা হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "মুছতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{editId ? "ক্লাব এডিট করুন" : "নতুন ক্লাব যুক্ত করুন"}</h2>
        <p className="text-xs text-gray-500">সব তথ্য ঐচ্ছিক। আপনার কাছে যে তথ্য আছে শুধু সেগুলোই দিন।</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="ক্লাবের নাম (English) *" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inp} placeholder="ক্লাবের নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input className={inp} placeholder="ক্যাটেগরি/ট্যাগ (যেমন: Debate, Blood)" value={tag} onChange={(e) => setTag(e.target.value)} />
          <select className={inp} value={icon} onChange={(e) => setIcon(e.target.value)}>
            {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </div>

        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (English)" value={activity} onChange={(e) => setActivity(e.target.value)} />
        <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বা সাম্প্রতিক কার্যক্রম (বাংলা)" value={activityBn} onChange={(e) => setActivityBn(e.target.value)} />

        <input className={inp} placeholder="তারিখ বা সময়কাল (যেমন: 27 Oct 2026)" value={date} onChange={(e) => setDate(e.target.value)} />

        <div className="space-y-2 border-t pt-2">
          <p className="text-xs font-semibold text-gray-600">সোশ্যাল মিডিয়া ও ওয়েব লিংক (ঐচ্ছিক):</p>
          <input className={inp} placeholder="ফেসবুক পেজ লিংক (https://facebook.com/...)" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
          <input className={inp} placeholder="ইউটিউব চ্যানেল লিংক (https://youtube.com/...)" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
          <input className={inp} placeholder="ওয়েবসাইট লিংক (https://...)" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} />
        </div>

        <div className="space-y-2 border-t pt-2">
          <p className="text-xs font-semibold text-gray-600">কমিটি ও যোগাযোগ (ঐচ্ছিক):</p>
          <textarea className={inp} rows={2} placeholder="কমিটির তথ্য (যেমন: সভাপতি: নাম, সম্পাদক: নাম)" value={committee} onChange={(e) => setCommittee(e.target.value)} />
          <input className={inp} placeholder="যোগাযোগের ইমেইল বা ফোন" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
        </div>

        <label className="block text-xs text-gray-600">
          ক্রম / Serial Order (ছোট সংখ্যা আগে দেখাবে):
          <input className={inp} type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </label>

        <button className={btn} onClick={save} disabled={busy}>
          {busy ? "অপেক্ষা করুন..." : editId ? "আপডেট করুন" : "যুক্ত করুন"}
        </button>
        {editId && <button onClick={reset} className="w-full text-sm underline text-gray-600">বাতিল</button>}
        {msg && <p className="text-sm">{msg}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">বর্তমান ক্লাবসমূহ ({list.length})</h2>
        {list.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow p-3 text-sm flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-base">{c.name}</p>
              <p className="text-xs text-gray-500">{c.name_bn || "বাংলা নাম নেই"} · ট্যাগ: {c.tag}</p>
              <div className="flex gap-2 text-xs text-blue-600 mt-1">
                {c.fb_url && <span>[FB]</span>}
                {c.yt_url && <span>[YT]</span>}
                {c.web_url && <span>[Web]</span>}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(c)} className="text-green-700">এডিট</button>
              <button onClick={() => remove(c.id, c.name)} className="text-red-600">মুছুন</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-gray-500">এখনো কোনো ক্লাব যুক্ত করা হয়নি।</p>}
      </div>
    </div>
  )
}
