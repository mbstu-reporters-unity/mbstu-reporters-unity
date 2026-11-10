import React from 'react'

/**
 * ক্ষতিকর HTML ট্যাগ ও ইভেন্ট হ্যান্ডলার স্যানিটাইজ করার নিরাপদ ফাংশন
 */
function sanitizeHtml(html: string): string {
  if (!html) return ''

  let clean = html
    // ১. বিপজ্জনক ট্যাগসমূহ (<script>, <iframe>, <object>, <embed>, <svg>, <form> ইত্যাদি) পুরোপুরি মুছে ফেলা
    .replace(/<\/?(script|iframe|object|embed|svg|form|input|button|style|link|meta|applet)[^>]*>/gi, '')
    // ২. যেকোনো ধরনের ক্ষতিকর ইভেন্ট হ্যান্ডলার (যেমন: onerror=, onclick=, onload= ইত্যাদি) মুছে ফেলা
    .replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // ৩. javascript: বা vbscript: যুক্ত লিংক বাতিল করা
    .replace(/(href|src)\s*=\s*["']?\s*(javascript|vbscript|data:text\/html):[^"'>\s]*/gi, '$1="#"')

  return clean
}

/**
 * শর্টকোডগুলোকে আকর্ষণীয় নিরাপদ স্টাইলে রূপান্তর
 */
function parseSimpleFormatting(text: string): string {
  if (!text) return ''
  let s = text

  // পূর্বের লিগ্যাসি ক্লাসগুলোকে রূপান্তর
  s = s.replace(/<span[^>]*class="[^"]*text-gold-gradient[^"]*"[^>]*>(.*?)<\/span>/gi, '<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/<span[^>]*class="[^"]*text-green-gradient[^"]*"[^>]*>(.*?)<\/span>/gi, '<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/<span[^>]*class="[^"]*text-red-gradient[^"]*"[^>]*>(.*?)<\/span>/gi, '<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">$1</span>')

  // নতুন শর্টকোড রূপান্তর
  s = s.replace(/\[gold\](.*?)\[\/gold\]/gi, '<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/\[green\](.*?)\[\/green\]/gi, '<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/\[red\](.*?)\[\/red\]/gi, '<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/\[b\](.*?)\[\/b\]/gi, '<strong class="font-bold">$1</strong>')
  s = s.replace(/\[i\](.*?)\[\/i\]/gi, '<em class="italic">$1</em>')
  s = s.replace(/\[highlight\](.*?)\[\/highlight\]/gi, '<mark class="bg-yellow-200 px-1 rounded text-navy">$1</mark>')
  s = s.replace(/\[quote\](.*?)\[\/quote\]/gi, '<blockquote class="border-l-4 border-emerald-600 bg-emerald-50 p-3 rounded-r-xl italic my-2 font-serif text-gray-800">$1</blockquote>')
  s = s.replace(/\[h1\](.*?)\[\/h1\]/gi, '<h1 class="font-serif text-2xl font-bold my-2 text-navy">$1</h1>')
  s = s.replace(/\[h2\](.*?)\[\/h2\]/gi, '<h2 class="font-serif text-xl font-bold my-1.5 text-navy">$1</h2>')

  // রেন্ডার করার পূর্বে সম্পূর্ণ টেক্সট স্যানিটাইজ করা
  return sanitizeHtml(s)
}

export function FormattedText({
  text,
  className = '',
  inline = false,
}: {
  text: string | null | undefined
  className?: string
  inline?: boolean
}) {
  if (!text) return null

  const parsed = parseSimpleFormatting(text)
  const hasTags = /<\/?[a-z][\s\S]*>/i.test(parsed)

  if (hasTags) {
    if (inline) {
      return (
        <span
          className={className}
          dangerouslySetInnerHTML={{ __html: parsed }}
        />
      )
    }
    return (
      <div
        className={`leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    )
  }

  if (inline) {
    return <span className={className}>{text}</span>
  }

  return <p className={`whitespace-pre-line leading-relaxed ${className}`}>{text}</p>
}
