"use client"

import { useEffect, useState } from "react"
import { Check, UserPlus, Users } from "lucide-react"
import { getPageFollowStats, togglePageFollow } from "@/lib/pages"

function getUserIdFromToken(): string | null {
  try {
    const t = localStorage.getItem("mbstu_admin_token")
    if (!t) return null
    const parts = t.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
    return typeof payload.sub === "string" ? payload.sub : null
  } catch {
    return null
  }
}

function getFollowerIdentity(): { key: string; userId: string | null } {
  const uid = getUserIdFromToken()
  if (uid) return { key: `user:${uid}`, userId: uid }
  try {
    let dev = localStorage.getItem("mbstu_device")
    if (!dev) {
      dev = crypto.randomUUID()
      localStorage.setItem("mbstu_device", dev)
    }
    return { key: `device:${dev}`, userId: null }
  } catch {
    return { key: "device:guest", userId: null }
  }
}

const bn = (n: number) => n.toLocaleString("bn-BD")

export function PageFollowButton({
  pageId,
  initialCount = 0,
}: {
  pageId: string
  initialCount?: number
}) {
  const [count, setCount] = useState(initialCount)
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const id = getFollowerIdentity()
    getPageFollowStats(pageId, id.key).then((st) => {
      setCount(st.count)
      setFollowing(st.following)
    })
  }, [pageId])

  async function handleToggle() {
    if (busy) return
    const id = getFollowerIdentity()
    const prevFollowing = following
    const prevCount = count

    setFollowing(!prevFollowing)
    setCount(Math.max(0, prevCount + (prevFollowing ? -1 : 1)))
    setBusy(true)

    try {
      const next = await togglePageFollow(pageId, id.key, prevFollowing, id.userId)
      setFollowing(next)
    } catch {
      setFollowing(prevFollowing)
      setCount(prevCount)
    }
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer border ${
          following
            ? "bg-white/20 hover:bg-white/30 text-cyan-200 border-cyan-300/60"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-white/25"
        }`}
      >
        {following ? (
          <>
            <Check className="size-3.5 text-cyan-300" />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus className="size-3.5" />
            <span>Follow</span>
          </>
        )}
      </button>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200">
        <Users className="size-3.5 text-cyan-300" />
        <span>{bn(count)} জন ফলোয়ার</span>
      </span>
    </div>
  )
}
