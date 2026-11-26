import { SB_KEY, SB_URL } from "./sb"

export const AD_BANNERS_CONFIG_KEY = "site_ad_banners_v1"

export const AD_BANNER_SLOTS = [
  "home_top",
  "home_mid_1",
  "home_mid_2",
  "home_mid_3",
  "home_mid_4",
  "post_top",
  "post_middle",
  "post_bottom",
] as const

export type AdBannerSlot = (typeof AD_BANNER_SLOTS)[number]

export interface AdBannerItem {
  id: string
  title: string
  image_url: string
  link_url: string
  slot: AdBannerSlot
  is_active: boolean
  created_at: string
}

function isAdBannerItem(item: unknown): item is AdBannerItem {
  if (!item || typeof item !== "object") return false
  const ad = item as Partial<AdBannerItem>
  return (
    typeof ad.id === "string" &&
    typeof ad.title === "string" &&
    typeof ad.image_url === "string" &&
    typeof ad.link_url === "string" &&
    AD_BANNER_SLOTS.some((slot) => slot === ad.slot) &&
    typeof ad.is_active === "boolean" &&
    typeof ad.created_at === "string"
  )
}

export async function getAdBanners(): Promise<AdBannerItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${AD_BANNERS_CONFIG_KEY}`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
    if (!res.ok) {
      console.error(`Ad banner query failed (${res.status})`)
      return []
    }

    const rows: Array<{ value?: string }> = await res.json()
    if (!rows[0]?.value) return []
    const parsed: unknown = JSON.parse(rows[0].value)
    if (!Array.isArray(parsed)) {
      console.error("Ad banner config is not a list")
      return []
    }
    return parsed.filter(isAdBannerItem)
  } catch (error) {
    console.error("Ad banner query failed", error)
    return []
  }
}

export async function saveAdBanners(token: string, items: AdBannerItem[]): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key: AD_BANNERS_CONFIG_KEY, value: JSON.stringify(items) }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || error.msg || "বিজ্ঞাপন সংরক্ষণ করা যায়নি")
  }
}
