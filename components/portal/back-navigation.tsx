'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Home, ChevronRight } from 'lucide-react'
import { Tx } from '@/lib/i18n'
import type { ReactNode } from 'react'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
}

export function BackNavigation({
  items = [],
  fallbackHref = '/',
  showHome = true,
  showForward,
}: {
  items?: BreadcrumbItem[]
  fallbackHref?: string
  showHome?: boolean
  showForward?: boolean
}) {
  const router = useRouter()
  const canShowForward = showForward ?? items.length > 0

  const handleStepBack = () => {
    // ব্রাউজারে আগের পেজের হিস্ট্রি থাকলে ঠিক এক ধাপ পেছনে যাবে
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      const breadcrumbHref = [...items].reverse().find((item) => item.href)?.href
      router.push(breadcrumbHref ?? fallbackHref)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/15 bg-slate-950/90 px-3 py-2 text-white shadow-sm select-none hero-daylight-dark-surface">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleStepBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 px-3 py-1.5 text-xs font-bold text-cyan-100 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span><Tx bn="পূর্ববর্তী পৃষ্ঠায় ফিরুন" en="Go to the previous page" /></span>
        </button>
        {canShowForward && (
          <button
            type="button"
            onClick={() => router.forward()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 px-3 py-1.5 text-xs font-bold text-cyan-100 transition-all duration-200 cursor-pointer"
          >
            <span><Tx bn="পরবর্তী পৃষ্ঠায় যান" en="Go to the next page" /></span>
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-white/70">
        <nav
          aria-label="Breadcrumb navigation"
          className="flex items-center gap-1 overflow-x-auto text-[11px] sm:text-xs"
        >
          {showHome && (
            <Link href="/" className="flex shrink-0 items-center gap-1 text-white/80 hover:text-white">
              <Home className="size-3" />
              <span><Tx bn="হোম" en="Home" /></span>
            </Link>
          )}

          {items.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <ChevronRight className="size-3 text-white/40 shrink-0" />
              {item.href ? (
                <Link href={item.href} className="text-white/80 hover:text-white truncate max-w-[110px]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white font-bold truncate max-w-[140px]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
