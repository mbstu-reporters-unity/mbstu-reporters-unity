import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/lib/i18n'
import { GlobalTextStudio } from '@/components/portal/global-text-studio'

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

const siteUrl = 'https://mbsturu.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: 'bgEmoniEQzftOcdJ0oOMdhpsUKg6Fv5NDbWBYs1YYAU',
  },
  title: "MBSTU Reporters' Unity | মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি",
  description:
    "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির অফিসিয়াল ওয়েবসাইট: ক্যাম্পাস সংবাদ, ক্লাব আপডেট ও অফিসিয়াল বিজ্ঞপ্তি। Official website of Mawlana Bhashani Science and Technology University Reporters' Unity (MBSTURU), Santosh, Tangail.",
  applicationName: 'MBSTURU',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    siteName: 'MBSTURU',
    title: "MBSTU Reporters' Unity | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
    description:
      "Official website of Mawlana Bhashani Science and Technology University Reporters' Unity (MBSTURU).",
    url: siteUrl,
    type: 'website',
    locale: 'bn_BD',
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
    "Mawlana Bhashani Science and Technology University Reporters' Unity",
    'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি',
  ],
  url: `${siteUrl}/`,
  inLanguage: ['bn', 'en'],
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: "MBSTU Reporters' Unity",
  alternateName: [
    'MBSTURU',
    "Mawlana Bhashani Science and Technology University Reporters' Unity",
    'মাভাবিপ্রবি রিপোর্টার্স ইউনিটি',
    'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি',
  ],
  url: `${siteUrl}/`,
  logo: `${siteUrl}/icon.png`,
  foundingDate: '2026',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Santosh',
    addressRegion: 'Tangail',
    addressCountry: 'BD',
  },
}

const themeScript = `(function(){try{var ok=['light','dark','sepia','mint','night','contrast'];var t=localStorage.getItem('mbstu_theme');if(ok.indexOf(t)<0){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t);var l=localStorage.getItem('mbstu_lang');if(l==='en'||l==='bn'){document.documentElement.lang=l}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${hind.variable} ${notoSerif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LangProvider>
          {children}
          {/* ⭐ পুরো ওয়েবসাইট জুড়ে কার্যকর টেক্সট স্টুডিও ⭐ */}
          <GlobalTextStudio />
        </LangProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
