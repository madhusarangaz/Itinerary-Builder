import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { calculatePricing, formatMoney } from '../../lib/costing-calc'
import { COSTING_STATUS_LABELS } from '../../lib/costing-completeness'
import { formatShort } from '../../lib/dates'
import { emptyCosting } from '../../data/costing-sample'
import { useCosting } from '../../state/costing-store'
import { CostingBuilder } from './CostingBuilder'

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

export function CostingsPage() {
  const { costings, setActiveId, addCosting } = useCosting()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(true)
  const [mobileTab, setMobileTab] = useState<'edit' | 'summary'>('edit')
  const fromItinerary = searchParams.get('from') === 'itinerary'

  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId && costings.some((c) => c.id === openId)) {
      setActiveId(openId)
      setOpen(true)
    }
  }, [searchParams, costings, setActiveId])

  function close() {
    setOpen(false)
    if (searchParams.get('open') || searchParams.get('from')) {
      setSearchParams({}, { replace: true })
    }
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Costing</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Internal package costings for your tours</p>
          </div>
          <BaseButton
            onClick={() => {
              addCosting(emptyCosting())
              setOpen(true)
            }}
          >
            <Plus size={16} /> Create costing
          </BaseButton>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {costings.map((c) => {
                const t = calculatePricing(c)
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5"
                    onClick={() => {
                      setActiveId(c.id)
                      setOpen(true)
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-zinc-100">{c.referenceNo || 'Untitled costing'}</div>
                      <div className="text-xs text-gray-400">{c.agentName || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{c.clientName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">
                      {c.arrivalDate ? `${formatShort(c.arrivalDate)} – ${formatShort(c.departureDate)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{formatMoney(t.finalPackageCost, c.currency)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-zinc-200">
                        {COSTING_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
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
              if (e.target === e.currentTarget) close()
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
                <CostingBuilder
                  onClose={close}
                  mobileTab={mobileTab}
                  onShowEditor={() => setMobileTab('edit')}
                  onShowSummary={() => setMobileTab('summary')}
                  fromItinerary={fromItinerary}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
