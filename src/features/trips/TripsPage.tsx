import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { cn } from '../../lib/cn'
import { formatShort } from '../../lib/dates'
import { useItinerary } from '../../state/itinerary-store'
import { ItineraryBuilder } from '../itinerary/ItineraryBuilder'

export function TripsPage() {
  const { trip } = useItinerary()
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const rows = [
    {
      id: trip.id,
      title: trip.title,
      customer: trip.customer,
      dates: `${formatShort(trip.startDate)} – ${formatShort(trip.endDate)}`,
      status: 'Draft',
      tourId: trip.tourId,
    },
    {
      id: 't2',
      title: 'Tea Trails & Coast',
      customer: 'The Sharma Family',
      dates: '02 – 09 Oct 2026',
      status: 'Sent',
      tourId: 'GB/26/118',
    },
    {
      id: 't3',
      title: 'Wildlife Circuit',
      customer: 'Nordic Travel Partners',
      dates: '12 – 20 Nov 2026',
      status: 'Confirmed',
      tourId: 'GB/26/102',
    },
  ]

  function closeBuilder() {
    setOpen(false)
    setAiOpen(false)
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
              <ItineraryBuilder onClose={closeBuilder} aiOpen={aiOpen} onAiOpenChange={setAiOpen} />
            </div>
          ) : (
            <div className="absolute inset-0 overflow-y-auto">
              <div className="flex h-full flex-col p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Itinerary</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Itineraries for your travellers</p>
                  </div>
                  <BaseButton onClick={() => setOpen(true)}>
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
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5"
                          onClick={() => setOpen(true)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-zinc-100">{r.title}</div>
                            <div className="text-xs text-gray-400">{r.tourId}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{r.customer}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">{r.dates}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-zinc-200">{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
      </div>
    </AppShell>
  )
}
