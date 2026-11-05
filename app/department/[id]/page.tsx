import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CalendarDays, Mail, MapPin, Megaphone, Phone, Users } from 'lucide-react'
import { getDepartmentById, getFaculties, getTeachers, getDeptNotices, getDeptEvents } from '@/lib/faculties'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { ShareButton } from '@/components/portal/share-button'

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

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline">
            <ArrowLeft className="size-3.5" /> হোমপেজে ফিরুন
          </a>

          {/* হেডার ব্যানার */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-navy text-white p-6 sm:p-10 shadow-lg">
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
                <span className="inline-block px-3 py-1 rounded-full bg-gold/90 text-navy font-bold text-xs uppercase tracking-wider">
                  🏛️ {faculty.name}
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
                {dept.name} {dept.code ? `(${dept.code})` : ""}
              </h1>
              {dept.name_en && (
                <p className="text-white/80 text-sm sm:text-base font-medium">{dept.name_en}</p>
              )}
            </div>
          </div>

          {/* পরিচিতি ও যোগাযোগ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-border space-y-3">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 border-b pb-2">
                <BookOpen className="size-5 text-brand" />
                বিভাগের পরিচিতি (About Department)
              </h2>
              <p className="whitespace-pre-line text-sm sm:text-base text-navy/90 leading-relaxed">
                {dept.about || "বিভাগের সংক্ষিপ্ত বিবরণ শীঘ্রই হালনাগাদ করা হবে।"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border space-y-3">
              <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b pb-2">
                <MapPin className="size-5 text-brand" />
                যোগাযোগ ও অফিস
              </h2>
              <p className="whitespace-pre-line text-xs sm:text-sm text-gray-700 leading-relaxed">
                {dept.contact_info || "অফিসের যোগাযোগের তথ্য দেওয়া নেই।"}
              </p>
            </div>
          </div>

          {/* শিক্ষকবৃন্দ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Users className="size-5 text-brand" />
              <h2 className="text-xl font-bold text-navy">সম্মানিত শিক্ষকবৃন্দ ({teachers.length} জন)</h2>
            </div>

            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((t) => (
                  <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-start gap-3.5 hover:border-brand transition-all">
                    {t.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo_url} alt={t.name} className="size-16 rounded-2xl object-cover border shrink-0 bg-gray-50 shadow-inner" />
                    ) : (
                      <div className="size-16 rounded-2xl bg-brand text-white flex items-center justify-center font-bold text-xl shrink-0">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-bold text-sm text-navy truncate">{t.name}</h3>
                      <p className="text-xs font-semibold text-brand truncate">{t.designation}</p>
                      {t.qualifications && <p className="text-[11px] text-gray-500 line-clamp-1">{t.qualifications}</p>}
                      {t.bio && <p className="text-[11px] text-gray-600 line-clamp-2">{t.bio}</p>}
                      {(t.email || t.phone) && (
                        <div className="pt-1 text-[11px] text-gray-500 space-y-0.5">
                          {t.email && <p className="flex items-center gap-1 truncate"><Mail className="size-3 text-gold" /> {t.email}</p>}
                          {t.phone && <p className="flex items-center gap-1 truncate"><Phone className="size-3 text-gold" /> {t.phone}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-white p-6 rounded-2xl text-center border">শিক্ষকদের তথ্য শীঘ্রই যুক্ত করা হবে।</p>
            )}
          </div>

          {/* নোটিশ ও ইভেন্ট কর্নার */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* নোটিশ কর্নার (একাধিক ছবি ও শেয়ারিং সহ) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border space-y-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 border-b pb-2">
                <Megaphone className="size-5 text-brand" />
                বিভাগীয় নোটিশ কর্নার
              </h2>

              {notices.length > 0 ? (
                <div className="space-y-4">
                  {notices.map((n) => (
                    <div key={n.id} className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-border/80">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-navy leading-snug">{n.title}</p>
                        <span className="text-[11px] text-gold font-semibold shrink-0 flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {new Date(n.created_at).toLocaleDateString("bn-BD")}
                        </span>
                      </div>

                      {n.body && (
                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{n.body}</p>
                      )}

                      {/* নোটিশের একাধিক ছবি */}
                      {n.image_urls && n.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                          {n.image_urls.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="" className="size-20 w-full object-cover rounded-lg border hover:opacity-90" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* শেয়ার বাটন */}
                      <ShareButton title={`${dept.name}: ${n.title}`} path={`/department/${dept.id}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-3">বর্তমানে কোনো নোটিশ নেই।</p>
              )}
            </div>

            {/* ইভেন্ট কর্নার (একাধিক ছবি ও শেয়ারিং সহ) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border space-y-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 border-b pb-2">
                <CalendarDays className="size-5 text-brand" />
                বিভাগীয় ইভেন্টসমূহ
              </h2>

              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-border/80">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-navy leading-snug">{ev.title}</p>
                        <span className="text-[11px] text-gold font-semibold shrink-0">{ev.date}</span>
                      </div>

                      {ev.details && (
                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{ev.details}</p>
                      )}

                      {/* ইভেন্টের একাধিক ছবি */}
                      {ev.image_urls && ev.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                          {ev.image_urls.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="" className="size-20 w-full object-cover rounded-lg border hover:opacity-90" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* শেয়ার বাটন */}
                      <ShareButton title={`${dept.name} ইভেন্ট: ${ev.title}`} path={`/department/${dept.id}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-3">বর্তমানে কোনো ইভেন্ট নেই।</p>
              )}
            </div>

          </div>

        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
