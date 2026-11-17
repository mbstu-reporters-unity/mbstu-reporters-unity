import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Play,
  Share2,
  User,
} from 'lucide-react'
import { getPageBySlug, getPagePosts, getPageFollowStats } from '@/lib/pages'
import { getImagesMetaForMany, getLayoutsForMany } from '@/lib/sb'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { UniversalMediaEmbed } from '@/components/portal/universal-media-embed'
import { ReactionBar } from '@/components/portal/reaction-bar'
import RichGallery from '@/components/portal/rich-gallery'
import { FormattedText } from '@/components/portal/formatted-text'
import { PostMetaBadges } from '@/components/portal/post-meta-badges'
import { BackNavigation } from '@/components/portal/back-navigation'
import { PageFollowButton } from '@/components/portal/page-follow-button'

export const revalidate = 60

function safeHttpUrl(u?: string | null): string | null {
  if (!u) return null
  const t = u.trim()
  return /^https?:\/\//i.test(t) ? t : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page || page.is_active === false) return { title: 'পেজ পাওয়া যায়নি' }

  return {
    title: `${page.name} | MBSTU`,
    description: page.bio || `${page.name}-এর অফিসিয়াল পেজ ও টাইমলাইন।`,
    openGraph: {
      title: page.name,
      description: page.bio || undefined,
      images: page.cover_url ? [page.cover_url] : page.avatar_url ? [page.avatar_url] : undefined,
    },
  }
}

