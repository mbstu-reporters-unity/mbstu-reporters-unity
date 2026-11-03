import { SB_URL, SB_KEY } from "./sb"

export interface SubMediaItem {
  id: string
  type: "color" | "image" | "video"
  url?: string
  link?: string
  color?: string
  gradient?: string
}

// ৩০টি চমৎকার টেক্সট অ্যানিমেশন ইফেক্ট
export const TEXT_EFFECTS_30 = [
  { label: "১. ফেড আপ ড্রপ (Fade Up)", value: "fade-up" },
  { label: "২. টাইপরাইটার (Typewriter)", value: "typewriter" },
  { label: "৩. জুম ইন পপ (Zoom Pop)", value: "zoom-pop" },
  { label: "৪. নিয়ন পালস গ্লো (Neon Glow)", value: "neon-pulse" },
  { label: "৫. টেক্সট বাউন্স ইন (Text Bounce)", value: "bounce-in" },
  { label: "৬. ৩ডি ফ্লিপ হরিজোন্টাল (3D Flip X)", value: "flip-x" },
  { label: "৭. ৩ডি ফ্লিপ ভার্টিকাল (3D Flip Y)", value: "flip-y" },
  { label: "৮. সাইবার গ্লিচ ইফেক্ট (Cyber Glitch)", value: "cyber-glitch" },
  { label: "৯. স্মোক ফেড ব্লার (Smoke Fade)", value: "smoke-fade" },
  { label: "১০. লেটার ওয়েভ অ্যানিমেশন (Letter Wave)", value: "letter-wave" },
  { label: "১১. স্লাইড স্মুথ বামে (Slide Left)", value: "slide-left" },
  { label: "১২. স্লাইড স্মুথ ডানে (Slide Right)", value: "slide-right" },
  { label: "১৩. রোটেট ৩ডি ড্রপ (Rotate Drop)", value: "rotate-drop" },
  { label: "১৪. ফ্ল্যাশ ব্লিঙ্ক অ্যালার্ট (Flash Blink)", value: "flash-blink" },
  { label: "১৫. ভাইব্রেট শেইক অ্যালার্ট (Shake Alert)", value: "shake-alert" },
  { label: "১৬. রেইনবো কালার শিফট (Rainbow Shift)", value: "rainbow-shift" },
  { label: "১৭. ট্র্যাকিং এক্সপ্যান্ড (Tracking Expand)", value: "tracking-expand" },
  { label: "১৮. শ্যাডো এক্সপ্লোশন (Shadow Burst)", value: "shadow-burst" },
  { label: "১৯. গোল্ডেন শাইন শিমার (Golden Shimmer)", value: "golden-shimmer" },
  { label: "২০. টুইস্ট ৩ডি (Twist 3D)", value: "twist-3d" },
  { label: "২১. স্মুথ ফ্লোটিং (Smooth Float)", value: "smooth-float" },
  { label: "২২. সুইং পেন্ডুলাম (Swing In)", value: "swing-in" },
  { label: "২৩. সিনেমাটিক ড্রিফট (Ken Burns)", value: "ken-burns" },
  { label: "২৪. স্পটলাইট রিভিল (Spotlight)", value: "spotlight" },
  { label: "২৫. রাবার ব্যান্ড পপ (Rubber Band)", value: "rubber-band" },
  { label: "২৬. হার্টবিট থাম্প (Heartbeat)", value: "heartbeat" },
  { label: "২৭. জেলো ওয়াভল (Jello Wobble)", value: "jello" },
  { label: "২৮. পালস রিং এক্সপ্যান্ড (Pulse Expand)", value: "pulse-expand" },
  { label: "২৯. পার্সপেক্টিভ টিল্ট (Perspective Tilt)", value: "tilt-in" },
  { label: "৩০. গ্রেডিয়েন্ট ফ্লো টেক্সট (Gradient Flow)", value: "gradient-flow" },
]

export const FONTS = [
  { label: "হিন্দ শিলিগুড়ি (Hind Siliguri)", value: "'Hind Siliguri', sans-serif" },
  { label: "কালপুরুষ (Kalpurush)", value: "'Kalpurush', sans-serif" },
  { label: "সোলাইমান লিপি (SolaimanLipi)", value: "'SolaimanLipi', sans-serif" },
  { label: "নোটো সান্স বাংলা (Noto Sans Bengali)", value: "'Noto Sans Bengali', sans-serif" },
  { label: "বালু দ্য ২ (Baloo Da 2)", value: "'Baloo Da 2', cursive" },
  { label: "তিরো বাংলা (Tiro Bangla)", value: "'Tiro Bangla', serif" },
  { label: "ইন্টার (Inter)", value: "'Inter', sans-serif" },
  { label: "রোবোটো (Roboto)", value: "'Roboto', sans-serif" },
  { label: "প্লেফেয়ার ডিসপ্লে (Playfair Display)", value: "'Playfair Display', serif" },
  { label: "মনটসেরাট (Montserrat)", value: "'Montserrat', sans-serif" },
]

