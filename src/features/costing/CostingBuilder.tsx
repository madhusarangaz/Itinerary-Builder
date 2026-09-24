import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { COSTING_SECTIONS, costingIssues } from '../../lib/costing-completeness'
import { calculatePricing, formatMoney, sellingFigures } from '../../lib/costing-calc'
import { useCosting } from '../../state/costing-store'
import { useItinerary } from '../../state/itinerary-store'
import type { CostingSectionId } from '../../types/costing'
import { CostSummary } from './CostSummary'
import { CostingNav } from './CostingNav'
import { TourDetailsForm } from './forms/TourDetailsForm'
import { AccommodationCostBuilder } from './forms/AccommodationCostBuilder'
import { TransportationCostForm } from './forms/TransportationCostForm'
import { DriverGuideCostForm } from './forms/DriverGuideCostForm'
import { ActivityCostBuilder } from './forms/ActivityCostBuilder'
import { AdditionalCostBuilder } from './forms/AdditionalCostBuilder'
import { CostingPricingForm } from './forms/CostingPricingForm'

export function CostingBuilder({
  onClose,
  mobileTab,
  onShowEditor,
  onShowSummary,
  fromItinerary,
}: {
  onClose: () => void
  mobileTab?: 'edit' | 'summary'
  onShowEditor?: () => void
  onShowSummary?: () => void
  fromItinerary?: boolean
}) {
  const { active, saveStatus, patchActive, duplicateActive } = useCosting()
  const { trip, patch } = useItinerary()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [section, setSection] = useState<CostingSectionId>('tour')
  const [showSummary, setShowSummary] = useState(false)
  const [issues, setIssues] = useState<string[] | null>(null)
  const [done, setDone] = useState(false)
  const totals = calculatePricing(active)
  const remaining = costingIssues(active)
  const isMobileSummary = mobileTab === 'summary' || showSummary
  const explicitlyLinked = fromItinerary || trip.costingId === active.id
  const sectionIndex = COSTING_SECTIONS.findIndex((s) => s.id === section)
  const isFirst = sectionIndex <= 0
  const isLast = sectionIndex >= COSTING_SECTIONS.length - 1
  const currentMeta = COSTING_SECTIONS[sectionIndex] ?? COSTING_SECTIONS[0]

  function applySellingToItinerary() {
    const sell = sellingFigures(active)
    patch({
      costingId: active.id,
      pricing: {
        ...trip.pricing,
        currency: sell.currency,
        travellerCount: sell.travellerCount,
        total: sell.total,
      },
    })
    patchActive({ itineraryId: trip.id })
  }

  function complete() {
    const list = costingIssues(active)
    if (list.length) {
      setIssues(list)
      return
    }
    patchActive({
      status: 'completed',
      itineraryId: explicitlyLinked ? trip.id : active.itineraryId,
    })
    if (explicitlyLinked) {
      const sell = sellingFigures(active)
      patch({
        costingId: active.id,
        pricing: {
          ...trip.pricing,
          currency: sell.currency,
          travellerCount: sell.travellerCount,
          total: sell.total,
        },
      })
    }
    setDone(true)
  }

  function saveAndReturn() {
    applySellingToItinerary()
    notify('Costing saved. Selling price updated on the itinerary.')
    onClose()
    navigate('/')
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
        <div
          className={`h-full w-full flex-shrink-0 md:w-1/2 ${isMobileSummary ? 'hidden md:flex md:flex-col' : 'flex flex-col'} border-r border-gray-100 dark:border-[#2C2A2A]`}
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <BuilderHeader
              saveStatus={saveStatus}
              onClose={onClose}
              title="Create Costing"
              subtitle="Type: Custom tour"
              showPreviewToggle
              previewLabel="Show summary"
              onShowPreview={() => {
                setShowSummary(true)
                onShowSummary?.()
              }}
            />
            <p className="px-6 pb-1 text-xs text-gray-400">
              Step {currentMeta.n} of {COSTING_SECTIONS.length} · {currentMeta.label}
              {remaining.length > 0 ? ` · ${remaining.length} details remaining` : ''}
            </p>
            <CostingNav costing={active} active={section} onChange={setSection} />
            <div className="flex-1 overflow-y-auto pb-8">
              {section === 'tour' && <TourDetailsForm />}
              {section === 'stay' && <AccommodationCostBuilder />}
              {section === 'transport' && <TransportationCostForm />}
              {section === 'crew' && <DriverGuideCostForm />}
              {section === 'activities' && <ActivityCostBuilder />}
              {section === 'extras' && <AdditionalCostBuilder />}
              {section === 'pricing' && (
                <>
                  <CostingPricingForm />
                  <div className="px-6 pb-4">
                    <BaseButton variant="secondary" onClick={saveAndReturn}>
                      Create / link itinerary
                    </BaseButton>
                    <p className="mt-2 text-xs text-gray-400">Writes selling price only — buy rates stay in costing.</p>
                  </div>
                </>
              )}
            </div>
            <div className="sticky right-0 bottom-0 left-0 z-[2] flex justify-between gap-3 border-t border-gray-100 bg-white px-6 pt-6 pb-10 dark:border-gray-800 dark:bg-[#1E1E20]">
              <div className="flex flex-wrap gap-2">
                <BaseButton variant="secondary" onClick={() => patchActive({ status: 'draft' })}>
                  Save as draft
                </BaseButton>
                <BaseButton variant="secondary" onClick={() => duplicateActive()}>
                  Duplicate
                </BaseButton>
                {!isFirst && (
                  <BaseButton variant="secondary" onClick={() => setSection(COSTING_SECTIONS[sectionIndex - 1].id)}>
                    Back
                  </BaseButton>
                )}
                {fromItinerary && (
                  <BaseButton variant="secondary" onClick={saveAndReturn}>
                    Save costing & return
                  </BaseButton>
                )}
              </div>
              {isLast ? (
                <BaseButton onClick={complete}>Complete costing</BaseButton>
              ) : (
                <BaseButton onClick={() => setSection(COSTING_SECTIONS[sectionIndex + 1].id)}>Next</BaseButton>
              )}
            </div>
          </div>
        </div>
        <div className={`${isMobileSummary ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1 flex-col`}>
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:hidden">
            <p className="text-sm font-medium">
              {formatMoney(totals.finalPackageCost, active.currency)} · {formatMoney(totals.pricePerPerson, active.currency)}
              /person
            </p>
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
          <CostSummary />
        </div>
      </div>
      <Modal
        open={!!issues}
        title="A few details remaining"
        onClose={() => setIssues(null)}
        footer={
          <BaseButton onClick={() => setIssues(null)}>Continue editing</BaseButton>
        }
      >
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {issues?.map((m) => (
            <li key={m}>○ {m}</li>
          ))}
        </ul>
      </Modal>
      <Modal
        open={done}
        title="Costing complete"
        onClose={() => setDone(false)}
        footer={
          <div className="flex gap-2">
            {explicitlyLinked && (
              <BaseButton variant="secondary" onClick={saveAndReturn}>
                Return to itinerary
              </BaseButton>
            )}
            <BaseButton onClick={() => setDone(false)}>OK</BaseButton>
          </div>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Customer-facing selling price is ready to link. Internal buy rates stay in this costing.
        </p>
      </Modal>
    </>
  )
}
