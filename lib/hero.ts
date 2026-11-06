import { SB_URL, SB_KEY } from "./sb"

// ১. পোস্ট ও মিডিয়ার ৪টি ধরন
export type HeroPostType = "color" | "image" | "video" | "embed_link"

// গ্রেডিয়েন্ট কালার স্টপ (৩ থেকে ৫ রঙের জন্য)
export interface GradientStop {
  color: string
  stop: number // ০ থেকে ১০০%
}

// কালার ব্যানার কনফিগারেশন (সাইজ, শেপ ও গ্রেডিয়েন্ট)
export interface BannerConfig {
  mode: "solid" | "gradient"
  angle: number // ০ - ৩৬০ ডিগ্রি
  stops: GradientStop[] // ৩-৫টি রঙ
  height_px: number // উচ্চতা
  width_pct: number // প্রস্থ ০ - ১০০%
}

// ব্যানার বা ছবির ওপর ফ্রি-ফর্ম টেক্সট লেয়ার (০-১০০% X/Y পজিশন)
export interface TextLayer {
  id: string
  title: string
  subtitle?: string
  description?: string
  x: number // ০ থেকে ১০০% (বামে-ডানে)
  y: number // ০ থেকে ১০০% (উপরে-নিচে)
  scale: number // লেখার আকার স্কেলিং
  font?: string
  weight: "normal" | "semibold" | "bold"
  italic: boolean
  color: string
  bg_color?: string
  animation: string // ৩৫টি অ্যানিমেশনের যেকোনো একটি
}

// ভিডিও কনফিগারেশন
export interface VideoConfig {
  type: "file" | "youtube" | "facebook" | "direct"
  url: string
  autoplay: boolean
  mute_on_leave: boolean
}

