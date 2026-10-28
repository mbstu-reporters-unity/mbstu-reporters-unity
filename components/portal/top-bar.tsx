import { MapPin } from 'lucide-react'
import { LiveClock } from './live-clock'
import { SocialLinks } from './social-links'

export function TopBar() {
  return (
    <div className="bg-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-xs sm:flex-row sm:text-sm">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 font-medium">
            <MapPin className="size-3.5" aria-hidden="true" />
            Santosh, Tangail
          </span>
          <LiveClock />
        </div>
        <SocialLinks size="sm" />
      </div>
    </div>
  )
}
