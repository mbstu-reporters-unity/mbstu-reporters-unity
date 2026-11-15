import { createClient } from "@supabase/supabase-js"
import { SB_URL, SB_KEY, isTokenExpired, refreshSession, type Profile } from "./sb"

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

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

// Supabase রিয়েলটাইম লিসেনারে লগইন টোকেন সক্রিয় রাখা
export async function syncRealtimeAuth(token: string): Promise<void> {
  try {
    if (!token) return
    const rt = typeof window !== "undefined" ? localStorage.getItem("mbstu_admin_refresh_token") : null
    if (rt) {
      await supabase.auth.setSession({ access_token: token, refresh_token: rt }).catch(() => {})
    }
  } catch {}
}

// ইউজারের সব সক্রিয় চ্যাট নিয়ে আসা
export async function getMyConversations(token: string, currentUserId: string): Promise<ConversationItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/conversation_participants?select=conversation_id,conversations(id,type,updated_at)&user_id=eq.${encodeURIComponent(currentUserId)}&order=conversations(updated_at).desc`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows = await res.json()
    if (!Array.isArray(rows)) return []

    const convList: ConversationItem[] = []

    for (const r of rows) {
      const c = r.conversations
      if (!c || !c.id) continue

      // অপর ব্যক্তির তথ্য আনা (গোপনীয় তথ্য ছাড়া)
      const partRes = await fetch(
        `${SB_URL}/rest/v1/conversation_participants?select=user_id,profiles(id,full_name,avatar_url,department,designation,user_type,newspaper_name)&conversation_id=eq.${encodeURIComponent(c.id)}&user_id=neq.${encodeURIComponent(currentUserId)}`,
        { headers: hdr(token), cache: "no-store" }
      )
      const partRows = partRes.ok ? await partRes.json() : []
      const other = partRows[0]?.profiles || null

      // সর্বশেষ মেসেজ আনা
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

// নির্দিষ্ট চ্যাটরুমের সকল মেসেজ আনা
export async function getConversationMessages(token: string, conversationId: string): Promise<MessageItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/messages?select=*&conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.asc&limit=200`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// নতুন মেসেজ পাঠানো
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

// শুধুমাত্র বন্ধুর সাথেই চ্যাট ওপেন করা
export async function openDirectConversation(token: string, otherUserId: string): Promise<string | null> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/get_or_create_direct_conversation`, {
      method: "POST",
      headers: hdr(token, true),
      body: JSON.stringify({ other_user_id: otherUserId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || "চ্যাট শুরু করা যায়নি (বন্ধু হওয়া আবশ্যক)")
    }
    const convId = await res.json()
    return convId
  } catch (e) {
    throw e
  }
}
