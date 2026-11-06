import { SB_URL, SB_KEY } from "./sb"

export type HeroPostType = "color" | "image" | "video" | "link_preview" | "embed_link"
export type SubMediaType = "color" | "image" | "video" | "link_preview"

export interface SubMediaItem {
  id: string
  type: SubMediaType
  color?: string
  gradient?: string
  url?: string
  external_url?: string
  preview_title?: string
  preview_desc?: string
  preview_image?: string
  is_embed_video?: boolean
  embed_src?: string
  link?: string
}

export interface GradientStop {
  color: string
  stop: number
}

export interface BannerConfig {
  mode: "solid" | "gradient"
  angle: number
  stops: GradientStop[]
  height_px: number
  width_pct: number
}

// ⭐ এলাইনমেন্ট অপশন (left, center, right, justify) যুক্ত করা হয়েছে ⭐
export interface TextLayer {
  id: string
  title: string
  subtitle?: string
  description?: string
  x: number // ০ - ১০০%
  y: number // ০ - ১০০%
  scale: number
  font?: string
  weight: "normal" | "semibold" | "bold"
  italic: boolean
  align?: "left" | "center" | "right" | "justify"
  color: string
  bg_color?: string
  animation: string
}

export interface VideoConfig {
  type: "file" | "youtube" | "facebook" | "direct"
  url: string
  autoplay: boolean
  mute_on_leave: boolean
}

export const TEXT_EFFECTS_35 = [
  { label: "১. ফেড আপ ড্রপ (Fade Up)", value: "fade-up" },
  { label: "২. টাইপরাইটার ইফেক্ট (Typewriter)", value: "typewriter" },
  { label: "৩. জুম ইন পপ (Zoom Pop)", value: "zoom-pop" },
  { label: "৪. নিয়ন পালস গ্লো (Neon Glow)", value: "neon-pulse" },
  { label: "৫. টেক্সট বাউন্স ইন (Bounce In)", value: "bounce-in" },
  { label: "৬. ৩ডি ফ্লিপ হরিজোন্টাল (3D Flip X)", value: "flip-x" },
  { label: "৭. ৩ডি ফ্লিপ ভার্টিকাল (3D Flip Y)", value: "flip-y" },
  { label: "৮. সাইবার গ্লিচ ইফেক্ট (Cyber Glitch)", value: "cyber-glitch" },
  { label: "৯. স্মোক ফেড ব্লার (Smoke Fade)", value: "smoke-fade" },
  { label: "১০. লেটার ওয়েভ (Letter Wave)", value: "letter-wave" },
  { label: "১১. স্লাইড বাম থেকে (Slide Left)", value: "slide-left" },
  { label: "১২. স্লাইড ডান থেকে (Slide Right)", value: "slide-right" },
  { label: "১৩. রোটেট ৩ডি ড্রপ (Rotate Drop)", value: "rotate-drop" },
  { label: "১৪. ফ্ল্যাশ ব্লিঙ্ক (Flash Blink)", value: "flash-blink" },
  { label: "১৫. ভাইব্রেট শেইক অ্যালার্ট (Shake)", value: "shake-alert" },
  { label: "১৬. রেইনবো শিফট (Rainbow Shift)", value: "rainbow-shift" },
  { label: "১৭. ট্র্যাকিং এক্সপ্যান্ড (Tracking)", value: "tracking-expand" },
  { label: "১৮. গোল্ডেন শাইন শিমার (Golden)", value: "golden-shimmer" },
  { label: "১৯. টুইস্ট ৩ডি (Twist 3D)", value: "twist-3d" },
  { label: "২০. সুইং পেন্ডুলাম (Swing In)", value: "swing-in" },
  { label: "২১. সিনেমাটিক ড্রিফট (Ken Burns)", value: "ken-burns" },
  { label: "২২. স্পটলাইট রিভিল (Spotlight)", value: "spotlight" },
  { label: "২৩. রাবার ব্যান্ড পপ (Rubber Band)", value: "rubber-band" },
  { label: "২৪. পালস রিং এক্সপ্যান্ড (Pulse)", value: "pulse-expand" },
  { label: "২৫. পার্সপেক্টিভ টিল্ট (Tilt 3D)", value: "tilt-in" },
  { label: "২৬. [অটো] স্মুথ ফ্লোটিং লুপ (Smooth Float)", value: "auto-float" },
  { label: "২৭. [অটো] হার্টবিট থাম্প লুপ (Heartbeat)", value: "auto-heartbeat" },
  { label: "২৮. [অটো] নিয়ন গ্লো লুপ (Neon Pulse Loop)", value: "auto-neon" },
  { label: "২৯. [অটো] জেলো ওয়েভল লুপ (Jello Wobble)", value: "auto-jello" },
  { label: "৩০. [অটো] গোল্ডেন শিমার লুপ (Golden Shimmer)", value: "auto-golden" },
  { label: "৩১. [অটো] গ্রেডিয়েন্ট ফ্লো টেক্সট লুপ (Gradient Flow)", value: "auto-gradient" },
  { label: "৩২. [অটো] জেন্টল ব্রীথিং লুপ (Gentle Breathe)", value: "auto-breathe" },
  { label: "৩৩. [অটো] সাবটল গ্লিচ লুপ (Subtle Glitch)", value: "auto-glitch" },
  { label: "৩৪. [অটো] পেন্ডুলাম সুইং লুপ (Pendulum)", value: "auto-swing" },
  { label: "৩৫. [অটো] বাউন্স ড্রপ লুপ (Soft Bounce)", value: "auto-bounce" },
]

