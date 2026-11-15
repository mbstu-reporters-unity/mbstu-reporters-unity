"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  Search, Send, ArrowLeft, Image as ImageIcon,
  MessageSquare, User, Phone, Video, CheckCircle2
} from "lucide-react"
import { getMe, uploadImage, type Profile } from "@/lib/sb"
import {
  getMyConversations, getConversationMessages, sendChatMessage,
  openDirectConversation, searchCampusUsers, supabase,
  type ConversationItem, type MessageItem
} from "@/lib/chat"
import { TopBar } from "@/components/portal/top-bar"
import { SiteHeader } from "@/components/portal/site-header"
import { CallModal, type CallType, type CallState } from "@/components/portal/call-modal"
import { ringtone } from "@/lib/webrtc"

export default function MessagesPage() {
  const [token, setToken] = useState("")
  const [me, setMe] = useState<Profile | null>(null)

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])

  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [uploadingImg, setUploadingImg] = useState(false)

  // কলিং স্টেট
  const [callState, setCallState] = useState<CallState>("idle")
  const [callType, setCallType] = useState<CallType>("audio")
  const [incomingCaller, setIncomingCaller] = useState<Profile | null>(null)
  const [activeCallConvId, setActiveCallConvId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = localStorage.getItem("mbstu_admin_token") || ""
    if (t) {
      setToken(t)
      getMe(t).then((profile) => {
        setMe(profile)
        if (profile) {
          loadConvs(t, profile.id)
          listenToPersonalCallSignals(profile)
        }
      })
    }
  }, [])

  // নিজের অ্যাকাউন্টে ইনকামিং কল আসার লিসেনার
  function listenToPersonalCallSignals(myProfile: Profile) {
    const channel = supabase.channel(`user_calls_${myProfile.id}`)
    channel
      .on("broadcast", { event: "incoming_call" }, ({ payload }) => {
        setIncomingCaller(payload.caller)
        setCallType(payload.callType)
        setActiveCallConvId(payload.conversationId)
        setCallState("incoming")
        ringtone.start()
      })
      .subscribe()
  }

  async function loadConvs(t: string, myId: string) {
    const list = await getMyConversations(t, myId)
    setConversations(list)

    if (typeof window !== "undefined") {
      const targetUid = new URLSearchParams(window.location.search).get("uid")
      if (targetUid) {
        const convId = await openDirectConversation(t, targetUid)
        if (convId) {
          const freshList = await getMyConversations(t, myId)
          setConversations(freshList)
          const target = freshList.find((c) => c.id === convId)
          if (target) selectConversation(target, t)
        }
      }
    }
  }

  // রিয়েলটাইম চ্যাট লিসেনার (WebSocket)
  useEffect(() => {
    if (!activeConv) return

    const channel = supabase
      .channel(`chat_${activeConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageItem
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConv?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function selectConversation(conv: ConversationItem, t = token) {
    setActiveConv(conv)
    setSearchQuery("")
    setSearchResults([])
    const msgs = await getConversationMessages(t, conv.id)
    setMessages(msgs)
  }

  async function handleSearch(q: string) {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    const res = await searchCampusUsers(token, q)
    setSearchResults(res.filter((u) => u.id !== me?.id))
  }

  async function handleStartChatWithUser(u: Profile) {
    if (!token || !me) return
    const convId = await openDirectConversation(token, u.id)
    if (convId) {
      const freshList = await getMyConversations(token, me.id)
      setConversations(freshList)
      const target = freshList.find((c) => c.id === convId) || {
        id: convId,
        type: "direct",
        updated_at: new Date().toISOString(),
        other_user: u,
      }
      selectConversation(target)
    }
  }

  async function handleSendMessage() {
    if ((!inputText.trim() && !uploadingImg) || !activeConv || !me) return
    const textToSend = inputText.trim()
    setInputText("")

    const sent = await sendChatMessage(token, activeConv.id, me.id, textToSend)
    if (sent) {
      setMessages((prev) => [...prev, sent])
    }
  }

  async function handleSendImage(f: File) {
    if (!activeConv || !me) return
    setUploadingImg(true)
    try {
      const url = await uploadImage(token, f)
      const sent = await sendChatMessage(token, activeConv.id, me.id, "", url)
      if (sent) setMessages((prev) => [...prev, sent])
    } catch {
      alert("ছবি পাঠানো যায়নি")
    }
    setUploadingImg(false)
  }

  // অডিও বা ভিডিও কল শুরু করা
  function startCall(type: CallType) {
    if (!activeConv?.other_user || !me) return
    setCallType(type)
    setActiveCallConvId(activeConv.id)
    setCallState("calling")

    // অপর প্রান্তের ইউজারের ব্যক্তিগত চ্যানেলে ইনকামিং নোটিফিকেশন পাঠানো
    const channel = supabase.channel(`user_calls_${activeConv.other_user.id}`)
    channel.send({
      type: "broadcast",
      event: "incoming_call",
      payload: {
        caller: me,
        callType: type,
        conversationId: activeConv.id,
      },
    })
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-[88vh] bg-slate-950 text-white flex flex-col p-2 sm:p-4 select-none">
        
        {!token ? (
          <div className="glass-card max-w-sm m-auto p-6 text-center space-y-3 rounded-3xl border border-white/20">
            <MessageSquare className="size-10 text-cyan-400 mx-auto" />
            <h2 className="font-bold text-lg text-white">M-RU টেক্সট (মেসেঞ্জার)</h2>
            <p className="text-xs text-slate-300">চ্যাট বা কল করতে একাউন্টে লগইন করুন।</p>
            <Link href="/admin" className="block py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs">
              লগইন পেইজে যান →
            </Link>
          </div>
        ) : (
          <div className="glass-card max-w-5xl w-full mx-auto flex-1 flex rounded-3xl border border-white/20 overflow-hidden shadow-2xl h-[82vh]">
            
            {/* কলাম ১: চ্যাট তালিকা ও সার্চ */}
            <div className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-slate-900/60 backdrop-blur-xl ${activeConv ? "hidden md:flex" : "flex"}`}>
              <div className="p-3.5 border-b border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                    <MessageSquare className="size-4" />
                    <span>M-RU টেক্সট</span>
                  </h2>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                    {conversations.length} টি চ্যাট
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-white/40" />
                  <input
                    className="w-full bg-white/10 border border-white/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    placeholder="নাম বা বিভাগ দিয়ে খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* সার্চ ফলাফল */}
              {searchResults.length > 0 && (
                <div className="p-2 bg-blue-950/60 border-b border-white/10 space-y-1">
                  <p className="text-[10px] font-bold text-cyan-300 px-2">সার্চ ফলাফল ({searchResults.length}):</p>
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleStartChatWithUser(u)}
                      className="p-2 rounded-xl hover:bg-white/10 cursor-pointer flex items-center gap-2.5 text-xs transition"
                    >
                      <div className="size-8 rounded-full bg-cyan-600 font-bold flex items-center justify-center shrink-0">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt="" className="size-full rounded-full object-cover" />
                        ) : (
                          u.full_name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{u.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.department || u.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* চলমান চ্যাট তালিকা */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-none">
                {conversations.map((c) => {
                  const isActive = activeConv?.id === c.id
                  const user = c.other_user
                  return (
                    <div
                      key={c.id}
                      onClick={() => selectConversation(c)}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                        isActive ? "bg-cyan-600/30 border-l-4 border-cyan-400" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="relative size-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center shrink-0">
                        {user?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar_url} alt="" className="size-full rounded-full object-cover" />
                        ) : (
                          <span className="font-bold text-sm text-cyan-300">{user?.full_name?.charAt(0) || "U"}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className="font-bold text-xs text-white truncate">{user?.full_name || "সদস্য"}</p>
                          <span className="text-[9px] text-white/40 shrink-0">
                            {c.last_message ? new Date(c.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.last_message?.media_url ? "📷 ছবি" : c.last_message?.content || "নতুন চ্যাট শুরু করুন"}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {conversations.length === 0 && !searchQuery && (
                  <p className="text-xs text-slate-400 text-center py-10 px-4">
                    কোনো সক্রিয় চ্যাট নেই। ওপরের সার্চ বক্সে নাম লিখে চ্যাট শুরু করুন।
                  </p>
                )}
              </div>
            </div>

            {/* কলাম ২: সক্রিয় চ্যাট স্ক্রিন */}
            <div className={`flex-1 flex flex-col bg-slate-950/80 backdrop-blur-md ${!activeConv ? "hidden md:flex items-center justify-center" : "flex"}`}>
              {activeConv ? (
                <>
                  {/* চ্যাট হেডার */}
                  <div className="p-3 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => setActiveConv(null)}
                        className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-white"
                      >
                        <ArrowLeft className="size-5" />
                      </button>

                      <div className="size-9 rounded-full bg-slate-800 border border-white/20 overflow-hidden shrink-0">
                        {activeConv.other_user?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={activeConv.other_user.avatar_url} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center font-bold text-xs text-cyan-300">
                            {activeConv.other_user?.full_name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link href={`/u/${activeConv.other_user?.id}`} className="font-bold text-xs sm:text-sm text-white hover:underline truncate block">
                          {activeConv.other_user?.full_name || "ক্যাম্পাস মেম্বার"}
                        </Link>
                        <p className="text-[10px] text-cyan-300 truncate">
                          {activeConv.other_user?.department || activeConv.other_user?.designation || "MBSTU"}
                        </p>
                      </div>
                    </div>

                    {/* ✅ সক্রিয় লাইভ অডিও ও ভিডিও কল বাটনসমূহ */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startCall("audio")}
                        className="p-2.5 rounded-full bg-cyan-600/80 hover:bg-cyan-600 text-white transition shadow active:scale-95 cursor-pointer"
                        title="লাইভ অডিও কল করুন"
                      >
                        <Phone className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startCall("video")}
                        className="p-2.5 rounded-full bg-blue-600/80 hover:bg-blue-600 text-white transition shadow active:scale-95 cursor-pointer"
                        title="লাইভ ভিডিও কল করুন"
                      >
                        <Video className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* মেসেজ ফিড */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                    {messages.map((m) => {
                      const isMe = m.sender_id === me?.id
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-md ${
                              isMe
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs"
                                : "bg-white/15 text-slate-100 rounded-tl-xs border border-white/10"
                            }`}
                          >
                            {m.media_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.media_url} alt="" className="rounded-xl max-h-56 w-auto mb-1 object-cover" />
                            )}
                            {m.content && <p className="whitespace-pre-line">{m.content}</p>}
                          </div>
                          <span className="text-[9px] text-white/35 px-1 mt-0.5">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* ইনপুট বার */}
                  <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleSendImage(f)
                      }}
                    />

                    <button
                      type="button"
                      disabled={uploadingImg}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 transition shrink-0"
                      title="ছবি পাঠান"
                    >
                      <ImageIcon className="size-4" />
                    </button>

                    <input
                      className="flex-1 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                      placeholder={uploadingImg ? "ছবি আপলোড হচ্ছে..." : "একটি বার্তা লিখুন..."}
                      value={inputText}
                      disabled={uploadingImg}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />

                    <button
                      type="button"
                      disabled={!inputText.trim()}
                      onClick={handleSendMessage}
                      className="size-9 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition shrink-0 disabled:opacity-40"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-2 text-white/60">
                  <MessageSquare className="size-12 mx-auto text-cyan-400/50" />
                  <p className="font-bold text-sm text-white">M-RU টেক্সটে স্বাগতম</p>
                  <p className="text-xs">বামের তালিকা থেকে যেকোনো ইউজারের ওপর ট্যাপ করে চ্যাট বা কল করুন।</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* অডিও ও ভিডিও কল মডাল */}
        {me && (
          <CallModal
            currentUser={me}
            targetUser={activeConv?.other_user || null}
            conversationId={activeCallConvId}
            callType={callType}
            callState={callState}
            incomingCaller={incomingCaller}
            onClose={() => {
              setCallState("idle")
              setIncomingCaller(null)
            }}
            onAcceptIncoming={() => {
              setCallState("connected")
            }}
          />
        )}

      </main>
    </>
  )
}
