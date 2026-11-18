import { NextResponse } from 'next/server'
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
