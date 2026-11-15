'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Clock,
  MessageSquare,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  acceptFriendRequest,
  getMyFriendships,
  getValidClientAuth,
  removeFriendship,
  searchMembersToBefriend,
  sendFriendRequest,
  type FriendEntry,
  type PublicMember,
} from '@/lib/friends'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'

const TYPE_LABEL: Record<string, string> = {
  teacher: '👨‍🏫 শিক্ষক',
  student: '🎓 শিক্ষার্থী',
  staff: '💼 কর্মচারী',
  reporter: '📰 সাংবাদিক',
}

function MemberSubtitle({ u }: { u: PublicMember }) {
  const parts = [
    TYPE_LABEL[u.user_type || 'student'] || 'সদস্য',
    u.designation,
    u.department ? `${u.department}${u.batch ? ` (${u.batch})` : ''}` : null,
    u.office_section,
    u.newspaper_name,
  ].filter(Boolean)
  return <p className="text-[11px] text-cyan-200/80 truncate">{parts.join(' · ')}</p>
}

function MemberAvatar({ u }: { u: PublicMember }) {
  if (u.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={u.avatar_url}
        alt={u.full_name}
        className="size-12 rounded-full object-cover object-top ring-2 ring-cyan-400/50 shrink-0 bg-slate-900"
      />
    )
  }
  return (
    <div className="size-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0 ring-2 ring-white/20">
      {u.full_name.charAt(0)}
    </div>
  )
}

