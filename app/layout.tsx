import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google'
import './globals.css'

const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
})

const notoSerif = Noto_Serif_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['600', '700', '800'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "MBSTU Reporters' Unity | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
  description:
    "Official news and organizational portal of Mawlana Bhashani Science and Technology University Reporters' Unity — campus news, club updates, student corner and official notices from Santosh, Tangail.",
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#046A38',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={`${hind.variable} ${notoSerif.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
