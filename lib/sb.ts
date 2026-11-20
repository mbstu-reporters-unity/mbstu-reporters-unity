import type { AntiSpamPayload } from "./anti-spam"
import { hasEnoughHomepageHistory } from "./homepage-feed"

export const SB_URL = "https://pdualebabnvkoaqaqcut.supabase.co"
export const SB_KEY = "sb_publishable_7SMqtPPUqsWVCPIXDqgPTw_Jrctzkwm"
const BUCKET = "post-images"

export type UserType = "student" | "teacher" | "staff" | "reporter"

export type PostPageInfo = {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  is_verified: boolean
}

export type Post = {
  id: string
  title: string
  heading: string | null
  body: string | null
  category: string | null
  club_id?: string | null
  page_id?: string | null
  page?: PostPageInfo | null
  author: string | null
  author_avatar?: string | null
  author_user_type?: UserType | null
  show_author_avatar?: boolean | null
  image_url: string | null
  video_url: string | null
  embed_media_url?: string | null
  user_id: string | null
  created_at: string
  hidden?: boolean | null
  link_url?: string | null
  view_count?: number | null
}

export type PostInput = Omit<Post, "id" | "created_at" | "user_id" | "page" | "author_user_type" | "view_count">

export type PublicComment = {
  id: string
  name: string | null
  message: string
  created_at: string
  parent_id?: string | null
}

export type PendingComment = PublicComment & {
  post_id: string
  posts: { title: string } | null
}

export type Profile = {
  id: string
  full_name: string
  department: string | null
  batch: string | null
  student_id: string | null
  phone: string | null
  email: string | null
  role: string
  user_type: UserType
  designation?: string | null
  office_section?: string | null
  staff_id?: string | null
  bio?: string | null
  approved: boolean
  can_publish_notice?: boolean | null
  newspaper_name?: string | null
  avatar_url?: string | null
  director_visible?: boolean | null
  moderator_permissions?: ModeratorPermissions | null
  created_at: string
}

export type ModeratorPermissionKey =
  | "panel_all"
  | "posts"
  | "stories"
  | "reels"
  | "notices"
  | "editorial"
  | "polls"
  | "events"
  | "club_posts"
  | "comments"
  | "homepage"
  | "newsroom"
  | "send_submission"
  | "teacher_columns"
  | "content_hub"
  | "resource_manager"
  | "feedback_newsletter"
  | "polls_podcast"
  | "membership_apps"
  | "backup_export"
  | "council_archive"
  | "alumni_opportunities"
  | "community_pages"
  | "clubs"
  | "students"
  | "social_sites"
  | "associations"
  | "administration"
  | "faculties"
  | "leaders"
  | "directors"
  | "categories"
  | "ticker"
  | "hero"
  | "hero_banner"
  | "limits"
  | "site_settings"
  | "resource_manager"
  | "event_manager"
  | "feedback_newsletter"
  | "polls_podcast"
  | "backup_export"
  | "newsroom"
  | "council_archive"
  | "alumni_opportunities"

export type ModeratorPermissions = Partial<Record<ModeratorPermissionKey, boolean>>

export const ALL_MODERATOR_PERMISSIONS: ModeratorPermissionKey[] = [
  "posts",
  "stories",
  "reels",
  "notices",
  "editorial",
  "polls",
  "events",
  "club_posts",
  "comments",
  "homepage",
  "newsroom",
  "send_submission",
  "teacher_columns",
  "content_hub",
  "resource_manager",
  "feedback_newsletter",
  "polls_podcast",
  "membership_apps",
  "backup_export",
  "council_archive",
  "alumni_opportunities",
  "community_pages",
  "clubs",
  "students",
  "social_sites",
  "associations",
  "administration",
  "faculties",
  "leaders",
  "directors",
  "categories",
  "ticker",
  "hero",
  "hero_banner",
  "limits",
  "site_settings",
]

export function resolveModeratorMode(perms?: ModeratorPermissions | null): "all_enabled" | "all_disabled" | "custom" {
  if (!perms) return "all_disabled"
  const keys = ALL_MODERATOR_PERMISSIONS
  const allTrue = keys.every((k) => perms[k] === true)
  const allFalse = keys.every((k) => perms[k] !== true)
  if (allTrue) return "all_enabled"
  if (allFalse) return "all_disabled"
  return "custom"
}

