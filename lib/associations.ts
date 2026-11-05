import { SB_URL, SB_KEY } from "./sb"

export type UniversityAssociation = {
  id: string
  name: string
  name_en: string | null
  university_name: string | null
  logo_url: string | null
  website_url: string | null
  fb_url: string | null
  yt_url: string | null
  description: string | null
  contact_info: string | null
  sort_order: number
  is_active: boolean
  created_at: string
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

export async function getUniversityAssociations(): Promise<UniversityAssociation[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/university_associations?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createUniversityAssociation(token: string, data: Partial<UniversityAssociation>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/university_associations`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateUniversityAssociation(token: string, id: string, data: Partial<UniversityAssociation>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/university_associations?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteUniversityAssociation(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/university_associations?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
