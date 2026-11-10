import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  CalendarDays,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Share2,
} from 'lucide-react'
import { getPageBySlug, getPagePosts } from '@/lib/pages'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { UniversalMediaEmbed } from '@/components/portal/universal-media-embed'
import { ReactionBar } from '@/components/portal/reaction-bar'
import { CommentForm } from '@/components/portal/comment-form'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return { title: 'পেজ পাওয়া যায়নি' }

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
  if (!page) notFound()

  const posts = await getPagePosts(page.id)
  const siteUrl = 'https://mbsturu.vercel.app'
  const pageUrl = `${siteUrl}/p/${page.slug}`

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen bg-slate-100/70 pb-20">
        
        {/* ==================== ফেসবুক স্টাইল হেডার (কভার + প্রোফাইল) ==================== */}
        <div className="bg-white border-b border-border shadow-xs">
          <div className="max-w-5xl mx-auto">
            
            {/* ১. কভার ফটো */}
            <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 sm:rounded-b-2xl">
              {page.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.cover_url}
                  alt={page.name}
                  loading="lazy"
                  className="size-full object-cover select-none"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-white/30 font-serif text-2xl font-bold">
                  {page.name}
                </div>
              )}
            </div>

            {/* ২. প্রোফাইল লোগো, নাম ও ভেরিফাইড ব্যাজ */}
            <div className="px-4 sm:px-8 pb-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20">
                
                {/* প্রোফাইল লোগো */}
                <div className="relative size-28 sm:size-36 rounded-full bg-white ring-4 ring-white shadow-xl overflow-hidden shrink-0 z-10 flex items-center justify-center">
                  {page.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.avatar_url}
                      alt={page.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-brand text-white flex items-center justify-center text-4xl font-bold">
                      {page.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* পেজের নাম ও বিবরণ */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy truncate">
                      {page.name}
                    </h1>
                    {page.is_verified && (
                      <span className="text-blue-600 inline-flex items-center" title="অফিসিয়াল ভেরিফাইড পেজ">
                        <CheckCircle2 className="size-5 fill-blue-600 text-white" />
                      </span>
                    )}
                  </div>
                  {page.name_en && (
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">{page.name_en}</p>
                  )}
                  {page.category && (
                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {page.category}
                    </span>
                  )}
                </div>

                {/* পেজ শেয়ার বাটন */}
                <div className="shrink-0 pt-2 sm:pt-0">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${page.name}: ${pageUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold shadow transition active:scale-95"
                  >
                    <Share2 className="size-3.5" />
                    <span>পেজ শেয়ার করুন</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ==================== পেজ কন্টেন্ট: পরিচিতি ও টাইমলাইন ==================== */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* বাম পাশ: About / পেজের পরিচিতি ও যোগাযোগ বক্স */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-border space-y-4">
              <h2 className="font-bold text-base text-navy border-b pb-2 flex items-center gap-2">
                <span>📌 পেজের বিবরণ (About)</span>
              </h2>

              {page.bio ? (
                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {page.bio}
                </p>
              ) : (
                <p className="text-xs text-gray-400">কোনো বিবরণ দেওয়া হয়নি।</p>
              )}

              {/* যোগাযোগের তথ্য */}
              <div className="space-y-2.5 pt-2 border-t text-xs text-gray-600">
                {page.location && (
                  <p className="flex items-start gap-2">
                    <MapPin className="size-4 text-brand shrink-0 mt-0.5" />
                    <span>{page.location}</span>
                  </p>
                )}
                {page.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-brand shrink-0" />
                    <a href={`tel:${page.phone}`} className="text-navy font-semibold hover:underline">
                      {page.phone}
                    </a>
                  </p>
                )}
                {page.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-4 text-brand shrink-0" />
                    <a href={`mailto:${page.email}`} className="text-navy font-semibold hover:underline truncate">
                      {page.email}
                    </a>
                  </p>
                )}
                {page.website_url && (
                  <p className="flex items-center gap-2">
                    <Globe className="size-4 text-brand shrink-0" />
                    <a href={page.website_url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline truncate">
                      ওয়েবসাইট ভিজিট করুন
                    </a>
                  </p>
                )}
                {page.fb_url && (
                  <p className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">f</span>
                    <a href={page.fb_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline truncate">
                      ফেসবুক প্রোফাইল / গ্রুপ
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* ডান পাশ: ফেসবুকের মতো পেজের পোস্ট টাইমলাইন (Feed) */}
            <div className="md:col-span-2 space-y-5">
              
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-navy flex items-center gap-2">
                  <Newspaper className="size-5 text-brand" />
                  <span>পেজের টাইমলাইন ও পোস্টসমূহ ({posts.length})</span>
                </h2>
              </div>

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-border space-y-3.5"
                >
                  {/* পোস্ট হেডার: পেজের লোগো, নাম ও তারিখ */}
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full overflow-hidden bg-slate-100 border shrink-0">
                      {page.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={page.avatar_url} loading="lazy" alt="" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                          {page.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-navy flex items-center gap-1">
                        <span>{page.name}</span>
                        {page.is_verified && <CheckCircle2 className="size-3.5 fill-blue-600 text-white" />}
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <CalendarDays className="size-3 text-gold" />
                        <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                      </p>
                    </div>
                  </div>

                  {/* পোস্টের শিরোনাম ও লেখা */}
                  <h3 className="font-serif text-lg font-bold text-navy leading-snug">
                    {post.title}
                  </h3>

                  {post.body && (
                    <p className="whitespace-pre-line text-sm text-slate-800 leading-relaxed">
                      {post.body}
                    </p>
                  )}

                  {/* মিডিয়া (ছবি বা ভিডিও) */}
                  {post.embed_media_url && (
                    <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                  )}

                  {post.image_url && !post.embed_media_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full max-h-96 object-cover rounded-2xl border"
                    />
                  )}

                  {/* লাইক-রিঅ্যাকশন বার */}
                  <ReactionBar postId={post.id} title={post.title} />

                  {/* কমেন্ট ও রিপ্লাই থ্রেড */}
                  <div className="pt-2 border-t">
                    <CommentForm postId={post.id} />
                  </div>
                </article>
              ))}

              {posts.length === 0 && (
                <div className="bg-white rounded-3xl p-10 text-center border border-dashed space-y-2">
                  <Newspaper className="size-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-sm text-gray-600">এই পেজে এখনো কোনো পোস্ট দেওয়া হয়নি।</p>
                  <p className="text-xs text-gray-400">অ্যাডমিন প্যানেল থেকে এই পেজে নতুন পোস্ট দিলে তা এখানে লাইভ হয়ে যাবে।</p>
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
