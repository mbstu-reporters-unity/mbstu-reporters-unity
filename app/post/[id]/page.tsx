import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, User, Tag, Sparkles } from 'lucide-react'
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

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10 px-4 pb-20">
        <article className="glass-card mx-auto max-w-3xl space-y-6 p-5 sm:p-9 text-white">
          
          {/* দ্রুত নেভিগেশন ও ক্যাটাগরি */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>

            {post.category && (
              <Link
                href={`/category/${encodeURIComponent(post.category)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-200 border border-white/25 backdrop-blur hover:bg-white/25 transition-all"
              >
                <Tag className="size-3 text-cyan-300" />
                <span>{post.category}</span>
              </Link>
            )}
          </div>
          
          {/* প্রধান শিরোনাম */}
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight drop-shadow-md">
            {post.title}
          </h1>
          
          {/* উপশিরোনাম */}
          {post.heading && (
            <p className="text-base sm:text-lg text-cyan-100 font-medium leading-relaxed border-l-4 border-cyan-400 pl-3.5 italic bg-white/5 py-2 rounded-r-xl">
              {post.heading}
            </p>
          )}
          
          {/* তারিখ ও প্রতিবেদক */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs border-y border-white/15 py-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-cyan-200 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
              <CalendarDays className="size-3.5 text-cyan-300 shrink-0" />
              <span>{formatBanglaDate(post.created_at)}</span>
            </span>

            {post.author && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-white/90 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                <User className="size-3.5 text-cyan-300 shrink-0" />
                <span>{post.author}</span>
              </span>
            )}
          </div>

          {/* ফটো গ্যালারি */}
          <RichGallery items={items} layout={layout} />

          {/* নিজস্ব ভিডিও */}
          {post.video_url && (
            <video src={post.video_url} controls playsInline className="w-full rounded-2xl bg-black border border-white/20 shadow-lg" />
          )}
          
          {/* বিস্তারিত লেখা (চোখের আরামদায়ক ফন্ট ও লাইন স্পেসিং) */}
          <div className="py-2 text-slate-100 text-base sm:text-lg leading-relaxed">
            <FormattedText text={post.body} className="text-slate-100 leading-relaxed" />
          </div>

          {/* ভিডিও/মিডিয়া এম্বেড */}
          {post.embed_media_url && (
            <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
          )}
          
          {/* রিঅ্যাকশন ও সোশ্যাল শেয়ার */}
          <div className="pt-3 border-t border-white/15">
            <ReactionBar postId={id} title={post.title} />
          </div>

          {/* মন্তব্য সেকশন */}
          <div className="pt-4 border-t border-white/15">
            <CommentForm postId={id} initialComments={comments} />
          </div>

        </article>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
