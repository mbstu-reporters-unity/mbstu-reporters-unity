"use client"

import { useEffect, useState } from "react"

const RETENTION_MS = 72 * 60 * 60 * 1000

export function useHomepageAging(timestamps: readonly string[], initialNow: number): number {
  const [now, setNow] = useState(initialNow)

  useEffect(() => {
    setNow(initialNow)
  }, [initialNow])

  useEffect(() => {
    const nextExpiry = timestamps
      .map((timestamp) => Date.parse(timestamp))
      .filter(Number.isFinite)
      .map((timestamp) => timestamp + RETENTION_MS)
      .filter((timestamp) => timestamp > now)
      .sort((a, b) => a - b)[0]

    if (nextExpiry === undefined) return
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.max(0, nextExpiry - now + 50)
    )
    return () => window.clearTimeout(timer)
  }, [now, timestamps])

  return now
}