export default function FriendsPage() {
  const [ready, setReady] = useState(false)
  const [auth, setAuth] = useState<{ token: string; userId: string } | null>(null)
  const [tab, setTab] = useState<'friends' | 'requests' | 'find'>('friends')

  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [incoming, setIncoming] = useState<FriendEntry[]>([])
  const [outgoing, setOutgoing] = useState<FriendEntry[]>([])

  const [query, setQuery] = useState('')
  const [directory, setDirectory] = useState<PublicMember[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function loadAll(a: { token: string; userId: string }) {
    const [data, members] = await Promise.all([
      getMyFriendships(a.token, a.userId),
      searchMembersToBefriend(a.token, query, a.userId),
    ])
    setFriends(data.friends)
    setIncoming(data.incoming)
    setOutgoing(data.outgoing)
    setDirectory(members)
    if (data.incoming.length > 0) {
      setTab((prev) => (prev === 'friends' && data.friends.length === 0 ? 'requests' : prev))
    }
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      const a = await getValidClientAuth()
      if (!alive) return
      setAuth(a)
      if (a) {
        await loadAll(a)
      }
      if (alive) setReady(true)
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!auth) return
    const timer = setTimeout(() => {
      searchMembersToBefriend(auth.token, query, auth.userId).then(setDirectory)
    }, 250)
    return () => clearTimeout(timer)
  }, [query, auth])

  const relationMap = useMemo(() => {
    const map = new Map<
      string,
      { kind: 'accepted' | 'incoming' | 'outgoing'; friendshipId: string }
    >()
    friends.forEach((f) => map.set(f.user.id, { kind: 'accepted', friendshipId: f.friendship.id }))
    incoming.forEach((f) => map.set(f.user.id, { kind: 'incoming', friendshipId: f.friendship.id }))
    outgoing.forEach((f) => map.set(f.user.id, { kind: 'outgoing', friendshipId: f.friendship.id }))
    return map
  }, [friends, incoming, outgoing])

  async function handleSend(targetId: string) {
    if (!auth || busyId) return
    setBusyId(targetId)
    setMsg('')
    try {
      await sendFriendRequest(auth.token, auth.userId, targetId)
      await loadAll(auth)
      setMsg('✅ ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে')
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'রিকোয়েস্ট পাঠানো যায়নি'))
    }
    setBusyId(null)
  }

  async function handleAccept(friendshipId: string) {
    if (!auth || busyId) return
    setBusyId(friendshipId)
    setMsg('')
    try {
      await acceptFriendRequest(auth.token, friendshipId)
      await loadAll(auth)
      setMsg('✅ ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে! এখন আপনারা M-RU টেক্সটে কথা বলতে পারবেন।')
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'গ্রহণ করা যায়নি'))
    }
    setBusyId(null)
  }

  async function handleRemove(friendshipId: string, ask?: string) {
    if (!auth || busyId) return
    if (ask && !confirm(ask)) return
    setBusyId(friendshipId)
    setMsg('')
    try {
      await removeFriendship(auth.token, friendshipId)
      await loadAll(auth)
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'সম্পন্ন করা যায়নি'))
    }
    setBusyId(null)
  }

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-[82vh] py-6 sm:py-10 px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">

          <BackNavigation items={[{ label: 'বন্ধু ও ফ্রেন্ড রিকোয়েস্ট' }]} />

          {ready && !auth ? (
            <div className="glass-card max-w-md mx-auto p-8 text-center space-y-3 text-white">
              <Users className="size-12 text-cyan-400 mx-auto" />
              <h1 className="font-serif text-xl font-bold">বন্ধু ও ফ্রেন্ড রিকোয়েস্ট</h1>
              <p className="text-xs text-slate-300">
                ক্যাম্পাসের শিক্ষক, শিক্ষার্থী, কর্মচারী ও সাংবাদিকদের বন্ধু বানাতে এবং চ্যাট করতে লগইন করুন।
              </p>
              <Link
                href="/admin"
                className="inline-block rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg"
              >
                লগইন / নিবন্ধন করুন →
              </Link>
            </div>
          ) : (
            <>
              {/* হেডার ও ট্যাব */}
              <div className="glass-card p-5 space-y-4 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2">
                      <Users className="size-6 text-cyan-400" />
                      <span>বন্ধু ও নেটওয়ার্ক</span>
                    </h1>
                    <p className="text-xs text-cyan-200/80 mt-0.5">
                      ফ্রেন্ড রিকোয়েস্ট পাঠিয়ে বন্ধু হোন এবং M-RU টেক্সটে প্রাইভেট কথা বলুন।
                    </p>
                  </div>
                  <Link
                    href="/messages"
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold shadow"
                  >
                    <MessageSquare className="size-3.5" />
                    <span>M-RU টেক্সটে যান</span>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTab('friends')}
                    className={`py-2.5 px-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      tab === 'friends'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300/50 shadow'
                        : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <UserCheck className="size-3.5" />
                    <span>বন্ধু ({friends.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('requests')}
                    className={`py-2.5 px-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      tab === 'requests'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300/50 shadow'
                        : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <Clock className="size-3.5" />
                    <span>রিকোয়েস্ট</span>
                    {incoming.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                        {incoming.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('find')}
                    className={`py-2.5 px-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      tab === 'find'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300/50 shadow'
                        : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <UserPlus className="size-3.5" />
                    <span>বন্ধু খুঁজুন</span>
                  </button>
                </div>
              </div>

              {msg && (
                <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold text-center">
                  {msg}
                </div>
              )}

              {/* ট্যাব ১: আমার বন্ধু তালিকা */}
              {tab === 'friends' && (
                <div className="space-y-3">
                  {friends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {friends.map(({ friendship, user }) => (
                        <div
                          key={friendship.id}
                          className="glass-card p-4 flex items-center justify-between gap-3 text-white"
                        >
                          <Link href={`/u/${user.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                            <MemberAvatar u={user} />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white hover:text-cyan-300 truncate">
                                {user.full_name}
                              </p>
                              <MemberSubtitle u={user} />
                            </div>
                          </Link>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Link
                              href={`/messages?uid=${user.id}`}
                              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-xs font-bold shadow"
                              title="চ্যাট করুন"
                            >
                              <MessageSquare className="size-3.5" />
                              <span className="hidden xs:inline">চ্যাট</span>
                            </Link>
                            <button
                              type="button"
                              disabled={busyId === friendship.id}
                              onClick={() =>
                                handleRemove(
                                  friendship.id,
                                  `${user.full_name}-কে বন্ধু তালিকা থেকে সরাতে চান?`
                                )
                              }
                              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white/70 hover:text-white border border-white/15 cursor-pointer transition"
                              title="Unfriend"
                            >
                              <UserMinus className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-10 text-center space-y-3 text-white">
                      <p className="text-sm font-bold">আপনার এখনো কোনো বন্ধু নেই।</p>
                      <button
                        type="button"
                        onClick={() => setTab('find')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 text-xs font-bold cursor-pointer"
                      >
                        <UserPlus className="size-4" />
                        <span>ক্যাম্পাসের বন্ধু খুঁজুন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ট্যাব ২: আসা ও পাঠানো রিকোয়েস্ট */}
              {tab === 'requests' && (
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <h2 className="font-bold text-sm text-cyan-300 px-1">
                      আগত ফ্রেন্ড রিকোয়েস্ট ({incoming.length})
                    </h2>
                    {incoming.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {incoming.map(({ friendship, user }) => (
                          <div
                            key={friendship.id}
                            className="glass-card p-4 space-y-3 text-white"
                          >
                            <Link href={`/u/${user.id}`} className="flex items-center gap-3 min-w-0">
                              <MemberAvatar u={user} />
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white hover:text-cyan-300 truncate">
                                  {user.full_name}
                                </p>
                                <MemberSubtitle u={user} />
                              </div>
                            </Link>
                            <div className="flex items-center gap-2 text-xs font-bold">
                              <button
                                type="button"
                                disabled={busyId === friendship.id}
                                onClick={() => handleAccept(friendship.id)}
                                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 cursor-pointer disabled:opacity-50"
                              >
                                <Check className="size-3.5" />
                                <span>গ্রহণ করুন</span>
                              </button>
                              <button
                                type="button"
                                disabled={busyId === friendship.id}
                                onClick={() => handleRemove(friendship.id)}
                                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-rose-600 text-white border border-white/20 py-2 cursor-pointer disabled:opacity-50"
                              >
                                <X className="size-3.5" />
                                <span>বাতিল</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="glass-card p-6 text-center text-xs text-slate-300">
                        নতুন কোনো ফ্রেন্ড রিকোয়েস্ট নেই।
                      </div>
                    )}
                  </div>

                  {outgoing.length > 0 && (
                    <div className="space-y-2.5">
                      <h2 className="font-bold text-sm text-slate-300 px-1">
                        আপনার পাঠানো রিকোয়েস্ট ({outgoing.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {outgoing.map(({ friendship, user }) => (
                          <div
                            key={friendship.id}
                            className="glass-card p-4 flex items-center justify-between gap-3 text-white"
                          >
                            <Link href={`/u/${user.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                              <MemberAvatar u={user} />
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{user.full_name}</p>
                                <MemberSubtitle u={user} />
                              </div>
                            </Link>
                            <button
                              type="button"
                              disabled={busyId === friendship.id}
                              onClick={() => handleRemove(friendship.id)}
                              className="shrink-0 rounded-xl bg-white/10 hover:bg-rose-600 text-white border border-white/20 px-3 py-1.5 text-xs font-bold cursor-pointer"
                            >
                              বাতিল করুন
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ট্যাব ৩: নতুন বন্ধু খুঁজুন */}
              {tab === 'find' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <input
                      className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 backdrop-blur-md"
                      placeholder="নাম, বিভাগ বা পদবি লিখে ক্যাম্পাসের সদস্যদের খুঁজুন..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {directory.map((u) => {
                      const rel = relationMap.get(u.id)
                      return (
                        <div
                          key={u.id}
                          className="glass-card p-4 flex items-center justify-between gap-3 text-white"
                        >
                          <Link href={`/u/${u.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                            <MemberAvatar u={u} />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white hover:text-cyan-300 truncate">
                                {u.full_name}
                              </p>
                              <MemberSubtitle u={u} />
                            </div>
                          </Link>

                          <div className="shrink-0 text-xs font-bold">
                            {!rel && (
                              <button
                                type="button"
                                disabled={busyId === u.id}
                                onClick={() => handleSend(u.id)}
                                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 cursor-pointer disabled:opacity-50"
                              >
                                <UserPlus className="size-3.5" />
                                <span>বন্ধু হোন</span>
                              </button>
                            )}
                            {rel?.kind === 'accepted' && (
                              <Link
                                href={`/messages?uid=${u.id}`}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/80 text-white px-3 py-2"
                              >
                                <MessageSquare className="size-3.5" />
                                <span>চ্যাট</span>
                              </Link>
                            )}
                            {rel?.kind === 'outgoing' && (
                              <button
                                type="button"
                                disabled={busyId === rel.friendshipId}
                                onClick={() => handleRemove(rel.friendshipId)}
                                className="rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2.5 py-2 cursor-pointer"
                              >
                                পাঠানো হয়েছে ✕
                              </button>
                            )}
                            {rel?.kind === 'incoming' && (
                              <button
                                type="button"
                                disabled={busyId === rel.friendshipId}
                                onClick={() => handleAccept(rel.friendshipId)}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-2 cursor-pointer"
                              >
                                <Check className="size-3.5" />
                                <span>গ্রহণ করুন</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {directory.length === 0 && (
                    <div className="glass-card p-8 text-center text-xs text-slate-300">
                      কোনো সদস্য পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
