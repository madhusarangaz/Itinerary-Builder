import type { ReactNode } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'

export function BuilderFooter({
  onSaveDraft,
  onGenerate,
  generateLabel = 'Generate PDF',
  draftLabel = 'Save as draft',
  extra,
}: {
  onSaveDraft: () => void
  onGenerate: () => void
  generateLabel?: string
  draftLabel?: string
  extra?: ReactNode
}) {
  return (
    <div className="sticky right-0 bottom-0 left-0 z-[2] flex justify-between gap-3 border-t border-gray-100 bg-white px-6 pt-6 pb-10 dark:border-gray-800 dark:bg-[#1E1E20]">
      <div className="flex flex-wrap gap-2">
        <BaseButton variant="secondary" onClick={onSaveDraft}>
          {draftLabel}
        </BaseButton>
        {extra}
      </div>
      <BaseButton onClick={onGenerate}>{generateLabel}</BaseButton>
    </div>
  )
}