export function buildModeratorPermissions(mode: "all_enabled" | "all_disabled" | "custom", custom?: ModeratorPermissions): ModeratorPermissions {
  if (mode === "all_enabled") {
    const out: ModeratorPermissions = {}
    for (const k of ALL_MODERATOR_PERMISSIONS) out[k] = true
    return out
  }
  if (mode === "all_disabled") {
    return {}
  }
  return custom ? { ...custom } : {}
}

export async function getModeratorPermissions(token: string, id: string): Promise<ModeratorPermissions | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/profiles?select=moderator_permissions&id=eq.${encodeURIComponent(id)}`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0]?.moderator_permissions || null
  } catch {
    return null
  }
}

export async function saveModeratorPermissions(
  token: string,
  id: string,
  perms: ModeratorPermissions
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ moderator_permissions: perms }),
    })
  )
}

export async function setModeratorPanelMode(
  token: string,
  id: string,
  mode: "all_enabled" | "all_disabled" | "custom",
  custom?: ModeratorPermissions
) {
  await saveModeratorPermissions(token, id, buildModeratorPermissions(mode, custom))
}

export async function getGlobalModeratorPanelEnabled(): Promise<boolean> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.moderator_panel_enabled`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return true
    const rows: { value: string }[] = await res.json()
    const v = rows[0]?.value
    return v === undefined ? true : v === "true"
  } catch {
    return true
  }
}

export async function saveGlobalModeratorPanelEnabled(token: string, enabled: boolean) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key: "moderator_panel_enabled", value: String(enabled) }),
    })
  )
}

export type SignupInfo = {
  full_name: string
  user_type: UserType
  department?: string
  batch?: string
  student_id?: string
  designation?: string
  office_section?: string
  staff_id?: string
  phone: string
  newspaper_name?: string
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

/* ---------- প্রোফাইলের ছবি ও পেজের তথ্য অটো-সিঙ্ক (অপ্টিমাইজড) ---------- */

export async function attachProfileAvatars(posts: Post[]): Promise<Post[]> {
  if (!posts || posts.length === 0) return posts

  const needsProfilePosts = posts.filter(
    (p) => (!p.author_avatar && p.show_author_avatar !== false) || !p.author_user_type
  )
  const userIds = Array.from(
    new Set(needsProfilePosts.map((p) => p.user_id).filter((id): id is string => Boolean(id)))
  )
  const fallbackNames = Array.from(
    new Set(
      needsProfilePosts
        .filter((p) => !p.user_id && p.author)
        .map((p) => p.author!.trim())
        .filter(Boolean)
    )
  )
  const pageIds = Array.from(
    new Set(posts.map((p) => p.page_id).filter((id): id is string => Boolean(id)))
  )

  const byId = new Map<string, { avatar_url?: string | null; user_type?: UserType | null }>()
  const byName = new Map<string, { avatar_url?: string | null; user_type?: UserType | null }>()
  const pageMap = new Map<string, PostPageInfo>()

  try {
    const tasks: Promise<void>[] = []

    if (userIds.length > 0) {
      const idList = userIds.map((id) => encodeURIComponent(id)).join(",")
      tasks.push(
        fetch(
          `${SB_URL}/rest/v1/profiles?select=id,full_name,avatar_url,user_type&id=in.(${idList})`,
          { headers: hdr(), cache: "no-store" }
        )
          .then((res) => (res.ok ? res.json() : []))
          .then(
            (
              profiles: Array<{
                id: string
                full_name: string
                avatar_url?: string | null
                user_type?: UserType | null
              }>
            ) => {
              if (!Array.isArray(profiles)) return
              for (const pr of profiles) {
                const info = { avatar_url: pr.avatar_url, user_type: pr.user_type || "student" }
                if (pr.id) byId.set(pr.id, info)
                if (pr.full_name) byName.set(pr.full_name.trim().toLowerCase(), info)
              }
            }
          )
          .catch(() => {})
      )
    }

    if (fallbackNames.length > 0) {
      const nameList = fallbackNames.map((n) => `"${n.replace(/"/g, '\\"')}"`).join(",")
      tasks.push(
        fetch(
          `${SB_URL}/rest/v1/profiles?select=id,full_name,avatar_url,user_type&approved=eq.true&full_name=in.(${encodeURIComponent(nameList)})`,
          { headers: hdr(), cache: "no-store" }
        )
          .then((res) => (res.ok ? res.json() : []))
          .then(
            (
              profiles: Array<{
                id: string
                full_name: string
                avatar_url?: string | null
                user_type?: UserType | null
              }>
            ) => {
              if (!Array.isArray(profiles)) return
              for (const pr of profiles) {
                const info = { avatar_url: pr.avatar_url, user_type: pr.user_type || "student" }
                if (pr.id) byId.set(pr.id, info)
                if (pr.full_name) byName.set(pr.full_name.trim().toLowerCase(), info)
              }
            }
          )
          .catch(() => {})
      )
    }

    if (pageIds.length > 0) {
      const listParam = pageIds.map((id) => encodeURIComponent(id)).join(",")
      tasks.push(
        fetch(
          `${SB_URL}/rest/v1/community_pages?select=id,name,slug,avatar_url,is_verified&is_active=eq.true&id=in.(${listParam})`,
          { headers: hdr(), cache: "no-store" }
        )
          .then((res) => (res.ok ? res.json() : []))
          .then((pages: PostPageInfo[]) => {
            if (!Array.isArray(pages)) return
            for (const pg of pages) {
              if (pg.id) pageMap.set(pg.id, pg)
            }
          })
          .catch(() => {})
      )
    }

    if (tasks.length > 0) {
      await Promise.all(tasks)
    }

    return posts.map((p) => {
      const prInfo =
        (p.user_id ? byId.get(p.user_id) : undefined) ||
        (p.author ? byName.get(p.author.trim().toLowerCase()) : undefined)

      const resolvedAvatar =
        p.author_avatar ||
        (p.show_author_avatar !== false ? prInfo?.avatar_url || null : null)

      const resolvedType = p.author_user_type || prInfo?.user_type || null
      const resolvedPage = p.page_id ? pageMap.get(p.page_id) || p.page || null : null

      return {
        ...p,
        author_avatar: resolvedAvatar,
        author_user_type: resolvedType,
        page: resolvedPage,
      }
    })
  } catch {
    return posts
  }
}

/* ---------- লগইন, টোকেন রিফ্রেশ, সাইনআপ ও প্রোফাইল ---------- */

export function isTokenExpired(tokenStr: string): boolean {
  try {
    const parts = tokenStr.split(".")
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000 - 60000
  } catch {
    return false
  }
}

export async function login(email: string, password: string): Promise<string> {
  const cleanEmail = email.trim()
  const res = await ok(
    await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({ email: cleanEmail, password }),
    })
  )
  const j = await res.json()
  if (typeof window !== "undefined" && j.access_token) {
    try {
      localStorage.setItem("mbstu_admin_token", j.access_token)
      if (j.refresh_token) localStorage.setItem("mbstu_admin_refresh_token", j.refresh_token)
      localStorage.setItem("mbstu_admin_email", cleanEmail)
    } catch {}
  }
  return j.access_token as string
}

