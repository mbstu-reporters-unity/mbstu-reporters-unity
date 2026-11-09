import { SB_URL, SB_KEY } from "./sb"

export type Faculty = {
  id: string
  name: string
  name_en: string | null
  image_url: string | null
  description: string | null
  sort_order: number
  created_at: string
}

export type Department = {
  id: string
  faculty_id: string
  name: string
  name_en: string | null
  code: string | null
  image_url: string | null
  about: string | null
  contact_info: string | null
  sort_order: number
  created_at: string
}

export type Teacher = {
  id: string
  department_id: string
  name: string
  designation: string
  qualifications: string | null
  bio: string | null
  photo_url: string | null
  email: string | null
  phone: string | null
  sort_order: number
  is_chairman?: boolean
  created_at: string
}

export type DeptNotice = {
  id: string
  department_id?: string | null
  branch?: string
  title: string
  body: string | null
  date?: string | null
  file_url: string | null
  image_urls?: string[] | null
  created_at: string
}

export type DeptEvent = {
  id: string
  department_id: string
  title: string
  details: string | null
  date: string | null
  image_url?: string | null
  image_urls?: string[] | null
  created_at: string
}

export type FacultyWithDepartments = Faculty & {
  departments: Department[]
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h["Content-Type"] = "application/json"
  return h
}

async function ok(res: Response): Promise<Response> {
  if (res.ok) return res
  let msg = `ত্রুটি (${res.status})`
  try {
    const j = await res.json()
    msg = j.message || j.msg || j.error_description || msg
  } catch {}
  throw new Error(msg)
}

/* ==================== অনুষদ ==================== */
export async function getFaculties(): Promise<Faculty[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/faculties?select=*&order=sort_order.asc,created_at.asc`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createFaculty(token: string, data: Partial<Faculty>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/faculties`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateFaculty(token: string, id: string, data: Partial<Faculty>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/faculties?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteFaculty(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/faculties?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== বিভাগ ==================== */
export async function getDepartments(facultyId?: string): Promise<Department[]> {
  try {
    const query = facultyId ? `&faculty_id=eq.${encodeURIComponent(facultyId)}` : ""
    const res = await fetch(`${SB_URL}/rest/v1/departments?select=*${query}&order=sort_order.asc,created_at.asc`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/departments?select=*&id=eq.${encodeURIComponent(id)}`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return null
    const rows: Department[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

export async function createDepartment(token: string, data: Partial<Department>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/departments`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateDepartment(token: string, id: string, data: Partial<Department>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/departments?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteDepartment(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/departments?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== শিক্ষক তালিকা ==================== */
export async function getTeachers(deptId: string): Promise<Teacher[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/department_teachers?select=*&department_id=eq.${encodeURIComponent(deptId)}&order=is_chairman.desc.nullslast,sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createTeacher(token: string, data: Partial<Teacher>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/department_teachers`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateTeacher(token: string, id: string, data: Partial<Teacher>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/department_teachers?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteTeacher(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/department_teachers?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== বিভাগীয় নোটিশ (স্বয়ংক্রিয় সিঙ্ক) ==================== */
export async function getDeptNotices(deptId: string): Promise<DeptNotice[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/board_notices?select=*&department_id=eq.${encodeURIComponent(deptId)}&order=created_at.desc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createDeptNotice(
  token: string,
  data: { department_id: string; title: string; body: string | null; image_urls?: string[] }
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notices`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({
        department_id: data.department_id,
        branch: "department",
        title: data.title,
        body: data.body,
        image_urls: data.image_urls || [],
        show_name: true,
        is_pinned: false,
      }),
    })
  )
}

export const createDeptNoticeSync = createDeptNotice

export async function deleteDeptNotice(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notices?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== বিভাগীয় ইভেন্ট ==================== */
export async function getDeptEvents(deptId: string): Promise<DeptEvent[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/department_events?select=*&department_id=eq.${encodeURIComponent(deptId)}&order=created_at.desc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createDeptEvent(token: string, data: Partial<DeptEvent>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/department_events`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteDeptEvent(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/department_events?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== মেনুবারের জন্য সব অনুষদ ও বিভাগ ==================== */
export async function getFacultiesWithDepartments(): Promise<FacultyWithDepartments[]> {
  try {
    const [facs, depts] = await Promise.all([getFaculties(), getDepartments()])
    return facs.map((f) => ({
      ...f,
      departments: depts.filter((d) => d.faculty_id === f.id),
    }))
  } catch {
    return []
  }
}
