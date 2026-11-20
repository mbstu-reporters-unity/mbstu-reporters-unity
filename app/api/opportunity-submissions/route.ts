import { NextResponse } from 'next/server'
import { validateAntiSpamPayload } from '@/lib/anti-spam'
import { getOpportunitiesList, type OpportunityItem } from '@/lib/alumni-opportunities'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { SB_KEY, SB_URL } from '@/lib/sb'

export const runtime = 'nodejs'

type SubmissionOpportunity = OpportunityItem & { online_submission?: boolean }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(`opportunity-submission:${getClientIp(req)}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `অতিরিক্ত চেষ্টা হয়েছে। ${rateLimit.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।` },
      { status: 429 }
    )
  }

  try {
    const body: unknown = await req.json().catch(() => null)
    const antiSpamError = validateAntiSpamPayload(body)
    if (antiSpamError) return NextResponse.json({ error: antiSpamError }, { status: 400 })
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'আবেদনের তথ্য সঠিক নয়।' }, { status: 400 })
    }

    const opportunityId = typeof body.opportunity_id === 'string' ? body.opportunity_id.trim() : ''
    const applicantName = typeof body.applicant_name === 'string' ? body.applicant_name.trim() : ''
    const applicantEmail =
      typeof body.applicant_email === 'string' ? body.applicant_email.trim().toLowerCase() : ''
    const department = typeof body.department === 'string' ? body.department.trim() : ''
    const batch = typeof body.batch === 'string' ? body.batch.trim() : ''
    const studentId = typeof body.student_id === 'string' ? body.student_id.trim() : ''
    const entryTitle = typeof body.entry_title === 'string' ? body.entry_title.trim() : ''
    const entryText = typeof body.entry_text === 'string' ? body.entry_text.trim() : ''
    const workUrl = typeof body.work_url === 'string' ? body.work_url.trim() : ''

    if (
      !opportunityId ||
      applicantName.length < 2 ||
      applicantName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail) ||
      applicantEmail.length > 254 ||
      !department ||
      department.length > 120 ||
      !batch ||
      batch.length > 80 ||
      studentId.length > 80 ||
      entryTitle.length < 2 ||
      entryTitle.length > 180 ||
      entryText.length > 12000 ||
      (!entryText && !workUrl)
    ) {
      return NextResponse.json(
        { error: 'নাম, ইমেইল, বিভাগ, ব্যাচ, কাজের শিরোনাম এবং লেখা/কাজের লিংক ঠিকভাবে দিন।' },
        { status: 400 }
      )
    }
    if (workUrl && !/^https:\/\/\S+$/i.test(workUrl)) {
      return NextResponse.json(
        { error: 'কাজের লিংকটি https:// দিয়ে শুরু হতে হবে।' },
        { status: 400 }
      )
    }

    const opportunities: SubmissionOpportunity[] = await getOpportunitiesList(true)
    const opportunity = opportunities.find(
      (item) =>
        item.id === opportunityId &&
        item.type === 'contest' &&
        item.is_active !== false &&
        item.online_submission === true
    )
    if (!opportunity) {
      return NextResponse.json({ error: 'এই প্রতিযোগিতার জমা এখন গ্রহণ করা হচ্ছে না।' }, { status: 404 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/opportunity_submissions`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        department,
        batch,
        student_id: studentId || null,
        entry_title: entryTitle,
        entry_text: entryText || null,
        work_url: workUrl || null,
        status: 'submitted',
      }),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: 'জমাটি সংরক্ষণ করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
      { status: 500 }
    )
  }
}
