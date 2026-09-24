import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { ItineraryBuilder } from '../itinerary/ItineraryBuilder'
import { useItinerary } from '../../state/itinerary-store'
import { formatShort } from '../../lib/dates'

const slideUp = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as const, when: 'beforeChildren' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const, when: 'afterChildren' } },
}

const panel = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: 100, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

export function TripsPage() {
  const { trip } = useItinerary()
  const [open, setOpen] = useState(true)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

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

  return (
    <AppShell>
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

      <AnimatePresence>
        {open && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 h-full bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <motion.div
              variants={panel}
              className="fixed top-8 right-5 bottom-0 left-2 z-50 flex flex-col overflow-hidden rounded-t-xl bg-white shadow-lg md:left-[15%] dark:bg-[#1E1E20]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 border-b border-gray-100 px-4 py-2 md:hidden">
                {(['edit', 'preview'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileTab(tab)}
                    className={`rounded-full px-3 py-1 text-sm capitalize ${mobileTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1">
                <ItineraryBuilder
                  onClose={() => setOpen(false)}
                  mobileTab={mobileTab}
                  onShowEditor={() => setMobileTab('edit')}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
