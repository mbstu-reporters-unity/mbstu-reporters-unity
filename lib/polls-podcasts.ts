import { SB_URL, SB_KEY } from "./sb"

export interface PollOption {
  id: string
  label: string
}

export interface CampusPoll {
  id: string
  question: string
  options: PollOption[]
  is_active: boolean
  created_at: string
}

export interface PollVoteRow {
  poll_id: string
  option_id: string
  device_id: string
}

export interface CampusPodcast {
  id: string
  series_name: string
  episode_number: string | null
  title: string
  description: string | null
  media_url: string
  thumbnail_url: string | null
  host_name: string | null
  guest_name: string | null
  duration: string | null
  is_active: boolean
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

/* ==================== জরিপ / পোল ==================== */

export async function getCampusPolls(includeInactive = false): Promise<CampusPoll[]> {
  try {
    const filter = includeInactive ? "" : "&is_active=eq.true"
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_polls?select=*${filter}&order=created_at.desc&limit=50`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows = await res.json()
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export async function getPollVotes(pollIds: string[]): Promise<PollVoteRow[]> {
  if (pollIds.length === 0) return []
  try {
    const list = pollIds.map((id) => encodeURIComponent(id)).join(",")
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_poll_votes?select=poll_id,option_id,device_id&poll_id=in.(${list})`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function castPollVote(pollId: string, optionId: string, deviceId: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_poll_votes`, {
      method: "POST",
      headers: {
        ...hdr(undefined, true),
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({
        poll_id: pollId,
        option_id: optionId,
        device_id: deviceId,
      }),
    })
  )
}

export async function createCampusPoll(token: string, data: Partial<CampusPoll>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_polls`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateCampusPoll(token: string, id: string, data: Partial<CampusPoll>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_polls?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteCampusPoll(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_polls?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

/* ==================== পডকাস্ট ও ভিডিও সিরিজ ==================== */

export async function getCampusPodcasts(includeInactive = false): Promise<CampusPodcast[]> {
  try {
    const filter = includeInactive ? "" : "&is_active=eq.true"
    const res = await fetch(
      `${SB_URL}/rest/v1/campus_podcasts?select=*${filter}&order=created_at.desc&limit=100`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows = await res.json()
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export async function createCampusPodcast(token: string, data: Partial<CampusPodcast>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_podcasts`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateCampusPodcast(
  token: string,
  id: string,
  data: Partial<CampusPodcast>
) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_podcasts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteCampusPodcast(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/campus_podcasts?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
