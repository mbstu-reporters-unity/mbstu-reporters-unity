import { createClient } from "@supabase/supabase-js"
import { SB_URL, SB_KEY, type Profile } from "./sb"

export const supabase = createClient(SB_URL, SB_KEY)

export interface MessageItem {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  created_at: string
}

export interface ConversationItem {
  id: string
  type: "direct" | "group"
  updated_at: string
  other_user?: Profile | null
  last_message?: MessageItem | null
}

function hdr(token: string, json = false): Record<string, string> {
  const h: Record<string, string> = {
    apikey: SB_KEY,
    Authorization: `Bearer ${token}`,
  }
  if (json) h["Content-Type"] = "application/json"
  return h
}

// ১. ইউজারের সকল কথোপকথন নিয়ে আসা
export async function getMyConversations(token: string, currentUserId: string): Promise<ConversationItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/conversation_participants?select=conversation_id,conversations(id,type,updated_at)&user_id=eq.${encodeURIComponent(currentUserId)}&order=conversations(updated_at).desc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows = await res.json()

    const convList: ConversationItem[] = []

    for (const r of rows) {
      const c = r.conversations
      if (!c) continue

      // অপর ব্যক্তির তথ্য আনা
      const partRes = await fetch(
        `${SB_URL}/rest/v1/conversation_participants?select=user_id,profiles(id,full_name,avatar_url,department,designation,user_type)&conversation_id=eq.${encodeURIComponent(c.id)}&user_id=neq.${encodeURIComponent(currentUserId)}`,
        { headers: hdr(token), cache: "no-store" }
      )
      const partRows = partRes.ok ? await partRes.json() : []
      const other = partRows[0]?.profiles || null

      // সর্বশেষ মেসেজ
      const msgRes = await fetch(
        `${SB_URL}/rest/v1/messages?select=*&conversation_id=eq.${encodeURIComponent(c.id)}&order=created_at.desc&limit=1`,
        { headers: hdr(token), cache: "no-store" }
      )
      const msgRows = msgRes.ok ? await msgRes.json() : []

      convList.push({
        id: c.id,
        type: c.type,
        updated_at: c.updated_at,
        other_user: other,
        last_message: msgRows[0] || null,
      })
    }

    return convList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  } catch {
    return []
  }
}

// ২. নির্দিষ্ট চ্যাটরুমের সকল মেসেজ আনা
export async function getConversationMessages(token: string, conversationId: string): Promise<MessageItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/messages?select=*&conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.asc&limit=150`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// ৩. নতুন মেসেজ পাঠানো
export async function sendChatMessage(
  token: string,
  conversationId: string,
  senderId: string,
  content: string,
  mediaUrl?: string | null
): Promise<MessageItem | null> {
  const payload = {
    conversation_id: conversationId,
    sender_id: senderId,
    content: content.trim() || null,
    media_url: mediaUrl || null,
  }

  const res = await fetch(`${SB_URL}/rest/v1/messages`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) return null
  const rows = await res.json()

  // চ্যাটের সময় আপডেট করা
  await fetch(`${SB_URL}/rest/v1/conversations?id=eq.${encodeURIComponent(conversationId)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ updated_at: new Date().toISOString() }),
  }).catch(() => {})

  return rows[0] || null
}

// ৪. ওয়ান-টু-ওয়ান চ্যাট তৈরি বা ওপেন করা
export async function openDirectConversation(token: string, otherUserId: string): Promise<string | null> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/get_or_create_direct_conversation`, {
      method: "POST",
      headers: { ...hdr(token, true) },
      body: JSON.stringify({ other_user_id: otherUserId }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ৫. চ্যাট করার জন্য ক্যাম্পাসের মানুষজন খোঁজা (সার্চ)
export async function searchCampusUsers(token: string, query: string): Promise<Profile[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/profiles?select=id,full_name,avatar_url,department,designation,user_type&or=(full_name.ilike.*${encodeURIComponent(query)}*,department.ilike.*${encodeURIComponent(query)}*)&limit=15`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
