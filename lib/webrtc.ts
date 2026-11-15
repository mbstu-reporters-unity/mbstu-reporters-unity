// Google-এর ফ্রি ও বিশ্বস্ত STUN সার্ভার কনফিগারেশন
export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

// কোনো অডিও ফাইল ডাউনলোড ছাড়া ব্রাউজারেই নিরাপদ রিংটোন বাজানোর সাউন্ড ইঞ্জিন
class RingtonePlayer {
  private ctx: AudioContext | null = null
  private timer: NodeJS.Timeout | null = null
  private isPlaying = false

  start() {
    if (this.isPlaying) return
    this.isPlaying = true
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    } catch {
      return
    }

    const beep = () => {
      if (!this.isPlaying || !this.ctx) return
      try {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        const now = this.ctx.currentTime

        osc.type = "sine"
        osc.frequency.setValueAtTime(440, now) // 440 Hz
        osc.frequency.setValueAtTime(480, now + 0.1)

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05)
        gain.gain.linearRampToValueAtTime(0, now + 0.8)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now)
        osc.stop(now + 0.85)
      } catch {}
    }

    beep()
    this.timer = setInterval(beep, 2500)
  }

  stop() {
    this.isPlaying = false
    if (this.timer) clearInterval(this.timer)
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
  }
}

export const ringtone = new RingtonePlayer()

// ক্যামেরা ও মাইক্রোফোন পারমিশন নেওয়া
export async function getLocalMediaStream(video = true): Promise<MediaStream> {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: video
      ? {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        }
      : false,
  })
}

// ডিভাইসের ক্যামেরা বা মাইকের ট্র্যাকগুলো পুরোপুরি বন্ধ করা
export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}