export async function refreshSession(): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    const rt = localStorage.getItem("mbstu_admin_refresh_token")
    if (!rt) return null
    const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) return null
    const j = await res.json()
    if (j.access_token) {
      localStorage.setItem("mbstu_admin_token", j.access_token)
      if (j.refresh_token) localStorage.setItem("mbstu_admin_refresh_token", j.refresh_token)
      return j.access_token as string
    }
  } catch {}
  return null
}

export async function signUp(email: string, password: string, info: SignupInfo) {
  const cleanEmail = email.trim()
  const autoApproved = info.user_type === "student"

  const res = await ok(
    await fetch(`${SB_URL}/auth/v1/signup`, {
      method: "POST",
      headers: hdr(undefined, true),
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: {
          ...info,
          approved: autoApproved,
          role: "user",
        },
      }),
    })
  )
  const userObj = await res.json()

  if (userObj?.user?.id && userObj?.access_token) {
    const profilePayload = {
      id: userObj.user.id,
      email: cleanEmail,
      full_name: info.full_name,
      user_type: info.user_type,
      department: info.department || null,
      batch: info.batch || null,
      student_id: info.student_id || null,
      designation: info.designation || null,
      office_section: info.office_section || null,
      staff_id: info.staff_id || null,
      phone: info.phone,
      newspaper_name: info.newspaper_name || null,
      approved: autoApproved,
      role: "user",
    }

    await fetch(`${SB_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        ...hdr(userObj.access_token, true),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(profilePayload),
    }).catch(() => {})
  }

  return userObj
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

  if ((!rows || rows.length === 0) && user.email) {
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(user.email)}`,
        { headers: hdr(token), cache: "no-store" }
      )
      if (res.ok) rows = await res.json()
    } catch {}
  }

  if ((!rows || rows.length === 0) && user.id) {
    const m = (user.user_metadata || {}) as Record<string, any>
    const uType: UserType =
      m.user_type === "teacher" || m.user_type === "staff" || m.user_type === "reporter"
        ? m.user_type
        : "student"
    const autoApproved = uType === "student"
    const fallbackProfile = {
      id: user.id,
      email: user.email || null,
      full_name: m.full_name || (user.email ? String(user.email).split("@")[0] : "সদস্য"),
      user_type: uType,
      department: m.department || null,
      batch: m.batch || null,
      student_id: m.student_id || null,
      designation: m.designation || null,
      office_section: m.office_section || null,
      staff_id: m.staff_id || null,
      phone: m.phone || null,
      newspaper_name: m.newspaper_name || null,
      approved: autoApproved,
      role: "user",
    }
    await fetch(`${SB_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(fallbackProfile),
    }).catch(() => {})
    const retry = await fetch(
      `${SB_URL}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(user.id)}`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (retry.ok) rows = await retry.json()
  }

  const found = rows && rows.length > 0 ? rows[0] : null
  if (found && !found.user_type) {
    found.user_type = found.newspaper_name ? "reporter" : "student"
  }
  return found
}

/* ---------- অ্যাডমিনের জন্য সকল ব্যবহারকারী, রোল ও অনুমোদন ব্যবস্থাপনা ---------- */

export async function getAllProfilesAdmin(token: string): Promise<Profile[]> {
  try {
    const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/admin_get_all_profiles`, {
      method: "POST",
      headers: hdr(token, true),
      body: JSON.stringify({}),
      cache: "no-store",
    })
    if (rpcRes.ok) {
      const rows: Profile[] = await rpcRes.json()
      if (rows.length > 0 && !("can_publish_notice" in rows[0])) {
        try {
          const extraRes = await fetch(
            `${SB_URL}/rest/v1/profiles?select=id,can_publish_notice`,
            { headers: hdr(token), cache: "no-store" }
          )
          if (extraRes.ok) {
            const extraRows: { id: string; can_publish_notice: boolean | null }[] =
              await extraRes.json()
            const map = new Map(extraRows.map((x) => [x.id, Boolean(x.can_publish_notice)]))
            return rows.map((r) => ({ ...r, can_publish_notice: map.get(r.id) ?? false }))
          }
        } catch {}
      }
      return rows
    }
    const res = await fetch(
      `${SB_URL}/rest/v1/profiles?select=*&order=created_at.desc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function setProfileRole(
  token: string,
  id: string,
  role: "admin" | "moderator" | "user"
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({
        role,
        director_visible: role === "admin" || role === "moderator",
      }),
    })
  )
}

export async function setProfileApproved(token: string, id: string, approved: boolean) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ approved }),
    })
  )
}

export async function setStaffNoticePermission(
  token: string,
  id: string,
  canPublish: boolean
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ can_publish_notice: canPublish }),
    })
  )
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
  const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/admin_delete_user`, {
    method: "POST",
    headers: hdr(token, true),
    body: JSON.stringify({ target_id: id }),
  })
  if (rpcRes.ok) return

  if (rpcRes.status === 404) {
    await ok(
      await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: hdr(token),
      })
    )
    return
  }

  await ok(rpcRes)
}

