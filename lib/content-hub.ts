import { SB_URL, SB_KEY } from "./sb"

/* =========================================================
   ১. ক্যাম্পাসের ঘটনাবলির টাইমলাইন (Campus Timeline)
   ========================================================= */

export const TIMELINE_CATEGORIES = [
  "আন্দোলন ও দাবি",
  "একাডেমিক ও গবেষণা",
  "অবকাঠামো ও উন্নয়ন",
  "প্রশাসনিক সিদ্ধান্ত",
  "অর্জন ও উৎসব",
  "অন্যান্য",
] as const

export type TimelineStatus = "চলমান" | "সম্পন্ন" | "মাইলফলক"

export interface TimelineItem {
  id: string
  date_label: string
  year: string
  category: string
  title: string
  summary: string
  image_url?: string | null
  post_url?: string | null
  status?: TimelineStatus | null
  is_highlight?: boolean
  created_at: string
}

export const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: "tl-1",
    date_label: "অক্টোবর ২০২৬",
    year: "২০২৬",
    category: "অবকাঠামো ও উন্নয়ন",
    title: "নতুন ১০-তলা একাডেমিক ভবন ও মিডিয়া সেন্টারের কাজ শুরু",
    summary:
      "শিক্ষার্থীদের আধুনিক শ্রেণিকক্ষ, স্মার্ট ল্যাব ও একটি নিবেদিত মিডিয়া সেন্টারের জন্য বিশ্ববিদ্যালয়ে দশতলা একাডেমিক ভবনের নির্মাণকাজ আনুষ্ঠানিকভাবে শুরু হয়েছে।",
    status: "চলমান",
    is_highlight: true,
    created_at: "2026-10-28T10:00:00Z",
  },
  {
    id: "tl-2",
    date_label: "অক্টোবর ২০২৬",
    year: "২০২৬",
    category: "একাডেমিক ও গবেষণা",
    title: "কেন্দ্রীয় গ্রন্থাগারে ৫ হাজার নতুন বই যুক্ত ও সময়সীমা বৃদ্ধি",
    summary:
      "শিক্ষার্থীদের দীর্ঘদিনের দাবির প্রেক্ষিতে কেন্দ্রীয় গ্রন্থাগার রাত ১০টা পর্যন্ত খোলা রাখার সিদ্ধান্ত নেওয়া হয়েছে এবং আন্তর্জাতিক ই-জার্নাল অ্যাক্সেস যুক্ত হয়েছে।",
    status: "সম্পন্ন",
    is_highlight: false,
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "tl-3",
    date_label: "অক্টোবর ২০২৬",
    year: "২০২৬",
    category: "অর্জন ও উৎসব",
    title: "বায়োটেকনোলজি গবেষকদের লবণাক্ততা সহনশীল ধান উদ্ভাবন",
    summary:
      "মাভাবিপ্রবির বিজিই বিভাগের গবেষক দল আন্তর্জাতিক জার্নালে লবণাক্ততা সহনশীল ধানের জাত নিয়ে যুগান্তকারী গবেষণাপত্র প্রকাশ করেছে।",
    status: "মাইলফলক",
    is_highlight: true,
    created_at: "2026-10-15T10:00:00Z",
  },
  {
    id: "tl-4",
    date_label: "জানুয়ারি ২০২৬",
    year: "২০২৬",
    category: "প্রশাসনিক সিদ্ধান্ত",
    title: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির আনুষ্ঠানিক যাত্রা ও ডিজিটাল পোর্টাল",
    summary:
      "ক্যাম্পাসে দায়িত্বশীল ও বস্তুনিষ্ঠ সাংবাদিকতার প্রাতিষ্ঠানিক চর্চা গড়ে তুলতে মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যক্রম শুরু হয়।",
    status: "মাইলফলক",
    is_highlight: true,
    created_at: "2026-01-10T10:00:00Z",
  },
]

/* =========================================================
   ২. ফ্যাক্ট-চেক বিভাগ (Fact-Check Engine)
   ========================================================= */

export type FactVerdict = "true" | "false" | "misleading" | "unverified"

