import { SB_URL, SB_KEY } from "./sb"

export const BADGES = ["ব্রেকিং", "অনুসন্ধান", "ক্যাম্পাস", "সাক্ষাৎকার", "কর্মশালা", "গবেষণা", "সংস্কৃতি"]
export const MAX_LIVE = 5

export type HeroSlide = {
  id: string
  category: string | null
  title: string
  summary: string | null
  image_url: string | null
  image_pos: "top" | "center" | "bottom"
  link_url: string | null
  sort_order: number
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type HeroInput = Omit<HeroSlide, "id" | "created_at" | "updated_at">

export type HeroSettings = {
  breaking_on: boolean
  breaking_title: string | null
  breaking_text: string | null
  breaking_link: string | null
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}` }
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

// token দিলে অ্যাডমিন সব স্লাইড দেখে; না দিলে শুধু চালু ও মেয়াদ-না-ফুরানো স্লাইড
export async function getHeroSlides(token?: string): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/hero_slides?select=*&order=sort_order.asc,created_at.desc&limit=60`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createHeroSlide(token: string, data: HeroInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateHeroSlide(token: string, id: string, data: Partial<HeroInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}

export async function deleteHeroSlide(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/hero_settings?select=*&id=eq.1`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return null
    const rows: HeroSettings[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

export async function saveHeroSettings(token: string, data: HeroSettings) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_settings?id=eq.1`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}
