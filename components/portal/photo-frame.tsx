"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import type { PhotoStyle } from "@/lib/photo-style"

const KEYFRAMES = `
@keyframes pf-flow { from { background-position: 0 0 } to { background-position: 0 200% } }
@keyframes pf-wave { from { background-position: 0 0 } to { background-position: 0 100% } }
@keyframes pf-fade { 0%, 100% { opacity: 1 } 50% { opacity: .2 } }
@keyframes pf-bandpulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.05) } }
@keyframes pf-pulse {
  0%, 100% { box-shadow: 0 0 var(--pf-g1) var(--pf-c1) }
  50% { box-shadow: 0 0 var(--pf-g2) var(--pf-c2) }
}
@media (prefers-reduced-motion: reduce) { .pf-layer { animation: none !important } }
`

const layer: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" }

export function PhotoFrame({
  src,
  alt,
  style: s,
  fallback,
}: {
  src?: string | null
  alt: string
  style: PhotoStyle
  fallback?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [centered, setCentered] = useState(false)

  // স্ক্রল করে ছবি স্ক্রিনের মাঝামাঝি এলে বড় হবে
  useEffect(() => {
    if (!s.scrollGrow || !ref.current) {
      setCentered(false)
      return
    }
    const io = new IntersectionObserver(([e]) => setCentered(e.isIntersecting), {
      rootMargin: "-40% 0px -40% 0px",
    })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [s.scrollGrow])

  const b = s.bandOn ? s.bandWidth : 0
  const w = s.size
  // শেপ ১০০ হলে উচ্চতা = প্রস্থ, যাতে পূর্ণ বৃত্ত হয়
  const h = Math.round(s.size * (1 + (s.heightPct / 100 - 1) * (1 - s.shape / 100)))
  const radius = `${s.shape / 2}%`

  const grad = s.bandMode === "gradient"
  const showBand = s.bandOn && s.bandMode !== "transparent" && b > 0
  let anim = s.anim
  if (!grad && (anim === "flow" || anim === "wave")) anim = "fade"
  const dur = `${s.animSpeed}s`
  const c1 = s.color1
  const c2 = s.color2

  const band: CSSProperties = { ...layer, borderRadius: radius }
  if (!grad) band.background = c1
  else if (anim === "flow") {
    band.background = `linear-gradient(0deg, ${c1}, ${c2}, ${c1})`
    band.backgroundSize = "100% 200%"
  } else if (anim === "wave") {
    band.background = `linear-gradient(0deg, ${c1}, ${c2}, ${c1})`
    band.backgroundSize = "100% 300%"
  } else {
    band.background = `linear-gradient(${s.gradientAngle}deg, ${c1}, ${c2})`
  }
  if (anim === "flow") band.animation = `pf-flow ${dur} linear infinite`
  if (anim === "wave") band.animation = `pf-wave ${dur} ease-in-out infinite alternate`
  if (anim === "fade") band.animation = `pf-fade ${dur} ease-in-out infinite`
  if (anim === "pulse") band.animation = `pf-bandpulse ${dur} ease-in-out infinite`

  const glowColor = `color-mix(in srgb, ${c1} 75%, transparent)`
  const halo = {
    ...layer,
    borderRadius: radius,
    "--pf-c1": glowColor,
    "--pf-c2": `color-mix(in srgb, ${c2} 85%, transparent)`,
    "--pf-g1": `${s.glowOn ? Math.round(s.glowSize * 0.4) : 4}px`,
    "--pf-g2": `${Math.round((s.glowOn ? s.glowSize : 14) * 1.8)}px`,
  } as CSSProperties
  if (s.glowOn) halo.boxShadow = `0 0 ${s.glowSize}px ${Math.round(s.glowSize / 5)}px ${glowColor}`
  if (anim === "pulse") halo.animation = `pf-pulse ${dur} ease-in-out infinite`

  const lift: CSSProperties = { ...layer, borderRadius: radius }
  if (s.shadowOn) {
    lift.boxShadow = `0 ${Math.round(s.shadowSize * 0.5)}px ${s.shadowSize}px rgba(0,0,0,0.35)`
  }

  const active = (s.hoverGrow && hover) || (s.scrollGrow && centered)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        flexShrink: 0,
        width: w + 2 * b,
        height: h + 2 * b,
        transform: active ? `scale(${s.growScale / 100})` : "none",
        transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
        zIndex: active ? 20 : 0,
      }}
    >
      <style>{KEYFRAMES}</style>
      <div aria-hidden="true" className="pf-layer" style={lift} />
      <div aria-hidden="true" className="pf-layer" style={halo} />
      {showBand && <div aria-hidden="true" className="pf-layer" style={band} />}
      <div
        style={{
          position: "absolute",
          inset: b,
          borderRadius: radius,
          overflow: "hidden",
          background: "#e5e7eb",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
        ) : (
          fallback
        )}
      </div>
    </div>
  )
}
