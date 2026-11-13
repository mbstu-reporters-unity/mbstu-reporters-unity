import { SB_URL, SB_KEY, attachProfileAvatars, type Post } from "./sb"

function hdr(): Record<string, string> {
  return {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
  }
}

// অ্যাডমিন প্যানেলের ক্রম অনুযায়ী দৃশ্যমান সব ক্যাটাগরির নাম আনা
export async function getVisibleCategoryNames(): Promise<string[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/categories?select=name&or=(is_hidden.is.null,is_hidden.eq.false)&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: { name: string }[] = await res.json()
    return rows.map((r) => r.name)
  } catch {
    return []
  }
}

// নির্দিষ্ট কোনো ক্যাটাগরির সব সংবাদ লোড করা
export async function getCategoryPosts(category: string, limit = 100): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&or=(hidden.is.null,hidden.eq.false)&category=eq.${encodeURIComponent(category)}&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
  } catch {
    return []
  }
}
