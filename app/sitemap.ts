import type { MetadataRoute } from 'next'
import { getVisiblePosts } from '@/lib/sb'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://mbsturu.vercel.app'

  const posts = await getVisiblePosts(1000)

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/post/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/notices`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/council`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...postUrls,
  ]
}
