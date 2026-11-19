import { NextResponse } from 'next/server'
import { SB_URL, SB_KEY } from '@/lib/sb'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { postId } = await req.json().catch(() => ({}))
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/rpc/increment_post_view`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post_id: postId }),
    })

    if (!res.ok) {
      // RPC না থাকলে বর্তমান view_count পড়ে +1 করে আপডেট করা
      const getRes = await fetch(
        `${SB_URL}/rest/v1/posts?select=view_count&id=eq.${encodeURIComponent(postId)}&limit=1`,
        {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
          cache: 'no-store',
        }
      ).catch(() => null)

      let nextCount = 1
      if (getRes && getRes.ok) {
        const rows: Array<{ view_count?: number | null }> = await getRes.json().catch(() => [])
        nextCount = (Number(rows[0]?.view_count) || 0) + 1
      }

      await fetch(`${SB_URL}/rest/v1/posts?id=eq.${encodeURIComponent(postId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ view_count: nextCount }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
