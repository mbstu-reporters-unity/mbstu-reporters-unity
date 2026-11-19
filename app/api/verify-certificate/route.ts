import { NextResponse } from 'next/server'
import { SB_URL, SB_KEY } from '@/lib/sb'
import { getEventRegistrations } from '@/lib/events'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawCode = searchParams.get('code') || ''
    const cleanCode = rawCode.trim().toUpperCase()

    if (!cleanCode) {
      return NextResponse.json({ valid: false, message: 'কোড দেওয়া হয়নি' }, { status: 400 })
    }

    // ১. নিরাপদ RPC দিয়ে event_registrations টেবিল যাচাই
    const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/verify_event_certificate`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cert_code: cleanCode }),
      cache: 'no-store',
    }).catch(() => null)

    if (rpcRes && rpcRes.ok) {
      const rows: any[] = await rpcRes.json().catch(() => [])
      if (rows[0]) {
        return NextResponse.json({
          valid: true,
          full_name: rows[0].full_name,
          department: rows[0].department,
          batch: rows[0].batch,
          student_id: rows[0].student_id,
          event_id: rows[0].event_id,
          issued_at: rows[0].created_at,
        })
      }
    }

    // ২. পুরোনো app_config ডেটা থেকে ফলব্যাক যাচাই
    const registrations = await getEventRegistrations()
    const match = registrations.find(
      (r) => (r.certificate_code || '').trim().toUpperCase() === cleanCode
    )

    if (!match) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      full_name: match.full_name,
      department: match.department,
      batch: match.batch,
      student_id: match.student_id,
      event_id: match.event_id,
      issued_at: match.created_at,
    })
  } catch (e: any) {
    return NextResponse.json(
      { valid: false, error: e?.message || 'সার্ভার সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
