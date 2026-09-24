import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { BaseSelect } from '../../components/ui/BaseSelect'
import { ACTIVITY_STATUS_LABELS, PLACEMENT_LABEL, formatUpdated, formatUsd, routeSummary } from '../../data/activity-catalog'
import { emptyActivity } from '../../lib/activity'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useActivities } from '../../state/activity-store'
import { useDestinations } from '../../state/destination-store'
import type { ActivityPlacement, ActivityStatus } from '../../types/activity'
import { ActivityBuilder } from './ActivityBuilder'

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

export function ActivitiesPage() {
  const { activities, setActiveId, addActivity, duplicateActivity, archiveActivity, removeActivity } = useActivities()
  const { notify } = useToast()
  const { destinations } = useDestinations()
  const [open, setOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'summary'>('edit')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [place, setPlace] = useState('')

  const rows = useMemo(() => {
    const term = q.toLowerCase().trim()
    return activities.filter((activity) => {
      const routes = activity.applicableRoutes.map((r) => `${r.fromLocationName} ${r.toLocationName}`).join(' ')
      const hay = `${activity.name} ${activity.locationName} ${routes}`.toLowerCase()
      if (term && !hay.includes(term)) return false
      if (status && activity.status !== status) return false
      if (type && activity.type !== type) return false
      if (place && activity.locationId !== place && activity.locationName !== place) return false
      return true
    })
  }, [activities, q, status, type, place])

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
            <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Activities & Entrance Fees</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Manage reusable sightseeing, activities and entrance fees used across destinations, itineraries and costing.</p>
          </div>
          <BaseButton onClick={() => { addActivity(emptyActivity()); setOpen(true) }}>
            <Plus size={16} /> Add Activity
          </BaseButton>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities..." className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <BaseSelect className="mb-0" placeholder="All locations" value={place} options={destinations.map((d) => ({ value: d.id, label: d.name }))} onChange={(e) => setPlace(e.target.value)} />
          <BaseSelect className="mb-0" placeholder="All types" value={type} options={(Object.keys(PLACEMENT_LABEL) as ActivityPlacement[]).map((id) => ({ value: id, label: PLACEMENT_LABEL[id] }))} onChange={(e) => setType(e.target.value)} />
          <BaseSelect className="mb-0" placeholder="All statuses" value={status} options={(Object.keys(ACTIVITY_STATUS_LABELS) as ActivityStatus[]).map((id) => ({ value: id, label: ACTIVITY_STATUS_LABELS[id] }))} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <div className="overflow-auto rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 font-medium">Location / Route</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Adult Fee</th>
                <th className="px-4 py-3 font-medium">Child Fee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((activity) => (
                <tr key={activity.id} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5" onClick={() => openRow(activity.id)}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{activity.name || 'Untitled activity'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{routeSummary(activity)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{PLACEMENT_LABEL[activity.type]}</td>
                  <td className="px-4 py-3">{formatUsd(activity.adultRateUsd)}</td>
                  <td className="px-4 py-3">{formatUsd(activity.childRateUsd)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px]', activity.status === 'active' ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-zinc-200')}>
                      {ACTIVITY_STATUS_LABELS[activity.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatUpdated(activity.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs text-gray-500">
                      <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); openRow(activity.id) }}><Pencil size={12} /> Edit</button>
                      <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); duplicateActivity(activity.id); setOpen(true) }}><Copy size={12} /> Duplicate</button>
                      <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); archiveActivity(activity.id) }}><Archive size={12} /> {activity.status === 'inactive' ? 'Restore' : 'Deactivate'}</button>
                      <button type="button" className="inline-flex items-center gap-1 text-red-600" onClick={(e) => { e.stopPropagation(); const label = activity.name || 'this activity'; if (!window.confirm(`Delete "${label}"?`)) return; removeActivity(activity.id); setOpen(false); notify('Activity deleted.') }}><Trash2 size={12} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-400">No activities match these filters.</p> : null}
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
                <ActivityBuilder onClose={() => setOpen(false)} mobileTab={mobileTab} onShowEditor={() => setMobileTab('edit')} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