// ৩৫টি চমৎকার টেক্সট অ্যানিমেশন (১০টি অটো-লুপ সহ)
export const TEXT_EFFECTS_35 = [
  // সাধারণ অ্যানিমেশন
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

  // ১০টি স্বয়ংক্রিয় নিরবচ্ছিন্ন লুপ অ্যানিমেশন
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

// ৩০টি আধুনিক স্লাইড ট্রানজিশন
export const TRANSITIONS_30 = [
  { label: "১. স্মুথ ফেড (Smooth Fade)", value: "fade" },
  { label: "২. স্লাইড হরিজোন্টাল (Slide Left-Right)", value: "slide-h" },
  { label: "৩. স্লাইড ভার্টিকাল (Slide Top-Bottom)", value: "slide-v" },
  { label: "৪. জুম ইন স্কেল (Zoom In)", value: "zoom-in" },
  { label: "৫. জুম আউট এক্সপ্লোর (Zoom Out)", value: "zoom-out" },
  { label: "৬. ৩ডি কিউব রোটেট (3D Cube)", value: "cube-3d" },
  { label: "৭. ৩ডি ফ্লিপ হরিজোন্টাল (Flip Horizontal)", value: "flip-h" },
  { label: "৮. ৩ডি ফ্লিপ ভার্টিকাল (Flip Vertical)", value: "flip-v" },
  { label: "৯. ব্লাইন্ডস শাটার (Blinds Shutter)", value: "blinds" },
  { label: "১০. মোজাইক স্লাইস (Mosaic Slice)", value: "mosaic" },
  { label: "১১. ডায়াগোনাল স্লাইড (Diagonal Slide)", value: "diagonal" },
  { label: "১২. সার্কেল এক্সপ্যান্ড (Circle Wipe)", value: "circle-wipe" },
  { label: "১৩. সিনেমাটিক ব্লার ফেড (Blur Dissolve)", value: "blur-fade" },
  { label: "১৪. টুইস্ট স্পিন (Twist Spin)", value: "twist-spin" },
  { label: "১৫. ইলাস্টিক বাউন্স (Elastic Bounce)", value: "elastic" },
  { label: "১৬. ডোর পুশ ওপেন (Door Open)", value: "door-open" },
  { label: "১৭. সোয়াইপ পুশ (Push Swipe)", value: "push-swipe" },
  { label: "১৮. রিভিল মাস্ক (Mask Reveal)", value: "reveal" },
  { label: "১৯. গ্লিচ ট্রানজিশন (Glitch Warp)", value: "glitch" },
  { label: "২০. ওয়েভ রিপল (Wave Ripple)", value: "ripple" },
  { label: "২১. স্প্লিট কাটেন (Curtain Split)", value: "curtain" },
  { label: "২২. কর্নার ফোল্ড (Corner Fold)", value: "corner-fold" },
  { label: "২৩. রোটেট ড্রপ (Rotate Drop)", value: "rotate-drop" },
  { label: "২৪. শ্যাডো স্পেক্ট্রাম (Shadow Spectrum)", value: "shadow-spec" },
  { label: "২৫. ডার্ক ফেড আউট (Fade to Black)", value: "fade-black" },
  { label: "২৬. হোয়াইট ফ্ল্যাশ (White Flash)", value: "white-flash" },
  { label: "২৭. ওভারলে কভার (Overlay Cover)", value: "overlay-cover" },
  { label: "২৮. রোলিং রিল (Rolling Reel)", value: "rolling-reel" },
  { label: "২৯. পপ আপ বাবল (Bubble Pop)", value: "bubble-pop" },
  { label: "৩০. প্যারালাক্স শিফট (Parallax Shift)", value: "parallax" },
]

// ফন্ট তালিকা (বাংলা ও ইংরেজি)
export const FONTS = [
  { label: "হিন্দ শিলিগুড়ি (বাংলা)", value: "'Hind Siliguri', sans-serif" },
  { label: "কালপুরুষ (বাংলা)", value: "'Kalpurush', sans-serif" },
  { label: "সোলাইমান লিপি (বাংলা)", value: "'SolaimanLipi', sans-serif" },
  { label: "নোটো সেরিফ বাংলা (মার্জিত)", value: "'Noto Serif Bengali', serif" },
  { label: "বালু দ্য ২ (বাংলা)", value: "'Baloo Da 2', cursive" },
  { label: "তিরো বাংলা (বাংলা)", value: "'Tiro Bangla', serif" },
  { label: "ইন্টার (ইংরেজি)", value: "'Inter', sans-serif" },
  { label: "প্লেফেয়ার ডিসপ্লে (ইংরেজি)", value: "'Playfair Display', serif" },
]

// মূল হিরো স্লাইড অবজেক্ট
export interface HeroSlide {
  id: string
  title: string | null
  summary: string | null
  category: string | null
  button_text: string | null
  link_url: string | null
  slide_type: HeroPostType

  // আধুনিক কনফিগারেশন
  banner_config: BannerConfig
  text_layers: TextLayer[]
  video_config: VideoConfig
  transition_effect: string

  // স্লাইডার সময়কাল (০ থেকে ১০০ সেকেন্ড)
  slide_duration: number
  slide_speed_pct: number

  // পুরোনো সেটিংসের ব্যাকওয়ার্ড কম্প্যাটিবিলিটি
  media_items?: any[]
  text_effect?: string
  text_effect_speed?: number
  title_font?: string | null
  title_size?: string | null
  title_style?: string | null
  title_color?: string | null
  title_bg_color?: string | null
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

  sort_order: number
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

// হিরো গ্লোবাল সেটিংস (স্প্লিট ও ব্রেকিং)
export interface HeroSettings {
  id: number
  breaking_on: boolean
  breaking_title: string | null
  breaking_text: string | null
  breaking_link: string | null
  breaking_btn_text?: string | null
  breaking_bg_color?: string | null
  breaking_bg_gradient?: string | null
  desktop_splits: number // ১, ২ বা ৩ স্প্লিট স্ক্রিন
  default_duration: number
  default_transition: string
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}` }
  if (json) h["Content-Type"] = "application/json"
  return h
}

// ভিডিও লিঙ্ক বা এম্বেড শনাক্তকরণ
export function parseVideoUrl(rawUrl: string): {
  isEmbed: boolean
  embedSrc?: string
  platform: "youtube" | "facebook" | "direct"
} {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isEmbed: false, platform: "direct" }
  }
  const url = rawUrl.trim()

  // YouTube ভিডিও
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/)
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      isEmbed: true,
      platform: "youtube",
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&controls=1`,
    }
  }

  // Facebook ভিডিও
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return {
      isEmbed: true,
      platform: "facebook",
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
    }
  }

  // সরাসরি ভিডিও ফাইল
  return {
    isEmbed: false,
    platform: "direct",
  }
}

// স্লাইডসমূহ লোড করা (সর্বশেষ পোস্টটি সবার আগে আসবে)
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

// নতুন হিরো স্লাইড তৈরি
export async function createHeroSlide(token: string, data: Partial<HeroSlide>) {
  const payload = {
    ...data,
    sort_order: data.sort_order ?? Date.now(),
    updated_at: new Date().toISOString(),
  }

  const res = await fetch(`${SB_URL}/rest/v1/hero_slides`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("স্লাইড তৈরি করা সম্ভব হয়নি")
}

// স্লাইড আপডেট
export async function updateHeroSlide(token: string, id: string, data: Partial<HeroSlide>) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error("স্লাইড আপডেট করা যায়নি")
}

// স্লাইড মুছে ফেলা
export async function deleteHeroSlide(token: string, id: string) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr(token),
  })
  if (!res.ok) throw new Error("স্লাইড ডিলিট করা যায়নি")
}

// হিরো সেটিংস লোড
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

// হিরো সেটিংস সেভ
export async function saveHeroSettings(token: string, data: Partial<HeroSettings>) {
  await fetch(`${SB_URL}/rest/v1/hero_settings?id=eq.1`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
}

// সাম্প্রতিক সংবাদের তালিকা (ড্রপডাউনে পোস্টের সাথে লিঙ্ক করার জন্য)
export async function getRecentPosts(): Promise<Array<{ id: string; title: string; image_url?: string; summary?: string }>> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,image_url,heading&order=created_at.desc&limit=30`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
