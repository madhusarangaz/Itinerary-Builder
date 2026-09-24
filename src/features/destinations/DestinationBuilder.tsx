import { useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import {
  canActivateDestination,
  destinationProgress,
  requiredDestinationIssues,
} from '../../lib/destination-completeness'
import { useDestinations } from '../../state/destination-store'
import type { DestinationSectionId } from '../../types/destination'
import { AskAiButton, DestinationAiChat } from './DestinationAiChat'
import { DestinationNav } from './DestinationNav'
import { DestinationPreview } from './DestinationPreview'
import { ActivitiesForm } from './forms/ActivitiesForm'
import { BasicsForm } from './forms/BasicsForm'
import { ItineraryContentForm } from './forms/ItineraryContentForm'
import { MediaForm } from './forms/MediaForm'
import { TravelForm } from './forms/TravelForm'
import { TravellerInfoForm } from './forms/TravellerInfoForm'

export function DestinationBuilder({
  onClose,
  mobileTab,
  onShowEditor,
  aiOpen,
  onAiOpenChange,
}: {
  onClose: () => void
  mobileTab?: 'edit' | 'preview'
  onShowEditor?: () => void
  aiOpen: boolean
  onAiOpenChange: (open: boolean) => void
}) {
  const { active, saveStatus, patchActive } = useDestinations()
  const [section, setSection] = useState<DestinationSectionId>('basics')
  const [showPreview, setShowPreview] = useState(false)
  const [issues, setIssues] = useState<string[] | null>(null)
  const [savedKind, setSavedKind] = useState<'draft' | 'active' | null>(null)
  const isMobilePreview = mobileTab === 'preview' || showPreview
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
      <div className="relative flex h-full min-h-0 w-full overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
        <div
          className={`h-full w-full flex-shrink-0 transition-[width] duration-300 ${aiOpen ? 'md:w-[38%]' : 'md:w-[46%]'} ${isMobilePreview ? 'hidden md:flex md:flex-col' : 'flex flex-col'} border-r border-gray-100 dark:border-[#2C2A2A]`}
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <BuilderHeader
              saveStatus={saveStatus}
              onClose={onClose}
              title={creating ? 'Create Destination' : `Edit ${active.name}`}
              subtitle="Build reusable destination information"
              showPreviewToggle
              previewLabel="Show preview"
              onShowPreview={() => setShowPreview(true)}
              actions={<AskAiButton onClick={() => onAiOpenChange(true)} />}
            />
            <p className="px-6 pb-1 text-xs text-gray-400">
              Destination profile {progress.percent}% complete
              {progress.remaining > 0 ? ` · ${progress.remaining} recommended detail${progress.remaining === 1 ? '' : 's'} remaining` : ''}
            </p>
            <DestinationNav destination={active} active={section} onChange={setSection} />
            <div className="flex-1 overflow-y-auto pb-4">
              {section === 'basics' && <BasicsForm />}
              {section === 'media' && <MediaForm />}
              {section === 'travel' && <TravelForm />}
              {section === 'activities' && <ActivitiesForm />}
              {section === 'itinerary' && <ItineraryContentForm />}
              {section === 'tips' && <TravellerInfoForm />}
            </div>
            <BuilderFooter
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
        <div className={`${isMobilePreview ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1 flex-col`}>
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:hidden">
            <p className="text-sm font-medium">{active.name || 'Destination preview'}</p>
            <button
              type="button"
              className="text-sm underline"
              onClick={() => {
                setShowPreview(false)
                onShowEditor?.()
              }}
            >
              Edit
            </button>
          </div>
          <DestinationPreview destination={active} onAskAi={() => onAiOpenChange(true)} />
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