export async function updateMyProfile(
  token: string,
  id: string,
  data: Partial<
    Pick<
      Profile,
      | "full_name"
      | "department"
      | "batch"
      | "phone"
      | "newspaper_name"
      | "avatar_url"
      | "designation"
      | "office_section"
      | "bio"
    >
  >
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
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
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
    if (!rows[0]) return null
    const [enriched] = await attachProfileAvatars([rows[0]])
    return enriched || rows[0]
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
  const mime = file.type || "image/jpeg"
  let ext = "jpg"
  let contentType = "image/jpeg"

  if (mime === "image/png") {
    ext = "png"
    contentType = "image/png"
  } else if (mime === "image/webp") {
    ext = "webp"
    contentType = "image/webp"
  } else if (mime === "image/gif") {
    ext = "gif"
    contentType = "image/gif"
  } else if (mime === "image/svg+xml") {
    ext = "svg"
    contentType = "image/svg+xml"
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const h = hdr(token)
  h["Content-Type"] = contentType
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

/* ---------- কমেন্ট ও রিপ্লাই ব্যবস্থাপনা ---------- */

export async function getApprovedComments(postId: string): Promise<PublicComment[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/comments?select=id,name,message,created_at,parent_id&post_id=eq.${encodeURIComponent(postId)}&approved=eq.true&order=created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function addComment(
  postId: string,
  name: string,
  message: string,
  parentId: string | null | undefined,
  antiSpam: AntiSpamPayload
) {
  const res = await fetch('/api/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      post_id: postId,
      name: name || null,
      message,
      parent_id: parentId || null,
      ...antiSpam,
    }),
  })

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null)
    const message =
      typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'মন্তব্য জমা দেওয়া যায়নি'
    throw new Error(message)
  }
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

