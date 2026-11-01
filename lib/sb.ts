export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const BUCKET = "post-images"

export type Post = {
  id: string
  title: string
  heading: string | null
  body: string | null
  category: string | null
  author: string | null
  image_url: string | null
  video_url: string | null
  user_id: string | null
  created_at: string
  hidden?: boolean | null
  link_url?: string | null
}
export type PostInput = Omit<Post, "id" | "created_at" | "user_id">
export type PublicComment = {
  id: string
  name: string | null
  message: string
  created_at: string
}
export type PendingComment = PublicComment & {
  post_id: string
  posts: { title: string } | null
}
export type Profile = {
  id: string
  full_name: string
  department: string
  batch: string
  student_id: string
  phone: string
  email: string | null
  role: string
  approved: boolean
  newspaper_name?: string | null
  avatar_url?: string | null
  director_visible?: boolean | null
  created_at: string
}
export type SignupInfo = {
  full_name: string
  department: string
  batch: string
  student_id: string
  phone: string
  newspaper_name?: string
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  if (token) h.Authorization = `Bearer ${token}`
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

/* ---------- লগইন, সাইনআপ ও প্রোফাইল ---------- */

export async function login(email: string, password: string): Promise<string> {
  const res = await ok(
    await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({ email: email.trim(), password }),
    })
  )
  const j = await res.json()
  return j.access_token as string
}

export async function signUp(email: string, password: string, info: SignupInfo) {
  const res = await ok(
    await fetch(`${SB_URL}/auth/v1/signup`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({ email: email.trim(), password, data: info }),
    })
  )
  return res.json()
}

export async function getMe(token: string): Promise<Profile | null> {
  const u = await ok(
    await fetch(`${SB_URL}/auth/v1/user`, { headers: hdr(token), cache: "no-store" })
  )
  const user = await u.json()
  if (!user || !user.id) return null

  let rows: Profile[] = []
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(user.id)}`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (res.ok) rows = await res.json()
  } catch {}

  if (!rows || rows.length === 0) {
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(user.email)}`,
        { headers: hdr(token), cache: "no-store" }
      )
      if (res.ok) rows = await res.json()
    } catch {}
  }

  return rows && rows.length > 0 ? rows[0] : null
}

/* ---------- সাংবাদিক ও মডারেটর ব্যবস্থাপনা ---------- */

export async function getReporters(token: string, approved: boolean): Promise<Profile[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/profiles?select=*&approved=eq.${approved}&order=created_at.desc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function approveReporter(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ approved: true }),
    })
  )
}

export async function removeReporter(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function updateMyProfile(
  token: string,
  id: string,
  data: Partial<Pick<Profile, "full_name" | "department" | "batch" | "phone" | "newspaper_name" | "avatar_url">>
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

/* ---------- ডিরেক্টর প্যানেলে দৃশ্যমানতা (শুধু অ্যাডমিন) ---------- */

export async function setDirectorVisible(token: string, id: string, visible: boolean) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ director_visible: visible }),
    })
  )
}
/* ---------- সংবাদ পোস্ট ও এডিট ---------- */

export async function getPosts(limit = 50): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&id=eq.${encodeURIComponent(id)}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return null
    const rows: Post[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

export async function createPost(token: string, data: PostInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/posts`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updatePost(token: string, id: string, data: PostInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deletePost(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ---------- ছবি ও ভিডিও আপলোড ---------- */

export async function uploadImage(token: string, file: Blob): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const h = hdr(token)
  h["Content-Type"] = "image/jpeg"
  await ok(
    await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: h,
      body: file,
    })
  )
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${name}`
}

export async function uploadVideo(token: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "")
  const name = `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "mp4"}`
  const h = hdr(token)
  h["Content-Type"] = file.type || "video/mp4"
  await ok(
    await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: h,
      body: file,
    })
  )
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${name}`
}

/* ---------- কমেন্ট ও পাসওয়ার্ড রিকভারি ---------- */

export async function getApprovedComments(postId: string): Promise<PublicComment[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/comments?select=id,name,message,created_at&post_id=eq.${encodeURIComponent(postId)}&approved=eq.true&order=created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function addComment(postId: string, name: string, message: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/comments`, {
      method: "POST",
      headers: { ...hdr(undefined, true), Prefer: "return=minimal" },
      body: JSON.stringify({ post_id: postId, name, message }),
    })
  )
}

