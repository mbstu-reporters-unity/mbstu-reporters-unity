"use client"

import { useEffect, useState } from "react"
import { PhotoFrame } from "@/components/portal/photo-frame"
import { DEFAULT_STYLE, getGlobalStyle, saveGlobalStyle } from "@/lib/photo-style"
import type { PhotoStyle } from "@/lib/photo-style"

const SWATCHES = ["#15803d", "#16a34a", "#eab308", "#f59e0b", "#dc2626", "#0ea5e9", "#7c3aed", "#ec4899", "#0f172a", "#ffffff"]

function Slider({
  label, value, min, max, step = 1, unit = "", hint, onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; hint?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-gray-500">{value}{unit}</span>
      </div>
      <input
        type="range" className="w-full accent-green-700" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-green-700" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"
  return (
    <div className="space-y-1">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={valid} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 rounded border bg-white p-0.5" />
        <input className="w-28 rounded-lg border px-2 py-1 font-mono text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SWATCHES.map((c) => (
          <button type="button" key={c} aria-label={c} onClick={() => onChange(c)} style={{ background: c }} className="size-6 rounded-full border border-gray-300" />
        ))}
      </div>
    </div>
  )
}

function Seg<T extends string>({
  value, options, onChange,
}: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button" key={o.v} onClick={() => onChange(o.v)}
          className={`rounded-full border px-3 py-1.5 text-sm ${value === o.v ? "border-green-700 bg-green-700 text-white" : "bg-white"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()

/** সব স্লাইডার ও সুইচ + লাইভ প্রিভিউ */
export function StyleControls({
  value, onChange, previewSrc, previewName,
}: {
  value: PhotoStyle
  onChange: (v: PhotoStyle) => void
  previewSrc?: string | null
  previewName?: string
}) {
  const set = <K extends keyof PhotoStyle>(k: K, v: PhotoStyle[K]) => onChange({ ...value, [k]: v })
  const sec = "space-y-3 rounded-xl border p-3"

  return (
    <div className="space-y-3">
      <div className="sticky top-2 z-30 flex justify-center rounded-2xl bg-gray-50/95 py-6 shadow backdrop-blur">
        <PhotoFrame
          src={previewSrc}
          alt={previewName || "preview"}
          style={value}
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-green-700 text-2xl font-bold text-white">
              {initials(previewName || "ছবি") || "ছ"}
            </div>
          }
        />
      </div>

      <div className={sec}>
        <p className="text-sm font-semibold">আকার ও আকৃতি</p>
        <Slider label="ছবির সাইজ" value={value.size} min={40} max={320} unit="px" onChange={(v) => set("size", v)} />
        <Slider label="উচ্চতা (প্রস্থের তুলনায়)" value={value.heightPct} min={60} max={170} unit="%" hint="১০০% = সমান, বেশি হলে লম্বা। আকৃতি ১০০% হলে নিজে থেকেই বৃত্ত হবে।" onChange={(v) => set("heightPct", v)} />
        <Slider label="আকৃতি" value={value.shape} min={0} max={100} unit="%" hint="০% = বর্গ/আয়তক্ষেত্র, ১০০% = পূর্ণ বৃত্ত" onChange={(v) => set("shape", v)} />
      </div>

      <div className={sec}>
        <p className="text-sm font-semibold">রঙিন ব্যান্ড</p>
        <Toggle label="ছবির চারপাশে ব্যান্ড যুক্ত করুন" checked={value.bandOn} onChange={(v) => set("bandOn", v)} />
        {value.bandOn && (
          <>
            <Seg
              value={value.bandMode}
              options={[{ v: "solid", l: "সলিড" }, { v: "gradient", l: "গ্রেডিয়েন্ট" }, { v: "transparent", l: "স্বচ্ছ" }]}
              onChange={(v) => set("bandMode", v)}
            />
            <Slider label="ব্যান্ডের পুরুত্ব" value={value.bandWidth} min={1} max={60} unit="px" onChange={(v) => set("bandWidth", v)} />
            {value.bandMode !== "transparent" && (
              <ColorField label={value.bandMode === "gradient" ? "রং ১" : "রং"} value={value.color1} onChange={(v) => set("color1", v)} />
            )}
            {value.bandMode === "gradient" && (
              <>
                <ColorField label="রং ২" value={value.color2} onChange={(v) => set("color2", v)} />
                <Slider label="গ্রেডিয়েন্টের দিক (স্থির অবস্থায়)" value={value.gradientAngle} min={0} max={360} unit="°" onChange={(v) => set("gradientAngle", v)} />
              </>
            )}
          </>
        )}
      </div>

      <div className={sec}>
        <p className="text-sm font-semibold">অ্যানিমেশন</p>
        <Seg
          value={value.anim}
          options={[
            { v: "none", l: "নেই" },
            { v: "flow", l: "প্রবাহ" },
            { v: "wave", l: "ঢেউ" },
            { v: "fade", l: "ফেড ইন-আউট" },
            { v: "pulse", l: "স্পন্দন" },
          ]}
          onChange={(v) => set("anim", v)}
        />
        <p className="text-xs text-gray-500">প্রবাহ ও ঢেউ শুধু গ্রেডিয়েন্ট ব্যান্ডে কাজ করে। সলিডে এগুলো ফেড হিসেবে চলবে।</p>
        {value.anim !== "none" && (
          <Slider label="এক চক্রের সময়" value={value.animSpeed} min={0.5} max={20} step={0.5} unit=" সেকেন্ড" hint="কম = দ্রুত, বেশি = ধীর" onChange={(v) => set("animSpeed", v)} />
        )}
      </div>

      <div className={sec}>
        <p className="text-sm font-semibold">ইফেক্ট</p>
        <Toggle label="চারপাশে উজ্জ্বল গ্লো" checked={value.glowOn} onChange={(v) => set("glowOn", v)} />
        {value.glowOn && <Slider label="গ্লো সাইজ" value={value.glowSize} min={2} max={80} unit="px" onChange={(v) => set("glowSize", v)} />}
        <Toggle label="ছায়া (ছবি উঁচু দেখাবে)" checked={value.shadowOn} onChange={(v) => set("shadowOn", v)} />
        {value.shadowOn && <Slider label="ছায়া সাইজ" value={value.shadowSize} min={2} max={60} unit="px" onChange={(v) => set("shadowSize", v)} />}
        <Toggle label="কার্সার নিলে বড় হবে" checked={value.hoverGrow} onChange={(v) => set("hoverGrow", v)} />
        <Toggle label="স্ক্রল করে মাঝামাঝি এলে বড় হবে" checked={value.scrollGrow} onChange={(v) => set("scrollGrow", v)} />
        {(value.hoverGrow || value.scrollGrow) && (
          <Slider label="বড় হওয়ার পরিমাণ" value={value.growScale} min={100} max={160} unit="%" onChange={(v) => set("growScale", v)} />
        )}
      </div>

      <button type="button" onClick={() => onChange(DEFAULT_STYLE)} className="w-full text-sm underline">
        ডিফল্টে ফিরুন
      </button>
    </div>
  )
}

/** সব ছবির জন্য একসাথে ডিফল্ট স্টাইল (Supabase-এ সেভ হয়) */
export function GlobalStylePanel({
  token, previewSrc, previewName, onSaved,
}: {
  token: string
  previewSrc?: string | null
  previewName?: string
  onSaved?: (s: PhotoStyle) => void
}) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<PhotoStyle>(DEFAULT_STYLE)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => { getGlobalStyle().then(setStyle) }, [])

  async function save() {
    setBusy(true)
    setMsg("")
    try {
      await saveGlobalStyle(token, style)
      onSaved?.(style)
      setMsg("✅ সব ছবির স্টাইল সেভ হয়েছে")
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "কিছু ভুল হয়েছে"))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between font-semibold">
        <span>🎨 সব ছবির ডিফল্ট স্টাইল</span>
        <span className="text-sm text-gray-500">{open ? "বন্ধ করুন" : "খুলুন"}</span>
      </button>
      {open && (
        <>
          <StyleControls value={style} onChange={setStyle} previewSrc={previewSrc} previewName={previewName} />
          <button
            type="button" onClick={save} disabled={busy}
            className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "অপেক্ষা করুন..." : "সব ছবির জন্য সেভ করুন"}
          </button>
          {msg && <p className="text-sm">{msg}</p>}
        </>
      )}
    </div>
  )
}
