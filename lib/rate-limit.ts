type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function checkRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()

  // মেমোরি পরিষ্কার রাখা
  if (store.size > 1000) {
    for (const [k, v] of store.entries()) {
      if (v.resetAt <= now) store.delete(k)
    }
  }

  const existing = store.get(bucketKey)
  if (!existing || existing.resetAt <= now) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { allowed: true, retryAfterSec: 0 }
}
