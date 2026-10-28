'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Bell, Info, LayoutDashboard, Newspaper, Settings, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ManageClubsPanel, PostNewsPanel, PublishNoticePanel, SiteSettingsPanel } from './admin-panels'

const tabs = [
  { id: 'news', label: 'Post News', bn: 'সংবাদ পোস্ট', icon: Newspaper, Panel: PostNewsPanel },
  { id: 'notice', label: 'Publish Notice', bn: 'নোটিশ প্রকাশ', icon: Bell, Panel: PublishNoticePanel },
  { id: 'clubs', label: 'Manage Clubs', bn: 'ক্লাব ব্যবস্থাপনা', icon: Users, Panel: ManageClubsPanel },
  { id: 'settings', label: 'Site Settings', bn: 'সাইট সেটিংস', icon: Settings, Panel: SiteSettingsPanel },
] as const

type TabId = (typeof tabs)[number]['id']

export function AdminDashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState<TabId>('news')
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const baseId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  const Panel = current.Panel

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = (index + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length
    setActive(tabs[next].id)
    document.getElementById(`${baseId}-tab-${tabs[next].id}`)?.focus()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        aria-label="Close admin dashboard"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-navy/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="relative bg-brand px-5 py-5 text-white sm:px-6">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
          <div className="flex items-center gap-3 pr-10">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
              <LayoutDashboard className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id={titleId} className="font-serif text-lg font-bold sm:text-xl">
                Admin Management Dashboard
              </h2>
              <p className="text-sm text-white/80">অ্যাডমিন ব্যবস্থাপনা প্যানেল</p>
            </div>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Admin sections"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-muted/60 px-2 py-2 sm:px-4"
        >
          {tabs.map((t, i) => {
            const Icon = t.icon
            const selected = t.id === active
            return (
              <button
                key={t.id}
                id={`${baseId}-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left transition-all',
                  selected ? 'bg-white text-brand shadow-sm' : 'text-muted-foreground hover:text-navy',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-[11px]">{t.bn}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${current.id}`}
          className="flex-1 overflow-y-auto p-5 sm:p-6"
        >
          <div className="mb-5 flex gap-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs leading-relaxed text-navy/80">
            <Info className="mt-0.5 size-4 shrink-0 text-[#8a6a0a]" aria-hidden="true" />
            <p>
              Preview mode: forms work for this session only. সার্ভার ও ডাটাবেস সংযুক্ত হলে পরিবর্তনগুলো স্থায়ীভাবে
              সংরক্ষিত হবে।
            </p>
          </div>
          <Panel key={current.id} />
        </div>
      </div>
    </div>
  )
}
