import { MapPin } from 'lucide-react'
import { LiveClock } from './live-clock'
import { SocialLinks } from './social-links'
import { LangSwitcher } from './lang-switcher'
import { ThemeSwitcher } from './theme-switcher'
import { Tx } from '@/lib/i18n'

export function TopBar() {
  return (
    <div className="bg-[#071030]/95 text-white border-b border-white/10 backdrop-blur-xl relative z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 space-y-2">
        
        {/* ১ম সারি (উপরে): বামে ক্যালেন্ডার ও তারিখ | ডানে ঘড়ি ও লাইভ সময় */}
        <div className="w-full">
          <LiveClock />
        </div>

        {/* ২য় সারি (নিচে): বামে ভাষা (বাংলা/EN) | মাঝে লোকেশন (সন্তোষ, টাঙ্গাইল) | ডানে ৪টি থিম */}
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="shrink-0">
            <LangSwitcher />
          </div>

          <div className="flex justify-center flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-600/80 border border-cyan-400/30 px-2.5 sm:px-3 py-1 font-semibold text-white shadow-xs text-[11px] sm:text-xs whitespace-nowrap">
              <MapPin className="size-3 text-cyan-200 shrink-0" aria-hidden="true" />
              <Tx bn="সন্তোষ, টাঙ্গাইল" en="Santosh, Tangail" />
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <ThemeSwitcher />
            <div className="hidden lg:block">
              <SocialLinks size="sm" tooltip="bottom" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
