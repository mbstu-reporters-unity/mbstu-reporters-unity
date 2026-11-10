import { SB_URL, SB_KEY } from "./sb"

export type CommitteeMember = {
  name: string
  role: string
  photo_url?: string | null
}

export type ClubMediaItem = {
  id?: string
  title?: string
  subtitle?: string
  description?: string
  url: string
}

export type ClubReportItem = {
  title: string
  date: string
  reporter: string
  link_url?: string | null
  embed_media_url?: string | null
  subtitle?: string | null
  description?: string | null
  media_items?: ClubMediaItem[] | null
}

export type ClubItem = {
  id: string
  name: string
  name_bn: string | null
  tag: string
  icon: string
  logo_url?: string | null
  cover_url?: string | null // কভার ফটোর ফিল্ড যুক্ত হলো
  activity: string | null
  activity_bn: string | null
  date: string | null
  fb_url: string | null
  yt_url: string | null
  web_url: string | null
  embed_media_url?: string | null
  committee_term?: string | null
  committee_members?: CommitteeMember[] | null
  reports_title?: string | null
  reports?: ClubReportItem[] | null
  contact_info: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type ClubInput = Omit<ClubItem, "id" | "created_at">

// ⭐ ক্লাব স্লাইডার ও ট্রানজিশন কনফিগ টাইপ ⭐
export type ClubTransitionDirection = 'right-to-left' | 'left-to-right' | 'bottom-to-top' | 'top-to-bottom'
export type ClubTransitionEffect = 'slide' | 'fade' | 'zoom' | 'flip'

export interface ClubCarouselConfig {
  enabled: boolean
  direction: ClubTransitionDirection
  effect: ClubTransitionEffect
  duration_sec: number // স্লাইড পরিবর্তনের সময়কাল (যেমন: ৪ সেকেন্ড)
  anim_speed_ms: number // অ্যানিমেশনের মসৃণতার গতি (যেমন: ৬০০ms)
  pause_on_hover: boolean
  cards_desktop: number // ১, ২, ৩ বা ৪টি কার্ড পাশাপাশি
  show_arrows: boolean
  show_dots: boolean
}

export const DEFAULT_CLUB_CAROUSEL_CONFIG: ClubCarouselConfig = {
  enabled: true,
  direction: 'right-to-left',
  effect: 'slide',
  duration_sec: 4,
  anim_speed_ms: 600,
  pause_on_hover: true,
  cards_desktop: 3,
  show_arrows: true,
  show_dots: true,
}

const CAROUSEL_CONFIG_KEY = "club_carousel_config"

export function safeExternalUrl(url?: string | null): string {
  if (!url || !url.trim()) return ""
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function parseActivityMedia(raw?: string | null): ClubMediaItem[] {
  if (!raw || !raw.trim()) return []
  const str = raw.trim()
  if (str.startsWith("[") || str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed.filter((item) => item && (item.url || item.title))
      if (parsed && typeof parsed === "object") return [parsed]
    } catch {}
  }
  return [{ url: str }]
}

export function stringifyActivityMedia(items: ClubMediaItem[]): string | null {
  const valid = items.filter((i) => i.url?.trim() || i.title?.trim() || i.description?.trim())
  if (valid.length === 0) return null
  return JSON.stringify(valid)
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

export async function getCampusClubs(token?: string): Promise<ClubItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_clubs?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// নির্দিষ্ট ক্লাবের তথ্য আনার ফাংশন
export async function getClubById(id: string): Promise<ClubItem | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_clubs?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return null
    const rows: ClubItem[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

export async function createCampusClub(token: string, data: Partial<ClubInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_clubs`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateCampusClub(token: string, id: string, data: Partial<ClubInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_clubs?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteCampusClub(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_clubs?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function getClubNewsPosts(clubId: string) {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,created_at,author,image_url,embed_media_url&or=(hidden.is.null,hidden.eq.false)&club_id=eq.${encodeURIComponent(clubId)}&order=created_at.desc&limit=50`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/* ==================== স্লাইডার কনফিগারেশন ফাংশনসমূহ ==================== */
export async function getClubCarouselConfig(): Promise<ClubCarouselConfig> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${CAROUSEL_CONFIG_KEY}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return DEFAULT_CLUB_CAROUSEL_CONFIG
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]?.value) {
      return { ...DEFAULT_CLUB_CAROUSEL_CONFIG, ...JSON.parse(rows[0].value) }
    }
    return DEFAULT_CLUB_CAROUSEL_CONFIG
  } catch {
    return DEFAULT_CLUB_CAROUSEL_CONFIG
  }
}

export async function saveClubCarouselConfig(token: string, config: ClubCarouselConfig) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        key: CAROUSEL_CONFIG_KEY,
        value: JSON.stringify(config),
      }),
    })
  )
}
