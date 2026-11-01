"use client"

import { useState } from "react"
import {
  getImagesMeta, getLayout, uploadImage, addImagesWithMeta,
  removeImage, updateImageMeta, saveLayout,
} from "../../lib/sb"
import type { ImageMeta, ParentType, NewImage } from "../../lib/sb"
import { LAYOUTS } from "./rich-gallery"

const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
  "🙂","😉","😍","🥰","😘","😎","🤩","🥳","😢","😭",
  "😮","😱","😡","🤔","🙏","👏","👍","👎","👌","✌️",
  "💪","🙌","🤝","❤️","🧡","💛","💚","💙","💜","🖤",
  "🔥","⭐","🌟","✨","🎉","🎊","🏆","🥇","🎓","📚",
  "📰","📢","📷","🎥","🎤","📅","📍","🏫","🏛️","🎭",
  "🎨","🎵","⚽","🏏","🏀","🏃","🚩","🇧🇩","🌳","🌸",
  "🌞","🌙","☀️","🌧️","🌈","🌊","🌿","🍃","🕌","🕊️",
  "💡","🔬","🧪","💻","📱","✏️","📝","📌","🔔","⚠️",
  "✅","❌","❓","❗","💬","🤲","🎁","🍽️","☕","🚌",
]

type Meta = { caption: string; credit: string }
type NewItem = { file: File; preview: string; caption: string; credit: string }

export function useImageSection(type: ParentType) {
  const [existing, setExisting] = useState<ImageMeta[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [edits, setEdits] = useState<Record<string, Meta>>({})
  const [fresh, setFresh] = useState<NewItem[]>([])
  const [layout, setLayout] = useState("grid")

  const visible = existing.filter((i) => !removed.includes(i.id))

  function reset() {
    fresh.forEach((f) => URL.revokeObjectURL(f.preview))
    setExisting([]); setRemoved([]); setEdits({}); setFresh([]); setLayout("grid")
  }

  async function load(id: string): Promise<ImageMeta[]> {
    reset()
    const rows = await getImagesMeta(type, id)
    setExisting(rows)
    const e: Record<string, Meta> = {}
    rows.forEach((r) => { e[r.id] = { caption: r.caption || "", credit: r.credit || "" } })
    setEdits(e)
    setLayout(await getLayout(type, id))
    return rows
  }

  function addFiles(files: File[]) {
    setFresh((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f), caption: "", credit: "" })),
    ])
  }
  function removeNew(idx: number) {
    setFresh((prev) => {
      if (prev[idx]) URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }
  function setNewMeta(idx: number, field: keyof Meta, val: string) {
    setFresh((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f)))
  }
  function removeExisting(id: string) {
    setRemoved((prev) => [...prev, id])
  }
  function setExistingMeta(id: string, field: keyof Meta, val: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || { caption: "", credit: "" }), [field]: val } }))
  }

  async function uploadNew(
    token: string,
    shrink: (f: File) => Promise<Blob>,
    onProgress?: (i: number, n: number) => void
  ): Promise<NewImage[]> {
    const out: NewImage[] = []
    for (let i = 0; i < fresh.length; i++) {
      onProgress?.(i + 1, fresh.length)
      const url = await uploadImage(token, await shrink(fresh[i].file))
      out.push({ url, caption: fresh[i].caption.trim(), credit: fresh[i].credit.trim() })
    }
    return out
  }

  async function commit(token: string, id: string, uploaded: NewImage[], legacyUrl: string | null) {
    for (const rid of removed) await removeImage(token, rid)
    for (const img of visible) {
      const e = edits[img.id]
      if (e && (e.caption !== (img.caption || "") || e.credit !== (img.credit || ""))) {
        await updateImageMeta(token, img.id, {
          caption: e.caption.trim() || null,
          credit: e.credit.trim() || null,
        })
      }
    }
    const toAdd = [...uploaded]
    if (legacyUrl && uploaded.length > 0 && !visible.some((r) => r.url === legacyUrl)) {
      toAdd.unshift({ url: legacyUrl, caption: "", credit: "" })
    }
    await addImagesWithMeta(token, type, id, toAdd, visible.length)
    if (visible.length + toAdd.length > 1) await saveLayout(token, type, id, layout)
  }

  return {
    visible, edits, fresh, layout, setLayout,
    reset, load, addFiles, removeNew, setNewMeta, removeExisting, setExistingMeta,
    uploadNew, commit,
  }
}

