import React from 'react'

// ইউজার ফ্রেন্ডলি শর্টকোডগুলোকে সরাসরি আকর্ষণীয় CSS ডিজাইনে রূপান্তরকারী ফাংশন
function parseSimpleFormatting(text: string): string {
  if (!text) return ''
  let s = text

  // যদি আগের কোনো জটিল <span> বা style ট্যাগ থেকে থাকে, সেগুলোকে পরিষ্কার করা বা রেন্ডার উপযোগী করা
  // (প্রয়োজনে র ডেটা থেকে সরাসরি শর্টকোডে রূপান্তর)
  s = s.replace(/<span[^>]*class="[^"]*text-gold-gradient[^"]*"[^>]*>(.*?)<\/span>/gi, '<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/<span[^>]*class="[^"]*text-green-gradient[^"]*"[^>]*>(.*?)<\/span>/gi, '<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/<span[^>]*class="[^"]*text-red-gradient[^"]*"[^>]*>(.*?)<\/span>/gi, '<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">$1</span>')
  
  // নতুন সহজ শর্টকোড রূপান্তর
  s = s.replace(/\[gold\](.*?)\[\/gold\]/gi, '<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/\[green\](.*?)\[\/green\]/gi, '<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/\[red\](.*?)\[\/red\]/gi, '<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">$1</span>')
  s = s.replace(/\[b\](.*?)\[\/b\]/gi, '<strong class="font-bold">$1</strong>')
  s = s.replace(/\[i\](.*?)\[\/i\]/gi, '<em class="italic">$1</em>')
  s = s.replace(/\[highlight\](.*?)\[\/highlight\]/gi, '<mark class="bg-yellow-200 px-1 rounded text-navy">$1</mark>')
  s = s.replace(/\[quote\](.*?)\[\/quote\]/gi, '<blockquote class="border-l-4 border-emerald-600 bg-emerald-50 p-3 rounded-r-xl italic my-2 font-serif text-gray-800">$1</blockquote>')
  s = s.replace(/\[h1\](.*?)\[\/h1\]/gi, '<h1 class="font-serif text-2xl font-bold my-2 text-navy">$1</h1>')
  s = s.replace(/\[h2\](.*?)\[\/h2\]/gi, '<h2 class="font-serif text-xl font-bold my-1.5 text-navy">$1</h2>')

  return s
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
