import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { GlowInputWrapper } from './GlowInputWrapper'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  optional?: boolean
}

export function TextAreaField({ label, optional = false, className = '', rows = 3, ...props }: Props) {
  return (
    <div className={cn('mb-3 w-full space-y-1', className)}>
      {label && (
        <label className="mb-1.5 flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
          {label}
          {optional && <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>}
        </label>
      )}
      <GlowInputWrapper>
        <textarea
          rows={rows}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
          {...props}
        />
      </GlowInputWrapper>
    </div>
  )
}
