import { MapPin, Music, Smile, Sparkles } from 'lucide-react'

export interface PostMetaShape {
  fb_style?: boolean
  location?: string | null
  feeling?: string | null
  music?: string | null
  ai_label?: boolean
}

export function extractPostMeta(data: unknown): PostMetaShape | null {
  if (!data || typeof data !== 'object') return null
  const raw = (data as { meta?: unknown }).meta
  if (!raw || typeof raw !== 'object') return null
  return raw as PostMetaShape
}

export function PostMetaBadges({
  data,
  compact = false,
}: {
  data: unknown
  compact?: boolean
}) {
  const meta = extractPostMeta(data)
  if (!meta) return null

  const hasAny =
    Boolean(meta.feeling) ||
    Boolean(meta.location) ||
    (!compact && Boolean(meta.music)) ||
    Boolean(meta.ai_label)

  if (!hasAny) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {meta.feeling && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 font-semibold text-amber-200">
          <Smile className="size-3 text-amber-300 shrink-0" />
          <span>{meta.feeling}</span>
        </span>
      )}

      {meta.location && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 font-semibold text-emerald-200">
          <MapPin className="size-3 text-emerald-300 shrink-0" />
          <span>{meta.location}</span>
        </span>
      )}

      {!compact && meta.music && (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-400/30 px-2.5 py-0.5 font-semibold text-purple-200">
          <Music className="size-3 text-purple-300 shrink-0" />
          <span>{meta.music}</span>
        </span>
      )}

      {meta.ai_label && (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 font-bold text-cyan-200">
          <Sparkles className="size-3 text-cyan-300 shrink-0" />
          <span>{compact ? 'AI লেবেল' : 'AI দিয়ে তৈরি / সম্পাদিত'}</span>
        </span>
      )}
    </div>
  )
}
