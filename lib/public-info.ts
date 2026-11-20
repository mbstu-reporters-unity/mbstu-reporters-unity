import { SB_KEY, SB_URL } from './sb'

export const PUBLIC_INFO_KEY = 'public_info_safety_v1'

export type RecognitionStatus = 'unverified' | 'pending' | 'recognized'

export interface AnnualReportItem {
  id: string
  year: string
  titleBn: string
  titleEn: string
  summaryBn: string
  summaryEn: string
  url: string
}

export interface PublicInfo {
  recognition: {
    status: RecognitionStatus
    authorityBn: string
    authorityEn: string
    reference: string
    issueDate: string
    validThrough: string
    documentUrl: string
    noteBn: string
    noteEn: string
  }
  safety: {
    guideBn: string
    guideEn: string
    legalNoteBn: string
    legalNoteEn: string
    emergencyNumber: string
    supportEmail: string
    supportPhone: string
  }
  annualReports: AnnualReportItem[]
}

export const DEFAULT_PUBLIC_INFO: PublicInfo = {
  recognition: {
    status: 'unverified',
    authorityBn: '',
    authorityEn: '',
    reference: '',
    issueDate: '',
    validThrough: '',
    documentUrl: '',
    noteBn:
      'বর্তমান ওয়েবসাইটের উপকরণে বিশ্ববিদ্যালয় কর্তৃপক্ষের লিখিত স্বীকৃতি বা অনুমোদনের নথি পাওয়া যায়নি। তাই আনুষ্ঠানিক অনুমোদন বা বিশ্ববিদ্যালয়ের পক্ষ থেকে সমর্থনের দাবি করা হচ্ছে না। যাচাইযোগ্য নথি পাওয়া গেলে এই অংশ হালনাগাদ করা হবে।',
    noteEn:
      'The current website materials do not include written recognition or approval from the university authority. Therefore, no formal approval or university endorsement is claimed. This section will be updated when verifiable documentation is available.',
  },
  safety: {
    guideBn:
      'ঝুঁকিপূর্ণ প্রতিবেদন বা মাঠ-অ্যাসাইনমেন্টের আগে সম্পাদক/দায়িত্বশীল সহকর্মীর সঙ্গে পরিকল্পনা ভাগ করুন, নির্ধারিত সময়ে যোগাযোগের ব্যবস্থা রাখুন এবং প্রয়োজনীয় নিরাপত্তা সরঞ্জাম সঙ্গে নিন। ঝুঁকি বাড়লে নিরাপদ স্থানে সরে যান। অনলাইন হুমকি বা হয়রানির ক্ষেত্রে প্রাসঙ্গিক লিংক, সময় ও বার্তার কপি নিরাপদে সংরক্ষণ করুন এবং প্রকাশের আগে নিজের বা সূত্রের পরিচয়/ব্যক্তিগত তথ্য প্রকাশ হয়ে যাচ্ছে কি না যাচাই করুন।',
    guideEn:
      'Before a high-risk story or field assignment, share a plan with an editor or responsible colleague, agree on check-ins, and carry appropriate safety equipment. If risk escalates, move to safety. For online threats or harassment, securely preserve relevant links, timestamps, and message copies, and check that publication will not expose your or a source’s identity or personal information.',
    legalNoteBn:
      'এই নির্দেশিকা সাধারণ তথ্য, আইনি পরামর্শ নয়। নির্দিষ্ট আইনি সহায়তার জন্য যোগ্য আইনজীবী বা সংশ্লিষ্ট কর্তৃপক্ষের পরামর্শ নিন। সংগঠন আইনি প্রতিনিধিত্ব বা সহায়তার নিশ্চয়তা দিচ্ছে না।',
    legalNoteEn:
      'This guide provides general information, not legal advice. For a specific legal matter, consult a qualified lawyer or relevant authority. The organization does not guarantee legal representation or assistance.',
    emergencyNumber: '999',
    supportEmail: '',
    supportPhone: '',
  },
  annualReports: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mergePublicInfo(raw?: string | null): PublicInfo {
  let parsed: Record<string, unknown> = {}
  if (raw) {
    try {
      const value: unknown = JSON.parse(raw)
      if (isRecord(value)) parsed = value
    } catch {}
  }

  const recognition = isRecord(parsed.recognition) ? parsed.recognition : {}
  const safety = isRecord(parsed.safety) ? parsed.safety : {}
  const status = recognition.status
  const annualReports = Array.isArray(parsed.annualReports)
    ? parsed.annualReports.filter(isRecord).map((item) => ({
        ...item,
        id: typeof item.id === 'string' ? item.id : '',
        year: typeof item.year === 'string' ? item.year : '',
        titleBn: typeof item.titleBn === 'string' ? item.titleBn : '',
        titleEn: typeof item.titleEn === 'string' ? item.titleEn : '',
        summaryBn: typeof item.summaryBn === 'string' ? item.summaryBn : '',
        summaryEn: typeof item.summaryEn === 'string' ? item.summaryEn : '',
        url: typeof item.url === 'string' ? item.url : '',
      }))
    : DEFAULT_PUBLIC_INFO.annualReports

  return {
    recognition: {
      ...DEFAULT_PUBLIC_INFO.recognition,
      ...recognition,
      status:
        status === 'pending' || status === 'recognized' ? status : 'unverified',
    } as PublicInfo['recognition'],
    safety: {
      ...DEFAULT_PUBLIC_INFO.safety,
      ...safety,
    } as PublicInfo['safety'],
    annualReports,
  }
}

export async function getPublicInfo(): Promise<PublicInfo> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=value&key=eq.${PUBLIC_INFO_KEY}`,
      { headers: { apikey: SB_KEY }, cache: 'no-store' }
    )
    if (!res.ok) return DEFAULT_PUBLIC_INFO
    const rows: Array<{ value?: string }> = await res.json()
    return mergePublicInfo(rows[0]?.value)
  } catch {
    return DEFAULT_PUBLIC_INFO
  }
}

export async function savePublicInfo(token: string, value: PublicInfo): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      key: PUBLIC_INFO_KEY,
      value: JSON.stringify(value),
    }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'নিরাপত্তা ও স্বচ্ছতার তথ্য সংরক্ষণ করা যায়নি')
  }
}
