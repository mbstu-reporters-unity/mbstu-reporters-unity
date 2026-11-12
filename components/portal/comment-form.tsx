'use client'

import React, { useState } from 'react'
import { addComment, type PublicComment } from '@/lib/sb'
import {
  MessageSquare,
  CornerDownRight,
  Send,
  User,
  CheckCircle2,
  Info,
} from 'lucide-react'

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

  // মূল মন্তব্য ফর্ম স্টেট
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [msgStatus, setMsgStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  // রিপ্লাই ফর্ম স্টেট
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyName, setReplyName] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [replyStatus, setReplyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [replyErrMsg, setReplyErrMsg] = useState('')

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

  const rootComments = comments.filter((c) => !c.parent_id)
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId)

  return (
    <div className="space-y-6 pt-2 text-white" id="comments-section">
      
      {/* হেডার: স্পষ্ট সাদা ও উজ্জ্বল আইকন */}
      <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
        <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2 drop-shadow-sm">
          <MessageSquare className="size-5 text-cyan-300" />
          <span>মন্তব্য ও আলোচনা ({comments.length})</span>
        </h3>
      </div>

      {/* মন্তব্য ও রিপ্লাইয়ের তালিকা */}
      <div className="space-y-4">
        {rootComments.map((c) => {
          const replies = getReplies(c.id)
          const isReplying = replyingTo === c.id

          return (
            <div key={c.id} className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md space-y-3">
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold flex items-center justify-center text-xs">
                    {(c.name || 'ন').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-cyan-300">{c.name || 'নামহীন পাঠক'}</p>
                    <p className="text-[10px] text-white/50">{timeAgo(c.created_at)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(isReplying ? null : c.id)
                    setReplyStatus('idle')
                    setReplyErrMsg('')
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-xs font-semibold text-cyan-200 border border-white/20 transition-colors cursor-pointer"
                >
                  <CornerDownRight className="size-3" />
                  <span>{isReplying ? 'বাতিল' : 'রিপ্লাই দিন'}</span>
                </button>
              </div>

              <p className="whitespace-pre-line text-sm text-slate-100 leading-relaxed pl-1">
                {c.message}
              </p>

              {/* রিপ্লাই ফর্ম */}
              {isReplying && (
                <div className="mt-3 rounded-2xl border border-cyan-400/40 bg-black/40 p-3.5 space-y-2.5 backdrop-blur-md animate-in fade-in">
                  <p className="text-xs font-bold text-cyan-200 flex items-center gap-1">
                    <CornerDownRight className="size-3.5 text-cyan-400" />
                    <span>{c.name || 'পাঠক'}-এর মন্তব্যের উত্তর লিখুন:</span>
                  </p>
                  <input
                    className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    placeholder="আপনার নাম (ঐচ্ছিক)"
                    maxLength={60}
                    value={replyName}
                    onChange={(e) => setReplyName(e.target.value)}
                  />
                  <textarea
                    rows={2}
                    maxLength={1000}
                    className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    placeholder="রিপ্লাই লিখুন..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendReply(c.id)}
                      disabled={replyBusy || !replyMessage.trim()}
                      className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      <Send className="size-3" />
                      <span>{replyBusy ? 'পাঠানো হচ্ছে...' : 'রিপ্লাই পাঠান'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-xs text-white/60 hover:underline px-2"
                    >
                      বাতিল
                    </button>
                  </div>

                  {replyStatus === 'success' && (
                    <div className="flex items-start gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 p-2 text-xs font-semibold animate-in fade-in">
                      <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>রিপ্লাই জমা হয়েছে! মডারেশন পর্যালোচনার পর এটি দৃশ্যমান হবে।</span>
                    </div>
                  )}

                  {replyStatus === 'error' && (
                    <p className="text-xs font-semibold text-rose-300 bg-rose-500/20 p-2 rounded-xl border border-rose-400/40">
                      ❌ {replyErrMsg}
                    </p>
                  )}
                </div>
              )}

              {/* রিপ্লাই থ্রেড */}
              {replies.length > 0 && (
                <div className="mt-3 space-y-2.5 border-l-2 border-cyan-400 pl-3 sm:pl-4 pt-1">
                  {replies.map((r) => (
                    <div key={r.id} className="rounded-xl bg-white/5 p-2.5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-cyan-200 flex items-center gap-1">
                          <User className="size-3 text-cyan-400" />
                          <span>{r.name || 'নামহীন পাঠক'}</span>
                        </p>
                        <span className="text-[10px] text-white/40">{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-line text-xs text-slate-200 pl-4">
                        {r.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* ফাঁকা অবস্থা: এখন স্পষ্ট সাদাটে টেক্সটে পড়া যাবে */}
        {rootComments.length === 0 && (
          <p className="text-center text-xs text-slate-200 py-6 bg-white/10 rounded-2xl border border-dashed border-white/20 backdrop-blur-md">
            এখনো কোনো মন্তব্য নেই। প্রথম গঠনমূলক মন্তব্যটি আপনিই করুন!
          </p>
        )}
      </div>

      {/* নতুন মূল মন্তব্য লেখার বক্স */}
      <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-lg space-y-3.5 text-white">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-white drop-shadow-sm">আপনার গঠনমূলক মন্তব্য লিখুন:</h4>
          <span className="text-[11px] text-white/50">{message.length}/১০০০</span>
        </div>

        <input
          className="w-full rounded-xl border border-white/20 px-3.5 py-2 text-xs bg-black/30 text-white placeholder-white/40 focus:bg-black/50 focus:outline-none focus:border-cyan-400 transition-colors"
          placeholder="আপনার নাম (ঐচ্ছিক)"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-white/20 px-3.5 py-2 text-xs bg-black/30 text-white placeholder-white/40 focus:bg-black/50 focus:outline-none focus:border-cyan-400 transition-colors"
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
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-md active:scale-95 border border-white/20"
          >
            <Send className="size-3.5" />
            <span>{busy ? 'পাঠানো হচ্ছে...' : 'মন্তব্য প্রকাশ করুন'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-white/70">
            <Info className="size-3.5 text-cyan-400 shrink-0" />
            <span>মন্তব্য প্রকাশের পূর্বে অ্যাডমিন দ্বারা অনুমোদিত হবে।</span>
          </div>
        </div>

        {msgStatus === 'success' && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 p-3.5 text-xs text-cyan-200 animate-in fade-in">
            <CheckCircle2 className="size-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">আপনার মন্তব্য সফলভাবে জমা হয়েছে!</p>
              <p className="text-white/80 leading-relaxed">
                আমাদের ক্যাম্পাস মডারেশন টিম যাচাই করার পর মন্তব্যটি এখানে প্রদর্শিত হবে।
              </p>
            </div>
          </div>
        )}

        {msgStatus === 'error' && (
          <p className="text-xs font-semibold text-center text-rose-300 bg-rose-500/20 p-2.5 rounded-xl border border-rose-400/40">
            ❌ {errMsg}
          </p>
        )}
      </div>
    </div>
  )
}