export const TEXT_EFFECTS_30 = TEXT_EFFECTS_35

export const TEXT_SIZES = [
  { label: "ছোট (Small)", value: "sm" },
  { label: "স্বাভাবিক (Normal)", value: "base" },
  { label: "মাঝারি (Medium)", value: "lg" },
  { label: "বড় (Large)", value: "xl" },
  { label: "অতিরিক্ত বড় (2XL)", value: "2xl" },
]

export const TEXT_STYLES = [
  { label: "স্বাভাবিক (Normal)", value: "normal" },
  { label: "গাঢ় (Bold)", value: "bold" },
  { label: "ইটালিক (Italic)", value: "italic" },
]

export const TRANSITIONS_30 = [
  { label: "১. স্মুথ ফেড (Smooth Fade)", value: "fade" },
  { label: "২. স্লাইড হরিজোন্টাল (Slide Left-Right)", value: "slide-h" },
  { label: "৩. স্লাইড ভার্টিকাল (Slide Top-Bottom)", value: "slide-v" },
  { label: "৪. জুম ইন স্কেল (Zoom In)", value: "zoom-in" },
  { label: "৫. জুম আউট এক্সপ্লোর (Zoom Out)", value: "zoom-out" },
  { label: "৬. ৩ডি কিউব রোটেট (3D Cube)", value: "cube-3d" },
  { label: "৭. টুইস্ট স্পিন (Twist Spin)", value: "twist-spin" },
  { label: "৮. সিনেমাটিক ব্লার ফেড (Blur Dissolve)", value: "blur-fade" },
]

export const FONTS = [
  { label: "হিন্দ শিলিগুড়ি (বাংলা)", value: "'Hind Siliguri', sans-serif" },
  { label: "কালপুরুষ (বাংলা)", value: "'Kalpurush', sans-serif" },
  { label: "সোলাইমান লিপি (বাংলা)", value: "'SolaimanLipi', sans-serif" },
  { label: "নোটো সেরিফ বাংলা (মার্জিত)", value: "'Noto Serif Bengali', serif" },
  { label: "বালু দ্য ২ (বাংলা)", value: "'Baloo Da 2', cursive" },
  { label: "তিরো বাংলা (বাংলা)", value: "'Tiro Bangla', serif" },
  { label: "ইন্টার (ইংরেজি)", value: "'Inter', sans-serif" },
]

export interface HeroSlide {
  id: string
  title: string | null
  summary: string | null
  category: string | null
  button_text: string | null
  link_url: string | null
  slide_type?: HeroPostType
  banner_config?: BannerConfig
  text_layers?: TextLayer[]
  video_config?: VideoConfig
  transition_effect?: string
  slide_duration?: number
  slide_speed_pct?: number
  media_items?: SubMediaItem[]
  sort_order: number
  is_active: boolean
  expires_at?: string | null
  created_at: string
  updated_at?: string
}

export interface HeroSettings {
  id: number
  breaking_on: boolean
  breaking_title: string | null
  breaking_text: string | null
  breaking_link: string | null
  breaking_btn_text?: string | null
  breaking_bg_color?: string | null
  breaking_bg_gradient?: string | null
  desktop_splits?: number
  default_duration?: number
  default_transition?: string
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}` }
  if (json) h["Content-Type"] = "application/json"
  return h
}

export function parseVideoUrl(rawUrl: string): {
  isEmbed: boolean
  embedSrc?: string
  platform: "youtube" | "facebook" | "direct"
} {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isEmbed: false, platform: "direct" }
  }
  const url = rawUrl.trim()
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/)
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      isEmbed: true,
      platform: "youtube",
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&controls=1`,
    }
  }
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return {
      isEmbed: true,
      platform: "facebook",
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
    }
  }
  return { isEmbed: false, platform: "direct" }
}

export async function getHeroSlides(token?: string): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/hero_slides?select=*&order=sort_order.desc,created_at.desc&limit=100`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// আসল ডাটাবেজ এরর মেসেজ প্রদর্শনের ব্যবস্থা সহ ক্রিয়েট ফাংশন
export async function createHeroSlide(token: string, data: Partial<HeroSlide>) {
  const payload = {
    ...data,
    sort_order: data.sort_order ?? Math.floor(Date.now() / 1000),
    updated_at: new Date().toISOString(),
  }

  const res = await fetch(`${SB_URL}/rest/v1/hero_slides`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = ""
    try {
      const err = await res.json()
      detail = err.message || err.hint || err.details || ""
    } catch {}
    throw new Error(detail || `সার্ভার এরর (${res.status})`)
  }
}

export async function updateHeroSlide(token: string, id: string, data: Partial<HeroSlide>) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) {
    let detail = ""
    try {
      const err = await res.json()
      detail = err.message || ""
    } catch {}
    throw new Error(detail || "আপডেট করা যায়নি")
  }
}

export async function deleteHeroSlide(token: string, id: string) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr(token),
  })
  if (!res.ok) throw new Error("স্লাইড ডিলিট করা যায়নি")
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/hero_settings?select=*&id=eq.1`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return null
    const rows = await res.json()
    return Array.isArray(rows) && rows[0] ? rows[0] : null
  } catch {
    return null
  }
}

export async function saveHeroSettings(token: string, data: Partial<HeroSettings>) {
  await fetch(`${SB_URL}/rest/v1/hero_settings?id=eq.1`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
}

export async function getRecentPosts(): Promise<Array<{ id: string; title: string; image_url?: string }>> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,image_url&order=created_at.desc&limit=30`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
