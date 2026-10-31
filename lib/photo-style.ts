import { SB_URL, SB_KEY } from "./sb"
import type { Leader } from "./sb"

export type PhotoStyle = {
  size: number // ছবির প্রস্থ (px)
  heightPct: number // প্রস্থের তুলনায় উচ্চতা (%), ১০০ = বর্গ
  shape: number // ০ = বর্গ/আয়তক্ষেত্র, ১০০ = পূর্ণ বৃত্ত
  bandOn: boolean // রঙিন ব্যান্ড চালু/বন্ধ
  bandMode: "solid" | "gradient" | "transparent"
  bandWidth: number // ব্যান্ডের পুরুত্ব (px)
  color1: string
  color2: string
  gradientAngle: number // স্থির গ্রেডিয়েন্টের দিক (ডিগ্রি)
  anim: "none" | "flow" | "wave" | "fade" | "pulse"
  animSpeed: number // এক চক্রের সময় (সেকেন্ড), কম = দ্রুত
  glowOn: boolean
  glowSize: number // px
  shadowOn: boolean
  shadowSize: number // px
  hoverGrow: boolean
  scrollGrow: boolean
  growScale: number // বড় হওয়ার পরিমাণ (%), ১২০ = ১.২ গুণ
}

export const DEFAULT_STYLE: PhotoStyle = {
  size: 112,
  heightPct: 115,
  shape: 18,
  bandOn: true,
  bandMode: "gradient",
  bandWidth: 5,
  color1: "#15803d",
  color2: "#eab308",
  gradientAngle: 135,
  anim: "wave",
  animSpeed: 4,
  glowOn: true,
  glowSize: 22,
  shadowOn: true,
  shadowSize: 18,
  hoverGrow: true,
  scrollGrow: true,
  growScale: 112,
}

export function normalizeStyle(v: unknown, base: PhotoStyle = DEFAULT_STYLE): PhotoStyle {
  if (!v || typeof v !== "object") return base
  return { ...base, ...(v as Partial<PhotoStyle>) }
}

/** নেতৃত্বের সারি + ঐচ্ছিক আলাদা স্টাইল (leaders.photo_style কলাম) */
export type LeaderWithStyle = Leader & { photo_style?: Partial<PhotoStyle> | null }

/** সদস্যের আলাদা স্টাইল থাকলে সেটা, না থাকলে সবার ডিফল্ট স্টাইল */
export function styleFor(l: LeaderWithStyle, global: PhotoStyle): PhotoStyle {
  return l.photo_style ? normalizeStyle(l.photo_style, global) : global
}

const SETTING_KEY = "leader_photo_style"

export async function getGlobalStyle(): Promise<PhotoStyle> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/site_settings?select=value&key=eq.${SETTING_KEY}`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
    if (!res.ok) return DEFAULT_STYLE
    const rows = await res.json()
    return normalizeStyle(rows?.[0]?.value)
  } catch {
    return DEFAULT_STYLE
  }
}

export async function saveGlobalStyle(token: string, style: PhotoStyle) {
  const res = await fetch(`${SB_URL}/rest/v1/site_settings`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key: SETTING_KEY, value: style, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) {
    let msg = `ত্রুটি (${res.status})`
    try {
      const j = await res.json()
      msg = j.message || j.msg || msg
    } catch {}
    throw new Error(msg)
  }
}
