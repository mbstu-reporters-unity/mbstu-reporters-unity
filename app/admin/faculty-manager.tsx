"use client"

import { useEffect, useState } from "react"
import {
  getFaculties, createFaculty, updateFaculty, deleteFaculty,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getDeptNotices, createDeptNotice, deleteDeptNotice,
  getDeptEvents, createDeptEvent, deleteDeptEvent,
  type Faculty, type Department, type Teacher, type DeptNotice, type DeptEvent,
} from "../../lib/faculties"
import { uploadImage } from "../../lib/sb"
import { ArrowUp, ArrowDown, Edit3, Trash2, X, PlusCircle, CheckCircle2 } from "lucide-react"

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

  // শিক্ষক স্টেট (এডিট ও লাইভ প্রিভিউ সহ)
  const [tEditId, setTEditId] = useState<string | null>(null)
  const [tName, setTName] = useState("")
  const [tDesig, setTDesig] = useState("")
  const [tQual, setTQual] = useState("")
  const [tBio, setTBio] = useState("")
  const [tEmail, setTEmail] = useState("")
  const [tPhone, setTPhone] = useState("")
  const [tIsChairman, setTIsChairman] = useState(false)
  const [tOrder, setTOrder] = useState(0)
  const [tImgUrl, setTImgUrl] = useState<string | null>(null)
  const [tFile, setTFile] = useState<File | null>(null)

  // নোটিশ
  const [nTitle, setNTitle] = useState("")
  const [nBody, setNBody] = useState("")
  const [nFiles, setNFiles] = useState<File[]>([])

  // ইভেন্ট
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

  function resetFacForm() {
    setFacEditId(null)
    setFacName("")
    setFacNameEn("")
    setFacDesc("")
    setFacImgUrl(null)
    setFacFile(null)
  }

  function resetDeptForm() {
    setDeptEditId(null)
    setDeptName("")
    setDeptNameEn("")
    setDeptCode("")
    setDeptAbout("")
    setDeptContact("")
    setDeptImgUrl(null)
    setDeptFile(null)
  }

  function resetTeacherForm() {
    setTEditId(null)
    setTName("")
    setTDesig("")
    setTQual("")
    setTBio("")
    setTEmail("")
    setTPhone("")
    setTIsChairman(false)
    setTOrder(0)
    setTImgUrl(null)
    setTFile(null)
  }

  /* অনুষদ সংরক্ষণ */
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
      resetFacForm()
      await loadAll()
    } catch (e: any) { setMsg("❌ " + (e?.message || "ত্রুটি হয়েছে")) }
    setBusy(false)
  }

  /* বিভাগ সংরক্ষণ */
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
      resetDeptForm()
      await loadAll()
    } catch (e: any) { setMsg("❌ " + (e?.message || "ত্রুটি হয়েছে")) }
    setBusy(false)
  }

  /* শিক্ষক সংরক্ষণ ও এডিট */
  async function saveTeacherHandler() {
    if (!selectedDeptId || !tName.trim() || !tDesig.trim()) {
      setMsg("❌ শিক্ষকের নাম ও পদবি লিখুন")
      return
    }
    setBusy(true); setMsg("")
    try {
      let photo = tImgUrl
      if (tFile) {
        setMsg("শিক্ষকের ছবি আপলোড হচ্ছে...")
        photo = await uploadImage(token, await shrink(tFile))
      }

      const payload = {
        department_id: selectedDeptId,
        name: tName.trim(),
        designation: tDesig.trim(),
        qualifications: tQual.trim() || null,
        bio: tBio.trim() || null,
        email: tEmail.trim() || null,
        phone: tPhone.trim() || null,
        photo_url: photo,
        is_chairman: tIsChairman,
        sort_order: Number(tOrder) || 0,
      }

      if (tEditId) {
        await updateTeacher(token, tEditId, payload)
        setMsg("✅ শিক্ষকের তথ্য আপডেট হয়েছে")
      } else {
        const nextOrder = teachers.length ? Math.max(...teachers.map(t => t.sort_order || 0)) + 10 : 0
        await createTeacher(token, { ...payload, sort_order: payload.sort_order || nextOrder })
        setMsg("✅ শিক্ষক সফলভাবে যুক্ত হয়েছেন")
      }

      resetTeacherForm()
      setTeachers(await getTeachers(selectedDeptId))
    } catch (e: any) { setMsg("❌ " + (e?.message || "ব্যর্থ হয়েছে")) }
    setBusy(false)
  }

  function startEditTeacher(t: Teacher) {
    setTEditId(t.id)
    setTName(t.name)
    setTDesig(t.designation)
    setTQual(t.qualifications || "")
    setTBio(t.bio || "")
    setTEmail(t.email || "")
    setTPhone(t.phone || "")
    setTIsChairman(Boolean(t.is_chairman))
    setTOrder(t.sort_order || 0)
    setTImgUrl(t.photo_url || null)
    setTFile(null)
    window.scrollTo({ top: 300, behavior: "smooth" })
  }

  async function moveTeacher(idx: number, dir: -1 | 1) {
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= teachers.length) return
    const arr = [...teachers]
    const a = arr[idx]
    const b = arr[targetIdx]
    arr[idx] = b
    arr[targetIdx] = a
    setTeachers(arr)

    try {
      const orderA = a.sort_order ?? idx * 10
      const orderB = b.sort_order ?? targetIdx * 10
      await Promise.all([
        updateTeacher(token, a.id, { sort_order: orderB }),
        updateTeacher(token, b.id, { sort_order: orderA }),
      ])
      setTeachers(await getTeachers(selectedDeptId))
    } catch {
      setMsg("❌ ক্রম পরিবর্তন ব্যর্থ হয়েছে")
    }
  }

  /* নোটিশ যোগ */
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

  /* ইভেন্ট যোগ */
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
      {/* সাব-ট্যাব ন্যাভিগেশন */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 gap-1 text-xs font-semibold">
        <button
          onClick={() => setSubTab("faculties")}
          className={`flex-1 py-2.5 rounded-lg transition-all ${subTab === "faculties" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          🏛️ অনুষদ ({faculties.length})
        </button>
        <button
          onClick={() => setSubTab("departments")}
          className={`flex-1 py-2.5 rounded-lg transition-all ${subTab === "departments" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          🎓 বিভাগ ({departments.length})
        </button>
        <button
          onClick={() => setSubTab("dept_details")}
          className={`flex-1 py-2.5 rounded-lg transition-all ${subTab === "dept_details" ? "bg-green-700 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
        >
          👨‍🏫 শিক্ষক ও নোটিশ
        </button>
      </div>

      {msg && <p className="text-xs sm:text-sm font-semibold p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-center">{msg}</p>}

      {/* ==================== অনুষদ ব্যবস্থাপনা ==================== */}
      {subTab === "faculties" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-base text-gray-800">
                {facEditId ? "✏️ অনুষদ এডিট করুন" : "➕ নতুন অনুষদ যুক্ত করুন"}
              </h2>
              {facEditId && (
                <button type="button" onClick={resetFacForm} className="text-xs text-red-600 flex items-center gap-1 font-semibold">
                  <X className="size-3.5" /> বাতিল
                </button>
              )}
            </div>

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
                <div className="flex gap-3 text-xs font-semibold shrink-0">
                  <button
                    onClick={() => {
                      setFacEditId(f.id)
                      setFacName(f.name)
                      setFacNameEn(f.name_en || "")
                      setFacDesc(f.description || "")
                      setFacImgUrl(f.image_url)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="text-green-700 hover:underline"
                  >
                    এডিট
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${f.name}" অনুষদ ও এর অধীনস্থ সব বিভাগ মুছে ফেলতে চান?`)) {
                        deleteFaculty(token, f.id).then(loadAll)
                      }
                    }}
                    className="text-red-600 hover:underline"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== বিভাগ ব্যবস্থাপনা ==================== */}
      {subTab === "departments" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-base text-gray-800">
                {deptEditId ? "✏️ বিভাগ এডিট করুন" : "➕ নতুন বিভাগ যুক্ত করুন"}
              </h2>
              {deptEditId && (
                <button type="button" onClick={resetDeptForm} className="text-xs text-red-600 flex items-center gap-1 font-semibold">
                  <X className="size-3.5" /> বাতিল
                </button>
              )}
            </div>

            <label className="text-xs font-bold text-gray-700 block">কোন অনুষদের অধীনে বিভাগটি পড়বে:</label>
            <select className={inp} value={deptFacId} onChange={(e) => setDeptFacId(e.target.value)}>
              {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="বিভাগের নাম (বাংলা) *" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
              <input className={inp} placeholder="বিভাগের নাম (English)" value={deptNameEn} onChange={(e) => setDeptNameEn(e.target.value)} />
            </div>
            <input className={inp} placeholder="বিভাগীয় কোড (যেমন: CSE, EEE, BGE)" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
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
            {departments.map((d) => {
              const fac = faculties.find((f) => f.id === d.faculty_id)
              return (
                <div key={d.id} className="bg-white rounded-xl shadow p-3 text-sm flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{d.name} {d.code ? `(${d.code})` : ""}</p>
                    <p className="text-[11px] text-gray-500 truncate">🏛️ {fac?.name || "অনুষদ নেই"}</p>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold shrink-0">
                    <button
                      onClick={() => {
                        setDeptEditId(d.id)
                        setDeptFacId(d.faculty_id)
                        setDeptName(d.name)
                        setDeptNameEn(d.name_en || "")
                        setDeptCode(d.code || "")
                        setDeptAbout(d.about || "")
                        setDeptContact(d.contact_info || "")
                        setDeptImgUrl(d.image_url)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                      className="text-green-700 hover:underline"
                    >
                      এডিট
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${d.name}" বিভাগ ও এর শিক্ষকদের তথ্য মুছে ফেলতে চান?`)) {
                          deleteDepartment(token, d.id).then(loadAll)
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== শিক্ষক, নোটিশ ও ইভেন্ট ==================== */}
      {subTab === "dept_details" && (
        <div className="space-y-5">
          {/* অনুষদভিত্তিক ড্রপডাউন যাতে মোবাইল থেকে নিমেষেই বিভাগ বাছা যায় */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 space-y-1.5">
            <label className="text-xs font-bold text-green-950 block">📌 কোন বিভাগের শিক্ষক ও নোটিশ পরিচালনা করবেন?:</label>
            <select
              className={inp}
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value)
                resetTeacherForm()
              }}
            >
              {faculties.map((f) => {
                const deptsInFac = departments.filter((d) => d.faculty_id === f.id)
                if (deptsInFac.length === 0) return null
                return (
                  <optgroup key={f.id} label={`🏛️ ${f.name}`}>
                    {deptsInFac.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.code ? `(${d.code})` : ""}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>

          {/* ১. শিক্ষক ব্যবস্থাপনা (এডিট ও লাইভ ছবি প্রিভিউ সহ) */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-gray-800">
                {tEditId ? "✏️ শিক্ষকের তথ্য এডিট করুন" : `👨‍🏫 নতুন শিক্ষক যুক্ত করুন (${teachers.length} জন)`}
              </h3>
              {tEditId && (
                <button type="button" onClick={resetTeacherForm} className="text-xs text-red-600 flex items-center gap-1 font-semibold">
                  <X className="size-3.5" /> বাতিল
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="শিক্ষকের পূর্ণ নাম *" value={tName} onChange={(e) => setTName(e.target.value)} />
              <input className={inp} placeholder="পদবি (যেমন: অধ্যাপক / সহযোগী অধ্যাপক) *" value={tDesig} onChange={(e) => setTDesig(e.target.value)} />
            </div>

            <label className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={tIsChairman}
                onChange={(e) => setTIsChairman(e.target.checked)}
                className="size-4 accent-amber-600 rounded cursor-pointer"
              />
              <span>⭐ ইনি এই বিভাগের বর্তমান চেয়ারম্যান / বিভাগীয় প্রধান (Chairman)</span>
            </label>

            <input className={inp} placeholder="শিক্ষাগত যোগ্যতা (যেমন: Ph.D, M.Sc.)" value={tQual} onChange={(e) => setTQual(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="সংক্ষিপ্ত পরিচিতি বা গবেষণার ক্ষেত্র" value={tBio} onChange={(e) => setTBio(e.target.value)} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="ইমেইল (name@mbstu.ac.bd)" value={tEmail} onChange={(e) => setTEmail(e.target.value)} />
              <input className={inp} placeholder="মোবাইল বা অফিস ফোন নম্বর" value={tPhone} onChange={(e) => setTPhone(e.target.value)} />
            </div>

            {/* ছবি আপলোড ও লাইভ থাম্বনেইল প্রিভিউ */}
            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">শিক্ষকের ছবি:</label>
              <input type="file" accept="image/*" onChange={(e) => setTFile(e.target.files?.[0] || null)} className="text-xs" />
              {(tFile || tImgUrl) && (
                <div className="flex items-center gap-2.5 pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tFile ? URL.createObjectURL(tFile) : tImgUrl || ""}
                    alt="Teacher"
                    className="size-14 rounded-full object-cover border-2 border-green-600 bg-white shadow-sm"
                  />
                  <button type="button" onClick={() => { setTFile(null); setTImgUrl(null) }} className="text-xs text-red-600 underline">
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>

            <button className={btn} onClick={saveTeacherHandler} disabled={busy}>
              {busy ? "সংরক্ষণ হচ্ছে..." : tEditId ? "✓ শিক্ষকের তথ্য আপডেট করুন" : "+ শিক্ষক সংরক্ষণ করুন"}
            </button>

            {/* শিক্ষকদের তালিকা (সাজানোর তীর ও এডিট বাটন সহ) */}
            <div className="space-y-2 pt-3 border-t">
              <p className="text-xs font-bold text-gray-700">বর্তমান শিক্ষকবৃন্দ ও ক্রম:</p>
              {teachers.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/70 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-800 text-[10px]">
                      {idx + 1}
                    </span>
                    {t.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo_url} alt="" className="size-8 rounded-full object-cover shrink-0 border" />
                    ) : (
                      <span className="size-8 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">
                        👤
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">
                        {t.name} {t.is_chairman && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold">চেয়ারম্যান</span>}
                      </p>
                      <p className="text-[11px] text-green-700 truncate">{t.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveTeacher(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-30"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTeacher(idx, 1)}
                      disabled={idx === teachers.length - 1}
                      className="p-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-30"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditTeacher(t)}
                      className="text-green-700 font-bold hover:underline px-1"
                    >
                      এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`"${t.name}" এর তথ্য মুছে ফেলতে চান?`)) {
                          deleteTeacher(token, t.id).then(() => getTeachers(selectedDeptId).then(setTeachers))
                        }
                      }}
                      className="text-red-600 font-bold hover:underline px-1"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              ))}
              {teachers.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">এই বিভাগে কোনো শিক্ষক যোগ করা হয়নি।</p>
              )}
            </div>
          </div>

          {/* ২. নোটিশ সেকশন */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-2 flex items-center justify-between">
              <span>📢 বিভাগীয় নোটিশ কর্নার ({notices.length} টি)</span>
              <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">✓ মূল বোর্ডে সিঙ্ক হবে</span>
            </h3>
            <input className={inp} placeholder="নোটিশের শিরোনাম *" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
            <textarea className={inp} rows={3} placeholder="নোটিশের বিস্তারিত লেখা" value={nBody} onChange={(e) => setNBody(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">🖼️ নোটিশের ছবি যুক্ত করুন:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && setNFiles(Array.from(e.target.files))}
                className="text-xs"
              />
              {nFiles.length > 0 && (
                <p className="text-[11px] text-green-700 font-bold">{nFiles.length}টি ছবি বাছাই করা হয়েছে</p>
              )}
            </div>

            <button className={btn} onClick={addNoticeHandler} disabled={busy}>+ নোটিশ প্রকাশ ও সিঙ্ক করুন</button>

            <div className="space-y-1.5 pt-2">
              {notices.map((n) => (
                <div key={n.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/60">
                  <p className="font-bold text-gray-800 truncate">{n.title}</p>
                  <button onClick={() => deleteDeptNotice(token, n.id).then(() => getDeptNotices(selectedDeptId).then(setNotices))} className="text-red-600 font-bold shrink-0">
                    মুছুন
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ৩. ইভেন্ট সেকশন */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-2">🎉 বিভাগীয় ইভেন্টসমূহ ({events.length} টি)</h3>
            <input className={inp} placeholder="ইভেন্টের নাম / শিরোনাম *" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            <textarea className={inp} rows={2} placeholder="ইভেন্টের বিস্তারিত তথ্য" value={eDetails} onChange={(e) => setEDetails(e.target.value)} />
            <input className={inp} placeholder="ইভেন্টের তারিখ" value={eDate} onChange={(e) => setEDate(e.target.value)} />

            <div className="rounded-xl border p-2.5 bg-gray-50 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">🖼️ ইভেন্টের ছবি:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && setEFiles(Array.from(e.target.files))}
                className="text-xs"
              />
              {eFiles.length > 0 && (
                <p className="text-[11px] text-green-700 font-bold">{eFiles.length}টি ছবি বাছাই করা হয়েছে</p>
              )}
            </div>

            <button className={btn} onClick={addEventHandler} disabled={busy}>+ ইভেন্ট যুক্ত করুন</button>

            <div className="space-y-2 pt-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between border rounded-xl p-2.5 text-xs bg-gray-50/60">
                  <p className="font-bold text-gray-800 truncate">{ev.title} ({ev.date})</p>
                  <button onClick={() => deleteDeptEvent(token, ev.id).then(() => getDeptEvents(selectedDeptId).then(setEvents))} className="text-red-600 font-bold shrink-0">
                    মুছুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
