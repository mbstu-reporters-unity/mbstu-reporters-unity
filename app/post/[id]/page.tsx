import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Home,
  PenLine,
  Sparkles,
  Tag,
  User,
} from 'lucide-react'
import { ReactionBar } from '@/components/portal/reaction-bar'
import { getPost, getApprovedComments, getImagesMeta, getLayout, getRelatedPosts } from '@/lib/sb'
import { getAdBanners } from '@/lib/ads'
import { AdSlot } from '@/components/portal/ad-slot'
import { CommentForm } from '@/components/portal/comment-form'
import RichGallery from '@/components/portal/rich-gallery'
import { FormattedText } from '@/components/portal/formatted-text'
import { ArticleReaderControls } from '@/components/portal/article-reader-controls'
import { KalbelaPostImage } from '@/components/portal/kalbela-post-image'
import { UniversalMediaEmbed } from '@/components/portal/universal-media-embed'
import { PostMetaBadges } from '@/components/portal/post-meta-badges'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { PostViewTracker } from '@/components/portal/post-view-tracker'

export const revalidate = 60

const BASE = 'https://mbsturu.vercel.app'
const loadPost = cache(getPost)

function formatBanglaDateTime(val?: string | null): string {
  if (!val) return ''
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    const date = d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
    const timeParts = new Intl.DateTimeFormat('bn-BD', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka',
    }).formatToParts(d)
    const hour = timeParts.find((part) => part.type === 'hour')?.value || ''
    const minute = timeParts.find((part) => part.type === 'minute')?.value || ''
    const rawPeriod = timeParts.find((part) => part.type === 'dayPeriod')?.value || ''
    const period = /^(am|এএম)$/i.test(rawPeriod)
      ? 'এএম'
      : /^(pm|পিএম)$/i.test(rawPeriod)
        ? 'পিএম'
        : rawPeriod
    return `${date}, ${hour}:${minute} ${period}`.trim()
  }
  return val
}

function splitBodyIntoParagraphs(body?: string | null): string[] {
  if (!body?.trim()) return []

  if (/<\/p\s*>/i.test(body)) {
    const paragraphs = body.match(/<p\b[^>]*>[\s\S]*?<\/p\s*>/gi) || []
    const remainder = body.replace(/<p\b[^>]*>[\s\S]*?<\/p\s*>/gi, '').trim()
    const hasNestedBlocks = /<(?:div|blockquote|h[1-3]|ul|ol)\b/i.test(body)
    if (paragraphs.length > 1 && !remainder && !hasNestedBlocks) return paragraphs
    return [body]
  }

  if (/<[^>]+>/.test(body)) return [body]
  const paragraphs = body.split(/\n\s*\n/)
  return paragraphs.length > 1 ? paragraphs.filter((paragraph) => paragraph.trim()) : [body]
}