export default async function PublicCommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page || page.is_active === false) notFound()

  const [posts, followStats] = await Promise.all([
    getPagePosts(page.id),
    getPageFollowStats(page.id),
  ])
  const postIds = posts.map((p) => p.id)

  const [imagesMap, layoutsMap] = await Promise.all([
    getImagesMetaForMany('post', postIds),
    getLayoutsForMany('post', postIds),
  ])

  const siteUrl = 'https://mbsturu.vercel.app'
  const pageUrl = `${siteUrl}/p/${page.slug}`

  const safeWebsiteUrl = safeHttpUrl(page.website_url)
  const safeFbUrl = safeHttpUrl(page.fb_url)
  const safeYtUrl = safeHttpUrl(page.yt_url)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen pb-20">

        <div className="bg-white/[0.06] border-b border-white/15 backdrop-blur-xl shadow-lg">
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
            <BackNavigation
              items={[
                { label: 'কমিউনিটি পেজসমূহ', href: '/#community-pages' },
                { label: page.name },
              ]}
            />
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 sm:rounded-b-3xl border-x border-b border-white/15">
              {page.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.cover_url}
                  alt={page.name}
                  loading="lazy"
                  className="size-full object-cover select-none"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-white/30 font-serif text-2xl font-bold px-4 text-center">
                  {page.name}
                </div>
              )}
            </div>

            <div className="px-4 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20">

                <div className="relative size-28 sm:size-36 rounded-full bg-slate-900 ring-4 ring-cyan-400/80 shadow-2xl overflow-hidden shrink-0 z-10 flex items-center justify-center">
                  {page.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.avatar_url}
                      alt={page.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                      {page.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                      {page.name}
                    </h1>
                    {page.is_verified && (
                      <span className="inline-flex items-center shrink-0" title="অফিসিয়াল ভেরিফাইড পেজ">
                        <CheckCircle2 className="size-5 fill-blue-500 text-white" />
                      </span>
                    )}
                  </div>
                  {page.name_en && (
                    <p className="text-xs sm:text-sm text-cyan-200/90 font-medium">{page.name_en}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs">
                    {page.category && (
                      <span className="bg-white/15 text-cyan-200 text-[11px] font-bold px-3 py-0.5 rounded-full border border-white/25">
                        {page.category}
                      </span>
                    )}
                    <span className="text-slate-300 font-semibold">
                      {posts.length.toLocaleString('bn-BD')}টি পোস্ট
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <PageFollowButton pageId={page.id} initialCount={followStats.count} />

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${page.name}: ${pageUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 px-3.5 py-2 text-xs font-bold shadow-lg transition active:scale-95"
                  >
                    <Share2 className="size-3.5" />
                    <span>শেয়ার</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            <div className="glass-card p-5 space-y-4 text-white">
              <h2 className="font-bold text-base text-white border-b border-white/15 pb-2">
                📌 পেজের বিবরণ (About)
              </h2>

              {page.bio ? (
                <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {page.bio}
                </p>
              ) : (
                <p className="text-xs text-white/50">কোনো বিবরণ দেওয়া হয়নি।</p>
              )}

              <div className="space-y-2.5 pt-2 border-t border-white/15 text-xs text-slate-200">
                {page.creator_id && (
                  <p className="flex items-center gap-2">
                    <User className="size-4 text-cyan-400 shrink-0" />
                    <Link href={`/u/${page.creator_id}`} className="text-cyan-300 font-bold hover:underline">
                      পেজ পরিচালকের প্রোফাইল দেখুন
                    </Link>
                  </p>
                )}
                {page.location && (
                  <p className="flex items-start gap-2">
                    <MapPin className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{page.location}</span>
                  </p>
                )}
                {page.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-cyan-400 shrink-0" />
                    <a href={`tel:${page.phone}`} className="text-white font-semibold hover:text-cyan-300 hover:underline">
                      {page.phone}
                    </a>
                  </p>
                )}
                {page.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-4 text-cyan-400 shrink-0" />
                    <a href={`mailto:${page.email}`} className="text-white font-semibold hover:text-cyan-300 hover:underline truncate">
                      {page.email}
                    </a>
                  </p>
                )}
                {safeWebsiteUrl && (
                  <p className="flex items-center gap-2">
                    <Globe className="size-4 text-cyan-400 shrink-0" />
                    <a href={safeWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-bold hover:underline truncate">
                      ওয়েবসাইট ভিজিট করুন
                    </a>
                  </p>
                )}
                {safeFbUrl && (
                  <p className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">f</span>
                    <a href={safeFbUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-bold hover:underline truncate">
                      ফেসবুক প্রোফাইল / পেজ
                    </a>
                  </p>
                )}
                {safeYtUrl && (
                  <p className="flex items-center gap-2">
                    <Play className="size-4 text-rose-400 shrink-0" />
                    <a href={safeYtUrl} target="_blank" rel="noopener noreferrer" className="text-rose-300 font-bold hover:underline truncate">
                      ইউটিউব চ্যানেল
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-5">

              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-white flex items-center gap-2 drop-shadow">
                  <Newspaper className="size-5 text-cyan-400" />
                  <span>পেজের টাইমলাইন ও পোস্টসমূহ ({posts.length})</span>
                </h2>
              </div>

              {posts.map((post) => {
                const rows = imagesMap[post.id] || []
                const galleryItems =
                  rows.length > 0
                    ? rows.map((i) => ({
                        url: i.url,
                        caption: i.caption,
                        credit: i.credit,
                        date: i.created_at || post.created_at,
                      }))
                    : post.image_url
                      ? [{ url: post.image_url, date: post.created_at }]
                      : []
                const galleryLayout = layoutsMap[post.id] || 'grid'
                const safePostLinkUrl = safeHttpUrl(post.link_url)

                return (
                  <article
                    key={post.id}
                    className="glass-card p-5 sm:p-6 space-y-3.5 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full overflow-hidden bg-slate-900 border border-white/25 shrink-0">
                        {page.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={page.avatar_url} loading="lazy" alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                            {page.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white flex items-center gap-1">
                          <span className="truncate">{page.name}</span>
                          {page.is_verified && <CheckCircle2 className="size-3.5 fill-blue-500 text-white shrink-0" />}
                        </p>
                        <p className="text-[11px] text-cyan-200/80 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3 text-cyan-300" />
                            <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                          </span>
                          {post.author && (
                            <span className="inline-flex items-center gap-1 text-white/85">
                              <span>·</span>
                              {post.author_avatar && post.show_author_avatar !== false && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={post.author_avatar}
                                  alt=""
                                  className="size-4 rounded-full object-cover object-top"
                                />
                              )}
                              <span>{post.author}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <PostMetaBadges data={post} />

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                      <Link href={`/post/${post.id}`} className="hover:text-cyan-300 transition-colors">
                        {post.title}
                      </Link>
                    </h3>

                    {post.heading && post.heading.trim() !== post.title.trim() && (
                      <p className="text-xs sm:text-sm font-medium text-cyan-100/90 border-l-2 border-cyan-400/70 pl-2.5">
                        {post.heading}
                      </p>
                    )}

                    {post.body && (
                      <FormattedText
                        text={post.body}
                        className="text-sm text-slate-100 leading-relaxed"
                      />
                    )}

                    <RichGallery
                      items={galleryItems}
                      layout={galleryLayout}
                      postTitle={post.title}
                      postDate={post.created_at}
                    />

                    {post.video_url && (
                      <video
                        src={post.video_url}
                        controls
                        playsInline
                        className="w-full rounded-2xl bg-black border border-white/20 shadow-lg"
                      />
                    )}

                    {post.embed_media_url && (
                      <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                    )}

                    {safePostLinkUrl && (
                      <a
                        href={safePostLinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>সংযুক্ত লিংক দেখুন</span>
                      </a>
                    )}

                    <ReactionBar postId={post.id} title={post.title} inlineComments />
                  </article>
                )
              })}

              {posts.length === 0 && (
                <div className="glass-card p-10 text-center space-y-2 text-white">
                  <Newspaper className="size-10 text-white/40 mx-auto" />
                  <p className="font-bold text-sm text-white">এই পেজে এখনো কোনো পোস্ট দেওয়া হয়নি।</p>
                  <p className="text-xs text-slate-300">পেজের ড্যাশবোর্ড থেকে নতুন পোস্ট দিলে তা এখানে লাইভ হয়ে যাবে।</p>
                </div>
              )}

            </div>

          </div>
        </div>

      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
