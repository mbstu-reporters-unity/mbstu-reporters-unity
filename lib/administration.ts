import { SB_URL, SB_KEY } from "./sb"

export type AdministrationOfficial = {
  id: string
  category: string
  office_name: string
  name: string
  designation: string
  photo_url: string | null
  bio: string | null
  email: string | null
  phone: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

// মাভাবিপ্রবির প্রশাসনিক কাঠামোর ডিফল্ট ক্যাটাগরি ও দপ্তর প্রিসেট
export const ADMIN_CATEGORIES = [
  "শীর্ষ প্রশাসন ও নীতি নির্ধারণী পদ",
  "প্রশাসনিক দপ্তরসমূহ",
  "বিশেষায়িত কেন্দ্র ও সেল",
  "একাডেমিক ও অন্যান্য প্রশাসন",
] as const

export const DEFAULT_OFFICES: Record<string, string[]> = {
  "শীর্ষ প্রশাসন ও নীতি নির্ধারণী পদ": [
    "চ্যান্সেলর দপ্তর (Office of the Chancellor)",
    "উপাচার্য দপ্তর (Office of the Vice-Chancellor)",
    "উপ-উপাচার্য দপ্তর (Office of the Pro Vice-Chancellor)",
    "কোষাধ্যক্ষ দপ্তর (Office of the Treasurer)",
    "রিজেন্ট বোর্ড (Regent Board)",
  ],
  "প্রশাসনিক দপ্তরসমূহ": [
    "রেজিস্ট্রার অফিস (Registrar Office)",
    "পরীক্ষা নিয়ন্ত্রকের দপ্তর (Controller of Examinations Office)",
    "প্রক্টর অফিস (Proctor Office)",
    "হিসাব দপ্তর (Accounts Office)",
    "পরিকল্পনা, উন্নয়ন ও ওয়ার্কস অফিস (Planning, Development and Works Office)",
    "ইঞ্জিনিয়ারিং অফিস (Engineering Office)",
    "এস্টেট অফিস (Estate Office)",
    "জনসংযোগ ও প্রেস প্রকাশনা দপ্তর (Public Relations and Press Publication Office)",
    "পরিবহন দপ্তর (Transport Office)",
  ],
  "বিশেষায়িত কেন্দ্র ও সেল": [
    "ছাত্র পরামর্শ ও নির্দেশনা কেন্দ্র (Student Welfare and Counseling Center)",
    "কেন্দ্রীয় লাইব্রেরি (Central Library)",
    "আবাসিক হল প্রভোস্ট কাউন্সিল (Hall Provost Council)",
    "আইসিটি সেল (ICT Cell)",
    "মেডিকেল সেন্টার (Medical Centre)",
    "আইকিউএসি (IQAC)",
    "বিএনসিসি ও রোভার স্কাউট (BNCC & Rover Scout)",
  ],
  "একাডেমিক ও অন্যান্য প্রশাসন": [
    "অনুষদীয় ডিন কাউন্সিল (Dean of Faculties)",
    "বিভাগীয় চেয়ারম্যানবৃন্দ (Chairman of the Departments)",
    "অন্যান্য দপ্তর ও শাখা",
  ],
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

export async function getAdministrationOfficials(): Promise<AdministrationOfficial[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/mbstu_administration?select=*&order=sort_order.asc,created_at.asc`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function createAdministrationOfficial(token: string, data: Partial<AdministrationOfficial>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/mbstu_administration`, {
      method: "POST",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateAdministrationOfficial(token: string, id: string, data: Partial<AdministrationOfficial>) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/mbstu_administration?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...hdr(token, true), Prefer: "return=minimal" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteAdministrationOfficial(token: string, id: string) {
  await ok(
    await fetch(`${SB_URL}/rest/v1/mbstu_administration?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: hdr(token),
    })
  )
}
