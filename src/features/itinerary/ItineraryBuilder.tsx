import { useEffect, useState } from 'react'
import { AccommodationBuilder } from './forms/AccommodationBuilder'
import { DayBuilder } from './forms/DayBuilder'
import { PricingForm } from './forms/PricingForm'
import { TermsBuilder } from './forms/TermsBuilder'
import { TravelExpertForm } from './forms/TravelExpertForm'
import { TripDetailsForm } from './forms/TripDetailsForm'
import { BuilderFooter } from './BuilderFooter'
import { BuilderHeader } from './BuilderHeader'
import { BuilderNav } from './BuilderNav'
import { LivePreview } from './preview/LivePreview'
import { useItinerary } from '../../state/itinerary-store'
import type { EditorTarget, SectionId } from '../../types/itinerary'
import { dayRemaining } from '../../lib/completeness'
import { Modal } from '../../components/ui/Modal'
import { BaseButton } from '../../components/ui/BaseButton'

export function ItineraryBuilder({
  onClose,
  mobileTab,
  onShowEditor,
}: {
  onClose: () => void
  mobileTab?: 'edit' | 'preview'
  onShowEditor?: () => void
}) {
  const { trip, saveStatus } = useItinerary()
  const [section, setSection] = useState<SectionId>('details')
  const [editTarget, setEditTarget] = useState<EditorTarget | null>(null)
  const [issues, setIssues] = useState<string[] | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const isMobilePreview = mobileTab === 'preview' || showPreview

  function openForm(target: EditorTarget) {
    setSection(target.section)
    setEditTarget(target)
    setShowPreview(false)
    onShowEditor?.()
  }

  useEffect(() => {
    if (!editTarget) return
    const id = editTarget.dayId
      ? `form-day-${editTarget.dayId}`
      : editTarget.field
        ? `form-${editTarget.field}`
        : `form-${editTarget.section}`
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [editTarget, section])

  function generate() {
    const missing: string[] = []
    if (!trip.title) missing.push('Add a trip name')
    if (!trip.coverImage) missing.push('Add a cover image')
    if (trip.pricing.total <= 0) missing.push('Add a tour cost')
    trip.days.forEach((d) => {
      dayRemaining(d).forEach((m) => missing.push(`Day ${d.dayNumber}: ${m}`))
    })
    if (trip.accommodations.some((a) => !a.hotelId)) missing.push('Select a hotel for every stay')
    if (missing.length) {
      setIssues(missing)
      return
    }
    setIssues(['PDF export is a preview action for this prototype. Use Copy link to share the live itinerary.'])
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
        <div
          className={`h-full w-full flex-shrink-0 md:w-[45%] ${isMobilePreview ? 'hidden md:flex md:flex-col' : 'flex flex-col'} border-r border-gray-100 dark:border-[#2C2A2A]`}
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <BuilderHeader
              saveStatus={saveStatus}
              onClose={onClose}
              showPreviewToggle
              onShowPreview={() => setShowPreview(true)}
            />
            <BuilderNav trip={trip} active={section} onChange={setSection} />
            <div className="flex-1 overflow-y-auto pb-4">
              {section === 'details' && <TripDetailsForm />}
              {section === 'days' && <DayBuilder focusDayId={editTarget?.section === 'days' ? editTarget.dayId : undefined} />}
              {section === 'stay' && <AccommodationBuilder />}
              {section === 'pricing' && <PricingForm />}
              {section === 'terms' && <TermsBuilder />}
              {section === 'expert' && <TravelExpertForm />}
            </div>
            <BuilderFooter
              onSaveDraft={() => {
                localStorage.setItem('travelbuilding.trip.v3', JSON.stringify(trip))
              }}
              onGenerate={generate}
            />
          </div>
        </div>
        <div className={`${isMobilePreview ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1`}>
          <LivePreview trip={trip} onEdit={openForm} />
        </div>
      </div>
      <Modal
        open={!!issues}
        title={issues && issues[0]?.startsWith('PDF') ? 'Generate PDF' : 'A few details remaining'}
        onClose={() => setIssues(null)}
        footer={
          <BaseButton onClick={() => setIssues(null)}>
            {issues && issues[0]?.startsWith('PDF') ? 'OK' : 'Continue editing'}
          </BaseButton>
        }
      >
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {issues?.map((m) => (
            <li key={m}>○ {m}</li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
