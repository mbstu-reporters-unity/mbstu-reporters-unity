import { SB_URL, SB_KEY } from "./sb"

// ব্যাজের পূর্ণ তালিকা
export const BADGES = [
  "ব্রেকিং",
  "এইমাত্র পাওয়া",
  "আজকের খবর",
  "আপডেট",
  "অনুসন্ধান",
  "ক্যাম্পাস",
  "সাক্ষাৎকার",
  "কর্মশালা",
  "গবেষণা",
  "সংস্কৃতি",
]

// ২০টি জনপ্রিয় ট্রানজিশন
export const TRANSITIONS = [
  { label: "১. ফেড (Smooth Fade)", value: "fade" },
  { label: "২. স্লাইড বামে (Slide Left)", value: "slide-left" },
  { label: "৩. স্লাইড ডানে (Slide Right)", value: "slide-right" },
  { label: "৪. স্লাইড উপরে (Slide Up)", value: "slide-up" },
  { label: "৫. স্লাইড নিচে (Slide Down)", value: "slide-down" },
  { label: "৬. জুম ইন (Zoom In)", value: "zoom-in" },
  { label: "৭. জুম আউট (Zoom Out)", value: "zoom-out" },
  { label: "৮. ফ্লিপ হরাইজন্টাল (Flip Horizontal 3D)", value: "flip-h" },
  { label: "৯. ফ্লিপ ভার্টিক্যাল (Flip Vertical 3D)", value: "flip-v" },
  { label: "১০. রোটেট ইন (Rotate In 3D)", value: "rotate-in" },
  { label: "১১. কিউব ৩ডি (3D Cube Turn)", value: "cube-3d" },
  { label: "১২. ফ্ল্যাশ ব্লার ফেড (Flash Blur)", value: "blur-fade" },
  { label: "১৩. বাউন্স ইন (Bounce In)", value: "bounce-in" },
  { label: "১৪. স্লাইড ও জুম (Slide & Zoom)", value: "slide-zoom" },
  { label: "১৫. স্কেল ফেড (Scale Fade)", value: "scale-fade" },
  { label: "১৬. প্যারালাক্স বামে (Parallax Left)", value: "parallax-left" },
  { label: "১৭. প্যারালাক্স ডানে (Parallax Right)", value: "parallax-right" },
  { label: "১৮. সুইং ইন (Swing In 3D)", value: "swing-in" },
  { label: "১৯. টুইস্ট ইন (Twist 3D)", value: "twist-in" },
  { label: "২০. সিনেমাটিক কেন-বার্নস (Ken Burns Pan)", value: "ken-burns" },
]

// ২১টি অ্যানিমেটেড ব্রেকিং ব্যাজ ও শেপ
export const BREAKING_BADGES = [
  { label: "🔴 ১. পালসিং রেড ডট (Pulsing Dot)", value: "pulse-circle" },
  { label: "📡 ২. রাডার ওয়েভ (Radar Wave)", value: "radar-wave" },
  { label: "💡 ৩. নিয়ন গ্লো বীকন (Neon Beacon)", value: "neon-beacon" },
  { label: "🔥 ৪. ফায়ার ফ্লেম (Fire Flame)", value: "fire-flame" },
  { label: "⚡ ৫. ফ্ল্যাশ লাইটনিং (Flash Lightning)", value: "flash-lightning" },
  { label: "💓 ৬. হার্টবিট পালস (Heartbeat)", value: "heartbeat" },
  { label: "⭐ ৭. স্পিনিং স্টার (Rotating Star)", value: "spinning-star" },
  { label: "🔄 ৮. বর্ডার স্পিনার (Border Spinner)", value: "border-spinner" },
  { label: "🌈 ৯. নিয়ন বক্স গ্লো (Neon Glow)", value: "neon-glow" },
  { label: "🏷️ ১০. থ্রি-ডি ফ্লিপ ব্যাজ (3D Flip)", value: "flip-badge" },
  { label: "📶 ১১. সাউন্ডওয়েভ বার (Soundwave)", value: "soundwave" },
  { label: "👑 ১২. গোল্ডেন ক্রাউন এলার্ট (Golden Crown)", value: "golden-crown" },
  { label: "📻 ১৩. লাইভ সিগন্যাল অ্যান্টেনা (Live Antenna)", value: "antenna-signal" },
  { label: "🔔 ১৪. কাঁপন্ত অ্যালার্ট বেল (Shaking Bell)", value: "shaking-bell" },
  { label: "⭕ ১৫. এক্সপ্যান্ডিং রিং (Expanding Ring)", value: "expanding-ring" },
  { label: "⏩ ১৬. ডাবল অ্যারো ব্লিঙ্ক (Arrow Blink)", value: "arrow-blink" },
  { label: "💎 ১৭. ডায়মন্ড পালস (Pulsing Diamond)", value: "diamond-pulse" },
  { label: "🚥 ১৮. সাইরেন স্ট্রোব (Police Siren Strobe)", value: "siren-strobe" },
  { label: "🚨 ১৯. ভাইব্রেট এলার্ম (Vibrating Alarm)", value: "vibrating-alarm" },
  { label: "✨ ২০. ডিজিটাল এলইডি টিকার (Digital LED)", value: "led-ticker" },
  { label: "🎆 ২১. রেইনবো শিফট (Rainbow Shift)", value: "rainbow-shift" },
]

