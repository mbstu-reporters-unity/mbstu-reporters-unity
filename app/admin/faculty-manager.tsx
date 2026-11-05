"use client"

import { useEffect, useState } from "react"
import {
  getFaculties, createFaculty, updateFaculty, deleteFaculty,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getTeachers, createTeacher, deleteTeacher,
  getDeptNotices, createDeptNotice, deleteDeptNotice,
  getDeptEvents, createDeptEvent, deleteDeptEvent,
  type Faculty, type Department, type Teacher, type DeptNotice, type DeptEvent,
} from "../../lib/faculties"
import { uploadImage } from "../../lib/sb"

const inp = "w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600"
const btn = "w-full bg-green-700 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-800 disabled:opacity-50 cursor-pointer shadow-sm"

export default function FacultyManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [subTab, setSubTab] = useState<"faculties" | "departments" | "dept_details">("faculties")
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // অনুষদ
  const [facEditId, setFacEditId] = useState<string | null>(null)
  const [facName, setFacName] = useState("")
  const [facNameEn, setFacNameEn] = useState("")
  const [facDesc, setFacDesc] = useState("")
  const [facImgUrl, setFacImgUrl] = useState<string | null>(null)
  const [facFile, setFacFile] = useState<File | null>(null)

  // বিভাগ
  const [deptEditId, setDeptEditId] = useState<string | null>(null)
  const [deptFacId, setDeptFacId] = useState("")
  const [deptName, setDeptName] = useState("")
  const [deptNameEn, setDeptNameEn] = useState("")
  const [deptCode, setDeptCode] = useState("")
  const [deptAbout, setDeptAbout] = useState("")
  const [deptContact, setDeptContact] = useState("")
  const [deptImgUrl, setDeptImgUrl] = useState<string | null>(null)
  const [deptFile, setDeptFile] = useState<File | null>(null)

  // নির্দিষ্ট ডিপার্টমেন্ট সিলেক্ট
  const [selectedDeptId, setSelectedDeptId] = useState<string>("")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [notices, setNotices] = useState<DeptNotice[]>([])
  const [events, setEvents] = useState<DeptEvent[]>([])

  // শিক্ষক
  const [tName, setTName] = useState("")
  const [tDesig, setTDesig] = useState("")
  const [tQual, setTQual] = useState("")
  const [tBio, setTBio] = useState("")
  const [tEmail, setTEmail] = useState("")
  const [tPhone, setTPhone] = useState("")
  const [tFile, setTFile] = useState<File | null>(null)

  // নোটিশ (একাধিক ছবি সহ)
  const [nTitle, setNTitle] = useState("")
  const [nBody, setNBody] = useState("")
  const [nFiles, setNFiles] = useState<File[]>([])

  // ইভেন্ট (একাধিক ছবি সহ)
  const [eTitle, setETitle] = useState("")
  const [eDetails, setEDetails] = useState("")
  const [eDate, setEDate] = useState("")
  const [eFiles, setEFiles] = useState<File[]>([])

  async function loadAll() {
    const fList = await getFaculties()
    const dList = await getDepartments()
    setFaculties(fList)
    setDepartments(dList)
    if (fList.length > 0 && !deptFacId) setDeptFacId(fList[0].id)
    if (dList.length > 0 && !selectedDeptId) setSelectedDeptId(dList[0].id)
  }

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (selectedDeptId) {
      getTeachers(selectedDeptId).then(setTeachers)
      getDeptNotices(selectedDeptId).then(setNotices)
      getDeptEvents(selectedDeptId).then(setEvents)
    }
  }, [selectedDeptId])

  async function saveFaculty() {
    if (!facName.trim()) { setMsg("❌ অনুষদের নাম লিখুন"); return }
    setBusy(true); setMsg("")
    try {
      let finalImg = facImgUrl
      if (facFile) {
        setMsg("ছবি আপলোড হচ্ছে...")
        finalImg = await uploadImage(token, await shrink(facFile))
      }
      const data = {
        name: facName.trim(),
        name_en: facNameEn.trim() || null,
        description: facDesc.trim() || null,
        image_url: finalImg,
      }
      if (facEditId) {
        await updateFaculty(token, facEditId, data)
        setMsg("✅ অনুষদ আপডেট হয়েছে")
      } else {
        await createFaculty(token, { ...data, sort_order: faculties.length * 10 })
        setMsg("✅ নতুন অনুষদ যুক্ত হয়েছে")
      }
      setFacEditId(null); setFacName(""); setFacNameEn(""); setFacDesc(""); setFacImgUrl(null); setFacFile(null)
      await loadAll()
    } catch (e: any) { setMsg("❌ " + (e?.message || "ত্রুটি হয়েছে")) }
    setBusy(false)
  }

  async function saveDepartment() {
    if (!deptFacId) { setMsg("❌ অনুষদ বেছে নিন"); return }
    if (!deptName.trim()) { setMsg("❌ বিভাগের নাম লিখুন"); return }
    setBusy(true); setMsg("")
    try {
      let finalImg = deptImgUrl
      if (deptFile) {
        setMsg("বিভাগের কভার ছবি আপলোড হচ্ছে...")
        finalImg = await uploadImage(token, await shrink(deptFile))
      }
      const data = {
        faculty_id: deptFacId,
        name: deptName.trim(),
        name_en: deptNameEn.trim() || null,
        code: deptCode.trim() || null,
        about: deptAbout.trim() || null,
        contact_info: deptContact.trim() || null,
        image_url: finalImg,
      }
      if (deptEditId) {
        await updateDepartment(token, deptEditId, data)
        setMsg("✅ বিভাগ আপডেট হয়েছে")
      } else {
        await createDepartment(token, { ...data, sort_order: departments.length * 10 })
        setMsg("✅ নতুন বিভাগ যুক্ত হয়েছে")
      }
      setDeptEditId(null); setDeptName(""); setDeptNameEn(""); setDeptCode(""); setDeptAbout(""); setDeptContact(""); setDeptImgUrl(null); setDeptFile(null)
      await loadAll()
    } catch (e: any) { setMsg("❌ " + (e?.message || "ত্রুটি হয়েছে")) }
    setBusy(false)
  }

  async function addTeacherHandler() {
    if (!selectedDeptId || !tName.trim() || !tDesig.trim()) {
      setMsg("❌ শিক্ষকের নাম ও পদবি লিখুন")
      return
    }
    setBusy(true); setMsg("")
    try {
      let photo = null
      if (tFile) photo = await uploadImage(token, await shrink(tFile))
      await createTeacher(token, {
        department_id: selectedDeptId,
        name: tName.trim(),
        designation: tDesig.trim(),
        qualifications: tQual.trim() || null,
        bio: tBio.trim() || null,
        email: tEmail.trim() || null,
        phone: tPhone.trim() || null,
        photo_url: photo,
      })
      setTName(""); setTDesig(""); setTQual(""); setTBio(""); setTEmail(""); setTPhone(""); setTFile(null)
      setTeachers(await getTeachers(selectedDeptId))
      setMsg("✅ শিক্ষক যুক্ত হয়েছেন")
    } catch (e: any) { setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে")) }
    setBusy(false)
  }

  /* নোটিশ যোগ (একাধিক ছবি ও স্বয়ংক্রিয় সিঙ্ক সহ) */
  async function addNoticeHandler() {
    if (!selectedDeptId || !nTitle.trim()) { setMsg("❌ নোটিশের শিরোনাম লিখুন"); return }
    setBusy(true); setMsg("")
    try {
      const uploadedUrls: string[] = []
      if (nFiles.length > 0) {
        for (let i = 0; i < nFiles.length; i++) {
          setMsg(`নোটিশের ছবি আপলোড হচ্ছে (${i + 1}/${nFiles.length})...`)
          const u = await uploadImage(token, await shrink(nFiles[i]))
          uploadedUrls.push(u)
        }
      }
      await createDeptNotice(token, {
        department_id: selectedDeptId,
        title: nTitle.trim(),
        body: nBody.trim() || null,
        image_urls: uploadedUrls,
      })
      setNTitle(""); setNBody(""); setNFiles([])
      setNotices(await getDeptNotices(selectedDeptId))
      setMsg("✅ নোটিশ প্রকাশিত ও মূল নোটিশ বোর্ডে সিঙ্ক হয়েছে")
    } catch (e: any) { setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে")) }
    setBusy(false)
  }

  /* ইভেন্ট যোগ (একাধিক ছবি সহ) */
  async function addEventHandler() {
    if (!selectedDeptId || !eTitle.trim()) { setMsg("❌ ইভেন্টের নাম লিখুন"); return }
    setBusy(true); setMsg("")
    try {
      const uploadedUrls: string[] = []
      if (eFiles.length > 0) {
        for (let i = 0; i < eFiles.length; i++) {
          setMsg(`ইভেন্টের ছবি আপলোড হচ্ছে (${i + 1}/${eFiles.length})...`)
          const u = await uploadImage(token, await shrink(eFiles[i]))
          uploadedUrls.push(u)
        }
      }
      await createDeptEvent(token, {
        department_id: selectedDeptId,
        title: eTitle.trim(),
        details: eDetails.trim() || null,
        date: eDate.trim() || new Date().toLocaleDateString("bn-BD"),
        image_urls: uploadedUrls,
      })
      setETitle(""); setEDetails(""); setEDate(""); setEFiles([])
      setEvents(await getDeptEvents(selectedDeptId))
      setMsg("✅ ইভেন্ট সফলভাবে যুক্ত হয়েছে")
    } catch (e: any) { setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে")) }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {/* সাব-ট্যাব */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 gap-1 text-xs font-semibold">
        <button
          onClick={() => setSubTab("faculties")}
          className={`flex-1 py-2 rounded-lg transition-all ${subTab === "faculties" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          🏛️ অনুষদ ({faculties.length})
        </button>
        <button
          onClick={() => setSubTab("departments")}
          className={`flex-1 py-2 rounded-lg transition-all ${subTab === "departments" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          🎓 বিভাগ ({departments.length})
        </button>
        <button
          onClick={() => setSubTab("dept_details")}
          className={`flex-1 py-2 rounded-lg transition-all ${subTab === "dept_details" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          👥 শিক্ষক, নোটিশ ও ইভেন্ট
        </button>
      </div>

      {msg && <p className="text-sm font-semibold p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-center">{msg}</p>}

      {/* অনুষদ ব্যবস্থাপনা */}
      {subTab === "faculties" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-bold text-base text-gray-800">{facEditId ? "অনুষদ এডিট করুন" : "নতুন অনুষদ যুক্ত করুন"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="অনুষদের নাম (বাংলা) *" value={facName} onChange={(e) => setFacName(e.target.value)} />
              <input className={inp} placeholder="অনুষদের নাম (English)" value={facNameEn} onChange={(e) => setFacNameEn(e.target.value)} />
            </div>
            <textarea className={inp} rows={2} placeholder="অনুষদের পরিচিতি (ঐচ্ছিক)" value={facDesc} onChange={(e) => setFacDesc(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">অনুষদের ছবি বা লোগো:</label>
              <input type="file" accept="image/*" onChange={(e) => setFacFile(e.target.files?.[0] || null)} className="text-xs" />
              {(facFile || facImgUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={facFile ? URL.createObjectURL(facFile) : facImgUrl || ""} alt="" className="size-12 rounded-lg object-cover border" />
                  <button type="button" onClick={() => { setFacFile(null); setFacImgUrl(null) }} className="text-xs text-red-600 underline">ছবি সরান</button>
                </div>
              )}
            </div>

            <button className={btn} onClick={saveFaculty} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : facEditId ? "অনুষদ আপডেট করুন" : "+ অনুষদ যুক্ত করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {faculties.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow p-3 text-sm flex items-center justify-between gap-3">
                <p className="font-bold text-gray-800 truncate">{f.name}</p>
                <div className="flex gap-3 text-xs font-semibold">
                  <button onClick={() => { setFacEditId(f.id); setFacName(f.name); setFacNameEn(f.name_en || ""); setFacDesc(f.description || ""); setFacImgUrl(f.image_url) }} className="text-green-700">এডিট</button>
                  <button onClick={() => deleteFaculty(token, f.id).then(loadAll)} className="text-red-600">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* বিভাগ ব্যবস্থাপনা */}
      {subTab === "departments" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-bold text-base text-gray-800">{deptEditId ? "বিভাগ এডিট করুন" : "নতুন বিভাগ যুক্ত করুন"}</h2>
            <select className={inp} value={deptFacId} onChange={(e) => setDeptFacId(e.target.value)}>
              {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="বিভাগের নাম (বাংলা) *" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
              <input className={inp} placeholder="বিভাগের নাম (English)" value={deptNameEn} onChange={(e) => setDeptNameEn(e.target.value)} />
            </div>
            <input className={inp} placeholder="বিভাগীয় কোড (যেমন: CSE)" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
            <textarea className={inp} rows={3} placeholder="বিভাগের পরিচিতি (About)" value={deptAbout} onChange={(e) => setDeptAbout(e.target.value)} />
            <input className={inp} placeholder="অফিসের ঠিকানা ও যোগাযোগের তথ্য" value={deptContact} onChange={(e) => setDeptContact(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">বিভাগের কভার ছবি (ঐচ্ছিক):</label>
              <input type="file" accept="image/*" onChange={(e) => setDeptFile(e.target.files?.[0] || null)} className="text-xs" />
              {(deptFile || deptImgUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={deptFile ? URL.createObjectURL(deptFile) : deptImgUrl || ""} alt="" className="size-12 rounded-lg object-cover border" />
                  <button type="button" onClick={() => { setDeptFile(null); setDeptImgUrl(null) }} className="text-xs text-red-600 underline">ছবি সরান</button>
                </div>
              )}
            </div>

            <button className={btn} onClick={saveDepartment} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : deptEditId ? "বিভাগ আপডেট করুন" : "+ বিভাগ যুক্ত করুন"}
            </button>
          </div>

          <div className="space-y-2">
            {departments.map((d) => (
              <div key={d.id} className="bg-white rounded-xl shadow p-3 text-sm flex items-center justify-between gap-3">
                <p className="font-bold text-gray-800 truncate">{d.name} {d.code ? `(${d.code})` : ""}</p>
                <div className="flex gap-3 text-xs font-semibold">
                  <button onClick={() => { setDeptEditId(d.id); setDeptFacId(d.faculty_id); setDeptName(d.name); setDeptCode(d.code || ""); setDeptAbout(d.about || ""); setDeptContact(d.contact_info || ""); setDeptImgUrl(d.image_url) }} className="text-green-700">এডিট</button>
                  <button onClick={() => deleteDepartment(token, d.id).then(loadAll)} className="text-red-600">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* বিস্তারিত: শিক্ষক, নোটিশ ও ইভেন্ট */}
      {subTab === "dept_details" && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 space-y-1">
            <label className="text-xs font-bold text-green-900 block">📌 কোন বিভাগের তথ্য নিয়ন্ত্রণ করতে চান? বেছে নিন:</label>
            <select className={inp} value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ""}</option>
              ))}
            </select>
          </div>

          {/* ১. শিক্ষক */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-2">👨‍🏫 নতুন শিক্ষক যুক্ত করুন ({teachers.length} জন)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="শিক্ষকের নাম *" value={tName} onChange={(e) => setTName(e.target.value)} />
              <input className={inp} placeholder="পদবি *" value={tDesig} onChange={(e) => setTDesig(e.target.value)} />
            </div>
            <input className={inp} placeholder="শিক্ষাগত যোগ্যতা" value={tQual} onChange={(e) => setTQual(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত পরিচিতি বা গবেষণার ক্ষেত্র" value={tBio} onChange={(e) => setTBio(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="ইমেইল" value={tEmail} onChange={(e) => setTEmail(e.target.value)} />
              <input className={inp} placeholder="ফোন নম্বর" value={tPhone} onChange={(e) => setTPhone(e.target.value)} />
            </div>
            <div className="text-xs">
              <label className="text-xs font-semibold text-gray-700 block mb-1">শিক্ষকের ছবি:</label>
              <input type="file" accept="image/*" onChange={(e) => setTFile(e.target.files?.[0] || null)} />
            </div>
            <button className={btn} onClick={addTeacherHandler} disabled={busy}>+ শিক্ষক যুক্ত করুন</button>

            <div className="space-y-2 pt-2">
              {teachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/60">
                  <p className="font-bold text-gray-800 truncate">{t.name} ({t.designation})</p>
                  <button onClick={() => deleteTeacher(token, t.id).then(() => getTeachers(selectedDeptId).then(setTeachers))} className="text-red-600 font-bold">বাদ দিন</button>
                </div>
              ))}
            </div>
          </div>

          {/* ২. নোটিশ (একাধিক ছবি ও স্বয়ংক্রিয় সিঙ্ক) */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-2 flex items-center justify-between">
              <span>📢 বিভাগীয় নোটিশ কর্নার ({notices.length} টি)</span>
              <span className="text-[11px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">✓ মূল নোটিশ বোর্ডে সিঙ্ক হবে</span>
            </h3>
            <input className={inp} placeholder="নোটিশের শিরোনাম *" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
            <textarea className={inp} rows={3} placeholder="নোটিশের বিস্তারিত লেখা" value={nBody} onChange={(e) => setNBody(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                🖼️ নোটিশের ছবি যুক্ত করুন (একাধিক ছবি বাছা যাবে):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) setNFiles(Array.from(e.target.files))
                }}
                className="text-xs"
              />
              {nFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {nFiles.map((f, i) => (
                    <div key={i} className="relative size-12 rounded-lg border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                  <p className="w-full text-[11px] text-green-700 font-bold">{nFiles.length}টি ছবি বাছাই করা হয়েছে</p>
                </div>
              )}
            </div>

            <button className={btn} onClick={addNoticeHandler} disabled={busy}>+ নোটিশ প্রকাশ ও সিঙ্ক করুন</button>

            <div className="space-y-1.5 pt-2">
              {notices.map((n) => (
                <div key={n.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/60">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{n.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {new Date(n.created_at).toLocaleDateString("bn-BD")}
                      {n.image_urls?.length ? ` · 📷 ${n.image_urls.length}টি ছবি` : ""}
                    </p>
                  </div>
                  <button onClick={() => deleteDeptNotice(token, n.id).then(() => getDeptNotices(selectedDeptId).then(setNotices))} className="text-red-600 font-bold">মুছুন</button>
                </div>
              ))}
            </div>
          </div>

          {/* ৩. ইভেন্ট (একাধিক ছবি সহ) */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-2">🎉 বিভাগীয় ইভেন্টসমূহ ({events.length} টি)</h3>
            <input className={inp} placeholder="ইভেন্টের নাম / শিরোনাম *" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="ইভেন্টের বিস্তারিত তথ্য" value={eDetails} onChange={(e) => setEDetails(e.target.value)} />
            <input className={inp} placeholder="ইভেন্টের তারিখ" value={eDate} onChange={(e) => setEDate(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                🖼️ ইভেন্টের ছবি যুক্ত করুন (একাধিক ছবি বাছা যাবে):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) setEFiles(Array.from(e.target.files))
                }}
                className="text-xs"
              />
              {eFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {eFiles.map((f, i) => (
                    <div key={i} className="relative size-12 rounded-lg border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                  <p className="w-full text-[11px] text-green-700 font-bold">{eFiles.length}টি ছবি বাছাই করা হয়েছে</p>
                </div>
              )}
            </div>

            <button className={btn} onClick={addEventHandler} disabled={busy}>+ ইভেন্ট যুক্ত করুন</button>

            <div className="space-y-2 pt-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/60">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{ev.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {ev.date}
                      {ev.image_urls?.length ? ` · 📷 ${ev.image_urls.length}টি ছবি` : ""}
                    </p>
                  </div>
                  <button onClick={() => deleteDeptEvent(token, ev.id).then(() => getDeptEvents(selectedDeptId).then(setEvents))} className="text-red-600 font-bold">মুছুন</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
