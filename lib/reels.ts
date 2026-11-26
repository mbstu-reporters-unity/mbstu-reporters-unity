import { SB_URL, SB_KEY } from "./sb"

export interface ReelItem {
  id: string
  title: string
  author_name: string
  author_avatar: string | null
  video_url: string
  thumbnail_url?: string | null
  view_count?: number | null
  post_id?: string | null
  link_url?: string | null
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

// হোমপেজের জন্য সক্রিয় রিলস
export async function getLiveReels(): Promise<ReelItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/reels?select=*&is_active=eq.true&order=sort_order.asc,created_at.desc&limit=50`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// অ্যাডমিনের জন্য সব রিলস
export async function getAllReelsAdmin(token: string): Promise<ReelItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/reels?select=*&order=sort_order.asc,created_at.desc&limit=100`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// নতুন রিলস তৈরি
export async function createReel(token: string, data: Partial<ReelItem>) {
  const res = await fetch(`${SB_URL}/rest/v1/reels`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=representation" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "রিল সংরক্ষণ করা যায়নি")
  }
  return await res.json()
}

// রিলস আপডেট
export async function updateReel(token: string, id: string, data: Partial<ReelItem>) {
  const res = await fetch(`${SB_URL}/rest/v1/reels?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("আপডেট করা যায়নি")
}

// রিলস মুছে ফেলা
export async function deleteReel(token: string, id: string) {
  const res = await fetch(`${SB_URL}/rest/v1/reels?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr(token),
  })
  if (!res.ok) throw new Error("মুছে ফেলা যায়নি")
}
