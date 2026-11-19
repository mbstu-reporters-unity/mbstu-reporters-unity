import { SB_URL, SB_KEY } from "./sb"

export interface AlumniItem {
  id: string
  name: string
  dept: string
  batch: string
  currentPosition: string
  mediaHouse: string
  bio: string
  photo_url?: string | null
  fb_url?: string | null
  sort_order?: number
}

export interface OpportunityItem {
  id: string
  type: 'workshop' | 'internship' | 'fellowship' | 'contest'
  title: string
  organizer: string
  deadline: string
  description: string
  apply_url: string
  badgeText: string
  is_active: boolean
  sort_order?: number
}

const ALUMNI_KEY = 'campus_alumni_list_v1'
const OPP_KEY = 'campus_opportunities_list_v1'

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h["Content-Type"] = "application/json"
  return h
}

export async function getAlumniList(): Promise<AlumniItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${ALUMNI_KEY}`,
      { headers: hdr(), cache: 'no-store' }
    )
    if (!res.ok) return []
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]?.value) {
      return JSON.parse(rows[0].value)
    }
    return []
  } catch {
    return []
  }
}

export async function saveAlumniList(token: string, items: AlumniItem[]): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: 'POST',
    headers: { ...hdr(token, true), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: ALUMNI_KEY, value: JSON.stringify(items) }),
  })
  if (!res.ok) throw new Error('অ্যালামনাই সংরক্ষণ করা যায়নি')
}

export async function getOpportunitiesList(activeOnly = true): Promise<OpportunityItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${OPP_KEY}`,
      { headers: hdr(), cache: 'no-store' }
    )
    if (!res.ok) return []
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]?.value) {
      const list: OpportunityItem[] = JSON.parse(rows[0].value)
      return activeOnly ? list.filter((i) => i.is_active !== false) : list
    }
    return []
  } catch {
    return []
  }
}

export async function saveOpportunitiesList(token: string, items: OpportunityItem[]): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: 'POST',
    headers: { ...hdr(token, true), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: OPP_KEY, value: JSON.stringify(items) }),
  })
  if (!res.ok) throw new Error('সুযোগ তালিকা সংরক্ষণ করা যায়নি')
}
