"use client"

import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react"

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
      onTouchStart: () => setPaused(true),
      onTouchEnd: () => setPaused(false),
    },
  }
}
