"use client"

import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { Check, Copy, Minus, Plus, MessageCircle } from "lucide-react"
import { BookmarkButton } from "./bookmark-button"

export function ArticleReaderControls({
  postId,
  title,
  imageUrl,
  category,
  author,
  createdAt,
  children,
}: {
  postId: string
  title: string
  imageUrl?: string | null
  category?: string | null
  author?: string | null
  createdAt?: string | null
  children: ReactNode
}) {
  const [fontSize, setFontSize] = useState(17)
  const [copyStatus, setCopyStatus] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`${title} ${shareUrl}`)

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus("লিংক কপি হয়েছে")
    } catch {
      setCopyStatus("লিংক কপি করা যায়নি")
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--theme-card-border)] py-3">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook-এ সংবাদ শেয়ার করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:brightness-110"
          >
            <span className="font-sans text-lg font-bold leading-none" aria-hidden="true">f</span>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp-এ সংবাদ শেয়ার করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#25d366] text-white transition hover:brightness-110"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={copyLink}
            aria-label="সংবাদের লিংক কপি করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-slate-600 text-white transition hover:bg-slate-700"
          >
            {copyStatus === "লিংক কপি হয়েছে" ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </button>
          <BookmarkButton
            postId={postId}
            title={title}
            imageUrl={imageUrl}
            category={category}
            author={author}
            createdAt={createdAt}
            size="md"
            className="size-9 rounded-full"
          />
          {copyStatus && (
            <span className="text-xs text-[var(--theme-text-body)]" aria-live="polite">
              {copyStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1" aria-label="লেখার আকার">
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.max(15, size - 1))}
            disabled={fontSize <= 15}
            className="inline-flex h-9 min-w-10 items-center justify-center gap-1 rounded-lg border border-[var(--theme-card-border)] px-2 text-sm font-bold text-[var(--theme-text-body)] transition hover:bg-[var(--theme-brand-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="লেখা ছোট করুন"
          >
            <Minus className="size-3" aria-hidden="true" />
            অ-
          </button>
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.min(22, size + 1))}
            disabled={fontSize >= 22}
            className="inline-flex h-9 min-w-10 items-center justify-center gap-1 rounded-lg border border-[var(--theme-card-border)] px-2 text-sm font-bold text-[var(--theme-text-body)] transition hover:bg-[var(--theme-brand-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="লেখা বড় করুন"
          >
            <Plus className="size-3" aria-hidden="true" />
            অ+
          </button>
        </div>
      </div>

      <div
        className="article-reader-content"
        style={{ "--article-font-size": `${fontSize}px` } as CSSProperties}
      >
        {children}
      </div>
    </>
  )
}
