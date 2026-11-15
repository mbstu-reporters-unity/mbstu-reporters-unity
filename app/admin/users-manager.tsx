"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Hash,
  Mail,
  Newspaper,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Briefcase,
  XCircle,
} from "lucide-react"
import {
  getAllProfilesAdmin,
  removeReporter,
  setProfileApproved,
  setProfileRole,
  type Profile,
  type UserType,
} from "../../lib/sb"

const SECTION_META: Array<{
  key: UserType
  label: string
  short: string
  icon: typeof GraduationCap
  badgeCls: string
}> = [
  {
    key: "teacher",
    label: "শিক্ষক তালিকা",
    short: "শিক্ষক",
    icon: GraduationCap,
    badgeCls: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    key: "student",
    label: "শিক্ষার্থী তালিকা",
    short: "শিক্ষার্থী",
    icon: User,
    badgeCls: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  {
    key: "staff",
    label: "কর্মচারী তালিকা",
    short: "কর্মচারী",
    icon: Briefcase,
    badgeCls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    key: "reporter",
    label: "সাংবাদিক তালিকা",
    short: "সাংবাদিক",
    icon: Newspaper,
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
]

function resolveUserType(p: Profile): UserType {
  if (
    p.user_type === "teacher" ||
    p.user_type === "student" ||
    p.user_type === "staff" ||
    p.user_type === "reporter"
  ) {
    return p.user_type
  }
  return p.newspaper_name ? "reporter" : "student"
}

export default function UsersManager({
  token,
  currentAdminId,
  initialSection = "teacher",
  onChanged,
}: {
  token: string
  currentAdminId: string
  initialSection?: UserType
  onChanged?: () => Promise<void> | void
}) {
  const [section, setSection] = useState<UserType>(initialSection)
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  async function load() {
    setLoading(true)
    try {
      const rows = await getAllProfilesAdmin(token)
      setAllUsers(rows)
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "তালিকা লোড করা যায়নি"))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const counts = useMemo(() => {
    const map: Record<UserType, { total: number; pending: number }> = {
      teacher: { total: 0, pending: 0 },
      student: { total: 0, pending: 0 },
      staff: { total: 0, pending: 0 },
      reporter: { total: 0, pending: 0 },
    }
    allUsers.forEach((u) => {
      const t = resolveUserType(u)
      map[t].total += 1
      if (!u.approved) map[t].pending += 1
    })
    return map
  }, [allUsers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allUsers.filter((u) => {
      if (resolveUserType(u) !== section) return false
      if (statusFilter === "approved" && !u.approved) return false
      if (statusFilter === "pending" && u.approved) return false
      if (!q) return true
      return [
        u.full_name,
        u.email,
        u.phone,
        u.department,
        u.batch,
        u.student_id,
        u.staff_id,
        u.designation,
        u.office_section,
        u.newspaper_name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [allUsers, section, statusFilter, search])

  async function handleToggleApproved(u: Profile) {
    const next = !u.approved
    setBusyId(u.id)
    setMsg("")
    try {
      await setProfileApproved(token, u.id, next)
      setAllUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, approved: next } : x)))
      setMsg(next ? `✅ ${u.full_name}-এর একাউন্ট অনুমোদিত হয়েছে` : `✅ ${u.full_name}-এর একাউন্ট স্থগিত করা হয়েছে`)
      await onChanged?.()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "আপডেট করা যায়নি"))
    }
    setBusyId(null)
  }

  async function handleToggleModerator(u: Profile) {
    if (u.id === currentAdminId || u.role === "admin") return
    const nextRole = u.role === "moderator" ? "user" : "moderator"
    const ask =
      nextRole === "moderator"
        ? `"${u.full_name}"-কে মডারেটর বানাতে চান? (তিনি সংবাদ, নোটিশ, স্টোরি ও রিলস পোস্ট/এডিট করতে পারবেন)`
        : `"${u.full_name}"-কে মডারেটর পদ থেকে সরাতে চান?`
    if (!confirm(ask)) return

    setBusyId(u.id)
    setMsg("")
    try {
      await setProfileRole(token, u.id, nextRole)
      setAllUsers((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? { ...x, role: nextRole, director_visible: nextRole === "moderator" }
            : x
        )
      )
      setMsg(
        nextRole === "moderator"
          ? `✅ ${u.full_name} এখন মডারেটর (ডিরেক্টর প্যানেলেও যুক্ত হয়েছেন)`
          : `✅ ${u.full_name}-কে সাধারণ সদস্য করা হয়েছে`
      )
      await onChanged?.()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "রোল পরিবর্তন করা যায়নি"))
    }
    setBusyId(null)
  }

  async function handleDeleteUser(u: Profile) {
    if (u.id === currentAdminId || u.role === "admin") return
    if (!confirm(`"${u.full_name}"-এর প্রোফাইল স্থায়ীভাবে মুছে ফেলতে চান?`)) return
    setBusyId(u.id)
    setMsg("")
    try {
      await removeReporter(token, u.id)
      setAllUsers((prev) => prev.filter((x) => x.id !== u.id))
      setMsg(`✅ ${u.full_name}-এর প্রোফাইল মুছে ফেলা হয়েছে`)
      await onChanged?.()
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "মুছে ফেলা যায়নি"))
    }
    setBusyId(null)
  }

  const activeMeta = SECTION_META.find((m) => m.key === section) || SECTION_META[0]

  return (
    <div className="space-y-4">
      {/* হেডার ও রিফ্রেশ */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="size-5 text-cyan-700" />
              <span>সদস্য ও ব্যবহারকারী তালিকা (শুধুমাত্র অ্যাডমিন)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              সাইনআপ করার সাথে সাথেই শিক্ষক, শিক্ষার্থী, কর্মচারী ও সাংবাদিক আলাদা তালিকায় যুক্ত হন। সবার সব ব্যক্তিগত তথ্য কেবল আপনি দেখতে পাবেন।
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* ৪টি আলাদা সেকশন বাটন */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SECTION_META.map((sec) => {
            const Icon = sec.icon
            const isActive = section === sec.key
            const c = counts[sec.key]
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => {
                  setSection(sec.key)
                  setStatusFilter("all")
                }}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`size-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-bold truncate">{sec.short}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {c.pending > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      {c.pending}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    {c.total}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* সার্চ ও স্ট্যাটাস ফিল্টার */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600"
              placeholder={`${activeMeta.label}-এর নাম, ফোন, ইমেইল, বিভাগ বা আইডি দিয়ে খুঁজুন...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 text-xs font-bold shrink-0">
            {(
              [
                { k: "all", t: "সবাই" },
                { k: "approved", t: "সক্রিয়" },
                { k: "pending", t: "অপেক্ষমান" },
              ] as const
            ).map((f) => (
              <button
                key={f.k}
                type="button"
                onClick={() => setStatusFilter(f.k)}
                className={`px-3 py-2 rounded-xl border cursor-pointer transition ${
                  statusFilter === f.k
                    ? "bg-cyan-700 text-white border-cyan-700"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {msg}
        </div>
      )}

      {/* তালিকা */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-slate-800">
            {activeMeta.label} ({filtered.length} জন)
          </h3>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">
            সদস্য তালিকা লোড হচ্ছে...
          </div>
        )}

        {!loading &&
          filtered.map((u, idx) => {
            const isSelfOrAdmin = u.id === currentAdminId || u.role === "admin"
            const isMod = u.role === "moderator"

            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl shadow-xs border p-4 space-y-3 text-xs ${
                  !u.approved ? "border-amber-300 bg-amber-50/30" : "border-slate-200"
                }`}
              >
                {/* উপরের অংশ: ছবি, নাম, ব্যাজ */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="size-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-1">
                      {idx + 1}
                    </span>

                    {u.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.avatar_url}
                        alt=""
                        className="size-12 rounded-full object-cover object-top border-2 border-cyan-500/40 shrink-0 bg-slate-100"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-cyan-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                        {(u.full_name || "U").charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-sm text-slate-900">{u.full_name}</p>

                        {u.role === "admin" && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold">
                            অ্যাডমিন
                          </span>
                        )}
                        {isMod && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold">
                            মডারেটর
                          </span>
                        )}
                        {u.approved ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="size-3" /> সক্রিয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                            <Clock className="size-3" /> অনুমোদনের অপেক্ষায়
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        নিবন্ধন: {new Date(u.created_at).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/u/${u.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-cyan-700 shrink-0"
                  >
                    <span>প্রোফাইল</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                {/* অ্যাডমিনের জন্য সম্পূর্ণ প্রাইভেট ও একাডেমিক তথ্য বক্স */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-700">
                  {u.email && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="size-3.5 text-cyan-700 shrink-0" />
                      <a href={`mailto:${u.email}`} className="font-semibold text-slate-900 hover:underline truncate">
                        {u.email}
                      </a>
                    </p>
                  )}
                  {u.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-emerald-700 shrink-0" />
                      <a href={`tel:${u.phone}`} className="font-bold text-slate-900 hover:underline">
                        {u.phone}
                      </a>
                    </p>
                  )}
                  {u.department && (
                    <p className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-indigo-600 shrink-0" />
                      <span>
                        বিভাগ: <b className="text-slate-900">{u.department}</b>
                        {u.batch ? ` (ব্যাচ: ${u.batch})` : ""}
                      </span>
                    </p>
                  )}
                  {u.student_id && (
                    <p className="flex items-center gap-1.5">
                      <Hash className="size-3.5 text-slate-500 shrink-0" />
                      <span>স্টুডেন্ট আইডি: <b className="text-slate-900 font-mono">{u.student_id}</b></span>
                    </p>
                  )}
                  {u.designation && (
                    <p className="flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-amber-700 shrink-0" />
                      <span>পদবি: <b className="text-slate-900">{u.designation}</b></span>
                    </p>
                  )}
                  {u.office_section && (
                    <p className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-slate-600 shrink-0" />
                      <span>দপ্তর/শাখা: <b className="text-slate-900">{u.office_section}</b></span>
                    </p>
                  )}
                  {u.staff_id && (
                    <p className="flex items-center gap-1.5">
                      <Hash className="size-3.5 text-slate-500 shrink-0" />
                      <span>স্টাফ আইডি: <b className="text-slate-900 font-mono">{u.staff_id}</b></span>
                    </p>
                  )}
                  {u.newspaper_name && (
                    <p className="flex items-center gap-1.5">
                      <Newspaper className="size-3.5 text-emerald-700 shrink-0" />
                      <span>পত্রিকা/মিডিয়া: <b className="text-slate-900">{u.newspaper_name}</b></span>
                    </p>
                  )}
                  {u.bio && (
                    <p className="sm:col-span-2 text-slate-600 border-t border-slate-200 pt-1.5 mt-0.5">
                      পরিচিতি: {u.bio}
                    </p>
                  )}
                </div>

                {/* অ্যাকশন বাটনসমূহ */}
                {!isSelfOrAdmin && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 font-bold">
                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => handleToggleApproved(u)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 cursor-pointer transition disabled:opacity-50 ${
                        u.approved
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {u.approved ? (
                        <>
                          <XCircle className="size-3.5" />
                          <span>স্থগিত করুন</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          <span>অনুমোদন দিন</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => handleToggleModerator(u)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 cursor-pointer transition disabled:opacity-50 ${
                        isMod
                          ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <Shield className="size-3.5" />
                      <span>{isMod ? "মডারেটর সরান" : "মডারেটর বানান"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => handleDeleteUser(u)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 cursor-pointer transition disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            {activeMeta.label}-এ কোনো সদস্য পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  )
}
