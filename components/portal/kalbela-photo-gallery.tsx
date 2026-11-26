"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Images } from "lucide-react"
import type { Post } from "@/lib/sb"

export function KalbelaPhotoGallery({ posts }: { posts: Post[] }) {
  const photos = posts.filter((post) => Boolean(post.image_url)).slice(0, 10)
  const [activeIndex, setActiveIndex] = useState(0)

  if (photos.length === 0) return null

  const active = photos[activeIndex]
  const select = (index: number) => setActiveIndex((index + photos.length) % photos.length)

  return (
    <section className="bg-[#070b12] py-10 text-white sm:py-14" aria-labelledby="homepage-photo-gallery-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Images className="size-5 text-amber-400" aria-hidden="true" />
            <h2 id="homepage-photo-gallery-title" className="font-serif text-xl font-bold sm:text-2xl">
              ফটোগ্যালারি
            </h2>
          </div>
          <Link href="/gallery" className="shrink-0 text-xs font-bold text-amber-300 hover:text-white hover:underline sm:text-sm">
            সকল ছবি দেখুন →
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black">
          <Link href={`/post/${active.id}`} className="relative block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.id}
              src={active.image_url || ""}
              alt={active.title}
              className="mx-auto aspect-[16/9] max-h-[65vh] w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden"
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-6">
              <p className="line-clamp-2 font-serif text-base font-bold sm:text-xl">{active.title}</p>
              <p className="mt-1 text-xs text-white/75">{active.category || "ক্যাম্পাস সংবাদ"}</p>
            </div>
          </Link>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => select(activeIndex - 1)}
                aria-label="আগের ছবি"
                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition hover:bg-black/85"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => select(activeIndex + 1)}
                aria-label="পরের ছবি"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition hover:bg-black/85"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="গ্যালারির ছবিসমূহ">
            {photos.map((post, index) => (
              <button
                key={post.id}
                type="button"
                onClick={() => select(index)}
                aria-label={`${index + 1}. ${post.title}`}
                aria-pressed={activeIndex === index}
                className={`size-16 shrink-0 overflow-hidden rounded-lg border bg-black transition sm:size-20 ${
                  activeIndex === index ? "border-amber-400 ring-2 ring-amber-400/40" : "border-white/20 opacity-75 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url || ""}
                  alt=""
                  className="size-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden"
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
