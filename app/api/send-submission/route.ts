import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { SB_URL, SB_KEY, type Profile } from "@/lib/sb"
import {
  SUBMISSION_EMAIL_KEY,
  SUBMISSION_WA_KEY,
  type SubmissionMedia,
  type SubmissionType,
} from "@/lib/submissions"

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

const TYPE_LABELS: Record<SubmissionType, string> = {
  notice: "নোটিশ",
  news: "সংবাদ",
  info: "যেকোনো তথ্য",
}

const USER_TYPE_LABELS: Record<string, string> = {
  student: "শিক্ষার্থী",
  teacher: "শিক্ষক",
  staff: "কর্মকর্তা",
  reporter: "সাংবাদিক",
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "").trim()
    if (!token) {
      return NextResponse.json({ error: "অনুমতি নেই, আবার লগইন করুন" }, { status: 401 })
    }

    // ১. ইউজার যাচাই
    const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!userRes.ok) {
      return NextResponse.json({ error: "সেশন শেষ হয়েছে, আবার লগইন করুন" }, { status: 401 })
    }
    const authUser = await userRes.json()
    if (!authUser?.id) {
      return NextResponse.json({ error: "ব্যবহারকারী পাওয়া যায়নি" }, { status: 401 })
    }

    // ২. প্রোফাইল তথ্য আনা
    const profRes = await fetch(
      `${SB_URL}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(authUser.id)}&limit=1`,
      {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    )
    const profiles: Profile[] = profRes.ok ? await profRes.json() : []
    const profile = profiles[0]
    if (!profile || !profile.approved) {
      return NextResponse.json({ error: "আপনার একাউন্ট অনুমোদিত নয়" }, { status: 403 })
    }

    // ৩. ইনপুট পড়া ও যাচাই
    const body = await req.json().catch(() => ({}))
    const subType = body.submission_type as SubmissionType
    if (subType !== "notice" && subType !== "news" && subType !== "info") {
      return NextResponse.json({ error: "সঠিক ধরন নির্বাচন করুন" }, { status: 400 })
    }

    const title = typeof body.title === "string" ? body.title.trim() : ""
    const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : ""
    const details = typeof body.details === "string" ? body.details.trim() : ""
    const truthPledge = typeof body.truth_pledge === "string" ? body.truth_pledge.trim() : ""
    const rawMedia = Array.isArray(body.media_urls) ? (body.media_urls as SubmissionMedia[]) : []
    const mediaList = rawMedia.filter(
      (m) => m && typeof m.url === "string" && /^https?:\/\//i.test(m.url)
    )

    if (subType === "info" && !truthPledge) {
      return NextResponse.json(
        { error: "তথ্যের সত্যতা ও দায়িত্ব / অঙ্গীকারনামা বক্সটি অবশ্যই পূরণ করতে হবে" },
        { status: 400 }
      )
    }

    if (!title && !subtitle && !details && mediaList.length === 0) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে কিছু লিখুন অথবা অন্তত একটি ছবি/ভিডিও যুক্ত করুন" },
        { status: 400 }
      )
    }

    // ৪. অ্যাডমিনের কাস্টম ইমেইল ও হোয়াটসঅ্যাপ নম্বর পড়া
    let receiverEmail = ""
    let whatsappNumber = ""
    try {
      const cfgRes = await fetch(
        `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(${SUBMISSION_EMAIL_KEY},${SUBMISSION_WA_KEY})`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` }, cache: "no-store" }
      )
      if (cfgRes.ok) {
        const cfgRows: { key: string; value: string }[] = await cfgRes.json()
        for (const r of cfgRows) {
          if (r.key === SUBMISSION_EMAIL_KEY) receiverEmail = (r.value || "").trim()
          if (r.key === SUBMISSION_WA_KEY) whatsappNumber = (r.value || "").trim()
        }
      }
    } catch {}

    const gmailUser = process.env.GMAIL_USER || ""
    const gmailPass = process.env.GMAIL_APP_PASSWORD || ""
    const targetEmail = receiverEmail || gmailUser

    const senderTypeBn = USER_TYPE_LABELS[profile.user_type || "student"] || "সদস্য"
    const subTypeBn = TYPE_LABELS[subType]
    const senderEmail = profile.email || authUser.email || ""

    const images = mediaList.filter((m) => m.type === "image")
    const videos = mediaList.filter((m) => m.type === "video")

    // ৫. ইমেইল পাঠানো (লেখা + ছবি)
    let emailSent = false
    let emailError: string | null = null

    if (!gmailUser || !gmailPass) {
      emailError = "Vercel-এ GMAIL_USER অথবা GMAIL_APP_PASSWORD সেট করা নেই"
    } else if (!targetEmail) {
      emailError = "অ্যাডমিন প্যানেলে রিসিভার ইমেইল সেট করা নেই"
    } else {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        })

        // সর্বোচ্চ ৬টি ছবি ইমেইল অ্যাটাচমেন্ট হিসেবে নিরাপদে যুক্ত করা (মোট <= ১৫ MB)
        const attachments: Array<{ filename: string; content: Buffer }> = []
        let totalBytes = 0
        for (let i = 0; i < Math.min(images.length, 6); i++) {
          try {
            const imgRes = await fetch(images[i].url, {
              signal: AbortSignal.timeout(8000),
            })
            if (!imgRes.ok) continue
            const arrBuf = await imgRes.arrayBuffer()
            if (arrBuf.byteLength > 5 * 1024 * 1024) continue
            if (totalBytes + arrBuf.byteLength > 15 * 1024 * 1024) break
            totalBytes += arrBuf.byteLength
            const extMatch = images[i].url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
            const ext = extMatch ? extMatch[1] : "jpg"
            attachments.push({
              filename: images[i].name || `photo-${i + 1}.${ext}`,
              content: Buffer.from(arrBuf),
            })
          } catch {}
        }

        const imagesHtml = images.length
          ? `<div style="margin-top:16px;">
              <p style="font-weight:bold;color:#0f172a;margin-bottom:8px;">📷 সংযুক্ত ছবিসমূহ (${images.length}টি):</p>
              ${images
                .map(
                  (img, idx) => `
                  <div style="margin-bottom:10px;">
                    <a href="${escHtml(img.url)}" target="_blank" style="color:#0284c7;font-size:13px;font-weight:bold;">ছবি #${idx + 1} ডাউনলোড/দেখুন</a><br/>
                    <img src="${escHtml(img.url)}" alt="Photo ${idx + 1}" style="max-width:100%;max-height:360px;border-radius:10px;margin-top:4px;border:1px solid #cbd5e1;" />
                  </div>`
                )
                .join("")}
            </div>`
          : ""

        const videosHtml = videos.length
          ? `<div style="margin-top:16px;padding:12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
              <p style="font-weight:bold;color:#9a3412;margin:0 0 6px;">🎥 সংযুক্ত ভিডিও লিংক (${videos.length}টি - ব্যাকআপ):</p>
              ${videos
                .map(
                  (v, idx) =>
                    `<p style="margin:4px 0;"><a href="${escHtml(v.url)}" target="_blank" style="color:#c2410c;font-weight:bold;">ভিডিও #${idx + 1} দেখুন/ডাউনলোড করুন</a></p>`
                )
                .join("")}
            </div>`
          : ""

        const htmlBody = `
          <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#ffffff;color:#1e293b;">
            <div style="background:#0f172a;color:#ffffff;padding:18px 22px;">
              <span style="display:inline-block;background:#0284c7;color:#ffffff;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:999px;">
                ${escHtml(subTypeBn)}
              </span>
              <h2 style="margin:10px 0 0;font-size:18px;color:#ffffff;">
                ${escHtml(title || `${profile.full_name} একটি ${subTypeBn} পাঠিয়েছেন`)}
              </h2>
            </div>

            <div style="padding:20px 22px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;">
                <p style="margin:0 0 6px;font-weight:bold;color:#0369a1;">👤 প্রেরকের পরিচয়:</p>
                <p style="margin:3px 0;"><b>নাম:</b> ${escHtml(profile.full_name)} (${escHtml(senderTypeBn)})</p>
                ${senderEmail ? `<p style="margin:3px 0;"><b>ইমেইল:</b> ${escHtml(senderEmail)}</p>` : ""}
                ${profile.phone ? `<p style="margin:3px 0;"><b>মোবাইল:</b> ${escHtml(profile.phone)}</p>` : ""}
                ${profile.department ? `<p style="margin:3px 0;"><b>বিভাগ:</b> ${escHtml(profile.department)}${profile.batch ? ` (ব্যাচ: ${escHtml(profile.batch)})` : ""}</p>` : ""}
                ${profile.student_id ? `<p style="margin:3px 0;"><b>স্টুডেন্ট আইডি:</b> ${escHtml(profile.student_id)}</p>` : ""}
                ${profile.designation ? `<p style="margin:3px 0;"><b>পদবি:</b> ${escHtml(profile.designation)}</p>` : ""}
                ${profile.office_section ? `<p style="margin:3px 0;"><b>দপ্তর/শাখা:</b> ${escHtml(profile.office_section)}</p>` : ""}
              </div>

              ${title ? `<h3 style="margin:0 0 6px;font-size:16px;color:#0f172a;">${escHtml(title)}</h3>` : ""}
              ${subtitle ? `<p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#475569;">${escHtml(subtitle)}</p>` : ""}
              ${
                details
                  ? `<div style="white-space:pre-line;font-size:14px;line-height:1.7;color:#1e293b;background:#ffffff;border-left:4px solid #0284c7;padding:8px 12px;margin-bottom:14px;">${escHtml(details)}</div>`
                  : ""
              }

              ${
                truthPledge
                  ? `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:12px;margin-top:12px;">
                      <p style="margin:0 0 4px;font-weight:bold;font-size:12px;color:#065f46;">✅ তথ্যের সত্যতা ও দায়িত্ব / অঙ্গীকারনামা:</p>
                      <p style="margin:0;white-space:pre-line;font-size:13px;color:#064e3b;">${escHtml(truthPledge)}</p>
                    </div>`
                  : ""
              }

              ${imagesHtml}
              ${videosHtml}
            </div>
          </div>
        `

        await transporter.sendMail({
          from: `"MBSTU Reporters' Unity" <${gmailUser}>`,
          to: targetEmail,
          replyTo: senderEmail || undefined,
          subject: `[MBSTURU ${subTypeBn}] ${title || profile.full_name}`,
          html: htmlBody,
          attachments,
        })

        emailSent = true
      } catch (err: any) {
        emailSent = false
        emailError = err?.message || "ইমেইল পাঠানো যায়নি"
      }
    }

    // ৬. ডাটাবেজে রেকর্ড সংরক্ষণ (যাতে অ্যাডমিন প্যানেলে দেখতে ও পরে ডিলিট করতে পারেন)
    const dbRes = await fetch(`${SB_URL}/rest/v1/user_submissions?select=id`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: authUser.id,
        sender_name: profile.full_name,
        sender_email: senderEmail || null,
        sender_phone: profile.phone || null,
        sender_type: profile.user_type || "student",
        sender_dept: profile.department || null,
        sender_batch: profile.batch || null,
        sender_student_id: profile.student_id || null,
        sender_designation: profile.designation || null,
        sender_office_section: profile.office_section || null,
        submission_type: subType,
        title: title || null,
        subtitle: subtitle || null,
        details: details || null,
        truth_pledge: truthPledge || null,
        media_urls: mediaList,
        email_sent: emailSent,
        email_error: emailError,
      }),
    })

    if (!dbRes.ok) {
      const dbErr = await dbRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: dbErr.message || "ডাটাবেজে সংরক্ষণ করা যায়নি" },
        { status: 500 }
      )
    }

    const inserted: { id: string }[] = await dbRes.json().catch(() => [])

    return NextResponse.json({
      ok: true,
      id: inserted[0]?.id || null,
      emailSent,
      emailError,
      whatsappNumber,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
