"use client"

import { useEffect, useState } from "react"
import { SB_URL, SB_KEY } from "../../lib/sb"
import { DEFAULT_STYLE, getGlobalStyle } from "@/lib/photo-style"
import type { PhotoStyle } from "@/lib/photo-style"
import { PhotoFrame } from "@/components/portal/photo-frame"

type Member = {
  id: string
  full_name: string
  newspaper_name: string | null
  avatar_url: string | null
  role: string
}

// তালিকার ছোট কার্ডে বড় ফ্রেম মানায় না, তাই এডমিনের স্টাইল ধরে রেখে শুধু মাপ ছোট করা হয়
function compact(s: PhotoStyle): PhotoStyle {
  const k = Math.min(1, 64 / s.size)
  return {
    ...s,
    size: Math.round(s.size * k),
    bandWidth: Math.max(2, Math.round(s.bandWidth * k)),
    glowSize: Math.round(s.glowSize * k),
    shadowSize: Math.round(s.shadowSize * k),
    // তালিকায় স্ক্রলে সবগুলো একসাথে বড় হয়ে যাবে, তাই শুধু কার্সারে বড় হবে
    scrollGrow: false,
  }
}

function Card({ m, style }: { m: Member; style: PhotoStyle }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
      <PhotoFrame
        src={m.avatar_url}
        alt={m.full_name}
        style={style}
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-green-100 text-xl font-bold text-green-800">
            {(m.full_name || "?").charAt(0)}
          </div>
        }
      />
      <div className="min-w-0">
        <p className="font-semibold truncate">{m.full_name}</p>
        <p className="text-sm text-gray-500 truncate">{m.newspaper_name || "—"}</p>
      </div>
    </div>
  )
}

export default function CouncilPage() {
  const [list, setList] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [style, setStyle] = useState<PhotoStyle>(compact(DEFAULT_STYLE))

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${SB_URL}/rest/v1/profiles?select=id,full_name,newspaper_name,avatar_url,role,director_visible&approved=eq.true&or=(director_visible.is.null,director_visible.eq.true)&order=created_at.asc `,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
        )
        if (res.ok) setList(await res.json())
      } catch {}
      setLoading(false)
    }
    load()
    getGlobalStyle().then((g) => setStyle(compact(g)))
  }, [])

  const admins = list.filter((m) => m.role === "admin")
  const others = list.filter((m) => m.role !== "admin")

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <div className="max-w-xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-green-800 text-center">ডিরেক্টর প্যানেল / Director Panel</h1>

        {loading && <p className="text-center text-sm text-gray-500">লোড হচ্ছে...</p>}

        {admins.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-green-800">অ্যাডমিন</h2>
            {admins.map((m) => <Card key={m.id} m={m} style={style} />)}
          </div>
        )}

        {others.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-green-800">মডারেটর ({others.length})</h2>
            {others.map((m) => <Card key={m.id} m={m} style={style} />)}
          </div>
        )}

        <a href="/" className="block text-center text-sm underline">সাইটে ফিরুন</a>
      </div>
    </main>
  )
}
