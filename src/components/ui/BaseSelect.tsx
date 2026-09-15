import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { GlowInputWrapper } from './GlowInputWrapper'

type Option = { value: string; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  optional?: boolean
  options: Option[]
  placeholder?: string
}

export function BaseSelect({
  label,
  optional = false,
  options,
  placeholder,
  className = '',
  ...props
}: Props) {
  return (
    <div className={cn('mb-3 w-full space-y-1', className)}>
      {label && (
        <label className="mb-1.5 flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
          {label}
          {optional && <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>}
        </label>
      )}
      <GlowInputWrapper>
        <div className="relative w-full">
          <select
            className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-[0px_0px_1px_1px_#404040]"
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </GlowInputWrapper>
    </div>
  )
}
