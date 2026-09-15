import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function BaseButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: Props) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-[7px] text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const variantClasses = {
    primary:
      'text-white bg-[linear-gradient(180deg,#2B2D33_0%,#111317_100%)] hover:bg-[#585858] dark:bg-[#7A3714] dark:hover:bg-orange-700 shadow-sm',
    secondary:
      'text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-[#382C22] dark:border-[#382C22] dark:text-white dark:hover:bg-[#4E3D2F]',
    danger: 'text-white bg-red-600 hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
