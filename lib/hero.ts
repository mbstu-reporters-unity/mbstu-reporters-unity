import { SB_URL, SB_KEY } from "./sb"

// ব্যাজের পূর্ণ তালিকা
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

// ১০টি জনপ্রিয় বাংলা ও ইংরেজি ফন্ট
export const FONTS = [
  { label: "হিন্দ শিলিগুড়ি (Hind Siliguri - বাংলা)", value: "'Hind Siliguri', sans-serif" },
  { label: "কালপুরুষ (Kalpurush - বাংলা)", value: "'Kalpurush', sans-serif" },
  { label: "সোলাইমান লিপি (SolaimanLipi - বাংলা)", value: "'SolaimanLipi', sans-serif" },
  { label: "নোটো সান্স বাংলা (Noto Sans Bengali)", value: "'Noto Sans Bengali', sans-serif" },
  { label: "বালু দ্য ২ (Baloo Da 2 - বাংলা)", value: "'Baloo Da 2', cursive" },
  { label: "তিরো বাংলা (Tiro Bangla - বাংলা)", value: "'Tiro Bangla', serif" },
  { label: "ইন্টার (Inter - ইংরেজি)", value: "'Inter', sans-serif" },
  { label: "রোবোটো (Roboto - ইংরেজি)", value: "'Roboto', sans-serif" },
  { label: "প্লেফেয়ার ডিসপ্লে (Playfair Display - ইংরেজি)", value: "'Playfair Display', serif" },
  { label: "মনটসেরাট (Montserrat - ইংরেজি)", value: "'Montserrat', sans-serif" },
]

// ফন্টের থিকনেস (বোল্ডনেস)
export const FONT_WEIGHTS = [
  { label: "হালকা (Light 300)", value: "300" },
  { label: "স্বাভাবিক (Regular 400)", value: "400" },
  { label: "মাঝারি (Medium 500)", value: "500" },
  { label: "সেমি-বোল্ড (Semi-Bold 600)", value: "600" },
  { label: "গাঢ়/বোল্ড (Bold 700)", value: "700" },
  { label: "অতিরিক্ত গাঢ় (Extra Bold 800)", value: "800" },
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
  font_family?: string | null
  font_weight?: string | null
  text_align?: "left" | "center" | "right" | null
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

// সাইটের পোস্টগুলো অ্যাডমিনের ড্রপডাউনে লোড করার ফাংশন
export async function getRecentPosts(): Promise<Array<{ id: string; title: string; image_url?: string; summary?: string }>> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,image_url,summary&order=created_at.desc&limit=30`,
      { headers: hdr(), cache: "no-store" }
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

// স্লাইড আপডেট
export async function updateHeroSlide(token: string, id: string, data: Partial<HeroInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}

// স্লাইড ডিলিট
export async function deleteHeroSlide(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

// হিরো সেটিংস
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
