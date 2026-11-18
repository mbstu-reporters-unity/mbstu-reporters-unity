'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Home,
  LayoutGrid,
  X,
  type LucideIcon,
} from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  sublabel?: string
  icon: LucideIcon
  iconClass?: string
  href?: string
  external?: boolean
  badge?: string
  verified?: boolean
  onSelect?: () => void
  children?: MenuItem[]
}

interface DrillDownMenuProps {
  open: boolean
  onClose: () => void
  items: MenuItem[]
  rootTitle?: string
  userBanner?: {
    name: string
    subtitle?: string
    avatarUrl?: string | null
    href?: string
  } | null
}

const SWIPE_THRESHOLD_PX = 72
const TRANSITION_MS = 300

export function DrillDownMenu({
  open,
  onClose,
  items,
  rootTitle = 'প্রধান মেনু',
  userBanner = null,
}: DrillDownMenuProps) {
  const pathname = usePathname() || '/'
  const prevPathRef = useRef(pathname)

  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  const [trail, setTrail] = useState<string[]>([])
  const [activeDepth, setActiveDepth] = useState(0)
  const [dragX, setDragX] = useState(0)

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const raf1Ref = useRef<number | null>(null)
  const raf2Ref = useRef<number | null>(null)
  const breadcrumbScrollRef = useRef<HTMLDivElement>(null)

  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
    lock: 'none' | 'horizontal' | 'vertical'
  } | null>(null)

  // ড্রয়ার খোলা ও বন্ধ হওয়ার স্মুথ স্লাইড অ্যানিমেশন নিয়ন্ত্রণ
  useEffect(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current)
    if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current)

    if (open) {
      setMounted(true)
      raf1Ref.current = requestAnimationFrame(() => {
        raf2Ref.current = requestAnimationFrame(() => {
          setVisible(true)
        })
      })
    } else {
      setVisible(false)
      setDragX(0)
      closeTimerRef.current = setTimeout(() => {
        setMounted(false)
        setTrail([])
        setActiveDepth(0)
      }, TRANSITION_MS)
    }

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current)
      if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current)
    }
  }, [open])

  // রাউট পরিবর্তন হলে অটোমেটিক ড্রয়ার বন্ধ করা
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      if (open) onClose()
    }
  }, [pathname, open, onClose])

  // বডি স্ক্রল লক ও Escape কী হ্যান্ডলার
  useEffect(() => {
    if (!mounted) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mounted, onClose])

  // রিকার্সিভভাবে বর্তমান ট্রেইল অনুযায়ী সব লেভেলের প্যানেল তৈরি
  const panels = useMemo(() => {
    const out: Array<{ depth: number; id: string; title: string; items: MenuItem[] }> = [
      { depth: 0, id: 'root', title: rootTitle, items },
    ]
    let currentList = items
    for (let i = 0; i < trail.length; i++) {
      const found = currentList.find((m) => m.id === trail[i])
      if (!found || !found.children || found.children.length === 0) break
      out.push({
        depth: i + 1,
        id: found.id,
        title: found.label,
        items: found.children,
      })
      currentList = found.children
    }
    return out
  }, [items, trail, rootTitle])

  const safeActiveDepth = Math.min(activeDepth, panels.length - 1)
  const activePanel = panels[safeActiveDepth] || panels[0]
  const breadcrumbs = panels.slice(0, safeActiveDepth + 1)

  // ব্রেডক্রাম্ব বাড়লে ডান দিকে স্ক্রল করে বর্তমান অবস্থান দেখানো
  useEffect(() => {
    const el = breadcrumbScrollRef.current
    if (el) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    }
  }, [safeActiveDepth])

  function drillDown(itemId: string, fromDepth: number) {
    if (trimTimerRef.current) clearTimeout(trimTimerRef.current)
    if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current)
    if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current)

    const nextTrail = [...trail.slice(0, fromDepth), itemId]
    setTrail(nextTrail)

    raf1Ref.current = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(() => {
        setActiveDepth(fromDepth + 1)
      })
    })
  }

  function goToDepth(targetDepth: number) {
    if (targetDepth < 0 || targetDepth >= safeActiveDepth) return
    if (trimTimerRef.current) clearTimeout(trimTimerRef.current)

    setActiveDepth(targetDepth)
    trimTimerRef.current = setTimeout(() => {
      setTrail((prev) => prev.slice(0, targetDepth))
    }, TRANSITION_MS + 20)
  }

  // টাচ সোয়াইপ রাইট (আঙুল দিয়ে ডানে পুশ করে ব্যাকে আসা বা ড্রয়ার বন্ধ করা)
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startTime: Date.now(),
      lock: 'none',
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    const t = touchRef.current
    if (!t || e.touches.length !== 1) return

    const dx = e.touches[0].clientX - t.startX
    const dy = e.touches[0].clientY - t.startY

    if (t.lock === 'none') {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        t.lock = 'vertical'
        return
      }
      if (dx > 10 && dx > Math.abs(dy) * 1.2) {
        t.lock = 'horizontal'
      }
    }

    if (t.lock === 'horizontal') {
      setDragX(Math.max(0, dx))
    }
  }

  function handleTouchEnd() {
    const t = touchRef.current
    touchRef.current = null
    if (!t || t.lock !== 'horizontal') {
      if (dragX !== 0) setDragX(0)
      return
    }

    const elapsed = Math.max(1, Date.now() - t.startTime)
    const velocity = dragX / elapsed
    const shouldTriggerBack =
      dragX > SWIPE_THRESHOLD_PX || (dragX > 32 && velocity > 0.45)

    setDragX(0)
    if (shouldTriggerBack) {
      if (safeActiveDepth > 0) {
        goToDepth(safeActiveDepth - 1)
      } else {
        onClose()
      }
    }
  }

  function isHrefActive(href?: string) {
    if (!href || href.startsWith('http') || href.includes('#')) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (!mounted) return null

  const isRootDragging = safeActiveDepth === 0 && dragX > 0

  return (
    <div
      className="fixed inset-0 z-[120] select-none"
      role="dialog"
      aria-modal="true"
      aria-label="সাইড নেভিগেশন মেনু"
    >
      {/* ব্যাকড্রপ ব্লার ওভারলে */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ডান পাশের স্লাইডিং ড্রয়ার */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={
          isRootDragging
            ? { transform: `translateX(${dragX}px)`, transition: 'none' }
            : undefined
        }
        className={`fixed top-0 right-0 z-10 flex h-[100dvh] w-[88vw] max-w-sm flex-col border-l border-white/15 bg-[#0a132e]/95 text-white shadow-[-20px_0_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl ${
          isRootDragging
            ? ''
            : 'transition-transform duration-300 ease-out ' +
              (visible ? 'translate-x-0' : 'translate-x-full')
        }`}
      >
        {/* ১. স্টিকি কনটেক্সচুয়াল হেডার ও ব্রেডক্রাম্ব */}
        <div className="shrink-0 border-b border-white/10 bg-white/[0.04] px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {safeActiveDepth > 0 ? (
                <button
                  type="button"
                  onClick={() => goToDepth(safeActiveDepth - 1)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 transition cursor-pointer"
                  aria-label="এক ধাপ পেছনে"
                >
                  <ArrowLeft className="size-4.5" />
                </button>
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
                  <LayoutGrid className="size-4.5" />
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-white leading-tight">
                  {activePanel.title}
                </h2>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {safeActiveDepth > 0
                    ? 'ডানে সোয়াইপ বা ← চেপে পেছনে যান'
                    : 'সকল মেনু ও সেকশন তালিকা'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-8.5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white active:scale-95 transition cursor-pointer"
              aria-label="মেনু বন্ধ করুন"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* ক্লিকেবল ব্রেডক্রাম্ব ট্রেইল (হোম > বিশ্ববিদ্যালয় > অনুষদ > ...) */}
          {safeActiveDepth > 0 && (
            <div
              ref={breadcrumbScrollRef}
              className="mt-2.5 flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] scrollbar-none"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <React.Fragment key={crumb.id + idx}>
                    {idx > 0 && (
                      <ChevronRight className="size-3 shrink-0 text-white/35" />
                    )}
                    {isLast ? (
                      <span className="shrink-0 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-2.5 py-0.5 font-bold text-cyan-200">
                        {crumb.title}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goToDepth(crumb.depth)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/5 hover:bg-white/15 px-2 py-0.5 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        {idx === 0 && <Home className="size-3 text-cyan-400" />}
                        <span>{crumb.title}</span>
                      </button>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>

        {/* ইউজার পরিচিতি কার্ড (লগইন থাকলে শুধু রুট লেভেলে দেখাবে) */}
        {userBanner && safeActiveDepth === 0 && (
          <div className="shrink-0 border-b border-white/10 bg-white/[0.02] px-3.5 py-2.5">
            <Link
              href={userBanner.href || '/admin'}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] p-2 hover:bg-white/[0.1] transition"
            >
              {userBanner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userBanner.avatarUrl}
                  alt=""
                  className="size-9 rounded-full object-cover object-top ring-2 ring-cyan-400/60 shrink-0"
                />
              ) : (
                <div className="size-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {userBanner.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{userBanner.name}</p>
                {userBanner.subtitle && (
                  <p className="text-[10px] text-cyan-300 truncate">{userBanner.subtitle}</p>
                )}
              </div>
              <ChevronRight className="size-4 text-white/40 shrink-0" />
            </Link>
          </div>
        )}

        {/* ২. মাল্টি-লেভেল স্লাইডিং প্যানেল ভিউপোর্ট */}
        <div className="relative flex-1 overflow-hidden">
          {panels.map((panel) => {
            const isActive = panel.depth === safeActiveDepth
            const isPast = panel.depth < safeActiveDepth
            const isImmediateParent = panel.depth === safeActiveDepth - 1

            let inlineStyle: React.CSSProperties | undefined
            if (safeActiveDepth > 0 && dragX > 0) {
              if (isActive) {
                inlineStyle = {
                  transform: `translateX(${dragX}px)`,
                  transition: 'none',
                }
              } else if (isImmediateParent) {
                const progress = Math.min(1, dragX / 300)
                const offsetPct = -35 + progress * 35
                inlineStyle = {
                  transform: `translateX(${offsetPct}%)`,
                  transition: 'none',
                }
              }
            }

            const transformClass = isActive
              ? 'translate-x-0 pointer-events-auto'
              : isPast
                ? '-translate-x-full pointer-events-none'
                : 'translate-x-full pointer-events-none'

            return (
              <div
                key={`${panel.depth}-${panel.id}`}
                style={inlineStyle}
                aria-hidden={!isActive}
                className={`absolute inset-0 overflow-y-auto px-2.5 py-2.5 scrollbar-none ${
                  dragX > 0 && (isActive || isImmediateParent)
                    ? ''
                    : 'transition-transform duration-300 ease-out '
                } ${transformClass}`}
              >
                <ul className="space-y-1">
                  {panel.items.map((item) => {
                    const Icon = item.icon
                    const hasChildren = Boolean(item.children && item.children.length > 0)
                    const active = !hasChildren && isHrefActive(item.href)

                    const rowClass = `group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] cursor-pointer ${
                      active
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-white shadow-sm'
                        : 'border-transparent hover:border-white/10 hover:bg-white/[0.07] text-slate-100'
                    }`

                    const content = (
                      <>
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                            item.iconClass || 'bg-white/10 text-cyan-300'
                          }`}
                        >
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[13px] font-semibold leading-snug">
                              {item.label}
                            </span>
                            {item.verified && (
                              <CheckCircle2 className="size-3.5 fill-blue-500 text-white shrink-0" />
                            )}
                          </span>
                          {item.sublabel && (
                            <span className="block truncate text-[10px] text-slate-400">
                              {item.sublabel}
                            </span>
                          )}
                        </span>

                        {item.badge && (
                          <span className="shrink-0 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                            {item.badge}
                          </span>
                        )}

                        {hasChildren ? (
                          <ChevronRight className="size-4 shrink-0 text-white/45 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                        ) : item.external ? (
                          <ExternalLink className="size-3.5 shrink-0 text-white/40 group-hover:text-cyan-300" />
                        ) : active ? (
                          <span className="size-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        ) : null}
                      </>
                    )

                    if (hasChildren) {
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => drillDown(item.id, panel.depth)}
                            className={rowClass}
                          >
                            {content}
                          </button>
                        </li>
                      )
                    }

                    if (item.onSelect) {
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              item.onSelect?.()
                            }}
                            className={rowClass}
                          >
                            {content}
                          </button>
                        </li>
                      )
                    }

                    if (item.href && item.external) {
                      return (
                        <li key={item.id}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className={rowClass}
                          >
                            {content}
                          </a>
                        </li>
                      )
                    }

                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href || '/'}
                          onClick={onClose}
                          className={rowClass}
                        >
                          {content}
                        </Link>
                      </li>
                    )
                  })}

                  {panel.items.length === 0 && (
                    <li className="py-10 text-center text-xs text-slate-400">
                      এই তালিকায় এখনো কোনো তথ্য যুক্ত করা হয়নি।
                    </li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
