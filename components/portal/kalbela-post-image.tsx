"use client"

import { useState } from "react"
import { Newspaper } from "lucide-react"

export function KalbelaPostImage({
  src,
  alt,
  className,
  fit = "contain",
  zoomOnHover = false,
  caption,
  credit,
}: {
  src: string | null
  alt: string
  className: string
  fit?: "contain" | "cover"
  zoomOnHover?: boolean
  caption?: string | null
  credit?: string | null
}) {
  const [failed, setFailed] = useState(false)
  const image = src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`size-full ${fit === "cover" ? "object-cover" : "object-contain"} ${zoomOnHover ? "transition-transform duration-300 group-hover:scale-[1.02]" : ""}`}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="flex size-full min-h-28 items-center justify-center">
      <Newspaper className="size-8 text-[var(--theme-text-body)] opacity-40" aria-hidden="true" />
    </span>
  )

  if (caption || credit) {
    return (
      <figure className={`overflow-hidden rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] ${className}`}>
        <span className="relative block size-full overflow-hidden">
          {image}
        </span>
        <figcaption className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
          ছবি : {caption || alt || "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি"}
          {credit ? ` · ${credit}` : ""}
        </figcaption>
      </figure>
    )
  }

  return (
    <span className={`relative block overflow-hidden border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] ${className}`}>
      {image}
    </span>
  )
}
