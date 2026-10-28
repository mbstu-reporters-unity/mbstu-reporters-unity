'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Crown, Eye, EyeOff, Info, Lock, Mail, PenSquare, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'super' | 'reporter'

const roles: Record<Role, { label: string; bn: string; icon: typeof Crown; summary: string }> = {
  super: {
    label: 'Super Admin',
    bn: 'পূর্ণ নিয়ন্ত্রণ',
    icon: Crown,
    summary:
      'Super Admin holds master control — approving and publishing news, managing reporters, notices, slider content and site settings.',
  },
  reporter: {
    label: 'Reporter/Editor',
    bn: 'সংবাদ আপলোড',
    icon: PenSquare,
    summary:
      'Reporters & Editors can draft and submit news, upload photos and edit their own stories. Submissions are reviewed by the Super Admin before publishing.',
  },
}

export function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [role, setRole] = useState<Role>('super')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const emailId = useId()
  const passwordId = useId()

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setStatus(null)
  }, [open])

  if (!open) return null

  const active = roles[role]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(
      'Authentication service is not connected yet. সার্ভার সংযোগ সম্পন্ন হলে লগইন চালু হবে।',
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close login dialog"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-navy/70 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in zoom-in-95 fade-in relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative bg-brand px-6 pb-6 pt-7 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
          <span className="flex size-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
            <Lock className="size-6" aria-hidden="true" />
          </span>
          <h2 id={titleId} className="mt-4 font-serif text-xl font-bold">
            Admin Portal / অ্যাডমিন লগইন
          </h2>
          <p className="mt-1 text-sm text-white/80">Secure access for MBSTU Reporters&apos; Unity members</p>
        </div>

        <div className="p-6">
          <div role="tablist" aria-label="Login role" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(Object.keys(roles) as Role[]).map((key) => {
              const r = roles[key]
              const Icon = r.icon
              const selected = role === key
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setRole(key)
                    setStatus(null)
                  }}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg px-2 py-2.5 text-center transition-all',
                    selected ? 'bg-white text-brand shadow-sm' : 'text-muted-foreground hover:text-navy',
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    <Icon className="size-4" aria-hidden="true" />
                    {r.label}
                  </span>
                  <span className="text-xs">({r.bn})</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-navy">
                Email / ইমেইল
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id={emailId}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={role === 'super' ? 'admin@mbstu-ru.org' : 'reporter@mbstu-ru.org'}
                  className="w-full rounded-lg border border-input bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
            <div>
              <label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-navy">
                Password / পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-navy"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-[#8a6a0a]">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                2FA Protected
              </span>
              <a href="#contact" onClick={onClose} className="text-xs font-medium text-brand hover:underline">
                Forgot password?
              </a>
            </div>

            <div className="flex gap-3 rounded-lg border border-brand/15 bg-brand-soft p-3 text-xs leading-relaxed text-navy/80">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <p>{active.summary}</p>
            </div>

            {status && (
              <p role="status" className="rounded-lg bg-crimson/10 px-3 py-2 text-xs font-medium text-crimson">
                {status}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Lock className="size-4" aria-hidden="true" />
              Sign in as {active.label}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
