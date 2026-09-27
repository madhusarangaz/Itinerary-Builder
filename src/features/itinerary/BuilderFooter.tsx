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
}: {
  onSaveDraft: () => void
  onGenerate: () => void
  generateLabel?: string
  draftLabel?: string
  generateIcon?: ReactNode
  align?: 'between' | 'end'
  extra?: ReactNode
}) {
  return (
    <div
      className={cn(
        'sticky right-0 bottom-0 left-0 z-[2] flex gap-2 border-t border-gray-100 bg-white px-6 pt-6 pb-10 dark:border-gray-800 dark:bg-[#1E1E20]',
        align === 'end' ? 'justify-end' : 'justify-between',
      )}
    >
      {align === 'end' ? (
        <>
          <BaseButton variant="secondary" onClick={onSaveDraft}>
            {draftLabel}
          </BaseButton>
          {extra}
          <BaseButton onClick={onGenerate}>
            {generateIcon}
            {generateLabel}
          </BaseButton>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <BaseButton variant="secondary" onClick={onSaveDraft}>
              {draftLabel}
            </BaseButton>
            {extra}
          </div>
          <BaseButton onClick={onGenerate}>
            {generateIcon}
            {generateLabel}
          </BaseButton>
        </>
      )}
    </div>
  )
}
