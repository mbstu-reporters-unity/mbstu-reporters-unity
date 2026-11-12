'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        // মোবাইলে সেফ কর্নারে থাকবে এবং রিঅ্যাকশন বারের সাথে ওভারল্যাপ করবে না
        'fixed bottom-5 right-3.5 sm:bottom-6 sm:right-6 z-40 flex size-10 sm:size-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl border border-white/30 backdrop-blur-md transition-all hover:-translate-y-1 active:scale-95 cursor-pointer ring-2 ring-cyan-400/30',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
      tabIndex={visible ? 0 : -1}
      aria-label="Back to top"
    >
      <ArrowUp className="size-4 sm:size-5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  )
}