export interface FactCheckItem {
  id: string
  claim: string
  claim_source?: string | null
  verdict: FactVerdict
  title: string
  explanation: string
  evidence_url?: string | null
  image_url?: string | null
  checker_name?: string | null
  checked_date: string
  created_at: string
}

export const DEFAULT_FACT_CHECKS: FactCheckItem[] = [
  {
    id: "fc-1",
    claim: "আগামীকাল থেকে অনির্দিষ্টকালের জন্য বিশ্ববিদ্যালয়ের সকল পরীক্ষা স্থগিত ঘোষণা করা হয়েছে",
    claim_source: "সামাজিক যোগাযোগমাধ্যম ও অজ্ঞাত স্ক্রিনশট",
    verdict: "false",
    title: "পরীক্ষা স্থগিতের ভাইরাল নোটিশটি ভুয়া ও সম্পাদিত",
    explanation:
      "বিশ্ববিদ্যালয়ের পরীক্ষা নিয়ন্ত্রক দপ্তর ও রেজিস্ট্রার অফিসের সাথে সরাসরি যোগাযোগ করে নিশ্চিত হওয়া গেছে যে এ ধরনের কোনো বিজ্ঞপ্তি প্রকাশিত হয়নি। পূর্বনির্ধারিত সময়সূচি অনুযায়ীই পরীক্ষা অনুষ্ঠিত হবে।",
    checker_name: "ফ্যাক্ট-চেক ডেস্ক, MBSTURU",
    checked_date: "২৫ অক্টোবর ২০২৬",
    created_at: "2026-10-25T10:00:00Z",
  },
  {
    id: "fc-2",
    claim: "ক্যাম্পাস বাসের নতুন রুট সম্পূর্ণভাবে বন্ধ করে দেওয়া হচ্ছে",
    claim_source: "ক্যাম্পাসভিত্তিক ফেসবুক গ্রুপ",
    verdict: "misleading",
    title: "বাস রুট বন্ধ নয়, বরং সংস্কারকাজের জন্য সাময়িক সময়সূচি সমন্বয় করা হয়েছে",
    explanation:
      "পরিবহন দপ্তরের তথ্যমতে, কোনো বাস রুট স্থায়ীভাবে বন্ধ করা হয়নি। শুধুমাত্র দুটি রুটের সকালবেলার ট্রিপ ১০ মিনিট এগিয়ে আনা হয়েছে।",
    checker_name: "ফ্যাক্ট-চেক ডেস্ক, MBSTURU",
    checked_date: "১৮ অক্টোবর ২০২৬",
    created_at: "2026-10-18T10:00:00Z",
  },
  {
    id: "fc-3",
    claim: "কেন্দ্রীয় গ্রন্থাগার এখন থেকে রাত ১০টা পর্যন্ত শিক্ষার্থীদের জন্য খোলা থাকবে",
    claim_source: "বিশ্ববিদ্যালয় গ্রন্থাগার বিজ্ঞপ্তি",
    verdict: "true",
    title: "তথ্যটি সত্য: কেন্দ্রীয় গ্রন্থাগারের সময়সীমা রাত ১০টা পর্যন্ত বর্ধিত হয়েছে",
    explanation:
      "বিশ্ববিদ্যালয় প্রশাসনের আনুষ্ঠানিক বিজ্ঞপ্তি অনুযায়ী শিক্ষার্থীদের পড়াশোনার সুবিধার্থে কেন্দ্রীয় গ্রন্থাগার রাত ১০টা পর্যন্ত খোলা রাখার সিদ্ধান্ত কার্যকর হয়েছে।",
    checker_name: "ফ্যাক্ট-চেক ডেস্ক, MBSTURU",
    checked_date: "১২ অক্টোবর ২০২৬",
    created_at: "2026-10-12T10:00:00Z",
  },
]

/* =========================================================
   ৩. প্রকাশনা আর্কাইভ (Publications & Magazines)
   ========================================================= */

