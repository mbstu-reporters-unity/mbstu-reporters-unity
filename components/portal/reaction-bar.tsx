'use client'

import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { SB_URL, SB_KEY } from '@/lib/sb'

const REACTIONS = [
  { key: 'like', icon: '👍', label: 'লাইক' },
  { key: 'love', icon: '❤️', label: 'ভালোবাসা' },
  { key: 'haha', icon: '😂', label: 'হাহা' },
  { key: 'wow', icon: '😮', label: 'ওয়াও' },
  { key: 'sad', icon: '😢', label: 'দুঃখ' },
  { key: 'angry', icon: '😡', label: 'রাগ' },
]

const H = { apikey: SB_KEY, 'Content-Type': 'application/json' }

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

export function ReactionBar({ postId, title }: { postId: string; title: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [mine, setMine] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

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
      setMsg('❌ রিঅ্যাকশন যায়নি')
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
      setMsg('✅ লিংক কপি হয়েছে')
    } catch {}
  }

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            title={r.label}
            aria-label={r.label}
            onClick={() => react(r.key)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition ${
              mine === r.key ? 'border-brand bg-brand-soft font-bold' : 'border-border bg-white hover:bg-gray-50'
            }`}
          >
            <span>{r.icon}</span>
            {counts[r.key] ? <span className="text-xs">{counts[r.key]}</span> : null}
          </button>
        ))}
        <button
          type="button"
          onClick={share}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-brand hover:bg-gray-50"
        >
          <Share2 className="size-3.5" aria-hidden="true" /> শেয়ার
        </button>
      </div>
      {msg && <p className="mt-1 text-xs">{msg}</p>}
    </div>
  )
}
