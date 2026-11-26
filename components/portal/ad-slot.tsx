import { getAdBanners, type AdBannerItem, type AdBannerSlot } from "@/lib/ads"

function getLinkTarget(link: string): { href: string; external: boolean } | null {
  const value = link.trim()
  if (/^https?:\/\/\S+$/i.test(value)) return { href: value, external: true }
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    return { href: value, external: false }
  }
  return null
}

export async function AdSlot({
  slot,
  prefetchedAds,
}: {
  slot: AdBannerSlot
  prefetchedAds?: AdBannerItem[]
}) {
  const ads = prefetchedAds ?? (await getAdBanners())
  const visibleAds = ads.filter((ad) => ad.slot === slot && ad.is_active)
  const banners = visibleAds.flatMap((ad) => {
    const target = getLinkTarget(ad.link_url)
    return target ? [{ ad, ...target }] : []
  })

  if (!banners.length) return null

  return (
    <div
      className={
        slot === "home_top"
          ? "mx-auto my-2 max-w-7xl border-y border-[var(--theme-card-border)] px-3 py-2 sm:px-4"
          : slot === "post_top"
            ? "mx-auto mb-4 mt-2 max-w-7xl border-y border-[var(--theme-card-border)] px-3 py-2 sm:px-4"
          : "mx-auto my-3 max-w-4xl px-4"
      }
      aria-label="বিজ্ঞাপন"
    >
      {banners.map(({ ad, href, external }) => (
        <div key={ad.id} className="mx-auto text-center">
          <p className="mb-1 text-[10px] font-medium text-slate-500">বিজ্ঞাপন / স্পন্সর</p>
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={ad.title}
            className="block overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.image_url}
              alt={ad.title}
              className="mx-auto h-auto max-h-64 w-full object-contain"
            />
          </a>
        </div>
      ))}
    </div>
  )
}
