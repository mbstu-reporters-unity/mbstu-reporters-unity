"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  ImagePlus,
  Music,
  Users,
  MapPin,
  Smile,
  FolderPlus,
  Pencil,
  ArrowUp,
  ArrowDown,
  Globe,
  Lock,
  Pin,
  Star,
  Sparkles,
  FileText,
  Link2,
  Camera,
  Palette,
  Plus,
  Video,
  Eye,
  EyeOff,
  Trash2,
  Upload,
} from "lucide-react"
import {
  SB_URL,
  SB_KEY,
  uploadImage,
  uploadVideo,
  getImagesMeta,
  getLayout,
  addImagesWithMeta,
  removeImage,
  updateImageMeta,
  saveLayout,
  type Post,
  type Profile,
  type StudentItem,
} from "@/lib/sb"
import {
  BRANCHES,
  MAX_NOTICE_FILE_MB,
  uploadNoticeFile,
  type Notice,
} from "@/lib/notices"
import type { ClubItem } from "@/lib/clubs"
import type { CommunityPage } from "@/lib/pages"
import type { Department } from "@/lib/faculties"
import {
  parseLayoutValue,
  buildLayoutValue,
  type ViewerMode,
} from "@/components/portal/rich-gallery"

export type FbComposerMode = "post" | "notice" | "student"
type FbLayoutKind = "fb-classic" | "fb-columns" | "fb-frame"
type StepView = "compose" | "edit" | "publish" | "audience"

interface PhotoDraft {
  uid: string
  existingId?: string
  file?: File
  url: string
  caption: string
  credit: string
}

export interface FbPostComposerProps {
  mode: FbComposerMode
  token: string
  isAdmin?: boolean
  authorName?: string
  authorAvatar?: string | null
  reporters?: Profile[]
  shrink?: (f: File) => Promise<Blob>

  categories?: string[]
  clubs?: ClubItem[]
  communityPages?: CommunityPage[]
  defaultPageId?: string
  departments?: Department[]
  studentKinds?: string[]

  editItem?: Post | Notice | StudentItem | null

  onCancel: () => void
  onSuccess: (message: string) => Promise<void> | void
}

const FRAME_SWATCHES = [
  "#c48b45",
  "#8b5e34",
  "#1e3a8a",
  "#0f766e",
  "#7c2d12",
  "#4c1d95",
  "#334155",
  "#be123c",
]

const FEELING_PRESETS = [
  "📰 ব্রেকিং আপডেট",
  "🎉 আনন্দিত",
  "🔥 এক্সক্লুসিভ",
  "📢 জরুরি ঘোষণা",
  "🏆 গর্বিত",
  "📚 গবেষণা ও শিক্ষা",
  "🎓 ক্যাম্পাস জীবন",
]

const MUSIC_PRESETS = [
  "Nature Is Peace",
  "Campus Acoustic Vibes",
  "Breaking News Intro",
  "Soft Instrumental",
]

const MAX_VIDEO_MB = 50

async function fallbackShrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file
  }
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement("canvas")
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
    if (typeof bmp.close === "function") bmp.close()
    const outType =
      file.type === "image/png"
        ? "image/png"
        : file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg"
    return await new Promise<Blob>((res) =>
      c.toBlob((b) => res(b || file), outType, outType === "image/png" ? undefined : 0.84)
    )
  } catch {
    return file
  }
}

async function extractDominantColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = 16
          canvas.height = 16
          const ctx = canvas.getContext("2d")
          if (!ctx) return resolve(null)
          ctx.drawImage(img, 0, 0, 16, 16)
          const data = ctx.getImageData(0, 0, 16, 16).data
          let r = 0
          let g = 0
          let b = 0
          let count = 0
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 128) continue
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            count++
          }
          if (!count) return resolve(null)
          r = Math.round((r / count) * 0.85)
          g = Math.round((g / count) * 0.85)
          b = Math.round((b / count) * 0.85)
          const hex =
            "#" +
            [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("")
          resolve(hex)
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = src
    } catch {
      resolve(null)
    }
  })
}

function LayoutIcon({ kind, className = "size-5" }: { kind: FbLayoutKind; className?: string }) {
  if (kind === "fb-columns") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <line x1="9" y1="4" x2="9" y2="20" />
        <line x1="15" y1="4" x2="15" y2="20" />
      </svg>
    )
  }
  if (kind === "fb-frame") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="4" y="4" width="7" height="16" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="12" y1="12" x2="21" y2="12" />
    </svg>
  )
}

async function saveRowWithMetaFallback(
  token: string,
  table: string,
  editId: string | null,
  payload: Record<string, any>
): Promise<string | null> {
  const url = editId
    ? `${SB_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(editId)}&select=id`
    : `${SB_URL}/rest/v1/${table}?select=id`
  const method = editId ? "PATCH" : "POST"
  const headers: Record<string, string> = {
    apikey: SB_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  }

  let res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errObj = await res.json().catch(() => ({}))
    const errText = (errObj.message || errObj.msg || errObj.details || "") as string
    if (/meta|column|schema cache/i.test(errText) && "meta" in payload) {
      const { meta: _ignored, ...fallbackPayload } = payload
      res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(fallbackPayload),
      })
      if (!res.ok) {
        const err2 = await res.json().catch(() => ({}))
        throw new Error(err2.message || err2.msg || `ত্রুটি (${res.status})`)
      }
    } else {
      throw new Error(errText || `ত্রুটি (${res.status})`)
    }
  }

  const rows: { id: string }[] = await res.json().catch(() => [])
  return rows[0]?.id || editId
}

