import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '../../lib/cn'
import { FieldAttention } from './FieldAttention'
import { GlowInputWrapper } from './GlowInputWrapper'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  optional?: boolean
  /** Small note after the label, shown in parentheses. */
  note?: string
  startIcon?: ReactNode
  /** Sits inside the field, on the right. */
  endAdornment?: ReactNode
  dense?: boolean
  attention?: boolean
  /** Sits on the right of the label, level with it. */
  labelAction?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function InputField({
  label,
  optional = false,
  note,
  startIcon,
  endAdornment,
  className = '',
  disabled,
  dense = false,
  attention = false,
  labelAction,
  ref,
  ...props
}: Props) {
  return (
    <div className={cn('mb-3 w-full space-y-1', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
            {label}
            {note && <span className="text-xs text-gray-400 dark:text-gray-500">({note})</span>}
            {optional && <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>}
          </label>
          {labelAction}
        </div>
      )}
      <FieldAttention on={attention}>
      <GlowInputWrapper>
        <div className="relative flex w-full items-center">
          {startIcon && (
            <div className="pointer-events-none absolute left-3 text-gray-400 dark:text-zinc-500">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full cursor-text rounded-lg border border-gray-200 bg-white font-[inherit] text-sm text-gray-900 caret-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100 dark:caret-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040] dark:hover:shadow-[0px_0px_1px_1px_#525252] dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-500',
              dense ? 'h-9' : 'h-10',
              startIcon ? 'pl-9' : 'pl-3',
              endAdornment ? 'pr-[4.5rem]' : 'pr-3',
            )}
            {...props}
          />
          {endAdornment ? (
            <div className="pointer-events-none absolute right-1.5 flex items-center">{endAdornment}</div>
          ) : null}
        </div>
      </GlowInputWrapper>
      </FieldAttention>
    </div>
  )
}
