"use client"

import { useState } from "react"
import { setDirectorVisible } from "../../lib/sb"
import type { Profile } from "../../lib/sb"

export default function DirectorManager({
  token,
  members,
  onChanged,
}: {
  token: string
  members: Profile[]
  onChanged: () => Promise<void> | void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  const list = members.filter((m) => m.role === "admin" || m.role === "moderator")

  async function toggle(m: Profile) {
    const visible = m.director_visible !== false
    setBusyId(m.id)
    setMsg("")
    try {
      await setDirectorVisible(token, m.id, !visible)
      await onChanged()
      setMsg(visible ? "✅ ডিরেক্টর প্যানেল থেকে লুকানো হয়েছে" : "✅ ডিরেক্টর প্যানেলে দৃশ্যমান করা হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-600">
        লুকানো সদস্যকে /council পেজে দেখা যাবে না। তবে তিনি ড্যাশবোর্ডে অন্য মডারেটরদের মতোই সব কাজ করতে পারবেন।
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      {list.map((m) => {
        const visible = m.director_visible !== false
        const isAdm = m.role === "admin"
        return (
          <div key={m.id} className="bg-white rounded-2xl shadow p-3 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {m.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {m.full_name} {isAdm && "(অ্যাডমিন)"}
                </p>
                <p className="text-gray-500 truncate">
                  {m.department} · {m.batch}
                </p>
                <p className={visible ? "text-green-700" : "text-amber-600"}>
                  {visible ? "👁 দৃশ্যমান" : "🙈 লুকানো"}
                </p>
              </div>
            </div>
            {isAdm ? (
              <span className="text-xs text-gray-400">সবসময় দৃশ্যমান</span>
            ) : (
              <button
                onClick={() => toggle(m)}
                disabled={busyId === m.id}
                className="text-amber-600 disabled:opacity-50"
              >
                {busyId === m.id ? "..." : visible ? "লুকান" : "দেখান"}
              </button>
            )}
          </div>
        )
      })}
      {list.length === 0 && <p className="text-sm text-gray-500">কোনো সদস্য নেই।</p>}
    </div>
  )
}
