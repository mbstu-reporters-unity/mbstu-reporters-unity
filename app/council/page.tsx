"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Users } from "lucide-react"
import { SB_URL, SB_KEY } from "../../lib/sb"
import { DEFAULT_STYLE, getGlobalStyle } from "@/lib/photo-style"
import type { PhotoStyle } from "@/lib/photo-style"
import { PhotoFrame } from "@/components/portal/photo-frame"
import { TopBar } from "@/components/portal/top-bar"
import { SiteHeader } from "@/components/portal/site-header"
import { SiteFooter } from "@/components/portal/site-footer"
import { BackToTop } from "@/components/portal/back-to-top"

type Member = {
  id: string
  full_name: string
  newspaper_name: string | null
  avatar_url: string | null
  role: string
}

function compact(s: PhotoStyle): PhotoStyle {
  const k = Math.min(1, 64 / s.size)
  return {
    ...s,
    size: Math.round(s.size * k),
    bandWidth: Math.max(2, Math.round(s.bandWidth * k)),
    glowSize: Math.round(s.glowSize * k),
    shadowSize: Math.round(s.shadowSize * k),
    scrollGrow: false,
  }
}

function Card({ m, style, isAdmin = false }: { m: Member; style: PhotoStyle; isAdmin?: boolean }) {
  return (
    <div className="glass-card p-4 flex items-center justify-between gap-4 text-white">
      <div className="flex items-center gap-4 min-w-0">
        <PhotoFrame
          src={m.avatar_url}
          alt={m.full_name}
          style={style}
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-cyan-600 text-xl font-bold text-white">
              {(m.full_name || "?").charAt(0)}
            </div>
          }
        />
        <div className="min-w-0">
          <p className="font-bold text-white truncate text-base">{m.full_name}</p>
          <p className="text-xs text-cyan-200/80 truncate mt-0.5">{m.newspaper_name || "ক্যাম্পাস সাংবাদিক"}</p>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold px-3 py-1 rounded-full shrink-0 border ${
          isAdmin
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
            : 'bg-white/10 text-white/80 border-white/20'
        }`}
      >
        {isAdmin ? 'অ্যাডমিন' : 'মডারেটর'}
      </span>
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
          `${SB_URL}/rest/v1/profiles?select=id,full_name,newspaper_name,avatar_url,role,director_visible&approved=eq.true&or=(director_visible.is.null,director_visible.eq.true)&order=created_at.asc`,
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
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 px-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>
          </div>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-white/20 text-center">
            <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider mb-2 shadow">
              Management & Moderation Panel
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
              ডিরেক্টর প্যানেল / Director Panel
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              মাভাবিপ্রবি রিপোর্টার্স ইউনিটির ওয়েবসাইট পরিচালনা ও মডারেশন প্যানেল
            </p>
          </div>

          {loading && <p className="text-center text-sm text-cyan-200/70 py-6">তথ্য লোড হচ্ছে...</p>}

          {/* অ্যাডমিন সেকশন */}
          {admins.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-base text-cyan-300 flex items-center gap-2 border-b border-white/20 pb-2">
                <ShieldCheck className="size-5 text-cyan-400" />
                <span>প্রধান অ্যাডমিন প্যানেল ({admins.length})</span>
              </h2>
              <div className="space-y-2.5">
                {admins.map((m) => <Card key={m.id} m={m} style={style} isAdmin={true} />)}
              </div>
            </div>
          )}

          {/* মডারেটর সেকশন */}
          {others.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/20 pb-2">
                <Users className="size-5 text-cyan-400" />
                <span>মডারেটর পরিষদ ({others.length})</span>
              </h2>
              <div className="space-y-2.5">
                {others.map((m) => <Card key={m.id} m={m} style={style} isAdmin={false} />)}
              </div>
            </div>
          )}

          <div className="pt-4 text-center border-t border-white/15">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>
          </div>

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
