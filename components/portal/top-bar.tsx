import { MapPin } from 'lucide-react'
import { LiveClock } from './live-clock'
import { SocialLinks } from './social-links'
import { LangSwitcher } from './lang-switcher'
import { ThemeSwitcher } from './theme-switcher'
import { Tx } from '@/lib/i18n'

export function TopBar() {
  return (
    <div className="bg-[#071030]/95 text-white border-b border-white/10 backdrop-blur-xl relative z-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-xs sm:flex-row sm:text-sm">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600/80 border border-cyan-400/30 px-3 py-1 font-semibold text-white shadow-xs">
            <MapPin className="size-3.5 text-cyan-200" aria-hidden="true" />
            <Tx bn="সন্তোষ, টাঙ্গাইল" en="Santosh, Tangail" />
          </span>
          <LiveClock />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <LangSwitcher />
          <ThemeSwitcher />
          <SocialLinks size="sm" tooltip="bottom" />
        </div>
      </div>
    </div>
  )
}
