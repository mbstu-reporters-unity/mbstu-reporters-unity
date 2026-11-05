import { SB_URL, SB_KEY } from "./sb"

export type SocialSite = {
  id: string
  name: string
  name_en: string | null
  category: string | null
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

export type SocialSiteNotice = {
  id: string
  site_id: string
  title: string
  details: string | null
  date: string | null
  image_urls: string[] | null
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

/* ==================== সোশ্যাল সাইট CRUD ==================== */
export async function getSocialSites(): Promise<SocialSite[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/mbstu_social_sites?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createSocialSite(token: string, data: Partial<SocialSite>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/mbstu_social_sites`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateSocialSite(token: string, id: string, data: Partial<SocialSite>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/mbstu_social_sites?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteSocialSite(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/mbstu_social_sites?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== সোশ্যাল সাইটের নোটিশ CRUD ==================== */
export async function getSocialSiteNotices(siteId: string): Promise<SocialSiteNotice[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/social_site_notices?select=*&site_id=eq.${encodeURIComponent(siteId)}&order=created_at.desc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createSocialSiteNotice(token: string, data: Partial<SocialSiteNotice>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/social_site_notices`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteSocialSiteNotice(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/social_site_notices?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
