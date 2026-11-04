"use client"

import { useEffect, useState } from "react"
import { getLimits, saveLimit, limitKey, CAT_CAMPUS, CAT_CLUB, CAT_STUDENT, getSectionText, saveSectionText } from "../../lib/sb"

const btn = "w-full bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50 hover:bg-green-800 transition-all shadow-md"
const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white"

// যে সেকশনগুলোর টেক্সট (উপ-টাইটেল, মূল টাইটেল, সাব-টাইটেল) এডিট করা যাবে
const SECTIONS_CONFIG = [
  { id: "leadership", name: "নেতৃত্বের বার্তা সেকশন", defaultEyebrow: "Leadership & At a Glance", defaultTitle: "নেতৃত্বের বার্তা", defaultDesc: "Messages from the leadership of MBSTU Reporters' Unity — committed to fearless, fair and factual campus journalism." },
  { id: "general_news", name: "ক্যাম্পাস সংবাদ সেকশন", defaultEyebrow: "Campus News", defaultTitle: "ক্যাম্পাস সংবাদ", defaultDesc: "Verified reports from across MBSTU." },
  { id: "club_news", name: "ক্যাম্পাস ক্লাবসমূহ সেকশন", defaultEyebrow: "Campus Clubs", defaultTitle: "ক্যাম্পাস ক্লাবসমূহ", defaultDesc: "মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের কার্যক্রম এবং পরিচিতি।" },
  { id: "notices", name: "ডিজিটাল নোটিশ বোর্ড সেকশন", defaultEyebrow: "Digital Notice Board", defaultTitle: "ডিজিটাল নোটিশ বোর্ড", defaultDesc: "Latest notices from the university, halls, departments and MBSTU Reporters' Unity." },
  { id: "student_corner", name: "স্টুডেন্ট কর্নার সেকশন", defaultEyebrow: "Student Corner", defaultTitle: "স্টুডেন্ট কর্নার", defaultDesc: "Opinions, creative writing, research highlights and achievements — written by MBSTU students." },
]

export default function SectionLimits({ token, cats }: { token: string; cats: string[] }) {
  const [vals, setVals] = useState<Record<string, number>>({})
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const fixed = [CAT_CAMPUS, CAT_CLUB, CAT_STUDENT]
  const names = [...fixed, ...cats.filter((c) => !fixed.includes(c))]

  useEffect(() => {
    async function loadData() {
      const limitsData = await getLimits()
      setVals(limitsData)

      const textObj: Record<string, string> = {}
      for (const s of SECTIONS_CONFIG) {
        textObj[`${s.id}_eyebrow`] = await getSectionText(`sec_${s.id}_eyebrow`, s.defaultEyebrow)
        textObj[`${s.id}_title`] = await getSectionText(`sec_${s.id}_title`, s.defaultTitle)
        textObj[`${s.id}_desc`] = await getSectionText(`sec_${s.id}_desc`, s.defaultDesc)
      }
      setTexts(textObj)
    }
    loadData()
  }, [])

  const get = (n: string) => vals[limitKey(n)] ?? 12
  const set = (n: string, v: number) =>
    setVals((o) => ({ ...o, [limitKey(n)]: Math.max(1, Math.min(500, v || 1)) }))

  async function saveAll() {
    setBusy(true)
    setMsg("")
    try {
      // ১. লিমিটগুলো সেভ করা
      const limitPromises = names.map((n) => saveLimit(token, limitKey(n), get(n)))
      
      // ২. টেক্সটগুলো (উপ-টাইটেল, মূল টাইটেল, সাব-টাইটেল) সেভ করা
      const textPromises = Object.keys(texts).map((k) => saveSectionText(token, `sec_${k}`, texts[k]))

      await Promise.all([...limitPromises, ...textPromises])
      setMsg("✅ সফলভাবে সেভ হয়েছে! হোম পেজ রিফ্রেশ করে পরিবর্তনগুলো দেখে নিন।")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "ব্যর্থ হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* ১. পোস্ট সংখ্যা বা লিমিট সেটিং */}
      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <h2 className="font-bold text-lg text-green-800">হোম পেজে কতটি করে পোস্ট দেখাবে</h2>
        <p className="text-xs text-gray-500">− / + চেপে বা সংখ্যা লিখে ঠিক করুন। (১ থেকে ৫০০)</p>
        
        <div className="space-y-3">
          {names.map((n) => (
            <div key={n} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-700">
                {n === CAT_STUDENT ? "স্টুডেন্ট কর্নার (মোট কার্ড)" : n === CAT_CLUB ? "সর্বশেষ ক্লাব সংবাদ" : n}
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => set(n, get(n) - 1)} className="w-9 h-9 rounded-xl border text-lg bg-gray-50 hover:bg-gray-100">−</button>
                <input
                  type="number"
                  min={1}
                  value={get(n)}
                  onChange={(e) => set(n, Number(e.target.value))}
                  className="w-16 border rounded-xl py-1.5 text-center text-sm font-semibold"
                />
                <button type="button" onClick={() => set(n, get(n + 1 > 500 ? 500 : 1))} className="w-9 h-9 rounded-xl border text-lg bg-gray-50 hover:bg-gray-100" onClickCapture={() => set(n, get(n) + 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ২. সেকশন টাইটেল, উপ-টাইটেল ও সাব-টাইটেল এডিটর */}
      <div className="bg-white rounded-2xl shadow p-5 space-y-5">
        <div>
          <h2 className="font-bold text-lg text-green-800">হোম পেজ সেকশন টেক্সট এডিটর</h2>
          <p className="text-xs text-gray-500">প্রতিটি সেকশনের উপ-টাইটেল (Eyebrow), মূল টাইটেল (Title) এবং সাব-টাইটেল (Description) এখান থেকে কাস্টমাইজ করুন।</p>
        </div>

        <div className="space-y-6">
          {SECTIONS_CONFIG.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <h3 className="font-bold text-sm text-green-900 border-b pb-1.5">📌 {s.name}</h3>
              
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600">উপ-টাইটেল / আইব্রো (যেমন: Leadership & At a Glance):</label>
                <input
                  type="text"
                  className={inp}
                  value={texts[`${s.id}_eyebrow`] ?? s.defaultEyebrow}
                  onChange={(e) => setTexts({ ...texts, [`${s.id}_eyebrow`]: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600">মূল টাইটেল (যেমন: নেতৃত্বের বার্তা):</label>
                <input
                  type="text"
                  className={inp}
                  value={texts[`${s.id}_title`] ?? s.defaultTitle}
                  onChange={(e) => setTexts({ ...texts, [`${s.id}_title`]: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600">সাব-টাইটেল / বিবরণ:</label>
                <textarea
                  rows={2}
                  className={inp}
                  value={texts[`${s.id}_desc`] ?? s.defaultDesc}
                  onChange={(e) => setTexts({ ...texts, [`${s.id}_desc`]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className={btn} onClick={saveAll} disabled={busy}>
        {busy ? "অপেক্ষা করুন..." : "সব পরিবর্তন সেভ করুন"}
      </button>
      {msg && <p className="text-sm font-semibold text-center text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">{msg}</p>}
    </div>
  )
}
