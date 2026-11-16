import type { MetadataRoute } from 'next'
import { getVisiblePosts } from '@/lib/sb'
import { getCommunityPages } from '@/lib/pages'
import { getDepartments } from '@/lib/faculties'
import { getVisibleCategoryNames } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://mbsturu.vercel.app'
  const now = new Date()

  const [posts, pages, depts, cats] = await Promise.all([
    getVisiblePosts(1000).catch(() => []),
    getCommunityPages().catch(() => []),
    getDepartments().catch(() => []),
    getVisibleCategoryNames().catch(() => []),
  ])

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/post/${encodeURIComponent(p.id)}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const pageUrls: MetadataRoute.Sitemap = pages
    .filter((pg) => pg.is_active !== false && pg.slug)
    .map((pg) => ({
      url: `${base}/p/${encodeURIComponent(pg.slug)}`,
      lastModified: pg.created_at ? new Date(pg.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const deptUrls: MetadataRoute.Sitemap = depts.map((d) => ({
    url: `${base}/department/${encodeURIComponent(d.id)}`,
    lastModified: d.created_at ? new Date(d.created_at) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const catUrls: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${base}/category/${encodeURIComponent(c)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/notices`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/administration`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/student-corner`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/associations`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/social-sites`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/council`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...catUrls,
    ...deptUrls,
    ...pageUrls,
    ...postUrls,
  ]
}
