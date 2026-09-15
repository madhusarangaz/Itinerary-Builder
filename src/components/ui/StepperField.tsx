import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'

export function StepperField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
  className,
}: {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  className?: string
}) {
  function clamp(next: number) {
    if (next < min) return min
    if (max != null && next > max) return max
    return next
  }

  return (
    <div className={cn('mb-3 w-full', className)}>
      {label && <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">{label}</p>}
      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-transparent dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]">
        <button
          type="button"
          className="flex h-full w-10 items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
          onClick={() => onChange(clamp(value - step))}
          aria-label="Decrease"
        >
          <Minus size={14} />
        </button>
        <p className="flex-1 text-center text-sm text-gray-900 dark:text-zinc-100">
          {value}
          {suffix ? <span className="ml-1 text-gray-400">{suffix}</span> : null}
        </p>
        <button
          type="button"
          className="flex h-full w-10 items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
          onClick={() => onChange(clamp(value + step))}
          aria-label="Increase"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
