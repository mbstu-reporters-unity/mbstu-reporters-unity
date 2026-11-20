import { NextResponse } from 'next/server'
import { SB_KEY, SB_URL } from '@/lib/sb'
import { validateAntiSpamPayload } from '@/lib/anti-spam'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`comment:${getClientIp(req)}`, 8, 15 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `অনেকবার মন্তব্য পাঠানো হয়েছে। ${rl.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।` },
        { status: 429 }
      )
    }

    const body: unknown = await req.json().catch(() => ({}))
    const antiSpamError = validateAntiSpamPayload(body)
    if (antiSpamError) {
      return NextResponse.json({ error: antiSpamError }, { status: 400 })
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'মন্তব্যের তথ্য সঠিক নয়' }, { status: 400 })
    }

    const postId = 'post_id' in body && typeof body.post_id === 'string' ? body.post_id.trim() : ''
    const name = 'name' in body && typeof body.name === 'string' ? body.name.trim() : ''
    const message = 'message' in body && typeof body.message === 'string' ? body.message.trim() : ''
    const parentId =
      'parent_id' in body && typeof body.parent_id === 'string' ? body.parent_id.trim() : ''

    if (!UUID_PATTERN.test(postId) || message.length < 3 || message.length > 1000) {
      return NextResponse.json({ error: 'সঠিক সংবাদ নির্বাচন করে ৩–১০০০ অক্ষরের মন্তব্য লিখুন' }, { status: 400 })
    }
    if (name.length > 60 || (parentId && !UUID_PATTERN.test(parentId))) {
      return NextResponse.json({ error: 'নাম বা রিপ্লাইয়ের তথ্য সঠিক নয়' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/comments`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        post_id: postId,
        name: name || null,
        message,
        parent_id: parentId || null,
      }),
    })

    if (!res.ok) {
      const error: unknown = await res.json().catch(() => null)
      const message =
        typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'মন্তব্য জমা দেওয়া যায়নি'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন' }, { status: 500 })
  }
}
