import { SB_URL, SB_KEY, type Post } from "./sb"

export type CommunityPage = {
  id: string
  name: string
  name_en: string | null
  slug: string
  category: string | null
  bio: string | null
  cover_url: string | null
  avatar_url: string | null
  phone: string | null
  email: string | null
  location: string | null
  website_url: string | null
  fb_url: string | null
  yt_url: string | null
  is_verified: boolean
  is_active: boolean
  sort_order: number
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

/* সব পেজ লোড করা */
export async function getCommunityPages(): Promise<CommunityPage[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/community_pages?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/* নির্দিষ্ট পেজ স্লাগ দিয়ে লোড করা (যেমন: /p/sports-club) */
export async function getPageBySlug(slug: string): Promise<CommunityPage | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/community_pages?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return null
    const rows: CommunityPage[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

/* এই পেজের নিজস্ব সব পোস্ট লোড করা */
export async function getPagePosts(pageId: string): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&page_id=eq.${encodeURIComponent(pageId)}&order=created_at.desc&limit=50`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/* নতুন পেজ তৈরি */
export async function createCommunityPage(token: string, data: Partial<CommunityPage>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/community_pages`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

/* পেজ আপডেট */
export async function updateCommunityPage(token: string, id: string, data: Partial<CommunityPage>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/community_pages?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

/* পেজ ডিলিট */
export async function deleteCommunityPage(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/community_pages?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
