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

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`apply:${getClientIp(req)}`, 3, 15 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `অতিরিক্ত আবেদন চেষ্টা করা হয়েছে। অনুগ্রহ করে ${rl.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const full_name = typeof body.full_name === "string" ? body.full_name.trim() : ""
    const department = typeof body.department === "string" ? body.department.trim() : ""
    const batch = typeof body.batch === "string" ? body.batch.trim() : ""
    const student_id = typeof body.student_id === "string" ? body.student_id.trim() : ""
    const phone = typeof body.phone === "string" ? body.phone.replace(/[\s-]/g, "").trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const current_media =
      typeof body.current_media === "string" ? body.current_media.trim() : ""
    const sample_writing =
      typeof body.sample_writing === "string" ? body.sample_writing.trim() : ""
    const interests = Array.isArray(body.interests)
      ? body.interests.filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
      : []

    const rawPhoto =
      typeof body.photo_data_url === "string" ? body.photo_data_url.trim() : ""

    if (full_name.length < 2 || !department || !batch || !student_id) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে নাম, বিভাগ, ব্যাচ এবং স্টুডেন্ট আইডি পূরণ করুন" },
        { status: 400 }
      )
    }

    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)" },
        { status: 400 }
      )
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "সঠিক ইমেইল ঠিকানা লিখুন" },
        { status: 400 }
      )
    }

    if (interests.length === 0) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে কমপক্ষে একটি আগ্রহের ক্ষেত্র নির্বাচন করুন" },
        { status: 400 }
      )
    }

    if (sample_writing.length < 20) {
      return NextResponse.json(
        { error: "কেন যুক্ত হতে চান বা আপনার নমুনা লেখা কমপক্ষে ২০ অক্ষরের হতে হবে" },
        { status: 400 }
      )
    }

    let safePhotoUrl: string | null = null
    let photoBuffer: Buffer | null = null
    let photoExt = "jpg"

    if (rawPhoto) {
      const dataMatch = rawPhoto.match(
        /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/i
      )
      if (dataMatch && rawPhoto.length <= 500_000) {
        photoExt = dataMatch[1].toLowerCase() === "jpeg" ? "jpg" : dataMatch[1].toLowerCase()
        photoBuffer = Buffer.from(dataMatch[2], "base64")
        safePhotoUrl = rawPhoto
      } else if (/^https?:\/\//i.test(rawPhoto)) {
        safePhotoUrl = rawPhoto
      }
    }

    // ১. ডাটাবেজে সংরক্ষণের চেষ্টা (membership_applications টেবিল থাকলে)
    let dbSaved = false
    try {
      const dbRes = await fetch(`${SB_URL}/rest/v1/membership_applications`, {
        method: "POST",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          full_name,
          department,
          batch,
          student_id,
          phone,
          email,
          current_media: current_media || null,
          interests,
          sample_writing,
          photo_url: safePhotoUrl,
          status: "pending",
        }),
      })
      if (dbRes.ok) dbSaved = true
    } catch {}

    // ২. অ্যাডমিনের রিসিভার ইমেইল খুঁজে বের করে ইমেইল পাঠানো
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
    let emailError: string | null = null

    if (gmailUser && gmailPass && targetEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        })

        const attachments: Array<{ filename: string; content: Buffer }> = []
        if (photoBuffer) {
          attachments.push({
            filename: `${student_id}-photo.${photoExt}`,
            content: photoBuffer,
          })
        }

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#fff;color:#1e293b;">
            <div style="background:#0f172a;color:#fff;padding:18px 22px;">
              <span style="background:#0284c7;color:#fff;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:999px;">
                নতুন সদস্যপদ আবেদন
              </span>
              <h2 style="margin:10px 0 0;font-size:18px;color:#fff;">
                ${escHtml(full_name)} (${escHtml(department)})
              </h2>
            </div>
            <div style="padding:20px 22px;font-size:13px;line-height:1.6;">
              <p><b>বিভাগ:</b> ${escHtml(department)}</p>
              <p><b>ব্যাচ / সেশন:</b> ${escHtml(batch)}</p>
              <p><b>স্টুডেন্ট আইডি / রোল:</b> ${escHtml(student_id)}</p>
              <p><b>মোবাইল:</b> ${escHtml(phone)}</p>
              <p><b>ইমেইল:</b> ${escHtml(email)}</p>
              ${current_media ? `<p><b>বর্তমান গণমাধ্যম / অভিজ্ঞতা:</b> ${escHtml(current_media)}</p>` : ""}
              <p><b>আগ্রহের ক্ষেত্র:</b> ${escHtml(interests.join(", "))}</p>
              <div style="margin-top:12px;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:0 10px 10px 0;">
                <p style="margin:0 0 4px;font-weight:bold;">আগ্রহের কারণ ও নমুনা লেখা:</p>
                <p style="margin:0;white-space:pre-line;">${escHtml(sample_writing)}</p>
              </div>
            </div>
          </div>
        `

        await transporter.sendMail({
          from: `"MBSTU Reporters' Unity" <${gmailUser}>`,
          to: targetEmail,
          replyTo: email,
          subject: `[সদস্যপদ আবেদন] ${full_name} — ${department} (${student_id})`,
          html,
          attachments,
        })
        emailSent = true
      } catch (err: any) {
        emailError = err?.message || "ইমেইল পাঠানো যায়নি"
      }
    }

    if (!dbSaved && !emailSent) {
      return NextResponse.json(
        {
          error:
            emailError ||
            "আবেদন সংরক্ষণ করা যায়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      dbSaved,
      emailSent,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
