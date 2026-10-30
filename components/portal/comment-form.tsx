'use client'

import { useState } from 'react'
import { addComment } from '@/lib/sb'

export function CommentForm({ postId }: { postId: string }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function send() {
    if (!message.trim()) return
    setBusy(true)
    setMsg('')
    try {
      await addComment(postId, name.trim() || 'নামহীন', message.trim())
      setName('')
      setMessage('')
      setMsg('✅ মন্তব্য জমা হয়েছে। অনুমোদনের পর দেখা যাবে।')
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'ব্যর্থ হয়েছে'))
    }
    setBusy(false)
  }

  return (
    <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
      <input className="w-full rounded-xl border px-3 py-2" placeholder="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="w-full rounded-xl border px-3 py-2" rows={3} placeholder="মন্তব্য লিখুন" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={send} disabled={busy} className="w-full rounded-xl bg-green-700 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? 'অপেক্ষা করুন...' : 'মন্তব্য পাঠান'}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}
