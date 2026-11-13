'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Share2 } from 'lucide-react'
import { SB_URL, SB_KEY } from '@/lib/sb'

const REACTIONS = [
  { key: 'like', icon: '👍', label: 'লাইক' },
  { key: 'love', icon: '❤️', label: 'ভালোবাসা' },
  { key: 'haha', icon: '😂', label: 'হাহা' },
  { key: 'wow', icon: '😮', label: 'ওয়াও' },
  { key: 'sad', icon: '😢', label: 'দুঃখ' },
  { key: 'angry', icon: '😡', label: 'রাগ' },
]

const H = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
}

function deviceId() {
  try {
    let id = localStorage.getItem('mbstu_device')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('mbstu_device', id)
    }
    return id
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2)
  }
}

export function ReactionBar({
  postId,
  title,
  readMoreHref,
  readMoreExternal = false,
  noTopBorder = false,
}: {
  postId: string
  title: string
  readMoreHref?: string
  readMoreExternal?: boolean
  noTopBorder?: boolean
}) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [mine, setMine] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)

  async function load() {
    try {
      const dev = deviceId()
      const [c, m] = await Promise.all([
        fetch(`${SB_URL}/rest/v1/post_reaction_counts?select=emoji,total&post_id=eq.${postId}`, { headers: H, cache: 'no-store' }),
        fetch(`${SB_URL}/rest/v1/post_reactions?select=emoji&post_id=eq.${postId}&device_id=eq.${dev}`, { headers: H, cache: 'no-store' }),
      ])
      if (c.ok) {
        const rows: { emoji: string; total: number }[] = await c.json()
        const o: Record<string, number> = {}
        rows.forEach((r) => (o[r.emoji] = r.total))
        setCounts(o)
      }
      if (m.ok) {
        const rows: { emoji: string }[] = await m.json()
        setMine(rows[0]?.emoji || null)
      }
    } catch {}
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  async function react(key: string) {
    const dev = deviceId()
    const prev = mine
    const next = prev === key ? null : key
    setMine(next)
    setCounts((c) => {
      const n = { ...c }
      if (prev) n[prev] = Math.max(0, (n[prev] || 0) - 1)
      if (next) n[next] = (n[next] || 0) + 1
      return n
    })
    setMsg('')
    try {
      const res = next
        ? await fetch(`${SB_URL}/rest/v1/post_reactions?on_conflict=post_id,device_id`, {
            method: 'POST',
            headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ post_id: postId, device_id: dev, emoji: next }),
          })
        : await fetch(`${SB_URL}/rest/v1/post_reactions?post_id=eq.${postId}&device_id=eq.${dev}`, {
            method: 'DELETE',
            headers: H,
          })
      if (!res.ok) throw new Error()
    } catch {
      setMsg('❌ রিঅ্যাকশন সেভ করা যায়নি')
      load()
    }
  }

  async function share() {
    const url = `${window.location.origin}/post/${postId}`
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={noTopBorder ? 'pt-1' : 'mt-2 border-t border-white/15 pt-3'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              title={r.label}
              aria-label={r.label}
              onClick={() => react(r.key)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs sm:text-sm transition cursor-pointer active:scale-95 ${
                mine === r.key
                  ? 'border-cyan-400 bg-cyan-500/25 text-white font-bold shadow-sm'
                  : 'border-white/20 bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <span>{r.icon}</span>
              {counts[r.key] ? <span className="text-[11px] tabular-nums">{counts[r.key]}</span> : null}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {readMoreHref && (
            readMoreExternal ? (
              <a
                href={readMoreHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3 py-1 text-xs font-bold shadow-sm border border-white/25 transition active:scale-95 whitespace-nowrap"
              >
                <span>বিস্তারিত</span>
                <ArrowRight className="size-3" />
              </a>
            ) : (
              <Link
                href={readMoreHref}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3 py-1 text-xs font-bold shadow-sm border border-white/25 transition active:scale-95 whitespace-nowrap"
              >
                <span>বিস্তারিত</span>
                <ArrowRight className="size-3" />
              </Link>
            )
          )}

          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-white/20 hover:text-white transition cursor-pointer active:scale-95 whitespace-nowrap"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" aria-hidden="true" />}
            <span>{copied ? 'কপি' : 'শেয়ার'}</span>
          </button>
        </div>
      </div>
      {msg && <p className="mt-1.5 text-xs text-rose-300">{msg}</p>}
    </div>
  )
}
