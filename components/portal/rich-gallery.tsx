export const LAYOUTS = [
  { key: "grid", bn: "গ্রিড" },
  { key: "hero", bn: "প্রথমটি বড়" },
  { key: "mosaic", bn: "মোজাইক" },
  { key: "columns", bn: "৩ কলাম" },
  { key: "stack", bn: "একটির নিচে একটি" },
  { key: "slider", bn: "স্লাইডার" },
  { key: "strip", bn: "ফিল্মস্ট্রিপ" },
  { key: "side", bn: "বাম বড়, ডানে ছোট" },
] as const

export type GalleryItem = {
  url: string
  caption?: string | null
  credit?: string | null
}

function Fig({ item, cls, imgCls }: { item: GalleryItem; cls: string; imgCls: string }) {
  return (
    <figure className={cls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt={item.caption || ""} className={imgCls} />
      {(item.caption || item.credit) && (
        <figcaption className="mt-1 text-sm text-gray-700">
          {item.caption && <span className="block">{item.caption}</span>}
          {item.credit && <span className="block text-xs text-gray-500">📷 ছবি: {item.credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

export default function RichGallery({
  items,
  layout = "grid",
}: {
  items: GalleryItem[]
  layout?: string
}) {
  const list = items.filter((i) => i.url)
  if (list.length === 0) return null

  if (list.length === 1) {
    return <Fig item={list[0]} cls="" imgCls="w-full rounded-xl" />
  }

  if (layout === "hero") {
    return (
      <div className="space-y-2">
        <Fig item={list[0]} cls="" imgCls="w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          {list.slice(1).map((it, i) => (
            <Fig key={it.url + i} item={it} cls="" imgCls="aspect-square w-full rounded-xl object-cover" />
          ))}
        </div>
      </div>
    )
  }

  if (layout === "mosaic") {
    return (
      <div className="columns-2 gap-2">
        {list.map((it, i) => (
          <Fig key={it.url + i} item={it} cls="mb-2 break-inside-avoid" imgCls="w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (layout === "columns") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {list.map((it, i) => (
          <Fig key={it.url + i} item={it} cls="" imgCls="aspect-square w-full rounded-lg object-cover" />
        ))}
      </div>
    )
  }

  if (layout === "stack") {
    return (
      <div className="space-y-3">
        {list.map((it, i) => (
          <Fig key={it.url + i} item={it} cls="" imgCls="w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (layout === "slider") {
    return (
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
        {list.map((it, i) => (
          <Fig key={it.url + i} item={it} cls="w-[85%] shrink-0 snap-center" imgCls="w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (layout === "strip") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {list.map((it, i) => (
          <Fig key={it.url + i} item={it} cls="w-40 shrink-0" imgCls="h-32 w-full rounded-lg object-cover" />
        ))}
      </div>
    )
  }

  if (layout === "side") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {list.map((it, i) => (
          <Fig
            key={it.url + i}
            item={it}
            cls={i === 0 ? "col-span-2 row-span-2" : ""}
            imgCls={i === 0 ? "aspect-square w-full rounded-xl object-cover" : "aspect-square w-full rounded-lg object-cover"}
          />
        ))}
      </div>
    )
  }

  // grid (ডিফল্ট)
  return (
    <div className="grid grid-cols-2 gap-2">
      {list.map((it, i) => (
        <Fig
          key={it.url + i}
          item={it}
          cls={list.length % 2 === 1 && i === list.length - 1 ? "col-span-2" : ""}
          imgCls="aspect-square w-full rounded-xl object-cover"
        />
      ))}
    </div>
  )
}
