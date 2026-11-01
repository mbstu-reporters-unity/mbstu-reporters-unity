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
  metadataBase: new URL('https://mbsturu.vercel.app'),
  verification: {
    google: 'bgEmoniEQzftOcdJ0oOMdhpsUKg6Fv5NDbWBYs1YYAU',
  },
  title: "MBSTU Reporters' Unity | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
  description:
    "Official news and organizational portal of Mawlana Bhashani Science and Technology University Reporters' Unity — campus news, club updates, student corner and official notices from Santosh, Tangail.",
  applicationName: 'MBSTURU',
  openGraph: {
    siteName: 'MBSTURU',
    title: "MBSTU Reporters' Unity | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
    url: 'https://mbsturu.vercel.app',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#046A38',
  width: 'device-width',
  initialScale: 1,
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MBSTURU',
  alternateName: [
    "MBSTU Reporters' Unity",
    'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
  ],
  url: 'https://mbsturu.vercel.app/',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={`${hind.variable} ${notoSerif.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
