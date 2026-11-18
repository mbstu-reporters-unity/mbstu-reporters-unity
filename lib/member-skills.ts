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

const SKILLS_TAG_RE = /\n*\[\[SKILLS:([^\]]*)\]\]\s*$/

export function parseBioAndSkills(rawBio?: string | null): {
  bioText: string
  skills: string[]
} {
  if (!rawBio) return { bioText: "", skills: [] }
  const match = rawBio.match(SKILLS_TAG_RE)
  if (!match) {
    return { bioText: rawBio.trim(), skills: [] }
  }
  const bioText = rawBio.replace(SKILLS_TAG_RE, "").trim()
  const skills = match[1]
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
  return { bioText, skills }
}

export function encodeBioAndSkills(bioText: string, skills: string[]): string | null {
  const cleanBio = bioText.replace(SKILLS_TAG_RE, "").trim()
  const cleanSkills = Array.from(
    new Set(skills.map((s) => s.replace(/[|\]]/g, "").trim()).filter(Boolean))
  )
  if (!cleanBio && cleanSkills.length === 0) return null
  if (cleanSkills.length === 0) return cleanBio
  const tag = `[[SKILLS:${cleanSkills.join("|")}]]`
  return cleanBio ? `${cleanBio}\n\n${tag}` : tag
}
