import { SB_URL, SB_KEY } from "./sb"
import type { AntiSpamPayload } from "./anti-spam"

export interface CampusEvent {
  id: string
  title: string
  subtitle?: string | null
  description: string
  venue: string
  event_date: string
  event_time?: string | null
  organizer: string
  image_url?: string | null
  capacity?: number
  is_upcoming: boolean
  created_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  full_name: string
  department: string
  batch: string
  student_id: string
  phone: string
  email: string
  certificate_code?: string | null
  created_at: string
}

export const DEFAULT_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'ev-1',
    title: 'জাতীয় ক্যাম্পাস সাংবাদিকতা ও ফ্যাক্ট-চেকিং কর্মশালা ২০২৬',
    subtitle: 'প্রধান প্রশিক্ষক: জাতীয় দৈনিকের জ্যেষ্ঠ সাংবাদিকবৃন্দ',
    description: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির উদ্যোগে আয়োজিত দিনব্যাপী কর্মশালায় অংশগ্রহণ করে সাংবাদিকতার প্রাথমিক পাঠ, মোবাইল জার্নালিজম (MoJo) এবং ডিজিটাল যুগের ফেক নিউজ শনাক্তকরণের কৌশল শিখুন।',
    venue: 'কেন্দ্রীয় অডিটোরিয়াম, মাভাবিপ্রবি',
    event_date: '২৫ নভেম্বর ২০২৬',
    event_time: 'সকাল ১০:০০ টা - দুপুর ২:০০ টা',
    organizer: 'MBSTU Reporters Unity',
    capacity: 150,
    is_upcoming: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ev-2',
    title: 'বার্ষিক সাধারণ সভা ও কার্যনির্বাহী পরিষদ নির্বাচন ২০২৬',
    subtitle: 'সংগঠনের সকল সাধারণ ও আজীবন সদস্যদের উপস্থিতি বাধ্যতামূলক',
    description: '২০২৬-২৭ সেশনের নতুন কার্যনির্বাহী পরিষদ নির্বাচন এবং বিগত বছরের আর্থিক ও বার্ষিক প্রতিবেদন পেশ।',
    venue: 'স্টুডেন্ট ওয়েলফেয়ার কনফারেন্স রুম',
    event_date: '১০ ডিসেম্বর ২০২৬',
    event_time: 'বিকেল ৩:০০ টা',
    organizer: 'নির্বাচন কমিশন ও কার্যনির্বাহী পরিষদ',
    capacity: 100,
    is_upcoming: true,
    created_at: new Date().toISOString(),
  },
]

const EVENTS_CONFIG_KEY = 'campus_events_registry_v1'
const REGISTRATIONS_CONFIG_KEY = 'campus_event_registrations_v1'

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h['Content-Type'] = 'application/json'
  return h
}

export async function getCampusEvents(): Promise<CampusEvent[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${EVENTS_CONFIG_KEY}`,
      { headers: hdr(), cache: 'no-store' }
    )
    if (!res.ok) return DEFAULT_CAMPUS_EVENTS
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CAMPUS_EVENTS
    }
    return DEFAULT_CAMPUS_EVENTS
  } catch {
    return DEFAULT_CAMPUS_EVENTS
  }
}

export async function saveCampusEvents(token: string, items: CampusEvent[]): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: 'POST',
    headers: {
      ...hdr(token, true),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      key: EVENTS_CONFIG_KEY,
      value: JSON.stringify(items),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'ইভেন্ট সংরক্ষণ করা যায়নি')
  }
}

export async function getEventRegistrations(token?: string): Promise<EventRegistration[]> {
  const list: EventRegistration[] = []

  // ১. নতুন নিরাপদ টেবিল থেকে পড়া (অ্যাডমিন টোকেন থাকলে)
  if (token) {
    try {
      const tblRes = await fetch(
        `${SB_URL}/rest/v1/event_registrations?select=*&order=created_at.desc&limit=500`,
        { headers: hdr(token), cache: 'no-store' }
      )
      if (tblRes.ok) {
        const rows = await tblRes.json()
        if (Array.isArray(rows)) list.push(...rows)
      }
    } catch {}
  }

  // ২. পুরোনো app_config ব্যাকআপ থেকে মার্জ করা (যাতে আগের ডেটাও দেখা যায়)
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${REGISTRATIONS_CONFIG_KEY}`,
      { headers: hdr(token), cache: 'no-store' }
    )
    if (res.ok) {
      const rows = await res.json()
      if (Array.isArray(rows) && rows[0]?.value) {
        const parsed = JSON.parse(rows[0].value)
        if (Array.isArray(parsed)) list.push(...parsed)
      }
    }
  } catch {}

  return list
}

export async function registerForEvent(
  data: Omit<EventRegistration, 'id' | 'created_at' | 'certificate_code'> & AntiSpamPayload
): Promise<{ code: string }> {
  const res = await fetch('/api/event-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(j.error || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি')
  }
  return { code: j.code }
}
