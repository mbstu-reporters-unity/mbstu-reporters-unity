'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'
import { BackNavigation } from '@/components/portal/back-navigation'

type CertificateVerification = {
  valid: boolean
  message?: string
  error?: string
  full_name?: string
  department?: string
  batch?: string
  student_id?: string
  event_id?: string
  issued_at?: string
}

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>()
  const [result, setResult] = useState<CertificateVerification | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setResult(null)
    setError(false)

    fetch(`/api/verify-certificate?code=${encodeURIComponent(code)}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as CertificateVerification
        if (!response.ok && response.status !== 400 && response.status !== 404) {
          throw new Error(data.error || 'সার্টিফিকেট যাচাই করা যায়নি')
        }
        if (active) setResult(data)
      })
      .catch((cause: unknown) => {
        console.error('সার্টিফিকেট যাচাই ব্যর্থ:', cause)
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [code])

  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="min-h-screen py-6 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-6 px-4">
          <BackNavigation
            items={[
              { label: 'ইভেন্ট', href: '/events' },
              { label: 'সার্টিফিকেট যাচাই' },
            ]}
          />

          <section className="glass-card space-y-4 rounded-3xl border border-white/15 p-6 text-center text-white sm:p-10">
            {result?.valid ? (
              <>
                <CheckCircle2 className="mx-auto size-14 text-emerald-300" />
                <h1 className="font-serif text-2xl font-bold text-emerald-300 sm:text-3xl">
                  সার্টিফিকেট যাচাইকৃত
                </h1>
                <p className="text-sm text-slate-200">
                  এই রেজিস্ট্রেশনটি MBSTU Reporters&apos; Unity-এর যাচাইকরণ ব্যবস্থায় পাওয়া গেছে।
                </p>
                <dl className="mx-auto grid max-w-lg grid-cols-1 gap-3 rounded-2xl bg-white/10 p-4 text-left text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-400">নাম</dt>
                    <dd className="font-semibold">{result.full_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">বিভাগ</dt>
                    <dd className="font-semibold">{result.department || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">ব্যাচ</dt>
                    <dd className="font-semibold">{result.batch || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">ইভেন্ট আইডি</dt>
                    <dd className="break-all font-semibold">{result.event_id || '—'}</dd>
                  </div>
                </dl>
              </>
            ) : error ? (
              <>
                <ShieldAlert className="mx-auto size-14 text-amber-300" />
                <h1 className="font-serif text-2xl font-bold text-amber-300 sm:text-3xl">
                  যাচাই সম্পন্ন করা যায়নি
                </h1>
                <p className="text-sm text-slate-200">
                  সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>
              </>
            ) : result ? (
              <>
                <XCircle className="mx-auto size-14 text-rose-300" />
                <h1 className="font-serif text-2xl font-bold text-rose-300 sm:text-3xl">
                  সার্টিফিকেট পাওয়া যায়নি
                </h1>
                <p className="break-all text-sm text-slate-200">কোড: {code}</p>
              </>
            ) : (
              <p className="text-sm text-slate-200" role="status">
                সার্টিফিকেট যাচাই করা হচ্ছে…
              </p>
            )}

            <Link
              href="/events"
              className="inline-flex rounded-full bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950"
            >
              ইভেন্ট পেজে ফিরুন
            </Link>
          </section>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
