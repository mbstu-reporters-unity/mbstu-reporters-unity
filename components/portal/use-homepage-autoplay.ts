"use client"

import { useCallback, useEffect, useRef, useState, type FocusEvent, type TouchEvent } from "react"

const SWIPE_MIN_X = 48 // px — আনুভূমিক সোয়াইপের ন্যূনতম দূরত্ব
const SWIPE_MAX_Y_RATIO = 0.6 // y/x অনুপাত এর বেশি হলে উল্লম্ব স্ক্রল হিসেবে গণ্য

export function useHomepageAutoplay(
  count: number,
  interval = 8000,
  initialIndex = 0,
  externallyPaused = false,
) {
  const [index, setIndex] = useState(initialIndex)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isInView, setIsInView] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // টাচ সোয়াইপ ট্র্যাকিং
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setIndex(count > 0 ? initialIndex % count : 0)
  }, [count, initialIndex])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotionPreference = () => setReducedMotion(media.matches)
    const updateVisibility = () => setIsVisible(document.visibilityState === "visible")
    updateMotionPreference()
    updateVisibility()
    media.addEventListener("change", updateMotionPreference)
    document.addEventListener("visibilitychange", updateVisibility)

    return () => {
      media.removeEventListener("change", updateMotionPreference)
      document.removeEventListener("visibilitychange", updateVisibility)
    }
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element || !("IntersectionObserver" in window)) return

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (count < 2 || paused || externallyPaused || reducedMotion || !isVisible || !isInView) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, interval)
    return () => window.clearInterval(timer)
  }, [count, externallyPaused, interval, isInView, isVisible, paused, reducedMotion])

  const previous = useCallback(() => {
    setIndex((current) => (current - 1 + count) % count)
  }, [count])

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % count)
  }, [count])

  const onBlurCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const target = event.relatedTarget
    if (target instanceof Node && event.currentTarget.contains(target)) return
    setPaused(false)
  }, [])

  // মোবাইল টাচ সোয়াইপ হ্যান্ডলার
  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (count < 2) return
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setPaused(true)
  }, [count])

  const onTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!touchRef.current || count < 2) {
      setPaused(false)
      return
    }
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = null
    setPaused(false)

    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    // স্ক্রল সনাক্ত করলে সোয়াইপ বাতিল
    if (absX < SWIPE_MIN_X || absY / absX > SWIPE_MAX_Y_RATIO) return

    if (dx < 0) {
      // বামে সোয়াইপ → পরের সংবাদ
      setIndex((current) => (current + 1) % count)
    } else {
      // ডানে সোয়াইপ → আগের সংবাদ
      setIndex((current) => (current - 1 + count) % count)
    }
  }, [count])

  const onTouchCancel = useCallback(() => {
    touchRef.current = null
    setPaused(false)
  }, [])

  return {
    index: count > 0 ? index % count : 0,
    setIndex,
    previous,
    next,
    containerRef,
    reducedMotion,
    interactionProps: {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onFocusCapture: () => setPaused(true),
      onBlurCapture,
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
    },
  }
}
