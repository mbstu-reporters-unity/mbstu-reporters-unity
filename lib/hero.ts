import { SB_URL, SB_KEY } from "./sb"

// নতুন প্রস্তাবিত ব্যাজসহ পূর্ণ তালিকা
export const BADGES = [
  "ব্রেকিং",
  "এইমাত্র পাওয়া",
  "আজকের খবর",
  "আপডেট",
  "অনুসন্ধান",
  "ক্যাম্পাস",
  "সাক্ষাৎকার",
  "কর্মশালা",
  "গবেষণা",
  "সংস্কৃতি",
]

export const MAX_LIVE = 5

export type HeroSlide = {
  id: string
  category: string | null
  title: string
  summary: string | null
  image_url: string | null
  image_pos: "top" | "center" | "bottom"
  media_type?: "image" | "video" | null
  video_url?: string | null
  button_text?: string | null
  title_color?: string | null
  badge_color?: string | null
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
  slide_speed?: number | null
  transition_type?: "fade" | "slide-left" | "slide-right" | "slide-up" | null
  text_motion?: boolean | null
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

// স্লাইড লোড করা
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

// নতুন স্লাইড তৈরি
export async function createHeroSlide(token: string, data: HeroInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

// স্লাইড আপডেট করা
export async function updateHeroSlide(token: string, id: string, data: Partial<HeroInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}

// স্লাইড ডিলিট করা
export async function deleteHeroSlide(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

// স্লাইডারের সাধারণ সেটিংস (গতি, ট্রানজিশন, মোশন ও ব্রেকিং)
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

export async function saveHeroSettings(token: string, data: Partial<HeroSettings>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_settings?id=eq.1`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}
