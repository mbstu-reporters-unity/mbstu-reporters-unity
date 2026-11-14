'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function BackNavigation({
  items = [],
  fallbackHref = '/',
  showHome = true,
}: {
  items?: BreadcrumbItem[]
  fallbackHref?: string
  showHome?: boolean
}) {
  const router = useRouter()

  const handleStepBack = () => {
    // ব্রাউজারে আগের পেজের হিস্ট্রি থাকলে ঠিক এক ধাপ পেছনে যাবে
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 py-1 select-none">
      {/* ১. এক ধাপ পেছনে যাওয়ার স্মার্ট বাটন */}
      <button
        type="button"
        onClick={handleStepBack}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-all cursor-pointer shadow-sm"
      >
        <ArrowLeft className="size-3.5" />
        <span>এক ধাপ পেছনে</span>
      </button>

      {/* ২. ধাপে ধাপে পথ (Breadcrumb) */}
      <div className="flex items-center gap-1.5 text-xs text-white/70">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] sm:text-xs">
          {showHome && (
            <Link href="/" className="hover:text-cyan-300 flex items-center gap-1 text-slate-300">
              <Home className="size-3 text-cyan-400" />
              <span>হোম</span>
            </Link>
          )}

          {items.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <ChevronRight className="size-3 text-white/40 shrink-0" />
              {item.href ? (
                <Link href={item.href} className="hover:text-cyan-300 text-slate-300 truncate max-w-[110px]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-cyan-300 font-bold truncate max-w-[140px]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
