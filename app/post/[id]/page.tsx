import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactionBar } from '@/components/portal/reaction-bar'
import { getPost, getApprovedComments, getImagesMeta, getLayout } from '@/lib/sb'
import { CommentForm } from '@/components/portal/comment-form'
import RichGallery from '@/components/portal/rich-gallery'

export const dynamic = 'force-dynamic'

const BASE = 'https://mbsturu.vercel.app'
const loadPost = cache(getPost)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await loadPost(id)
  if (!post) return { title: 'সংবাদ পাওয়া যায়নি', robots: { index: false } }

  const raw = (post.heading || post.body || '').replace(/\s+/g, ' ').trim()
  const description = raw.length > 160 ? raw.slice(0, 157) + '...' : raw
  const url = `${BASE}/post/${id}`

  return {
    title: post.title,
    description: description || undefined,
    alternates: { canonical: url },
    robots: post.hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: description || undefined,
      siteName: "MBSTU Reporters' Unity",
      publishedTime: post.created_at,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
    twitter: {
      card: post.image_url ? 'summary_large_image' : 'summary',
      title: post.title,
      description: description || undefined,
      images: post.image_url ? [post.image_url] : undefined,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await loadPost(id)
  if (!post) notFound()
  const comments = await getApprovedComments(id)
  const rows = await getImagesMeta('post', id)
  const layout = rows.length > 1 ? await getLayout('post', id) : 'grid'
  const items =
    rows.length > 0
      ? rows.map((i) => ({ url: i.url, caption: i.caption, credit: i.credit }))
      : post.image_url
        ? [{ url: post.image_url }]
        : []
  const urls = items.map((i) => i.url)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.created_at,
    mainEntityOfPage: `${BASE}/post/${id}`,
    ...(urls.length > 0 ? { image: urls } : {}),
    ...(post.author ? { author: { '@type': 'Person', name: post.author } } : {}),
    publisher: {
      '@type': 'Organization',
      name: "MBSTU Reporters' Unity",
      url: BASE,
    },
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <article className="mx-auto max-w-2xl space-y-4">
        <a href="/" className="text-sm underline">← হোম</a>
        <p className="text-xs font-bold text-green-700">{post.category}</p>
        <h1 className="font-serif text-2xl font-bold">{post.title}</h1>
        {post.heading && <p className="text-lg text-gray-600">{post.heading}</p>}
        <p className="text-xs text-gray-500">
          {post.author} · {new Date(post.created_at).toLocaleDateString('bn-BD')}
        </p>
        <RichGallery items={items} layout={layout} />
        {post.video_url && (
          <video src={post.video_url} controls playsInline className="w-full rounded-xl bg-black" />
        )}
        <p className="whitespace-pre-line leading-relaxed">{post.body}</p>
        <ReactionBar postId={id} title={post.title} />

        <section className="space-y-3 pt-6">
          <h2 className="font-semibold">মন্তব্য ({comments.length})</h2>
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold">{c.name || 'নামহীন'}</p>
              <p className="whitespace-pre-line text-sm">{c.message}</p>
            </div>
          ))}
          <CommentForm postId={id} />
        </section>
      </article>
    </main>
  )
}
