"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Check,
  Clock,
  MessageSquare,
  UserCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react"
import {
  acceptFriendRequest,
  getFriendshipBetween,
  getValidClientAuth,
  removeFriendship,
  sendFriendRequest,
  type FriendshipRow,
} from "@/lib/friends"

export function FriendActionButton({
  targetUserId,
  targetUserName,
}: {
  targetUserId: string
  targetUserName?: string
}) {
  const [ready, setReady] = useState(false)
  const [auth, setAuth] = useState<{ token: string; userId: string } | null>(null)
  const [friendship, setFriendship] = useState<FriendshipRow | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const a = await getValidClientAuth()
      if (!alive) return
      setAuth(a)
      if (a && a.userId !== targetUserId) {
        const f = await getFriendshipBetween(a.token, targetUserId)
        if (alive) setFriendship(f)
      }
      if (alive) setReady(true)
    })()
    return () => {
      alive = false
    }
  }, [targetUserId])

  if (!ready) return null

  if (!auth) {
    return (
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 shadow-lg transition active:scale-95 text-xs font-bold border border-white/20"
      >
        <UserPlus className="size-4" />
        <span>বন্ধু হতে লগইন করুন</span>
      </Link>
    )
  }

  if (auth.userId === targetUserId) {
    return (
      <Link
        href="/friends"
        className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-cyan-200 px-4 py-2.5 text-xs font-bold border border-white/20 transition"
      >
        <UserCheck className="size-4" />
        <span>আমার বন্ধু ও রিকোয়েস্ট</span>
      </Link>
    )
  }

  async function handleSend() {
    if (!auth || busy) return
    setBusy(true)
    try {
      const row = await sendFriendRequest(auth.token, auth.userId, targetUserId)
      setFriendship(row)
    } catch {
      const f = await getFriendshipBetween(auth.token, targetUserId)
      setFriendship(f)
    }
    setBusy(false)
  }

  async function handleAccept() {
    if (!auth || !friendship || busy) return
    setBusy(true)
    try {
      await acceptFriendRequest(auth.token, friendship.id)
      setFriendship({ ...friendship, status: "accepted" })
    } catch {}
    setBusy(false)
  }

  async function handleRemove(ask?: string) {
    if (!auth || !friendship || busy) return
    if (ask && !confirm(ask)) return
    setBusy(true)
    try {
      await removeFriendship(auth.token, friendship.id)
      setFriendship(null)
    } catch {}
    setBusy(false)
  }

  if (!friendship) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={handleSend}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 shadow-lg transition active:scale-95 cursor-pointer text-xs font-bold border border-white/20 disabled:opacity-50"
      >
        <UserPlus className="size-4" />
        <span>{busy ? "পাঠানো হচ্ছে..." : "বন্ধু হোন (Add Friend)"}</span>
      </button>
    )
  }

  if (friendship.status === "pending") {
    const iSent = friendship.requester_id === auth.userId
    if (iSent) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3.5 py-2 text-xs font-bold">
            <Clock className="size-3.5" />
            <span>রিকোয়েস্ট পাঠানো হয়েছে</span>
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleRemove()}
            className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white border border-white/20 px-3 py-2 text-xs font-bold cursor-pointer transition disabled:opacity-50"
          >
            <X className="size-3.5" />
            <span>বাতিল করুন</span>
          </button>
        </div>
      )
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleAccept}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-lg cursor-pointer transition disabled:opacity-50"
        >
          <Check className="size-4" />
          <span>রিকোয়েস্ট গ্রহণ করুন</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => handleRemove()}
          className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white border border-white/20 px-3 py-2 text-xs font-bold cursor-pointer transition disabled:opacity-50"
        >
          <X className="size-3.5" />
          <span>বাতিল</span>
        </button>
      </div>
    )
  }

  if (friendship.status === "accepted") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/messages?uid=${targetUserId}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 shadow-lg transition active:scale-95 text-xs font-bold border border-white/20"
        >
          <MessageSquare className="size-4" />
          <span>M-RU টেক্সট (কথা বলুন)</span>
        </Link>

        <button
          type="button"
          disabled={busy}
          onClick={() =>
            handleRemove(`${targetUserName || "এই সদস্য"}-কে বন্ধু তালিকা থেকে সরাতে চান?`)
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-cyan-200 hover:text-white border border-white/20 px-3 py-2 text-xs font-bold cursor-pointer transition disabled:opacity-50"
          title="Unfriend"
        >
          <UserMinus className="size-3.5" />
          <span>বন্ধু আছেন · Unfriend</span>
        </button>
      </div>
    )
  }

  return null
}
