"use client"

import { useState } from "react"
import { Newspaper } from "lucide-react"

export function KalbelaPostImage({
  src,
  alt,
  className,
}: {
  src: string | null
  alt: string
  className: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <span className={`relative block overflow-hidden bg-slate-950/80 ${className}`}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex size-full min-h-28 items-center justify-center">
          <Newspaper className="size-8 text-white/30" aria-hidden="true" />
        </span>
      )}
    </span>
  )
}
