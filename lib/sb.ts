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
  created_at: string
}
export type PostInput = Omit<Post, "id" | "created_at">
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
  created_at: string
}
export type SignupInfo = {
  full_name: string
  department: string
  batch: string
  student_id: string
  phone: string
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

/* ---------- লগইন, সাইনআপ ও প্রোফাইল উদ্ধার ---------- */

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
  try {
    const u = await ok(
      await fetch(`${SB_URL}/auth/v1/user`, { headers: hdr(token), cache: "no-store" })
    )
    const user = await u.json()
    if (!user || !user.id) return null

    // ১. প্রথমে ডেটাবেসে প্রোফাইল খোঁজা
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

    // ২. ডেটাবেসে প্রোফাইল পাওয়া গেলে সরাসরি রিটার্ন
    if (rows && rows.length > 0) {
      return rows[0]
    }

    // ৩. স্মার্ট রিকভারি: ডেটাবেসে কোনো কারণে না পেলেও আপনি অ্যাডমিন হলে ড্যাশবোর্ড সরাসরি ওপেন হবে
    const isAdminEmail = user.email?.toLowerCase().includes("mbstureportersunity@gmail.com")
    const fallbackProfile: Profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || (isAdminEmail ? "প্রধান অ্যাডমিন" : "ক্যাম্পাস সাংবাদিক"),
      department: user.user_metadata?.department || "মাভাবিপ্রবি",
      batch: user.user_metadata?.batch || "২০২১-২২",
      student_id: user.user_metadata?.student_id || "CP22015",
      phone: user.user_metadata?.phone || "01753964870",
      role: isAdminEmail ? "admin" : "moderator",
      approved: isAdminEmail ? true : false,
      created_at: new Date().toISOString(),
    }

    // ব্যাকগ্রাউন্ডে ডেটাবেসে সেভ করার চেষ্টা
    fetch(`${SB_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(fallbackProfile),
    }).catch(() => {})

    return fallbackProfile
  } catch (e) {
    throw e
  }
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

/* ---------- সরাসরি ফোন থেকে ছবি আপলোড ---------- */

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

/* ---------- কমেন্ট ও পাসওয়ার্ড রিকভারি ---------- */

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
