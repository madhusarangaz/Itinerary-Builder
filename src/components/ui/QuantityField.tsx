import { Minus, Plus } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { GlowInputWrapper } from './GlowInputWrapper'

type Props = {
  label: string
  note?: string
  value: number
  min?: number
  onChange: (value: number) => void
}

export function QuantityField({ label, note, value, min = 0, onChange }: Props) {
  const count = Number.isFinite(value) ? value : min
  const latest = useRef(count)
  latest.current = count

  function set(next: number) {
    const safe = Math.max(min, next)
    latest.current = safe
    onChange(safe)
  }

  return (
    <div className="mb-3 w-full space-y-1">
      <label className="mb-1.5 flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
        {label}
        {note && <span className="text-xs text-gray-400 dark:text-gray-500">({note})</span>}
      </label>
      <GlowInputWrapper>
        <div className="flex h-10 w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040] dark:hover:shadow-[0px_0px_1px_1px_#525252]">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            disabled={count <= min}
            onClick={() => set(latest.current - 1)}
            className="flex h-full w-9 shrink-0 items-center justify-center text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-300 dark:text-zinc-400 dark:hover:text-zinc-100 dark:disabled:text-zinc-600"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            aria-label={label}
            value={count}
            onChange={(e) => {
              if (e.target.value === '') return
              const next = Number(e.target.value)
              if (Number.isFinite(next)) set(next)
            }}
            onBlur={() => {
              if (!Number.isFinite(value) || value < min) set(min)
            }}
            className={cn(
              'w-full min-w-0 border-0 bg-transparent text-center text-sm text-gray-900 outline-none [appearance:textfield] dark:text-zinc-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            )}
          />
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => set(latest.current + 1)}
            className="flex h-full w-9 shrink-0 items-center justify-center text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <Plus size={14} />
          </button>
        </div>
      </GlowInputWrapper>
    </div>
  )
}
