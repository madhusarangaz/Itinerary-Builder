import { useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { activityProgress, requiredActivityIssues } from '../../lib/activity-completeness'
import { useActivities } from '../../state/activity-store'
import type { ActivitySectionId } from '../../types/activity'
import { ActivityNav } from './ActivityNav'
import { ActivitySummary } from './ActivitySummary'
import { ActivitySections } from './forms/ActivitySections'

export function ActivityBuilder({
  onClose,
  mobileTab,
  onShowEditor,
}: {
  onClose: () => void
  mobileTab?: 'edit' | 'summary'
  onShowEditor?: () => void
}) {
  const { active, saveStatus, patchActive } = useActivities()
  const [section, setSection] = useState<ActivitySectionId>('activity')
  const [showSummary, setShowSummary] = useState(false)
  const [issues, setIssues] = useState<string[] | null>(null)
  const isMobileSummary = mobileTab === 'summary' || showSummary
  const progress = activityProgress(active)

  function activate() {
    const missing = requiredActivityIssues(active)
    if (missing.length) {
      setIssues(missing.map((m) => m.message))
      setSection(missing[0].section)
      return
    }
    patchActive({ status: 'active', rateSource: active.rateSource === 'demo' && (active.adultRateUsd > 0 || active.childRateUsd > 0) ? 'demo' : active.rateSource })
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
        <div className={`h-full w-full flex-shrink-0 md:w-[56%] ${isMobileSummary ? 'hidden md:flex md:flex-col' : 'flex flex-col'} border-r border-gray-100 dark:border-[#2C2A2A]`}>
          <div className="relative flex h-full min-h-0 flex-col">
            <BuilderHeader
              saveStatus={saveStatus}
              onClose={onClose}
              title={active.name.trim() ? `Edit ${active.name}` : 'Create Activity'}
              subtitle="Activities & Entrance Fees"
              showPreviewToggle
              previewLabel="Show summary"
              onShowPreview={() => setShowSummary(true)}
            />
            <p className="px-6 pb-1 text-xs text-gray-400">
              Activity profile {progress.percent}% complete
              {progress.remaining > 0 ? ` · ${progress.remaining === 1 ? '1 recommended detail remaining' : `${progress.remaining} recommended details remaining`}` : ''}
            </p>
            <ActivityNav activity={active} active={section} onChange={setSection} />
            <div className="flex-1 overflow-y-auto pb-4">
              <ActivitySections section={section} />
            </div>
            <BuilderFooter onSaveDraft={() => patchActive({ status: 'draft' })} onGenerate={activate} draftLabel="Save as Draft" generateLabel={active.status === 'active' ? 'Save activity' : 'Activate Activity'} />
          </div>
        </div>
        <div className={`${isMobileSummary ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1 flex-col`}>
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:hidden">
            <p className="text-sm font-medium">{active.name || 'Activity summary'}</p>
            <button type="button" className="text-sm underline" onClick={() => { setShowSummary(false); onShowEditor?.() }}>Edit</button>
          </div>
          <ActivitySummary />
        </div>
      </div>
      <Modal open={!!issues} title="A few details remaining" onClose={() => setIssues(null)} footer={<BaseButton onClick={() => setIssues(null)}>Continue editing</BaseButton>}>
        <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600 dark:text-zinc-300">
          {issues?.map((issue) => <li key={issue}>{issue}</li>)}
        </ul>
      </Modal>
    </>
  )
}
