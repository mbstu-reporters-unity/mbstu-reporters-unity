export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

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

export async function login(email: string, password: string): Promise<string> {
  const res = await ok(
    await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({ email, password }),
    })
  )
  const j = await res.json()
  return j.access_token as string
}

export async function getPosts(limit = 50): Promise<Post[]> {
  const res = await ok(
    await fetch(
      `${SB_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
  )
  return res.json()
}

export async function getPost(id: string): Promise<Post | null> {
  const res = await ok(
    await fetch(
      `${SB_URL}/rest/v1/posts?select=*&id=eq.${encodeURIComponent(id)}`,
      { headers: hdr(), cache: "no-store" }
    )
  )
  const rows: Post[] = await res.json()
  return rows[0] || null
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

export async function uploadImage(token: string, file: Blob): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const h = hdr(token)
  h["Content-Type"] = "image/jpeg"
  await ok(
    await fetch(`${SB_URL}/storage/v1/object/images/${name}`, {
      method: "POST",
      headers: h,
      body: file,
    })
  )
  return `${SB_URL}/storage/v1/object/public/images/${name}`
}

export async function getApprovedComments(postId: string): Promise<PublicComment[]> {
  const res = await ok(
    await fetch(
      `${SB_URL}/rest/v1/comments?select=id,name,message,created_at&post_id=eq.${encodeURIComponent(postId)}&approved=eq.true&order=created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
  )
  return res.json()
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
  const res = await ok(
    await fetch(
      `${SB_URL}/rest/v1/comments?select=*,posts(title)&approved=eq.false&order=created_at.desc`,
      { headers: hdr(token), cache: "no-store" }
    )
  )
  return res.json()
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
