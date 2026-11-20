import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Film } from 'lucide-react'
import { getPost } from '@/lib/sb'
import { BackNavigation } from '@/components/portal/back-navigation'

export const dynamic = 'force-dynamic'

function extractVideoInfo(rawUrl?: string | null): { isVideo: boolean; url: string; platform: 'youtube' | 'facebook' | 'direct'; ytId?: string } | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const str = rawUrl.trim()
  if (!str) return null

  if (str.startsWith('[') || str.startsWith('{')) {
    try {
      const parsed = JSON.parse(str)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of arr) {
        const res = extractVideoInfo(item.url)
        if (res && res.isVideo) return res
      }
    } catch {}
    return null
  }

  const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/|shorts\/))([^?&"'>]+)/i)
  if (ytMatch && ytMatch[1]?.length === 11) {
    return { isVideo: true, url: str, platform: 'youtube', ytId: ytMatch[1] }
  }

  if (str.includes('facebook.com') || str.includes('fb.watch')) {
    return { isVideo: true, url: str, platform: 'facebook' }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(str)) {
    return { isVideo: true, url: str, platform: 'direct' }
  }

  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  return {
    title: post ? `${post.title} | Reels` : 'ভিডিও প্লেয়ার',
  }
}

export default async function ReelPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  const detected = extractVideoInfo(post.video_url) || extractVideoInfo(post.embed_media_url)
  const videoUrl = detected?.url || post.video_url || ''

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-rose-500">
      
      {/* ১. টপ ব্যাক বার: স্মার্ট ব্যাক নেভিগেশন */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <BackNavigation
          items={[
            { label: 'রিলস', href: '/reels' },
            { label: post.title },
          ]}
          showHome={false}
          showForward
        />

        <span className="text-xs font-bold bg-red-600/90 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow">
          <Film className="size-3.5" /> Reels
        </span>
      </header>

      {/* ২. প্লেয়ার ফ্রেম */}
      <div className="relative w-full flex-1 flex items-center justify-center bg-black my-auto">
        {detected?.platform === 'youtube' && detected.ytId ? (
          <div className="w-full aspect-video max-h-[80vh] flex items-center justify-center">
            <iframe
              src={`https://www.youtube.com/embed/${detected.ytId}?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1`}
              className="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : detected?.platform === 'facebook' ? (
          <div className="w-full aspect-video max-h-[80vh] flex items-center justify-center">
            <iframe
              src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&autoplay=true`}
              className="size-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[80vh] object-contain mx-auto"
          />
        )}
      </div>

      {/* ৩. নিচের তথ্য ও মূল সংবাদের লিংক */}
      <footer className="p-4 sm:p-6 bg-gradient-to-t from-black via-slate-950 to-transparent space-y-3 z-10 border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-2.5">
          <h1 className="font-serif text-base sm:text-xl font-bold text-white leading-snug drop-shadow-md">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            <div className="flex items-center gap-2">
              {post.author_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author_avatar} alt="" className="size-7 rounded-full object-cover border border-cyan-400" />
              ) : (
                <div className="size-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                  {(post.author || 'ক').charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-xs text-white">{post.author || 'ক্যাম্পাস সাংবাদিক'}</p>
                <p className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleDateString('bn-BD')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/post/${post.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                <span>মূল সংবাদ ও মন্তব্য</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}
