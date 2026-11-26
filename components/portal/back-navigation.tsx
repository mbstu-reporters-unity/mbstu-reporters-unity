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
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] px-3 py-2 text-[var(--theme-text-body)] shadow-sm select-none">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleStepBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-brand-soft)] hover:bg-[var(--theme-brand)] active:scale-95 border border-[var(--theme-card-border)] px-3 py-1.5 text-xs font-bold text-[var(--theme-text-title)] hover:text-[var(--theme-bg-solid)] transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span><Tx bn="পূর্ববর্তী পৃষ্ঠায় ফিরুন" en="Go to the previous page" /></span>
        </button>
        {canShowForward && (
          <button
            type="button"
            onClick={() => router.forward()}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-brand-soft)] hover:bg-[var(--theme-brand)] active:scale-95 border border-[var(--theme-card-border)] px-3 py-1.5 text-xs font-bold text-[var(--theme-text-title)] hover:text-[var(--theme-bg-solid)] transition-all duration-200 cursor-pointer"
          >
            <span><Tx bn="পরবর্তী পৃষ্ঠায় যান" en="Go to the next page" /></span>
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-body)]">
        <nav
          aria-label="Breadcrumb navigation"
          className="flex items-center gap-1 overflow-x-auto text-[11px] sm:text-xs"
        >
          {showHome && (
            <Link href="/" className="flex shrink-0 items-center gap-1 text-[var(--theme-text-body)] hover:text-[var(--theme-brand)]">
              <Home className="size-3" />
              <span><Tx bn="হোম" en="Home" /></span>
            </Link>
          )}

          {items.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <ChevronRight className="size-3 text-[var(--theme-card-border)] shrink-0" />
              {item.href ? (
                <Link href={item.href} className="text-[var(--theme-text-body)] hover:text-[var(--theme-brand)] truncate max-w-[110px]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--theme-brand)] font-bold truncate max-w-[140px]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