// ব্রেকিং টেক্সট অ্যানিমেশন ইফেক্ট
export const BREAKING_TEXT_EFFECTS = [
  { label: "🎲 স্বয়ংক্রিয় প্যাটার্ন (Auto Rotation - একা একাই বদলাবে)", value: "auto" },
  { label: "১. টাইপরাইটার ইফেক্ট (Typewriter)", value: "typewriter" },
  { label: "২. জুম ইন পপ (Zoom Pop)", value: "zoom-pop" },
  { label: "৩. নিয়ন পালস গ্লো (Neon Glow)", value: "neon-pulse" },
  { label: "৪. টেক্সট বাউন্স ইন (Text Bounce)", value: "bounce-in" },
  { label: "৫. ফ্লিপ ৩ডি ইন (3D Flip In)", value: "flip-3d" },
  { label: "৬. সাইবার গ্লিচ ইফেক্ট (Cyber Glitch)", value: "cyber-glitch" },
  { label: "৭. স্মোক ফেড ইন (Smoke Fade)", value: "smoke-fade" },
  { label: "৮. লেটার ওয়েভ অ্যানিমেশন (Letter Wave)", value: "letter-wave" },
  { label: "৯. স্লাইড বামে (Slide Left)", value: "slide-left" },
  { label: "১০. স্লাইড ডানে (Slide Right)", value: "slide-right" },
  { label: "১১. স্লাইড আপ ড্রপ (Slide Up Drop)", value: "slide-up-drop" },
  { label: "১২. রোটেট ড্রপ ৩ডি (Rotate 3D Drop)", value: "rotate-drop" },
  { label: "১৩. ব্লিঙ্ক ফ্ল্যাশ অ্যালার্ট (Blink Flash)", value: "flash-blink" },
  { label: "১৪. কাঁপন / শেইক অ্যালার্ট (Vibrating Shake)", value: "shake-alert" },
  { label: "১৫. রেইনবো কালার শিফট (Rainbow Shift)", value: "rainbow-shift" },
  { label: "১৬. লেটার স্পেসিং এক্সপ্যান্ড (Tracking Expand)", value: "tracking-expand" },
  { label: "১৭. শ্যাডো এক্সপ্লোশন (Shadow Burst)", value: "shadow-burst" },
  { label: "১৮. গোল্ডেন শাইন শিমার (Golden Shimmer)", value: "golden-shimmer" },
  { label: "১৯. টুইস্ট ইন ৩ডি (Twist 3D)", value: "twist-3d" },
  { label: "২০. স্মুথ ফ্লোটিং (Smooth Float)", value: "smooth-float" },
]

// ১০টি জনপ্রিয় বাংলা ও ইংরেজি ফন্ট
export const FONTS = [
  { label: "হিন্দ শিলিগুড়ি (Hind Siliguri - বাংলা)", value: "'Hind Siliguri', sans-serif" },
  { label: "কালপুরুষ (Kalpurush - বাংলা)", value: "'Kalpurush', sans-serif" },
  { label: "সোলাইমান লিপি (SolaimanLipi - বাংলা)", value: "'SolaimanLipi', sans-serif" },
  { label: "নোটো সান্স বাংলা (Noto Sans Bengali)", value: "'Noto Sans Bengali', sans-serif" },
  { label: "বালু দ্য ২ (Baloo Da 2 - বাংলা)", value: "'Baloo Da 2', cursive" },
  { label: "তিরো বাংলা (Tiro Bangla - বাংলা)", value: "'Tiro Bangla', serif" },
  { label: "ইন্টার (Inter - ইংরেজি)", value: "'Inter', sans-serif" },
  { label: "রোবোটো (Roboto - ইংরেজি)", value: "'Roboto', sans-serif" },
  { label: "প্লেফেয়ার ডিসপ্লে (Playfair Display - ইংরেজি)", value: "'Playfair Display', serif" },
  { label: "মনটসেরাট (Montserrat - ইংরেজি)", value: "'Montserrat', sans-serif" },
]

