import { SB_URL, SB_KEY } from "./sb"
import { clubs as fallbackClubs } from "./data"

export type ClubItem = {
  id: string
  name: string
  name_bn: string | null
  tag: string
  icon: string
  activity: string | null
  activity_bn: string | null
  date: string | null
  fb_url: string | null
  yt_url: string | null
  web_url: string | null
  committee: string | null
  contact_info: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type ClubInput = Omit<ClubItem, "id" | "created_at">

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

// পাবলিক বা অ্যাডমিন সবার জন্য ক্লাব আনা
export async function getCampusClubs(token?: string): Promise<ClubItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_clubs?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    const data: ClubItem[] = await res.json()
    return data
  } catch {
    return []
  }
}

export async function createCampusClub(token: string, data: Partial<ClubInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_clubs`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateCampusClub(token: string, id: string, data: Partial<ClubInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_clubs?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteCampusClub(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_clubs?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
