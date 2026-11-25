import React from 'react'

const ALLOWED_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'mark',
  'br',
  'p',
  'div',
  'span',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
])

const SAFE_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'background',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-align',
  'border-left',
  'padding',
  'margin',
  'border-radius',
  'display',
  '-webkit-background-clip',
  '-webkit-text-fill-color',
])

function sanitizeClassAttr(raw: string): string {
  return raw
    .split(/\s+/)
    .filter((cls) => /^[a-zA-Z0-9_-]+$/.test(cls))
    .join(' ')
}

function sanitizeStyleAttr(raw: string): string {
  const parts = raw.split(';')
  const safeParts: string[] = []

  for (const part of parts) {
    const colonIdx = part.indexOf(':')
    if (colonIdx === -1) continue

    const prop = part.slice(0, colonIdx).trim().toLowerCase()
    const val = part.slice(colonIdx + 1).trim()

    if (!SAFE_STYLE_PROPS.has(prop) || !val) continue
    if (/url\s*\(|expression\s*\(|@import|behavior|javascript:|vbscript:|data:|:/i.test(val)) {
      continue
    }
    if (!/^[a-zA-Z0-9\s#%(),.'"-]+$/.test(val)) continue

    safeParts.push(`${prop}: ${val}`)
  }

  return safeParts.join('; ')
}

function extractSafeAttributes(attrString: string): string {
  if (!attrString) return ''

  let safeClass = ''
  let safeStyle = ''
  const attrRe = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  let match: RegExpExecArray | null

  while ((match = attrRe.exec(attrString)) !== null) {
    const attrName = match[1].toLowerCase()
    const attrVal = match[2] ?? match[3] ?? ''

    if (attrName === 'class') {
      safeClass = sanitizeClassAttr(attrVal)
    } else if (attrName === 'style') {
      safeStyle = sanitizeStyleAttr(attrVal)
    }
  }

  let out = ''
  if (safeClass) out += ` class="${safeClass}"`
  if (safeStyle) out += ` style="${safeStyle}"`
  return out
}

/**
 * প্যাকেজ-ফ্রি Strict Allowlist HTML Sanitizer (Server ও Client দুই জায়গায়ই নিরাপদ)
 */
function sanitizeHtml(html: string): string {
  if (!html) return ''

  const cleanedInput = html.replace(/\0/g, '')
  const tokens: string[] = []

  // ১. শুধু অনুমোদিত ট্যাগ ও নিরাপদ class/style টোকেনাইজ করা
  const tokenized = cleanedInput.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s+([^<>]*?))?\s*(\/?)>/g,
    (_full, slash: string, rawName: string, attrs = '', selfClose: string) => {
      const tag = rawName.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) {
        return ''
      }

      if (slash === '/') {
        if (tag === 'br') return ''
        const idx = tokens.push(`</${tag}>`) - 1
        return `\0T${idx}\0`
      }

      if (tag === 'br') {
        const idx = tokens.push('<br />') - 1
        return `\0T${idx}\0`
      }

      const safeAttrs = extractSafeAttributes(attrs)
      const built = `<${tag}${safeAttrs}${selfClose === '/' ? ' /' : ''}>`
      const idx = tokens.push(built) - 1
      return `\0T${idx}\0`
    }
  )

  // ২. বাকি সব < এবং > (যেমন ভাঙা <scr<script>ipt> বা অবৈধ ট্যাগ) escape করে নিষ্ক্রিয় করা
  const escaped = tokenized.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // ৩. শুধু নিরাপদ টোকেনগুলো ফিরিয়ে আনা
  return escaped.replace(/\0T(\d+)\0/g, (_, i) => tokens[Number(i)] ?? '')
}

/**
 * শর্টকোডগুলোকে আকর্ষণীয় নিরাপদ স্টাইলে রূপান্তর
 */
function parseSimpleFormatting(text: string): string {
  if (!text) return ''
  let s = text

  // পূর্বের লিগ্যাসি ক্লাসগুলোকে রূপান্তর
  s = s.replace(
    /<span[^>]*class="[^"]*text-gold-gradient[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    '<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">$1</span>'
  )
  s = s.replace(
    /<span[^>]*class="[^"]*text-green-gradient[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    '<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">$1</span>'
  )
  s = s.replace(
    /<span[^>]*class="[^"]*text-red-gradient[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    '<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">$1</span>'
  )

  // শর্টকোড রূপান্তর
  s = s.replace(
    /\[gold\]([\s\S]*?)\[\/gold\]/gi,
    '<span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-bold">$1</span>'
  )
  s = s.replace(
    /\[green\]([\s\S]*?)\[\/green\]/gi,
    '<span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700 bg-clip-text text-transparent font-bold">$1</span>'
  )
  s = s.replace(
    /\[red\]([\s\S]*?)\[\/red\]/gi,
    '<span class="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent font-bold">$1</span>'
  )
  s = s.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong class="font-bold">$1</strong>')
  s = s.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em class="italic">$1</em>')
  s = s.replace(
    /\[highlight\]([\s\S]*?)\[\/highlight\]/gi,
    '<mark class="bg-yellow-200 px-1 rounded text-navy">$1</mark>'
  )
  s = s.replace(
    /\[quote\]([\s\S]*?)\[\/quote\]/gi,
    '<blockquote class="border-l-4 border-emerald-600 bg-emerald-50 p-3 rounded-r-xl italic my-2 font-serif text-gray-800">$1</blockquote>'
  )
  s = s.replace(/\[h1\]([\s\S]*?)\[\/h1\]/gi, '<h1 class="font-serif text-2xl font-bold my-2 text-white">$1</h1>')
  s = s.replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, '<h2 class="font-serif text-xl font-bold my-1.5 text-white">$1</h2>')

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

  if (inline) {
    return (
      <span
        className={`formatted-text ${className}`}
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    )
  }

  return (
    <div
      className={`formatted-text whitespace-pre-line leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: parsed }}
    />
  )
}
