import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { InputField } from './InputField'

export type SearchSelectOption = {
  value: string
  label: string
  hint?: string
}

export function SearchSelect({
  label,
  optional,
  value,
  options,
  placeholder = 'Search…',
  onChange,
  className,
  allowCreate,
}: {
  label?: string
  optional?: boolean
  value: string
  options: SearchSelectOption[]
  placeholder?: string
  onChange: (value: string) => void
  className?: string
  allowCreate?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const wrap = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)
  const display = selected?.label ?? value
  const canCreate =
    allowCreate &&
    q.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === q.trim().toLowerCase() || o.value.toLowerCase() === q.trim().toLowerCase())

  const list = useMemo(() => {
    const term = q.toLowerCase().trim()
    if (!term) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(term) || o.hint?.toLowerCase().includes(term) || o.value.toLowerCase().includes(term),
    )
  }, [options, q])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={wrap} className={cn('relative mb-3', className)}>
      <InputField
        label={label}
        optional={optional}
        placeholder={placeholder}
        startIcon={<Search size={16} />}
        value={open ? q : display}
        onFocus={() => {
          setOpen(true)
          setQ('')
        }}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
      />
      {open && (
        <div className="absolute z-30 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {list.map((o) => (
            <button
              key={o.value}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700"
              onClick={() => {
                onChange(o.value)
                setOpen(false)
                setQ('')
              }}
            >
              <div className="font-medium text-gray-900 dark:text-zinc-100">{o.label}</div>
              {o.hint ? <div className="text-xs text-gray-500">{o.hint}</div> : null}
            </button>
          ))}
          {list.length === 0 && !canCreate ? <p className="px-3 py-2 text-sm text-gray-400">No matches</p> : null}
          {canCreate ? (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-700"
              onClick={() => {
                onChange(q.trim())
                setOpen(false)
                setQ('')
              }}
            >
              Add “{q.trim()}”
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
