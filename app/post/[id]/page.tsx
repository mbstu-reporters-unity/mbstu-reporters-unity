import { notFound } from 'next/navigation'
import { getPost, getApprovedComments } from '@/lib/sb'
import { CommentForm } from '@/components/portal/comment-form'

export const dynamic = 'force-dynamic'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()
  const comments = await getApprovedComments(id)

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <article className="mx-auto max-w-2xl space-y-4">
        <a href="/" className="text-sm underline">← হোম</a>
        <p className="text-xs font-bold text-green-700">{post.category}</p>
        <h1 className="font-serif text-2xl font-bold">{post.title}</h1>
        {post.heading && <p className="text-lg text-gray-600">{post.heading}</p>}
        <p className="text-xs text-gray-500">
          {post.author} · {new Date(post.created_at).toLocaleDateString('bn-BD')}
        </p>
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="w-full rounded-xl" />
        )}
        {post.video_url && (
          <video src={post.video_url} controls playsInline className="w-full rounded-xl bg-black" />
        )}
        <p className="whitespace-pre-line leading-relaxed">{post.body}</p>

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
