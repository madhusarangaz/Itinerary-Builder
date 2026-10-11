import { ChevronRight, Download, ExternalLink, PartyPopper } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AccommodationBuilder } from './forms/AccommodationBuilder'
import { DayBuilder } from './forms/DayBuilder'
import { PricingForm } from './forms/PricingForm'
import { TermsBuilder } from './forms/TermsBuilder'
import { TravelExpertForm } from './forms/TravelExpertForm'
import { TripDetailsForm } from './forms/TripDetailsForm'
import { BuilderFooter } from './BuilderFooter'
import { BuilderHeader } from './BuilderHeader'
import { BuilderNav } from './BuilderNav'
import { ItineraryAiChat } from './ItineraryAiChat'
import { useItinerary } from '../../state/itinerary-store'
import type { SectionId } from '../../types/itinerary'
import { blockingSection, itineraryCompletion, SECTION_META, sectionStatus, sectionUnlocked, sendGaps } from '../../lib/completeness'
import { Modal } from '../../components/ui/Modal'
import { BaseButton } from '../../components/ui/BaseButton'
import { cn } from '../../lib/cn'

function DetailsCheer({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-3" role="status">
      <div className="celebrate-drop flex max-w-md items-center gap-2.5 rounded-full border border-[#C5D7FF] bg-white px-4 py-2 text-sm text-gray-800 shadow-lg dark:border-[#5b93ff]/40 dark:bg-[#101014] dark:text-zinc-100">
        <PartyPopper size={18} className="celebrate-pop shrink-0 text-[var(--accent)]" />
        <p>Nice. You completed the details. Continue with day by day.</p>
      </div>
    </div>
  )
}

