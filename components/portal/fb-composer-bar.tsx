"use client"

import React from "react"
import { Image as ImageIcon, Video, Sparkles } from "lucide-react"

export function FbComposerBar({
  user,
  onClick,
}: {
  user?: { name: string; avatar?: string | null } | null
  onClick: () => void
}) {
  return (
    <div className="mx-3 sm:mx-4 my-2 p-3 rounded-2xl glass-card flex items-center gap-3 border border-white/20 shadow-md">
      {user?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={user.name}
          className="size-10 rounded-full object-cover object-top border border-white/30 shrink-0"
        />
      ) : (
        <div className="size-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center shrink-0">
          {user?.name?.charAt(0) || "U"}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm text-slate-300 font-medium cursor-pointer transition"
      >
        What's on your mind? (নতুন সংবাদ বা পোস্ট লিখুন...)
      </button>

      <button
        type="button"
        onClick={onClick}
        className="p-2 rounded-full hover:bg-white/10 text-emerald-400 transition"
        title="ছবি ও ভিডিও"
      >
        <ImageIcon className="size-5" />
      </button>
    </div>
  )
}
