import { useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { hotelProgress, requiredHotelIssues } from '../../lib/hotel-completeness'
import { useHotelMaster } from '../../state/hotel-store'
import type { HotelSectionId } from '../../types/hotel'
import { ContactsForm } from './forms/ContactsForm'
import { DetailsForm } from './forms/DetailsForm'
import { MediaForm } from './forms/MediaForm'
import { RoomsForm } from './forms/RoomsForm'
import { HotelNav } from './HotelNav'

export function HotelBuilder({ onClose }: { onClose: () => void }) {
  const { active, saveStatus, patchActive } = useHotelMaster()
  const [section, setSection] = useState<HotelSectionId>('details')
  const [issues, setIssues] = useState<string[] | null>(null)
  const [savedKind, setSavedKind] = useState<'draft' | 'active' | null>(null)
  const progress = hotelProgress(active)

  function activate() {
    const missing = requiredHotelIssues(active)
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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-[#1E1E20]">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={progress.percent}
          title={active.name.trim() ? `Edit ${active.name}` : 'Create Hotel'}
          subtitle="Hotel Master"
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <HotelNav hotel={active} active={section} onChange={setSection} orientation="horizontal" />
          </div>
          <div className="hidden h-full md:flex">
            <HotelNav hotel={active} active={section} onChange={setSection} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px]">
                {section === 'details' && <DetailsForm />}
                {section === 'rooms' && <RoomsForm />}
                {section === 'contacts' && <ContactsForm />}
                {section === 'media' && <MediaForm />}
              </div>
            </div>
            <BuilderFooter
              align="end"
              onSaveDraft={() => {
                patchActive({ status: 'draft' })
                setSavedKind('draft')
              }}
              onGenerate={activate}
              draftLabel="Save as Draft"
              generateLabel={active.status === 'active' ? 'Save hotel' : 'Activate Hotel'}
            />
          </div>
        </div>
      </div>
      <Modal open={!!issues} title="A few details remaining" onClose={() => setIssues(null)} footer={<BaseButton onClick={() => setIssues(null)}>Continue editing</BaseButton>}>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">{issues?.map((m) => <li key={m}>○ {m}</li>)}</ul>
      </Modal>
      <Modal open={!!savedKind} title={savedKind === 'active' ? 'Hotel saved' : 'Draft saved'} onClose={() => setSavedKind(null)} footer={<BaseButton onClick={() => setSavedKind(null)}>OK</BaseButton>}>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {savedKind === 'active' ? 'This hotel is ready to reuse in itineraries and costing.' : 'You can keep adding rooms, contacts, and images whenever you have them.'}
        </p>
      </Modal>
    </>
  )
}
