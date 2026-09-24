import { useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { requiredTransportIssues, transportProgress } from '../../lib/transport-completeness'
import { useTransport } from '../../state/transport-store'
import type { TransportSectionId } from '../../types/transport'
import { CapacityForm } from './forms/CapacityForm'
import { MediaForm } from './forms/MediaForm'
import { MileageForm } from './forms/MileageForm'
import { RatesForm } from './forms/RatesForm'
import { VehicleForm } from './forms/VehicleForm'
import { TransportNav } from './TransportNav'
import { TransportSummary } from './TransportSummary'

export function TransportBuilder({
  onClose,
  mobileTab,
  onShowEditor,
}: {
  onClose: () => void
  mobileTab?: 'edit' | 'summary'
  onShowEditor?: () => void
}) {
  const { active, saveStatus, patchActive } = useTransport()
  const [section, setSection] = useState<TransportSectionId>('vehicle')
  const [showSummary, setShowSummary] = useState(false)
  const [issues, setIssues] = useState<string[] | null>(null)
  const [savedKind, setSavedKind] = useState<'draft' | 'active' | null>(null)
  const isMobileSummary = mobileTab === 'summary' || showSummary
  const progress = transportProgress(active)
  const creating = !active.displayName.trim() && !active.vehicleCategory.trim()

  function saveDraft() {
    patchActive({ status: 'draft' })
    setSavedKind('draft')
  }

  function activate() {
    const missing = requiredTransportIssues(active)
    if (missing.length) {
      setIssues(missing.map((m) => m.message))
      setSection(missing[0].section)
      return
    }
    patchActive({ status: 'active' })
    setSavedKind('active')
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
        <div
          className={`h-full w-full flex-shrink-0 md:w-[56%] ${isMobileSummary ? 'hidden md:flex md:flex-col' : 'flex flex-col'} border-r border-gray-100 dark:border-[#2C2A2A]`}
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <BuilderHeader
              saveStatus={saveStatus}
              onClose={onClose}
              title={creating ? 'Create Transport' : `Edit ${active.displayName || active.vehicleCategory}`}
              subtitle="Transport Master"
              showPreviewToggle
              previewLabel="Show summary"
              onShowPreview={() => setShowSummary(true)}
            />
            <p className="px-6 pb-1 text-xs text-gray-400">
              Transport profile {progress.percent}% complete
              {progress.remaining > 0 ? ` · ${progress.remaining} recommended detail${progress.remaining === 1 ? '' : 's'} remaining` : ''}
            </p>
            <TransportNav transport={active} active={section} onChange={setSection} />
            <div className="flex-1 overflow-y-auto pb-4">
              {section === 'vehicle' && <VehicleForm />}
              {section === 'capacity' && <CapacityForm />}
              {section === 'rates' && <RatesForm />}
              {section === 'mileage' && <MileageForm />}
              {section === 'media' && <MediaForm />}
            </div>
            <BuilderFooter
              onSaveDraft={saveDraft}
              onGenerate={activate}
              draftLabel="Save as Draft"
              generateLabel={active.status === 'active' ? 'Save transport' : 'Activate Transport'}
            />
          </div>
        </div>
        <div className={`${isMobileSummary ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1 flex-col`}>
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:hidden">
            <p className="text-sm font-medium">{active.displayName || active.vehicleCategory || 'Transport summary'}</p>
            <button
              type="button"
              className="text-sm underline"
              onClick={() => {
                setShowSummary(false)
                onShowEditor?.()
              }}
            >
              Edit
            </button>
          </div>
          <TransportSummary />
        </div>
      </div>
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
        title={savedKind === 'active' ? 'Transport saved' : 'Draft saved'}
        onClose={() => setSavedKind(null)}
        footer={<BaseButton onClick={() => setSavedKind(null)}>OK</BaseButton>}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {savedKind === 'active'
            ? 'This vehicle type is ready to reuse in itineraries and costing.'
            : 'You can keep filling rates, mileage rules, and images whenever you have them.'}
        </p>
      </Modal>
    </>
  )
}