/* ---------- নেতৃত্ব পরিষদ (Executive Committee) ---------- */

export const POSITIONS = [
  { key: "president", en: "President", bn: "সভাপতি" },
  { key: "vice_president", en: "Vice President", bn: "সহ-সভাপতি" },
  { key: "general_secretary", en: "General Secretary", bn: "সাধারণ সম্পাদক" },
  { key: "joint_general_secretary", en: "Joint General Secretary", bn: "যুগ্ম-সাধারণ সম্পাদক" },
  { key: "organizing_secretary", en: "Organizing Secretary", bn: "সাংগঠনিক সম্পাদক" },
  { key: "treasurer", en: "Treasurer", bn: "কোষাধ্যক্ষ / অর্থ সম্পাদক" },
  { key: "office_secretary", en: "Office Secretary", bn: "দপ্তর সম্পাদক" },
  { key: "publicity_secretary", en: "Publicity & Publication Secretary", bn: "প্রচার ও প্রকাশনা সম্পাদক" },
  { key: "it_secretary", en: "IT & Technical Secretary", bn: "তথ্য ও প্রযুক্তি সম্পাদক" },
  { key: "sports_cultural_secretary", en: "Sports & Cultural Secretary", bn: "ক্রীড়া ও সাংস্কৃতিক সম্পাদক" },
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

/* ---------- হাইড করা সংবাদ ও প্রতিবেদকের ছবি নিয়ন্ত্রণ ---------- */

export async function getVisiblePosts(limit = 50): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&or=(hidden.is.null,hidden.eq.false)&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
  } catch {
    return []
  }
}

export async function getHomepagePostHistory(): Promise<Post[]> {
  const pageSize = 200
  const rows: Post[] = []
  const now = Date.now()
  let offset = 0

  try {
    while (true) {
      const res = await fetch(
        `${SB_URL}/rest/v1/posts?select=*&or=(hidden.is.null,hidden.eq.false)&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
        { headers: hdr(), cache: "no-store" }
      )
      if (!res.ok) {
        console.error(`Homepage post history query failed (${res.status})`)
        break
      }

      const page: Post[] = await res.json()
      rows.push(...page)
      if (
        page.length < pageSize ||
        hasEnoughHomepageHistory(rows, (post) => post.created_at, now)
      ) {
        break
      }
      offset += page.length
    }

    return await attachProfileAvatars(rows)
  } catch (error) {
    console.error("Homepage post history query failed", error)
    return await attachProfileAvatars(rows)
  }
}

export async function getAllPosts(limit = 100): Promise<Post[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=${limit}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: Post[] = await res.json()
    return await attachProfileAvatars(rows)
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

export async function setPostAuthorAvatarVisible(token: string, id: string, show: boolean) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ show_author_avatar: show }),
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

  if (data.name && data.name !== name) {
    try {
      await fetch(`${SB_URL}/rest/v1/posts?category=eq.${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify({ category: data.name }),
      })
    } catch {}
  }
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

/* ---------- সেকশন, লিমিট ও ক্যাটাগরি কনস্ট্যান্ট ---------- */

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

/* ---------- স্টুডেন্ট কর্নার (Student Corner) ---------- */

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
  embed_media_url?: string | null
  featured: boolean
  hidden: boolean
  sort_order: number
  created_at: string
}

export type StudentInput = Omit<StudentItem, "id" | "created_at">

