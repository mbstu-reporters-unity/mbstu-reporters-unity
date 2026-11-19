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
      // RPC না থাকলে সাধারণ PATCH দিয়ে ফলব্যাক
      await fetch(`${SB_URL}/rest/v1/posts?id=eq.${encodeURIComponent(postId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ view_count: 1 }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