function plainText(value?: string | null): string {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
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

  const raw = (post.summary || post.heading || post.body || '').replace(/\s+/g, ' ').trim()
  const description = raw.length > 160 ? raw.slice(0, 157) + '...' : raw
  const url = `${BASE}/post/${id}`
  const modifiedTime =
    post.updated_at &&
    new Date(post.updated_at).getTime() > new Date(post.created_at).getTime()
      ? post.updated_at
      : post.created_at

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
      modifiedTime,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await loadPost(id)
  if (!post) notFound()

  const [comments, rows, relatedPosts, adBanners] = await Promise.all([
    getApprovedComments(id),
    getImagesMeta('post', id),
    getRelatedPosts(id, post.category),
    getAdBanners(),
  ])
  const layout = rows.length > 0 ? await getLayout('post', id) : 'grid'
  const items =
    rows.length > 0
      ? rows.map((item) => ({
          url: item.url,
          caption: item.caption,
          credit: item.credit,
          date: post.created_at,
        }))
      : post.image_url
        ? [{ url: post.image_url, caption: null, credit: null, date: post.created_at }]
        : []

  const pageInfo = post.page || null
  const category = post.category || 'ক্যাম্পাস সংবাদ'
  const author = post.author?.trim() || 'প্রতিবেদক, মাভাবিপ্রবি'
  const readMins = estimateReadMinutes(`${post.title || ''} ${post.heading || ''} ${post.body || ''}`)
  const specialBadge = getSpecialReportBadge(post.category)
  const updatedAt =
    post.updated_at &&
    new Date(post.updated_at).getTime() > new Date(post.created_at).getTime()
      ? post.updated_at
      : null
  const kicker =
    (post.tags || []).find((tag) => tag.trim() && tag.trim() !== post.title.trim()) || category
  const subheading =
    post.heading?.trim() && post.heading.trim() !== post.title.trim() ? post.heading.trim() : null
  const safeExternalLink =
    post.link_url && /^https?:\/\//i.test(post.link_url.trim()) ? post.link_url.trim() : null
  const bodyParagraphs = splitBodyIntoParagraphs(post.body)
  const insertAfter = bodyParagraphs.length >= 3 ? 3 : 0
  const inlineRelated = insertAfter > 0 ? relatedPosts[0] || null : null
  const remainingRelated = inlineRelated ? relatedPosts.slice(1) : relatedPosts
  const tags = Array.from(new Set([...(post.tags || []), category].map((tag) => tag.trim()).filter(Boolean)))
  const description = plainText(post.summary || post.heading || post.body).slice(0, 300)
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: description || undefined,
    image: items[0]?.url ? [items[0].url] : undefined,
    datePublished: post.created_at,
    dateModified: updatedAt || post.created_at,
    author: {
      '@type': 'Person',
      name: author,
      url: post.user_id ? `${BASE}/u/${post.user_id}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: "MBSTU Reporters' Unity",
      url: BASE,
      logo: { '@type': 'ImageObject', url: `${BASE}/icon.png` },
    },
    mainEntityOfPage: `${BASE}/post/${id}`,
  }).replace(/</g, '\\u003c')

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen px-0 py-5 pb-20 sm:py-9" style={{ color: 'var(--theme-text-body)' }}>
        <AdSlot slot="post_top" prefetchedAds={adBanners} />
        <PostViewTracker postId={id} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />

        <article
          className="mx-auto max-w-5xl space-y-6 rounded-none px-4 py-5 sm:space-y-7 sm:px-8 sm:py-8 md:rounded-2xl md:border"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-border)',
            boxShadow: 'var(--theme-card-shadow)',
          }}
        >
          <nav aria-label="ব্রেডক্রাম্ব" className="flex flex-wrap items-center gap-2 pb-1 text-sm text-slate-500">
            <Link
              href="/"
              aria-label="হোম"
              className="inline-flex items-center gap-1 font-semibold text-[var(--theme-brand)] hover:underline"
            >
              <Home className="size-3.5" aria-hidden="true" />
              <span>প্রচ্ছদ</span>
            </Link>
            <ChevronRight className="size-4 opacity-50" aria-hidden="true" />
            <Link
              href={pageInfo ? `/p/${pageInfo.slug}` : `/category/${encodeURIComponent(category)}`}
              className="truncate font-semibold text-[var(--theme-text-body)] hover:text-[var(--theme-brand)] hover:underline"
            >
              {pageInfo?.name || category}
            </Link>
            {specialBadge && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                <Sparkles className="size-3" aria-hidden="true" />
                {specialBadge}
              </span>
            )}
          </nav>

          {pageInfo && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] p-3">
              <Link href={`/p/${pageInfo.slug}`} className="shrink-0">
                {pageInfo.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pageInfo.avatar_url}
                    alt={pageInfo.name}
                    className="size-11 rounded-full object-cover ring-2 ring-[var(--theme-brand)]"
                  />
                ) : (
                  <span className="flex size-11 items-center justify-center rounded-full bg-[var(--theme-brand)] text-base font-bold text-white">
                    {pageInfo.name.charAt(0)}
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/p/${pageInfo.slug}`}
                    className="truncate text-sm font-bold text-[var(--theme-text-title)] hover:text-[var(--theme-brand)]"
                  >
                    {pageInfo.name}
                  </Link>
                  {pageInfo.is_verified && (
                    <CheckCircle2 className="size-4 shrink-0 fill-blue-500 text-white" aria-label="যাচাইকৃত পেজ" />
                  )}
                </div>
                <p className="text-xs text-[var(--theme-text-body)]">
                  অফিসিয়াল কমিউনিটি পেজ · <Link href={`/p/${pageInfo.slug}`} className="underline">পেজে যান</Link>
                </p>
              </div>
            </div>
          )}

          <header className="space-y-4">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[var(--theme-brand)] sm:text-sm">
              {kicker}
            </p>
            <h1 className="font-serif text-2xl font-extrabold leading-[1.3] text-[var(--theme-text-title)] sm:text-3xl md:text-4xl lg:text-[40px]">
              {post.title}
            </h1>
            {subheading && (
              <p className="font-serif text-base italic leading-relaxed text-[var(--theme-text-body)] sm:text-lg">
                {subheading}
              </p>
            )}

            <div className="grid gap-y-2 border-y border-[var(--theme-card-border)] py-3 text-xs text-[var(--theme-text-body)] sm:grid-cols-2 sm:text-sm">
              <div className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-slate-600" aria-hidden="true" />
                <span>
                  {post.user_id ? (
                    <Link href={`/u/${post.user_id}`} className="font-semibold hover:text-[var(--theme-brand)] hover:underline">
                      {author}
                    </Link>
                  ) : (
                    <span className="font-semibold">{author}</span>
                  )}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <ArrowUp className="size-3 text-emerald-600" aria-hidden="true" />
                <span>প্রকাশ : {formatBanglaDateTime(post.created_at)}</span>
              </div>
              {updatedAt && (
                <div className="inline-flex items-center gap-1.5">
                  <ArrowDown className="size-3 text-rose-600" aria-hidden="true" />
                  <span>আপডেট : {formatBanglaDateTime(updatedAt)}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5">
                <PenLine className="size-3.5 text-slate-500" aria-hidden="true" />
                <span>অনলাইন সংস্করণ</span>
                {pageInfo && <span className="text-slate-500">· কমিউনিটি পেজ</span>}
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <Clock className="size-3.5" aria-hidden="true" />
                {readMins.toLocaleString('bn-BD')} মিনিট পাঠ
              </div>
              <PostMetaBadges data={post} />
            </div>
          </header>

          <ArticleReaderControls
            postId={id}
            title={post.title}
            imageUrl={post.image_url}
            category={category}
            author={author}
            createdAt={post.created_at}
            canonicalUrl={`${BASE}/post/${id}`}
          >
            <div className="space-y-6">
              {items.length === 1 && (
                <KalbelaPostImage
                  src={items[0].url}
                  alt={items[0].caption || post.title}
                  className="aspect-video max-h-[540px] w-full"
                  caption={items[0].caption || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'}
                  credit={items[0].credit}
                />
              )}

              {items.length > 1 && (
                <figure className="overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)]">
                  <RichGallery
                    items={items}
                    layout={layout}
                    postTitle={post.title}
                    postDate={post.created_at}
                    compact
                  />
                  <figcaption className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                    ছবি : {items[0].caption || 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি'}
                    {items[0].credit ? ` · ${items[0].credit}` : ''}
                  </figcaption>
                </figure>
              )}

              {post.video_url && (
                <div className="overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-black">
                  <video src={post.video_url} controls playsInline className="mx-auto max-h-[75vh] w-full object-contain" />
                </div>
              )}

              {bodyParagraphs.length > 0 && (
                <div className="space-y-4">
                  {bodyParagraphs.map((paragraph, index) => (
                    <div key={`paragraph-${index}`}>
                      <FormattedText
                        text={paragraph}
                        className="article-body-content text-[var(--theme-text-body)] leading-[1.85]"
                      />
                      {insertAfter > 0 && index + 1 === insertAfter && (
                        <>
                          <AdSlot slot="post_middle" prefetchedAds={adBanners} />
                          {inlineRelated && (
                            <Link
                              href={`/post/${inlineRelated.id}`}
                              className="mt-5 flex items-center gap-3 overflow-hidden border-l-4 border-[#c8102e] bg-slate-50 p-2.5 transition hover:bg-slate-100"
                            >
                              <KalbelaPostImage
                                src={inlineRelated.image_url}
                                alt={inlineRelated.title}
                                className="h-20 w-28 shrink-0 rounded-lg"
                              />
                              <span className="min-w-0 py-1">
                                <span className="mb-1 block text-xs font-semibold text-[var(--theme-brand)]">আরও পড়ুন</span>
                                <span className="line-clamp-2 block font-serif text-sm font-bold leading-snug text-[var(--theme-text-title)] sm:text-base">
                                  {inlineRelated.title}
                                </span>
                                {inlineRelated.category && (
                                  <span className="mt-1 block truncate text-xs text-[var(--theme-text-body)]">
                                    {inlineRelated.category}
                                  </span>
                                )}
                              </span>
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {post.embed_media_url && (
                <div className="overflow-hidden rounded-xl">
                  <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                </div>
              )}

              {safeExternalLink && (
                <a
                  href={safeExternalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--theme-card-border)] bg-[var(--theme-brand-soft)] px-4 py-2.5 text-sm font-bold text-[var(--theme-brand)] transition hover:bg-[var(--theme-brand)] hover:text-white"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  <span>সংযুক্ত মূল সূত্র / ওয়েবসাইট দেখুন</span>
                </a>
              )}

              <AdSlot slot="post_bottom" prefetchedAds={adBanners} />
            </div>
          </ArticleReaderControls>

          <footer className="space-y-5 border-t border-[var(--theme-card-border)] pt-5">
            <p className="text-sm font-semibold text-[var(--theme-text-body)]">
              প্রতিবেদক: {author} · মাভাবিপ্রবি রিপোর্টার্স ইউনিটি
            </p>

            <Link
              href="/contact"
              className="article-contact-cta flex w-full items-center justify-center rounded-xl bg-[var(--theme-brand)] px-4 py-3 text-center text-sm font-bold transition hover:brightness-110 sm:text-base"
            >
              MBSTU Reporters&apos; Unity-এর সাথে যুক্ত থাকুন →
            </Link>

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" aria-label="সংবাদের ট্যাগ">
                <Tag className="size-4 text-[var(--theme-brand)]" aria-hidden="true" />
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag.replace(/^#/, ''))}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </Link>
                ))}
              </div>
            )}

            <div className="article-engagement rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4">
              <ReactionBar postId={id} title={post.title} />
            </div>
            <div className="article-engagement rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-4">
              <CommentForm postId={id} initialComments={comments} />
            </div>
          </footer>
        </article>

        {remainingRelated.length > 0 && (
          <section aria-labelledby="related-posts-title" className="mx-auto mt-8 max-w-5xl px-4 sm:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="related-posts-title" className="font-serif text-xl font-bold text-[var(--theme-text-title)] sm:text-2xl">
                এ সম্পর্কিত আরও খবর
              </h2>
              <Link
                href={`/category/${encodeURIComponent(category)}`}
                className="text-sm font-bold text-[var(--theme-brand)] hover:underline"
              >
                এই বিভাগের সব খবর →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
              {remainingRelated.map((related) => (
                <Link
                  key={related.id}
                  href={`/post/${related.id}`}
                  className="overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] transition hover:border-[var(--theme-brand)]"
                >
                  <KalbelaPostImage
                    src={related.image_url}
                    alt={related.title}
                    className="aspect-[16/10] w-full"
                  />
                  <span className="block p-3">
                    {related.category && (
                      <span className="mb-1 block truncate text-xs font-semibold text-[var(--theme-brand)]">
                        {related.category}
                      </span>
                    )}
                    <span className="line-clamp-3 block font-serif text-sm font-bold leading-snug text-[var(--theme-text-title)] sm:text-base">
                      {related.title}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
