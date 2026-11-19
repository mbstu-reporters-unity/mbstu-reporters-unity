'use client'

import React, { useEffect, useState } from 'react'
import { Users, Briefcase, Plus, Trash2, Edit3, X, Upload } from 'lucide-react'
import {
  getAlumniList,
  saveAlumniList,
  getOpportunitiesList,
  saveOpportunitiesList,
  type AlumniItem,
  type OpportunityItem,
} from '@/lib/alumni-opportunities'
import { uploadImage } from '@/lib/sb'

const inp = "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:border-cyan-600"
const btn = "w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold text-xs disabled:opacity-50 cursor-pointer shadow-sm transition"

export default function AlumniOpportunityManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [tab, setTab] = useState<'alumni' | 'opportunities'>('alumni')
  const [alumni, setAlumni] = useState<AlumniItem[]>([])
  const [opps, setOpps] = useState<OpportunityItem[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // Alumni Form State
  const [aEditId, setAEditId] = useState<string | null>(null)
  const [aName, setAName] = useState('')
  const [aDept, setADept] = useState('')
  const [aBatch, setABatch] = useState('')
  const [aPos, setAPos] = useState('')
  const [aMedia, setAMedia] = useState('')
  const [aBio, setABio] = useState('')
  const [aPhotoUrl, setAPhotoUrl] = useState<string | null>(null)
  const [aPhotoFile, setAPhotoFile] = useState<File | null>(null)

  // Opportunity Form State
  const [oEditId, setOEditId] = useState<string | null>(null)
  const [oType, setOType] = useState<'workshop' | 'internship' | 'fellowship' | 'contest'>('workshop')
  const [oTitle, setOTitle] = useState('')
  const [oOrg, setOOrg] = useState('MBSTU Reporters Unity')
  const [oDeadline, setODeadline] = useState('')
  const [oDesc, setODesc] = useState('')
  const [oUrl, setOUrl] = useState('/apply')
  const [oBadge, setOBadge] = useState('নিবন্ধন চলছে')

  async function loadData() {
    const [aList, oList] = await Promise.all([
      getAlumniList(),
      getOpportunitiesList(false),
    ])
    setAlumni(aList)
    setOpps(oList)
  }

  useEffect(() => {
    loadData()
  }, [])

  function resetAlumni() {
    setAEditId(null); setAName(''); setADept(''); setABatch('')
    setAPos(''); setAMedia(''); setABio(''); setAPhotoUrl(null); setAPhotoFile(null)
  }

  function resetOpp() {
    setOEditId(null); setOType('workshop'); setOTitle(''); setOOrg('MBSTU Reporters Unity')
    setODeadline(''); setODesc(''); setOUrl('/apply'); setOBadge('নিবন্ধন চলছে')
  }

  async function handleSaveAlumni() {
    if (!aName.trim() || !aMedia.trim()) {
      setMsg('❌ নাম এবং মিডিয়া হাউসের নাম লিখুন')
      return
    }
    setBusy(true); setMsg('')
    try {
      let finalPhoto = aPhotoUrl
      if (aPhotoFile) {
        setMsg('ছবি আপলোড হচ্ছে...')
        finalPhoto = await uploadImage(token, await shrink(aPhotoFile))
      }
      const newItem: AlumniItem = {
        id: aEditId || `alum-${Date.now()}`,
        name: aName.trim(),
        dept: aDept.trim() || 'মাভাবিপ্রবি',
        batch: aBatch.trim() || 'প্রাক্তন ব্যাচ',
        currentPosition: aPos.trim() || 'রিপোর্টার',
        mediaHouse: aMedia.trim(),
        bio: aBio.trim(),
        photo_url: finalPhoto,
      }
      const updated = aEditId ? alumni.map(x => x.id === aEditId ? newItem : x) : [newItem, ...alumni]
      await saveAlumniList(token, updated)
      setAlumni(updated)
      resetAlumni()
      setMsg('✅ অ্যালামনাই সফলভাবে সংরক্ষণ হয়েছে')
    } catch (e: any) { setMsg('❌ ' + (e?.message || 'সংরক্ষণ ব্যর্থ')) }
    setBusy(false)
  }

  async function handleSaveOpp() {
    if (!oTitle.trim() || !oDesc.trim()) {
      setMsg('❌ সুযোগের শিরোনাম ও বিবরণ লিখুন')
      return
    }
    setBusy(true); setMsg('')
    try {
      const newItem: OpportunityItem = {
        id: oEditId || `opp-${Date.now()}`,
        type: oType,
        title: oTitle.trim(),
        organizer: oOrg.trim() || 'MBSTU Reporters Unity',
        deadline: oDeadline.trim() || 'চলমান',
        description: oDesc.trim(),
        apply_url: oUrl.trim() || '/apply',
        badgeText: oBadge.trim() || 'সক্রিয়',
        is_active: true,
      }
      const updated = oEditId ? opps.map(x => x.id === oEditId ? newItem : x) : [newItem, ...opps]
      await saveOpportunitiesList(token, updated)
      setOpps(updated)
      resetOpp()
      setMsg('✅ সুযোগ সফলভাবে প্রকাশিত হয়েছে')
    } catch (e: any) { setMsg('❌ ' + (e?.message || 'সংরক্ষণ ব্যর্থ')) }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setTab('alumni'); setMsg('') }}
          className={`flex-1 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
            tab === 'alumni' ? 'bg-cyan-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="size-4" />
          <span>অ্যালামনাই নেটওয়ার্ক ({alumni.length})</span>
        </button>
        <button
          type="button"
          onClick={() => { setTab('opportunities'); setMsg('') }}
          className={`flex-1 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
            tab === 'opportunities' ? 'bg-purple-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="size-4" />
          <span>ওয়ার্কশপ ও ইন্টার্নশিপ ({opps.length})</span>
        </button>
      </div>

      {msg && <p className="text-xs font-bold text-center p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl">{msg}</p>}

      {tab === 'alumni' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">{aEditId ? '✏️ অ্যালামনাই এডিট' : '➕ নতুন অ্যালামনাই সদস্য যোগ'}</h3>
              {aEditId && <button type="button" onClick={resetAlumni} className="text-xs text-rose-600 font-bold">বাতিল</button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="প্রাক্তন সদস্যের নাম *" value={aName} onChange={e => setAName(e.target.value)} />
              <input className={inp} placeholder="বর্তমান পদবি (যেমন: সিনিয়র রিপোর্টার) *" value={aPos} onChange={e => setAPos(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className={inp} placeholder="মিডিয়া হাউস (যেমন: দৈনিক প্রথম আলো) *" value={aMedia} onChange={e => setAMedia(e.target.value)} />
              <input className={inp} placeholder="বিভাগ (যেমন: CSE)" value={aDept} onChange={e => setADept(e.target.value)} />
              <input className={inp} placeholder="ব্যাচ (যেমন: ১০ম ব্যাচ)" value={aBatch} onChange={e => setABatch(e.target.value)} />
            </div>

            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত সাফল্য ও অনুপ্রেরণামূলক বক্তব্য..." value={aBio} onChange={e => setABio(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-slate-50 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <Upload className="size-3.5 text-cyan-700" />
                <span>প্রাক্তন সদস্যের ছবি:</span>
                <input type="file" accept="image/*" onChange={e => setAPhotoFile(e.target.files?.[0] || null)} className="text-xs ml-2" />
              </label>
              {(aPhotoFile || aPhotoUrl) && <span className="text-[11px] text-emerald-700 font-bold">✓ ছবি সংযুক্ত</span>}
            </div>

            <button type="button" disabled={busy} onClick={handleSaveAlumni} className={btn}>
              {busy ? 'সংরক্ষণ হচ্ছে...' : aEditId ? 'আপডেট করুন' : '➕ অ্যালামনাই সংরক্ষণ করুন'}
            </button>
          </div>

          <div className="space-y-2">
            {alumni.map(alum => (
              <div key={alum.id} className="bg-white rounded-xl border border-slate-200 p-3 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{alum.name}</p>
                  <p className="text-[11px] text-cyan-800">{alum.currentPosition}, {alum.mediaHouse} ({alum.batch})</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-bold">
                  <button type="button" onClick={() => {
                    setAEditId(alum.id); setAName(alum.name); setADept(alum.dept); setABatch(alum.batch)
                    setAPos(alum.currentPosition); setAMedia(alum.mediaHouse); setABio(alum.bio)
                    setAPhotoUrl(alum.photo_url || null); setAPhotoFile(null)
                  }} className="text-cyan-700 hover:underline">এডিট</button>
                  <button type="button" onClick={async () => {
                    if (!confirm(`"${alum.name}" কে মুছে ফেলবেন?`)) return
                    const next = alumni.filter(x => x.id !== alum.id)
                    await saveAlumniList(token, next)
                    setAlumni(next)
                  }} className="text-rose-600 hover:underline">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'opportunities' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">{oEditId ? '✏️ সুযোগ এডিট' : '➕ নতুন সুযোগ/ইন্টার্নশিপ যোগ'}</h3>
              {oEditId && <button type="button" onClick={resetOpp} className="text-xs text-rose-600 font-bold">বাতিল</button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="সুযোগের শিরোনাম *" value={oTitle} onChange={e => setOTitle(e.target.value)} />
              <select className={inp} value={oType} onChange={e => setOType(e.target.value as any)}>
                <option value="workshop">কর্মশালা / ওয়ার্কশপ</option>
                <option value="internship">ইন্টার্নশিপ</option>
                <option value="fellowship">ফেলোশিপ / স্কলারশিপ</option>
                <option value="contest">প্রতিযোগিতা</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className={inp} placeholder="আয়োজক" value={oOrg} onChange={e => setOOrg(e.target.value)} />
              <input className={inp} placeholder="ডেডলাইন (যেমন: ১৫ নভেম্বর ২০২৬)" value={oDeadline} onChange={e => setODeadline(e.target.value)} />
              <input className={inp} placeholder="ট্যাগ (যেমন: নিবন্ধন চলছে)" value={oBadge} onChange={e => setOBadge(e.target.value)} />
            </div>

            <textarea className={inp} rows={2} placeholder="বিস্তারিত বিবরণ ও যোগ্যতা *" value={oDesc} onChange={e => setODesc(e.target.value)} />
            <input className={inp} placeholder="আবেদনের লিংক (/apply অথবা https://...)" value={oUrl} onChange={e => setOUrl(e.target.value)} />

            <button type="button" disabled={busy} onClick={handleSaveOpp} className={btn}>
              {busy ? 'সংরক্ষণ হচ্ছে...' : oEditId ? 'আপডেট করুন' : '➕ সুযোগ প্রকাশ করুন'}
            </button>
          </div>

          <div className="space-y-2">
            {opps.map(opp => (
              <div key={opp.id} className="bg-white rounded-xl border border-slate-200 p-3 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="min-w-0">
                  <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">{opp.badgeText}</span>
                  <p className="font-bold text-sm text-slate-900 truncate mt-0.5">{opp.title}</p>
                  <p className="text-[11px] text-slate-500">ডেডলাইন: {opp.deadline} · {opp.organizer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-bold">
                  <button type="button" onClick={() => {
                    setOEditId(opp.id); setOType(opp.type); setOTitle(opp.title); setOOrg(opp.organizer)
                    setODeadline(opp.deadline); setODesc(opp.description); setOUrl(opp.apply_url); setOBadge(opp.badgeText)
                  }} className="text-purple-700 hover:underline">এডিট</button>
                  <button type="button" onClick={async () => {
                    if (!confirm(`"${opp.title}" মুছে ফেলবেন?`)) return
                    const next = opps.filter(x => x.id !== opp.id)
                    await saveOpportunitiesList(token, next)
                    setOpps(next)
                  }} className="text-rose-600 hover:underline">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