export async function getPendingComments(token: string): Promise<PendingComment[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/comments?select=*,posts(title)&approved=eq.false&order=created_at.desc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function approveComment(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/comments?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ approved: true }),
    })
  )
}

export async function deleteComment(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/comments?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function requestReset(email: string, redirectTo: string) {
  await ok(
    await fetch(`${SB_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({ email: email.trim() }),
    })
  )
}

export async function updatePassword(token: string, password: string) {
  await ok(
    await fetch(`${SB_URL}/auth/v1/user`, {
      method: "PUT",
      headers: hdr(token, true),
      body: JSON.stringify({ password }),
    })
  )
}
/* ---------- নেতৃত্ব বোর্ড ---------- */

export const POSITIONS = [
  { key: "president", en: "President", bn: "সভাপতি" },
  { key: "vice_president", en: "Vice President", bn: "সহ-সভাপতি" },
  { key: "general_secretary", en: "General Secretary", bn: "সাধারণ সম্পাদক" },
  { key: "office_secretary", en: "Office Secretary", bn: "দপ্তর সম্পাদক" },
  { key: "treasurer", en: "Treasurer", bn: "কোষাধ্যক্ষ" },
  { key: "publicity_secretary", en: "Publicity & Publication Secretary", bn: "প্রচার ও প্রকাশনা সম্পাদক" },
  { key: "executive_member", en: "Executive Member", bn: "কার্যনির্বাহী সদস্য" },
] as const

export type Leader = {
  id: string
  profile_id: string
  position: string
  sort_order: number
  display_name: string
  department: string | null
  message: string | null
  photo_url: string | null
  is_visible: boolean
  term_year: number
}
export type LeaderInput = Omit<Leader, "id" | "term_year"> & { term_year?: number }

export async function getLeaders(token?: string): Promise<Leader[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/leaders?select=*&order=sort_order.asc`, {
      headers: hdr(token),
      cache: "no-store",
    })
    if (!res.ok) return []
    const rows: Leader[] = await res.json()
    const rank = (k: string) => POSITIONS.findIndex((p) => p.key === k)
    return rows.sort((a, b) => rank(a.position) - rank(b.position) || a.sort_order - b.sort_order)
  } catch {
    return []
  }
}

export async function addLeader(token: string, data: LeaderInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/leaders`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateLeader(token: string, id: string, data: Partial<LeaderInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/leaders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function removeLeader(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/leaders?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ---------- হাইড করা সংবাদ নিয়ন্ত্রণ ---------- */

export async function getVisiblePosts(limit = 50): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&hidden=eq.false&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getAllPosts(limit = 100): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function setPostHidden(token: string, id: string, hidden: boolean) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ hidden }),
    })
  )
}
/* ---------- ক্যাটাগরি ও হোম সেটিং ---------- */

export async function getCategoryNames(): Promise<string[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/categories?select=name&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: { name: string }[] = await res.json()
    return rows.map((r) => r.name)
  } catch {
    return []
  }
}

export async function addCategory(token: string, name: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/categories`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ name, sort_order: 100 }),
    })
  )
}

/* ---------- ক্যাটাগরি ব্যবস্থাপনা (শুধু অ্যাডমিন) ---------- */

export type CategoryRow = {
  name: string
  sort_order: number | null
  is_hidden: boolean
  is_locked: boolean
  created_at: string
}

export async function getCategories(token: string): Promise<CategoryRow[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/categories?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function updateCategory(
  token: string,
  name: string,
  data: Partial<Pick<CategoryRow, "name" | "is_hidden" | "is_locked">>
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/categories?name=eq.${encodeURIComponent(name)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteCategory(token: string, name: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/categories?name=eq.${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function getHomeLimit(): Promise<number> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.home_news_limit`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return 12
    const rows: { value: string }[] = await res.json()
    const n = parseInt(rows[0]?.value || "12", 10)
    return n > 0 ? n : 12
  } catch {
    return 12
  }
}

export async function saveHomeLimit(token: string, n: number) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key: "home_news_limit", value: String(n) }),
    })
  )
}

/* ---------- সেকশন, সংখ্যা ও স্টুডেন্ট কর্নার ---------- */

export const CAT_CAMPUS = "ক্যাম্পাস সংবাদ"
export const CAT_CLUB = "ক্লাব"
export const CAT_STUDENT = "স্টুডেন্ট কর্নার"

export function limitKey(cat: string) {
  return cat === CAT_CAMPUS ? "home_news_limit" : `limit:${cat}`
}

export async function getLimits(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/app_config?select=key,value`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return {}
    const rows: { key: string; value: string }[] = await res.json()
    const o: Record<string, number> = {}
    rows.forEach((r) => {
      const n = parseInt(r.value, 10)
      if (n > 0) o[r.key] = n
    })
    return o
  } catch {
    return {}
  }
}

export async function saveLimit(token: string, key: string, n: number) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, value: String(n) }),
    })
  )
}

