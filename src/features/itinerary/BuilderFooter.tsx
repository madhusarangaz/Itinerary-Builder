import type { ReactNode } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { cn } from '../../lib/cn'

export function BuilderFooter({
  onSaveDraft,
  onGenerate,
  generateLabel = 'Generate PDF',
  draftLabel = 'Save as draft',
  generateIcon,
  align = 'between',
  extra,
  snug = false,
  showPrimary = true,
}: {
  onSaveDraft: () => void
  onGenerate: () => void
  generateLabel?: string
  draftLabel?: string
  generateIcon?: ReactNode
  align?: 'between' | 'end'
  extra?: ReactNode
  snug?: boolean
  showPrimary?: boolean
}) {
  return (
    <div
      className={cn(
        'sticky right-0 bottom-0 left-0 z-[2] flex gap-2 border-t border-gray-100 bg-white px-6 dark:border-gray-800',
        snug ? 'pt-3 pb-3 dark:bg-[#101012]' : 'pt-6 pb-10 dark:bg-[#0C0C0E]',
        align === 'end' ? 'justify-end' : 'justify-between',
      )}
    >
      {align === 'end' ? (
        <>
          <BaseButton variant="secondary" onClick={onSaveDraft}>
            {draftLabel}
          </BaseButton>
          {extra}
          {showPrimary ? (
            <BaseButton onClick={onGenerate}>
              {generateIcon}
              {generateLabel}
            </BaseButton>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <BaseButton variant="secondary" onClick={onSaveDraft}>
              {draftLabel}
            </BaseButton>
            {extra}
          </div>
          {showPrimary ? (
            <BaseButton onClick={onGenerate}>
              {generateIcon}
              {generateLabel}
            </BaseButton>
          ) : null}
        </>
      )}
    </div>
  )
}
