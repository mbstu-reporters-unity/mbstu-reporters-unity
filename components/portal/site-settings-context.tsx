'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_SITE_SETTINGS,
  getSiteSettings,
  normalizeUniversityLogoUrl,
  type SiteSettings,
} from '@/lib/site-settings'
import { useLang } from '@/lib/i18n'

const CACHE_KEY = 'mbstu_site_settings_cache_v1'

const Ctx = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)
  const { setLang } = useLang()

  useEffect(() => {
    let alive = true

    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SiteSettings
        if (parsed?.branding && parsed?.footer) {
          setSettings({
            ...parsed,
            branding: {
              ...parsed.branding,
              univLogoUrl: normalizeUniversityLogoUrl(parsed.branding.univLogoUrl),
            },
          })
        }
      }
    } catch {}

    getSiteSettings()
      .then((fresh) => {
        if (!alive) return
        setSettings(fresh)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
          if (!localStorage.getItem('mbstu_theme') && fresh.topBar.defaultTheme) {
            document.documentElement.setAttribute('data-theme', fresh.topBar.defaultTheme)
          }
          if (!localStorage.getItem('mbstu_lang') && fresh.topBar.defaultLang) {
            setLang(fresh.topBar.defaultLang)
          }
        } catch {}
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [setLang])

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>
}

export function useSiteSettings(): SiteSettings {
  return useContext(Ctx)
}
