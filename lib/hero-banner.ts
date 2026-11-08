import { SB_URL, SB_KEY } from "./sb"
import type { HeroSlide } from "./hero"

const CONFIG_KEY = "hero_banner_slides_v2"

// স্ক্রিনশটের মতো প্রাথমিক ডিফল্ট ব্যানার
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
      y: 65,
      size_scale: 0.9,
      color: "#E2E8F0",
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
      enabled: true,
      x: 20,
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

// ব্যানার স্লাইডগুলো নিয়ে আসা
export async function getHeroBannerSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${CONFIG_KEY}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return [DEFAULT_BANNER_SLIDE]
    const rows: { value: string }[] = await res.json()
    if (!rows || rows.length === 0 || !rows[0]?.value) {
      return [DEFAULT_BANNER_SLIDE]
    }
    const parsed = JSON.parse(rows[0].value)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_BANNER_SLIDE]
  } catch {
    return [DEFAULT_BANNER_SLIDE]
  }
}

// সকল ব্যানার স্লাইড সংরক্ষণ করা
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

// স্লাইড ডিলিট করা
export async function deleteHeroBannerSlide(token: string, id: string) {
  const current = await getHeroBannerSlides()
  const updated = current.filter((s) => s.id !== id)
  await saveAllHeroBannerSlides(token, updated.length > 0 ? updated : [DEFAULT_BANNER_SLIDE])
}
