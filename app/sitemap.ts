import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mbsturu.vercel.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/notices`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/council`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
