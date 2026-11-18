import { SB_URL, SB_KEY } from "./sb"

export const RESOURCE_CATEGORIES = [
  "সাংবাদিকতার নীতিমালা",
  "রিপোর্টিং গাইডলাইন",
  "তথ্য অধিকার আইন (RTI)",
  "স্টাইল ম্যানুয়াল ও বানানরীতি",
  "ডাউনলোডযোগ্য টেমপ্লেট",
  "সাংবাদিকতার ফ্রি টুলস",
] as const

export interface ResourceItem {
  id: string
  category: string
  title: string
  description: string
  file_url?: string | null
  external_url?: string | null
  author_or_source?: string | null
  sort_order: number
  created_at: string
}

export const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: "res-1",
    category: "তথ্য অধিকার আইন (RTI)",
    title: "তথ্য অধিকার আইন ২০০৯ ও বিশ্ববিদ্যালয়ে তথ্য চাওয়ার ফরম্যাট",
    description:
      "বিশ্ববিদ্যালয়ের যেকোনো দপ্তরে তথ্য চেয়ে আবেদন করার অফিসিয়াল ফরম্যাট এবং তথ্য অধিকার আইন ২০০৯-এর ধারা ও সুনির্দিষ্ট নিয়মাবলির নির্দেশিকা।",
    external_url: "https://forms.gov.bd",
    sort_order: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-2",
    category: "সাংবাদিকতার নীতিমালা",
    title: "ক্যাম্পাস সাংবাদিকতার ১০টি মৌলিক নৈতিকতা ও নীতিমালা",
    description:
      "সংবাদের সত্যতা যাচাই, গোপনীয় সূত্রের সুরক্ষা, অপসাংবাদিকতা রোধ এবং পেশাদার সাংবাদিকদের জন্য প্রেস কাউন্সিলের অনুশাসন।",
    sort_order: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-3",
    category: "স্টাইল ম্যানুয়াল ও বানানরীতি",
    title: "সংবাদ লেখার স্টাইল ম্যানুয়াল ও বহুল ব্যবহৃত পদের বানান",
    description:
      "বাংলা বানান ও পরিভাষা ব্যবহারে প্রমিত রূপ (যেমন: উপাচার্য, রেজিস্টার, সিন্ডিকেট, ডিন, প্রক্টর ইত্যাদি) লেখার নিয়মাবলি।",
    sort_order: 30,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-4",
    category: "ডাউনলোডযোগ্য টেমপ্লেট",
    title: "প্রেস রিলিজ ও নিউজ রিপোর্টের আদর্শ টেমপ্লেট (Word/PDF)",
    description:
      "যেকোনো সংগঠনের সংবাদ বিজ্ঞপ্তি (Press Release) তৈরি বা নিজস্ব রিপোর্টের জন্য আদর্শ ফরম্যাট।",
    sort_order: 40,
    created_at: new Date().toISOString(),
  },
]

const RESOURCES_CONFIG_KEY = "site_resources_library_v1"

function hdr(token?: string, json = false): Record<string, string> {
  const h: Record<string, string> = { apikey: SB_KEY }
  h.Authorization = `Bearer ${token || SB_KEY}`
  if (json) h["Content-Type"] = "application/json"
  return h
}

export async function getResourcesList(): Promise<ResourceItem[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${RESOURCES_CONFIG_KEY}`,
      { headers: hdr(), cache: "no-store" }
    )
    if (!res.ok) return DEFAULT_RESOURCES
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RESOURCES
    }
    return DEFAULT_RESOURCES
  } catch {
    return DEFAULT_RESOURCES
  }
}

export async function saveResourcesList(token: string, items: ResourceItem[]): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: "POST",
    headers: {
      ...hdr(token, true),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      key: RESOURCES_CONFIG_KEY,
      value: JSON.stringify(items),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "রিসোর্স সংরক্ষণ করা যায়নি")
  }
}
