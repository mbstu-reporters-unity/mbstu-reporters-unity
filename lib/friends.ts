import { SB_URL, SB_KEY, isTokenExpired, refreshSession, type UserType } from "./sb"

export type FriendshipStatus = "pending" | "accepted" | "rejected"

export type FriendshipRow = {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export type PublicMember = {
  id: string
  full_name: string
  avatar_url: string | null
  department: string | null
  batch: string | null
  designation: string | null
  office_section: string | null
  user_type: UserType
  newspaper_name: string | null
}

export type FriendEntry = {
  friendship: FriendshipRow
  user: PublicMember
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

export function getUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
    return typeof payload.sub === "string" ? payload.sub : null
  } catch {
    return null
  }
}

export async function getValidClientAuth(): Promise<{ token: string; userId: string } | null> {
  if (typeof window === "undefined") return null
  let token = ""
  try {
    token = localStorage.getItem("mbstu_admin_token") || ""
  } catch {
    return null
  }
  if (!token) return null

  if (isTokenExpired(token)) {
    const fresh = await refreshSession()
    if (!fresh) return null
    token = fresh
  }

  const userId = getUserIdFromJwt(token)
  if (!userId) return null
  return { token, userId }
}

const PUBLIC_MEMBER_SELECT =
  "id,full_name,avatar_url,department,batch,designation,office_section,user_type,newspaper_name"

export async function getFriendshipBetween(
  token: string,
  otherUserId: string
): Promise<FriendshipRow | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/friendships?select=*&or=(requester_id.eq.${encodeURIComponent(otherUserId)},addressee_id.eq.${encodeURIComponent(otherUserId)})&limit=1`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return null
    const rows: FriendshipRow[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

export async function sendFriendRequest(
  token: string,
  requesterId: string,
  addresseeId: string
): Promise<FriendshipRow> {
  const res = await ok(
    await fetch(`${SB_URL}/rest/v1/friendships`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=representation" },
      body: JSON.stringify({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: "pending",
      }),
    })
  )
  const rows: FriendshipRow[] = await res.json()
  return rows[0]
}

export async function acceptFriendRequest(token: string, friendshipId: string): Promise<void> {
  await ok(
    await fetch(`${SB_URL}/rest/v1/friendships?id=eq.${encodeURIComponent(friendshipId)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "accepted",
        updated_at: new Date().toISOString(),
      }),
    })
  )
}

export async function removeFriendship(token: string, friendshipId: string): Promise<void> {
  await ok(
    await fetch(`${SB_URL}/rest/v1/friendships?id=eq.${encodeURIComponent(friendshipId)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

export async function getMyFriendships(
  token: string,
  myId: string
): Promise<{
  friends: FriendEntry[]
  incoming: FriendEntry[]
  outgoing: FriendEntry[]
}> {
  const empty = { friends: [], incoming: [], outgoing: [] }
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/friendships?select=*&order=updated_at.desc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return empty
    const rows: FriendshipRow[] = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) return empty

    const partnerIds = Array.from(
      new Set(rows.map((r) => (r.requester_id === myId ? r.addressee_id : r.requester_id)))
    )

    const userMap = new Map<string, PublicMember>()
    if (partnerIds.length > 0) {
      const idList = partnerIds.map((id) => encodeURIComponent(id)).join(",")
      const uRes = await fetch(
        `${SB_URL}/rest/v1/profiles?select=${PUBLIC_MEMBER_SELECT}&id=in.(${idList})`,
        { headers: hdr(token), cache: "no-store" }
      )
      if (uRes.ok) {
        const users: PublicMember[] = await uRes.json()
        users.forEach((u) => userMap.set(u.id, u))
      }
    }

    const friends: FriendEntry[] = []
    const incoming: FriendEntry[] = []
    const outgoing: FriendEntry[] = []

    for (const f of rows) {
      const pid = f.requester_id === myId ? f.addressee_id : f.requester_id
      const user = userMap.get(pid)
      if (!user) continue
      if (f.status === "accepted") {
        friends.push({ friendship: f, user })
      } else if (f.status === "pending") {
        if (f.addressee_id === myId) incoming.push({ friendship: f, user })
        else if (f.requester_id === myId) outgoing.push({ friendship: f, user })
      }
    }

    return { friends, incoming, outgoing }
  } catch {
    return empty
  }
}

export async function searchMembersToBefriend(
  token: string,
  query: string,
  myId?: string
): Promise<PublicMember[]> {
  try {
    const q = query.trim()
    let url = `${SB_URL}/rest/v1/profiles?select=${PUBLIC_MEMBER_SELECT}&approved=eq.true&order=full_name.asc&limit=40`
    if (q) {
      const enc = encodeURIComponent(q)
      url += `&or=(full_name.ilike.*${enc}*,department.ilike.*${enc}*,designation.ilike.*${enc}*)`
    }
    const res = await fetch(url, { headers: hdr(token), cache: "no-store" })
    if (!res.ok) return []
    const rows: PublicMember[] = await res.json()
    return myId ? rows.filter((u) => u.id !== myId) : rows
  } catch {
    return []
  }
}