export const PUBLICATION_TYPES = [
  "ম্যাগাজিন",
  "বুলেটিন",
  "জার্নাল",
  "ই-বুক",
  "বার্ষিক প্রতিবেদন",
  "স্মরণিকা",
] as const

export interface PublicationItem {
  id: string
  pub_type: string
  title: string
  issue_label?: string | null
  description?: string | null
  cover_url?: string | null
  pdf_url: string
  published_date: string
  pages_count?: string | null
  editor_name?: string | null
  created_at: string
}

export const DEFAULT_PUBLICATIONS: PublicationItem[] = [
  {
    id: "pub-1",
    pub_type: "ম্যাগাজিন",
    title: "সন্তোষের কলম — ক্যাম্পাস সাংবাদিকতা স্মরণিকা",
    issue_label: "বর্ষ ১, সংখ্যা ১ • ২০২৬",
    description:
      "মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের ইতিহাস, শিক্ষার্থীদের সৃজনশীল প্রবন্ধ, অনুসন্ধানী প্রতিবেদন ও ক্যাম্পাস আলোকচিত্রের সংকলন।",
    pdf_url: "",
    published_date: "অক্টোবর ২০২৬",
    pages_count: "৪৮ পৃষ্ঠা",
    editor_name: "সম্পাদনা পর্ষদ, MBSTURU",
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "pub-2",
    pub_type: "বুলেটিন",
    title: "MBSTURU মাসিক ক্যাম্পাস নিউজ বুলেটিন",
    issue_label: "সংখ্যা ০৩ • ২০২৬",
    description:
      "বিশ্ববিদ্যালয়ের মাসব্যাপী সকল একাডেমিক, গবেষণা, ক্রীড়া ও সাংস্কৃতিক খবরের সংক্ষিপ্ত ডিজিটাল সংকলন।",
    pdf_url: "",
    published_date: "নভেম্বর ২০২৬",
    pages_count: "১৬ পৃষ্ঠা",
    editor_name: "প্রচার ও প্রকাশনা সেল",
    created_at: "2026-11-01T10:00:00Z",
  },
]

/* =========================================================
   Supabase app_config রিড/রাইট হেল্পার
   ========================================================= */

export const KEY_TIMELINE = "campus_timeline_events_v1"
export const KEY_FACT_CHECKS = "fact_check_reports_v1"
export const KEY_PUBLICATIONS = "publications_archive_v1"

async function readConfigList<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${encodeURIComponent(key)}`,
      { headers: { apikey: SB_KEY }, cache: "no-store" }
    )
    if (!res.ok) return fallback
    const rows: { value?: string }[] = await res.json()
    if (!rows || rows.length === 0 || rows[0]?.value === undefined) {
      return fallback
    }
    const parsed = JSON.parse(rows[0].value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

async function saveConfigList<T>(token: string, key: string, items: T[]): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key, value: JSON.stringify(items) }),
  })
  if (!res.ok) {
    let msg = `ত্রুটি (${res.status})`
    try {
      const j = await res.json()
      msg = j.message || j.msg || msg
    } catch {}
    throw new Error(msg)
  }
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
  return readConfigList<TimelineItem>(KEY_TIMELINE, DEFAULT_TIMELINE_ITEMS)
}

export async function saveTimelineItems(token: string, items: TimelineItem[]): Promise<void> {
  return saveConfigList<TimelineItem>(token, KEY_TIMELINE, items)
}

export async function getFactCheckItems(): Promise<FactCheckItem[]> {
  return readConfigList<FactCheckItem>(KEY_FACT_CHECKS, DEFAULT_FACT_CHECKS)
}

export async function saveFactCheckItems(token: string, items: FactCheckItem[]): Promise<void> {
  return saveConfigList<FactCheckItem>(token, KEY_FACT_CHECKS, items)
}

export async function getPublicationItems(): Promise<PublicationItem[]> {
  return readConfigList<PublicationItem>(KEY_PUBLICATIONS, DEFAULT_PUBLICATIONS)
}

export async function savePublicationItems(token: string, items: PublicationItem[]): Promise<void> {
  return saveConfigList<PublicationItem>(token, KEY_PUBLICATIONS, items)
}
