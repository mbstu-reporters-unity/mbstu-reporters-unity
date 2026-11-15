import { SB_URL, SB_KEY, attachProfileAvatars, type Post, type Profile } from "./sb"

export type CommunityPage = {
  id: string
  creator_id?: string | null
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

/* সব সক্রিয় পেজ লোড করা */
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

/* বর্তমান ইউজারের নিজের তৈরি পেজসমূহ লোড করা */
export async function getMyPages(token: string, userId: string): Promise<CommunityPage[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/community_pages?select=*&creator_id=eq.${encodeURIComponent(userId)}&order=created_at.asc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/* কোনো ইউজারের পেজ না থাকলে স্বয়ংক্রিয়ভাবে তার নামে একটি পেজ তৈরি করা */
export async function ensureUserAutoPage(
  token: string,
  profile: Pick<
    Profile,
    "id" | "full_name" | "user_type" | "department" | "batch" | "designation" | "office_section" | "bio" | "avatar_url"
  >
): Promise<CommunityPage[]> {
  const existing = await getMyPages(token, profile.id)
  if (existing.length > 0) return existing

  const rawAscii = (profile.full_name || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const shortId = profile.id.replace(/-/g, "").slice(0, 6)
  const slug = `${(rawAscii || "page").slice(0, 40)}-${shortId}`

  const catMap: Record<string, string> = {
    teacher: "শিক্ষক পেজ",
    staff: "কর্মকর্তা/কর্মচারী পেজ",
    reporter: "সাংবাদিক পেজ",
    student: "শিক্ষার্থী পেজ",
  }
  const bioParts = [
    profile.designation,
    profile.department ? `${profile.department}${profile.batch ? ` (${profile.batch})` : ""}` : null,
    profile.office_section,
  ].filter(Boolean)

  try {
    await createCommunityPage(token, {
      creator_id: profile.id,
      name: profile.full_name,
      slug,
      category: catMap[profile.user_type || "student"] || "ব্যক্তিগত পেজ",
      bio: profile.bio?.trim() || (bioParts.length ? bioParts.join(" · ") : `${profile.full_name}-এর অফিসিয়াল পেজ।`),
      avatar_url: profile.avatar_url || null,
      is_verified: false,
      is_active: true,
      sort_order: 100,
    })
  } catch {}

  return await getMyPages(token, profile.id)
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
export async function getPagePosts(
  pageId: string,
  includeHidden = false,
  token?: string
): Promise<Post[]> {
  try {
    const filter = includeHidden ? "" : "&or=(hidden.is.null,hidden.eq.false)"
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&page_id=eq.${encodeURIComponent(pageId)}${filter}&order=created_at.desc&limit=100`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
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

/* ==================== পেজ ফলো / লাইক সিস্টেম ==================== */

export async function getPageFollowStats(
  pageId: string,
  followerKey?: string
): Promise<{ count: number; following: boolean }> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/page_follows?select=follower_key&page_id=eq.${encodeURIComponent(pageId)}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return { count: 0, following: false }
    const rows: { follower_key: string }[] = await res.json()
    return {
      count: rows.length,
      following: followerKey ? rows.some((r) => r.follower_key === followerKey) : false,
    }
  } catch {
    return { count: 0, following: false }
  }
}

export async function togglePageFollow(
  pageId: string,
  followerKey: string,
  currentlyFollowing: boolean,
  userId?: string | null
): Promise<boolean> {
  if (currentlyFollowing) {
    await ok(
      await fetch(
        `${SB_URL}/rest/v1/page_follows?page_id=eq.${encodeURIComponent(pageId)}&follower_key=eq.${encodeURIComponent(followerKey)}`,
        {
          method: "DELETE",
          headers: hdr(),
        }
      )
    )
    return false
  }

  await ok(
    await fetch(`${SB_URL}/rest/v1/page_follows`, {
      method: "POST",
      headers: { ...hdr(undefined, true), Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
        page_id: pageId,
        follower_key: followerKey,
        user_id: userId || null,
      }),
    })
  )
  return true
}
