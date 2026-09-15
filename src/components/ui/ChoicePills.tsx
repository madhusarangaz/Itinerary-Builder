import { useState } from 'react'
import { cn } from '../../lib/cn'

export function MultiChips({
  label,
  options,
  value,
  onChange,
  optional,
  allowCustom,
  customLabel = '+ Add custom tag',
  className,
}: {
  label?: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  optional?: boolean
  allowCustom?: boolean
  customLabel?: string
  className?: string
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const extras = value.filter((v) => !options.some((o) => o.value === v))

  function toggle(next: string) {
    onChange(value.includes(next) ? value.filter((v) => v !== next) : [...value, next])
  }

  function commitCustom() {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
    setAdding(false)
  }

  return (
    <div className={cn('mb-3 w-full', className)}>
      {label && (
        <p className="mb-1.5 flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
          {label}
          {optional && <span className="text-xs text-gray-400">(optional)</span>}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {[...options, ...extras.map((v) => ({ value: v, label: v }))].map((opt) => {
          const on = value.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm transition',
                on
                  ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#2C2A2A] dark:text-zinc-300 dark:hover:bg-white/5',
              )}
            >
              {opt.label}
            </button>
          )
        })}
        {allowCustom && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-400"
          >
            {customLabel}
          </button>
        )}
        {allowCustom && adding && (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitCustom}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitCustom()
              }
              if (e.key === 'Escape') {
                setAdding(false)
                setDraft('')
              }
            }}
            placeholder="Custom tag"
            className="h-8 w-36 rounded-full border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        )}
      </div>
    </div>
  )
}

export function ChoicePills({
  label,
  options,
  value,
  onChange,
  optional,
  className,
}: {
  label?: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  optional?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-3 w-full', className)}>
      {label && (
        <p className="mb-1.5 flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
          {label}
          {optional && <span className="text-xs text-gray-400">(optional)</span>}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const on = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm transition',
                on
                  ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#2C2A2A] dark:text-zinc-300 dark:hover:bg-white/5',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RadioCards({
  label,
  options,
  value,
  onChange,
}: {
  label?: string
  options: { value: string; label: string; hint?: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="mb-3 w-full">
      {label && <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">{label}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const on = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition',
                on
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-[#7A3714] dark:bg-[#7A3714]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2C2A2A] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-white/5',
              )}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              {opt.hint ? <span className={cn('mt-0.5 block text-[11px]', on ? 'text-white/70' : 'text-gray-400')}>{opt.hint}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
