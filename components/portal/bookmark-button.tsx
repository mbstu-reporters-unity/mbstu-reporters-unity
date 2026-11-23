'use client'

import React from 'react'
import { Bookmark } from 'lucide-react'
import { useBookmarks } from '@/lib/bookmarks'
import { useLang } from '@/lib/i18n'

export function BookmarkButton({
  postId,
  title,
  imageUrl,
  category,
  author,
  createdAt,
  className = '',
  size = 'md',
}: {
  postId: string
  title: string
  imageUrl?: string | null
  category?: string | null
  author?: string | null
  createdAt?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { isSaved, toggle } = useBookmarks()
  const { pick } = useLang()
  const saved = isSaved(postId)

  const sizeClasses = {
    sm: 'size-7 text-xs',
    md: 'size-8 text-sm',
    lg: 'size-9 text-base',
  }[size]

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4.5',
  }[size]

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle({
      id: postId,
      title,
      image_url: imageUrl,
      category,
      author,
      created_at: createdAt,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? pick('বুকমার্ক মুছুন', 'Remove bookmark') : pick('বুকমার্ক করুন', 'Save bookmark')}
      title={saved ? pick('সংরক্ষিত হয়েছে (মুছতে ক্লিক করুন)', 'Saved (click to remove)') : pick('সংরক্ষণ করুন', 'Save for later')}
      className={`inline-flex items-center justify-center rounded-xl border transition-all cursor-pointer select-none active:scale-90 ${sizeClasses} ${
        saved
          ? 'bg-amber-500/25 border-amber-400/50 text-amber-300 shadow-xs'
          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/70 hover:text-white'
      } ${className}`}
    >
      <Bookmark
        className={`${iconSizes} transition-transform ${
          saved ? 'fill-amber-400 text-amber-400 scale-110' : ''
        }`}
      />
    </button>
  )
}
