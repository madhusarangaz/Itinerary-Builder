import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { BaseSelect } from '../../components/ui/BaseSelect'
import { formatCapacity, formatLkr, formatModels, formatUpdated, VEHICLE_GROUP_LABELS } from '../../data/transport-catalog'
import { emptyTransport } from '../../data/transport-sample'
import { cn } from '../../lib/cn'
import { TRANSPORT_STATUS_LABELS } from '../../lib/transport-completeness'
import { useToast } from '../../components/ui/Toast'
import { useTransport } from '../../state/transport-store'
import type { TransportStatus, VehicleGroup } from '../../types/transport'
import { TransportBuilder } from './TransportBuilder'

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

export function TransportPage() {
  const { transports, setActiveId, addTransport, duplicateTransport, archiveTransport, removeTransport } = useTransport()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'summary'>('edit')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [group, setGroup] = useState('')
  const [method, setMethod] = useState('')

  const rows = useMemo(() => {
    const term = q.toLowerCase().trim()
    return transports.filter((t) => {
      if (
        term &&
        !`${t.displayName} ${t.vehicleCategory} ${t.models.map((m) => m.name).join(' ')}`.toLowerCase().includes(term)
      ) {
        return false
      }
      if (status && t.status !== status) return false
      if (group && t.vehicleGroup !== group) return false
      if (method === 'per_day' && !t.costing.perDayEnabled) return false
      if (method === 'per_km' && !t.costing.perKmEnabled) return false
      return true
    })
  }, [transports, q, status, group, method])

  function openRow(id: string) {
    setActiveId(id)
    setMobileTab('edit')
    setOpen(true)
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Transport</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Manage vehicle categories, capacities, transport rates and mileage rules used across itineraries and costing.
            </p>
          </div>
          <BaseButton
            onClick={() => {
              addTransport(emptyTransport())
              setOpen(true)
            }}
          >
            <Plus size={16} /> Add Transport
          </BaseButton>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vehicles or models..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <BaseSelect
            className="mb-0"
            placeholder="All statuses"
            value={status}
            options={(Object.keys(TRANSPORT_STATUS_LABELS) as TransportStatus[]).map((s) => ({
              value: s,
              label: TRANSPORT_STATUS_LABELS[s],
            }))}
            onChange={(e) => setStatus(e.target.value)}
          />
          <BaseSelect
            className="mb-0"
            placeholder="All vehicle types"
            value={group}
            options={(Object.keys(VEHICLE_GROUP_LABELS) as VehicleGroup[])
              .filter((g) => g !== 'other')
              .map((g) => ({ value: g, label: VEHICLE_GROUP_LABELS[g] }))}
            onChange={(e) => setGroup(e.target.value)}
          />
          <BaseSelect
            className="mb-0"
            placeholder="All costing methods"
            value={method}
            options={[
              { value: 'per_day', label: 'Per Day' },
              { value: 'per_km', label: 'Per KM' },
            ]}
            onChange={(e) => setMethod(e.target.value)}
          />
        </div>

        <div className="overflow-auto rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Models</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Per Day</th>
                <th className="px-4 py-3 font-medium">Per KM</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5"
                  onClick={() => openRow(t.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-zinc-100">{t.displayName || t.vehicleCategory || 'Untitled'}</div>
                    <div className="text-xs text-gray-400">{VEHICLE_GROUP_LABELS[t.vehicleGroup]}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{formatModels(t.models.map((m) => m.name))}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{formatCapacity(t.capacity.minAdults, t.capacity.maxAdults)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                    {t.costing.perDayEnabled ? formatLkr(t.costing.perDayRate) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                    {t.costing.perKmEnabled ? formatLkr(t.costing.perKmRate) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px]',
                        t.status === 'active'
                          ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                          : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-zinc-200',
                      )}
                    >
                      {TRANSPORT_STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatUpdated(t.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs text-gray-500">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-zinc-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          openRow(t.id)
                        }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-zinc-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateTransport(t.id)
                          setOpen(true)
                        }}
                      >
                        <Copy size={12} /> Duplicate
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-zinc-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          archiveTransport(t.id)
                        }}
                      >
                        <Archive size={12} /> {t.status === 'inactive' ? 'Restore' : 'Deactivate'}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          const label = t.displayName || t.vehicleCategory || 'this vehicle'
                          if (!window.confirm(`Delete "${label}"?`)) return
                          removeTransport(t.id)
                          setOpen(false)
                          notify('Transport deleted.')
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-400">No transport records match these filters.</p> : null}
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
                {(['edit', 'summary'] as const).map((tab) => (
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
                <TransportBuilder onClose={() => setOpen(false)} mobileTab={mobileTab} onShowEditor={() => setMobileTab('edit')} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
