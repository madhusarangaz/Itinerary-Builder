import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { COSTING_SECTIONS, costingCompletion, costingGaps } from '../../lib/costing-completeness'
import { sellingFigures } from '../../lib/costing-calc'
import { useCosting } from '../../state/costing-store'
import { useItinerary } from '../../state/itinerary-store'
import type { CostingSectionId } from '../../types/costing'
import { CostingNav } from './CostingNav'
import { CostSummary } from './CostSummary'
import { TourDetailsForm } from './forms/TourDetailsForm'
import { AccommodationCostBuilder } from './forms/AccommodationCostBuilder'
import { TransportationCostForm } from './forms/TransportationCostForm'
import { DriverGuideCostForm } from './forms/DriverGuideCostForm'
import { ActivityCostBuilder } from './forms/ActivityCostBuilder'
import { AdditionalCostBuilder } from './forms/AdditionalCostBuilder'
import { CostingPricingForm } from './forms/CostingPricingForm'

export function CostingBuilder({
  onClose,
  fromItinerary,
}: {
  onClose: () => void
  fromItinerary?: boolean
}) {
  const { active, saveStatus, patchActive, duplicateActive } = useCosting()
  const { trip, patch } = useItinerary()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [section, setSection] = useState<CostingSectionId>('tour')
  const [gapsOpen, setGapsOpen] = useState(false)
  const [focus, setFocus] = useState<{ token: number; anchor: string } | null>(null)
  const [done, setDone] = useState(false)
  const gaps = costingGaps(active)
  const explicitlyLinked = fromItinerary || trip.costingId === active.id
  const sectionIndex = COSTING_SECTIONS.findIndex((s) => s.id === section)
  const isFirst = sectionIndex <= 0
  const isLast = sectionIndex >= COSTING_SECTIONS.length - 1

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

  function openGap(id: string) {
    const gap = gaps.find((item) => item.id === id)
    if (!gap) return
    setGapsOpen(false)
    setSection(gap.section)
    setFocus({ token: Date.now(), anchor: gap.anchor })
  }

  useEffect(() => {
    if (!gaps.length) setGapsOpen(false)
  }, [gaps.length])

  useEffect(() => {
    if (!focus) return
    const handle = window.setTimeout(() => {
      document.getElementById(focus.anchor)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 60)
    return () => window.clearTimeout(handle)
  }, [focus])

  function complete() {
    if (gaps.length) {
      setGapsOpen(true)
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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-[#1E1E20]">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={costingCompletion(active)}
          progressLabel="Costing completion"
          title={active.referenceNo.trim() || 'Create Costing'}
          subtitle={active.clientName.trim() || 'Custom tour'}
          readiness={{
            items: gaps,
            open: gapsOpen,
            onOpenChange: setGapsOpen,
            onSelect: openGap,
            readyLabel: 'Ready to complete',
            hint: 'Fill these in, then complete the costing.',
          }}
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <CostingNav costing={active} active={section} onChange={setSection} orientation="horizontal" />
          </div>
          <div className="hidden h-full md:flex">
            <CostingNav costing={active} active={section} onChange={setSection} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px]">
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
            </div>
            <aside className="hidden min-h-0 w-[320px] shrink-0 overflow-y-auto border-l border-gray-100 px-3 py-4 min-[1180px]:block dark:border-[#2C2A2A]">
              <CostSummary />
            </aside>
            </div>
            <div className="sticky right-0 bottom-0 left-0 z-[2] flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-white px-6 pt-6 pb-10 dark:border-gray-800 dark:bg-[#1E1E20]">
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
      </div>
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
