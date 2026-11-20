const RETENTION_MS = 72 * 60 * 60 * 1000
const HOURS_12_MS = 12 * 60 * 60 * 1000

type TimestampedItem = {
  id: string
}

type Entry<T> = {
  item: T
  timestamp: number
  day: string
}

function timestampOf(value: string | null | undefined): number | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

function dhakaDay(timestamp: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(timestamp)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function entriesOf<T>(
  items: readonly T[],
  activityAt: (item: T) => string | null | undefined
): Entry<T>[] {
  return items
    .map((item) => {
      const timestamp = timestampOf(activityAt(item))
      return timestamp === null ? null : { item, timestamp, day: dhakaDay(timestamp) }
    })
    .filter((entry): entry is Entry<T> => entry !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
}

function latestDays<T>(entries: readonly Entry<T>[], count: number): Set<string> {
  const days = new Set<string>()
  for (const entry of entries) {
    days.add(entry.day)
    if (days.size === count) break
  }
  return days
}

export function selectHomepageItems<T extends TimestampedItem>(
  items: readonly T[],
  activityAt: (item: T) => string | null | undefined,
  now = Date.now()
): T[] {
  const entries = entriesOf(items, activityAt)
  if (!entries.length) return []

  const cutoff = now - RETENTION_MS
  if (entries[0].timestamp <= cutoff) {
    const activeDays = latestDays(entries, 3)
    return entries.filter((entry) => activeDays.has(entry.day)).map((entry) => entry.item)
  }

  const gapIndex = entries.findIndex(
    (entry, index) =>
      index < entries.length - 1 &&
      entry.timestamp - entries[index + 1].timestamp >= RETENTION_MS
  )

  const recent = entries.filter((entry) => entry.timestamp > cutoff)
  if (gapIndex < 0) return recent.map((entry) => entry.item)

  const fallbackEntries = entries.slice(gapIndex + 1)
  const fallbackDays = latestDays(fallbackEntries, 3)
  const fallback = fallbackEntries.filter((entry) => fallbackDays.has(entry.day))
  const resumedPosts = gapIndex + 1
  const remainingFallback = fallback
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(Math.min(resumedPosts, fallback.length))

  return [...recent, ...remainingFallback]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((entry) => entry.item)
}

export function hasEnoughHomepageHistory<T>(
  items: readonly T[],
  activityAt: (item: T) => string | null | undefined,
  now = Date.now()
): boolean {
  const entries = entriesOf(items, activityAt)
  if (!entries.length) return false

  const cutoff = now - RETENTION_MS
  if (entries[0].timestamp <= cutoff) {
    return latestDays(entries, 4).size >= 4
  }

  const gapIndex = entries.findIndex(
    (entry, index) =>
      index < entries.length - 1 &&
      entry.timestamp - entries[index + 1].timestamp >= RETENTION_MS
  )
  return gapIndex >= 0 && latestDays(entries.slice(gapIndex + 1), 4).size >= 4
}

export function buildHomepageRotation<T extends TimestampedItem>(
  items: readonly T[],
  activityAt: (item: T) => string | null | undefined,
  now = Date.now()
): T[] {
  const entries = entriesOf(items, activityAt)
  const weighted = entries.map((entry) => {
    const age = Math.max(0, now - entry.timestamp)
    const weight =
      age >= RETENTION_MS ? 1 : Math.max(1, Math.ceil((RETENTION_MS - age) / HOURS_12_MS))
    return { ...entry, weight }
  })
  const maxWeight = weighted.reduce((max, entry) => Math.max(max, entry.weight), 0)
  const rotation: T[] = []

  for (let weight = maxWeight; weight >= 1; weight -= 1) {
    for (const entry of weighted) {
      if (entry.weight >= weight) rotation.push(entry.item)
    }
  }

  return rotation
}
