import { Tr } from '@/lib/i18n'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  inverted = true,
  action,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  inverted?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {/* ছোট গোল্ডেন সাব-ট্যাগ */}
        <p className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
          <span className="h-0.5 w-6 sm:w-8 bg-amber-400" aria-hidden="true" />
          <Tr text={eyebrow} eyebrow />
        </p>

        {/* ✅ মূল শিরোনাম: ড্রপ শ্যাডো ও উজ্জ্বল টেক্সট যাতে সবসময় পরিষ্কার দেখা যায় */}
        <h2
          className={`mt-1.5 text-balance font-serif text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-md ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          <Tr text={title} />
        </h2>

        {/* সাবটাইটেল */}
        {subtitle && (
          <p
            className={`mt-1 max-w-2xl text-pretty text-xs sm:text-sm leading-relaxed ${
              inverted ? 'text-cyan-100/90' : 'text-slate-600'
            }`}
          >
            <Tr text={subtitle} />
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
