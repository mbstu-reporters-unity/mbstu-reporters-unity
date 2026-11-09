import { SB_URL, SB_KEY } from "./sb"

export const MAX_LIVE_TICKER = 10
export const DEFAULT_SPEED = 70

// গতি: পিক্সেল প্রতি সেকেন্ড
export const SPEEDS = [
  { v: 40, t: "খুব ধীর (৪০ px/s)" },
  { v: 70, t: "মাঝারি - স্বাভাবিক (৭০ px/s)" },
  { v: 110, t: "দ্রুত (১১০ px/s)" },
  { v: 160, t: "খুব দ্রুত (১৬০ px/s)" },
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

// ⭐ ২০টি ব্রেকিং বেজ আইকন ⭐
export const TICKER_BADGE_ICONS = [
  { key: "radio", label: "📡 রেডিও / লাইভ সিগন্যাল" },
  { key: "siren", label: "🚨 সাইরেন (ব্রেকিং অ্যালার্ট)" },
  { key: "flame", label: "🔥 আগুন (হট / তাজা খবর)" },
  { key: "zap", label: "⚡ বিদ্যুৎ / ফ্ল্যাশ ব্রেকিং" },
  { key: "bell", label: "🔔 জরুরি নোটিফিকেশন" },
  { key: "megaphone", label: "📢 মেগাফোন / ঘোষণা" },
  { key: "newspaper", label: "📰 সংবাদপত্র / ক্যাম্পাস সংবাদ" },
  { key: "alert-triangle", label: "⚠️ সতর্কতা সংকেত" },
  { key: "sparkles", label: "✨ বিশেষ আপডেট" },
  { key: "star", label: "⭐ শীর্ষ সংবাদ / হাইলাইট" },
  { key: "award", label: "🏆 বিশেষ অর্জন / সাফল্য" },
  { key: "clock", label: "⏱️ সময়োপযোগী আপডেট" },
  { key: "compass", label: "🧭 অনুসন্ধানী প্রতিবেদন" },
  { key: "check-circle", label: "✅ সত্যতা যাচাইকৃত" },
  { key: "shield-alert", label: "🛡️ ক্যাম্পাস নিরাপত্তা" },
  { key: "activity", label: "💓 স্পন্দন / তাজা খবর" },
  { key: "volume-2", label: "🔊 মাইকিং / প্রচার" },
  { key: "info", label: "ℹ️ জরুরি তথ্য" },
  { key: "globe", label: "🌐 বিশ্ব ও ক্যাম্পাস" },
  { key: "flame-kindling", label: "🧨 এক্সক্লুসিভ ব্রেকিং" },
] as const

// ⭐ ৩০টি বেজ ও টেক্সট অ্যানিমেশন ⭐
export const TICKER_ANIMATIONS = [
  { key: "none", label: "— কোনো অ্যানিমেশন নেই (স্থির) —" },
  { key: "pulse", label: "১. পালস স্পন্দন (Pulse)" },
  { key: "ping", label: "২. রাডার পিং তরঙ্গ (Ping)" },
  { key: "bounce", label: "৩. লাফালাফি বাউন্স (Bounce)" },
  { key: "heartbeat", label: "৪. হৃদস্পন্দন থাম্প (Heartbeat)" },
  { key: "neon-glow", label: "৫. নিয়ন পালস গ্লো (Neon Glow)" },
  { key: "flash", label: "৬. ঝলকানি ব্লিঙ্ক (Flash)" },
  { key: "shake", label: "৭. অ্যালার্ট কাঁপন (Alert Shake)" },
  { key: "wiggle", label: "৮. ডানে-বামে দোলানো (Wiggle)" },
  { key: "rubber-band", label: "৯. রাবার ব্যান্ড পপ (Rubber Band)" },
  { key: "swing", label: "১০. পেন্ডুলাম সুইং (Swing)" },
  { key: "jello", label: "১১. জেলো কাপাকাপি (Jello)" },
  { key: "float", label: "১২. ভেসে থাকা (Float)" },
  { key: "glow-expand", label: "১৩. উজ্জ্বল বিস্তার (Glow Expand)" },
  { key: "flip-x", label: "১৪. ৩ডি ফ্লিপ অনুভূমিক (Flip X)" },
  { key: "flip-y", label: "১৫. ৩ডি ফ্লিপ উল্লম্ব (Flip Y)" },
  { key: "glitch", label: "১৬. সাইবার গ্লিচ (Cyber Glitch)" },
  { key: "breathe", label: "১৭. ধীর প্রশ্বাস (Breathe)" },
  { key: "zoom-in-out", label: "১৮. জুম ইন-আউট (Zoom)" },
  { key: "spin", label: "১৯. ঘূর্ণন (Spin)" },
  { key: "tilt", label: "২০. কোণাকুণি দোলানো (Tilt)" },
  { key: "tada", label: "২১. তা-দা ভাইব্রেশন (Tada)" },
  { key: "wobble", label: "২২. টলমল নড়াচড়া (Wobble)" },
  { key: "shiver", label: "২৩. মৃদু কম্পন (Shiver)" },
  { key: "pop", label: "২৪. পপ-আপ বিট (Pop Beat)" },
  { key: "ripple", label: "২৫. রিপল রিং (Ripple)" },
  { key: "beacon", label: "২৬. লাইটহাউস বিকন (Beacon)" },
  { key: "electric", label: "২৭. ইলেকট্রিক স্পার্ক (Electric)" },
  { key: "slide-shift", label: "২৮. পাশাপাশি শিফট (Slide Shift)" },
  { key: "rotate-slow", label: "২৯. ধীর চক্রাকার ঘূর্ণন (Rotate Slow)" },
  { key: "radar", label: "৩০. রাডার আলোকবৃত্ত (Radar Beam)" },
] as const

// ⭐ ৮টি ব্যাকগ্রাউন্ড অ্যানিমেশন ⭐
export const TICKER_BG_ANIMATIONS = [
  { key: "none", label: "— কোনো অ্যানিমেশন নেই (সলিড) —" },
  { key: "bg-pulse", label: "১. ব্যাকগ্রাউন্ড পালসিং (Pulse Glow)" },
  { key: "bg-shimmer", label: "২. চকচকে শিমার গ্লেয়ার (Shimmer Light)" },
  { key: "bg-gradient-shift", label: "৩. প্রবহমান গ্রেডিয়েন্ট (Flowing Color)" },
  { key: "bg-glow", label: "৪. আলোক বিচ্ছুরণ (Glow Aura)" },
  { key: "bg-breathe", label: "৫. মৃদু উজ্জ্বলতা হ্রাস-বৃদ্ধি (Breathe)" },
  { key: "bg-flame", label: "৬. তাজা আগুনের ঝলকানি (Fire Alert)" },
  { key: "bg-electric", label: "৭. ইলেকট্রিক ফ্ল্যাশ স্পার্ক (Electric Flash)" },
] as const

export interface TickerBadgeConfig {
  icon: string
  icon_animation: string
  badge_text: string
  badge_subtext: string
  show_subtext: boolean
  text_color: string
  text_animation: string
  bg_color: string
  bg_color2?: string
  bg_animation: string

  brief_text: string
  show_brief: boolean
  brief_color: string
  brief_bg_color: string
  brief_animation: string
}

export const DEFAULT_TICKER_BADGE_CONFIG: TickerBadgeConfig = {
  icon: "radio",
  icon_animation: "pulse",
  badge_text: "সর্বশেষ",
  badge_subtext: "LIVE UPDATES",
  show_subtext: true,
  text_color: "#ffffff",
  text_animation: "none",
  bg_color: "#c8102e",
  bg_color2: "#991b1b",
  bg_animation: "none",

  brief_text: "[সংক্ষেপ]",
  show_brief: true,
  brief_color: "#c8102e",
  brief_bg_color: "#fee2e2",
  brief_animation: "none",
}

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

export async function getAllTicker(token: string): Promise<TickerItem[]> {
  const res = await ok(
    await fetch(`${SB_URL}/rest/v1/ticker_items?select=*&${ORDER}&limit=200`, {
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

const BADGE_CONFIG_KEY = "ticker_badge_config"

export async function getTickerBadgeConfig(): Promise<TickerBadgeConfig> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${BADGE_CONFIG_KEY}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return DEFAULT_TICKER_BADGE_CONFIG
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value)
      return { ...DEFAULT_TICKER_BADGE_CONFIG, ...parsed }
    }
    return DEFAULT_TICKER_BADGE_CONFIG
  } catch {
    return DEFAULT_TICKER_BADGE_CONFIG
  }
}

export async function saveTickerBadgeConfig(token: string, config: TickerBadgeConfig) {
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
        key: BADGE_CONFIG_KEY,
        value: JSON.stringify(config),
      }),
    })
  )
}
