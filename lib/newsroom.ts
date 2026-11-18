import { SB_URL, SB_KEY, createPostReturningId } from "./sb"

export type DraftStatus = "draft" | "submitted" | "needs_revision" | "published"

export interface NewsroomDraft {
  id: string
  user_id: string
  author_name: string
  author_avatar: string | null
  title: string
  heading: string | null
  category: string
  body: string
  image_url: string | null
  link_url: string | null
  status: DraftStatus
  editor_note: string | null
  published_post_id: string | null
  created_at: string
  updated_at: string
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

export async function getMyNewsroomDrafts(
  token: string,
  userId: string
): Promise<{ rows: NewsroomDraft[]; missingTable: boolean }> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/newsroom_drafts?select=*&user_id=eq.${encodeURIComponent(
        userId
      )}&order=updated_at.desc&limit=100`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (res.status === 404) return { rows: [], missingTable: true }
    if (!res.ok) return { rows: [], missingTable: false }
    return { rows: await res.json(), missingTable: false }
  } catch {
    return { rows: [], missingTable: false }
  }
}

export async function getEditorNewsroomDrafts(
  token: string
): Promise<{ rows: NewsroomDraft[]; missingTable: boolean }> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/newsroom_drafts?select=*&status=neq.draft&order=updated_at.desc&limit=150`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (res.status === 404) return { rows: [], missingTable: true }
    if (!res.ok) return { rows: [], missingTable: false }
    return { rows: await res.json(), missingTable: false }
  } catch {
    return { rows: [], missingTable: false }
  }
}

export async function createNewsroomDraft(
  token: string,
  data: Omit<
    NewsroomDraft,
    "id" | "created_at" | "updated_at" | "published_post_id" | "editor_note"
  >
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/newsroom_drafts`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateNewsroomDraft(
  token: string,
  id: string,
  data: Partial<NewsroomDraft>
) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/newsroom_drafts?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify({
          ...data,
          updated_at: new Date().toISOString(),
        }),
      }
    )
  )
}

export async function deleteNewsroomDraft(token: string, id: string) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/newsroom_drafts?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: hdr(token),
      }
    )
  )
}

export async function publishNewsroomDraftToPosts(
  token: string,
  draft: NewsroomDraft
): Promise<string | null> {
  const postId = await createPostReturningId(token, {
    title: draft.title.trim(),
    heading: draft.heading?.trim() || null,
    body: draft.body.trim(),
    category: draft.category || "ক্যাম্পাস সংবাদ",
    author: draft.author_name || null,
    author_avatar: draft.author_avatar || null,
    show_author_avatar: Boolean(draft.author_avatar),
    image_url: draft.image_url || null,
    video_url: null,
    embed_media_url: null,
    link_url: draft.link_url || null,
    hidden: false,
  })

  await updateNewsroomDraft(token, draft.id, {
    status: "published",
    published_post_id: postId,
  })

  return postId
}