export const TEXT_SIZES = [
  { label: "ছোট (Small)", value: "sm" },
  { label: "স্বাভাবিক (Normal)", value: "base" },
  { label: "মাঝারি (Medium)", value: "lg" },
  { label: "বড় (Large)", value: "xl" },
  { label: "অতিরিক্ত বড় (2XL)", value: "2xl" },
  { label: "বিশাল (3XL)", value: "3xl" },
  { label: "মেগা (4XL)", value: "4xl" },
]

export const TEXT_STYLES = [
  { label: "স্বাভাবিক (Normal)", value: "normal" },
  { label: "গাঢ় (Bold)", value: "bold" },
  { label: "ইটালিক (Italic)", value: "italic" },
  { label: "বোল্ড ও ইটালিক", value: "bold-italic" },
]

export const TRANSITIONS = [
  { label: "ফেড (Smooth Fade)", value: "fade" },
  { label: "স্লাইড বামে (Slide Left)", value: "slide-left" },
  { label: "স্লাইড ডানে (Slide Right)", value: "slide-right" },
  { label: "জুম ইন (Zoom In)", value: "zoom-in" },
  { label: "স্কেল ফেড (Scale Fade)", value: "scale-fade" },
]

export type HeroSlide = {
  id: string
  title: string | null
  summary: string | null
  category: string | null
  button_text: string | null
  link_url: string | null
  
  // সাব-স্লাইড সমূহ (ছবি, ভিডিও বা কালার)
  media_items?: SubMediaItem[]
  slide_duration?: number

  // টেক্সট স্টাইল ও ৩০টি অ্যানিমেশন
  text_effect?: string
  text_effect_speed?: number
  title_font?: string | null
  title_size?: string | null
  title_style?: string | null
  title_color?: string | null
  title_bg_color?: string | null
  text_align?: "left" | "center" | "right" | null

  summary_font?: string | null
  summary_size?: string | null
  summary_style?: string | null
  summary_color?: string | null

  badge_color?: string | null
  badge_text_color?: string | null
  btn_bg_color?: string | null
  btn_color?: string | null

  content_pos_v?: "top" | "center" | "bottom" | null
  content_pos_h?: "left" | "center" | "right" | null
  show_card_bg?: boolean | null
  card_width_pct?: number | null
  card_radius_pct?: number | null
  card_padding_val?: number | null
  card_blur?: number | null
  card_bg_color?: string | null
  card_opacity?: number | null
  fit_mode?: "contain" | "cover" | null

  sort_order: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export type HeroSettings = {
  breaking_on: boolean
  breaking_title: string | null
  breaking_text: string | null
  breaking_link: string | null
  breaking_btn_text?: string | null
  breaking_media_type?: "none" | "image" | "video" | null
  breaking_media_url?: string | null
  breaking_bg_color?: string | null
  breaking_bg_gradient?: string | null
  slide_speed?: number | null
  transition_type?: string | null
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}` }
  if (json) h["Content-Type"] = "application/json"
  return h
}

export async function getHeroSlides(token?: string): Promise<HeroSlide[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/hero_slides?select=*&order=sort_order.asc,created_at.desc&limit=100`, {
      headers: hdr(token),
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function getRecentPosts(): Promise<Array<{ id: string; title: string; image_url?: string; summary?: string }>> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/posts?select=id,title,image_url,summary&order=created_at.desc&limit=30`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createHeroSlide(token: string, data: any) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("স্লাইড তৈরি করা সম্ভব হয়নি")
}

export async function updateHeroSlide(token: string, id: string, data: any) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error("স্লাইড আপডেট হয়নি")
}

export async function deleteHeroSlide(token: string, id: string) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr(token),
  })
  if (!res.ok) throw new Error("স্লাইড ডিলিট হয়নি")
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/hero_settings?select=*&id=eq.1`, {
      headers: hdr(),
      cache: "no-store",
    })
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
    body: JSON.stringify(data),
  })
}