export function ItineraryBuilder({
  onClose,
  aiOpen = false,
  onAiOpenChange,
}: {
  onClose: () => void
  aiOpen?: boolean
  onAiOpenChange?: (open: boolean) => void
}) {
  const { trip, saveStatus } = useItinerary()
  const [section, setSection] = useState<SectionId>('details')
  const [detailsCue, setDetailsCue] = useState(0)
  const [reviewNights, setReviewNights] = useState(false)
  const clearDetailsCue = useCallback(() => setDetailsCue(0), [])
  const [gapsOpen, setGapsOpen] = useState(false)
  const [pdfNote, setPdfNote] = useState(false)
  const [detailsCheer, setDetailsCheer] = useState(false)
  const clearCheer = useCallback(() => setDetailsCheer(false), [])
  const [focus, setFocus] = useState<{ token: number; anchor: string; dayId?: string; stayId?: string } | null>(null)
  const gaps = sendGaps(trip)
  const sharePath = `/i/${trip.shareId || 'gb-26-145'}`
  const nextSection = SECTION_META[SECTION_META.findIndex((item) => item.id === section) + 1]
  const pdfReady = (['details', 'days', 'stay'] as const).every((id) => sectionStatus(trip, id) === 'complete')

  function openSection(id: SectionId) {
    if (id === 'details') setReviewNights(false)
    setFocus(null)
    setSection(id)
  }

  function openGap(id: string) {
    const gap = gaps.find((item) => item.id === id)
    if (!gap) return
    setGapsOpen(false)
    setSection(gap.section)
    setFocus({ token: Date.now(), anchor: gap.anchor, dayId: gap.dayId, stayId: gap.stayId })
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

  const editable = sectionUnlocked(trip, section)
  const blocker = blockingSection(trip, section)
  const held = Boolean(blocker)
  const detailGaps = gaps.filter((gap) => gap.id === 'title' || gap.id === 'customer' || gap.id === 'dates' || gap.id === 'cover')

  function generate() {
    if (gaps.length) {
      setGapsOpen(true)
      return
    }
    setPdfNote(true)
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-transparent">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={itineraryCompletion(trip)}
          readiness={{
            items: gaps,
            open: gapsOpen,
            onOpenChange: setGapsOpen,
            onSelect: openGap,
          }}
          blend
          crumb={{ parent: 'Itinerary', current: trip.title.trim() || 'New itinerary' }}
          actions={
            <>
              {pdfReady ? (
                <button
                  type="button"
                  onClick={generate}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--accent-text)] hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <Download size={14} />
                  Download as PDF
                </button>
              ) : null}
              <a
                href={sharePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white"
              >
                <ExternalLink size={14} />
                Open preview
              </a>
            </>
          }
        />
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <BuilderNav
              trip={trip}
              active={section}
              onChange={openSection}
              onAskAi={() => onAiOpenChange?.(true)}
              reviewDetails={reviewNights}
              orientation="horizontal"
            />
          </div>
          <div className="hidden h-full md:flex">
            <BuilderNav
              trip={trip}
              active={section}
              onChange={openSection}
              reviewDetails={reviewNights}
            />
          </div>
          <ItineraryAiChat open={aiOpen} onClose={() => onAiOpenChange?.(false)} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div
              className={cn(
                'relative',
                section === 'days' || section === 'details' || section === 'stay' || section === 'terms' || held
                  ? 'min-h-0 flex-1 overflow-hidden'
                  : 'min-h-0 flex-1 overflow-y-auto',
              )}
              onFocusCapture={(event) => {
                if (editable || held) return
                if (event.target instanceof HTMLElement) event.target.blur()
              }}
            >
              <div className={cn('h-full min-h-0', held && 'pointer-events-none')} inert={held}>
              {section === 'days' ? (
                <DayBuilder focusDayId={focus?.dayId} attentionToken={detailsCue} onAttentionHandled={clearDetailsCue} onNightsAdded={() => setReviewNights(true)} />
              ) : section === 'details' ? (
                <TripDetailsForm attentionToken={detailsCue} onAttentionHandled={clearDetailsCue} />
              ) : section === 'stay' ? (
                <AccommodationBuilder focusStayId={focus?.stayId} attentionToken={detailsCue} onAttentionHandled={clearDetailsCue} />
              ) : section === 'terms' ? (
                <TermsBuilder attentionToken={detailsCue} onAttentionHandled={clearDetailsCue} />
              ) : (
                <div className="mx-auto w-full max-w-[720px]">
                  {section === 'pricing' && <PricingForm attentionToken={detailsCue} onAttentionHandled={clearDetailsCue} />}
                  {section === 'expert' && <TravelExpertForm />}
                </div>
              )}
              </div>
              {held && blocker ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 px-6 backdrop-blur-md dark:bg-black/40">
                  <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-lg dark:border-[#333336] dark:bg-[#0C0C0E]">
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                      Please fill the missing data in {blocker.label}, then come back here.
                    </p>
                    {blocker.id === 'details' && detailGaps.length ? (
                      <ul className="mt-3 space-y-1 text-sm text-gray-500 dark:text-zinc-400">
                        {detailGaps.map((gap) => (
                          <li key={gap.id}>{gap.label}</li>
                        ))}
                      </ul>
                    ) : null}
                    <BaseButton
                      className="mt-4"
                      onClick={() => {
                        if (blocker.id === 'details') setDetailsCue(Date.now())
                        openSection(blocker.id)
                      }}
                    >
                      Go to {blocker.label}
                    </BaseButton>
                  </div>
                </div>
              ) : null}
            </div>
            <BuilderFooter
              align="end"
              snug
              showPrimary={Boolean(nextSection) || section === 'expert'}
              generateLabel={section === 'expert' ? 'Download as PDF' : 'Next'}
              generateIcon={section === 'expert' ? <Download size={15} /> : <ChevronRight size={15} />}
              onSaveDraft={() => {
                localStorage.setItem('travelbuilding.trip.v3', JSON.stringify(trip))
              }}
              onGenerate={() => {
                if (section === 'expert') {
                  generate()
                  return
                }
                if (!nextSection) return
                const termsOpen =
                  section === 'terms' &&
                  (!trip.inclusions.some((row) => row.text.trim()) || !trip.exclusions.some((row) => row.text.trim()))
                if (termsOpen || sectionStatus(trip, section) !== 'complete') {
                  setDetailsCue(Date.now())
                  return
                }
                if (section === 'details') setDetailsCheer(true)
                openSection(nextSection.id)
              }}
            />
          </div>
        </div>
      </div>
      {detailsCheer ? <DetailsCheer onDone={clearCheer} /> : null}
      <Modal open={pdfNote} title="Ready to send" onClose={() => setPdfNote(false)} footer={<BaseButton onClick={() => setPdfNote(false)}>OK</BaseButton>}>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          PDF export is a preview action for this prototype. Use Open preview to see the live itinerary.
        </p>
      </Modal>
    </>
  )
}
