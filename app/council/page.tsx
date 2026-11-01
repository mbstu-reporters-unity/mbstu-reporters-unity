"use client"

import { useEffect, useState } from "react"
import { SB_URL, SB_KEY } from "../../lib/sb"

type Member = {
  id: string
  full_name: string
  newspaper_name: string | null
  avatar_url: string | null
  role: string
}

function Card({ m }: { m: Member }) {
  return (
    <div className="bg-white rounded-2xl shadow p-3 flex items-center gap-3">
      {m.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
      ) : (
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xl font-bold">
          {(m.full_name || "?").charAt(0)}
        </div>
      )}
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${SB_URL}/rest/v1/council_members?select=*&order=created_at.asc`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
        )
        if (res.ok) setList(await res.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const admins = list.filter((m) => m.role === "admin")
  const others = list.filter((m) => m.role !== "admin")

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-16">
      <div className="max-w-xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-green-800 text-center">ডিরেক্টর প্যানেল / Director Panel</h1>

        {loading && <p className="text-center text-sm text-gray-500">লোড হচ্ছে...</p>}

        {admins.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-green-800">অ্যাডমিন</h2>
            {admins.map((m) => <Card key={m.id} m={m} />)}
          </div>
        )}

        {others.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-green-800">মডারেটর ({others.length})</h2>
            {others.map((m) =>e-center"y={m.id} m={m} />)}
          </div>
        )}

        <a href="/" className="block text-center text-sm underline">সাইটে ফিরুন</a>
      </div>
    </main>
  )
}
