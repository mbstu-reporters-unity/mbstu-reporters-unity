'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  CornerDownRight,
  Heart,
  MessageCircle,
  Send,
  Share2,
  User,
} from 'lucide-react'
import {
  SB_URL,
  SB_KEY,
  getApprovedComments,
  addComment,
  type PublicComment,
} from '@/lib/sb'

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

const toBn = (n: number) => n.toLocaleString('bn-BD')

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const n = (x: number) => Math.floor(x).toLocaleString('bn-BD')
  if (s < 60) return 'এইমাত্র'
  if (s < 3600) return `${n(s / 60)} মিনিট আগে`
  if (s < 86400) return `${n(s / 3600)} ঘণ্টা আগে`
  if (s < 86400 * 30) return `${n(s / 86400)} দিন আগে`
  return `${n(s / (86400 * 30))} মাস আগে`
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
  noTopBorder = false,
  inlineComments = false,
  hideCommentButton = false,
}: {
  postId: string
  title: string
  noTopBorder?: boolean
  inlineComments?: boolean
  hideCommentButton?: boolean
}) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [mine, setMine] = useState<string | null>(null)
  const [commentCount, setCommentCount] = useState(0)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // লং-প্রেস / হোভার রিঅ্যাকশন পিকার স্টেট
  const [pickerOpen, setPickerOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)
  const touchMoved = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)

  // ইনলাইন কমেন্ট সেকশন স্টেট
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<PublicComment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [cName, setCName] = useState('')
  const [cText, setCText] = useState('')
  const [cBusy, setCBusy] = useState(false)
  const [cStatus, setCStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [cErr, setCErr] = useState('')

  // রিপ্লাই স্টেট
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [rName, setRName] = useState('')
  const [rText, setRText] = useState('')
  const [rBusy, setRBusy] = useState(false)
  const [rStatus, setRStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function load() {
    try {
      const dev = deviceId()
      const [c, m, cm] = await Promise.all([
        fetch(`${SB_URL}/rest/v1/post_reaction_counts?select=emoji,total&post_id=eq.${postId}`, {
          headers: H,
          cache: 'no-store',
        }),
        fetch(`${SB_URL}/rest/v1/post_reactions?select=emoji&post_id=eq.${postId}&device_id=eq.${dev}`, {
          headers: H,
          cache: 'no-store',
        }),
        fetch(`${SB_URL}/rest/v1/comments?select=id&post_id=eq.${postId}&approved=eq.true`, {
          headers: H,
          cache: 'no-store',
        }),
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
      if (cm.ok) {
        const rows: { id: string }[] = await cm.json()
        setCommentCount(Array.isArray(rows) ? rows.length : 0)
      }
    } catch {}
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  useEffect(() => {
    if (!pickerOpen) return
    const closeOnOutside = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [pickerOpen])

  async function react(key: string, fromPicker = false) {
    setPickerOpen(false)
    const dev = deviceId()
    const prev = mine
    const next = !fromPicker && prev === key ? null : prev === key && fromPicker ? null : key

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

  // মোবাইল লং-প্রেস হ্যান্ডলার
  function handleTouchStart(e: React.TouchEvent) {
    touchMoved.current = false
    longPressTriggered.current = false
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        longPressTriggered.current = true
        setPickerOpen(true)
        try {
          navigator.vibrate?.(15)
        } catch {}
      }
    }, 380)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchStartPos.current) return
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x)
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y)
    if (dx > 12 || dy > 12) {
      touchMoved.current = true
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    if (longPressTriggered.current) {
      e.preventDefault()
      longPressTriggered.current = false
    }
  }

  // ডেস্কটপ হোভার পিকার
  function handleMouseEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    hoverTimer.current = setTimeout(() => setPickerOpen(true), 320)
  }

  function handleMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    leaveTimer.current = setTimeout(() => setPickerOpen(false), 220)
  }

  async function handleToggleComments() {
    if (inlineComments) {
      const next = !commentsOpen
      setCommentsOpen(next)
      if (next && !commentsLoaded) {
        const list = await getApprovedComments(postId)
        setComments(list)
        setCommentCount(list.length)
        setCommentsLoaded(true)
      }
      return
    }

    const el = document.getElementById('comments-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const ta = el.querySelector('textarea')
      if (ta) setTimeout(() => ta.focus(), 350)
    } else {
      window.location.href = `/post/${postId}#comments-section`
    }
  }

  async function submitComment() {
    const trimmed = cText.trim()
    if (trimmed.length < 3) {
      setCStatus('error')
      setCErr('মন্তব্য কমপক্ষে ৩ অক্ষরের হতে হবে।')
      return
    }
    setCBusy(true)
    setCStatus('idle')
    setCErr('')
    try {
      await addComment(postId, cName.trim() || 'নামহীন পাঠক', trimmed)
      setCText('')
      setCStatus('success')
    } catch (e) {
      setCStatus('error')
      setCErr(e instanceof Error ? e.message : 'মন্তব্য পাঠানো যায়নি।')
    }
    setCBusy(false)
  }

  async function submitReply(parentId: string) {
    const trimmed = rText.trim()
    if (trimmed.length < 2) return
    setRBusy(true)
    setRStatus('idle')
    try {
      await addComment(postId, rName.trim() || 'নামহীন পাঠক', trimmed, parentId)
      setRText('')
      setRStatus('success')
      setTimeout(() => {
        setReplyTo(null)
        setRStatus('idle')
      }, 3000)
    } catch {
      setRStatus('error')
    }
    setRBusy(false)
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

  const totalReactions = Object.values(counts).reduce((sum, v) => sum + (v || 0), 0)
  const topReactions = REACTIONS.filter((r) => (counts[r.key] || 0) > 0)
    .sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0))
    .slice(0, 3)

  const activeReaction = mine ? REACTIONS.find((r) => r.key === mine) : null
  const rootComments = comments.filter((c) => !c.parent_id)
  const getReplies = (pid: string) => comments.filter((c) => c.parent_id === pid)

  return (
    <div className={noTopBorder ? 'pt-1 relative' : 'mt-2 border-t border-white/15 pt-2.5 relative'}>
      <div className="flex items-center justify-between gap-2">
        {/* বাম ও মাঝের বাটনসমূহ: ❤️ রিয়েকশন -> 💬 কমেন্ট -> ↗️ শেয়ার */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* ১. সিঙ্গেল ❤️ রিয়েকশন বাটন (লং প্রেস করে ৬টি ইমোজি বাছাই) */}
          <div
            ref={wrapperRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {pickerOpen && (
              <div
                role="listbox"
                aria-label="রিঅ্যাকশন বাছাই করুন"
                className="absolute bottom-full left-0 mb-2.5 z-50 flex items-center gap-1 rounded-full border border-white/25 bg-slate-900/95 px-2.5 py-1.5 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 fade-in"
              >
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    title={r.label}
                    aria-label={r.label}
                    onClick={() => react(r.key, true)}
                    className={`flex size-9 sm:size-10 items-center justify-center rounded-full text-xl sm:text-2xl transition-transform hover:scale-125 active:scale-125 cursor-pointer ${
                      mine === r.key ? 'bg-white/20 ring-2 ring-cyan-400 scale-110' : ''
                    }`}
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => {
                if (pickerOpen) {
                  setPickerOpen(false)
                  return
                }
                react(mine || 'love')
              }}
              title="ট্যাপ করুন অথবা চেপে ধরে রিয়েকশন বাছাই করুন"
              className={`inline-flex items-center gap-1.5 py-1.5 text-xs sm:text-sm font-semibold select-none touch-manipulation transition active:scale-95 cursor-pointer ${
                activeReaction
                  ? 'text-rose-400 font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {activeReaction ? (
                <span className="text-base sm:text-lg leading-none">{activeReaction.icon}</span>
              ) : (
                <Heart className="size-[18px] text-white/85" aria-hidden="true" />
              )}
              <span className="tabular-nums">
                {totalReactions > 0 ? toBn(totalReactions) : activeReaction ? activeReaction.label : 'রিয়েক্ট'}
              </span>
            </button>
          </div>

          {/* ২. কমেন্ট সেকশন বাটন */}
          {!hideCommentButton && (
            <button
              type="button"
              onClick={handleToggleComments}
              className={`inline-flex items-center gap-1.5 py-1.5 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer ${
                commentsOpen ? 'text-cyan-300 font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              <MessageCircle className="size-[18px]" aria-hidden="true" />
              <span className="tabular-nums">
                {commentCount > 0 ? toBn(commentCount) : 'মন্তব্য'}
              </span>
            </button>
          )}

          {/* ৩. শেয়ার বাটন */}
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 py-1.5 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition active:scale-95 cursor-pointer"
          >
            {copied ? (
              <Check className="size-[18px] text-emerald-400" />
            ) : (
              <Share2 className="size-[18px]" aria-hidden="true" />
            )}
            <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
          </button>
        </div>

        {/* ডানপাশে ফেসবুকের মতো মিনি রিয়েকশন আইকন সামারি */}
        {topReactions.length > 0 && (
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-label="সব রিয়েকশন"
            className="flex items-center -space-x-1 cursor-pointer shrink-0"
          >
            {topReactions.map((r) => (
              <span
                key={r.key}
                className="flex size-5 items-center justify-center rounded-full bg-slate-900/90 ring-1 ring-white/25 text-xs shadow"
              >
                {r.icon}
              </span>
            ))}
          </button>
        )}
      </div>

      {msg && <p className="mt-1 text-xs text-rose-300">{msg}</p>}

      {/* হোমপেজ কার্ডের ভেতর ইনলাইন ফেসবুক-স্টাইল কমেন্ট সেকশন */}
      {inlineComments && commentsOpen && (
        <div className="mt-3 pt-3 border-t border-white/15 space-y-3 animate-in fade-in">
          {rootComments.length > 0 ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {rootComments.map((c) => {
                const replies = getReplies(c.id)
                const isReplying = replyTo === c.id
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs border border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-cyan-200">{c.name || 'নামহীন পাঠক'}</span>
                        <span className="text-[10px] text-white/50">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-100 mt-0.5 leading-relaxed">
                        {c.message}
                      </p>
                    </div>
                    <div className="pl-2 flex items-center gap-3 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(isReplying ? null : c.id)
                          setRStatus('idle')
                        }}
                        className="font-semibold text-white/70 hover:text-cyan-300 cursor-pointer"
                      >
                        {isReplying ? 'বাতিল' : 'Reply'}
                      </button>
                    </div>

                    {isReplying && (
                      <div className="ml-4 p-2.5 rounded-xl bg-black/30 border border-white/15 space-y-1.5 text-xs">
                        <input
                          className="w-full rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                          placeholder="আপনার নাম (ঐচ্ছিক)"
                          value={rName}
                          onChange={(e) => setRName(e.target.value)}
                        />
                        <div className="flex gap-1.5">
                          <input
                            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                            placeholder="রিপ্লাই লিখুন..."
                            value={rText}
                            onChange={(e) => setRText(e.target.value)}
                          />
                          <button
                            type="button"
                            disabled={rBusy || !rText.trim()}
                            onClick={() => submitReply(c.id)}
                            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 text-xs font-bold disabled:opacity-50 cursor-pointer"
                          >
                            <CornerDownRight className="size-3.5" />
                          </button>
                        </div>
                        {rStatus === 'success' && (
                          <p className="text-[11px] text-cyan-300">✓ অনুমোদনের পর দেখা যাবে</p>
                        )}
                      </div>
                    )}

                    {replies.length > 0 && (
                      <div className="ml-5 space-y-1.5 border-l border-cyan-400/50 pl-2.5">
                        {replies.map((r) => (
                          <div key={r.id} className="rounded-xl bg-white/5 px-2.5 py-1.5 text-xs border border-white/10">
                            <p className="font-bold text-[11px] text-cyan-200 flex justify-between">
                              <span>{r.name || 'নামহীন পাঠক'}</span>
                              <span className="text-[10px] text-white/45 font-normal">
                                {timeAgo(r.created_at)}
                              </span>
                            </p>
                            <p className="whitespace-pre-line text-slate-200 mt-0.5">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-white/60">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!</p>
          )}

          {/* ফেসবুকের মতো "Write a comment..." ইনপুট */}
          <div className="space-y-1.5">
            <input
              className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-1.5 text-xs text-white placeholder-white/45 focus:outline-none focus:border-cyan-400"
              placeholder="আপনার নাম (ঐচ্ছিক)"
              maxLength={60}
              value={cName}
              onChange={(e) => setCName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/80">
                <User className="size-4" />
              </div>
              <input
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="মন্তব্য লিখুন..."
                maxLength={1000}
                value={cText}
                onChange={(e) => setCText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submitComment()
                  }
                }}
              />
              <button
                type="button"
                disabled={cBusy || !cText.trim()}
                onClick={submitComment}
                aria-label="মন্তব্য পাঠান"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-white disabled:opacity-40 cursor-pointer transition"
              >
                <Send className="size-3.5" />
              </button>
            </div>
            {cStatus === 'success' && (
              <p className="text-[11px] text-cyan-300 font-semibold">
                ✅ আপনার মন্তব্য জমা হয়েছে! অনুমোদনের পর এখানে দেখাবে।
              </p>
            )}
            {cStatus === 'error' && (
              <p className="text-[11px] text-rose-300 font-semibold">❌ {cErr}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
