import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { BaseSelect } from '../../components/ui/BaseSelect'
import { formatUpdated, starLabel, STAR_OPTIONS } from '../../data/hotel-catalog'
import { emptyHotel } from '../../data/hotel-sample'
import { cn } from '../../lib/cn'
import { HOTEL_STATUS_LABELS } from '../../lib/hotel-completeness'
import { useToast } from '../../components/ui/Toast'
import { useHotelMaster } from '../../state/hotel-store'
import type { HotelStatus, StarCategory } from '../../types/hotel'
import { HotelBuilder } from './HotelBuilder'

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

export function HotelsPage() {
  const { hotels, setActiveId, addHotel, duplicateHotel, archiveHotel, removeHotel } = useHotelMaster()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'summary'>('edit')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [stars, setStars] = useState('')

  const rows = useMemo(() => {
    const term = q.toLowerCase().trim()
    return hotels.filter((hotel) => {
      if (term && !`${hotel.name} ${hotel.address} ${hotel.destinationName ?? ''}`.toLowerCase().includes(term)) return false
      if (status && hotel.status !== status) return false
      if (stars && String(hotel.starCategory ?? '') !== stars) return false
      return true
    })
  }, [hotels, q, status, stars])

  function openRow(id: string) {
    setActiveId(id)
    setMobileTab('edit')
    setOpen(true)
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Hotels</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Manage reusable hotel information, room categories, contacts and images.</p>
          </div>
          <BaseButton onClick={() => { addHotel(emptyHotel()); setOpen(true) }}>
            <Plus size={16} /> Add Hotel
          </BaseButton>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hotels..." className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <BaseSelect className="mb-0" placeholder="All star categories" value={stars} options={STAR_OPTIONS.map((s) => ({ value: String(s.value), label: s.label }))} onChange={(e) => setStars(e.target.value)} />
          <BaseSelect className="mb-0" placeholder="All statuses" value={status} options={(Object.keys(HOTEL_STATUS_LABELS) as HotelStatus[]).map((s) => ({ value: s, label: HOTEL_STATUS_LABELS[s] }))} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <div className="overflow-auto rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Hotel</th>
                <th className="px-4 py-3 font-medium">Location / Address</th>
                <th className="px-4 py-3 font-medium">Star Category</th>
                <th className="px-4 py-3 font-medium">Room Categories</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((hotel) => (
                <tr key={hotel.id} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5" onClick={() => openRow(hotel.id)}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{hotel.name || 'Untitled hotel'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{hotel.destinationName || hotel.address.split('\n')[0] || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{starLabel(hotel.starCategory as StarCategory | undefined)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{hotel.rooms.filter((r) => r.name.trim()).length}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px]', hotel.status === 'active' ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-zinc-200')}>
                      {HOTEL_STATUS_LABELS[hotel.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatUpdated(hotel.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs text-gray-500">
                      <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); openRow(hotel.id) }}><Pencil size={12} /> Edit</button>
                      <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); duplicateHotel(hotel.id); setOpen(true) }}><Copy size={12} /> Duplicate</button>
                      <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); archiveHotel(hotel.id) }}><Archive size={12} /> {hotel.status === 'inactive' ? 'Restore' : 'Deactivate'}</button>
                      <button type="button" className="inline-flex items-center gap-1 text-red-600" onClick={(e) => { e.stopPropagation(); const label = hotel.name || 'this hotel'; if (!window.confirm(`Delete "${label}"?`)) return; removeHotel(hotel.id); setOpen(false); notify('Hotel deleted.') }}><Trash2 size={12} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-400">No hotels match these filters.</p> : null}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div variants={slideUp} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 z-40 h-full bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
            <motion.div variants={panel} className="fixed top-8 right-5 bottom-0 left-2 z-50 flex flex-col overflow-hidden rounded-t-xl bg-white shadow-lg md:left-[15%] dark:bg-[#1E1E20]" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 border-b border-gray-100 px-4 py-2 md:hidden">
                {(['edit', 'summary'] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => setMobileTab(tab)} className={`rounded-full px-3 py-1 text-sm capitalize ${mobileTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>{tab}</button>
                ))}
              </div>
              <div className="min-h-0 flex-1">
                <HotelBuilder onClose={() => setOpen(false)} mobileTab={mobileTab} onShowEditor={() => setMobileTab('edit')} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
