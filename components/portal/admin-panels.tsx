'use client'

import { useId, useState } from 'react'
import { CheckCircle2, FilePlus2, Pencil, Plus, Save, Send } from 'lucide-react'
import { clubs as initialClubs, notices, siteContact, type Club } from '@/lib/data'
import { cn } from '@/lib/utils'
import { clubIcons } from './club-news'

const inputClass =
  'w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm text-navy outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20'

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  defaultValue,
  textarea,
  options,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  textarea?: boolean
  options?: string[]
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && <span className="text-crimson"> *</span>}
      </label>
      {options ? (
        <select id={id} name={name} defaultValue={defaultValue} className={inputClass}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={cn(inputClass, 'resize-y')}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={inputClass}
        />
      )}
    </div>
  )
}

function SuccessNote({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="status" className="flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-sm font-medium text-brand">
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

function SubmitButton({ icon: Icon, children }: { icon: typeof Send; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
    >
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </button>
  )
}

function RecentList({ title, items }: { title: string; items: { primary: string; secondary: string }[] }) {
  if (items.length === 0) return null
  return (
    <div className="mt-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
        {items.map((item, i) => (
          <li key={`${item.primary}-${i}`} className="px-4 py-3">
            <p className="text-sm font-semibold text-navy">{item.primary}</p>
            <p className="text-xs text-muted-foreground">{item.secondary}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

type NewsDraft = { title: string; category: string; reporter: string }

export function PostNewsPanel() {
  const [posts, setPosts] = useState<NewsDraft[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const post = {
      title: String(data.get('title')),
      category: String(data.get('category')),
      reporter: String(data.get('reporter')),
    }
    setPosts((p) => [post, ...p])
    setMessage(`“${post.title}” published to ${post.category} News.`)
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title / শিরোনাম" name="title" required placeholder="e.g. ক্যাম্পাসে নতুন গবেষণাগার উদ্বোধন" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category / বিভাগ" name="category" options={['General', 'Club', 'Student Corner']} />
        <Field label="Reporter Name / প্রতিবেদক" name="reporter" required placeholder="e.g. Tanvir Ahmed" />
      </div>
      <Field label="Excerpt / সংক্ষিপ্ত বিবরণ" name="excerpt" textarea required placeholder="Two to three sentence summary..." />
      <Field label="Image URL" name="image" type="url" placeholder="https://example.com/photo.jpg" />
      <SuccessNote message={message} />
      <SubmitButton icon={Send}>Publish News</SubmitButton>
      <RecentList
        title="Published this session"
        items={posts.map((p) => ({ primary: p.title, secondary: `${p.category} · by ${p.reporter}` }))}
      />
    </form>
  )
}

type NoticeDraft = { title: string; ref: string; date: string }

export function PublishNoticePanel() {
  const [items, setItems] = useState<NoticeDraft[]>(
    notices.slice(0, 2).map((n) => ({ title: n.title, ref: n.ref, date: `${n.day} ${n.month} 2026` })),
  )
  const [message, setMessage] = useState<string | null>(null)
  const nextRef = `MBSTU-RU/2026/${String(15 + items.length - 2).padStart(3, '0')}`

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const notice = {
      title: String(data.get('title')),
      ref: String(data.get('ref')),
      date: String(data.get('date')),
    }
    setItems((n) => [notice, ...n])
    setMessage(`Notice ${notice.ref} added to the Notice Board.`)
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Notice Title / নোটিশের শিরোনাম" name="title" required placeholder="e.g. সাধারণ সভা আহ্বান" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field key={nextRef} label="Ref Number" name="ref" required defaultValue={nextRef} />
        <Field label="Date / তারিখ" name="date" type="date" required defaultValue="2026-10-29" />
      </div>
      <Field label="PDF Link" name="pdf" type="url" placeholder="https://example.com/notice.pdf" />
      <SuccessNote message={message} />
      <SubmitButton icon={FilePlus2}>Add Notice</SubmitButton>
      <RecentList
        title="Recent notices"
        items={items.map((n) => ({ primary: n.title, secondary: `${n.ref} · ${n.date}` }))}
      />
    </form>
  )
}

export function ManageClubsPanel() {
  const [list, setList] = useState<Club[]>(initialClubs)
  const [editing, setEditing] = useState<Club | 'new' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name'))
    const fields = {
      name,
      nameBn: String(data.get('nameBn')),
      tag: String(data.get('tag')),
      activity: String(data.get('activity')),
    }
    if (editing === 'new') {
      setList((l) => [
        ...l,
        { ...fields, id: `${name}-${Date.now()}`, icon: 'star', activityBn: '', date: '29 Oct 2026', reports: [] },
      ])
      setMessage(`${name} added to the club directory.`)
    } else if (editing) {
      setList((l) => l.map((c) => (c.id === editing.id ? { ...c, ...fields } : c)))
      setMessage(`${name} updated.`)
    }
    setEditing(null)
  }

  const current = editing === 'new' ? null : editing

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{list.length} registered clubs</p>
        <button
          type="button"
          onClick={() => {
            setEditing('new')
            setMessage(null)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add New Club
        </button>
      </div>

      <SuccessNote message={message} />

      {editing && (
        <form
          key={current?.id ?? 'new'}
          onSubmit={handleSubmit}
          className="animate-in fade-in space-y-4 rounded-xl border border-brand/30 bg-brand-soft/50 p-4"
        >
          <h4 className="font-serif font-bold text-navy">{current ? `Edit: ${current.name}` : 'Add New Club'}</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Club Name (English)" name="name" required defaultValue={current?.name} />
            <Field label="ক্লাবের নাম (বাংলা)" name="nameBn" required defaultValue={current?.nameBn} />
          </div>
          <Field label="Club Tag" name="tag" required defaultValue={current?.tag} placeholder="e.g. Volunteer" />
          <Field label="Latest Activity" name="activity" textarea required defaultValue={current?.activity} />
          <div className="flex gap-2">
            <SubmitButton icon={Save}>{current ? 'Save Changes' : 'Add Club'}</SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-navy hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-border rounded-xl border border-border">
        {list.map((club, i) => {
          const Icon = clubIcons[club.icon]
          return (
            <li key={club.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-xs font-semibold text-muted-foreground">{i + 1}</span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy">{club.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {club.nameBn} · {club.tag}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditing(club)
                  setMessage(null)
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                Edit
                <span className="sr-only"> {club.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function SiteSettingsPanel() {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('Site settings saved. Footer and social links will use these values once the database is connected.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Facebook URL" name="facebook" type="url" required defaultValue={siteContact.facebook} />
        <Field label="YouTube URL" name="youtube" type="url" required defaultValue={siteContact.youtube} />
        <Field label="Phone / ফোন" name="phone" type="tel" required defaultValue={siteContact.phone} />
        <Field label="Official Email / ইমেইল" name="email" type="email" required defaultValue={siteContact.email} />
      </div>
      <Field label="Office Room / অফিস কক্ষ" name="office" textarea required defaultValue={siteContact.address} />
      <SuccessNote message={message} />
      <SubmitButton icon={Save}>Save Settings</SubmitButton>
    </form>
  )
}
