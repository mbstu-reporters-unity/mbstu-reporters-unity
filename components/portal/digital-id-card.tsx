'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  QrCode,
  Printer,
  Check,
  Copy,
  ShieldCheck,
  ExternalLink,
  Award,
  CreditCard,
  GraduationCap,
  Newspaper,
} from 'lucide-react'
import { QrCodeImage } from './qr-code-image'

export interface DigitalMemberInfo {
  id: string
  full_name: string
  department?: string | null
  batch?: string | null
  newspaper_name?: string | null
  avatar_url?: string | null
  role?: string | null
  user_type?: string | null
  designation?: string | null
  executive_position_bn?: string | null
  approved: boolean
  created_at?: string
}

export function DigitalIdCard({
  member,
  orgNameBn = 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  orgNameEn = "MBSTU Reporters' Unity",
  orgLogoUrl = '/logo.png',
}: {
  member: DigitalMemberInfo
  orgNameBn?: string
  orgNameEn?: string
  orgLogoUrl?: string
}) {
  const [viewMode, setViewMode] = useState<'id_card' | 'certificate'>('id_card')
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setOrigin(window.location.origin)
    }
  }, [])

  const verifyPath = `/verify-member/${encodeURIComponent(member.id)}`
  const verifyFullUrl = origin ? `${origin}${verifyPath}` : ''

  const serialCode = `MBSTURU-${member.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`

  const roleLabel =
    member.executive_position_bn ||
    member.designation ||
    (member.role === 'admin'
      ? 'প্রধান অ্যাডমিন ও সাংবাদিক'
      : member.role === 'moderator'
        ? 'মডারেটর ও ক্যাম্পাস সাংবাদিক'
        : member.user_type === 'teacher'
          ? 'শিক্ষক কলামিস্ট'
          : member.user_type === 'staff'
            ? 'কর্মকর্তা সদস্য'
            : member.user_type === 'reporter' || member.newspaper_name
              ? 'ক্যাম্পাস সাংবাদিক'
              : 'সাধারণ সদস্য')

  const issueYear = member.created_at
    ? new Date(member.created_at).toLocaleDateString('bn-BD', {
        year: 'numeric',
        timeZone: 'Asia/Dhaka',
      })
    : '২০২৬'

  async function copyVerifyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${verifyPath}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function handlePrintCard() {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="space-y-4">
      {/* প্রিন্টের সময় শুধু কার্ড বা সনদপত্র প্রিন্ট হওয়ার স্টাইল */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-id-area,
          .print-id-area * {
            visibility: visible !important;
          }
          .print-id-area {
            position: fixed !important;
            left: 50% !important;
            top: 24px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 680px !important;
            z-index: 999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* মোড সুইচার (ডিজিটাল প্রেস কার্ড বনাম সদস্য সনদ) */}
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex w-full sm:w-auto bg-slate-900/80 border border-white/15 rounded-2xl p-1 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('id_card')}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-2 rounded-xl cursor-pointer transition sm:gap-1.5 sm:px-3.5 ${
              viewMode === 'id_card'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="size-3.5" />
            <span className="text-center text-[10px] leading-tight sm:whitespace-nowrap sm:text-xs">ডিজিটাল প্রেস কার্ড</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('certificate')}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-2 rounded-xl cursor-pointer transition sm:gap-1.5 sm:px-3.5 ${
              viewMode === 'certificate'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="size-3.5" />
            <span className="text-center text-[10px] leading-tight sm:whitespace-nowrap sm:text-xs">সদস্য সনদপত্র</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={copyVerifyLink}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3 py-2 cursor-pointer transition"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-300" />
                <span>লিংক কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-cyan-300" />
                <span>ভেরিফাই লিংক</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrintCard}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 shadow cursor-pointer transition"
          >
            <Printer className="size-3.5" />
            <span>প্রিন্ট / PDF সেভ</span>
          </button>
        </div>
      </div>

      {/* প্রিন্টযোগ্য ডিজিটাল কার্ড / সনদ */}
      <div className="print-id-area flex justify-center">
        {viewMode === 'id_card' ? (
          /* ==================== ১. ডিজিটাল প্রেস আইডি কার্ড ==================== */
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-cyan-400/50 bg-gradient-to-br from-[#07143a] via-[#0b2559] to-[#083344] text-white shadow-2xl">
            {/* কার্ডের উপরের রঙিন স্ট্রিপ ও হেডার */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 px-5 py-3.5 flex items-center gap-3 border-b border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={orgLogoUrl || '/logo.png'}
                alt={orgNameEn}
                className="size-10 rounded-full object-cover bg-white p-0.5 ring-2 ring-white/80 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm font-bold text-white leading-tight truncate">
                  {orgNameBn}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-100 truncate">
                  {orgNameEn} • PRESS ID
                </p>
              </div>
              <span className="rounded-full bg-white text-rose-700 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider shrink-0 shadow">
                PRESS
              </span>
            </div>

            {/* সদস্যের ছবি ও তথ্য */}
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="size-24 rounded-2xl object-cover object-top ring-4 ring-cyan-400/70 shadow-xl bg-slate-900"
                    />
                  ) : (
                    <div className="size-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-3xl flex items-center justify-center ring-4 ring-cyan-400/70 shadow-xl">
                      {member.full_name.charAt(0)}
                    </div>
                  )}

                  {member.approved && (
                    <span
                      className="absolute -bottom-2 -right-2 size-7 rounded-full bg-emerald-500 text-white ring-2 ring-slate-950 flex items-center justify-center shadow"
                      title="যাচাইকৃত সদস্য"
                    >
                      <ShieldCheck className="size-4" />
                    </span>
                  )}
                </div>

                <div className="pt-1 space-y-1">
                  <h3 className="font-serif text-lg font-bold text-white leading-snug">
                    {member.full_name}
                  </h3>
                  <span className="inline-block rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-200 px-3 py-0.5 text-xs font-bold">
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* একাডেমিক ও গণমাধ্যম তথ্য */}
              <div className="rounded-2xl bg-white/10 border border-white/15 p-3 space-y-1.5 text-xs">
                {member.department && (
                  <p className="flex items-center gap-2 text-slate-100">
                    <GraduationCap className="size-3.5 text-cyan-300 shrink-0" />
                    <span className="truncate">
                      {member.department}
                      {member.batch ? ` (${member.batch})` : ''}
                    </span>
                  </p>
                )}

                {member.newspaper_name && (
                  <p className="flex items-center gap-2 text-amber-200 font-semibold">
                    <Newspaper className="size-3.5 text-amber-300 shrink-0" />
                    <span className="truncate">{member.newspaper_name}</span>
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-cyan-200 font-mono">
                  <span>ID: {serialCode}</span>
                  <span>ইস্যু: {issueYear}</span>
                </div>
              </div>

              {/* QR কোড ভেরিফিকেশন বক্স */}
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 text-slate-900 shadow-inner">
                <div className="size-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                  {verifyFullUrl && (
                    <QrCodeImage
                      value={verifyFullUrl}
                      alt="সদস্য যাচাইয়ের QR কোড"
                      className="size-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <QrCode className="size-3.5 text-blue-600 shrink-0" />
                    <span>স্ক্যান করে যাচাই করুন</span>
                  </p>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    এই QR কোড স্ক্যান করলে সদস্যের অফিশিয়াল স্ট্যাটাস ও পোর্টফোলিও সরাসরি যাচাই করা যাবে।
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      member.approved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {member.approved ? '● Active & Verified' : '● Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* ফুটার */}
            <div className="bg-slate-950/80 px-4 py-2.5 text-center border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
              <span>মাভাবিপ্রবি, সন্তোষ, টাঙ্গাইল-১৯০২</span>
              <Link
                href={verifyPath}
                className="inline-flex items-center gap-1 text-cyan-300 font-bold hover:underline print:hidden"
              >
                <span>ভেরিফাই পেজ</span>
                <ExternalLink className="size-2.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* ==================== ২. অফিশিয়াল সদস্য সনদপত্র (Certificate) ==================== */
          <div className="w-full min-w-0 max-w-2xl rounded-3xl border-4 border-amber-400/70 bg-gradient-to-br from-[#081235] via-[#0c1e4a] to-[#0f172a] p-3 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="rounded-2xl border border-amber-300/35 p-5 sm:p-7 space-y-5 text-center relative z-10">
              <div className="flex flex-col items-center space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={orgLogoUrl || '/logo.png'}
                  alt={orgNameEn}
                  className="size-14 rounded-full object-cover bg-white p-0.5 ring-2 ring-amber-400 shadow-lg"
                />
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  {orgNameEn}
                </p>
                <h3 className="font-serif text-xl sm:text-3xl font-bold text-white">
                  {orgNameBn}
                </h3>
                <span className="inline-block rounded-full bg-amber-400/20 border border-amber-300/50 px-4 py-1 text-xs font-bold text-amber-200">
                  অফিশিয়াল সদস্যপদ সনদপত্র (Certificate of Membership)
                </span>
              </div>

              <div className="space-y-3 py-2 text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl mx-auto">
                <p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,</p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-cyan-300">
                  {member.full_name}
                </p>
                <p>
                  {member.department ? `${member.department}` : 'মাভাবিপ্রবি'}{' '}
                  {member.batch ? `(${member.batch})` : ''}-এর{' '}
                  {member.newspaper_name ? (
                    <>
                      এবং <b className="text-white">{member.newspaper_name}</b>-এর{' '}
                    </>
                  ) : null}
                  একজন নিয়মিত ও অনুমোদিত <b className="text-amber-300">{roleLabel}</b>।
                </p>
                <p className="text-xs text-slate-300">
                  মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় ক্যাম্পাসে বস্তুনিষ্ঠ, নৈতিক ও দায়িত্বশীল সাংবাদিকতা চর্চায় তিনি সক্রিয়ভাবে নিযুক্ত রয়েছেন।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/15 pt-4 text-xs">
                <div className="text-center sm:text-left space-y-0.5">
                  <p className="font-mono text-cyan-300 font-bold">সনদ নং: {serialCode}</p>
                  <p className="text-[11px] text-slate-300">প্রদানের বছর: {issueYear}</p>
                  <p className="text-[11px] text-emerald-300 font-bold">
                    স্ট্যাটাস: {member.approved ? '✓ যাচাইকৃত ও কার্যকর' : 'নিষ্ক্রিয়'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 bg-white rounded-xl p-2 text-slate-900 shadow">
                  {verifyFullUrl && (
                    <QrCodeImage
                      value={verifyFullUrl}
                      alt="সদস্য সনদ যাচাইয়ের QR কোড"
                      className="size-20 object-contain"
                    />
                  )}
                  <div className="text-left text-[10px] leading-tight pr-1">
                    <p className="font-bold text-slate-900">QR যাচাই</p>
                    <p className="text-slate-600">স্ক্যান করে সনদের</p>
                    <p className="text-slate-600">সত্যতা দেখুন</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
