import { SB_URL, SB_KEY } from "./sb"

// ৪ ধরণের মিডিয়া ও সাব-স্লাইডের টাইপ
export type SubMediaType = "color" | "image" | "video" | "link_preview"

export interface SubMediaItem {
  id: string
  type: SubMediaType
  // কালার স্লাইডের জন্য:
  color?: string
  gradient?: string
  // ছবি/ভিডিও/ফাইলের জন্য:
  url?: string
  // হাইপারলিংক বা সোশ্যাল লিংক প্রিভিউয়ের জন্য:
  external_url?: string
  preview_title?: string
  preview_desc?: string
  preview_image?: string
  is_embed_video?: boolean
  embed_src?: string
  // প্রতিটি স্লাইডের নিজস্ব ঐচ্ছিক ক্লিক লিংক:
  link?: string
}

// ৩০টি চমৎকার ও আধুনিক টেক্সট অ্যানিমেশন ইফেক্ট
export const TEXT_EFFECTS_30 = [
  { label: "১. ফেড আপ ড্রপ (Fade Up Smooth)", value: "fade-up" },
  { label: "২. টাইপরাইটার ইফেক্ট (Typewriter)", value: "typewriter" },
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
  { label: "২২. সুইং পেন্ডুলাম (Swing In 3D)", value: "swing-in" },
  { label: "২৩. সিনেমাটিক ড্রিফট (Ken Burns Pan)", value: "ken-burns" },
  { label: "২৪. স্পটলাইট রিভিল (Spotlight)", value: "spotlight" },
  { label: "২৫. রাবার ব্যান্ড পপ (Rubber Band)", value: "rubber-band" },
  { label: "২৬. হার্টবিট থাম্প (Heartbeat)", value: "heartbeat" },
  { label: "২৭. জেলো ওয়াভল (Jello Wobble)", value: "jello" },
  { label: "২৮. পালস রিং এক্সপ্যান্ড (Pulse Expand)", value: "pulse-expand" },
  { label: "২৯. পার্সপেক্টিভ টিল্ট (Perspective Tilt)", value: "tilt-in" },
  { label: "৩০. গ্রেডিয়েন্ট ফ্লো টেক্সট (Gradient Flow)", value: "gradient-flow" },
]

// ফন্ট তালিকা
export const FONTS = [
  { label: "হিন্দ শিলিগুড়ি (Hind Siliguri - বাংলা)", value: "'Hind Siliguri', sans-serif" },
  { label: "কালপুরুষ (Kalpurush - বাংলা)", value: "'Kalpurush', sans-serif" },
  { label: "সোলাইমান লিপি (SolaimanLipi - বাংলা)", value: "'SolaimanLipi', sans-serif" },
  { label: "নোটো সান্স বাংলা (Noto Sans Bengali)", value: "'Noto Sans Bengali', sans-serif" },
  { label: "বালু দ্য ২ (Baloo Da 2 - বাংলা)", value: "'Baloo Da 2', cursive" },
  { label: "তিরো বাংলা (Tiro Bangla - বাংলা)", value: "'Tiro Bangla', serif" },
  { label: "ইন্টার (Inter - ইংরেজি)", value: "'Inter', sans-serif" },
  { label: "রোবোটো (Roboto - ইংরেজি)", value: "'Roboto', sans-serif" },
  { label: "প্লেফেয়ার ডিসপ্লে (Playfair Display)", value: "'Playfair Display', serif" },
  { label: "মনটসেরাট (Montserrat)", value: "'Montserrat', sans-serif" },
]

// লেখার আকার
export const TEXT_SIZES = [
  { label: "ছোট (Small - sm)", value: "sm" },
  { label: "স্বাভাবিক (Normal - base)", value: "base" },
  { label: "মাঝারি (Medium - lg)", value: "lg" },
  { label: "বড় (Large - xl)", value: "xl" },
  { label: "অতিরিক্ত বড় (2XL)", value: "2xl" },
  { label: "বিশাল (3XL)", value: "3xl" },
  { label: "মেগা (4XL)", value: "4xl" },
]

// লেখার স্টাইল
export const TEXT_STYLES = [
  { label: "স্বাভাবিক (Normal)", value: "normal" },
  { label: "গাঢ় (Bold)", value: "bold" },
  { label: "ইটালিক (Italic)", value: "italic" },
  { label: "বোল্ড ও ইটালিক", value: "bold-italic" },
]

