import { SB_URL, SB_KEY } from "./sb"

export type CommitteeMember = {
  name: string
  role: string
  photo_url?: string | null
}

// প্রতিটি মিডিয়া আইটেম (শিরোনাম, উপশিরোনাম, বিস্তারিত ও লিংক)
export type ClubMediaItem = {
  id?: string
  title?: string
  subtitle?: string
  description?: string
  url: string
}

export type ClubReportItem = {
  title: string
  date: string
  reporter: string
  link_url?: string | null
  embed_media_url?: string | null
  subtitle?: string | null
  description?: string | null
  media_items?: ClubMediaItem[] | null // একাধিক ছবি/ভিডিও/লিংক
}

export type ClubItem = {
  id: string
  name: string
  name_bn: string | null
  tag: string
  icon: string
  logo_url?: string | null
  activity: string | null
  activity_bn: string | null
  date: string | null
  fb_url: string | null
  yt_url: string | null
  web_url: string | null
  embed_media_url?: string | null
  committee_term?: string | null
  committee_members?: CommitteeMember[] | null
  reports_title?: string | null
  reports?: ClubReportItem[] | null
  contact_info: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type ClubInput = Omit<ClubItem, "id" | "created_at">

// একাধিক মিডিয়া পার্স ও কনভার্ট করার ফাংশন (বিদ্যমান সিঙ্গেল লিংকের সাথেও ১০০% সামঞ্জস্যপূর্ণ)
export function parseActivityMedia(raw?: string | null): ClubMediaItem[] {
  if (!raw || !raw.trim()) return []
  const str = raw.trim()
  if (str.startsWith("[") || str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed.filter((item) => item && (item.url || item.title))
      if (parsed && typeof parsed === "object") return [parsed]
    } catch {}
  }
  return [{ url: str }]
}

export function stringifyActivityMedia(items: ClubMediaItem[]): string | null {
  const valid = items.filter((i) => i.url?.trim() || i.title?.trim() || i.description?.trim())
  if (valid.length === 0) return null
  return JSON.stringify(valid)
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

export async function getCampusClubs(token?: string): Promise<ClubItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_clubs?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
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

export async function getClubNewsPosts(clubId: string) {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,created_at,author,image_url,embed_media_url&or=(hidden.is.null,hidden.eq.false)&club_id=eq.${encodeURIComponent(clubId)}&order=created_at.desc&limit=50`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