export type ImageSectionState = ReturnType<typeof useImageSection>

function EmojiBox({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1 rounded-lg border bg-white p-2 text-lg">
      {EMOJIS.map((e) => (
        <button key={e} type="button" onClick={() => onPick(e)} className="rounded hover:bg-gray-100">
          {e}
        </button>
      ))}
    </div>
  )
}

const small = "w-full border rounded-lg px-2 py-1 text-sm bg-white"

export default function ImageSection({ s }: { s: ImageSectionState }) {
  const [emojiFor, setEmojiFor] = useState<string | null>(null)
  const total = s.visible.length + s.fresh.length

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm text-gray-600">
          ছবি (ঐচ্ছিক, একাধিক বাছা যাবে){total > 0 ? ` · মোট ${total}টি` : ""}
        </span>
        <input
          className="block mt-1 text-sm"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const list = Array.from(e.target.files || [])
            if (list.length) s.addFiles(list)
            e.target.value = ""
          }}
        />
      </label>

      {s.visible.map((img) => {
        const m = s.edits[img.id] || { caption: "", credit: "" }
        const key = "e" + img.id
        return (
          <div key={img.id} className="flex gap-2 rounded-xl border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 space-y-1">
              <input className={small} maxLength={300} placeholder="ক্যাপশন / লেবেল (ঐচ্ছিক)" value={m.caption} onChange={(e) => s.setExistingMeta(img.id, "caption", e.target.value)} />
              <input className={small} maxLength={100} placeholder="ফটো ক্রেডিট (ঐচ্ছিক)" value={m.credit} onChange={(e) => s.setExistingMeta(img.id, "credit", e.target.value)} />
              <div className="flex gap-4 text-sm">
                <button type="button" onClick={() => setEmojiFor(emojiFor === key ? null : key)}>😀 ইমোজি</button>
                <button type="button" onClick={() => s.removeExisting(img.id)} className="text-red-600">✕ সরান</button>
              </div>
              {emojiFor === key && <EmojiBox onPick={(e) => s.setExistingMeta(img.id, "caption", m.caption + e)} />}
            </div>
          </div>
        )
      })}

      {s.fresh.map((f, i) => {
        const key = "n" + i
        return (
          <div key={f.preview} className="flex gap-2 rounded-xl border border-green-600 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.preview} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 space-y-1">
              <input className={small} maxLength={300} placeholder="ক্যাপশন / লেবেল (ঐচ্ছিক)" value={f.caption} onChange={(e) => s.setNewMeta(i, "caption", e.target.value)} />
              <input className={small} maxLength={100} placeholder="ফটো ক্রেডিট (ঐচ্ছিক)" value={f.credit} onChange={(e) => s.setNewMeta(i, "credit", e.target.value)} />
              <div className="flex gap-4 text-sm">
                <button type="button" onClick={() => setEmojiFor(emojiFor === key ? null : key)}>😀 ইমোজি</button>
                <button type="button" onClick={() => s.removeNew(i)} className="text-red-600">✕ সরান</button>
              </div>
              {emojiFor === key && <EmojiBox onPick={(e) => s.setNewMeta(i, "caption", f.caption + e)} />}
            </div>
          </div>
        )
      })}

      {total > 1 && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">ছবিগুলো কীভাবে সাজানো হবে</p>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => s.setLayout(l.key)}
                className={`rounded-lg border px-2 py-2 text-sm ${s.layout === l.key ? "bg-green-700 text-white" : "bg-white"}`}
              >
                {l.bn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
