import { SB_URL, SB_KEY } from "./sb"

export type ApplicationStatus = "pending" | "shortlisted" | "approved" | "rejected"

export const INTEREST_AREAS = [
  "সংবাদ প্রতিবেদন (Reporting)",
  "ফিচার ও কলাম (Feature Writing)",
  "ফটোগ্রাফি (Photography)",
  "ভিডিও ও মোবাইল জার্নালিজম (MoJo)",
  "ফ্যাক্ট-চেকিং (Fact-Checking)",
  "গ্রাফিক্স ও ডিজাইন (Graphics)",
  "উপস্থাপনা ও পডকাস্ট (Anchoring)",
] as const

export const MEMBER_SKILLS = [
  "সংবাদ লেখা",
  "অনুসন্ধানী রিপোর্টিং",
  "ফিচার ও কলাম",
  "ফটোগ্রাফি",
  "ভিডিও এডিটিং",
  "মোবাইল জার্নালিজম",
  "ফ্যাক্ট-চেকিং",
  "গ্রাফিক্স ডিজাইন",
] as const

export interface MembershipApplication {
  id: string
  full_name: string
  department: string
  batch: string
  student_id: string
  phone: string
  email: string
  current_media: string | null
  interests: string[]
  sample_writing: string
  photo_url: string | null
  status: ApplicationStatus
  admin_note: string | null
  created_at: string
}

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

export async function getMembershipApplications(
  token: string
): Promise<MembershipApplication[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/membership_applications?select=*&order=created_at.desc&limit=200`,
      { headers: hdr(token), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function updateMembershipApplicationStatus(
  token: string,
  id: string,
  status: ApplicationStatus,
  admin_note?: string | null
) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/membership_applications?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { ...hdr(token, true), Prefer: "return=minimal" },
        body: JSON.stringify({
          status,
          ...(admin_note !== undefined ? { admin_note } : {}),
        }),
      }
    )
  )
}

export async function deleteMembershipApplication(token: string, id: string) {
  await ok(
    await fetch(
      `${SB_URL}/rest/v1/membership_applications?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: hdr(token),
      }
    )
  )
}
