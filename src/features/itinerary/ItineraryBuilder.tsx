import { Check, ExternalLink, FileText, Link2 } from 'lucide-react'
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
import { ItineraryAiChat } from './ItineraryAiChat'
import { useItinerary } from '../../state/itinerary-store'
import type { SectionId } from '../../types/itinerary'
import { itineraryCompletion, sendGaps } from '../../lib/completeness'
import { Modal } from '../../components/ui/Modal'
import { BaseButton } from '../../components/ui/BaseButton'

export function ItineraryBuilder({ onClose, onAiOpenChange }: { onClose: () => void; onAiOpenChange?: (open: boolean) => void }) {
  const { trip, saveStatus } = useItinerary()
  const [section, setSection] = useState<SectionId>('details')
  const [gapsOpen, setGapsOpen] = useState(false)
  const [pdfNote, setPdfNote] = useState(false)
  const [focus, setFocus] = useState<{ token: number; anchor: string; dayId?: string; stayId?: string } | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  function setAskAi(open: boolean) {
    setAiOpen(open)
    onAiOpenChange?.(open)
  }
  const gaps = sendGaps(trip)
  const sharePath = `/i/${trip.shareId || 'gb-26-145'}`
  const shareUrl = `${window.location.origin}${sharePath}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const field = document.createElement('textarea')
      field.value = shareUrl
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
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

  function generate() {
    if (gaps.length) {
      setGapsOpen(true)
      return
    }
    setPdfNote(true)
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
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
          actions={
            <>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 dark:border-[#3a3a3c] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {copied ? <Check size={14} /> : <Link2 size={14} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <a
                href={sharePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#111317] px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-[#111317]"
              >
                <ExternalLink size={14} />
                Open
              </a>
            </>
          }
        />
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <BuilderNav
              trip={trip}
              active={section}
              onChange={(id) => {
                setFocus(null)
                setSection(id)
              }}
              onAskAi={() => setAskAi(true)}
              orientation="horizontal"
            />
          </div>
          <div className="hidden h-full md:flex">
            <BuilderNav
              trip={trip}
              active={section}
              onChange={(id) => {
                setFocus(null)
                setSection(id)
              }}
              onAskAi={() => setAskAi(true)}
            />
          </div>
          <ItineraryAiChat open={aiOpen} onClose={() => setAskAi(false)} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className={section === 'days' || section === 'details' || section === 'stay' ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-0 flex-1 overflow-y-auto'}>
              {section === 'days' ? (
                <DayBuilder focusDayId={focus?.dayId} />
              ) : section === 'details' ? (
                <TripDetailsForm />
              ) : section === 'stay' ? (
                <AccommodationBuilder focusStayId={focus?.stayId} />
              ) : (
                <div className="mx-auto w-full max-w-[720px]">
                  {section === 'pricing' && <PricingForm />}
                  {section === 'terms' && <TermsBuilder />}
                  {section === 'expert' && <TravelExpertForm />}
                </div>
              )}
            </div>
            <BuilderFooter
              align="end"
              generateIcon={<FileText size={15} />}
              onSaveDraft={() => {
                localStorage.setItem('travelbuilding.trip.v3', JSON.stringify(trip))
              }}
              onGenerate={generate}
            />
          </div>
        </div>
      </div>
      <Modal open={pdfNote} title="Ready to send" onClose={() => setPdfNote(false)} footer={<BaseButton onClick={() => setPdfNote(false)}>OK</BaseButton>}>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          PDF export is a preview action for this prototype. Use Copy link to share the live itinerary.
        </p>
      </Modal>
    </>
  )
}
