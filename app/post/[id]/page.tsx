import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, User, Tag, CheckCircle2, Clock, ExternalLink, Sparkles } from 'lucide-react'
import { ReactionBar } from '@/components/portal/reaction-bar'
import { getPost, getApprovedComments, getImagesMeta, getLayout } from '@/lib/sb'
import { CommentForm } from '@/components/portal/comment-form'
import RichGallery from '@/components/portal/rich-gallery'
import { FormattedText } from '@/components/portal/formatted-text'
import { UniversalMediaEmbed } from '@/components/portal/universal-media-embed'
import { PostMetaBadges } from '@/components/portal/post-meta-badges'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'
import { PostViewTracker } from '@/components/portal/post-view-tracker'

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

function estimateReadMinutes(text?: string | null): number {
  if (!text) return 1
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = clean ? clean.split(' ').length : 0
  return Math.max(1, Math.ceil(words / 160))
}

function getSpecialReportBadge(category?: string | null): string | null {
  if (!category) return null
  const c = category.normalize('NFC')
  if (c.includes('অনুসন্ধান')) return '🔍 অনুসন্ধানী প্রতিবেদন'
  if (c.includes('সাক্ষাৎকার')) return '🎤 বিশেষ সাক্ষাৎকার'
  if (c.includes('বিশ্লেষণ')) return '📊 বিশ্লেষণ ও পর্যালোচনা'
  if (c.includes('সম্পাদক') || c.includes('মতামত') || c.includes('কলাম')) return '✍️ মতামত ও কলাম'
  if (c.includes('ফিচার')) return '✨ বিশেষ ফিচার'
  if (c.includes('ফ্যাক্ট')) return '✅ ফ্যাক্ট-চেক প্রতিবেদন'
  return null
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
  const layout = rows.length > 0 ? await getLayout('post', id) : 'grid'
  const items =
    rows.length > 0
      ? rows.map((i) => ({ url: i.url, caption: i.caption, credit: i.credit, date: post.created_at }))
      : post.image_url
        ? [{ url: post.image_url, date: post.created_at }]
        : []

  const pageInfo = post.page || null
  const readMins = estimateReadMinutes(`${post.title || ''} ${post.heading || ''} ${post.body || ''}`)
  const specialBadge = getSpecialReportBadge(post.category)
  const safeExternalLink =
    post.link_url && /^https?:\/\//i.test(post.link_url.trim()) ? post.link_url.trim() : null

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10 px-0 pb-20">
        <PostViewTracker postId={id} />

        <article className="mx-auto max-w-3xl space-y-6 px-4 py-5 sm:px-9 sm:py-9 text-white">

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-4">
            <BackNavigation
              items={[
                pageInfo
                  ? { label: pageInfo.name, href: `/p/${pageInfo.slug}` }
                  : { label: post.category || 'সংবাদ', href: post.category ? `/category/${encodeURIComponent(post.category)}` : undefined }
              ]}
            />

            <div className="flex flex-wrap items-center gap-2">
              {specialBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200 border border-amber-400/40">
                  <Sparkles className="size-3 shrink-0" />
                  <span>{specialBadge}</span>
                </span>
              )}

              {post.category && (
                <Link
                  href={pageInfo ? `/p/${pageInfo.slug}` : `/category/${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-200 border border-white/25 backdrop-blur hover:bg-white/25 transition-all"
                >
                  <Tag className="size-3 text-cyan-300" />
                  <span>{pageInfo ? 'কমিউনিটি পেজ' : post.category}</span>
                </Link>
              )}
            </div>
          </div>

          {/* পেজের পোস্ট হলে ফেসবুক পেজের ব্যানার হেডার */}
          {pageInfo && (
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/15">
              <Link href={`/p/${pageInfo.slug}`} className="shrink-0">
                {pageInfo.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pageInfo.avatar_url}
                    alt={pageInfo.name}
                    className="size-11 rounded-full object-cover ring-2 ring-cyan-400/60"
                  />
                ) : (
                  <div className="size-11 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-base">
                    {pageInfo.name.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <Link href={`/p/${pageInfo.slug}`} className="font-bold text-sm text-white hover:text-cyan-300 transition truncate">
                    {pageInfo.name}
                  </Link>
                  {pageInfo.is_verified && (
                    <CheckCircle2 className="size-3.5 fill-blue-500 text-white shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-cyan-200/80">
                  অফিসিয়াল পেজ · <Link href={`/p/${pageInfo.slug}`} className="underline">পেজে যান</Link>
                </p>
              </div>
            </div>
          )}

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight drop-shadow-md">
            {post.title}
          </h1>

          {post.heading && (
            <p className="text-base sm:text-lg text-cyan-100 font-medium leading-relaxed border-l-4 border-cyan-400 pl-3.5 italic bg-white/5 py-2 rounded-r-xl">
              {post.heading}
            </p>
          )}

          <div className="space-y-2.5 border-y border-white/15 py-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-cyan-200 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                <CalendarDays className="size-3.5 text-cyan-300 shrink-0" />
                <span>{formatBanglaDate(post.created_at)}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-200 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                <Clock className="size-3.5 text-amber-300 shrink-0" />
                <span>{readMins.toLocaleString('bn-BD')} মিনিট পাঠ</span>
              </span>

              {post.author && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-white/90 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                  <User className="size-3.5 text-cyan-300 shrink-0" />
                  {post.user_id ? (
                    <Link href={`/u/${post.user_id}`} className="hover:text-cyan-300 hover:underline">
                      {post.author}
                    </Link>
                  ) : (
                    <span>{post.author}</span>
                  )}
                </span>
              )}
            </div>

            <PostMetaBadges data={post} />
          </div>

          <div className="-mx-4 sm:-mx-9">
            <RichGallery
              items={items}
              layout={layout}
              postTitle={post.title}
              postDate={post.created_at}
            />
          </div>

          {post.video_url && (
            <div className="-mx-4 sm:-mx-9">
              <video src={post.video_url} controls playsInline className="w-full bg-black" />
            </div>
          )}

          <div className="py-2 text-slate-100 text-base sm:text-lg leading-relaxed">
            <FormattedText text={post.body} className="text-slate-100 leading-relaxed" />
          </div>

          {safeExternalLink && (
            <div className="pt-1">
              <a
                href={safeExternalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 px-4 py-2 text-xs font-bold transition"
              >
                <ExternalLink className="size-3.5" />
                <span>সংযুক্ত মূল সূত্র / ওয়েবসাইট দেখুন</span>
              </a>
            </div>
          )}

          {post.embed_media_url && (
            <div className="-mx-4 sm:-mx-9">
              <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
            </div>
          )}

          <div className="pt-3 border-t border-white/15">
            <ReactionBar postId={id} title={post.title} />
          </div>

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
