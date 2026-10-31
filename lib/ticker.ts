import { SB_URL, SB_KEY } from "./sb"

export const MAX_LIVE_TICKER = 5
export const DEFAULT_SPEED = 70

// গতি: পিক্সেল প্রতি সেকেন্ড
export const SPEEDS = [
  { v: 40, t: "ধীর" },
  { v: 70, t: "মাঝারি" },
  { v: 110, t: "দ্রুত" },
  { v: 160, t: "খুব দ্রুত" },
]

export type TickerLevel = "normal" | "urgent"

export type TickerItem = {
  id: string
  title: string
  url: string | null
  level: TickerLevel
  sound_alert: boolean
  is_active: boolean
  sort_order: number
  expires_at: string | null
  author_name: string | null
  text_color: string | null
  bg_color: string | null
  speed: number
  created_at: string
  updated_at: string
}

export type TickerInput = Omit<TickerItem, "id" | "created_at" | "updated_at">

const DIGITS = "০১২৩৪৫৬৭৮৯"
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => DIGITS[Number(d)])

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}` }
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

const ORDER = "order=sort_order.asc,created_at.desc"

// পাবলিক: শুধু চালু ও মেয়াদ-না-ফুরানো শিরোনাম। নেটওয়ার্ক সমস্যায় null দেয়, যাতে টিকার মুছে না যায়।
export async function getLiveTicker(): Promise<TickerItem[] | null> {
  try {
    const now = encodeURIComponent(new Date().toISOString())
    const res = await fetch(
      `${SB_URL}/rest/v1/ticker_items?select=*&is_active=eq.true&or=(expires_at.is.null,expires_at.gt.${now})&${ORDER}&limit=${MAX_LIVE_TICKER}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// অ্যাডমিন: সব শিরোনাম
export async function getAllTicker(token: string): Promise<TickerItem[]> {
  const res = await ok(
    await fetch(`${SB_URL}/rest/v1/ticker_items?select=*&${ORDER}&limit=100`, {
      headers: hdr(token),
      cache: "no-store",
    })
  )
  return res.json()
}

export async function createTickerItem(token: string, data: TickerInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/ticker_items`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateTickerItem(token: string, id: string, data: Partial<TickerInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/ticker_items?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}

export async function deleteTickerItem(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/ticker_items?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
