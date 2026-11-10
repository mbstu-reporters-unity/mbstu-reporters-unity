import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  Globe,
  Newspaper,
  Share2,
  Users,
  Video,
  Award
} from 'lucide-react'
import { getClubById, getClubNewsPosts, safeExternalUrl } from '@/lib/clubs'
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
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const club = await getClubById(id)
  if (!club) return { title: 'ক্লাব পাওয়া যায়নি' }

  return {
    title: `${club.name} | MBSTU`,
    description: club.activity || `${club.name}-এর অফিসিয়াল পেজ ও টাইমলাইন।`,
    openGraph: {
      title: club.name,
      images: club.logo_url ? [club.logo_url] : undefined,
    },
  }
}

export default async function DedicatedClubPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const club = await getClubById(id)
  if (!club) notFound()

  // এই ক্লাবের সব নিউজ ও পোস্ট লোড করা
  const posts = await getClubNewsPosts(club.id)
  const siteUrl = 'https://mbsturu.vercel.app'
  const clubPageUrl = `${siteUrl}/club/${club.id}`

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen bg-slate-100/70 pb-20">
        
        {/* ==================== হেডার (কভার + প্রোফাইল) ==================== */}
        <div className="bg-white border-b border-border shadow-xs">
          <div className="max-w-5xl mx-auto">
            
            {/* কভার ফটো / গ্রেডিয়েন্ট */}
            <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 sm:rounded-b-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.2),rgba(255,255,255,0))]" />
              <h1 className="text-white/20 font-serif text-3xl sm:text-5xl font-bold px-4 text-center select-none">
                {club.name}
              </h1>
            </div>

            {/* প্রোফাইল লোগো, নাম ও ট্যাগ */}
            <div className="px-4 sm:px-8 pb-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20">
                
                <div className="relative size-28 sm:size-36 rounded-full bg-white ring-4 ring-white shadow-xl overflow-hidden shrink-0 z-10 flex items-center justify-center">
                  {club.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={club.logo_url} alt={club.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-5xl font-bold">
                      {club.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy truncate">
                    {club.nameBn || club.name}
                  </h1>
                  {club.nameBn && (
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">{club.name}</p>
                  )}
                  <span className="inline-block mt-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {club.tag}
                  </span>
                </div>

                {/* সোশ্যাল লিংক বাটন */}
                <div className="shrink-0 flex gap-2 pt-2 sm:pt-0">
                  {club.fb_url && (
                    <a href={safeExternalUrl(club.fb_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow transition">
                      Facebook
                    </a>
                  )}
                  {club.yt_url && (
                    <a href={safeExternalUrl(club.yt_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold shadow transition">
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== পেজ কন্টেন্ট: পরিচিতি ও টাইমলাইন ==================== */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* বাম পাশ: About / পেজের পরিচিতি, কমিটি ও ওয়েবসাইট */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-border space-y-4">
                <h2 className="font-bold text-base text-navy border-b pb-2 flex items-center gap-2">
                  <span>📌 পরিচিতি ও কার্যক্রম</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {club.activityBn || club.activity || "কোনো বিবরণ দেওয়া হয়নি।"}
                </p>
                {club.web_url && (
                  <div className="pt-2 border-t">
                    <a href={safeExternalUrl(club.web_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-700 font-bold hover:underline text-xs">
                      <Globe className="size-4" /> ওয়েবসাইট ভিজিট করুন
                    </a>
                  </div>
                )}
              </div>

              {/* কার্যনির্বাহী কমিটি */}
              {club.committee_members && club.committee_members.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-border space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="font-bold text-sm text-navy flex items-center gap-2">
                      <Users className="size-4 text-brand" /> কমিটি
                    </h2>
                    {club.committee_term && (
                      <span className="text-[10px] bg-brand-soft text-brand px-2 py-0.5 rounded-full font-bold">
                        {club.committee_term}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {club.committee_members.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        {m.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photo_url} alt="" className="size-10 rounded-full object-cover border" />
                        ) : (
                          <div className="size-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                            {m.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-navy truncate">{m.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ডান পাশ: টাইমলাইন (নিউজ, ভিডিও, পোস্ট) */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-navy flex items-center gap-2">
                  <Newspaper className="size-5 text-brand" />
                  <span>টাইমলাইন ও সংবাদসমূহ ({posts.length})</span>
                </h2>
              </div>

              {posts.map((post: any) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-border space-y-3.5"
                >
                  {/* পোস্ট হেডার */}
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full overflow-hidden bg-slate-100 border shrink-0">
                      {club.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={club.logo_url} loading="lazy" alt="" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                          {club.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-navy flex items-center gap-1">
                        <span>{club.nameBn || club.name}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded-full font-bold">Official</span>
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <CalendarDays className="size-3 text-gold" />
                        <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                        {post.author && <span>· {post.author}</span>}
                      </p>
                    </div>
                  </div>

                  {/* পোস্টের শিরোনাম */}
                  <h3 className="font-serif text-lg font-bold text-navy leading-snug">
                    <a href={`/post/${post.id}`} className="hover:text-brand transition-colors">
                      {post.title}
                    </a>
                  </h3>

                  {/* মিডিয়া (ইউটিউব/ফেসবুক এম্বেড) */}
                  {post.embed_media_url && (
                    <UniversalMediaEmbed url={post.embed_media_url} title={post.title} />
                  )}

                  {/* শুধু ছবি থাকলে */}
                  {post.image_url && !post.embed_media_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full max-h-96 object-cover rounded-2xl border"
                    />
                  )}

                  {/* লাইক-রিঅ্যাকশন বার ও কমেন্ট */}
                  <ReactionBar postId={post.id} title={post.title} />
                  <div className="pt-2 border-t">
                    <CommentForm postId={post.id} />
                  </div>
                </article>
              ))}

              {posts.length === 0 && (
                <div className="bg-white rounded-3xl p-10 text-center border border-dashed space-y-2">
                  <Video className="size-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-sm text-gray-600">এই ক্লাবের কোনো কার্যক্রম বা সংবাদ এখনো দেওয়া হয়নি।</p>
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
