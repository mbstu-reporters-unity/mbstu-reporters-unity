'use client'

import React, { useState } from 'react'
import { addComment, type PublicComment } from '@/lib/sb'
import {
  MessageSquare,
  CornerDownRight,
  Send,
  User,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react'

// সময় ফরম্যাট (যেমন: ৫ মিনিট আগে)
function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const n = (x: number) => Math.floor(x).toLocaleString('bn-BD')
  if (s < 60) return 'এইমাত্র'
  if (s < 3600) return `${n(s / 60)} মিনিট আগে`
  if (s < 86400) return `${n(s / 3600)} ঘণ্টা আগে`
  if (s < 86400 * 30) return `${n(s / 86400)} দিন আগে`
  if (s < 86400 * 365) return `${n(s / (86400 * 30))} মাস আগে`
  return `${n(s / (86400 * 365))} বছর আগে`
}

export function CommentForm({
  postId,
  initialComments = [],
}: {
  postId: string
  initialComments?: PublicComment[]
}) {
  const [comments] = useState<PublicComment[]>(initialComments)

  // মূল মন্তব্য ফর্মের স্টেট
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [msgStatus, setMsgStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  // রিপ্লাই ফর্মের স্টেট
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyName, setReplyName] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [replyStatus, setReplyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [replyErrMsg, setReplyErrMsg] = useState('')

  // মূল মন্তব্য পাঠানো
  async function handleSendComment() {
    const trimmed = message.trim()
    if (!trimmed) return
    if (trimmed.length < 3) {
      setMsgStatus('error')
      setErrMsg('মন্তব্য কমপক্ষে ৩ অক্ষরের হতে হবে।')
      return
    }

    setBusy(true)
    setMsgStatus('idle')
    setErrMsg('')

    try {
      await addComment(postId, name.trim() || 'নামহীন পাঠক', trimmed)
      setName('')
      setMessage('')
      setMsgStatus('success')
    } catch (e) {
      setMsgStatus('error')
      setErrMsg(e instanceof Error ? e.message : 'মন্তব্য জমা দেওয়া যায়নি, পুনরায় চেষ্টা করুন।')
    }
    setBusy(false)
  }

  // রিপ্লাই পাঠানো
  async function handleSendReply(parentId: string) {
    const trimmed = replyMessage.trim()
    if (!trimmed) return
    if (trimmed.length < 2) {
      setReplyStatus('error')
      setReplyErrMsg('রিপ্লাই খুব সংক্ষিপ্ত হয়েছে।')
      return
    }

    setReplyBusy(true)
    setReplyStatus('idle')
    setReplyErrMsg('')

    try {
      await addComment(postId, replyName.trim() || 'নামহীন পাঠক', trimmed, parentId)
      setReplyMessage('')
      setReplyName('')
      setReplyStatus('success')
      setTimeout(() => {
        setReplyingTo(null)
        setReplyStatus('idle')
      }, 4000)
    } catch (e) {
      setReplyStatus('error')
      setReplyErrMsg(e instanceof Error ? e.message : 'রিপ্লাই পাঠানো যায়নি।')
    }
    setReplyBusy(false)
  }

  // মূল মন্তব্য ও রিপ্লাই আলাদা করা
  const rootComments = comments.filter((c) => !c.parent_id)
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId)

  return (
    <div className="space-y-6 pt-2" id="comments-section">
      
      {/* হেডার */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <h3 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
          <MessageSquare className="size-5 text-brand" />
          <span>মন্তব্য ও আলোচনা ({comments.length})</span>
        </h3>
      </div>

      {/* মন্তব্য ও রিপ্লাইয়ের তালিকা */}
      <div className="space-y-4">
        {rootComments.map((c) => {
          const replies = getReplies(c.id)
          const isReplying = replyingTo === c.id

          return (
            <div key={c.id} className="rounded-2xl border border-border/70 bg-white p-4 shadow-xs space-y-3">
              
              {/* মূল মন্তব্যকারী */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                    {(c.name || 'ন').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-navy">{c.name || 'নামহীন পাঠক'}</p>
                    <p className="text-[10px] text-gray-500">{timeAgo(c.created_at)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(isReplying ? null : c.id)
                    setReplyStatus('idle')
                    setReplyErrMsg('')
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-gray-50 hover:bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-brand border border-border transition-colors cursor-pointer"
                >
                  <CornerDownRight className="size-3" />
                  <span>{isReplying ? 'বাতিল' : 'রিপ্লাই দিন'}</span>
                </button>
              </div>

              {/* মন্তব্যের মূল লেখা */}
              <p className="whitespace-pre-line text-sm text-slate-800 leading-relaxed pl-1">
                {c.message}
              </p>

              {/* রিপ্লাই ফর্ম (যখন 'রিপ্লাই দিন' বাটনে চাপ দেওয়া হবে) */}
              {isReplying && (
                <div className="mt-3 rounded-2xl border border-emerald-300 bg-emerald-50/40 p-3.5 space-y-2.5 animate-in fade-in">
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <CornerDownRight className="size-3.5 text-emerald-700" />
                    <span>{c.name || 'পাঠক'}-এর মন্তব্যের উত্তর লিখুন:</span>
                  </p>
                  <input
                    className="w-full rounded-xl border border-emerald-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-brand"
                    placeholder="আপনার নাম (ঐচ্ছিক)"
                    maxLength={60}
                    value={replyName}
                    onChange={(e) => setReplyName(e.target.value)}
                  />
                  <textarea
                    rows={2}
                    maxLength={1000}
                    className="w-full rounded-xl border border-emerald-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-brand"
                    placeholder="রিপ্লাই লিখুন..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendReply(c.id)}
                      disabled={replyBusy || !replyMessage.trim()}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Send className="size-3" />
                      <span>{replyBusy ? 'পাঠানো হচ্ছে...' : 'রিপ্লাই পাঠান'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-xs text-gray-500 hover:underline px-2"
                    >
                      বাতিল
                    </button>
                  </div>

                  {replyStatus === 'success' && (
                    <div className="flex items-start gap-1.5 rounded-xl bg-emerald-100/90 text-emerald-900 p-2 text-xs font-semibold animate-in fade-in">
                      <CheckCircle2 className="size-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>রিপ্লাই জমা হয়েছে! মডারেশন পর্যালোচনার পর এটি দৃশ্যমান হবে।</span>
                    </div>
                  )}

                  {replyStatus === 'error' && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                      ❌ {replyErrMsg}
                    </p>
                  )}
                </div>
              )}

              {/* রিপ্লাইসমূহ (নেস্টেড থ্রেড) */}
              {replies.length > 0 && (
                <div className="mt-3 space-y-2.5 border-l-2 border-emerald-600 pl-3 sm:pl-4 pt-1">
                  {replies.map((r) => (
                    <div key={r.id} className="rounded-xl bg-gray-50 p-2.5 border border-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-navy flex items-center gap-1">
                          <User className="size-3 text-emerald-700" />
                          <span>{r.name || 'নামহীন পাঠক'}</span>
                        </p>
                        <span className="text-[10px] text-gray-400">{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-line text-xs text-slate-800 pl-4">
                        {r.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {rootComments.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6 bg-white rounded-2xl border border-dashed">
            এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!
          </p>
        )}
      </div>

      {/* নতুন মূল মন্তব্য লেখার বক্স */}
      <div className="rounded-3xl border border-border bg-white p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-navy">আপনার গঠনমূলক মন্তব্য লিখুন:</h4>
          <span className="text-[11px] text-gray-400">{message.length}/১০০০</span>
        </div>

        <input
          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-brand transition-colors"
          placeholder="আপনার নাম (ঐচ্ছিক)"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-brand transition-colors"
          rows={3}
          maxLength={1000}
          placeholder="সংবাদ সম্পর্কে আপনার মতামত লিখুন..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleSendComment}
            disabled={busy || !message.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
          >
            <Send className="size-3.5" />
            <span>{busy ? 'পাঠানো হচ্ছে...' : 'মন্তব্য প্রকাশ করুন'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Info className="size-3.5 text-emerald-700 shrink-0" />
            <span>মন্তব্য প্রকাশের পূর্বে অ্যাডমিন দ্বারা অনুমোদিত হবে।</span>
          </div>
        </div>

        {/* সফলতার সুস্পষ্ট বার্তা */}
        {msgStatus === 'success' && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs text-emerald-950 animate-in fade-in">
            <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">আপনার মন্তব্য সফলভাবে জমা হয়েছে!</p>
              <p className="text-emerald-800 leading-relaxed">
                আমাদের ক্যাম্পাস মডারেশন টিম যাচাই করার পর মন্তব্যটি এখানে প্রদর্শিত হবে। আপনার গঠনমূলক মতামতের জন্য ধন্যবাদ।
              </p>
            </div>
          </div>
        )}

        {/* এরর বার্তা */}
        {msgStatus === 'error' && (
          <p className="text-xs font-semibold text-center text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
            ❌ {errMsg}
          </p>
        )}
      </div>
    </div>
  )
}
