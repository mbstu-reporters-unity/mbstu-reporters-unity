"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff,
  User, Sparkles
} from "lucide-react"
import { supabase } from "@/lib/chat"
import {
  RTC_CONFIG, ringtone, getLocalMediaStream, stopMediaStream
} from "@/lib/webrtc"
import type { Profile } from "@/lib/sb"

export type CallType = "audio" | "video"
export type CallState = "idle" | "calling" | "incoming" | "connected"

interface CallModalProps {
  currentUser: Profile
  targetUser: Profile | null
  conversationId: string | null
  callType: CallType
  callState: CallState
  incomingCaller?: Profile | null
  onClose: () => void
  onAcceptIncoming?: () => void
}

export function CallModal({
  currentUser,
  targetUser,
  conversationId,
  callType,
  callState,
  incomingCaller,
  onClose,
  onAcceptIncoming,
}: CallModalProps) {
  const [micMuted, setMicMuted] = useState(false)
  const [camOff, setCamOff] = useState(callType === "audio")
  const [statusText, setStatusText] = useState("")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  // ১. কল শুরু ও সিগন্যালিং চ্যানেল
  useEffect(() => {
    if (callState === "idle" || !conversationId) return

    let activeChannel = supabase.channel(`call_room_${conversationId}`)

    async function initCall() {
      // লোকাল ক্যামেরা/মাইক চালু করা
      try {
        const stream = await getLocalMediaStream(callType === "video")
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      } catch {
        alert("ক্যামেরা বা মাইক্রোফোনের অনুমতি দেওয়া হয়নি")
        cleanup()
        onClose()
        return
      }

      const pc = new RTCPeerConnection(RTC_CONFIG)
      peerRef.current = pc

      // লোকাল অডিও ও ভিডিও ট্র্যাক পিয়ারে যুক্ত করা
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })

      // অপর প্রান্তের অডিও/ভিডিও রিসিভ করা
      pc.ontrack = (event) => {
        const [stream] = event.streams
        remoteStreamRef.current = stream
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
      }

      // আইস ক্যান্ডিডেট অন্য প্রান্তে পাঠানো
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          activeChannel.send({
            type: "broadcast",
            event: "ice_candidate",
            payload: { candidate: event.candidate, senderId: currentUser.id },
          })
        }
      }

      // কলিং অবস্থায় অফার তৈরি করে পাঠানো
      if (callState === "calling") {
        ringtone.start()
        setStatusText("কল বাজছে...")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        activeChannel.send({
          type: "broadcast",
          event: "offer",
          payload: { offer, caller: currentUser, callType },
        })
      }

      // সিগন্যাল লিসেনার
      activeChannel
        .on("broadcast", { event: "offer" }, async ({ payload }) => {
          if (payload.caller.id === currentUser.id) return
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          activeChannel.send({
            type: "broadcast",
            event: "answer",
            payload: { answer, senderId: currentUser.id },
          })
        })
        .on("broadcast", { event: "answer" }, async ({ payload }) => {
          if (payload.senderId === currentUser.id) return
          ringtone.stop()
          setStatusText("সংযুক্ত হয়েছে (Connected)")
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
        })
        .on("broadcast", { event: "ice_candidate" }, async ({ payload }) => {
          if (payload.senderId === currentUser.id) return
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
          } catch {}
        })
        .on("broadcast", { event: "call_ended" }, () => {
          cleanup()
          onClose()
        })
        .subscribe()
    }

    if (callState === "calling" || callState === "connected") {
      initCall()
    }

    return () => {
      cleanup()
      supabase.removeChannel(activeChannel)
    }
  }, [callState, conversationId])

  function cleanup() {
    ringtone.stop()
    stopMediaStream(localStreamRef.current)
    stopMediaStream(remoteStreamRef.current)
    if (peerRef.current) {
      peerRef.current.close()
      peerRef.current = null
    }
  }

  function handleEndCall() {
    if (conversationId) {
      const channel = supabase.channel(`call_room_${conversationId}`)
      channel.send({
        type: "broadcast",
        event: "call_ended",
        payload: { senderId: currentUser.id },
      })
    }
    cleanup()
    onClose()
  }

  function toggleMic() {
    if (!localStreamRef.current) return
    const audioTrack = localStreamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setMicMuted(!audioTrack.enabled)
    }
  }

  function toggleCam() {
    if (!localStreamRef.current) return
    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setCamOff(!videoTrack.enabled)
    }
  }

  if (callState === "idle") return null

  // ==================== ইনকামিং কল রিসিভ পপআপ ====================
  if (callState === "incoming" && incomingCaller) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-white/20 text-center space-y-4 shadow-2xl animate-in zoom-in-95 text-white">
          <div className="relative size-20 rounded-full bg-slate-800 ring-4 ring-cyan-400 mx-auto overflow-hidden shadow-xl flex items-center justify-center">
            {incomingCaller.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={incomingCaller.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-cyan-300">{incomingCaller.full_name.charAt(0)}</span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg text-white">{incomingCaller.full_name}</h3>
            <p className="text-xs text-cyan-300">
              {callType === "video" ? "📹 ইনকামিং ভিডিও কল..." : "📞 ইনকামিং অডিও কল..."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              type="button"
              onClick={handleEndCall}
              className="size-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer"
              title="বাতিল করুন"
            >
              <PhoneOff className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => {
                ringtone.stop()
                onAcceptIncoming?.()
              }}
              className="size-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer animate-bounce"
              title="কল রিসিভ করুন"
            >
              <Phone className="size-6" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== লাইভ অডিও/ভিডিও কল স্ক্রিন ====================
  const partner = targetUser || incomingCaller

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950 flex flex-col justify-between select-none">
      
      {/* টপ হেডার */}
      <div className="p-4 flex items-center justify-between text-white z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h4 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
            <Sparkles className="size-4 text-cyan-400" />
            <span>M-RU লাইভ কল</span>
          </h4>
          <p className="text-xs text-slate-300">{statusText || (callType === "video" ? "ভিডিও কল" : "অডিও কল")}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {partner?.full_name || "সদস্য"}
          </span>
        </div>
      </div>

      {/* ভিডিও ফ্রেম */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        {/* রিমোট ভিডিও (বড় স্ক্রিন) */}
        {callType === "video" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="size-24 rounded-full bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center">
              <User className="size-12 text-cyan-300" />
            </div>
            <p className="font-bold text-lg text-white">{partner?.full_name}</p>
            <p className="text-xs text-slate-400">লাইভ অডিও চলছে...</p>
          </div>
        )}

        {/* লোকাল সেলফি ভিডিও (ছোট ভাসমান উইন্ডো) */}
        {callType === "video" && (
          <div className="absolute bottom-4 right-4 size-28 sm:size-36 rounded-2xl overflow-hidden border-2 border-cyan-400 bg-slate-900 shadow-2xl z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`size-full object-cover ${camOff ? "hidden" : "block"}`}
            />
            {camOff && (
              <div className="size-full flex items-center justify-center text-[10px] text-white/50">
                ক্যামেরা বন্ধ
              </div>
            )}
          </div>
        )}
      </div>

      {/* বটম কন্ট্রোল বার (মিউট, ক্যামেরা, এন্ড কল) */}
      <div className="p-5 flex items-center justify-center gap-4 bg-gradient-to-t from-black via-slate-950 to-transparent z-20">
        <button
          type="button"
          onClick={toggleMic}
          className={`size-12 rounded-full flex items-center justify-center text-white transition active:scale-95 cursor-pointer ${
            micMuted ? "bg-rose-600" : "bg-white/20 hover:bg-white/30"
          }`}
          title={micMuted ? "মাইক অন করুন" : "মাইক মিউট করুন"}
        >
          {micMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>

        {callType === "video" && (
          <button
            type="button"
            onClick={toggleCam}
            className={`size-12 rounded-full flex items-center justify-center text-white transition active:scale-95 cursor-pointer ${
              camOff ? "bg-rose-600" : "bg-white/20 hover:bg-white/30"
            }`}
            title={camOff ? "ক্যামেরা অন করুন" : "ক্যামেরা অফ করুন"}
          >
            {camOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </button>
        )}

        <button
          type="button"
          onClick={handleEndCall}
          className="size-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl transition active:scale-95 cursor-pointer"
          title="কল শেষ করুন"
        >
          <PhoneOff className="size-6" />
        </button>
      </div>

    </div>
  )
}