export async function getStudentItems(includeHidden = false): Promise<StudentItem[]> {
  try {
    const f = includeHidden ? "" : "&or=(hidden.is.null,hidden.eq.false)"
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

/* ---------- একাধিক ছবি (Parent Type) ---------- */

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

/* ---------- ইমেজ মেটা, ক্যাপশন ও লেআউট ---------- */

export type ImageMeta = ImageRow & { caption?: string | null; credit?: string | null }
export type NewImage = { url: string; caption: string; credit: string }

export async function getImagesMeta(type: ParentType, id: string): Promise<ImageMeta[]> {
  return (await getImages(type, id)) as ImageMeta[]
}

export async function getImagesMetaForMany(
  type: ParentType,
  ids: string[]
): Promise<Record<string, ImageMeta[]>> {
  return (await getImagesForMany(type, ids)) as Record<string, ImageMeta[]>
}

export async function addImagesWithMeta(
  token: string,
  type: ParentType,
  id: string,
  items: NewImage[],
  startOrder = 0
) {
  if (items.length === 0) return
  const rows = items.map((it, i) => ({
    parent_type: type,
    parent_id: id,
    url: it.url,
    caption: it.caption.trim() || null,
    credit: it.credit.trim() || null,
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

export async function updateImageMeta(
  token: string,
  imageId: string,
  data: { caption: string | null; credit: string | null }
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/post_images?id=eq.${encodeURIComponent(imageId)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function getLayout(type: ParentType, id: string): Promise<string> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/image_layouts?select=layout&parent_type=eq.${type}&parent_id=eq.${encodeURIComponent(id)}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return "grid"
    const rows: { layout: string }[] = await res.json()
    return rows[0]?.layout || "grid"
  } catch {
    return "grid"
  }
}

export async function getLayoutsForMany(
  type: ParentType,
  ids: string[]
): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  if (ids.length === 0) return out
  try {
    const list = ids.map((i) => encodeURIComponent(i)).join(",")
    const res = await fetch(
      `${SB_URL}/rest/v1/image_layouts?select=parent_id,layout&parent_type=eq.${type}&parent_id=in.(${list})`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return out
    const rows: { parent_id: string; layout: string }[] = await res.json()
    rows.forEach((r) => {
      out[r.parent_id] = r.layout
    })
    return out
  } catch {
    return out
  }
}

export async function saveLayout(token: string, type: ParentType, id: string, layout: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/image_layouts`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ parent_type: type, parent_id: id, layout }),
    })
  )
}

export async function saveStudentItemReturningId(
  token: string,
  id: string | null,
  data: Partial<StudentInput>
): Promise<string | null> {
  if (data.featured) {
    await ok(
      await fetch(`${SB_URL}/rest/v1/student_items?featured=eq.true`, {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify({ featured: false }),
      })
    )
  }
  if (id) {
    await ok(
      await fetch(`${SB_URL}/rest/v1/student_items?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify(data),
      })
    )
    return id
  }
  const res = await ok(
    await fetch(`${SB_URL}/rest/v1/student_items?select=id`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=representation" },
      body: JSON.stringify(data),
    })
  )
  const rows: { id: string }[] = await res.json()
  return rows[0]?.id ?? null
}

export async function getSectionText(key: string, defaultVal: string): Promise<string> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${encodeURIComponent(key)}`,
      {
        headers: { apikey: SB_KEY },
        cache: "no-store",
      }
    )
    if (!res.ok) return defaultVal
    const rows = await res.json()
    return rows[0]?.value || defaultVal
  } catch {
    return defaultVal
  }
}

export async function saveSectionText(token: string, key: string, value: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ key, value }),
    })
  )
}

/* ---------- স্টুডেন্ট কর্নার ক্যাটাগরি ব্যবস্থাপনা ---------- */

const DEFAULT_STUDENT_KINDS = ["Opinion", "Creative Writing", "Achievement", "Research Highlight"]

export async function getStudentCategories(): Promise<string[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/student_corner_categories?select=name&order=id.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return DEFAULT_STUDENT_KINDS
    const rows: { name: string }[] = await res.json()
    return rows.length > 0 ? rows.map((r) => r.name) : DEFAULT_STUDENT_KINDS
  } catch {
    return DEFAULT_STUDENT_KINDS
  }
}

export async function addStudentCategory(token: string, name: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/student_corner_categories`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ name }),
    })
  )
}

export async function updateStudentCategory(token: string, oldName: string, newName: string) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/student_corner_categories?name=eq.${encodeURIComponent(oldName)}`,
      {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify({ name: newName }),
      }
    )
  )
  try {
    await fetch(`${SB_URL}/rest/v1/student_items?kind=eq.${encodeURIComponent(oldName)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ kind: newName }),
    })
  } catch {}
}

export async function deleteStudentCategory(token: string, name: string) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/student_corner_categories?name=eq.${encodeURIComponent(name)}`,
      {
        method: "DELETE",
        headers: hdr(token),
      }
    )
  )
}
