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
import { HotelProfile } from './HotelProfile'

export function HotelBuilder({
  onClose,
  mobileTab,
  onShowEditor,
}: {
  onClose: () => void
  mobileTab?: 'edit' | 'summary'
  onShowEditor?: () => void
}) {
  const { active, saveStatus, patchActive } = useHotelMaster()
  const [section, setSection] = useState<HotelSectionId>('details')
  const [showSummary, setShowSummary] = useState(false)
  const [issues, setIssues] = useState<string[] | null>(null)
  const [savedKind, setSavedKind] = useState<'draft' | 'active' | null>(null)
  const isMobileSummary = mobileTab === 'summary' || showSummary
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
      <div className="flex h-full min-h-0 w-full overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
        <div className={`h-full w-full flex-shrink-0 md:w-[56%] ${isMobileSummary ? 'hidden md:flex md:flex-col' : 'flex flex-col'} border-r border-gray-100 dark:border-[#2C2A2A]`}>
          <div className="relative flex h-full min-h-0 flex-col">
            <BuilderHeader
              saveStatus={saveStatus}
              onClose={onClose}
              title={active.name.trim() ? `Edit ${active.name}` : 'Create Hotel'}
              subtitle="Hotel Master"
              showPreviewToggle
              previewLabel="Show profile"
              onShowPreview={() => setShowSummary(true)}
            />
            <p className="px-6 pb-1 text-xs text-gray-400">
              Hotel profile {progress.percent}% complete
              {progress.remaining > 0 ? ` · ${progress.remaining === 1 ? '1 recommended detail remaining' : `${progress.remaining} recommended details remaining`}` : ''}
            </p>
            <HotelNav hotel={active} active={section} onChange={setSection} />
            <div className="flex-1 overflow-y-auto pb-4">
              {section === 'details' && <DetailsForm />}
              {section === 'rooms' && <RoomsForm />}
              {section === 'contacts' && <ContactsForm />}
              {section === 'media' && <MediaForm />}
            </div>
            <BuilderFooter onSaveDraft={() => { patchActive({ status: 'draft' }); setSavedKind('draft') }} onGenerate={activate} draftLabel="Save as Draft" generateLabel={active.status === 'active' ? 'Save hotel' : 'Activate Hotel'} />
          </div>
        </div>
        <div className={`${isMobileSummary ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1 flex-col`}>
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:hidden">
            <p className="text-sm font-medium">{active.name || 'Hotel profile'}</p>
            <button type="button" className="text-sm underline" onClick={() => { setShowSummary(false); onShowEditor?.() }}>Edit</button>
          </div>
          <HotelProfile />
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
