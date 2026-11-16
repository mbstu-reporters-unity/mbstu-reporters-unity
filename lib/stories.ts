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

// হোমপেজের সক্রিয় স্টোরি ও হাইলাইটস (২৪ ঘণ্টার বৈধ স্টোরি বা আজীবন হাইলাইট)
export async function getActiveStories(): Promise<StoryItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/stories?select=*&is_active=eq.true&order=created_at.desc&limit=60`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: StoryItem[] = await res.json()
    if (!Array.isArray(rows)) return []

    const now = Date.now()
    // ফিল্টার: হয় এটি হাইলাইট, অথবা এটি তৈরি হওয়ার ২৪ ঘণ্টার মধ্যে আছে
    return rows.filter((s) => {
      if (s.is_highlight) return true
      if (s.expires_at) {
        return new Date(s.expires_at).getTime() > now
      }
      // যদি expires_at ফাঁকা থাকে, তবে তৈরি হওয়ার ২৪ ঘণ্টার মধ্যে থাকলে দেখাবে
      const createdTime = new Date(s.created_at).getTime()
      return now - createdTime < 24 * 60 * 60 * 1000
    })
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

// স্টোরি তৈরি (স্বয়ংক্রিয় ২৪ ঘণ্টার মেয়াদ নিশ্চিতকরণ)
export async function createStory(token: string, data: Partial<StoryItem>) {
  const payload = {
    ...data,
    is_active: true,
    expires_at: data.is_highlight
      ? null
      : data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  const res = await fetch(`${SB_URL}/rest/v1/stories`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=representation" },
    body: JSON.stringify(payload),
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
