import { SB_URL, SB_KEY } from "./sb"
import type { HeroSlide } from "./hero"

const CONFIG_KEY = "hero_banner_slides_v2"

// ⭐ ১৫টি কাস্টম ব্যাজ আইকন (৫টি ব্রেকিং নিউজ সম্পর্কিত + ১০টি অন্যান্য) ⭐
export const BANNER_BADGE_ICONS = [
  // ৫টি ব্রেকিং নিউজ সম্পর্কিত
  { key: "siren", label: "🚨 সাইরেন (ব্রেকিং অ্যালার্ট)" },
  { key: "flame", label: "🔥 আগুন (হট নিউজ / তাজা খবর)" },
  { key: "zap", label: "⚡ বিদ্যুৎ / ফ্ল্যাশ (তাৎক্ষণিক ব্রেকিং)" },
  { key: "radio", label: "📡 লাইভ / রেডিও (সরাসরি আপডেট)" },
  { key: "bell-ring", label: "🔔 বেল অ্যালার্ট (জরুরি বিজ্ঞপ্তি)" },
  // ১০টি অন্যান্য প্রয়োজনীয় আইকন
  { key: "sparkles", label: "✨ স্পেশাল (বিশেষ খবর / নতুন আপডেট)" },
  { key: "megaphone", label: "📢 মেগাফোন (ঘোষণা / প্রচার)" },
  { key: "newspaper", label: "📰 পত্রিকা (ক্যাম্পাস সংবাদ)" },
  { key: "trending-up", label: "📈 ট্রেন্ডিং (আলোচিত বিষয়)" },
  { key: "alert-triangle", label: "⚠️ সতর্কতা (সতর্কবার্তা)" },
  { key: "star", label: "⭐ তারা (শীর্ষ খবর / হাইলাইট)" },
  { key: "award", label: "🏆 ট্রফি (সাফল্য / অর্জন)" },
  { key: "clock", label: "⏱️ ঘড়ি (সর্বশেষ সময় / আপডেট)" },
  { key: "compass", label: "🧭 কম্পাস (অনুসন্ধানী প্রতিবেদন)" },
  { key: "check-circle", label: "✅ ভেরিফাইড (যাচাইকৃত তথ্য)" },
] as const

// প্রাথমিক ডিফল্ট ব্যানার
export const DEFAULT_BANNER_SLIDE: HeroSlide = {
  id: "banner_slide_1",
  title: "আসসালামু আলাইকুম ভাই 🫂",
  summary: "আপনার জন্যই অপেক্ষা করছিলাম 😉",
  category: "ব্রেকিং নিউজ",
  button_text: "বিস্তারিত --",
  link_url: "",
  slide_type: "color",
  banner_config: {
    mode: "gradient",
    angle: 135,
    stops: [
      { color: "#1e1b4b", stop: 0 },
      { color: "#1e3a8a", stop: 50 },
      { color: "#0f172a", stop: 100 },
    ],
    height_px: 200,
    width_pct: 100,
  },
  text_layers: [
    {
      id: "txt_title",
      label: "১. প্রধান শিরোনাম (Title)",
      text: "আসসালামু আলাইকুম ভাই 🫂",
      enabled: true,
      x: 35,
      y: 42,
      size_scale: 1.15,
      color: "#FFFFFF",
      weight: "bold",
      italic: false,
      align: "left",
      font: "'Hind Siliguri', sans-serif",
      animation: "fade-up",
    },
    {
      id: "txt_desc",
      label: "২. সাব-হেডিং / বর্ণনা (Text)",
      text: "আপনার জন্যই অপেক্ষা করছিলাম 😉",
      enabled: true,
      x: 35,
      y: 68,
      size_scale: 0.9,
      color: "#CBD5E1",
      weight: "normal",
      italic: false,
      align: "left",
      font: "'Hind Siliguri', sans-serif",
      animation: "fade-up",
    },
    {
      id: "txt_badge",
      label: "৩. ব্যাজ (Badge)",
      text: "ব্রেকিং নিউজ",
      icon: "siren",
      enabled: true,
      x: 18,
      y: 20,
      size_scale: 0.8,
      color: "#FFFFFF",
      bg_color: "#DC2626",
      weight: "bold",
      italic: false,
      align: "center",
      font: "'Hind Siliguri', sans-serif",
      animation: "fade-up",
    },
  ],
  slide_duration: 5000,
  transition_effect: "slide-left",
  sort_order: 1,
  is_active: true,
  created_at: new Date().toISOString(),
}

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h["Content-Type"] = "application/json"
  return h
}

// ব্যানার স্লাইডগুলো নিয়ে আসা (খালি থাকলে খালি অ্যারে [] দেবে)
export async function getHeroBannerSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${CONFIG_KEY}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    const rows: { value: string }[] = await res.json()
    if (!rows || rows.length === 0 || rows[0]?.value === undefined) {
      return [DEFAULT_BANNER_SLIDE]
    }
    const parsed = JSON.parse(rows[0].value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// সকল ব্যানার স্লাইড সংরক্ষণ করা (খালি অ্যারে [] ও সংরক্ষণ করতে পারবে)
export async function saveAllHeroBannerSlides(token: string, slides: HeroSlide[]) {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: "POST",
    headers: {
      ...hdr(token, true),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      key: CONFIG_KEY,
      value: JSON.stringify(slides),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "সংরক্ষণ করা যায়নি")
  }
}

// নতুন স্লাইড যোগ করা
export async function createHeroBannerSlide(token: string, slideData: Partial<HeroSlide>) {
  const current = await getHeroBannerSlides()
  const newSlide: HeroSlide = {
    ...DEFAULT_BANNER_SLIDE,
    ...slideData,
    id: `banner_slide_${Date.now()}`,
    created_at: new Date().toISOString(),
  } as HeroSlide
  const updated = [newSlide, ...current]
  await saveAllHeroBannerSlides(token, updated)
}

// স্লাইড আপডেট করা
export async function updateHeroBannerSlide(token: string, id: string, data: Partial<HeroSlide>) {
  const current = await getHeroBannerSlides()
  const updated = current.map((s) => (s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s))
  await saveAllHeroBannerSlides(token, updated)
}

// ✅ সম্পূর্ণ ডিলিট মেথড (এডমিন ডিলিট করলে চিরতরে ডিলিট হবে, জোর করে ফিরে আসবে না)
export async function deleteHeroBannerSlide(token: string, id: string) {
  const current = await getHeroBannerSlides()
  const updated = current.filter((s) => s.id !== id)
  await saveAllHeroBannerSlides(token, updated)
}
