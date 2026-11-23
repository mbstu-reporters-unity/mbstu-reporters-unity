'use client'

import { useEffect, useState, useCallback } from 'react'

export type BookmarkedArticle = {
  id: string
  title: string
  created_at?: string | null
  image_url?: string | null
  category?: string | null
  author?: string | null
  saved_at: number
}

const STORAGE_KEY = 'mbstu_saved_bookmarks_v1'
const EVENT_NAME = 'mbstu_bookmarks_updated'

export function getStoredBookmarks(): BookmarkedArticle[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveBookmarks(items: BookmarkedArticle[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }))
  } catch {}
}

export function isArticleBookmarked(id: string): boolean {
  return getStoredBookmarks().some((item) => item.id === id)
}

export function toggleArticleBookmark(article: {
  id: string
  title: string
  created_at?: string | null
  image_url?: string | null
  category?: string | null
  author?: string | null
}): boolean {
  const current = getStoredBookmarks()
  const exists = current.some((item) => item.id === article.id)

  let updated: BookmarkedArticle[]
  if (exists) {
    updated = current.filter((item) => item.id !== article.id)
  } else {
    const newEntry: BookmarkedArticle = {
      id: article.id,
      title: article.title,
      created_at: article.created_at || null,
      image_url: article.image_url || null,
      category: article.category || null,
      author: article.author || null,
      saved_at: Date.now(),
    }
    updated = [newEntry, ...current]
  }

  saveBookmarks(updated)
  return !exists
}

export function removeStoredBookmark(id: string) {
  const current = getStoredBookmarks()
  const updated = current.filter((item) => item.id !== id)
  saveBookmarks(updated)
}

export function clearAllStoredBookmarks() {
  saveBookmarks([])
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBookmarks(getStoredBookmarks())

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<BookmarkedArticle[]>
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setBookmarks(customEvent.detail)
      } else {
        setBookmarks(getStoredBookmarks())
      }
    }

    window.addEventListener(EVENT_NAME, handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const isSaved = useCallback(
    (id: string) => bookmarks.some((item) => item.id === id),
    [bookmarks]
  )

  const toggle = useCallback((article: {
    id: string
    title: string
    created_at?: string | null
    image_url?: string | null
    category?: string | null
    author?: string | null
  }) => {
    return toggleArticleBookmark(article)
  }, [])

  const remove = useCallback((id: string) => {
    removeStoredBookmark(id)
  }, [])

  const clear = useCallback(() => {
    clearAllStoredBookmarks()
  }, [])

  return {
    bookmarks: mounted ? bookmarks : [],
    count: mounted ? bookmarks.length : 0,
    isSaved,
    toggle,
    remove,
    clear,
    mounted,
  }
}
