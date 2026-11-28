"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Camera, ArrowRight } from "lucide-react"
import type { Post } from "@/lib/sb"

export function KalbelaPhotoGallery({ posts }: { posts: Post[] }) {
  const photos = posts.filter((post) => Boolean(post.image_url)).slice(0, 10)
  const [activeIndex, setActiveIndex] = useState(0)

  if (photos.length === 0) return null

  const active = photos[activeIndex]
  const select = (index: number) => setActiveIndex((index + photos.length) % photos.length)

  return (
    <section className="bg-[#0b0f19] py-8 sm:py-12 text-white border-b border-slate-800" aria-labelledby="homepage-photo-gallery-title">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* হেডার */}
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="size-4" aria-hidden="true" />
            </span>
            <h2 id="homepage-photo-gallery-title" className="font-serif text-lg sm:text-2xl font-bold text-white">
              ফটোগ্যালারি
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline"
          >
            <span>সকল ছবি দেখুন</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* বড় সক্রিয় ছবি ফ্রেম */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-2xl">
          <Link href={`/post/${active.id}`} className="relative block group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.id}
              src={active.image_url || ""}
              alt={active.title}
              className="mx-auto aspect-[16/9] max-h-[60vh] w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden"
              }}
            />
            {/* গ্রেডিয়েন্ট টেক্সট ওভারলে */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-4 pt-16 sm:px-6 sm:pb-6">
              <span className="inline-block rounded-full bg-[#c8102e] px-2.5 py-0.5 text-[10px] font-bold text-white mb-1.5">
                {active.category || "ক্যাম্পাস"}
              </span>
              <p className="line-clamp-2 font-serif text-base sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                {active.title}
              </p>
            </div>
          </Link>

          {/* ডানে-বামে নেভিগেশন তীর */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => select(activeIndex - 1)}
                aria-label="আগের ছবি"
                className="absolute left-2 sm:left-3 top-1/2 flex size-8 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-black/90 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => select(activeIndex + 1)}
                aria-label="পরের ছবি"
                className="absolute right-2 sm:right-3 top-1/2 flex size-8 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-black/90 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* নিচের থাম্বনেইল স্ট্রিপ */}
        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none" aria-label="গ্যালারির ছবিসমূহ">
            {photos.map((post, index) => (
              <button
                key={post.id}
                type="button"
                onClick={() => select(index)}
                aria-label={`${index + 1}. ${post.title}`}
                className={`relative aspect-[16/10] w-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border transition cursor-pointer ${
                  activeIndex === index
                    ? "border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]"
                    : "border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url || ""}
                  alt=""
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
