import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, User, Tag } from 'lucide-react'
import { ReactionBar } from '@/components/portal/reaction-bar'
import { getPost, getApprovedComments, getImagesMeta, getLayout } from '@/lib/sb'
import { CommentForm } from '@/components/portal/comment-form'
import RichGallery from '@/components/portal/rich-gallery'
import { FormattedText } from '@/components/portal/formatted-text'
import { UniversalMediaEmbed } from '@/components/portal/universal-media-embed'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

// ⭐ গুগল সার্চ থেকে বিদ্যুৎগতিতে পেজ লোড হওয়ার জন্য ISR ক্যাশিং ⭐
export const revalidate = 60

const BASE = 'https://mbsturu.vercel.app'
const loadPost = cache(getPost)

function formatBanglaDate(val?: string | null): string {
  if (!val) return ''
  if (/জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/.test(val)) {
    return val
  }
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
  }
  return val
}

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
    title: `${post.title} | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি`,
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
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/icon.png`,
      },
    },
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen bg-gray-50/60 py-6 sm:py-10 px-4 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <article className="mx-auto max-w-3xl space-y-5 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-border">
          
          {/* দ্রুত নেভিগেশন ও ক্যাটাগরি */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>

            {post.category && (
              <Link
                href={`/category/${encodeURIComponent(post.category)}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-soft text-brand hover:bg-brand hover:text-white transition-colors px-3 py-1 text-xs font-bold cursor-pointer"
              >
                <Tag className="size-3" />
                <span>{post.category}</span>
              </Link>
            )}
          </div>
          
          {/* ১. প্রধান শিরোনাম */}
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-navy leading-tight">
            {post.title}
          </h1>
          
          {/* ২. উপশিরোনাম (হেডিং) */}
          {post.heading && (
            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed border-l-4 border-brand pl-3 italic">
              {post.heading}
            </p>
          )}
          
          {/* তারিখ ও প্রতিবেদকের নাম */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs border-y border-border/70 py-2.5">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-950 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
              <CalendarDays className="size-3.5 text-emerald-700 shrink-0" />
              <span>{formatBanglaDate(post.created_at)}</span>
            </span>

            {post.author && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                <User className="size-3.5 text-slate-600 shrink-0" />
                <span>{post.author}</span>
              </span>
            )}
          </div>

          {/* আপলোড করা ফটো গ্যালারি বা কভার ফটো */}
          <RichGallery items={items} layout={layout} />

          {/* নিজস্ব ভিডিও (যদি থাকে) */}
          {post.video_url && (
            <video src={post.video_url} controls playsInline className="w-full rounded-2xl bg-black shadow-md" />
          )}
          
          {/* ৩. বিস্তারিত লেখা (নিরাপদ স্যানিটাইজড টেক্সট) */}
          <FormattedText text={post.body} className="text-base text-navy/90" />

          {/* ৪. ইউটিউব, ফেসবুক বা সরাসরি ভিডিও/ছবির প্লেয়ার */}
          {post.embed_media_url && (
            <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
          )}
          
          {/* রিঅ্যাকশন ও সোশ্যাল শেয়ার বার */}
          <ReactionBar postId={id} title={post.title} />

          {/* ৫. মন্তব্য ও রিপ্লাই থ্রেড সেকশন */}
          <CommentForm postId={id} initialComments={comments} />

        </article>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
