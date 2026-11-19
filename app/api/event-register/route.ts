import { NextResponse } from 'next/server'
import { SB_URL, SB_KEY } from '@/lib/sb'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`ev:${getClientIp(req)}`, 5, 15 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `অতিরিক্ত চেষ্টা করা হয়েছে। অনুগ্রহ করে ${rl.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const event_id = typeof body.event_id === 'string' ? body.event_id.trim() : ''
    const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const department = typeof body.department === 'string' ? body.department.trim() : ''
    const batch = typeof body.batch === 'string' ? body.batch.trim() : ''
    const student_id = typeof body.student_id === 'string' ? body.student_id.trim() : ''
    const phone =
      typeof body.phone === 'string' ? body.phone.replace(/[\s-]/g, '').trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!event_id || full_name.length < 2 || !department || !batch || !student_id) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে নাম, বিভাগ, ব্যাচ ও স্টুডেন্ট আইডি সঠিকভাবে পূরণ করুন' },
        { status: 400 }
      )
    }

    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' },
        { status: 400 }
      )
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'সঠিক ইমেইল ঠিকানা লিখুন' },
        { status: 400 }
      )
    }

    const cleanEv = event_id.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().slice(0, 12) || 'EV'
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    const certificate_code = `CERT-${cleanEv}-${rand}`

    const res = await fetch(`${SB_URL}/rest/v1/event_registrations`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        event_id,
        full_name,
        department,
        batch,
        student_id,
        phone,
        email,
        certificate_code,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.message || 'রেজিস্ট্রেশন সংরক্ষণ করা যায়নি' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, code: certificate_code })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'সার্ভারে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
