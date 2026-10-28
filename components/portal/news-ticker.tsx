import { Radio } from 'lucide-react'
import { tickerHeadlines } from '@/lib/data'

export function NewsTicker() {
  const items = [...tickerHeadlines, ...tickerHeadlines]

  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-crimson px-3 py-2.5 text-xs font-bold text-white sm:px-4 sm:text-sm">
          <Radio className="size-4 animate-pulse" aria-hidden="true" />
          <span>
            সর্বশেষ <span className="hidden sm:inline">/ LIVE UPDATES</span>
          </span>
        </div>
        <div className="group relative flex-1 overflow-hidden" aria-label="Latest headlines">
          <ul className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
            {items.map((headline, i) => (
              <li
                key={i}
                aria-hidden={i >= tickerHeadlines.length}
                className="flex items-center whitespace-nowrap px-6 py-2.5 text-sm font-medium text-navy"
              >
                <span className="mr-3 size-1.5 rounded-full bg-crimson" aria-hidden="true" />
                <a href="#general-news" className="hover:text-brand">
                  {headline}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
