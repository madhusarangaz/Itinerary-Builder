import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { GlowInputWrapper } from './GlowInputWrapper'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  optional?: boolean
  startIcon?: ReactNode
  dense?: boolean
}

export function InputField({
  label,
  optional = false,
  startIcon,
  className = '',
  disabled,
  dense = false,
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
        <div className="relative flex w-full items-center">
          {startIcon && (
            <div className="pointer-events-none absolute left-3 text-gray-400 dark:text-zinc-500">
              {startIcon}
            </div>
          )}
          <input
            disabled={disabled}
            className={cn(
              'w-full cursor-text rounded-lg border border-gray-200 bg-white font-[inherit] text-sm text-gray-900 caret-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100 dark:caret-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040] dark:hover:shadow-[0px_0px_1px_1px_#525252] dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-500',
              dense ? 'h-9' : 'h-10',
              startIcon ? 'pr-3 pl-9' : 'px-3',
            )}
            {...props}
          />
        </div>
      </GlowInputWrapper>
    </div>
  )
}
