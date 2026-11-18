"use client"

import { useEffect, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  FileText,
  Globe,
  LayoutGrid,
  Menu,
  Palette,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react"
import { uploadImage } from "../../lib/sb"
import {
  DEFAULT_SITE_SETTINGS,
  getSiteSettings,
  saveSiteSettings,
  type DefaultThemeId,
  type SiteSettings,
  type StatIconKey,
} from "../../lib/site-settings"

const inp =
  "w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
const smallInp =
  "w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 focus:outline-none focus:border-cyan-600"
const saveBtn =
  "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl py-3 font-bold text-sm transition disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"

type SubTab = "branding" | "menu" | "sections" | "stats" | "footer" | "pages"

const SUB_TABS: Array<{ key: SubTab; label: string; icon: typeof Palette }> = [
  { key: "branding", label: "ব্র্যান্ডিং ও টপ-বার", icon: Palette },
  { key: "menu", label: "মেনুবার", icon: Menu },
  { key: "sections", label: "হোম সেকশন", icon: LayoutGrid },
  { key: "stats", label: "পরিসংখ্যান", icon: BarChart3 },
  { key: "footer", label: "ফুটার ও যোগাযোগ", icon: Phone },
  { key: "pages", label: "সাব-পেজ ও অন্যান্য", icon: FileText },
]

export default function SiteSettingsManager({
  token,
  shrink,
}: {
  token: string
  shrink: (f: File) => Promise<Blob>
}) {
  const [subTab, setSubTab] = useState<SubTab>("branding")
  const [cfg, setCfg] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null)
  const [univLogoFile, setUnivLogoFile] = useState<File | null>(null)

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        setCfg(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSaveAll() {
    setBusy(true)
    setMsg("")
    try {
      const nextCfg: SiteSettings = structuredClone(cfg)

      if (orgLogoFile) {
        setMsg("সংগঠনের লোগো আপলোড হচ্ছে...")
        const url = await uploadImage(token, await shrink(orgLogoFile))
        nextCfg.branding.orgLogoUrl = url
        setOrgLogoFile(null)
      }

      if (univLogoFile) {
        setMsg("বিশ্ববিদ্যালয়ের লোগো আপলোড হচ্ছে...")
        const url = await uploadImage(token, await shrink(univLogoFile))
        nextCfg.branding.univLogoUrl = url
        setUnivLogoFile(null)
      }

      setMsg("সেটিংস সংরক্ষণ হচ্ছে...")
      await saveSiteSettings(token, nextCfg)
      setCfg(nextCfg)
      setMsg("✅ সাইট সেটিংস সফলভাবে সেভ ও লাইভ হয়েছে!")
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "সেভ করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  function handleResetDefaults() {
    if (!confirm("সব সাইট সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান? (সেভ বাটনে চাপার পর কার্যকর হবে)")) return
    setCfg(structuredClone(DEFAULT_SITE_SETTINGS))
    setOrgLogoFile(null)
    setUnivLogoFile(null)
    setMsg("⚠️ ডিফল্ট সেটিংস লোড হয়েছে — স্থায়ী করতে নিচে 'সেভ করুন' চাপুন।")
  }

  function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir
    const arr = [...cfg.homeSections.sections]
    if (target < 0 || target >= arr.length) return
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: arr } })
  }

  function moveStat(index: number, dir: -1 | 1) {
    const target = index + dir
    const arr = [...cfg.stats.items]
    if (target < 0 || target >= arr.length) return
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    setCfg({ ...cfg, stats: { ...cfg.stats, items: arr } })
  }

  function moveQuickLink(index: number, dir: -1 | 1) {
    const target = index + dir
    const arr = [...cfg.footer.quickLinks]
    if (target < 0 || target >= arr.length) return
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    setCfg({ ...cfg, footer: { ...cfg.footer, quickLinks: arr } })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
        সাইট সেটিংস লোড হচ্ছে...
      </div>
    )
  }

  const orgLogoPreview = orgLogoFile ? URL.createObjectURL(orgLogoFile) : cfg.branding.orgLogoUrl
  const univLogoPreview = univLogoFile ? URL.createObjectURL(univLogoFile) : cfg.branding.univLogoUrl

  return (
    <div className="space-y-4 text-slate-800">
      {/* হেডার ও ৬টি সাব-ট্যাব */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Globe className="size-5 text-cyan-700" />
              <span>সাইট সেটিংস (Site Settings)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ওয়েবসাইটের লোগো, নাম, টপ-বার, মেনুবার, হোমপেজ সেকশন, পরিসংখ্যান ও ফুটার—সবকিছু এখান থেকে নিয়ন্ত্রণ করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>ডিফল্ট</span>
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {SUB_TABS.map((t) => {
            const Icon = t.icon
            const active = subTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSubTab(t.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 cursor-pointer transition ${
                  active
                    ? "bg-slate-900 text-white border-slate-900 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className={`size-3.5 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold text-center shadow-xs">
          {msg}
        </div>
      )}

      {/* ==================== ১. ব্র্যান্ডিং ও টপ-বার ==================== */}
      {subTab === "branding" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ১. সংগঠনের লোগো ও নাম (হেডার বামপাশ)
            </h3>

            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border">
              {orgLogoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={orgLogoPreview}
                  alt="Org Logo"
                  className="size-12 rounded-full object-cover border bg-white shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer">
                  <Upload className="size-3.5" />
                  <span>সংগঠনের লোগো বদলান</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setOrgLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
                {orgLogoFile && (
                  <p className="text-[11px] text-emerald-700 font-bold truncate">
                    ✓ নির্বাচিত: {orgLogoFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  সংগঠনের নাম (English):
                </label>
                <input
                  className={inp}
                  value={cfg.branding.orgNameEn}
                  onChange={(e) =>
                    setCfg({ ...cfg, branding: { ...cfg.branding, orgNameEn: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  সংগঠনের নাম (বাংলা):
                </label>
                <input
                  className={inp}
                  value={cfg.branding.orgNameBn}
                  onChange={(e) =>
                    setCfg({ ...cfg, branding: { ...cfg.branding, orgNameBn: e.target.value } })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                সংক্ষিপ্ত ইংরেজি নাম (EN মোডের জন্য):
              </label>
              <input
                className={inp}
                value={cfg.branding.orgShortEn}
                onChange={(e) =>
                  setCfg({ ...cfg, branding: { ...cfg.branding, orgShortEn: e.target.value } })
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ২. বিশ্ববিদ্যালয়ের লোগো ও লিংক (হেডার ডানপাশ)
            </h3>

            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border">
              {univLogoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={univLogoPreview}
                  alt="University Logo"
                  className="size-12 rounded-full object-cover border bg-white shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer">
                  <Upload className="size-3.5" />
                  <span>বিশ্ববিদ্যালয়ের লোগো বদলান</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setUnivLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
                {univLogoFile && (
                  <p className="text-[11px] text-emerald-700 font-bold truncate">
                    ✓ নির্বাচিত: {univLogoFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  বিশ্ববিদ্যালয় ওয়েবসাইট লিংক:
                </label>
                <input
                  className={inp}
                  value={cfg.branding.univLinkUrl}
                  onChange={(e) =>
                    setCfg({ ...cfg, branding: { ...cfg.branding, univLinkUrl: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  পাশের টেক্সট (ঐচ্ছিক, শুধু ডেস্কটপ):
                </label>
                <input
                  className={inp}
                  placeholder="ফাঁকা রাখলে শুধু লোগো দেখাবে"
                  value={cfg.branding.univText}
                  onChange={(e) =>
                    setCfg({ ...cfg, branding: { ...cfg.branding, univText: e.target.value } })
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ৩. টপ-বার (তারিখ, ঘড়ি, ভাষা, লোকেশন ও থিম)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
              {[
                { k: "showTopBar", l: "পুরো টপ-বার দেখান" },
                { k: "showClock", l: "তারিখ ও লাইভ ঘড়ি" },
                { k: "showLangSwitcher", l: "বাংলা / EN সুইচার" },
                { k: "showLocation", l: "লোকেশন ব্যাজ" },
                { k: "showThemeSwitcher", l: "৪টি থিম বাটন" },
                { k: "showSocialLinks", l: "টপ-বার সোশ্যাল আইকন" },
              ].map((sw) => (
                <label
                  key={sw.k}
                  className="flex items-center gap-2 p-2.5 rounded-xl border bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean((cfg.topBar as any)[sw.k])}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        topBar: { ...cfg.topBar, [sw.k]: e.target.checked },
                      })
                    }
                    className="size-4 accent-cyan-700"
                  />
                  <span>{sw.l}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  লোকেশন টেক্সট (বাংলা):
                </label>
                <input
                  className={inp}
                  value={cfg.topBar.locationBn}
                  onChange={(e) =>
                    setCfg({ ...cfg, topBar: { ...cfg.topBar, locationBn: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  লোকেশন টেক্সট (English):
                </label>
                <input
                  className={inp}
                  value={cfg.topBar.locationEn}
                  onChange={(e) =>
                    setCfg({ ...cfg, topBar: { ...cfg.topBar, locationEn: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ডিফল্ট ভাষা:
                </label>
                <select
                  className={inp}
                  value={cfg.topBar.defaultLang}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      topBar: { ...cfg.topBar, defaultLang: e.target.value as "bn" | "en" },
                    })
                  }
                >
                  <option value="bn">বাংলা</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ডিফল্ট গ্লাস থিম:
                </label>
                <select
                  className={inp}
                  value={cfg.topBar.defaultTheme}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      topBar: { ...cfg.topBar, defaultTheme: e.target.value as DefaultThemeId },
                    })
                  }
                >
                  <option value="ocean-glass">১. ব্লু লিকুইড গ্লাস</option>
                  <option value="sunset-peach">২. সানসেট পিচ গ্লাস</option>
                  <option value="pure-frost">৩. স্নো হোয়াইট ফ্রস্টেড</option>
                  <option value="midnight-neon">৪. মিডনাইট নিয়ন গ্লাস</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ২. মেনুবার কন্ট্রোল ==================== */}
      {subTab === "menu" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              মেনুবারের স্থায়ী আইটেমসমূহ (সংবাদের ক্যাটাগরি বাদে)
            </h3>
            <div className="space-y-2">
              {cfg.menu.items.map((it, idx) => (
                <div
                  key={it.id}
                  className="p-2.5 rounded-xl border bg-slate-50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{it.defaultLabel}</span>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={it.visible}
                        onChange={(e) => {
                          const next = [...cfg.menu.items]
                          next[idx] = { ...next[idx], visible: e.target.checked }
                          setCfg({ ...cfg, menu: { ...cfg.menu, items: next } })
                        }}
                        className="size-4 accent-cyan-700"
                      />
                      <span>{it.visible ? "দৃশ্যমান" : "লুকানো"}</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={smallInp}
                      placeholder="বাংলা নাম"
                      value={it.labelBn}
                      onChange={(e) => {
                        const next = [...cfg.menu.items]
                        next[idx] = { ...next[idx], labelBn: e.target.value }
                        setCfg({ ...cfg, menu: { ...cfg.menu, items: next } })
                      }}
                    />
                    <input
                      className={smallInp}
                      placeholder="English Name"
                      value={it.labelEn}
                      onChange={(e) => {
                        const next = [...cfg.menu.items]
                        next[idx] = { ...next[idx], labelEn: e.target.value }
                        setCfg({ ...cfg, menu: { ...cfg.menu, items: next } })
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                নতুন কাস্টম মেনু লিংক ({cfg.menu.customLinks.length}টি)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setCfg({
                    ...cfg,
                    menu: {
                      ...cfg.menu,
                      customLinks: [
                        ...cfg.menu.customLinks,
                        {
                          id: `cm-${Date.now()}`,
                          labelBn: "",
                          labelEn: "",
                          href: "",
                          external: false,
                          placement: "root",
                          visible: true,
                        },
                      ],
                    },
                  })
                }
                className="inline-flex items-center gap-1 rounded-xl bg-cyan-700 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                <Plus className="size-3.5" /> লিংক যোগ
              </button>
            </div>

            {cfg.menu.customLinks.map((cl, idx) => (
              <div key={cl.id} className="p-3 rounded-xl border bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cl.visible}
                      onChange={(e) => {
                        const next = [...cfg.menu.customLinks]
                        next[idx] = { ...next[idx], visible: e.target.checked }
                        setCfg({ ...cfg, menu: { ...cfg.menu, customLinks: next } })
                      }}
                      className="size-4 accent-cyan-700"
                    />
                    <span>চালু রাখুন</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCfg({
                        ...cfg,
                        menu: {
                          ...cfg.menu,
                          customLinks: cfg.menu.customLinks.filter((_, i) => i !== idx),
                        },
                      })
                    }
                    className="text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> মুছুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className={smallInp}
                    placeholder="মেনু নাম (বাংলা) *"
                    value={cl.labelBn}
                    onChange={(e) => {
                      const next = [...cfg.menu.customLinks]
                      next[idx] = { ...next[idx], labelBn: e.target.value }
                      setCfg({ ...cfg, menu: { ...cfg.menu, customLinks: next } })
                    }}
                  />
                  <input
                    className={smallInp}
                    placeholder="Menu Name (English)"
                    value={cl.labelEn}
                    onChange={(e) => {
                      const next = [...cfg.menu.customLinks]
                      next[idx] = { ...next[idx], labelEn: e.target.value }
                      setCfg({ ...cfg, menu: { ...cfg.menu, customLinks: next } })
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className={smallInp}
                    placeholder="লিংক (/notices বা https://...)"
                    value={cl.href}
                    onChange={(e) => {
                      const next = [...cfg.menu.customLinks]
                      next[idx] = {
                        ...next[idx],
                        href: e.target.value,
                        external: /^https?:\/\//i.test(e.target.value.trim()),
                      }
                      setCfg({ ...cfg, menu: { ...cfg.menu, customLinks: next } })
                    }}
                  />
                  <select
                    className={smallInp}
                    value={cl.placement}
                    onChange={(e) => {
                      const next = [...cfg.menu.customLinks]
                      next[idx] = { ...next[idx], placement: e.target.value as any }
                      setCfg({ ...cfg, menu: { ...cfg.menu, customLinks: next } })
                    }}
                  >
                    <option value="root">মূল মেনুতে দেখাবে</option>
                    <option value="university">বিশ্ববিদ্যালয়-এর ভেতরে</option>
                    <option value="news-media">সংবাদ ও মিডিয়া-র ভেতরে</option>
                    <option value="community-clubs">কমিউনিটি ও ক্লাব-এর ভেতরে</option>
                    <option value="council-about">পরিষদ ও পরিচিতি-র ভেতরে</option>
                  </select>
                </div>
              </div>
            ))}

            {cfg.menu.customLinks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-3">
                কোনো কাস্টম মেনু লিংক যোগ করা হয়নি।
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==================== ৩. হোমপেজ সেকশন ==================== */}
      {subTab === "sections" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              হোমপেজের ডিজিটাল নোটিশ বোর্ডে সর্বোচ্চ কয়টি নোটিশ দেখাবে:
            </label>
            <input
              type="number"
              min={1}
              max={30}
              className={inp}
              value={cfg.homeSections.homeNoticesLimit}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  homeSections: {
                    ...cfg.homeSections,
                    homeNoticesLimit: Math.max(1, Math.min(30, Number(e.target.value) || 5)),
                  },
                })
              }
            />
          </div>

          <div className="space-y-3">
            {cfg.homeSections.sections.map((sec, idx) => (
              <div
                key={sec.key}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2 border-b pb-2">
                  <span className="font-bold text-sm text-slate-900">{sec.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, -1)}
                      className="p-1.5 rounded-lg border bg-slate-50 disabled:opacity-30 cursor-pointer"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cfg.homeSections.sections.length - 1}
                      onClick={() => moveSection(idx, 1)}
                      className="p-1.5 rounded-lg border bg-slate-50 disabled:opacity-30 cursor-pointer"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <label className="ml-1 flex items-center gap-1 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.visible}
                        onChange={(e) => {
                          const next = [...cfg.homeSections.sections]
                          next[idx] = { ...next[idx], visible: e.target.checked }
                          setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: next } })
                        }}
                        className="size-4 accent-cyan-700"
                      />
                      <span>{sec.visible ? "চালু" : "বন্ধ"}</span>
                    </label>
                  </div>
                </div>

                {sec.key !== "hero" && (
                  <div className="space-y-2">
                    <input
                      className={smallInp}
                      placeholder="উপরের ছোট ট্যাগ / Eyebrow (ঐচ্ছিক)"
                      value={sec.eyebrow}
                      onChange={(e) => {
                        const next = [...cfg.homeSections.sections]
                        next[idx] = { ...next[idx], eyebrow: e.target.value }
                        setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: next } })
                      }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className={smallInp}
                        placeholder="শিরোনাম (বাংলা)"
                        value={sec.titleBn}
                        onChange={(e) => {
                          const next = [...cfg.homeSections.sections]
                          next[idx] = { ...next[idx], titleBn: e.target.value }
                          setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: next } })
                        }}
                      />
                      <input
                        className={smallInp}
                        placeholder="Title (English)"
                        value={sec.titleEn}
                        onChange={(e) => {
                          const next = [...cfg.homeSections.sections]
                          next[idx] = { ...next[idx], titleEn: e.target.value }
                          setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: next } })
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className={smallInp}
                        placeholder="উপশিরোনাম (বাংলা)"
                        value={sec.subtitleBn}
                        onChange={(e) => {
                          const next = [...cfg.homeSections.sections]
                          next[idx] = { ...next[idx], subtitleBn: e.target.value }
                          setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: next } })
                        }}
                      />
                      <input
                        className={smallInp}
                        placeholder="Subtitle (English)"
                        value={sec.subtitleEn}
                        onChange={(e) => {
                          const next = [...cfg.homeSections.sections]
                          next[idx] = { ...next[idx], subtitleEn: e.target.value }
                          setCfg({ ...cfg, homeSections: { ...cfg.homeSections, sections: next } })
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ৪. পরিসংখ্যান (Stats) ==================== */}
      {subTab === "stats" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.stats.showStats}
                onChange={(e) =>
                  setCfg({ ...cfg, stats: { ...cfg.stats, showStats: e.target.checked } })
                }
                className="size-4 accent-cyan-700"
              />
              <span>হোমপেজে পরিসংখ্যান কার্ডগুলো দেখান</span>
            </label>

            <button
              type="button"
              onClick={() =>
                setCfg({
                  ...cfg,
                  stats: {
                    ...cfg.stats,
                    items: [
                      ...cfg.stats.items,
                      { id: `stat-${Date.now()}`, value: "10+", labelEn: "New Stat", labelBn: "নতুন তথ্য", icon: "star" },
                    ],
                  },
                })
              }
              className="inline-flex items-center gap-1 rounded-xl bg-cyan-700 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              <Plus className="size-3.5" /> কার্ড যোগ
            </button>
          </div>

          <div className="space-y-2.5">
            {cfg.stats.items.map((st, idx) => (
              <div key={st.id} className="p-3 rounded-xl border bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">কার্ড #{idx + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveStat(idx, -1)}
                      className="p-1 rounded border bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cfg.stats.items.length - 1}
                      onClick={() => moveStat(idx, 1)}
                      className="p-1 rounded border bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCfg({
                          ...cfg,
                          stats: {
                            ...cfg.stats,
                            items: cfg.stats.items.filter((_, i) => i !== idx),
                          },
                        })
                      }
                      className="text-rose-600 font-bold ml-1 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={smallInp}
                    placeholder="মান (যেমন: 2026 বা 25+)"
                    value={st.value}
                    onChange={(e) => {
                      const next = [...cfg.stats.items]
                      next[idx] = { ...next[idx], value: e.target.value }
                      setCfg({ ...cfg, stats: { ...cfg.stats, items: next } })
                    }}
                  />
                  <select
                    className={smallInp}
                    value={st.icon}
                    onChange={(e) => {
                      const next = [...cfg.stats.items]
                      next[idx] = { ...next[idx], icon: e.target.value as StatIconKey }
                      setCfg({ ...cfg, stats: { ...cfg.stats, items: next } })
                    }}
                  >
                    <option value="calendar">📅 ক্যালেন্ডার</option>
                    <option value="users">👥 সদস্য</option>
                    <option value="globe">🌐 বিশ্ব/কভারেজ</option>
                    <option value="newspaper">📰 সংবাদ</option>
                    <option value="award">🏆 পুরস্কার</option>
                    <option value="star">⭐ তারা</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={smallInp}
                    placeholder="বাংলা লেবেল"
                    value={st.labelBn}
                    onChange={(e) => {
                      const next = [...cfg.stats.items]
                      next[idx] = { ...next[idx], labelBn: e.target.value }
                      setCfg({ ...cfg, stats: { ...cfg.stats, items: next } })
                    }}
                  />
                  <input
                    className={smallInp}
                    placeholder="English Label"
                    value={st.labelEn}
                    onChange={(e) => {
                      const next = [...cfg.stats.items]
                      next[idx] = { ...next[idx], labelEn: e.target.value }
                      setCfg({ ...cfg, stats: { ...cfg.stats, items: next } })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ৫. ফুটার ও যোগাযোগ ==================== */}
      {subTab === "footer" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ১. পরিচিতি, ঠিকানা, যোগাযোগ ও কপিরাইট
            </h3>
            <textarea
              className={inp}
              rows={2}
              placeholder="ফুটার পরিচিতি (বাংলা)"
              value={cfg.footer.descriptionBn}
              onChange={(e) =>
                setCfg({ ...cfg, footer: { ...cfg.footer, descriptionBn: e.target.value } })
              }
            />
            <textarea
              className={inp}
              rows={2}
              placeholder="Footer Description (English)"
              value={cfg.footer.descriptionEn}
              onChange={(e) =>
                setCfg({ ...cfg, footer: { ...cfg.footer, descriptionEn: e.target.value } })
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="অফিসের ঠিকানা (বাংলা)"
                value={cfg.footer.addressBn}
                onChange={(e) =>
                  setCfg({ ...cfg, footer: { ...cfg.footer, addressBn: e.target.value } })
                }
              />
              <input
                className={inp}
                placeholder="Office Address (English)"
                value={cfg.footer.addressEn}
                onChange={(e) =>
                  setCfg({ ...cfg, footer: { ...cfg.footer, addressEn: e.target.value } })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="ফোন নম্বর"
                value={cfg.footer.phone}
                onChange={(e) =>
                  setCfg({ ...cfg, footer: { ...cfg.footer, phone: e.target.value } })
                }
              />
              <input
                className={inp}
                placeholder="ইমেইল"
                value={cfg.footer.email}
                onChange={(e) =>
                  setCfg({ ...cfg, footer: { ...cfg.footer, email: e.target.value } })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="কপিরাইট লেখা (বাংলা)"
                value={cfg.footer.copyrightBn}
                onChange={(e) =>
                  setCfg({ ...cfg, footer: { ...cfg.footer, copyrightBn: e.target.value } })
                }
              />
              <input
                className={inp}
                placeholder="Copyright Text (English)"
                value={cfg.footer.copyrightEn}
                onChange={(e) =>
                  setCfg({ ...cfg, footer: { ...cfg.footer, copyrightEn: e.target.value } })
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ২. সোশ্যাল মিডিয়া লিংকসমূহ (টপ-বার ও ফুটার)
            </h3>
            {cfg.footer.socialLinks.map((sl, idx) => (
              <div key={sl.slug} className="p-2.5 rounded-xl border bg-slate-50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{sl.name}</span>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sl.visible}
                      onChange={(e) => {
                        const next = [...cfg.footer.socialLinks]
                        next[idx] = { ...next[idx], visible: e.target.checked }
                        setCfg({ ...cfg, footer: { ...cfg.footer, socialLinks: next } })
                      }}
                      className="size-4 accent-cyan-700"
                    />
                    <span>{sl.visible ? "দেখান" : "লুকান"}</span>
                  </label>
                </div>
                <input
                  className={smallInp}
                  placeholder="https://..."
                  value={sl.href}
                  onChange={(e) => {
                    const next = [...cfg.footer.socialLinks]
                    next[idx] = { ...next[idx], href: e.target.value }
                    setCfg({ ...cfg, footer: { ...cfg.footer, socialLinks: next } })
                  }}
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                ৩. ফুটার দ্রুত লিংক ({cfg.footer.quickLinks.length}টি)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setCfg({
                    ...cfg,
                    footer: {
                      ...cfg.footer,
                      quickLinks: [
                        ...cfg.footer.quickLinks,
                        { id: `ql-${Date.now()}`, labelBn: "", labelEn: "", href: "/", visible: true },
                      ],
                    },
                  })
                }
                className="inline-flex items-center gap-1 rounded-xl bg-cyan-700 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                <Plus className="size-3.5" /> লিংক যোগ
              </button>
            </div>

            {cfg.footer.quickLinks.map((ql, idx) => (
              <div key={ql.id} className="p-2.5 rounded-xl border bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ql.visible}
                      onChange={(e) => {
                        const next = [...cfg.footer.quickLinks]
                        next[idx] = { ...next[idx], visible: e.target.checked }
                        setCfg({ ...cfg, footer: { ...cfg.footer, quickLinks: next } })
                      }}
                      className="size-4 accent-cyan-700"
                    />
                    <span>দৃশ্যমান</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuickLink(idx, -1)}
                      className="p-1 rounded border bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cfg.footer.quickLinks.length - 1}
                      onClick={() => moveQuickLink(idx, 1)}
                      className="p-1 rounded border bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCfg({
                          ...cfg,
                          footer: {
                            ...cfg.footer,
                            quickLinks: cfg.footer.quickLinks.filter((_, i) => i !== idx),
                          },
                        })
                      }
                      className="text-rose-600 ml-1 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    className={smallInp}
                    placeholder="বাংলা নাম"
                    value={ql.labelBn}
                    onChange={(e) => {
                      const next = [...cfg.footer.quickLinks]
                      next[idx] = { ...next[idx], labelBn: e.target.value }
                      setCfg({ ...cfg, footer: { ...cfg.footer, quickLinks: next } })
                    }}
                  />
                  <input
                    className={smallInp}
                    placeholder="English Label"
                    value={ql.labelEn}
                    onChange={(e) => {
                      const next = [...cfg.footer.quickLinks]
                      next[idx] = { ...next[idx], labelEn: e.target.value }
                      setCfg({ ...cfg, footer: { ...cfg.footer, quickLinks: next } })
                    }}
                  />
                  <input
                    className={smallInp}
                    placeholder="লিংক (#about বা /notices)"
                    value={ql.href}
                    onChange={(e) => {
                      const next = [...cfg.footer.quickLinks]
                      next[idx] = { ...next[idx], href: e.target.value }
                      setCfg({ ...cfg, footer: { ...cfg.footer, quickLinks: next } })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ৬. সাব-পেজ ও অন্যান্য ==================== */}
      {subTab === "pages" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ১. ছবি, পোস্ট ও গ্লোবাল ফিচার সেটিংস
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ছবিতে ক্লিক করলে ভিউ মোড (সবার জন্য ডিফল্ট):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setCfg({
                      ...cfg,
                      behaviorAndPages: { ...cfg.behaviorAndPages, photoClickMode: "lightbox" },
                    })
                  }
                  className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                    cfg.behaviorAndPages.photoClickMode === "lightbox"
                      ? "bg-cyan-700 text-white border-cyan-700"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  স্লাইড লাইটবক্স
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCfg({
                      ...cfg,
                      behaviorAndPages: { ...cfg.behaviorAndPages, photoClickMode: "album" },
                    })
                  }
                  className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                    cfg.behaviorAndPages.photoClickMode === "album"
                      ? "bg-cyan-700 text-white border-cyan-700"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  ভার্টিকাল অ্যালবাম
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                পোস্টে লেখকের নাম ফাঁকা থাকলে ডিফল্ট নাম:
              </label>
              <input
                className={inp}
                value={cfg.behaviorAndPages.defaultAuthorName}
                onChange={(e) =>
                  setCfg({
                    ...cfg,
                    behaviorAndPages: {
                      ...cfg.behaviorAndPages,
                      defaultAuthorName: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              {[
                { k: "showReactions", l: "রিয়েক্ট বাটন" },
                { k: "showComments", l: "মন্তব্য বাটন" },
                { k: "showShare", l: "শেয়ার বাটন" },
              ].map((sw) => (
                <label
                  key={sw.k}
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean((cfg.behaviorAndPages as any)[sw.k])}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        behaviorAndPages: {
                          ...cfg.behaviorAndPages,
                          [sw.k]: e.target.checked,
                        },
                      })
                    }
                    className="size-4 accent-cyan-700"
                  />
                  <span>{sw.l}</span>
                </label>
              ))}
            </div>

            <div className="p-3 rounded-xl border bg-amber-50/70 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cfg.behaviorAndPages.announcementEnabled}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      behaviorAndPages: {
                        ...cfg.behaviorAndPages,
                        announcementEnabled: e.target.checked,
                      },
                    })
                  }
                  className="size-4 accent-amber-700"
                />
                <span>📢 সাইট-ব্যাপী জরুরি ঘোষণা ব্যানার চালু করুন</span>
              </label>
              {cfg.behaviorAndPages.announcementEnabled && (
                <div className="space-y-2">
                  <input
                    className={smallInp}
                    placeholder="ঘোষণার লেখা..."
                    value={cfg.behaviorAndPages.announcementText}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        behaviorAndPages: {
                          ...cfg.behaviorAndPages,
                          announcementText: e.target.value,
                        },
                      })
                    }
                  />
                  <input
                    className={smallInp}
                    placeholder="বিস্তারিত লিংক (ঐচ্ছিক)"
                    value={cfg.behaviorAndPages.announcementLink}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        behaviorAndPages: {
                          ...cfg.behaviorAndPages,
                          announcementLink: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ২. অন্যান্য পেজগুলোর হেডার ব্যানার ও শিরোনাম
            </h3>

            {(
              [
                { k: "editorial", l: "সম্পাদকীয় ও মতামত (/editorial)" },
                { k: "administration", l: "প্রশাসন ও দপ্তর (/administration)" },
                { k: "notices", l: "ডিজিটাল নোটিশ (/notices)" },
                { k: "studentCorner", l: "স্টুডেন্ট কর্নার (/student-corner)" },
                { k: "associations", l: "অন্যান্য সাংবাদিক সমিতি (/associations)" },
                { k: "socialSites", l: "সোশ্যাল সাইট ও গ্রুপ (/social-sites)" },
                { k: "council", l: "ডিরেক্টর প্যানেল (/council)" },
              ] as const
            ).map((pg) => {
              const cur = cfg.behaviorAndPages.subPages[pg.k]
              return (
                <div key={pg.k} className="p-3 rounded-xl border bg-slate-50 space-y-2 text-xs">
                  <p className="font-bold text-slate-800">{pg.l}</p>
                  <input
                    className={smallInp}
                    placeholder="ছোট ট্যাগ / Eyebrow"
                    value={cur.eyebrow}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        behaviorAndPages: {
                          ...cfg.behaviorAndPages,
                          subPages: {
                            ...cfg.behaviorAndPages.subPages,
                            [pg.k]: { ...cur, eyebrow: e.target.value },
                          },
                        },
                      })
                    }
                  />
                  <input
                    className={smallInp}
                    placeholder="মূল শিরোনাম"
                    value={cur.title}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        behaviorAndPages: {
                          ...cfg.behaviorAndPages,
                          subPages: {
                            ...cfg.behaviorAndPages.subPages,
                            [pg.k]: { ...cur, title: e.target.value },
                          },
                        },
                      })
                    }
                  />
                  <textarea
                    rows={2}
                    className={smallInp}
                    placeholder="বর্ণনা / সাবটাইটেল"
                    value={cur.subtitle}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        behaviorAndPages: {
                          ...cfg.behaviorAndPages,
                          subPages: {
                            ...cfg.behaviorAndPages.subPages,
                            [pg.k]: { ...cur, subtitle: e.target.value },
                          },
                        },
                      })
                    }
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ফিক্সড/নিচের সেভ বাটন */}
      <div className="sticky bottom-3 z-20 bg-white/95 backdrop-blur p-3 rounded-2xl border border-slate-200 shadow-xl">
        <button type="button" onClick={handleSaveAll} disabled={busy} className={saveBtn}>
          <Save className="size-4" />
          <span>{busy ? "সংরক্ষণ হচ্ছে..." : "সব সাইট সেটিংস সেভ করুন"}</span>
        </button>
      </div>
    </div>
  )
}
