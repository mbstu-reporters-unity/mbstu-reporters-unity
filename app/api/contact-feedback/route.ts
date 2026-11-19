import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { SB_URL, SB_KEY } from "@/lib/sb"
import { SUBMISSION_EMAIL_KEY } from "@/lib/submissions"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"

function escHtml(s?: string | null): string {
  if (!s) return ""
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const KIND_LABELS: Record<string, string> = {
  contact: "সাধারণ যোগাযোগ",
  student_feedback: "শিক্ষার্থীর অভিযোগ / মতামত",
  admin_feedback: "প্রশাসনের মতামত / বিজ্ঞপ্তি",
  correction: "সংবাদ সংশোধন অনুরোধ",
}

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`cf:${getClientIp(req)}`, 5, 10 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `অতিরিক্ত বার্তা পাঠানো হয়েছে। অনুগ্রহ করে ${rl.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const kind =
      typeof body.kind === "string" && body.kind in KIND_LABELS
        ? body.kind
        : "contact"
    const is_anonymous = Boolean(body.is_anonymous)
    const name = is_anonymous
      ? "গোপন (Anonymous)"
      : typeof body.name === "string"
        ? body.name.trim()
        : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const phone =
      typeof body.phone === "string" ? body.phone.replace(/[\s-]/g, "").trim() : ""
    const department_or_office =
      typeof body.department_or_office === "string"
        ? body.department_or_office.trim()
        : ""
    const subject = typeof body.subject === "string" ? body.subject.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const post_url = typeof body.post_url === "string" ? body.post_url.trim() : ""

    if (!is_anonymous && name.length < 2) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে আপনার নাম লিখুন" },
        { status: 400 }
      )
    }

    if (kind === "contact" && !email && !phone) {
      return NextResponse.json(
        { error: "যোগাযোগের জন্য অন্তত ইমেইল অথবা মোবাইল নম্বর দিন" },
        { status: 400 }
      )
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "সঠিক ইমেইল ঠিকানা দিন" },
        { status: 400 }
      )
    }

    if (subject.length < 3 || message.length < 10) {
      return NextResponse.json(
        { error: "বিষয় (কমপক্ষে ৩ অক্ষর) এবং বিস্তারিত বার্তা (কমপক্ষে ১০ অক্ষর) লিখুন" },
        { status: 400 }
      )
    }

    // ১. ডাটাবেজে সংরক্ষণ
    let dbSaved = false
    let dbError: string | null = null
    try {
      const dbRes = await fetch(`${SB_URL}/rest/v1/contact_feedback`, {
        method: "POST",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          kind,
          name: name || null,
          email: is_anonymous ? null : email || null,
          phone: is_anonymous ? null : phone || null,
          department_or_office: department_or_office || null,
          subject,
          message,
          post_url: post_url || null,
          is_anonymous,
          status: "pending",
        }),
      })
      if (dbRes.ok) {
        dbSaved = true
      } else {
        const err = await dbRes.json().catch(() => ({}))
        dbError = err.message || `ডাটাবেজ ত্রুটি (${dbRes.status})`
      }
    } catch (e: any) {
      dbError = e?.message || "ডাটাবেজে সেভ করা যায়নি"
    }

    // ২. অ্যাডমিনের রিসিভার ইমেইল পড়া ও ইমেইল পাঠানো
    let receiverEmail = ""
    try {
      const cfgRes = await fetch(
        `${SB_URL}/rest/v1/app_config?select=value&key=eq.${SUBMISSION_EMAIL_KEY}`,
        { headers: { apikey: SB_KEY }, cache: "no-store" }
      )
      if (cfgRes.ok) {
        const rows: { value?: string }[] = await cfgRes.json()
        receiverEmail = (rows?.[0]?.value || "").trim()
      }
    } catch {}

    const gmailUser = process.env.GMAIL_USER || ""
    const gmailPass = process.env.GMAIL_APP_PASSWORD || ""
    const targetEmail = receiverEmail || gmailUser

    let emailSent = false
    if (gmailUser && gmailPass && targetEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        })
        const kindBn = KIND_LABELS[kind] || "যোগাযোগ"
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#fff;color:#1e293b;">
            <div style="background:#0f172a;color:#fff;padding:16px 20px;">
              <span style="background:#0284c7;color:#fff;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:999px;">
                ${escHtml(kindBn)}
              </span>
              <h2 style="margin:10px 0 0;font-size:17px;color:#fff;">${escHtml(subject)}</h2>
            </div>
            <div style="padding:18px 20px;font-size:13px;line-height:1.6;">
              <p><b>প্রেরক:</b> ${escHtml(name || "নামহীন")}</p>
              ${!is_anonymous && email ? `<p><b>ইমেইল:</b> ${escHtml(email)}</p>` : ""}
              ${!is_anonymous && phone ? `<p><b>মোবাইল:</b> ${escHtml(phone)}</p>` : ""}
              ${department_or_office ? `<p><b>বিভাগ / দপ্তর:</b> ${escHtml(department_or_office)}</p>` : ""}
              ${post_url ? `<p><b>সংশ্লিষ্ট লিংক:</b> ${escHtml(post_url)}</p>` : ""}
              <div style="margin-top:12px;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:0 10px 10px 0;">
                <p style="margin:0;white-space:pre-line;">${escHtml(message)}</p>
              </div>
            </div>
          </div>
        `
        await transporter.sendMail({
          from: `"MBSTU Reporters' Unity" <${gmailUser}>`,
          to: targetEmail,
          replyTo: !is_anonymous && email ? email : undefined,
          subject: `[${kindBn}] ${subject}`,
          html,
        })
        emailSent = true
      } catch {}
    }

    if (!dbSaved && !emailSent) {
      return NextResponse.json(
        { error: dbError || "বার্তা পাঠানো যায়নি, অনুগ্রহ করে পরে আবার চেষ্টা করুন" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, dbSaved, emailSent })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
