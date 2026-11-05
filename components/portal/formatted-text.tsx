import React from 'react'

export function FormattedText({
  text,
  className = '',
}: {
  text: string | null | undefined
  className?: string
}) {
  if (!text) return null

  // টেক্সটের ভেতর কোনো এইচটিএমএল ট্যাগ (যেমন: <b>, <mark>, <span>, <blockquote>) আছে কি না তা যাচাই করা
  const hasHtml = /<\/?(b|i|u|mark|span|blockquote|h1|h2|h3|p|div|strong|em|ul|ol|li)[^>]*>/i.test(text)

  if (hasHtml) {
    return (
      <div
        className={`leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    )
  }

  // সাধারণ টেক্সট হলে স্বাভাবিক প্যারাগ্রাফ হিসেবে রেন্ডার হবে
  return <p className={`whitespace-pre-line leading-relaxed ${className}`}>{text}</p>
}
