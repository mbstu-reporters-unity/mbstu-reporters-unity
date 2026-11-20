import { NextResponse } from "next/server"
import { SB_URL, SB_KEY } from "@/lib/sb"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { validateAntiSpamPayload } from "@/lib/anti-spam"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`nl:${getClientIp(req)}`, 5, 15 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `অতিরিক্ত চেষ্টা করা হয়েছে। অনুগ্রহ করে ${rl.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const antiSpamError = validateAntiSpamPayload(body)
    if (antiSpamError) {
      return NextResponse.json({ error: antiSpamError }, { status: 400 })
    }
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const name = typeof body.name === "string" ? body.name.trim() : ""

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "সঠিক ইমেইল ঠিকানা লিখুন" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${SB_URL}/rest/v1/newsletter_subscribers?on_conflict=email`,
      {
        method: "POST",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({
          email,
          name: name || null,
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.message || "নিউজলেটার সাবস্ক্রাইব করা যায়নি" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
