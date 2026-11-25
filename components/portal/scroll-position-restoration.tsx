'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const scrollPositions = new Map<string, number>()

function currentUrlKey() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function ScrollPositionRestoration() {
  const pathname = usePathname()
  const [popStateVersion, setPopStateVersion] = useState(0)
  const pendingRestoreKey = useRef<string | null>(null)

  useEffect(() => {
    const saveScrollPosition = () => {
      const key = currentUrlKey()
      if (pendingRestoreKey.current !== key) {
        scrollPositions.set(key, window.scrollY)
      }
    }

    const handlePopState = () => {
      pendingRestoreKey.current = currentUrlKey()
      setPopStateVersion((version) => version + 1)
    }

    window.addEventListener('scroll', saveScrollPosition, { passive: true })
    window.addEventListener('pagehide', saveScrollPosition)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('scroll', saveScrollPosition)
      window.removeEventListener('pagehide', saveScrollPosition)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    const key = pendingRestoreKey.current
    const keyPath = key?.split(/[?#]/, 1)[0]
    if (!key || !pathname || keyPath !== pathname) return

    const savedPosition = scrollPositions.get(key)
    if (savedPosition === undefined) {
      pendingRestoreKey.current = null
      return
    }

    let attempts = 0
    let timeoutId = 0
    let cancelled = false

    const restoreScrollPosition = () => {
      if (cancelled) return
      if (currentUrlKey() !== key) {
        pendingRestoreKey.current = null
        return
      }

      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      )
      const maxScroll = Math.max(0, documentHeight - window.innerHeight)

      if (maxScroll >= savedPosition || attempts >= 20) {
        window.scrollTo(0, Math.min(savedPosition, maxScroll))
        pendingRestoreKey.current = null
        return
      }

      attempts += 1
      timeoutId = window.setTimeout(restoreScrollPosition, 100)
    }

    timeoutId = window.setTimeout(restoreScrollPosition, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [pathname, popStateVersion])

  return null
}
