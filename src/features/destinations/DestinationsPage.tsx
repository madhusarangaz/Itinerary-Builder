import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Copy, MapPin, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { BaseSelect } from '../../components/ui/BaseSelect'
import { EXPERIENCE_TYPES, PROVINCES, formatStay } from '../../data/destination-catalog'
import { emptyDestination } from '../../data/destination-sample'
import { DESTINATION_STATUS_LABELS } from '../../lib/destination-completeness'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useDestinations } from '../../state/destination-store'
import type { DestinationStatus } from '../../types/destination'
import { DestinationBuilder } from './DestinationBuilder'
import { formatUpdated } from './forms/shared'

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

export function DestinationsPage() {
  const { destinations, setActiveId, addDestination, duplicateDestination, archiveDestination, removeDestination } = useDestinations()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('')
  const [experience, setExperience] = useState('')
  const [status, setStatus] = useState('')

  const rows = useMemo(() => {
    const term = q.toLowerCase().trim()
    return destinations.filter((d) => {
      if (term && !`${d.name} ${d.province} ${d.district ?? ''}`.toLowerCase().includes(term)) return false
      if (region && d.province !== region) return false
      if (experience && !d.experienceTypes.includes(experience)) return false
      if (status && d.status !== status) return false
      return true
    })
  }, [destinations, q, region, experience, status])

  function openDest(id: string) {
    setActiveId(id)
    setMobileTab('edit')
    setAiOpen(false)
    setOpen(true)
  }

  function closeBuilder() {
    setAiOpen(false)
    setOpen(false)
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Destinations</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Reusable master data for itineraries and costing</p>
          </div>
          <BaseButton
            onClick={() => {
              addDestination(emptyDestination())
              setAiOpen(false)
              setOpen(true)
            }}
          >
            <Plus size={16} /> Add destination
          </BaseButton>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search destinations..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <BaseSelect
            className="mb-0"
            placeholder="All regions"
            value={region}
            options={PROVINCES.map((p) => ({ value: p, label: p }))}
            onChange={(e) => setRegion(e.target.value)}
          />
          <BaseSelect
            className="mb-0"
            placeholder="All experience types"
            value={experience}
            options={EXPERIENCE_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(e) => setExperience(e.target.value)}
          />
          <BaseSelect
            className="mb-0"
            placeholder="All statuses"
            value={status}
            options={(Object.keys(DESTINATION_STATUS_LABELS) as DestinationStatus[]).map((s) => ({
              value: s,
              label: DESTINATION_STATUS_LABELS[s],
            }))}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((d) => (
            <article
              key={d.id}
              className="cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white transition hover:bg-gray-50 dark:border-[#2C2A2A] dark:bg-[#242528] dark:hover:bg-white/5"
              onClick={() => openDest(d.id)}
            >
              <div className="flex gap-3 p-3">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                  {d.coverImage?.url ? (
                    <img src={d.coverImage.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-gray-300">
                      <MapPin size={18} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">{d.name || 'Untitled destination'}</h2>
                      <p className="text-xs text-gray-500">{d.province || 'No region yet'}</p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px]',
                        d.status === 'active'
                          ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                          : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-zinc-200',
                      )}
                    >
                      {DESTINATION_STATUS_LABELS[d.status]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-gray-400">
                    {d.experienceTypes.slice(0, 3).join(' · ') || 'No tags yet'}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {formatStay(d)} · {d.activityIds.length} {d.activityIds.length === 1 ? 'activity' : 'activities'} · {formatUpdated(d.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex border-t border-gray-100 dark:border-[#2C2A2A]">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDest(d.id)
                  }}
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5"
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicateDestination(d.id)
                    setOpen(true)
                  }}
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5"
                  onClick={(e) => {
                    e.stopPropagation()
                    archiveDestination(d.id)
                  }}
                >
                  <Archive size={12} /> {d.status === 'archived' ? 'Restore' : 'Archive'}
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2 text-xs text-red-600 hover:bg-red-50 dark:border-[#2C2A2A] dark:hover:bg-red-950/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    const label = d.name || 'this destination'
                    if (!window.confirm(`Delete "${label}"? This removes it from the destination list.`)) return
                    removeDestination(d.id)
                    setOpen(false)
                    notify('Destination deleted.')
                  }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-400">No destinations match these filters.</p>
        ) : null}
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
              if (e.target === e.currentTarget) closeBuilder()
            }}
          >
            <motion.div
              variants={panel}
              className={cn(
                'fixed top-8 right-5 bottom-0 z-50 flex flex-col overflow-visible bg-transparent transition-[left] duration-300 ease-out',
                aiOpen ? 'left-2 md:left-[360px]' : 'left-2 md:left-[15%]',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {!aiOpen ? (
                <button
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className="absolute bottom-12 left-0 z-[60] hidden -translate-x-full items-center gap-1.5 rounded-l-xl border border-r-0 border-gray-200 bg-white py-2.5 pr-2.5 pl-3 text-xs font-medium text-gray-800 shadow-md transition hover:bg-gray-50 md:inline-flex dark:border-[#2C2A2A] dark:bg-[#242528] dark:text-zinc-100 dark:hover:bg-white/5"
                  aria-label="Ask AI"
                >
                  <Sparkles size={14} />
                  AI
                </button>
              ) : null}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl bg-white shadow-lg dark:bg-[#1E1E20]">
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
                  <DestinationBuilder
                    onClose={closeBuilder}
                    mobileTab={mobileTab}
                    onShowEditor={() => setMobileTab('edit')}
                    aiOpen={aiOpen}
                    onAiOpenChange={setAiOpen}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
