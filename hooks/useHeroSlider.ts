'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { HeroSlide, SubMediaItem } from '@/lib/hero'

interface UseHeroSliderProps {
  posts: HeroSlide[]
}

export function useHeroSlider({ posts }: UseHeroSliderProps) {
  const [postIdx, setPostIdx] = useState(0)
  const [subIdx, setSubIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // টাচ ও ড্র্যাগ ট্র্যাক করার রেফারেন্স
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const totalPosts = posts.length

  // বর্তমান পোস্ট ও তার সাব-স্লাইড তালিকা
  const currentPost: HeroSlide | null = posts[postIdx] || null
  const mediaItems: SubMediaItem[] =
    currentPost?.media_items && currentPost.media_items.length > 0
      ? currentPost.media_items
      : [{ id: 'default', type: 'color', color: '#0f172a' }]

  const curSubMedia: SubMediaItem = mediaItems[subIdx] || mediaItems[0]
  const isCurrentVideo = curSubMedia?.type === 'video'

  // পোস্টের জন্য নির্ধারিত সময়কাল (Duration)
  const duration = currentPost?.slide_duration || 5000

  // ১. পরবর্তী সাব-স্লাইড অথবা পরবর্তী পোস্টে যাওয়ার মেথড
  const nextSlide = useCallback(() => {
    if (totalPosts === 0) return

    // বর্তমান পোস্টের যদি আরও সাব-স্লাইড বাকি থাকে
    if (subIdx < mediaItems.length - 1) {
      setSubIdx((prev) => prev + 1)
    } else {
      // এই পোস্টের সব স্লাইড শেষ হলে পরবর্তী পোস্টে যাওয়া
      setSubIdx(0)
      setPostIdx((prev) => (prev + 1) % totalPosts)
    }
  }, [subIdx, mediaItems.length, totalPosts])

  // ২. আগের সাব-স্লাইড অথবা আগের পোস্টে যাওয়ার মেথড
  const prevSlide = useCallback(() => {
    if (totalPosts === 0) return

    if (subIdx > 0) {
      setSubIdx((prev) => prev - 1)
    } else {
      // আগের পোস্টে যাওয়া এবং তার শেষ সাব-স্লাইডটি প্রদর্শন করা
      const targetPostIdx = (postIdx - 1 + totalPosts) % totalPosts
      setPostIdx(targetPostIdx)
      const prevMedia = posts[targetPostIdx]?.media_items || []
      setSubIdx(Math.max(0, prevMedia.length - 1))
    }
  }, [subIdx, postIdx, totalPosts, posts])

  // ৩. নির্দিষ্ট কোনো পোস্টে সরাসরি জাম্প করা
  const goToPost = useCallback((targetIdx: number) => {
    setPostIdx(targetIdx)
    setSubIdx(0)
  }, [])

  // ৪. সোয়াইপ অঙ্গভঙ্গি হ্যান্ডলার (Touch / Push Gestures)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    touchStartRef.current = { x: clientX, y: clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current || totalPosts < 2) return

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY

    const deltaX = clientX - touchStartRef.current.x
    const deltaY = clientY - touchStartRef.current.y
    touchStartRef.current = null

    // আনুভূমিক সোয়াইপ নিশ্চিতকরণ (কমপক্ষে ৫০ পিক্সেল মুভমেন্ট)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // আঙুল দিয়ে বামে ঠেললে -> পরবর্তী পোস্ট
        goToPost((postIdx + 1) % totalPosts)
      } else {
        // আঙুল দিয়ে ডানে ঠেললে -> আগের পোস্ট
        goToPost((postIdx - 1 + totalPosts) % totalPosts)
      }
    }
  }

  // ৫. স্বয়ংক্রিয় প্রোগ্রেস ও টাইমার লজিক
  useEffect(() => {
    // যদি ভিডিও চলে, ইউজার পজ করে রাখে অথবা কোনো পোস্ট না থাকে তবে টাইমার বন্ধ থাকবে
    if (isPaused || isCurrentVideo || totalPosts === 0 || duration <= 0) return

    const timer = setTimeout(() => {
      nextSlide()
    }, duration)

    return () => clearTimeout(timer)
  }, [nextSlide, duration, isPaused, isCurrentVideo, totalPosts])

  return {
    postIdx,
    subIdx,
    currentPost,
    curSubMedia,
    mediaItems,
    totalPosts,
    isPaused,
    setIsPaused,
    nextSlide,
    prevSlide,
    goToPost,
    handleTouchStart,
    handleTouchEnd,
  }
}

export default useHeroSlider
