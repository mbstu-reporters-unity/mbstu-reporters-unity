"use client"

import { useEffect, useMemo } from "react"
import type { ImageRow } from "../../lib/sb"

export default function MultiImagePicker({
  existing,
  files,
  onAdd,
  onRemoveExisting,
  onRemoveNew,
}: {
  existing: ImageRow[]
  files: File[]
  onAdd: (f: File[]) => void
  onRemoveExisting: (id: string) => void
  onRemoveNew: (index: number) => void
}) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u))
  }, [previews])

  const total = existing.length + files.length

  return (
    <div className="space-y-2">
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
            if (list.length) onAdd(list)
            e.target.value = ""
          }}
        />
      </label>

      {total > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existing.map((img) => (
            <div key={img.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => onRemoveExisting(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                aria-label="ছবি সরান"
              >
                ✕
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-24 object-cover rounded-lg ring-2 ring-green-600" />
              <button
                type="button"
                onClick={() => onRemoveNew(i)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                aria-label="ছবি সরান"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