export default function FbPostComposer({
  mode,
  token,
  isAdmin = false,
  authorName = "সাংবাদিক",
  authorAvatar = null,
  reporters = [],
  shrink,
  categories = ["ক্যাম্পাস সংবাদ"],
  clubs = [],
  communityPages = [],
  defaultPageId = "",
  departments = [],
  studentKinds = ["Opinion", "Creative Writing", "Achievement", "Research Highlight"],
  editItem = null,
  onCancel,
  onSuccess,
}: FbPostComposerProps) {
  const [step, setStep] = useState<StepView>("compose")
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false)
  const [activeChipPanel, setActiveChipPanel] = useState<
    null | "music" | "people" | "location" | "feeling" | "album"
  >(null)

  const [title, setTitle] = useState("")
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [locationText, setLocationText] = useState("")
  const [feelingText, setFeelingText] = useState("")
  const [musicText, setMusicText] = useState("")
  const [aiLabel, setAiLabel] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [embedMediaUrl, setEmbedMediaUrl] = useState("")

  const [category, setCategory] = useState(categories[0] || "ক্যাম্পাস সংবাদ")
  const [selectedPageId, setSelectedPageId] = useState(defaultPageId)
  const [selectedClubId, setSelectedClubId] = useState("")
  const [customAuthor, setCustomAuthor] = useState(authorName)
  const [postAuthorAvatar, setPostAuthorAvatar] = useState<string | null>(authorAvatar || null)
  const [postAuthorAvatarFile, setPostAuthorAvatarFile] = useState<File | null>(null)
  const [postAuthorAvatarPreview, setPostAuthorAvatarPreview] = useState<string | null>(null)
  const [showAuthorAvatar, setShowAuthorAvatar] = useState(true)

  const [noticeBranch, setNoticeBranch] = useState<string>(BRANCHES[0].key)
  const [noticeDeptId, setNoticeDeptId] = useState("")
  const [noticeRef, setNoticeRef] = useState("")
  const [noticeShowName, setNoticeShowName] = useState(true)
  const [noticeExpiry, setNoticeExpiry] = useState("")
  const [noticeFile, setNoticeFile] = useState<File | null>(null)
  const [oldNoticeFile, setOldNoticeFile] = useState<{
    url: string
    name: string | null
    type: string | null
  } | null>(null)

  const [studentKind, setStudentKind] = useState(studentKinds[0] || "Opinion")
  const [studentDept, setStudentDept] = useState("")
  const [studentBatch, setStudentBatch] = useState("")

  const [audience, setAudience] = useState<"public" | "only_me" | "pinned" | "featured">("public")

  const [photos, setPhotos] = useState<PhotoDraft[]>([])
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([])
  const [fbLayout, setFbLayout] = useState<FbLayoutKind>("fb-classic")
  const [frameColor, setFrameColor] = useState("#c48b45")
  const [viewerMode, setViewerMode] = useState<ViewerMode>("default")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [oldVideoUrl, setOldVideoUrl] = useState<string | null>(null)

  const [creditEditUid, setCreditEditUid] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const createdUrlsRef = useRef<string[]>([])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    if (!editItem) return
    let alive = true

    const itemAny = editItem as any
    setTitle(itemAny.title || "")
    setLinkUrl(itemAny.link_url || "")
    setEmbedMediaUrl(itemAny.embed_media_url || "")

    if (itemAny.meta && typeof itemAny.meta === "object") {
      setLocationText(itemAny.meta.location || "")
      setFeelingText(itemAny.meta.feeling || "")
      setMusicText(itemAny.meta.music || "")
      setAiLabel(Boolean(itemAny.meta.ai_label))
    }

    if (mode === "post") {
      const p = editItem as Post
      setHeading(p.heading || "")
      setBody(p.body || "")
      setCategory(p.category || categories[0] || "ক্যাম্পাস সংবাদ")
      setSelectedPageId(p.page_id || "")
      setSelectedClubId(p.club_id || "")
      setCustomAuthor(p.author || authorName)
      setPostAuthorAvatar(p.author_avatar || null)
      setShowAuthorAvatar(p.show_author_avatar !== false)
      setPostAuthorAvatarFile(null)
      setPostAuthorAvatarPreview(null)
      setOldVideoUrl(p.video_url || null)
      setAudience(p.hidden ? "only_me" : "public")
    } else if (mode === "notice") {
      const n = editItem as Notice
      setHeading(n.heading || "")
      setBody(n.body || "")
      setNoticeBranch(n.branch || BRANCHES[0].key)
      setNoticeDeptId(n.department_id || "")
      setNoticeRef(n.ref_number || "")
      setNoticeShowName(n.show_name !== false)
      setNoticeExpiry(
        n.expires_at
          ? new Date(n.expires_at).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })
          : ""
      )
      setOldNoticeFile(
        n.file_url ? { url: n.file_url, name: n.file_name, type: n.file_type } : null
      )
      setAudience(n.is_pinned ? "pinned" : "public")
    } else if (mode === "student") {
      const s = editItem as StudentItem
      setBody(s.excerpt || "")
      setStudentKind(s.kind || studentKinds[0] || "Opinion")
      setCustomAuthor(s.author || authorName)
      setStudentDept(s.dept || "")
      setStudentBatch(s.batch || "")
      setAudience(s.hidden ? "only_me" : s.featured ? "featured" : "public")
    }

    Promise.all([getImagesMeta(mode, editItem.id), getLayout(mode, editItem.id)]).then(
      ([rows, lay]) => {
        if (!alive) return
        if (rows.length > 0) {
          setPhotos(
            rows.map((r) => ({
              uid: `ex-${r.id}`,
              existingId: r.id,
              url: r.url,
              caption: r.caption || "",
              credit: r.credit || "",
            }))
          )
        } else if ("image_url" in editItem && editItem.image_url) {
          setPhotos([
            {
              uid: `legacy-cover`,
              url: editItem.image_url,
              caption: "",
              credit: "",
            },
          ])
        }
        const parsed = parseLayoutValue(lay)
        if (
          parsed.base === "fb-classic" ||
          parsed.base === "fb-columns" ||
          parsed.base === "fb-frame"
        ) {
          setFbLayout(parsed.base)
          setFrameColor(parsed.frameColor)
        }
        setViewerMode(parsed.viewerMode)
      }
    )

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem?.id, mode])

  async function handlePickedFiles(files: File[]) {
    if (!files.length) return
    const newPhotos: PhotoDraft[] = []

    for (const f of files) {
      if (f.type.startsWith("video/")) {
        if (mode === "notice") {
          if (f.size > MAX_NOTICE_FILE_MB * 1024 * 1024) {
            setMsg(`❌ ফাইল ${MAX_NOTICE_FILE_MB} MB-এর বেশি হতে পারবে না`)
            continue
          }
          setNoticeFile(f)
        } else {
          if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
            setMsg(`❌ ভিডিও ${MAX_VIDEO_MB} MB-এর বেশি হতে পারবে না`)
            continue
          }
          const vUrl = URL.createObjectURL(f)
          createdUrlsRef.current.push(vUrl)
          setVideoFile(f)
          setVideoPreview(vUrl)
        }
      } else if (f.type.startsWith("image/")) {
        const pUrl = URL.createObjectURL(f)
        createdUrlsRef.current.push(pUrl)
        newPhotos.push({
          uid: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          url: pUrl,
          caption: "",
          credit: "",
        })
      } else if (mode === "notice") {
        if (f.size > MAX_NOTICE_FILE_MB * 1024 * 1024) {
          setMsg(`❌ ফাইল ${MAX_NOTICE_FILE_MB} MB-এর বেশি হতে পারবে না`)
          continue
        }
        setNoticeFile(f)
      }
    }

    if (newPhotos.length > 0) {
      const shouldAutoColor = photos.length === 0
      setPhotos((prev) => [...prev, ...newPhotos])
      if (shouldAutoColor) {
        const dom = await extractDominantColor(newPhotos[0].url)
        if (dom) setFrameColor(dom)
      }
    }
  }

  function removePhoto(uid: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.uid === uid)
      if (target?.existingId) {
        setRemovedPhotoIds((r) => [...r, target.existingId!])
      }
      return prev.filter((p) => p.uid !== uid)
    })
  }

  function movePhoto(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= photos.length) return
    setPhotos((prev) => {
      const copy = [...prev]
      ;[copy[idx], copy[j]] = [copy[j], copy[idx]]
      return copy
    })
  }

  function updatePhotoField(uid: string, field: "caption" | "credit", val: string) {
    setPhotos((prev) => prev.map((p) => (p.uid === uid ? { ...p, [field]: val } : p)))
  }

  function deriveTitle(): string {
    if (title.trim()) return title.trim()
    const firstLine = body
      .split("\n")
      .map((l) => l.trim())
      .find(Boolean)
    if (firstLine) {
      return firstLine.length > 120 ? firstLine.slice(0, 117) + "..." : firstLine
    }
    if (photos.length > 0) {
      if (mode === "notice") return "জরুরি বিজ্ঞপ্তি"
      if (mode === "student") return "শিক্ষার্থীর লেখা ও ছবি"
      return "ক্যাম্পাসের ছবির প্রতিবেদন"
    }
    if (mode === "notice" && (noticeFile || oldNoticeFile)) {
      return noticeFile?.name || oldNoticeFile?.name || "জরুরি বিজ্ঞপ্তি"
    }
    return ""
  }

  async function handlePublish() {
    const finalTitle = deriveTitle()
    if (!finalTitle) {
      setMsg("❌ অনুগ্রহ করে কিছু লিখুন অথবা অন্তত একটি ছবি/ফাইল যুক্ত করুন")
      return
    }
    if (linkUrl.trim() && !/^https?:\/\//i.test(linkUrl.trim())) {
      setMsg("❌ ওয়েবসাইটের লিংক http:// বা https:// দিয়ে শুরু হতে হবে")
      return
    }

    setBusy(true)
    setMsg("")
    const shrinkFn = shrink || fallbackShrink

    try {
      const uploadedList: { uid: string; url: string; caption: string; credit: string }[] = []
      const newOnes = photos.filter((p) => !!p.file)

      for (let i = 0; i < newOnes.length; i++) {
        setMsg(`ছবি আপলোড হচ্ছে (${i + 1}/${newOnes.length})...`)
        const blob = await shrinkFn(newOnes[i].file!)
        const upUrl = await uploadImage(token, blob)
        uploadedList.push({
          uid: newOnes[i].uid,
          url: upUrl,
          caption: newOnes[i].caption.trim(),
          credit: newOnes[i].credit.trim(),
        })
      }

      const finalPhotoUrls = photos.map((p) => {
        if (p.existingId || !p.file) return p.url
        return uploadedList.find((u) => u.uid === p.uid)?.url || p.url
      })
      const coverUrl = finalPhotoUrls[0] || null

      let finalVideoUrl = oldVideoUrl
      if (videoFile) {
        setMsg("ভিডিও আপলোড হচ্ছে...")
        finalVideoUrl = await uploadVideo(token, videoFile)
      }

      const metaObj = {
        fb_style: true,
        location: locationText.trim() || null,
        feeling: feelingText.trim() || null,
        music: musicText.trim() || null,
        ai_label: aiLabel,
      }

      let savedId: string | null = null

      if (mode === "post") {
        let finalAuthorAvatar = postAuthorAvatar
        if (postAuthorAvatarFile) {
          setMsg("প্রতিবেদকের ছবি আপলোড হচ্ছে...")
          const avatarBlob = await shrinkFn(postAuthorAvatarFile)
          finalAuthorAvatar = await uploadImage(token, avatarBlob)
        }
        const isClub = category.includes("ক্লাব") || category.includes("Club")
        const payload: Record<string, any> = {
          title: finalTitle,
          heading: heading.trim() || null,
          body: body.trim() || (finalPhotoUrls.length > 0 ? finalTitle : ""),
          category,
          club_id: isClub && selectedClubId ? selectedClubId : null,
          page_id: selectedPageId || null,
          author: customAuthor.trim() || authorName || null,
          author_avatar: finalAuthorAvatar || null,
          show_author_avatar: showAuthorAvatar,
          image_url: coverUrl,
          video_url: finalVideoUrl,
          link_url: linkUrl.trim() || null,
          embed_media_url: embedMediaUrl.trim() || null,
          hidden: audience === "only_me",
          meta: metaObj,
        }
        setMsg("সংবাদ প্রকাশ হচ্ছে...")
        savedId = await saveRowWithMetaFallback(token, "posts", editItem?.id || null, payload)
      } else if (mode === "notice") {
        let attach = oldNoticeFile
        if (noticeFile) {
          setMsg("সংযুক্ত ফাইল আপলোড হচ্ছে...")
          const u = await uploadNoticeFile(token, noticeFile)
          attach = { url: u.url, name: u.name, type: u.type }
        }
        const payload: Record<string, any> = {
          branch: noticeBranch,
          department_id: noticeBranch === "department" && noticeDeptId ? noticeDeptId : null,
          title: finalTitle,
          heading: heading.trim() || null,
          body: body.trim() || null,
          ref_number: noticeRef.trim() || null,
          link_url: linkUrl.trim() || null,
          embed_media_url: embedMediaUrl.trim() || null,
          file_url: attach ? attach.url : null,
          file_name: attach ? attach.name : null,
          file_type: attach ? attach.type : null,
          show_name: noticeShowName,
          is_pinned: isAdmin ? audience === "pinned" : false,
          expires_at: noticeExpiry
            ? new Date(noticeExpiry + "T23:59:59+06:00").toISOString()
            : null,
          meta: metaObj,
        }
        setMsg("নোটিশ প্রকাশ হচ্ছে...")
        savedId = await saveRowWithMetaFallback(
          token,
          "board_notices",
          editItem?.id || null,
          payload
        )
      } else {
        if (audience === "featured") {
          await fetch(`${SB_URL}/rest/v1/student_items?featured=eq.true`, {
            method: "PATCH",
            headers: {
              apikey: SB_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ featured: false }),
          }).catch(() => {})
        }
        const payload: Record<string, any> = {
          kind: studentKind,
          title: finalTitle,
          excerpt: body.trim() || null,
          author: customAuthor.trim() || authorName || null,
          dept: studentDept.trim() || null,
          batch: studentBatch.trim() || null,
          image_url: coverUrl,
          link_url: linkUrl.trim() || null,
          embed_media_url: embedMediaUrl.trim() || null,
          featured: audience === "featured",
          hidden: audience === "only_me",
          sort_order: editItem ? (editItem as StudentItem).sort_order || 0 : 0,
          meta: metaObj,
        }
        setMsg("লেখা প্রকাশ হচ্ছে...")
        savedId = await saveRowWithMetaFallback(
          token,
          "student_items",
          editItem?.id || null,
          payload
        )
      }

      if (savedId) {
        for (const rid of removedPhotoIds) {
          await removeImage(token, rid).catch(() => {})
        }
        for (const p of photos) {
          if (p.existingId) {
            await updateImageMeta(token, p.existingId, {
              caption: p.caption.trim() || null,
              credit: p.credit.trim() || null,
            }).catch(() => {})
          }
        }
        const newImagesToInsert = photos
          .filter((p) => !p.existingId)
          .map((p) => ({
            url: p.file ? uploadedList.find((u) => u.uid === p.uid)?.url || "" : p.url,
            caption: p.caption,
            credit: p.credit,
          }))
          .filter((x) => x.url)

        if (newImagesToInsert.length > 0) {
          const existingCount = photos.filter((p) => p.existingId).length
          await addImagesWithMeta(token, mode, savedId, newImagesToInsert, existingCount).catch(
            () => {}
          )
        }

        const storedLayout = buildLayoutValue(fbLayout, frameColor, viewerMode)
        await saveLayout(token, mode, savedId, storedLayout).catch(() => {})
      }

      await onSuccess(
        editItem ? "✅ ফেসবুক স্টাইলে পোস্ট আপডেট হয়েছে!" : "✅ ফেসবুক স্টাইলে পোস্ট প্রকাশিত হয়েছে!"
      )
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "প্রকাশ করতে সমস্যা হয়েছে"))
    }
    setBusy(false)
  }

  const modeLabel =
    mode === "notice" ? "ডিজিটাল নোটিশ" : mode === "student" ? "স্টুডেন্ট কর্নার" : "সংবাদ / পেজ"
  const activePageName = communityPages.find((p) => p.id === selectedPageId)?.name
  const currentPostAvatar = postAuthorAvatarPreview || postAuthorAvatar
  const previewDisplayAvatar =
    mode === "post" ? (showAuthorAvatar ? currentPostAvatar : null) : authorAvatar

  const canProceed =
    Boolean(body.trim()) ||
    Boolean(title.trim()) ||
    photos.length > 0 ||
    Boolean(videoFile) ||
    Boolean(oldVideoUrl) ||
    Boolean(noticeFile) ||
    Boolean(oldNoticeFile)

  const audienceBadgeText =
    audience === "only_me"
      ? "🔒 Only me (খসড়া)"
      : audience === "pinned"
        ? "📌 পিন করা"
        : audience === "featured"
          ? "⭐ বড় কার্ড"
          : "🌐 Public"

  function renderViewerModePicker() {
    return (
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700">
          🖼️ ছবিতে ক্লিক করলে পাঠক কীভাবে দেখবে? (ক্যাপশন, ক্রেডিট, তারিখ)
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setViewerMode("default")}
            className={`rounded-xl border py-2 px-2 font-bold cursor-pointer transition ${
              viewerMode === "default"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            ডিফল্ট
          </button>
          <button
            type="button"
            onClick={() => setViewerMode("album")}
            className={`rounded-xl border py-2 px-2 font-bold cursor-pointer transition ${
              viewerMode === "album"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            অ্যালবাম (২ নং)
          </button>
          <button
            type="button"
            onClick={() => setViewerMode("lightbox")}
            className={`rounded-xl border py-2 px-2 font-bold cursor-pointer transition ${
              viewerMode === "lightbox"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            লাইটবক্স (৩ নং)
          </button>
        </div>
      </div>
    )
  }

  function renderComposerCollage(isMini = false) {
    if (photos.length === 0) return null
    const list = photos

    const renderTile = (p: PhotoDraft, extra = 0, cls = "") => (
      <div
        key={p.uid}
        className={`relative overflow-hidden bg-slate-200 ${cls}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.url} alt="" className="w-full h-full object-cover" />
        {extra > 0 && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white font-bold text-2xl sm:text-3xl">+{extra}</span>
          </div>
        )}
      </div>
    )

    if (fbLayout === "fb-columns") {
      if (list.length === 1) {
        return <div className="overflow-hidden">{renderTile(list[0], 0, "max-h-96")}</div>
      }
      const shown = list.slice(0, 4)
      const cols =
        shown.length === 2 ? "grid-cols-2" : shown.length === 3 ? "grid-cols-3" : "grid-cols-4"
      const hCls = isMini ? "h-40" : "h-56 sm:h-72"
      return (
        <div className={`grid ${cols} gap-1 overflow-hidden`}>
          {shown.map((p, i) =>
            renderTile(p, i === 3 ? list.length - 4 : 0, `${hCls}`)
          )}
        </div>
      )
    }

    if (fbLayout === "fb-frame") {
      const pad = isMini ? "p-2" : "p-3"
      const hCls = isMini ? "h-48" : "h-72 sm:h-80"
      return (
        <div className={`${pad} transition-colors`} style={{ backgroundColor: frameColor }}>
          {list.length === 1 && renderTile(list[0], 0, "max-h-80 rounded-lg")}
          {list.length === 2 && (
            <div className={`grid grid-cols-2 gap-2 ${isMini ? "h-44" : "h-64"}`}>
              {renderTile(list[0], 0, "rounded-lg h-full")}
              {renderTile(list[1], 0, "rounded-lg h-full")}
            </div>
          )}
          {list.length === 3 && (
            <div className={`grid grid-cols-2 gap-2 ${hCls}`}>
              {renderTile(list[0], 0, "rounded-lg h-full")}
              <div className="grid grid-rows-2 gap-2 h-full">
                {renderTile(list[1], 0, "rounded-lg h-full")}
                {renderTile(list[2], 0, "rounded-lg h-full")}
              </div>
            </div>
          )}
          {list.length === 4 && (
            <div className={`grid grid-cols-2 gap-2 ${hCls}`}>
              {[0, 1, 2, 3].map((i) => renderTile(list[i], 0, "rounded-lg h-full"))}
            </div>
          )}
          {list.length >= 5 && (
            <div className={`grid grid-cols-2 gap-2 ${hCls}`}>
              <div className="grid grid-rows-2 gap-2 h-full">
                {renderTile(list[0], 0, "rounded-lg h-full")}
                {renderTile(list[1], 0, "rounded-lg h-full")}
              </div>
              <div className="grid grid-rows-3 gap-2 h-full">
                {renderTile(list[2], 0, "rounded-lg h-full")}
                {renderTile(list[3], 0, "rounded-lg h-full")}
                {renderTile(list[4], list.length - 5, "rounded-lg h-full")}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (list.length === 1) {
      return <div>{renderTile(list[0], 0, "max-h-96")}</div>
    }
    if (list.length === 2) {
      return (
        <div className={`grid grid-cols-2 gap-0.5 ${isMini ? "h-44" : "h-64"}`}>
          {renderTile(list[0], 0, "h-full")}
          {renderTile(list[1], 0, "h-full")}
        </div>
      )
    }
    if (list.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {renderTile(list[0], 0, `col-span-2 ${isMini ? "h-32" : "h-48"}`)}
          {renderTile(list[1], 0, isMini ? "h-28" : "h-40")}
          {renderTile(list[2], 0, isMini ? "h-28" : "h-40")}
        </div>
      )
    }
    if (list.length === 4) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {[0, 1, 2, 3].map((i) => renderTile(list[i], 0, isMini ? "h-28" : "h-40"))}
        </div>
      )
    }
    return (
      <div className="space-y-0.5">
        <div className="grid grid-cols-2 gap-0.5">
          {renderTile(list[0], 0, isMini ? "h-28" : "h-40")}
          {renderTile(list[1], 0, isMini ? "h-28" : "h-40")}
        </div>
        <div className="grid grid-cols-3 gap-0.5">
          {renderTile(list[2], 0, isMini ? "h-20" : "h-28")}
          {renderTile(list[3], 0, isMini ? "h-20" : "h-28")}
          {renderTile(list[4], list.length - 5, isMini ? "h-20" : "h-28")}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="relative w-full h-[100dvh] sm:h-[92vh] sm:max-w-xl bg-white text-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        <input
          ref={fileInputRef}
          type="file"
          accept={mode === "notice" ? "image/*,application/pdf,.pdf,.doc,.docx" : "image/*,video/*"}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handlePickedFiles(Array.from(e.target.files))
              e.target.value = ""
            }
          }}
        />

        {/* ==================== ধাপ ১: New Post ==================== */}
        {step === "compose" && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-800 cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="size-6" />
              </button>
              <h2 className="font-bold text-base text-slate-900">
                {editItem ? "Edit post" : "New post"}
              </h2>
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => {
                  setLayoutMenuOpen(false)
                  setStep("publish")
                }}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm px-4 py-1.5 transition cursor-pointer"
              >
                Next
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
              <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveChipPanel(activeChipPanel === "people" ? null : "people")}
                  className="relative shrink-0 cursor-pointer group"
                  title="প্রতিবেদকের ছবি যোগ, এডিট বা হাইড করতে ট্যাপ করুন"
                >
                  {previewDisplayAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewDisplayAvatar}
                      alt=""
                      className="size-11 rounded-full object-cover object-top border border-slate-200"
                    />
                  ) : (
                    <div className="size-11 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                      {(customAuthor || authorName).charAt(0)}
                    </div>
                  )}
                  {mode === "post" && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-4.5 rounded-full bg-slate-900 text-white border border-white flex items-center justify-center shadow">
                      <Camera className="size-2.5" />
                    </span>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1 text-sm font-bold text-slate-900 leading-snug">
                    <span>{customAuthor || authorName}</span>
                    {feelingText && (
                      <span className="font-normal text-slate-600 text-xs">— {feelingText}</span>
                    )}
                    {locationText && (
                      <span className="font-normal text-slate-600 text-xs">at {locationText}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px]">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                      {modeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep("audience")}
                      className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md cursor-pointer hover:bg-blue-100"
                    >
                      {audienceBadgeText}
                    </button>
                    {mode === "post" && currentPostAvatar && !showAuthorAvatar && (
                      <button
                        type="button"
                        onClick={() => setActiveChipPanel("people")}
                        className="bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        🙈 ছবি লুকানো
                      </button>
                    )}
                    {activePageName && (
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md truncate max-w-[160px]">
                        📄 {activePageName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveChipPanel(activeChipPanel === "music" ? null : "music")}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                    musicText || embedMediaUrl
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Music className="size-3.5" />
                  <span>Music / Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChipPanel(activeChipPanel === "people" ? null : "people")}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                    selectedPageId || selectedClubId || noticeDeptId || currentPostAvatar
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Users className="size-3.5" />
                  <span>People / Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveChipPanel(activeChipPanel === "location" ? null : "location")
                  }
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                    locationText
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="size-3.5" />
                  <span>Location</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveChipPanel(activeChipPanel === "feeling" ? null : "feeling")
                  }
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                    feelingText
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Smile className="size-3.5" />
                  <span>Feeling/activity</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChipPanel(activeChipPanel === "album" ? null : "album")}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold cursor-pointer transition"
                >
                  <FolderPlus className="size-3.5" />
                  <span>Category</span>
                </button>
              </div>

              {activeChipPanel && (
                <div className="mx-4 my-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in">
                  {activeChipPanel === "location" && (
                    <>
                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>📍 ক্যাম্পাসের স্থান / লোকেশন:</span>
                        <button type="button" onClick={() => setActiveChipPanel(null)} className="text-blue-600">বন্ধ</button>
                      </div>
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                        placeholder="যেমন: মুক্তমঞ্চ, ১২ তলা একাডেমিক ভবন, কেন্দ্রীয় গ্রন্থাগার"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                      />
                    </>
                  )}

                  {activeChipPanel === "feeling" && (
                    <>
                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>😊 হাইলাইট / অনুভূতি বেছে নিন:</span>
                        <button type="button" onClick={() => setActiveChipPanel(null)} className="text-blue-600">বন্ধ</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {FEELING_PRESETS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setFeelingText(feelingText === f ? "" : f)}
                            className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold cursor-pointer ${
                              feelingText === f
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-700 border-slate-200"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeChipPanel === "music" && (
                    <>
                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>🎵 মিউজিক / ভিডিও বা ওয়েব লিংক:</span>
                        <button type="button" onClick={() => setActiveChipPanel(null)} className="text-blue-600">বন্ধ</button>
                      </div>
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                        placeholder="YouTube / Facebook ভিডিও লিংক (ঐচ্ছিক)"
                        value={embedMediaUrl}
                        onChange={(e) => setEmbedMediaUrl(e.target.value)}
                      />
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                        placeholder="অথবা মিউজিক/অডিও নোট লিখুন (ঐচ্ছিক)"
                        value={musicText}
                        onChange={(e) => setMusicText(e.target.value)}
                      />
                    </>
                  )}

                  {activeChipPanel === "people" && (
                    <>
                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>👥 প্রতিবেদক, ছবি, পেজ ও ক্লাব:</span>
                        <button type="button" onClick={() => setActiveChipPanel(null)} className="text-blue-600">বন্ধ</button>
                      </div>
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                        placeholder="প্রতিবেদক / লেখকের নাম"
                        value={customAuthor}
                        onChange={(e) => setCustomAuthor(e.target.value)}
                      />
                      {mode === "post" && (
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-700">📷 প্রতিবেদকের ছবি (যোগ/এডিট/হাইড/বিয়োগ):</span>
                            {currentPostAvatar && (
                              <button
                                type="button"
                                onClick={() => setShowAuthorAvatar((v) => !v)}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold cursor-pointer border ${
                                  showAuthorAvatar
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {showAuthorAvatar ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                                <span>{showAuthorAvatar ? "ভিজিবল" : "হাইড করা"}</span>
                              </button>
                            )}
                          </div>

                          {reporters.length > 0 && (
                            <select
                              className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                              value=""
                              onChange={(e) => {
                                const r = reporters.find((x) => x.id === e.target.value)
                                if (r) {
                                  setCustomAuthor(r.full_name)
                                  setPostAuthorAvatar(r.avatar_url || null)
                                  setPostAuthorAvatarFile(null)
                                  setPostAuthorAvatarPreview(null)
                                }
                              }}
                            >
                              <option value="">— নিবন্ধিত সাংবাদিক বাছাই করুন —</option>
                              {reporters.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.full_name} {r.avatar_url ? "📷" : ""}
                                </option>
                              ))}
                            </select>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            {currentPostAvatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={currentPostAvatar}
                                alt=""
                                className={`size-10 rounded-full object-cover object-top border ${
                                  !showAuthorAvatar ? "opacity-40 grayscale" : ""
                                }`}
                              />
                            ) : (
                              <div className="size-10 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                                {(customAuthor || authorName).charAt(0)}
                              </div>
                            )}

                            <label className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-2.5 py-1.5 text-[11px] font-bold cursor-pointer">
                              <Upload className="size-3" />
                              <span>{currentPostAvatar ? "বদলান/এডিট" : "যোগ করুন"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) {
                                    const u = URL.createObjectURL(f)
                                    createdUrlsRef.current.push(u)
                                    setPostAuthorAvatarFile(f)
                                    setPostAuthorAvatarPreview(u)
                                  }
                                  e.target.value = ""
                                }}
                              />
                            </label>

                            {authorAvatar && (postAuthorAvatar !== authorAvatar || postAuthorAvatarFile) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPostAuthorAvatarFile(null)
                                  setPostAuthorAvatarPreview(null)
                                  setPostAuthorAvatar(authorAvatar)
                                }}
                                className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold cursor-pointer"
                              >
                                প্রোফাইল ছবি
                              </button>
                            )}

                            {currentPostAvatar && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPostAuthorAvatarFile(null)
                                  setPostAuthorAvatarPreview(null)
                                  setPostAuthorAvatar(null)
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 text-[11px] font-bold cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                                <span>বিয়োগ</span>
                              </button>
                            )}
                          </div>

                          <input
                            className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[11px]"
                            placeholder="অথবা ছবির সরাসরি লিংক (https://... ঐচ্ছিক)"
                            value={postAuthorAvatarFile ? "" : postAuthorAvatar || ""}
                            disabled={!!postAuthorAvatarFile}
                            onChange={(e) => setPostAuthorAvatar(e.target.value.trim() || null)}
                          />
                        </div>
                      )}
                      {mode === "post" && communityPages.length > 0 && (
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                          value={selectedPageId}
                          onChange={(e) => setSelectedPageId(e.target.value)}
                        >
                          <option value="">— কোনো কমিউনিটি পেজ নয় —</option>
                          {communityPages.map((cp) => (
                            <option key={cp.id} value={cp.id}>
                              📄 {cp.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {mode === "post" && clubs.length > 0 && (
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                          value={selectedClubId}
                          onChange={(e) => setSelectedClubId(e.target.value)}
                        >
                          <option value="">— কোনো ক্লাব ট্যাগ নয় —</option>
                          {clubs.map((c) => (
                            <option key={c.id} value={c.id}>
                              ⭐ {c.name_bn || c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  )}

                  {activeChipPanel === "album" && (
                    <>
                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>🗂️ ক্যাটাগরি / শাখা নির্বাচন:</span>
                        <button type="button" onClick={() => setActiveChipPanel(null)} className="text-blue-600">বন্ধ</button>
                      </div>
                      {mode === "post" && (
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                      {mode === "notice" && (
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                          value={noticeBranch}
                          onChange={(e) => setNoticeBranch(e.target.value)}
                        >
                          {BRANCHES.map((b) => (
                            <option key={b.key} value={b.key}>{b.bn}</option>
                          ))}
                        </select>
                      )}
                      {mode === "student" && (
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                          value={studentKind}
                          onChange={(e) => setStudentKind(e.target.value)}
                        >
                          {studentKinds.map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="px-4 pt-2 pb-3 space-y-1.5">
                <input
                  className="w-full text-sm font-bold text-slate-900 placeholder-slate-400 border-b border-slate-100 pb-1.5 focus:outline-none focus:border-blue-400"
                  placeholder="শিরোনাম / টাইটেল (ফাঁকা রাখলে লেখার ১ম লাইন শিরোনাম হবে)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {mode !== "student" && (
                  <input
                    className="w-full text-xs text-slate-700 placeholder-slate-400 border-b border-slate-100 pb-1.5 focus:outline-none focus:border-blue-400"
                    placeholder="উপশিরোনাম / হেডিং (ঐচ্ছিক)"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                  />
                )}
                <textarea
                  rows={photos.length > 0 ? 3 : 6}
                  className="w-full text-base sm:text-lg text-slate-900 placeholder-slate-400 resize-none focus:outline-none leading-relaxed pt-1"
                  placeholder="কি খবর সবার? এখানে বিস্তারিত লিখুন..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {photos.length > 0 && (
                <div className="relative mt-1 border-y border-slate-200 bg-slate-100">
                  {renderComposerCollage(false)}

                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLayoutMenuOpen((v) => !v)}
                      className="size-10 rounded-full bg-black/65 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-lg cursor-pointer transition"
                      title="লেআউট পরিবর্তন করুন"
                    >
                      <LayoutIcon kind={fbLayout} className="size-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLayoutMenuOpen(false)
                        setStep("edit")
                      }}
                      className="size-10 rounded-full bg-black/65 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-lg cursor-pointer transition"
                      title="ছবি ও ক্যাপশন এডিট করুন"
                    >
                      <Pencil className="size-4.5" />
                    </button>
                  </div>

                  {layoutMenuOpen && (
                    <div className="absolute top-16 right-3 z-30 w-56 rounded-2xl bg-black/85 text-white backdrop-blur-xl shadow-2xl border border-white/15 overflow-hidden animate-in zoom-in-95 fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setFbLayout("fb-classic")
                          setLayoutMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/10 border-b border-white/10 cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <LayoutIcon kind="fb-classic" className="size-5" />
                          <span>Classic</span>
                        </span>
                        {fbLayout === "fb-classic" && <Check className="size-4 text-white" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFbLayout("fb-columns")
                          setLayoutMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/10 border-b border-white/10 cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <LayoutIcon kind="fb-columns" className="size-5" />
                          <span>Columns</span>
                        </span>
                        {fbLayout === "fb-columns" && <Check className="size-4 text-white" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFbLayout("fb-frame")
                          setLayoutMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/10 cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <LayoutIcon kind="fb-frame" className="size-5" />
                          <span>Frame</span>
                        </span>
                        {fbLayout === "fb-frame" && <Check className="size-4 text-white" />}
                      </button>
                    </div>
                  )}

                  {fbLayout === "fb-frame" && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-slate-200 overflow-x-auto scrollbar-none">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 shrink-0">
                        <Palette className="size-3.5" /> ফ্রেমের রঙ:
                      </span>
                      {FRAME_SWATCHES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFrameColor(c)}
                          style={{ backgroundColor: c }}
                          className={`size-6 rounded-full shrink-0 border-2 cursor-pointer transition ${
                            frameColor === c ? "border-slate-900 scale-110" : "border-white shadow"
                          }`}
                          aria-label={c}
                        />
                      ))}
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="size-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        title="কাস্টম রঙ"
                      />
                    </div>
                  )}
                </div>
              )}

              {(videoPreview || oldVideoUrl) && (
                <div className="mx-4 mt-3 relative rounded-2xl overflow-hidden bg-black border border-slate-200">
                  <video
                    src={videoPreview || oldVideoUrl || ""}
                    controls
                    playsInline
                    className="w-full max-h-60 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null)
                      setVideoPreview(null)
                      setOldVideoUrl(null)
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {mode === "notice" && (noticeFile || oldNoticeFile) && (
                <div className="mx-4 mt-3 flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <span className="flex items-center gap-2 font-semibold truncate">
                    <FileText className="size-4 shrink-0" />
                    <span className="truncate">
                      {noticeFile ? noticeFile.name : oldNoticeFile?.name || "সংযুক্ত ফাইল"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeFile(null)
                      setOldNoticeFile(null)
                    }}
                    className="text-red-600 font-bold ml-2 shrink-0"
                  >
                    সরান
                  </button>
                </div>
              )}
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-14 rounded-full bg-white text-slate-900 border border-slate-200 shadow-[0_6px_24px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer"
                title={mode === "notice" ? "ছবি বা PDF/DOC ফাইল যুক্ত করুন" : "ছবি বা ভিডিও যুক্ত করুন"}
              >
                <ImagePlus className="size-6" />
              </button>
            </div>
          </>
        )}

        {/* ==================== ধাপ ২: Edit Photos & Captions ==================== */}
        {step === "edit" && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setStep("compose")}
                className="inline-flex items-center gap-1.5 text-slate-900 font-bold text-base cursor-pointer"
              >
                <ChevronLeft className="size-6" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setStep("compose")}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 px-2 py-1 cursor-pointer"
              >
                DONE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 divide-y divide-slate-200">
              {photos.map((p, idx) => (
                <div key={p.uid} className="bg-white pb-2">
                  <div className="relative bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt=""
                      className="w-full max-h-[420px] object-contain mx-auto"
                    />

                    <button
                      type="button"
                      onClick={() => setCreditEditUid(creditEditUid === p.uid ? null : p.uid)}
                      className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-black/65 hover:bg-black/80 text-white px-3 py-1.5 text-xs font-bold backdrop-blur cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                      <span>{p.credit ? `📷 ${p.credit}` : "Edit / Credit"}</span>
                    </button>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePhoto(idx, -1)}
                        className="size-8 rounded-full bg-black/65 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        title="উপরে নিন"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === photos.length - 1}
                        onClick={() => movePhoto(idx, 1)}
                        className="size-8 rounded-full bg-black/65 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        title="নিচে নিন"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(p.uid)}
                        className="size-8 rounded-full bg-black/65 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
                        title="ছবি সরান"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  {creditEditUid === p.uid && (
                    <div className="px-4 py-2 bg-blue-50 border-y border-blue-100 flex items-center gap-2">
                      <Camera className="size-4 text-blue-600 shrink-0" />
                      <input
                        className="flex-1 bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                        placeholder="ফটো ক্রেডিট / আলোকচিত্রীর নাম লিখুন..."
                        value={p.credit}
                        onChange={(e) => updatePhotoField(p.uid, "credit", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setCreditEditUid(null)}
                        className="text-xs font-bold text-blue-700 px-2"
                      >
                        ঠিক আছে
                      </button>
                    </div>
                  )}

                  <div className="px-4 py-2.5">
                    <input
                      className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      placeholder="Add a caption... (ছবির ক্যাপশন লিখুন)"
                      value={p.caption}
                      onChange={(e) => updatePhotoField(p.uid, "caption", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {photos.length > 0 && (
                <div className="p-4 bg-white">
                  {renderViewerModePicker()}
                </div>
              )}

              <div className="p-4 bg-white">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-3 text-sm font-bold text-blue-600 cursor-pointer transition"
                >
                  <Plus className="size-5" />
                  <span>Add Photos/Videos</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ==================== ধাপ ৩: Publish Settings ==================== */}
        {step === "publish" && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setStep("compose")}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                <ChevronLeft className="size-6" />
              </button>
              <h2 className="font-bold text-base text-slate-900">
                {editItem ? "Update post" : "New post"}
              </h2>
              <span className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
              <div className="p-4">
                <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="flex items-center gap-2.5 p-3">
                    {previewDisplayAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewDisplayAvatar} alt="" className="size-9 rounded-full object-cover object-top" />
                    ) : (
                      <div className="size-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                        {(customAuthor || authorName).charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {customAuthor || authorName}{" "}
                        {activePageName && (
                          <span className="text-slate-500 font-normal">› {activePageName}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">Just now · {modeLabel}</p>
                    </div>
                  </div>

                  {(title.trim() || body.trim()) && (
                    <div className="px-3 pb-2.5 space-y-0.5">
                      {title.trim() && (
                        <p className="text-xs font-bold text-slate-900">{title.trim()}</p>
                      )}
                      {body.trim() && (
                        <p className="text-xs text-slate-700 line-clamp-3 whitespace-pre-line">
                          {body.trim()}
                        </p>
                      )}
                    </div>
                  )}

                  {photos.length > 0 && renderComposerCollage(true)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("audience")}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {audience === "only_me" ? (
                    <Lock className="size-6 text-slate-700" />
                  ) : audience === "pinned" ? (
                    <Pin className="size-6 text-amber-600" />
                  ) : audience === "featured" ? (
                    <Star className="size-6 text-amber-500" />
                  ) : (
                    <Globe className="size-6 text-slate-700" />
                  )}
                  <div>
                    <p className="font-bold text-sm text-slate-900">Post audience</p>
                    <p className="text-xs text-slate-500">{audienceBadgeText}</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-slate-400" />
              </button>

              <div className="px-4 py-3.5 space-y-2.5">
                <div className="flex items-center gap-3.5">
                  <Music className="size-6 text-slate-700" />
                  <span className="font-bold text-sm text-slate-900">Add music / highlight</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {MUSIC_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMusicText(musicText === m ? "" : m)}
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium cursor-pointer ${
                        musicText === m
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      🎵 {m}
                    </button>
                  ))}
                </div>
              </div>

              {photos.length > 0 && (
                <div className="px-4 py-3.5">
                  {renderViewerModePicker()}
                </div>
              )}

              <div className="px-4 py-3.5 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Also share to & Details...
                </p>

                {mode === "post" && (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">ক্যাটাগরি:</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {communityPages.length > 0 && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          📄 কমিউনিটি পেজে প্রকাশ করুন (ঐচ্ছিক):
                        </label>
                        <select
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                          value={selectedPageId}
                          onChange={(e) => setSelectedPageId(e.target.value)}
                        >
                          <option value="">— শুধু সাধারণ সংবাদ —</option>
                          {communityPages.map((cp) => (
                            <option key={cp.id} value={cp.id}>
                              {cp.name} (/p/{cp.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(category.includes("ক্লাব") || category.includes("Club")) && clubs.length > 0 && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          ⭐ কোন ক্লাবের সংবাদ?:
                        </label>
                        <select
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                          value={selectedClubId}
                          onChange={(e) => setSelectedClubId(e.target.value)}
                        >
                          <option value="">— নির্দিষ্ট ক্লাব নয় —</option>
                          {clubs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name_bn || c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {mode === "notice" && (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">নোটিশের শাখা:</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        value={noticeBranch}
                        onChange={(e) => setNoticeBranch(e.target.value)}
                      >
                        {BRANCHES.map((b) => (
                          <option key={b.key} value={b.key}>{b.bn}</option>
                        ))}
                      </select>
                    </div>

                    {noticeBranch === "department" && departments.length > 0 && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ডিপার্টমেন্ট:</label>
                        <select
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                          value={noticeDeptId}
                          onChange={(e) => setNoticeDeptId(e.target.value)}
                        >
                          <option value="">— সব ডিপার্টমেন্ট —</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        placeholder="রেফ নম্বর (ঐচ্ছিক)"
                        value={noticeRef}
                        onChange={(e) => setNoticeRef(e.target.value)}
                      />
                      <input
                        type="date"
                        className="border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        value={noticeExpiry}
                        onChange={(e) => setNoticeExpiry(e.target.value)}
                        title="মেয়াদ শেষের তারিখ"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        📎 PDF / DOC ফাইল সংযুক্ত করুন (ঐচ্ছিক, সর্বোচ্চ {MAX_NOTICE_FILE_MB} MB):
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf,.doc,.docx"
                        className="text-xs w-full"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          if (f.size > MAX_NOTICE_FILE_MB * 1024 * 1024) {
                            setMsg(`❌ ফাইল ${MAX_NOTICE_FILE_MB} MB-এর বেশি হতে পারবে না`)
                            return
                          }
                          setNoticeFile(f)
                        }}
                      />
                      {(noticeFile || oldNoticeFile) && (
                        <p className="text-[11px] text-blue-700 font-semibold truncate">
                          ✓ {noticeFile ? noticeFile.name : oldNoticeFile?.name || "সংযুক্ত ফাইল"}
                        </p>
                      )}
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={noticeShowName}
                        onChange={(e) => setNoticeShowName(e.target.checked)}
                      />
                      <span>নোটিশে আমার নাম দেখান</span>
                    </label>
                  </div>
                )}

                {mode === "student" && (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">ক্যাটাগরি:</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        value={studentKind}
                        onChange={(e) => setStudentKind(e.target.value)}
                      >
                        {studentKinds.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        placeholder="বিভাগ (যেমন: CSE)"
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                      />
                      <input
                        className="border border-slate-300 rounded-xl px-3 py-2 bg-white"
                        placeholder="ব্যাচ (যেমন: 19th Batch)"
                        value={studentBatch}
                        onChange={(e) => setStudentBatch(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Video className="size-4 text-slate-500 shrink-0" />
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white"
                    placeholder="YouTube / Facebook ভিডিও লিংক (ঐচ্ছিক)"
                    value={embedMediaUrl}
                    onChange={(e) => setEmbedMediaUrl(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-slate-500 shrink-0" />
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white"
                    placeholder="অতিরিক্ত ওয়েব লিংক (https://... ঐচ্ছিক)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-4 py-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-slate-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">AI label</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      AI দিয়ে তৈরি ছবি বা কন্টেন্ট হলে এই লেবেলটি চালু রাখুন।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiLabel(!aiLabel)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                    aiLabel ? "bg-blue-600" : "bg-slate-300"
                  }`}
                  role="switch"
                  aria-checked={aiLabel}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow transition ${
                      aiLabel ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {msg && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 text-xs font-bold text-center text-blue-900">
                {msg}
              </div>
            )}

            <div className="p-3.5 border-t border-slate-200 bg-white shrink-0">
              <button
                type="button"
                disabled={busy}
                onClick={handlePublish}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3 shadow-md transition cursor-pointer"
              >
                {busy ? "প্রকাশ হচ্ছে..." : editItem ? "Update Post" : "Post"}
              </button>
            </div>
          </>
        )}

        {/* ==================== ধাপ ৩বি: Audience Selector ==================== */}
        {step === "audience" && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setStep("publish")}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                <ChevronLeft className="size-6" />
              </button>
              <h2 className="font-bold text-base text-slate-900">Who can see your post?</h2>
              <span className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Who can see your post?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপনার পোস্টটি ওয়েবসাইটের কোথায় এবং কাদের কাছে দৃশ্যমান হবে তা নির্বাচন করুন।
                </p>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setAudience("public")}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                      <Globe className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">Public</p>
                      <p className="text-xs text-slate-500">ওয়েবসাইটের সকল ভিজিটর দেখতে পাবেন</p>
                    </div>
                  </div>
                  <span
                    className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      audience === "public" ? "border-blue-600" : "border-slate-400"
                    }`}
                  >
                    {audience === "public" && <span className="size-2.5 rounded-full bg-blue-600" />}
                  </span>
                </button>

                {mode === "notice" && isAdmin && (
                  <button
                    type="button"
                    onClick={() => setAudience("pinned")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                        <Pin className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Pinned (সবার ওপরে)</p>
                        <p className="text-xs text-slate-500">নোটিশ বোর্ডের সবার ওপরে পিন হয়ে থাকবে</p>
                      </div>
                    </div>
                    <span
                      className={`size-5 rounded-full border-2 flex items-center justify-center ${
                        audience === "pinned" ? "border-blue-600" : "border-slate-400"
                      }`}
                    >
                      {audience === "pinned" && <span className="size-2.5 rounded-full bg-blue-600" />}
                    </span>
                  </button>
                )}

                {mode === "student" && (
                  <button
                    type="button"
                    onClick={() => setAudience("featured")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Star className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Featured (বড় কার্ড)</p>
                        <p className="text-xs text-slate-500">স্টুডেন্ট কর্নারের প্রধান বড় কার্ডে দেখাবে</p>
                      </div>
                    </div>
                    <span
                      className={`size-5 rounded-full border-2 flex items-center justify-center ${
                        audience === "featured" ? "border-blue-600" : "border-slate-400"
                      }`}
                    >
                      {audience === "featured" && <span className="size-2.5 rounded-full bg-blue-600" />}
                    </span>
                  </button>
                )}

                {mode !== "notice" && (
                  <button
                    type="button"
                    onClick={() => setAudience("only_me")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                        <Lock className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Only me (খসড়া / লুকানো)</p>
                        <p className="text-xs text-slate-500">শুধু অ্যাডমিন প্যানেলে থাকবে, পাবলিক সাইটে দেখাবে না</p>
                      </div>
                    </div>
                    <span
                      className={`size-5 rounded-full border-2 flex items-center justify-center ${
                        audience === "only_me" ? "border-blue-600" : "border-slate-400"
                      }`}
                    >
                      {audience === "only_me" && <span className="size-2.5 rounded-full bg-blue-600" />}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setStep("publish")}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
