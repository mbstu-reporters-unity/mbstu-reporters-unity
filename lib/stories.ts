import { SB_URL, SB_KEY } from "./sb"

export interface StoryItem {
  id: string
  user_id?: string
  author_name: string
  author_avatar: string | null
  media_url: string
  media_type: 'image' | 'video'
  caption?: string | null
  link_url?: string | null
  post_id?: string | null
  is_highlight: boolean
  highlight_title?: string | null
  is_active: boolean
  created_at: string
  expires_at?: string
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h["Content-Type"] = "application/json"
  return h
}

// হোমপেজের সক্রিয় স্টোরি ও হাইলাইটস
export async function getActiveStories(): Promise<StoryItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/stories?select=*&is_active=eq.true&or=(is_highlight.eq.true,expires_at.gt.now())&order=created_at.desc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// অ্যাডমিনের জন্য সব স্টোরি
export async function getAllStoriesAdmin(token: string): Promise<StoryItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/stories?select=*&order=created_at.desc&limit=100`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// স্টোরি তৈরি
export async function createStory(token: string, data: Partial<StoryItem>) {
  const res = await fetch(`${SB_URL}/rest/v1/stories`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=representation" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "স্টোরি সংরক্ষণ করা যায়নি")
  }
  return await res.json()
}

// স্টোরি আপডেট
export async function updateStory(token: string, id: string, data: Partial<StoryItem>) {
  const res = await fetch(`${SB_URL}/rest/v1/stories?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("স্টোরি আপডেট করা যায়নি")
}

// স্টোরি মুছে ফেলা
export async function deleteStory(token: string, id: string) {
  const res = await fetch(`${SB_URL}/rest/v1/stories?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr(token),
  })
  if (!res.ok) throw new Error("স্টোরি ডিলিট করা যায়নি")
}
