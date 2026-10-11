import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'
import { formatShort } from '../../lib/dates'
import { useItinerary } from '../../state/itinerary-store'
import type { Trip } from '../../types/itinerary'
import { ItineraryBuilder } from '../itinerary/ItineraryBuilder'

function dateLabel(trip: Trip) {
  if (!trip.startDate || !trip.endDate) return 'Dates not set'
  return `${formatShort(trip.startDate)} – ${formatShort(trip.endDate)}`
}

export function TripsPage() {
  const { trip, trips, createItinerary, openItinerary, removeItinerary } = useItinerary()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  function closeBuilder() {
    setOpen(false)
    setAiOpen(false)
  }

  function editTrip(id: string) {
    openItinerary(id)
    setOpen(true)
  }

  function deleteTrip(item: Trip) {
    const label = item.title.trim() || 'this itinerary'
    if (!window.confirm(`Delete "${label}"?`)) return
    removeItinerary(item.id)
    if (open && trip.id === item.id) closeBuilder()
    notify('Itinerary deleted.')
  }

  return (
    <AppShell askAi={open ? { open: aiOpen, onToggle: () => setAiOpen((value) => !value) } : undefined}>
      <div className="relative h-full overflow-hidden">
        {open ? (
            <div
              className={cn(
                'dash-in absolute top-8 right-8 bottom-8 left-8 transition-[left] duration-300 ease-out',
                aiOpen && 'md:left-[4.5rem]',
              )}
            >
              <ItineraryBuilder key={trip.id} onClose={closeBuilder} aiOpen={aiOpen} onAiOpenChange={setAiOpen} />
            </div>
          ) : (
            <div className="absolute inset-0 overflow-y-auto">
              <div className="flex h-full flex-col p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Itinerary</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Itineraries for your travellers</p>
                  </div>
                  <BaseButton
                    onClick={() => {
                      createItinerary()
                      setOpen(true)
                    }}
                  >
                    <Plus size={16} /> Create itinerary
                  </BaseButton>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tour</th>
                        <th className="px-4 py-3 font-medium">Traveller</th>
                        <th className="px-4 py-3 font-medium">Dates</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((item) => (
                        <tr
                          key={item.id}
                          className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5"
                          onClick={() => editTrip(item.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-zinc-100">{item.title.trim() || 'Untitled itinerary'}</div>
                            <div className="text-xs text-gray-400">{item.tourId}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{item.customer.trim() || '—'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">{dateLabel(item)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-zinc-200">{item.listingStatus ?? 'Draft'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3 text-xs text-gray-500">
                              <button type="button" className="inline-flex items-center gap-1" onClick={(event) => { event.stopPropagation(); editTrip(item.id) }}>
                                <Pencil size={12} /> Edit
                              </button>
                              <button type="button" className="inline-flex items-center gap-1 text-red-600" onClick={(event) => { event.stopPropagation(); deleteTrip(item) }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {trips.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-400">No itineraries yet. Create one to start a new draft.</p> : null}
                </div>
              </div>
            </div>
          )}
      </div>
    </AppShell>
  )
}