// মূল হিরো স্লাইড পোস্ট অবজেক্ট টাইপ
export interface HeroSlide {
  id: string
  title: string | null
  summary: string | null
  category: string | null
  button_text: string | null
  link_url: string | null
  slide_type?: SubMediaType

  // সাব-স্লাইড তালিকা
  media_items?: SubMediaItem[]

  // সময় ও গতি নিয়ন্ত্রণ
  slide_duration?: number
  slide_speed_pct?: number

  // টেক্সট টাইপোগ্রাফি ও ইফেক্ট
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

  // গ্লাস কার্ড ওভারলে সেটিংস
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

// গ্লোবাল হিরো ও ব্রেকিং সেটিংস
export interface HeroSettings {
  id: number
  breaking_on: boolean
  breaking_title: string | null
  breaking_text: string | null
  breaking_link: string | null
  breaking_btn_text?: string | null
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

// সোশ্যাল ভিডিও ও যেকোনো ওয়েবসাইটের প্রিভিউ শনাক্তকরণ
export function parseMediaOrLink(rawUrl: string): {
  isEmbedVideo: boolean
  embedSrc?: string
  platform?: "youtube" | "facebook" | "direct_video" | "web"
} {
  if (!rawUrl || typeof rawUrl !== "string") return { isEmbedVideo: false }
  const url = rawUrl.trim()

  // ১. YouTube
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
  if (ytMatch && ytMatch[2]?.length === 11) {
    return {
      isEmbedVideo: true,
      platform: "youtube",
      embedSrc: `https://www.youtube.com/embed/${ytMatch[2]}?enablejsapi=1&rel=0&modestbranding=1&controls=1`,
    }
  }

  // ২. Facebook Video
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return {
      isEmbedVideo: true,
      platform: "facebook",
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
    }
  }

  // ৩. সরাসরি ভিডিও ফাইল (.mp4, .webm ইত্যাদি)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      isEmbedVideo: true,
      platform: "direct_video",
      embedSrc: url,
    }
  }

  // ৪. সাধারণ হাইপারলিংক
  return {
    isEmbedVideo: false,
    platform: "web",
  }
}

// স্লাইড পোস্ট ডাটা লোড (সবার শেষের পোস্টটি আগে দেখানোর জন্য sort_order DESC ও created_at DESC)
export async function getHeroSlides(token?: string): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/hero_slides?select=*&order=sort_order.desc,created_at.desc&limit=100`,
      {
        headers: hdr(token),
        cache: "no-store",
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ড্যাশবোর্ডে সাম্প্রতিক নিউজ ড্রপডাউন লোড
export async function getRecentPosts(): Promise<Array<{ id: string; title: string; image_url?: string; summary?: string }>> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/posts?select=id,title,image_url,summary&order=created_at.desc&limit=30`,
      {
        headers: hdr(),
        cache: "no-store",
      }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// নতুন হিরো পোস্ট তৈরি (সর্বোচ্চ sort_order দেওয়া হবে যাতে সবার উপরে অবস্থান করে)
export async function createHeroSlide(token: string, data: Partial<HeroSlide>) {
  const currentTimestamp = Date.now()
  const payload = {
    ...data,
    sort_order: data.sort_order ?? currentTimestamp,
    updated_at: new Date().toISOString(),
  }

  const res = await fetch(`${SB_URL}/rest/v1/hero_slides`, {
    method: "POST",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("স্লাইড তৈরি করা সম্ভব হয়নি")
}

// স্লাইড পোস্ট আপডেট
export async function updateHeroSlide(token: string, id: string, data: Partial<HeroSlide>) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error("স্লাইড আপডেট করা যায়নি")
}

// স্লাইড পোস্ট ডিলিট
export async function deleteHeroSlide(token: string, id: string) {
  const res = await fetch(`${SB_URL}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr(token),
  })
  if (!res.ok) throw new Error("স্লাইড ডিলিট করা যায়নি")
}

// হিরো ও ব্রেকিং গ্লোবাল সেটিংস লোড
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

// সেটিংস সেভ
export async function saveHeroSettings(token: string, data: Partial<HeroSettings>) {
  await fetch(`${SB_URL}/rest/v1/hero_settings?id=eq.1`, {
    method: "PATCH",
    headers: { ...hdr(token, true), Prefer: "return=minimal" },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  })
}
