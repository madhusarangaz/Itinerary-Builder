import { useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { activityProgress, requiredActivityIssues } from '../../lib/activity-completeness'
import { useActivities } from '../../state/activity-store'
import type { ActivitySectionId } from '../../types/activity'
import { ActivityNav } from './ActivityNav'
import { ActivitySections } from './forms/ActivitySections'

export function ActivityBuilder({ onClose }: { onClose: () => void }) {
  const { active, saveStatus, patchActive } = useActivities()
  const [section, setSection] = useState<ActivitySectionId>('activity')
  const [issues, setIssues] = useState<string[] | null>(null)
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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-[#0C0C0E]">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={progress.percent}
          title={active.name.trim() ? `Edit ${active.name}` : 'Create Activity'}
          subtitle="Activities & Entrance Fees"
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <ActivityNav activity={active} active={section} onChange={setSection} orientation="horizontal" />
          </div>
          <div className="hidden h-full md:flex">
            <ActivityNav activity={active} active={section} onChange={setSection} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px]">
                <ActivitySections section={section} />
              </div>
            </div>
            <BuilderFooter
              align="end"
              onSaveDraft={() => patchActive({ status: 'draft' })}
              onGenerate={activate}
              draftLabel="Save as Draft"
              generateLabel={active.status === 'active' ? 'Save activity' : 'Activate Activity'}
            />
          </div>
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
