'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCodeImage({
  value,
  alt,
  className,
}: {
  value: string
  alt: string
  className: string
}) {
  const [src, setSrc] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setSrc('')
    setFailed(false)
    if (!value) return

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((dataUrl) => {
        if (active) setSrc(dataUrl)
      })
      .catch((error: unknown) => {
        console.error('QR কোড তৈরি করা যায়নি:', error)
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [value])

  if (failed) {
    return (
      <span className={`${className} flex items-center justify-center bg-white p-2 text-center text-[10px] text-slate-700`}>
        QR তৈরি করা যায়নি
      </span>
    )
  }

  if (!src) {
    return <span className={`${className} block bg-white`} role="status" aria-label="QR কোড তৈরি হচ্ছে" />
  }

  return <img src={src} alt={alt} className={className} />
}
