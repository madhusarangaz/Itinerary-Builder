import { Check, ExternalLink, Link2, Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { ItineraryChat } from '../../share/ItineraryChat'
import { ItineraryTemplate } from '../../share/ItineraryTemplate'
import type { EditorTarget, Trip } from '../../../types/itinerary'
import { cn } from '../../../lib/cn'

export function LivePreview({
  trip,
  onEdit,
}: {
  trip: Trip
  onEdit?: (target: EditorTarget) => void
}) {
  const [mode, setMode] = useState<'mobile' | 'desktop'>('mobile')
  const [copied, setCopied] = useState(false)
  const sharePath = `/i/${trip.shareId || 'gb-26-145'}`
  const shareUrl = `${window.location.origin}${sharePath}`

  async function copy() {
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

  function openLive(e: { preventDefault: () => void; stopPropagation: () => void }) {
    e.preventDefault()
    e.stopPropagation()
    const opened = window.open(shareUrl, '_blank', 'noopener,noreferrer')
    if (!opened) window.location.assign(shareUrl)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f2f2f2]">
      <div className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-[#f2f2f2]/90 px-4 py-3 backdrop-blur">
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm shadow-sm">
          <button
            type="button"
            onClick={() => setMode('mobile')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition',
              mode === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <Smartphone size={14} />
            Mobile view
          </button>
          <button
            type="button"
            onClick={() => setMode('desktop')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition',
              mode === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <Monitor size={14} />
            Desktop view
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              void copy()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={sharePath}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openLive}
            onMouseDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#111317] px-3 py-1.5 text-sm font-medium text-white"
          >
            <ExternalLink size={14} />
            Open
          </a>
        </div>
      </div>

      {mode === 'desktop' ? (
        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-auto bg-[#f2f2f2]">
            <div className="w-full">
              <ItineraryTemplate trip={trip} animate={false} onEdit={onEdit} />
            </div>
          </div>
          <ItineraryChat trip={trip} placement="absolute" />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-3 py-4 sm:px-4 sm:py-5">
          <div className="flex h-full w-full max-w-[390px] min-w-0 flex-col overflow-hidden rounded-[2.1rem] bg-[#111] p-2 shadow-2xl">
            <div className="flex items-center justify-center pb-1 pt-1">
              <span className="h-1.5 w-16 rounded-full bg-white/25" />
            </div>
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-[1.6rem] bg-white">
              <div className="h-full min-w-0 overflow-auto">
                <ItineraryTemplate trip={trip} animate={false} onEdit={onEdit} />
              </div>
              <ItineraryChat trip={trip} placement="absolute" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
