import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function FieldAttention({ on, children, className }: { on?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg', on && 'field-attention', className)} data-missing={on ? 'true' : undefined}>
      {children}
    </div>
  )
}
