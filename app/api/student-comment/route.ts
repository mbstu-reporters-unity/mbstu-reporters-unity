import { NextResponse } from 'next/server'
import { SB_KEY, SB_URL } from '@/lib/sb'
import { validateAntiSpamPayload } from '@/lib/anti-spam'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`student-comment:${getClientIp(req)}`, 8, 15 * 60 * 1000)
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

    const studentId =
      'student_id' in body && typeof body.student_id === 'string' ? body.student_id.trim() : ''
    const name = 'name' in body && typeof body.name === 'string' ? body.name.trim() : ''
    const message =
      'message' in body && typeof body.message === 'string' ? body.message.trim() : ''

    if (!studentId || studentId.length > 100 || message.length < 2 || message.length > 1000) {
      return NextResponse.json({ error: '২–১০০০ অক্ষরের সঠিক মন্তব্য লিখুন' }, { status: 400 })
    }
    if (name.length > 60) {
      return NextResponse.json({ error: 'নাম ৬০ অক্ষরের মধ্যে লিখুন' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/student_comments`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        student_id: studentId,
        name: name || null,
        message,
      }),
    })

    if (!res.ok) {
      const error: unknown = await res.json().catch(() => null)
      const message =
        typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'মন্তব্য পাঠানো যায়নি'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন' }, { status: 500 })
  }
}
