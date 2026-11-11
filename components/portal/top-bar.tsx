import { MapPin } from 'lucide-react'
import { LiveClock } from './live-clock'
import { SocialLinks } from './social-links'
import { LangSwitcher } from './lang-switcher'
import { ThemeSwitcher } from './theme-switcher'
import { Tx } from '@/lib/i18n'

export function TopBar() {
  return (
    <div className="bg-[#071030]/95 text-white border-b border-white/10 backdrop-blur-xl relative z-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-1.5 gap-x-2 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs">
        
        {/* লোকেশন ও লাইভ ঘড়ি */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-600/80 border border-cyan-400/30 px-2.5 py-0.5 font-semibold text-white shadow-xs">
            <MapPin className="size-3 text-cyan-200" aria-hidden="true" />
            <Tx bn="সন্তোষ, টাঙ্গাইল" en="Santosh, Tangail" />
          </span>
          <LiveClock />
        </div>

        {/* ভাষা, থিম ও সোশ্যাল লিঙ্ক */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <LangSwitcher />
          <ThemeSwitcher />
          <div className="hidden sm:block">
            <SocialLinks size="sm" tooltip="bottom" />
          </div>
        </div>

      </div>
    </div>
  )
}