export type StudentItem = {
  id: string
  kind: string
  title: string
  excerpt: string | null
  author: string | null
  dept: string | null
  batch: string | null
  image_url: string | null
  link_url: string | null
  featured: boolean
  hidden: boolean
  sort_order: number
  created_at: string
}
export type StudentInput = Omit<StudentItem, "id" | "created_at">

export async function getStudentItems(includeHidden = false): Promise<StudentItem[]> {
  try {
    const f = includeHidden ? "" : "&hidden=eq.false"
    const res = await fetch(
      `${SB_URL}/rest/v1/student_items?select=*${f}&order=featured.desc,sort_order.asc,created_at.desc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function saveStudentItem(token: string, id: string | null, data: Partial<StudentInput>) {
  if (data.featured) {
    await ok(
      await fetch(`${SB_URL}/rest/v1/student_items?featured=eq.true`, {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify({ featured: false }),
      })
    )
  }
  await ok(
    await fetch(
      id ? `${SB_URL}/rest/v1/student_items?id=eq.${encodeURIComponent(id)}` : `${SB_URL}/rest/v1/student_items`,
      {
        method: id ? "PATCH" : "POST",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify(data),
      }
    )
  )
}

export async function deleteStudentItem(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/student_items?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
/* ---------- একাধিক ছবি (সংবাদ, নোটিশ, স্টুডেন্ট কর্নার) ---------- */

export type ParentType = "post" | "notice" | "student"

export type ImageRow = {
  id: string
  parent_type: ParentType
  parent_id: string
  url: string
  sort_order: number
  created_at: string
}

export async function getImages(type: ParentType, id: string): Promise<ImageRow[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/post_images?select=*&parent_type=eq.${type}&parent_id=eq.${encodeURIComponent(id)}&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getImagesForMany(
  type: ParentType,
  ids: string[]
): Promise<Record<string, ImageRow[]>> {
  const out: Record<string, ImageRow[]> = {}
  if (ids.length === 0) return out
  try {
    const list = ids.map((i) => encodeURIComponent(i)).join(",")
    const res = await fetch(
      `${SB_URL}/rest/v1/post_images?select=*&parent_type=eq.${type}&parent_id=in.(${list})&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return out
    const rows: ImageRow[] = await res.json()
    rows.forEach((r) => {
      if (!out[r.parent_id]) out[r.parent_id] = []
      out[r.parent_id].push(r)
    })
    return out
  } catch {
    return out
  }
}

export async function addImages(
  token: string,
  type: ParentType,
  id: string,
  urls: string[],
  startOrder = 0
) {
  if (urls.length === 0) return
  const rows = urls.map((url, i) => ({
    parent_type: type,
    parent_id: id,
    url,
    sort_order: startOrder + i,
  }))
  await ok(
    await fetch(`${SB_URL}/rest/v1/post_images`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    })
  )
}

export async function removeImage(token: string, imageId: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/post_images?id=eq.${encodeURIComponent(imageId)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function removeAllImages(token: string, type: ParentType, id: string) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/post_images?parent_type=eq.${type}&parent_id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers: hdr(token) }
    )
  )
}

/* নতুন সংবাদ তৈরি করে তার id ফেরত দেয় (ছবি জোড়ার জন্য দরকার) */
export async function createPostReturningId(token: string, data: PostInput): Promise<string | null> {
  const res = await ok(
    await fetch(`${SB_URL}/rest/v1/posts?select=id`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=representation" },
      body: JSON.stringify(data),
    })
  )
  const rows: { id: string }[] = await res.json()
  return rows[0]?.id ?? null
}
