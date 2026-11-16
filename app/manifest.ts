import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MBSTU Reporters' Unity | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
    short_name: 'MBSTURU',
    description: 'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির অফিসিয়াল অনলাইন ও অফলাইন ক্যাম্পাস পোর্টাল।',
    start_url: '/',
    display: 'standalone',
    background_color: '#071030',
    theme_color: '#0284c7',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
