'use client'

import { useEffect, useRef } from 'react'

export function PostViewTracker({ postId }: { postId: string }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!postId || tracked.current) return
    tracked.current = true

    const key = `post_viewed_${postId}`
    const lastViewed = sessionStorage.getItem(key)
    if (lastViewed) return

    sessionStorage.setItem(key, String(Date.now()))

    fetch('/api/post-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    }).catch(() => {})
  }, [postId])

  return null
}
