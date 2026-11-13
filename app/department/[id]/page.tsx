import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Share2,
  Users,
} from 'lucide-react'
import { getDepartmentById, getFaculties, getTeachers, getDeptNotices, getDeptEvents } from '@/lib/faculties'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const dept = await getDepartmentById(id)
  if (!dept) return { title: 'বিভাগ পাওয়া যায়নি' }
  return {
    title: `${dept.name} | মাভাবিপ্রবি`,
    description: dept.about || `${dept.name} বিভাগের পরিচিতি, শিক্ষক তালিকা ও নোটিশ।`,
  }
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dept = await getDepartmentById(id)
  if (!dept) notFound()

  const [facs, teachers, notices, events] = await Promise.all([
    getFaculties(),
    getTeachers(id),
    getDeptNotices(id),
    getDeptEvents(id),
  ])

  const faculty = facs.find((f) => f.id === dept.faculty_id)
  const siteUrl = 'https://mbsturu.vercel.app'
  const deptUrl = `${siteUrl}/department/${dept.id}`

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 space-y-8">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
          </Link>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/20">
            {dept.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dept.image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay"
              />
            )}
            <div className="relative z-10 space-y-2 max-w-3xl">
              {faculty && (
                <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
                  🏛️ {faculty.name}
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                {dept.name} {dept.code ? `(${dept.code})` : ''}
              </h1>
              {dept.name_en && (
                <p className="text-cyan-200/90 text-sm sm:text-base font-medium">{dept.name_en}</p>
              )}
            </div>
          </div>

          {/* পরিচিতি ও যোগাযোগ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card p-6 space-y-3 text-white">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/15 pb-2">
                <BookOpen className="size-5 text-cyan-400" />
                <span>বিভাগের পরিচিতি (About Department)</span>
              </h2>
              <p className="whitespace-pre-line text-sm sm:text-base text-slate-200 leading-relaxed">
                {dept.about || 'বিভাগের সংক্ষিপ্ত বিবরণ শীঘ্রই হালনাগাদ করা হবে।'}
              </p>
            </div>

            <div className="glass-card p-6 space-y-3 text-white">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/15 pb-2">
                <MapPin className="size-5 text-cyan-400" />
                <span>যোগাযোগ ও অফিস</span>
              </h2>
              <p className="whitespace-pre-line text-xs sm:text-sm text-slate-200 leading-relaxed">
                {dept.contact_info || 'অফিসের যোগাযোগের তথ্য দেওয়া নেই।'}
              </p>
            </div>
          </div>

          {/* শিক্ষকবৃন্দ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/20 pb-2">
              <Users className="size-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white drop-shadow">
                সম্মানিত শিক্ষকবৃন্দ ({teachers.length} জন)
              </h2>
            </div>

            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {teachers.map((t) => (
                  <div
                    key={t.id}
                    className={`glass-card p-4 sm:p-5 flex items-start gap-3.5 relative text-white ${
                      t.is_chairman ? 'ring-2 ring-amber-400/75' : ''
                    }`}
                  >
                    {t.is_chairman && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Award className="size-3" /> বিভাগীয় প্রধান
                      </span>
                    )}

                    {t.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photo_url}
                        alt={t.name}
                        loading="lazy"
                        className="size-16 rounded-2xl object-cover border-2 border-cyan-400/50 shrink-0 bg-slate-900 shadow-md"
                      />
                    ) : (
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 border border-white/20">
                        {t.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-bold text-sm text-white truncate pr-20">{t.name}</h3>
                      <p className="text-xs font-semibold text-cyan-300 truncate">{t.designation}</p>
                      {t.qualifications && (
                        <p className="text-[11px] text-slate-300 line-clamp-1">{t.qualifications}</p>
                      )}
                      {t.bio && <p className="text-[11px] text-slate-200/90 line-clamp-2">{t.bio}</p>}

                      {(t.email || t.phone) && (
                        <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                          {t.phone && (
                            <a
                              href={`tel:${t.phone}`}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-600/80 border border-emerald-400/40 text-white px-2.5 py-0.5 hover:bg-emerald-600 font-semibold transition"
                            >
                              <Phone className="size-3" /> {t.phone}
                            </a>
                          )}
                          {t.email && (
                            <a
                              href={`mailto:${t.email}`}
                              className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/20 text-white px-2.5 py-0.5 hover:bg-white/25 font-semibold truncate max-w-[170px] transition"
                            >
                              <Mail className="size-3 text-cyan-300 shrink-0" />
                              <span className="truncate">{t.email}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-slate-300 text-sm">
                শিক্ষকদের তথ্য শীঘ্রই যুক্ত করা হবে।
              </div>
            )}
          </div>

          {/* নোটিশ ও ইভেন্ট কর্নার */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* নোটিশ কর্নার */}
            <div className="glass-card p-6 space-y-4 text-white">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/15 pb-2">
                <Megaphone className="size-5 text-cyan-400" />
                <span>বিভাগীয় নোটিশ কর্নার</span>
              </h2>

              {notices.length > 0 ? (
                <div className="space-y-4">
                  {notices.map((n) => (
                    <div key={n.id} className="p-4 bg-white/10 rounded-2xl space-y-2 border border-white/15">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-white leading-snug">{n.title}</p>
                        <span className="text-[11px] text-amber-300 font-semibold shrink-0 flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {new Date(n.created_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      {n.body && (
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{n.body}</p>
                      )}

                      {n.image_urls && n.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                          {n.image_urls.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt=""
                                loading="lazy"
                                className="size-20 w-full object-cover rounded-lg border border-white/20 hover:opacity-90"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px]">
                        <span className="text-white/60 font-medium flex items-center gap-1">
                          <Share2 className="size-3" /> শেয়ার:
                        </span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`${dept.name}: ${n.title} - ${deptUrl}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 font-semibold hover:bg-emerald-500 transition"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deptUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 font-semibold hover:bg-blue-500 transition"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 py-3">বর্তমানে কোনো নোটিশ নেই।</p>
              )}
            </div>

            {/* ইভেন্টসমূহ */}
            <div className="glass-card p-6 space-y-4 text-white">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/15 pb-2">
                <CalendarDays className="size-5 text-cyan-400" />
                <span>বিভাগীয় ইভেন্টসমূহ</span>
              </h2>

              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 bg-white/10 rounded-2xl space-y-2 border border-white/15">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-white leading-snug">{ev.title}</p>
                        <span className="text-[11px] text-amber-300 font-semibold shrink-0">{ev.date}</span>
                      </div>

                      {ev.details && (
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{ev.details}</p>
                      )}

                      {ev.image_urls && ev.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                          {ev.image_urls.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt=""
                                loading="lazy"
                                className="size-20 w-full object-cover rounded-lg border border-white/20 hover:opacity-90"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px]">
                        <span className="text-white/60 font-medium flex items-center gap-1">
                          <Share2 className="size-3" /> শেয়ার:
                        </span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`${dept.name} ইভেন্ট: ${ev.title} - ${deptUrl}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 font-semibold hover:bg-emerald-500 transition"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deptUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 font-semibold hover:bg-blue-500 transition"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 py-3">বর্তমানে কোনো ইভেন্ট নেই।</p>
              )}
            </div>

          </div>

          <div className="pt-4 text-center border-t border-white/15">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
            </Link>
          </div>

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
