'use client'

import { useEffect, useState } from 'react'
import { FileCheck2, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react'
import {
  DEFAULT_PUBLIC_INFO,
  getPublicInfo,
  savePublicInfo,
  type AnnualReportItem,
  type PublicInfo,
  type RecognitionStatus,
} from '@/lib/public-info'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none'

const emptyReport: AnnualReportItem = {
  id: '',
  year: '',
  titleBn: '',
  titleEn: '',
  summaryBn: '',
  summaryEn: '',
  url: '',
}

export default function PublicInfoManager({ token }: { token: string }) {
  const [value, setValue] = useState<PublicInfo>(DEFAULT_PUBLIC_INFO)
  const [report, setReport] = useState<AnnualReportItem>(emptyReport)
  const [editReportId, setEditReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getPublicInfo()
      .then(setValue)
      .catch((error: unknown) =>
        setMessage(error instanceof Error ? error.message : 'তথ্য লোড করা যায়নি')
      )
      .finally(() => setLoading(false))
  }, [])

  function updateRecognition<K extends keyof PublicInfo['recognition']>(
    key: K,
    next: PublicInfo['recognition'][K]
  ) {
    setValue((current) => ({
      ...current,
      recognition: { ...current.recognition, [key]: next },
    }))
  }

  function updateSafety<K extends keyof PublicInfo['safety']>(
    key: K,
    next: PublicInfo['safety'][K]
  ) {
    setValue((current) => ({
      ...current,
      safety: { ...current.safety, [key]: next },
    }))
  }

  function saveReport() {
    if (!report.year.trim() || !report.titleBn.trim() || !/^https?:\/\//i.test(report.url.trim())) {
      setMessage('প্রতিবেদনের বছর, বাংলা শিরোনাম ও বৈধ https:// লিংক দিন।')
      return
    }

    const nextReport = { ...report, id: editReportId || `report-${Date.now()}` }
    setValue((current) => ({
      ...current,
      annualReports: editReportId
        ? current.annualReports.map((item) => (item.id === editReportId ? nextReport : item))
        : [nextReport, ...current.annualReports],
    }))
    setReport(emptyReport)
    setEditReportId(null)
    setMessage('')
  }

  async function saveAll() {
    if (
      value.recognition.documentUrl.trim() &&
      !/^https?:\/\//i.test(value.recognition.documentUrl.trim())
    ) {
      setMessage('স্বীকৃতির নথির লিংক https:// দিয়ে শুরু হতে হবে।')
      return
    }
    if (
      value.recognition.status === 'recognized' &&
      !value.recognition.documentUrl.trim() &&
      !value.recognition.reference.trim()
    ) {
      setMessage('স্বীকৃত হিসেবে দেখাতে নথির লিংক অথবা স্মারক/রেফারেন্স নম্বর দিন।')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      await savePublicInfo(token, value)
      setMessage('✅ তথ্য সংরক্ষণ হয়েছে। প্রকাশ্য নীতির পাতায় হালনাগাদ দেখা যাবে।')
    } catch (error) {
      setMessage(error instanceof Error ? `❌ ${error.message}` : '❌ তথ্য সংরক্ষণ করা যায়নি')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border bg-white p-8 text-center text-sm">তথ্য লোড হচ্ছে...</div>
  }

  return (
    <div className="space-y-4">
      {message && (
        <p role="status" className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center text-xs font-bold text-cyan-950">
          {message}
        </p>
      )}

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-900">
          <ShieldCheck className="size-5 text-cyan-700" />
          বিশ্ববিদ্যালয়ের স্বীকৃতি ও অনুমোদন
        </h2>
        <label className="block space-y-1 text-xs font-semibold">
          <span>বর্তমান অবস্থা</span>
          <select
            className={inputClass}
            value={value.recognition.status}
            onChange={(event) => updateRecognition('status', event.target.value as RecognitionStatus)}
          >
            <option value="unverified">নথি যাচাই করা হয়নি</option>
            <option value="pending">যাচাই/অনুমোদন প্রক্রিয়াধীন</option>
            <option value="recognized">স্বীকৃতি/অনুমোদন নথিভুক্ত</option>
          </select>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={inputClass} placeholder="ইস্যুকারী কর্তৃপক্ষ (বাংলা)" value={value.recognition.authorityBn} onChange={(e) => updateRecognition('authorityBn', e.target.value)} />
          <input className={inputClass} placeholder="Issuing authority (English)" value={value.recognition.authorityEn} onChange={(e) => updateRecognition('authorityEn', e.target.value)} />
          <input className={inputClass} placeholder="স্মারক/রেফারেন্স নম্বর" value={value.recognition.reference} onChange={(e) => updateRecognition('reference', e.target.value)} />
          <input className={inputClass} placeholder="ইস্যুর তারিখ" value={value.recognition.issueDate} onChange={(e) => updateRecognition('issueDate', e.target.value)} />
          <input className={inputClass} placeholder="মেয়াদ (প্রযোজ্য হলে)" value={value.recognition.validThrough} onChange={(e) => updateRecognition('validThrough', e.target.value)} />
          <input className={inputClass} placeholder="প্রমাণপত্রের https:// লিংক (ঐচ্ছিক)" value={value.recognition.documentUrl} onChange={(e) => updateRecognition('documentUrl', e.target.value)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea className={inputClass} rows={3} placeholder="স্বীকৃতি সম্পর্কে নোট (বাংলা)" value={value.recognition.noteBn} onChange={(e) => updateRecognition('noteBn', e.target.value)} />
          <textarea className={inputClass} rows={3} placeholder="Recognition note (English)" value={value.recognition.noteEn} onChange={(e) => updateRecognition('noteEn', e.target.value)} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-900">
          <ShieldCheck className="size-5 text-rose-700" />
          সাংবাদিক নিরাপত্তা ও আইনি সহায়তার তথ্য
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea className={inputClass} rows={5} placeholder="নিরাপত্তা নির্দেশিকা (বাংলা)" value={value.safety.guideBn} onChange={(e) => updateSafety('guideBn', e.target.value)} />
          <textarea className={inputClass} rows={5} placeholder="Safety guide (English)" value={value.safety.guideEn} onChange={(e) => updateSafety('guideEn', e.target.value)} />
          <textarea className={inputClass} rows={3} placeholder="আইনি সহায়তা ও দায়সীমা (বাংলা)" value={value.safety.legalNoteBn} onChange={(e) => updateSafety('legalNoteBn', e.target.value)} />
          <textarea className={inputClass} rows={3} placeholder="Legal support note and disclaimer (English)" value={value.safety.legalNoteEn} onChange={(e) => updateSafety('legalNoteEn', e.target.value)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={inputClass} placeholder="জরুরি নম্বর" value={value.safety.emergencyNumber} onChange={(e) => updateSafety('emergencyNumber', e.target.value)} />
          <input className={inputClass} type="email" placeholder="সহায়তা ইমেইল (ঐচ্ছিক)" value={value.safety.supportEmail} onChange={(e) => updateSafety('supportEmail', e.target.value)} />
          <input className={inputClass} type="tel" placeholder="সহায়তা ফোন (ঐচ্ছিক)" value={value.safety.supportPhone} onChange={(e) => updateSafety('supportPhone', e.target.value)} />
        </div>
        <p className="text-[11px] text-amber-800">
          এখানে শুধু যাচাইকৃত যোগাযোগের তথ্য দিন। এই তথ্য আইনি প্রতিনিধিত্বের নিশ্চয়তা নয়।
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-900">
          <FileCheck2 className="size-5 text-emerald-700" />
          বার্ষিক প্রতিবেদন ও আর্থিক স্বচ্ছতা
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={inputClass} placeholder="বছর (যেমন: ২০২৫)" value={report.year} onChange={(e) => setReport({ ...report, year: e.target.value })} />
          <input className={inputClass} placeholder="প্রতিবেদনের শিরোনাম (বাংলা) *" value={report.titleBn} onChange={(e) => setReport({ ...report, titleBn: e.target.value })} />
          <input className={inputClass} placeholder="Report title (English)" value={report.titleEn} onChange={(e) => setReport({ ...report, titleEn: e.target.value })} />
          <input className={inputClass} placeholder="PDF/Drive লিংক (https://) *" value={report.url} onChange={(e) => setReport({ ...report, url: e.target.value })} />
          <textarea className={inputClass} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (বাংলা)" value={report.summaryBn} onChange={(e) => setReport({ ...report, summaryBn: e.target.value })} />
          <textarea className={inputClass} rows={2} placeholder="Short description (English)" value={report.summaryEn} onChange={(e) => setReport({ ...report, summaryEn: e.target.value })} />
        </div>
        <button type="button" onClick={saveReport} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white">
          <Plus className="size-4" />
          {editReportId ? 'প্রতিবেদন আপডেট করুন' : 'প্রতিবেদন তালিকায় যোগ করুন'}
        </button>
        <div className="space-y-2">
          {value.annualReports.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-xs">
              <span className="font-bold">{item.year} · {item.titleBn}</span>
              <div className="flex gap-3 font-bold">
                <button type="button" onClick={() => { setReport(item); setEditReportId(item.id) }} className="text-cyan-800 hover:underline">এডিট</button>
                <button type="button" onClick={() => setValue((current) => ({ ...current, annualReports: current.annualReports.filter((row) => row.id !== item.id) }))} className="inline-flex items-center gap-1 text-rose-700 hover:underline">
                  <Trash2 className="size-3.5" /> বাদ দিন
                </button>
              </div>
            </div>
          ))}
          {value.annualReports.length === 0 && (
            <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">এখনও কোনো যাচাইকৃত প্রতিবেদন যোগ করা হয়নি।</p>
          )}
        </div>
      </section>

      <button type="button" onClick={saveAll} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow disabled:opacity-50">
        <Save className="size-4" />
        {busy ? 'সংরক্ষণ হচ্ছে...' : 'নিরাপত্তা ও স্বচ্ছতার তথ্য সংরক্ষণ'}
      </button>
    </div>
  )
}