// ফন্টের থিকনেস
export const FONT_WEIGHTS = [
  { label: "হালকা (Light 300)", value: "300" },
  { label: "স্বাভাবিক (Regular 400)", value: "400" },
  { label: "মাঝারি (Medium 500)", value: "500" },
  { label: "সেমি-বোল্ড (Semi-Bold 600)", value: "600" },
  { label: "গাঢ়/বোল্ড (Bold 700)", value: "700" },
  { label: "অতিরিক্ত গাঢ় (Extra Bold 800)", value: "800" },
]

// লেখার সাইজ অপশন
export const TEXT_SIZES = [
  { label: "ছোট (Small)", value: "sm" },
  { label: "স্বাভাবিক (Normal)", value: "base" },
  { label: "মাঝারি (Medium)", value: "lg" },
  { label: "বড় (Large)", value: "xl" },
  { label: "অতিরিক্ত বড় (2XL)", value: "2xl" },
  { label: "বিশাল (3XL)", value: "3xl" },
  { label: "মেগা (4XL)", value: "4xl" },
]

// লেখার স্টাইল অপশন
export const TEXT_STYLES = [
  { label: "স্বাভাবিক (Normal)", value: "normal" },
  { label: "গাঢ় (Bold)", value: "bold" },
  { label: "ইটালিক (Italic বাঁকা)", value: "italic" },
  { label: "বোল্ড ও ইটালিক (Bold Italic)", value: "bold-italic" },
]

export const MAX_LIVE = 100

export type HeroSlide = {
  id: string
  category: string | null
  title: string | null
  summary: string | null
  image_url: string | null
  image_pos: "top" | "center" | "bottom"
  media_type?: "image" | "video" | null
  video_url?: string | null
  extra_media?: string | null
  media_urls?: string | null // ডিভাইস থেকে একসাথে আপলোড করা একাধিক মিডিয়া
  button_text?: string | null
  // স্বাধীন শিরোনাম স্টাইল
  title_font?: string | null
  title_size?: string | null
  title_style?: string | null
  title_color?: string | null
  title_bg_color?: string | null
  // স্বাধীন বিবরণ স্টাইল
  summary_font?: string | null
  summary_size?: string | null
  summary_style?: string | null
  summary_color?: string | null
  // স্বাধীন ব্যাজ স্টাইল
  badge_font?: string | null
  badge_size?: string | null
  badge_text_color?: string | null
  badge_color?: string | null
  // স্বাধীন বাটন স্টাইল
  btn_font?: string | null
  btn_size?: string | null
  btn_color?: string | null
  btn_bg_color?: string | null
  // অন্যান্য লেআউট ও কার্ড
  text_align?: "left" | "center" | "right" | null
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
  link_url: string | null
  sort_order: number
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type HeroInput = Omit<HeroSlide, "id" | "created_at" | "updated_at">

export type HeroSettings = {
  breaking_on: boolean
  breaking_title: string | null
  breaking_text: string | null
  breaking_link: string | null
  breaking_btn_text?: string | null
  breaking_media_type?: "none" | "image" | "video" | null
  breaking_media_url?: string | null
  breaking_extra_media?: string | null
  breaking_media_urls?: string | null
  breaking_bg_color?: string | null
  breaking_bg_gradient?: string | null
  breaking_shape?: string | null
  breaking_badge_style?: string | null
  breaking_pulse_speed?: "slow" | "normal" | "fast" | null
  breaking_pulse_speed_pct?: number | null
  breaking_text_effect?: string | null
  breaking_text_speed_pct?: number | null
  breaking_title_size?: string | null
  breaking_title_color?: string | null
  breaking_text_size?: string | null
  breaking_text_color?: string | null
  max_slides?: number | null
  slide_speed?: number | null
  transition_type?: string | null
  text_motion?: boolean | null
}

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

// স্লাইড লোড করা
export async function getHeroSlides(token?: string): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/hero_slides?select=*&order=sort_order.asc,created_at.desc&limit=100`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// সাইটের পোস্টগুলো লোড করা
export async function getRecentPosts(): Promise<Array<{ id: string; title: string; image_url?: string; summary?: string }>> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,image_url,summary&order=created_at.desc&limit=40`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// নতুন স্লাইড তৈরি
export async function createHeroSlide(token: string, data: HeroInput) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

// স্লাইড আপডেট
export async function updateHeroSlide(token: string, id: string, data: Partial<HeroInput>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}

// স্লাইড ডিলিট
export async function deleteHeroSlide(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}

// হিরো সেটিংস
export async function getHeroSettings(): Promise<HeroSettings | null> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/hero_settings?select=*&id=eq.1`, {
      headers: hdr(),
      cache: "no-store",
    })
    if (!res.ok) return null
    const rows: HeroSettings[] = await res.json()
    return rows[0] || null
  } catch {
    return null
  }
}

export async function saveHeroSettings(token: string, data: Partial<HeroSettings>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/hero_settings?id=eq.1`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    })
  )
}
