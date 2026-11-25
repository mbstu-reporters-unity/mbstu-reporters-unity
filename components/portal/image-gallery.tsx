export default function ImageGallery({
  urls,
  compact = false,
}: {
  urls: string[]
  compact?: boolean
}) {
  const list = urls.filter(Boolean)
  if (list.length === 0) return null

  if (compact) {
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={list[0]} alt="" className="block h-auto w-full rounded-xl object-contain" />
        {list.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
            +{list.length - 1}
          </span>
        )}
      </div>
    )
  }

  if (list.length === 1) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={list[0]} alt="" className="block h-auto w-full rounded-xl object-contain" />
  }

  return (
    <div className="space-y-2">
      {list.map((u, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={u + i}
          src={u}
          alt=""
          className="block h-auto w-full rounded-xl object-contain"
        />
      ))}
    </div>
  )
}
