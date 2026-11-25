import RichGallery from "./rich-gallery"
import type { GalleryItem } from "./rich-gallery"

export default function NoticeMediaPreview({
  title,
  imageUrls,
  images,
  layout = "stack",
  fileUrl,
  fileName,
  fileType,
  postDate,
}: {
  title: string
  imageUrls?: string[] | null
  images?: GalleryItem[]
  layout?: string
  fileUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  postDate?: string | null
}) {
  const imageItems: GalleryItem[] = [...(images || [])]
  for (const url of imageUrls || []) {
    if (url && !imageItems.some((item) => item.url === url)) imageItems.push({ url })
  }
  const fileIsSafe = Boolean(fileUrl && /^https?:\/\//i.test(fileUrl))
  const fileIsImage = fileType?.toLowerCase().startsWith("image/") || false
  const isPdf = Boolean(
    fileType?.toLowerCase().includes("pdf") ||
    fileName?.toLowerCase().endsWith(".pdf") ||
    (fileUrl && /\.pdf(?:$|[?#])/i.test(fileUrl))
  )

  if (fileUrl && fileIsSafe && fileIsImage && !imageItems.some((item) => item.url === fileUrl)) {
    imageItems.push({ url: fileUrl, title })
  }

  if (imageItems.length === 0 && !(fileUrl && fileIsSafe && isPdf)) return null

  return (
    <div className="space-y-4">
      {imageItems.length > 0 && (
        <RichGallery
          items={imageItems}
          layout={layout}
          postTitle={title}
          postDate={postDate}
        />
      )}
      {fileUrl && fileIsSafe && isPdf && (
        <div className="overflow-hidden rounded-xl border border-white/20 bg-white">
          <iframe
            src={fileUrl}
            title={`PDF preview: ${fileName || title}`}
            loading="lazy"
            className="block h-[360px] max-h-[60vh] w-full border-0 bg-white sm:h-[480px]"
          />
        </div>
      )}
    </div>
  )
}
