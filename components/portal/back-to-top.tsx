'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-6 right-6 z-30 flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white transition-all hover:-translate-y-1 hover:bg-brand-dark',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  )
}
