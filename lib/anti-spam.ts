export type AntiSpamPayload = {
  captcha_left: number
  captcha_right: number
  captcha_operator: '+' | '-'
  captcha_answer: string
  website: string
}

const HUMAN_CHECK_ERROR = 'মানব যাচাইটি সঠিকভাবে পূরণ করুন এবং আবার চেষ্টা করুন।'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readInteger(value: unknown, min: number, max: number): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value >= min && value <= max ? value : null
  }
  if (typeof value !== 'string' || !/^[0-9০-৯]{1,2}$/.test(value.trim())) return null
  const parsed = Number(
    value
      .trim()
      .replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - '০'.charCodeAt(0)))
  )
  return parsed >= min && parsed <= max ? parsed : null
}

export function validateAntiSpamPayload(value: unknown): string | null {
  if (!isRecord(value)) return HUMAN_CHECK_ERROR

  const website = value.website
  if (typeof website !== 'string' && website !== undefined) return HUMAN_CHECK_ERROR
  if (typeof website === 'string' && website.trim()) return HUMAN_CHECK_ERROR

  const left = readInteger(value.captcha_left, 1, 12)
  const right = readInteger(value.captcha_right, 1, 12)
  const answer = readInteger(value.captcha_answer, 0, 24)
  const operator = value.captcha_operator

  if (left === null || right === null || answer === null) return HUMAN_CHECK_ERROR
  if (operator !== '+' && operator !== '-') return HUMAN_CHECK_ERROR
  if (operator === '-' && left < right) return HUMAN_CHECK_ERROR

  const expected = operator === '+' ? left + right : left - right
  return answer === expected ? null : HUMAN_CHECK_ERROR
}
