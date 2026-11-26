"use client"

import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { Check, MessageCircle, Phone, Share2 } from "lucide-react"
import { BookmarkButton } from "./bookmark-button"

export function ArticleReaderControls({
  postId,
  title,
  imageUrl,
  category,
  author,
  createdAt,
  canonicalUrl,
  children,
}: {
  postId: string
  title: string
  imageUrl?: string | null
  category?: string | null
  author?: string | null
  createdAt?: string | null
  canonicalUrl: string
  children: ReactNode
}) {
  const [fontSize, setFontSize] = useState(17)
  const [copyStatus, setCopyStatus] = useState("")
  const [shareUrl, setShareUrl] = useState(canonicalUrl)
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`${title} ${shareUrl}`)

  useEffect(() => {
    setShareUrl(window.location.href || canonicalUrl)
  }, [canonicalUrl])

  async function copyLink(message = "লিংক কপি হয়েছে") {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus(message)
    } catch {
      setCopyStatus("লিংক কপি করা যায়নি")
    }
  }

  async function shareToMessenger() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url: window.location.href })
        setCopyStatus("")
        return
      }
      await copyLink("লিংক কপি হয়েছে—মেসেঞ্জারে শেয়ার করুন")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      setCopyStatus("মেসেঞ্জারে শেয়ার করা যায়নি")
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--theme-card-border)] py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook-এ সংবাদ শেয়ার করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-sm transition hover:brightness-110"
          >
            <span className="font-sans text-lg font-bold leading-none" aria-hidden="true">f</span>
          </a>
          <button
            type="button"
            onClick={shareToMessenger}
            aria-label="মেসেঞ্জারে সংবাদ শেয়ার করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-sm transition hover:brightness-110"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp-এ সংবাদ শেয়ার করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#25d366] text-white shadow-sm transition hover:brightness-110"
          >
            <Phone className="size-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => copyLink()}
            aria-label="সংবাদের লিংক কপি করুন"
            className="inline-flex size-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition hover:bg-rose-600"
          >
            {copyStatus === "লিংক কপি হয়েছে" ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Share2 className="size-4" aria-hidden="true" />
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

        <div className="flex shrink-0 items-center gap-1" aria-label="লেখার আকার">
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.max(15, size - 1))}
            disabled={fontSize <= 15}
            className="inline-flex h-9 min-w-10 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-bold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="লেখা ছোট করুন"
          >
            অ-
          </button>
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.min(24, size + 1))}
            disabled={fontSize >= 24}
            className="inline-flex h-9 min-w-10 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-bold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="লেখা বড় করুন"
          >
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
