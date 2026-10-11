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

export function TransportBuilder({ onClose }: { onClose: () => void }) {
  const { active, saveStatus, patchActive } = useTransport()
  const [section, setSection] = useState<TransportSectionId>('vehicle')
  const [issues, setIssues] = useState<string[] | null>(null)
  const [savedKind, setSavedKind] = useState<'draft' | 'active' | null>(null)
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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-[#0C0C0E]">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={progress.percent}
          title={creating ? 'Create Transport' : `Edit ${active.displayName || active.vehicleCategory}`}
          subtitle="Transport Master"
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <TransportNav transport={active} active={section} onChange={setSection} orientation="horizontal" />
          </div>
          <div className="hidden h-full md:flex">
            <TransportNav transport={active} active={section} onChange={setSection} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px]">
                {section === 'vehicle' && <VehicleForm />}
                {section === 'capacity' && <CapacityForm />}
                {section === 'rates' && <RatesForm />}
                {section === 'mileage' && <MileageForm />}
                {section === 'media' && <MediaForm />}
              </div>
            </div>
            <BuilderFooter
              align="end"
              onSaveDraft={saveDraft}
              onGenerate={activate}
              draftLabel="Save as Draft"
              generateLabel={active.status === 'active' ? 'Save transport' : 'Activate Transport'}
            />
          </div>
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
