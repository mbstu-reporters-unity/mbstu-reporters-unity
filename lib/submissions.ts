import { SB_URL, SB_KEY } from "./sb"

export type SubmissionType = "notice" | "news" | "info"

export type SubmissionMedia = {
  url: string
  type: "image" | "video"
  name?: string
}

export type UserSubmission = {
  id: string
  user_id: string
  sender_name: string
  sender_email: string | null
  sender_phone: string | null
  sender_type: string
  sender_dept: string | null
  sender_batch: string | null
  sender_student_id: string | null
  sender_designation: string | null
  sender_office_section: string | null
  submission_type: SubmissionType
  title: string | null
  subtitle: string | null
  details: string | null
  truth_pledge: string | null
  media_urls: SubmissionMedia[]
  email_sent: boolean
  email_error: string | null
  created_at: string
}

export const SUBMISSION_EMAIL_KEY = "submission_receiver_email"
export const SUBMISSION_WA_KEY = "submission_whatsapp_number"

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h["Content-Type"] = "application/json"
  return h
}

async function ok(res: Response): Promise<Response> {
  if (res.ok) return res
  let msg = `ত্রুটি (${res.status})`
  try {
    const j = await res.json()
    msg = j.message || j.msg || j.error_description || msg
  } catch {}
  throw new Error(msg)
}

export function normalizeWhatsappNumber(raw?: string | null): string {
  if (!raw) return ""
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("01") && digits.length === 11) {
    return "88" + digits
  }
  return digits
}

/* ---------- অ্যাডমিনের কাস্টম ইমেইল ও হোয়াটসঅ্যাপ নম্বর পড়া/সেভ করা ---------- */

export async function getSubmissionSettings(): Promise<{
  receiverEmail: string
  whatsappNumber: string
}> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(${SUBMISSION_EMAIL_KEY},${SUBMISSION_WA_KEY})`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return { receiverEmail: "", whatsappNumber: "" }
    const rows: { key: string; value: string }[] = await res.json()
    let receiverEmail = ""
    let whatsappNumber = ""
    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (r.key === SUBMISSION_EMAIL_KEY) receiverEmail = r.value || ""
        if (r.key === SUBMISSION_WA_KEY) whatsappNumber = r.value || ""
      }
    }
    return { receiverEmail, whatsappNumber }
  } catch {
    return { receiverEmail: "", whatsappNumber: "" }
  }
}

export async function saveSubmissionSettings(
  token: string,
  settings: { receiverEmail: string; whatsappNumber: string }
) {
  const rows = [
    { key: SUBMISSION_EMAIL_KEY, value: settings.receiverEmail.trim() },
    { key: SUBMISSION_WA_KEY, value: settings.whatsappNumber.trim() },
  ]
  await ok(
    await fetch(`${SB_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: {
        ...hdr(token, true),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    })
  )
}

/* ---------- শিক্ষার্থী/শিক্ষকদের পাঠানো নোটিশ, সংবাদ ও তথ্য সার্ভার API-তে পাঠানো ---------- */

export async function sendSubmissionToAdmin(
  token: string,
  payload: {
    submission_type: SubmissionType
    title?: string
    subtitle?: string
    details?: string
    truth_pledge?: string
    media_urls: SubmissionMedia[]
  }
): Promise<{
  ok: boolean
  id?: string
  emailSent: boolean
  emailError: string | null
  whatsappNumber: string
}> {
  const res = await fetch("/api/send-submission", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(j.error || `পাঠানো যায়নি (${res.status})`)
  }
  return j
}

/* ---------- অ্যাডমিন ইনবক্স: তালিকা দেখা এবং ফাইলসহ ডিলিট করা ---------- */

export async function getAdminSubmissions(token: string): Promise<UserSubmission[]> {
  const res = await ok(
    await fetch(
      `${SB_URL}/rest/v1/user_submissions?select=*&order=created_at.desc&limit=200`,
      { headers: hdr(token), cache: "no-store" }
    )
  )
  return await res.json()
}

export async function deleteStorageFileByUrl(token: string, publicUrl: string): Promise<void> {
  const marker = "/storage/v1/object/public/post-images/"
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const objectPath = publicUrl.slice(idx + marker.length).split("?")[0]
  if (!objectPath) return

  await fetch(`${SB_URL}/storage/v1/object/post-images/${objectPath}`, {
    method: "DELETE",
    headers: hdr(token),
  }).catch(() => {})
}

export async function deleteAdminSubmission(token: string, item: UserSubmission): Promise<void> {
  if (Array.isArray(item.media_urls)) {
    for (const m of item.media_urls) {
      if (m?.url) {
        await deleteStorageFileByUrl(token, m.url)
      }
    }
  }
  await ok(
    await fetch(`${SB_URL}/rest/v1/user_submissions?id=eq.${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
