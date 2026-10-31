import { SB_URL, SB_KEY } from "./sb"

export const BRANCHES = [
  { key: "university", bn: "বিশ্ববিদ্যালয়" },
  { key: "hall", bn: "হল" },
  { key: "department", bn: "ডিপার্টমেন্ট" },
  { key: "mbsturu", bn: "MBSTURU" },
  { key: "other", bn: "অন্যান্য" },
] as const

export type Notice = {
  id: string
  branch: string
  title: string
  heading: string | null
  body: string | null
  ref_number: string | null
  link_url: string | null
  file_url: string | null
  file_name: string | null
  file_type: string | null
  show_name: boolean
  poster_name: string | null
  is_pinned: boolean
  expires_at: string | null
  created_at: string
  updated_at: string | null
}

export type NoticeInput = Pick<
  Notice,
  | "branch" | "title" | "heading" | "body" | "ref_number" | "link_url"
  | "file_url" | "file_name" | "file_type" | "show_name" | "is_pinned" | "expires_at"
>

export type NoticeOwner = {
  notice_id: string
  created_at: string
  profiles: { full_name: string } | null
}

export type NoticeComment = {
  id: string
  notice_id: string
  name: string | null
  message: string
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

/* ---------- নোটিশ পড়া ---------- */

export async function getNotices(token?: string, includeExpired = false): Promise<Notice[]> {
  try {
    let url = `${SB_URL}/rest/v1/board_notices?select=*&order=is_pinned.desc,created_at.desc&limit=300`
    if (!includeExpired) {
      const now = encodeURIComponent(new Date().toISOString())
      url += `&or=(expires_at.is.null,expires_at.gt.${now})`
    }
    const res = await fetch(url, { headers: hdr(token), cache: "no-store" })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// শুধু অ্যাডমিন (সবার) ও নোটিশদাতা (নিজের) এটা দেখতে পাবেন
export async function getNoticeOwners(token: string): Promise<NoticeOwner[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/board_notice_owners?select=notice_id,created_at,profiles(full_name)`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/* ---------- নোটিশ লেখা ---------- */

export async function createNotice(token: string, data: NoticeInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notices`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateNotice(token: string, id: string, data: Partial<NoticeInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notices?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteNotice(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notices?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ---------- ফাইল আপলোড (ছবি, PDF, DOC) ---------- */

export const MAX_NOTICE_FILE_MB = 20

export async function uploadNoticeFile(
  token: string,
  file: File
): Promise<{ url: string; name: string; type: string }> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin"
  const stored = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const type = file.type || "application/octet-stream"
  const h = hdr(token)
  h["Content-Type"] = type
  await ok(
    await fetch(`${SB_URL}/storage/v1/object/notices/${stored}`, {
      method: "POST",
      headers: h,
      body: file,
    })
  )
  return {
    url: `${SB_URL}/storage/v1/object/public/notices/${stored}`,
    name: file.name,
    type,
  }
}

// এই লিংকে চাপলে ফাইল সরাসরি ডাউনলোড হয়
export function downloadUrl(url: string, name: string | null) {
  return `${url}?download=${encodeURIComponent(name || "notice")}`
}

/* ---------- কমেন্ট ---------- */

export async function getNoticeComments(noticeId: string): Promise<NoticeComment[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/board_notice_comments?select=*&notice_id=eq.${encodeURIComponent(noticeId)}&order=created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function addNoticeComment(noticeId: string, name: string, message: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notice_comments`, {
      method: "POST",
      headers: { ...hdr(undefined, true), Prefer: "return=minimal" },
      body: JSON.stringify({ notice_id: noticeId, name: name || null, message }),
    })
  )
}

export async function deleteNoticeComment(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/board_notice_comments?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ---------- সময় দেখানো ---------- */

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("bn-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const n = (x: number) => Math.floor(x).toLocaleString("bn-BD")
  if (s < 60) return "এইমাত্র"
  if (s < 3600) return `${n(s / 60)} মিনিট আগে`
  if (s < 86400) return `${n(s / 3600)} ঘণ্টা আগে`
  if (s < 86400 * 30) return `${n(s / 86400)} দিন আগে`
  if (s < 86400 * 365) return `${n(s / (86400 * 30))} মাস আগে`
  return `${n(s / (86400 * 365))} বছর আগে`
}

export function isImageType(type: string | null) {
  return !!type && type.startsWith("image/")
}
