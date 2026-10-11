import { useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { destinationProgress, requiredDestinationIssues, canActivateDestination } from '../../lib/destination-completeness'
import { useDestinations } from '../../state/destination-store'
import type { DestinationSectionId } from '../../types/destination'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { DestinationAiChat } from './DestinationAiChat'
import { DestinationNav } from './DestinationNav'
import { ActivitiesForm } from './forms/ActivitiesForm'
import { BasicsForm } from './forms/BasicsForm'
import { ItineraryContentForm } from './forms/ItineraryContentForm'
import { MediaForm } from './forms/MediaForm'
import { TravelForm } from './forms/TravelForm'
import { TravellerInfoForm } from './forms/TravellerInfoForm'

export function DestinationBuilder({
  onClose,
  aiOpen,
  onAiOpenChange,
}: {
  onClose: () => void
  aiOpen: boolean
  onAiOpenChange: (open: boolean) => void
}) {
  const { active, saveStatus, patchActive } = useDestinations()
  const [section, setSection] = useState<DestinationSectionId>('basics')
  const [issues, setIssues] = useState<string[] | null>(null)
  const [savedKind, setSavedKind] = useState<'draft' | 'active' | null>(null)
  const progress = destinationProgress(active)
  const creating = !active.name.trim()

  function saveDraft() {
    patchActive({ status: 'draft' })
    setSavedKind('draft')
  }

  function saveDestination() {
    const missing = requiredDestinationIssues(active)
    if (missing.length) {
      setIssues(missing)
      return
    }
    patchActive({ status: 'active' })
    setSavedKind('active')
  }

  function activate() {
    if (!canActivateDestination(active)) {
      setIssues(requiredDestinationIssues(active))
      return
    }
    patchActive({ status: 'active' })
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-[#0C0C0E]">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={progress.percent}
          title={creating ? 'Create Destination' : `Edit ${active.name}`}
          subtitle="Build reusable destination information"
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <DestinationNav
              destination={active}
              active={section}
              onChange={setSection}
              onAskAi={() => onAiOpenChange(true)}
              orientation="horizontal"
            />
          </div>
          <div className="hidden h-full md:flex">
            <DestinationNav destination={active} active={section} onChange={setSection} onAskAi={() => onAiOpenChange(true)} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px]">
                {section === 'basics' && <BasicsForm />}
                {section === 'media' && <MediaForm />}
                {section === 'travel' && <TravelForm />}
                {section === 'activities' && <ActivitiesForm />}
                {section === 'itinerary' && <ItineraryContentForm />}
                {section === 'tips' && <TravellerInfoForm />}
              </div>
            </div>
            <BuilderFooter
              align="end"
              onSaveDraft={saveDraft}
              onGenerate={saveDestination}
              draftLabel="Save draft"
              generateLabel="Save destination"
              extra={
                canActivateDestination(active) && active.status !== 'active' ? (
                  <BaseButton variant="secondary" onClick={activate}>
                    Activate destination
                  </BaseButton>
                ) : null
              }
            />
          </div>
        </div>
      </div>
      <DestinationAiChat destination={active} open={aiOpen} onClose={() => onAiOpenChange(false)} />
      <Modal
        open={!!issues}
        title="A few details remaining"
        onClose={() => setIssues(null)}
        footer={<BaseButton onClick={() => setIssues(null)}>Continue editing</BaseButton>}
      >
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {issues?.map((m) => (
            <li key={m}>○ {m}</li>
          ))}
        </ul>
      </Modal>
      <Modal
        open={!!savedKind}
        title={savedKind === 'active' ? 'Destination saved' : 'Draft saved'}
        onClose={() => setSavedKind(null)}
        footer={<BaseButton onClick={() => setSavedKind(null)}>OK</BaseButton>}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {savedKind === 'active'
            ? 'This destination is ready to reuse in itineraries and costing.'
            : 'You can keep enriching this profile whenever you have more detail.'}
        </p>
      </Modal>
    </>
  )
}
